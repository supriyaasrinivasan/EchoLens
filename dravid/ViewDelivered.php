<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	include('HeaderAdmin.php');
	include_once('Db.php');
	?>
	
<form action="ViewBookedCode.php" method="post">
	
	<table class="mygrid" align="center">
		
		<tr><td colspan="9" align="center" class="heading">SALES LIST<br><br><td><tr>
		<tr><th>InvoiceNo</th><th>InvoiceDate</th><th>UserName</th><th>Address</th><th>ContactNo</th><th>Quantity</th><th>Total</th></tr>
		
        <?php
            
        $query = mysqli_query($con,"Select InvoiceNo, InvoiceDate, UserTable.UserName, Address, ContactNo, Quantity as Qty, Total From SaleMaster LEFT JOIN UserTable ON SaleMaster.UserID = UserTable.UserID Where Status='DELIVERED'");
        while($r = mysqli_fetch_assoc($query))
        {
            echo "<tr><td>" . $r['InvoiceNo'] . "</td><td>" . $r['InvoiceDate'] . "</td><td>" . $r['UserName'] . "</td><td>" . $r['Address'] . "</td><td>" . $r['ContactNo'] ."</td><td>" . $r['Qty'] ."</td><td>". $r['Total'] ."</td></tr>";
        }	
        mysqli_close($con);
            
        ?>
		
	</table>

</form>
	
</body>

</html>