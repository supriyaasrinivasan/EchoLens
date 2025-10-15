<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

// Check authentication (admin or counsellor)
check_counsellor();

try {
    $student_id = $_POST['student_id'] ?? '';
    $status = $_POST['status'] ?? '';
    
    if (empty($student_id) || empty($status)) {
        json_response(false, 'Student ID and status are required');
    }
    
    if (!in_array($status, ['BOOKED', 'CONFIRMED', 'CANCELLED'])) {
        json_response(false, 'Invalid status');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Start transaction
    $conn->beginTransaction();
    
    try {
        // Update student status
        $stmt = $conn->prepare("UPDATE students SET admission_status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $student_id]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Student not found or no changes made');
        }
        
        // If confirming admission, create confirmed student record
        if ($status === 'CONFIRMED') {
            // Check if already confirmed
            $checkStmt = $conn->prepare("SELECT id FROM confirmed_students WHERE student_id = ?");
            $checkStmt->execute([$student_id]);
            
            if (!$checkStmt->fetch()) {
                // Get student details
                $studentStmt = $conn->prepare("
                    SELECT 
                        s.*,
                        spd.date_of_birth,
                        sda.department_id
                    FROM students s
                    LEFT JOIN student_personal_details spd ON s.id = spd.student_id
                    LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
                    WHERE s.id = ?
                ");
                $studentStmt->execute([$student_id]);
                $student = $studentStmt->fetch();
                
                if ($student && $student['department_id']) {
                    // Insert into confirmed students
                    $confirmStmt = $conn->prepare("
                        INSERT INTO confirmed_students 
                        (student_id, admission_no, name, email, phone, date_of_birth, 
                         department_id, admission_category_id, academic_year_id, date_of_joining)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
                    ");
                    $confirmStmt->execute([
                        $student['id'],
                        $student['admission_no'],
                        $student['name'],
                        $student['email'],
                        $student['phone'],
                        $student['date_of_birth'],
                        $student['department_id'],
                        $student['admission_category_id'],
                        $student['academic_year_id']
                    ]);
                }
            }
        }
        
        // Log activity
        log_activity($_SESSION['user_id'], 'UPDATE_STUDENT_STATUS', 
                     "Changed student ID {$student_id} status to {$status}");
        
        $conn->commit();
        
        $message = match($status) {
            'CONFIRMED' => 'Student admission confirmed successfully',
            'CANCELLED' => 'Student admission cancelled successfully',
            'BOOKED' => 'Student status updated to booked',
            default => 'Student status updated successfully'
        };
        
        json_response(true, $message);
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Update student status error: " . $e->getMessage());
    json_response(false, 'Failed to update student status');
}
?>
