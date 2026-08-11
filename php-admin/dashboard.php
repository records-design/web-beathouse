<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();

$totalArtists   = $pdo->query("SELECT COUNT(*) FROM artists WHERE status != 'archived'")->fetchColumn();
$pubArtists     = $pdo->query("SELECT COUNT(*) FROM artists WHERE status = 'published'")->fetchColumn();
$totalReleases  = $pdo->query("SELECT COUNT(*) FROM releases WHERE status != 'archived'")->fetchColumn();
$pubReleases    = $pdo->query("SELECT COUNT(*) FROM releases WHERE status = 'published'")->fetchColumn();
$totalUsers     = $pdo->query("SELECT COUNT(*) FROM users WHERE active = 1")->fetchColumn();
$draftArtists   = $pdo->query("SELECT COUNT(*) FROM artists WHERE status = 'draft'")->fetchColumn();
$draftReleases  = $pdo->query("SELECT COUNT(*) FROM releases WHERE status = 'draft'")->fetchColumn();

$recentArtists = $pdo->query("SELECT id, name, status, genre, created_at FROM artists WHERE status != 'archived' ORDER BY created_at DESC LIMIT 5")->fetchAll();
$recentReleases = $pdo->query("
    SELECT r.id, r.title, r.status, r.type, r.release_date, a.name as artist_name
    FROM releases r JOIN artists a ON r.artist_id = a.id
    WHERE r.status != 'archived'
    ORDER BY r.created_at DESC LIMIT 5
")->fetchAll();

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Dashboard</h1>
  <div class="quick-actions">
    <a href="/php-admin/artist-edit.php?id=new" class="btn btn-primary btn-sm">+ Artista</a>
    <a href="/php-admin/release-edit.php?id=new" class="btn btn-secondary btn-sm">+ Lanzamiento</a>
  </div>
</div>

<?= renderFlash($flash) ?>

<div class="stat-cards">
  <div class="stat-card">
    <div class="stat-value"><?= $pubArtists ?></div>
    <div class="stat-label">Artistas publicados</div>
    <div class="stat-sub"><?= $totalArtists ?> total &middot; <?= $draftArtists ?> borradores</div>
  </div>
  <div class="stat-card">
    <div class="stat-value"><?= $pubReleases ?></div>
    <div class="stat-label">Lanzamientos publicados</div>
    <div class="stat-sub"><?= $totalReleases ?> total &middot; <?= $draftReleases ?> borradores</div>
  </div>
  <div class="stat-card">
    <div class="stat-value"><?= $totalUsers ?></div>
    <div class="stat-label">Usuarios activos</div>
    <div class="stat-sub">Sesión: <?= h($user['username']) ?> (<?= h($user['role']) ?>)</div>
  </div>
</div>

<div class="dashboard-cols">
  <div class="dash-col">
    <h2 class="section-title">Artistas recientes</h2>
    <table>
      <thead><tr><th>Nombre</th><th>Género</th><th>Estado</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($recentArtists as $a): ?>
        <tr>
          <td><?= h($a['name']) ?></td>
          <td><?= h($a['genre'] ?? '—') ?></td>
          <td><?= statusBadge($a['status']) ?></td>
          <td><a href="/php-admin/artist-edit.php?id=<?= $a['id'] ?>" class="btn btn-secondary btn-sm">Editar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$recentArtists): ?><tr><td colspan="4" style="color:#7070a0">Sin artistas aún.</td></tr><?php endif; ?>
      </tbody>
    </table>
    <a href="/php-admin/artists.php" class="view-all">Ver todos los artistas &rarr;</a>
  </div>

  <div class="dash-col">
    <h2 class="section-title">Lanzamientos recientes</h2>
    <table>
      <thead><tr><th>Título</th><th>Artista</th><th>Tipo</th><th>Estado</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($recentReleases as $r): ?>
        <tr>
          <td><?= h($r['title']) ?></td>
          <td><?= h($r['artist_name']) ?></td>
          <td><span class="badge badge-gray"><?= h(strtoupper($r['type'])) ?></span></td>
          <td><?= statusBadge($r['status']) ?></td>
          <td><a href="/php-admin/release-edit.php?id=<?= $r['id'] ?>" class="btn btn-secondary btn-sm">Editar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$recentReleases): ?><tr><td colspan="5" style="color:#7070a0">Sin lanzamientos aún.</td></tr><?php endif; ?>
      </tbody>
    </table>
    <a href="/php-admin/releases.php" class="view-all">Ver todos los lanzamientos &rarr;</a>
  </div>
</div>
<?php
$content = ob_get_clean();
echo renderLayout('Dashboard', $content, $user);
