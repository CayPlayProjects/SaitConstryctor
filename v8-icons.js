(() => {
  'use strict';

  const ICONS = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    undo: '<path d="M9 7H5v-4"/><path d="M5 7c2.1-2.3 4.9-3.5 8-3 4.3.7 7.4 4.6 7 9-.4 4.5-4.2 8-8.8 8-3.2 0-6-1.6-7.7-4.1"/>',
    redo: '<path d="M15 7h4v-4"/><path d="M19 7c-2.1-2.3-4.9-3.5-8-3-4.3.7-7.4 4.6-7 9 .4 4.5 4.2 8 8.8 8 3.2 0 6-1.6 7.7-4.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8 20h8M12 16.5V20"/>',
    tablet: '<rect x="5.5" y="2.5" width="13" height="19" rx="2.2"/><path d="M10 18.5h4"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10 5h4M11 18.5h2"/>',
    grip: '<circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.7M6.4 6.4C3.9 8.2 2.5 12 2.5 12S6 18 12 18c1 0 1.9-.2 2.8-.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    arrowUp: '<path d="M12 19V5M6.5 10.5L12 5l5.5 5.5"/>',
    arrowDown: '<path d="M12 5v14M6.5 13.5L12 19l5.5-5.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 15v4h14v-4"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    layers: '<path d="M12 3L3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
    sparkle: '<path d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    folder: '<path d="M3 6.5h7l2 2h9v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5z"/>',
    shield: '<path d="M12 3l7 3v5c0 4.7-2.9 8.1-7 10-4.1-1.9-7-5.3-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    preview: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    focus: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    columns: '<path d="M4 5h6v14H4zM14 5h6v14h-6z"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    check: '<path d="M5 12.5l4 4 10-10"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.6 2.6 0 1 1 4.4 1.9c-1.2.9-2.1 1.3-2.1 3.1M12 17h.01"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    chevronUp: '<path d="M6 14l6-6 6 6"/>',
    chevronDown: '<path d="M6 10l6 6 6-6"/>'
  };

  function svg(name) {
    const body = ICONS[name];
    if (!body) return '';
    return `<svg class="sf-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  function iconOnly(el, name) {
    if (!el || !ICONS[name]) return;
    if (el.querySelector(':scope > .sf-icon')) return;
    el.innerHTML = svg(name);
  }

  function withLeadingIcon(el, name, cleanText) {
    if (!el || !ICONS[name]) return;
    if (el.querySelector(':scope > .sf-icon')) return;
    const text = cleanText ?? el.textContent.replace(/^[＋+✓]\s*/, '').trim();
    el.classList.add('sf-icon-text');
    el.innerHTML = `${svg(name)}<span>${text}</span>`;
  }

  function deviceIcon(btn) {
    if (!btn || btn.querySelector(':scope > .sf-icon')) return;
    const span = btn.querySelector('span');
    const name = btn.dataset.device === 'desktop' ? 'monitor' : btn.dataset.device === 'tablet' ? 'tablet' : 'phone';
    const label = span?.textContent || btn.dataset.device || '';
    btn.innerHTML = `${svg(name)}<span>${label}</span>`;
  }

  function commandIcon(box) {
    if (!box || box.querySelector('.sf-icon')) return;
    const item = box.closest('.v8-command-item');
    const title = item?.querySelector('.v8-command-copy strong')?.textContent?.trim() || '';
    let name = {
      'Добавить блок':'plus', 'Структура страницы':'layers', 'Готовые шаблоны':'sparkle',
      'Настройки сайта':'settings', 'Мои проекты':'folder', 'Импорт проекта':'upload',
      'Экспорт проекта JSON':'download', 'Резервная копия всего':'shield', 'Desktop':'monitor',
      'Tablet':'tablet', 'Mobile':'phone', 'Полный предпросмотр':'preview', 'Режим фокуса':'focus',
      'Презентационный режим':'panel', 'Сетка холста':'grid', 'Компактные панели':'columns',
      'Скачать HTML':'download', 'Скопировать HTML':'code', 'Проверить сайт':'check',
      'Горячие клавиши':'help'
    }[title];
    if (!name) {
      const raw = box.textContent.trim();
      name = ({'＋':'plus','▤':'layers','✦':'sparkle','⚙':'settings','▣':'folder','↥':'upload','↓':'download','⛨':'shield','▱':'monitor','▯':'tablet','◫':'preview','◎':'focus','#':'grid','↔':'columns','<>':'code','✓':'check','?':'help'})[raw];
    }
    if (name) box.innerHTML = svg(name);
  }

  function processButton(btn) {
    if (!(btn instanceof HTMLElement)) return;

    if (btn.id === 'undoBtn') return iconOnly(btn, 'undo');
    if (btn.id === 'redoBtn') return iconOnly(btn, 'redo');
    if (btn.id === 'mobileMenuBtn') return iconOnly(btn, 'menu');
    if (btn.id === 'zoomOutBtn') return iconOnly(btn, 'minus');
    if (btn.id === 'zoomInBtn') return iconOnly(btn, 'plus');
    if (btn.id === 'rightCloseBtn' || btn.matches('[data-close-modal], .v8-sheet-close')) return iconOnly(btn, 'x');
    if (btn.matches('.device-btn[data-device]')) return deviceIcon(btn);
    if (btn.matches('.structure-handle')) return iconOnly(btn, 'grip');

    if (btn.matches('[data-toggle-block]')) {
      const hidden = /показать/i.test(btn.title || '');
      return iconOnly(btn, hidden ? 'eyeOff' : 'eye');
    }
    if (btn.matches('[data-duplicate-block]')) return iconOnly(btn, 'copy');
    if (btn.matches('[data-delete-block]')) return iconOnly(btn, 'trash');
    if (btn.matches('[data-move-item="-1"]')) return iconOnly(btn, 'arrowUp');
    if (btn.matches('[data-move-item="1"]')) return iconOnly(btn, 'arrowDown');
    if (btn.matches('[data-remove-item], [data-remove-simple].danger, .mini-action.danger')) return iconOnly(btn, 'trash');

    if (btn.id === 'newProjectBtn') return withLeadingIcon(btn, 'plus', 'Новый проект');
    if (btn.id === 'v8AddFab') return withLeadingIcon(btn, 'plus', 'Блок');
    if (btn.id === 'v8CheckFab') return withLeadingIcon(btn, 'check', 'Проверка');
    if (btn.matches('.add-item-btn') && /^[＋+]/.test(btn.textContent.trim())) return withLeadingIcon(btn, 'plus');

    const exact = btn.textContent.trim();
    const map = {
      '×':'x','✕':'x','✖':'x','☰':'menu','↶':'undo','↷':'redo','⌕':'search',
      '−':'minus','–':'minus','+':'plus','＋':'plus','▱':'monitor','▯':'tablet',
      '⋮⋮':'grip','⧉':'copy','↑':'arrowUp','↓':'arrowDown','✓':'check'
    };
    if (map[exact]) iconOnly(btn, map[exact]);
  }

  function processRoot(root) {
    if (!(root instanceof Element || root instanceof Document)) return;

    const searchLead = root.matches?.('.search-box > span:first-child') ? root : root.querySelector?.('.search-box > span:first-child');
    if (searchLead && !searchLead.querySelector('.sf-icon')) searchLead.innerHTML = svg('search');

    const commandSearch = root.matches?.('.v8-command-head > span:first-child') ? root : root.querySelector?.('.v8-command-head > span:first-child');
    if (commandSearch && !commandSearch.querySelector('.sf-icon')) commandSearch.innerHTML = svg('search');

    if (root.matches?.('.v8-command-icon')) commandIcon(root);
    root.querySelectorAll?.('.v8-command-icon').forEach(commandIcon);

    if (root.matches?.('button')) processButton(root);
    root.querySelectorAll?.('button').forEach(processButton);
  }

  function init() {
    processRoot(document);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) processRoot(node);
          else if (node.parentElement?.matches('button,.v8-command-icon,.search-box>span:first-child,.v8-command-head>span:first-child')) processRoot(node.parentElement);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
