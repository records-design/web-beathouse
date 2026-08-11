const layout = require('./layout');

function artistsListPage(artists, user, query = {}) {
  const statusFilter = query.status || '';
  const searchFilter = query.search || '';

  const rows = artists.map(a => {
    const check = '<span class="icon-check">✓</span>';
    const cross = '<span class="icon-cross">✕</span>';
    return `<tr>
      <td><img src="/${a.main_image || ''}" class="table-img" onerror="this.src='/imagenes/foto-estudio.png'" alt="${a.name}"></td>
      <td>
        <strong>${a.name}</strong>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${a.slug}</div>
      </td>
      <td>${a.genre || '—'}</td>
      <td><span class="badge badge-${a.status}">${a.status}</span></td>
      <td style="text-align:center">${a.show_in_roster ? check : cross}</td>
      <td style="text-align:center">${a.show_in_carousel ? check : cross}</td>
      <td style="text-align:center">${a.show_in_ticker ? check : cross}</td>
      <td>
        <div class="action-row">
          <a href="/admin/artists/${a.id}" class="btn btn-sm btn-secondary">Editar</a>
          <form method="POST" action="/admin/artists/${a.id}/archive" style="display:inline" onsubmit="return confirm('¿Archivar a ${a.name}?')">
            <button type="submit" class="btn btn-sm btn-warning">Archivar</button>
          </form>
        </div>
      </td>
    </tr>`;
  }).join('');

  const body = `
    <div class="section-header">
      <div></div>
      <a href="/admin/artists/new" class="btn btn-primary">+ Nuevo artista</a>
    </div>

    <div class="filters-bar">
      <form method="GET" action="/admin/artists" style="display:flex;gap:8px;flex-wrap:wrap">
        <input type="text" name="search" placeholder="Buscar artista..." value="${searchFilter}" style="max-width:200px">
        <select name="status" style="max-width:160px">
          <option value="">Todos los estados</option>
          ${['published','draft','hidden','archived'].map(s =>
            `<option value="${s}" ${statusFilter === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
        ${statusFilter || searchFilter ? `<a href="/admin/artists" class="btn btn-secondary">Limpiar</a>` : ''}
      </form>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:50px"></th>
              <th>Nombre</th>
              <th>Género</th>
              <th>Estado</th>
              <th style="text-align:center">Roster</th>
              <th style="text-align:center">Carrusel</th>
              <th style="text-align:center">Ticker</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="8" style="color:var(--text-muted);text-align:center;padding:24px">No hay artistas</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return layout('Artistas', body, user, '/admin/artists');
}

module.exports = artistsListPage;
