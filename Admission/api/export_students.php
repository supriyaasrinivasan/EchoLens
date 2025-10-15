<?php
require_once '../config/database.php';

// Check authentication
check_counsellor();

$format = $_GET['format'] ?? 'csv';
$status = $_GET['status'] ?? '';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $current_year = get_current_academic_year();
    
    // Build query
    $where_conditions = [];
    $params = [];
    
    if ($current_year) {
        $where_conditions[] = "s.academic_year_id = ?";
        $params[] = $current_year['id'];
    }
    
    if ($status) {
        $where_conditions[] = "s.admission_status = ?";
        $params[] = $status;
    }
    
    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";
    
    // Get student data
    $stmt = $conn->prepare("
        SELECT 
            s.admission_no,
            s.name,
            s.email,
            s.phone,
            s.admission_status,
            s.booking_date,
            spd.date_of_birth,
            spd.gender,
            ac.category_name,
            d.dept_name,
            d.dept_code,
            sec.section_name,
            ay.year_name,
            cs.date_of_joining,
            cs.roll_number
        FROM students s
        JOIN admission_categories ac ON s.admission_category_id = ac.id
        JOIN academic_years ay ON s.academic_year_id = ay.id
        LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
        LEFT JOIN departments d ON sda.department_id = d.id
        LEFT JOIN student_personal_details spd ON s.id = spd.student_id
        LEFT JOIN confirmed_students cs ON s.id = cs.student_id
        LEFT JOIN sections sec ON cs.section_id = sec.id
        $where_clause
        ORDER BY d.dept_name, sec.section_name, s.name
    ");
    $stmt->execute($params);
    $students = $stmt->fetchAll();
    
    if (empty($students)) {
        die('No students found to export');
    }
    
    // Generate filename
    $date = date('Y-m-d');
    $status_text = $status ? "_{$status}" : '';
    $filename = "students_export{$status_text}_{$date}";
    
    switch ($format) {
        case 'csv':
            exportCSV($students, $filename);
            break;
        case 'excel':
            exportExcel($students, $filename);
            break;
        case 'pdf':
            exportPDF($students, $filename);
            break;
        default:
            exportCSV($students, $filename);
    }
    
} catch (Exception $e) {
    error_log("Export error: " . $e->getMessage());
    die('Export failed. Please try again.');
}

function exportCSV($students, $filename) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Headers
    fputcsv($output, [
        'Admission No', 'Name', 'Email', 'Phone', 'Date of Birth', 'Gender',
        'Department', 'Section', 'Category', 'Status', 'Booking Date', 
        'Date of Joining', 'Roll Number', 'Academic Year'
    ]);
    
    // Data
    foreach ($students as $student) {
        fputcsv($output, [
            $student['admission_no'],
            $student['name'],
            $student['email'],
            $student['phone'],
            $student['date_of_birth'] ? date('d/m/Y', strtotime($student['date_of_birth'])) : '',
            $student['gender'] ?? '',
            $student['dept_name'] ?? '',
            $student['section_name'] ?? '',
            $student['category_name'],
            $student['admission_status'],
            date('d/m/Y', strtotime($student['booking_date'])),
            $student['date_of_joining'] ? date('d/m/Y', strtotime($student['date_of_joining'])) : '',
            $student['roll_number'] ?? '',
            $student['year_name']
        ]);
    }
    
    fclose($output);
}

function exportExcel($students, $filename) {
    // For simplicity, we'll create a tab-separated file that Excel can open
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="' . $filename . '.xls"');
    
    echo '<table border="1">';
    echo '<tr>';
    echo '<th>Admission No</th><th>Name</th><th>Email</th><th>Phone</th>';
    echo '<th>Date of Birth</th><th>Gender</th><th>Department</th><th>Section</th>';
    echo '<th>Category</th><th>Status</th><th>Booking Date</th>';
    echo '<th>Date of Joining</th><th>Roll Number</th><th>Academic Year</th>';
    echo '</tr>';
    
    foreach ($students as $student) {
        echo '<tr>';
        echo '<td>' . htmlspecialchars($student['admission_no']) . '</td>';
        echo '<td>' . htmlspecialchars($student['name']) . '</td>';
        echo '<td>' . htmlspecialchars($student['email']) . '</td>';
        echo '<td>' . htmlspecialchars($student['phone']) . '</td>';
        echo '<td>' . ($student['date_of_birth'] ? date('d/m/Y', strtotime($student['date_of_birth'])) : '') . '</td>';
        echo '<td>' . htmlspecialchars($student['gender'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($student['dept_name'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($student['section_name'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($student['category_name']) . '</td>';
        echo '<td>' . htmlspecialchars($student['admission_status']) . '</td>';
        echo '<td>' . date('d/m/Y', strtotime($student['booking_date'])) . '</td>';
        echo '<td>' . ($student['date_of_joining'] ? date('d/m/Y', strtotime($student['date_of_joining'])) : '') . '</td>';
        echo '<td>' . htmlspecialchars($student['roll_number'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($student['year_name']) . '</td>';
        echo '</tr>';
    }
    
    echo '</table>';
}

function exportPDF($students, $filename) {
    // Simple HTML-to-PDF approach
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '.pdf"');
    
    // For a basic implementation, we'll create an HTML page that can be printed to PDF
    echo '<!DOCTYPE html>';
    echo '<html><head>';
    echo '<title>Student Export</title>';
    echo '<style>';
    echo 'body { font-family: Arial, sans-serif; font-size: 12px; }';
    echo 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }';
    echo 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
    echo 'th { background-color: #f2f2f2; font-weight: bold; }';
    echo '.header { text-align: center; margin-bottom: 30px; }';
    echo '@media print { body { margin: 0; } }';
    echo '</style>';
    echo '</head><body>';
    
    echo '<div class="header">';
    echo '<h2>MKCE College of Engineering</h2>';
    echo '<h3>Student Export Report</h3>';
    echo '<p>Generated on: ' . date('d/m/Y H:i:s') . '</p>';
    echo '</div>';
    
    echo '<table>';
    echo '<thead><tr>';
    echo '<th>Admission No</th><th>Name</th><th>Department</th><th>Section</th>';
    echo '<th>Category</th><th>Status</th><th>Phone</th>';
    echo '</tr></thead>';
    echo '<tbody>';
    
    foreach ($students as $student) {
        echo '<tr>';
        echo '<td>' . htmlspecialchars($student['admission_no']) . '</td>';
        echo '<td>' . htmlspecialchars($student['name']) . '</td>';
        echo '<td>' . htmlspecialchars($student['dept_name'] ?? 'N/A') . '</td>';
        echo '<td>' . htmlspecialchars($student['section_name'] ?? 'N/A') . '</td>';
        echo '<td>' . htmlspecialchars($student['category_name']) . '</td>';
        echo '<td>' . htmlspecialchars($student['admission_status']) . '</td>';
        echo '<td>' . htmlspecialchars($student['phone']) . '</td>';
        echo '</tr>';
    }
    
    echo '</tbody></table>';
    echo '</body></html>';
}
?>
