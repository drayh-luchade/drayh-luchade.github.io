/* ============================================================
   VIDEOS — links to your YouTube uploads. They play right on
   this page (a thumbnail shows first; clicking it loads the
   actual YouTube player, so nothing loads from YouTube until
   a visitor actually wants to watch).

   Required fields:
     id         — short unique slug, no spaces (don't change once published)
     title      — shown above the video
     date       — "YYYY-MM-DD"
     time       — "H:MM AM/PM", e.g. "1:00 PM"
     youtubeId  — the part of the URL after "v=" (or after youtu.be/)
                  e.g. youtube.com/watch?v=dQw4w9WgXcQ -> "dQw4w9WgXcQ"

   Optional:
     description — a line or two shown under the video
     tags        — array of lowercase words, no "#", e.g. ["editing", "tutorial"].
                   Powers the tag bar at the top of the page.
   ============================================================ */
window.VIDEOS = [
  {
    id: "editing-workflow",
    title: "How I edit my travel photos",
    date: "2026-06-20",
    time: "2:00 PM",
    youtubeId: "dQw4w9WgXcQ",
    description: "A quick walkthrough of my Lightroom process for the shots from the last trip.",
    tags: ["editing", "tutorial"]
  }
];
