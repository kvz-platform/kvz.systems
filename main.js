// kvz.systems — charts, scroll reveals, the pinned runtimes section, and the
// typing terminal. Every number is from docs/BENCHMARKS.md.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const HUE = {
    yellow: ['#ffe066', '#f5b400'], blue: ['#5fb0ff', '#1f6fff'], pink: ['#ff7aa2', '#e0245e'],
    green: ['#5cea94', '#14b85a'], violet: ['#b48cff', '#7a45f5'], orange: ['#ffa133', '#ff6a00'],
  };
  const K3S = '#4a4a50', APPLE = '#8a8a90';
  const vgrad = h => `linear-gradient(180deg, ${HUE[h][0]}, ${HUE[h][1]})`;
  const hgrad = h => `linear-gradient(90deg, ${HUE[h][1]}, ${HUE[h][0]})`;

  /* ---------------- feature tiles ---------------- */

  // 0.44 s: dots slide along a 0–1.4 s axis
  const axis = $('[data-axis]');
  if (axis) {
    const max = 1.4, pct = v => `${(v / max) * 100}%`;
    const rows = [{ n: 'kvz', v: 0.44, l: '0.44 s', lead: true }, { n: 'Apple cluster', v: 0.88, l: '0.88 s' }, { n: 'k3s', v: 1.3, l: '1.30 s' }];
    axis.innerHTML = `<div class="axis__track"></div>` +
      [0, 0.5, 1].map(t => `<i class="axis__tick" style="left:${pct(t)}"></i><span class="axis__tl" style="left:${pct(t)}">${t === 0 ? '0' : t.toFixed(1) + ' s'}</span>`).join('') +
      rows.map((r, i) => `<span class="axis__lbl" style="left:${pct(r.v)};--i:${i}">${r.lead ? `<b>${r.n}</b>` : `<b>${r.l}</b> ${r.n}`}</span>
        <i class="axis__dot ${r.lead ? 'lead' : ''}" data-x="${pct(r.v)}" style="--i:${i}"></i>`).join('');
  }

  // API restart gauge
  const gauge = $('[data-gauge]');
  if (gauge) {
    const r = 92, cx = 110, cy = 104, len = Math.PI * r, arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    gauge.innerHTML = `<div class="gauge"><svg viewBox="0 0 220 116" role="img" aria-label="kvz 1.7 s, k3s in Lima 9.3 s">
      <defs><linearGradient id="gp" x1="0" x2="1"><stop offset="0" stop-color="#e0245e"/><stop offset="1" stop-color="#ff7aa2"/></linearGradient></defs>
      <path d="${arc}" fill="none" stroke="#2a2a2e" stroke-width="14" stroke-linecap="round"/>
      <path class="arc" d="${arc}" fill="none" stroke="${K3S}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}" data-to="${len * (1 - 9.3 / 10)}"/>
      <path class="arc" d="${arc}" fill="none" stroke="url(#gp)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}" data-to="${len * (1 - 1.7 / 10)}"/>
    </svg><div class="gauge__val"><span data-count="1.7" data-dec="1">1.7</span> s</div><div class="gauge__sub">vs 9.3 s for k3s in Lima</div></div>`;
  }

  // API creates: concentric 270° rings
  const rings = $('[data-rings]');
  if (rings) {
    const data = [{ n: 'kvz', v: 9614, l: '9.6k', c: 'url(#rg)', lead: true }, { n: 'Apple cluster', v: 7974, l: '8.0k', c: APPLE }, { n: 'k3s in Lima', v: 3200, l: '3.2k', c: K3S }];
    const W = 11, GAP = 5;
    const svg = data.map((d, i) => {
      const r = 64 - i * (W + GAP) - W / 2 + 2, len = 2 * Math.PI * r * 0.75;
      return `<circle cx="70" cy="70" r="${r}" fill="none" stroke="#2a2a2e" stroke-width="${W}" stroke-dasharray="${len} 999" stroke-linecap="round" transform="rotate(-90 70 70)"/>
        <circle class="arc" cx="70" cy="70" r="${r}" fill="none" stroke="${d.c}" stroke-width="${W}" stroke-linecap="round" transform="rotate(-90 70 70)"
          stroke-dasharray="${len} 999" stroke-dashoffset="${len}" data-to="${len * (1 - d.v / 10000)}"/>`;
    }).join('');
    rings.innerHTML = `<div class="rings"><svg viewBox="0 0 140 140" role="img" aria-label="kvz 9,614, Apple cluster 7,974, k3s in Lima 3,200 creates per second">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cea94"/><stop offset="1" stop-color="#14b85a"/></linearGradient></defs>${svg}</svg>
      <div class="rings__legend">${data.map(d => `<div><b class="${d.lead ? 'lead' : ''}">${d.l}</b><span>${d.n}</span></div>`).join('')}</div></div>`;
  }

  // 1,000 pod soak: 20 rounds
  const SOAK = [0.613, 0.566, 0.642, 0.552, 0.711, 0.624, 0.605, 0.565, 0.553, 0.605, 0.656, 0.61, 0.613, 0.576, 0.596, 0.657, 0.627, 0.58, 0.634, 0.604];
  const soak = $('[data-soak]');
  if (soak) soak.innerHTML = SOAK.map((v, i) => `<i style="--h:${(v / 0.8) * 100}%;--i:${i}"></i>`).join('');

  // idle memory: 50 MB blocks
  const blocks = $('[data-blocks]');
  if (blocks) {
    const kvz = Math.round(257 / 50), apple = Math.round(2453 / 50), total = Math.round(3192 / 50);
    blocks.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < kvz ? 'kvz' : i < apple ? 'apple' : ''}" style="--i:${i}"></i>`).join('');
  }

  /* ---------------- benchmark charts ---------------- */

  function lineChart(el, { w, h, hue, series, xs, xLabels, yTicks, yFmt, log, endLabels = true }) {
    const pad = { l: 52, r: endLabels ? 130 : 24, t: 28, b: 38 }, IN = 26;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = yTicks[0], y1 = yTicks[yTicks.length - 1];
    const X = v => pad.l + IN + ((v - x0) / (x1 - x0)) * (w - pad.l - pad.r - 2 * IN);
    const Y = v => h - pad.b - (log ? (Math.log10(v) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0)) : (v - y0) / (y1 - y0)) * (h - pad.t - pad.b);
    const id = `lg${Math.random().toString(36).slice(2, 7)}`;
    // keep end labels apart
    const ends = series.map(s => Y(s.pts[s.pts.length - 1][1]));
    const order = ends.map((y, i) => [y, i]).sort((a, b) => a[0] - b[0]);
    for (let j = 1; j < order.length; j++) { const p = ends[order[j - 1][1]], i = order[j][1]; if (ends[i] - p < 18) ends[i] = p + 18; }
    let out = `<svg class="svgchart" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${HUE[hue][1]}"/><stop offset="1" stop-color="${HUE[hue][0]}"/></linearGradient></defs>`;
    out += yTicks.map(t => `<line class="gridline" x1="${pad.l}" x2="${w - pad.r}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${pad.l - 10}" y="${Y(t)}" text-anchor="end" dominant-baseline="middle">${yFmt(t)}</text>`).join('');
    out += xs.map((v, i) => `<text class="ax" x="${X(v)}" y="${h - pad.b + 24}" text-anchor="middle">${xLabels[i]}</text>`).join('');
    [...series].reverse().forEach(s => {
      const si = series.indexOf(s), kvz = s.kind === 'kvz';
      const color = kvz ? `url(#${id})` : s.kind === 'k3s' ? K3S : APPLE, dot = kvz ? HUE[hue][1] : color;
      const d = s.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x)} ${Y(y)}`).join(' ');
      out += `<path class="draw" pathLength="1" d="${d}" fill="none" stroke="${color}" stroke-width="${kvz ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
      s.pts.forEach(([x, y], i) => {
        out += `<g class="pt" style="--i:${i}"><circle cx="${X(x)}" cy="${Y(y)}" r="${kvz ? 6 : 4.5}" fill="${dot}" stroke="#161618" stroke-width="2"/>${s.labels?.[i] ? `<text class="val ${kvz ? 'lead' : ''}" x="${X(x)}" y="${Y(y) - 14}" text-anchor="middle">${s.labels[i]}</text>` : ''}</g>`;
      });
      if (endLabels) {
        const [lx, ly] = s.pts[s.pts.length - 1];
        out += `<text class="pt series ${kvz ? 'lead' : ''}" style="--i:${s.pts.length}" x="${X(lx) + 14}" y="${ends[si]}" dominant-baseline="middle">${kvz ? s.name : `${yFmt(ly)} ${s.name}`}</text>`;
      }
    });
    el.innerHTML = out + '</svg>';
  }
  const three = (kvz, k3s, apple, f) => [
    { n: 'kvz', v: kvz, l: f(kvz), kind: 'kvz' }, { n: 'k3s in Lima', v: k3s, l: k3s == null ? '' : f(k3s), kind: 'k3s' }, { n: 'Apple cluster', v: apple, l: apple == null ? '' : f(apple), kind: 'apple' },
  ];
  const fillOf = (kind, hue, vertical) => kind === 'kvz' ? (vertical ? vgrad(hue) : hgrad(hue)) : kind === 'k3s' ? K3S : APPLE;
  const columns = (bars, hue) => {
    const max = Math.max(...bars.map(b => b.v || 0)) * 1.15;
    return `<div class="cols">${bars.map((b, i) => `<div class="col"><div class="col__track">
      <div class="col__bar" style="--h:${(b.v / max) * 100}%;--c:${fillOf(b.kind, hue, true)};--i:${i}"></div>
      <div class="col__val ${b.kind === 'kvz' ? 'lead' : ''}" style="--h:${(b.v / max) * 100}%;--i:${i}">${b.l}</div></div>
      <div class="col__name">${b.n}</div></div>`).join('')}</div>`;
  };
  const hbars = (bars, hue, max) => bars.map((b, i) => b.v == null ? '' : `<div class="hbar"><span>${b.n}</span><div class="hbar__track">
      <div class="hbar__bar" style="--w:${(b.v / max) * 82}%;--c:${fillOf(b.kind, hue)};--i:${i}"></div>
      <span class="hbar__val ${b.kind === 'kvz' ? 'lead' : ''}" style="--w:${(b.v / max) * 82}%;--i:${i}">${b.l}</span></div></div>`).join('');

  const sec = v => `${v} s`, ms = v => `${v} ms`, k = v => `${(v / 1000).toFixed(1)}k`;

  const pods = $('[data-line="pods"]');
  if (pods) lineChart(pods, {
    w: 680, h: 300, hue: 'yellow', xs: [20, 50, 100], xLabels: ['20 pods', '50 pods', '100 pods'], yTicks: [0, 1, 2, 3, 4, 5], yFmt: sec,
    series: [
      { name: 'kvz', kind: 'kvz', pts: [[20, 0.44], [50, 1.51], [100, 3.66]], labels: ['0.44 s', '1.51 s', '3.66 s'] },
      { name: 'k3s in Lima', kind: 'k3s', pts: [[20, 1.3], [50, 4.48]] },
      { name: 'Apple cluster', kind: 'apple', pts: [[20, 0.88], [50, 4.2]] },
    ],
  });
  const journey = $('[data-line="journey"]');
  if (journey) lineChart(journey, {
    w: 680, h: 280, hue: 'orange', log: true, endLabels: false, xs: [0, 1, 2, 3, 4],
    xLabels: ['Apple container', 'Own microVMs', 'kvz kernel', 'Pod network', 'Tuned queues'],
    yTicks: [0.1, 1, 10], yFmt: sec,
    series: [{ name: 'kvz', kind: 'kvz', pts: [[0, 9.81], [1, 0.77], [2, 0.27], [3, 0.27], [4, 0.25]], labels: ['9.81 s', '0.77 s', '0.27 s', '0.27 s', '0.25 s'] }],
  });
  const one = $('[data-cols="one"]');
  if (one) one.innerHTML = columns(three(99, 421, 859, ms).map(b => ({ ...b, n: b.n.replace(' in Lima', '').replace(' cluster', '') })), 'blue');
  const api = $('[data-api]');
  if (api) api.innerHTML = [
    ['Creates', three(9614, 3200, 7974, k)], ['Gets', three(18950, 9939, 15045, k)],
    ['Get + update', three(5821, 2341, 4737, k)], ['Deletes', three(8077, 2989, 7305, k)],
  ].map(([t, b]) => `<div>${columns(b.map(x => ({ ...x, n: x.kind === 'kvz' ? 'kvz' : x.kind === 'k3s' ? 'k3s' : 'Apple' })), 'green')}<div class="multiple__title">${t}</div></div>`).join('');
  const idle = $('[data-hbars="idle"]');
  if (idle) idle.innerHTML =
    `<div class="group"><div class="group__title">CPU, percent of one core</div>${hbars(three(1.6, 20.1, 26.1, v => `${v}%`), 'blue', 28)}</div>
     <div class="group"><div class="group__title">Memory</div>${hbars(three(257, 3192, 2453, v => v >= 1000 ? `${(v / 1000).toFixed(1)} GB` : `${v} MB`), 'blue', 3300)}</div>`;
  const dots = $('[data-dots]');
  if (dots) dots.innerHTML = [
    ['Create to watch event, p50', [0.4, 0.84, 0.52], 1],
    ['List 2,000 objects, p50', [4.4, 8.5, 7.2], 10],
    ['Create, p99', [13.1, 70.8, 12.8], 80],
  ].map(([label, [kvz, k3s, apple], max]) => `<div class="dotrow"><div class="dotrow__head"><span>${label}</span><b>${kvz} ms</b></div>
    <div class="dotrow__track">
      <i class="dotrow__dot" data-x="${(k3s / max) * 100}%" style="--c:${K3S};--i:1"></i>
      <i class="dotrow__dot dash" data-x="${(apple / max) * 100}%" style="--i:2"></i>
      <i class="dotrow__dot lead" data-x="${(kvz / max) * 100}%" style="--c:${vgrad('violet')};--i:0"></i>
    </div></div>`).join('');

  /* ---------------- counters ---------------- */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), sep = 'sep' in el.dataset;
    const fmt = v => sep ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec);
    if (reduced) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- reveal on scroll ---------------- */
  function activate(el) {
    el.classList.add('in');
    $$('[data-x]', el).forEach(d => { d.style.left = d.dataset.x; });
    $$('.arc[data-to]', el).forEach(a => a.setAttribute('stroke-dashoffset', a.dataset.to));
    $$('[data-count]', el).forEach(count);
    const typer = $('[data-typer]', el); if (typer) type(typer);
    if (el.matches('[data-ascii]')) decode($('pre', el));
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); } }), { threshold: 0.22 });
  $$('.reveal').forEach(el => io.observe(el));
  // hero counters
  $$('.hero [data-count]').forEach(el => setTimeout(() => count(el), 1100));

  /* ---------------- footer ASCII art: decodes left to right ---------------- */
  function decode(pre) {
    if (reduced || pre.dataset.done) return; pre.dataset.done = 1;
    const final = pre.textContent, lines = final.split('\n'), cols = Math.max(...lines.map(l => l.length));
    const noise = '.:-=+*#%@kvz';
    const t0 = performance.now(), dur = 1800, spread = 18;
    const frame = t => {
      const head = ((t - t0) / dur) * (cols + spread);
      pre.textContent = lines.map(l => [...l].map((ch, c) =>
        ch === ' ' || c < head - spread ? ch : c < head ? noise[(Math.random() * noise.length) | 0] : ' ').join('')).join('\n');
      if (head < cols + spread) requestAnimationFrame(frame); else pre.textContent = final;
    };
    requestAnimationFrame(frame);
  }

  /* ---------------- hero: a live kvz session on a loop ---------------- */
  const live = $('[data-live]');
  if (live) {
    const C = (c, t) => `<span class="c-${c}">${t}</span>`, D = t => `<span class="dim">${t}</span>`;
    const pad = (a, n) => a.padEnd(n);
    const row = (name, rt, st, age, col) => `${pad(name, 18)}${pad(rt, 9)}${C(col, pad(st, 9))}${age}`;
    const S = [
      ['cmd', 'kvz server'],
      ['out', D('INFO  etcd 3.7.3 ready, embedded'), 260],
      ['out', D('INFO  kube-apiserver v1.35.10+kvz on :6443'), 260],
      ['out', D('INFO  scheduler and controllers started'), 260],
      ['out', C('green', 'kvz server ready in 1.7s'), 900],
      ['cmd', 'kubectl apply -f demo.yaml'],
      ['out', 'deployment.apps/web created', 120],
      ['out', 'pod/ios-build created', 120],
      ['out', 'pod/macos-ci-0 created', 700],
      ['cmd', 'kubectl get pods -w -o custom-columns-file=runtime.cols'],
      ['out', D(`${pad('NAME', 18)}${pad('RUNTIME', 9)}${pad('STATUS', 9)}AGE`), 200],
      ['out', row('web-7d9f6-2xkqp', 'linux', 'Pending', '0s', 'yellow'), 110],
      ['out', row('ios-build', 'darwin', 'Running', '0s', 'green'), 90],
      ['out', row('web-7d9f6-2xkqp', 'linux', 'Running', '0s', 'green'), 120],
      ['out', row('web-7d9f6-8hz4m', 'linux', 'Running', '0s', 'green'), 120],
      ['out', row('web-7d9f6-qv7tn', 'linux', 'Running', '0s', 'green'), 160],
      ['out', row('macos-ci-0', 'macos', 'Pending', '1s', 'yellow'), 2200],
      ['out', row('macos-ci-0', 'macos', 'Running', '18s', 'green'), 1100],
      ['out', D('^C'), 400],
      ['cmd', 'kubectl scale deploy/web --replicas=20'],
      ['out', 'deployment.apps/web scaled', 700],
      ['cmd', 'kubectl get deploy web'],
      ['out', D('NAME   READY   UP-TO-DATE   AVAILABLE   AGE'), 80],
      ['out', `web    ${C('green', '20/20')}   20           20          22s`, 1300],
      ['cmd', 'kubectl exec macos-ci-0 -- sw_vers'],
      ['out', 'ProductName:      macOS', 80],
      ['out', 'ProductVersion:   26.1', 1300],
      ['cmd', 'kubectl top pods --sort-by=memory'],
      ['out', D('NAME              CPU(cores)   MEMORY(bytes)'), 80],
      ['out', `macos-ci-0        ${C('blue', '412m')}         ${C('blue', '3891Mi')}`, 80],
      ['out', `ios-build         ${C('orange', '3m')}           ${C('orange', '14Mi')}`, 80],
      ['out', `web-7d9f6-2xkqp   ${C('green', '1m')}           ${C('green', '9Mi')}`, 3200],
    ];
    const MAX = 14, wait = ms => new Promise(r => setTimeout(r, ms));
    const add = html => { const d = document.createElement('div'); d.innerHTML = html; live.append(d); while (live.children.length > MAX) live.firstChild.remove(); return d; };
    const prompt = `<span class="dim">~ ❯</span> `;
    if (reduced) {
      S.slice(-MAX).forEach(([k, t]) => add(k === 'cmd' ? prompt + t : t));
    } else (async () => {
      await wait(1300);
      for (;;) {
        for (const [kind, text, delay] of S) {
          if (kind === 'cmd') {
            const d = add(prompt), caret = document.createElement('span'); caret.className = 'caret'; d.append(caret);
            await wait(500);
            for (const ch of text) { caret.before(ch); await wait(22 + Math.random() * 38); }
            await wait(260); caret.remove();
          } else { add(text); await wait(delay); }
        }
        live.replaceChildren();
      }
    })();
  }

  /* ---------------- typing terminal ---------------- */
  async function type(body) {
    if (body.dataset.done) return; body.dataset.done = 1;
    const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
    const caret = document.createElement('span'); caret.className = 'caret';
    for (const line of $$('.tline', body)) {
      if (line.dataset.cmd) {
        line.append(caret);
        for (const ch of line.dataset.cmd) { caret.before(ch); await wait(28 + Math.random() * 40); }
        await wait(380);
      } else {
        line.textContent = line.dataset.out; await wait(140);
      }
    }
    const last = document.createElement('div'); last.className = 'tline'; last.append(caret); body.append(last);
  }

  /* ---------------- runtimes: pinned section ---------------- */
  const rt = $('.rt');
  const RT = [
    { big: '100', unit: 'ms', cap: 'to boot a Linux pod VM, cold', h: ['#5cea94', '#14b85a'] },
    { big: '18', unit: 's', cap: 'for a macOS VM pod to accept SSH', h: ['#5fb0ff', '#1f6fff'] },
    { big: '46', unit: 'ms', cap: 'for a native macOS process pod', h: ['#ffa133', '#ff6a00'] },
    { big: '0.7', unit: 's', cap: 'through Apple’s container tool', h: ['#b48cff', '#7a45f5'] },
  ];
  let cur = -1;
  function setStep(i) {
    if (i === cur) return; cur = i;
    $$('.rt__steps li', rt).forEach((li, j) => li.classList.toggle('active', j === i));
    $$('.trow4[data-row]', rt).forEach((r, j) => { r.classList.toggle('on', j <= i); r.classList.toggle('active', j === i); r.style.setProperty('--h1', RT[j].h[0]); });
    const big = $('[data-rt-big]', rt), d = RT[i];
    big.innerHTML = `${d.big}<span class="unit">${d.unit}</span>`;
    big.style.setProperty('--h1', d.h[0]); big.style.setProperty('--h2', d.h[1]);
    big.classList.remove('swap'); void big.offsetWidth; big.classList.add('swap');
    $('[data-rt-cap]', rt).textContent = d.cap;
  }
  function onScroll() {
    $('.nav').classList.toggle('scrolled', scrollY > 10);
    if (rt) {
      const r = rt.getBoundingClientRect(), span = r.height - innerHeight;
      const p = span > 0 ? Math.min(.999, Math.max(0, -r.top / span)) : 0;
      setStep(Math.floor(p * RT.length));
    }
    // highlight the nav link for the section in view
    let active = null;
    for (const id of ['features', 'runtimes', 'benchmarks', 'install']) { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) active = id; }
    $$('.nav__links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${active}`));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- copy install command ---------------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch {}
    const c = $('.install__copy', b); b.classList.add('copied'); c.textContent = 'Copied';
    setTimeout(() => { b.classList.remove('copied'); c.textContent = 'Copy'; }, 1600);
  }));

  /* ---------------- liquid glass (Chromium; others keep the blur) ----------------
     Displacement filter ported from nikdelvin/liquid-glass (MIT, © Nik Delvin). */
  const chromium = !!window.chrome && !/Safari\/(?!.*Chrome)/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent);
  function glassFilter(width, height, radius = 14, depth = 10, strength = 90, ca = 2) {
    const map = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><style>.mix{mix-blend-mode:screen}</style><defs>
      <linearGradient id="Y" x1="0" x2="0" y1="${Math.ceil((radius / height) * 15)}%" y2="${Math.floor(100 - (radius / height) * 15)}%"><stop offset="0%" stop-color="#0F0"/><stop offset="100%" stop-color="#000"/></linearGradient>
      <linearGradient id="X" x1="${Math.ceil((radius / width) * 15)}%" x2="${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0"><stop offset="0%" stop-color="#F00"/><stop offset="100%" stop-color="#000"/></linearGradient></defs>
      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080"/><g filter="blur(2px)"><rect x="0" y="0" height="${height}" width="${width}" fill="#000080"/>
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix"/><rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix"/>
      <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)"/></g></svg>`);
    const pass = (s, m, r) => `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${m}" result="${r}"/>`;
    const f = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="displace" color-interpolation-filters="sRGB">
      <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="map"/>
      ${pass(strength + ca * 2, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r')}${pass(strength + ca, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g')}${pass(strength, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b')}
      <feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/></filter></defs></svg>`) + '#displace';
    return `blur(1px) url("${f}") blur(2px) brightness(1.1) saturate(1.5)`;
  }
  function applyGlass() {
    if (!chromium) return;
    $$('[data-glass]').forEach(el => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const v = glassFilter(Math.round(width), Math.round(height));
      el.style.backdropFilter = v; el.style.webkitBackdropFilter = v;
    });
  }
  applyGlass();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(applyGlass, 200); });
})();
