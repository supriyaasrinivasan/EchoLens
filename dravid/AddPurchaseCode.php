<?php
	include_once('Db.php');
	
	$InvoiceNo=$_POST["txtInvoiceNo"];
	$Supplier=$_POST["ddSupplier"];
	$Product=$_POST["ddProduct"];
	$ExpiryDate=$_POST["txtExpiryDate"]; 
	$PurchasePrice=$_POST["txtPurchasePrice"]; 
	$Tax=$_POST["txtTax"]; 
	$SellingPrice=$_POST["txtSellingPrice"];
	$Quantity=$_POST["txtQuantity"]; 
	$Total=$_POST["txtTotal"]; 
	
	$qry="Insert Into PurchaseTable Values('". $InvoiceNo ."','". $Supplier ."','". $Product ."','". $PurchasePrice ."','". $Tax ."','". $Quantity ."','". $Total ."')";
	if(mysqli_query($con,$qry))
	{
		$qry="Update StockTable Set Quantity = Quantity + '". $Quantity ."' Where ProductID = '". $Product ."' ";
		mysqli_query($con,$qry) or die(mysqli_error());
		
		$qry="Update StockTable Set PurchasePrice = '". $PurchasePrice ."' Where ProductID = '". $Product ."' ";
		mysqli_query($con,$qry) or die(mysqli_error());

		$qry="Update StockTable Set Tax = '". $Tax ."' Where ProductID = '". $Product ."' ";
		mysqli_query($con,$qry) or die(mysqli_error());
		
		$qry="Update StockTable Set SellingPrice = '". $SellingPrice ."' Where ProductID = '". $Product ."' ";
		mysqli_query($con,$qry) or die(mysqli_error());
	}
	else
	{
		die(mysqli_error());
	}
    mysqli_close($con);
	header('location:AddPurchase.php');
?>