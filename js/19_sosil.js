'use strict';
// ───────── 소실자·부적 (기획서 8절 '완전 소실 → 소실자' · 9-1 '삼켜짐' · 1대 일정표 F묶음의 첫 판, ✳ 11/3) ─────────
// 굴·바위에서 돌아오지 않은 사람(완전 소실)은 밤마다 대문 앞에 선다(그 사람 얼굴 그대로). 부르면 웃기만 하고 들어오지 않는다.
// 대문 기둥에 부적이 없는 밤이 지나면(첫 밤은 빼고) 일반 연구원 하나가 따라 나감 → 그 사람도 대문 앞에 선다. 넷이면 끝 '모두 물가로 가다'.
// 부적: 가주가 주사로 씀(1냥, 사흘). 행랑채가 있으면 일꾼이 바래면 갈아 붙임(값은 같음). 기본 모드는 비운 사이엔 마지막 하나를 데려가지 않음.
const sosilKeys = () => allKeys().filter(k => { const s = S.st[k]; return s && (s.sosil || (s.missing && s.gone && !(S.lost || []).some(x => x.k === k))); });
const charmOn = d => S.charmTo != null && S.charmTo >= d;
// 결계(✳ 11/3 밤, 기획서 처용 안): 부적을 몇 번 쓴 뒤 대문에 얼굴을 그림 → 부적 없이도 막음. 대신 며칠마다 안의 사람 하나가 그 얼굴을 등지고 떠남. 빗장을 만지는 사람이 안에 있으면 듣지 않음.
const guarded = d => charmOn(d) || (S.kyeol && !genKeys().some(k => S.st[k].bolt && !S.st[k].quit));
function lureOne(night){
  S.lureNight = night;
  const k = genKeys().find(j => { const s = S.st[j]; return s.replied && !s.quit && !s.gone && !s.sea; }); if (!k) return;
  const s = S.st[k]; s.gone = true; s.quit = Date.now(); s.sosil = true; delete S.errs[k]; S.swallowN = (S.swallowN || 0) + 1; S.genNext = Date.now() + 180000;
  ledger(`밤사이 ${DEF(k).name}의 자리가 비었다. 대문 앞 모래에 발자국이 바다 쪽으로만 나 있다`);
  if (typeof tlog === 'function') tlog('소실자가 데려감: ' + DEF(k).name); save();
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return;
  if (S.trace === 'swallow' && !S.charmPost){ S.charmPost = true; S.charmTo = dayKey() - 1; S.charmN = Math.max(S.charmN || 0, K.kyeolAfter); save(); }   // 흔적(모두 물가로 가다): 앞 대가 붙인 부적이 바랜 채 · 얼굴 그리는 법은 이미 앎
  const ks = sosilKeys(); if (!ks.length) return;
  const today = dayKey();
  if (S.sosilFrom == null){ S.sosilFrom = today; S.sosilDay = today; save();
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '밤마다 대문 앞에', `${josa(DEF(ks[0]).name, '이', '가')} 서 있다고 합니다.`, '부르면 웃기만 하고', '들어오지는 않는답니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,300px)')); return; }
  if (S.sosilDay < today){ while (S.sosilDay < today){ const d = S.sosilDay++;                         // 비운 사이 지난 밤들(부적 갈기보다 먼저 — 갈아 붙인 부적이 지난 밤까지 막지 않게)
    if (d > S.sosilFrom && !guarded(d) && S.lureNight !== d && (S.mode === 'hard' || (S.swallowN || 0) + 1 < K.swallowLim)) lureOne(d); } save(); }
  if (built('haeng') && !S.kyeol && !charmOn(today) && (S.money || 0) >= K.charmCost){ S.money -= K.charmCost; S.charmTo = today + K.charmDays - 1; S.charmN = (S.charmN || 0) + 1; ledger(`행랑채 일꾼이 대문 부적을 갈아 붙임 - ${fmtM(K.charmCost)}`); save(); }
  if (today > S.sosilFrom && gameHour() >= K.lureHour && !guarded(today) && S.lureNight !== today) lureOne(today);   // 들어와 있는 밤
  if (S.kyeol && today - S.kyeol >= K.kyeolLeaveDays){ S.kyeol = today; save();
    const k = genKeys().find(j => { const s = S.st[j]; return s.replied && !s.quit && !s.gone && !s.sea; });
    if (k && END.nobody.n() + 1 < END.nobody.lim()){ const s = S.st[k]; s.gone = true; s.quit = Date.now(); S.genNext = Date.now() + 180000; ledger(`${DEF(k).name}${josa(DEF(k).name, '이', '가')} 새벽에 대문의 얼굴을 등지고 떠났다`); save(); } }
});
END.swallow = { name:'모두 물가로 가다', kind:'이야기',
  n: () => S.swallowN || 0, lim: () => K.swallowLim,
  omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '대문 앞에 선 얼굴이', `이제 ${['하나', '둘', '셋', '넷', '다섯', '여섯'][Math.min(5, sosilKeys().length - 1)]}입니다.`, '모두 별채에 앉았던 얼굴입니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,280px)')); },
  scene: () => ['밤마다 대문 앞에 선 사람이 하나씩 늘었다.',
    '아침이면 별채의 책상이 하나씩 비었다. 사본은 펼쳐진 채였다.',
    '마지막 밤, 대문 앞의 얼굴들은 모두 가주가 아는 얼굴이었다.',
    '그들은 용궁 구경을 시켜 주겠다고 했다.',
    '가주는 혼자 남은 서고에서 빗장을 지르고 등잔을 껐다.'],
  codex: '사람들을 모두 물가로 보냈다.',
  only: () => '<b>대문 앞 모래</b> — 아침마다 발자국이 바다 쪽으로만 나 있었다.',
  relics: [], gahun: null };

// ── 대문 앞에 선 사람들(밤) · 대문 기둥의 부적 ──
const SOSIL_DOLLS = {};
HOOK.dolls.gate.push(() => !isNight() ? [] : sosilKeys().slice(0, 4).map(k => SOSIL_DOLLS[k] || (SOSIL_DOLLS[k] = (() => { const d = dollFor(k);
  return { id:'sosil_' + k, doll:true, img: d.img, imgL: d.imgL, shadow:false, st:()=>{ const i = Math.max(0, sosilKeys().indexOf(k)); return { x: 4 + i*5, y: -14 + (i % 2) * 2, pose:'stand', f:[0, 1], chair:0 }; }, fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true,
    click:()=>openOv(`<h3>${DEF(k).name}</h3>대문 앞에 서 있다. 옷자락이 젖어 있다.<br>부르면 웃는다. 들어오지는 않는다.`) }; })())));
M.charm = model(3, 1, 5, (x, y, z) => (x === 1 && z > 0 && z < 4) || (z === 3 && x !== 1) ? '#a8281e' : '#d8b84a');
M.kyeol = model(5, 1, 6, (x, y, z) => (z === 4 && (x === 1 || x === 3)) || (z === 1 && x > 0 && x < 4) ? '#1a1410' : (x === 0 || x === 4) && z > 1 ? '#6a1a12' : '#a8281e');
M.charmOld = model(3, 1, 4, (x, y, z) => (x + z) % 3 ? '#8a8068' : null);
GATE_OBJ.push({ id:'gCharm', x:-4, y:-19.4, z:7, rot:0, on:()=>'gate', m:()=> S.kyeol ? 'kyeol' : charmOn(dayKey()) ? 'charm' : 'charmOld', show:()=> (S.sosilFrom != null || S.charmPost) && Math.cos(viewA) > 0.05,
  glow:()=> !S.kyeol && !charmOn(dayKey()), click:()=>showCharm() });
function showCharm(){
  const today = dayKey();
  if (S.kyeol){ openOv('<h3>대문의 얼굴</h3>붉은 먹으로 그린 얼굴. 눈이 대문 밖을 보고 있다.<br>안에서 보면 뒤통수뿐인데, 지나는 사람마다 그 앞에서 고개를 돌린다.'
      + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bKyeolOff" style="color:var(--ink);border-color:#00000066">얼굴을 지운다</button></div>');
    return document.getElementById('bKyeolOff').addEventListener('click', ev => { ev.stopPropagation(); delete S.kyeol; save(); openOv('<h3>대문 기둥</h3>물로 씻어 냈다. 붉은 물이 문턱 아래로 오래 흘렀다.'); }); }
  const face = (S.charmN || 0) >= K.kyeolAfter ? `<br><button class="btn rec" id="bKyeol" style="color:var(--ink);border-color:#00000066;margin-top:8px">대문에 얼굴을 그린다 — ${fmtM(K.kyeolCost)}</button>` : '';
  if (charmOn(today)) return openOv('<h3>부적</h3>대문 기둥에 붙인 부적. 붉은 글씨가 ' + (S.charmTo > today ? '선명하다.' : '바래기 시작했다.') + (built('haeng') ? '<br>행랑채 일꾼이 바래면 갈아 붙인다.' : ''));
  openOv('<h3>대문 기둥</h3>' + (S.charmPost && S.sosilFrom == null ? '앞 대가 붙인 부적이 바래어 있다. 모래에 묻힌 발자국 자리가 아직 문턱 앞에 있다.' : S.charmTo != null ? '붙여 둔 부적이 바래어 글씨가 보이지 않는다.' : '기둥에 아무것도 붙어 있지 않다.')
    + `<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bCharm" style="color:var(--ink);border-color:#00000066">주사로 부적을 쓴다 — ${fmtM(K.charmCost)}</button>${face}</div>`);
  document.getElementById('bCharm').addEventListener('click', ev => { ev.stopPropagation();
    if ((S.money || 0) < K.charmCost) return openOv('<h3>대문 기둥</h3>궤짝에 엽전이 모자란다. 주사를 살 수 없다.');
    S.money -= K.charmCost; S.charmTo = today + K.charmDays - 1; S.charmN = (S.charmN || 0) + 1; ledger(`주사 - ${fmtM(K.charmCost)}`); save(); if (typeof sCoin === 'function') sCoin();
    openOv('<h3>부적</h3>붉은 먹으로 쓴 부적을 대문 기둥에 붙였다.<br>쓰는 동안 손이 저절로 움직였다. 획 하나는 쓴 기억이 없다.'); });
  if (face) document.getElementById('bKyeol').addEventListener('click', ev => { ev.stopPropagation();
    if ((S.money || 0) < K.kyeolCost) return openOv('<h3>대문 기둥</h3>궤짝에 엽전이 모자란다. 주사를 살 수 없다.');
    S.money -= K.kyeolCost; S.kyeol = today; ledger(`주사 한 근 - ${fmtM(K.kyeolCost)}`); save(); if (typeof sCoin === 'function') sCoin();
    openOv('<h3>대문</h3>대문 두 짝에 걸쳐 얼굴 하나를 그렸다.<br>다 그리고 보니 누구의 얼굴인지 알 것 같았다. 이름은 떠오르지 않았다.'); });
}
