import json
import requests

YEAR = 109
SEMESTER = 1
ACYSEM = f"{YEAR}{SEMESTER}"

types = {
    "870A5373-5B3A-415A-AF8F-BB01B733444F": "學士班課程",
    "D8E6F0E8-126D-4C2F-A0AC-F9A96A5F6D5D": "研究所課程",
    "E1263D9C-3210-4270-A3FA-FE9A4D283A69": "學士班共同課程",
    "94EAAC09-C3BC-4BEB-BB9B-47E6F5F652C8": "其他課程",
    "F01A903B-5DCB-4D88-A24D-EEADA61295AE": "學分學程",
    "166F5FE8-E532-4D97-9DA7-A28D34D9D88A": "跨領域學程",
    "FA43258F-8B63-4BA5-BC81-F761371BFD03": "教育學程"
}


def merge_dicts(dict1, dict2):
    if not isinstance(dict1, dict) or not isinstance(dict2, dict):
        return dict2
    for k in dict2:
        if k in dict1:
            dict1[k] = merge_dicts(dict1[k], dict2[k])
        else:
            dict1[k] = dict2[k]
    return dict1


def fetch(function, type, data={}):
    txt = requests.post(f"https://timetable.nctu.edu.tw/?r=main/get_{function}", data={
        "ftype": type,
        "flang": "zh-tw",
        "acysem": ACYSEM,
        "acysemend": ACYSEM,
        **data
    }, headers={'user-agent': 'Mozilla/5.0'}).text
    return json.loads(txt)


if __name__ == "__main__":
    category_map = {}
    uuid_map = {}
    index = 0
    for type, type_name in types.items():
        print(type, type_name)

        category_map[type_name] = {}
        category = fetch("category", type)
        if type == "FA43258F-8B63-4BA5-BC81-F761371BFD03":  # 教育學程
            category_map[type_name] = index
            uuid_map[[*category.items()][0][0]] = index
            index += 1
            continue
        for cat_id, cat_name in category.items():
            if type == "94EAAC09-C3BC-4BEB-BB9B-47E6F5F652C8":  # 其他課程
                for id, name in category.items():
                    category_map[type_name][name] = index
                    uuid_map[id] = index
                    index += 1
                break

            if cat_name != None:
                category_map[type_name][cat_name] = {}

            # 學士班課程、研究所課程
            if type in ["870A5373-5B3A-415A-AF8F-BB01B733444F", "D8E6F0E8-126D-4C2F-A0AC-F9A96A5F6D5D"]:
                college = fetch("college", type, {"fcategory": cat_id})
                for college_code, college_name in college.items():
                    category_map[type_name][cat_name][college_name] = {}
                    dep = fetch("dep", type, {"fcategory": cat_id, "fcollege": college_code})
                    for dep_id, dep_name in dep.items():
                        category_map[type_name][cat_name][college_name][dep_name] = index
                        uuid_map[dep_id] = index
                        index += 1

            else:
                college = {"*": "*"}
                for college_code, college_name in college.items():
                    dep = fetch("dep", type, {
                        "fcategory": cat_id,
                        "fcollege": college_code
                    })
                    if dep == []:
                        continue
                    for dep_id, dep_name in dep.items():
                        if cat_name == None:
                            category_map[type_name][dep_name] = index
                        else:
                            category_map[type_name][cat_name][dep_name] = index

                        uuid_map[dep_id] = index
                        index += 1

    category_map["學士班課程"] = category_map["學士班課程"]["一般學士班"]

    # merge all kind of master program
    all_graduate = {}
    tmp_dict = {}
    for grad in category_map["研究所課程"]:
        all_graduate = merge_dicts(all_graduate, category_map["研究所課程"][grad])

    category_map["研究所課程"] = all_graduate

    with open("../course-data/department.json", 'w') as f:
        json.dump(category_map, f, separators=(',', ":"), ensure_ascii=False)

    with open("department_index.json", 'w') as f:
        json.dump(uuid_map, f, separators=(',', ":"), ensure_ascii=False)
