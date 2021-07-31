import json, csv, sys


def parseSections():
    # Open the scraped data from Nic and Vineet as dictionary
    courseDescriptions = open("../result/course_descriptions.json")
    data = json.load(courseDescriptions)

    classesDict = []

    # Open all existing classes as dictionary
    existingClasses = open("../result/classes.json")
    eC = json.load(existingClasses)

    # Open all existing professors as dictionary
    existingProfs = open("../result/professors.json")
    professorList = json.load(existingProfs)

    scheduleRows = []
    count = 1

    with open("../result/schedule.csv") as scheduleFile:
        scheduleread = csv.reader(scheduleFile, delimiter=",")

        for x in scheduleread:
            scheduleRows.append(x)

    for idx, row in enumerate(scheduleRows):
        print(str(idx) + "/" + str(len(scheduleRows) - 1))
        if len(row[0]) == 12:
            courseName = row[0][:6] + " " + row[0][-6:-3]

            for item in eC:
                if item[2] == courseName.replace(" ", ""):
                    pk = item[0]

            try:
                for section in data[courseName]["sections"]:
                    if section["title"] == row[0][-2:]:
                        # Get correct prof pk
                        for prof in professorList:
                            if prof[1] == section["prof"]:
                                profpk = prof[0]
                                break

                time = [row[10], row[11]]

                for i in range(len(time)):
                    if len(time[i]) < 1:
                        time[i] = "00:00"
                    else:
                        hour = int(time[i].split(":")[0])

                        if len(time[i]) < 8:
                            time[i] = "0" + time[i]

                        if "PM" in time[i] and hour < 12:
                            time[i] = str(hour + 12) + time[i][2:]
                        elif "AM" in time[i] and hour == 12:
                            time[i] = str(hour + 12) + time[i][2:]

                        time[i] = time[i][:-3]

                # Django requires model in json
                arr = [
                    count,
                    row[0][-2:],
                    profpk,
                    time[0],
                    time[1],
                    row[9],
                    pk,
                    row[4],
                    row[7],
                    row[8],
                ]
                count += 1
                classesDict.append(arr)
            except Exception as e:
                pass

    with open("../result/sections.json", "w") as json_file:
        json.dump(classesDict, json_file)
