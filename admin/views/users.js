const layout = require('./layout');

function usersPage(users, user, error = '', message = '') {
  const rows = users.map(u => {
    const isSelf = u.id === user.id;
    return `<tr>
      <td><strong>${u.username}</strong></td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td><span class="badge ${u.active ? 'badge-published' : 'badge-archived'}">${u.active ? 'Activo' : 'Inactivo'}</span></td>
      <td>${u.created_at ? u.created_at.substring(0,10) : '—'}</td>
      <td>
        <div class="action-row">
          ${!isSelf ? `
          <form method="POST" action="/admin/users/${u.id}" style="display:inline">
            <select name="role" style="padding:4px 8px;font-size:12px;background:var(--input-bg);border:1px solid var(--input-border);color:var(--text);border-radius:4px" onchange="this.form.submit()">
              <option value="editor" ${u.role==='editor'?'selected':''}>editor</option>
              <option value="admin" ${u.role==='admin'?'selected':''}>admin</option>
            </select>
            <input type="hidden" name="_action" value="role">
          </form>
          <form method="POST" action="/admin/users/${u.id}" style="display:inline">
            <input type="hidden" name="_action" value="toggle">
            <button type="submit" class="btn btn-sm ${u.active ? 'btn-warning' : 'btn-secondary'}">${u.active ? 'Desactivar' : 'Activar'}</button>
          </form>
          <form method="POST" action="/admin/users/${u.id}/delete" style="display:inline" onsubmit="return confirm('¿Eliminar usuario ${u.username}?')">
            <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
          </form>` : '<span style="color:var(--text-muted);font-size:12px">(tú)</span>'}
        </div>
      </td>
    </tr>`;
  }).join('');

  const body = `
    ${message ? `<div class="alert alert-success">${message}</div>` : ''}
    ${error ? `<div class="alert alert-error">${error}</div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;align-items:start">
      <div class="card">
        <div class="section-header" style="margin-bottom:12px">
          <h2>Usuarios (${users.length})</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="5" style="color:var(--text-muted);text-align:center">Sin usuarios</td></tr>'}</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-header" style="margin-bottom:12px"><h2>Nuevo usuario</h2></div>
        <form method="POST" action="/admin/users/new">
          <div class="field" style="margin-bottom:12px">
            <label>Usuario</label>
            <input type="text" name="username" required placeholder="nombre_usuario" autocomplete="off">
          </div>
          <div class="field" style="margin-bottom:12px">
            <label>Contraseña</label>
            <input type="password" name="password" required placeholder="Mín. 8 caracteres" autocomplete="new-password">
          </div>
          <div class="field" style="margin-bottom:16px">
            <label>Rol</label>
            <select name="role">
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">Crear usuario</button>
        </form>
      </div>
    </div>
  `;

  return layout('Usuarios', body, user, '/admin/users');
}

module.exports = usersPage;
