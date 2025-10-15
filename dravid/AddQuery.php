<?php
session_start();
include_once('Db.php');
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
	//include('Header.php');
//include('HeaderUser.php');
echo "<center>";

echo "	<table  align='center' cellspacing='0' cellpadding='0' border='1'>";


echo "<p align='left' width='130'>";
include('HeaderUser.php');
echo "</p>";
echo "</td>";

	
	
	$query= mysqli_query($con,"Select Count(*)+1 as cnt From QueryTable");
	$row = mysqli_fetch_assoc($query);
	$Id=$row['cnt'];

	?>
		
	<form action="AddQueryCode.php" method="post" enctype="multipart/form-data">
		<td valign='top'><table class="table table-striped" align="center" style='width:50%'>
			<tr>
				<td colspan="2" class="heading">NEW QUERY ENTRY</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
				<td align="right">S.No:</td> <td><input type="text" name="txtId" value="<?php echo $Id; ?>" readonly /></td>
			</tr>
			<tr>
				<td align="right">Title:</td> <td><input type="text" name="txtName" Required/></td>
			</tr>
			<tr> 
			<td align="right">Category:</td>
				<td>
					 <select name="ddCategory" Required>
                         <option value="">Select</option>
                         <option value="Crop">Crop</option>
                         <option value="Fertilizer">Fertilizer</option>
                         
                         
					</select> 
				</td>
			</tr>
			
			<tr>
				<td align="right">Description:</td> <td><textarea name="txtDescription" Required></textarea></td>
			</tr>
			<tr>
				<td></td> <td><input type="submit" name="btnSubmit" value="Submit" class="btn_submit" style="width:147px;"/></td>
			</tr>
		</table>
		
		
		<table class="table" align="center" style='width:90%'>
		<tr><td colspan="9" align="center"><b>QUERY DETAILS</b><br><br><td><tr>
		
		<tr><th>S.No</th><th>Title</th><th>Category</th><th>Entry Date</th><th>Details</th><th>Customer Id</th><th>Reply Date</th><th>Reply Message</th><th>Status</th></tr>
		<?php
		$query = mysqli_query($con,"Select * From QueryTable Where UserID='" . $_SESSION['username'] . "'");
			
		While($r = mysqli_fetch_assoc($query))
		{
			if($r['ReplyDate']=="0000-00-00")
			{
				echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . "&nbsp;" . "</td><td>" . $r['ReplyDetails'] . "</td><td>" . $r['Status'] . "</td></tr>";
			}
			else
				
				{
			echo "<tr><td>" . $r['SNo'] . "</td><td>" . $r['Title'] . "</td><td>" . $r['Category'] . "</td><td>" . $r['EntryDate'] . "</td><td>" . $r['QueryDetails'] . "</td><td>" . $r['UserID'] . "</td><td>" . $r['ReplyDate'] . "</td><td>" . $r['ReplyDetails'] . "</td><td>" . $r['Status'] . "</td></tr>";
				}
		}
		
		mysqli_close($con);
		?>
		</table>
		</td>
		</tr>
		</table>
	</form>

</body>

</html>