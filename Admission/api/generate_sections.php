<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Check authentication (admin only)
check_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $current_year = get_current_academic_year();
    if (!$current_year) {
        json_response(false, 'No active academic year found');
    }
    
    // Start transaction
    $conn->beginTransaction();
    
    try {
        // Get all confirmed students grouped by department
        $stmt = $conn->prepare("
            SELECT 
                cs.*,
                d.dept_name,
                d.dept_code
            FROM confirmed_students cs
            JOIN departments d ON cs.department_id = d.id
            WHERE cs.academic_year_id = ? AND cs.section_id IS NULL
            ORDER BY d.dept_name, cs.name
        ");
        $stmt->execute([$current_year['id']]);
        $confirmed_students = $stmt->fetchAll();
        
        if (empty($confirmed_students)) {
            json_response(false, 'No confirmed students found for section allocation');
        }
        
        // Group students by department
        $students_by_dept = [];
        foreach ($confirmed_students as $student) {
            $dept_id = $student['department_id'];
            if (!isset($students_by_dept[$dept_id])) {
                $students_by_dept[$dept_id] = [
                    'dept_name' => $student['dept_name'],
                    'dept_code' => $student['dept_code'],
                    'students' => []
                ];
            }
            $students_by_dept[$dept_id]['students'][] = $student;
        }
        
        $sections_created = 0;
        $students_allocated = 0;
        $max_section_capacity = 60; // From system settings
        
        foreach ($students_by_dept as $dept_id => $dept_data) {
            $students = $dept_data['students'];
            $total_students = count($students);
            
            if ($total_students == 0) continue;
            
            // Calculate number of sections needed
            $sections_needed = ceil($total_students / $max_section_capacity);
            
            // If there's a remainder, distribute students more evenly
            $students_per_section = floor($total_students / $sections_needed);
            $extra_students = $total_students % $sections_needed;
            
            $section_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            $student_index = 0;
            
            for ($section_num = 0; $section_num < $sections_needed; $section_num++) {
                $section_name = $section_letters[$section_num];
                
                // Calculate capacity for this section (distribute extra students)
                $section_capacity = $students_per_section;
                if ($section_num < $extra_students) {
                    $section_capacity += 1;
                }
                
                // Create section
                $stmt = $conn->prepare("
                    INSERT INTO sections (section_name, department_id, academic_year_id, max_capacity)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([$section_name, $dept_id, $current_year['id'], $section_capacity]);
                $section_id = $conn->lastInsertId();
                
                // Allocate students to this section
                for ($i = 0; $i < $section_capacity && $student_index < $total_students; $i++) {
                    $student = $students[$student_index];
                    
                    // Update confirmed_students table
                    $stmt = $conn->prepare("
                        UPDATE confirmed_students 
                        SET section_id = ? 
                        WHERE id = ?
                    ");
                    $stmt->execute([$section_id, $student['id']]);
                    
                    $student_index++;
                    $students_allocated++;
                }
                
                // Update section current strength
                $stmt = $conn->prepare("
                    UPDATE sections 
                    SET current_strength = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$section_capacity, $section_id]);
                
                $sections_created++;
            }
        }
        
        // Log activity
        log_activity($_SESSION['user_id'], 'GENERATE_SECTIONS', 
                     "Generated {$sections_created} sections for {$students_allocated} students");
        
        $conn->commit();
        
        json_response(true, "Successfully generated {$sections_created} sections and allocated {$students_allocated} students");
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Section generation error: " . $e->getMessage());
    json_response(false, 'Failed to generate sections: ' . $e->getMessage());
}
?>
