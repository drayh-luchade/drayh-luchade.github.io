/* ============================================================
   You shouldn't need to edit this file — it just reads the
   arrays from data/articles.js, data/photos.js, data/videos.js
   and renders them. Add new content in those files instead.
   ============================================================ */

/* ---- click-tracking config ----
   Uses a free, no-signup counter API (countapi.mileshilliard.com)
   to track clicks per entry so you can sort by "most popular".
   This is a third-party free service: fine for a personal site,
   but don't rely on it for anything mission-critical — it could
   change or go offline, and counts are easy to inflate since
   there's no real bot/abuse protection. Change SITE_KEY to
   something unique to you (e.g. your domain) to avoid clashing
   with other people's counters. */
const COUNTER_BASE = "https://countapi.mileshilliard.com/api/v1";
const SITE_KEY = "alexrivera-personal-site"; // change this to something unique to you

function counterKey(entryId){
  return `${SITE_KEY}_${entryId}`;
}

async function getCount(entryId){
  try{
    const res = await fetch(`${COUNTER_BASE}/get/${counterKey(entryId)}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.value) || 0;
  }catch{
    return 0; // counter service unreachable — treat as 0 rather than breaking the page
  }
}

async function registerClick(entryId){
  const sessionFlag = `clicked_${entryId}`;
  if (sessionStorage.getItem(sessionFlag)) return; // one count per visitor per session
  sessionStorage.setItem(sessionFlag, "1");
  try{
    await fetch(`${COUNTER_BASE}/hit/${counterKey(entryId)}`);
  }catch{
    /* ignore — tracking is best-effort, never blocks the page */
  }
}

/* ---- combine the three data sources into one list ---- */
function buildEntries(){
  const articles = (window.ARTICLES || []).map(e => ({ ...e, kind: "article" }));
  const photos   = (window.PHOTOS   || []).map(e => ({ ...e, kind: "photo" }));
  const videos   = (window.VIDEOS   || []).map(e => ({ ...e, kind: "video" }));
  return [...articles, ...photos, ...videos];
}

/* ---- parse "1:00 PM" + "2026-07-13" into a sortable timestamp ---- */
function parseTimestamp(date, time){
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  let hours = 0, minutes = 0;
  if (match){
    hours = parseInt(match[1], 10) % 12;
    minutes = parseInt(match[2], 10);
    if (/pm/i.test(match[3])) hours += 12;
  }
  const d = new Date(date + "T00:00:00");
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

function formatDateTime(date, time){
  const d = new Date(date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return `${dateStr} · ${time}`;
}

function playIcon(){
  return '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
}

/* cut a string to ~maxLen chars at a word boundary */
function truncateText(str, maxLen){
  if (str.length <= maxLen) return { text: str, truncated: false };
  const cut = str.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return { text: cut.slice(0, lastSpace > 0 ? lastSpace : maxLen) + "…", truncated: true };
}

function renderPhotoGrid(images, title, caption){
  const gridClass = images.length === 1 ? "photo-grid single" : "photo-grid";
  return `
    <div class="${gridClass}">
      ${images.map(src => `<img src="${src}" alt="${title}" loading="lazy">`).join("")}
    </div>
    ${caption ? `<p class="caption">${caption}</p>` : ""}
  `;
}

function renderArticleBody(e){
  const photos = e.images && e.images.length ? renderPhotoGrid(e.images, e.title, e.caption) : "";
  const fullText = `<div class="text">${e.text.map(p => `<p>${p}</p>`).join("")}</div>${photos}`;

  const { text: excerptText, truncated } = truncateText(e.text[0] || "", 160);
  const hasMore = truncated || e.text.length > 1 || (e.images && e.images.length > 0);

  // short articles with nothing extra to hide: just show the text, no toggle
  if (!hasMore) return fullText;

  return `
    <div class="excerpt">
      <p>${excerptText}</p>
      <span class="toggle-hint">Read more ↓</span>
    </div>
    <div class="full">
      ${fullText}
      <span class="toggle-hint">Read less ↑</span>
    </div>
  `;
}

function renderEntryBody(e){
  if (e.kind === "article"){
    return renderArticleBody(e);
  }
  if (e.kind === "photo"){
    return renderPhotoGrid(e.images, e.title, e.caption);
  }
  if (e.kind === "video"){
    return `
      <div class="video-frame" data-yt="${e.youtubeId}">
        <img src="https://img.youtube.com/vi/${e.youtubeId}/hqdefault.jpg" alt="${e.title} thumbnail" loading="lazy">
        <div class="play-button">${playIcon()}</div>
      </div>
      ${e.description ? `<div class="text description"><p>${e.description}</p></div>` : ""}
    `;
  }
  return "";
}

/* ---- state ---- */
let activeType = null;      // null | "article" | "photo" | "video"
let sortMode = "newest";    // "newest" | "oldest" | "popular"
let allEntries = buildEntries();

async function getSortedEntries(){
  let list = [...allEntries];

  if (sortMode === "popular"){
    const counts = await Promise.all(list.map(e => getCount(e.id)));
    list = list.map((e, i) => ({ ...e, _count: counts[i] }));
    list.sort((a, b) => b._count - a._count);
  } else {
    list.sort((a, b) => {
      const ta = parseTimestamp(a.date, a.time);
      const tb = parseTimestamp(b.date, b.time);
      return sortMode === "oldest" ? ta - tb : tb - ta;
    });
  }

  if (activeType){
    list = list.filter(e => e.kind === activeType);
  }
  return list;
}

async function render(){
  const feed = document.getElementById("feed");
  feed.innerHTML = `<p class="empty">loading…</p>`;

  const entries = await getSortedEntries();

  if (entries.length === 0){
    feed.innerHTML = `<p class="empty">// nothing here yet</p>`;
    return;
  }

  feed.innerHTML = entries.map(e => `
    <article class="entry" data-id="${e.id}" data-kind="${e.kind}">
      <div class="entry-head">
        <span class="kind">${e.kind}</span>
        <span class="date">${formatDateTime(e.date, e.time)}</span>
        ${sortMode === "popular" ? `<span class="views">${e._count} view${e._count === 1 ? "" : "s"}</span>` : ""}
      </div>
      <h2>${e.title}</h2>
      ${renderEntryBody(e)}
    </article>
  `).join("");

  // click tracking + expand/collapse for articles with a hidden ".full" section
  feed.querySelectorAll(".entry").forEach(card => {
    card.addEventListener("click", (evt) => {
      if (evt.target.closest("a")) return; // don't hijack clicks on real links
      registerClick(card.dataset.id); // no-ops after the first click this session
      if (card.dataset.kind === "article" && card.querySelector(".full")){
        card.classList.toggle("expanded");
      }
    });
  });

  // video facades: load the real player only once clicked
  feed.querySelectorAll(".video-frame").forEach(frame => {
    frame.addEventListener("click", (evt) => {
      evt.stopPropagation(); // don't trigger the card's expand/collapse toggle
      registerClick(frame.closest(".entry").dataset.id);
      const id = frame.dataset.yt;
      frame.innerHTML = `<iframe
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
    }, { once: true });
  });
}

function renderControls(){
  const filterBar = document.getElementById("filters");
  const sortBar = document.getElementById("sort");

  const types = [
    { key: null, label: "all" },
    { key: "article", label: "articles" },
    { key: "photo", label: "photos" },
    { key: "video", label: "videos" }
  ];
  const sorts = [
    { key: "newest", label: "newest" },
    { key: "oldest", label: "oldest" },
    { key: "popular", label: "most popular" }
  ];

  function drawFilters(){
    filterBar.innerHTML = types.map(t =>
      `<button data-type="${t.key ?? ""}" class="${activeType === t.key ? 'active' : ''}">${t.label}</button>`
    ).join("");
    filterBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeType = btn.dataset.type || null;
        drawFilters();
        render();
      });
    });
  }

  function drawSort(){
    sortBar.innerHTML = sorts.map(s =>
      `<button data-sort="${s.key}" class="${sortMode === s.key ? 'active' : ''}">${s.label}</button>`
    ).join("");
    sortBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        sortMode = btn.dataset.sort;
        drawSort();
        render();
      });
    });
  }

  drawFilters();
  drawSort();
}

/* ---- scrolling banner ---- */
async function renderBanner(){
  const banner = document.getElementById("banner");
  const track = document.getElementById("bannerTrack");
  const images = window.BANNER_IMAGES || [];

  if (images.length === 0) return; // stays hidden — nothing to show

  const bannerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--banner-height")) || 56;

  // Preload every image directly (not via lazy-loaded <img> tags) so we
  // know each one's real width up front — this is what avoids the
  // "plays for a bit then freezes" bug: that happened because lazily
  // loaded, mostly off-screen duplicate images never finished loading,
  // so the real animation duration never got set.
  const loaded = await Promise.all(images.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ src, width: img.naturalWidth * (bannerHeight / img.naturalHeight) });
    img.onerror = () => resolve({ src, width: bannerHeight * 1.5 }); // fallback guess if an image fails to load
    img.src = src;
  })));

  const baseSetWidth = loaded.reduce((sum, i) => sum + i.width, 0);

  // repeat the list enough times that one full pass fills at least
  // two screen-widths (capped so we don't ever build an absurd number
  // of <img> tags for a very narrow single image on a very wide screen)
  const repeats = Math.min(24, Math.max(1, Math.ceil((window.innerWidth * 2) / baseSetWidth)));

  const cycle = [];
  for (let i = 0; i < repeats; i++) cycle.push(...loaded);

  // duplicate the full cycle once more so the loop has no visible seam
  const doubled = [...cycle, ...cycle];
  track.innerHTML = doubled.map(i => `<img src="${i.src}" alt="">`).join("");

  banner.style.display = "block";

  const speed = Number(getComputedStyle(document.documentElement).getPropertyValue("--banner-speed")) || 40;
  const oneSetWidth = baseSetWidth * repeats;
  track.style.animationDuration = `${oneSetWidth / speed}s`;
}

renderControls();
render();
renderBanner();
