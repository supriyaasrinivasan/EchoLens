$(document).ready(function() {
    // Ensure Inter font is applied consistently across all elements
    $('.btn-outline-primary, .nav-link, .form-control, .btn').each(function() {
        $(this).css('font-family', 'Inter, sans-serif');
    });
    
    // Apply Manrope font for headings
    $('h1, h2, h3, h4, h5, h6, .brand-text, .modal-title').each(function() {
        $(this).css('font-family', 'Manrope, sans-serif');
    });
    
    // Add modern styling to dynamically created elements
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).find('[style*="font-family"]').length > 0) {
            $(e.target).find('[style*="font-family"]').css('font-family', 'Inter, sans-serif');
        }
        
        // Apply brand styling to new buttons
        $(e.target).find('.btn').each(function() {
            if (!$(this).hasClass('styled')) {
                $(this).addClass('styled');
                $(this).css({
                    'font-family': 'Inter, sans-serif',
                    'font-weight': '600',
                    'border-radius': '0.75rem',
                    'transition': 'all 0.15s ease-in-out'
                });
            }
        });
    });
    
    // Add smooth animations to interactive elements
    $('.nav-link, .btn, .card').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
    
    // Initialize theme preference
    const savedTheme = localStorage.getItem('syraa-lambda-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});
