const { Router } = require("express");
const { queryDB } = require("../database/db");

const router = Router();

// Helper function to calculate new average given 1 or 2 ratings
const updateRatings = (data) => {
  if (data.length == 4) {
    num = data[0];
    prev = data[1];
    new_val = data[2];
    course = data[3];
    newNum = num + 1;
    newRating = (new_val + prev * num) / (num + 1);

    return [newNum, newRating, course];
  } else if (data.length == 7) {
    num = data[0];
    num2 = data[3];

    prev = data[1];
    prev2 = data[4];

    new_val = data[2];
    new_val2 = data[5];

    course = data[6];

    newNum = num + 1;
    newRating = (new_val + prev * num) / (num + 1);

    newNum2 = num2 + 1;
    newRating2 = (new_val2 + prev2 * num2) / (num2 + 1);

    return [newNum, newRating, newNum2, newRating2, course];
  }
};

// Return error if data is bad
const invalidData = (res) => {
  res.status(400).json({
    error:
      "There was an error with the data provided. Please try with the correct course, professor, and ratings (1-5)",
  });
};

// Make sure ratings are between 1 and 5
const checkRating = (rating) => {
  return rating > 0 && rating <= 5;
};

router.post("/", async (req, res) => {
  const {
    professorRating,
    workloadRating,
    qualityRating,
    difficultyRating,
    professor,
    course,
  } = req.body;

  // Save new rating
  let params = [
    course,
    1,
    professor,
    qualityRating,
    difficultyRating,
    professorRating,
    workloadRating,
  ];

  if (
    !checkRating(qualityRating) ||
    !checkRating(workloadRating) ||
    !checkRating(difficultyRating) ||
    !checkRating(professorRating)
  ) {
    invalidData(res);
    return;
  }

  let result = await queryDB(
    "INSERT INTO ratings (course_ID,user_ID,professor_ID,rating_qualityRating,rating_difficultyRating,rating_professorRating,rating_workloadRating) VALUES (?)",
    [params]
  );

  if (!result) {
    invalidData(res);
    return;
  }

  // Update course ratings (quality, difficulty)
  let prev = (
    await queryDB("SELECT * FROM courses WHERE course_ID = ?", course)
  )[0];

  let data = updateRatings([
    prev.course_numOfQualityRatings,
    prev.course_qualityRating,
    qualityRating,
    prev.course_numOfDifficultyRatings,
    prev.course_difficultyRating,
    difficultyRating,
    course,
  ]);

  await queryDB(
    "UPDATE courses SET course_numOfQualityRatings = ?, course_qualityRating = ?, course_numOfDifficultyRatings = ?, course_difficultyRating = ? WHERE course_ID = ?",
    data
  );

  // Update section ratings (professor, workload)
  prev = (
    await queryDB("SELECT * FROM sections WHERE course_ID = ?", course)
  )[0];

  data = updateRatings([
    prev.section_numOfProfessorRatings,
    prev.section_professorRating,
    professorRating,
    prev.section_numOfWorkloadRatings,
    prev.section_workloadRating,
    workloadRating,
    course,
  ]);

  await queryDB(
    "UPDATE sections SET section_numOfProfessorRatings = ?, section_professorRating = ?, section_numOfWorkloadRatings = ?, section_workloadRating = ? WHERE course_ID = ?",
    data
  );

  // Update professors ratings (rating)
  prev = (
    await queryDB("SELECT * FROM professors WHERE professor_ID = ?", professor)
  )[0];

  data = updateRatings([
    prev.professor_numberOfRatings,
    prev.professor_rating,
    professorRating,
    professor,
  ]);

  await queryDB(
    "UPDATE professors SET professor_numberOfRatings = ?, professor_rating = ? WHERE professor_ID = ?",
    data
  );

  res.status(201).send();
});

module.exports = router;
