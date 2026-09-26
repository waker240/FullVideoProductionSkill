<!-- Public portability adaptation, 2026-09-26. -->

# Review workbench starter

A dependency-free Node.js template for a **new, isolated review package**. It combines scene A/B comparison and audio auditions, with persistent server saves, immutable editions and explicit conflict resolution across browsers. It contains no live project feedback, generated media or credentials.

## Start a new review

Use Node.js 22.20.0 or newer, matching this release's runtime requirement. Copy the template into a new project folder, then create a dedicated public directory. This PowerShell example runs in the newly copied folder:

```powershell
New-Item -ItemType Directory -Force -Path public | Out-Null
Copy-Item -LiteralPath index.html,review.js,review.css -Destination public
Copy-Item -LiteralPath manifest.example.json -Destination public/manifest.json
$env:REVIEW_PORT = '18840'
node server.cjs
```

Open `http://127.0.0.1:18840/`. The empty example is runnable and displays a ready state. Add your candidates before beginning review, then restart the server. For background use on Windows, launch the same command with `Start-Process -WindowStyle Hidden` and keep its PID/log paths **outside public/**. Stop that process normally when finished.

For a populated, isolated demonstration with two HTML candidates and an actual playable WAV, run `node create-demo.cjs`. It creates a new temporary package and prints its path and launch command. It never writes into an existing review. The demo is a functional illustration, not a video-quality reference or an approved sound source.

The server binds only to `127.0.0.1`. After local playback and feedback tests pass, a user-authorized public review can use `ngrok http http://127.0.0.1:18840 --inspect=false`. Discover and verify the actual returned URL. Do not reuse a historic ngrok domain. The public link has no built-in sign-in; distribute it only to the intended reviewers. Verify remote media Range requests, seek, notes and a second-browser save before announcing the page. Keep the host running.

Only `public/` files of supported web/media types are served. Feedback, history, requests and process locks live under `feedback/`, which is never served as static files. Do not place logs, source session transcripts, credentials or QA output under public/. Only one server process may own a feedback directory; `feedback/server.lock` prevents a second writer. If the process crashed, inspect the recorded PID and remove that exact stale lock only after confirming no server still owns it.

## Manifest schema

`public/manifest.json` uses stable project/item IDs and an explicit edition. Candidate `version` is a content revision, while saved feedback `version` is an optimistic-concurrency counter; they have different meanings.

```json
{
  "schema": 1,
  "projectId": "my-film",
  "edition": "r1",
  "title": "Film / first scene review",
  "description": "Choose a direction and describe the desired change.",
  "items": [
    {
      "id": "act01-sc01",
      "kind": "scene",
      "title": "01.01 · Opening",
      "narration": "The exact spoken clause this scene needs to support.",
      "ancestry": "A preserves the approved r0 material reveal; B explores a new relationship canvas.",
      "variants": [
        {"id": "A", "version": "v1", "label": "Material reveal", "kind": "video", "src": "editions/r1/open-A.mp4", "duration": 12},
        {"id": "B", "version": "v1", "label": "Relationship canvas", "kind": "html", "src": "editions/r1/open-B/index.html", "duration": 12, "seekProtocol": true}
      ]
    },
    {
      "id": "sfx-ui-click-01",
      "kind": "audio",
      "title": "SFX · Clear interface click",
      "variants": [
        {"id": "audio", "version": "v1", "label": "Dry click", "kind": "audio", "src": "editions/r1/audio/click.wav", "description": "Intended for an interface confirmation; audition alone and in its scene."}
      ]
    }
  ]
}
```

- Each `scene` contains exactly A and B, in that order. Choices are `unreviewed`, `A`, `B`, `both`, `neither`. A/B can contain video, HTML, or a still image. A still is only a style reference; it is not evidence that animation has been approved.
- Each `audio` item contains one playable audio candidate. Choices are `unreviewed`, `favorite`, `shortlist`, `reject`. Represent SFX, BGM, narration takes and in-context comparison mixes as separate stable items. Do not treat a shortlist as final permission to use every track.
- IDs/versions use letters, digits, underscores and dashes, beginning with a letter or digit. Each candidate needs a `version` and local `src` beginning with `editions/<edition>/`. Keep **all** HTML assets and dependencies in that edition directory; freeze them there instead of referring to mutable shared code or remote CDNs.
- Startup hashes the manifest and all files in that edition, and stores the fingerprint with the reviews. After any review is saved, changing a candidate, dependency or manifest requires a **new edition**. Old editions stay in the private state file; their choices do not silently migrate to changed A/B content. During a running server, changed candidate files are refused and no new review can be saved against them. Restarting an untouched edition keeps all saved decisions.
- Freeze only the review package, not an entire source repository. Put new work and QA captures outside the published edition, then admit a new edition when ready. The empty initial example can be edited until its first feedback record is saved.
- The private state preserves each edition's manifest snapshot, candidate file hashes, and feedback. This starter serves **one active edition** at a time. To keep historical candidate pages directly browsable, retain the prior immutable package/service and link it from the current review or a project gateway. Private archived feedback alone does not provide historical candidate navigation. Optional `ancestry` text on an item explains what was preserved or changed without transferring approval automatically.

## Playback and HTML seeking

Videos have native controls, start muted, support normal-rate A/B synchronized start/pause/seek, and provide a full-size link. Audio has native controls; starting another audition pauses the previous one. Files support `GET`, `HEAD`, single HTTP byte ranges (including suffix/open-ended ranges), and proper 416 responses. The workbench does not time-stretch candidate media.

An HTML candidate may implement this optional same-origin `postMessage` protocol. Do not set `seekProtocol: true` unless it actually works. The workbench owns one preview clock and sends absolute seeks on every preview frame; the candidate keeps its timeline paused. This avoids independent candidate clocks drifting apart. Hidden pages, filter changes and starting another group pause the current transport. The shared slider continues until the longest candidate ends; shorter videos hold their last frame.

```js
window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== location.origin) return;
  const {type, time} = event.data || {};
  if (type === 'review:seek' && Number.isFinite(time)) seekToSeconds(time);
  if (type === 'review:pause') pausePlayback();
});
```

## Saves, import/export and conflict behavior

- Choices save immediately; notes debounce by 650 ms and also have an explicit Save button. The page labels draft, saving, synced and conflicting states. Browser drafts survive refreshes. Clean items refresh from the server every 20 seconds while visible.
- Two devices editing the same saved version produce a **409 conflict**; the later request never wins merely because its clock is newer. Both notes remain visible. The reviewer explicitly chooses the synced version or saves their preserved draft against the newer version.
- JSON export includes current choices and unsynced drafts. Import requires the same project, edition and manifest hash, and preserves exported base versions. All imported records commit together only if none conflict; a stale import does not partially overwrite recent decisions. Import refuses to start while local drafts are unresolved. Historical snapshots are backups, not a force-overwrite mechanism.
- `GET /api/review` returns the active edition. `POST /api/review` accepts `{id, choice, notes, baseVersion, requestId, edition, manifestHash}`. `POST /api/import` accepts `{entries:[{id,choice,notes,baseVersion}],requestId,edition,manifestHash}`. Both require same-origin JSON requests. A repeated `requestId` with the same body returns its original result without writing again; reuse with changed content returns 409. Retain the exact request on an uncertain network retry.
- Feedback is written with an atomic file replacement, and prior editions are retained. Only the single running server writes this state. Tests use a throwaway directory and never touch a real review file.
- Approval semantics remain a project rule: a selected candidate with no note can be approved when the user establishes that rule; `neither` is rejected even without notes, and `unreviewed` is not approval. “Ready for review” is never the same as “approved by the user.”

## Verify before sharing

Run the behavioral server tests:

```powershell
node --test smoke.test.cjs
```

They create and remove only their own `os.tmpdir()` fixture, covering persistence, two-client conflicts, idempotent uncertain retries, atomic import, immutable media/edition guards, Range/HEAD, invalid requests and private-path denial. Separately check the UI in two isolated browser contexts with actual playable media: choose/annotate, refresh, conflict and resolve, export/import, seek A/B, switch audio, resize to mobile, and inspect errors. A passing test fixture never alters production feedback.
