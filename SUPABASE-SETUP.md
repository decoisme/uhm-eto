## 🔌 Supabase Integration Setup Guide

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create account / Sign in
3. Click "New Project"
4. Fill in:
   - **Project Name**: gesture-gallery (atau nama lain)
   - **Database Password**: (simpan ini!)
   - **Region**: Southeast Asia (Singapore) - terdekat
   - **Plan**: Free tier OK
5. Wait 1-2 minutes untuk setup

---

### Step 2: Create Storage Bucket

1. Di dashboard Supabase, klik **Storage** di sidebar
2. Click **"New bucket"**
3. Fill in:
   - **Name**: `photos`
   - **Public bucket**: ✅ **CHECK THIS** (important!)
   - **File size limit**: 5MB (atau sesuai kebutuhan)
   - **Allowed MIME types**: `image/*` (atau leave empty)
4. Click **"Create bucket"**

---

### Step 3: Upload Photos

#### Method 1: Manual Upload (Web UI)
1. Click bucket `photos`
2. Click **"Upload"** button
3. Select all your photos (44 photos)
4. Wait for upload to complete
5. Done! ✅

#### Method 2: Bulk Upload (JavaScript)
```javascript
// Save as upload-photos.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SERVICE_ROLE_KEY' // Use service role for uploads
);

async function uploadPhotos() {
    const photosDir = './gambar';
    const files = fs.readdirSync(photosDir);
    
    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            const filePath = path.join(photosDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            
            console.log(`Uploading ${file}...`);
            
            const { data, error } = await supabase
                .storage
                .from('photos')
                .upload(file, fileBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false
                });
            
            if (error) {
                console.error(`Error uploading ${file}:`, error);
            } else {
                console.log(`✅ ${file} uploaded`);
            }
        }
    }
    
    console.log('🎉 All photos uploaded!');
}

uploadPhotos();
```

Run:
```bash
npm install @supabase/supabase-js
node upload-photos.js
```

---

### Step 4: Get API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

---

### Step 5: Configure Your App

1. Open `script-supabase.js`
2. Replace these lines (top of file):
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   const STORAGE_BUCKET = 'photos';
   ```

3. Save file

4. Refresh browser

5. Photos will load from Supabase! 🎉

---

### Step 6: Test

1. Open browser console (F12)
2. You should see:
   ```
   🔌 Connecting to Supabase...
   ✅ Supabase connected
   📸 Loading photos from Supabase Storage...
   ✅ Found 44 photos in Supabase
   📷 44 valid image files
   ✅ Photos loaded: 44
   ```

3. If error, check console for details

---

## 🔐 Security Notes

### Bucket Policies (Important!)

For public read access, set this policy:

1. Go to **Storage** → **Policies**
2. Click **"New Policy"** for `photos` bucket
3. Policy name: `Public Read`
4. Allowed operations: ✅ SELECT
5. Policy definition:
   ```sql
   true
   ```
6. Save

This allows anyone to READ (download) photos but NOT write/delete.

### Alternative: RLS Policy
```sql
-- Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'photos' );
```

---

## 📊 Advantages of Supabase

✅ **CDN**: Built-in CDN for fast image delivery
✅ **Scalable**: Handle thousands of requests
✅ **Free tier**: 1GB storage, 2GB bandwidth/month
✅ **Optimized**: Image optimization & caching
✅ **Reliable**: 99.9% uptime
✅ **Global**: Edge caching worldwide

---

## 🎯 Photo Naming

### Option 1: Keep Original Names
Your photos load alphabetically by filename:
- `IMG_001.jpg` → Memory #1
- `IMG_002.jpg` → Memory #2
- etc.

### Option 2: Rename for Order
Rename to ensure correct order:
- `1.jpg`, `2.jpg`, `3.jpg` → Perfect order
- Use `rename-photos.bat` before uploading

---

## 💰 Cost Estimate

### Free Tier Limits:
- **Storage**: 1GB (enough for ~2000 photos at 500KB each)
- **Bandwidth**: 2GB/month
- **Requests**: Unlimited on free tier

### If You Exceed:
- Storage: $0.021/GB/month
- Bandwidth: $0.09/GB

### Example:
- 44 photos @ 500KB each = 22MB storage
- 100 visitors, 10 photos each = ~220MB bandwidth
- **Cost**: $0 (within free tier!)

---

## 🔄 Alternative: Cloudflare R2

If you need more storage/bandwidth:

1. Create R2 bucket
2. Upload photos
3. Get public URL
4. Update script with R2 URLs

R2 is cheaper for heavy traffic (no egress fees).

---

## 🐛 Troubleshooting

### Photos not loading?

**Check console for errors:**

```javascript
❌ Supabase initialization error
```
→ Check SUPABASE_URL and SUPABASE_ANON_KEY

```javascript
❌ Error loading photos from Supabase: 404
```
→ Check bucket name is correct (`photos`)

```javascript
⚠️ No photos found in Supabase Storage
```
→ Upload photos to bucket

```javascript
❌ Error loading photo: CORS error
```
→ Make sure bucket is PUBLIC

### Test Supabase Connection

Run this in browser console:
```javascript
const { createClient } = supabase;
const client = createClient('YOUR_URL', 'YOUR_KEY');

// List files
const { data, error } = await client
    .storage
    .from('photos')
    .list();

console.log('Files:', data);
```

---

## 🚀 Deploy with Supabase

### Advantages:
- No need to upload photos with your code
- Change photos without redeploying
- Faster loading (CDN)
- Lower hosting costs

### Deploy to:
- **Netlify**: Just push code (no photos folder needed)
- **Vercel**: Same, lightweight deploy
- **GitHub Pages**: Works perfectly

Photos load from Supabase, code from GitHub Pages!

---

## 📝 Checklist

- [ ] Create Supabase project
- [ ] Create `photos` bucket (public)
- [ ] Set bucket policy for public read
- [ ] Upload all photos (44 photos)
- [ ] Copy Project URL & anon key
- [ ] Update `script-supabase.js` with credentials
- [ ] Test locally
- [ ] Check console for successful load
- [ ] Deploy!

---

**Ready to use! 🎉**

Your photos now load from Supabase Storage with global CDN delivery!
