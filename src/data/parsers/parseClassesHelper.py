# PREREQ PARSER LIMITATIONS: 
#       parser only recognizes prereqs that have course codes in them (e.g. no "consent of instructor")
#       parser will produce "reccomended" prereqs as required 
#           - luckily these will usually be appended with an 'or' so it shouldn't have a preventative effect on logical output
#       parser will often produce prereqs without a college (e.g. YYZZZ instead of XXXYYZZZ)
#       output string will not have parenthesis (ambiguous order of logical operations)
#       line 1780 ----- algorithm doesn't recognize that these courses are not prereqs

import re

# helper for add_missing_depts
# takes in index, from array, to array
# finds index of equivalent object in array 2
def get_equiv_index(i, arr_1, arr_2):
    return arr_2.index(arr_1[i])

# helper for add_missing_depts
def get_obj_from_start_pos(start_pos, pos_arr, obj_arr):
    return obj_arr[pos_arr.index(start_pos)]

# takes in **STRIPPED AND STANDARDIZED** str
# determines if there are courses missing departments (e.g. "SAR PT 561 and 562")
# and returns copy of string where
# the correct department is insterted into the correct position
def add_missing_depts(string):
    # determine what the parseReqs algorithm will see (courses_found) and 
    # how many courses are actually being referenced (course_codes_found)
    courses_found = [match for match in re.finditer('[A-Z][A-Z][0-9][0-9][0-9]', string)]
    course_codes_found = [match for match in re.finditer('[0-9][0-9][0-9]', string)]

    # compare the two and determine if any changes are required
    if len(course_codes_found) == len(courses_found):
        return string

    # create list of integers representing start locations of matching *CODES* for both lists
    courses_found_positions = []
    for match in courses_found:
        position = match.start()
        courses_found_positions.append(position + 2) 
    course_codes_found_positions = [match.start() for match in course_codes_found]

    # create diff list
    strays = [pos for pos in course_codes_found_positions if pos not in courses_found_positions]
    
    # adds dept codes to correct strays
    for i in range(len(course_codes_found_positions) - 1, 0, -1):
        if course_codes_found_positions[i] not in strays:
            continue
        # determine corresponding dept code position for THIS stray
        dept_pos = courses_found_positions[0]
        for j in range(i - 1, 0, -1):
            if course_codes_found_positions[j] not in strays:
                dept_pos = course_codes_found_positions[j]
                break
        
        # get dept code str from index
        dept_code = get_obj_from_start_pos(dept_pos, courses_found_positions, courses_found).group()[:2]

        # determine index at which to insert dept code
        insert = strays[get_equiv_index(i, course_codes_found_positions, strays)]
        # perform insertion
        string = string[:insert] + dept_code + string[insert:]

    return string

# takes in array of strs and replaces commas with correct conjunction (and, or)
def replace_commas(arr):
    conj = '&'
    # set correct conjunction
    for i in range(len(arr) - 1, -1, -1):
        for j in range(len(arr[i]) - 1, -1, -1):
            if '|' in arr[i][j]:
                conj = '|'
                break
            elif '&' in arr[i][j]:
                conj = '&'
                break
        else:
            continue
        break

    # replace commas with correct conjunction (working backwards)
    for i in range(len(arr) - 1, -1, -1):
        arr[i] = arr[i].replace(',', conj)

# takes in str
# changes 'and' --> '&' |||| 'or', ';', '/' --> '|'
# removes spaces, parenthesis, and other troublemaking characters and substrings
# NOTE --- output will be capitalized
def strip_and_standardize(string):
    # do simple replacements
    out = (
        string.upper()
        .replace('(', '')
        .replace(')', '')
        .replace(' ', '')
        .replace('NONE', '')
        .replace('.,', '')
        .replace('.', '')
        .replace('AND', '&')
        .replace(';&', '&')
        .replace(',&', '&')
        .replace('OR', '|')
        .replace('/', '|')
        .replace(';|', '|')
        .replace(';', '|')
        .replace(',|', '|')
    )
    
    # check for existence of "cannot be taken for credit with..."
    # and remove the substring and anything after it
    # (courses listed after this phrase would be parsed as prereqs when they should be discarded)
    try:
        cutoff = out.index('CANNOTBETAKENF|CREDITWITH')
        out = out[:cutoff]
    except:
        pass

    return out

# MAIN FUNCTION for prereq parsing (see limitations at top of module)
# takes in a row (str list) and returns a string containing only requisites
# format: XXXYYZZZ or YYZZZ
def parse_prereqs(row):
    # strip down raw strings and standardize conjunctions (and, or)
    out = strip_and_standardize(row[4])
    to_parse = strip_and_standardize(row[5])

    # sometimes they list course codes with implicit departments (e.g. SAR PT 561 and 562)
    # wrote a method below to combat this, and add departments to stray codes
    # so that the regex can recognize them and they can be parsed into partial course names 
    to_parse = add_missing_depts(to_parse)

    # create LIST of relevant strings from cell 5 (which contains both course notes and prereqs for some reason)
    split_str = re.split('([A-Z][A-Z][0-9][0-9][0-9])', to_parse)
    # remove everything after the last match to avoid false positives
    if len(re.findall('[0-9][0-9][0-9]', split_str[-1])) == 0:
        split_str = split_str[:len(split_str) - 1]

    # replace commas in list with correct conjunction
    replace_commas(split_str)

    # create list containing ONLY partial requisites and conjunctions (trim the fat)
    req_strs = []
    for string in split_str:
        if len(string) <= 5 and len(string) > 0:
            req_strs.append(string)
        elif len(req_strs) != 0:
            if '|' in string:
                req_strs.append('|')
            if '&' in string: 
                req_strs.append('&')
    

    # add a '|' symbol to the beginning if required
    if (
    len(req_strs) > 0 and       #cell 5 has prereqs
    len(out) > 0 and            #cell 4 wasn't empty
    req_strs[0][0] != '|'):     #doesn't already have a conjunction
        out += '|'

    # concatenate str list into single str
    for string in req_strs:
        out += string

    # validate that the string meets minimum length requirements
    if len(out) < 5:
        return ''

    return out