const layout = require('./layout');

function mediaPage(files, user, message = '') {
  const items = files.map(f => {
    const inUse = f.in_use > 0;
    return `
    <div class="media-item">
      <img src="${f.url}" onerror="this.src=''" alt="${f.original_name || f.filename}">
      <div class="media-item-info">
        <div class="media-item-name" title="${f.original_name || f.filename}">${f.original_name || f.filename}</div>
        <div class="media-item-meta">${f.width ? f.width + '×' + f.height + ' · ' : ''}${f.size ? Math.round(f.size/1024) + 'KB' : ''}</div>
        ${inUse ? '<div class="media-item-meta" style="color:#22c55e">En uso</div>' : ''}
      </div>
      <div class="media-item-actions">
        <a href="${f.url}" target="_blank" class="btn btn-sm btn-secondary" style="width:100%;justify-content:center;margin-bottom:4px">Ver</a>
        ${!inUse ? `
        <form method="POST" action="/admin/media/${f.id}/delete" onsubmit="return confirm('¿Eliminar ${f.filename}?')">
          <button type="submit" class="btn btn-sm btn-danger" style="width:100%;justify-content:center">Eliminar</button>
        </form>` : `<div class="field-hint" style="text-align:center">En uso — no se puede eliminar</div>`}
      </div>
    </div>`;
  }).join('');

  const body = `
    ${message ? `<div class="alert alert-success" style="margin-bottom:16px">${message}</div>` : ''}
    <div class="section-header">
      <h2>Biblioteca de archivos (${files.length})</h2>
      <form method="POST" action="/admin/media/upload" enctype="multipart/form-data" style="display:flex;gap:8px;align-items:center">
        <input type="file" name="file" accept="image/*" required style="font-size:12px;color:var(--text-muted)">
        <button type="submit" class="btn btn-primary">Subir archivo</button>
      </form>
    </div>
    <div class="media-grid">
      ${items || '<div style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px">No hay archivos subidos</div>'}
    </div>
  `;

  return layout('Archivos', body, user, '/admin/media');
}

module.exports = mediaPage;
