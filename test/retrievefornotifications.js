process.env.NODE_ENV = "test";

const connection = require("../models/dbConnection");
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);


describe('/POST retrievefornotifications', () => {

  beforeEach('clear tables', async () => {
    await connection.emptyTable('teachers');
    await connection.emptyTable('students');
    await connection.emptyTable('teachers_students');
  });

  it('it should POST a teacher and a notification containing zero or more student email addresses', async() => {
    const teachers = [["teacherken@example.com"]];
    const students = [["studentbob@example.com"], ["studentagnes@example.com"], ["studentmiche@example.com"]];
    const teacher_student_pairs = [
      ["teacherken@example.com", "studentbob@example.com"]
    ];
    await connection.query("INSERT INTO teachers VALUES ?", [teachers]);
    await connection.query("INSERT IGNORE INTO students (email) VALUES ?", [students]);
    await connection.query("INSERT IGNORE INTO teachers_students (teacher_email, student_email) VALUES ?", [teacher_student_pairs]);


    const requestBody = {
      "teacher": "teacherken@example.com",
      "notification": "Hello students! @studentagnes@example.com @studentmiche@example.com"
    };

    chai.request(app)
      .post('/api/retrievefornotifications')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.deep.equal({
          "recipients": [
            "studentagnes@example.com",
            "studentbob@example.com",
            "studentmiche@example.com"
          ]
        });
      });
  });

  it('it should return Error 405 and an error message if any HTTP method other than POST is used', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/retrievefornotifications');

    res.should.have.status(405);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: `The GET method for the "/api/retrievefornotifications" route is not supported.` });
    requester.close();
  });

  it('it should return Error 400 and an error message if there are not two fields in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "teacher": "teacherken@gmail.com"
    };

    requester
      .post('/api/retrievefornotifications')
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
      "invalidKey2": "notification text"
    };

    requester
      .post('/api/retrievefornotifications')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `teacher and notification fields are missing from the request body` });
        requester.close();
      });
  });

  it('it should return Error 400 and an error message if students field contains at least one invalid email in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "teacher": "teacherken@example.com",
      "notification": "Hello students! @invalidEmail1 @invalidEmail2"
    };

    requester
      .post('/api/retrievefornotifications')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `invalidEmail1, invalidEmail2 is/are invalid email(s)` });
        requester.close();
      });
  });
});