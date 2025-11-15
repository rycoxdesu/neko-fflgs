# Panduan Build Aplikasi Neko's FastFlags Saver

## Prasyarat
Pastikan Anda telah menginstal Node.js dan npm di sistem Anda.

## Instalasi Dependencies
Sebelum membangun aplikasi, instal dependencies terlebih dahulu:

```bash
npm install
```

## Menjalankan Aplikasi dalam Mode Development
Untuk menjalankan aplikasi tanpa build:

```bash
npm start
```

## Membuat Build Aplikasi

### 1. Build Installer (NSIS) - Default
```bash
npm run dist
```
Perintah ini akan membuat installer .exe menggunakan NSIS di folder `dist/`.

### 2. Build Versi Portable
```bash
npm run dist:portable
```
Perintah ini akan membuat file .exe portable di folder `dist/` yang bisa langsung dijalankan tanpa proses instalasi.

### 3. Build Kedua Versi Sekaligus
```bash
npm run dist:all
```
Perintah ini akan membuat kedua versi (installer dan portable) sekaligus.

## Lokasi Output Build
File build akan tersedia di folder:
- `dist/` untuk installer NSIS
- `dist/` juga untuk versi portable

## Struktur Folder Setelah Build Portable
Versi portable akan berisi semua file yang diperlukan untuk menjalankan aplikasi tanpa perlu instalasi. File-file tersebut mencakup:
- Electron executable
- Aplikasi Anda (file HTML, CSS, JavaScript)
- Dependencies Node.js
- Ikon aplikasi

## Alternatif: Membuat Build Manual
Jika command build tidak berfungsi karena file sedang digunakan, coba langkah-langkah berikut:

1. Pastikan semua proses Electron terkait aplikasi telah ditutup
2. Hapus folder `dist/` jika ada:
   ```bash
   rmdir /s /q dist
   ```
3. Jalankan perintah build kembali:
   ```bash
   npm run dist:portable
   ```

## Alternatif 2: Membuat Versi Portable Secara Manual
Jika build electron-builder tidak berfungsi, Anda bisa membuat versi portable secara manual:

1. Jalankan aplikasi dalam mode development untuk memastikan semuanya berfungsi:
   ```bash
   npm start
   ```

2. Jika ingin menyebarkan aplikasi, Anda bisa membuat folder dengan struktur berikut:
   ```
   NekoFastFlagsPortable/
   ├── electron.exe (dari Electron prebuilt)
   ├── resources/
   │   └── app/
   │       ├── main.js
   │       ├── index.html
   │       ├── loading.html
   │       ├── style.css
   │       ├── renderer.js
   │       ├── preload.js
   │       ├── cute2.ico
   │       └── package.json
   └── cute2.ico
   ```

3. Unduh Electron prebuilt dari https://github.com/electron/electron/releases
4. Ekstrak ke folder dan pindahkan file-file aplikasi Anda ke dalam folder `resources/app/`
5. Ganti nama electron.exe sesuai kebutuhan

## Catatan
- Build akan menghasilkan file .exe untuk Windows
- Versi portable berguna untuk penggunaan langsung tanpa harus menginstal aplikasi
- Ukuran file build portable biasanya lebih besar dari versi installer karena menyertakan runtime Electron secara lengkap
- Jika build gagal karena "file sedang digunakan", pastikan tidak ada instance dari aplikasi yang masih berjalan

## Troubleshooting
Jika mengalami masalah saat build:
1. Pastikan Anda menggunakan Node.js versi yang kompatibel
2. Bersihkan cache npm jika perlu: `npm cache clean --force`
3. Hapus folder node_modules dan instal ulang: `rm -rf node_modules && npm install`
4. Tutup semua instance aplikasi sebelum build
5. Jalankan command prompt sebagai administrator
6. Restart komputer jika file masih terkunci