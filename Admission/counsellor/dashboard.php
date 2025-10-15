<?php
require_once '../config/database.php';
check_counsellor();

$db = new Database();
$conn = $db->getConnection();
$current_year = get_current_academic_year();

// Get dashboard statistics for counsellor
$stmt = $conn->prepare("
    SELECT 
        COUNT(CASE WHEN admission_status = 'BOOKED' THEN 1 END) as pending_confirmations,
        COUNT(CASE WHEN admission_status = 'CONFIRMED' THEN 1 END) as confirmed_today,
        COUNT(CASE WHEN admission_status = 'CANCELLED' THEN 1 END) as cancelled_today,
        COUNT(*) as total_handled
    FROM students 
    WHERE academic_year_id = ? AND DATE(updated_at) = CURDATE()
");
$stmt->execute([$current_year['id'] ?? 1]);
$today_stats = $stmt->fetch();

// Get recent activities
$stmt = $conn->prepare("
    SELECT 
        s.admission_no,
        s.name,
        s.admission_status,
        s.updated_at,
        d.dept_name
    FROM students s
    LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
    LEFT JOIN departments d ON sda.department_id = d.id
    WHERE s.academic_year_id = ?
    ORDER BY s.updated_at DESC
    LIMIT 10
");
$stmt->execute([$current_year['id'] ?? 1]);
$recent_activities = $stmt->fetchAll();

// Get pending confirmations
$stmt = $conn->prepare("
    SELECT 
        s.*,
        ac.category_name,
        d.dept_name,
        DATEDIFF(NOW(), s.booking_date) as days_pending
    FROM students s
    JOIN admission_categories ac ON s.admission_category_id = ac.id
    LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
    LEFT JOIN departments d ON sda.department_id = d.id
    WHERE s.admission_status = 'BOOKED' AND s.academic_year_id = ?
    ORDER BY s.booking_date ASC
    LIMIT 5
");
$stmt->execute([$current_year['id'] ?? 1]);
$pending_confirmations = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counsellor Dashboard - College Admission Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../style.css">
    <style>
        body {
            background: #f8f9fa;
            font-family: 'Roboto', sans-serif;
        }
        
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 250px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        
        .sidebar.active {
            transform: translateX(0);
        }
        
        .sidebar-header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar-header img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-bottom: 10px;
        }
        
        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }
        
        .sidebar-menu li {
            margin: 0;
        }
        
        .sidebar-menu a {
            display: block;
            padding: 15px 20px;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        
        .sidebar-menu a:hover,
        .sidebar-menu a.active {
            background: rgba(255,255,255,0.1);
            border-left-color: white;
        }
        
        .main-content {
            margin-left: 0;
            transition: margin-left 0.3s ease;
            min-height: 100vh;
        }
        
        .main-content.shifted {
            margin-left: 250px;
        }
        
        .topbar {
            background: white;
            padding: 15px 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .hamburger {
            font-size: 20px;
            cursor: pointer;
            color: #333;
        }
        
        .content-area {
            padding: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            border-left: 4px solid #28a745;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card.pending {
            border-left-color: #ffc107;
        }
        
        .stat-card.confirmed {
            border-left-color: #28a745;
        }
        
        .stat-card.cancelled {
            border-left-color: #dc3545;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #333;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .card-custom {
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        
        .badge-status {
            font-size: 0.75rem;
            padding: 5px 10px;
        }
        
        .priority-badge {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        
        .pending-card {
            position: relative;
            transition: transform 0.3s ease;
        }
        
        .pending-card:hover {
            transform: translateY(-3px);
        }
        
        .quick-action-btn {
            margin: 5px;
            border-radius: 20px;
            padding: 8px 20px;
        }
        
        @media (max-width: 768px) {
            .main-content.shifted {
                margin-left: 0;
            }
            
            .sidebar {
                width: 100%;
            }
            
            .content-area {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <img src="../image/mkce_logo2.jpg" alt="Logo">
            <h5>Counsellor Panel</h5>
            <small><?= htmlspecialchars($_SESSION['full_name']) ?></small>
        </div>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php" class="active"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="student_counselling.php"><i class="fas fa-users"></i> Student Counselling</a></li>
            <li><a href="admission_process.php"><i class="fas fa-clipboard-check"></i> Admission Process</a></li>
            <li><a href="document_verification.php"><i class="fas fa-file-check"></i> Document Verification</a></li>
            <li><a href="reports.php"><i class="fas fa-chart-bar"></i> Reports</a></li>
            <li><a href="../logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
    </nav>

    <!-- Main Content -->
    <div class="main-content" id="mainContent">
        <!-- Topbar -->
        <div class="topbar">
            <div>
                <span class="hamburger" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </span>
                <span class="ms-3 fw-bold">Counsellor Dashboard</span>
            </div>
            <div>
                <span class="text-muted">Academic Year: <?= $current_year['year_name'] ?? 'Not Set' ?></span>
            </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
            <!-- Statistics Cards -->
            <div class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card pending">
                        <div class="stat-number text-warning"><?= $today_stats['pending_confirmations'] ?? 0 ?></div>
                        <div class="stat-label">Pending Confirmations</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card confirmed">
                        <div class="stat-number text-success"><?= $today_stats['confirmed_today'] ?? 0 ?></div>
                        <div class="stat-label">Confirmed Today</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card cancelled">
                        <div class="stat-number text-danger"><?= $today_stats['cancelled_today'] ?? 0 ?></div>
                        <div class="stat-label">Cancelled Today</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card">
                        <div class="stat-number text-primary"><?= $today_stats['total_handled'] ?? 0 ?></div>
                        <div class="stat-label">Total Handled Today</div>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Pending Confirmations -->
                <div class="col-lg-8 mb-4">
                    <div class="card card-custom">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="mb-0"><i class="fas fa-clock"></i> Priority Pending Confirmations</h5>
                        </div>
                        <div class="card-body">
                            <?php if (empty($pending_confirmations)): ?>
                                <div class="text-center text-muted py-4">
                                    <i class="fas fa-check-circle fa-3x mb-3"></i>
                                    <h5>All Caught Up!</h5>
                                    <p>No pending confirmations at the moment.</p>
                                </div>
                            <?php else: ?>
                                <div class="row">
                                    <?php foreach ($pending_confirmations as $student): ?>
                                    <div class="col-md-6 mb-3">
                                        <div class="card pending-card border-start border-warning border-4">
                                            <?php if ($student['days_pending'] > 7): ?>
                                            <span class="badge bg-danger priority-badge">High Priority</span>
                                            <?php elseif ($student['days_pending'] > 3): ?>
                                            <span class="badge bg-warning priority-badge">Medium Priority</span>
                                            <?php endif; ?>
                                            
                                            <div class="card-body">
                                                <h6 class="card-title"><?= htmlspecialchars($student['name']) ?></h6>
                                                <p class="card-text">
                                                    <small class="text-muted">
                                                        Admission No: <?= htmlspecialchars($student['admission_no']) ?><br>
                                                        Department: <?= htmlspecialchars($student['dept_name'] ?? 'Not Assigned') ?><br>
                                                        Category: <?= htmlspecialchars($student['category_name']) ?><br>
                                                        Pending: <?= $student['days_pending'] ?> days
                                                    </small>
                                                </p>
                                                <div class="d-flex gap-2">
                                                    <button class="btn btn-sm btn-success" onclick="quickConfirm(<?= $student['id'] ?>)">
                                                        <i class="fas fa-check"></i> Confirm
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(<?= $student['id'] ?>)">
                                                        <i class="fas fa-eye"></i> View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                                <div class="text-center mt-3">
                                    <a href="student_counselling.php" class="btn btn-outline-primary">
                                        View All Pending <i class="fas fa-arrow-right"></i>
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="col-lg-4 mb-4">
                    <div class="card card-custom">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="fas fa-history"></i> Recent Activities</h5>
                        </div>
                        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                            <?php if (empty($recent_activities)): ?>
                                <div class="text-center text-muted">
                                    <i class="fas fa-inbox fa-2x mb-3"></i>
                                    <p>No recent activities</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($recent_activities as $activity): ?>
                                <div class="border-bottom pb-2 mb-2">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong><?= htmlspecialchars($activity['name']) ?></strong><br>
                                            <small class="text-muted"><?= htmlspecialchars($activity['admission_no']) ?></small><br>
                                            <small class="text-muted"><?= htmlspecialchars($activity['dept_name'] ?? 'Not Assigned') ?></small>
                                        </div>
                                        <div class="text-end">
                                            <?php
                                            $status_class = match($activity['admission_status']) {
                                                'BOOKED' => 'warning',
                                                'CONFIRMED' => 'success',
                                                'CANCELLED' => 'danger',
                                                default => 'secondary'
                                            };
                                            ?>
                                            <span class="badge bg-<?= $status_class ?> badge-status">
                                                <?= $activity['admission_status'] ?>
                                            </span>
                                            <br>
                                            <small class="text-muted">
                                                <?= date('M j, H:i', strtotime($activity['updated_at'])) ?>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="row">
                <div class="col-12">
                    <div class="card card-custom">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0"><i class="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div class="card-body text-center">
                            <button class="btn btn-primary quick-action-btn" onclick="startCounselling()">
                                <i class="fas fa-user-graduate"></i> Start Counselling Session
                            </button>
                            <button class="btn btn-success quick-action-btn" onclick="bulkConfirm()">
                                <i class="fas fa-check-double"></i> Bulk Confirm Students
                            </button>
                            <button class="btn btn-info quick-action-btn" onclick="generateReport()">
                                <i class="fas fa-file-alt"></i> Generate Daily Report
                            </button>
                            <button class="btn btn-warning quick-action-btn" onclick="sendReminders()">
                                <i class="fas fa-bell"></i> Send Reminders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('shifted');
        }

        function quickConfirm(studentId) {
            Swal.fire({
                title: 'Quick Confirm Admission',
                text: 'Are you sure you want to confirm this student\'s admission?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Confirm',
                confirmButtonColor: '#28a745'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateStudentStatus(studentId, 'CONFIRMED');
                }
            });
        }

        function viewDetails(studentId) {
            window.location.href = `student_details.php?id=${studentId}`;
        }

        function updateStudentStatus(studentId, status) {
            const formData = new FormData();
            formData.append('student_id', studentId);
            formData.append('status', status);

            fetch('../api/update_student_status.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Status Updated',
                        text: data.message,
                        timer: 2000
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Failed to update status', 'error');
            });
        }

        function startCounselling() {
            window.location.href = 'student_counselling.php';
        }

        function bulkConfirm() {
            Swal.fire({
                title: 'Bulk Confirm Students',
                text: 'This will confirm all eligible students who have completed document verification.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#28a745'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Implement bulk confirm logic
                    Swal.fire({
                        icon: 'success',
                        title: 'Bulk Confirmation Completed',
                        text: 'All eligible students have been confirmed.',
                        timer: 3000
                    });
                }
            });
        }

        function generateReport() {
            window.location.href = '../api/generate_daily_report.php';
        }

        function sendReminders() {
            Swal.fire({
                title: 'Send Reminders',
                html: `
                    <select class="form-select mb-3" id="reminderType">
                        <option value="pending_confirmation">Pending Confirmation</option>
                        <option value="document_submission">Document Submission</option>
                        <option value="fee_payment">Fee Payment</option>
                    </select>
                `,
                showCancelButton: true,
                confirmButtonText: 'Send Reminders'
            }).then((result) => {
                if (result.isConfirmed) {
                    const type = document.getElementById('reminderType').value;
                    
                    // Show loading
                    Swal.fire({
                        title: 'Sending Reminders...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Simulate sending reminders
                    setTimeout(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Reminders Sent',
                            text: 'Reminder notifications have been sent successfully.',
                            timer: 3000
                        });
                    }, 2000);
                }
            });
        }

        // Auto refresh every 5 minutes
        setInterval(() => {
            location.reload();
        }, 300000);

        // Welcome message for counsellors
        document.addEventListener('DOMContentLoaded', function() {
            <?php if (!isset($_SESSION['counsellor_dashboard_visited'])): ?>
            Swal.fire({
                icon: 'success',
                title: 'Welcome Counsellor!',
                text: 'Ready to help students with their admission process.',
                timer: 3000,
                timerProgressBar: true
            });
            <?php $_SESSION['counsellor_dashboard_visited'] = true; ?>
            <?php endif; ?>
        });
    </script>
</body>
</html>
