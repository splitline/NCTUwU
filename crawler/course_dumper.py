import json
import requests
import re

FETCH = True

YEAR = 109
SEMESTER = 1

if FETCH:
    data = requests.post("https://timetable.nctu.edu.tw/?r=main/get_cos_list",
                         data={
                             "m_acy": YEAR,
                             "m_sem": SEMESTER,
                             "m_acyend": YEAR,
                             "m_semend": SEMESTER,
                             "m_dep_uid": "**",
                             "m_group": "**",
                             "m_grade": "**",
                             "m_class": "**",
                             "m_option": "**",
                             "m_crsname": "**",
                             "m_teaname": "**",
                             "m_cos_id": "**",
                             "m_cos_code": "**",
                             "m_crstime": "**",
                             "m_crsoutline": "**",
                             "m_costype": "**"
                         },
                         headers={'user-agent': 'Mozilla/5.0'}).json()

    json.dump(data, open("origin.json", 'w'))

uuid_map = json.load(open("department_index.json"))
data = json.load(open("origin.json"))

course_data = {}
# missing_dep = []
types = {'選修': 0, '必修': 1, '通識': 2, '體育': 3, '軍訓': 4, '外語': 5}


def parse_time(time_code):
    time_list = re.findall("[1-7][A-Z]+", time_code)
    result = []
    for code in time_list:
        for char in code[1:]:
            result.append(f"{code[0]}{char}")
   
    return result


for uuid in data:
    language = data[uuid]["language"]
    brief = data[uuid]["brief"]
    for block in data[uuid]:
        if not block.isdigit():
            continue
        for course_id in data[uuid][block]:
            course = data[uuid][block][course_id]

            if uuid not in uuid_map and course["cos_id"] in course_data:
                continue

            dep_id = uuid_map.get(uuid, None)
            if course["cos_id"] in course_data and \
                    dep_id != None and \
                    dep_id not in course_data[course["cos_id"]]['dep']:
                course_data[course["cos_id"]]['dep'].append(dep_id)
            else:
                brief_code = list(brief[course_id].keys())[0]
                classroom = course["cos_time"].split("-")[1] if course["cos_time"].strip() != "" else ""
                course_data[course["cos_id"]] = {
                    "id": course["cos_id"],
                    "name": course["cos_cname"],
                    "time": parse_time(course["cos_time"]),
                    "classroom": classroom,
                    "credit": course["cos_credit"],
                    "teacher": course["teacher"],
                    "dep": [] if dep_id == None else [dep_id],
                    "type": types[course["cos_type"]],
                    "english": language[course_id]["授課語言代碼"] == "en-us",
                    "brief_code": [] if brief_code == "" else brief_code.split(",")
                }


with open(f"../course-data/{YEAR}{SEMESTER}-data.json", "w") as f:
    json.dump(course_data, f, separators=(',', ':'))
