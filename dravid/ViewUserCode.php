<?php
	include_once('Db.php');

	$Id = "";
	foreach ($_POST as $name => $content) {
	    $Id = $name;
	}

	// Use prepared statement to delete user
	$stmt = $con->prepare('DELETE FROM UserTable WHERE UserId = ?');
	if ($stmt) {
	    $stmt->bind_param('s', $Id);
	    $stmt->execute();
	    $stmt->close();
	} else {
	    error_log('[ViewUserCode] delete prepare failed: ' . $con->error);
	}

	header('location:ViewUser.php');
?>