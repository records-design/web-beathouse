# BeatHouse — Guía de instalación en Hostinger

## Requisitos

- Hosting compartido Hostinger (hPanel)
- PHP 7.4 o superior (Hostinger incluye PHP 8.x)
- Base de datos MySQL (incluida en el plan)

---

## Paso 1 — Crear la base de datos en Hostinger

1. Entrá al **hPanel** de Hostinger
2. Ir a **Bases de datos** → **Bases de datos MySQL**
3. Crear una nueva base de datos — anotá:
   - Nombre de la base de datos
   - Nombre de usuario
   - Contraseña
4. El host generalmente es `localhost`

---

## Paso 2 — Configurar las credenciales

Abrí el archivo:

```
php-admin/includes/db.php
```

Reemplazá estos valores con los datos de tu base de datos:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tu_base_de_datos');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
```

---

## Paso 3 — Subir los archivos al servidor

Subí **todos los archivos** al directorio `public_html/` de Hostinger.

Podés usar el **Administrador de archivos** del hPanel o FTP (FileZilla).

La estructura debe quedar así en `public_html/`:

```
public_html/
  index.html
  style.css
  script.js
  content-loader.js
  imagenes/
  php-admin/
  php-api/
  uploads/
  (resto de archivos)
```

> ⚠️ La carpeta `node_modules/` y `database/` NO hace falta subirlas.

---

## Paso 4 — Crear las tablas e inicializar los datos

Una vez subidos los archivos, abrí este link en el navegador:

```
https://tudominio.com/php-admin/setup/install.php?token=BTH_INSTALL_2026
```

Reemplazá `tudominio.com` con tu dominio real.

Esto va a:
- Crear todas las tablas en la base de datos
- Cargar los 8 artistas existentes
- Cargar el lanzamiento "Heart Roto"
- Crear el usuario administrador

---

## Paso 5 — ⚠️ IMPORTANTE: Eliminar el archivo de instalación

**Inmediatamente después** de correr el instalador, eliminá este archivo del servidor:

```
php-admin/setup/install.php
```

Hacelo desde el Administrador de archivos del hPanel. Si no lo eliminás, cualquiera con el link podría volver a ejecutarlo.

---

## Paso 6 — Acceder al panel

El panel de administración queda en:

```
https://tudominio.com/php-admin/
```

**Credenciales iniciales:**

| Campo | Valor |
|-------|-------|
| Usuario | `beathouse_admin` |
| Contraseña | `BTH!2026_Panel#7Kx9` |

> ✅ Cambiá la contraseña desde el panel en **Mi cuenta → Cambiar contraseña** después del primer login.

---

## Qué puede hacer el panel

### Artistas
- Crear, editar y archivar artistas
- Subir foto principal y foto para el carrusel
- Definir el punto focal de cada imagen (para que las caras queden bien encuadradas)
- Controlar en qué secciones aparece cada artista: Roster, Carrusel, Ticker
- Definir el orden de aparición en cada sección

### Lanzamientos
- Crear, editar y duplicar lanzamientos
- Asociar cada lanzamiento a un artista existente
- Definir fecha de publicación (puede ser futura — no aparece en la web hasta esa fecha)
- Activar/desactivar links a Spotify, YouTube, Instagram, TikTok, Apple Music

### Archivos
- Ver todas las imágenes subidas
- Eliminar archivos que no estén en uso

### Usuarios (solo Admin)
- Crear nuevos usuarios con rol Editor o Admin
- Desactivar usuarios
- Eliminar usuarios

---

## Roles

| Rol | Puede hacer |
|-----|-------------|
| **Admin** | Todo: artistas, lanzamientos, imágenes, usuarios, configuración |
| **Editor** | Artistas, lanzamientos e imágenes. No puede gestionar usuarios |

---

## Imágenes — recomendaciones

### Fotos de artistas
- Formato: JPG, PNG o WebP
- Tamaño recomendado: **2000 × 2500 px** (mínimo 1200 × 1500 px)
- El panel avisa si la resolución es baja

### Portadas de lanzamientos
- Deben ser **cuadradas** (1:1)
- Tamaño recomendado: **3000 × 3000 px** (mínimo 1200 × 1200 px)
- El panel avisa si no es cuadrada

---

## La web pública

La web en `tudominio.com` carga el contenido automáticamente desde la base de datos. No hace falta editar código para actualizar artistas o lanzamientos — todo se gestiona desde el panel.

---

## Soporte técnico

Ante cualquier problema contactar al equipo de desarrollo.
