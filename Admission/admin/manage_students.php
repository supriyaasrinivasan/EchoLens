<?php
require_once '../config/database.php';
check_admin();

$db = new Database();
$conn = $db->getConnection();
$current_year = get_current_academic_year();

// Get filters
$status_filter = $_GET['status'] ?? '';
$department_filter = $_GET['department'] ?? '';
$category_filter = $_GET['category'] ?? '';
$search = $_GET['search'] ?? '';

// Build query
$where_conditions = [];
$params = [];

if ($current_year) {
    $where_conditions[] = "s.academic_year_id = ?";
    $params[] = $current_year['id'];
}

if ($status_filter) {
    $where_conditions[] = "s.admission_status = ?";
    $params[] = $status_filter;
}

if ($department_filter) {
    $where_conditions[] = "sda.department_id = ?";
    $params[] = $department_filter;
}

if ($category_filter) {
    $where_conditions[] = "s.admission_category_id = ?";
    $params[] = $category_filter;
}

if ($search) {
    $where_conditions[] = "(s.name LIKE ? OR s.email LIKE ? OR s.admission_no LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

// Get students
$stmt = $conn->prepare("
    SELECT 
        s.*,
        ac.category_name,
        ac.category_code,
        d.dept_name,
        d.dept_code,
        spd.date_of_birth,
        spd.gender
    FROM students s
    JOIN admission_categories ac ON s.admission_category_id = ac.id
    LEFT JOIN student_department_allocations sda ON s.id = sda.student_id
    LEFT JOIN departments d ON sda.department_id = d.id
    LEFT JOIN student_personal_details spd ON s.id = spd.student_id
    $where_clause
    ORDER BY s.booking_date DESC
");
$stmt->execute($params);
$students = $stmt->fetchAll();

// Get departments for filter
$dept_stmt = $conn->prepare("SELECT id, dept_name FROM departments WHERE is_active = 1 ORDER BY dept_name");
$dept_stmt->execute();
$departments = $dept_stmt->fetchAll();

// Get categories for filter
$cat_stmt = $conn->prepare("SELECT id, category_name FROM admission_categories WHERE is_active = 1 ORDER BY category_name");
$cat_stmt->execute();
$categories = $cat_stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Students - Admin Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css">
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
        
        .card-custom {
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        
        .table-responsive {
            border-radius: 10px;
            overflow: hidden;
        }
        
        .badge-status {
            font-size: 0.75rem;
            padding: 5px 10px;
        }
        
        .btn-action {
            padding: 5px 10px;
            font-size: 0.8rem;
            margin: 2px;
        }
        
        .filters-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            <li><a href="dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="manage_students.php" class="active"><i class="fas fa-users"></i> Manage Students</a></li>
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
                <span class="ms-3 fw-bold">Manage Students</span>
            </div>
            <div>
                <button class="btn btn-primary" onclick="addNewStudent()">
                    <i class="fas fa-plus"></i> Add Student
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
            <!-- Filters -->
            <div class="filters-card">
                <form method="GET" class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label">Search</label>
                        <input type="text" class="form-control" name="search" value="<?= htmlspecialchars($search) ?>" 
                               placeholder="Name, Email, or Admission No">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status">
                            <option value="">All Status</option>
                            <option value="BOOKED" <?= $status_filter === 'BOOKED' ? 'selected' : '' ?>>Booked</option>
                            <option value="CONFIRMED" <?= $status_filter === 'CONFIRMED' ? 'selected' : '' ?>>Confirmed</option>
                            <option value="CANCELLED" <?= $status_filter === 'CANCELLED' ? 'selected' : '' ?>>Cancelled</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Department</label>
                        <select class="form-select" name="department">
                            <option value="">All Departments</option>
                            <?php foreach ($departments as $dept): ?>
                            <option value="<?= $dept['id'] ?>" <?= $department_filter == $dept['id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($dept['dept_name']) ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Category</label>
                        <select class="form-select" name="category">
                            <option value="">All Categories</option>
                            <?php foreach ($categories as $cat): ?>
                            <option value="<?= $cat['id'] ?>" <?= $category_filter == $cat['id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($cat['category_name']) ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">&nbsp;</label>
                        <div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Filter
                            </button>
                            <a href="manage_students.php" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i> Clear
                            </a>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Students Table -->
            <div class="card card-custom">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-users"></i> Students List 
                        <span class="badge bg-light text-dark ms-2"><?= count($students) ?> students</span>
                    </h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="studentsTable">
                            <thead class="table-dark">
                                <tr>
                                    <th>Admission No</th>
                                    <th>Student Details</th>
                                    <th>Contact</th>
                                    <th>Department</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Booking Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($students as $student): ?>
                                <tr>
                                    <td>
                                        <strong><?= htmlspecialchars($student['admission_no']) ?></strong>
                                    </td>
                                    <td>
                                        <strong><?= htmlspecialchars($student['name']) ?></strong><br>
                                        <?php if ($student['date_of_birth']): ?>
                                        <small class="text-muted">
                                            DOB: <?= date('d/m/Y', strtotime($student['date_of_birth'])) ?>
                                            <?= $student['gender'] ? "| {$student['gender']}" : '' ?>
                                        </small>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-envelope text-muted"></i> <?= htmlspecialchars($student['email']) ?><br>
                                        <i class="fas fa-phone text-muted"></i> <?= htmlspecialchars($student['phone']) ?>
                                    </td>
                                    <td>
                                        <?php if ($student['dept_name']): ?>
                                            <strong><?= htmlspecialchars($student['dept_name']) ?></strong><br>
                                            <small class="text-muted"><?= htmlspecialchars($student['dept_code']) ?></small>
                                        <?php else: ?>
                                            <span class="text-muted">Not Assigned</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">
                                            <?= htmlspecialchars($student['category_code']) ?>
                                        </span><br>
                                        <small><?= htmlspecialchars($student['category_name']) ?></small>
                                    </td>
                                    <td>
                                        <?php
                                        $status_class = match($student['admission_status']) {
                                            'BOOKED' => 'warning',
                                            'CONFIRMED' => 'success',
                                            'CANCELLED' => 'danger',
                                            default => 'secondary'
                                        };
                                        ?>
                                        <span class="badge bg-<?= $status_class ?> badge-status">
                                            <?= $student['admission_status'] ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?= date('d/m/Y H:i', strtotime($student['booking_date'])) ?>
                                    </td>
                                    <td>
                                        <div class="btn-group-vertical">
                                            <button class="btn btn-sm btn-outline-primary btn-action" 
                                                    onclick="viewStudent(<?= $student['id'] ?>)">
                                                <i class="fas fa-eye"></i> View
                                            </button>
                                            <button class="btn btn-sm btn-outline-success btn-action" 
                                                    onclick="editStudent(<?= $student['id'] ?>)">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <?php if ($student['admission_status'] === 'BOOKED'): ?>
                                            <button class="btn btn-sm btn-outline-success btn-action" 
                                                    onclick="confirmAdmission(<?= $student['id'] ?>)">
                                                <i class="fas fa-check"></i> Confirm
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger btn-action" 
                                                    onclick="cancelAdmission(<?= $student['id'] ?>)">
                                                <i class="fas fa-times"></i> Cancel
                                            </button>
                                            <?php endif; ?>
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
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('shifted');
        }

        // Initialize DataTable
        $(document).ready(function() {
            $('#studentsTable').DataTable({
                pageLength: 25,
                responsive: true,
                order: [[6, 'desc']], // Sort by booking date
                columnDefs: [
                    { orderable: false, targets: [7] } // Disable sorting for actions column
                ]
            });
        });

        function viewStudent(studentId) {
            // Fetch student details
            fetch(`../api/get_student_details.php?id=${studentId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const student = data.student;
                        Swal.fire({
                            title: 'Student Details',
                            html: `
                                <div class="text-start">
                                    <h6>Basic Information</h6>
                                    <p><strong>Admission No:</strong> ${student.admission_no}</p>
                                    <p><strong>Name:</strong> ${student.name}</p>
                                    <p><strong>Email:</strong> ${student.email}</p>
                                    <p><strong>Phone:</strong> ${student.phone}</p>
                                    <p><strong>Status:</strong> <span class="badge bg-primary">${student.admission_status}</span></p>
                                    
                                    <h6 class="mt-3">Academic Details</h6>
                                    <p><strong>Department:</strong> ${student.dept_name || 'Not Assigned'}</p>
                                    <p><strong>Category:</strong> ${student.category_name}</p>
                                    <p><strong>Booking Date:</strong> ${new Date(student.booking_date).toLocaleDateString()}</p>
                                </div>
                            `,
                            width: 600,
                            showCancelButton: true,
                            confirmButtonText: 'Edit Student',
                            cancelButtonText: 'Close'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                editStudent(studentId);
                            }
                        });
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                });
        }

        function editStudent(studentId) {
            // Redirect to edit page
            window.location.href = `edit_student.php?id=${studentId}`;
        }

        function confirmAdmission(studentId) {
            Swal.fire({
                title: 'Confirm Admission',
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

        function cancelAdmission(studentId) {
            Swal.fire({
                title: 'Cancel Admission',
                text: 'Are you sure you want to cancel this student\'s admission?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Cancel',
                confirmButtonColor: '#dc3545'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateStudentStatus(studentId, 'CANCELLED');
                }
            });
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
                        text: data.message
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

        function addNewStudent() {
            window.location.href = 'add_student.php';
        }
    </script>
</body>
</html>
