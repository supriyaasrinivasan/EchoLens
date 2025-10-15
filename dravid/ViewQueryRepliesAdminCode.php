<?php
	
	session_start();
	include_once('Db.php');
	$Id=$_POST["cboid"];
	$reply=$_POST["txtreply"];
	$status=$_POST["cbostatus"];
	
	$qry="Update QueryTable set ReplyDate='" . date('Y-m-d') . "',ReplyDetails='" .  $reply . "',Status='" . $status . "' Where SNo='" . $Id . "'";
	mysqli_query($con,$qry) or die(mysqli_error());
    mysqli_close($con);
	header('location:ViewQueryRepliesAdmin.php');

?>