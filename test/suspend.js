process.env.NODE_ENV = "test";

const connection = require("../models/dbConnection");
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);


describe('/POST suspend', () => {
  beforeEach('clear tables', async () => {
    try {
      await connection.emptyTable('teachers');
      await connection.emptyTable('students');
      await connection.emptyTable('teachers_students');
    } catch (err) {
      console.error(err);
    }
  });


  it('it should POST a student who has not been suspended and exists in the students table', done => {
    const requestBody = {
      "student": "studentmary@gmail.com"
    };

    (async() => {
      try {
        let result = await connection.query(`INSERT INTO students (email, suspended) VALUES (?, ?)`,
          ["studentmary@gmail.com", 0]);

        chai.request(app)
          .post('/api/suspend')
          .send(requestBody)
          .then(res => {
            res.should.have.status(204)})
          .then(async() => {
            try {
              let response = await connection.query(`
                SELECT suspended FROM students
                WHERE email=?
              `, ['studentmary@gmail.com']);
              const isSuspended = response[0]['suspended'];

              isSuspended.should.equal(1);
              // res.body.should.be.a('object');
              // res.body.should.deep.equal({
              //   "message": "studentjob@example.com has already been suspended."
              // });
            } catch (err) {
              console.error(err);
            }
            done();
          });
      } catch(err) {
        console.log(err)
      }
    })();
  });


  it('it should return Error 405 and an error message if any HTTP method other than POST is used', async () => {
    const requester = chai.request(app).keepOpen();

    const res = await requester
      .get('/api/suspend');

    res.should.have.status(405);
    res.body.should.be.a('object');
    res.body.should.have.own.property('message');
    res.body.should.deep.equal({
      message: `The GET method for the "/api/suspend" route is not supported.` });
    requester.close();
  });


  it('it should return Error 400 and an error message if there are not two fields in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {};

    requester
      .post('/api/suspend')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `the number of fields in the request body is not 1` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if there is not a student field in the request body', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "invalidKey": "studentmary@gmail.com",
    };

    requester
      .post('/api/suspend')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `student field is missing from the request body` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if the student field in the request body does not contain a valid email', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "student": "studentmary@gmail",
    };

    requester
      .post('/api/suspend')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `studentmary@gmail is an invalid email address` });
        requester.close();
      });
  });


  it('it should return Error 400 and an error message if the student field in the request body contains a number', async () => {
    const requester = chai.request(app).keepOpen();

    const requestBody = {
      "student": 123,
    };

    requester
      .post('/api/suspend')
      .send(requestBody)
      .then(function(res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
          message: `123 is an invalid email address` });
        requester.close();
      });
  });

  it('it should return Error 400 and an error message if the student does not exist in the students table', async() => {
    const requester = chai.request(app).keepOpen();
    const requestBody = {
      "student": "studentmary@gmail.com"
    };

    requester
      .post('/api/suspend')
      .send(requestBody)
      .then(res => {
        res.should.have.status(400)
        res.body.should.be.a('object');
        res.body.should.have.own.property('message');
        res.body.should.deep.equal({
        message: `studentmary@gmail.com cannot be found in the database.` });
        requester.close();
      })
  });

  it('it should POST a student who has already been suspended and exists in the students table', async() => {
    const requestBody = {
      "student": "badstudent@gmail.com"
    };

    let result = await connection.query(`INSERT INTO students (email, suspended) VALUES (?, ?)`,
      ["badstudent@gmail.com", 1]);

    chai.request(app)
      .post('/api/suspend')
      .send(requestBody)
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.deep.equal({
          "message": "badstudent@gmail.com has already been suspended."
        })
      })
      .then(async() => {
        try {
          let response = await connection.query(`
            SELECT suspended FROM students
            WHERE email=?
          `, ['badstudent@gmail.com']);
          const isSuspended = response[0]['suspended'];

          isSuspended.should.equal(1);
        } catch (err) {
          console.error(err);
        }
      })
  });
});