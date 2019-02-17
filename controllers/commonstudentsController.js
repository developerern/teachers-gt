const connection = require("../models/dbConnection");
const {isValidEmail, isArrayOfValidEmails} = require("../utils/emailValidator");

const commonstudentsController = (req, res, next) => {

  // handle not equal to one query param
  if (Object.keys(req.query).length !== 1 ) {
    return res.status(400).json({ message: "the number of parameters in the query string is not 1" })
  }

  const teacher = req.query.teacher;
  // handle missing query param
  if (!teacher) {
    return res.status(400).json({ message: "teacher query parameter is missing from the query string" })
  }

  let length;
  if (typeof teacher === "string") {
    // handle invalid email for the case of 1 teacher parameter
    if (!isValidEmail(teacher)) {
      return res.status(400).json({ message: `${teacher} is not a valid email` });
    }
    length = 1;
  } else if (Array.isArray(teacher)) {
    // handle invalid email(s) for the case of multiple teacher parameters
    const {areAllValidEmails, invalidEmails} = isArrayOfValidEmails(teacher);
    if (!areAllValidEmails) {
      return res.status(400).json({ message: `${invalidEmails.join(', ')} is/are invalid email(s)`})
    }
    length = teacher.length;
  }

  connection.query(`select student_email
                    from teachers_students
                    where teacher_email IN (?)
                    group by student_email
                    having count(distinct teacher_email) = ?;`
    , [teacher, length], (err, rows, fields) => {
      if (err) console.log(err);
      // console.log(rows)
      return res.json({ "students": rows.map(student => student.student_email) });
    });

};

module.exports = commonstudentsController;