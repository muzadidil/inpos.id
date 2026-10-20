<?php
// Referral route for https://inpos.id/KODEREFERRAL; code validity checked by API on registration.
$path=(string)(parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH)??'/');
if (preg_match('~^/([A-Za-z0-9]{7,11})/?$~D',$path,$m)) {
  header('Cache-Control: no-store');
  header('Location: https://login.inpos.id/?ref='.rawurlencode(strtoupper($m[1])),true,302);exit;
}
http_response_code(404);header('Content-Type: text/plain; charset=utf-8');echo 'Halaman tidak ditemukan.';
