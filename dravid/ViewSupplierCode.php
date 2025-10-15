<?php
	include_once('Db.php');

    $Id = "";
    foreach($_POST as $name => $content){
    $Id = $name;
    }
	//$Id = array_keys($_POST)[0];
	$qry="Delete From SupplierTable Where SupplierId = '". $Id ."' ";
	mysqli_query($con,$qry) or die(mysqli_error());
	header('location:ViewSupplier.php');
?>