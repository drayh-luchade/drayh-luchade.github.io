# File structure

```
index.html         page shell — edit your name/bio/social links here
css/style.css       all styling (colors, fonts, spacing)
data/banner.js      image paths for the scrolling top banner
data/articles.js    your articles — edit this to add a new article
data/photos.js      your photo posts — edit this to add photos
data/videos.js      your video links — edit this to add a video
js/app.js           combines + sorts + filters + renders everything (shouldn't need editing)
images/             put your photo and banner image files here
```

You'll only ever open **one file at a time** depending on what you're doing:
adding an article → `data/articles.js`. Adding photos → `data/photos.js`.
Linking a video → `data/videos.js`. Changing colors/fonts → `css/style.css`.
Changing your name or bio → `index.html`.

# Deploying to GitHub Pages

1. Create a new public GitHub repo (`yourusername.github.io` for the root of your account, or any other name for a subpath).
2. Push this whole folder — keep the file structure exactly as-is, since `index.html` refers to the other files by their relative paths.
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main`, `/ (root)` → Save.
4. Live in about a minute. Check the repo's **Actions** tab for a green "pages build and deployment" run to confirm it published.

# Adding an entry

Every entry — article, photo, or video — needs these fields:

| field  | what it is |
|---|---|
| `id`   | short unique slug, no spaces, e.g. `"dolomites-hike"`. **Don't change it after publishing** — the view counter and popularity sort are keyed on it, and changing it resets that entry's count to zero. |
| `title` | headline, shown on the page |
| `date` | `"YYYY-MM-DD"` |
| `time` | `"H:MM AM/PM"`, e.g. `"1:00 PM"` — date + time together control where the entry lands when sorted newest/oldest |
| `tags` | *(optional)* array of lowercase words, no `#`, e.g. `["vacation", "hiking"]` — see the tags section below |

Then, depending on type:

**Article** (`data/articles.js`)
```js
{
  id: "unique-slug",
  title: "Title here",
  date: "2026-07-16",
  time: "1:00 PM",
  text: ["First paragraph.", "Second paragraph."],
  images: ["images/optional-photo.jpg"], // optional, can omit entirely
  caption: "Optional caption for the images above", // optional
  tags: ["vacation", "hiking"] // optional
}
```
Long articles automatically show a short excerpt with a "Read more" link — click the entry to expand it, click again to collapse. Articles with nothing extra to hide (short, no photos) just show in full with no toggle.

**Photo** (`data/photos.js`)
```js
{
  id: "unique-slug",
  title: "Title here",
  date: "2026-07-16",
  time: "1:00 PM",
  images: ["images/photo1.jpg", "images/photo2.jpg"], // one or more
  caption: "Optional caption", // optional
  tags: ["vacation", "sunrise"] // optional
}
```
One image shows full-width; two or more show as a grid. Put the actual image files in the `images/` folder.

**Video** (`data/videos.js`)
```js
{
  id: "unique-slug",
  title: "Title here",
  date: "2026-07-16",
  time: "1:00 PM",
  youtubeId: "dQw4w9WgXcQ", // the part of the URL after "v=" or after youtu.be/
  description: "Optional line about the video", // optional
  tags: ["editing", "tutorial"] // optional
}
```
A thumbnail shows first; clicking it loads the real YouTube player right on the page, so nothing loads from YouTube until someone actually wants to watch.

**Order doesn't matter in the file** — add the new entry anywhere in the array (top, bottom, wherever's convenient); the page always sorts by `date` + `time` for you.

# Tags

Add a `tags` array to any entry to make it filterable. Tag names should be lowercase words with no `#` in the data file — the `#` is added automatically when displayed.

A tag bar appears near the top of the page automatically (it stays hidden if nothing has tags yet). Visitors can:
- Click a tag chip to filter to entries that have it
- Click multiple chips to narrow further — this uses **AND** logic, so selecting `vacation` + `sports` shows only entries tagged with *both*, correctly separate from something tagged `sports` + `transit`
- Type in the search box to filter the list of available tag chips (handy once you have many tags)
- See a live count next to the bar ("4 entries", or "no entries" if the combination matches nothing)
- Click "clear" to reset the selection

Clicking a tag chip shown directly on a post does the same thing as selecting it in the top bar — a shortcut for "show me more like this."

Tag filtering combines with the type filter (all/articles/photos/videos) and the sort buttons (newest/oldest/most popular) — all three apply together.

# The scrolling banner

A thin strip at the very top of the page that scrolls a row of images continuously, right to left, on an endless loop.

It's off by default — `data/banner.js` starts with an empty (commented-out) list, so the strip doesn't render at all until you add images. To turn it on:
```js
window.BANNER_IMAGES = [
  "images/banner-1.jpg",
  "images/banner-2.jpg",
  "images/banner-3.jpg"
];
```
Any number of images works, including just one — the strip automatically repeats them enough to fill the screen and loops seamlessly, with the scroll speed staying constant no matter how many you add.

To adjust how it looks, open `css/style.css` and change these variables near the top:
- `--banner-height` — how tall the strip is (default `56px`; keep it small so it stays a subtle accent, not a hero image)
- `--banner-speed` — how many pixels per second it scrolls (default `40`; lower = slower/calmer, higher = faster)

It also automatically stops scrolling for visitors who have "reduce motion" turned on in their operating system's accessibility settings.

# How the "most popular" sort works

There's no real backend here — GitHub Pages only serves static files. To get a click count without one, the page uses a free third-party counter service (**countapi.mileshilliard.com**, no signup required). When someone clicks into an entry, it pings that service to add 1; when you load the page with "most popular" selected, it asks the service for each entry's current count and sorts by that.

Worth knowing:
- **It's a free, unauthenticated service.** Fine for a personal site, but there's no real abuse protection — someone could inflate a count by hitting the API directly, and the service itself could change or go offline someday without warning. Treat the numbers as a rough, fun signal rather than precise analytics.
- **One click counts once per visitor per browser session** (the page uses `sessionStorage` to prevent someone inflating a count just by clicking repeatedly).
- Open `js/app.js` and change the line `const SITE_KEY = "alexrivera-personal-site";` to something unique to you, so your counts don't collide with anyone else's on the same shared service.
- If you outgrow this later, the natural upgrade is **counterapi.dev**, which is a similar idea but with a free account and its own workspace — more robust, slightly more setup.

# Photo file sizes

Compress photos before adding them (aim for under ~500KB each). Free tools: squoosh.app, or exporting at "web quality" from your photo app. Keeps the repo small and the page fast.

# Before you push (things to personalize)

- `index.html`: name, bio, email/youtube/instagram links, page `<title>`
- `js/app.js`: the `SITE_KEY` constant (see above)
- The sample entries in all four data files — replace or delete them
