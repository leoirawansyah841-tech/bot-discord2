# Rencana Implementasi: Fitur Minigames & Ekonomi 🪙

Mari kita ubah interaksi di server menjadi lebih seru dengan sistem **Ekonomi (Uang Virtual / Koin)** dan **Minigames**. Fitur ini akan membuat member lebih betah nongkrong di server karena ada "tujuan" yang bisa dicapai (menimbun kekayaan koin).

## 💡 Konsep Fitur Utama

### 1. Sistem Mata Uang (Koin)
Setiap kali ada member yang aktif *chatting* (dan bukan spam / kata kasar), mereka akan mendapatkan koin secara otomatis (misalnya +5 koin per pesan).
- Data uang ini akan disimpan di file baru bernama `data_economy.json` agar terpisah rapi dari data *leaderboard*.

### 2. Command `/daily` (Bantuan Harian)
Member bisa mengetik `/daily` sekali dalam sehari (setiap 24 jam) untuk mendapatkan uang saku harian.
- Contoh: Diberikan 100 - 500 koin gratis secara acak tiap kali *claim*.

### 3. Command `/dompet` (Cek Saldo)
Untuk mengecek seberapa kaya member tersebut.
- Bot akan menampilkan kartu/teks berisi nama member, total koin yang dimiliki, dan peringkat kekayaannya di server.

### 4. Command `/coinflip` (Minigame Lempar Koin) 🎲
Game judi virtual sederhana. Member bertaruh sejumlah uangnya untuk memutar koin (Kepala atau Ekor).
- **Format:** `/coinflip [pilihan] [jumlah_taruhan]`
- Jika tebakan benar: Taruhan dilipatgandakan (x2) 🤑
- Jika tebakan salah: Taruhan hangus 💸

### 5. Command `/tebakangka` (Minigame Tebak Angka) 🎯
Risiko tinggi, hadiah besar! Member memilih angka dari 1 sampai 10.
- **Format:** `/tebakangka [angka] [jumlah_taruhan]`
- Jika tebakan benar: Taruhan dikali lipat (x5 atau x10) 🚀
- Jika salah: Uang hangus.

## 🛠️ Langkah Pengerjaan (Proposed Changes)

1. **Membuat File Database Baru**
   - [NEW] `data_economy.json` ➔ Penyimpan saldo setiap member beserta data *cooldown* fitur `/daily`.

2. **Memodifikasi `index.js`**
   - Menambahkan struktur data untuk fungsi `loadEconomy()` dan `saveEconomy()`.
   - Mendaftarkan Slash Commands baru: `/dompet`, `/daily`, `/coinflip`, `/tebakangka`.
   - Mengatur logika penambahan koin otomatis (passive income) di dalam *event listener* `messageCreate` sesudah pengecekan kata kasar dan *gibberish*.
   - Membuat *Logic handler* (taruhan menang/kalah dan matematika penambahan saldo) di bagian *Interaction Create*.

## 💬 Pertanyaan untukmu (Open Questions)

Sebelum kita eksekusi, silakan pastikan:
1. Apakah nominal **+5 Koin** per pesan (chat normal) terlalu sedikit atau sudah pas?
2. Apakah nama uangnya mau disebut **"Koin"** saja, atau kamu punya sebutan gaul khusus buat servermu (misal: "Rupiah", "Boba", "Credit", dll)?

Jika *plan* ini sudah sesuai dengan bayanganmu, cukup balas **"setuju gaskan"**, (sekaligus cantumkan nama uangnya kalau mau diubah), dan saya akan mulai menulis kodenya! 🚀
