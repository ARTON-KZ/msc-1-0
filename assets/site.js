/* ======================================================================
   CONFIG: fill these in when the organisers confirm.
   WHATSAPP: organiser number, international format, digits only
   (e.g. "2348012345678"). When set, registrants get a "Send on WhatsApp" button.
   ENDPOINT: URL that accepts a JSON POST of each registration (Railway backend).
   ====================================================================== */
const CONFIG = { WHATSAPP: "", ENDPOINT: "" };

/* Draft list until the organisers send the final fields. */
const SKILLS = [
  ['Digital skills and AI tools', 'For your first job or your own work', 'Use a computer with confidence, work in Google Docs and Sheets, and learn to use AI tools for writing, research and planning.'],
  ['Graphic design', 'Flyers, logos and brand work people pay for', 'Learn Canva and the basics of layout, colour and type, then design a flyer for a real small business before you leave.'],
  ['Web and app development', 'Build things on the internet', 'Understand how websites and apps are made, build a simple page yourself and see the path to paid work.'],
  ['Photography, video and content', 'Tell stories with the phone in your pocket', 'Shoot and edit good photos and short videos on a phone, and learn what makes people stop scrolling.'],
  ['Fashion design and tailoring', 'From measurement to finished piece', 'Take measurements, cut patterns and learn how tailors in Yenagoa find and keep customers.'],
  ['Catering and pastry', 'Small chops, cakes and events', 'Learn recipes that sell, food safety, costing and how to price for events.'],
  ['Fish farming and agribusiness', 'Turn Bayelsa water into a business', 'Pond and tank fish farming, feed, harvest and selling, from people already doing it here.'],
  ['Phone and electronics repair', 'A skill every street needs', 'Diagnose common phone faults, replace screens and batteries, and set up a repair stand.'],
  ['Hair, barbing and makeup', 'Beauty work with steady customers', 'Core techniques, hygiene and how to build a client list through Instagram and WhatsApp.'],
  ['Social media marketing', 'Help businesses sell online', 'Run a business page, plan posts, run simple ads and get paid to manage pages for others.'],
];
const LGAS = ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa', 'Outside Bayelsa'];
const registerUrl = field => 'register.html?field=' + encodeURIComponent(field);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- HAPTICS ----------------
   Android: Vibration API. iOS Safari (17.4+): toggling a <input switch>
   gives the system haptic tick. Both only fire inside a user gesture. */
const hx = document.createElement('label');
hx.id = 'hx'; hx.setAttribute('aria-hidden', 'true'); hx.innerHTML = '<input type="checkbox" switch tabindex="-1">';
document.body.appendChild(hx);
const PATTERNS = { tap: 8, select: 14, success: [14, 70, 28], error: [28, 50, 28] };
function haptic(kind = 'tap') {
  try {
    if (navigator.vibrate) { navigator.vibrate(PATTERNS[kind] || 8); return; }
    hx.click();
    if (kind === 'success' || kind === 'error') setTimeout(() => hx.click(), 90);
  } catch (e) {}
}
document.addEventListener('click', e => { const t = e.target.closest('[data-h]'); if (t) haptic(t.dataset.h); });

/* ---------------- CREEK SHADER ----------------
   Contour lines of a slowly flowing noise field: Bayelsa water, and the folds
   of a mind. Lines near the pointer lift and turn red. */
(function creek() {
  const canvas = $('.creek'); if (!canvas) return;
  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl) { canvas.style.background = 'radial-gradient(90% 70% at 70% 30%,#0A4A26,#03200F)'; return; }
  const vs = `#version 300 es
  in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const fs = `#version 300 es
  precision highp float;
  uniform vec2 R; uniform float T; uniform vec2 M; uniform float E;
  out vec4 o;
  vec2 h(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.+2.*fract(sin(p)*43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
    return mix(mix(dot(h(i),f), dot(h(i+vec2(1,0)),f-vec2(1,0)),u.x),
               mix(dot(h(i+vec2(0,1)),f-vec2(0,1)), dot(h(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
  float fbm(vec2 p){ float a=.5, s=0.; for(int k=0;k<4;k++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
  void main(){
    vec2 uv = gl_FragCoord.xy / R; float asp = R.x/R.y;
    vec2 p = vec2(uv.x*asp, uv.y) * 1.6;
    float t = T*.035;
    vec2 q = vec2(fbm(p + vec2(t, -t*.6)), fbm(p + vec2(5.2, 1.3) - t*.4));
    float v = fbm(p + 1.6*q + vec2(t*.5, 0.));
    vec2 m = vec2(M.x*asp, M.y) * 1.6;
    float d = distance(p, m);
    v += exp(-d*d*3.2) * E * .22;
    float k = v*15.;
    float w = fwidth(k);
    float line = smoothstep(.0, 1., 1. - abs(fract(k) - .5) * 2. / max(w*1.6, .001));
    float band = step(.86, fract(floor(k)/7.));
    vec3 base = mix(vec3(.012,.125,.06), vec3(.02,.2,.1), smoothstep(-.3,.5,v) * (1.-uv.y*.5));
    vec3 green = vec3(.09,.46,.24);
    vec3 red = vec3(.88,.15,.18);
    float glow = exp(-d*d*4.5) * E;
    vec3 lc = mix(green + band*.08, red, clamp(glow*1.8, 0., 1.));
    float a = line * (.42 + band*.35 + glow*1.1);
    vec3 col = base + lc * a;
    col *= .82 + .18*smoothstep(0., .6, uv.y);
    o = vec4(col, 1.);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; }
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uM = gl.getUniformLocation(pr, 'M'), uE = gl.getUniformLocation(pr, 'E');

  // Soft background lines: 75% of CSS resolution is plenty and ~4x cheaper on phones.
  const dpr = Math.min(devicePixelRatio || 1, 1) * .75;
  function size() { const r = canvas.getBoundingClientRect(); canvas.width = Math.round(r.width*dpr); canvas.height = Math.round(r.height*dpr); gl.viewport(0,0,canvas.width,canvas.height); }
  size(); addEventListener('resize', size);

  // the lift follows your finger on a spring, so it trails like water
  const target = { x: .72, y: .58, e: .8 }, cur = { x: .72, y: .58, e: 0 }, vel = { x: 0, y: 0 };
  let lastMove = 0;
  const hero = canvas.parentElement;
  function point(e) { const r = canvas.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e;
    target.x = (pt.clientX - r.left) / r.width; target.y = 1 - (pt.clientY - r.top) / r.height; target.e = 1; lastMove = performance.now(); }
  hero.addEventListener('pointermove', point, { passive: true });
  hero.addEventListener('touchmove', point, { passive: true });
  hero.addEventListener('pointerdown', e => { point(e); if (e.pointerType === 'touch') haptic('tap'); }, { passive: true });

  let visible = true, t0 = performance.now(), last = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(hero);
  function loop(now) {
    if (!visible) return;
    if (now - last < 32) { requestAnimationFrame(loop); return; } // ~30fps is enough for water
    last = now;
    if (now - lastMove > 2600) { // drift by itself when nobody is touching
      const s = now * .00012; target.x = .62 + Math.cos(s*2.1)*.22; target.y = .55 + Math.sin(s*1.7)*.2; target.e = .8;
    }
    for (const k of ['x','y']) { vel[k] += (target[k]-cur[k]) * .045; vel[k] *= .82; cur[k] += vel[k]; }
    cur.e += (target.e - cur.e) * .06;
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, reduce ? 12 : (now - t0) / 1000);
    gl.uniform2f(uM, cur.x, cur.y); gl.uniform1f(uE, cur.e);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------------- MOBILE MENU ---------------- */
(function menu() {
  const btn = $('.menu-btn'), sheet = $('.sheet'); if (!btn || !sheet) return;
  const close = $('.sheet-close', sheet);
  const set = open => {
    sheet.classList.toggle('open', open); document.body.classList.toggle('locked', open);
    btn.setAttribute('aria-expanded', open); sheet.setAttribute('aria-hidden', !open); sheet.inert = !open;
    haptic('tap');
    if (open) $('nav a', sheet).focus({ preventScroll: true }); else btn.focus({ preventScroll: true });
  };
  sheet.inert = true;
  btn.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('open')) set(false); });
})();

/* ---------------- HEAD TYPE: the shift ---------------- */
(function headType() {
  const w1 = $('.shift .w1'), w2 = $('.shift .w2'); if (!w1) return;
  [w1, w2].forEach(el => { el.innerHTML = [...el.textContent].map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join(''); });
  if (typeof gsap === 'undefined' || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  const home = !!$('.hero.home');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.presents', { opacity: 0, y: 10, duration: .8 })
    .from(w1.children, { yPercent: 105, opacity: 0, duration: 1.1, stagger: home ? .05 : .03 }, .05)
    // the second line arrives lined up under the first, then slides out to its shifted place
    .from(w2, { x: () => -w2.getBoundingClientRect().width * .14, duration: 1.4, ease: 'elastic.out(1, .75)' }, .5)
    .from(w2.children, { yPercent: 105, opacity: 0, duration: 1, stagger: home ? .05 : .03 }, .25)
    .from('.tagline-row > *, .page-lede', { opacity: 0, y: 14, duration: .8, stagger: .08 }, .85)
    .from('.hero-actions > *', { opacity: 0, y: 14, duration: .8, stagger: .08 }, 1)
    .from('.facts > div', { opacity: 0, duration: .8, stagger: .08 }, 1.15);
  // On scroll the two lines keep shifting apart.
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 };
  gsap.to(w1, { xPercent: -14, ease: 'none', scrollTrigger: st });
  gsap.to(w2, { xPercent: 10, ease: 'none', scrollTrigger: { ...st } });
})();

/* ---------------- HOME: field dial ----------------
   A picker wheel: the centred field is full size and selected; the rest tilt
   away like a drum. Snaps with a haptic tick per field. */
(function dial() {
  const track = $('#dial'); if (!track) return;
  const info = $('#dial-info'), tag = $('.tag', info), body = $('.dial-swap p:last-child', info), go = $('.btn', info), swap = $('.dial-swap', info);
  track.innerHTML = SKILLS.map(([n], i) => `<li class="dial-item" id="dial-${i}" role="option" aria-selected="false">${n}</li>`).join('');
  const items = $$('.dial-item', track);
  let cur = -1, raf = 0, swapT = 0, touched = false;
  function show(i) {
    const [n, t, b] = SKILLS[i];
    go.href = registerUrl(n); go.firstChild.textContent = "Register for this field ";
    if (reduce) { tag.textContent = t; body.textContent = b; return; }
    swap.classList.add('out'); clearTimeout(swapT);
    swapT = setTimeout(() => { tag.textContent = t; body.textContent = b; swap.classList.remove('out'); }, 180);
  }
  function paint() {
    raf = 0;
    const mid = track.scrollTop + track.clientHeight / 2;
    let best = 0, bestD = 1e9;
    items.forEach((el, i) => {
      const d = (el.offsetTop + el.offsetHeight / 2 - mid) / el.offsetHeight; // distance in rows
      const a = Math.min(Math.abs(d), 3.2);
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      el.style.transform = reduce ? '' : `rotateX(${(-d * 16).toFixed(2)}deg) scale(${(1 - a * .13).toFixed(3)})`;
      el.style.opacity = (1 - a * .27).toFixed(3);
    });
    if (best !== cur) {
      if (cur >= 0) { items[cur].classList.remove('on'); items[cur].setAttribute('aria-selected', 'false'); if (touched) haptic('tap'); }
      cur = best; items[cur].classList.add('on'); items[cur].setAttribute('aria-selected', 'true');
      track.setAttribute('aria-activedescendant', items[cur].id); show(cur);
    }
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
  const to = i => { i = Math.max(0, Math.min(items.length - 1, i));
    track.scrollTo({ top: items[i].offsetTop + items[i].offsetHeight / 2 - track.clientHeight / 2, behavior: reduce ? 'auto' : 'smooth' }); };
  track.addEventListener('scroll', req, { passive: true });
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(ev => track.addEventListener(ev, () => { touched = true; }, { passive: true }));
  track.addEventListener('click', e => { const it = e.target.closest('.dial-item'); if (it) to(items.indexOf(it)); });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); to(cur + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); to(cur - 1); }
    if (e.key === 'Enter') location.href = registerUrl(SKILLS[cur][0]);
  });
  addEventListener('resize', req);
  // open on Fashion, the field Kenneth used as his example
  requestAnimationFrame(() => { const i = SKILLS.findIndex(s => s[0].startsWith('Fashion'));
    track.scrollTop = items[i].offsetTop + items[i].offsetHeight / 2 - track.clientHeight / 2; paint(); });
})();

/* ---------------- FIELDS list ---------------- */
(function fields() {
  const el = $('#tracks'); if (!el) return;
  el.innerHTML = SKILLS.map(([n, tag, body], i) => `
    <li class="track" data-open="false">
      <button class="track-btn" type="button" aria-expanded="false" aria-controls="tp${i}" id="tb${i}">
        <span><span class="track-name">${n}</span><span class="track-tag">${tag}</span></span>
        <span class="plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
      </button>
      <div class="track-panel" id="tp${i}" role="region" aria-labelledby="tb${i}"><div><div class="track-inner">
        <p>${body}</p>
        <a class="btn pick" href="${registerUrl(n)}" data-h="select">Register for this field</a>
      </div></div></div>
    </li>`).join('');
  el.addEventListener('click', e => {
    const b = e.target.closest('.track-btn'); if (!b) return;
    const li = b.parentElement, open = li.dataset.open !== 'true';
    $$('.track[data-open="true"]', el).forEach(x => { if (x !== li) { x.dataset.open = 'false'; $('.track-btn', x).setAttribute('aria-expanded', 'false'); } });
    li.dataset.open = open; b.setAttribute('aria-expanded', open); haptic('tap');
  });
})();

/* ---------------- NYC counters ---------------- */
(function counters() {
  const els = $$('[data-count]'); if (!els.length || reduce) return;
  const fmt = (v, f) => f === 'm' ? (v >= 995000 ? '1M' : Math.round(v / 1000) + 'K') : Math.round(v);
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, f = el.dataset.fmt, t0 = performance.now(), dur = 1400;
    (function step(now) { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * e, f); if (p < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: .6 });
  els.forEach(el => io.observe(el));
})();

/* ---------------- REGISTRATION CHAT ---------------- */
(function chat() {
  const desk = $('#desk'); if (!desk) return;
  const log = $('#log'), chips = $('#chips'), form = $('#composer'), field = $('#field'), hint = $('#hint');
  const fromUrl = new URLSearchParams(location.search).get('field');
  let pre = SKILLS.some(s => s[0] === fromUrl) ? fromUrl : null;
  let data = {}, step = 0, busy = false, session = 0;

  const first = n => (n || '').trim().split(/\s+/)[0];
  const STEPS = [
    { key: 'skill', when: d => !d.skill, ask: () => ['Welcome to the Mind Shift Conference 1.0 registration desk.', 'Which field do you want to register for?'],
      options: () => SKILLS.map(s => s[0]) },
    { key: 'name', ask: d => [d.fromPick ? `Welcome. You are registering for ${d.skill}.` : `Good choice. ${d.skill} it is.`, 'Tell us about yourself. What is your full name?'],
      input: { type: 'text', autocomplete: 'name', placeholder: 'e.g. Ebiere Tonye' },
      check: v => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 4 ? null : 'Please type your first name and surname.' },
    { key: 'phone', ask: d => [`Nice to meet you, ${first(d.name)}.`, 'What is your WhatsApp number? The organisers will use it to reach you.'],
      input: { type: 'tel', autocomplete: 'tel', inputmode: 'tel', placeholder: '0803 000 0000' },
      check: v => /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/[\s-]/g, '')) ? null : 'That number looks incomplete. Use 11 digits, like 08031234567.' },
    { key: 'email', ask: () => ['Do you have an email address? You can skip this.'],
      input: { type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'you@example.com' }, skip: 'Skip',
      check: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Check the email address, or tap Skip.' },
    { key: 'age', ask: () => ['How old are you?'], options: ['Under 18', '18 to 24', '25 to 30', '31 to 35', 'Over 35'] },
    { key: 'lga', ask: () => ['Which local government area do you live in?'], options: LGAS },
    { key: 'level', ask: d => [`How much do you already know about ${d.skill.toLowerCase()}?`], options: ['Nothing yet', 'A little', 'I already earn from it'] },
    { key: 'why', ask: () => ['Last question. In one sentence, what do you want this field to do for you?'],
      input: { type: 'text', placeholder: 'e.g. Start my own small business' }, skip: 'Skip',
      check: v => v.trim().length >= 3 ? null : 'Write a few words, or tap Skip.' },
  ];
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });

  function bubble(text, who = 'bot') { const el = document.createElement('div'); el.className = 'msg ' + who; el.textContent = text; log.appendChild(el); scroll(); return el; }
  async function say(lines) {
    const my = session;
    for (const line of lines) {
      if (my !== session) return false;
      const t = document.createElement('div'); t.className = 'msg bot typing'; t.innerHTML = '<i></i><i></i><i></i>'; t.setAttribute('aria-label', 'typing');
      log.appendChild(t); scroll(); await wait(Math.min(900, 380 + line.length * 9)); t.remove();
      if (my !== session) return false;
      bubble(line); await wait(120);
    }
    return my === session;
  }
  function clearDock() { chips.innerHTML = ''; form.hidden = true; hint.textContent = ''; field.removeAttribute('aria-invalid'); }
  function chip(label, onTap, primary) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (primary ? ' primary' : ''); b.textContent = label;
    b.style.animationDelay = chips.children.length * 35 + 'ms';
    b.addEventListener('click', () => { if (!busy) onTap(); }); chips.appendChild(b); return b;
  }
  async function ask() {
    busy = true; clearDock();
    while (STEPS[step].when && !STEPS[step].when(data)) step++;
    const s = STEPS[step];
    if (!(await say(s.ask(data)))) return;
    busy = false;
    if (s.options) s.options(data).forEach(o => chip(o, () => answer(o)));
    if (s.input) {
      form.hidden = false; field.value = ''; field.type = s.input.type; field.placeholder = s.input.placeholder || '';
      field.autocomplete = s.input.autocomplete || 'off'; field.inputMode = s.input.inputmode || 'text';
      if (s.skip) chip(s.skip, () => answer('', true));
      if (matchMedia('(pointer:fine)').matches) field.focus({ preventScroll: true });
    }
  }
  STEPS.forEach(s => { if (Array.isArray(s.options)) { const o = s.options; s.options = () => o; } });
  function answer(value, skipped) {
    const s = STEPS[step];
    haptic('select');
    bubble(skipped ? 'Skip' : value, 'me');
    data[s.key] = skipped ? '' : value.trim();
    clearDock(); step++;
    if (step < STEPS.length) ask(); else review();
  }
  form.addEventListener('submit', e => {
    e.preventDefault(); if (busy) return;
    const s = STEPS[step], v = field.value, err = s.check ? s.check(v) : null;
    if (err) { hint.textContent = err; field.setAttribute('aria-invalid', 'true'); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); haptic('error'); return; }
    answer(v);
  });
  field.addEventListener('input', () => { if (hint.textContent) { hint.textContent = ''; field.removeAttribute('aria-invalid'); } });

  async function review() {
    busy = true; if (!(await say(['Here is your registration. Check it before you send it.']))) return;
    const rows = [['Name', data.name], ['WhatsApp', data.phone], ['Email', data.email || 'Not given'], ['Age', data.age], ['LGA', data.lga], ['Field', data.skill], ['Level', data.level], ['Goal', data.why || 'Not given']];
    const card = document.createElement('div'); card.className = 'summary';
    card.innerHTML = '<dl>' + rows.map(() => '<dt></dt><dd></dd>').join('') + '</dl>';
    $$('dt', card).forEach((x, i) => x.textContent = rows[i][0]);
    $$('dd', card).forEach((x, i) => x.textContent = rows[i][1]);
    log.appendChild(card); scroll(); busy = false;
    chip('Send registration', submit, true);
    chip('Start over', restart);
  }
  async function submit() {
    busy = true; clearDock(); haptic('tap');
    const ref = 'MSC-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const record = { ...data, ref, at: new Date().toISOString() }; delete record.fromPick;
    try { const all = JSON.parse(localStorage.getItem('msc-apps') || '[]'); all.push(record); localStorage.setItem('msc-apps', JSON.stringify(all)); } catch (e) {}
    let sent = !CONFIG.ENDPOINT;
    if (CONFIG.ENDPOINT) { try { const r = await fetch(CONFIG.ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) }); sent = r.ok; } catch (e) { sent = false; } }
    if (!sent) { haptic('error'); await say(['Your registration did not go through. Check your internet connection, then tap Send again.']); busy = false; chip('Send again', submit, true); return; }
    haptic('success');
    const t = document.createElement('div'); t.className = 'ticket';
    t.innerHTML = '<small>Registration received</small><div class="ref"></div><p></p>';
    $('.ref', t).textContent = ref;
    $('p', t).textContent = `${first(data.name)}, you registered for ${data.skill}. Screenshot this reference. The organisers will message you on WhatsApp with the date and venue.`;
    log.appendChild(t); scroll();
    if (CONFIG.WHATSAPP) {
      const text = encodeURIComponent(`MSC 1.0 registration ${ref}\nName: ${data.name}\nWhatsApp: ${data.phone}\nLGA: ${data.lga}\nField: ${data.skill} (${data.level})`);
      chip('Also send on WhatsApp', () => open(`https://wa.me/${CONFIG.WHATSAPP}?text=${text}`, '_blank', 'noopener'), true);
    }
    chip('Register someone else', restart);
    busy = false;
  }
  function fresh() { session++; busy = false; log.innerHTML = ''; step = 0; data = pre ? { skill: pre, fromPick: true } : {}; ask(); }
  function restart() { haptic('tap'); pre = null; history.replaceState(null, '', location.pathname); fresh(); }
  $('#restart').addEventListener('click', restart);
  fresh();
})();

/* ---------------- floating register pill ---------------- */
(function floatPill() {
  const f = $('#float'), hero = $('.hero'); if (!f || !hero) return;
  const stop = $('footer');
  let pastHero = false, atEnd = false;
  const upd = () => f.classList.toggle('on', pastHero && !atEnd);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
  if (stop) new IntersectionObserver(([e]) => { atEnd = e.isIntersecting; upd(); }).observe(stop);
})();
