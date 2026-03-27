'use strict';

const DEFAULT_CONFIG = { urls: [], direction: 'horizontal' };

let config = { ...DEFAULT_CONFIG };
let pendingConfig = null; // draft while the settings panel is open
let maximizedIndex = null;

// ── Storage ────────────────────────────────────────────────────────────────

async function loadConfig() {
  const data = await chrome.storage.sync.get(['urls', 'direction']);
  config = {
    urls: Array.isArray(data.urls) ? data.urls : [],
    direction: data.direction === 'vertical' ? 'vertical' : 'horizontal',
  };
}

async function persistConfig() {
  await chrome.storage.sync.set({ urls: config.urls, direction: config.direction });
}

// ── Frame rendering ────────────────────────────────────────────────────────

function renderFrames() {
  const container = document.getElementById('frames-container');
  container.innerHTML = '';
  container.className = config.direction;
  maximizedIndex = null;

  if (config.urls.length === 0) {
    container.innerHTML = `
      <div id="empty-state">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <p>No URLs configured</p>
        <p class="hint">Click ⚙ in the bottom-right corner to add URLs</p>
      </div>`;
    return;
  }

  const multiFrame = config.urls.length > 1;

  config.urls.forEach((url, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'frame-wrapper';

    if (multiFrame) {
      wrapper.appendChild(createHandle(url, i));
    }

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
    wrapper.appendChild(iframe);

    container.appendChild(wrapper);
  });
}

function createHandle(url, index) {
  const handle = document.createElement('div');
  handle.className = 'frame-handle';

  const title = document.createElement('span');
  title.className = 'frame-title';
  try {
    title.textContent = new URL(url).hostname;
  } catch {
    title.textContent = url;
  }
  title.title = url;

  const btn = document.createElement('button');
  btn.className = 'max-btn';
  btn.innerHTML = '⤢';
  btn.title = 'Maximize';

  handle.appendChild(title);
  handle.appendChild(btn);

  // Clicking anywhere on the handle (or the button) toggles maximize
  handle.addEventListener('click', () => toggleMaximize(index));
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(index); });

  return handle;
}

function toggleMaximize(index) {
  maximizedIndex = (maximizedIndex === index) ? null : index;
  applyMaximizeState();
}

function applyMaximizeState() {
  document.querySelectorAll('.frame-wrapper').forEach((wrapper, i) => {
    const btn = wrapper.querySelector('.max-btn');
    wrapper.classList.remove('maximized', 'minimized');

    if (maximizedIndex !== null) {
      if (i === maximizedIndex) {
        wrapper.classList.add('maximized');
        if (btn) { btn.innerHTML = '⤡'; btn.title = 'Restore'; }
      } else {
        wrapper.classList.add('minimized');
        if (btn) { btn.innerHTML = '⤢'; btn.title = 'Maximize'; }
      }
    } else {
      if (btn) { btn.innerHTML = '⤢'; btn.title = 'Maximize'; }
    }
  });
}

// ── Settings panel ─────────────────────────────────────────────────────────

function openSettings() {
  pendingConfig = { urls: [...config.urls], direction: config.direction };
  refreshSettingsUI();
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('url-input').focus();
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
  pendingConfig = null;
}

function refreshSettingsUI() {
  // Rebuild URL list
  const list = document.getElementById('url-list');
  list.innerHTML = '';
  pendingConfig.urls.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'url-item';

    const text = document.createElement('span');
    text.className = 'url-text';
    text.textContent = url;
    text.title = url;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      pendingConfig.urls.splice(i, 1);
      refreshSettingsUI();
    });

    item.appendChild(text);
    item.appendChild(removeBtn);
    list.appendChild(item);
  });

  // Sync direction buttons
  document.getElementById('dir-horizontal').classList.toggle('selected', pendingConfig.direction === 'horizontal');
  document.getElementById('dir-vertical').classList.toggle('selected', pendingConfig.direction === 'vertical');
}

async function saveSettings() {
  config = { urls: [...pendingConfig.urls], direction: pendingConfig.direction };
  await persistConfig();
  closeSettings();
  renderFrames();
}

function addUrl() {
  const input = document.getElementById('url-input');
  let url = input.value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  pendingConfig.urls.push(url);
  input.value = '';
  refreshSettingsUI();
  input.focus();
}

function initListeners() {
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-cancel').addEventListener('click', closeSettings);
  document.getElementById('settings-save').addEventListener('click', saveSettings);

  // Click backdrop to close
  document.getElementById('settings-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-overlay')) closeSettings();
  });

  document.getElementById('url-add-btn').addEventListener('click', addUrl);
  document.getElementById('url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addUrl();
  });

  document.getElementById('dir-horizontal').addEventListener('click', () => {
    pendingConfig.direction = 'horizontal';
    refreshSettingsUI();
  });
  document.getElementById('dir-vertical').addEventListener('click', () => {
    pendingConfig.direction = 'vertical';
    refreshSettingsUI();
  });
}

// ── Init ───────────────────────────────────────────────────────────────────

async function init() {
  await loadConfig();
  renderFrames();
  initListeners();
}

init();
