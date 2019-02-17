CREATE DATABASE IF NOT EXISTS teacherdb;

USE teacherdb;

CREATE TABLE IF NOT EXISTS teachers(
	email VARCHAR(60) NOT NULL UNIQUE,
	PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS students (
	email VARCHAR(60) NOT NULL UNIQUE,
	suspended BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS teachers_students (
	teacher_email VARCHAR(60) NOT NULL,
	student_email VARCHAR(60) NOT NULL,
	PRIMARY KEY (teacher_email, student_email),
	FOREIGN KEY (teacher_email) REFERENCES teachers (email)
		ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (student_email) REFERENCES students (email)
		ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE DATABASE IF NOT EXISTS teacherdb_test;

USE teacherdb_test;

CREATE TABLE IF NOT EXISTS teachers(
	email VARCHAR(60) NOT NULL UNIQUE,
	PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS students (
	email VARCHAR(60) NOT NULL UNIQUE,
	suspended BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS teachers_students (
	teacher_email VARCHAR(60) NOT NULL,
	student_email VARCHAR(60) NOT NULL,
	PRIMARY KEY (teacher_email, student_email),
	FOREIGN KEY (teacher_email) REFERENCES teachers (email)
		ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (student_email) REFERENCES students (email)
		ON DELETE CASCADE ON UPDATE CASCADE
);		