# scheduleCsv = open('../resultJson/schedule.csv')
# schedule = scheduleCsv.readlines()

import json, sys

# Open the scraped data from Nic and Vineet as dictionary
courseDescriptions = open("../resultJson/course_descriptions.json")
data = json.load(courseDescriptions)


professors = set()

finalJson = []

for course in data:
    for section in data[course]["sections"]:
        professors.add(section["prof"])

for idx, prof in enumerate(professors):
    arr = [idx + 1, prof, 0, 0]
    finalJson.append(arr)

with open("../resultJson/professors.json", "w") as json_file:
    json.dump(finalJson, json_file)
