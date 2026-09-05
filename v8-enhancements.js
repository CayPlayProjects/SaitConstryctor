(() => {
  'use strict';

  const V8_PREFS = 'siteforge_v8_ui_prefs';
  const V8_ONBOARD = 'siteforge_v8_onboarding_done';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const prefs = (() => { try { return JSON.parse(localStorage.getItem(V8_PREFS) || '{}'); } catch { return {}; } })();
  const savePrefs = () => localStorage.setItem(V8_PREFS, JSON.stringify(prefs));

  function toast(title, text = '') {
    const region = $('#toastRegion');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'toast success';
    el.innerHTML = `<strong>${escapeHtml(title)}</strong>${text ? `<span>${escapeHtml(text)}</span>` : ''}`;
    region.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 220); }, 2800);
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function click(selector) {
    const el = $(selector);
    if (!el) return false;
    el.click();
    return true;
  }

  function setLeftTab(name) {
    const btn = $(`[data-left-tab="${name}"]`);
    if (btn) btn.click();
  }

  function setDevice(name) {
    const btn = $(`[data-device="${name}"]`);
    if (btn) btn.click();
  }

  function download(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function currentHtml() {
    const frame = $('#previewFrame');
    return frame?.srcdoc || '';
  }

  function copyCurrentHtml() {
    const html = currentHtml();
    if (!html) return toast('HTML ещё не готов', 'Подождите секунду и попробуйте снова.');
    navigator.clipboard?.writeText(html).then(() => toast('HTML скопирован', 'Код текущего сайта в буфере обмена.')).catch(() => {
      const area = document.createElement('textarea'); area.value = html; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      toast('HTML скопирован');
    });
  }

  function backupAllProjects() {
    const payload = { exportedAt: new Date().toISOString(), generator: 'SiteForge v8', data: {} };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('siteforge_')) payload.data[key] = localStorage.getItem(key);
    }
    download(`siteforge-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
    toast('Резервная копия готова', 'Сохранены все локальные проекты и настройки SiteForge.');
  }

  function toggleClass(name, prefKey) {
    document.body.classList.toggle(name);
    prefs[prefKey] = document.body.classList.contains(name);
    savePrefs();
    updateStatus();
  }

  function applyPrefs() {
    if (prefs.focus) document.body.classList.add('v8-focus');
    if (prefs.presentation) document.body.classList.add('v8-presentation');
    if (prefs.compact) document.body.classList.add('v8-compact');
    if (prefs.grid) document.body.classList.add('v8-grid');
  }

  const commands = [
    { group:'Создание', icon:'＋', title:'Добавить блок', desc:'Открыть библиотеку и поиск блоков', keys:'A', run(){ setLeftTab('blocks'); setTimeout(() => $('#blockSearch')?.focus(), 30); } },
    { group:'Создание', icon:'▤', title:'Структура страницы', desc:'Порядок, скрытие и дублирование блоков', run(){ setLeftTab('structure'); } },
    { group:'Создание', icon:'✦', title:'Готовые шаблоны', desc:'Бизнес, портфолио, продукт, событие', run(){ setLeftTab('templates'); } },
    { group:'Проект', icon:'⚙', title:'Настройки сайта', desc:'Шапка, дизайн, SEO и пользовательский CSS', keys:'S', run(){ click('#openPageSettingsBtn'); } },
    { group:'Проект', icon:'▣', title:'Мои проекты', desc:'Переключение и управление локальными проектами', run(){ click('#projectsBtn'); } },
    { group:'Проект', icon:'↥', title:'Импорт проекта', desc:'Открыть JSON-проект', run(){ click('#importProjectBtn'); } },
    { group:'Проект', icon:'↓', title:'Экспорт проекта JSON', desc:'Скачать редактируемый проект', run(){ click('#exportProjectBtn'); } },
    { group:'Проект', icon:'⛨', title:'Резервная копия всего', desc:'Скачать все проекты и настройки SiteForge', run:backupAllProjects },
    { group:'Просмотр', icon:'▱', title:'Desktop', desc:'Предпросмотр для компьютера', run(){ setDevice('desktop'); } },
    { group:'Просмотр', icon:'▯', title:'Tablet', desc:'Предпросмотр для планшета', run(){ setDevice('tablet'); } },
    { group:'Просмотр', icon:'▯', title:'Mobile', desc:'Предпросмотр для телефона', run(){ setDevice('mobile'); } },
    { group:'Просмотр', icon:'◫', title:'Полный предпросмотр', desc:'Сайт без интерфейса конструктора', keys:'P', run(){ click('#previewBtn'); } },
    { group:'Просмотр', icon:'◎', title:'Режим фокуса', desc:'Скрыть обе боковые панели', keys:'F', run(){ toggleClass('v8-focus','focus'); } },
    { group:'Просмотр', icon:'▣', title:'Презентационный режим', desc:'Максимум места для холста', run(){ toggleClass('v8-presentation','presentation'); } },
    { group:'Просмотр', icon:'#', title:'Сетка холста', desc:'Включить направляющую сетку', run(){ toggleClass('v8-grid','grid'); } },
    { group:'Просмотр', icon:'↔', title:'Компактные панели', desc:'Больше места для сайта', run(){ toggleClass('v8-compact','compact'); } },
    { group:'Экспорт', icon:'↓', title:'Скачать HTML', desc:'Готовый самостоятельный сайт', keys:'E', run(){ click('#exportHtmlBtn'); } },
    { group:'Экспорт', icon:'<>', title:'Скопировать HTML', desc:'Скопировать текущий сгенерированный код', run:copyCurrentHtml },
    { group:'Проверка', icon:'✓', title:'Проверить сайт', desc:'SEO, доступность и структура страницы', keys:'Q', run:openAudit },
    { group:'Помощь', icon:'?', title:'Горячие клавиши', desc:'Быстрые команды SiteForge v8', keys:'?', run:openShortcuts }
  ];

  let paletteIndex = 0;
  let filtered = commands;

  function buildCommandCenter() {
    const backdrop = document.createElement('div'); backdrop.className = 'v8-command-backdrop'; backdrop.id = 'v8CommandBackdrop';
    const modal = document.createElement('section'); modal.className = 'v8-command'; modal.id = 'v8Command';
    modal.innerHTML = `<div class="v8-command-head"><span>⌕</span><input class="v8-command-search" id="v8CommandSearch" placeholder="Что вы хотите сделать?" autocomplete="off"><kbd class="v8-command-key">Esc</kbd></div><div class="v8-command-list" id="v8CommandList"></div>`;
    document.body.append(backdrop, modal);
    backdrop.addEventListener('click', closeCommand);
    $('#v8CommandSearch').addEventListener('input', e => renderCommands(e.target.value));
    $('#v8CommandSearch').addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(filtered.length - 1, paletteIndex + 1); renderCommands(e.currentTarget.value, false); }
      if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(0, paletteIndex - 1); renderCommands(e.currentTarget.value, false); }
      if (e.key === 'Enter' && filtered[paletteIndex]) { e.preventDefault(); runCommand(filtered[paletteIndex]); }
    });
    renderCommands('');
  }

  function renderCommands(query = '', reset = true) {
    const q = query.trim().toLowerCase();
    filtered = commands.filter(c => `${c.title} ${c.desc} ${c.group}`.toLowerCase().includes(q));
    if (reset) paletteIndex = 0;
    let lastGroup = '';
    $('#v8CommandList').innerHTML = filtered.length ? filtered.map((c, i) => {
      const group = c.group !== lastGroup ? `<div class="v8-command-group">${escapeHtml(c.group)}</div>` : '';
      lastGroup = c.group;
      return `${group}<button class="v8-command-item ${i === paletteIndex ? 'active' : ''}" data-v8-command="${commands.indexOf(c)}"><span class="v8-command-icon">${c.icon}</span><span class="v8-command-copy"><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.desc)}</small></span><span class="v8-command-shortcut">${c.keys ? `⌘ ${escapeHtml(c.keys)}` : ''}</span></button>`;
    }).join('') : `<div class="v8-command-empty">Ничего не найдено. Попробуйте другое действие.</div>`;
    $$('[data-v8-command]').forEach(btn => btn.addEventListener('click', () => runCommand(commands[Number(btn.dataset.v8Command)])));
    $('.v8-command-item.active')?.scrollIntoView({ block:'nearest' });
  }

  function runCommand(command) { closeCommand(); setTimeout(() => command?.run?.(), 30); }
  function openCommand() { $('#v8CommandBackdrop').classList.add('open'); $('#v8Command').classList.add('open'); setTimeout(() => { const i=$('#v8CommandSearch'); i.value=''; renderCommands(''); i.focus(); }, 20); }
  function closeCommand() { $('#v8CommandBackdrop')?.classList.remove('open'); $('#v8Command')?.classList.remove('open'); }

  function buildTopbar() {
    const actions = $('.topbar-actions');
    if (!actions || $('#v8QuickBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'v8QuickBtn'; btn.type = 'button'; btn.className = 'btn btn-ghost compact v8-quick-btn'; btn.textContent = 'Быстро'; btn.title = 'Командный центр (Ctrl+K)';
    btn.addEventListener('click', openCommand);
    actions.insertBefore(btn, actions.firstChild);
    const brand = $('.brand-copy');
    if (brand) {
      const old = brand.querySelector('span'); if (old) old.remove();
      const badge = document.createElement('span'); badge.className='v8-badge'; badge.textContent='Visual Builder v8'; brand.appendChild(badge);
    }
  }

  function buildStatus() {
    const status = document.createElement('div'); status.className = 'v8-statusbar'; status.id='v8Statusbar';
    status.innerHTML = `<div class="v8-status-group"><span class="v8-status-chip"><i class="v8-status-dot"></i><strong>SiteForge v8</strong></span><span class="v8-status-chip" id="v8Device">Desktop</span><span class="v8-status-chip" id="v8Blocks">0 блоков</span></div><div class="v8-status-group"><button id="v8FocusStatus" type="button">Фокус</button><button id="v8AuditStatus" type="button">Проверить сайт</button><button id="v8HelpStatus" type="button">?</button></div>`;
    document.body.appendChild(status);
    $('#v8FocusStatus').onclick = () => toggleClass('v8-focus','focus');
    $('#v8AuditStatus').onclick = openAudit;
    $('#v8HelpStatus').onclick = openShortcuts;
    const fab = document.createElement('div'); fab.className='v8-fab'; fab.innerHTML=`<button id="v8AddFab" type="button">＋ Блок</button><button id="v8CheckFab" type="button">✓ Проверка</button>`; document.body.appendChild(fab);
    $('#v8AddFab').onclick = () => { setLeftTab('blocks'); setTimeout(() => $('#blockSearch')?.focus(),20); };
    $('#v8CheckFab').onclick = openAudit;
    updateStatus();
  }

  function updateStatus() {
    const device = $('.device-btn.active span')?.textContent || 'Desktop';
    const count = $('#blockCount')?.textContent || '0 блоков';
    if ($('#v8Device')) $('#v8Device').textContent = device;
    if ($('#v8Blocks')) $('#v8Blocks').textContent = count;
    if ($('#v8FocusStatus')) $('#v8FocusStatus').textContent = document.body.classList.contains('v8-focus') ? 'Показать панели' : 'Фокус';
  }

  function createSheet(id, title, subtitle, bodyHtml) {
    closeSheet();
    const back = document.createElement('div'); back.className='v8-sheet-backdrop open'; back.id='v8SheetBackdrop';
    const sheet = document.createElement('section'); sheet.className='v8-sheet open'; sheet.id=id;
    sheet.innerHTML=`<div class="v8-sheet-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="v8-sheet-close" type="button">×</button></div><div class="v8-sheet-body">${bodyHtml}</div>`;
    document.body.append(back,sheet); back.onclick=closeSheet; $('.v8-sheet-close',sheet).onclick=closeSheet;
    return sheet;
  }
  function closeSheet(){ $('#v8SheetBackdrop')?.remove(); $('.v8-sheet')?.remove(); }

  function runAudit() {
    const html = currentHtml();
    if (!html) return { score:0, items:[['bad','Нет предпросмотра','SiteForge ещё не успел сгенерировать HTML.']] };
    const doc = new DOMParser().parseFromString(html,'text/html');
    const items=[]; let score=100;
    const title=(doc.querySelector('title')?.textContent||'').trim();
    const desc=doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()||'';
    const h1=doc.querySelectorAll('h1').length;
    const imgs=[...doc.querySelectorAll('img')];
    const missingAlt=imgs.filter(i=>!i.hasAttribute('alt')||!i.getAttribute('alt').trim()).length;
    const links=[...doc.querySelectorAll('a[href]')];
    const emptyLinks=links.filter(a=>['#',''].includes((a.getAttribute('href')||'').trim())).length;
    if(title.length>=15&&title.length<=65) items.push(['good','Title настроен',`${title.length} символов — хороший диапазон.`]); else { score-=12; items.push(['warn','Проверьте title',title?`${title.length} символов. Лучше примерно 15–65.`:'Заголовок страницы не заполнен.']); }
    if(desc.length>=70&&desc.length<=170) items.push(['good','Meta description заполнен',`${desc.length} символов.`]); else { score-=12; items.push(['warn','Улучшите описание',desc?`${desc.length} символов. Сделайте описание более информативным.`:'Meta description пуст.']); }
    if(h1===1) items.push(['good','Структура H1 корректна','На странице ровно один главный заголовок.']); else { score-=15; items.push(['bad','Проверьте H1',`Найдено: ${h1}. Рекомендуется один H1.`]); }
    if(!missingAlt) items.push(['good','Изображения описаны',`Проверено изображений: ${imgs.length}.`]); else { score-=Math.min(20,missingAlt*4); items.push(['warn','Не хватает alt',`Без описания: ${missingAlt} из ${imgs.length}.`]); }
    if(!emptyLinks) items.push(['good','Ссылки выглядят рабочими',`Проверено ссылок: ${links.length}.`]); else { score-=Math.min(15,emptyLinks*3); items.push(['warn','Есть пустые ссылки',`Ссылок с href="#": ${emptyLinks}.`]); }
    const sections=doc.querySelectorAll('section,[data-sf-block-id]').length;
    items.push(['good','Страница собрана',`Секций/блоков: ${sections}.`]);
    return { score:Math.max(0,score), items };
  }

  function openAudit() {
    const audit=runAudit(); const cls=audit.score>=85?'good':audit.score>=65?'warn':'bad';
    createSheet('v8Audit','Проверка сайта','Быстрый аудит SEO, структуры и доступности',`<div class="v8-grid-cards" style="margin-bottom:14px"><div class="v8-card"><h3>Общий результат</h3><div class="v8-score ${cls}">${audit.score}/100</div><p>Это подсказка перед публикацией, а не внешний SEO-сервис.</p></div><div class="v8-card"><h3>Быстрые действия</h3><p>Исправьте замечания через настройки сайта и инспектор блоков.</p><div class="v8-card-actions"><button class="v8-mini-btn primary" data-v8-open-settings>Настройки сайта</button><button class="v8-mini-btn" data-v8-copy-html>Копировать HTML</button></div></div></div><div class="v8-audit-list">${audit.items.map(([type,title,text])=>`<div class="v8-audit-row"><span class="v8-audit-icon">${type==='good'?'✓':type==='warn'?'!':'×'}</span><span class="v8-audit-copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(text)}</small></span></div>`).join('')}</div>`);
    $('[data-v8-open-settings]')?.addEventListener('click',()=>{closeSheet();click('#openPageSettingsBtn')});
    $('[data-v8-copy-html]')?.addEventListener('click',copyCurrentHtml);
  }

  function openShortcuts() {
    const rows=[['Ctrl/Cmd + K','Командный центр'],['Ctrl/Cmd + A','Библиотека блоков'],['Ctrl/Cmd + P','Предпросмотр'],['Ctrl/Cmd + Q','Проверка сайта'],['Ctrl/Cmd + F','Режим фокуса'],['Ctrl/Cmd + E','Скачать HTML'],['Ctrl/Cmd + Z','Отменить'],['Ctrl/Cmd + Y','Повторить'],['Esc','Закрыть окно']];
    createSheet('v8Help','Быстрая работа','SiteForge v8 можно почти полностью управлять с клавиатуры',`<div class="v8-kbd-grid">${rows.map(([k,t])=>`<div class="v8-kbd-row"><span>${escapeHtml(t)}</span><kbd>${escapeHtml(k)}</kbd></div>`).join('')}</div><div class="v8-grid-cards" style="margin-top:14px"><div class="v8-card"><h3>Совет</h3><p>Нажмите Ctrl/Cmd + K и начните вводить действие: «блок», «SEO», «мобильный», «экспорт».</p></div><div class="v8-card"><h3>Резервные копии</h3><p>Команда «Резервная копия всего» сохраняет проекты и настройки SiteForge одним JSON.</p></div></div>`);
  }

  function onboarding() {
    if (localStorage.getItem(V8_ONBOARD)) return;
    const box=document.createElement('div'); box.className='v8-onboarding';
    box.innerHTML=`<strong>SiteForge стал удобнее ✦</strong><p>В версии 8 появился командный центр, проверка сайта, режим фокуса, резервное копирование и новые быстрые действия.</p><div class="v8-onboarding-actions"><button class="v8-mini-btn primary" data-v8-start>Открыть команды</button><button class="v8-mini-btn" data-v8-dismiss>Понятно</button></div>`;
    document.body.appendChild(box);
    $('[data-v8-start]',box).onclick=()=>{ localStorage.setItem(V8_ONBOARD,'1'); box.remove(); openCommand(); };
    $('[data-v8-dismiss]',box).onclick=()=>{ localStorage.setItem(V8_ONBOARD,'1'); box.remove(); };
  }

  document.addEventListener('keydown', e => {
    const mod=e.ctrlKey||e.metaKey;
    if (e.key==='Escape') { closeCommand(); closeSheet(); }
    if (!mod) return;
    const key=e.key.toLowerCase();
    if (key==='k') { e.preventDefault(); openCommand(); }
    if (key==='a' && !/input|textarea|select/i.test(document.activeElement?.tagName||'')) { e.preventDefault(); setLeftTab('blocks'); setTimeout(()=>$('#blockSearch')?.focus(),20); }
    if (key==='p') { e.preventDefault(); click('#previewBtn'); }
    if (key==='q') { e.preventDefault(); openAudit(); }
    if (key==='f' && !/input|textarea/i.test(document.activeElement?.tagName||'')) { e.preventDefault(); toggleClass('v8-focus','focus'); }
  }, true);

  function observeUi() {
    const observer=new MutationObserver(updateStatus);
    const target=$('#appShell'); if(target) observer.observe(target,{subtree:true,attributes:true,childList:true,characterData:true});
  }

  function boot() {
    applyPrefs();
    buildCommandCenter();
    buildTopbar();
    buildStatus();
    observeUi();
    onboarding();
    document.title='SiteForge v8 — визуальный конструктор сайтов';
    window.SiteForgeV8={openCommand,openAudit,backupAllProjects,copyCurrentHtml};
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0)); else setTimeout(boot,0);
})();
