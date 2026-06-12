# 📸 Setup Foto - Panduan Lengkap

Ada 3 cara untuk menambahkan foto-foto kamu:

## 🚀 Method 1: Auto-Generate (Recommended untuk Banyak Foto)

### Langkah-langkah:

1. **Buat folder `gambar`** di root project
   ```
   mkdir gambar
   ```

2. **Rename foto kamu** dengan format nomor: `1.jpg`, `2.jpg`, `3.jpg`, dst
   - Atau gunakan script rename batch (lihat di bawah)

3. **Edit `script.js`** bagian Configuration:
   ```javascript
   const totalPhotos = 200; // Ubah ke jumlah foto kamu
   const photoExtension = 'jpg'; // jpg, png, atau webp
   ```

4. **Done!** Refresh browser

### Rename Batch Photos (Windows):

Buat file `rename-photos.bat`:
```batch
@echo off
setlocal enabledelayedexpansion
set count=1
for %%f in (*.jpg *.jpeg *.png) do (
    ren "%%f" "!count!%%~xf"
    set /a count+=1
)
echo Done! Renamed %count% photos
pause
```

Jalankan di folder gambar kamu.

### Rename Batch Photos (Mac/Linux):

```bash
#!/bin/bash
count=1
for file in *.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    if [ -f "$file" ]; then
        ext="${file##*.}"
        mv "$file" "${count}.${ext}"
        ((count++))
    fi
done
echo "Done! Renamed $count photos"
```

---

## 📝 Method 2: Manual List (Custom Filenames)

Jika nama file kamu berbeda-beda:

1. **Edit `script.js`**, uncomment Method 2:

```javascript
const photoFiles = [
    'vacation1.jpg',
    'birthday2023.png', 
    'IMG_001.jpg',
    'photo_beach.jpg',
    // ... tambahkan semua nama file
];

const photos = photoFiles.map((file, index) => ({
    url: `gambar/${file}`,
    title: `Memory #${index + 1}`,
    caption: `Beautiful moment together`
}));
```

2. **Masukkan semua foto** ke folder `gambar`

3. **Refresh browser**

---

## 🎨 Method 3: Custom Titles & Captions

Untuk kontrol penuh setiap foto:

Edit `script.js`, uncomment Method 3:

```javascript
const photos = [
    { 
        url: 'gambar/1.jpg', 
        title: 'Kenangan Pertama', 
        caption: 'Saat pertama kita bertemu' 
    },
    { 
        url: 'gambar/2.jpg', 
        title: 'Petualangan Seru', 
        caption: 'Liburan ke pantai bersama' 
    },
    // ... custom untuk setiap foto
];
```

---

## 🤖 Method 4: Auto-Generate Script (Node.js)

Jika kamu punya Node.js:

1. **Jalankan script generator**:
   ```bash
   node generate-photos.js
   ```

2. **Script akan generate file `photo-list.js`**

3. **Copy array dari `photo-list.js` ke `script.js`**

4. **Done!**

---

## 📁 Struktur Folder

```
project/
├── index.html
├── style.css
├── script.js
├── gambar/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   ├── ...
│   └── 200.jpg
└── README.md
```

---

## 💡 Tips

### Optimasi Foto:
1. **Resize foto** ke max 1920x1080px
2. **Compress** dengan tools seperti:
   - [TinyPNG](https://tinypng.com)
   - [Squoosh](https://squoosh.app)
3. **Target size**: 200-500KB per foto
4. **Format**: JPG untuk foto, PNG untuk grafis

### Performance:
- **100-200 foto**: Smooth, no problem
- **200-500 foto**: Mungkin loading lebih lama
- **500+ foto**: Consider lazy loading

### Nama File:
- ✅ `1.jpg`, `2.jpg`, `photo1.png`
- ❌ `foto 1.jpg` (ada spasi)
- ❌ `foto#1.jpg` (karakter special)

---

## 🐛 Troubleshooting

### Foto tidak muncul?

1. **Cek path folder**
   ```javascript
   // Pastikan nama folder benar
   url: 'gambar/1.jpg'  // ✅ Correct
   url: 'Gambar/1.jpg'  // ❌ Case-sensitive
   ```

2. **Cek console browser** (F12)
   - Lihat error 404 untuk tahu file mana yang missing

3. **Cek ekstensi file**
   ```javascript
   const photoExtension = 'jpg'; // Pastikan match dengan file kamu
   ```

4. **Test dengan 1 foto dulu**
   ```javascript
   const totalPhotos = 1; // Test dulu
   ```

### Foto terlalu lama loading?

1. **Compress foto** (lihat tips optimasi)
2. **Kurangi resolusi** ke max 1920px
3. **Gunakan progressive JPEG**
4. **Consider lazy loading**

---

## 🚀 Quick Start (Recommended)

Cara tercepat untuk 100+ foto:

1. Buat folder `gambar`
2. Rename semua foto jadi `1.jpg`, `2.jpg`, dst
3. Edit `script.js`:
   ```javascript
   const totalPhotos = 150; // Jumlah foto kamu
   ```
4. Open `index.html`

**Done! Semua foto auto-load!** 🎉

---

## 📞 Need Help?

Check:
- Console browser (F12) untuk errors
- Network tab untuk melihat file loading
- Photo path di script.js

Happy coding! 💖
