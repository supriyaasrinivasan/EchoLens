<?php
    session_start();

    if($_SESSION["username"] == '')
    {
        header('location:Login.php');
    }
    else
    {

        include_once('Db.php');
    $query= mysqli_query($con,"Select MAX(Sno) as max From CartTable");
    $row = mysqli_fetch_assoc($query);
    $Id=$row['max']+1;

	$UserId=$_SESSION["username"];
    $ProductId = '';
    $ProductName = '';
    $Quantity=$_POST["txtQuantity"];
    $Price='';


    // checking for (-) values in quantity
    if($Quantity <= 0)
    {
        echo "Invalid Quantity";
        return;
    }


    foreach($_POST as $name => $content){
    $ProductId = $name;
    }

    // checking for stock availability
    $query = mysqli_query($con,"Select Quantity From StockTable Where ProductID = '". $ProductId ."' ");
    $row = mysqli_fetch_assoc($query);
    if($row['Quantity'] < $Quantity)
    {
         echo "Insufficient Stock";
        return;
    }


    $query = mysqli_query($con,"Select * From StockTable Where ProductId = '". $ProductId ."' ");
    if($r = mysqli_fetch_assoc($query))
    {
        $ProductName = $r['ProductName'];
        $Price = $r['SellingPrice'];
    }
    $Total = $Price * $Quantity;
		
	$qry="Insert Into CartTable Values('". $Id ."','". $UserId ."','". $ProductId ."','". $ProductName ."','". $Price ."','". $Quantity ."', '". $Total ."')";
	mysqli_query($con,$qry) or die(mysqli_error());
    header('location:ViewProduct.php');
	mysqli_close($con);
    }
?>