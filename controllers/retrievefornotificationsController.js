const connection = require("../models/dbConnection");
const {isValidEmail} = require("../utils/emailValidator");

const retrievefornotificationsController = async(req, res) => {

  // handle not equal to two fields
  if (Object.keys(req.body).length !== 2) {
    return res.status(400).json({ message: "the number of fields in the request body is not 2" })
  }

  const teacher = req.body.teacher;
  const notification = req.body.notification;
  // handle missing fields
  if (!teacher && !notification) {
    return res.status(400).json({ message: "teacher and notification fields are missing from the request body" });
  } else if (!teacher) {
    return res.status(400).json({ message: "teacher field is missing from the request body" });
  } else if (!notification) {
    return res.status(400).json({ message: "notification field is missing from the request body" });
  }

  const message = [];
  const studentsEmailAddresses = [];
  const words = notification.split(' ');
  let invalidEmailAddresses = [];
  for (let word of words) {
    if (word.startsWith('@') && word.length > 1) {
      let token = word.slice(1)
      if (isValidEmail(token)) {
        studentsEmailAddresses.push(token);
      } else {
        invalidEmailAddresses.push(token)
      }
    } else {
      message.push(word);
    }
  }

  if (invalidEmailAddresses.length > 0) {
    return res.status(400).json({ message: `${invalidEmailAddresses.join(', ')} is/are invalid email(s)`})
  }

  let queryString;
  if (studentsEmailAddresses.length === 0) {
    queryString = `select student_email as email
                     from teachers_students
                     where teacher_email = ?
                  `;
  } else {
    queryString = `select email from students
                   where ( email in (
                     select student_email
                     from teachers_students
                     where teacher_email = ?
                   ) 
                   or email in (?)
                   ) and suspended=0`;
  }

  const response = await connection.query(queryString, [teacher, studentsEmailAddresses])
  return res.status(200).json({"recipients": response.map(student => student.email)});
};

module.exports = retrievefornotificationsController;