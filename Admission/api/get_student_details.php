<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    json_response(false, 'Student ID is required');
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $student_id = $_GET['id'];
    
    $stmt = $conn->prepare("
        SELECT 
            s.*,
            ac.category_name,
            ac.category_code,
            d.dept_name,
            d.dept_code,
            spd.date_of_birth,
            spd.gender,
            spd.first_name,
            spd.last_name,
            sad.twelfth_percentage,
            sad.twelfth_board,
            sad.entrance_exam_score,
            sad.entrance_exam_rank,
            spar.father_name,
            spar.father_phone,
            ay.year_name
        FROM students s
        JOIN admission_categories ac ON s.admission_category_id = ac.id
        JOIN academic_years ay ON s.academic_year_id = ay.id
        LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
        LEFT JOIN departments d ON sda.department_id = d.id
        LEFT JOIN student_personal_details spd ON s.id = spd.student_id
        LEFT JOIN student_academic_details sad ON s.id = sad.student_id
        LEFT JOIN student_parent_details spar ON s.id = spar.student_id
        WHERE s.id = ?
    ");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch();
    
    if (!$student) {
        json_response(false, 'Student not found');
    }
    
    json_response(true, 'Student details fetched successfully', ['student' => $student]);
    
} catch (Exception $e) {
    json_response(false, 'Error fetching student details');
}
?>
