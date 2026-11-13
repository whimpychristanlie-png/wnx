# Whimpy & Xinxin — revisi Rumah 30

Paket ZIP ini berisi proyek lengkap dengan seluruh revisi Rumah 30 dan lagu unggahan Anda. Belum diunggah ke GitHub atau Vercel.

## Cara memakai ZIP

1. Ekstrak `undangan-whimpy-xinxin-rumah30.zip`.
2. Buka folder hasil ekstrak sampai terlihat `package.json`, `src`, `public`, `api`, `scripts`, dan `undangan`.
3. Untuk mengganti proyek di GitHub, unggah isi folder tersebut ke akar repository. `package.json`, `src`, dan `public` harus sejajar; jangan memasukkan seluruh proyek ke dalam `src` atau `undangan`.
4. Pertahankan semua subfolder. Khususnya `src/components`, `src/data`, `src/game`, `src/hooks`, dan `src/services` harus ikut diunggah. Jangan hanya mengunggah `App.tsx` dan `main.tsx`.
5. Simpan perubahan di GitHub. Jika repository sudah terhubung ke Vercel, tunggu deployment baru selesai.
6. Untuk menjalankan di komputer: gunakan Node.js, lalu jalankan `npm ci` dan `npm run dev`. Untuk mengecek sebelum deploy, jalankan `npm run build`.

`node_modules` dan `dist` sengaja tidak disertakan; keduanya dibuat otomatis dari kode sumber. Jangan mengunggah file ZIP saja ke GitHub sebagai pengganti isi proyek.

## Nama tamu tanpa daftar tamu

Tambahkan `?to=Nama+Tamu` pada alamat website. Tanda `+` berarti spasi; Anda dapat membuat link per tamu secara manual kapan saja.

- Halaman game: `/?to=Andi+dan+Keluarga`
- Halaman baca undangan: `/undangan/?to=Andi+dan+Keluarga`

Nama yang muncul pada sampul adalah **Andi dan Keluarga**. Tanpa parameter nama, tampil **Tamu Undangan**. Nama Mandarin juga dapat digunakan. Untuk tanda `&` di dalam nama, tulis `%26`.

## Sudah diterapkan

- Sampul ivory–sage dengan latar courtyard Rumah 30, nama Whimpy & Xinxin, tanggal, nama tamu dari parameter `?to=`, dan tombol bilingual.
- Peta RPG Rumah 30 yang disetujui, pasangan berjas hitam dan gaun putih, tamu dengan pakaian modern, serta koordinat navigasi yang menyesuaikan ilustrasi baru.
- Menu sage–ivory, instruksi Indonesia–Mandarin, dan tombol langsung membaca undangan.
- Profil mempelai pria dahulu, informasi keluarga, serta satu ayat Kolose 3:14 dalam Indonesia dan Mandarin. Bio, kuis, Instagram kosong, dan ucapan contoh tidak ditampilkan.
- Kartu pemberkatan dan resepsi, Maps, kalender, serta empat contoh warna Garden Semi-Formal.
- Photobooth dengan latar Rumah 30 dan tiga bingkai baru, nama, tanggal, pilihan pose, dan ekspor PNG.

## Informasi acara

Minggu, 20 Desember 2026 — Rumah 30, Bogor.
Pemberkatan 15.00 WIB sampai selesai; resepsi 17.00–20.00 WIB.
Jam selesai pemberkatan tidak diasumsikan dalam kalender.

## Validasi

`npm run build` beserta seluruh pemeriksaan proyek lolos. Alur sampul, pemilihan karakter, menu mempelai/acara, versi baca, dan penyimpanan foto karakter telah diuji di browser. Pengujian ini belum mencakup iPhone/Safari atau kamera perangkat tamu.

## Sebelum undangan dibagikan

- Musik undangan telah diganti menjadi file MP3 unggahan Anda: 告白气球 (Love Confession) — 周杰伦 Jay Chou, di `public/assets/audio/gao-bai-qi-qiu.mp3`. Lagu diputar berulang setelah undangan dibuka; musik game tetap bawaan.
- Isi `VITE_SITE_URL` dengan domain final untuk pratinjau tautan.
- Hubungkan `DATABASE_URL` dan `SENDER_SALT` mengikuti README agar RSVP dan ucapan tersimpan online. Tampilan RSVP sudah ada, tetapi koneksi database produksi belum diverifikasi.
- Uji pada iPhone/Safari dan Android/Chrome setelah diunggah.

## Berkas

ZIP ini sudah berisi seluruh kode dan aset, sehingga tidak perlu menerapkan patch revisi lama. `COPY-PASTE.md` adalah referensi opsional untuk file teks yang berubah dibanding proyek awal. Untuk unggahan lengkap, gunakan file serta folder aslinya di paket ini.

Halaman `/undangan/` memakai 告白气球 setelah tombol Buka Undangan ditekan, lalu mengulangnya. Halaman game `/` tetap memakai musik game bawaan sesuai pilihan Anda.
