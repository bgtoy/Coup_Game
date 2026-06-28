# Coup Online

Versi modern dari game board **Coup** — main online atau via LAN bersama teman.

Tampilan baru bertema *dark modern casino* ("Underground Parlor"), dibangun di atas
backend Node.js + Socket.IO dan frontend React.

---

## Struktur Project

```
coup-online/
├── server/        → backend (Express + Socket.IO)
└── coup-client/    → frontend (React)
```

---

## Menjalankan di komputer sendiri (development)

### 1. Jalankan server

```bash
cd server
npm install
npm start
```

Setelah jalan, terminal akan menampilkan sesuatu seperti:

```
========================================
  Coup Online server is running
========================================
  Local:    http://localhost:8000
  Network:  http://192.168.1.23:8000
========================================
```

Catat alamat **Network** — itu yang dipakai pemain lain di LAN yang sama untuk connect.

### 2. Jalankan client

Di terminal baru:

```bash
cd coup-client
npm install
npm start
```

Client akan terbuka di `http://localhost:3000`. Secara default, client otomatis
menebak alamat backend berdasarkan hostname yang dipakai untuk membuka halaman —
jadi **tidak perlu konfigurasi tambahan** untuk LAN play, asal client dan server
dijalankan di komputer yang sama (host).

---

## Main via LAN (tanpa internet)

1. Jalankan **server** dan **client** di satu komputer (host), seperti di atas.
2. Lihat alamat **Network** yang ditampilkan server (misalnya `192.168.1.23`).
3. Pemain lain yang terhubung ke Wi-Fi/router yang sama membuka browser dan akses:
   ```
   http://192.168.1.23:3000
   ```
   (ganti dengan IP yang muncul di terminal server-mu)
4. Client otomatis mendeteksi bahwa ia diakses lewat IP itu, dan akan
   menyambungkan socket ke `http://192.168.1.23:8000` secara otomatis.
5. Selesai — semua pemain di jaringan yang sama bisa Create/Join Game seperti biasa.

> 💡 Tips: Pastikan firewall di komputer host mengizinkan koneksi masuk ke port `3000` dan `8000`.

---

## Main Online (lewat internet)

Untuk bermain online, server dan client perlu di-deploy ke layanan hosting
(misalnya Render, Railway, Fly.io untuk server; Vercel/Netlify untuk client).

1. Deploy folder `server/` ke layanan backend pilihanmu. Catat URL publiknya,
   misal `https://coup-server.onrender.com`.
2. Di folder `coup-client/`, buat file `.env` (copy dari `.env.example`) dan isi:
   ```
   REACT_APP_BACKEND_URL=https://coup-server.onrender.com
   ```
3. Build dan deploy client:
   ```bash
   cd coup-client
   npm run build
   ```
   Upload folder `build/` ke layanan hosting statis pilihanmu.

Jika `REACT_APP_BACKEND_URL` tidak diisi, client akan otomatis menebak backend
ada di hostname yang sama port `8000` — cocok untuk LAN, tapi untuk deploy online
disarankan selalu set variabel ini secara eksplisit.

---

## Cara Main (ringkas)

- 2–6 pemain. Setiap pemain mulai dengan 2 coin dan 2 influence (kartu rahasia).
- Setiap giliran pilih satu aksi: Income, Foreign Aid, Tax, Steal, Exchange,
  Assassinate, atau Coup.
- Beberapa aksi bisa di-**challenge** (jika kamu pikir lawan bohong soal kartu
  yang diklaim) atau di-**block** oleh pemain lain.
- Kalau kehabisan influence, kamu keluar dari permainan.
- Pemain terakhir yang masih punya influence, menang.

Detail lengkap tersedia di tombol **Rules** dan **Cheat Sheet** di dalam game.

---

## Apa yang baru di versi ini?

- 🎨 Desain ulang total — tema dark modern, lebih nyaman dipakai di HP maupun desktop
- ⚡ Upgrade ke React 18 + Socket.IO v4 (lebih stabil)
- 🌐 Dukungan LAN otomatis — tidak perlu konfigurasi manual untuk main bareng di jaringan lokal
- 🔒 Validasi giliran di server (mencegah pemain beraksi di luar gilirannya)
- 🧩 Drag-and-drop urutan pemain di lobby tanpa dependency eksternal
- 🔄 **Reconnect otomatis** — kalau koneksi putus di tengah permainan (WiFi kedip, refresh halaman,
  dsb), pemain bisa kembali ke kursi yang sama dengan coin dan kartu yang masih sama, asalkan
  membuka kembali tab/halaman yang sama (token reconnect disimpan di sessionStorage browser).
  Pemain lain akan melihat status "terputus" sementara, dan log "X reconnected" saat dia kembali.

### Catatan tentang reconnect

- Reconnect bekerja otomatis selama kamu membuka kembali game di **tab/browser yang sama** tempat
  kamu bermain sebelumnya — termasuk setelah **reload/refresh halaman penuh**. Begitu halaman
  dimuat ulang, app otomatis mendeteksi sesi yang tersimpan dan langsung mencoba menyambung
  kembali ke game, tanpa perlu input nama/room code lagi.
- Selama mencoba menyambung kembali, kamu akan melihat layar "Reconnecting to your game…".
  Kalau berhasil, kamu langsung kembali ke meja dengan coin dan kartu yang sama persis seperti
  sebelum disconnect.
- Kalau room sudah tidak ada lagi (server di-restart, game sudah benar-benar selesai, dst.), kamu
  akan otomatis dikembalikan ke halaman Home.
- Token sesi disimpan per-tab (`sessionStorage`), bukan per-akun — jadi kalau ganti device atau
  buka tab baru, dia dianggap pemain baru, bukan reconnect ke pemain lama.
- Saat masih di **lobby** (sebelum game dimulai) dan kamu reload, kamu juga akan otomatis kembali
  ke kursi yang sama di party list — termasuk status "host" kalau sebelumnya kamu adalah host.

