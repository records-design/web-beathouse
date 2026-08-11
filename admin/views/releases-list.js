const layout = require('./layout');

function releasesListPage(releases, user) {
  const rows = releases.map(r => {
    const star = r.featured ? '<span class="star-on">★</span>' : '<span class="star-off">★</span>';
    const dateStr = r.release_date ? r.release_date.substring(0, 10) : '—';
    return `<tr>
      <td><img src="/${r.cover_image || ''}" class="table-img-sq" onerror="this.src='/imagenes/foto-estudio.png'" alt="${r.title}"></td>
      <td>
        <strong>${r.title}</strong>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${r.artist_name}</div>
      </td>
      <td><span class="badge badge-${r.type || 'single'}">${r.type || 'single'}</span></td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td style="text-align:center">${star}</td>
      <td>${dateStr}</td>
      <td>
        <div class="action-row">
          <a href="/admin/releases/${r.id}" class="btn btn-sm btn-secondary">Editar</a>
          <form method="POST" action="/admin/releases/${r.id}/duplicate" style="display:inline">
            <button type="submit" class="btn btn-sm btn-secondary">Copiar</button>
          </form>
          <form method="POST" action="/admin/releases/${r.id}/archive" style="display:inline" onsubmit="return confirm('¿Archivar ${r.title}?')">
            <button type="submit" class="btn btn-sm btn-warning">Archivar</button>
          </form>
        </div>
      </td>
    </tr>`;
  }).join('');

  const body = `
    <div class="section-header">
      <div></div>
      <a href="/admin/releases/new" class="btn btn-primary">+ Nuevo lanzamiento</a>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:50px"></th>
              <th>Título / Artista</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th style="text-align:center">Destacado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" style="color:var(--text-muted);text-align:center;padding:24px">No hay lanzamientos</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return layout('Lanzamientos', body, user, '/admin/releases');
}

module.exports = releasesListPage;
