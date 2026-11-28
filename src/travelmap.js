// Travel map: a hand-drawn-feeling world map with pins, hover tips and place cards.
// Land outlines come from Natural Earth (public domain), pre-projected into /assets/world-land.json.
import { t, lang } from './i18n.js';
const W = 1000, ASPECT = 2;
const regionName = r => t(r === WORLD ? 'world' : r);
// Province and state names for the Chinese version of the map.
const ADMIN_ZH = {Xinjiang:'新疆','Inner Mongolia':'内蒙古',Tibet:'西藏',Qinghai:'青海',Heilongjiang:'黑龙江',Sichuan:'四川',Gansu:'甘肃',Yunnan:'云南',Guangxi:'广西',Shaanxi:'陕西',Jilin:'吉林',Hunan:'湖南',Hebei:'河北',Hubei:'湖北',Guizhou:'贵州',Henan:'河南',Guangdong:'广东',Jiangxi:'江西',Shanxi:'山西',Shandong:'山东',Liaoning:'辽宁',Anhui:'安徽',Fujian:'福建',Jiangsu:'江苏',Zhejiang:'浙江',Chongqing:'重庆',Ningxia:'宁夏',Hainan:'海南',
 Texas:'得克萨斯',Montana:'蒙大拿',California:'加利福尼亚','New Mexico':'新墨西哥',Nevada:'内华达',Arizona:'亚利桑那',Colorado:'科罗拉多',Wyoming:'怀俄明',Michigan:'密歇根',Oregon:'俄勒冈',Minnesota:'明尼苏达',Idaho:'爱达荷',Utah:'犹他',Kansas:'堪萨斯','South Dakota':'南达科他',Nebraska:'内布拉斯加','North Dakota':'北达科他',Washington:'华盛顿',Missouri:'密苏里',Wisconsin:'威斯康星',Oklahoma:'俄克拉何马',Illinois:'伊利诺伊',Iowa:'艾奥瓦',Georgia:'佐治亚','New York':'纽约',Florida:'佛罗里达',Arkansas:'阿肯色',Alabama:'亚拉巴马','North Carolina':'北卡罗来纳',Pennsylvania:'宾夕法尼亚',Mississippi:'密西西比',Ohio:'俄亥俄',Louisiana:'路易斯安那',Tennessee:'田纳西',Kentucky:'肯塔基',Virginia:'弗吉尼亚',Indiana:'印第安纳',Maine:'缅因','South Carolina':'南卡罗来纳','West Virginia':'西弗吉尼亚',Vermont:'佛蒙特','New Hampshire':'新罕布什尔',Maryland:'马里兰',Massachusetts:'马萨诸塞','New Jersey':'新泽西'};
const adminName = n => lang === 'zh' ? (ADMIN_ZH[n] || n) : n;
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
const inRegion = (item, region) => region === WORLD || item.region === region;
// Regions with a fixed frame and province/state outlines + names.
const REGIONS = { China: { iso: 'CHN', b: [73.5, 18, 134.8, 53.6] }, 'United States': { iso: 'USA', b: [-124.8, 24.5, -66.9, 49.4] } };
const PIN = 'M0 0C-1.6-4.6-6.4-7.8-6.4-12.6A6.4 6.4 0 1 1 6.4-12.6C6.4-7.8 1.6-4.6 0 0Z';
let landPromise = null, adminPromise = null, active = null;

function graticule() {
 let d = '';
 for (let lng = -180; lng <= 180; lng += 30) { d += 'M'; for (let lat = -57; lat <= 84; lat += 3) d += project(lng, lat).map(n => n.toFixed(1)).join(' ') + (lat + 3 <= 84 ? 'L' : ''); }
 for (const lat of [-30, 0, 30, 60]) { d += 'M'; for (let lng = -180; lng <= 180; lng += 5) d += project(lng, lat).map(n => n.toFixed(1)).join(' ') + (lng + 5 <= 180 ? 'L' : ''); }
 return d;
}
function regionsOf(module) { return [WORLD, ...new Set(module.items.map(i => i.region).filter(Boolean))]; }
function viewFor(module, region) {
 if (region === WORLD) return [0, H / 2 - W / ASPECT / 2, W, W / ASPECT];
 const box = REGIONS[region]?.b;
 const pts = box ? [0, .25, .5, .75, 1].flatMap(t => [project(box[0] + (box[2] - box[0]) * t, box[1]), project(box[0] + (box[2] - box[0]) * t, box[3]), project(box[0], box[1] + (box[3] - box[1]) * t), project(box[2], box[1] + (box[3] - box[1]) * t)])
  : module.items.filter(i => i.region === region).map(i => project(i.lng, i.lat));
 if (box) { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; let w = (x1 - x0) * 1.04, hgt = (y1 - y0) * 1.04; const a = Math.min(ASPECT, Math.max(1.35, w / hgt)); if (w / hgt < a) w = hgt * a; else hgt = w / a; return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - hgt / 2, w, hgt]; }
 const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
 let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
 let w = Math.max(x1 - x0, 40) * 1.3, hgt = Math.max(y1 - y0, 20) * 1.3 + 14;
 if (w / hgt < ASPECT) w = hgt * ASPECT; else hgt = w / ASPECT;
 return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - hgt / 2 - 4, w, hgt];
}
function card(item, h, picture) {
 const spots = item.spots?.length ? item.spots : [item];
 const many = spots.length > 1;
 return `<article class="award-card place-card story-enter"><div class="award-heading"><div><span class="tiny-label">${h(item.kicker || '')}</span><h3>${h(item.title)}</h3></div>${many ? `<strong>${h(t('stops', { n: spots.length }))}</strong>` : ''}</div>${spots.map(sp => `<section class="spot"><span class="tiny-label">${h(sp.date || item.date || '')}</span>${sp === item ? '' : `<h4>${h(sp.title)}</h4>`}${picture(sp, 'award-photo')}<p class="photo-caption">${h(sp.summary || '')}</p></section>`).join('')}</article>`;
}

export function renderTravel(module, s, h, picture) {
 const regions = regionsOf(module);
 if (!regions.includes(s.region)) s.region = regions[1] || WORLD;
 if (!inRegion(module.items[s.item], s.region)) s.item = Math.max(0, module.items.findIndex(i => inRegion(i, s.region)));
 const vb = viewFor(module, s.region);
 const pins = module.items.map((item, i) => {
  const [x, y] = project(item.lng, item.lat);
  const home = Array.isArray(item.home) ? ` home" style="--pin:${h(item.home[0])};--pin-dot:${h(item.home[1] || '#fffaf0')}` : '';
  return `<g class="map-pin${home}" data-place="${i}" data-x="${x.toFixed(2)}" data-y="${y.toFixed(2)}" tabindex="0" role="button" aria-label="${h(item.title)}${Array.isArray(item.home) ? ', ' + h(t('homeAria')) : ''}${item.date ? ', ' + h(item.date) : ''}" aria-pressed="${i === s.item}"><g class="pin-body"><circle class="pin-pulse" r="7" cy="0"/><path d="${PIN}"/><circle cy="-12.6" r="2.5" class="pin-dot"/></g></g>`;
 }).join('');
 return `<div class="choice-strip map-regions" aria-label="${h(t('chooseView'))}">${regions.map(r => `<button data-region="${h(r)}" aria-pressed="${r === s.region}">${h(regionName(r))}</button>`).join('')}</div>
<div class="travel-map" data-map style="aspect-ratio:${vb[2].toFixed(2)}/${vb[3].toFixed(2)}">
 <svg viewBox="${vb.map(n => n.toFixed(2)).join(' ')}" preserveAspectRatio="xMidYMid slice" aria-label="${h(t('mapAria'))}">
  <path class="map-grid" d="${graticule()}"/>
  <path class="map-land" d=""/>
  ${regions.filter(r => REGIONS[r]).map(r => `<g class="map-admin${r === s.region ? ' on' : ''}" data-admin="${h(r)}"><path d=""/><g class="map-labels"></g></g>`).join('')}
  <g class="map-pins">${pins}</g>
 </svg>
 <div class="map-tip" role="status" hidden></div>
 <p class="map-note" hidden>${h(t('mapUnavailable'))}</p>
</div>
${module.items.some(i => Array.isArray(i.home)) ? `<p class="map-legend"><span class="legend-pin"></span>${h(t('visited'))} <span class="legend-pin home-swatch">${module.items.filter(i => Array.isArray(i.home)).map(i => `<i style="background:${h(i.home[0])}"></i>`).filter((v, k, a) => a.indexOf(v) === k).join('')}</span>${h(t('calledHome'))}</p>` : ''}
<div class="map-stops" aria-label="${h(t('choosePlace'))}">${module.items.map((item, i) => `<button data-place="${i}" aria-pressed="${i === s.item}"${inRegion(item, s.region) ? '' : ' hidden'}${Array.isArray(item.home) ? ` class="home" style="--pin:${h(item.home[0])}"` : ''}><b>${String(i + 1).padStart(2, '0')}</b>${h(item.tab || item.title)}</button>`).join('')}</div>
<div class="place-slot">${card(module.items[s.item], h, picture)}</div>`;
}

function sizePins(root) {
 const svg = root.querySelector('svg'), vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
 const k = r.width ? Math.min(vb.width / r.width, vb.height / r.height) : vb.width / 520;
 root.querySelectorAll('.map-labels text').forEach(t => t.setAttribute('font-size', (8.5 * k).toFixed(3)));
 // Nudge pins that would sit on top of each other (e.g. Ann Arbor and Detroit) apart sideways.
 const pins = [...root.querySelectorAll('.map-pin')].map(p => ({ p, x: +p.dataset.x, y: +p.dataset.y })).sort((a, b) => a.x - b.x);
 for (let pass = 0; pass < 3; pass++) for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
  const a = pins[i], b = pins[j], gap = 15 * k, dx = b.x - a.x;
  // Pins stay in their west-to-east order, so a nudge never swaps two cities.
  if (Math.abs(b.y - a.y) < 22 * k && dx < gap) { const push = (gap - dx) / 2; a.x -= push; b.x += push; }
 }
 pins.forEach(({ p, x, y }) => { p.dataset.px = x; p.setAttribute('transform', `translate(${x.toFixed(2)} ${y}) scale(${k.toFixed(4)})`); });
 // Hide province/state names that would collide with a pin or a bigger region's name.
 const boxes = pins.map(({ x, y }) => [x - 8 * k, y - 21 * k, x + 8 * k, y + 2 * k]);
 const fs = 8.5 * k;
 root.querySelectorAll('.map-admin.on .map-labels text').forEach(t => {
  // Rough label width: CJK characters are about twice as wide as Latin letters.
  const ems = [...t.textContent].reduce((n, c) => n + (c.charCodeAt(0) > 0x2e80 ? 1 : 0.6), 0);
  const x = +t.getAttribute('x'), y = +t.getAttribute('y'), hw = ems * fs * .5 + 2 * k, hh = fs * .6;
  const b = [x - hw, y - hh, x + hw, y + hh];
  const hit = boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  t.style.visibility = hit ? 'hidden' : '';
  if (!hit) boxes.push(b);
 });
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
 const x = ox + ((pin.dataset.px ?? pin.dataset.x) - vb.x) * scale, y = oy + (pin.dataset.y - vb.y) * scale;
 const when = [Array.isArray(item.home) ? t('home') : '', item.date || ''].filter(Boolean).join(' · ');
 tip.innerHTML = `<b>${h(item.title)}</b>${when ? `<span>${h(when)}</span>` : ''}`;
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
 if (root.querySelector('[data-admin]')) {
  adminPromise ||= fetch(((import.meta.env && import.meta.env.BASE_URL) || '/') + 'assets/world-admin1.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  adminPromise.then(d => {
   if (!root.isConnected) return;
   root.querySelectorAll('[data-admin]').forEach(g => {
    const a = d[REGIONS[g.dataset.admin].iso]; if (!a) return;
    g.querySelector('path').setAttribute('d', a.d);
    g.querySelector('.map-labels').innerHTML = a.labels.map(([n, x, y]) => `<text x="${x}" y="${y}">${h(adminName(n))}</text>`).join('');
   });
   sizePins(root);
  }).catch(() => { adminPromise = null; });
 }
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
 root.querySelectorAll('[data-admin]').forEach(g => g.classList.toggle('on', g.dataset.admin === region));
 const vb = viewFor(module, region);
 root.style.aspectRatio = `${vb[2].toFixed(2)}/${vb[3].toFixed(2)}`;
 host.querySelectorAll('.map-stops [data-place]').forEach(b => { b.hidden = !inRegion(module.items[b.dataset.place], region); });
 animateTo(root, vb);
 if (!inRegion(module.items[s.item], region)) {
  const first = module.items.findIndex(i => inRegion(i, region));
  if (first >= 0) { s.item = first; host.querySelectorAll('[data-place]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.place) === first))); host.querySelector('.place-slot').innerHTML = card(module.items[first], active.h, active.picture); }
 }
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
