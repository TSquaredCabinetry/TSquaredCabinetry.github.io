/* T-Squared: public stock gallery from data/stock.json. No dashboard login or
   edit controls on GitHub Pages; the desktop dashboard alone manages listings. */
(() => {
  'use strict';
  const root = document.getElementById('stock-gallery');
  if (!root) return;
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value; // seller text is never HTML
    return node;
  };
  const empty = message => root.replaceChildren(el('p', 'stock-empty', message));
  // The editor uses both sequential photo names and unique names for replacements.
  const validPhoto = src => typeof src === 'string' &&
    /^assets\/stock\/[a-f0-9]{16}\/(?:[0-9]{2}|[a-f0-9]{20})\.webp$/.test(src);

  function renderItem(item) {
    if (!item || typeof item.title !== 'string' || !Array.isArray(item.photos)) return null;
    const photos = item.photos.filter(validPhoto);
    if (!photos.length) return null;
    const photoLabels = item.photo_labels && typeof item.photo_labels === 'object' ? item.photo_labels : {};
    const card = el('article', 'stock-card');
    const viewer = el('div', 'stock-viewer');
    const coverLink = el('a', 'stock-cover-link');
    coverLink.target = '_blank';
    coverLink.rel = 'noopener';
    const cover = el('img', 'stock-photo');
    cover.loading = 'lazy';
    coverLink.append(cover);
    viewer.append(coverLink);
    const caption = el('div', 'stock-gallery-caption');
    const captionText = el('span', 'stock-image-label');
    const counter = el('span', 'stock-image-counter');
    caption.append(captionText, counter);
    viewer.append(caption);
    const controls = el('div', 'stock-gallery-navigation');
    const thumbs = el('div', 'stock-thumbs');
    thumbs.setAttribute('aria-label', `Choose a photo of ${item.title}`);
    const arrows = el('div', 'stock-gallery-arrows');
    const prev = el('button', '', '←');
    const next = el('button', '', '→');
    for (const [button, name] of [[prev, 'Previous photo'], [next, 'Next photo']]) {
      button.type = 'button';
      button.setAttribute('aria-label', `${name} of ${item.title}`);
      arrows.append(button);
    }
    controls.append(thumbs, arrows);
    let current = 0;
    function show(index) {
      current = (index + photos.length) % photos.length;
      const url = photos[current];
      cover.src = url;
      cover.alt = `${item.title}${photoLabels[url] ? ` — ${photoLabels[url]}` : ''}`;
      coverLink.href = url;
      coverLink.setAttribute('aria-label', `Open large photo of ${item.title}`);
      captionText.textContent = photoLabels[url] || item.title;
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      for (const [i, button] of [...thumbs.children].entries())
        button.setAttribute('aria-pressed', String(i === current));
    }
    for (const [i, url] of photos.entries()) {
      const button = el('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Photo ${i + 1}: ${photoLabels[url] || item.title}`);
      const thumb = el('img');
      thumb.src = url;
      thumb.alt = '';
      thumb.loading = 'lazy';
      button.append(thumb);
      button.addEventListener('click', () => show(i));
      thumbs.append(button);
    }
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    viewer.tabIndex = 0;
    viewer.addEventListener('keydown', event => {
      if (event.target !== viewer || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    if (photos.length > 1) viewer.append(controls);
    show(0);
    card.append(viewer);

    const body = el('div', 'stock-card-body');
    body.append(el('p', 'stock-tag', "We're selling this stock"));
    body.append(el('h3', '', item.title));
    const price = Number(item.price);
    if (Number.isFinite(price)) body.append(el('p', 'stock-price',
      price.toLocaleString('en-US', {style: 'currency', currency: 'USD'})));
    if (item.description) body.append(el('p', 'stock-desc', String(item.description)));
    if (Array.isArray(item.labels) && item.labels.length) {
      const tags = el('div', 'stock-labels');
      item.labels.slice(0, 8).forEach(value => tags.append(el('span', '', String(value))));
      body.append(tags);
    }
    const link = el('a', 'btn', 'Ask about this item ↗');
    link.href = `contact.html?service=${encodeURIComponent('Wood / lumber inquiry')}&item=${encodeURIComponent(item.title)}`;
    body.append(link);
    card.append(body);
    return card;
  }
  fetch('data/stock.json', {cache: 'no-store'})
    .then(response => { if (!response.ok) throw new Error('Stock data unavailable'); return response.json(); })
    .then(data => {
      const items = Array.isArray(data.items) ? data.items : [];
      const cards = items.map(renderItem).filter(Boolean);
      if (!cards.length) empty('Nothing is listed for sale right now. Check back soon, or contact the shop to ask what is available.');
      else root.replaceChildren(...cards);
    })
    .catch(() => empty('Stock listings are temporarily unavailable. Please contact the shop for current availability.'));
})();
