'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const models = new Map();
  let manifest, snapshot, filter = 'all';
  let activeTransport = null;
  function stopPlayback(except = null) {
    for (const model of models.values()) {
      if (model !== except) { model.player?.pause(); for (const media of model.media) if (media.pause) media.pause(); }
    }
  }
  const sceneChoices = [['unreviewed', '未审阅'], ['A', '保留 A'], ['B', '保留 B'], ['both', '都保留'], ['neither', '都不要']];
  const audioChoices = [['unreviewed', '未审阅'], ['favorite', '喜欢'], ['shortlist', '备选'], ['reject', '不喜欢']];
  const message = value => { $('#global-status').textContent = value; };
  const node = (tag, className, text) => { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; };
  const blank = () => ({ choice: 'unreviewed', notes: '', version: 0 });
  const equal = (a, b) => a.choice === b.choice && a.notes === b.notes;
  const dirty = model => !equal(model.draft, model.entry) || Boolean(model.retry);
  const storageKey = id => `review-draft:${manifest.projectId}:${manifest.edition}:${manifest.manifestHash}:${id}`;
  function remember(model) {
    try {
      if (dirty(model)) localStorage.setItem(storageKey(model.item.id), JSON.stringify({ ...model.draft, baseVersion: model.entry.version, retry: model.retry || null }));
      else localStorage.removeItem(storageKey(model.item.id));
    } catch { message('浏览器无法保存草稿。请同步或导出 JSON 后离开。'); }
  }
  async function request(url, options) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    const data = await response.json();
    return { response, data };
  }
  function progress() {
    const values = [...models.values()];
    const reviewed = values.filter(m => m.entry.choice !== 'unreviewed').length;
    $('#progress').textContent = `${reviewed} / ${values.length} 已同步审阅`;
    for (const model of values) model.card.classList.toggle('hidden', !(filter === 'all' || filter === model.item.kind || (filter === 'pending' && model.entry.choice === 'unreviewed')));
  }
  function update(model) {
    for (const button of model.choices.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.choice === model.draft.choice));
    if (model.notes.value !== model.draft.notes) model.notes.value = model.draft.notes;
    model.save.disabled = Boolean(model.inflight);
    model.save.textContent = model.retry ? '重试保存' : '保存';
    model.status.textContent = model.inflight ? '正在同步…' : model.conflict ? '另一设备已更新；你的草稿仍在。' : model.retry ? '同步未确认。重试会使用同一次请求，避免重复保存。' : dirty(model) ? '草稿尚未同步' : model.entry.version ? `已同步保存 · v${model.entry.version} · ${new Date(model.entry.updatedAt).toLocaleString()}` : '尚未审阅';
    model.conflictBox.replaceChildren();
    model.conflictBox.classList.toggle('hidden', !model.conflict);
    if (model.conflict) {
      model.conflictBox.append(node('p', '', `已同步版本：${model.conflict.choice}\n${model.conflict.notes || '（无批注）'}`));
      const useRemote = node('button', '', '采用已同步版本');
      useRemote.onclick = () => {
        model.entry = model.conflict; model.draft = { choice: model.entry.choice, notes: model.entry.notes };
        model.conflict = null; model.retry = null; remember(model); update(model); progress();
      };
      const useMine = node('button', '', '保留我的草稿并保存');
      useMine.onclick = () => { model.entry = model.conflict; model.conflict = null; model.retry = null; remember(model); save(model); };
      model.conflictBox.append(useRemote, useMine);
    }
    progress();
  }
  async function save(model) {
    clearTimeout(model.timer);
    if (model.inflight || model.conflict || !dirty(model)) return;
    const payload = model.retry || { id: model.item.id, choice: model.draft.choice, notes: model.draft.notes, baseVersion: model.entry.version, requestId: crypto.randomUUID(), edition: manifest.edition, manifestHash: manifest.manifestHash };
    model.retry = payload; // Persist the exact request before sending: a lost response can be retried safely.
    model.inflight = true; remember(model); update(model);
    let followup = false;
    try {
      const { response, data } = await request('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        model.entry = data.entries[model.item.id]; model.retry = null;
        snapshot.revision = Math.max(snapshot.revision, data.revision);
        followup = !equal(model.draft, model.entry);
      } else if (response.status === 409 && data.conflicts) {
        model.conflict = data.conflicts.find(x => x.id === model.item.id).current; model.retry = null;
      } else message(data.error || '保存失败，请导出草稿后检查服务。');
    } catch { message('连接中断；草稿已保留，可以重试保存或导出 JSON。'); }
    finally { model.inflight = false; remember(model); update(model); }
    if (followup) save(model);
  }
  function changed(model) { remember(model); update(model); clearTimeout(model.timer); model.timer = setTimeout(() => save(model), 650); }
  function mediaFor(variant, model) {
    const card = node('div', 'candidate');
    const heading = node('div', 'candidate-head');
    heading.append(node('strong', '', `${variant.id} · ${variant.label || variant.id} · ${variant.version}`));
    const link = node('a', '', '全尺寸打开'); link.href = variant.src; link.target = '_blank'; link.rel = 'noopener'; heading.append(link); card.append(heading);
    let media;
    if (variant.kind === 'video' || variant.kind === 'audio') {
      media = node(variant.kind); media.src = variant.src; media.controls = true; media.preload = 'metadata';
      if (variant.kind === 'video') { media.muted = true; media.playsInline = true; }
      media.addEventListener('play', () => {
        stopPlayback(model);
        for (const other of document.querySelectorAll('audio,video')) {
          if (other !== media && !(model.syncing && model.media.includes(other))) other.pause();
        }
      });
      media.addEventListener('volumechange', () => {
        if (!media.muted) for (const other of document.querySelectorAll('audio,video')) if (other !== media) other.muted = true;
      });
      media.addEventListener('error', () => message(`${model.item.id} / ${variant.id} 无法播放，请检查媒体文件。`));
    } else if (variant.kind === 'html') {
      media = node('iframe'); media.src = variant.src; media.loading = 'lazy'; media.title = `${model.item.title}, ${variant.label || variant.id}`; media.allow = 'fullscreen';
      media.dataset.reviewProtocol = variant.seekProtocol ? '1' : '0';
    } else { media = node('img'); media.src = variant.src; media.alt = variant.label || model.item.title; media.loading = 'lazy'; }
    model.media.push(media); card.append(media);
    if (variant.description) card.append(node('p', 'caption', variant.description));
    return card;
  }
  function transport(model) {
    const videos = model.media.filter(m => m.tagName === 'VIDEO');
    const frames = model.media.filter(m => m.tagName === 'IFRAME' && m.dataset.reviewProtocol === '1');
    if (!videos.length && !frames.length) return;
    const bar = node('div', 'transport');
    const play = node('button', '', '同步播放'); const pause = node('button', '', '暂停'); const reset = node('button', '', '从头');
    const slider = node('input'); slider.type = 'range'; slider.min = '0'; slider.max = String(Math.max(...model.item.variants.map(x => x.duration || 0), 0) || 12); slider.step = '0.01'; slider.value = '0'; slider.setAttribute('aria-label', `${model.item.title} 同步时间`);
    const time = node('span', 'time', '0.00s');
    const post = (type, t) => frames.forEach(frame => frame.contentWindow?.postMessage({ type: `review:${type}`, time: t }, location.origin));
    let playing = false, startAt = 0, startTime = 0, frameId = 0;
    const duration = () => Number(slider.max);
    const nowTime = () => Math.min(duration(), playing ? startTime + (performance.now() - startAt) / 1000 : Number(slider.value));
    const display = value => { slider.value = String(value); time.textContent = `${value.toFixed(2)}s`; };
    const videoTime = (video, value) => Math.min(value, Number.isFinite(video.duration) ? Math.max(0, video.duration - 1 / 60) : value);
    const seek = value => {
      for (const video of videos) if (video.readyState >= 1) video.currentTime = videoTime(video, value);
      post('seek', value); display(value);
    };
    const stop = () => {
      const value = nowTime(); playing = false; cancelAnimationFrame(frameId);
      videos.forEach(v => v.pause()); post('pause', value); seek(value); model.syncing = false;
      if (activeTransport === model.player) activeTransport = null;
    };
    const tick = () => {
      if (!playing) return;
      const value = nowTime(); display(value); post('seek', value);
      // One parent clock also owns HTML-only playback. Video clocks are corrected only on meaningful drift.
      for (const video of videos) if (video.readyState >= 1 && Math.abs(video.currentTime - videoTime(video, value)) > .12) video.currentTime = videoTime(video, value);
      if (value >= duration()) stop(); else frameId = requestAnimationFrame(tick);
    };
    model.player = { pause: stop };
    play.onclick = async () => {
      stopPlayback(model); if (activeTransport) activeTransport.pause();
      activeTransport = model.player; model.syncing = true;
      startTime = Number(slider.value) >= duration() ? 0 : Number(slider.value); startAt = performance.now();
      seek(startTime); post('pause', startTime); // HTML timelines remain paused and are advanced only by absolute seeks.
      playing = true; frameId = requestAnimationFrame(tick);
      await Promise.allSettled(videos.map(video => { video.muted = true; return video.play(); }));
    };
    pause.onclick = stop;
    reset.onclick = () => { pause.click(); seek(0); };
    slider.oninput = () => { const requestedTime = Number(slider.value); pause.click(); seek(requestedTime); };
    videos.forEach(video => video.addEventListener('loadedmetadata', () => { slider.max = String(Math.max(...model.media.map((media, i) => Number.isFinite(media.duration) ? media.duration : model.item.variants[i].duration || (media.tagName === 'IFRAME' ? 12 : 0))) || 12); }));
    bar.append(play, pause, reset, slider, time);
    if (frames.length) bar.append(node('span', 'muted', 'HTML 同步需候选实现 seek 协议'));
    model.card.append(bar);
  }
  function render(item) {
    const entry = snapshot.items[item.id] || blank();
    const model = { item, entry, draft: { choice: entry.choice, notes: entry.notes }, media: [], retry: null, conflict: null };
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey(item.id)) || 'null');
      if (stored && typeof stored.notes === 'string' && (item.kind === 'scene' ? sceneChoices : audioChoices).some(([choice]) => choice === stored.choice)) {
        model.draft = { choice: stored.choice, notes: stored.notes }; model.retry = stored.retry;
        if (stored.baseVersion !== entry.version && !equal(model.draft, entry) && !model.retry) model.conflict = entry;
      }
    } catch { /* An unavailable browser cache does not prevent server-backed review. */ }
    model.card = node('section', `item ${item.kind}`); model.card.id = item.id;
    const heading = node('div', 'item-head'); heading.append(node('h2', '', item.title), node('span', 'item-id', item.id)); model.card.append(heading);
    if (item.narration) model.card.append(node('p', 'narration', item.narration));
    if (item.ancestry) model.card.append(node('p', 'narration', `版本来源：${item.ancestry}`));
    const candidates = node('div', 'candidates'); item.variants.forEach(variant => candidates.append(mediaFor(variant, model))); model.card.append(candidates); transport(model);
    model.choices = node('div', 'choices'); model.choices.setAttribute('aria-label', `${item.title} 选择`);
    for (const [value, label] of item.kind === 'scene' ? sceneChoices : audioChoices) {
      const button = node('button', '', label); button.dataset.choice = value;
      button.onclick = () => { model.draft.choice = value; changed(model); save(model); };
      model.choices.append(button);
    }
    model.notes = node('textarea', 'notes'); model.notes.placeholder = '保留什么、改哪里、希望看到什么效果…'; model.notes.maxLength = 12000; model.notes.setAttribute('aria-label', `${item.title} 批注`); model.notes.oninput = () => { model.draft.notes = model.notes.value; changed(model); };
    const row = node('div', 'save-row'); model.status = node('span', 'save-status'); model.status.setAttribute('role', 'status'); model.save = node('button', '', '保存'); model.save.onclick = () => save(model); row.append(model.status, model.save);
    model.conflictBox = node('div', 'conflict hidden');
    model.card.append(model.choices, model.notes, row, model.conflictBox); models.set(item.id, model); $('#items').append(model.card); update(model);
  }
  async function refresh(silent = false) {
    const { response, data } = await request('/api/review');
    if (!response.ok) throw Error(data.error || '无法同步');
    if (data.manifestHash !== manifest.manifestHash) throw Error('审阅版本已变化，请先导出草稿，再重新载入页面。');
    snapshot = data;
    for (const model of models.values()) {
      if (model.inflight) continue;
      const remote = data.items[model.item.id] || blank();
      if (remote.version !== model.entry.version) {
        if (dirty(model)) { if (!model.retry) model.conflict = remote; }
        else { model.entry = remote; model.draft = { choice: remote.choice, notes: remote.notes }; }
      }
      update(model);
    }
    if (!silent) message('已同步其他设备的审阅状态。');
  }
  $('#export').onclick = () => {
    if (!manifest) return;
    const items = {};
    for (const model of models.values()) items[model.item.id] = { ...model.entry, ...model.draft, ...(dirty(model) ? { draft: true } : {}) };
    const data = { ...snapshot, exportedAt: new Date().toISOString(), items };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${manifest.projectId}-${manifest.edition}-review.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('已导出当前选择及草稿。');
  };
  $('#import').onchange = async event => {
    const file = event.target.files[0]; event.target.value = ''; if (!file || !manifest) return;
    if ([...models.values()].some(m => dirty(m) || m.inflight || m.conflict)) return message('请先同步或导出并处理当前草稿，再导入其他记录。');
    try {
      const data = JSON.parse(await file.text());
      if (data.projectId !== manifest.projectId || data.edition !== manifest.edition || data.manifestHash !== manifest.manifestHash) throw Error('导入文件来自其他项目或候选版本，无法覆盖当前审阅。');
      const entries = Object.entries(data.items).map(([id, x]) => ({ id, choice: x.choice, notes: x.notes, baseVersion: x.version }));
      if (!entries.length) throw Error('导入文件没有审阅记录。');
      const { response, data: result } = await request('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edition: manifest.edition, manifestHash: manifest.manifestHash, requestId: crypto.randomUUID(), entries }) });
      if (!response.ok) throw Error(result.conflicts ? `导入未执行：${result.conflicts.map(x => x.id).join(', ')} 已有较新记录。原文件仍可作为备份。` : result.error);
      await refresh(true); message('导入完成，已同步保存。');
    } catch (error) { message(error.message); }
  };
  $('#refresh').onclick = () => refresh().catch(error => message(error.message));
  for (const button of document.querySelectorAll('[data-filter]')) button.onclick = () => { stopPlayback(); filter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); progress(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') stopPlayback(); });
  window.addEventListener('pagehide', () => stopPlayback());
  window.addEventListener('beforeunload', event => { if ([...models.values()].some(m => dirty(m) || m.inflight)) { event.preventDefault(); event.returnValue = ''; } });
  (async () => {
    const m = await request('/manifest.json'); if (!m.response.ok) throw Error('无法读取审阅清单'); manifest = m.data;
    const state = await request('/api/review'); if (!state.response.ok) throw Error('无法读取审阅状态'); snapshot = state.data;
    $('#title').textContent = manifest.title; document.title = manifest.title; $('#description').textContent = manifest.description || ''; $('#edition').textContent = ` / ${manifest.edition}`;
    manifest.items.forEach(render);
    if (!manifest.items.length) $('#items').append(node('p', 'empty', '审阅页面已就绪。将冻结的候选加入 public/manifest.json，重新启动服务即可开始。'));
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    message('已连接审阅服务。');
    setInterval(() => { if (document.visibilityState === 'visible') refresh(true).catch(() => {}); }, 20000);
  })().catch(error => { $('#title').textContent = '暂时无法载入审阅'; message(error.message); });
})();
