<?php
require_once 'session.php';
checkUserAccess();

// Get user type and role from session
$userType = $_SESSION['user_type'] ?? '';
$userRole = isset($_SESSION['user']['role']) ? $_SESSION['user']['role'] : '';

// Redirect based on user type and role
if ($userType === 'student') {
    include 'studentDashboard.php';
} elseif ($userType === 'faculty') {
    if ($userRole === 'HOD') {
        include 'hodDashboard.php';
    } else {
        include 'staffDashboard.php';
    }
} else {
    // Handle invalid user type/role
    session_destroy();
    header('Location: index.php?error=invalid_access');
    exit();
}
?>
