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

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES)) {
    die(json_encode(['success' => false, 'message' => 'Invalid request. No files uploaded.']));
}

$username = $_POST['username'] ?? null;
$fileType = $_POST['fileType'] ?? null; 

if (!$username || !$fileType) {
    die(json_encode(['success' => false, 'message' => 'Username or file type missing.']));
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    die(json_encode(['success' => false, 'message' => 'File upload error.']));
}


$tableName = "";

if($fileType === "report"){
    $tableName = "Reports";
    $fileTmpPath = $_FILES['file']['tmp_name'];
    $fileExtension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $fileName = uniqid($username . "_", true) . "." . $fileExtension; // Unique filename
    $uploadDir = __DIR__ . "/public/"; 
    $filePath = $uploadDir . $fileName;

    $stmt = $conn->prepare("INSERT INTO $tableName (fileName, filePath, username) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $fileName, $filePath, $username);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => ucfirst($fileType) . ' uploaded successfully.', 
            'filePath' => "/public/" . $fileName
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload ' . $fileType . '.']);
    }
    
    $stmt->close();
    $conn->close();
    exit;

}

$fileName = $_FILES['file']['name'];
$fileData = file_get_contents($_FILES['file']['tmp_name']);

if ($fileType === "dataset") {
    $tableName = "Datasets"; 
} elseif ($fileType === "model") {
    $tableName = "Models";
} else {
    die(json_encode(['success' => false, 'message' => 'Invalid file type.']));
}


$stmt = $conn->prepare("INSERT INTO $tableName (fileName, file, username) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $fileName, $fileData, $username);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => ucfirst($fileType) . ' uploaded successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to upload ' . $fileType . '.']);
}

$stmt->close();
$conn->close();
?>
