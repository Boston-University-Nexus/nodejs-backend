import json, sys


def parseMajors():
    arr = []

    with open("../result/major_paths.json", "r") as json_file:
        majors = json.load(json_file)

    for idx, i in enumerate(majors):
        arr.append([idx + 1, i])

    with open("../result/majors.json", "w") as json_file:
        json.dump(arr, json_file)


if __name__ == "__main__":
    parseMajors()
