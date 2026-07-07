// ── HAMBURGER MENU ──
(function () {
  var btn = document.getElementById('navHamburger')
  var menu = document.getElementById('navMobileMenu')
  var close = document.getElementById('navMobileClose')
  var dashMobile = document.getElementById('openLoginModalMobile')
  if (!btn || !menu) return

  function openMenu() {
    menu.classList.add('open')
    btn.classList.add('open')
    menu.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
  }
  function closeMenu() {
    menu.classList.remove('open')
    btn.classList.remove('open')
    menu.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
  }

  btn.addEventListener('click', openMenu)
  close.addEventListener('click', closeMenu)

  menu.querySelectorAll('.nav-mobile-links a').forEach(function (a) {
    a.addEventListener('click', closeMenu)
  })

  if (dashMobile) {
    dashMobile.addEventListener('click', function () {
      closeMenu()
      var loginModal = document.getElementById('loginModal')
      if (loginModal) {
        loginModal.classList.add('open')
        document.body.classList.add('modal-open')
      }
    })
  }

  menu.addEventListener('click', function (e) {
    if (e.target === menu) closeMenu()
  })
})();

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
  var SVG_IG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';
  var SVG_SP = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>';
  var SVG_YT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
  var SVG_TT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>';

  var thumbs   = document.querySelectorAll('.roster-thumb')
  var featImg  = document.getElementById('featImg')
  var featName = document.getElementById('featName')
  var featGenre= document.getElementById('featGenre')
  var featBio  = document.getElementById('featBio')
  var featSocials = document.getElementById('featSocials')
  var featPlayer  = document.getElementById('featPlayer')
  if (!thumbs.length || !featImg) return

  function setFeatured(thumb) {
    thumbs.forEach(function(t) { t.classList.remove('active') })
    thumb.classList.add('active')
    featImg.style.opacity = '0'
    setTimeout(function () {
      featImg.src = thumb.dataset.img
      featImg.style.objectPosition = thumb.dataset.pos || 'top'
      featName.textContent  = thumb.dataset.name
      featGenre.textContent = thumb.dataset.genre
      if (featBio) featBio.textContent = thumb.dataset.bio || ''

      // Socials (icon only)
      if (featSocials) {
        var html = ''
        if (thumb.dataset.instagram) html += '<a href="https://instagram.com/' + thumb.dataset.instagram + '" target="_blank" rel="noopener" class="feat-social-btn feat-social-ig" aria-label="Instagram">' + SVG_IG + '</a>'
        if (thumb.dataset.youtube)   html += '<a href="' + thumb.dataset.youtube + '" target="_blank" rel="noopener" class="feat-social-btn feat-social-yt" aria-label="YouTube">' + SVG_YT + '</a>'
        if (thumb.dataset.tiktok)    html += '<a href="https://tiktok.com/@' + thumb.dataset.tiktok + '" target="_blank" rel="noopener" class="feat-social-btn feat-social-tt" aria-label="TikTok">' + SVG_TT + '</a>'
        if (thumb.dataset.spotify)   html += '<a href="https://open.spotify.com/artist/' + thumb.dataset.spotify + '" target="_blank" rel="noopener" class="feat-social-btn feat-social-sp" aria-label="Spotify">' + SVG_SP + '</a>'
        featSocials.innerHTML = html
      }

      // Player
      if (featPlayer) {
        if (thumb.dataset.spotify) {
          featPlayer.innerHTML = '<iframe src="https://open.spotify.com/embed/artist/' + thumb.dataset.spotify + '?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
        } else {
          featPlayer.innerHTML = ''
        }
      }

      featImg.style.opacity = '1'
    }, 200)
  }

  // Apply data-pos to each thumb's img on init
  thumbs.forEach(function (thumb) {
    var img = thumb.querySelector('img')
    if (img && thumb.dataset.pos) img.style.objectPosition = thumb.dataset.pos
  })

  var thumbsContainer = document.getElementById('rosterThumbs')
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

// ── NOSOTROS IMG TILT ──
(function () {
  const img = document.querySelector('.nosotros-img')
  if (!img) return

  img.style.transition = 'transform 0.1s ease, box-shadow 0.4s ease'

  img.addEventListener('mousemove', function (e) {
    const rect = img.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    const rotY =  x * 12
    const rotX = -y * 8
    const moveX = x * 8
    const moveY = y * 6
    img.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translate(' + moveX + 'px,' + moveY + 'px) scale(1.03)'
  })

  img.addEventListener('mouseleave', function () {
    img.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease'
    img.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translate(0,0) scale(1)'
  })

  img.addEventListener('mouseenter', function () {
    img.style.transition = 'transform 0.1s ease, box-shadow 0.4s ease'
  })
})();

// ── ARTIST MODAL ──
(function () {
  var SVG_IG  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
  var SVG_SP  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>'
  var SVG_YT  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  var SVG_TK  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>'

  var ARTISTS = {
    'tomas gimenez': { name:'Tomas Gimenez', genre:'Pop', img:'imagenes/foto-tomas-gimenez.jpg', pos:'center top', bio:'Voz potente y letras directas que conectan con una generación. Uno de los artistas más prometedores del pop argentino.', ig:'https://instagram.com/tomasgimenezok', sp:'5mCPDVBb16scAbCjmfZaq7', yt:'https://www.youtube.com/@tomasgimenez', tk:'https://www.tiktok.com/@tomasgimenezok' },
    'crash':         { name:'Crash',         genre:'Pop', img:'imagenes/foto-crash.jpeg',         pos:'center top', bio:'Actitud, flow y una identidad visual que impacta antes de sonar. Pop con personalidad y energía sin límites.',             ig:'https://instagram.com/crash.music',   sp:'5AIFs6bO6XZLbfeTplCHkL', yt:'https://www.youtube.com/@crashmusic', tk:'https://www.tiktok.com/@crash.music' },
    'maga':          { name:'Maga',          genre:'Pop', img:'imagenes/foto-maga.jpg',           pos:'center 20%',  bio:'Canciones íntimas con producción contemporánea que trascienden fronteras. Una artista que emociona desde el primer verso.',   ig:'https://instagram.com/magamusica',    sp:'', yt:'', tk:'' },
    'lucas barros':  { name:'Lucas Barros',  genre:'Pop / R&B', img:'imagenes/foto-lucas-barros.jpeg', pos:'center top', bio:'Groove, melodía y una presencia escénica que se siente desde el primer acorde. R&B con raíces latinas.',              ig:'https://instagram.com/lucasbarrosmusic', sp:'', yt:'', tk:'' },
    'el cone':       { name:'El Cone',       genre:'Cuarteto', img:'imagenes/foto-cone.jpg',      pos:'center 15%',  bio:'El cuarteto que mueve multitudes con energía y ritmo desbordante. Tradición y modernidad en perfecta sintonía.',            ig:'https://instagram.com/elconeoficial', sp:'', yt:'', tk:'' },
    'karen quiroga': { name:'Karen Quiroga', genre:'Pop', img:'imagenes/foto-Karen Quiroga.jpg',  pos:'center top',  bio:'Sensibilidad y fuerza en cada canción. Una artista que define su propio camino con autenticidad y visión clara.',            ig:'https://instagram.com/karenquiroga', sp:'', yt:'', tk:'' },
    'beruti':        { name:'Beruti',        genre:'Pop', img:'imagenes/foto-beruti.jpg',         pos:'center top',  bio:'Composición honesta y una conexión emocional que fideliza audiencias. El pop argentino con alma y sustancia.',               ig:'https://instagram.com/berutimusica', sp:'', yt:'', tk:'' },
    'silvestre':     { name:'Silvestre',     genre:'Folklore', img:'imagenes/foto-silvestre.jpeg', pos:'center top', bio:'La tradición del folklore argentino con una mirada contemporánea. Raíces profundas, horizonte amplio.',                   ig:'https://instagram.com/silvestreoficial', sp:'', yt:'', tk:'' },
    'og karma':      { name:'OG Karma',      genre:'Urbano', img:'imagenes/foto-Og Karma.jpeg',   pos:'center top',  bio:'Flow urbano con identidad propia. Un artista que construye su universo desde las calles hasta los escenarios.',              ig:'https://instagram.com/ogkarmaoficial', sp:'', yt:'', tk:'' },
    'axel sun':      { name:'Axel Sun',      genre:'Pop', img:'imagenes/foto-axelsun.jpg',        pos:'center top',  bio:'Pop con energía solar y melodías que se quedan. Una propuesta fresca y directa al corazón del oyente.',                    ig:'https://instagram.com/axelsunmusic', sp:'', yt:'', tk:'' },
    'ana paula':     { name:'Ana Paula',     genre:'Pop', img:'imagenes/foto-anapaula.jpg',       pos:'center top',  bio:'Voz cálida y canciones auténticas que conectan desde el primer segundo. Pop argentino con proyección internacional.',        ig:'https://instagram.com/anapaulamusica', sp:'', yt:'', tk:'' },
    'duende':        { name:'Duende',        genre:'Infantil', img:'imagenes/foto-duende.jpeg',   pos:'center top',  bio:'Música infantil con calidad musical adulta. Un proyecto que hace cantar y bailar a las familias argentinas.',               ig:'https://instagram.com/duendemusica', sp:'', yt:'', tk:'' },
  }

  var modal    = document.getElementById('artistModal')
  var backdrop = document.getElementById('artistModalBackdrop')
  var btnClose = document.getElementById('closeArtistModal')
  if (!modal) return

  function socialBtn(href, svg, label) {
    if (!href) return ''
    return '<a href="' + href + '" target="_blank" class="artist-modal-social-btn" aria-label="' + label + '">' + svg + '</a>'
  }

  function open(key) {
    var a = ARTISTS[key.toLowerCase()]
    if (!a) return
    var imgEl = document.getElementById('artistModalImg')
    imgEl.src = a.img
    imgEl.alt = a.name
    imgEl.style.objectPosition = a.pos || 'center top'
    document.getElementById('artistModalGenre').textContent = a.genre
    document.getElementById('artistModalName').textContent = a.name
    document.getElementById('artistModalBio').textContent = a.bio
    document.getElementById('artistModalSocials').innerHTML =
      socialBtn(a.ig, SVG_IG, 'Instagram') +
      socialBtn(a.sp ? 'https://open.spotify.com/artist/' + a.sp : '', SVG_SP, 'Spotify') +
      socialBtn(a.yt, SVG_YT, 'YouTube') +
      socialBtn(a.tk, SVG_TK, 'TikTok')
    var spotifyEl = document.getElementById('artistModalSpotify')
    if (a.sp) {
      spotifyEl.innerHTML = '<iframe src="https://open.spotify.com/embed/artist/' + a.sp + '?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
    } else {
      spotifyEl.innerHTML = ''
    }
    modal.classList.add('open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
  }

  function close() {
    modal.classList.remove('open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    document.getElementById('artistModalSpotify').innerHTML = ''
  }

  // Wire up roster thumbs
  document.querySelectorAll('.roster-thumb').forEach(function (thumb) {
    thumb.style.cursor = 'pointer'
    thumb.addEventListener('click', function () {
      var name = thumb.querySelector('.roster-name')
      if (name) open(name.textContent.trim())
    })
  })

  // Wire up ring-cards
  document.querySelectorAll('.ring-card').forEach(function (card) {
    card.style.cursor = 'pointer'
    card.addEventListener('click', function () {
      var label = card.querySelector('.ring-label span')
      if (label) open(label.textContent.trim())
    })
  })

  btnClose.addEventListener('click', close)
  backdrop.addEventListener('click', close)
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close() })
})();

// ── SCROLL REVEAL ──
(function () {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
  if (!targets.length) return
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed')
        obs.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  targets.forEach(function (el) { obs.observe(el) })
})();

// ── LANZ CARD ENTRANCE ──
(function () {
  const card = document.querySelector('.lanz-card')
  if (!card) return
  const obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      card.classList.add('is-visible')
      obs.disconnect()
    }
  }, { threshold: 0.2 })
  obs.observe(card)
})();

// ── MINI PLAYER + SOCIAL ICONS ──
(function () {
  var player   = document.getElementById('miniPlayer')
  var embedEl  = document.getElementById('miniPlayerEmbed')
  var nameEl   = document.getElementById('miniPlayerName')
  var genreEl  = document.getElementById('miniPlayerGenre')
  var imgEl    = document.getElementById('miniPlayerImg')
  var closeBtn = document.getElementById('miniPlayerClose')
  if (!player) return

  var currentSp = null

  var SVG_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
  var SVG_IG   = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
  var SVG_YT   = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  var SVG_TK   = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>'
  var SVG_SP   = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>'

  function makeSocialBtn(href, label, svg) {
    var el = href
      ? document.createElement('a')
      : document.createElement('span')
    el.className = 'rcard-btn-social' + (href ? '' : ' rcard-btn-social--dim')
    el.setAttribute('aria-label', label)
    el.innerHTML = svg
    if (href) {
      el.href = href
      el.target = '_blank'
      el.rel = 'noopener'
    }
    return el
  }

  document.querySelectorAll('.rcard').forEach(function (card) {
    var actions = card.querySelector('.rcard-hover-actions')
    if (!actions) return

    var sp = card.dataset.spotify || ''
    var ig = card.dataset.ig || ''
    var yt = card.dataset.yt || ''
    var tk = card.dataset.tk || ''

    // Play button for mini player (only if Spotify exists)
    if (sp) {
      var btn = document.createElement('button')
      btn.className = 'rcard-btn-play'
      btn.setAttribute('aria-label', 'Escuchar preview')
      btn.innerHTML = SVG_PLAY
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        if (sp === currentSp) return
        currentSp = sp
        var name  = card.querySelector('.rcard-hover-name')
        var genre = card.querySelector('.rcard-hover-genre')
        var photo = card.querySelector('.rcard-photo img')
        nameEl.textContent  = name  ? name.textContent  : ''
        genreEl.textContent = genre ? genre.textContent : ''
        imgEl.src = photo ? photo.src : ''
        imgEl.alt = name  ? name.textContent : ''
        embedEl.innerHTML = '<iframe src="https://open.spotify.com/embed/artist/' + sp +
          '?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
        player.classList.add('open')
      })
      actions.insertBefore(btn, actions.firstChild)
    }

    // Social icons row (always show all 4)
    var socials = document.createElement('div')
    socials.className = 'rcard-socials'
    socials.appendChild(makeSocialBtn(ig ? 'https://instagram.com/' + ig : '', 'Instagram', SVG_IG))
    socials.appendChild(makeSocialBtn(sp ? 'https://open.spotify.com/artist/' + sp : '', 'Spotify', SVG_SP))
    socials.appendChild(makeSocialBtn(yt ? 'https://youtube.com/@' + yt : '', 'YouTube', SVG_YT))
    socials.appendChild(makeSocialBtn(tk ? 'https://tiktok.com/@' + tk : '', 'TikTok', SVG_TK))
    actions.appendChild(socials)
  })

  closeBtn.addEventListener('click', function () {
    player.classList.remove('open')
    embedEl.innerHTML = ''
    currentSp = null
  })
})();
