# 🚀 Quick Start Guide

## ⚠️ IMPORTANT: Must Use Local Server!

Browser security (CORS) prevents loading images from `file://` protocol.
You MUST use a local server!

---

## 🎯 Method 1: Python (Recommended)

### Windows:
```bash
# Double-click this file:
START-SERVER.bat

# Or manual:
python -m http.server 8000
# Then open: http://localhost:8000
```

### Mac/Linux:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

---

## 🎯 Method 2: Node.js

### Windows:
```bash
# Double-click this file:
START-SERVER-NODE.bat

# Or manual:
npx http-server -p 8000
# Then open: http://localhost:8000
```

### Mac/Linux:
```bash
npx http-server -p 8000
# Then open: http://localhost:8000
```

---

## 🎯 Method 3: VSCode Live Server

1. Install **"Live Server"** extension in VSCode
2. Right-click `index.html`
3. Select **"Open with Live Server"**
4. Done! ✅

---

## 🎯 Method 4: PHP (if installed)

```bash
php -S localhost:8000
# Then open: http://localhost:8000
```

---

## ❌ Common Errors

### Error: CORS Policy
```
Access to image at 'file://...' has been blocked by CORS policy
```
**Solution**: Use local server (methods above)

### Error: Python not found
**Solution**: Install Python from https://www.python.org/downloads/

### Error: Node not found
**Solution**: Use Python method or install Node.js from https://nodejs.org/

---

## ✅ After Server Starts

1. Browser will open to `http://localhost:8000`
2. Allow camera access when prompted
3. Wait for "Camera Active" status
4. Use hand gestures:
   - ✋ **Open Hand** → Start slideshow
   - ✊ **Closed Fist** → Pause
   - 👆 **Point Finger** → View fullscreen

---

## 🐛 Troubleshooting

### Photos not loading?
- Check console (F12) for errors
- Make sure all photos are in `gambar/` folder
- Verify photo names: `1.jpeg`, `2.jpeg`, etc.

### Camera not working?
- Allow camera permission in browser
- Check if other apps are using camera
- Try refresh page

### Gestures not detected?
- Ensure good lighting
- Position hand 30-60cm from camera
- Move hand slowly and clearly

---

## 💡 Tips

- Keep server window open while using
- Don't use `file://` directly (won't work!)
- Use Chrome/Edge for best compatibility
- Test with `test-photos.html` first

---

## 📞 Need Help?

1. Check console (F12) for error messages
2. Try `test-photos.html` to verify photos load
3. Make sure you're using local server, not `file://`

---

**Happy coding! 🎉**
