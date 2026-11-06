'use strict';

// One canonical, coupon-selected booking destination for every primary CTA.
const bookingUrl = 'https://beauty.hotpepper.jp/CSP/kr/reserve/?storeId=H000805569&couponId=CP00000012568729&add=2&addMenu=0&rootCd=10&wak=KPCO100001_link_special_coupon';
document.querySelectorAll('[data-booking]').forEach(link => {
  link.href = bookingUrl;
  link.addEventListener('click', () => {
    // A CTA click is a booking intent, not a completed reservation.
    window.dispatchEvent(new CustomEvent('booking-intent', {
      detail: { position: link.dataset.position, destination: bookingUrl }
    }));
  });
});

const sticky = document.querySelector('.sticky-reserve');
const heroOffer = document.querySelector('.hero-offer');
const finalOffer = document.querySelector('.final-offer');
let heroVisible = true;
let finalVisible = false;
function updateSticky() {
  const visible = !heroVisible && !finalVisible;
  sticky.classList.toggle('visible', visible);
  sticky.inert = !visible;
  sticky.setAttribute('aria-hidden', String(!visible));
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === heroOffer) heroVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
      if (entry.target === finalOffer) finalVisible = entry.isIntersecting;
    }
    updateSticky();
  }, {threshold: 0});
  observer.observe(heroOffer);
  observer.observe(finalOffer);
} else {
  sticky.classList.add('visible');
}
updateSticky();
