const { queryDB } = require("../database/db");

const manageUsers = async (user) => {
  const { fname, lname, displayName, email, buID } = user;
  var selectedUser = (
    await queryDB(
      "SELECT user_fname,user_lname,user_displayName,user_email,user_buID FROM users WHERE user_buID = ?",
      buID
    )
  )[0];

  if (!selectedUser) {
    selectedUser = (
      await queryDB(
        "INSERT INTO users (user_fname,user_lname,user_displayName,user_email,user_buID) VALUES (?)",
        [[fname, lname, displayName, email, buID]]
      )
    )[0];
  }

  return selectedUser;
};

module.exports = manageUsers;
