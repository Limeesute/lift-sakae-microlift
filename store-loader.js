(() => {
  'use strict';
  const script = document.currentScript;
  const params = new URLSearchParams(location.search);
  const slug = params.get('store') || script?.dataset.defaultStore || '';
  const message = document.getElementById('loading-message');
  const fail = (text) => {
    if (message) message.textContent = text;
    document.getElementById('retry')?.removeAttribute('hidden');
  };

  // Keep the initial document and its Google Tag Manager listeners in place.
  function mountTaggedPage(html) {
    const loadingPage = message.closest('main');
    const page = new DOMParser().parseFromString(html, 'text/html');
    page.head.querySelectorAll('meta[charset], meta[name="viewport"], script[data-lift-google-tag]')
      .forEach(node => node.remove());
    const scripts = page.querySelectorAll('script');

    document.head.querySelectorAll('[data-lift-loading]').forEach(node => node.remove());
    document.head.append(...page.head.childNodes);
    loadingPage.replaceWith(...page.body.childNodes);

    // Scripts parsed in a detached document do not run when moved to the page.
    for (const inert of scripts) {
      const active = document.createElement('script');
      for (const {name, value} of inert.attributes) active.setAttribute(name, value);
      active.text = inert.textContent;
      inert.replaceWith(active);
    }

    if (location.hash) {
      try {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
      } catch {
        // Malformed URL fragments do not prevent the page from opening.
      }
    }
  }

  if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug)) {
    fail('店舗のページが見つかりません。リンク先をご確認ください。');
    return;
  }

  fetch('https://lift-lp-public.caringblock.chatgpt.site/api/render/' + encodeURIComponent(slug), {
    credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(20000)
  })
    .then(async response => {
      if (!response.ok) {
        fail(response.status === 404
          ? 'このページは現在公開されていません。'
          : 'ページを読み込めませんでした。時間をおいてお試しください。');
        return;
      }
      const html = await response.text();
      if (!html.startsWith('<!doctype html>')) throw new Error('Invalid page');

      if (document.head.querySelector('script[data-lift-google-tag][src]')) {
        mountTaggedPage(html);
      } else {
        document.open();
        document.write(html);
        document.close();
      }
    })
    .catch(() => fail('ページを読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。'));
})();
