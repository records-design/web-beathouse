<?php
function processImage(string $sourcePath, string $destDir, string $slug, string $type = 'artist'): array {
    if (!is_dir($destDir)) mkdir($destDir, 0755, true);

    $info = getimagesize($sourcePath);
    if (!$info) return ['error' => 'Archivo de imagen inválido'];

    $mime = $info['mime'];
    $srcW = $info[0];
    $srcH = $info[1];

    $src = null;
    if ($mime === 'image/jpeg') $src = imagecreatefromjpeg($sourcePath);
    elseif ($mime === 'image/png') $src = imagecreatefrompng($sourcePath);
    elseif ($mime === 'image/webp') $src = imagecreatefromwebp($sourcePath);
    if (!$src) return ['error' => 'No se pudo procesar la imagen'];

    $sizes = $type === 'artist'
        ? ['large'=>[1200,1500],'medium'=>[600,750],'thumb'=>[200,250]]
        : ['large'=>[1200,1200],'medium'=>[600,600],'thumb'=>[200,200]];

    $paths = [];
    foreach ($sizes as $name => [$maxW, $maxH]) {
        $ratio = min($maxW/$srcW, $maxH/$srcH, 1);
        $newW = (int)round($srcW * $ratio);
        $newH = (int)round($srcH * $ratio);
        $dst = imagecreatetruecolor($newW, $newH);

        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $srcW, $srcH);

        $outPath = $destDir . '/' . $name . '.jpg';
        imagejpeg($dst, $outPath, $name === 'large' ? 85 : ($name === 'medium' ? 80 : 75));
        imagedestroy($dst);
        $paths[$name] = $outPath;
    }
    imagedestroy($src);

    $ext = pathinfo($sourcePath, PATHINFO_EXTENSION);
    $origPath = $destDir . '/original.' . $ext;
    copy($sourcePath, $origPath);
    $paths['original'] = $origPath;
    $paths['width'] = $srcW;
    $paths['height'] = $srcH;

    return $paths;
}

function validateImageUpload(array $file): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK) return 'Error al subir el archivo.';
    if ($file['size'] > 15 * 1024 * 1024) return 'El archivo supera el límite de 15MB.';
    $allowed = ['image/jpeg','image/png','image/webp'];
    $info = getimagesize($file['tmp_name']);
    if (!$info || !in_array($info['mime'], $allowed)) return 'Tipo de archivo no permitido. Usá JPG, PNG o WebP.';
    return null;
}
