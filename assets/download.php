<?php
/** Download only the official APK explicitly uploaded by the site owner. */
declare(strict_types=1);
$apk=__DIR__.'/downloads/INPOS.apk';
if (!is_file($apk) || !is_readable($apk) || filesize($apk)<100000) {
 http_response_code(503);header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');
 echo '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download INPOS</title><body style="font:16px system-ui;background:#fff7f8;color:#3b1b20;max-width:540px;margin:14vh auto;padding:24px"><h2>APK belum tersedia</h2><p>File APK resmi belum dipublikasikan. Silakan hubungi Admin INPOS.</p><a href="/">Kembali ke beranda</a></body></html>';exit;
}
header('Content-Type: application/vnd.android.package-archive');
header('Content-Disposition: attachment; filename="INPOS.apk"');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-transform, max-age=60');
header('Content-Length: '.filesize($apk));
readfile($apk);
