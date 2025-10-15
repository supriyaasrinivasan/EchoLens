<?php
session_start();
include_once('Db.php');
?>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">

	<?php
	include('HeaderUser.php');
	include('Db.php');

		?>
	<form action="ViewQueryRepliesAdminCode.php" method="post" enctype="multipart/form-data">
		<table class="table table-striped" align="center" style='width:100%'>
		<tr><td colspan="9" align="center"><b>QUERY DETAILS</b><br><br><td><tr>
		
		<tr><th>Query Id</th><th>About</th><th>Category</th><th>Entry Date</th><th>Details</th><th>User</th><th>Date of Reply</th><th>Reply Details</th><th>Status</th></tr>
		<?php
		if($_SESSION['usertype']=="admin")
		{
			$query = mysqli_query($con,"Select * From QueryTable");
		}
		else
			
			{
		$query = mysqli_query($con,"Select * From QueryTable Where UserID='" . $_SESSION['username'] . "'");
			}	
		While($r = mysqli_fetch_assoc($query))
		{
			
			if($r['ReplyDate']=="0000-00-00")
			{
				
				if($r['Status']=='Pending')
				{
					echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . "&nbsp;" . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:red;font-size:18px'>" . $r['Status'] . "</td></tr>";
				}
				else
				{
					echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . "&nbsp;" . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:green;font-size:14px'>" . $r['Status'] . "</td></tr>";
				}
				}
				else
				{
					if($r['Status']=='Pending')
			{
				echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . $r['ReplyDate'] . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:red;font-size:18px'>" . $r['Status'] . "</td></tr>";
			}
			else
			{
			echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . $r['ReplyDate'] . "</td><td>" . $r['ReplyDetails'] . "</td><td style='color:green;font-size:14px'>" . $r['Status'] . "</td></tr>";
			}
				}
		}
		echo "</table>";
		
		
		
		
		mysqli_close($con);

		?>
	
		</td>
		</tr>
		</table>
	</form>

</body>

</html>