// WHERE WE DEFINE THE STRUCTURE OF OUR TABLES
const structure = [
  [
    "buhubs",
    {
      buhub_ID: "INT NOT NULL AUTO_INCREMENT",
      buhub_name: "VARCHAR(255) NOT NULL",
      buhub_creditsNeeded: "TINYINT NOT NULL",
    },
    "PRIMARY KEY (buhub_ID)",
  ],
  [
    "professors",
    {
      professor_ID: "INT NOT NULL AUTO_INCREMENT",
      professor_name: "VARCHAR(255) NOT NULL",
      professor_numberOfRatings: "INT DEFAULT 0",
      professor_rating: "DECIMAL(3,2) DEFAULT 0",
    },
    "PRIMARY KEY (professor_ID)",
  ],
  [
    "courses",
    {
      course_ID: "INT NOT NULL AUTO_INCREMENT",
      course_title: "VARCHAR(255) NOT NULL",
      course_code: "VARCHAR(8) NOT NULL",
      course_college: "VARCHAR(3) NOT NULL",
      course_department: "VARCHAR(2) NOT NULL",
      course_number: "VARCHAR(3) NOT NULL",
      course_semester: "VARCHAR(20)",
      course_prereqs: "VARCHAR(255)",
      course_coreqs: "VARCHAR(255)",
      course_description: "TEXT(1023)",
      course_credits: "TINYINT DEFAULT 4",
      course_numOfQualityRatings: "INT DEFAULT 0",
      course_qualityRating: "DECIMAL(3,2) DEFAULT 0",
      course_numOfDifficultyRatings: "INT DEFAULT 0",
      course_difficultyRating: "DECIMAL(3,2) DEFAULT 0",
    },
    "PRIMARY KEY (course_ID)",
  ],
  [
    "sections",
    {
      section_ID: "INT NOT NULL AUTO_INCREMENT",
      professor_ID: "INT NOT NULL",
      course_ID: "INT NOT NULL",
      section_code: "VARCHAR(255) NOT NULL",
      section_start: "VARCHAR(5)",
      section_end: "VARCHAR(5)",
      section_days: "VARCHAR(255)",
      section_type: "VARCHAR(25)",
      section_building: "VARCHAR(20)",
      section_room: "VARCHAR(20)",
      section_numOfProfessorRatings: "INT DEFAULT 0",
      section_professorRating: "DECIMAL(3,2) DEFAULT 0",
      section_numOfWorkloadRatings: "INT DEFAULT 0",
      section_workloadRating: "DECIMAL(3,2) DEFAULT 0",
    },
    "PRIMARY KEY (section_ID), CONSTRAINT FK_sections_professor_ID FOREIGN KEY (professor_ID) REFERENCES professors(professor_ID), CONSTRAINT FK_sections_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID)",
  ],
  [
    "majors",
    {
      major_ID: "INT NOT NULL AUTO_INCREMENT",
      major_name: "VARCHAR(255) NOT NULL",
    },
    "PRIMARY KEY (major_ID)",
  ],
  [
    "users",
    {
      user_ID: "INT NOT NULL AUTO_INCREMENT",
      major_ID: "INT",
      user_name: "VARCHAR(255) NOT NULL",
      user_password: "VARCHAR(255) NOT NULL",
      user_year: "VARCHAR(4) NOT NULL",
      user_taken: "TEXT(1023)",
    },
    "CONSTRAINT major_ID FOREIGN KEY (major_ID) REFERENCES majors(major_ID), PRIMARY KEY (user_ID)",
  ],
  [
    "coursesVShubs",
    {
      courseVShub_ID: "INT NOT NULL AUTO_INCREMENT",
      course_ID: "INT NOT NULL",
      buhub_ID: "INT NOT NULL",
    },
    "CONSTRAINT FK_coursesVShubs_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID), CONSTRAINT FK_coursesVShubs_buhub_ID FOREIGN KEY (buhub_ID) REFERENCES buhubs(buhub_ID), PRIMARY KEY (courseVShub_ID)",
  ],
  [
    "ratings",
    {
      rating_ID: "INT NOT NULL AUTO_INCREMENT",
      course_ID: "INT NOT NULL",
      professor_ID: "INT NOT NULL",
      user_ID: "INT NOT NULL",
      rating_qualityRating: "DECIMAL(3,2) DEFAULT 1",
      rating_difficultyRating: "DECIMAL(3,2) DEFAULT 1",
      rating_professorRating: "DECIMAL(3,2) DEFAULT 1",
      rating_workloadRating: "DECIMAL(3,2) DEFAULT 1",
    },
    "CONSTRAINT FK_ratings_course_ID FOREIGN KEY (course_ID) REFERENCES courses(course_ID), CONSTRAINT FK_ratings_professor_ID FOREIGN KEY (professor_ID) REFERENCES professors(professor_ID), CONSTRAINT FK_ratings_user_ID FOREIGN KEY (user_ID) REFERENCES users(user_ID), PRIMARY KEY (rating_ID)",
  ],
  [
    "schedules",
    {
      schedule_ID: "INT NOT NULL AUTO_INCREMENT",
      user_ID: "INT NOT NULL",
      schedule_sections: "NVARCHAR(4000) NOT NULL",
    },
    "CONSTRAINT FK_schedules_user_ID FOREIGN KEY (user_ID) REFERENCES users(user_ID), PRIMARY KEY (schedule_ID)",
  ],
];

module.exports = structure;
