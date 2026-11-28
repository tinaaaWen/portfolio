// Language: English by default; Chinese when chosen. The choice is remembered per visitor,
// and ?lang=zh / ?lang=en in the link opens that version directly.
const KEY = "portfolio-lang";
function pickLang() {
  if (typeof location === "undefined") return "en";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "zh" || q === "en") {
      try { localStorage.setItem(KEY, q); } catch {}
      return q;
    }
  } catch {}
  try { return localStorage.getItem(KEY) === "zh" ? "zh" : "en"; } catch { return "en"; }
}
export const lang = pickLang();

export function setLang(next) {
  try { localStorage.setItem(KEY, next); } catch {}
  const url = new URL(location.href);
  if (next === "zh") url.searchParams.set("lang", "zh");
  else url.searchParams.delete("lang");
  location.replace(url.toString());
}

const STR = {
  en: {
    worldOfYourOwn: "A WORLD OF YOUR OWN",
    welcomeTo: "Welcome to",
    welcomeTitle: "{title}",
    welcomeEnd: ".",
    defaultIntro: "Hi, I'm {name}. Welcome to my portfolio.",
    worldLabel: "{title}: 3D island",
    walkTo: "Walk to {name}",
    goTo: "Go to {name}",
    mapSite: "Map: {name}",
    statusExplore: "Click to walk · Drag to look around · Find the glowing spots",
    fieldNotes: "FIELD NOTES / {n}",
    arrived: "Arrived · {name}",
    walkingTo: "Walking to · {name}",
    overviewStatus: "Island overview · {n} places to explore",
    soundOn: "Turn on ambient sound",
    soundOff: "Turn off ambient sound",
    soundUnavailable: "Ambient sound isn't available in this browser.",
    cantWalk: "You can't walk there. Try the open ground nearby.",
    sea: "That's the sea. Stay on the island.",
    findMeOnline: "FIND ME ONLINE",
    switchLang: "切换到中文",
    // exhibits
    openLink: "Open link",
    chooseEntry: "Choose an entry",
    chooseChapter: "Choose a chapter",
    enlarge: "Enlarge: {alt}",
    viewFull: "View full size ↗",
    inProgress: "IN PROGRESS",
    comingSoon: "Coming soon",
    comingSoonText: "This part of the island is still being built. Check back soon.",
    nothingYet: "Nothing to show yet",
    viewWork: "View work",
    viewDetails: "View details",
    viewTimeline: "View timeline",
    chapter: "CHAPTER {i} / {n}",
    nextChapter: "Next chapter →",
    readAll: "✓ You've read the whole story",
    viewSource: "View source",
    reflection: "Reflection",
    keepInTouch: "Keep in touch with {name}",
    // travel map
    world: "World",
    China: "China",
    "United States": "United States",
    stops: "{n} stops",
    home: "Home",
    homeAria: "home",
    chooseView: "Choose a map view",
    mapAria: "Map of places I've visited. Use the list below the map to choose a place.",
    mapUnavailable: "Map outline unavailable right now. The pins still work.",
    visited: "Places I've visited",
    calledHome: "Places I've called home",
    choosePlace: "Choose a place",
    // themes
    themeForest: "Forest",
    themeDesert: "Desert",
    themeOcean: "Ocean",
    capForest: "Curiosity, shaped into an island.",
    capDesert: "New possibilities in every grain of sand.",
    capOcean: "Dive in and listen for ideas.",
    engForest: "FOREST ISLAND",
    engDesert: "DESERT OASIS",
    engOcean: "OCEAN GARDEN",
  },
  zh: {
    worldOfYourOwn: "一方属于自己的小天地",
    welcomeTo: "恭喜你！",
    welcomeTitle: "发现了{title}",
    welcomeEnd: "！",
    defaultIntro: "你好，我是{name}，欢迎来看我的作品集。",
    worldLabel: "{title}：三维小岛",
    walkTo: "走到「{name}」",
    goTo: "前往「{name}」",
    mapSite: "地图：{name}",
    statusExplore: "随心漫步 · 拖动环顾四周 · 循着微光寻找故事",
    fieldNotes: "探索手记 / {n}",
    arrived: "已到达 · {name}",
    walkingTo: "正在前往 · {name}",
    overviewStatus: "俯瞰小岛 · {n} 个故事等你点亮",
    soundOn: "打开环境音",
    soundOff: "关闭环境音",
    soundUnavailable: "这个浏览器暂时无法播放环境音。",
    cantWalk: "那里走不过去，试试旁边的空地吧。",
    sea: "前面是大海啦，留在岛上吧。",
    findMeOnline: "在更广阔的世界与我相遇",
    switchLang: "Switch to English",
    openLink: "打开链接",
    chooseEntry: "选择一项",
    chooseChapter: "选择章节",
    enlarge: "放大查看：{alt}",
    viewFull: "查看大图 ↗",
    inProgress: "建设中",
    comingSoon: "敬请期待",
    comingSoonText: "小岛的这一部分还在建设中，过段时间再来看看吧。",
    nothingYet: "暂时还没有内容",
    viewWork: "查看作品",
    viewDetails: "查看详情",
    viewTimeline: "查看时间线",
    chapter: "第 {i} 章 / 共 {n} 章",
    nextChapter: "下一章 →",
    readAll: "✓ 整个故事你都看完啦",
    viewSource: "查看原文",
    reflection: "我的思考",
    keepInTouch: "和{name}保持联系",
    world: "世界",
    China: "中国",
    "United States": "美国",
    stops: "{n} 个地方",
    home: "家",
    homeAria: "家",
    chooseView: "选择地图视图",
    mapAria: "我去过的地方的地图。可以用地图下方的列表选择地点。",
    mapUnavailable: "地图轮廓暂时加载不出来，但定位标记还能用。",
    visited: "去过的地方",
    calledHome: "住过的家",
    choosePlace: "选择地点",
    themeForest: "林间",
    themeDesert: "沙海",
    themeOcean: "蔚蓝",
    capForest: "我把对世界的好奇，筑成了一座岛。",
    capDesert: "每一粒沙里，都藏着新的可能。",
    capOcean: "潜入蔚蓝，聆听灵感的回响。",
    engForest: "森林之岛",
    engDesert: "沙海之岛",
    engOcean: "蔚蓝之岛",
  },
};

export function t(key, vars = {}) {
  const s = STR[lang][key] ?? STR.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
}

// Static page text marked with data-i18n (text) and data-i18n-aria (aria-label) in index.html.
const HTML_ZH = {
  "Welcome to": "恭喜你！",
  "A WORLD OF YOUR OWN": "一方属于自己的小天地",
  "Drag to look around": "环顾四周",
  "See the island in 360°": "拖动屏幕，360° 欣赏岛上的风景",
  "Click to walk": "自由漫步",
  "Walk to a glowing spot to open a story": "循着微光前行，每一处都藏着一个故事",
  "Start exploring": "开启探索之旅",
  "You can also walk with WASD or the arrow keys": "也可以使用 WASD 或方向键，在岛上自由漫步。",
  "Back to the island": "回到小岛",
  "Island overview": "俯瞰小岛",
  "You are here": "你此刻在这里",
  "explored": "已点亮",
  "Click the ground to explore": "随心漫步，自由探索",
  "A FIELD GUIDE": "小岛漫游指南",
  "How to explore": "如何探索这座小岛？",
  "There is no set route, so go anywhere.": "这里没有既定的路线，也没有标准的答案。",
  "Every glowing spot holds a story.": "随心所往，每一处微光都藏着一个等待被发现的故事。",
  "Look around": "环顾四周",
  "Drag with your mouse or one finger to turn 360°.": "拖动鼠标或用指尖滑动屏幕，360° 欣赏小岛的风景。",
  "Zoom": "拉近与远望",
  "Scroll or pinch to zoom in and out.": "滚动鼠标滚轮，或用双指缩放，自由调整你的观察视角。",
  "Walk": "岛上漫步",
  "Click the ground, or use WASD or the arrow keys. On a phone, hold the arrow pad at the bottom left.": "点击地面，或使用 WASD 与方向键自由行走。使用手机时，长按左下角的方向键即可移动。",
  "Open a section": "邂逅故事",
  "Step onto a glowing circle to open a section. Clicking a section name or map marker walks you there.": "走进任意发光的光圈，即可解锁一段故事。你也可以点击栏目名称或地图上的标记，直接前往心仪的地点。",
  "Change the scenery": "变换风景",
  "Switch between Forest, Desert and Ocean. Your place and content stay the same.": "在葱郁的森林、辽阔的沙海与蔚蓝的海洋之间自由切换。风景会变，但你所在的位置与等待发现的故事始终如一。",
  "Lakes and the shoreline keep you on the island.": "湖泊与海岸线是小岛温柔的边界。",
  "Press Esc to close any panel.": "按下 Esc 键，即可关闭当前窗口，继续你的旅程。",
  "Got it, let's go ↗": "出发吧，去发现更多 ↗",
  "This island needs WebGL": "这座小岛需要 WebGL",
  "You can still read everything from the sections below. Open the page in a browser with WebGL to walk around.": "你仍然可以在下面的各个部分里读到全部内容。用支持 WebGL 的浏览器打开，就能在岛上走动了。",
  "Forest": "林间",
  "Desert": "沙海",
  "Ocean": "蔚蓝",
  // aria labels
  "Island theme": "小岛主题",
  "Find me online": "在网上找到我",
  "Places on the island": "岛上的地方",
  "Section details": "部分详情",
  "Close details": "关闭详情",
  "Full-size image": "大图",
  "Close image": "关闭图片",
  "Island map": "小岛地图",
  "Go to a section": "前往某个部分",
  "Close guide": "关闭指南",
  "Walk forward": "向前走",
  "Walk left": "向左走",
  "Walk right": "向右走",
  "Walk back": "向后走",
  "Switch language": "切换语言",
  "FIND ME ONLINE": "在更广阔的世界与我相遇",
  "Language": "语言",
  "Show welcome": "回到欢迎页",
  "Movement controls": "移动控制",
  "Sailing to the island…": "正扬帆驶向小岛……",
  "A LITTLE WORLD, A LOT TO DISCOVER.": "小小天地，无尽好奇。",
};
export function translatePage(root = document) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.body.classList.toggle("lang-zh", lang === "zh");
  if (lang !== "zh") return;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = (el.dataset.i18n || el.textContent).replace(/\s+/g, " ").trim();
    if (HTML_ZH[key]) el.textContent = HTML_ZH[key];
  });
  root.querySelectorAll("[aria-label]").forEach((el) => {
    const v = el.getAttribute("aria-label");
    if (HTML_ZH[v]) el.setAttribute("aria-label", HTML_ZH[v]);
  });
}

// Deep-merge the Chinese content overlay onto the English portfolio (arrays merge by index).
// Structural fields (ids, coordinates, map regions, colors, file paths, links) always come from English.
const KEEP = new Set(["version", "id", "kind", "region", "lat", "lng", "home", "src", "url", "links"]);
export function overlay(base, extra) {
  if (extra === undefined || extra === null) return base;
  if (Array.isArray(base)) return base.map((v, i) => overlay(v, Array.isArray(extra) ? extra[i] : undefined));
  if (base && typeof base === "object") {
    const out = { ...base };
    for (const k of Object.keys(extra)) if (!KEEP.has(k)) out[k] = k in base ? overlay(base[k], extra[k]) : extra[k];
    return out;
  }
  return typeof extra === typeof base ? extra : base;
}
