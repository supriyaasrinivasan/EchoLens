<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT id, dept_code, dept_name, intake_capacity 
                           FROM departments 
                           WHERE is_active = 1 
                           ORDER BY dept_name");
    $stmt->execute();
    $departments = $stmt->fetchAll();
    
    json_response(true, 'Departments fetched successfully', ['departments' => $departments]);
    
} catch (Exception $e) {
    json_response(false, 'Error fetching departments');
}
?>
