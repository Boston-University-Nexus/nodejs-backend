const { v4 } = require("uuid");
const { queryDB } = require("../database/db");

const manageUsers = async (user) => {
  const { displayName, email, buID, user_buID } = user;
  var selectedUser = (
    await queryDB(
      "SELECT user_displayName, user_email, user_buID, user_key, major_name, user_year FROM users LEFT JOIN majors ON majors.major_ID = users.major_ID WHERE user_buID = ?",
      user_buID
    )
  )[0];

  if (!selectedUser) {
    const extensionKey = v4();
    selectedUser = (
      await queryDB(
        "INSERT INTO users (user_fname,user_lname,user_displayName,user_email,user_buID, user_key) VALUES (?)",
        [[fname, lname, displayName, email, buID, extensionKey]]
      )
    )[0];
  }

  return selectedUser;
};

module.exports = manageUsers;
