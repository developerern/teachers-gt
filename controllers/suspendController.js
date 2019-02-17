const connection = require("../models/dbConnection");
const { isValidEmail } = require("../utils/emailValidator");

const suspendController = async (req, res, next) => {

  // handle not equal to one field
  if (Object.keys(req.body).length !== 1) {
    return res.status(400).json({ message: "the number of fields in the request body is not 1" })
  }

  const student = req.body.student;
  // handle missing field
  if (!student) return res.status(400).json({ message: "student field is missing from the request body" });

  // handle invalid email address
  if (!isValidEmail(student) || typeof student !== 'string') return res.status(400).json({ message: `${student} is an invalid email address` });

  // handle email address not found in database
  let result = await connection.query(`SELECT email
                    FROM students
                    WHERE email=?`, [student]);

  if (result.length === 0) {
    return res.status(400).json({ message: `${student} cannot be found in the database.` })
  } else {
    result = await connection.query(`SELECT email
                    FROM students
                    WHERE email=?
                    AND suspended=0;`, [student]);
  }

  if (result.length === 1) {
    await connection.query(`UPDATE students
                        SET suspended = 1
                        where email IN (?);`, [student]);
    res.sendStatus(204);
  } else {
    return res.status(200).json({message: `${student} has already been suspended.`})
  }
};

module.exports = suspendController;