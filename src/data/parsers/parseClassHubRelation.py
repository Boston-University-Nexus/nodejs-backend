import json, sys, csv, time

classesDict = []

# Open the already parsed data of all Bu hub areas as dictionary
existingHubs = open("../resultJson/buhub.json")
hubs = json.load(existingHubs)

# Open the already parsed data of all classes as dictionary
existingClasses = open("../resultJson/classes.json")
eC = json.load(existingClasses)

courseDescriptions = open("../resultJson/course_descriptions.json")
scrapedData = json.load(courseDescriptions)

classRows = []
with open("../resultJson/finalCsv.csv") as finalCsv:
    classesread = csv.reader(finalCsv, delimiter=",")

    for row in classesread:
        classRows.append(row)

for course in classRows:
    courseName = course[0] + " " + course[1] + " " + course[2]
    if courseName in scrapedData:
        for hub in scrapedData[courseName]["hubs"]:
            # Default value to search for errors
            courseId = -1
            hubId = -1

            # for class in existingClasses
            for c in eC:
                if c[2] == courseName.replace(" ", ""):
                    # Get the class private key if class matches with DDD CC NNN
                    courseId = c[0]

            # for hub in all the hub areas
            for h in hubs:
                # Get the pk accounting for the weird area that can be either X or Y
                if (
                    hub in "Scientific Inquiry II or Social Inquiry II"
                    and "II" in hub
                    and h[1] == "Scientific Inquiry II or Social Inquiry II"
                ):
                    hubId = h[0]
                    break
                elif hub.replace("'", "") == h[1]:
                    hubId = h[0]
                    break

            if courseId != -1 and hubId != -1:

                # include the name of the model since Django requires it
                arr = [
                    courseId,
                    hubId,
                ]
                classesDict.append(arr)

with open("../resultJson/classHubRelation.json", "w") as json_file:
    json.dump(classesDict, json_file)
