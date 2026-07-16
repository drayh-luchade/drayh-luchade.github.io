# File structure

```
index.html        page shell — edit your name/bio/social links here
css/style.css      all styling (colors, fonts, spacing)
data/articles.js   your articles — edit this to add a new article
data/photos.js     your photo posts — edit this to add photos
data/videos.js     your video links — edit this to add a video
js/app.js          combines + sorts + renders everything (shouldn't need editing)
images/            put your photo files here
```

You'll only ever open **one file at a time** depending on what you're doing:
adding an article → `data/articles.js`. Adding photos → `data/photos.js`.
Linking a video → `data/videos.js`. Changing colors/fonts → `css/style.css`.
Changing your name or bio → `index.html`.

# Deploying to GitHub Pages

1. Create a new public GitHub repo (`yourusername.github.io` for the root of your account, or any other name for a subpath).
2. Push this whole folder — keep the file structure exactly as-is, since `index.html` refers to the other files by their relative paths.
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main`, `/ (root)` → Save.
4. Live in about a minute.

# Adding content

Each data file has a comment at the top explaining its fields, but the short version:

**Date and time control ordering.** Every entry needs a `date` ("YYYY-MM-DD") and a `time` ("H:MM AM/PM", e.g. `"1:00 PM"`). The page sorts by these automatically — newest-first by default, with buttons to switch to oldest-first or most-popular.

**Articles** (`data/articles.js`) can optionally include photos inline — just add an `images` array and optional `caption` to the article object.

**Photos** (`data/photos.js`) are a standalone post: title, date/time, one or more images, optional caption.

**Videos** (`data/videos.js`) embed your YouTube upload right on the page. Get the ID from the video's URL — the part after `v=` (or after `youtu.be/`). A thumbnail shows first; clicking it loads the real YouTube player, so nothing loads from YouTube until someone actually wants to watch.

Every entry needs a unique `id` (a short slug like `"dolomites-hike"`). **Don't change an entry's `id` after publishing** — that's what the popularity counter uses to track it, and changing it resets its count to zero.

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
- The sample entries in all three data files — replace or delete them
