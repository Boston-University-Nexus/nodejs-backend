from parseClasses import parseClasses
from parseHubs import parseHubs
from parseSections import parseSections
from parseProfessors import parseProfessors
from parseClassHubRelation import parseClassHubRelation
from parseMajors import parseMajors

if __name__ == "__main__":
    parseHubs()
    parseProfessors()
    parseClasses()
    parseSections()
    parseMajors()
    parseClassHubRelation()
