// ===== Configuration =====
// AUTO-LOAD: Masukkan semua foto ke folder "gambar" dengan nama: 1.jpg, 2.jpg, 3.jpg, dst
// Atau custom dengan format apapun di array photoFiles

// Method 1: Auto-generate dari jumlah foto (RECOMMENDED)
const totalPhotos = 44; // Ubah sesuai jumlah foto kamu
const photoExtension = 'jpeg'; // jpg, png, atau webp
const photos = [];

// Lazy loading & preloading configuration
const PRELOAD_COUNT = 5; // Preload 5 foto pertama
const LAZY_LOAD_DISTANCE = 3; // Load 3 foto sebelum dan sesudah current

for (let i = 1; i <= totalPhotos; i++) {
    photos.push({
        url: `gambar/${i}.${photoExtension}`,
        title: `Memory #${i}`,
        caption: `Beautiful moment ${i} together`,
        loaded: false,
        texture: null
    });
}

// Debug: Log untuk cek path
console.log('Total photos:', totalPhotos);
console.log('Sample photo URL:', photos[0]?.url);

// Method 2: Manual list (uncomment jika mau custom filenames)
/*
const photoFiles = [
    'photo1.jpg', 'photo2.jpg', 'photo3.png', 'vacation1.jpg',
    // ... tambahkan semua nama file
];

const photos = photoFiles.map((file, index) => ({
    url: `gambar/${file}`,
    title: `Memory #${index + 1}`,
    caption: `Beautiful moment together`
}));
*/

// Method 3: Dengan custom titles & captions (uncomment jika mau)
/*
const photos = [
    { url: 'gambar/1.jpg', title: 'Kenangan Pertama', caption: 'Saat pertama bertemu' },
    { url: 'gambar/2.jpg', title: 'Petualangan', caption: 'Perjalanan kita' },
    // ... tambahkan custom untuk setiap foto
];
*/

// ===== Global State =====
let scene, camera, renderer, particleSystem, photoPlane, textureLoader;
let hands, cameraStream;
let currentPattern = 'sphere';
let currentColor = 0xff4fa2;
let currentScale = 1, targetScale = 1;
let currentPhoto = 0;
let isSlideshow = false;
let slideshowInterval;
let lastGesture = 'none';
let pointActive = false;
let pointTimer = null;
let viewedPhotos = new Set();
let startTime = Date.now();
let time = 0;

// Performance optimization
let textureCache = new Map();
let isLoadingTexture = false;
let pendingTextureLoad = null;

// ===== Three.js Setup =====
function initThree() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'), 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    textureLoader = new THREE.TextureLoader();
    
    createPhotoPlane();
    createParticles('sphere');
    animate();
}

function createPhotoPlane() {
    const geometry = new THREE.PlaneGeometry(7, 7);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    photoPlane = new THREE.Mesh(geometry, material);
    photoPlane.position.z = -2;
    scene.add(photoPlane);
    
    // Add glow plane behind photo
    const glowGeometry = new THREE.PlaneGeometry(7.5, 7.5);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4fa2,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    photoPlane.userData.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    photoPlane.userData.glow.position.z = -2.1;
    scene.add(photoPlane.userData.glow);
    
    console.log('✅ PhotoPlane created');
}

function createParticles(pattern) {
    if (particleSystem) scene.remove(particleSystem);
    
    const count = 5000; // Optimized untuk production
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        const pos = getPatternPosition(pattern, i, count);
        const i3 = i * 3;
        
        positions[i3] = pos.x;
        positions[i3 + 1] = pos.y;
        positions[i3 + 2] = pos.z;
        
        const color = new THREE.Color(currentColor);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.original = positions.slice();
    scene.add(particleSystem);
}

function getPatternPosition(pattern, i, total) {
    const phi = Math.acos(-1 + (2 * i) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    
    switch(pattern) {
        case 'sphere':
            return {
                x: Math.cos(theta) * Math.sin(phi) * 2,
                y: Math.sin(theta) * Math.sin(phi) * 2,
                z: Math.cos(phi) * 2
            };
        case 'heart':
            const t = (i / total) * Math.PI * 2;
            return {
                x: 1.5 * Math.sin(t) ** 3,
                y: 1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t),
                z: Math.sin(t) * Math.cos(t) * 0.5
            };
        case 'spiral':
            const st = (i / total) * Math.PI * 4;
            const r = st * 0.3;
            return {
                x: Math.cos(st) * r,
                y: (i / total - 0.5) * 4,
                z: Math.sin(st) * r
            };
        case 'wave':
            const x = (i / total - 0.5) * 8;
            return {
                x: x,
                y: Math.sin(x * 2) * Math.cos(i * 0.1),
                z: Math.cos(x * 2) * Math.sin(i * 0.1)
            };
        case 'galaxy':
            const a = (i / total) * Math.PI * 4;
            const d = (i / total) * 3;
            return {
                x: Math.cos(a) * d,
                y: (Math.random() - 0.5) * 0.5,
                z: Math.sin(a) * d
            };
        case 'cube':
            return {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4,
                z: (Math.random() - 0.5) * 4
            };
        default:
            return { x: 0, y: 0, z: 0 };
    }
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        
        const positions = particleSystem.geometry.attributes.position.array;
        const original = particleSystem.userData.original;
        
        if (isSlideshow) {
            // Partikel melebur ke luar (disperse)
            for (let i = 0; i < positions.length; i += 3) {
                const idx = i / 3;
                
                // Calculate direction from center
                const dx = original[i];
                const dy = original[i + 1];
                const dz = original[i + 2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                // Normalize direction
                const ndx = dx / (dist || 1);
                const ndy = dy / (dist || 1);
                const ndz = dz / (dist || 1);
                
                // Disperse outward with wave motion
                const disperseAmount = Math.sin(time * 2 + idx * 0.01) * 1.5;
                const wave = Math.cos(time * 1.5 + idx * 0.02) * 0.3;
                
                positions[i] = original[i] + ndx * disperseAmount + wave;
                positions[i + 1] = original[i + 1] + ndy * disperseAmount + wave;
                positions[i + 2] = original[i + 2] + ndz * disperseAmount + wave;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.rotation.y += 0.003;
            particleSystem.rotation.x += 0.001;
            
            // Reduce particle opacity saat disperse
            particleSystem.material.opacity = 0.4;
        } else {
            // Return to original when paused
            particleSystem.material.opacity = 0.9;
        }
        
        currentScale += (targetScale - currentScale) * 0.1;
        particleSystem.scale.setScalar(currentScale);
    }
    
    if (photoPlane) {
        if (isSlideshow) {
            // Sangat visible saat particles disperse
            const targetOpacity = 0.8;
            if (Math.abs(photoPlane.material.opacity - targetOpacity) > 0.01) {
                photoPlane.material.opacity += (targetOpacity - photoPlane.material.opacity) * 0.1;
            }
            
            // Subtle movement
            photoPlane.rotation.z = Math.sin(time * 0.5) * 0.03;
            photoPlane.position.x = Math.sin(time * 0.4) * 0.15;
            photoPlane.position.y = Math.cos(time * 0.35) * 0.15;
            
            // Pulsing scale
            const scalePulse = 1 + Math.sin(time * 0.8) * 0.05;
            photoPlane.scale.set(scalePulse, scalePulse, 1);
            
            // Glow effect
            if (photoPlane.userData.glow) {
                const glowPulse = (Math.sin(time * 2) + 1) * 0.2;
                photoPlane.userData.glow.material.opacity = glowPulse;
                photoPlane.userData.glow.rotation.z = Math.sin(time * 0.3) * 0.05;
                
                // Sync position with photo
                photoPlane.userData.glow.position.x = photoPlane.position.x;
                photoPlane.userData.glow.position.y = photoPlane.position.y;
                
                // Scale glow slightly larger with pulse
                const glowScale = scalePulse * (1 + glowPulse * 0.3);
                photoPlane.userData.glow.scale.set(glowScale, glowScale, 1);
            }
        } else {
            // Fade out when paused
            const targetOpacity = 0.25;
            if (Math.abs(photoPlane.material.opacity - targetOpacity) > 0.01) {
                photoPlane.material.opacity += (targetOpacity - photoPlane.material.opacity) * 0.05;
            }
            
            if (photoPlane.userData.glow) {
                photoPlane.userData.glow.material.opacity = Math.max(
                    photoPlane.userData.glow.material.opacity - 0.05, 
                    0
                );
            }
        }
    }
    
    renderer.render(scene, camera);
}

function updatePhotoTexture() {
    const photo = photos[currentPhoto];
    
    // Skip if already loading
    if (isLoadingTexture) {
        pendingTextureLoad = currentPhoto;
        return;
    }
    
    // Check cache first
    if (textureCache.has(currentPhoto)) {
        console.log('📦 Using cached texture:', photo.url);
        applyTexture(textureCache.get(currentPhoto));
        return;
    }
    
    console.log('🖼️ Loading photo:', photo.url);
    isLoadingTexture = true;
    
    // Load texture
    textureLoader.load(
        photo.url,
        (texture) => {
            console.log('✅ Photo loaded:', photo.url);
            
            // Cache texture
            textureCache.set(currentPhoto, texture);
            photos[currentPhoto].loaded = true;
            photos[currentPhoto].texture = texture;
            
            applyTexture(texture);
            isLoadingTexture = false;
            
            // Load pending texture if any
            if (pendingTextureLoad !== null && pendingTextureLoad !== currentPhoto) {
                const pending = pendingTextureLoad;
                pendingTextureLoad = null;
                currentPhoto = pending;
                updatePhotoTexture();
            }
        },
        (progress) => {
            if (progress.lengthComputable) {
                const percent = (progress.loaded / progress.total) * 100;
                if (percent % 25 === 0) { // Log setiap 25%
                    console.log(`⏳ Loading ${percent.toFixed(0)}%`);
                }
            }
        },
        (error) => {
            console.error('❌ Error loading photo:', photo.url, error);
            isLoadingTexture = false;
            
            // Try next photo on error
            if (isSlideshow) {
                nextPhoto();
            }
        }
    );
}

function applyTexture(texture) {
    if (photoPlane?.material) {
        photoPlane.material.map = texture;
        photoPlane.material.needsUpdate = true;
        
        // Set opacity based on state
        if (isSlideshow) {
            photoPlane.material.opacity = 0.75;
        } else {
            photoPlane.material.opacity = 0.25;
        }
        
        console.log('✅ Texture applied, opacity:', photoPlane.material.opacity);
    }
}

// Preload nearby photos
function preloadNearbyPhotos() {
    const start = Math.max(0, currentPhoto - LAZY_LOAD_DISTANCE);
    const end = Math.min(photos.length - 1, currentPhoto + LAZY_LOAD_DISTANCE);
    
    for (let i = start; i <= end; i++) {
        if (!textureCache.has(i) && !photos[i].loaded) {
            preloadPhoto(i);
        }
    }
}

function preloadPhoto(index) {
    const photo = photos[index];
    
    textureLoader.load(
        photo.url,
        (texture) => {
            textureCache.set(index, texture);
            photos[index].loaded = true;
            photos[index].texture = texture;
            console.log('📥 Preloaded:', photo.url);
        },
        undefined,
        (error) => {
            console.warn('⚠️ Preload failed:', photo.url);
        }
    );
}

// ===== MediaPipe Setup =====
function initMediaPipe() {
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults(onResults);
    
    const video = document.getElementById('video');
    
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
            video.srcObject = stream;
            cameraStream = stream;
            
            video.onloadeddata = () => {
                document.getElementById('status').classList.add('active');
                document.getElementById('statusText').textContent = 'Camera Active';
                
                const cam = new Camera(video, {
                    onFrame: async () => await hands.send({ image: video }),
                    width: 640,
                    height: 480
                });
                cam.start();
            };
        })
        .catch((err) => {
            console.error('Camera error:', err);
            document.getElementById('statusText').textContent = 'Camera Error';
        });
}

function onResults(results) {
    if (!results.multiHandLandmarks?.[0]) return;
    
    const gesture = detectGesture(results.multiHandLandmarks[0]);
    if (gesture !== lastGesture) {
        handleGesture(gesture);
        lastGesture = gesture;
    }
}

function detectGesture(landmarks) {
    const fingers = [8, 12, 16, 20].map(i => landmarks[i].y < landmarks[i - 2].y);
    const extended = fingers.filter(Boolean).length;
    
    if (fingers[0] && extended === 1) return 'point';
    if (extended >= 3) return 'open';
    if (extended === 0) return 'closed';
    return 'unknown';
}

function handleGesture(gesture) {
    const indicator = document.getElementById('indicator');
    const icon = document.getElementById('gIcon');
    const status = document.getElementById('gStatus');
    
    switch(gesture) {
        case 'open':
            icon.textContent = '✋';
            status.textContent = 'Navigating';
            indicator.classList.add('active');
            startSlideshow();
            targetScale = 1.5; // Expand more untuk disperse effect
            if (pointActive) closePhoto();
            break;
        
        case 'closed':
            icon.textContent = '✊';
            status.textContent = 'Paused';
            indicator.classList.add('active');
            stopSlideshow();
            targetScale = 0.9;
            if (pointActive) closePhoto();
            break;
        
        case 'point':
            icon.textContent = '👆';
            status.textContent = 'Viewing';
            indicator.classList.add('active');
            if (!pointActive) openPhoto();
            if (pointTimer) clearTimeout(pointTimer);
            targetScale = 1;
            break;
        
        default:
            indicator.classList.remove('active');
            if (pointActive && gesture !== 'point') {
                if (pointTimer) clearTimeout(pointTimer);
                pointTimer = setTimeout(closePhoto, 1000);
            }
    }
    
    setTimeout(() => indicator.classList.remove('active'), 2000);
}

// ===== Slideshow =====
function startSlideshow() {
    if (isSlideshow) return;
    
    console.log('🎬 Starting slideshow...');
    
    document.getElementById('welcome').classList.add('hidden');
    document.getElementById('progress').classList.add('active');
    
    isSlideshow = true;
    
    // Load first photo immediately
    updatePhotoTexture();
    
    // Preload nearby photos
    preloadNearbyPhotos();
    
    slideshowInterval = setInterval(nextPhoto, 300); // Balanced: 0.3 detik
}

function stopSlideshow() {
    isSlideshow = false;
    document.getElementById('progress').classList.remove('active');
    
    console.log('⏸️ Slideshow stopped');
    
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

function nextPhoto() {
    currentPhoto = (currentPhoto + 1) % photos.length;
    viewedPhotos.add(currentPhoto);
    updateUI();
    updatePhotoTexture(); // Load texture untuk photo plane
    updateProgress();
    
    // Preload nearby photos for smooth experience
    preloadNearbyPhotos();
}

function updateUI() {
    document.getElementById('current').textContent = currentPhoto + 1;
    document.getElementById('total').textContent = photos.length;
    document.getElementById('title').textContent = photos[currentPhoto].title;
    document.getElementById('viewed').textContent = viewedPhotos.size;
}

function updateProgress() {
    const circle = document.getElementById('progressCircle');
    const progress = (currentPhoto + 1) / photos.length;
    const offset = 283 - (progress * 283);
    circle.style.strokeDashoffset = offset;
}

// ===== Photo Overlay =====
function openPhoto() {
    const overlay = document.getElementById('overlay');
    const img = document.getElementById('overlayImg');
    const caption = document.getElementById('overlayCaption');
    
    const photo = photos[currentPhoto];
    img.src = photo.url;
    caption.textContent = photo.caption;
    
    overlay.classList.add('active');
    stopSlideshow();
    pointActive = true;
    targetScale = 1.5;
}

function closePhoto() {
    document.getElementById('overlay').classList.remove('active');
    pointActive = false;
    targetScale = 1;
}

// ===== Event Listeners =====
function initEvents() {
    // Fullscreen
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    // Audio
    let audioOn = false;
    document.getElementById('audioBtn').addEventListener('click', function() {
        audioOn = !audioOn;
        this.classList.toggle('muted', !audioOn);
    });
    
    // Pattern
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPattern = this.dataset.pattern;
            createParticles(currentPattern);
        });
    });
    
    // Color
    document.getElementById('colorPicker').addEventListener('input', (e) => {
        currentColor = parseInt(e.target.value.replace('#', '0x'), 16);
        createParticles(currentPattern);
    });
    
    document.querySelectorAll('.preset').forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.dataset.color;
            document.getElementById('colorPicker').value = color;
            currentColor = parseInt(color.replace('#', '0x'), 16);
            createParticles(currentPattern);
        });
    });
    
    // Close photo
    document.getElementById('closeBtn').addEventListener('click', closePhoto);
    
    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== Time Counter =====
function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        document.getElementById('time').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

// ===== Init =====
function init() {
    console.log('🚀 Initializing...');
    
    initThree();
    initEvents();
    updateUI();
    
    // Preload first few photos
    console.log('📸 Preloading initial photos...');
    for (let i = 0; i < Math.min(PRELOAD_COUNT, photos.length); i++) {
        preloadPhoto(i);
    }
    
    // Load first photo
    setTimeout(() => {
        console.log('📸 Loading first photo...');
        updatePhotoTexture();
    }, 100);
    
    startTimer();
    
    // Lazy load MediaPipe
    setTimeout(initMediaPipe, 500);
    
    console.log('✅ Initialization complete!');
    console.log('💡 Tip: First', PRELOAD_COUNT, 'photos are preloaded for smooth start');
}

// Start
init();
