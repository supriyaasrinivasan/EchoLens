<?php
session_start();

	$con = mysql_connect("localhost","root",'',"FertilizerAssistance");
	mysql_select_db("tyreshowroom");
	if (!$con)
	{
		die('Could not connect: ' . mysqli_error());
	}
?>

<html>
<head>
<link rel="stylesheet" href="css/bootstrap.min.css">
  <script src="css/jquery.min.js"></script>
  <script src="css/bootstrap.min.js"></script>
  <link rel="stylesheet" href="css/all.css"></link>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
    <script type="text/javascript">
    function Message() {
        alert ("Added Successfully!");
    }
    </script>
</head>

<body id="bdy">

	<?php
	include('pagetop.php');
	echo "	<table  align='center' cellspacing='0' cellpadding='0' border='1'>";
	if($_SESSION['usertype']=="admin")
	{
	include('menutable.php');
echo "<p align='left' width='130'>";

echo "</p>";
echo "</td>";

	}
	else
	{
		include('menutablecustomer.php');
echo "<p align='left' width='130'>";

echo "</p>";
echo "</td>";

		}
		?>
	<form action="" method="post" enctype="multipart/form-data">
		
		
		<td valign='top'><table class="table table-striped" align="center" style='width:100%'>
		<tr><td colspan="9" align="center"><b>QUERY DETAILS</b><br><br><td><tr>
		
		<tr><th>S.No</th><th>Title</th><th>Category</th><th>Entry Date</th><th>Details</th><th>Customer Id</th><th>Reply Date</th><th>Reply Message</th><th>Status</th></tr>
		<?php
		if($_SESSION['usertype']=="admin")
		{
			$query = mysqli_query($con,"Select * From QueryTable");
		}
		else
			
			{
		$query = mysqli_query($con,"Select * From QueryTable Where CustomerId='" . $_SESSION['username'] . "'");
			}	
		While($r = mysqli_fetch_assoc($query))
		{
			
			if($r['ReplyDate']=="0000-00-00")
			{
				
				if($r['Status']=='Pending')
				{
					echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['CustomerId'] . "</td><td>" . "&nbsp;" . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:red;font-size:18px'>" . $r['Status'] . "</td></tr>";
				}
				else
				{
					echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['CustomerId'] . "</td><td>" . "&nbsp;" . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:green;font-size:14px'>" . $r['Status'] . "</td></tr>";
				}
				}
				else
				{
					if($r['Status']=='Pending')
			{
				echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['CustomerId'] . "</td><td>" . $r['ReplyDate'] . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:red;font-size:18px'>" . $r['Status'] . "</td></tr>";
			}
			else
			{
			echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['CustomerId'] . "</td><td>" . $r['ReplyDate'] . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:green;font-size:14px'>" . $r['Status'] . "</td></tr>";
			}
				}
		}
		echo "</table>";
		
		
		?>
	
		</td>
		</tr>
		</table>
	</form>

</body>

</html>