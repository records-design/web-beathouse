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
    $ico_dashboard    = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
    $ico_artists      = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>';
    $ico_releases     = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>';
    $ico_media        = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    $ico_users        = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    $ico_account      = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
    $ico_logout       = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

    $nav = '
        <a href="/php-admin/dashboard.php" class="nav-link">'.$ico_dashboard.' Dashboard</a>
        <a href="/php-admin/artists.php" class="nav-link">'.$ico_artists.' Artistas</a>
        <a href="/php-admin/releases.php" class="nav-link">'.$ico_releases.' Lanzamientos</a>
        <a href="/php-admin/media.php" class="nav-link">'.$ico_media.' Archivos</a>
        '.($isAdmin ? '<a href="/php-admin/users.php" class="nav-link">'.$ico_users.' Usuarios</a>' : '').'
        <a href="/php-admin/account.php" class="nav-link">'.$ico_account.' Mi cuenta</a>
        <a href="/php-admin/logout.php" class="nav-link nav-logout">'.$ico_logout.' Cerrar sesi&oacute;n</a>
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
      <img src="/php-admin/assets/logo.png" alt="BeatHouse" class="brand-logo">
      <div class="brand-sub">Panel de administración</div>
    </div>
    <nav class="sidebar-nav">'.$nav.'</nav>
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">'.strtoupper(substr($user['username'],0,1)).'</div>
      <div>
        <div class="user-name">'.h($user['username']).'</div>
        '.roleBadge($user['role']).'
      </div>
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
