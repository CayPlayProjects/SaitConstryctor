(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);

  const ICONS = {
    desktop: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8 20h8M12 16.5V20"/>',
    tablet: '<rect x="5.5" y="2.5" width="13" height="19" rx="2.2"/><path d="M10 18.5h4"/>',
    mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10 5h4M11 18.5h2"/>'
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }

  function dockBottomUi() {
    const workspace = $('.workspace');
    const status = $('#v8Statusbar');
    if (!workspace || !status) return false;

    if (!status.classList.contains('v8-statusbar-docked')) {
      status.classList.add('v8-statusbar-docked');
      workspace.appendChild(status);
    }

    const fab = $('.v8-fab');
    const rightGroup = status.querySelector('.v8-status-group:last-child');
    if (fab && rightGroup && !rightGroup.querySelector('.v8-docked-actions')) {
      const actions = document.createElement('span');
      actions.className = 'v8-docked-actions';
      while (fab.firstChild) actions.appendChild(fab.firstChild);
      rightGroup.prepend(actions);
      fab.remove();
    }

    return true;
  }

  function setPreviewDevice(modal, mode) {
    modal.dataset.previewDevice = mode;
    modal.querySelectorAll('[data-preview-device]').forEach(btn => {
      const active = btn.dataset.previewDevice === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function enhancePreview() {
    const modal = $('#previewModal');
    if (!modal) return false;

    const header = modal.querySelector('.modal-header');
    const actions = modal.querySelector('.modal-header-actions');
    if (!header || !actions) return false;

    if (!modal.querySelector('.preview-device-switch')) {
      const switcher = document.createElement('div');
      switcher.className = 'preview-device-switch';
      switcher.setAttribute('role', 'group');
      switcher.setAttribute('aria-label', 'Размер полного предпросмотра');
      switcher.innerHTML = `
        <button class="preview-device-btn active" data-preview-device="desktop" type="button" aria-pressed="true" title="Компьютер">
          ${icon('desktop')}<span>Desktop</span>
        </button>
        <button class="preview-device-btn" data-preview-device="tablet" type="button" aria-pressed="false" title="Планшет">
          ${icon('tablet')}<span>Tablet</span>
        </button>
        <button class="preview-device-btn" data-preview-device="mobile" type="button" aria-pressed="false" title="Телефон">
          ${icon('mobile')}<span>Mobile</span>
        </button>`;
      header.insertBefore(switcher, actions);
      switcher.addEventListener('click', event => {
        const button = event.target.closest('[data-preview-device]');
        if (!button) return;
        setPreviewDevice(modal, button.dataset.previewDevice);
      });
    }

    if (!modal.dataset.previewDevice) setPreviewDevice(modal, 'desktop');

    const syncOpenState = () => {
      const open = !modal.hidden;
      document.body.classList.toggle('v8-preview-open', open);
      if (open) setPreviewDevice(modal, 'desktop');
    };

    if (!modal.dataset.previewObserverReady) {
      modal.dataset.previewObserverReady = '1';
      new MutationObserver(syncOpenState).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
    }

    syncOpenState();
    return true;
  }

  function boot() {
    enhancePreview();

    if (!dockBottomUi()) {
      const observer = new MutationObserver(() => {
        if (dockBottomUi()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 5000);
    }

    setTimeout(dockBottomUi, 80);
    setTimeout(dockBottomUi, 240);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 30), { once: true });
  } else {
    setTimeout(boot, 30);
  }
})();
