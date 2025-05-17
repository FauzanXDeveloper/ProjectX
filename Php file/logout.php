<?php
session_start();
session_unset();  // Clear all session data
session_destroy(); // Destroy the session
header("Location: ../Html File/index.html"); // Redirect to login page
exit();
?>
