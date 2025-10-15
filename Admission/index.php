<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - College Admission Portal</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Roboto', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('image/pattern_h.png') repeat;
            opacity: 0.1;
            z-index: 0;
        }
        
        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            position: relative;
            z-index: 1;
            animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .college-logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .college-logo img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .college-name {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin-bottom: 5px;
        }
        
        .college-subtitle {
            font-size: 14px;
            color: #666;
            font-weight: 300;
        }
        
        .login-title {
            text-align: center;
            font-size: 28px;
            font-weight: 500;
            color: #333;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 25px;
            position: relative;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
            font-size: 14px;
        }
        
        .form-group input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fff;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }
        
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:active {
            transform: translateY(0);
        }
        
        .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .login-btn:hover::before {
            left: 100%;
        }
        
        .forgot-password {
            text-align: center;
            margin-top: 20px;
        }
        
        .forgot-password a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }
        
        .forgot-password a:hover {
            color: #764ba2;
        }
        
        .student-admission {
            text-align: center;
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #e1e5e9;
        }
        
        .student-admission p {
            margin-bottom: 15px;
            color: #666;
            font-size: 14px;
        }
        
        .admission-btn {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .admission-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
        }
        
        .loading {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            margin: auto;
            border: 2px solid transparent;
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .demo-credentials {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid #17a2b8;
        }
        
        .demo-credentials h4 {
            color: #17a2b8;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .demo-credentials p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="college-logo">
            <img src="image/mkce_logo2.jpg" alt="College Logo">
            <div class="college-name">MKCE</div>
            <div class="college-subtitle">College of Engineering</div>
        </div>
        
        <h2 class="login-title">Portal Login</h2>
        
        <div class="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Counsellor:</strong> counsellor1 / admin123</p>
        </div>
        
        <form id="loginForm" method="POST" action="login.php">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-btn" id="loginBtn">
                Login to Portal
            </button>
        </form>
        
        <div class="forgot-password">
            <a href="#" onclick="forgotPassword()">Forgot Password?</a>
        </div>
        
        <div class="student-admission">
            <p>New student looking for admission?</p>
            <a href="student_admission.php" class="admission-btn">Apply for Admission</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
    <script>
        // Check for error messages
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
            let errorMessage = '';
            switch (error) {
                case 'invalid_credentials':
                    errorMessage = 'Invalid username or password!';
                    break;
                case 'empty_fields':
                    errorMessage = 'Please fill in all fields!';
                    break;
                case 'session_expired':
                    errorMessage = 'Your session has expired. Please login again.';
                    break;
                case 'access_denied':
                    errorMessage = 'Access denied. Insufficient privileges.';
                    break;
                default:
                    errorMessage = 'An error occurred. Please try again.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
                showConfirmButton: true,
                timer: 5000,
                timerProgressBar: true
            });
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Handle form submission
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'Please enter both username and password.',
                    showConfirmButton: true
                });
                return;
            }
            
            // Show loading state
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.classList.add('loading');
            loginBtn.textContent = 'Logging in...';
        });
        
        // Forgot password function
        function forgotPassword() {
            Swal.fire({
                title: 'Forgot Password?',
                text: 'Please contact the system administrator to reset your password.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Contact Admin',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#667eea'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Contact Information',
                        html: `
                            <p><strong>Email:</strong> admin@college.edu</p>
                            <p><strong>Phone:</strong> +91 9876543210</p>
                            <p><strong>Office Hours:</strong> 9:00 AM - 5:00 PM</p>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Got it',
                        confirmButtonColor: '#667eea'
                    });
                }
            });
        }
        
        // Auto-focus on username field
        document.getElementById('username').focus();
        
        // Add enter key support
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        });
    </script>
</body>
</html>
