<?php
error_reporting(0);
session_start();
?>
<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	include('HeaderUser.php');
	?>
	</td>
	
	<div class="tbl">Welcome.....   <?php echo $_SESSION["username"]; ?> </div>
	
</table>
</body>

</html>