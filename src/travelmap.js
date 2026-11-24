// Travel map: a hand-drawn-feeling world map with pins, hover tips and place cards.
// Land outlines come from Natural Earth (public domain), pre-projected into /assets/world-land.json.
const W = 1000, ASPECT = 2;
function ne1(lng, lat) {
 const l = lng * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
 return [
  l * (0.8707 - 0.131979 * p2 - 0.013791 * p4 + 0.003971 * p4 * p4 * p2 - 0.001529 * p4 * p4 * p4),
  p * (1.007226 + 0.015085 * p2 - 0.044475 * p4 * p2 + 0.028874 * p4 * p4 - 0.005916 * p4 * p4 * p2)
 ];
}
const S = W / (2 * ne1(180, 0)[0]), TOP = ne1(0, 84)[1], H = (TOP - ne1(0, -57)[1]) * S;
export const project = (lng, lat) => { const [x, y] = ne1(lng, lat); return [W / 2 + x * S, (TOP - y) * S]; };

const WORLD = 'World';
const PIN = 'M0 0C-1.6-4.6-6.4-7.8-6.4-12.6A6.4 6.4 0 1 1 6.4-12.6C6.4-7.8 1.6-4.6 0 0Z';
let landPromise = null, active = null;

function graticule() {
 let d = '';
 for (let lng = -180; lng <= 180; lng += 30) { d += 'M'; for (let lat = -57; lat <= 84; lat += 3) d += project(lng, lat).map(n => n.toFixed(1)).join(' ') + (lat + 3 <= 84 ? 'L' : ''); }
 for (const lat of [-30, 0, 30, 60]) { d += 'M'; for (let lng = -180; lng <= 180; lng += 5) d += project(lng, lat).map(n => n.toFixed(1)).join(' ') + (lng + 5 <= 180 ? 'L' : ''); }
 return d;
}
function regionsOf(module) { return [WORLD, ...new Set(module.items.map(i => i.region).filter(Boolean))]; }
function viewFor(module, region) {
 if (region === WORLD) return [0, H / 2 - W / ASPECT / 2, W, W / ASPECT];
 const pts = module.items.filter(i => i.region === region).map(i => project(i.lng, i.lat));
 const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
 let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
 let w = Math.max(x1 - x0, 40) * 1.3, hgt = Math.max(y1 - y0, 20) * 1.3 + 14;
 if (w / hgt < ASPECT) w = hgt * ASPECT; else hgt = w / ASPECT;
 return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - hgt / 2 - 4, w, hgt];
}
const placeLine = (item, h) => [item.date, item.kicker].filter(Boolean).map(h).join(' · ');

function card(item, h, picture) {
 return `<article class="award-card place-card story-enter"><div class="award-heading"><div><span class="tiny-label">${placeLine(item, h)}</span><h3>${h(item.title)}</h3></div></div>${picture(item, 'award-photo')}<p class="photo-caption">${h(item.summary)}</p></article>`;
}

export function renderTravel(module, s, h, picture) {
 const regions = regionsOf(module);
 if (!regions.includes(s.region)) s.region = regions[1] || WORLD;
 const vb = viewFor(module, s.region);
 const pins = module.items.map((item, i) => {
  const [x, y] = project(item.lng, item.lat);
  return `<g class="map-pin" data-place="${i}" data-x="${x.toFixed(2)}" data-y="${y.toFixed(2)}" tabindex="0" role="button" aria-label="${h(item.title)}${item.date ? ', ' + h(item.date) : ''}" aria-pressed="${i === s.item}"><g class="pin-body"><circle class="pin-pulse" r="7" cy="0"/><path d="${PIN}"/><circle cy="-12.6" r="2.5" class="pin-dot"/></g></g>`;
 }).join('');
 return `<div class="choice-strip map-regions" aria-label="Choose a map view">${regions.map(r => `<button data-region="${h(r)}" aria-pressed="${r === s.region}">${h(r)}</button>`).join('')}</div>
<div class="travel-map" data-map>
 <svg viewBox="${vb.map(n => n.toFixed(2)).join(' ')}" preserveAspectRatio="xMidYMid slice" aria-label="Map of places I've visited. Use the list below the map to choose a place.">
  <path class="map-grid" d="${graticule()}"/>
  <path class="map-land" d=""/>
  <g class="map-pins">${pins}</g>
 </svg>
 <div class="map-tip" role="status" hidden></div>
 <p class="map-note" hidden>Map outline unavailable right now. The pins still work.</p>
</div>
<div class="map-stops" aria-label="Choose a place">${module.items.map((item, i) => `<button data-place="${i}" aria-pressed="${i === s.item}"><b>${String(i + 1).padStart(2, '0')}</b>${h(item.tab || item.title)}</button>`).join('')}</div>
<div class="place-slot">${card(module.items[s.item], h, picture)}</div>`;
}

function sizePins(root) {
 const svg = root.querySelector('svg'), vb = svg.viewBox.baseVal, px = svg.getBoundingClientRect().width || 520;
 const k = Math.max(vb.width / px, vb.height / (px / ASPECT)) * 1.0;
 root.querySelectorAll('.map-pin').forEach(p => p.setAttribute('transform', `translate(${p.dataset.x} ${p.dataset.y}) scale(${k.toFixed(4)})`));
}
function animateTo(root, target) {
 const svg = root.querySelector('svg'), vb = svg.viewBox.baseVal, from = [vb.x, vb.y, vb.width, vb.height];
 const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), dur = reduce ? 0 : 650;
 const step = now => {
  const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  svg.setAttribute('viewBox', from.map((v, i) => (v + (target[i] - v) * e).toFixed(2)).join(' '));
  sizePins(root);
  if (t < 1) requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
}
function showTip(root, pin, item, h) {
 const tip = root.querySelector('.map-tip'), svg = root.querySelector('svg'), vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
 const scale = Math.max(r.width / vb.width, r.height / vb.height), ox = (r.width - vb.width * scale) / 2, oy = (r.height - vb.height * scale) / 2;
 const x = ox + (pin.dataset.x - vb.x) * scale, y = oy + (pin.dataset.y - vb.y) * scale;
 tip.innerHTML = `<b>${h(item.title)}</b>${item.date ? `<span>${h(item.date)}</span>` : ''}`;
 tip.hidden = false;
 tip.style.left = Math.min(Math.max(x, 70), r.width - 70) + 'px';
 const below = y < 82;
 tip.classList.toggle('below', below);
 tip.style.top = (below ? y + 8 : y - 26) + 'px';
}
const hideTip = root => { const t = root.querySelector('.map-tip'); if (t) t.hidden = true; };

export function wireTravel(host, module, s, h, picture) {
 const root = host.querySelector?.('[data-map]');
 if (!root) return;
 active = { host, module, s, h, picture, root };
 sizePins(root);
 landPromise ||= fetch(((import.meta.env && import.meta.env.BASE_URL) || '/') + 'assets/world-land.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
 landPromise.then(d => { if (root.isConnected) root.querySelector('.map-land').setAttribute('d', d.d); })
  .catch(() => { landPromise = null; if (root.isConnected) root.querySelector('.map-note').hidden = false; });
}

function selectPlace(i, fromPin) {
 const { host, module, s, h, picture, root } = active;
 if (i === s.item && !fromPin) return;
 s.item = i;
 const item = module.items[i];
 host.querySelectorAll('[data-place]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.place) === i)));
 const pin = root.querySelector(`.map-pin[data-place="${i}"]`);
 pin.parentNode.appendChild(pin); // bring to front
 if (item.region && s.region !== WORLD && item.region !== s.region) setRegion(item.region);
 host.querySelector('.place-slot').innerHTML = card(item, h, picture);
 showTip(root, pin, item, h);
}
function setRegion(region) {
 const { host, module, s, root } = active;
 s.region = region;
 host.querySelectorAll('[data-region]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.region === region)));
 hideTip(root);
 animateTo(root, viewFor(module, region));
}

document.addEventListener('click', e => {
 if (!active || !active.root.isConnected) return;
 const r = e.target.closest('[data-region]');
 if (r && active.host.contains(r)) return setRegion(r.dataset.region);
 const p = e.target.closest('[data-place]');
 if (p && active.host.contains(p)) selectPlace(Number(p.dataset.place), p.classList.contains('map-pin'));
});
document.addEventListener('keydown', e => {
 const p = e.target.closest?.('.map-pin');
 if (p && active && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectPlace(Number(p.dataset.place), true); }
});
['pointerover', 'focusin'].forEach(type => document.addEventListener(type, e => {
 const p = e.target.closest?.('.map-pin');
 if (p && active && active.root.contains(p)) showTip(active.root, p, active.module.items[p.dataset.place], active.h);
}));
['pointerout', 'focusout'].forEach(type => document.addEventListener(type, e => {
 const p = e.target.closest?.('.map-pin');
 if (p && active && active.root.contains(p) && !p.contains(e.relatedTarget)) {
  if (Number(p.dataset.place) === active.s.item && type === 'pointerout') return showTip(active.root, active.root.querySelector(`.map-pin[data-place="${active.s.item}"]`), active.module.items[active.s.item], active.h);
  hideTip(active.root);
 }
}));
globalThis.addEventListener?.('resize', () => { if (active?.root.isConnected) { sizePins(active.root); hideTip(active.root); } });
