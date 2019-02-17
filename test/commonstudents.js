process.env.NODE_ENV = "test";

const connection = require("../models/dbConnection");
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);


describe('/GET commonstudents', () => {
  beforeEach('clear tables', async () => {
    await connection.emptyTable('teachers');
    await connection.emptyTable('students');
    await connection.emptyTable('teachers_students');
  });


  it('it should GET common students of two teachers', async () => {
    const requester = chai.request(app).keepOpen();

    const teachers = [["teacherjoe@example.com"], ["teacherken@example.com"]];
    const students = [["commonstudent1@gmail.com"], ["commonstudent2@gmail.com"], ["student_only_under_teacher_ken@gmail.com"]];
    const teacher_student_pairs = [
      ["teacherjoe@example.com", "commonstudent1@gmail.com"], ["teacherjoe@example.com", "commonstudent2@gmail.com"],
      ["teacherken@example.com", "commonstudent1@gmail.com"], ["teacherken@example.com", "commonstudent2@gmail.com"], ["teacherken@example.com", "student_only_under_teacher_ken@gmail.com"]
    ];
    await connection.query("INSERT INTO teachers VALUES ?", [teachers]);
    await connection.query("INSERT INTO students (email) VALUES ?", [students]);
    await connection.query("INSERT INTO teachers_students (teacher_email, student_email) VALUES ?", [teacher_student_pairs]);

    const res = await requester
      .get('/api/commonstudents?teacher=teacherken%40example.com&teacher=teacherjoe%40example.com')

    res.should.have.status(200);
    res.body.should.be.a('object');
    res.body.should.have.own.property('students');
    res.body.should.deep.equal({
      "students": [
        "commonstudent1@gmail.com",
        "commonstudent2@gmail.com"
      ]
    });
    requester.close();
  });


  it('it should GET students of teacherken', async () => {
    const requester = chai.request(app).keepOpen();

    const teachers = [["teacherken@example.com"]];
    const students = [["commonstudent1@gmail.com"], ["commonstudent2@gmail.com"], ["student_only_under_teacher_ken@gmail.com"]];
    const teacher_student_pairs = [
      ["teacherken@example.com", "commonstudent1@gmail.com"], ["teacherken@example.com", "commonstudent2@gmail.com"], ["teacherken@example.com", "student_only_under_teacher_ken@gmail.com"]
    ];
    await connection.query("INSERT INTO teachers VALUES ?", [teachers]);
    await connection.query("INSERT IGNORE INTO students (email) VALUES ?", [students]);
    await connection.query("INSERT IGNORE INTO teachers_students (teacher_email, student_email) VALUES ?", [teacher_student_pairs]);

    const res = await requester
      .get('/api/commonstudents?teacher=teacherken%40example.com');

    res.should.have.status(200);
    res.body.should.be.a('object');
    res.body.should.have.own.property('students');
    res.body.should.deep.equal({
      "students": [
        "commonstudent1@gmail.com",
        "commonstudent2@gmail.com",
        "student_only_under_teacher_ken@gmail.com"
      ]
    });
    requester.close();
  });


  it('it should return Error 405 and an error message if any HTTP method other than GET is used', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .post('/api/commonstudents');

    res.should.have.status(405);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: `The POST method for the "/api/commonstudents" route is not supported.` });
    requester.close();
  });


  it('it should return Error 400 and an error message if there is more than one query parameter othan than teacher', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/commonstudents?teacher=teacherken%40example.com&extra=unnecessary');

    res.should.have.status(400);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: "the number of parameters in the query string is not 1" });
    requester.close();
  });


  it('it should return Error 400 and an error message if teacher query parameter is missing from the query string', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/commonstudents?extra=unnecessary');

    res.should.have.status(400);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: "teacher query parameter is missing from the query string" });
    requester.close();
  });


  it('it should return Error 400 and an error message if teacher query parameter is missing from the query string', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/commonstudents?extra=unnecessary');

    res.should.have.status(400);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: "teacher query parameter is missing from the query string" });
    requester.close();
  });


  it('it should return Error 400 and an error message if there is one teacher query parameter with an invalid email', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/commonstudents?teacher=invalidEmail');

    res.should.have.status(400);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: "invalidEmail is not a valid email" });
    requester.close();
  });


  it('it should return Error 400 and an error message if there are teacher query parameters with at least one having an invalid email', async () => {
    const requester = chai.request(app).keepOpen();

    const re1 = await requester
      .get('/api/commonstudents?teacher=teacherken%40example.com&teacher=invalidEmail');

    re1.should.have.status(400);
    re1.body.should.be.a('object');
    re1.body.should.have.own.property('message');
    re1.body.should.deep.equal({
      message: "invalidEmail is/are invalid email(s)" });

    const re2 = await requester
      .get('/api/commonstudents?teacher=invalidEmail&teacher=teacherken%40example.com');

    re2.should.have.status(400);
    re2.body.should.be.a('object');
    re2.body.should.have.own.property('message');
    re2.body.should.deep.equal({
      message: "invalidEmail is/are invalid email(s)" });

    const re3 = await requester
      .get('/api/commonstudents?teacher=invalidEmail1&teacher=invalidEmail2');

    re3.should.have.status(400);
    re3.body.should.be.a('object');
    re3.body.should.have.own.property('message');
    re3.body.should.deep.equal({
      message: "invalidEmail1, invalidEmail2 is/are invalid email(s)" });
    requester.close();
  });
});