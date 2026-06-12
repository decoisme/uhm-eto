# 🚀 Deployment Guide

## Performance Optimizations Applied

### 1. **Image Optimization** 📸
Before deploying, optimize your photos:

#### Recommended Tools:
- **TinyPNG**: https://tinypng.com (lossy compression)
- **Squoosh**: https://squoosh.app (fine control)
- **ImageOptim**: https://imageoptim.com (Mac)

#### Optimal Settings:
- **Resolution**: Max 1920x1080px
- **File size**: 200-500KB per photo
- **Format**: 
  - JPG (80-85% quality) for photos
  - WebP for better compression (if supported)

#### Batch Optimization (ImageMagick):
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Resize and optimize all photos
cd gambar
for file in *.jpeg; do
    magick "$file" -resize 1920x1080\> -quality 85 "optimized_$file"
done
```

---

### 2. **Code Optimizations Applied** ⚡

✅ **Texture Caching**: Photos cached setelah load
✅ **Lazy Loading**: Hanya load foto nearby (±3 foto)
✅ **Preloading**: 5 foto pertama di-preload
✅ **Skip Loading**: Skip jika masih loading
✅ **Error Handling**: Skip foto error, lanjut ke next
✅ **Particle Count**: Reduced 6000 → 5000
✅ **Slideshow Speed**: 200ms → 300ms (balanced)

---

## 🌐 Deploy to GitHub Pages

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit: Gesture gallery"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository (public)
3. Don't initialize with README

### Step 3: Push Code
```bash
git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. Go to repository Settings
2. Pages → Source → main branch
3. Save
4. Wait 2-3 minutes
5. Visit: `https://username.github.io/repo-name`

---

## 🚀 Deploy to Netlify

### Method 1: Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag project folder
3. Done! Get URL

### Method 2: Git Integration
1. Push code to GitHub (see above)
2. Go to https://app.netlify.com
3. "New site from Git"
4. Select repository
5. Deploy!

### Custom Domain:
1. Domain settings in Netlify
2. Add custom domain
3. Update DNS records

---

## 🎯 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

Or via dashboard:
1. Go to https://vercel.com
2. Import Git repository
3. Deploy!

---

## ⚡ Performance Tips for Production

### 1. Use CDN for Libraries
Already using CDN for:
- Three.js
- MediaPipe

### 2. Enable Compression
Most platforms (Netlify/Vercel/GitHub Pages) auto-enable gzip/brotli.

### 3. Lazy Load Photos
Already implemented! Photos load ±3 around current.

### 4. Photo Format
Consider WebP for better compression:
```bash
# Convert to WebP
cwebp -q 85 input.jpg -o output.webp
```

Then update `script.js`:
```javascript
const photoExtension = 'webp';
```

### 5. Service Worker (Optional)
For offline support:
```javascript
// sw.js
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js'
            ]);
        })
    );
});
```

---

## 📊 Expected Performance

### Local Server:
- **FPS**: 60fps steady
- **Load time**: Instant
- **Memory**: ~150MB

### Production (Optimized):
- **FPS**: 55-60fps
- **Initial load**: 2-3s (5 photos preload)
- **Slideshow**: Smooth (cached + lazy load)
- **Memory**: ~200MB

### Production (Non-optimized):
- **FPS**: 40-50fps
- **Initial load**: 5-10s (load all)
- **Slideshow**: Janky (loading each time)
- **Memory**: ~400MB

---

## 🐛 Troubleshooting Production

### Photos not loading?
1. Check path is correct: `gambar/1.jpeg`
2. Verify photos uploaded to server
3. Check browser console for 404 errors

### Slow performance?
1. Optimize photos (see above)
2. Reduce `totalPhotos` for testing
3. Check Network tab (F12) for large files

### Out of memory?
1. Reduce particle count to 3000
2. Clear texture cache periodically
3. Optimize photos to <300KB each

---

## 📝 Checklist Before Deploy

- [ ] Optimize all photos (<500KB each)
- [ ] Test locally with `START-SERVER.bat`
- [ ] Update `totalPhotos` count
- [ ] Test all gestures work
- [ ] Check console for errors
- [ ] Test on mobile (if applicable)
- [ ] Commit all files
- [ ] Push to Git
- [ ] Deploy to platform
- [ ] Test deployed site
- [ ] Check camera permissions work

---

## 🎉 After Deployment

Share your link:
- GitHub Pages: `https://username.github.io/repo-name`
- Netlify: `https://random-name.netlify.app`
- Vercel: `https://project.vercel.app`

Add custom domain (optional):
- GitHub Pages: Settings → Pages → Custom domain
- Netlify: Domain settings → Add domain
- Vercel: Settings → Domains

---

**Happy deploying! 🚀**
