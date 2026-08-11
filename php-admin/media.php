<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    verifyCsrf();
    $filepath = $_POST['filepath'] ?? '';
    if ($filepath && strpos($filepath, '..') === false) {
        $absPath = __DIR__ . '/../' . ltrim($filepath, '/');
        if (file_exists($absPath)) {
            unlink($absPath);
            setFlash('success', 'Archivo eliminado.');
        }
    }
    header('Location: /php-admin/media.php');
    exit;
}

// Collect referenced images
$referenced = [];
foreach ($pdo->query("SELECT main_image, carousel_image FROM artists")->fetchAll() as $r) {
    if ($r['main_image'])     $referenced[$r['main_image']] = true;
    if ($r['carousel_image']) $referenced[$r['carousel_image']] = true;
}
foreach ($pdo->query("SELECT cover_image FROM releases")->fetchAll() as $r) {
    if ($r['cover_image']) $referenced[$r['cover_image']] = true;
}

// Scan uploads directory
$uploadsDir = __DIR__ . '/../uploads';
$files = [];
$extensions = ['jpg','jpeg','png','webp','gif'];
$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploadsDir, FilesystemIterator::SKIP_DOTS));
foreach ($rii as $f) {
    if (!$f->isFile()) continue;
    $ext = strtolower($f->getExtension());
    if (!in_array($ext, $extensions)) continue;
    $relPath = '/uploads' . str_replace($uploadsDir, '', $f->getPathname());
    $relPath = str_replace('\\', '/', $relPath);
    $size    = $f->getSize();
    $info    = @getimagesize($f->getPathname());
    $files[] = [
        'path'     => $relPath,
        'name'     => $f->getFilename(),
        'size'     => $size,
        'width'    => $info ? $info[0] : 0,
        'height'   => $info ? $info[1] : 0,
        'mtime'    => $f->getMTime(),
        'inuse'    => isset($referenced[$relPath]),
    ];
}
usort($files, fn($a,$b) => $b['mtime'] - $a['mtime']);

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Archivos</h1>
  <span style="color:#7070a0"><?= count($files) ?> archivos encontrados</span>
</div>
<?= renderFlash($flash) ?>

<?php if (!$files): ?>
<p style="color:#7070a0;padding:40px 0;text-align:center">No hay archivos subidos todavía.</p>
<?php else: ?>
<div class="media-grid">
  <?php foreach ($files as $f): ?>
  <div class="media-item <?= $f['inuse'] ? 'media-inuse' : '' ?>">
    <div class="media-thumb">
      <img src="<?= h($f['path']) ?>" alt="<?= h($f['name']) ?>" loading="lazy">
    </div>
    <div class="media-info">
      <div class="media-name" title="<?= h($f['path']) ?>"><?= h($f['name']) ?></div>
      <div class="media-meta">
        <?= $f['width'] ? $f['width'].'&times;'.$f['height'].'px &middot; ' : '' ?>
        <?= number_format($f['size'] / 1024, 1) ?> KB
      </div>
      <?php if ($f['inuse']): ?>
      <span class="badge badge-green" style="font-size:10px">En uso</span>
      <?php else: ?>
      <form method="POST" style="display:inline" onsubmit="return confirm('¿Eliminar este archivo?')">
        <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="filepath" value="<?= h($f['path']) ?>">
        <button type="submit" class="btn btn-danger btn-sm" style="margin-top:6px">Eliminar</button>
      </form>
      <?php endif; ?>
    </div>
  </div>
  <?php endforeach; ?>
</div>
<?php endif; ?>
<?php
$content = ob_get_clean();
echo renderLayout('Archivos', $content, $user);
