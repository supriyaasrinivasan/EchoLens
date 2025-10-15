-- College Admission & Seat Management Portal Database Schema
-- Created: August 16, 2025

CREATE DATABASE IF NOT EXISTS admission;
USE admission;

-- 1. Academic Years Table
CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year_name VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Streams Table (A, B, C)
CREATE TABLE streams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_name VARCHAR(10) NOT NULL UNIQUE,
    stream_description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_code VARCHAR(10) NOT NULL UNIQUE,
    dept_name VARCHAR(100) NOT NULL,
    stream_id INT NOT NULL,
    intake_capacity INT NOT NULL DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE RESTRICT
);

-- 4. Admission Categories Table
CREATE TABLE admission_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    reservation_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users Table (Admin, Counselling Officer, Student roles)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'counsellor', 'student') NOT NULL DEFAULT 'student',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Students Table (Minimal booking info)
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_no VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    admission_category_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    admission_status ENUM('BOOKED', 'CANCELLED', 'CONFIRMED') DEFAULT 'BOOKED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmation_date TIMESTAMP NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admission_category_id) REFERENCES admission_categories(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 7. Student Personal Details Table (60+ fields for confirmed admissions)
CREATE TABLE student_personal_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    -- Personal Information
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group VARCHAR(5),
    nationality VARCHAR(50) DEFAULT 'Indian',
    religion VARCHAR(50),
    caste VARCHAR(50),
    sub_caste VARCHAR(50),
    mother_tongue VARCHAR(50),
    marital_status ENUM('Single', 'Married', 'Other') DEFAULT 'Single',
    physically_handicapped BOOLEAN DEFAULT FALSE,
    handicap_details TEXT,
    -- Contact Information
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    emergency_contact_relation VARCHAR(50),
    -- Additional Details
    hobbies TEXT,
    special_talents TEXT,
    medical_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Student Parent Details Table
CREATE TABLE student_parent_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    -- Father Details
    father_name VARCHAR(100) NOT NULL,
    father_occupation VARCHAR(100),
    father_phone VARCHAR(15),
    father_email VARCHAR(100),
    father_income DECIMAL(12,2),
    father_education VARCHAR(100),
    -- Mother Details
    mother_name VARCHAR(100) NOT NULL,
    mother_occupation VARCHAR(100),
    mother_phone VARCHAR(15),
    mother_email VARCHAR(100),
    mother_income DECIMAL(12,2),
    mother_education VARCHAR(100),
    -- Guardian Details (if different)
    guardian_name VARCHAR(100),
    guardian_relation VARCHAR(50),
    guardian_phone VARCHAR(15),
    guardian_email VARCHAR(100),
    guardian_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 9. Student Academic Details Table
CREATE TABLE student_academic_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    -- 10th Standard
    tenth_board VARCHAR(100) NOT NULL,
    tenth_school VARCHAR(200) NOT NULL,
    tenth_year_of_passing YEAR NOT NULL,
    tenth_percentage DECIMAL(5,2) NOT NULL,
    tenth_cgpa DECIMAL(4,2),
    tenth_register_no VARCHAR(50),
    -- 12th Standard
    twelfth_board VARCHAR(100) NOT NULL,
    twelfth_school VARCHAR(200) NOT NULL,
    twelfth_year_of_passing YEAR NOT NULL,
    twelfth_percentage DECIMAL(5,2) NOT NULL,
    twelfth_cgpa DECIMAL(4,2),
    twelfth_register_no VARCHAR(50),
    twelfth_group VARCHAR(50),
    -- Entrance Exam Details
    entrance_exam_name VARCHAR(100),
    entrance_exam_score INT,
    entrance_exam_rank INT,
    entrance_exam_year YEAR,
    -- Previous College (if any)
    previous_college VARCHAR(200),
    previous_course VARCHAR(100),
    transfer_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Student Contact Details Table
CREATE TABLE student_contact_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    -- Present Address
    present_address_line1 VARCHAR(255) NOT NULL,
    present_address_line2 VARCHAR(255),
    present_city VARCHAR(100) NOT NULL,
    present_state VARCHAR(100) NOT NULL,
    present_pincode VARCHAR(10) NOT NULL,
    present_country VARCHAR(50) DEFAULT 'India',
    -- Permanent Address
    permanent_address_line1 VARCHAR(255) NOT NULL,
    permanent_address_line2 VARCHAR(255),
    permanent_city VARCHAR(100) NOT NULL,
    permanent_state VARCHAR(100) NOT NULL,
    permanent_pincode VARCHAR(10) NOT NULL,
    permanent_country VARCHAR(50) DEFAULT 'India',
    -- Same as present address flag
    same_as_present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 11. Student Document Details Table
CREATE TABLE student_document_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    document_file_path VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- 12. Seat Allocation Table
CREATE TABLE seat_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    department_id INT NOT NULL,
    total_seats INT NOT NULL,
    booked_seats INT DEFAULT 0,
    confirmed_seats INT DEFAULT 0,
    cancelled_seats INT DEFAULT 0,
    available_seats INT GENERATED ALWAYS AS (total_seats - confirmed_seats) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    UNIQUE KEY unique_allocation (academic_year_id, department_id)
);

-- 13. Student Department Allocation Table
CREATE TABLE student_department_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    section VARCHAR(10),
    allocated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allocated_by INT,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (allocated_by) REFERENCES users(id)
);

-- 14. Sections Table
CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section_name VARCHAR(10) NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    max_capacity INT DEFAULT 60,
    current_strength INT DEFAULT 0,
    class_teacher VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_section (section_name, department_id, academic_year_id)
);

-- 15. Confirmed Students (Final consolidated table)
CREATE TABLE confirmed_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    admission_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    department_id INT NOT NULL,
    section_id INT,
    admission_category_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    date_of_joining DATE NOT NULL,
    roll_number VARCHAR(20),
    student_id_card_no VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (admission_category_id) REFERENCES admission_categories(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- 16. System Settings Table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Initial Data

-- Insert Streams
INSERT INTO streams (stream_name, stream_description) VALUES
('A', 'Engineering Stream A'),
('B', 'Engineering Stream B'),
('C', 'Engineering Stream C');

-- Insert Departments
INSERT INTO departments (dept_code, dept_name, stream_id, intake_capacity) VALUES
('ECE', 'Electronics and Communication Engineering', 1, 120),
('IT', 'Information Technology', 1, 120),
('CSE', 'Computer Science and Engineering', 1, 180),
('AIML', 'Artificial Intelligence and Machine Learning', 2, 60),
('VLSI', 'Very Large Scale Integration', 2, 60),
('MECH', 'Mechanical Engineering', 3, 120),
('CIVIL', 'Civil Engineering', 3, 120),
('EEE', 'Electrical and Electronics Engineering', 3, 60);

-- Insert Admission Categories
INSERT INTO admission_categories (category_name, category_code, reservation_percentage) VALUES
('General', 'GEN', 50.00),
('Other Backward Classes', 'OBC', 27.00),
('Scheduled Caste', 'SC', 15.00),
('Scheduled Tribe', 'ST', 7.50),
('Physically Handicapped', 'PH', 3.00),
('Management Quota', 'MQ', 15.00);

-- Insert Academic Year
INSERT INTO academic_years (year_name, start_date, end_date, is_active) VALUES
('2025-26', '2025-06-01', '2026-05-31', TRUE);

-- Insert Default Admin User (password: admin123)
INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES
('admin', 'admin@college.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', '9876543210'),
('counsellor1', 'counsellor1@college.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'counsellor', 'Counsellor One', '9876543211');

-- Insert System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_description) VALUES
('college_name', 'MKCE College of Engineering', 'College Name'),
('college_address', 'Karur, Tamil Nadu, India', 'College Address'),
('admission_start_date', '2025-06-01', 'Admission Process Start Date'),
('admission_end_date', '2025-08-31', 'Admission Process End Date'),
('max_section_capacity', '60', 'Maximum students per section'),
('section_balance_rule', '5', 'Extra students to distribute (+5 rule)');

-- Create Seat Allocations for current academic year
INSERT INTO seat_allocations (academic_year_id, department_id, total_seats)
SELECT 1, id, intake_capacity FROM departments WHERE is_active = TRUE;

-- Create Indexes for Performance
CREATE INDEX idx_students_status ON students(admission_status);
CREATE INDEX idx_students_category ON students(admission_category_id);
CREATE INDEX idx_students_year ON students(academic_year_id);
CREATE INDEX idx_confirmed_students_dept ON confirmed_students(department_id);
CREATE INDEX idx_confirmed_students_section ON confirmed_students(section_id);
CREATE INDEX idx_seat_allocations_dept_year ON seat_allocations(department_id, academic_year_id);

-- Create Triggers for Seat Management

DELIMITER //

-- Trigger to update seat allocation when student status changes
CREATE TRIGGER update_seat_allocation 
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    DECLARE dept_id INT;
    
    -- Get department allocation for this student if exists
    SELECT department_id INTO dept_id 
    FROM student_department_allocations 
    WHERE student_id = NEW.id;
    
    IF dept_id IS NOT NULL THEN
        -- Update seat counts based on status change
        IF OLD.admission_status != NEW.admission_status THEN
            UPDATE seat_allocations 
            SET 
                booked_seats = (
                    SELECT COUNT(*) FROM students s
                    JOIN student_department_allocations sda ON s.id = sda.student_id
                    WHERE sda.department_id = dept_id 
                    AND s.admission_status = 'BOOKED'
                    AND s.academic_year_id = NEW.academic_year_id
                ),
                confirmed_seats = (
                    SELECT COUNT(*) FROM students s
                    JOIN student_department_allocations sda ON s.id = sda.student_id
                    WHERE sda.department_id = dept_id 
                    AND s.admission_status = 'CONFIRMED'
                    AND s.academic_year_id = NEW.academic_year_id
                ),
                cancelled_seats = (
                    SELECT COUNT(*) FROM students s
                    JOIN student_department_allocations sda ON s.id = sda.student_id
                    WHERE sda.department_id = dept_id 
                    AND s.admission_status = 'CANCELLED'
                    AND s.academic_year_id = NEW.academic_year_id
                )
            WHERE department_id = dept_id 
            AND academic_year_id = NEW.academic_year_id;
        END IF;
    END IF;
END//

-- Trigger to update section strength
CREATE TRIGGER update_section_strength
AFTER INSERT ON confirmed_students
FOR EACH ROW
BEGIN
    IF NEW.section_id IS NOT NULL THEN
        UPDATE sections 
        SET current_strength = (
            SELECT COUNT(*) 
            FROM confirmed_students 
            WHERE section_id = NEW.section_id
        )
        WHERE id = NEW.section_id;
    END IF;
END//

DELIMITER ;
