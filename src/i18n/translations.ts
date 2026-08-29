export type Language = 'id' | 'en'

const id = {
  theme:'THEME', color:'WARNA', local:'100% lokal di browser', home:'Kembali ke awal', chooseColor:'Pilih warna tema', dark:'Gunakan mode gelap', light:'Gunakan mode terang',
  privacy:'PRIVASI DATA, TANPA RIBET', headline:'Samarkan data pribadi.', headlineAccent:'Aman, cepat, lokal.', intro:'Upload hasil query Anda, biarkan Maskara mengenali data sensitif secara otomatis, lalu download file yang sudah aman.', drop:'Tarik & lepas file di sini', or:'atau', chooseFile:'Pilih file', reading:'Membaca file...',
  noServer:'Tidak ada upload server', noServerDesc:'Data tidak pernah meninggalkan perangkat', smart:'Deteksi kolom pintar', smartDesc:'Kenali berbagai nama kolom & alias SQL', csvReady:'Output siap pakai', csvReadyDesc:'Format mengikuti jenis file input',
  changeFile:'Ganti file', config:'KONFIGURASI MASKING', review:'Periksa hasil deteksi', reviewDesc:'Kami sudah menebak tipe data. Anda tetap memegang kendali penuh.', rows:'baris', columns:'kolom', sensitive:'data sensitif terdeteksi', basedOn:'berdasarkan nama kolom dan alias SQL', detectAgain:'Deteksi ulang', source:'Kolom sumber', maskType:'Tipe masking', example:'Contoh hasil', willMask:'kolom akan dimasking', consistent:'Nilai yang sama akan selalu mendapat hasil samaran yang sama.', maskDownload:'Masking & download',
  done:'SELESAI', safe:'Data sudah aman.', processed:'berhasil diproses dan file sudah diunduh ke perangkat Anda.', another:'Masking file lain', redownload:'Download ulang', ownership:'Data Anda tetap menjadi milik Anda.', localProcess:'Diproses lokal - Tanpa penyimpanan - Tanpa pelacakan',
  unsupported:'Format belum didukung. Gunakan CSV, TXT, XLSX, atau XLS.', empty:'File tidak berisi baris data.', readError:'File tidak dapat dibaca.', none:'Jangan masking', name:'Nama / deskripsi provider', email:'Email', dob:'Tanggal lahir', phone:'Nomor HP', address:'Alamat', code:'Kode / ID',
} as const

const en: Record<keyof typeof id, string> = {
  theme:'THEME', color:'COLOR', local:'100% local in your browser', home:'Back to home', chooseColor:'Choose color theme', dark:'Use dark mode', light:'Use light mode',
  privacy:'DATA PRIVACY, MADE SIMPLE', headline:'Mask personal data.', headlineAccent:'Safe, fast, local.', intro:'Upload your query result, let Maskara detect sensitive data automatically, then download a safe file.', drop:'Drag & drop your file here', or:'or', chooseFile:'Choose file', reading:'Reading file...',
  noServer:'No server upload', noServerDesc:'Data never leaves your device', smart:'Smart column detection', smartDesc:'Recognizes common columns & SQL aliases', csvReady:'Ready-to-use output', csvReadyDesc:'Output follows the input file type',
  changeFile:'Change file', config:'MASKING CONFIGURATION', review:'Review detection results', reviewDesc:'We have inferred the data types. You remain in full control.', rows:'rows', columns:'columns', sensitive:'sensitive fields detected', basedOn:'based on column names and SQL aliases', detectAgain:'Detect again', source:'Source column', maskType:'Masking type', example:'Result preview', willMask:'columns will be masked', consistent:'The same value always produces the same masked result.', maskDownload:'Mask & download',
  done:'DONE', safe:'Your data is safe.', processed:'were processed and the file was downloaded to your device.', another:'Mask another file', redownload:'Download again', ownership:'Your data remains yours.', localProcess:'Processed locally - No storage - No tracking',
  unsupported:'Unsupported format. Use CSV, TXT, XLSX, or XLS.', empty:'The file contains no data rows.', readError:'The file could not be read.', none:'Do not mask', name:'Name / provider description', email:'Email', dob:'Date of birth', phone:'Phone number', address:'Address', code:'Code / ID',
}
export const translations = { id, en }
export type TranslationKey = keyof typeof id
