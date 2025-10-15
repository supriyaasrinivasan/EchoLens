<?php
	include_once('Db.php');
	
	$Id=$_POST["txtId"];
	$SupplierName=$_POST["txtSupplierName"];
	$CompanyName=$_POST["txtCompanyName"];
	$Address=$_POST["txtAddress"];
	$ContactNo=$_POST["txtContactNo"];
	$MailId=$_POST["txtMailId"];
		
	$qry="Insert Into SupplierTable Values('". $Id ."','". $SupplierName ."','". $CompanyName ."','". $Address ."','". $ContactNo ."','". $MailId ."')";
	mysqli_query($con,$qry) or die(mysqli_error());
    header('location:AddSupplier.php');
	mysqli_close($con);
?>