<!-- Public portability adaptation, 2026-09-26. -->

# HTML review rooms and ngrok publication

Read when the user wants review across devices or a public review link. A local review page alone does not imply permission to publish; a request such as “用 ngrok 投到公网，我在另一台电脑看” does. Complete and verify the review package first, then publish within that authorization without another routine confirmation.

## Reusable layout and persistence

Start from `../templates/review-workbench/` and its setup instructions. Keep a public distribution with only UI, manifests and selected playable dependencies, plus a private feedback store outside it. Scene studies need A/B/both/neither/unreviewed; audio needs favorite/shortlist/reject/unreviewed. Keep edition, candidate source version and per-entry feedback revision distinct.

Browser storage is a recoverable unsaved draft, not cross-device persistence. Save one item at a time with `baseVersion` and stable `requestId`; reject conflicts with HTTP 409 and let the reviewer choose which notes to retain. Retry an uncertain save with the same request id. Import must use the same validated conflict handling as normal saves; it must not replace the whole live database. Atomic write/rename, bounded JSON, valid manifest IDs and visible saved/error state prevent silent loss. Export keeps edition, candidate identity and notes, not just A/B letters.

For variants with different durations, shared review time is absolute seconds; clamp an ended variant instead of stretching it to match the other. Native video stays 1× within its window. An HTML player needs a seek adapter driven by that same time and exact origin/source checks on messages. Browser playback convenience must not leak into deterministic HyperFrames render code.

## Local service → narrow gateway → tunnel

1. Inspect existing project launch/process records and current loopback listeners. Verify service identity through a health endpoint before reusing a port. Do not terminate every Node/ngrok process. Record the task-owned PID, port, startup command and log paths.
2. Bind local services to `127.0.0.1`. For several historical editions plus audio/final delivery, use one narrow gateway with an explicit route/dependency allowlist. A single isolated public distribution may be served directly. Include required fonts, JS modules, images and media, not arbitrary project files. Keep prompts, credit ledgers, credentials, private manifests, server source and feedback database off static routes. Feedback is accessible only through the scoped API needed by the reviewer.
3. Implement `HEAD`, correct MIME types and `Range`/206 for media; invalid ranges return 416. Use `no-store` for live feedback, cache revalidation for changing manifests/media and immutable URLs only for immutable assets. New releases must not display stale cached scenes under a new label.
4. Inspect local ngrok CLI help and active endpoints before changing a tunnel. Reuse the user's configured endpoint/domain when appropriate; otherwise start the authorized tunnel to the review gateway. Derive the public URL from ngrok's actual status, not a remembered hostname. Credentials stay in existing private configuration. Record the actual endpoint, target and process; old case-study links are historical, not current service promises.
5. On Windows, start helpers hidden and redirect logs, e.g. `Start-Process -FilePath $nodeExe -ArgumentList @('server.cjs') -WorkingDirectory $reviewDirectory -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath`. Quote arguments containing spaces for the installed shell/process behavior. Use the verified ngrok command similarly; do not silently replace an unrelated active endpoint.
6. Public POSTs must validate the actual expected HTTPS origin, JSON body and size before forwarding. Configure the known public origin explicitly where supported. A loopback proxy may rewrite Origin for its private upstream only after validation. Do not forward arbitrary incoming headers or treat Origin checks as reviewer authentication. Add access control if the requested audience requires it.

For the starter's default port, an example is `ngrok http http://127.0.0.1:18840 --inspect=false`. Check the installed `ngrok http --help`, substitute this project's verified gateway port and disable request-body inspection when supported, since reviewer notes do not need to enter tunnel inspection logs. Keep the host and helper processes running for remote access; report a verified current URL rather than implying permanent hosting.

## Review verification

Use isolated feedback fixtures/ports and separate browser storage. Record real review-data hashes before and after QA; production selections must not become synthetic test A/B choices.

- Full scope is discoverable from one overview; latest and historical entries are clearly marked. Test previous/next, filter, focus, replay, scrubbing, keyboard controls where implemented, desktop and mobile layouts.
- Start at zero, scrub forward/back, cold-seek into the middle, reach the final frame, then replay. Test actual native video progression in addition to a frozen contact sheet. Pausing and scrubbing must pause all candidates and prevent audio bleed.
- Save a selection and notes; reload and verify from a second client. Exercise disconnected drafts, ambiguous retries, 409 conflict and export/import. Show an explicit unsaved/conflict state rather than claiming success.
- Over the public URL check page, manifest, every selected asset route, media length/Range, write API behavior on the isolated fixture, no JS errors, real playback and chapter jumps for the final film. Check representative forbidden private paths return 404/403. A successful localhost test or HTTP 200 page is insufficient.

## Evidence and scope

Save publication time, public URL, gateway target, manifest/source hashes, tested routes and actual browser observations. Update current download/player links after replacement or cleanup and verify again. Do not republish an entire tree to fix one missing font.

Use the bundled [review-workbench starter](../templates/review-workbench/USAGE.md) for a working local implementation. Its allowlisted routes and revision/conflict handling are portable starting points. Verify the actual candidate formats, media seeking and feedback persistence after integration.