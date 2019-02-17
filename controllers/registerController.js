const connection = require("../models/dbConnection");
const { isArrayOfValidEmails } = require("../utils/emailValidator");


const registerController = async(req, res, next) => {

  // handle not equal to two fields
  if (Object.keys(req.body).length !== 2) {
    return res.status(400).json({ message: "the number of fields in the request body is not 2" })
  }

  const teacher = req.body.teacher;
  const students = req.body.students;

  // handle missing fields
  if (!teacher && !students) {
    return res.status(400).json({ message: "teacher and students fields are missing from the request body" });
  } else if (!teacher) {
    return res.status(400).json({ message: "teacher field is missing from the request body" });
  } else if (!students) {
    return res.status(400).json({ message: "students field is missing from the request body" });
  }

  // handle incorrect datatype
  if (typeof teacher !== 'string' && !isArrayOfStrings(students)) {
    return res.status(400).json({ message: "teacher field must be a string and students field must be an array of strings" });
  } else if (typeof teacher !== 'string') {
    return res.status(400).json({ message: "teacher field must be a string" });
  } else if (!isArrayOfStrings(students)) {
    return res.status(400).json({ message: "students field must be an array of strings" });
  }

  // handle invalid emails
  const {areAllValidEmails, invalidEmails} = isArrayOfValidEmails([teacher, ...students]);
  if (!areAllValidEmails) {
    return res.status(400).json({ message: `${invalidEmails.join(', ')} is/are invalid email(s)`})
  }

  await connection.query("INSERT IGNORE INTO teachers VALUES (?)", [teacher]);

  const processedStudents = students.map(student => [student]);
  await connection.query("INSERT IGNORE INTO students (email) VALUES ?", [processedStudents])

  const processedTeacherStudentPairs = students.map(student => [teacher, student]);
  await connection.query("INSERT IGNORE INTO teachers_students (teacher_email, student_email) VALUES ?", [processedTeacherStudentPairs])

  return res.sendStatus(204);
};

const isArrayOfStrings = array => {
  if (!Array.isArray(array)) return false;
  if (array.length === 0) return false;
  for (let element of array) {
    if (typeof  element !== 'string') return false;
  }
  return true;
};

module.exports = registerController;
