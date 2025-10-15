<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Admission - MKCE College</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Roboto', sans-serif;
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .admission-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 800px;
            overflow: hidden;
        }
        
        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header-section img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 15px;
            border: 3px solid white;
        }
        
        .form-section {
            padding: 40px;
        }
        
        .form-step {
            display: none;
        }
        
        .form-step.active {
            display: block;
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(30px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .progress-bar-container {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .step-indicator {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #6c757d;
            transition: all 0.3s ease;
        }
        
        .step.active {
            background: #667eea;
            color: white;
            transform: scale(1.1);
        }
        
        .step.completed {
            background: #28a745;
            color: white;
        }
        
        .step-line {
            flex: 1;
            height: 2px;
            background: #e9ecef;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        
        .step-line.completed {
            background: #28a745;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            font-weight: 500;
            margin-bottom: 8px;
            color: #333;
        }
        
        .form-control {
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 12px 15px;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-custom {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 12px 30px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        .btn-outline-custom {
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 12px 30px;
            color: #667eea;
            background: transparent;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-outline-custom:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        
        .required {
            color: #dc3545;
        }
        
        .navigation-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }
        
        .back-to-login {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            text-decoration: none;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .back-to-login:hover {
            color: #f8f9fa;
            transform: translateX(-5px);
        }
    </style>
</head>
<body>
    <div class="admission-container">
        <div class="header-section position-relative">
            <a href="index.php" class="back-to-login">
                <i class="fas fa-arrow-left"></i> Back to Login
            </a>
            <img src="image/mkce_logo2.jpg" alt="College Logo">
            <h2>Student Admission Portal</h2>
            <p>MKCE College of Engineering - Karur</p>
        </div>
        
        <div class="form-section">
            <div class="progress-bar-container">
                <div class="step-indicator">
                    <div class="step active" id="step-1">1</div>
                    <div class="step-line" id="line-1"></div>
                    <div class="step" id="step-2">2</div>
                    <div class="step-line" id="line-2"></div>
                    <div class="step" id="step-3">3</div>
                </div>
                <div class="text-center">
                    <small class="text-muted" id="step-description">Basic Information</small>
                </div>
            </div>
            
            <form id="admissionForm" method="POST">
                <!-- Step 1: Basic Information -->
                <div class="form-step active" id="step1">
                    <h4 class="mb-4">Basic Information</h4>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Full Name <span class="required">*</span></label>
                                <input type="text" class="form-control" name="name" id="name" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Email Address <span class="required">*</span></label>
                                <input type="email" class="form-control" name="email" id="email" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Phone Number <span class="required">*</span></label>
                                <input type="tel" class="form-control" name="phone" id="phone" maxlength="10" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Date of Birth <span class="required">*</span></label>
                                <input type="date" class="form-control" name="dob" id="dob" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Gender <span class="required">*</span></label>
                        <select class="form-control" name="gender" id="gender" required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                
                <!-- Step 2: Academic Information -->
                <div class="form-step" id="step2">
                    <h4 class="mb-4">Academic Information</h4>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">12th Percentage <span class="required">*</span></label>
                                <input type="number" class="form-control" name="twelfth_percentage" id="twelfth_percentage" 
                                       min="0" max="100" step="0.01" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">12th Board <span class="required">*</span></label>
                                <select class="form-control" name="twelfth_board" id="twelfth_board" required>
                                    <option value="">Select Board</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="State Board">State Board</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Entrance Exam Score</label>
                                <input type="number" class="form-control" name="entrance_score" id="entrance_score">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Entrance Exam Rank</label>
                                <input type="number" class="form-control" name="entrance_rank" id="entrance_rank">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Preferred Department <span class="required">*</span></label>
                        <select class="form-control" name="preferred_department" id="preferred_department" required>
                            <option value="">Select Department</option>
                        </select>
                    </div>
                </div>
                
                <!-- Step 3: Category & Confirmation -->
                <div class="form-step" id="step3">
                    <h4 class="mb-4">Category & Confirmation</h4>
                    
                    <div class="form-group">
                        <label class="form-label">Admission Category <span class="required">*</span></label>
                        <select class="form-control" name="admission_category" id="admission_category" required>
                            <option value="">Select Category</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Parent/Guardian Name <span class="required">*</span></label>
                        <input type="text" class="form-control" name="parent_name" id="parent_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Parent/Guardian Phone <span class="required">*</span></label>
                        <input type="tel" class="form-control" name="parent_phone" id="parent_phone" maxlength="10" required>
                    </div>
                    
                    <div class="form-group">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="terms_conditions" name="terms_conditions" required>
                            <label class="form-check-label" for="terms_conditions">
                                I agree to the <a href="#" onclick="showTerms()">Terms and Conditions</a> <span class="required">*</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <h6><i class="fas fa-info-circle"></i> Important Note:</h6>
                        <p class="mb-0">After booking your seat, you will receive an admission number. Please keep this safe as you'll need it for the counselling process and final admission confirmation.</p>
                    </div>
                </div>
                
                <div class="navigation-buttons">
                    <button type="button" class="btn btn-outline-custom" id="prevBtn" onclick="previousStep()" style="display: none;">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-custom" id="nextBtn" onclick="nextStep()">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                    <button type="submit" class="btn btn-custom" id="submitBtn" style="display: none;">
                        <i class="fas fa-check"></i> Book Seat
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
    <script>
        let currentStep = 1;
        const totalSteps = 3;
        
        // Load data on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadDepartments();
            loadAdmissionCategories();
        });
        
        // Load departments
        function loadDepartments() {
            fetch('api/get_departments.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const select = document.getElementById('preferred_department');
                        data.departments.forEach(dept => {
                            const option = document.createElement('option');
                            option.value = dept.id;
                            option.textContent = `${dept.dept_name} (${dept.dept_code})`;
                            select.appendChild(option);
                        });
                    }
                })
                .catch(error => console.error('Error loading departments:', error));
        }
        
        // Load admission categories
        function loadAdmissionCategories() {
            fetch('api/get_admission_categories.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const select = document.getElementById('admission_category');
                        data.categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category.id;
                            option.textContent = `${category.category_name} (${category.category_code})`;
                            select.appendChild(option);
                        });
                    }
                })
                .catch(error => console.error('Error loading categories:', error));
        }
        
        // Navigation functions
        function nextStep() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        }
        
        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        }
        
        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.form-step').forEach(el => {
                el.classList.remove('active');
            });
            
            // Show current step
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update progress indicators
            updateProgressIndicators(step);
            
            // Update buttons
            updateButtons(step);
            
            // Update step description
            updateStepDescription(step);
        }
        
        function updateProgressIndicators(step) {
            for (let i = 1; i <= totalSteps; i++) {
                const stepEl = document.getElementById(`step-${i}`);
                const lineEl = document.getElementById(`line-${i}`);
                
                if (i < step) {
                    stepEl.classList.add('completed');
                    stepEl.classList.remove('active');
                    if (lineEl) lineEl.classList.add('completed');
                } else if (i === step) {
                    stepEl.classList.add('active');
                    stepEl.classList.remove('completed');
                } else {
                    stepEl.classList.remove('active', 'completed');
                    if (lineEl) lineEl.classList.remove('completed');
                }
            }
        }
        
        function updateButtons(step) {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');
            
            prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
            nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
            submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
        }
        
        function updateStepDescription(step) {
            const descriptions = {
                1: 'Basic Information',
                2: 'Academic Information',
                3: 'Category & Confirmation'
            };
            document.getElementById('step-description').textContent = descriptions[step];
        }
        
        function validateStep(step) {
            const stepEl = document.getElementById(`step${step}`);
            const requiredFields = stepEl.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                    
                    // Additional validations
                    if (field.type === 'email' && !validateEmail(field.value)) {
                        field.classList.add('is-invalid');
                        isValid = false;
                    }
                    
                    if (field.name === 'phone' && !validatePhone(field.value)) {
                        field.classList.add('is-invalid');
                        isValid = false;
                    }
                }
            });
            
            if (!isValid) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Incomplete Information',
                    text: 'Please fill in all required fields correctly.',
                    showConfirmButton: true
                });
            }
            
            return isValid;
        }
        
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function validatePhone(phone) {
            const re = /^[0-9]{10}$/;
            return re.test(phone);
        }
        
        // Form submission
        document.getElementById('admissionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateStep(3)) {
                return;
            }
            
            const formData = new FormData(this);
            
            // Show loading
            Swal.fire({
                title: 'Processing Application...',
                text: 'Please wait while we book your seat.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            fetch('api/book_seat.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Seat Booked Successfully!',
                        html: `
                            <div class="text-center">
                                <h5>Your Admission Number: <strong>${data.admission_no}</strong></h5>
                                <p>Please save this admission number for future reference.</p>
                                <p>You will receive a confirmation email shortly.</p>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Print Details',
                        cancelButtonText: 'Continue',
                        confirmButtonColor: '#667eea'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            printAdmissionDetails(data);
                        } else {
                            window.location.href = 'index.php';
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Booking Failed',
                        text: data.message || 'An error occurred while booking your seat.',
                        showConfirmButton: true
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Please check your internet connection and try again.',
                    showConfirmButton: true
                });
            });
        });
        
        function printAdmissionDetails(data) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Admission Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .details { margin: 20px 0; }
                        .admission-no { font-size: 18px; font-weight: bold; color: #007bff; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>MKCE College of Engineering</h2>
                        <h3>Admission Receipt</h3>
                    </div>
                    <div class="details">
                        <p><strong>Admission Number:</strong> <span class="admission-no">${data.admission_no}</span></p>
                        <p><strong>Name:</strong> ${data.student_name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone}</p>
                        <p><strong>Booking Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Status:</strong> BOOKED</p>
                    </div>
                    <div style="margin-top: 40px;">
                        <p><small>Note: Please keep this receipt safe. You will need your admission number for the counselling process.</small></p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
        
        function showTerms() {
            Swal.fire({
                title: 'Terms and Conditions',
                html: `
                    <div style="text-align: left; height: 300px; overflow-y: auto;">
                        <h6>1. Admission Process</h6>
                        <p>By booking a seat, you agree to complete the admission process within the specified timeframe.</p>
                        
                        <h6>2. Document Verification</h6>
                        <p>All documents submitted must be original and verified during the counselling process.</p>
                        
                        <h6>3. Fee Structure</h6>
                        <p>Admission fees must be paid as per the college fee structure during confirmation.</p>
                        
                        <h6>4. Cancellation Policy</h6>
                        <p>Seat bookings can be cancelled before the confirmation deadline.</p>
                        
                        <h6>5. Academic Requirements</h6>
                        <p>Students must meet the minimum academic requirements for their chosen course.</p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'I Accept',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#667eea'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('terms_conditions').checked = true;
                }
            });
        }
        
        // Add real-time validation
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('is-invalid')) {
                e.target.classList.remove('is-invalid');
            }
        });
    </script>
</body>
</html>
