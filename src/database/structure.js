const structure = [
  [
    "buhubs",
    "buhub_ID int NOT NULL AUTO_INCREMENT,buhub_name VARCHAR(255), buhub_creditsNeeded TINYINT, PRIMARY KEY (buhub_ID)",
  ],
  [
    "professors",
    "professor_ID int NOT NULL AUTO_INCREMENT, professor_name VARCHAR(255), professor_numberOfRatings INT, professor_rating FLOAT, PRIMARY KEY (professor_ID)",
  ],
  [
    "courses",
    "course_ID int NOT NULL AUTO_INCREMENT, course_title VARCHAR(255), course_code VARCHAR(8), course_college VARCHAR(3), course_department VARCHAR(2), course_number VARCHAR(3), course_semester VARCHAR(20), course_prereqs VARCHAR(255), course_coreqs VARCHAR(255), course_description TEXT(1023), course_credits TINYINT, course_numOfQualityRatings INT, course_qualityRating INT, course_numOfDifficultyRatings INT, course_difficultyRating INT, PRIMARY KEY (course_ID)",
  ],
  [
    "sections",
    "section_ID int NOT NULL AUTO_INCREMENT, section_code VARCHAR(255), professor_ID int, CONSTRAINT FK_sections_professor_ID FOREIGN KEY (professor_ID) REFERENCES professors(professor_ID), section_start VARCHAR(5), section_end VARCHAR(5), section_days VARCHAR(255), course_ID int, CONSTRAINT FK_sections_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID), section_type VARCHAR(25), section_building VARCHAR(20), section_room VARCHAR(20),  section_numOfProfessorRatings INT, section_professorRating INT, section_numOfWorkloadRatings INT, section_workloadRating INT, PRIMARY KEY (section_ID)",
  ],
  [
    "majors",
    "major_ID int NOT NULL AUTO_INCREMENT, major_name VARCHAR(255), PRIMARY KEY (major_ID)",
  ],
  [
    "users",
    "user_ID int NOT NULL AUTO_INCREMENT, user_name VARCHAR(255), user_password VARCHAR(255), user_year VARCHAR(4), major_ID int, CONSTRAINT major_ID FOREIGN KEY (major_ID) REFERENCES majors(major_ID), PRIMARY KEY (user_ID)",
  ],
  [
    "coursesVShubs",
    "courseVShub_ID int NOT NULL AUTO_INCREMENT, course_ID int, CONSTRAINT FK_coursesVShubs_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID), buhub_ID int, CONSTRAINT FK_coursesVShubs_buhub_ID FOREIGN KEY (buhub_ID) REFERENCES buhubs(buhub_ID), PRIMARY KEY (courseVShub_ID)",
  ],
  [
    "ratings",
    "rating_ID int NOT NULL AUTO_INCREMENT, course_ID int, CONSTRAINT FK_ratings_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID), user_ID int, CONSTRAINT FK_ratings_user_ID FOREIGN KEY (user_ID) REFERENCES users(user_ID), rating_qualityRating INT, rating_difficultyRating INT, rating_professorRating INT, rating_workloadRating INT, PRIMARY KEY (rating_ID)",
  ],
];

module.exports = structure;
