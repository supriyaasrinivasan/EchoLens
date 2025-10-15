<?php
session_start();
	include_once('Db.php');
	
	$Id=$_POST["txtId"];
	$Name=$_POST["txtName"];
	$ForCrop=$_POST["txtForCrop"];
	$HowToUse=$_POST["txtHow"];
	$Benefits=$_POST["txtBenifit"];
	$D=$_POST["txtD"];
	$Unit=$_POST["ddUnit"];
	$ReOrderLevel=$_POST["txtReOrderLevel"]; 
	$file_name = "";
	
	if(isset($_FILES['fileUploader']))
	{
		$nameforExt = $_FILES['fileUploader']['name'];
		$ext = pathinfo($nameforExt, PATHINFO_EXTENSION);
        
        $file_name = $Id . '.' . $ext;
        $file_tmp =$_FILES['fileUploader']['tmp_name'];
        move_uploaded_file($file_tmp,"Image/Product/".$file_name);
	}
		
	$qry="Insert Into StockTable Values('". $Id ."','". $Name ."','". $ForCrop ."','". $HowToUse ."','". $Benefits ."','". $Unit ."',0,0,0,0,'". $ReOrderLevel ."','". $file_name ."','" . $D . "')";
	mysqli_query($con,$qry) or die(mysqli_error());
    mysqli_close($con);
    
	header('location:AddProduct.php');
?>