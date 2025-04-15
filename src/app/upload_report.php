<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "sql7.freesqldatabase.com";
$dbusername = "sql7739145";
$dbpassword = "NcBLLk5Kem";
$dbname = "sql7739145";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed.'])); 
}

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'message' => 'Invalid request.'])); 
}

// Ensure we have the necessary data
$username = $_POST['username'] ?? null;
$fileName = $_POST['fileName'] ?? null;
$filePath = $_POST['filePath'] ?? null;

if (!$username || !$fileName || !$filePath) {
    die(json_encode(['success' => false, 'message' => 'Username, file name, or file path missing.']));
}


$stmt = $conn->prepare("INSERT INTO Reports (fileName, filePath, username) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $fileName, $filePath, $username);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Report file path saved successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save report file path.']);
}

$stmt->close();
$conn->close();
?>
