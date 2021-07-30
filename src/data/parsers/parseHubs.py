import json, sys

# We trust Nic and Vineet got these right
hubs = [
    "Philosophical Inquiry and Life’s Meanings",
    "Aesthetic Exploration",
    "Historical Consciousness",
    "Scientific Inquiry I",
    "Social Inquiry I",
    "Scientific Inquiry II or Social Inquiry II",
    "Quantitative Reasoning I",
    "Quantitative Reasoning II",
    "The Individual in Community",
    "Global Citizenship and Intercultural Literacy",
    "Global Citizenship and Intercultural Literacy",
    "Ethical Reasoning",
    "First-Year Writing Seminar",
    "Writing, Research, and Inquiry",
    "Writing-Intensive Course",
    "Writing-Intensive Course",
    "Oral and/or Signed Communication",
    "Digital/Multimedia Expression",
    "Critical Thinking",
    "Critical Thinking",
    "Research and Information Literacy",
    "Research and Information Literacy",
    "Teamwork/Collaboration",
    "Teamwork/Collaboration",
    "Creativity/Innovation",
    "Creativity/Innovation",
]

hubsCredits = []
unique = set(hubs)

# Create a uniqe 2d array with [name of hub area, credits needed]
for idx, hub in enumerate(unique):
    hubsCredits.append([idx+1, hub, hubs.count(hub)])

with open("../resultJson/buhub.json", "w") as json_file:
    json.dump(hubsCredits, json_file)
