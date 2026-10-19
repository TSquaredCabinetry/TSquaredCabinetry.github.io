/* T-Squared: public stock gallery generated entirely from data/stock.json.
   No login, edit controls, credentials, or server-side code on GitHub Pages. */
(() => {
  'use strict';
  const root = document.getElementById('stock-gallery');
  if (!root) return;
  const empty = message => {
    root.replaceChildren();
    const p = document.createElement('p');
    p.className = 'stock-empty';
    p.textContent = message;
    root.append(p);
  };
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value; // never inject seller text as HTML
    return node;
  };
  const validPhoto = src => typeof src === 'string' && /^assets\/stock\/[a-f0-9]{16}\/[0-9]{2}\.webp$/.test(src);
  function renderItem(item) {
    if (!item || typeof item.title !== 'string' || !Array.isArray(item.photos)) return null;
    const photos = item.photos.filter(validPhoto);
    if (!photos.length) return null;
    const card = el('article', 'stock-card');
    const cover = el('img', 'stock-photo');
    cover.src = photos[0];
    cover.alt = item.title;
    cover.loading = 'lazy';
    card.append(cover);
    if (photos.length > 1) {
      const thumbs = el('div', 'stock-thumbs');
      for (const [i, url] of photos.entries()) {
        const button = el('button');
        button.type = 'button';
        button.setAttribute('aria-label', `View photo ${i + 1} of ${item.title}`);
        button.setAttribute('aria-pressed', String(i === 0));
        const thumb = el('img');
        thumb.src = url;
        thumb.alt = '';
        thumb.loading = 'lazy';
        button.append(thumb);
        button.addEventListener('click', () => {
          cover.src = url;
          for (const child of thumbs.children) child.setAttribute('aria-pressed', String(child === button));
        });
        thumbs.append(button);
      }
      card.append(thumbs);
    }
    const body = el('div', 'stock-card-body');
    body.append(el('p', 'stock-tag', "We're selling this stock"));
    body.append(el('h3', '', item.title));
    const price = Number(item.price);
    if (Number.isFinite(price)) body.append(el('p', 'stock-price', price.toLocaleString('en-US', {style:'currency', currency:'USD'})));
    if (item.description) body.append(el('p', 'stock-desc', String(item.description)));
    if (Array.isArray(item.labels) && item.labels.length) {
      const tags = el('div', 'stock-labels');
      item.labels.slice(0, 8).forEach(label => tags.append(el('span', '', String(label))));
      body.append(tags);
    }
    const link = el('a', 'btn', 'Ask about this item ↗');
    link.href = `contact.html?service=${encodeURIComponent('Wood / lumber inquiry')}&item=${encodeURIComponent(String(item.title))}`;
    body.append(link);
    card.append(body);
    return card;
  }
  fetch('data/stock.json', {cache: 'no-store'})
    .then(response => { if (!response.ok) throw new Error('Stock data not available'); return response.json(); })
    .then(data => {
      root.replaceChildren();
      const items = Array.isArray(data.items) ? data.items : [];
      const cards = items.map(renderItem).filter(Boolean);
      if (!cards.length) empty('Nothing is listed for sale right now. Check back soon, or contact the shop to ask what is available.');
      else root.append(...cards);
    })
    .catch(() => empty('Stock listings are temporarily unavailable. Please contact the shop for current availability.'));
})();
