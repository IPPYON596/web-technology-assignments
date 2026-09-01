-- Run this once if you prefer to create the schema manually instead of
-- relying on spring.jpa.hibernate.ddl-auto=update.

CREATE DATABASE IF NOT EXISTS vit_result_db;
USE vit_result_db;

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    branch VARCHAR(100),
    semester VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS semester_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    total_percentage DOUBLE,
    sgpa DOUBLE,
    overall_grade VARCHAR(5),
    total_credits INT,
    created_at DATETIME,
    CONSTRAINT fk_semester_result_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subject_marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_result_id BIGINT NOT NULL,
    subject_code VARCHAR(20),
    subject_name VARCHAR(100),
    credit INT,
    mse_marks DOUBLE,
    ese_marks DOUBLE,
    total_marks DOUBLE,
    grade VARCHAR(5),
    grade_point INT,
    CONSTRAINT fk_subject_mark_result FOREIGN KEY (semester_result_id) REFERENCES semester_results(id) ON DELETE CASCADE
);
