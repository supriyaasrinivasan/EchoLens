<?php
session_start();

// Clear all session data
$_SESSION = array();

// Destroy the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Clear sessionStorage and redirect with success message
echo "<script>
    // Clear browser storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Show logout confirmation
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have been successfully logged out.',
            timer: 2000,
            showConfirmButton: false
        }).then(function() {
            window.location.href = 'index.php';
        });
    } else {
        alert('You have been logged out successfully.');
        window.location.href = 'index.php';
    }
</script>";
?>