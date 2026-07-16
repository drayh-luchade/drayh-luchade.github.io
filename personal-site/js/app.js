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

function renderPhotoGrid(images, title, caption){
  const gridClass = images.length === 1 ? "photo-grid single" : "photo-grid";
  return `
    <div class="${gridClass}">
      ${images.map(src => `<img src="${src}" alt="${title}" loading="lazy">`).join("")}
    </div>
    ${caption ? `<p class="caption">${caption}</p>` : ""}
  `;
}

function renderEntryBody(e){
  if (e.kind === "article"){
    const photos = e.images && e.images.length ? renderPhotoGrid(e.images, e.title, e.caption) : "";
    return `<div class="text">${e.text.map(p => `<p>${p}</p>`).join("")}</div>${photos}`;
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
    <article class="entry" data-id="${e.id}">
      <div class="entry-head">
        <span class="kind">${e.kind}</span>
        <span class="date">${formatDateTime(e.date, e.time)}</span>
        ${sortMode === "popular" ? `<span class="views">${e._count} view${e._count === 1 ? "" : "s"}</span>` : ""}
      </div>
      <h2>${e.title}</h2>
      ${renderEntryBody(e)}
    </article>
  `).join("");

  // click tracking: count a click anywhere on the entry card
  feed.querySelectorAll(".entry").forEach(card => {
    card.addEventListener("click", () => registerClick(card.dataset.id), { once: true });
  });

  // video facades: load the real player only once clicked
  feed.querySelectorAll(".video-frame").forEach(frame => {
    frame.addEventListener("click", (evt) => {
      evt.stopPropagation(); // don't double-trigger the card's own click handler oddly
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

renderControls();
render();
