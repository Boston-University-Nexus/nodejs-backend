# API Routes

## Querying the DB

For filtering we have a function called `queryDB`. This function takes as parameters the SQL query, and the additional dynamic parameters we want to inject after escaping. Because of security risks, we should never create a query like:

```js
let query = "SELECT * FROM courses WHERE course_name=" + course_name;
```

Instead, we should create our query like so:

```js
let query = "SELECT * FROM courses WHERE course_name=?";
```

and call the `queryDB` function by doing:

```js
let result = await queryDB(query, course_name);
```

## Filtering

For filtering we have a function called `applyQueryAsFilters`. This function allows us to take a series of url queries (EX: `course_code=CASCS111&professor_name_contains=PAPADAKIS`), a series of allowed queries (for security), and an optional parameter called _addOns_ that allows us to add a prefix to the compared field for whenever we are using relationship tables (EX: `course.course_prereqs=CASCS111 AND section.section_days=MON,TUE`).

Then, when we have our extra query for filtering, and its parameters, we can called the `queryDB` function mentioned above.

## API Endpoints

### Courses

- /courses - All courses (will probably be disabled for loading time)
- /courses?\<FILTERS\> - Filtered courses

### Sections

- /sections - All sections (will probably be disabled for loading time)
- /sections?\<FILTERS\> - Filtered sections

### Hubs

- /hubs - All BU hub areas
- /hubs?\<FILTERS\> - Filtered hub vs course relations

### Calendars

- /calendars - Returns a fake group of schedules (will later on return the real one)

### Professors

- /professors - All professors (will probably be disabled for loading time)
- /professors?\<FILTERS\> - Filtered professors

### Ratings

- /ratings - **POST** - takes the following data and saves the ratings:

```js
let data = {
  professorRating: int,
  workloadRating: int,
  qualityRating: int,
  difficultyRating: int,
  professor: int,
  course: int,
};
```
