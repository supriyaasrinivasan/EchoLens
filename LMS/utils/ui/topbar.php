<style>
    /* Syraa Lambda Modern Topbar */
    .topbar {
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        height: var(--topbar-height);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--gray-200);
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        padding: 0 2rem;
        transition: var(--transition-normal);
        z-index: 999;
    }

    .sidebar.collapsed + .content .topbar {
        left: var(--sidebar-collapsed-width);
    }

    /* Hamburger Menu */
    .hamburger {
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--radius-md);
        transition: var(--transition-fast);
        color: var(--gray-600);
        background: transparent;
        border: none;
        font-size: 1.25rem;
    }

    .hamburger:hover {
        background: var(--gray-100);
        color: var(--primary-600);
    }

    /* Brand Logo (Mobile) */
    .brand-logo {
        display: none;
        align-items: center;
        color: var(--primary-600);
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 auto;
        font-family: 'Manrope', sans-serif;
    }

    .brand-logo i {
        margin-right: 0.5rem;
        font-size: 1.25rem;
    }

    /* Search Bar */
    .search-container {
        flex: 1;
        max-width: 400px;
        margin-left: 2rem;
        position: relative;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 3rem;
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-xl);
        background: var(--gray-50);
        color: var(--gray-900);
        font-size: 0.9rem;
        transition: var(--transition-fast);
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary-500);
        background: white;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-400);
        pointer-events: none;
    }

    /* Notification Center */
    .notification-center {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-left: auto;
    }

    .notification-item {
        position: relative;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--radius-md);
        transition: var(--transition-fast);
        color: var(--gray-600);
        background: transparent;
        border: none;
        font-size: 1.125rem;
    }

    .notification-item:hover {
        background: var(--gray-100);
        color: var(--primary-600);
    }

    .notification-badge {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        width: 8px;
        height: 8px;
        background: var(--secondary-500);
        border-radius: 50%;
        border: 2px solid white;
        animation: pulse 2s infinite;
    }

    .notification-badge.has-count {
        width: auto;
        height: auto;
        min-width: 18px;
        min-height: 18px;
        padding: 0.125rem 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    /* User Profile Section - ZOHO Theme */
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-left: 1rem;
        position: relative;
    }

    .user-menu {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-xl);
        transition: var(--transition-fast);
        border: 1px solid transparent;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .user-menu:hover {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        transform: translateY(-1px);
    }

    /* ZOHO-style hover dropdown trigger */
    .user-menu:hover .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: auto;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 1rem;
        position: relative;
        overflow: hidden;
        transition: var(--transition-fast);
        box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
        border: 2px solid white;
    }

    .user-avatar:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .online-indicator {
        position: absolute;
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 50%;
        bottom: 0;
        right: 0;
        border: 2px solid white;
        animation: pulse 2s infinite;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.1);
        }
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .user-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.9rem;
        line-height: 1.2;
    }

    .user-role {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: capitalize;
        font-weight: 500;
    }

    .dropdown-arrow {
        color: #64748b;
        font-size: 0.875rem;
        transition: var(--transition-fast);
    }

    .user-menu:hover .dropdown-arrow {
        color: #3b82f6;
        transform: rotate(180deg);
    }

    /* Dropdown Menu - ZOHO Theme */
    .dropdown-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
        min-width: 240px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        overflow: hidden;
        pointer-events: none;
        backdrop-filter: blur(10px);
        border-top: 3px solid #3b82f6;
    }

    .dropdown-menu.show,
    .user-menu:hover .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: auto;
    }

    .dropdown-header {
        padding: 1.25rem;
        border-bottom: 1px solid #f1f5f9;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .dropdown-user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .dropdown-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }

    .dropdown-user-details h6 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #1e293b;
    }

    .dropdown-user-details p {
        margin: 0;
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 500;
    }

    .dropdown-item {
        padding: 0.875rem 1.25rem;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 0.875rem;
        text-decoration: none !important;
        transition: all 0.15s ease-in-out;
        border: none;
        background: none;
        width: 100%;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        border-left: 3px solid transparent;
    }

    .dropdown-item:hover {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        color: #0369a1;
        text-decoration: none !important;
        border-left-color: #3b82f6;
        transform: translateX(2px);
    }

    .dropdown-item:focus {
        outline: none;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        color: #0369a1;
        text-decoration: none !important;
    }

    .dropdown-item i {
        width: 18px;
        text-align: center;
        opacity: 0.8;
        font-size: 0.9rem;
        transition: all 0.15s ease;
    }

    .dropdown-item:hover i {
        opacity: 1;
        transform: scale(1.1);
    }

    .dropdown-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
        margin: 0.5rem 0;
    }

    .dropdown-item.danger {
        color: #dc2626;
    }

    .dropdown-item.danger:hover {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #b91c1c;
        border-left-color: #dc2626;
    }

    /* Remove underlines from all anchor tags */
    .dropdown-item a,
    .dropdown-menu a,
    a.dropdown-item {
        text-decoration: none !important;
    }

    .dropdown-item a:hover,
    .dropdown-menu a:hover,
    a.dropdown-item:hover {
        text-decoration: none !important;
    }

    .dropdown-item a:focus,
    .dropdown-menu a:focus,
    a.dropdown-item:focus {
        text-decoration: none !important;
        outline: none;
    }

    /* Theme Toggle */
    .theme-toggle {
        background: var(--gray-100);
        border: none;
        border-radius: var(--radius-md);
        padding: 0.5rem;
        cursor: pointer;
        color: var(--gray-600);
        transition: var(--transition-fast);
        font-size: 1rem;
    }

    .theme-toggle:hover {
        background: var(--gray-200);
        color: var(--primary-600);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .topbar {
            left: 0 !important;
            padding: 0 1rem;
        }

        .brand-logo {
            display: flex;
        }

        .search-container {
            display: none;
        }

        .user-info {
            display: none;
        }

        .notification-center {
            gap: 0.5rem;
        }

        .user-menu {
            padding: 0.5rem;
        }
    }

    /* Loading States */
    .loading-shimmer {
        background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
</style>

<div class="topbar">
    <!-- Hamburger Menu -->
    <button class="hamburger" id="hamburger" type="button">
        <i class="fas fa-bars"></i>
    </button>

    <!-- Brand Logo (Mobile) -->
    <div class="brand-logo">
        <i class="fas fa-layer-group"></i>
        Syraa Lambda
    </div>

    <!-- Search Bar -->
    <div class="search-container">
        <div class="search-icon">
            <i class="fas fa-search"></i>
        </div>
        <input type="text" class="search-input" placeholder="Search courses, assignments, or resources...">
    </div>

    <!-- Notification Center -->
    <div class="notification-center">
        <!-- Notifications -->
        <button class="notification-item" title="Notifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge has-count">3</span>
        </button>

        <!-- Messages -->
        <button class="notification-item" title="Messages">
            <i class="fas fa-envelope"></i>
            <span class="notification-badge"></span>
        </button>

        <!-- Theme Toggle -->
        <button class="theme-toggle" title="Toggle Theme">
            <i class="fas fa-moon"></i>
        </button>
    </div>

    <!-- User Profile -->
    <div class="user-profile">
        <div class="user-menu" id="userMenu">
            <div class="user-avatar">
                <?php 
                $user_name = $_SESSION['user']['name'] ?? 'User';
                echo strtoupper(substr($user_name, 0, 1));
                ?>
                <div class="online-indicator"></div>
            </div>
            <div class="user-info">
                <div class="user-name"><?php echo $user_name; ?></div>
                <div class="user-role"><?php echo ucfirst($_SESSION['user']['role'] ?? 'guest'); ?></div>
            </div>
            <div class="dropdown-arrow">
                <i class="fas fa-chevron-down"></i>
            </div>

            <!-- Dropdown Menu -->
            <div class="dropdown-menu" id="userDropdown">
                <div class="dropdown-header">
                    <div class="dropdown-user-info">
                        <div class="dropdown-avatar">
                            <?php echo strtoupper(substr($user_name, 0, 1)); ?>
                        </div>
                        <div class="dropdown-user-details">
                            <h6><?php echo $user_name; ?></h6>
                            <p><?php echo $_SESSION['user']['email'] ?? 'No email provided'; ?></p>
                        </div>
                    </div>
                </div>

                <a href="#" class="dropdown-item">
                    <i class="fas fa-user"></i>
                    My Profile
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-cog"></i>
                    Account Settings
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-chart-line"></i>
                    My Progress
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-bookmark"></i>
                    Saved Content
                </a>

                <div class="dropdown-divider"></div>

                <a href="#" class="dropdown-item">
                    <i class="fas fa-key"></i>
                    Change Password
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-shield-alt"></i>
                    Privacy Settings
                </a>

                <div class="dropdown-divider"></div>

                <a href="#" class="dropdown-item">
                    <i class="fas fa-question-circle"></i>
                    Help & Support
                </a>
                <a href="Logout.php" class="dropdown-item danger" onclick="handleLogout(event)">
                    <i class="fas fa-sign-out-alt"></i>
                    Sign Out
                </a>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize topbar functionality
    initializeTopbarComponents();
    
    function initializeTopbarComponents() {
        // User menu dropdown toggle
        const userMenu = document.getElementById('userMenu');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenu && userDropdown) {
            // Remove any existing event listeners to avoid duplicates
            userMenu.replaceWith(userMenu.cloneNode(true));
            const newUserMenu = document.getElementById('userMenu');
            const newUserDropdown = document.getElementById('userDropdown');
            
            newUserMenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('User menu clicked'); // Debug log
                
                // Close other dropdowns if any exist
                document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
                    if (dropdown !== newUserDropdown) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                newUserDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!newUserMenu.contains(e.target)) {
                    newUserDropdown.classList.remove('show');
                }
            });
            
            // Prevent dropdown from closing when clicking inside it
            newUserDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // Sidebar toggle functionality (only if not handled by hodHelper.js)
        if (typeof initializeSidebarToggle === 'undefined') {
            const hamburger = document.getElementById('hamburger');
            const sidebar = document.getElementById('sidebar');
            const mobileOverlay = document.getElementById('mobileOverlay');
            
            if (hamburger && sidebar) {
                hamburger.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (window.innerWidth <= 768) {
                        // Mobile: Toggle sidebar visibility
                        sidebar.classList.toggle('mobile-show');
                        if (mobileOverlay) {
                            mobileOverlay.classList.toggle('show');
                        }
                        document.body.classList.toggle('sidebar-open');
                    } else {
                        // Desktop: Toggle collapse
                        sidebar.classList.toggle('collapsed');
                    }
                });
            }

            // Close mobile sidebar when clicking overlay
            if (mobileOverlay) {
                mobileOverlay.addEventListener('click', function() {
                    if (sidebar) {
                        sidebar.classList.remove('mobile-show');
                    }
                    this.classList.remove('show');
                    document.body.classList.remove('sidebar-open');
                });
            }
        }

        // Theme toggle functionality
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (icon.classList.contains('fa-moon')) {
                    icon.className = 'fas fa-sun';
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('syraa-lambda-theme', 'dark');
                } else {
                    icon.className = 'fas fa-moon';
                    document.body.classList.remove('dark-theme');
                    localStorage.setItem('syraa-lambda-theme', 'light');
                }
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('syraa-lambda-theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                const icon = themeToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-sun';
            }
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function(e) {
                const query = e.target.value.trim();
                
                // Clear previous timeout
                clearTimeout(searchTimeout);
                
                // Debounce search
                searchTimeout = setTimeout(() => {
                    if (query.length > 2) {
                        console.log('Searching for:', query);
                        // Implement search functionality here
                        performSearch(query);
                    }
                }, 300);
            });
            
            // Handle search on Enter key
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.value.trim();
                    if (query.length > 0) {
                        performSearch(query);
                    }
                }
            });
        }

        // Notification handlers
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Notification clicked');
                // Implement notification panel toggle here
                showNotificationPanel();
            });
        });
    }
    
    // Search function
    function performSearch(query) {
        // Implement your search logic here
        console.log('Performing search for:', query);
        // You can add AJAX call here to search courses, users, etc.
    }
    
    // Notification panel function
    function showNotificationPanel() {
        // Implement notification panel here
        console.log('Showing notification panel');
        // You can add a modal or slide-out panel here
    }
});

// Logout handler
function handleLogout(event) {
    event.preventDefault();
    
    // Show confirmation dialog
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Sign Out?',
            text: 'Are you sure you want to sign out of Syraa Lambda?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, sign out',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-modern'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Signing out...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Clear sessionStorage
                sessionStorage.clear();
                localStorage.removeItem('userData');
                
                // Redirect to logout.php
                setTimeout(() => {
                    window.location.href = 'Logout.php';
                }, 1000);
            }
        });
    } else {
        // Fallback if SweetAlert is not available
        if (confirm('Are you sure you want to sign out?')) {
            sessionStorage.clear();
            localStorage.removeItem('userData');
            window.location.href = 'Logout.php';
        }
    }
}

// Real-time clock (optional feature)
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update clock display if element exists
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Update clock every second
setInterval(updateClock, 1000);

// Initialize clock on load
updateClock();
</script>