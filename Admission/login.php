<?php
require_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = sanitize_input($_POST['username']);
    $password = $_POST['password'];
    
    if (empty($username) || empty($password)) {
        header('Location: index.php?error=empty_fields');
        exit();
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    try {
        $stmt = $conn->prepare("SELECT id, username, email, password_hash, role, full_name, phone, is_active 
                               FROM users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            // Update last login
            $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['phone'] = $user['phone'];
            $_SESSION['login_time'] = time();
            
            // Generate CSRF token
            generate_csrf_token();
            
            // Log login activity
            log_activity($user['id'], 'LOGIN', 'User logged in successfully');
            
            // Redirect based on role
            switch ($user['role']) {
                case 'admin':
                    header('Location: admin/dashboard.php');
                    break;
                case 'counsellor':
                    header('Location: counsellor/dashboard.php');
                    break;
                default:
                    header('Location: student/dashboard.php');
                    break;
            }
            exit();
        } else {
            header('Location: index.php?error=invalid_credentials');
            exit();
        }
    } catch (Exception $e) {
        handle_error("Login error: " . $e->getMessage());
    }
} else {
    header('Location: index.php');
    exit();
}
?>