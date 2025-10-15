<?php
session_start();
include_once('Db.php');
?>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">

	<?php
	include('HeaderAdmin.php');
	

		?>
	<form action="ViewQueryRepliesAdminCode.php" method="post" enctype="multipart/form-data">
		<table class="table table-striped" align="center" style='width:100%'>
		<tr><td colspan="9" align="center" class="heading"><b>QUERY DETAILS</b><br><br><td><tr>
		
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
		
		if($_SESSION['usertype']=="admin")
	{
		
		$query1 = mysqli_query($con,"Select A.SNo,A.Title,A.UserID,B.UserName From QueryTable A,UserTable B Where B.UserID=A.UserID and A.Status='Pending' Order By A.SNo");
		
		echo "<center><table class='table table-striped' style='width:50%'><tr><td colspan='2'><h2>QUERY REPLY</h2></td></tr>";
		echo "<tr><td>Query Id</td><td>";
		
		echo "<select  name=cboid>";
		while($r = mysqli_fetch_assoc($query1))
		{
		echo "<option value='" . $r['SNo'] . "'>" . $r['SNo'] . ":" . $r['Title'] .  ":" . $r['UserID'] .  ":" . $r['UserName'] ."</option>";
		}
		echo  "</select>";
		echo "</td>";
		echo "</tr>";
		echo "<tr><td>Reply Details</td><td>";
		echo "<textarea name='txtreply' rows='3' cols=30'></textarea>";
		echo "</td>";
		echo "</tr>";
		echo "<tr><td>Status</td><td>";
		echo "<select name='cbostatus'>";
		echo "<option value='Finished'>Finished</option>";
		echo "<option value='Pending'>Pending</option>";
		echo "</td>";
		echo "</tr>";
		echo "<tr><td></td><td colspan='2'>";
		echo "<input type='submit' name='submit' value='Save' class='btn btn-info' style='font-weight:bold'></td></tr>";
		echo "</table>";
		
		mysqli_close($con);
	}
		?>
	
		</td>
		</tr>
		</table>
	</form>

</body>

</html>