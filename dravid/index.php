<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy-main">

	
	<?php
	include('Header.php');
	session_start();
	$_SESSION["type"] = '';
	$_SESSION["page"] = '';
	$_SESSION["username"] ='';
	$_SESSION["Search"] = '';
	header('location:ViewProduct.php');
	?>
	
	
</body>

</html>