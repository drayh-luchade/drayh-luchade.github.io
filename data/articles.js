/* ============================================================
   ARTICLES — add a new object anywhere in this array; it will
   be placed on the page automatically based on date + time.

   Required fields:
     id      — short unique slug, no spaces (used for click tracking,
               so once you publish an entry, don't change its id)
     title   — headline
     date    — "YYYY-MM-DD"
     time    — "H:MM AM/PM", e.g. "1:00 PM"
     text    — array of paragraphs (each string = one paragraph)

   Optional:
     images  — array of relative paths to show inline with the
               article, e.g. ["images/photo1.jpg"]. Put the actual
               image files in the /images folder.
     caption — a single caption line shown under the images
     tags    — array of lowercase words, no "#", e.g. ["vacation", "hiking"].
               Powers the tag bar at the top of the page — visitors can
               select multiple tags to narrow down to entries that have
               ALL of them (e.g. "vacation" + "hiking" together).
   ============================================================ */
window.ARTICLES = [
  {
    id: "dolomites-hike",
    title: "Three days in the Dolomites",
    date: "2026-06-28",
    time: "9:15 AM",
    text: [
      "Spent three days hiking the Alta Via 1 with no real plan beyond the first hut booking. The weather turned twice, which ended up being the best part — you notice a lot more when you're waiting out rain under an overhang.",
      "Writing up the full route notes soon, but the short version: bring more socks than you think you need."
    ],
    images: ["images/dolomites-1.jpg"],
    caption: "Somewhere above Rifugio Lagazuoi, day two.",
    tags: ["vacation", "hiking"]
  },
  {
    id: "todo-app",
    title: "Why I stopped using a to-do app",
    date: "2026-05-02",
    time: "6:40 PM",
    text: [
      "Switched to a single paper notebook a few months ago and haven't looked back. Not making a grand claim about analog vs digital — it just turned out that friction was the feature I needed."
    ],
    tags: ["productivity"]
  }
];
