<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();

$search = trim($_GET['q'] ?? '');
$status = $_GET['status'] ?? '';

$where = ["status != 'archived'"];
$params = [];
if ($search !== '') {
    $where[] = "(name LIKE ? OR genre LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if (in_array($status, ['published','draft','hidden'])) {
    $where[] = "status = ?";
    $params[] = $status;
}
$whereSql = implode(' AND ', $where);
$stmt = $pdo->prepare("SELECT * FROM artists WHERE $whereSql ORDER BY roster_order ASC, name ASC");
$stmt->execute($params);
$artists = $stmt->fetchAll();

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Artistas</h1>
  <a href="/php-admin/artist-edit.php?id=new" class="btn btn-primary">+ Nuevo artista</a>
</div>

<?= renderFlash($flash) ?>

<form method="GET" class="filter-bar">
  <input type="text" name="q" placeholder="Buscar por nombre o género..." value="<?= h($search) ?>" class="filter-input">
  <select name="status" class="filter-select">
    <option value="">Todos los estados</option>
    <option value="published" <?= $status==='published'?'selected':'' ?>>Publicado</option>
    <option value="draft" <?= $status==='draft'?'selected':'' ?>>Borrador</option>
    <option value="hidden" <?= $status==='hidden'?'selected':'' ?>>Oculto</option>
  </select>
  <button type="submit" class="btn btn-secondary">Filtrar</button>
  <?php if ($search || $status): ?>
  <a href="/php-admin/artists.php" class="btn btn-secondary">Limpiar</a>
  <?php endif; ?>
</form>

<table>
  <thead>
    <tr>
      <th style="width:50px">Foto</th>
      <th>Nombre</th>
      <th>Género</th>
      <th>Estado</th>
      <th title="Roster">R</th>
      <th title="Carousel">C</th>
      <th title="Ticker">T</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($artists as $a): ?>
    <tr>
      <td>
        <?php if ($a['main_image']): ?>
        <img src="<?= h($a['main_image']) ?>" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:50%;display:block;">
        <?php else: ?>
        <div style="width:40px;height:40px;border-radius:50%;background:#2e2e3e;display:flex;align-items:center;justify-content:center;font-size:18px;">&#x1F3A4;</div>
        <?php endif; ?>
      </td>
      <td><strong><?= h($a['name']) ?></strong><br><small style="color:#7070a0"><?= h($a['slug']) ?></small></td>
      <td><?= h($a['genre'] ?? '—') ?></td>
      <td><?= statusBadge($a['status']) ?></td>
      <td><?= $a['show_in_roster']   ? '<span class="check-yes">&#10003;</span>' : '<span class="check-no">&#10007;</span>' ?></td>
      <td><?= $a['show_in_carousel'] ? '<span class="check-yes">&#10003;</span>' : '<span class="check-no">&#10007;</span>' ?></td>
      <td><?= $a['show_in_ticker']   ? '<span class="check-yes">&#10003;</span>' : '<span class="check-no">&#10007;</span>' ?></td>
      <td class="action-cell">
        <a href="/php-admin/artist-edit.php?id=<?= $a['id'] ?>" class="btn btn-secondary btn-sm">Editar</a>
        <form method="POST" action="/php-admin/artist-edit.php" style="display:inline" onsubmit="return confirm('¿Archivar este artista?')">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="id" value="<?= $a['id'] ?>">
          <input type="hidden" name="action" value="archive">
          <button type="submit" class="btn btn-danger btn-sm">Archivar</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$artists): ?>
    <tr><td colspan="8" style="text-align:center;color:#7070a0;padding:40px">Sin artistas que mostrar.</td></tr>
  <?php endif; ?>
  </tbody>
</table>
<?php
$content = ob_get_clean();
echo renderLayout('Artistas', $content, $user);
