<?php
require_once '../config/database.php';
check_admin();

// Get dashboard statistics
$db = new Database();
$conn = $db->getConnection();

// Get current academic year
$current_year = get_current_academic_year();

// Get seat statistics
$seat_stats = [];
if ($current_year) {
    $stmt = $conn->prepare("
        SELECT 
            d.dept_name,
            d.dept_code,
            sa.total_seats,
            sa.booked_seats,
            sa.confirmed_seats,
            sa.cancelled_seats,
            sa.available_seats
        FROM seat_allocations sa
        JOIN departments d ON sa.department_id = d.id
        WHERE sa.academic_year_id = ?
        ORDER BY d.dept_name
    ");
    $stmt->execute([$current_year['id']]);
    $seat_stats = $stmt->fetchAll();
}

// Get recent admissions
$stmt = $conn->prepare("
    SELECT 
        s.admission_no,
        s.name,
        s.email,
        s.phone,
        s.admission_status,
        s.booking_date,
        ac.category_name,
        d.dept_name
    FROM students s
    JOIN admission_categories ac ON s.admission_category_id = ac.id
    LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
    LEFT JOIN departments d ON sda.department_id = d.id
    WHERE s.academic_year_id = ?
    ORDER BY s.booking_date DESC
    LIMIT 10
");
$stmt->execute([$current_year['id'] ?? 1]);
$recent_admissions = $stmt->fetchAll();

// Get total counts
$stmt = $conn->prepare("
    SELECT 
        COUNT(CASE WHEN admission_status = 'BOOKED' THEN 1 END) as total_booked,
        COUNT(CASE WHEN admission_status = 'CONFIRMED' THEN 1 END) as total_confirmed,
        COUNT(CASE WHEN admission_status = 'CANCELLED' THEN 1 END) as total_cancelled,
        COUNT(*) as total_applications
    FROM students 
    WHERE academic_year_id = ?
");
$stmt->execute([$current_year['id'] ?? 1]);
$totals = $stmt->fetch();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - College Admission Portal</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            border-left: 4px solid #667eea;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card.booked {
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
        
        .table-custom {
            border-radius: 10px;
            overflow: hidden;
        }
        
        .badge-status {
            font-size: 0.75rem;
            padding: 5px 10px;
        }
        
        .progress-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-weight: bold;
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
            <h5>MKCE Admin</h5>
            <small><?= htmlspecialchars($_SESSION['full_name']) ?></small>
        </div>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php" class="active"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="manage_students.php"><i class="fas fa-users"></i> Manage Students</a></li>
            <li><a href="seat_management.php"><i class="fas fa-chair"></i> Seat Management</a></li>
            <li><a href="department_management.php"><i class="fas fa-building"></i> Departments</a></li>
            <li><a href="section_allocation.php"><i class="fas fa-layer-group"></i> Section Allocation</a></li>
            <li><a href="reports.php"><i class="fas fa-chart-bar"></i> Reports</a></li>
            <li><a href="settings.php"><i class="fas fa-cog"></i> Settings</a></li>
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
                <span class="ms-3 fw-bold">Dashboard</span>
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
                    <div class="stat-card">
                        <div class="stat-number text-primary"><?= $totals['total_applications'] ?? 0 ?></div>
                        <div class="stat-label">Total Applications</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card booked">
                        <div class="stat-number text-warning"><?= $totals['total_booked'] ?? 0 ?></div>
                        <div class="stat-label">Booked Seats</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card confirmed">
                        <div class="stat-number text-success"><?= $totals['total_confirmed'] ?? 0 ?></div>
                        <div class="stat-label">Confirmed Admissions</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="stat-card cancelled">
                        <div class="stat-number text-danger"><?= $totals['total_cancelled'] ?? 0 ?></div>
                        <div class="stat-label">Cancelled</div>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Seat Statistics -->
                <div class="col-lg-8 mb-4">
                    <div class="card card-custom">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="fas fa-chart-pie"></i> Department-wise Seat Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover table-custom">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Department</th>
                                            <th>Total</th>
                                            <th>Booked</th>
                                            <th>Confirmed</th>
                                            <th>Available</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($seat_stats as $stat): ?>
                                        <tr>
                                            <td>
                                                <strong><?= htmlspecialchars($stat['dept_name']) ?></strong><br>
                                                <small class="text-muted"><?= htmlspecialchars($stat['dept_code']) ?></small>
                                            </td>
                                            <td><span class="badge bg-info"><?= $stat['total_seats'] ?></span></td>
                                            <td><span class="badge bg-warning"><?= $stat['booked_seats'] ?></span></td>
                                            <td><span class="badge bg-success"><?= $stat['confirmed_seats'] ?></span></td>
                                            <td><span class="badge bg-secondary"><?= $stat['available_seats'] ?></span></td>
                                            <td>
                                                <?php 
                                                $progress = $stat['total_seats'] > 0 ? 
                                                    round(($stat['confirmed_seats'] / $stat['total_seats']) * 100) : 0;
                                                ?>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar bg-success" style="width: <?= $progress ?>%">
                                                        <?= $progress ?>%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Admissions -->
                <div class="col-lg-4 mb-4">
                    <div class="card card-custom">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0"><i class="fas fa-clock"></i> Recent Admissions</h5>
                        </div>
                        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                            <?php if (empty($recent_admissions)): ?>
                                <div class="text-center text-muted">
                                    <i class="fas fa-inbox fa-2x mb-3"></i>
                                    <p>No recent admissions</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($recent_admissions as $admission): ?>
                                <div class="border-bottom pb-2 mb-2">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong><?= htmlspecialchars($admission['name']) ?></strong><br>
                                            <small class="text-muted"><?= htmlspecialchars($admission['admission_no']) ?></small><br>
                                            <small class="text-muted"><?= htmlspecialchars($admission['dept_name'] ?? 'Not Assigned') ?></small>
                                        </div>
                                        <div class="text-end">
                                            <?php
                                            $status_class = match($admission['admission_status']) {
                                                'BOOKED' => 'warning',
                                                'CONFIRMED' => 'success',
                                                'CANCELLED' => 'danger',
                                                default => 'secondary'
                                            };
                                            ?>
                                            <span class="badge bg-<?= $status_class ?> badge-status">
                                                <?= $admission['admission_status'] ?>
                                            </span>
                                            <br>
                                            <small class="text-muted">
                                                <?= date('M j, Y', strtotime($admission['booking_date'])) ?>
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
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0"><i class="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-primary btn-lg w-100" onclick="exportStudentList()">
                                        <i class="fas fa-download"></i><br>
                                        Export Students
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-success btn-lg w-100" onclick="generateSections()">
                                        <i class="fas fa-layer-group"></i><br>
                                        Generate Sections
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-info btn-lg w-100" onclick="sendNotifications()">
                                        <i class="fas fa-bell"></i><br>
                                        Send Notifications
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-warning btn-lg w-100" onclick="viewReports()">
                                        <i class="fas fa-chart-line"></i><br>
                                        View Reports
                                    </button>
                                </div>
                            </div>
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

        function exportStudentList() {
            Swal.fire({
                title: 'Export Student List',
                text: 'Choose export format:',
                showCancelButton: true,
                confirmButtonText: 'Excel',
                cancelButtonText: 'PDF',
                showDenyButton: true,
                denyButtonText: 'CSV'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '../api/export_students.php?format=excel';
                } else if (result.isDenied) {
                    window.location.href = '../api/export_students.php?format=csv';
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = '../api/export_students.php?format=pdf';
                }
            });
        }

        function generateSections() {
            Swal.fire({
                title: 'Generate Sections',
                text: 'This will automatically divide confirmed students into sections. Continue?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Generate',
                confirmButtonColor: '#28a745'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Show loading
                    Swal.fire({
                        title: 'Generating Sections...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    fetch('../api/generate_sections.php', {
                        method: 'POST'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Sections Generated!',
                                text: data.message
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: data.message
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to generate sections'
                        });
                    });
                }
            });
        }

        function sendNotifications() {
            Swal.fire({
                title: 'Send Notifications',
                html: `
                    <select class="form-select mb-3" id="notificationType">
                        <option value="admission_reminder">Admission Reminder</option>
                        <option value="document_pending">Document Pending</option>
                        <option value="fee_payment">Fee Payment Reminder</option>
                        <option value="custom">Custom Message</option>
                    </select>
                    <textarea class="form-control" id="customMessage" placeholder="Custom message..." style="display:none;"></textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'Send',
                preConfirm: () => {
                    const type = document.getElementById('notificationType').value;
                    const customMessage = document.getElementById('customMessage').value;
                    
                    if (type === 'custom' && !customMessage.trim()) {
                        Swal.showValidationMessage('Please enter a custom message');
                        return false;
                    }
                    
                    return { type, customMessage };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Notifications Sent!',
                        text: 'Notifications have been sent to all applicable students.'
                    });
                }
            });

            // Show/hide custom message textarea
            document.getElementById('notificationType').addEventListener('change', function() {
                const customMessage = document.getElementById('customMessage');
                if (this.value === 'custom') {
                    customMessage.style.display = 'block';
                } else {
                    customMessage.style.display = 'none';
                }
            });
        }

        function viewReports() {
            window.location.href = 'reports.php';
        }

        // Auto refresh every 5 minutes
        setInterval(() => {
            location.reload();
        }, 300000);

        // Welcome message
        document.addEventListener('DOMContentLoaded', function() {
            <?php if (!isset($_SESSION['dashboard_visited'])): ?>
            Swal.fire({
                icon: 'success',
                title: 'Welcome to Admin Dashboard!',
                text: 'You have successfully logged in to the admission portal.',
                timer: 3000,
                timerProgressBar: true
            });
            <?php $_SESSION['dashboard_visited'] = true; ?>
            <?php endif; ?>
        });
    </script>
</body>
</html>
