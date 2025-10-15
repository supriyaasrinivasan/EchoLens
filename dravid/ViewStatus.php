<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	session_start();
	include('HeaderUser.php');
	include_once('Db.php');
	?>
	
<form action="ViewBookedCode.php" method="post">
	
	<table class="mygrid" align="center">
		
		<tr><td colspan="7" align="center" class="heading">PURCHASE LIST<br><br><td><tr>
		<tr><th>InvoiceNo</th><th>UserID</th><th>UserName</th><th>InvoiceDate</th><th>Quantity</th><th>Total</th><th>Status</th></tr>
		
        <?php
            
        $query = mysqli_query($con,"Select InvoiceNo, UserId, UserName, InvoiceDate, Quantity, Total, Status From SaleMaster Where UserId = '". $_SESSION["username"] ."' ");
        while($r = mysqli_fetch_assoc($query))
        {
            echo "<tr><td>" . $r['InvoiceNo'] . "</td><td>" . $r['UserId'] . "</td><td>" . $r['UserName'] . "</td><td>" . $r['InvoiceDate'] . "</td><td>" . $r['Quantity'] ."</td><td>". $r['Total'] ."</td><td>". $r['Status'] ."</td></tr>";
        }	
        mysqli_close($con);
            
        ?>
		
	</table>

</form>
	
</body>

</html>