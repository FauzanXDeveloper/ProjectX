<?php
$host = "localhost";
$user = "root";  // Change if necessary
$password = "";   // Change if necessary
$database = "family_tree"; // Your database name

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
