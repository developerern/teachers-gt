process.env.NODE_ENV = "test";

const connection = require("../models/dbConnection");
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);


describe('/POST register', () => {
  beforeEach('clear tables', async () => {
    try {
      await connection.emptyTable('teachers');
      await connection.emptyTable('students');
      await connection.emptyTable('teachers_students');
    } catch (err) {
      console.error(err);
    }
  });


  it('it should POST teacher and all students', done => {
    const requestBody = {
      "teacher": "teacherken@gmail.com",
      "students":
        [
          "studentjon@gmail.com",
          "studenthon@gmail.com"
        ]
    };

    chai.request(app)
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(204);
        res.body.should.be.a('object');
      })
      .then(async() => {

        try {
          let response1 = await connection.query(`
             SELECT COUNT (*) AS count FROM teachers
             WHERE email=?
          `, 'teacherken@gmail.com');
          response1[0]['count'].should.equal(1);

          let response2 = await connection.query(`
            SELECT COUNT (*) AS count FROM students
            WHERE email IN (?);`
            , [["studentjon@gmail.com", "studenthon@gmail.com"]]);
          response2[0]['count'].should.equal(2);

          let response3 = await connection.query(`
            SELECT COUNT (*) AS count FROM teachers_students
            WHERE student_email IN (?)
            AND teacher_email=?
          `, [["studentjon@gmail.com", "studenthon@gmail.com"], 'teacherken@gmail.com']);
          response3[0]['count'].should.equal(2);
        } catch (err) {
          console.error(err);
        }
        done();
    })
  });


  it('it should return Error 405 and an error message if any HTTP method other than POST is used', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/register');

    res.should.have.status(405);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: `The GET method for the "/api/register" route is not supported.` });
    requester.close();
  });


  it('it should return Error 400 and an error message if there are not two fields in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "teacher": "teacherken@gmail.com"
    };

    requester
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `the number of fields in the request body is not 2` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if there are not teacher and students fields in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "invalidKey1": "teacherken@gmail.com",
      "invalidKey2": "email@example.com"
    };

    requester
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `teacher and students fields are missing from the request body` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if teacher field does not contain a string and students field does not contain an array of strings in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "teacher": 1,
      "students": "notAnArrayOfStrings"
    };

    requester
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `teacher field must be a string and students field must be an array of strings` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if if the students field contains an empty array', async() => {
    const requester = chai.request(app).keepOpen();
    const requestBody = {
      "teacher": "teacherken@gmail.com",
      "students": []
    };

    requester
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `students field must be an array of strings` });
        requester.close();
      })
  });


  it('it should return Error 400 and an error message if students field contains at least one invalid email in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "teacher": "teacherken@example.com",
      "students": ["invalidEmail", "student@example.com"]
    };

    requester
      .post('/api/register')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `invalidEmail is/are invalid email(s)` });
        requester.close();
      });
  });
});
