import os, csv, json

rows = []

for filename in os.listdir('../CSVJoin'):
    with open("../CSVJoin/" + filename) as file:
        file = csv.reader(file,delimiter=",")
        
        for line in file:
            if len(line[0]) == 3:
                rows.append(line)
            
with open('../resultJson/finalCsv.csv', 'w') as f:
    write = csv.writer(f)
    write.writerows(rows)