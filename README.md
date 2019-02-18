# Introduction

This system is developed for teachers so that they can perform administrative functions for their students.<br> 
<br>Teachers and students are identified by their email addresses.<br>
<br>*Email addresses are considered valid if they*
* *begin with a local part, followed by @, followed by a domain, and ending with .com*
* *the local part consists of alphanumeric characters, or dots or underscores*
* *the domain consists of alphanumeric characters*

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

```
1. Node v10.14.1
2. Node Package Manager v6.4.1
3. MYSQL 8.0.15
```

### Installing

A step by step series of examples that tell you how to get a development env running

Open command prompt and cd to project directory, then install packages

```
> npm install
```

Run SQL script fixtures.sql (For Windows)
```
> mysql -u root -p < fixtures.sql
```

## Running the development server

Configure the port in config.js. The default port is 80.

Either run by node
```
> node app
```

or npm
```
> npm start
```

## Running the tests

```
> npm run test
```

### Test Coverage

Unit test were written for the following endpoints:
* /api/register
  - If one or more student email addresses and one teacher email address are valid, the response should be 204
  - If the HTTP request is a method other than GET, response should be 405
  - If the request body does not have exactly two fields, the response should be 400
  - If the request body has two fields but neither are teacher nor students field, the response should be 400
  - If the request body has neither a string for teacher field nor array of strings for students field, the response should be 400
  - If the request body has a string for the teacher field but an empty array for the students field, the response should be 400
  - If the request body has at least one invalid email address in either the teacher or students field, the response should be 400
* /api/commonstudents
  - If the query parameters are all teacher-valid email address pairs, the response should be 200
  - If the HTTP request is a method other than POST, the response should be 405
  - If there is more than one query parameter other than teacher query parameter, the response should be 400
  - If there is one query parameter and it is not the teacher query parameter, the response should be 400
  - If there is one teacher query parameter and it is not a valid email address, the response should be 400
  - If there are teacher query parameters with at least one having an invalid email, the response should be 400
* /api/suspend
  - If the request body contains a valid email address which exists in the students table and belongs to a student who has not been suspended, the response should be 204
  - If the HTTP request is a method other than GET, response should be 405
  - If the request body does not contain exactly one field, the response should be 400
  - If the request body does not contain a student field, the response should be 400
  - If the request body contains a student field with an invalid email address, the response should be 400
  - If the request body contains a valid email address which cannot be found in the students table, the response should be 400
  - If the request body contains a valid email address which can be found in the students table but belongs to a student who is already suspended, the response should be 200
* /api/retrievefornotifications
  - If the request body contains valid email address of teacher and mentioned students, the response should be 200
  - If the HTTP request is a method other than GET, response should be 405 
  - If the request body does not contain exactly two fields, the response should be 400
  - If the request body contains two fields that are neither teacher nor notification fields, the response should be 400
  - If the request body contains at least one invalid email in either the teacher or notification field, the response should be 400
  
Every table in the database used for testing (i.e. teacherdb_test)
is emptied before each unit test.

## Acknowledgments
* Anyone whose code I referred to
* Code reviewers