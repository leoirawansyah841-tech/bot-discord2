# 🚫 Profanity Filter

Filter kata kasar berbasis Node.js dengan kemampuan mendeteksi berbagai bentuk penyamaran, termasuk **leetspeak**, **unicode font**, **karakter sisipan**, dan **huruf berulang**.

---

## 📦 Instalasi

Tidak memerlukan dependensi eksternal. Cukup salin folder `profanity-filter/` ke dalam project kamu.

```bash
# Jika digunakan sebagai modul dalam project yang sama:
const { filterText } = require('./profanity-filter');
```

---

## 🚀 Cara Penggunaan

### Penggunaan Dasar

```javascript
const { filterText } = require('./profanity-filter');

const hasil = filterText('kamu itu anjing banget sih');
console.log(hasil);
// Output: "kamu itu **anjing** banget sih"
```

### Penggunaan dengan Mode Strict (Deteksi Substring)

```javascript
const { filterTextStrict } = require('./profanity-filter');

const hasil = filterTextStrict('dasar sianjing kamu');
console.log(hasil);
// Output: "dasar **sianjing** kamu"
```

### Cek Satu Kata

```javascript
const { isBadword, normalizeAll } = require('./profanity-filter');

console.log(isBadword(normalizeAll('g0bl0k'))); // true
console.log(isBadword(normalizeAll('halo')));   // false
```

---

## 📋 Contoh Input & Output

| Input | Output |
|-------|--------|
| `kamu anjing banget` | `kamu **anjing** banget` |
| `dasar g0bl0k` | `dasar **g0bl0k** ` |
| `oh sh1t man` | `oh **sh1t** man` |
| `𝙠𝙤𝙣𝙩𝙤𝙡 kamu` | `**𝙠𝙤𝙣𝙩𝙤𝙡** kamu` |
| `a.n.j.i.n.g banget` | `**a.n.j.i.n.g** banget` |
| `fuuuuck this` | `**fuuuuck** this` |
| `k-o-n-t-o-l` | `**k-o-n-t-o-l**` |
| `Halo apa kabar?` | `Halo apa kabar?` (tidak berubah) |

---

## 🗂️ Penjelasan Struktur File

```
profanity-filter/
├── src/
│   ├── filter.js          # Logika utama filter
│   ├── normalize.js       # Pipeline normalisasi teks
│   └── badwords.js        # Daftar kata kasar (Set)
├── test/
│   └── test.js            # Skrip pengujian
├── index.js               # Entry point / public API
└── README.md              # Dokumentasi ini
```

### 📄 `src/normalize.js`

Berisi **5 fungsi normalisasi** yang membentuk pipeline untuk mendeteksi kata kasar yang disamarkan:

| Fungsi | Kegunaan | Contoh |
|--------|----------|--------|
| `normalizeUnicode()` | Konversi font unicode ke ASCII | `𝙠𝙤𝙣𝙩𝙤𝙡` → `kontol` |
| `normalizeLeet()` | Konversi leetspeak | `g0bl0k` → `goblok` |
| `stripInserts()` | Hapus sisipan antar huruf | `a.n.j.i.n.g` → `anjing` |
| `removeDuplicates()` | Hapus huruf berulang | `anjinnng` → `anjing` |
| `normalizeSoundalike()` | Konversi bunyi mirip | `phuck` → `fuk` |
| `normalizeAll()` | Jalankan semua pipeline | — |

> ⚠️ Normalisasi hanya digunakan untuk **pengecekan** — teks asli tetap dipertahankan di output.

### 📄 `src/badwords.js`

Berisi `Set` berisi kata-kata kasar dalam **Bahasa Indonesia** dan **Bahasa Inggris**, dikelompokkan berdasarkan kategori:
- Kata hewan (sebagai hinaan)
- Kata kotoran / jorok
- Kata seksual / alat kelamin
- Kata hinaan umum
- Kata slur diskriminatif
- Kata slang internet

Karena normalisasi sudah ditangani di `normalize.js`, daftar ini hanya memuat kata dalam **bentuk dasar/normal**.

### 📄 `src/filter.js`

Berisi dua fungsi utama:

- **`filterText(text)`** — Filter standar. Mendeteksi per-kata (token).
- **`filterTextStrict(text)`** — Filter ketat. Juga mendeteksi kata kasar yang tersembunyi di dalam kata lain (substring).

### 📄 `index.js`

Entry point yang meng-export semua fungsi publik agar mudah diimpor dari luar.

---

## 🧪 Menjalankan Test

```bash
node test/test.js
```

---

## 📌 Catatan Teknis

- Output menggunakan format **Markdown bold** (`**kata**`)
- Filter bersifat **case-insensitive**
- Teks asli **tidak diubah** kecuali penambahan `**`
- Deteksi dilakukan per **token (kata)**, bukan per karakter
