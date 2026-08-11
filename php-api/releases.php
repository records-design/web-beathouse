<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../php-admin/includes/db.php';

try {
    $pdo  = getDB();
    $stmt = $pdo->query("
        SELECT r.*, a.name AS artist_name, a.slug AS artist_slug
        FROM releases r
        JOIN artists a ON r.artist_id = a.id
        WHERE r.status = 'published'
          AND (r.publish_at IS NULL OR r.publish_at <= NOW())
        ORDER BY r.featured DESC, r.sort_order ASC, r.release_date DESC
    ");
    echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
