/* ============================================================
   PHOTOS — a standalone photo post (no article text, just images
   and an optional caption).

   Required fields:
     id      — short unique slug, no spaces (don't change once published)
     title   — shown above the photo(s)
     date    — "YYYY-MM-DD"
     time    — "H:MM AM/PM", e.g. "1:00 PM"
     images  — array of relative paths, e.g. ["images/photo1.jpg"]
               (put the files in the /images folder next to index.html)

   Optional:
     caption — a single line shown under the photo(s)
     tags    — array of lowercase words, no "#", e.g. ["vacation", "sunrise"].
               Powers the tag bar at the top of the page.
   ============================================================ */
window.PHOTOS = [
  {
    id: "seceda-sunrise",
    title: "Sunrise, Seceda ridge",
    date: "2026-06-15",
    time: "5:40 AM",
    images: ["images/seceda-1.jpg", "images/seceda-2.jpg"],
    caption: "-2°C, worth it.",
    tags: ["vacation", "sunrise"]
  }
];
