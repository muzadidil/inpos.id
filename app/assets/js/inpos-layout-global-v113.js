/* INPOS Capacitor v1.1.3 - Mobile viewport manager for every POS menu.
   APK-only. Does not change data, auth, printer or server. Idempotent. */
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('inpos-capacitor-native')) return;
  if (window.__INPOS_GLOBAL_LAYOUT_113__) return;
  window.__INPOS_GLOBAL_LAYOUT_113__ = true;
  var doc = document.documentElement;
  var media = window.matchMedia('(max-width:1024px)');
  var orientationHeight = 0;
  var timer = null;
  var delays = [];
  var lastScreen = '';
  var lastKeyboard = false;
  var lastViewport = '';
  var lastNav = '';

  function focusedField() {
    var el = document.activeElement;
    return !!(el && el !== document.body && el !== doc &&
      (el.matches('input,textarea,select,[contenteditable="true"]')));
  }
  function viewportHeight() {
    var vv = window.visualViewport;
    return Math.round((vv && vv.height) || window.innerHeight || doc.clientHeight || 0);
  }
  function navHeight() {
    var nav = document.querySelector('.mobile-bottom');
    if (!nav) return 0;
    var cs = window.getComputedStyle(nav);
    if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
    var r = nav.getBoundingClientRect();
    return r.height > 5 ? Math.round(r.height) : 0;
  }
  function activeScreen() {
    return document.querySelector('.screen.active');
  }
  function apply() {
    timer = null;
    if (!media.matches) {
      doc.style.removeProperty('--inpos-apk-viewport-height');
      doc.style.removeProperty('--inpos-apk-nav-height');
      orientationHeight = 0;
      lastScreen = '';
      lastViewport = '';
      return;
    }
    var raw = viewportHeight();
    var layoutHeight = Math.max(Math.round(window.innerHeight || 0), Math.round(doc.clientHeight || 0), raw);
    var inputFocused = focusedField();
    if (!inputFocused && layoutHeight > orientationHeight) orientationHeight = layoutHeight;
    if (!orientationHeight) orientationHeight = layoutHeight;
    var siteKeyboard = !!(document.body && document.body.classList.contains('mobile-keyboard-open'));
    var keyboard = !!inputFocused && (siteKeyboard || (orientationHeight - raw > 110));
    var value = keyboard && raw >= 260 ? (raw + 'px') : '100dvh';
    // Correct stale --mobile-vvh even when the website's original v218
    // resize listener keeps writing its previous inline pixel height.
    if (value !== lastViewport) {
      doc.style.setProperty('--inpos-apk-viewport-height', value);
      lastViewport = value;
    }
    if (!keyboard && !inputFocused && siteKeyboard && document.body) {
      document.body.classList.remove('mobile-keyboard-open');
    }
    var nh = navHeight() + 'px';
    if (nh !== lastNav) {
      doc.style.setProperty('--inpos-apk-nav-height', nh);
      lastNav = nh;
    }
    var sc = activeScreen();
    var id = sc ? sc.id : '';
    if (lastScreen !== id || lastKeyboard !== keyboard) {
      lastScreen = id;
      lastKeyboard = keyboard;
      // The existing INPOS v320 manager owns per-screen scroll-region
      // sizing, and understands cashier & form action docks. Re-run on
      // relevant transitions rather than overriding all menu heights.
      if (typeof window.syncMobileNativeScrollV320 === 'function') {
        window.requestAnimationFrame(function () {
          try { window.syncMobileNativeScrollV320(); } catch (e) { /* cosmetic */ }
        });
      }
    }
  }
  function schedule() {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(apply, 45);
  }
  function afterKeyboard() {
    // Android IME/visualViewport settles asynchronously; re-check, but
    // never change active input values or force a form to submit.
    [0, 140, 350, 750].forEach(function (ms) {
      delays.push(setTimeout(schedule, ms));
    });
  }
  function resetOrientation() {
    orientationHeight = 0;
    lastViewport = '';
    afterKeyboard();
  }
  function install() {
    apply();
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', resetOrientation, { passive: true });
    window.addEventListener('pageshow', afterKeyboard);
    window.addEventListener('focus', afterKeyboard);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) afterKeyboard(); });
    document.addEventListener('focusin', afterKeyboard, true);
    document.addEventListener('focusout', afterKeyboard, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', schedule, { passive: true });
      window.visualViewport.addEventListener('scroll', schedule, { passive: true });
    }
    var observer = new MutationObserver(function (items) {
      if (items.some(function (m) { return m.attributeName === 'data-mobile-screen' || m.attributeName === 'class'; })) schedule();
    });
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-mobile-screen'] });
    document.querySelectorAll('.screen[id]').forEach(function (screen) {
      observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    });
    if (window.ResizeObserver) {
      var nav = document.querySelector('.mobile-bottom');
      if (nav) new ResizeObserver(schedule).observe(nav);
    }
  }
  // Lightweight local-only layout audit: never includes transaction/PIN data.
  window.INPOSLayoutAudit113 = function () {
    var screen = activeScreen();
    var nav = document.querySelector('.mobile-bottom');
    var region = screen && screen.querySelector('.mobile-primary-scroll-v320');
    var box = screen && screen.getBoundingClientRect();
    return {
      screen: screen ? screen.id : null,
      viewport: doc.style.getPropertyValue('--inpos-apk-viewport-height'),
      keyboard: !!(document.body && document.body.classList.contains('mobile-keyboard-open')),
      bottomBar: nav && getComputedStyle(nav).display !== 'none' ? Math.round(nav.getBoundingClientRect().height) : 0,
      screenHeight: box ? Math.round(box.height) : 0,
      scrollHeight: region ? region.scrollHeight : screen ? screen.scrollHeight : 0,
      scrollClient: region ? region.clientHeight : screen ? screen.clientHeight : 0
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
