cPanel: Menu Domains / Subdomains untuk membuat inpos.id, app, adms, api, shop.
Root upload HTML statis berbeda untuk tiap domain, tentukan sendiri di cPanel.
Di Setup Node.js App, gunakan app root /home/USER/inpos-api dan startup app.js.
Aplikasi Node harus diarahkan melalui Passenger, bukan mengunggah folder backend ke public_html.
Jika CloudLinux memberi virtual environment, jalankan perintah shell `source .../bin/activate` sesuai baris yang tercantum di panel.
Password DB, JWT_SECRET, CSRF_SECRET, kode undangan, dan PIN awal admin/owner wajib diganti sesudah login pertama.
