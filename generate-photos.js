// ===== Photo List Generator =====
// Script untuk generate list foto secara otomatis dari folder

const fs = require('fs');
const path = require('path');

// Konfigurasi
const photoFolder = './gambar';
const outputFile = './photo-list.js';
const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Baca semua file di folder gambar
fs.readdir(photoFolder, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        console.log('\n❌ Pastikan folder "gambar" sudah ada!');
        return;
    }
    
    // Filter hanya file gambar
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return supportedFormats.includes(ext);
    });
    
    if (imageFiles.length === 0) {
        console.log('❌ Tidak ada foto ditemukan di folder "gambar"');
        return;
    }
    
    // Generate photo array
    const photoArray = imageFiles.map((file, index) => {
        return `    {
        url: 'gambar/${file}',
        title: 'Memory #${index + 1}',
        caption: 'Beautiful moment together'
    }`;
    });
    
    // Generate output
    const output = `// Auto-generated photo list
// Total: ${imageFiles.length} photos

const photos = [
${photoArray.join(',\n')}
];

console.log('✅ Loaded ${imageFiles.length} photos');
`;
    
    // Write to file
    fs.writeFileSync(outputFile, output);
    
    console.log(`✅ Success! Generated ${imageFiles.length} photos`);
    console.log(`📄 Output: ${outputFile}`);
    console.log('\n📋 Copy array dari file photo-list.js ke script.js');
});
