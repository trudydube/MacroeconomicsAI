<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header('Content-Type: application/octet-stream');
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST']; 
$baseUrl = $protocol . $host;

$servername = "sql7.freesqldatabase.com";
$dbusername = "sql7775395";
$dbpassword = "jvGBISnIIa";
$dbname = "sql7775395";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed.']));
}

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"];
$response = ["datasets" => [], "models" => []];

$sqlDatasets = "SELECT fileName FROM Datasets WHERE username=?";
$stmt = $conn->prepare($sqlDatasets);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $row["downloadUrl"] = $baseUrl. "/src/app/download_file.php?fileName=" . urlencode($row["fileName"]) . "&fileType=dataset";
    $response["datasets"][] = $row;
}

$sqlModels = "SELECT fileName FROM Models WHERE username=?";
$stmt = $conn->prepare($sqlModels);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $row["downloadUrl"] = $baseUrl . "/src/app/download_file.php?fileName=" . urlencode($row["fileName"]) . "&fileType=model";
    $response["models"][] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($response);

?>
