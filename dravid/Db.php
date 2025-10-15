<?php
// Robust DB connection helper for legacy includes that expect $con
// Credentials (keep as-is for now; consider moving to a config file or env vars)
$DB_HOST = 'db.fr-pari1.bengt.wasmernet.com';
$DB_USER = 'c9b99b297bd68000428b6d2d51a2';
$DB_PASS = '068ec9b9-9b29-7f41-8000-caac63de6e09';
$DB_NAME = 'FertilizerAssistance';

// Turn off default mysqli exception reporting; we'll handle errors explicitly
mysqli_report(MYSQLI_REPORT_OFF);

/**
 * Return a mysqli connection. Uses a static connection and will attempt reconnects.
 * Throws an Exception if connection cannot be established.
 *
 * @return mysqli
 */
function db_connect()
{
	global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME;
	static $con = null;

	// reuse if valid
	if ($con instanceof mysqli) {
		if (@$con->ping()) {
			return $con;
		}
		// close broken connection
		@$con->close();
		$con = null;
	}

	$attempts = 0;
	$maxAttempts = 3;
	$lastException = null;

	while ($attempts < $maxAttempts) {
		$attempts++;
		try {
			$mysqli = mysqli_init();
			if ($mysqli === false) {
				throw new Exception('mysqli_init failed');
			}

			// short connect timeout
			if (function_exists('mysqli_options')) {
				// set connect timeout where available
				@$mysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
			}
			ini_set('mysqli.connect_timeout', 5);

			// use real_connect for better control
			if (!@$mysqli->real_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME)) {
				throw new Exception('Connect error: ' . mysqli_connect_error());
			}

			// set charset
			@$mysqli->set_charset('utf8mb4');

			$con = $mysqli;
			return $con;
		} catch (Exception $e) {
			$lastException = $e;
			// small backoff before retrying
			if ($attempts < $maxAttempts) {
				sleep(1);
				continue;
			}
			// Log internal error for admins; do not expose sensitive info to users
			error_log('[Db.php] DB connection failed: ' . $e->getMessage());
			throw $e;
		}
	}

	throw $lastException ?: new Exception('Unknown DB connection error');
}

// Provide $con variable for existing files that expect it when including Db.php
try {
	$con = db_connect();
} catch (Exception $e) {
	// If running in a web request, return a generic error message and stop.
	if (php_sapi_name() !== 'cli') {
		http_response_code(500);
		echo 'Database connection error. Please try again later.';
		exit;
	}
	// For CLI, rethrow so the caller can see the error
	throw $e;
}

?>