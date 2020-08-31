/**
|--------------------------------------------------
| Constants
|--------------------------------------------------
*/

const TIME_MAPPING = {
    "M": "6:00 ~ 6:50",
    "N": "7:00 ~ 7:50",
    "A": "8:00 ~ 8:50",
    "B": "9:00 ~ 9:50",
    "C": "10:10 ~ 11:00",
    "D": "11:10 ~ 12:00",
    "X": "12:20 ~ 13:10",
    "E": "13:20 ~ 14:10",
    "F": "14:20 ~ 15:10",
    "G": "15:30 ~ 16:20",
    "H": "16:30 ~ 17:20",
    "Y": "17:30 ~ 18:20",
    "I": "18:30 ~ 19:20",
    "J": "19:30 ~ 20:20",
    "K": "20:30 ~ 21:20",
    "L": "21:30 ~ 22:20"
}

const YEAR = '109', SEMESTER = '1';

const APP_URL = `${location.protocol}//${location.host}${location.pathname}`;

let courseData = {};
let selectedCourse = {};
let totalCredits = () => Object.keys(selectedCourse).reduce((accu, id) => +courseData[id].credit + accu, 0);

// Safari sucks.

const supportBigInt = typeof BigInt !== 'undefined';
if (!supportBigInt) BigInt = JSBI.BigInt;

function parseBigInt(value, radix = 36) {
    const add = (a, b) => supportBigInt ? a + b : JSBI.add(a, b);
    const mul = (a, b) => supportBigInt ? a * b : JSBI.multiply(a, b);
    return [...value.toString()]
        .reduce((r, v) => add(
            mul(r, BigInt(radix)),
            BigInt(parseInt(v, radix))
        ), BigInt(0));
}

function loadFromShareLink() {
    const shareKey = new URLSearchParams(location.search).get("share");
    const courseIds = parseBigInt(shareKey).toString().match(/.{1,4}/g);
    return courseIds.reduce((a, b) => (a[b] = true, a), {});
}

function loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem("selectedCourse")) || {};
}

/**
|--------------------------------------------------
| Init UI
|--------------------------------------------------
*/

let share = false;
if (location.search.includes("share=")) {
    share = true;
    document.querySelector(".sidebar").classList.add("is-hidden");
    document.querySelector("#import").classList.remove("is-hidden");
    document.querySelector(".loading").classList.remove("is-hidden");
}

// Generate timetable.
Object.keys(TIME_MAPPING).forEach(period => {
    const div = document.createElement("div");
    div.textContent = `${period} / ${TIME_MAPPING[period]}`;
    document.querySelector(".time-interval").appendChild(div);
});

Object.keys(TIME_MAPPING).forEach(period => {
    for (let day = 1; day <= 7; ++day) {
        const div = document.createElement("div");
        div.id = `${day}${period}`;
        document.querySelector('.content').appendChild(div);
    }
});

// Fetch course data.
fetch(`course-data/${YEAR}${SEMESTER}-data.json`)
    .then(r => r.json())
    .then(data => {
        courseData = data;
        selectedCourse = share ? loadFromShareLink() : loadFromLocalStorage();

        document.querySelector(".input").disabled = false;
        document.querySelector(".input").placeholder = "課號 / 課名 / 老師";
        document.querySelector(".loading").classList.add("is-hidden");
        for (courseId in selectedCourse) {
            const course = courseData[courseId];
            renderPeriodBlock(course);
            appendCourseElement(course);
        }
        document.querySelector(".credits").textContent = `${totalCredits()} 學分`;
    });

function getCourseIdFromElement(element) {
    return element.closest('.course,.period').dataset.id;
}

document.addEventListener("click", function ({ target }) {
    if (target.classList.contains('toggle-course'))
        toggleCourse(getCourseIdFromElement(target));

    if (target.classList.contains('modal-launcher'))
        openModal(getCourseIdFromElement(target));
})

document.addEventListener("mouseover", function (event) {
    if (event.target.matches('.result .course, .result .course *')) {
        const courseId = getCourseIdFromElement(event.target);
        const result = parseTime(courseData[courseId].time);
        result.forEach(period => {
            const block = document.getElementById(period);
            if (block.childElementCount)
                block.firstElementChild.classList.add("has-background-danger", "has-text-white");
            block.classList.add('has-background-info-light')
        })
    }
})

document.addEventListener("mouseout", function (event) {
    if (event.target.matches('.result .course, .result .course *')) {
        document.querySelectorAll('.timetable>.content>[class="has-background-info-light"]')
            .forEach(elem => {
                elem.className = '';
                elem.firstElementChild?.classList.remove("has-background-danger", "has-text-white");
            });
    }
})

function openModal(courseId) {
    const modal = document.querySelector('.modal');
    modal.classList.add('is-active')

    const data = courseData[courseId];
    const fields = modal.querySelectorAll('dd');
    fields[0].textContent = data.id;
    fields[1].textContent = data.credit;
    fields[2].textContent = data.teacher;
    fields[3].textContent = data.time;

    modal.querySelector('.card-header-title').textContent = data.name;
    modal.querySelector('#outline').href = `https://timetable.nctu.edu.tw/?r=main/crsoutline&Acy=${YEAR}&Sem=${SEMESTER}&CrsNo=${courseId}&lang=zh-tw`;
}

function appendCourseElement(course, search = false) {
    const template = document.getElementById("courseTemplate");
    template.content.querySelector(".tag").textContent = course.id;
    template.content.getElementById("name").textContent = course.name;
    template.content.getElementById("detail").textContent = `${course.teacher}・${+course.credit} 學分`;
    template.content.querySelector(".course").dataset.id = course.id;
    template.content.querySelector(".toggle-course").classList.toggle('is-selected', course.id in selectedCourse)

    const clone = document.importNode(template.content, true);
    document.querySelector(search ? ".result" : ".selected").appendChild(clone);
}

function search(searchTerm) {
    if (!searchTerm) return [];

    const regex = RegExp(searchTerm, 'i');
    const result = Object.values(courseData)
        .filter(course => (
            course.id.match(regex) ||
            course.teacher.match(regex) ||
            course.name.match(regex)
        ))
        .slice(0, 50);

    return result;
}

function toggleCourse(courseId) {
    const button = document.querySelector(`.course[data-id="${courseId}"] .toggle-course`);
    if (courseId in selectedCourse) { // Remove course
        delete selectedCourse[courseId];

        document.querySelector(`.selected [data-id="${courseId}"]`).remove();
        document.querySelectorAll(`.period[data-id="${courseId}"]`).forEach(elem => elem.remove());
        button?.classList.remove('is-selected');
    } else { // Select course
        const periods = parseTime(courseData[courseId].time);
        const isConflict = periods.some(period => document.getElementById(period).childElementCount)
        if (isConflict) {
            Toastify({
                text: "和目前課程衝堂了欸",
                backgroundColor: "linear-gradient(147deg, #f71735 0%, #db3445 74%)",
                close: true,
                duration: 3000
            }).showToast();
            return;
        }

        selectedCourse[courseId] = true;
        appendCourseElement(courseData[courseId]);
        renderPeriodBlock(courseData[courseId]);
        button?.classList.add('is-selected');
    }

    localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse));
    document.querySelector(".credits").textContent = `${totalCredits()} 學分`;
}

function parseTime(timeCode) {
    const timeList = timeCode.match(/[1-7][A-Z]+/g);
    const result = timeList.map(
        code => [...code].map(char => `${code[0]}${char}`).slice(1)
    ).flat();

    return result;
}

function renderPeriodBlock(course) {
    const periods = parseTime(course.time);
    periods.forEach(period => document.getElementById(period).innerHTML = `
    <div data-id="${course.id}" class="period modal-launcher">
        <span>${course.name}</span>
    </div>`);
}

document.querySelector(".input").oninput = event => {
    document.querySelector(".result").innerHTML = '';
    const searchTerm = event.target.value.trim();
    if (searchTerm.includes("'"))
        document.querySelector(".result").textContent = "1064 - You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ''' at line 1.";

    const result = search(searchTerm);

    result.forEach(course => appendCourseElement(course, true));
}

document.getElementById("import").onclick = () => {
    if (confirm("接下來將會覆蓋你的目前課表ㄛ，確定嗎？")) {
        localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse));
        Toastify({
            text: "匯入完成！點此前往選課模擬",
            destination: APP_URL,
            close: true,
            duration: 3000
        }).showToast();
    }
}

document.getElementById("copy-link").onclick = () => {
    const shareKey = BigInt(Object.keys(selectedCourse).join('')).toString(36);

    const link = `${APP_URL}?share=${shareKey}`;
    const copy = document.createElement("div");
    copy.textContent = link;
    document.body.appendChild(copy);

    const textRange = document.createRange();
    textRange.selectNode(copy);
    const selet = window.getSelection();
    selet.removeAllRanges();
    selet.addRange(textRange);

    try {
        document.execCommand('copy');

        Toastify({
            text: "複製好了！點此可直接前往",
            destination: link,
            newWindow: true,
            close: true,
            duration: 3000
        }).showToast();
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(copy);
}

document.querySelector('.modal-background').onclick =
    document.querySelector('.card-header-icon').onclick =
    () => document.querySelector('.modal').classList.remove('is-active');