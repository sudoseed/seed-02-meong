/* =========================================================
   멍때림 측정기 · MEONG-O-METER v1.0
   SEED #02 · SUDO SEED — 외부 서버 없이 브라우저에서만 동작합니다.
   ========================================================= */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reduceMotion = () => !!(motionQuery && motionQuery.matches);

  const SITE_URL = 'https://sudoseed.github.io/seed-02-meong/';
  const STORE_KEY = 'sudoseed.meong.best';
  const GRACE_MS = 1000;       // 시작 직후 손 떨림 유예
  const COMMENT_MS = 10000;    // 실황 멘트 간격
  const COUNT_STEP_MS = 850;

  // ---------- 데이터 ----------
  const RULES = [
    '측정 중에는 마우스, 키보드, 터치, 스크롤을 일절 금합니다.',
    '생각은 허용됩니다. 단, 티 내지 마십시오.',
    '피험자는 준비되면 아래 버튼을 누르십시오.',
  ];

  // until: 이 초 '미만'까지 해당 등급
  const GRADES = [
    { until: 5, name: '멍 입문자', review: '멍의 문턱에서 발이 걸렸습니다. 아무것도 안 하는 것도 재능이며, 그 재능은 아직 잠들어 있습니다.' },
    { until: 15, name: '멍 1단', review: '가능성은 보입니다. 다만 현생이 아직 피험자의 소매를 강하게 붙잡고 있습니다.' },
    { until: 30, name: '멍 2단', review: '눈의 초점이 풀리기 시작했습니다. 심사위원회는 이 조용한 성장을 주목하고 있습니다.' },
    { until: 60, name: '멍 3단', review: '1분의 벽 앞까지 도달했습니다. 평소 회의 시간에 꾸준히 수련해 온 흔적이 역력합니다.' },
    { until: 120, name: '멍 사범', review: '타인에게 멍을 가르칠 자격이 인정됩니다. 단, 가르치려고 입을 여는 순간 실격입니다.' },
    { until: 300, name: '인간 화분', review: '광합성 외의 활동이 관측되지 않았습니다. 물을 주고 싶다는 민원이 다수 접수되었습니다.' },
    { until: Infinity, name: '해탈', review: '심사위원회는 더 이상 피험자를 측정할 수 없습니다. 측정기가 피험자를 존경하기 시작했습니다.' },
  ];

  const START_LINE = '측정을 시작합니다. 지금부터 아무것도 하지 마십시오.';
  const COMMENTS = [
    '피험자, 현재 창밖을 보는 중으로 추정됩니다.',
    '점심 메뉴 생각이 감지되었으나 경미합니다.',
    '업계 평균을 넘어섰습니다. 현장이 술렁입니다.',
    '피험자의 눈꺼풀 하강 속도가 안정권에 진입했습니다.',
    '심사위원 한 명이 덩달아 멍을 때리기 시작했습니다.',
    '현재 피험자의 생산성은 0으로, 매우 이상적인 수치입니다.',
    '영혼이 잠시 편의점에 다녀오겠다고 알려 왔습니다.',
    '주변 소음에도 피험자는 흔들리지 않습니다. 놀라운 무반응입니다.',
    '어제 했던 말실수 회상이 감지되었습니다. 감점 요인은 아닙니다.',
    '피험자의 뇌가 절전 모드로 전환되었다는 보고입니다.',
    '피험자는 아무 생각도 하지 않는 척을 매우 잘하고 있습니다.',
    '관중석에서 숨죽이는 소리가 들립니다. 물론 관중은 없습니다.',
    '알림이 울려도 동요하지 마십시오. 이것은 실전입니다.',
    '‘내가 지금 뭐 하고 있지’라는 생각이 감지되었습니다. 정상 반응입니다.',
    '피험자의 존재감이 실내 가구 수준으로 낮아졌습니다.',
    '멍때림 연맹 관계자가 조용히 기록지를 넘기고 있습니다.',
    '현재 페이스라면 화분 등급도 기대해 볼 만합니다.',
    '피험자, 방금 눈을 깜빡였습니다. 깜빡임은 허용됩니다.',
    '주말 계획 수립 시도가 포착되었으나 스스로 포기했습니다.',
    '현장 기온 변화 없음. 피험자 변화 없음. 아주 좋습니다.',
    '심사위원회는 지금 이 순간을 ‘고요의 정석’으로 기록합니다.',
    '피험자의 손가락이 마우스를 그리워하는 정황이 있습니다. 참으십시오.',
    '국제 멍때림 표준 위원회(가칭)가 본 측정을 주시하고 있습니다.',
    '피험자의 시선이 한 점에 고정되었습니다. 그 점에는 아무 의미가 없습니다.',
    '현 시각 피험자가 이룬 것: 없음. 매우 훌륭합니다.',
    '해설진도 말을 아끼겠습니다. 이 고요를 방해할 수 없습니다.',
  ];

  // ---------- 실격 사유 ----------
  const IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
  const ARROWS = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
  const SHORTCUT_NOTES = {
    A: '모든 것을 선택하려 함', C: '무언가를 복사하려 함', F: '무언가를 찾으려 함', S: '저장 강박',
    T: '새 탭으로 도피 시도', V: '붙여넣기 욕구', W: '창 닫기 시도', Q: '창 닫기 시도', Z: '되돌리기 욕구',
  };
  const REASON = {
    touch: { short: '화면 터치', detail: '화면 터치', note: '손가락의 반란' },
    pen: { short: '펜 터치', detail: '펜 터치', note: '필기 욕구' },
    scroll: { short: '스크롤', detail: '화면 스크롤', note: '아래에 뭐가 있나 궁금함' },
    tab: { short: '탭 이탈', detail: '탭 이탈', note: '현생 복귀 시도' },
    window: { short: '창 이탈', detail: '창 이탈', note: '다른 창으로 도피' },
  };

  function moveReason(dist, pointerType) {
    const px = Math.max(1, Math.round(dist));
    if (pointerType === 'pen') return { short: '펜 이동', detail: `펜 ${px}px 이동`, note: '필기 욕구' };
    const note = px <= 3 ? '피험자의 욕심'
      : px <= 20 ? '무의식적 탐험'
      : px <= 100 ? '커서에 대한 미련'
      : '명백한 현생 복귀 의지';
    return { short: '마우스 이동', detail: `마우스 ${px}px 이동`, note };
  }

  function buttonReason(button) {
    const R = (detail, note) => ({ short: '마우스 클릭', detail, note });
    switch (button) {
      case 0: return R('마우스 왼쪽 클릭', '무언가를 하고 싶은 충동');
      case 1: return R('마우스 휠 클릭', '아무도 모르는 버튼 사용');
      case 2: return R('마우스 오른쪽 클릭', '메뉴에 대한 호기심');
      case 3:
      case 4: return R('마우스 옆 버튼 클릭', '뒤로 가려는 시도');
      default: return R('마우스 버튼 클릭', '정체불명의 버튼 사용');
    }
  }

  function wheelReason(e) {
    const R = (detail, note) => ({ short: '휠 스크롤', detail, note });
    if (e.ctrlKey) return R('화면 확대 시도', '현실을 자세히 보려 함');
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return R('가로 스크롤', '옆길로 새려는 시도');
    if (e.deltaY < 0) return R('마우스 휠 위로 굴림', '지나간 과거를 돌아봄');
    return R('마우스 휠 아래로 굴림', '피드를 내리던 습관 재발');
  }

  // 한글 입력기가 켜져 있으면 key가 'Process'로 오므로 code로 되짚는다
  function keyName(e) {
    let k = e.key;
    if (!k || k === 'Process' || k === 'Unidentified' || k === 'Dead') {
      const c = e.code || '';
      if (/^Key[A-Z]$/.test(c)) k = c.slice(3);
      else if (/^Digit\d$/.test(c)) k = c.slice(5);
      else if (c === 'Space') k = ' ';
      else k = c || '정체불명';
    }
    return k;
  }

  function keyReason(e) {
    const R = (label, note) => ({ short: '키보드 입력', detail: `${label} 입력`, note });
    const k = keyName(e);
    const mod = e.ctrlKey || e.metaKey;
    if (k === 'F5' || (mod && /^r$/i.test(k))) return R('새로고침 키', '인생 리셋 욕구');
    if (mod && /^[a-z]$/i.test(k)) {
      const L = k.toUpperCase();
      return R(`${e.metaKey ? '⌘' : 'Ctrl'}+${L}`, SHORTCUT_NOTES[L] || '단축키 습관 발현');
    }
    if (ARROWS[k]) return R(`방향키 ${ARROWS[k]}`, '방향성 회복 시도');
    if (k === 'HangulMode' || e.code === 'Lang1') return R('한/영 키', '정체성 혼란');
    switch (k) {
      case 'Escape': return R('ESC 키', '탈출 시도');
      case ' ':
      case 'Spacebar': return R('스페이스바', '공허를 채우려는 시도');
      case 'Enter': return R('엔터 키', '무언가를 확정하려는 의지');
      case 'Backspace': return R('백스페이스', '과거를 지우려는 시도');
      case 'Delete': return R('Delete 키', '존재를 지우려는 시도');
      case 'Tab': return R('Tab 키', '다음 할 일로 넘어가려는 시도');
      case 'Shift': return R('Shift 키', '태세 전환 시도');
      case 'Control': return R('Ctrl 키', '통제 욕구 표출');
      case 'Alt': return R(IS_MAC ? 'Option 키' : 'Alt 키', '도주 준비 정황');
      case 'Meta':
      case 'OS': return R(IS_MAC ? '⌘ 키' : '윈도우 키', '외부 세계 탐색');
      case 'CapsLock': return R('Caps Lock', '목소리를 키우려는 시도');
      case 'HanjaMode': return R('한자 키', '고전에 대한 갈망');
      case 'F12': return R('F12 키', '측정기 내부 염탐 시도');
      case 'AudioVolumeUp':
      case 'AudioVolumeDown':
      case 'AudioVolumeMute': return R('볼륨 키', '세상의 소리에 대한 미련');
    }
    if (/^F\d{1,2}$/.test(k)) return R(`${k} 키`, '기능에 대한 미련');
    if (/^[a-z]$/i.test(k)) return R(`‘${k.toUpperCase()}’ 키`, '타자 본능');
    if (/^\d$/.test(k)) return R(`숫자 ${k} 키`, '계산 본능');
    if (/^[ㄱ-ㅎㅏ-ㅣ가-힣]$/.test(k)) return R(`‘${k}’ 키`, '한글 타자 본능');
    if (k.length === 1) return R(`‘${k}’ 키`, '키보드에 대한 미련');
    return R(`${k} 키`, '키보드에 대한 미련');
  }

  // ---------- 화면 요소 ----------
  const ui = {
    app: $('app'), idle: $('idle'), result: $('result'),
    rules: $('rules'), form: $('startForm'), name: $('name'),
    bestLine: $('bestLine'), gradeList: $('gradeList'),
    booth: $('booth'), bNo: $('bNo'), bName: $('bName'),
    cdNum: $('cdNum'),
    timer: $('timer'), tMain: $('tMain'), tCs: $('tCs'), liveGrade: $('liveGrade'),
    m1: $('m1'), m1b: $('m1b'), m1s: $('m1s'),
    m2: $('m2'), m2b: $('m2b'), m2s: $('m2s'),
    m3: $('m3'), m3b: $('m3b'), m3s: $('m3s'),
    tickTime: $('tickTime'), tickText: $('tickText'),
    verdict: $('verdict'), vReason: $('vReason'),
    flash: $('flash'), toast: $('toast'),
    newBest: $('newBest'), sheetTitle: $('sheetTitle'),
    rNoTop: $('rNoTop'), rGrade: $('rGrade'), rRank: $('rRank'), rRecord: $('rRecord'), rSec: $('rSec'),
    rNo: $('rNo'), rName: $('rName'), rDate: $('rDate'), rReason: $('rReason'), rReview: $('rReview'),
    rBest: $('rBest'), rSignDate: $('rSignDate'),
    copyBtn: $('copyBtn'), saveBtn: $('saveBtn'), againBtn: $('againBtn'),
  };

  // ---------- 유틸 ----------
  const pad = (n) => String(n).padStart(2, '0');
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  function splitTime(cs) {
    const m = Math.floor(cs / 6000);
    const s = Math.floor(cs / 100) % 60;
    return { main: `${pad(m)}:${pad(s)}`, cs: `.${pad(cs % 100)}`, long: m >= 100 };
  }
  const fmtClock = (cs) => { const t = splitTime(cs); return t.main + t.cs; };
  const fmtSec = (cs) => (cs / 100).toFixed(2);
  const fmtDateTime = (d) => `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}. (${DAYS[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const fmtDateKo = (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  function gradeIndex(sec) {
    for (let i = 0; i < GRADES.length; i++) if (sec < GRADES[i].until) return i;
    return GRADES.length - 1;
  }

  function makeNo() {
    let n;
    try {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      n = a[0] % 1000000;
    } catch (e) {
      n = Math.floor(Math.random() * 1000000);
    }
    return `MEONG-${new Date().getFullYear()}-${String(n).padStart(6, '0')}`;
  }

  function shuffled(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 로컬 파일로 열었을 때 내 컴퓨터 경로가 공유되지 않도록 공개 주소를 쓴다
  function pageUrl() {
    if (/^https?:$/.test(location.protocol)) return location.origin + location.pathname;
    return SITE_URL;
  }

  function restartAnimation(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  let toastTimer = 0;
  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('is-on'), 2200);
  }

  // ---------- 개인 최고 기록 (저장 실패해도 앱은 계속 동작) ----------
  function loadBest() {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (v && Number.isFinite(v.cs) && v.cs >= 0) return v;
    } catch (e) { /* 저장소 접근 불가 */ }
    return null;
  }
  function saveBest(v) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* 메모리에만 유지 */ }
  }
  let best = loadBest();

  function renderBest() {
    ui.bestLine.textContent = '';
    if (!best) {
      ui.bestLine.textContent = '개인 최고 기록 · 아직 없음';
    } else {
      const b = document.createElement('b');
      b.textContent = fmtClock(best.cs);
      ui.bestLine.append('개인 최고 기록 · ', b, ` (${GRADES[gradeIndex(best.cs / 100)].name})`);
    }
    renderGradeList();
  }

  function renderGradeList() {
    const mine = best ? gradeIndex(best.cs / 100) : -1;
    ui.gradeList.textContent = '';
    GRADES.forEach((g, i) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = g.name;
      if (i === mine) {
        const tag = document.createElement('span');
        tag.className = 'g-mine';
        tag.textContent = '◀ 개인 최고';
        name.append(tag);
      }
      const range = document.createElement('span');
      range.className = 'g-range';
      const from = i ? GRADES[i - 1].until : 0;
      range.textContent = i === 0 ? `${g.until}초 미만`
        : Number.isFinite(g.until) ? `${from}–${g.until}초`
        : `${from}초 이상`;
      li.append(name, range);
      ui.gradeList.append(li);
    });
  }

  // ---------- 애니메이션 1: 측정 수칙 타이핑 ----------
  // 줄마다 보이지 않는 완성본(ghost)을 깔아 두어 타이핑 중에 아래 레이아웃이 밀리지 않게 한다
  function typeRules() {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    const spans = RULES.map((text) => {
      const p = document.createElement('p');
      const ghost = document.createElement('span');
      ghost.className = 'ghost';
      ghost.textContent = text;
      const spacer = document.createElement('span');
      spacer.className = 'cursor';
      ghost.append(spacer);
      const live = document.createElement('span');
      live.className = 'live';
      const t = document.createElement('span');
      live.append(t);
      p.append(ghost, live);
      ui.rules.append(p);
      return t;
    });
    const lineOf = (t) => t.parentNode.parentNode;

    if (reduceMotion()) {
      spans.forEach((t, i) => { t.textContent = RULES[i]; lineOf(t).classList.add('is-on'); });
      spans[spans.length - 1].parentNode.append(cursor);
      return;
    }

    let line = 0;
    let ch = 0;
    const step = () => {
      const text = RULES[line];
      if (ch === 0) {
        lineOf(spans[line]).classList.add('is-on');
        spans[line].parentNode.append(cursor);
      }
      if (ch < text.length) {
        ch += 1;
        spans[line].textContent = text.slice(0, ch);
        setTimeout(step, 26 + Math.random() * 44);
      } else if (line < RULES.length - 1) {
        line += 1;
        ch = 0;
        setTimeout(step, 420);
      } else {
        cursor.classList.add('is-idle');
      }
    };
    setTimeout(step, 450);
  }

  // ---------- 측정 상태 ----------
  // idle → countdown → measuring → verdict → result
  let state = 'idle';
  let session = null;
  let startAt = 0;
  let armed = false;
  let raf = 0;
  let timers = [];
  let lastSec = -1;
  let lastSlot = 0;
  let gradeIdx = 0;
  let gradeFlashTimer = 0;
  let deck = [];
  let lastPointer = null;
  let wakeLock = null;
  let lastResult = null;

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  // 휴대폰 화면이 꺼지면 탭 이탈로 실격되므로, 측정 중에는 화면 꺼짐을 막아 본다
  async function requestWake() {
    try {
      if (!('wakeLock' in navigator) || wakeLock) return;
      const lock = await navigator.wakeLock.request('screen');
      if (state === 'countdown' || state === 'measuring') wakeLock = lock;
      else lock.release().catch(() => {});
    } catch (e) { /* 지원 안 함 */ }
  }
  function releaseWake() {
    const lock = wakeLock;
    wakeLock = null;
    if (lock) lock.release().catch(() => {});
  }

  function resetBooth() {
    ui.verdict.hidden = true;
    ui.booth.classList.remove('is-shaking');
    ui.flash.classList.remove('is-on');
    ui.timer.classList.remove('is-long');
    ui.liveGrade.classList.remove('is-up');
    gradeIdx = 0;
    renderTimer(0);
    renderMetrics(0);
    renderLiveGrade(0);
    setTicker(0, '측정 대기 중입니다.', false);
  }

  function startCountdown() {
    if (state === 'countdown' || state === 'measuring' || state === 'verdict') return;
    const name = ui.name.value.trim().replace(/\s+/g, ' ') || '익명의 피험자';
    session = { no: makeNo(), name, startedAt: null };
    state = 'countdown';
    clearTimers();
    ui.name.blur();

    ui.bNo.textContent = session.no;
    ui.bName.textContent = `피험자 · ${name}`;
    resetBooth();
    ui.booth.dataset.phase = 'countdown';
    ui.booth.hidden = false;
    ui.app.hidden = true;
    document.documentElement.classList.add('is-locked');
    window.scrollTo(0, 0);
    requestWake();

    const steps = ['3…', '2…', '1…', '멍.'];
    steps.forEach((text, i) => later(() => {
      ui.cdNum.textContent = text;
      ui.cdNum.classList.toggle('is-go', i === steps.length - 1);
      if (!reduceMotion()) restartAnimation(ui.cdNum, 'pop');
    }, i * COUNT_STEP_MS));
    later(beginMeasure, steps.length * COUNT_STEP_MS);
  }

  function beginMeasure() {
    state = 'measuring';
    ui.booth.dataset.phase = 'measuring';
    startAt = performance.now();
    session.startedAt = new Date();
    lastSec = -1;
    lastSlot = 0;
    gradeIdx = 0;
    deck = shuffled(COMMENTS);
    setTicker(0, START_LINE, true);
    later(arm, GRACE_MS);
    raf = requestAnimationFrame(tick);
  }

  function arm() {
    if (state !== 'measuring') return;
    armed = true;
    if (document.hidden) disqualify(REASON.tab);
  }

  function tick(now) {
    if (state !== 'measuring') return;
    const ms = Math.max(0, now - startAt);
    renderTimer(ms);
    const sec = Math.floor(ms / 1000);
    if (sec !== lastSec) {
      lastSec = sec;
      renderMetrics(sec);
      renderLiveGrade(sec);
    }
    const slot = Math.floor(ms / COMMENT_MS);
    if (slot > lastSlot) {
      lastSlot = slot;
      if (!deck.length) deck = shuffled(COMMENTS);
      setTicker(slot * COMMENT_MS / 1000, deck.pop(), true);
    }
    raf = requestAnimationFrame(tick);
  }

  function renderTimer(ms) {
    const t = splitTime(Math.floor(ms / 10));
    ui.tMain.textContent = t.main;
    ui.tCs.textContent = t.cs;
    ui.timer.classList.toggle('is-long', t.long);
  }

  function renderLiveGrade(sec) {
    const i = gradeIndex(sec);
    const g = GRADES[i];
    const next = GRADES[i + 1];
    ui.liveGrade.textContent = next
      ? `현재 판정 · ${g.name} · ${next.name}까지 ${g.until - sec}초`
      : `현재 판정 · ${g.name} · 더 오를 곳이 없습니다`;
    if (i !== gradeIdx) {
      gradeIdx = i;
      ui.liveGrade.classList.add('is-up');
      clearTimeout(gradeFlashTimer);
      gradeFlashTimer = setTimeout(() => ui.liveGrade.classList.remove('is-up'), 1800);
    }
  }

  // ---------- 가짜 실시간 지표: 시간이 지날수록 그럴듯하게 ----------
  function stateOf(value, table) {
    for (const [limit, label] of table) if (value < limit) return label;
    return table[table.length - 1][1];
  }
  const BRAIN_STATES = [[80, '잡념 다수'], [90, '안정화 중'], [96, '고요함'], [99, '평온의 극치'], [Infinity, '수면 직전']];
  const SOUL_STATES = [[10, '체내 거주'], [35, '이탈 조짐'], [65, '반쯤 외출'], [90, '외출 중'], [Infinity, '행방 불명']];
  const DIST_STATES = [[1, '현생 인근'], [10, '동네 이탈'], [100, '시외 이동'], [500, '도 경계 돌파'], [3000, '국경 인근'], [20000, '지구 반대편'], [Infinity, '달 방향 이동 중']];

  function fmtDist(km) {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 100) return `${km.toFixed(1)}km`;
    return `${Math.round(km).toLocaleString('ko-KR')}km`;
  }

  function renderMetrics(sec) {
    const jitter = sec ? (Math.random() - 0.5) * 0.5 : 0;
    const brain = Math.min(99.9, 99.4 - 27 * Math.exp(-sec / 35) + jitter);
    const soul = Math.min(99, 100 * (1 - Math.exp(-sec / 110)));
    const km = 0.004 * Math.pow(sec, 2.2);

    ui.m1.textContent = `${brain.toFixed(1)}%`;
    ui.m1b.style.width = `${brain}%`;
    ui.m1s.textContent = stateOf(brain, BRAIN_STATES);

    ui.m2.textContent = `${Math.floor(soul)}%`;
    ui.m2b.style.width = `${soul}%`;
    ui.m2s.textContent = stateOf(soul, SOUL_STATES);

    ui.m3.textContent = fmtDist(km);
    ui.m3b.style.width = `${Math.min(100, Math.log10(1 + km) / Math.log10(400001) * 100)}%`;
    ui.m3s.textContent = stateOf(km, DIST_STATES);
  }

  function setTicker(sec, text, animate) {
    ui.tickTime.textContent = `[${pad(Math.floor(sec / 60))}:${pad(sec % 60)}]`;
    ui.tickText.textContent = text;
    if (animate && !reduceMotion()) restartAnimation(ui.tickText, 'is-new');
  }

  // ---------- 실격 감지 ----------
  // 리스너는 항상 붙어 있고, 측정 중(armed)일 때만 판정한다. 결과 화면 버튼은 판정 대상이 아니다.
  function disqualify(reason) {
    if (state !== 'measuring' || !armed) return;
    const ms = performance.now() - startAt;
    armed = false;
    state = 'verdict';
    cancelAnimationFrame(raf);
    clearTimers();
    releaseWake();
    renderTimer(ms);

    const cs = Math.floor(ms / 10);
    const sec = cs / 100;
    const prev = best;
    const isNewBest = !prev || cs > prev.cs;
    if (isNewBest) {
      best = { cs, at: new Date().toISOString(), name: session.name };
      saveBest(best);
    }
    lastResult = {
      no: session.no,
      name: session.name,
      startedAt: session.startedAt,
      cs,
      sec,
      gi: gradeIndex(sec),
      reason,
      isNewBest,
      prev,
      best,
    };
    showVerdict(lastResult);
  }

  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    const p = { x: e.clientX, y: e.clientY };
    if (armed) {
      // 화면이 바뀔 때 브라우저가 보내는 '제자리 이동' 이벤트는 무시한다
      const dist = lastPointer
        ? Math.hypot(p.x - lastPointer.x, p.y - lastPointer.y)
        : Math.hypot(e.movementX || 0, e.movementY || 0);
      lastPointer = p;
      if (dist >= 0.5) disqualify(moveReason(dist, e.pointerType));
      return;
    }
    lastPointer = p;
  }

  function onPointerDown(e) {
    if (e.pointerType !== 'touch') lastPointer = { x: e.clientX, y: e.clientY };
    if (!armed) return;
    if (e.pointerType === 'touch') disqualify(REASON.touch);
    else if (e.pointerType === 'pen') disqualify(REASON.pen);
    else disqualify(buttonReason(e.button));
  }

  const opts = { capture: true, passive: true };
  window.addEventListener('pointermove', onPointerMove, opts);
  window.addEventListener('pointerdown', onPointerDown, opts);
  window.addEventListener('mousedown', (e) => { if (armed) disqualify(buttonReason(e.button)); }, opts);
  window.addEventListener('touchstart', () => { if (armed) disqualify(REASON.touch); }, opts);
  window.addEventListener('keydown', (e) => { if (armed) disqualify(keyReason(e)); }, true);
  window.addEventListener('wheel', (e) => { if (armed) disqualify(wheelReason(e)); }, opts);
  document.addEventListener('scroll', () => { if (armed) disqualify(REASON.scroll); }, opts);
  document.addEventListener('visibilitychange', () => { if (armed && document.hidden) disqualify(REASON.tab); });
  window.addEventListener('blur', (e) => { if (armed && e.target === window) disqualify(REASON.window); });

  // ---------- 애니메이션 3: 실격 도장 ----------
  function showVerdict(d) {
    ui.vReason.textContent = `${d.reason.detail} (${d.reason.note})`;
    ui.booth.dataset.phase = 'verdict';
    ui.verdict.hidden = false;
    setTicker(Math.floor(d.sec), '측정 종료. 피험자가 현생으로 복귀했습니다.', true);
    if (!reduceMotion()) {
      restartAnimation(ui.booth, 'is-shaking');
      restartAnimation(ui.flash, 'is-on');
    }
    later(() => showResult(d), reduceMotion() ? 1400 : 2100);
  }

  // ---------- 4. 결과지 ----------
  function showResult(d) {
    state = 'result';
    ui.booth.hidden = true;
    ui.verdict.hidden = true;
    ui.booth.classList.remove('is-shaking');
    ui.flash.classList.remove('is-on');
    document.documentElement.classList.remove('is-locked');

    fillSheet(d);
    renderBest();
    ui.idle.hidden = true;
    ui.result.hidden = false;
    ui.app.hidden = false;
    window.scrollTo(0, 0);
    try { ui.sheetTitle.focus({ preventScroll: true }); } catch (e) { /* 무시 */ }

    // 실격 직후 연타가 버튼에 꽂히지 않도록 잠깐 잠근다
    setActions(false);
    later(() => setActions(true), 600);
  }

  function setActions(on) {
    [ui.copyBtn, ui.saveBtn, ui.againBtn].forEach((b) => { b.disabled = !on; });
  }

  function bestText(d) {
    if (d.isNewBest) return { isNew: true, text: '개인 최고 기록 경신!', sub: d.prev ? ` (이전 ${fmtClock(d.prev.cs)})` : ' (첫 공식 기록)' };
    const gap = d.best.cs - d.cs;
    const tail = gap === 0 ? '최고 기록과 동률' : `경신까지 ${fmtSec(gap)}초 부족`;
    return { isNew: false, text: `${fmtClock(d.best.cs)} · ${GRADES[gradeIndex(d.best.cs / 100)].name} (${tail})`, sub: '' };
  }

  function fillSheet(d) {
    const g = GRADES[d.gi];
    ui.newBest.hidden = !d.isNewBest;
    ui.rNoTop.textContent = d.no;
    ui.rNo.textContent = d.no;
    ui.rGrade.textContent = g.name;
    ui.rRank.textContent = `${GRADES.length}단계 중 ${d.gi + 1}단계`;
    ui.rRecord.textContent = fmtClock(d.cs);
    ui.rSec.textContent = `${fmtSec(d.cs)}초`;
    ui.rName.textContent = d.name;
    ui.rDate.textContent = fmtDateTime(d.startedAt);
    ui.rReason.textContent = `${d.reason.detail} (${d.reason.note})`;
    ui.rReview.textContent = g.review;
    ui.rSignDate.textContent = fmtDateKo(d.startedAt);

    const b = bestText(d);
    ui.rBest.textContent = '';
    if (b.isNew) {
      const s = document.createElement('span');
      s.className = 'best-new';
      s.textContent = b.text;
      ui.rBest.append(s, b.sub);
    } else {
      ui.rBest.textContent = b.text;
    }
  }

  // ---------- 공유: 결과 복사 ----------
  function shareText(d) {
    return `멍때림 측정 결과: ${GRADES[d.gi].name} (${fmtSec(d.cs)}초) · 실격 사유: ${d.reason.short} · 너도 해봐 → ${pageUrl()}`;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* 아래 방식으로 재시도 */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  // ---------- 공유: 결과지를 canvas로 직접 그려 PNG 저장 ----------
  const C = {
    bg: '#0a0a0a', paper: '#f6f5ef', paperLine: '#cfcdc4', ink: '#111110', inkSoft: '#5a5953',
    red: '#e10600', dim: '#a3a29b',
  };
  const MONO = '"IBM Plex Mono", "Nanum Gothic Coding", monospace';
  const SERIF = '"Noto Serif KR", serif';

  function sheetFields(d) {
    const b = bestText(d);
    return [
      { label: '측정 번호', value: d.no },
      { label: '피험자', value: d.name },
      { label: '측정 일시', value: fmtDateTime(d.startedAt) },
      { label: '실격 사유', value: `${d.reason.detail} (${d.reason.note})`, bold: true, stamp: true },
      { label: '심사평', value: GRADES[d.gi].review },
      { label: '개인 최고', value: b.text + b.sub, red: b.isNew },
    ];
  }

  const STATEMENT = '위 피험자는 상기 기록 동안 아무것도 하지 않았음을 공식 인정합니다.';
  const FINE_LEFT = '본 결과지는 국가공인이 아니며 어떠한 법적 효력도 없습니다.';

  async function ensureFonts(d) {
    if (!document.fonts || !document.fonts.load) return;
    const sample = [
      '공식 측정 결과지 SUDO SEED 멍때림 심사위원회 MEONG-O-METER v1.0 국가공인 아님 등급 기록 실격 0123456789:.',
      STATEMENT, FINE_LEFT, fmtDateKo(d.startedAt), GRADES[d.gi].name,
      ...sheetFields(d).map((f) => f.label + f.value),
    ].join(' ');
    const faces = [
      '400 14px "IBM Plex Mono"', '700 14px "IBM Plex Mono"',
      '400 14px "Nanum Gothic Coding"', '700 14px "Nanum Gothic Coding"',
      '700 14px "Noto Serif KR"', '900 14px "Noto Serif KR"',
    ];
    const loads = faces.map((f) => document.fonts.load(f, sample).catch(() => null));
    await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 3000))]);
  }

  function spacedWidth(g, text, sp) {
    let w = 0;
    for (const ch of text) w += g.measureText(ch).width + sp;
    return text ? w - sp : 0;
  }
  function fillSpaced(g, text, x, y, sp, align) {
    const w = spacedWidth(g, text, sp);
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    g.textAlign = 'left';
    for (const ch of text) {
      g.fillText(ch, cx, y);
      cx += g.measureText(ch).width + sp;
    }
  }

  function wrapText(g, text, maxW) {
    const lines = [];
    let line = '';
    for (const word of text.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (g.measureText(test).width <= maxW) { line = test; continue; }
      if (line) lines.push(line);
      if (g.measureText(word).width <= maxW) { line = word; continue; }
      let part = '';
      for (const ch of word) {
        if (part && g.measureText(part + ch).width > maxW) { lines.push(part); part = ch; } else part += ch;
      }
      line = part;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  function drawLine(g, x1, y1, x2, y2, color, width, dash) {
    g.save();
    g.strokeStyle = color;
    g.lineWidth = width;
    if (dash) g.setLineDash(dash);
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    g.restore();
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function drawDqStamp(g, cx, cy, size) {
    g.save();
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = 0.92;
    g.translate(cx, cy);
    g.rotate(-11 * Math.PI / 180);
    g.font = `900 ${size}px ${SERIF}`;
    const w = spacedWidth(g, '실격', size * 0.06) + size * 0.62;
    const h = size * 1.3;
    g.strokeStyle = C.red;
    g.lineWidth = size * 0.07;
    roundRect(g, -w / 2, -h / 2, w, h, size * 0.1);
    g.stroke();
    g.lineWidth = size * 0.03;
    const inset = size * 0.12;
    roundRect(g, -w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, size * 0.05);
    g.stroke();
    g.fillStyle = C.red;
    g.textBaseline = 'middle';
    fillSpaced(g, '실격', 0, size * 0.04, size * 0.06, 'center');
    g.restore();
  }

  function drawSeal(g, cx, cy, size) {
    g.save();
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = 0.9;
    g.translate(cx, cy);
    g.rotate(-4 * Math.PI / 180);
    g.strokeStyle = C.red;
    g.lineWidth = 3;
    g.strokeRect(-size / 2 + 1.5, -size / 2 + 1.5, size - 3, size - 3);
    g.lineWidth = 1;
    g.strokeRect(-size / 2 + 7, -size / 2 + 7, size - 14, size - 14);
    g.fillStyle = C.red;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const rows = [['SUDO SEED', 9], ['멍때림', 10.5], ['심사위원회', 10.5]];
    rows.forEach(([text, px], i) => {
      g.font = `900 ${px}px ${SERIF}`;
      const maxW = size - 18;
      const w = g.measureText(text).width;
      if (w > maxW) g.font = `900 ${px * maxW / w}px ${SERIF}`;
      g.fillText(text, 0, (i - 1) * 13.5);
    });
    g.restore();
  }

  // H를 모르면(측정 단계) 배경 없이 높이만 계산해 돌려준다
  function drawSheet(g, d, H) {
    const W = 540;
    const P = 20;              // 종이 바깥 여백
    const x0 = P + 30;
    const x1 = W - P - 30;
    const cw = x1 - x0;
    const paperBottomPad = 22;

    if (H) {
      g.fillStyle = C.bg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = C.paper;
      g.fillRect(P, P, W - P * 2, H - P - 52);
      g.strokeStyle = C.paperLine;
      g.lineWidth = 1;
      g.strokeRect(P + 8.5, P + 8.5, W - P * 2 - 17, H - P - 52 - 17);
    }
    g.textBaseline = 'alphabetic';

    let y = P + 34;

    // 기관명
    g.font = `400 11px ${MONO}`;
    g.fillStyle = C.inkSoft;
    g.textAlign = 'left';
    g.fillText('SUDO SEED 멍때림 심사위원회', x0, y);
    g.textAlign = 'right';
    g.fillText('MEONG-O-METER v1.0', x1, y);
    y += 9;
    drawLine(g, x0, y, x1, y, C.ink, 1);
    drawLine(g, x0, y + 3, x1, y + 3, C.ink, 1);

    // 제목
    y += 46;
    g.font = `900 30px ${SERIF}`;
    g.fillStyle = C.ink;
    fillSpaced(g, '공식 측정 결과지', W / 2, y, 30 * 0.32, 'center');
    y += 22;
    g.font = `400 11px ${MONO}`;
    g.fillStyle = C.inkSoft;
    g.textAlign = 'center';
    g.fillText(`국가공인 아님 · 제 ${d.no} 호`, W / 2, y);
    y += 15;
    drawLine(g, x0, y, x1, y, C.ink, 1);

    // 등급 · 기록
    const heroTop = y;
    const half = x0 + cw / 2;
    g.textAlign = 'left';
    g.font = `400 11px ${MONO}`;
    g.fillStyle = C.inkSoft;
    fillSpaced(g, '등급', x0, heroTop + 26, 3.3, 'left');
    fillSpaced(g, '기록', half + 16, heroTop + 26, 3.3, 'left');
    g.fillStyle = C.ink;
    g.font = `900 34px ${SERIF}`;
    g.fillText(GRADES[d.gi].name, x0, heroTop + 68);
    g.font = `700 34px ${MONO}`;
    g.fillText(fmtClock(d.cs), half + 16, heroTop + 68);
    g.font = `400 12px ${MONO}`;
    g.fillStyle = C.inkSoft;
    g.fillText(`${GRADES.length}단계 중 ${d.gi + 1}단계`, x0, heroTop + 92);
    g.fillText(`${fmtSec(d.cs)}초`, half + 16, heroTop + 92);
    y = heroTop + 110;
    drawLine(g, half, heroTop, half, y, C.paperLine, 1);
    drawLine(g, x0, y, x1, y, C.ink, 1);

    // 항목
    const labelW = 92;
    const lh = 21;
    sheetFields(d).forEach((f) => {
      const valueW = cw - labelW - (f.stamp ? 80 : 0);
      g.font = `${f.bold || f.red ? 700 : 400} 14px ${MONO}`;
      const lines = wrapText(g, f.value, valueW);
      const rowH = 18 + lines.length * lh;
      g.textAlign = 'left';
      g.fillStyle = f.red ? C.red : C.ink;
      lines.forEach((ln, i) => g.fillText(ln, x0 + labelW, y + 9 + 15 + i * lh));
      g.font = `400 13px ${MONO}`;
      g.fillStyle = C.inkSoft;
      g.fillText(f.label, x0, y + 9 + 15);
      if (f.stamp) drawDqStamp(g, x1 - 36, y + rowH / 2, 24);
      y += rowH;
      drawLine(g, x0, y, x1, y, C.paperLine, 1, [1.5, 2.5]);
    });

    // 인정 문구 · 날짜 · 관인
    y += 30;
    g.font = `400 13px ${MONO}`;
    g.fillStyle = C.ink;
    g.textAlign = 'center';
    wrapText(g, STATEMENT, cw).forEach((ln) => { g.fillText(ln, W / 2, y); y += 20; });
    y += 8;
    fillSpaced(g, fmtDateKo(d.startedAt), W / 2, y, 1.3, 'center');

    y += 46;
    g.font = `700 18px ${SERIF}`;
    const org = 'SUDO SEED 멍때림 심사위원회';
    const orgW = spacedWidth(g, org, 1);
    const orgX = W / 2 - 26;
    fillSpaced(g, org, orgX, y, 1, 'center');
    drawSeal(g, orgX + orgW / 2 + 36, y - 6, 68);

    // 하단 안내
    y += 40;
    drawLine(g, x0, y, x1, y, C.paperLine, 1);
    y += 16;
    g.font = `400 10.5px ${MONO}`;
    g.fillStyle = C.inkSoft;
    g.textAlign = 'left';
    g.fillText(FINE_LEFT, x0, y);
    g.textAlign = 'right';
    g.fillText('SEED #02', x1, y);

    const paperEnd = y + paperBottomPad;

    // 종이 밖 캡션
    const capY = paperEnd + 30;
    g.font = `400 12px ${MONO}`;
    g.fillStyle = C.dim;
    g.textAlign = 'left';
    g.fillText('멍때림 측정기 · SUDO SEED', x0 - 30, capY);
    g.textAlign = 'right';
    g.fillText(pageUrl().replace(/^https?:\/\//, ''), x1 + 30, capY);

    return paperEnd + 52;
  }

  function buildCanvas(d) {
    const probe = document.createElement('canvas').getContext('2d');
    const H = Math.ceil(drawSheet(probe, d, 0));
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 540 * scale;
    canvas.height = H * scale;
    const g = canvas.getContext('2d');
    g.scale(scale, scale);
    drawSheet(g, d, H);
    return canvas;
  }

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      if (canvas.toBlob) {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
      } else {
        fetch(canvas.toDataURL('image/png')).then((r) => r.blob()).then(resolve, reject);
      }
    });
  }

  async function saveImage() {
    if (!lastResult) return;
    ui.saveBtn.disabled = true;
    try {
      await ensureFonts(lastResult);
      const blob = await canvasBlob(buildCanvas(lastResult));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lastResult.no}.png`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast('결과지를 이미지로 저장했습니다.');
    } catch (e) {
      toast('이미지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      ui.saveBtn.disabled = false;
    }
  }

  // ---------- 연결 ----------
  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    startCountdown();
  });
  ui.againBtn.addEventListener('click', startCountdown);
  ui.copyBtn.addEventListener('click', async () => {
    if (!lastResult) return;
    const ok = await copyText(shareText(lastResult));
    toast(ok ? '복사 완료' : '복사에 실패했습니다. 직접 선택해서 복사해 주세요.');
  });
  ui.saveBtn.addEventListener('click', saveImage);

  renderBest();
  typeRules();
})();
