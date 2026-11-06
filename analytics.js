(() => {
  'use strict';

  if (window.__liftAnalyticsInitialized) return;
  const measurementId = window.LIFT_ANALYTICS_CONFIG?.measurementId?.trim();
  if (!/^G-[A-Z0-9]{6,20}$/.test(measurementId || '')) return;

  const current = new URL(window.location.href);
  const page = new URL(current.origin + current.pathname);
  const campaignKeys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_id',
    'utm_content', 'utm_term', 'utm_source_platform'
  ];
  campaignKeys.forEach(key => {
    const value = current.searchParams.get(key);
    if (value) page.searchParams.set(key, value.slice(0, 100));
  });
  let referrer = '';
  try {
    const previous = new URL(document.referrer);
    if (previous.protocol === 'https:' || previous.protocol === 'http:') {
      referrer = previous.origin + previous.pathname;
    }
  } catch {
    // Direct visits have no referrer.
  }

  window.__liftAnalyticsInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    page_location: page.href,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(tag);

  const notice = document.getElementById('analytics-notice');
  if (notice) notice.hidden = false;

  function track(name, parameters) {
    window.gtag('event', name, {
      ...parameters,
      send_to: measurementId,
      page_location: page.href,
      page_referrer: referrer
    });
  }

  const positions = new Set(['header', 'hero', 'cases', 'final', 'sticky']);
  window.addEventListener('booking-intent', event => {
    const position = event.detail?.position;
    if (!positions.has(position)) return;
    // This measures a click toward Hot Pepper, never a completed reservation.
    track('booking_click', {
      cta_position: position,
      booking_provider: 'hotpepper',
      service_name: 'microlift_cheeks'
    });
  });

  document.addEventListener('click', event => {
    const link = event.target?.closest?.('a[href^="tel:"]');
    if (!link) return;
    track('phone_click', {
      cta_position: link.closest('.final-offer') ? 'final' : 'access'
    });
  });
})();
