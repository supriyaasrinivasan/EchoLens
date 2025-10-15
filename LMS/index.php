<?php
require_once 'db.php';
session_start();

// Redirect to dashboard if already logged in
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('Location: dashboard.php');
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input
    $type = mysqli_real_escape_string($conn, $_POST['type']);
    $myusername = mysqli_real_escape_string($conn, $_POST['uid']);
    $mypassword = mysqli_real_escape_string($conn, $_POST['pass']);

    if ($type == "faculty") {
        $sql = "SELECT * FROM faculty WHERE id = ? AND pass = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $myusername, $mypassword);
    } elseif ($type == "student") {
        $sql = "SELECT * FROM student WHERE sid = ? AND pass = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $myusername, $mypassword);
    } else {
        echo "<script>
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failure',
                    text: 'Invalid user type'
                }).then(function() {
                    window.location = './index.php';
                });
              </script>";
        exit;
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        
        // Set session variables with enhanced security
        $_SESSION['loggedin'] = true;
        $_SESSION['login_user'] = $myusername;
        $_SESSION['user_type'] = $type;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
        $_SESSION['user_ip'] = $_SERVER['REMOTE_ADDR'];

        if ($type == "student") {
            $userData = [
                'id' => $user['sid'],
                'name' => $user['sname'],
                'dept' => $user['dept'],
                'year' => $user['ayear'],
                'role' => 'student'
            ];
        } else {
            $userData = [
                'id' => $user['id'],
                'name' => $user['name'],
                'dept' => $user['dept'],
                'role' => $user['role'],
                'uid' => $user['uid']
            ];
        }

        // Log successful login
        error_log("Successful login: User " . $myusername . " (" . $type . ") from IP " . $_SERVER['REMOTE_ADDR']);

        echo "<script>
                sessionStorage.setItem('userData', JSON.stringify(" . json_encode($userData) . "));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Login Successful'
                }).then(function() {
                    window.location = 'dashboard.php';
                });
              </script>";
    } else {
        // Log failed login attempt
        error_log("Failed login attempt: User " . $myusername . " (" . $type . ") from IP " . $_SERVER['REMOTE_ADDR']);
        
        echo "<script>
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failure',
                    text: 'Invalid credentials. Please try again.'
                }).then(function() {
                    window.location = './index.php';
                });
              </script>";
    }

    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Syraa Lambda - Advanced Learning Management System</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="global.css">
    <style>
        /* Modern Login Page Styles */
        .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            position: relative;
            overflow: hidden;
        }

        .login-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="%23ffffff" fill-opacity="0.05" points="0,0 1000,300 1000,1000 0,700"/><polygon fill="%23ffffff" fill-opacity="0.03" points="0,300 1000,0 1000,400 0,700"/></svg>') no-repeat center center;
            background-size: cover;
        }

        .floating-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 20s infinite linear;
        }

        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 120px;
            height: 120px;
            left: 80%;
            animation-delay: 5s;
        }

        .shape:nth-child(3) {
            width: 60px;
            height: 60px;
            left: 50%;
            animation-delay: 10s;
        }

        .shape:nth-child(4) {
            width: 100px;
            height: 100px;
            left: 70%;
            animation-delay: 15s;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }

        .main-content {
            position: relative;
            z-index: 10;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 2rem;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            max-width: 1000px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 600px;
        }

        .brand-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .brand-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></svg>') repeat;
            background-size: 50px 50px;
            animation: movePattern 20s linear infinite;
        }

        @keyframes movePattern {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
        }

        .logo-container {
            position: relative;
            z-index: 2;
            text-align: center;
        }

        .brand-logo {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ffffff, #f0f4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .brand-tagline {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2rem;
            font-weight: 300;
        }

        .feature-list {
            list-style: none;
            padding: 0;
        }

        .feature-list li {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            font-size: 1rem;
            opacity: 0.8;
        }

        .feature-list li i {
            width: 20px;
            margin-right: 1rem;
            color: #4facfe;
        }

        .form-section {
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .form-header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .form-title {
            color: var(--gray-800);
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .form-subtitle {
            color: var(--gray-600);
            font-size: 1rem;
        }

        .user-type-selector {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            background: var(--gray-100);
            padding: 0.5rem;
            border-radius: 1rem;
        }

        .type-btn {
            flex: 1;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.75rem;
            background: transparent;
            color: var(--gray-600);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-fast);
            position: relative;
        }

        .type-btn.active {
            background: white;
            color: var(--primary-600);
            box-shadow: var(--shadow-sm);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--gray-700);
            font-weight: 500;
        }

        .input-wrapper {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray-400);
            z-index: 2;
        }

        .form-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            border: 2px solid var(--gray-200);
            border-radius: var(--radius-lg);
            font-size: 1rem;
            transition: var(--transition-fast);
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary-500);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .login-btn {
            width: 100%;
            padding: 1rem;
            border: none;
            border-radius: var(--radius-lg);
            background: var(--primary-gradient);
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-fast);
            margin-top: 1rem;
            position: relative;
            overflow: hidden;
        }

        .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: var(--transition-normal);
        }

        .login-btn:hover::before {
            left: 100%;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .footer-text {
            text-align: center;
            margin-top: 2rem;
            color: var(--gray-500);
            font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .login-card {
                grid-template-columns: 1fr;
                max-width: 400px;
            }

            .brand-section {
                padding: 2rem;
                min-height: 200px;
            }

            .brand-logo {
                font-size: 2.5rem;
            }

            .form-section {
                padding: 2rem;
            }

            .feature-list {
                display: none;
            }
        }

        /* Loading Animation */
        .loading {
            display: none;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .login-btn.loading .loading {
            display: inline-block;
        }

        .login-btn.loading .btn-text {
            display: none;
        }
    </style>
</head>

<body>
    <div class="login-container">
        <div class="floating-shapes">
            <div class="shape"></div>
            <div class="shape"></div>
            <div class="shape"></div>
            <div class="shape"></div>
        </div>

        <div class="main-content">
            <div class="login-card">
                <div class="brand-section">
                    <div class="logo-container">
                        <div class="brand-logo">
                            <i class="fas fa-layer-group"></i>
                            Syraa Lambda
                        </div>
                        <p class="brand-tagline">Advanced Learning Management System</p>
                        <ul class="feature-list">
                            <li><i class="fas fa-graduation-cap"></i> Smart Learning Analytics</li>
                            <li><i class="fas fa-users"></i> Collaborative Workspace</li>
                            <li><i class="fas fa-chart-line"></i> Progress Tracking</li>
                            <li><i class="fas fa-mobile-alt"></i> Mobile-First Design</li>
                            <li><i class="fas fa-shield-alt"></i> Enterprise Security</li>
                        </ul>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-header">
                        <h2 class="form-title">Welcome Back</h2>
                        <p class="form-subtitle">Sign in to your account to continue</p>
                    </div>

                    <div class="user-type-selector">
                        <button type="button" class="type-btn active" data-type="student">
                            <i class="fas fa-user-graduate"></i> Student
                        </button>
                        <button type="button" class="type-btn" data-type="faculty">
                            <i class="fas fa-chalkboard-teacher"></i> Faculty
                        </button>
                    </div>

                    <form action="#" method="post" id="loginForm">
                        <input type="hidden" id="userType" name="type" value="student">
                        
                        <div class="form-group">
                            <label for="userId">User ID</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" id="userId" name="uid" class="form-input" placeholder="Enter your ID" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" id="password" name="pass" class="form-input" placeholder="Enter your password" required>
                            </div>
                        </div>

                        <button type="submit" class="login-btn" id="loginBtn">
                            <span class="btn-text">Sign In</span>
                            <div class="loading"></div>
                        </button>
                    </form>

                    <div class="footer-text">
                        Copyright © 2024 Syraa Lambda. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        // User type selector
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('userType').value = this.dataset.type;
                
                // Update placeholder text
                const userIdInput = document.getElementById('userId');
                const isStudent = this.dataset.type === 'student';
                userIdInput.placeholder = isStudent ? 'Enter your Student ID' : 'Enter your Faculty ID';
                document.querySelector('label[for="userId"]').textContent = isStudent ? 'Student ID' : 'Faculty ID';
            });
        });

        // Form submission with loading animation
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.classList.add('loading');
            
            // Optional: Add a small delay to show the loading animation
            setTimeout(() => {
                // The form will submit normally after this
            }, 500);
        });

        // Add floating animation to shapes
        document.addEventListener('DOMContentLoaded', function() {
            const shapes = document.querySelectorAll('.shape');
            shapes.forEach((shape, index) => {
                shape.style.animationDelay = `${index * 5}s`;
            });
        });

        // Add subtle parallax effect
        document.addEventListener('mousemove', function(e) {
            const shapes = document.querySelectorAll('.shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                shape.style.transform += ` translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    </script>
</body>

</html>
                    value: '#1e4d92'
                },
                opacity: {
                    value: 0.3,
                    random: false
                },
                size: {
                    value: 2,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#1e4d92',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out'
                }
            }
        });
    </script>
</body>

</html>