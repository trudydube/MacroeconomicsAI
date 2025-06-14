<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header('Content-Type: application/octet-stream');
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST']; 
$baseUrl = $protocol . $host;


$servername = "xxx-xxx-xxx";
$dbusername = "xxx-xxx-xxx";
$dbpassword = "xxx-xxx-xxx";
$dbname = "xxx-xxx-xxx";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed."]));
}

$username = $_GET["username"];

if (!$username) {
    die(json_encode(["error" => "Invalid request."]));
}

$stmt = $conn->prepare("SELECT fileName, filePath, dateAdded FROM Reports WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$reports = [];
while ($row = $result->fetch_assoc()) {
    $reports[] = [
        "fileName" => $row["fileName"],
        "dateAdded" => $row["dateAdded"],
        "downloadUrl" => $baseUrl. "/src/app/download_file.php?fileName=" . urlencode($row["fileName"]) . "&fileType=report"
    ];
}

$stmt->close();
$conn->close();

echo json_encode($reports);
?>
