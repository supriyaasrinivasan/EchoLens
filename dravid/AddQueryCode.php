<?php
	
	session_start();
	
include_once('Db.php');
	
$Id=$_POST["txtId"];
	$Name=$_POST["txtName"];
	
	$Category=$_POST["ddCategory"];
	$Description=$_POST["txtDescription"]; 

	
	$qry="Insert Into QueryTable Values('". $Id ."','". $Name ."','". $Category ."','". date('Y-m-d') ."','". $Description ."','" . $_SESSION['username'] . "','','','Pending')";
	mysqli_query($con,$qry) or die(mysqli_error());
    
    mysqli_close($con);
	header('location:AddQuery.php');

?>