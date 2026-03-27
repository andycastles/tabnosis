# Tabnosis

A Chrome extension that displays one or more websites as your new tab page — without redirecting away and without stealing focus from the address bar.

## The problem it solves

Browser extensions that redirect the new tab to an external URL cause the page to take focus, breaking Chrome's default behaviour of placing the cursor in the address bar when you open a new tab. This extension avoids that by embedding sites in full-viewport `<iframe>`s directly within the extension's own page.

## Features

- **Any URL** — embed any website, not just Trello
- **Multiple URLs** — add as many as you like; they split the screen equally
- **Split direction** — choose side-by-side (horizontal) or stacked (vertical)
- **Accordion focus** — click the handle bar of any iframe to maximise it; the others collapse to a slim strip. Click again to restore equal splits.
- **Persistent config** — settings are saved via `chrome.storage.sync`

## How it works

1. **New tab override** — `manifest.json` replaces Chrome's new tab page with `newtab.html`.
2. **Iframe embed** — `newtab.html` renders a full-screen flex layout of `<iframe>`s loaded from your saved config.
3. **Header stripping** — sites often set `x-frame-options` and `content-security-policy` headers that block iframes. `rules.json` uses Chrome's `declarativeNetRequest` API to remove those headers from all sub-frame responses, allowing the embeds to work.

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the repository folder.

## Configuration

Click the **⚙** button in the bottom-right corner of any new tab to open Settings:

- **URLs** — add or remove the URLs you want to display
- **Split Direction** — choose *Side by side* or *Stacked*

Click **Save & Apply** to apply the changes.

## Accordion (maximize/restore)

When two or more URLs are configured, each iframe has a slim handle bar showing its domain. Click the handle bar (or the **⤢** button) to maximise that iframe. The others collapse to a thin strip — click any of them to switch focus. Click **⤡** to restore equal splits.

