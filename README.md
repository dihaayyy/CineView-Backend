# CineView - Backend

RESTful API menggunakan **Node.js**, **Express**, dan **MongoDB** untuk mendukung fitur **Register** dan **Login** aplikasi Android.

## 🚀 Cara Menjalankan Backend

### 1. Clone Repository
Buka terminal di Code Editor, atau buka Command Prompt dan jalankan perintah berikut:
``` git
git clone https://github.com/username/nama-repo.git
```

### 2. Ganti Direktori Folder
Setelah melakukan clone, masuk ke dalam direktori folder yang ada.
``` bash
cd nama-folder-backend
```

### 3. Install Dependencies
Project ini menggunakan NPM sebagai main dependencynya. Untuk menginstall dependencies, caranya adalah sebagai berikut:
``` bash
npm install
```

### 4. Jalankan server
Sebelum menjalankan backend, pastikan MongoDB sudah aktif. Jika kamu menjalankan MongoDB secara lokal (bukan Atlas/cloud), lakukan langkah berikut:

a. Jalankan MongoDB
Buka terminal baru (atau tab baru) lalu jalankan:

``` bash
mongod
```
mongod adalah perintah untuk memulai MongoDB server secara lokal. Pastikan MongoDB sudah ter-install di komputermu.

Jika kamu menggunakan MongoDB Compass, pastikan MongoDB Service dalam keadaan RUNNING.

b. Jalankan Server Node.js
Setelah MongoDB aktif, kembali ke terminal proyek backend, lalu jalankan:

``` bash
nodemon server.js
```
Jika nodemon belum terinstall, jalankan dulu:

``` bash
npm install -g nodemon
```
Setelah itu, server backend akan berjalan, biasanya pada:

``` arduino
http://localhost:3000
```
Jika kamu menggunakan IP khusus (misalnya untuk koneksi Android), pastikan IP address sudah disesuaikan di file backend dan Android (misalnya: http://192.168.1.x:3000).

c. Untuk Android




# 💻 HOW TO UPDATE THE PROJECT WITH GIT VERSION CONTROL SYSTEM #
### 1. Membuat Branch Baru untuk Fitur Baru ###
Gunakan format penamaan berikut untuk membuat branch baru:

``` bash
git checkout -b feat/<nama-folder>-<fitur>
```
Contoh:


``` bash
git checkout -b feat/be-auth-user
```

### 2. Menambahkan Perubahan ###
Setiap kali ada perubahan pada file, kamu perlu menambahkan file tersebut sebelum melakukan commit.

✅ Menambahkan semua file yang berubah:

``` bash
git add .
```
✅ Atau hanya file tertentu:

``` bash
git add nama-file.js
```

### 3. Commit Perubahan ### 
Gunakan format konvensional saat melakukan commit:

```
feat: Fitur baru untuk pengguna
fix: Perbaikan bug
docs: Perubahan dokumentasi
style: Perubahan tampilan, indentasi, spasi, dll (bukan logic)
refactor: Refactoring kode tanpa mengubah perilaku
test:	Menambahkan atau memperbaiki test
chore: Update tools, configs, dll (non-prod code)
```

Contoh:

``` bash
git commit -m "feat: implement login logic and token generation"
git commit -m "fix: resolve server crash when login fails"
```

### 4. Pull Branch Terbaru (Agar Tidak Conflict) ###
Sebelum melakukan push, selalu pastikan kamu sudah menarik perubahan terbaru dari branch main (atau master):

``` bash
git pull origin main
```
Atau dari branch lain jika kamu bekerja dengan fitur tertentu:

```bash
git pull origin nama-feature-branch
```

### 5. Push ke Remote Repository ###
Setelah commit selesai, dorong branch-mu ke GitHub:

```bash
git push origin nama-branch
```
Contoh:
```bash
git push origin feat/be-auth-user
```


