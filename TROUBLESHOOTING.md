# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Photos Not Loading from Supabase

#### Symptoms:
- Console shows "No photos found in Supabase Storage"
- "Falling back to local photos" message
- Debug panel shows "Loaded 0 photos"

#### Solutions:

**A. Check Bucket Configuration**

1. Open Supabase Dashboard → Storage
2. Verify bucket name is exactly `photos` (case-sensitive)
3. Click on bucket → Settings
4. Ensure **"Public bucket"** is ✅ ENABLED

**B. Check Upload Location**

Photos must be in one of these locations:
- **Root of bucket**: `/1.jpeg`, `/2.jpeg`, etc.
- **gambar subfolder**: `/gambar/1.jpeg`, `/gambar/2.jpeg`, etc.

To check where your photos are:
```javascript
// Open browser console and run:
const { createClient } = supabase;
const client = createClient('YOUR_URL', 'YOUR_KEY');

// Check root
const { data: root } = await client.storage.from('photos').list('');
console.log('Root files:', root);

// Check gambar folder
const { data: gambar } = await client.storage.from('photos').list('gambar');
console.log('Gambar files:', gambar);
```

**C. Check Bucket Policies**

1. Go to Storage → Policies
2. You should have a policy like:

```sql
-- Policy name: Public Read
-- Allowed operations: SELECT
-- Policy definition:
bucket_id = 'photos'
```

If no policy exists, create one:
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'photos' );
```

**D. Test Public URL**

1. Upload a test photo
2. Get its public URL from Supabase dashboard
3. Try opening URL in browser
4. If it doesn't load, bucket is not public

**Fix:**
- Go to bucket Settings
- Enable "Public bucket"
- Save and refresh

---

### 2. MediaPipe Gesture Detection Not Working

#### Symptoms:
- Console shows "MediaPipe initialization error"
- Camera works but gestures not detected
- "Gesture Error" in status

#### Solutions:

**A. Check HTTPS Requirement**

MediaPipe requires HTTPS or localhost. If you're using:
- `file://` → Won't work ❌
- `http://localhost` → Works ✅
- `http://192.168.x.x` → Won't work ❌
- `https://yourdomain.com` → Works ✅

**Fix for local development:**
```bash
# Use local server (already works)
START-SERVER.bat

# Or with Node.js
START-SERVER-NODE.bat
```

**B. Clear Browser Cache**

MediaPipe WASM files might be cached incorrectly:
1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"
4. Refresh page

**C. Check Camera Permissions**

1. Browser should ask for camera permission
2. If blocked, click 🔒 icon in address bar
3. Allow camera access
4. Refresh page

**D. Try Different Browser**

MediaPipe works best on:
- ✅ Chrome/Edge (best)
- ✅ Firefox (good)
- ⚠️ Safari (limited)

---

### 3. Slow Performance / Lag

#### Symptoms:
- Slideshow is choppy
- Particles lag
- High CPU usage

#### Solutions:

**A. Reduce Particle Count**

In `script-supabase.js`:
```javascript
// Line ~156
const count = 5000; // Change to 3000 for better performance
```

**B. Disable MediaPipe**

Comment out gesture initialization:
```javascript
// Line ~509 in init()
// setTimeout(initMediaPipe, 500);
```

**C. Use Simple Version**

Use `script-simple.js` instead:
```html
<!-- In index.html, replace -->
<script src="script-simple.js"></script>
```

**D. Optimize Textures**

Compress photos before uploading:
- Recommended: 1920x1080, 500KB each
- Use tools: TinyPNG, ImageOptim, Squoosh

---

### 4. CORS Errors

#### Symptoms:
- Console shows "CORS policy blocked"
- Photos don't load
- Cross-origin errors

#### Solutions:

**A. Use Local Server**

Never use `file://` protocol:
```bash
# Always use:
START-SERVER.bat
```

**B. For Deployment**

Deploy to:
- **Netlify**: Handles CORS automatically
- **Vercel**: No CORS issues
- **GitHub Pages**: Works with Supabase
- **Cloudflare Pages**: Recommended

---

### 5. Photos Load Slowly

#### Symptoms:
- Long wait before photos appear
- "Loading..." stuck
- Photos appear one by one slowly

#### Solutions:

**A. Optimize Images**

Before uploading:
```bash
# Resize to max 1920x1080
# Compress to ~500KB each
# Use JPEG format (not PNG)
```

**B. Use CDN (Supabase already does this)**

Supabase Storage automatically uses CDN, but:
- First load is slower
- Subsequent loads are cached
- Worldwide distribution

**C. Preload Critical Photos**

Already implemented (first 5 photos preload automatically)

---

### 6. Gesture Controls Inconsistent

#### Symptoms:
- Gestures work sometimes
- Wrong gesture detected
- Delayed response

#### Solutions:

**A. Improve Lighting**

- Use good lighting (front-facing)
- Avoid backlight
- Remove shadows on hand

**B. Adjust Detection Sensitivity**

In `script-supabase.js`:
```javascript
// Line ~395
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.7, // Increase for stability
    minTrackingConfidence: 0.5   // Increase to 0.7 if jittery
});
```

**C. Clear Hand Gestures**

- ✋ Open hand: All 4 fingers extended
- ✊ Fist: All fingers closed
- 👆 Point: Only index finger extended

Make gestures clearly visible to camera.

---

### 7. Fullscreen Not Working

#### Symptoms:
- Fullscreen button does nothing
- Exit fullscreen not working

#### Solution:

Fullscreen requires user interaction:
```javascript
// Must be called from button click (already implemented correctly)
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
```

If still not working:
- Try different browser
- Check browser permissions
- Some browsers block fullscreen in iframes

---

### 8. Memory Issues / Browser Crashes

#### Symptoms:
- Browser becomes unresponsive
- "Out of memory" error
- Tab crashes

#### Solutions:

**A. Limit Photo Count**

If you have 100+ photos:
```javascript
// In loadPhotosFromSupabase(), add:
imageFiles = imageFiles.slice(0, 50); // Limit to 50 photos
```

**B. Clear Texture Cache**

Add to `updatePhotoTexture()`:
```javascript
// Before loading new texture
if (photoPlane.material.map) {
    photoPlane.material.map.dispose();
}
```

**C. Restart Browser**

Close all tabs and restart browser to clear memory.

---

## Debug Checklist

When something doesn't work, check:

1. **Console Errors** (F12)
   - Look for red error messages
   - Check warnings (yellow)
   - Read full error stack trace

2. **Network Tab**
   - Are photos loading? (200 status)
   - Any failed requests? (404, 403)
   - CORS errors?

3. **Local Server Running**
   - Must use `http://localhost`, not `file://`
   - Run `START-SERVER.bat` first

4. **Supabase Connection**
   - Correct URL and key in `script-supabase.js`
   - Bucket is public
   - Photos uploaded to correct location

5. **Camera Permission**
   - Browser has camera access
   - No other app using camera
   - Camera icon in address bar

---

## Getting Help

If issues persist, check console for these key messages:

### Successful Load:
```
🚀 Initializing with Supabase...
🔌 Connecting to Supabase...
✅ Supabase connected
📸 Loading photos from Supabase Storage...
✅ Bucket accessible, listing files...
✅ Found 44 images in root (or gambar/)
✅ Supabase photos loaded: 44
🎥 Initializing MediaPipe Hands...
✅ Camera stream ready
✅ MediaPipe Hands configured
✅ Hand tracking started
✅ Initialization complete!
```

### Failed Load (Supabase):
```
❌ Supabase error: [error message]
📁 Falling back to local photos...
✅ Local photos loaded: 44
```

### Failed Load (Camera):
```
❌ Camera error: NotAllowedError
ℹ️ You can still use manual controls
```

---

## Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Photos not loading | Check Supabase bucket is public |
| Gestures not working | Use Chrome, allow camera, clear cache |
| Slow performance | Reduce particles to 3000 |
| CORS error | Use local server, not file:// |
| Memory crash | Limit photos to 50 max |
| Fullscreen fails | Try different browser |

---

## Contact & Support

For persistent issues:
1. Check browser console (F12)
2. Copy error messages
3. Note what you tried
4. Include browser version

---

**Last Updated:** 2026-06-12
