# Pemilihan OSIS

Frontend:
- index.html
- style.css
- script.js

Backend:
- Code.gs (Google Apps Script)

## Preview
Buka index.html. `DEMO_MODE = true` membuat voting simulasi tanpa Google Sheets.

## Production
1. Buat Google Spreadsheet.
2. Isi SPREADSHEET_ID dan ADMIN_TOKEN di Code.gs.
3. Buat project Apps Script dan paste Code.gs.
4. Jalankan setupSystem() sekali.
5. Deploy sebagai Web App, Execute as Me, akses sesuai kebutuhan.
6. Salin URL Web App ke API_URL pada script.js.
7. Ubah DEMO_MODE menjadi false.

Catatan: backend ini memvalidasi satu identitas satu suara menggunakan SHA-256 + LockService.
