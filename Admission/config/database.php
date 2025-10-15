<?php
/**
 * Database Configuration
 * College Admission & Seat Management Portal
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'admission';
    private $username = 'root';
    private $password = '';
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            die("Database connection failed. Please try again later.");
        }
        
        return $this->conn;
    }
    
    public function closeConnection() {
        $this->conn = null;
    }
}

// Session configuration
if (session_status() == PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
    ini_set('session.use_only_cookies', 1);
    session_start();
}

// Security functions
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    return preg_match("/^[0-9]{10}$/", $phone);
}

function generate_admission_no($category_code, $year) {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get next sequence number for this category and year
    $stmt = $conn->prepare("SELECT COUNT(*) + 1 as next_seq FROM students s 
                           JOIN admission_categories ac ON s.admission_category_id = ac.id 
                           JOIN academic_years ay ON s.academic_year_id = ay.id 
                           WHERE ac.category_code = ? AND ay.year_name = ?");
    $stmt->execute([$category_code, $year]);
    $result = $stmt->fetch();
    
    $seq = str_pad($result['next_seq'], 4, '0', STR_PAD_LEFT);
    $year_short = substr($year, 2, 2);
    
    return $category_code . $year_short . $seq;
}

function check_login() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
        header('Location: index.php');
        exit();
    }
}

function check_admin() {
    check_login();
    if ($_SESSION['role'] !== 'admin') {
        header('Location: dashboard.php');
        exit();
    }
}

function check_counsellor() {
    check_login();
    if ($_SESSION['role'] !== 'counsellor' && $_SESSION['role'] !== 'admin') {
        header('Location: dashboard.php');
        exit();
    }
}

// CSRF Protection
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Get current academic year
function get_current_academic_year() {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT * FROM academic_years WHERE is_active = 1 LIMIT 1");
    $stmt->execute();
    return $stmt->fetch();
}

// Log activity
function log_activity($user_id, $action, $details = '') {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, ip_address, created_at) 
                           VALUES (?, ?, ?, ?, NOW())");
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $stmt->execute([$user_id, $action, $details, $ip]);
}

// Response helper
function json_response($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Error handler
function handle_error($message, $code = 500) {
    error_log($message);
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        json_response(false, 'An error occurred. Please try again.');
    } else {
        die('An error occurred. Please try again.');
    }
}

// Set timezone
date_default_timezone_set('Asia/Kolkata');
?>
