<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Validate inputs
    $name = sanitize_input($_POST['name'] ?? '');
    $email = sanitize_input($_POST['email'] ?? '');
    $phone = sanitize_input($_POST['phone'] ?? '');
    $dob = $_POST['dob'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $twelfth_percentage = $_POST['twelfth_percentage'] ?? '';
    $twelfth_board = $_POST['twelfth_board'] ?? '';
    $entrance_score = $_POST['entrance_score'] ?? null;
    $entrance_rank = $_POST['entrance_rank'] ?? null;
    $preferred_department = $_POST['preferred_department'] ?? '';
    $admission_category = $_POST['admission_category'] ?? '';
    $parent_name = sanitize_input($_POST['parent_name'] ?? '');
    $parent_phone = sanitize_input($_POST['parent_phone'] ?? '');
    
    // Validation
    if (empty($name) || empty($email) || empty($phone) || empty($dob) || 
        empty($gender) || empty($twelfth_percentage) || empty($twelfth_board) || 
        empty($preferred_department) || empty($admission_category) || 
        empty($parent_name) || empty($parent_phone)) {
        json_response(false, 'All required fields must be filled');
    }
    
    if (!validate_email($email)) {
        json_response(false, 'Invalid email address');
    }
    
    if (!validate_phone($phone) || !validate_phone($parent_phone)) {
        json_response(false, 'Invalid phone number');
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM students WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(false, 'Email address already registered');
    }
    
    // Get current academic year
    $current_year = get_current_academic_year();
    if (!$current_year) {
        json_response(false, 'No active academic year found');
    }
    
    // Get category code for admission number
    $stmt = $conn->prepare("SELECT category_code FROM admission_categories WHERE id = ?");
    $stmt->execute([$admission_category]);
    $category = $stmt->fetch();
    if (!$category) {
        json_response(false, 'Invalid admission category');
    }
    
    // Generate admission number
    $admission_no = generate_admission_no($category['category_code'], $current_year['year_name']);
    
    // Start transaction
    $conn->beginTransaction();
    
    try {
        // Insert student record
        $stmt = $conn->prepare("INSERT INTO students (admission_no, name, email, phone, admission_category_id, 
                               academic_year_id, admission_status, booking_date) 
                               VALUES (?, ?, ?, ?, ?, ?, 'BOOKED', NOW())");
        $stmt->execute([$admission_no, $name, $email, $phone, $admission_category, $current_year['id']]);
        
        $student_id = $conn->lastInsertId();
        
        // Insert basic personal details
        $stmt = $conn->prepare("INSERT INTO student_personal_details 
                               (student_id, first_name, last_name, date_of_birth, gender) 
                               VALUES (?, ?, ?, ?, ?)");
        
        $name_parts = explode(' ', $name, 2);
        $first_name = $name_parts[0];
        $last_name = isset($name_parts[1]) ? $name_parts[1] : '';
        
        $stmt->execute([$student_id, $first_name, $last_name, $dob, $gender]);
        
        // Insert basic academic details
        $stmt = $conn->prepare("INSERT INTO student_academic_details 
                               (student_id, twelfth_percentage, twelfth_board, entrance_exam_score, entrance_exam_rank,
                                tenth_board, tenth_school, tenth_year_of_passing, tenth_percentage,
                                twelfth_school, twelfth_year_of_passing) 
                               VALUES (?, ?, ?, ?, ?, '', '', 0, 0, '', 0)");
        $stmt->execute([$student_id, $twelfth_percentage, $twelfth_board, $entrance_score, $entrance_rank]);
        
        // Insert parent details
        $stmt = $conn->prepare("INSERT INTO student_parent_details 
                               (student_id, father_name, father_phone) 
                               VALUES (?, ?, ?)");
        $stmt->execute([$student_id, $parent_name, $parent_phone]);
        
        // Create department allocation (tentative)
        $stmt = $conn->prepare("INSERT INTO student_department_allocations 
                               (student_id, department_id, academic_year_id, allocated_date) 
                               VALUES (?, ?, ?, NOW())");
        $stmt->execute([$student_id, $preferred_department, $current_year['id']]);
        
        $conn->commit();
        
        // Prepare response data
        $response_data = [
            'admission_no' => $admission_no,
            'student_id' => $student_id,
            'student_name' => $name,
            'email' => $email,
            'phone' => $phone
        ];
        
        json_response(true, 'Seat booked successfully!', $response_data);
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Seat booking error: " . $e->getMessage());
    json_response(false, 'An error occurred while booking your seat. Please try again.');
}
?>
