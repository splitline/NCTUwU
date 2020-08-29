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

const SEMESTER = '1091';

let courseData = {};

window.onload = () => {
    // Generate timetable.

    Object.keys(TIME_MAPPING).forEach(period => {
        const div = document.createElement("div");
        div.textContent = `${period} / ${TIME_MAPPING[period]}`;
        document.querySelector(".time-interval").appendChild(div);
    });

    for (let day = 1; day <= 7; ++day) {
        Object.keys(TIME_MAPPING).forEach(period => {
            const div = document.createElement("div");
            div.id = `${day}${period}`;
            document.querySelector('.content').appendChild(div);
        });
    }

    fetch(`course-data/${SEMESTER}-data.json`)
        .then(r => r.json())
        .then(data => (courseData = data));
}

function search(searchTerm) {
    if (!searchTerm) return [];

    let result = [];
    const courseId = `${SEMESTER}_${searchTerm}`;
    if (courseId in courseData)
        result.push(courseData[courseId]);

    const otherResult = Object.values(courseData)
        .filter(course => (
            (course.id != searchTerm && course.id.match(searchTerm)) ||
            course.teacher.match(searchTerm) ||
            course.name.match(searchTerm)
        ))
        .slice(0, 50);
    result = result.concat(otherResult);
    return result;
}

document.querySelector(".input").oninput = event => {
    document.querySelector(".result").innerHTML = '';
    const searchTerm = event.target.value.trim();
    const result = search(searchTerm);

    result.forEach(course => {
        const template = document.getElementById("courseTemplate");
        template.content.querySelector(".tag").textContent = course.id;
        template.content.getElementById("name").textContent = course.name;
        template.content.getElementById("detail").textContent = `${course.teacher}・${course.credit} 學分`;

        const clone = document.importNode(template.content, true);
        document.querySelector(".result").appendChild(clone);
    });
}