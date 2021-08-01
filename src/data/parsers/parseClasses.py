import json, csv, sys
from parseClassesHelper import parse_prereqs


def parseClasses():
    # Open the scraped data from Nic and Vineet as dictionary
    courseDescriptions = open("../result/course_descriptions.json")
    scrapedData = json.load(courseDescriptions)

    professors = open("../result/professors.json")
    professorsData = json.load(professors)

    scheduleRows = []
    descrRows = []
    with open("../result/schedule.csv") as scheduleFile:
        scheduleread = csv.reader(scheduleFile, delimiter=",")

        for row in scheduleread:
            scheduleRows.append(row)

    with open("../result/finalCsv.csv") as descrFile:
        descrRead = csv.reader(descrFile, delimiter=",")

        for row in descrRead:
            descrRows.append(row)

    saveArr = []

    count = 1
    for idx, line in enumerate(descrRows):
        print(str(idx) + "/" + str(len(descrRows) - 1))
        if len(line[0]) > 0:
            className = line[0] + " " + line[1] + " " + line[2]
            title = line[3]
            college = line[0]
            department = line[1]
            number = line[2]
            prereqs = parse_prereqs(line)
            coreqs = line[6]
            gradPrereqs = line[8]
            gradCoreqs = line[10]
            description = line[12].replace("*", "").split("Effective")[0]
            credits = 0

            fallSemester = False

            if len(line[14]) > 0 and isinstance(line[14], int):
                credits = line[14]
            else:
                credits = 0

            for l in scheduleRows:
                newName = l[0][:6] + " " + l[0][-6:-3]
                if newName == className:
                    fallSemester = True

            fallSemester = True  # ??

            if fallSemester == True:
                arr = [
                    count,
                    title,
                    college + department + number,
                    college,
                    department,
                    number,
                    "Fall",
                    prereqs,
                    coreqs,
                    description,
                    credits,
                ]
                count += 1
                saveArr.append(arr)

    with open("../result/classes.json", "w") as json_file:
        json.dump(saveArr, json_file)


if __name__ == "__main__":
    parseClasses()
