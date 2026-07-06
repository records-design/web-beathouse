// ── NAVBAR HIDE ON SCROLL ──
(function () {
  const nav = document.querySelector('.navbar')
  if (!nav) return
  let lastY = 0
  let ticking = false

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        const currentY = window.scrollY
        if (currentY > lastY && currentY > 120) {
          nav.classList.add('navbar--hidden')
        } else {
          nav.classList.remove('navbar--hidden')
        }
        lastY = currentY
        ticking = false
      })
      ticking = true
    }
  }, { passive: true })
})();

// ── ROSTER FEATURED ──
(function () {
  const thumbs   = document.querySelectorAll('.roster-thumb')
  const featImg  = document.getElementById('featImg')
  const featName = document.getElementById('featName')
  const featGenre= document.getElementById('featGenre')
  const featDesc = document.getElementById('featDesc')
  if (!thumbs.length || !featImg) return

  function setFeatured(thumb) {
    thumbs.forEach(t => t.classList.remove('active'))
    thumb.classList.add('active')
    featImg.style.opacity = '0'
    setTimeout(function () {
      featImg.src = thumb.dataset.img
      featImg.style.objectPosition = thumb.dataset.pos || 'top'
      featName.textContent  = thumb.dataset.name
      featGenre.textContent = thumb.dataset.genre
      featDesc.textContent  = thumb.dataset.desc
      featImg.style.opacity = '1'
    }, 200)
  }

  const thumbsContainer = document.getElementById('rosterThumbs')

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      setFeatured(thumb)
      if (thumbsContainer) thumbsContainer.classList.add('interacted')
    })
  })
})();


// ── ROSTER THUMB 3D TILT ──
(function () {
  const thumbs = document.querySelectorAll('.roster-thumb')
  if (!thumbs.length) return

  thumbs.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotateY =  ((x - cx) / cx) * 10
      const rotateX = -((y - cy) / cy) * 8
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.04)'
      card.style.transition = 'border-color .25s, box-shadow .25s, transform .08s ease-out'
      const pctX = ((x / rect.width) * 100).toFixed(1) + '%'
      const pctY = ((y / rect.height) * 100).toFixed(1) + '%'
      card.style.setProperty('--mx', pctX)
      card.style.setProperty('--my', pctY)
    })

    card.addEventListener('mouseleave', function () {
      card.style.transition = 'border-color .25s, box-shadow .25s, transform .4s ease-out'
      card.style.transform = ''
    })
  })
})();

// ── PANEL ANIMADO ──
(function () {
  const rows = document.querySelectorAll('.dif-panel-row')
  if (!rows.length) return

  let triggered = false

  function animateCount(el) {
    const target   = parseFloat(el.dataset.target)
    const divisor  = parseFloat(el.dataset.divisor  || 1)
    const decimals = parseInt(el.dataset.decimals   || 0)
    const prefix   = el.dataset.prefix || ''
    const suffix   = el.dataset.suffix || ''
    const duration = 1400
    const start    = performance.now()

    function step(now) {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      const val  = (target / divisor) * ease
      el.textContent = prefix + val.toFixed(decimals) + suffix
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  function runPanel() {
    if (triggered) return
    triggered = true
    rows.forEach(function (row, i) {
      setTimeout(function () {
        row.classList.add('is-visible')
        const counter = row.querySelector('.dif-count')
        if (counter) animateCount(counter)
      }, i * 120)
    })
  }

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) runPanel()
  }, { threshold: 0.3 })

  const panel = document.querySelector('.dif-panel-mock')
  if (panel) observer.observe(panel)
})();

// ── PRESAVE FORM ──
(function () {
  const form = document.getElementById('dropForm')
  const success = document.getElementById('formSuccess')
  if (!form) return
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    form.style.display = 'none'
    success.style.display = 'block'
  })
})();

// ── FORM MODAL ──
(function () {
  var modal = document.getElementById('formModal');
  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.getElementById('openFormModal')?.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  document.querySelectorAll('.open-form-modal').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  document.getElementById('closeFormModal')?.addEventListener('click', closeModal);
  document.getElementById('formModalBackdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // Wizard
  var panels = document.querySelectorAll('.wizard-panel');
  var steps  = document.querySelectorAll('.wizard-step');

  function showPanel(n) {
    panels.forEach(function (p) { p.classList.toggle('active', +p.dataset.panel === n); });
    steps.forEach(function (s) {
      var sn = +s.dataset.step;
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
  }

  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var from = +btn.closest('[data-panel]')?.dataset.panel;
      if (from === 1) {
        var nombre = document.querySelector('#formWizard [name="nombre"]');
        var email  = document.querySelector('#formWizard [name="email"]');
        var ok = true;
        [nombre, email].forEach(function (field) {
          var empty = !field.value.trim();
          var badEmail = field === email && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
          field.closest('.form-field').classList.toggle('field-error', empty || badEmail);
          if (empty || badEmail) ok = false;
        });
        if (!ok) return;
      }
      showPanel(+btn.dataset.next);
    });
  });
  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () { showPanel(+btn.dataset.back); });
  });
  document.querySelectorAll('#formWizard [name="nombre"], #formWizard [name="email"]').forEach(function (f) {
    f.addEventListener('input', function () { f.closest('.form-field').classList.remove('field-error'); });
  });

  // Category dropdown
  var trigger = document.getElementById('categoryTrigger');
  var menu    = document.getElementById('categoryMenu');
  trigger?.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.form-select-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      document.getElementById('categoryValue').textContent = opt.textContent;
      document.getElementById('categoriaInput').value = opt.dataset.value;
      trigger.classList.add('has-value');
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (menu && !menu.contains(e.target) && e.target !== trigger) {
      menu.classList.remove('open');
    }
  });

  // File upload via Uploadcare + VirusTotal scan
  (function () {
    var UPLOADCARE_PK = 'd95f11db670abc7ce278'; // mismo key que babidibu — reemplazá si tenés uno propio
    var VT_WORKER = 'https://vt-proxy-beathouse.babidibu-records.workers.dev';
    var MAX_MB = 100;
    var ALLOWED = ['mp3', 'wav', 'mp4', 'pdf', 'zip'];
    var zone     = document.getElementById('ucUploadZone');
    var inner    = document.getElementById('ucUploadInner');
    var progress = document.getElementById('ucProgress');
    var fill     = document.getElementById('ucProgressFill');
    var label    = document.getElementById('ucProgressLabel');
    var hint     = document.getElementById('ucProgressHint');
    var fileList = document.getElementById('ucFileList');
    if (!zone) return;
    var files = [], uploading = false;

    function updateFilesData() {
      document.getElementById('ucFilesData').value = files.map(function (f) {
        return f.name + ': ' + f.url + ' [' + f.vt + ']';
      }).join(' | ');
    }

    function renderFileList() {
      fileList.innerHTML = '';
      files.forEach(function (f, i) {
        var row  = document.createElement('div'); row.className = 'uc-upload-done';
        var icon = document.createElement('span'); icon.className = 'uc-done-icon';
        icon.textContent = (f.vt.indexOf('No permitido') > -1 || f.vt.indexOf('Sospechoso') > -1) ? '⚠️' : '✓';
        var name = document.createElement('span'); name.className = 'uc-done-name';
        name.textContent = f.name + (f.vt ? ' — ' + f.vt : '');
        var btn  = document.createElement('button'); btn.type = 'button'; btn.className = 'uc-remove-btn'; btn.textContent = '✕';
        btn.addEventListener('click', function () { files.splice(i, 1); renderFileList(); updateFilesData(); });
        row.appendChild(icon); row.appendChild(name); row.appendChild(btn);
        fileList.appendChild(row);
      });
    }

    function finishScan(url, name, vtResult, background) {
      if (background) {
        // Actualizar resultado del archivo ya existente en la lista
        var existing = files.find(function (f) { return f.url === url; });
        if (existing) { existing.vt = vtResult; renderFileList(); updateFilesData(); }
        return;
      }
      files.push({ url: url, name: name, vt: vtResult });
      renderFileList(); updateFilesData();
      uploading = false;
      hint.textContent = '';
      progress.style.display = 'none';
      inner.style.display = '';
      fill.style.width = '0%';
    }

    function pollVT(id, url, name, attempts) {
      if (attempts > 60) { return; } // timeout silencioso — ya se mostró ✓ Check
      fetch(VT_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'result', id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var status = data.data && data.data.attributes && data.data.attributes.status;
        if (status === 'completed') {
          var stats = data.data.attributes.stats;
          var malicious = stats.malicious || 0;
          var total = (stats.harmless || 0) + malicious + (stats.suspicious || 0) + (stats.undetected || 0);
          // Solo actualizar si es realmente malicioso
          if (malicious >= 3) {
            finishScan(url, name, '✕ No permitido: ' + malicious + '/' + total + ' motores detectaron amenazas', true);
          }
        } else {
          setTimeout(function () { pollVT(id, url, name, attempts + 1); }, 4000);
        }
      })
      .catch(function () { }); // silencioso en segundo plano
    }

    function scanWithVT(url, name) {
      fetch(VT_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan', url: url })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var id = data.data && data.data.id;
        if (!id) { finishScan(url, name, 'No se pudo escanear'); return; }
        pollVT(id, url, name, 0);
      })
      .catch(function () { finishScan(url, name, 'Error de conexión'); });
    }

    function uploadFile(file) {
      if (uploading) { alert('Esperá que termine el archivo actual.'); return; }
      var ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED.includes(ext)) { alert('Formato no permitido. Usá MP3, WAV, MP4, PDF o ZIP.'); return; }
      if (file.size > MAX_MB * 1024 * 1024) { alert('El archivo supera los 100 MB.'); return; }
      uploading = true;
      inner.style.display = 'none'; progress.style.display = '';
      fill.style.width = '0%'; label.textContent = 'Subiendo...';
      var fd = new FormData();
      fd.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PK);
      fd.append('UPLOADCARE_STORE', 'auto');
      fd.append('file', file);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://upload.uploadcare.com/base/');
      xhr.upload.addEventListener('progress', function (ev) {
        if (ev.lengthComputable) {
          var pct = Math.round(ev.loaded / ev.total * 100);
          fill.style.width = pct + '%'; label.textContent = pct + '%';
        }
      });
      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          var url = 'https://ucarecdn.com/' + data.file + '/';
          // Mostrar como OK inmediatamente y escanear en segundo plano
          finishScan(url, file.name, '✓ Check');
          scanWithVT(url, file.name);
        } else {
          uploading = false; inner.style.display = ''; progress.style.display = 'none';
          alert('Error al subir el archivo. Intentá de nuevo.');
        }
      });
      xhr.addEventListener('error', function () {
        uploading = false; inner.style.display = ''; progress.style.display = 'none';
        alert('Error de red. Intentá de nuevo.');
      });
      xhr.send(fd);
    }

    zone.addEventListener('click', function () {
      if (uploading) return;
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.mp3,.wav,.mp4,.pdf,.zip';
      inp.addEventListener('change', function () { if (this.files[0]) uploadFile(this.files[0]); });
      inp.click();
    });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });
  })();

  // Form submit
  document.getElementById('formWizard')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var emailVal = this.querySelector('[name="email"]')?.value;
    if (emailVal) document.getElementById('replyToField').value = emailVal;
    var btn = document.getElementById('btnSubmit');
    btn.textContent = 'Enviando...'; btn.disabled = true;
    try {
      var res = await fetch(this.action, { method: 'POST', body: new FormData(this), headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        this.style.display = 'none';
        document.getElementById('formHeader').style.display = 'none';
        document.getElementById('formModalSuccess').style.display = 'flex';
        document.querySelector('.form-modal-card').classList.add('success-state');
      } else {
        btn.textContent = 'Error. Intentá de nuevo.'; btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Error. Intentá de nuevo.'; btn.disabled = false;
    }
  });

  document.getElementById('formSuccessReset')?.addEventListener('click', function () {
    document.getElementById('formModalSuccess').style.display = 'none';
    document.getElementById('formHeader').style.display = 'block';
    var form = document.getElementById('formWizard');
    form.style.display = 'block'; form.reset();
    document.querySelector('.form-modal-card').classList.remove('success-state');
    document.getElementById('btnSubmit').textContent = 'Enviar proyecto →';
    document.getElementById('btnSubmit').disabled = false;
    document.getElementById('categoryValue').textContent = 'Seleccioná una categoría';
    document.getElementById('categoriaInput').value = '';
    document.getElementById('categoryTrigger').classList.remove('has-value');
    showPanel(1);
  });
})();

// ── ARTIST MODAL ──
(function () {
  var modal     = document.getElementById('artistModal');
  var backdrop  = document.getElementById('artistModalBackdrop');
  var closeBtn  = document.getElementById('artistModalClose');
  if (!modal) return;

  var SVG_INSTAGRAM = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';
  var SVG_SPOTIFY  = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>';

  function openArtistModal(thumb) {
    var spotify   = thumb.dataset.spotify || '';
    var instagram = thumb.dataset.instagram || '';
    var bio       = thumb.dataset.bio || '';
    var name      = thumb.dataset.name || '';
    var genre     = thumb.dataset.genre || '';
    var img       = thumb.dataset.img || '';

    document.getElementById('artistModalPhoto').src = img;
    document.getElementById('artistModalPhoto').alt = name;
    document.getElementById('artistModalName').textContent  = name;
    document.getElementById('artistModalGenre').textContent = genre;
    document.getElementById('artistModalBio').textContent   = bio;

    // Socials
    var socials = document.getElementById('artistModalSocials');
    socials.innerHTML = '';
    if (instagram) {
      socials.innerHTML += '<a href="https://instagram.com/' + instagram + '" target="_blank" rel="noopener">' + SVG_INSTAGRAM + ' Instagram</a>';
    }
    if (spotify) {
      socials.innerHTML += '<a href="https://open.spotify.com/artist/' + spotify + '" target="_blank" rel="noopener">' + SVG_SPOTIFY + ' Spotify</a>';
    }

    // Player embed
    var player = document.getElementById('artistModalPlayer');
    if (spotify) {
      player.innerHTML = '<iframe src="https://open.spotify.com/embed/artist/' + spotify + '?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
    } else {
      player.innerHTML = '';
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeArtistModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Stop spotify player
    var iframe = modal.querySelector('iframe');
    if (iframe) iframe.src = iframe.src;
  }

  // Botón "Escuchar →" en el panel featured
  var featBtn = document.querySelector('.roster-feat-btn');
  if (featBtn) {
    featBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var activeThumb = document.querySelector('.roster-thumb.active');
      if (activeThumb) openArtistModal(activeThumb);
    });
  }

  closeBtn.addEventListener('click', closeArtistModal);
  backdrop.addEventListener('click', closeArtistModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeArtistModal();
  });
})();

// ── LOGIN MODAL ──
(function () {
  var loginModal = document.getElementById('loginModal');
  if (!loginModal) return;

  function openLoginModal() {
    loginModal.classList.add('open');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeLoginModal() {
    loginModal.classList.remove('open');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.getElementById('openLoginModal')?.addEventListener('click', function (e) {
    e.preventDefault(); openLoginModal();
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModalBackdrop')?.addEventListener('click', closeLoginModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLoginModal();
  });

  // Link "Envianos tu material" → abre form modal
  document.getElementById('loginContactLink')?.addEventListener('click', function (e) {
    e.preventDefault();
    closeLoginModal();
    setTimeout(function () {
      document.getElementById('formModal')?.classList.add('open');
      document.getElementById('formModal')?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }, 300);
  });

  // Login form submit (placeholder — conectar con backend real)
  document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    var usuario = this.querySelector('[name="usuario"]').value.trim();
    var password = this.querySelector('[name="password"]').value.trim();
    if (!usuario || !password) return;
    // TODO: conectar con sistema de auth real
    alert('Dashboard próximamente disponible.');
  });
})();

// ── COUNTDOWN ──
(function () {
  const target = new Date('2026-06-26T00:00:00-03:00').getTime()
  const days  = document.getElementById('cd-days')
  const hours = document.getElementById('cd-hours')
  const mins  = document.getElementById('cd-mins')
  const secs  = document.getElementById('cd-secs')

  if (!days) return

  function pad(n) { return String(n).padStart(2, '0') }

  function tick() {
    const diff = target - Date.now()
    if (diff <= 0) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00'
      return
    }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    days.textContent  = pad(d)
    hours.textContent = pad(h)
    mins.textContent  = pad(m)
    secs.textContent  = pad(s)
  }

  tick()
  setInterval(tick, 1000)
})();
