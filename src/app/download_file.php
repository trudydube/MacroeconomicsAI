<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = "sql7.freesqldatabase.com";
$dbusername = "sql7739145";
$dbpassword = "NcBLLk5Kem";
$dbname = "sql7739145";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die("Database connection failed.");
}

$fileName = $_GET["fileName"];
$fileType = $_GET["fileType"];

if (!$fileName || !$fileType) {
    die("Invalid request.");
}

if ($fileType === "dataset") {
    $tableName = "Datasets";
    $columnName = "file";
} elseif ($fileType === "model") {
    $tableName = "Models";
    $columnName = "file";
} elseif ($fileType === "report") {
    $tableName = "Reports"; 
    $columnName = "filePath";
} else {
    die("Invalid file type.");
}

$stmt = $conn->prepare("SELECT $columnName FROM $tableName WHERE fileName = ?");
$stmt->bind_param("s", $fileName);
$stmt->execute();
$stmt->bind_result($fileData);
$stmt->fetch();
$stmt->close();
$conn->close();

if ($fileType === "report") {
    if (!$fileData || !file_exists($fileData)) {
        die("File not found.");
    }

    if (!file_exists($fileData)) {
        echo("file path". $fileData);
        die("Error: File does not exist on the server.");
    }

    header("Content-Type: application/octet-stream");
    header("Content-Disposition: attachment; filename=\"" . basename($fileData) . "\"");
    header("Content-Length: " . filesize($fileData));
    
    readfile($fileData);
    exit();
}

if (!$fileData) {
    die("File not found.");
}

header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"$fileName\"");
echo $fileData;
?>
