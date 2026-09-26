# Free Stock Media APIs: Pexels, Pixabay, Unsplash

A standalone, copy-paste guide to searching and downloading free stock **photos**
and **video** from the three big free providers. No framework required — just an
API key and an HTTP client. Examples are in Python (`requests`) plus `curl`, but
the endpoints and field names are the same in any language.

All three are **free** with **no per-use cost**. Each needs one key.

---

## 0. At a glance

| Provider | Photos | Video | Illustrations / Vectors | Auth style | Free rate limit |
|----------|:------:|:-----:|:-----------------------:|------------|-----------------|
| **Pexels**  | ✅ | ✅ | ❌ | `Authorization: <KEY>` (bare) | ~200/hr, 20k/month |
| **Pixabay** | ✅ | ✅ | ✅ (images) | `?key=<KEY>` query param | 100 / 60s |
| **Unsplash**| ✅ | ❌ | ❌ | `Authorization: Client-ID <KEY>` | 50/hr demo, 5000/hr prod |

Rule of thumb:

- **Pexels** — best curation, biggest video library, up to 4K. Your default.
- **Pixabay** — huge library, category filters, and the only one here with
  **illustrations/vectors**. Images cap at 1280px and video at 1080p on the free tier.
- **Unsplash** — modern/lifestyle photography, **images only**, and the only one
  with real attribution + download-tracking obligations (see §5).

---

## 1. Get your keys

| Provider | Sign up | You get |
|----------|---------|---------|
| Pexels | <https://www.pexels.com/api/> | An API key, instantly. |
| Pixabay | <https://pixabay.com/api/docs/> | An API key, instantly. |
| Unsplash | <https://unsplash.com/oauth/applications> | Create an app → copy the **Access Key**. Starts as a "Demo" app (50 req/hr); apply for production to get 5000/hr. |

Store them in environment variables (never hard-code keys):

```bash
# .env
PEXELS_API_KEY=your_pexels_key
PIXABAY_API_KEY=your_pixabay_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

```python
import os
PEXELS_KEY   = os.environ["PEXELS_API_KEY"]
PIXABAY_KEY  = os.environ["PIXABAY_API_KEY"]
UNSPLASH_KEY = os.environ["UNSPLASH_ACCESS_KEY"]
```

---

## 2. Pexels

Photos and video. **Auth is a bare API key in the `Authorization` header — not
`Bearer`.**

### Endpoints

| Purpose | Method + URL |
|---------|--------------|
| Photo search | `GET https://api.pexels.com/v1/search` |
| Video search | `GET https://api.pexels.com/videos/search` |

### Common search params

| Param | Values | Notes |
|-------|--------|-------|
| `query` | string **(required)** | The search term. |
| `per_page` | 1–80 | Results per page. |
| `page` | int | Pagination. |
| `orientation` | `landscape` \| `portrait` \| `square` | |
| `size` | `large` \| `medium` \| `small` | Photos: min 24/12/4 MP. Video: ~4K / Full HD / HD. |
| `color` | hex **without `#`** (`FF6B35`) or name (`red`) | Photos only. Match a palette. |
| `locale` | e.g. `en-US`, `es-ES` | 28 locales for culture-specific results. |

### Photos — quickstart

```bash
curl -s -H "Authorization: $PEXELS_API_KEY" \
  "https://api.pexels.com/v1/search?query=city%20skyline%20at%20dusk&orientation=landscape&per_page=5"
```

```python
import requests

def pexels_photo(query, out_path, **params):
    r = requests.get(
        "https://api.pexels.com/v1/search",
        headers={"Authorization": PEXELS_KEY},
        params={"query": query, "per_page": 5, **params},
        timeout=30,
    )
    r.raise_for_status()
    photos = r.json().get("photos", [])
    if not photos:
        raise LookupError(f"No Pexels photos for {query!r}")
    photo = photos[0]
    # src sizes: original, large2x, large, medium, small, portrait, landscape, tiny
    url = photo["src"]["large2x"]
    img = requests.get(url, timeout=60); img.raise_for_status()
    open(out_path, "wb").write(img.content)
    return {
        "path": out_path,
        "photographer": photo["photographer"],
        "photographer_url": photo["photographer_url"],
        "source_url": photo["url"],
        "license": "Pexels License",
    }

pexels_photo("city skyline at dusk", "skyline.jpg", orientation="landscape", size="large")
```

**Response fields you care about (photos):**
`photos[]` → `id`, `src.{original,large2x,large,medium,...}`, `photographer`,
`photographer_url`, `url` (landing page), `width`, `height`, `alt`, `avg_color`.

### Video — quickstart

```python
def pexels_video(query, out_path, min_dur=None, max_dur=None, **params):
    r = requests.get(
        "https://api.pexels.com/videos/search",
        headers={"Authorization": PEXELS_KEY},
        params={"query": query, "per_page": 10, **params},
        timeout=30,
    )
    r.raise_for_status()
    videos = r.json().get("videos", [])
    # Pexels does NOT filter duration server-side — do it yourself:
    if min_dur or max_dur:
        videos = [v for v in videos
                  if (not min_dur or v["duration"] >= min_dur)
                  and (not max_dur or v["duration"] <= max_dur)]
    if not videos:
        raise LookupError(f"No Pexels videos for {query!r}")
    v = videos[0]
    # Pick the largest mp4 rendition (quality="hd"/"sd"; file has link,width,height,fps)
    files = [f for f in v["video_files"] if f.get("file_type", "").startswith("video/")]
    best = max(files, key=lambda f: f.get("width", 0))
    clip = requests.get(best["link"], timeout=120); clip.raise_for_status()
    open(out_path, "wb").write(clip.content)
    return {"path": out_path, "duration": v["duration"],
            "creator": v["user"]["name"], "source_url": v["url"]}

pexels_video("rain on a window", "rain.mp4", min_dur=4, max_dur=12, size="large")
```

**Response fields (video):**
`videos[]` → `id`, `duration`, `url`, `image` (poster), `user.name`,
`video_files[].{link, quality, width, height, fps, file_type}`.

---

## 3. Pixabay

Photos, illustrations, vectors, and video. **Auth is the `key` query param.**
Largest library and best category filtering.

### Endpoints

| Purpose | Method + URL |
|---------|--------------|
| Image search | `GET https://pixabay.com/api/` |
| Video search | `GET https://pixabay.com/api/videos/` |

### Common params

| Param | Values | Notes |
|-------|--------|-------|
| `key` | your key **(required)** | |
| `q` | string **(required)** | URL-encoded, **max 100 chars**. |
| `per_page` | 3–200 | |
| `page` | int | |
| `category` | one of 20¹ | |
| `editors_choice` | `true` / `false` | Curated high-quality. |
| `safesearch` | `true` / `false` | Use `true` in production. |
| `min_duration` / `max_duration` | int seconds | **Video only** (server-side here). |
| `image_type` | `all` \| `photo` \| `illustration` \| `vector` | **Image only**. |
| `video_type` | `all` \| `film` \| `animation` | **Video only**. |
| `orientation` | `all` \| `horizontal` \| `vertical` | Image only. |
| `colors` | comma list² | Image only. |

¹ Categories: `backgrounds, fashion, nature, science, education, feelings,
health, people, religion, places, animals, industry, computer, food, sports,
transportation, travel, buildings, business, music`.
² Colors: `grayscale, transparent, red, orange, yellow, green, turquoise, blue,
lilac, pink, white, gray, black, brown`.

### Images — quickstart

```bash
curl -s "https://pixabay.com/api/?key=$PIXABAY_API_KEY&q=server+room&category=computer&image_type=photo&per_page=5"
```

```python
def pixabay_image(query, out_path, **params):
    r = requests.get("https://pixabay.com/api/", params={
        "key": PIXABAY_KEY, "q": query, "per_page": 5,
        "safesearch": "true", **params,
    }, timeout=30)
    r.raise_for_status()
    hits = r.json().get("hits", [])
    if not hits:
        raise LookupError(f"No Pixabay images for {query!r}")
    hit = hits[0]
    # largeImageURL ~1280px on the free tier (fullHDURL/imageURL need approval)
    url = hit.get("largeImageURL") or hit["webformatURL"]
    img = requests.get(url, timeout=60); img.raise_for_status()   # download NOW (URLs expire)
    open(out_path, "wb").write(img.content)
    return {"path": out_path, "creator": hit["user"],
            "tags": hit["tags"], "source_url": hit["pageURL"]}

pixabay_image("server room", "server.jpg", category="computer", image_type="photo")
```

**Response fields (image):** `hits[]` → `id`, `largeImageURL`, `webformatURL`,
`user`, `tags`, `imageWidth`, `imageHeight`, `pageURL`. Plus `total`, `totalHits`.

### Video — quickstart

```python
def pixabay_video(query, out_path, **params):
    r = requests.get("https://pixabay.com/api/videos/", params={
        "key": PIXABAY_KEY, "q": query, "per_page": 5,
        "safesearch": "true", **params,
    }, timeout=30)
    r.raise_for_status()
    hits = r.json().get("hits", [])
    if not hits:
        raise LookupError(f"No Pixabay videos for {query!r}")
    hit = hits[0]
    # renditions keyed by tier: large(1920) > medium(1280) > small(960) > tiny(640)
    for tier in ("large", "medium", "small", "tiny"):
        rend = hit["videos"].get(tier)
        if rend and rend.get("url"):
            break
    clip = requests.get(rend["url"], timeout=120); clip.raise_for_status()  # download NOW
    open(out_path, "wb").write(clip.content)
    return {"path": out_path, "duration": hit["duration"],
            "creator": hit["user"], "source_url": hit["pageURL"]}

pixabay_video("ocean waves", "waves.mp4", video_type="film", min_duration=4)
```

**Response fields (video):** `hits[]` → `id`, `duration`, `user`, `tags`,
`pageURL`, `videos.{large,medium,small,tiny}.{url, width, height, size}`.

---

## 4. Unsplash

**Images only.** Auth is `Authorization: Client-ID <ACCESS_KEY>` and you should
send `Accept-Version: v1`.

### Endpoint

| Purpose | Method + URL |
|---------|--------------|
| Photo search | `GET https://api.unsplash.com/search/photos` |

### Params

| Param | Values | Notes |
|-------|--------|-------|
| `query` | string **(required)** | |
| `per_page` | 1–30 | Max 30. |
| `page` | int | |
| `orientation` | `landscape` \| `portrait` \| `squarish` | Note: `squarish`, not `square`. |
| `content_filter` | `low` \| `high` | Use `high` for safe results. |

### Quickstart

```bash
curl -s -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY" -H "Accept-Version: v1" \
  "https://api.unsplash.com/search/photos?query=rainy+street&orientation=landscape&per_page=5&content_filter=high"
```

```python
def unsplash_photo(query, out_path, target_w=1920, **params):
    headers = {"Authorization": f"Client-ID {UNSPLASH_KEY}", "Accept-Version": "v1"}
    r = requests.get("https://api.unsplash.com/search/photos", headers=headers, params={
        "query": query, "per_page": 5, "content_filter": "high", **params,
    }, timeout=30)
    r.raise_for_status()
    results = r.json().get("results", [])
    if not results:
        raise LookupError(f"No Unsplash photos for {query!r}")
    photo = results[0]

    # REQUIRED by Unsplash API guidelines: trigger the download endpoint.
    requests.get(photo["links"]["download_location"], headers=headers, timeout=30)

    # Size the raw image via Imgix params (w/fm/q/fit). raw is huge by default.
    raw = photo["urls"]["raw"]
    url = f"{raw}&w={target_w}&fm=jpg&q=80&fit=max"
    img = requests.get(url, timeout=60); img.raise_for_status()
    open(out_path, "wb").write(img.content)
    return {
        "path": out_path,
        "creator": photo["user"]["name"],
        "creator_url": photo["user"]["links"]["html"],
        "source_url": photo["links"]["html"],
        "license": "Unsplash License (attribution requested)",
    }

unsplash_photo("rainy street at night", "rainy.jpg", orientation="landscape")
```

**Response fields:** `results[]` → `id`, `width`, `height`, `color`,
`description`, `alt_description`, `urls.{raw,full,regular,small,thumb}`,
`links.{html, download, download_location}`, `user.{name, links.html}`.

> **Two non-negotiables for Unsplash** (per their API guidelines):
> 1. **Trigger the download endpoint** (`links.download_location`) whenever you
>    actually use a photo — the snippet above does this. Skipping it can get your
>    app rejected at production review.
> 2. **Credit the photographer and Unsplash** wherever the image is shown, e.g.
>    *"Photo by Jane Doe on Unsplash"* with links to both.

---

## 5. Licensing & attribution

| Provider | Commercial use | Attribution | Hard restrictions |
|----------|:--------------:|-------------|-------------------|
| **Pexels** | ✅ free | Not required (appreciated) | Don't sell unaltered copies; don't imply endorsement; don't portray identifiable people/brands negatively. |
| **Pixabay** | ✅ free | Not required | Don't sell unaltered copies; don't build a competing stock service. |
| **Unsplash** | ✅ free | **Requested** (and download-tracking required by API terms) | Don't sell unaltered copies; don't build a competing service. |

Always store provenance with every asset you download — `creator`, `source_url`,
and `license` — so you can credit correctly and prove the asset is licensed:

```python
{
  "path": "assets/skyline.jpg",
  "provider": "pexels",
  "creator": "Joey Farina",
  "source_url": "https://www.pexels.com/photo/2014422/",
  "license": "Pexels License"
}
```

---

## 6. Gotchas (read before shipping)

1. **Pexels auth is bare**, not `Bearer`. The header value is just the key.
2. **Pexels doesn't filter video duration server-side** — filter the `videos[]`
   list yourself, and raise `per_page` if tight bounds empty the results.
3. **Pixabay direct URLs expire** (embedded tokens). Download the moment you get
   them; never cache the CDN URL for later. (Pixabay also asks you to cache
   *results* for 24h to avoid duplicate queries.)
4. **Pixabay free tier caps resolution:** images at ~1280px (`largeImageURL`),
   video at 1080p. Larger needs approved access. Use Pexels for 4K.
5. **Unsplash is images only** and uses `squarish` (not `square`) for orientation.
6. **Unsplash demo apps are limited to 50 req/hr.** Apply for production for 5000/hr.
7. **Search is deterministic.** The same query returns the same top result — if
   it's wrong, change the keywords; don't retry the identical query.
8. **Encode your queries.** Spaces → `%20` (or `+` for Pixabay). Keep Pixabay
   queries under 100 characters.
9. **Always set a timeout** on every request and handle `429` (rate limit) with
   backoff.

---

## 7. One drop-in module

A single file you can copy into any project. Requires `pip install requests`.

```python
# stock.py — Pexels / Pixabay / Unsplash in one place. pip install requests
import os, requests

PEXELS   = os.environ.get("PEXELS_API_KEY")
PIXABAY  = os.environ.get("PIXABAY_API_KEY")
UNSPLASH = os.environ.get("UNSPLASH_ACCESS_KEY")

def _dl(url, out_path, headers=None):
    r = requests.get(url, headers=headers, stream=True, timeout=180)
    r.raise_for_status()
    with open(out_path, "wb") as f:
        for chunk in r.iter_content(1 << 16):
            f.write(chunk)
    return out_path

def pexels_photo(q, out, **p):
    r = requests.get("https://api.pexels.com/v1/search",
        headers={"Authorization": PEXELS},
        params={"query": q, "per_page": 5, **p}, timeout=30)
    r.raise_for_status(); hits = r.json()["photos"]
    if not hits: raise LookupError(q)
    _dl(hits[0]["src"]["large2x"], out)
    return {"path": out, "creator": hits[0]["photographer"],
            "source_url": hits[0]["url"], "license": "Pexels License"}

def pexels_video(q, out, min_dur=None, max_dur=None, **p):
    r = requests.get("https://api.pexels.com/videos/search",
        headers={"Authorization": PEXELS},
        params={"query": q, "per_page": 10, **p}, timeout=30)
    r.raise_for_status(); vids = r.json()["videos"]
    vids = [v for v in vids if (not min_dur or v["duration"] >= min_dur)
                            and (not max_dur or v["duration"] <= max_dur)]
    if not vids: raise LookupError(q)
    files = [f for f in vids[0]["video_files"] if f["file_type"].startswith("video/")]
    _dl(max(files, key=lambda f: f.get("width", 0))["link"], out)
    return {"path": out, "creator": vids[0]["user"]["name"],
            "source_url": vids[0]["url"], "license": "Pexels License"}

def pixabay_image(q, out, **p):
    r = requests.get("https://pixabay.com/api/",
        params={"key": PIXABAY, "q": q, "per_page": 5, "safesearch": "true", **p}, timeout=30)
    r.raise_for_status(); hits = r.json()["hits"]
    if not hits: raise LookupError(q)
    _dl(hits[0].get("largeImageURL") or hits[0]["webformatURL"], out)
    return {"path": out, "creator": hits[0]["user"],
            "source_url": hits[0]["pageURL"], "license": "Pixabay License"}

def pixabay_video(q, out, **p):
    r = requests.get("https://pixabay.com/api/videos/",
        params={"key": PIXABAY, "q": q, "per_page": 5, "safesearch": "true", **p}, timeout=30)
    r.raise_for_status(); hits = r.json()["hits"]
    if not hits: raise LookupError(q)
    rend = next(hits[0]["videos"][t] for t in ("large","medium","small","tiny")
                if hits[0]["videos"].get(t, {}).get("url"))
    _dl(rend["url"], out)
    return {"path": out, "creator": hits[0]["user"],
            "source_url": hits[0]["pageURL"], "license": "Pixabay License"}

def unsplash_photo(q, out, target_w=1920, **p):
    h = {"Authorization": f"Client-ID {UNSPLASH}", "Accept-Version": "v1"}
    r = requests.get("https://api.unsplash.com/search/photos", headers=h,
        params={"query": q, "per_page": 5, "content_filter": "high", **p}, timeout=30)
    r.raise_for_status(); res = r.json()["results"]
    if not res: raise LookupError(q)
    requests.get(res[0]["links"]["download_location"], headers=h, timeout=30)  # required
    _dl(f'{res[0]["urls"]["raw"]}&w={target_w}&fm=jpg&q=80&fit=max', out)
    return {"path": out, "creator": res[0]["user"]["name"],
            "creator_url": res[0]["user"]["links"]["html"],
            "source_url": res[0]["links"]["html"], "license": "Unsplash License"}

if __name__ == "__main__":
    print(pexels_photo("city skyline at dusk", "skyline.jpg",
                       orientation="landscape", size="large"))
```

---

## 8. Cheat sheet

```
Need a photo?
  illustration / vector?      → Pixabay (image_type=illustration|vector)
  category filter?            → Pixabay (category=...)
  match a palette color?      → Pexels  (color=RRGGBB)
  modern / lifestyle look?    → Unsplash
  general high-quality photo? → Pexels

Need video?
  4K?                         → Pexels  (size=large)
  animation-style clip?       → Pixabay (video_type=animation)
  category filter?            → Pixabay (category=...)
  general B-roll?             → Pexels

Always: download immediately, store creator + source_url + license,
        set timeouts, encode queries, and credit Unsplash photographers.
```
