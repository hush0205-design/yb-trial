'use strict';
// ───────── 책 열고 덮기 ─────────
const COVER_HTML = () => `<div class="coverFace" style="position:absolute;inset:0">${cover.innerHTML}</div>`;
const INNER_BG = 'linear-gradient(#e6dcc4, #e6dcc4)';              // 표지 안쪽 면지
function coverSpot(){ return { offsetLeft: 0, offsetWidth: FW, offsetHeight: FH }; }
let coverBusy = false;
function openBook(){
  const di = itemAt('desk'); if (di === 'first' || di === 'dongui') S.curBook = di;
  cover.querySelector('.slip').textContent = S.curBook === 'dongui' ? '東醫寶鑑' : (typeof titleSlip === 'function' ? titleSlip() : '□□');
  stage.style.setProperty('--cc', (BOOKCOL[S.curBook] || BOOKCOL.first)[0]);
  S.ack = roomNews(); S.blown = (S.blown || []).concat(S.ack);   // 책을 펴기 전에 서고에서 본 것은 '본 것'
  bookView.classList.remove('hidden'); layoutBook(); book.style.visibility = 'visible'; cover.style.visibility = 'visible';
  facesEl.style.visibility = 'hidden';                      // 덮여 있을 땐 표지만
  const go = () => {
    if (coverBusy) return; coverBusy = true;
    cover.onclick = null; sBookOpen();
    // 두 면: 표지가 묶은 선(가운데)을 축으로 오른쪽으로 넘어가 내려앉으면 그 자리가 오른쪽 면이 됨
    const R2 = faces[1];
    buildLeaf(coverSpot(), COVER_HTML(), 'none', R2 ? R2.innerHTML : '', R2 ? R2.style.backgroundImage : INNER_BG);
    facesEl.style.visibility = 'visible'; if (R2) R2.style.visibility = 'hidden';
    cover.style.visibility = 'hidden';
    animateLeaf(1150, () => { if (R2) R2.style.visibility = 'visible'; leaf.style.display = 'none'; leaf.innerHTML = ''; bookOpen = true; coverBusy = false; }, { bend: 30 });
    if (!S.opened){ S.opened = true; save(); }
  };
  if (!S.opened) cover.onclick = go; else setTimeout(go, 250);
}
function closeBook(){
  if (coverBusy) return;
  if (loupeOn) toggleLoupe();
  S.ack = roomNews(); save();
  finishTurn(); bookOpen = false; coverBusy = true; sBookClose();
  const R2 = faces[1];
  buildLeaf(coverSpot(), COVER_HTML(), 'none', R2 ? R2.innerHTML : '', R2 ? R2.style.backgroundImage : INNER_BG);
  if (R2) R2.style.visibility = 'hidden';
  animateLeaf(950, () => {
    leaf.style.display = 'none'; leaf.innerHTML = ''; cover.style.visibility = 'visible'; facesEl.style.visibility = 'hidden';
    setTimeout(() => { bookView.classList.add('hidden'); coverBusy = false; }, 280);
  }, { from: 180, to: 0, bend: 30 });
}
document.querySelector('#thread .hit').addEventListener('click', e => { e.stopPropagation(); if (bookOpen) closeBook(); });
// 책 바깥(책상)을 눌러도 책을 덮고 서고로(시험 플레이에서 실을 못 찾아 갇힌 일이 있어서)
bookView.addEventListener('click', e => {
  if (!bookOpen || coverBusy || loupeOn) return;
  if (e.target.closest('#book, #thread, #deskGlass, #bookBar, #loupe, button')) return;
  const r = book.getBoundingClientRect();
  if (e.clientX > r.left - 24 && e.clientX < r.right + 24 && e.clientY > r.top - 24 && e.clientY < r.bottom + 24) return;
  closeBook();
});
window.addEventListener('resize', () => { if (!bookView.classList.contains('hidden')) layoutBook(); });

// ───────── 돋보기 ─────────
const loupe = document.getElementById('loupe'), lz = document.getElementById('lz');
let loupeOn = false, loupeX = 0, loupeY = 0;
const LR = 75, LZ = 2.2;
function buildLoupe(){
  const Dp = curB().D() + curB().per*0.8;   // 크게 보면 아직 안 풀린 글자도 조금 읽힘
  lz.style.width = book.clientWidth + 'px'; lz.style.height = book.clientHeight + 'px';
  lz.className = S.opt.horiz ? 'horiz' : '';
  lz.innerHTML = faces.map(f => `<div class="face" style="width:${FW}px;height:${FH}px;background-image:${f.style.backgroundImage}">${faceInner(f.dataset.kind, Dp, false)}</div>`).join('');
  placeLoupe();
}
function placeLoupe(){ loupe.style.left = (loupeX - LR) + 'px'; loupe.style.top = (loupeY - LR) + 'px'; lz.style.transform = `translate(${LR - loupeX*LZ}px, ${LR - loupeY*LZ}px) scale(${LZ})`; }
function toggleLoupe(){
  loupeOn = !loupeOn; book.classList.toggle('loupe', loupeOn); loupe.style.display = loupeOn ? 'block' : 'none'; sPlace();
  document.getElementById('deskGlass').classList.toggle('held', loupeOn);
  if (loupeOn){ loupeX = book.clientWidth*0.6; loupeY = book.clientHeight*0.3; buildLoupe(); }
}
document.getElementById('deskGlass').addEventListener('click', e => { e.stopPropagation(); if (bookOpen && !coverBusy) toggleLoupe(); });
const moveLoupe = e => { if (!loupeOn) return; const r = book.getBoundingClientRect(); loupeX = e.clientX - r.left; loupeY = e.clientY - r.top; placeLoupe(); };
book.addEventListener('pointermove', moveLoupe); book.addEventListener('pointerdown', moveLoupe);

// ───────── 넘기기 ─────────
const CD = 1200;     // 손으로 넘기는 간격(읽는 시간)
let lastFlip = -1e9;
function perClick(){ return 1 + (S.owned.lamp?1:0) + (S.owned.desk?1:0); }
function mult(){ return (1 + (S.owned.brush?0.5:0) + (S.owned.glass?1:0)) * (S.fear > 0.45 ? 0.6 : 1) * gahunK('read'); }   // 가훈이 해독 빠르기를 조금 바꿈
function addBook(id, v){
  if (id === 'map'){ S.mapStudy = (S.mapStudy||0) + v; return; }
  if (id === 'dongui' && !S.sideRead.dongui){ S.dD = (S.dD||0) + v; checkDongui(); }
  else S.D += v;
}
function checkDongui(){
  if (S.sideRead.dongui || (S.dD||0) < bDone(BD, DLINES.length-1)) return;
  S.sideRead.dongui = true; save();
  const h = '<h3>동의보감 三</h3>다 풀었다.<br>간을 다룬 장에만 손때가 많다. 누군가 이 장만 여러 번 펼쳤다.<br><br>두려움이 조금 더디게 찾아온다.';
  if (window.BOOTING){ S.pendingNotes = (S.pendingNotes || []).concat([h]); return; }   // 비운 동안 다 풀렸으면 서안의 쪽지 더미로
  setTimeout(() => queueOv(h), 1100);
}
function flip(auto, fast){
  const now = performance.now();
  if (!auto && !fast){ if (now - lastFlip < CD) return; lastFlip = now; setTimeout(() => { const e = document.getElementById('ear'); if (e) e.classList.add('ready'); }, CD); }
  const p = auto ? 1 : perClick(); S.pages += p; S.earned += p;
  if (S.owned.lamp && S.lampOut){ if (!auto) S.fear = Math.min(0.8, S.fear + 0.02); }   // 어둠 속: 넘어가긴 하지만 글자가 풀리지 않고(해독 0), 한 장마다 겁이 조금(10/7 선생님)
  else addBook(S.curBook || 'first', p*mult());
  if (bookOpen) { if (auto) rustle(0.9, 0.09); else sFlip(); }
  turnPage(!!auto, !!fast);
}
book.addEventListener('click', () => { if (bookOpen && !loupeOn && !coverBusy && !heldFlipped) flip(false); heldFlipped = false; });
let holdTimer = null, holdStart = null, heldFlipped = false;
book.addEventListener('pointerdown', () => {
  if (!S.opt.fast || !bookOpen || loupeOn || coverBusy) return;
  clearTimeout(holdStart); clearInterval(holdTimer); heldFlipped = false;
  holdStart = setTimeout(() => { holdTimer = setInterval(() => { heldFlipped = true; flip(false, true); }, 140); }, 250);
});
const stopHold = () => { clearTimeout(holdStart); clearInterval(holdTimer); holdTimer = null; };
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => book.addEventListener(ev, stopHold));

