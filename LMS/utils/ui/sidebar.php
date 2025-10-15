<style>
    /* Syraa Lambda Modern Sidebar - ZOHO Theme */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: var(--sidebar-width);
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        transition: var(--transition-normal);
        z-index: 1000;
        overflow-y: auto;
        overflow-x: hidden;
        border-right: 1px solid #334155;
        box-shadow: 0 25px 50px rgba(0,0,0,0.25), 0 4px 6px rgba(0,0,0,0.1);
    }

    .sidebar::-webkit-scrollbar {
        width: 4px;
    }

    .sidebar::-webkit-scrollbar-track {
        background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.4);
        border-radius: 2px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.6);
    }

    .sidebar.collapsed {
        width: var(--sidebar-collapsed-width);
    }

    /* Logo Section - ZOHO Theme */
    .sidebar .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        border-bottom: 1px solid #334155;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(10px);
    }

    .brand-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: var(--transition-normal);
    }

    .brand-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3), 0 4px 6px rgba(0,0,0,0.1);
        transition: var(--transition-normal);
    }

    .brand-icon:hover {
        transform: scale(1.05);
        box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4), 0 8px 16px rgba(0,0,0,0.15);
    }

    .brand-text {
        color: white;
        font-family: 'Manrope', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        text-align: center;
        line-height: 1.2;
        transition: var(--transition-normal);
    }

    .brand-subtitle {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.75rem;
        font-weight: 400;
        margin-top: 0.25rem;
        transition: var(--transition-normal);
    }

    .sidebar.collapsed .brand-text,
    .sidebar.collapsed .brand-subtitle {
        opacity: 0;
        visibility: hidden;
    }

    .sidebar.collapsed .brand-container {
        margin-bottom: 0;
    }

    /* Menu Section */
    .sidebar .menu {
        padding: 1rem 0.75rem;
    }

    .menu-section {
        margin-bottom: 2rem;
    }

    .menu-section-title {
        color: #94a3b8;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0 1rem;
        margin-bottom: 0.75rem;
        transition: var(--transition-normal);
    }

    .sidebar.collapsed .menu-section-title {
        opacity: 0;
        visibility: hidden;
    }

    /* Menu Items - ZOHO Theme */
    .menu-item {
        padding: 0.875rem 1rem;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        cursor: pointer;
        border-radius: 8px;
        margin: 0.25rem 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        text-decoration: none;
        font-weight: 500;
        overflow: hidden;
    }

    .menu-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        transform: scaleY(0);
        transition: transform 0.2s ease;
    }

    .menu-item:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%);
        color: #f1f5f9;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .menu-item:hover::before {
        transform: scaleY(1);
    }

    .menu-item.active {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%);
        color: white;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
        border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .menu-item.active::before {
        transform: scaleY(1);
    }

    .menu-item i {
        min-width: 24px;
        font-size: 1.125rem;
        margin-right: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
    }

    .menu-item span {
        flex: 1;
        transition: var(--transition-normal);
        white-space: nowrap;
    }

    .sidebar.collapsed .menu-item span {
        opacity: 0;
        visibility: hidden;
        width: 0;
    }

    .sidebar.collapsed .menu-item {
        padding: 0.875rem;
        justify-content: center;
        margin: 0.25rem;
    }

    .sidebar.collapsed .menu-item i {
        margin-right: 0;
    }

    /* Submenu */
    .has-submenu {
        position: relative;
        cursor: pointer;
    }

    .has-submenu::after {
        content: '\f107';
        font-family: 'Font Awesome 6 Free';
        font-weight: 900;
        font-size: 0.875rem;
        transition: var(--transition-fast);
        opacity: 0.7;
        pointer-events: none;
    }

    .has-submenu.active::after {
        transform: rotate(180deg);
    }

    .sidebar.collapsed .has-submenu::after {
        display: none;
    }

    .submenu {
        margin-left: 2rem;
        padding-left: 1rem;
        border-left: 1px solid #475569;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
        opacity: 0;
        visibility: hidden;
    }

    .submenu.active {
        max-height: 300px;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        opacity: 1;
        visibility: visible;
    }

    .sidebar.collapsed .submenu {
        display: none !important;
    }

    .submenu .menu-item {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        margin: 0.125rem 0;
    }

    .submenu .menu-item i {
        font-size: 1rem;
        min-width: 20px;
    }

    /* Tooltip for collapsed sidebar - ZOHO Theme */
    .menu-tooltip {
        position: absolute;
        left: calc(100% + 1rem);
        top: 50%;
        transform: translateY(-50%);
        background: #1e293b;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1001;
        opacity: 0;
        visibility: hidden;
        transition: var(--transition-fast);
        box-shadow: 0 10px 25px rgba(0,0,0,0.25), 0 4px 6px rgba(0,0,0,0.1);
        border: 1px solid #334155;
    }

    .menu-tooltip::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        border: 4px solid transparent;
        border-right-color: #1e293b;
    }

    .sidebar.collapsed .menu-item:hover .menu-tooltip {
        opacity: 1;
        visibility: visible;
    }

    /* User Profile Section - ZOHO Theme */
    .user-profile-section {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem 0.75rem;
        border-top: 1px solid #334155;
        background: rgba(15, 23, 42, 0.6);
    }

    .user-profile-item {
        padding: 0.75rem;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        border-radius: 8px;
        transition: var(--transition-fast);
    }

    .user-profile-item:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%);
        color: white;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .sidebar.collapsed .user-avatar {
        margin-right: 0;
    }

    .user-info {
        flex: 1;
        transition: var(--transition-normal);
    }

    .user-name {
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.2;
    }

    .user-role {
        font-size: 0.75rem;
        opacity: 0.7;
    }

    .sidebar.collapsed .user-info {
        opacity: 0;
        visibility: hidden;
        width: 0;
    }

    /* Responsive Design - ZOHO Theme */
    .mobile-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .mobile-overlay.show {
        display: block;
        opacity: 1;
    }

    @media (max-width: 768px) {
        .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
        }

        .sidebar.mobile-show {
            transform: translateX(0);
        }

        .mobile-overlay {
            display: block;
        }
    }
</style>

<div class="mobile-overlay" id="mobileOverlay"></div>
<div class="sidebar" id="sidebar">
    <div class="logo">
        <div class="brand-container">
            <div class="brand-icon">
                <i class="fas fa-layer-group"></i>
            </div>
            <div class="brand-text">
                Syraa Lambda
                <div class="brand-subtitle">Learning Platform</div>
            </div>
        </div>
    </div>

    <div class="menu">
        <div class="menu-section">
            <div class="menu-section-title">Main Navigation</div>
            
            <a href="./dashboard.php" class="menu-item">
                <i class="fas fa-home text-primary"></i>
                <span>Dashboard</span>
                <div class="menu-tooltip">Dashboard</div>
            </a>
        </div>

        <div class="menu-section">
            <div class="menu-section-title">Learning Management</div>
            
            <div class="menu-item has-submenu" id="lmsSubmenu">
                <i class="fas fa-graduation-cap text-success"></i>
                <span>LMS Portal</span>
                <div class="menu-tooltip">Learning Management System</div>
            </div>
            
            <div class="submenu" id="lmsSubmenuItems">
                <?php
                require_once $_SERVER['DOCUMENT_ROOT'] . '/LMS/session.php';

                if (!isset($_SESSION['user'])) {
                    initializeUserSession();
                }

                $user_role = $_SESSION['user']['role'];

                if ($user_role === 'student') {
                ?>
                    <a href="./student.php" class="menu-item">
                        <i class="fas fa-user-graduate"></i>
                        <span>Student Portal</span>
                        <div class="menu-tooltip">Student Portal</div>
                    </a>
                <?php
                } elseif ($user_role === 'HOD') {
                ?>
                    <a href="./hod.php" class="menu-item">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>HOD Panel</span>
                        <div class="menu-tooltip">Head of Department</div>
                    </a>
                <?php
                } else {
                ?>
                    <a href="./staff.php" class="menu-item">
                        <i class="fas fa-users"></i>
                        <span>Staff Portal</span>
                        <div class="menu-tooltip">Staff Portal</div>
                    </a>
                <?php
                }
                ?>
            </div>
        </div>

        <div class="menu-section">
            <div class="menu-section-title">Analytics</div>
            
            <a href="#" class="menu-item">
                <i class="fas fa-chart-line text-info"></i>
                <span>Performance</span>
                <div class="menu-tooltip">Performance Analytics</div>
            </a>
            
            <a href="#" class="menu-item">
                <i class="fas fa-trophy text-warning"></i>
                <span>Achievements</span>
                <div class="menu-tooltip">Achievements</div>
            </a>
        </div>

        <div class="menu-section">
            <div class="menu-section-title">Settings</div>
            
            <a href="#" class="menu-item">
                <i class="fas fa-cog text-secondary"></i>
                <span>Preferences</span>
                <div class="menu-tooltip">Settings</div>
            </a>
            
            <!-- <a href="#" class="menu-item">
                <i class="fas fa-question-circle text-info"></i>
                <span>Help & Support</span>
                <div class="menu-tooltip">Help & Support</div>
            </a> -->
        </div>
    </div>

    <!-- <div class="user-profile-section">
        <div class="user-profile-item">
            <div class="user-avatar">
                <?php 
                $user_name = $_SESSION['user']['name'] ?? 'User';
                echo strtoupper(substr($user_name, 0, 1));
                ?>
            </div>
            <div class="user-info">
                <div class="user-name"><?php echo $user_name; ?></div>
                <div class="user-role"><?php echo ucfirst($_SESSION['user']['role'] ?? 'Guest'); ?></div>
            </div>
        </div>
    </div> -->
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar functionality
    initializeSidebarDropdowns();
    
    function initializeSidebarDropdowns() {
        // Submenu toggle functionality
        const lmsSubmenu = document.getElementById('lmsSubmenu');
        const lmsSubmenuItems = document.getElementById('lmsSubmenuItems');
        
        if (lmsSubmenu && lmsSubmenuItems) {
            lmsSubmenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other submenus if any
                document.querySelectorAll('.has-submenu.active').forEach(item => {
                    if (item !== this) {
                        item.classList.remove('active');
                        const submenu = item.nextElementSibling;
                        if (submenu) submenu.classList.remove('active');
                    }
                });
                
                // Toggle current submenu
                this.classList.toggle('active');
                lmsSubmenuItems.classList.toggle('active');
            });
        }

        // Auto-expand submenu if current page is a submenu item
        const currentPage = window.location.pathname.split('/').pop();
        if (['student.php', 'hod.php', 'staff.php'].includes(currentPage)) {
            if (lmsSubmenu && lmsSubmenuItems) {
                lmsSubmenu.classList.add('active');
                lmsSubmenuItems.classList.add('active');
            }
        }

        // Highlight active menu item
        const menuItems = document.querySelectorAll('.menu-item[href]');
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === './' + currentPage || href === currentPage) {
                item.classList.add('active');
                
                // If this is a submenu item, also activate its parent
                const parentSubmenu = item.closest('.submenu');
                if (parentSubmenu) {
                    const parentToggle = parentSubmenu.previousElementSibling;
                    if (parentToggle && parentToggle.classList.contains('has-submenu')) {
                        parentToggle.classList.add('active');
                        parentSubmenu.classList.add('active');
                    }
                }
            }
        });
        
        // Handle sidebar collapse/expand behavior for submenus
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // When sidebar is collapsed, hide all submenus
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isCollapsed = sidebar.classList.contains('collapsed');
                        const submenus = document.querySelectorAll('.submenu');
                        
                        submenus.forEach(submenu => {
                            if (isCollapsed) {
                                submenu.style.display = 'none';
                            } else {
                                submenu.style.display = '';
                            }
                        });
                    }
                });
            });
            
            observer.observe(sidebar, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});
</script>