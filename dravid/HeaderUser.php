<p class='logo'>E-FERTILIZER ASSISTANCE</p>

<?php

	//session_start();
    if($_SESSION['username'] == '')
    {
    	echo"<div class='navbar'>
				<a href='index.php'>Information</a>
				<a href='Registration.php'>Registration</a>
				<a href='Login.php'>Login</a>
				<a href='ContactUs.php'>Contact Us</a>
			</div>";
    }
    else
    {

    	echo"<div class='navbar'>
			  	<a href='ViewProduct.php'>Information</a>
			  	<a href='AddQuery.php'>Query Entry</a>
			  	<a href='ViewQueryRepliesUser.php'>View Query Replies</a>
    			<a href='ViewCart.php'>Cart </a>
		        <a href='ViewStatus.php'>Status</a>
		        <a href='ChangePassword.php'>Change Password</a>
		        <a href='Login.php'>Logout</a>
			</div>";
    
    }
    
?>
