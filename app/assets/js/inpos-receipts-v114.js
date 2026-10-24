/* INPOS v1.1.4: Web + Capacitor thermal receipt and PNG-sharing adapter.
   Never sends transaction data to another server. Native share uses Android share sheet. */
(function () {
  'use strict';
  if (window.INPOSReceipt114) return;
  function isNative() {
    try {
      return window.Capacitor?.isNativePlatform?.() === true ||
        window.__INPOS_CAPACITOR_APK__ === true ||
        /INPOSCapacitor\//.test(navigator.userAgent || '');
    } catch (_) { return false; }
  }
  function width() {
    try { return String(window.db?.settings?.receiptWidth || '58') === '80' ? '80' : '58'; }
    catch (_) { return '58'; }
  }
  async function printText(text) {
    if (!isNative()) return false;
    const printer = window.INPOSBluetoothClassic;
    if (!printer || typeof printer.printText !== 'function') {
      throw Error('Printer Android belum siap. Buka Pengaturan > Printer & Struk, lalu pilih printer.');
    }
    await printer.printText(String(text || ''));
    return true;
  }
  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = fileName;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  async function shareCanvas(canvas, fileName, title) {
    if (!canvas || typeof canvas.toBlob !== 'function') throw Error('Gambar struk tidak tersedia.');
    const safeName = String(fileName || 'struk-inpos.png').replace(/[^a-z0-9._-]/gi, '-');
    if (isNative()) {
      const plugin = window.Capacitor?.Plugins?.INPOSShare;
      if (!plugin || typeof plugin.sharePng !== 'function') {
        throw Error('Fitur Share PNG native belum siap. Perbarui APK INPOS.');
      }
      // The canvas is temporary (a newly rendered receipt), not an
      // on-screen chart. Release its backing bitmap even when sharing fails.
      try {
        const dataUrl = canvas.toDataURL('image/png');
        await plugin.sharePng({base64: dataUrl.slice(dataUrl.indexOf(',')+1), fileName:safeName, title: String(title || 'Struk INPOS')});
        return true;
      } finally {
        canvas.width = 1;
        canvas.height = 1;
      }
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw Error('Gagal membuat gambar struk.');
    if (typeof File === 'function' && navigator.share) {
      const file = new File([blob], safeName, {type:'image/png'});
      if (!navigator.canShare || navigator.canShare({files:[file]})) {
        try { await navigator.share({title:String(title||'Struk INPOS'),files:[file]}); return true; }
        catch (e) { if (e?.name === 'AbortError') return false; }
      }
    }
    downloadBlob(blob,safeName);
    return true;
  }
  window.INPOSReceipt114 = {isNative, printText, shareCanvas, width};
})();
