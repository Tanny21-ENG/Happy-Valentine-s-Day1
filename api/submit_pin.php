<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    // fallback to form-encoded
    $data = $_POST;
}

$pin = isset($data['pin']) ? trim($data['pin']) : null;
$success = isset($data['success']) ? (bool)$data['success'] : false;

if (!$pin || !preg_match('/^\d{1,6}$/', $pin)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid pin']);
    exit;
}

// Ensure data directory
$dbDir = __DIR__ . '/../data';
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}
$dbFile = $dbDir . '/pins.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE TABLE IF NOT EXISTS pins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pin TEXT NOT NULL,
        success INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $stmt = $pdo->prepare('INSERT INTO pins (pin, success) VALUES (:pin, :success)');
    $stmt->execute([
        ':pin' => $pin,
        ':success' => $success ? 1 : 0
    ]);

    echo json_encode(['ok' => true]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    // For development show error; remove message in production
    echo json_encode(['error' => 'DB error', 'message' => $e->getMessage()]);
    exit;
}
