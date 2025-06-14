<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "xxx-xxx-xxx";
$dbusername = "xxx-xxx-xxx";
$dbpassword = "xxx-xxx-xxx";
$dbname = "xxx-xxx-xxx";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed.']));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['roles'])) {
    die(json_encode(['success' => false, 'message' => 'Invalid request.']));
}

$username = $data['username'];
$roles = $data['roles'];

$allowedRoles = ['PolicyMaker', 'Economist', 'Researcher', 'GeneralUser', 'admin'];

$userRole = null;
foreach ($roles as $role) {
    if (in_array($role, $allowedRoles)) {
        $userRole = $role;
        break;
    }
}

if (!$userRole) {
    die(json_encode(['success' => false, 'message' => 'No valid role found.']));
}

$stmt = $conn->prepare("SELECT * FROM Users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt = $conn->prepare("SELECT * FROM Users WHERE role = ? AND username = ?");
    $stmt->bind_param("ss", $userRole, $username);
    $stmt->execute();
    $result1 = $stmt->get_result();
    if ($result1->num_rows > 0){
        die(json_encode(['success' => false, 'message' => 'User already exists.']));
    }
    
    $stmt = $conn->prepare("UPDATE Users SET role = ? WHERE username = ?");
    $stmt->bind_param("ss", $userRole, $username);
    $stmt->execute();
    $result2 = $stmt->get_result();
    die(json_encode(['success' => true, 'message' => 'User role successfully updated.']));
}


$stmt = $conn->prepare("INSERT INTO Users (username, role) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $userRole);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'User registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to register user.']);
}

$stmt->close();
$conn->close();

?>
