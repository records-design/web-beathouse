<?php
function slugify(string $text): string {
    $text = mb_strtolower($text, 'UTF-8');
    $text = strtr($text, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n','ã'=>'a','â'=>'a','ê'=>'e','ô'=>'o','ç'=>'c']);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', trim($text));
    return trim($text, '-');
}

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function renderFlash(?array $flash): string {
    if (!$flash) return '';
    $cls = $flash['type'] === 'success' ? 'flash-success' : 'flash-error';
    return '<div class="flash '.$cls.'">'.h($flash['msg']).'</div>';
}

function statusBadge(string $status): string {
    $labels = ['published'=>'Publicado','draft'=>'Borrador','hidden'=>'Oculto','archived'=>'Archivado'];
    $classes = ['published'=>'badge-green','draft'=>'badge-yellow','hidden'=>'badge-gray','archived'=>'badge-red'];
    $label = $labels[$status] ?? $status;
    $cls = $classes[$status] ?? 'badge-gray';
    return '<span class="badge '.$cls.'">'.h($label).'</span>';
}

function roleBadge(string $role): string {
    $cls = $role === 'admin' ? 'badge-green' : 'badge-yellow';
    return '<span class="badge '.$cls.'">'.h(ucfirst($role)).'</span>';
}

function renderLayout(string $title, string $content, array $user): string {
    $isAdmin = $user['role'] === 'admin';
    $nav = '
        <a href="/php-admin/dashboard.php" class="nav-link">&#x1F4CA; Dashboard</a>
        <a href="/php-admin/artists.php" class="nav-link">&#x1F3A4; Artistas</a>
        <a href="/php-admin/releases.php" class="nav-link">&#x1F3B5; Lanzamientos</a>
        <a href="/php-admin/media.php" class="nav-link">&#x1F5BC; Archivos</a>
        '.($isAdmin ? '<a href="/php-admin/users.php" class="nav-link">&#x1F465; Usuarios</a>' : '').'
        <a href="/php-admin/account.php" class="nav-link">&#x1F511; Mi cuenta</a>
        <a href="/php-admin/logout.php" class="nav-link nav-logout">&#x23FB; Cerrar sesi&oacute;n</a>
    ';
    return '<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>'.h($title).' &mdash; BeatHouse Admin</title>
<link rel="stylesheet" href="/php-admin/assets/admin.css">
</head>
<body>
<div class="admin-wrap">
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-name">BEATHOUSE</span>
      <span class="brand-sub">ADMIN</span>
    </div>
    <nav class="sidebar-nav">'.$nav.'</nav>
    <div class="sidebar-user">
      <span class="user-name">'.h($user['username']).'</span>
      '.roleBadge($user['role']).'
    </div>
  </aside>
  <main class="main-content">
    <div class="page-inner">
      '.$content.'
    </div>
  </main>
</div>
</body>
</html>';
}
