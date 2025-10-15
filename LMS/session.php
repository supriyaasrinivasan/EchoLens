<?php
// Enhanced session security configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Strict');

session_start();

// Regenerate session ID periodically for security
if (!isset($_SESSION['last_regeneration'])) {
    $_SESSION['last_regeneration'] = time();
} elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
    session_regenerate_id(true);
    $_SESSION['last_regeneration'] = time();
}

require_once 'db.php';

function initializeUserSession()
{
    global $conn;

    if (!isset($_SESSION['loggedin'])) {
        header('Location: index.php');
        exit();
    }

    $s = $_SESSION['login_user'];
    $user_type = $_SESSION['user_type'];

    if ($user_type === 'student') {
        $query = "SELECT sid as id, sname as name, dept, ayear as year FROM student WHERE sid = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $s);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $_SESSION['user'] = [
                'id' => $user['id'],
                'name' => $user['name'],
                'dept' => $user['dept'],
                'year' => getAcademicYear( $user['year']),
                'role' => 'student'
            ];
        }
    } else {
        $query = "SELECT id, name, dept,uid, role FROM faculty WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $s);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $_SESSION['user'] = [
                'id' => $user['id'],
                'name' => $user['name'],
                'dept' => $user['dept'],
                'role' => $user['role'],
                'uid' => $user['uid']
            ];
        }
    }
}
function getAcademicYear($courseYear)
{
    $currentDate = new DateTime();
    $currentYear = $currentDate->format('Y');
    $currentMonth = $currentDate->format('m');

    list($startYear, $endYear) = explode('-', $courseYear);

    $academicYear = $currentYear - $startYear + 1;

    if ($currentMonth < 6) {
        $academicYear--;
    }

    if ($academicYear > ($endYear - $startYear)) {
        return $endYear - $startYear;
    }
     
    return $academicYear;
}

function checkUserAccess()
{
    // Check if user is logged in
    if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
        header('Location: index.php');
        exit();
    }

    // Enhanced session timeout (1 hour = 3600 seconds)
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] > 3600)) {
        // Session has expired
        session_unset();
        session_destroy();
        header('Location: index.php?timeout=1');
        exit();
    }

    // Security: Check for session hijacking by validating user agent
    if (isset($_SESSION['user_agent'])) {
        if ($_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
            session_unset();
            session_destroy();
            header('Location: index.php?security=1');
            exit();
        }
    } else {
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    }

    // Security: Check for session fixation by validating IP address (optional, can be disabled for dynamic IPs)
    if (isset($_SESSION['user_ip'])) {
        if ($_SESSION['user_ip'] !== $_SERVER['REMOTE_ADDR']) {
            // Log security event
            error_log("Potential session hijacking detected: IP mismatch for user " . ($_SESSION['login_user'] ?? 'unknown'));
            session_unset();
            session_destroy();
            header('Location: index.php?security=1');
            exit();
        }
    } else {
        $_SESSION['user_ip'] = $_SERVER['REMOTE_ADDR'];
    }

    // Initialize user session data if not already set
    if (!isset($_SESSION['user'])) {
        initializeUserSession();
    }

    // Get current page and user info
    $current_page = basename($_SERVER['PHP_SELF']);
    $user_type = $_SESSION['user_type'];
    $user_role = $_SESSION['user']['role'] ?? '';

    // Define allowed pages for each role
    $allowed_pages = [
        'student' => ['student.php', 'studentDashboard.php'],
        'faculty' => [
            'HOD' => ['hod.php', 'hodDashboard.php'],
            'staff' => ['staff.php', 'staffDashboard.php']
        ]
    ];

    // Check access rights and redirect to appropriate dashboard
    if ($user_type === 'student') {
        if (!in_array($current_page, $allowed_pages['student'])) {
            header('Location: studentDashboard.php');
            exit();
        }
    } elseif ($user_type === 'faculty') {
        if ($user_role === 'HOD') {
            if (!in_array($current_page, $allowed_pages['faculty']['HOD'])) {
                header('Location: hodDashboard.php');
                exit();
            }
        } else {
            if (!in_array($current_page, $allowed_pages['faculty']['staff'])) {
                header('Location: staffDashboard.php');
                exit();
            }
        }
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();

    // Optional: Verify sessionStorage data exists (client-side check)
    echo "<script>
        if (!sessionStorage.getItem('userData')) {
            console.warn('Session data missing in browser storage');
            // Optionally redirect or show warning
        }
    </script>";
}
