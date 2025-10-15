<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT id, category_name, category_code 
                           FROM admission_categories 
                           WHERE is_active = 1 
                           ORDER BY category_name");
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    json_response(true, 'Categories fetched successfully', ['categories' => $categories]);
    
} catch (Exception $e) {
    json_response(false, 'Error fetching categories');
}
?>
