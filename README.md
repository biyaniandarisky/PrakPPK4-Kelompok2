# 💸 DUITku

Aplikasi web untuk membantu mahasiswa mencatat pemasukan dan pengeluaran serta memantau kondisi keuangan pribadi secara sederhana.

---

# 📄 SRS (Software Requirements Specification)

### Pertemuan Sebelumnya (Core Features)
| ID | Kebutuhan |
|----|-----------|
| SRS001 | Pengguna dapat registrasi dan login. |
| SRS002 | Pengguna dapat logout. Dashboard hanya bisa dibuka setelah login. |
| SRS003 | Login dipertahankan lewat session sampai logout atau kedaluwarsa. |
| SRS004 | Pengguna dapat menambah transaksi. |
| SRS005 | Pengguna dapat melihat, mengubah, dan menghapus transaksi di dashboard. |
| SRS006 | Dashboard menampilkan saldo, total pemasukan, dan total pengeluaran. |
| SRS007 | Pengguna hanya dapat mengakses transaksi miliknya sendiri. |
| SRS008 | Sistem menyimpan preferensi tema di cookie. |

### Pertemuan 5 (AJAX & Budget Bulanan)
| ID | Kebutuhan |
|----|-----------|
| SRS009 | Sistem menerapkan AJAX pada halaman dashboard untuk memuat ulang ringkasan saldo, total pemasukan, dan total pengeluaran secara dinamis tanpa *full page reload*. |
| SRS010 | Pengguna dapat melihat dan mengakses panel/halaman form untuk menetapkan, mengubah, serta menghapus batas anggaran pengeluaran bulanan (*Monthly Budget*). |
| SRS011 | Sistem menerapkan AJAX pada aksi tambah dan hapus data transaksi agar pembaruan data langsung tampil di tabel/dashboard secara mulus. |
| SRS012 | Sistem menyediakan logika *backend* dan struktur database untuk menyimpan, mengubah, dan menghapus data anggaran bulanan (*Monthly Budget*). |
| SRS013 | Sistem menerapkan AJAX pada fitur ubah (*edit*) data transaksi agar proses pembaruan data tereksekusi secara asinkron tanpa memuat ulang halaman. |
| SRS014 | Sistem memastikan data anggaran bulanan bersifat privat, di mana pengguna hanya dapat mengakses dan mengelola anggarannya sendiri. |
| SRS015 | Sistem menerapkan AJAX pada fitur filter transaksi (berdasarkan rentang tanggal, kategori, atau jenis) agar hasil penyaringan muncul seketika. |
| SRS016 | Dashboard menampilkan *progress bar* atau indikator penggunaan anggaran bulanan secara otomatis yang dikalkulasikan dengan total pengeluaran berjalan. |
