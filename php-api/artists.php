<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../php-admin/includes/db.php';

$section = $_GET['section'] ?? 'roster';

switch ($section) {
    case 'carousel':
        $field = 'show_in_carousel';
        $order = 'carousel_order ASC';
        break;
    case 'ticker':
        $field = 'show_in_ticker';
        $order = 'ticker_order ASC';
        break;
    default: // roster
        $field = 'show_in_roster';
        $order = 'roster_order ASC, name ASC';
}

try {
    $pdo  = getDB();
    $stmt = $pdo->query("SELECT * FROM artists WHERE status = 'published' AND $field = 1 ORDER BY $order");
    echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
