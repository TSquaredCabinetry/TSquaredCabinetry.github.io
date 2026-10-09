/* T-Squared, no framework, no build tools, no external dependencies. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-navigation');
  if (menu && nav) {
    const close = () => { menu.setAttribute('aria-expanded','false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.nav-inner')) close(); });
  }
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // A slideshow is simply <div data-gallery="kitchens"></div>. Slides come
  // from galleries.js; the same data powers every instance site-wide.
  const galleries = window.T2_GALLERIES || {};
  const all = [...new Set(['kitchens','bathrooms','builtins','signs'])].flatMap(key => galleries[key] || []);
  const escapeHTML = s => String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function createGallery(root) {
    const keys = root.dataset.gallery === 'all' ? all : (galleries[root.dataset.gallery] || []);
    let photos = keys;
    let index = 0;
    const selector = root.dataset.gallery === 'all' ? 'All work' : root.dataset.gallery;
    root.classList.add('gallery-shell');
    root.setAttribute('role','region');
    root.setAttribute('aria-label', `${selector} project photo gallery`);
    root.setAttribute('tabindex','0');
    root.innerHTML = `
      <div class="gallery-stage"><a class="gallery-full" href="#" target="_blank" rel="noopener" aria-label="Open full image"><div class="gallery-image"></div></a></div>
      <div class="gallery-caption"><div><strong data-caption-title></strong><span data-caption-note></span></div><div class="gallery-counter" aria-live="polite" aria-atomic="true"></div></div>
      <div class="gallery-navigation"><div class="gallery-thumbnails" aria-label="Choose an image"></div><div class="gallery-arrows"><button type="button" data-prev aria-label="Previous image">←</button><button type="button" data-next aria-label="Next image">→</button></div></div>`;
    const img = root.querySelector('.gallery-image');
    const link = root.querySelector('.gallery-full');
    const counter = root.querySelector('.gallery-counter');
    const title = root.querySelector('[data-caption-title]');
    const note = root.querySelector('[data-caption-note]');
    const thumbs = root.querySelector('.gallery-thumbnails');
    const missingHTML = label => `<div class="placeholder"><span class="question" aria-hidden="true">?</span><span class="placeholder-label">${escapeHTML(label || 'Project image pending')}</span></div>`;
    function renderThumbnails() {
      thumbs.innerHTML = photos.map((photo, i) => `<button type="button" data-go="${i}" aria-label="Show ${escapeHTML(photo.title)}" aria-pressed="false">${photo.src ? `<img src="${escapeHTML(photo.src)}" alt="" loading="lazy">` : '<span class="tiny-question" aria-hidden="true">?</span>'}</button>`).join('');
      thumbs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => show(Number(button.dataset.go))));
    }
    function show(i) {
      if (!photos.length) return;
      index = (i + photos.length) % photos.length;
      const photo = photos[index];
      img.innerHTML = photo.src ? `<img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.alt || photo.title)}" ${index !== 0 ? 'loading="lazy"' : ''}>` : missingHTML(photo.title);
      link.href = photo.src || '#';
      link.style.pointerEvents = photo.src ? '' : 'none';
      link.setAttribute('aria-label', photo.src ? `Open full photo: ${photo.title}` : `${photo.title}, photo pending`);
      title.textContent = photo.title;
      note.textContent = photo.missing ? 'Project photograph pending.' : 'Open full photograph';
      counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
      thumbs.querySelectorAll('button').forEach((button,j) => button.setAttribute('aria-pressed', String(j === index)));
      const chosen = thumbs.children[index];
      if (chosen) thumbs.scrollTo({left: Math.max(0, chosen.offsetLeft - thumbs.offsetLeft - 12), behavior: reduce.matches ? 'instant' : 'smooth'});
    }
    function reset(list) { photos = list.length ? list : [{title:'Project photos to come',missing:true}]; index=0;renderThumbnails();show(0); }
    root.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
    root.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    let down = null;
    let swallowClick = false;
    link.addEventListener('click', event => {
      if (!swallowClick) return;
      event.preventDefault();
      swallowClick = false;
    });
    root.querySelector('.gallery-stage').addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') down = { x:event.clientX,y:event.clientY };
    });
    root.querySelector('.gallery-stage').addEventListener('pointerup', event => {
      if (!down) return;
      const dx = event.clientX - down.x,dy = event.clientY - down.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        show(index + (dx < 0 ? 1 : -1));
        // A finger swipe shouldn't accidentally open the underlying image.
        swallowClick = true;
        window.setTimeout(() => { swallowClick = false; }, 350);
      }
      down = null;
    });
    root.querySelector('.gallery-stage').addEventListener('pointercancel', () => down=null);
    reset(photos);
    return reset;
  }
  const mainGallery = document.querySelector('[data-gallery="all"]');
  const changeMain = mainGallery ? createGallery(mainGallery) : null;
  document.querySelectorAll('[data-gallery]:not([data-gallery="all"])').forEach(createGallery);
  document.querySelectorAll('[data-gallery-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-gallery-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const filter = button.dataset.galleryFilter;
    changeMain?.(filter === 'all' ? all : (galleries[filter] || []));
  }));

  const form = document.getElementById('inquiry-form');
  if (form) {
    const service = new URLSearchParams(location.search).get('service');
    const select = form.elements.namedItem('service');
    if (select && service && [...select.options].some(option => option.value === service)) select.value = service;
    const preview = document.getElementById('request-preview');
    const content = document.getElementById('request-content');
    const status = document.getElementById('copy-status');
    const fileInput = document.getElementById('project-files');
    const fileList = document.getElementById('file-list');
    const methodError = document.getElementById('contact-method-error');
    const MAX_FILES = 5, MAX_TOTAL_SIZE = 9 * 1024 * 1024; // Keep below FormSubmit.co's 10 MB attachment cap.
    const endpoint = (form.dataset.endpoint || '').trim();
    const allowedExtensions = /\.(pdf|png|jpe?g|webp|heic|docx?|txt)$/i;
    const displayFiles = () => {
      fileList.replaceChildren();
      [...fileInput.files].forEach(file => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
        fileList.append(li);
      });
    };
    fileInput.addEventListener('change', displayFiles);
    if (endpoint) {
      // A genuine multipart-capable, secure, owner-verified endpoint is required.
      const help = form.querySelector('.file-help');
      const endNote = form.querySelector('.form-end small');
      const submit = form.querySelector('button[type="submit"]');
      if (help) help.textContent = 'Choose up to 5 files, 9 MB combined (PDF, image or document). They will be included with your inquiry.';
      if (endNote) endNote.textContent = 'Use the form to submit an estimate request. We will review the details and contact you.';
      if (submit) submit.textContent = 'Send project inquiry ↗';
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      if (!email && !phone) { methodError.hidden = false; form.elements.namedItem('email').focus(); return; }
      methodError.hidden = true;
      const files = [...fileInput.files];
      if (files.length > MAX_FILES || files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE || files.some(file => !allowedExtensions.test(file.name))) {
        window.alert('Please choose up to five PDF, image or document files, no more than 9 MB combined. For larger plans or photographs, include a share link in the project details.');
        fileInput.focus();
        return;
      }
      if (endpoint) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true; button.textContent = 'Sending…';
        try {
          // FormSubmit.co's documentation allows multiple named file fields.
          // Turn the browser's multi-file input into separate fields for that provider.
          const isFormSubmit = /^https:\/\/formsubmit\.co\/ajax\//i.test(endpoint);
          if (isFormSubmit) {
            data.delete('files');
            files.forEach((file, i) => data.append(`attachment_${i + 1}`, file, file.name));
          }
          // Keep multipart boundaries under browser control; never set Content-Type yourself.
          const response = await fetch(endpoint, {method: 'POST', body: data, headers: {'Accept': 'application/json'}});
          const responseType = response.headers.get('content-type') || '';
          const result = responseType.includes('application/json') ? await response.json() : null;
          // HTML responses from FormSubmit could be activation or CAPTCHA screens, not proof of delivery.
          if (!response.ok || (isFormSubmit && !result) || result?.success === false || result?.success === 'false' || result?.ok === false) {
            throw new Error('The submission was not confirmed by the form provider.');
          }
          preview.hidden = false;
          preview.querySelector('h3').textContent = 'Inquiry received';
          preview.querySelector('p.small').textContent = 'Your project details were submitted. Please call if the request is urgent.';
          content.textContent = 'Thank you. Your estimate request has been sent.';
          preview.querySelector('#copy-request').hidden = true;
          status.textContent = '';
          form.reset(); displayFiles();
        } catch (error) {
          preview.hidden = false;
          preview.querySelector('h3').textContent = 'Could not send your inquiry';
          preview.querySelector('p.small').textContent = 'Please call 336-655-0208 to discuss the project instead. Your form details have not been confirmed as received.';
          content.textContent = '';
          status.textContent = '';
        } finally { button.disabled = false; button.textContent = 'Send project inquiry ↗'; }
        preview.scrollIntoView({behavior: reduce.matches ? 'instant' : 'smooth', block:'nearest'});
        return;
      }
      const text = `T-SQUARED PROJECT INQUIRY\n\nName: ${data.get('name')}\nEmail: ${email || 'Not provided'}\nPhone: ${phone || 'Not provided'}\nService: ${data.get('service')}\nProject location: ${data.get('location') || 'To discuss'}\nDimensions: ${data.get('dimensions') || 'To discuss'}\n\nProject details:\n${data.get('message')}\n\nSelected files (NOT sent): ${files.length ? files.map(file => file.name).join(', ') : 'None'}`;
      preview.querySelector('h3').textContent = 'Inquiry preview';
      preview.querySelector('p.small').textContent = 'Copy your project notes to keep them handy when you call. Nothing has been sent. Any selected files remain on your device.';
      preview.querySelector('#copy-request').hidden = false;
      content.textContent = text;
      status.textContent = 'Preview only. No inquiry or files have been sent.';
      preview.hidden = false;
      preview.scrollIntoView({behavior: reduce.matches ? 'instant' : 'smooth', block:'nearest'});
    });
    document.getElementById('copy-request').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(content.textContent); status.textContent = 'Copied to clipboard. No message or file was sent.'; }
      catch { status.textContent = 'Clipboard unavailable here. Select the text above and copy it manually.'; }
    });
  }
})();
