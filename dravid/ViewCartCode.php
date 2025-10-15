<?php
	include_once('Db.php');

	session_start();
	
    $Id = "";
    foreach($_POST as $name => $content){
    $Id = $name;
    }
	//$Id = array_keys($_POST)[0];
	
	if($Id == 'btnOrder')
	{
		$query= mysqli_query($con,"Select MAX(InvoiceNo) as max From SaleMaster");
		$row = mysqli_fetch_assoc($query);
		$InvoiceNo=$row['max']+1;
        
        $query= mysqli_query($con,"Select UserName From UserTable Where UserID = '". $_SESSION['username'] ."' ");
		$row = mysqli_fetch_assoc($query);
		$UserName=$row['UserName'];
		
		$Sno;
		$ProductID;
		$ProductName;
		$Price;
		$Quantity;
		$Total;
        $GrandQuantity=0;
		$GrandTotal=0;


		$qry=mysqli_query($con,"Select * From CartTable Where UserID = '". $_SESSION['username'] ."' ");
		while($r=mysqli_fetch_assoc($qry))
		{
			$query= mysqli_query($con,"Select MAX(Sno) as max From SaleTrans");
			$row = mysqli_fetch_assoc($query);
			$Sno=$row['max']+1;
			
			$ProductID = $r['ProductID'];
			$ProductName = $r['ProductName'];
			$Price = $r['Price'];
			$Quantity = $r['Quantity'];
			$Total = $Price * $Quantity;
            $GrandQuantity += $Quantity;
            $GrandTotal += $Total; 
			
			$query = "Insert Into SaleTrans Values('". $Sno ."','". $InvoiceNo ."','". $ProductID ."','". $ProductName ."','". $Price ."','". $Quantity ."','". $Total ."')";
			mysqli_query($con,$query) or die(mysqli_error());
		}
        
        $query = "Insert Into SaleMaster Values('". $InvoiceNo ."','". $_SESSION['username'] ."','". $UserName ."','". date('Y-m-d') ."','". $GrandQuantity ."','". $GrandTotal ."','PENDING')";
        mysqli_query($con,$query) or die(mysqli_error());
        
        $query = "Delete From CartTable Where UserID = '". $_SESSION['username'] ."' ";
        mysqli_query($con,$query) or die(mysqli_error());
        
	}
	else
	{
		$qry="Delete From CartTable Where Sno = '". $Id ."' ";
		mysqli_query($con,$qry) or die(mysqli_error());
	}
	header('location:ViewCart.php');
?>