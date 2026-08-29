# Maskara

Aplikasi data masking pasien berbasis React + Vite. Semua data diproses lokal di browser dan tidak dikirim ke server.

## Fitur

- Input CSV, TXT, XLSX, dan XLS
- Deteksi otomatis nama, email, tanggal lahir, nomor HP, alamat, dan ID pasien
- Mendukung berbagai nama kolom teknis dan alias SQL
- Mengenali data pasien maupun penyedia layanan seperti nama, kode, email, telepon, dan alamat
- Mapping/override tipe masking per kolom
- Nama dimasking parsial sesuai panjang kata, misalnya `Budi Ahmad Putra` menjadi `B*** ***** *****`
- Nomor dan kode dimasking parsial, misalnya `ABC123456` menjadi `ABC******`
- Masking deterministik: nilai sumber yang sama menghasilkan samaran yang sama dalam satu file
- Output CSV UTF-8
- Tema shadcn Zinc, Slate, Gray, Neutral, dan Stone dengan light/dark mode
- Static prerender shell untuk first paint dan fallback tanpa JavaScript

## Jalankan lokal

```bash
npm install
npm run dev
```

## Deploy ke Cloudflare Pages

Hubungkan repository ini ke Cloudflare Pages lalu gunakan:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22` atau lebih baru

File `_headers` dan `_redirects` pada folder `public` otomatis disertakan ke hasil build.

## Struktur

- `src/app` — composition root aplikasi
- `src/components/ui` — primitive shadcn yang reusable
- `src/components/layout` — header dan footer
- `src/components/shared` — komponen lintas fitur
- `src/features/data-masking` — UI, parser, tipe, dan masking engine
- `src/hooks` — reusable application hooks
