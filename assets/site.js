/* T-Squared — lightweight navigation, photo and silent-video galleries, inquiry validation. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-navigation');
  if (menu && nav) {
    const close = () => {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-inner')) close();
    });
  }
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const galleries = window.T2_GALLERIES || {};
  // Page overrides are optional; untouched sections retain the original curated photos.
  const page = location.pathname.split('/').pop() || 'index.html';
  const pageGalleries = (window.T2_PAGE_GALLERIES || {})[page] || {};
  const galleryFor = key => {
    if (Array.isArray(pageGalleries[key])) return pageGalleries[key];
    // Keep the project-gallery film filter in sync with edited category galleries.
    if (page === 'gallery.html' && key === 'films')
      return ['kitchens', 'bathrooms', 'builtins', 'signs']
        .flatMap(category => galleryFor(category)).filter(item => item.video);
    return galleries[key] || [];
  };
  const all = ['kitchens', 'bathrooms', 'builtins', 'signs'].flatMap(galleryFor);
  const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  function createGallery(root) {
    let items = root.dataset.gallery === 'all' ? all : galleryFor(root.dataset.gallery);
    let current = 0;
    root.classList.add('gallery-shell');
    root.setAttribute('role', 'region');
    root.setAttribute('tabindex', '0');
    root.setAttribute('aria-label', 'Project gallery: photos and silent walkthrough videos');
    root.innerHTML = `
      <div class="gallery-stage"><div class="gallery-display"></div></div>
      <div class="gallery-caption"><div><strong data-caption-title></strong><span data-caption-note></span></div><div class="gallery-counter" aria-live="polite" aria-atomic="true"></div></div>
      <div class="gallery-navigation"><div class="gallery-thumbnails" aria-label="Choose a gallery item"></div><div class="gallery-arrows"><button type="button" data-prev aria-label="Previous project">←</button><button type="button" data-next aria-label="Next project">→</button></div></div>`;
    const display = root.querySelector('.gallery-display');
    const thumbs = root.querySelector('.gallery-thumbnails');
    const caption = root.querySelector('[data-caption-title]');
    const detail = root.querySelector('[data-caption-note]');
    const counter = root.querySelector('.gallery-counter');
    function thumbnails() {
      thumbs.innerHTML = items.map((it, i) => `<button type="button" aria-label="View ${escapeHTML(it.title)}${it.video ? ', silent video' : ''}" data-go="${i}" aria-pressed="false"><img src="${escapeHTML(it.src)}" alt="" loading="lazy">${it.video ? '<span class="film-icon" aria-hidden="true">▶</span>' : ''}</button>`).join('');
      thumbs.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.go))));
    }
    function show(i) {
      if (!items.length) {
        display.textContent = 'No projects in this gallery yet.';
        display.classList.remove('has-video');
        caption.textContent = '';
        detail.textContent = '';
        counter.textContent = '00 / 00';
        return;
      }
      const playing = display.querySelector('video');
      if (playing) playing.pause();
      current = (i + items.length) % items.length;
      const it = items[current];
      if (it.video) {
        display.innerHTML = `<video controls muted playsinline preload="none" poster="${escapeHTML(it.src)}" aria-label="${escapeHTML(it.alt || it.title)}"><source src="${escapeHTML(it.video)}" type="video/mp4">Your browser cannot play this video. <a href="${escapeHTML(it.video)}">Open the film</a>.</video><span class="video-note">SILENT WALKTHROUGH</span>`;
        display.classList.add('has-video');
      } else {
        display.innerHTML = `<a href="${escapeHTML(it.src)}" target="_blank" rel="noopener" aria-label="Open large photograph: ${escapeHTML(it.title)}"><img src="${escapeHTML(it.src)}" alt="${escapeHTML(it.alt || it.title)}" loading="${current === 0 ? 'eager' : 'lazy'}"></a>`;
        display.classList.remove('has-video');
      }
      caption.textContent = it.title;
      detail.textContent = it.detail || (it.video ? 'Silent film · Press play' : 'View full photograph');
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      thumbs.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === current)));
      const chosen = thumbs.children[current];
      if (chosen) thumbs.scrollTo({ left: Math.max(0, chosen.offsetLeft - thumbs.offsetLeft - 12), behavior: reduce.matches ? 'instant' : 'smooth' });
    }
    function reset(entries) {
      items = entries;
      current = 0;
      thumbnails();
      show(0);
    }
    root.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
    root.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
    root.addEventListener('keydown', event => {
      if (event.target.closest('button, video, a, input, select, textarea')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    let start = null;
    root.querySelector('.gallery-stage').addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' && !e.target.closest('video')) start = { x: e.clientX, y: e.clientY };
    });
    root.querySelector('.gallery-stage').addEventListener('pointerup', e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1));
      start = null;
    });
    reset(items);
    return reset;
  }
  const main = document.querySelector('[data-gallery="all"]');
  const changeMain = main ? createGallery(main) : null;
  document.querySelectorAll('[data-gallery]:not([data-gallery="all"])').forEach(createGallery);
  document.querySelectorAll('[data-gallery-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-gallery-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const key = button.dataset.galleryFilter;
    changeMain?.(key === 'all' ? all : galleryFor(key));
  }));

  // Estimate form: FormSubmit handles native multipart POST, attachment delivery,
  // its own CAPTCHA. Do not AJAX file uploads here. Use the native response
  // while investigating form activation/delivery.
  const form = document.getElementById('inquiry-form');
  if (form) {
    const select = form.elements.namedItem('service');
    const preselected = new URLSearchParams(location.search).get('service');
    if (preselected && [...select.options].some(option => option.value === preselected)) select.value = preselected;

    const stockItem = new URLSearchParams(location.search).get('item');
    const inquiryText = form.elements.namedItem('message');
    if (stockItem && inquiryText && stockItem.length <= 130 && !inquiryText.value) {
      inquiryText.value = `I'm interested in this in-stock item: ${stockItem}\n\n`; // visitor can edit
    }

    const fileInput = document.getElementById('project-files');
    const fileList = document.getElementById('file-list');
    const uploadError = document.getElementById('upload-error');
    const methodError = document.getElementById('contact-method-error');
    const setupError = document.getElementById('form-setup-error');
    const dialog = document.getElementById('upload-limit-dialog');
    const dialogTitle = document.getElementById('upload-dialog-title');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton.querySelector('.submit-label');
    const MAX_FILES = 5;
    const MAX_BYTES = 9 * 1024 * 1024; // FormSubmit permits up to 10 MB total.
    const allowedExtensions = /\.(pdf|png|jpe?g|webp|heic|docx?|txt)$/i;

    // FormSubmit accepts either an activated email address OR the opaque token
    // from its confirmation email. Keep the URL as a native POST for CAPTCHA/files.
    const configuredURL = form.getAttribute('action') || '';
    const match = configuredURL.match(/^https:\/\/formsubmit\.co\/([^/?#]+)$/i);
    const destination = match ? decodeURIComponent(match[1]) : '';
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination);
    const isToken = /^[A-Za-z0-9_-]{12,}$/.test(destination);
    const ready = (isEmail || isToken) &&
      !['REPLACE_WITH_BUSINESS_EMAIL', 'REPLACE_WITH_FORM_SUBMIT_TOKEN'].includes(destination);
    // Attach the full public form URL as FormSubmit recommends when the
    // browser only sends an origin-level Referrer or the header is missing.
    // Do not populate _url on file:// or local previews.
    const hosted = (location.protocol === 'https:' || location.protocol === 'http:') &&
      !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const sourceField = form.elements.namedItem('_url');
    if (sourceField) {
      if (hosted) sourceField.value = new URL(location.pathname, location.origin).href;
      else sourceField.disabled = true;
    }

    // _next is processed by FormSubmit after its handling, not by a frontend
    // success guess. CAPTCHA, bad setup, or request failures stay off our page.
    if (ready && hosted) {
      const redirect = document.createElement('input');
      redirect.type = 'hidden';
      redirect.name = '_next';
      redirect.value = new URL('inquiry-sent.html', location.href).href;
      form.appendChild(redirect);
    }

    function showLimit(message) {
      dialogTitle.textContent = message;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else { // Older browsers retain the always-visible email fallback by the file picker.
        uploadError.textContent = `${message} Please send the inquiry without large attachments; we can arrange files later.`;
        uploadError.hidden = false;
      }
    }
    document.getElementById('upload-dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      // Clicking the backdrop dismisses the dialog; not the content.
      if (event.target === dialog) dialog.close();
    });
    function checkFiles(showDialog) {
      uploadError.hidden = true;
      const files = [...fileInput.files];
      const total = files.reduce((sum, file) => sum + file.size, 0);
      fileList.replaceChildren();
      for (const file of files) {
        const item = document.createElement('li');
        item.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
        fileList.append(item);
      }
      if (files.length) {
        const totalItem = document.createElement('li');
        totalItem.className = 'file-total';
        totalItem.textContent = `Total: ${(total / 1024 / 1024).toFixed(1)} MB`;
        fileList.append(totalItem);
      }
      if (total > MAX_BYTES) {
        if (showDialog) showLimit('Attachments are over 9 MB.');
        return false;
      }
      if (files.length > MAX_FILES) {
        if (showDialog) showLimit('Please choose no more than five files.');
        return false;
      }
      if (files.some(file => !allowedExtensions.test(file.name))) {
        uploadError.textContent = 'Please use PDF, JPG, PNG, WEBP, HEIC, DOC, DOCX or TXT files.';
        uploadError.hidden = false;
        return false;
      }
      return true;
    }
    fileInput.addEventListener('change', () => checkFiles(true));

    // Native formdata event retains standard browser POST + CAPTCHA, while each
    // selected file gets a separate multipart part (as FormSubmit documents).
    form.addEventListener('formdata', event => {
      const files = [...fileInput.files];
      event.formData.delete('files');
      files.forEach((file, index) => event.formData.append(`attachment_${index + 1}`, file, file.name));
    });
    form.addEventListener('submit', event => {
      const email = String(form.elements.namedItem('email').value).trim();
      const phone = String(form.elements.namedItem('phone').value).trim();
      methodError.hidden = !!(email || phone);
      setupError.hidden = true;
      if (!email && !phone) {
        event.preventDefault();
        form.elements.namedItem('email').focus();
        return;
      }
      if (!checkFiles(true)) {
        event.preventDefault();
        return;
      }
      if (!ready || location.protocol === 'file:') {
        event.preventDefault();
        setupError.textContent = !ready
          ? 'Online inquiries are not configured. Please call 336-655-0208.'
          : 'This form needs to be opened on the published website to test email delivery.';
        setupError.hidden = false;
        setupError.scrollIntoView({ block: 'nearest' });
        return;
      }
      // Give inquiries a recognizable subject for inbox filters, including CNC sign work.
      form.elements.namedItem('_subject').value = 'T-Squared website inquiry | ' + String(select.value || 'New project');
      // Do not preventDefault here. The native POST is required for attachments.
      submitButton.disabled = true;
      submitLabel.textContent = 'Sending…';
    });
    window.addEventListener('pageshow', () => {
      submitButton.disabled = false;
      submitLabel.textContent = 'Send the inquiry';
    });
  }
})();
