// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://rdxyazvuvjbpofebzrnc.supabase.co'; // Ganti dengan URL Supabase kamu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHlhenZ1dmpicG9mZWJ6cm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjU0NjMsImV4cCI6MjA5NjgwMTQ2M30.0B8i-w77gUADrrXnlOJIXKjfQn9U4ylznCu-Lccmv4c'; // Ganti dengan anon key kamu
const STORAGE_BUCKET = 'photos'; // Nama bucket di Supabase Storage

// Initialize Supabase
let supabaseClient;
let photos = [];
let isLoadingPhotos = true;

// State
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

// Initialize Supabase and load photos
async function initSupabase() {
    console.log('🔌 Connecting to Supabase...');
    
    try {
        // Initialize Supabase client
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase connected');
        
        // Load photos from Supabase Storage
        await loadPhotosFromSupabase();
        
    } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        // Fallback to local photos
        loadLocalPhotos();
    }
}

async function loadPhotosFromSupabase() {
    console.log('📸 Loading photos from Supabase Storage...');
    
    try {
        // List all files in the bucket (try root first)
        console.log('Listing files from bucket:', STORAGE_BUCKET);
        
        let { data: files, error } = await supabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .list('', {
                limit: 1000,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (error) {
            console.error('Error listing files:', error);
            throw error;
        }
        
        console.log('📁 Raw files from Supabase:', files);
        console.log('📊 Total items found:', files.length);
        
        // Check if files are in a subfolder
        const folders = files.filter(f => !f.name.match(/\.(jpg|jpeg|png|webp)$/i));
        console.log('📂 Folders found:', folders.map(f => f.name));
        
        // If no images in root, try 'gambar' folder
        if (files.length === 0 || !files.some(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i))) {
            console.log('🔍 No images in root, trying "gambar" folder...');
            
            const { data: subFiles, error: subError } = await supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .list('gambar', {
                    limit: 1000,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' }
                });
            
            if (!subError && subFiles && subFiles.length > 0) {
                console.log('✅ Found files in "gambar" folder:', subFiles.length);
                files = subFiles.map(f => ({ ...f, name: `gambar/${f.name}` }));
            }
        }
        
        console.log(`✅ Found ${files.length} items in Supabase`);
        
        // Filter image files only
        const imageFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            const isImage = ext.endsWith('.jpg') || ext.endsWith('.jpeg') || 
                           ext.endsWith('.png') || ext.endsWith('.webp') ||
                           ext.endsWith('.gif');
            if (isImage) {
                console.log('✅ Valid image:', file.name);
            }
            return isImage;
        });
        
        console.log(`📷 ${imageFiles.length} valid image files`);
        
        if (imageFiles.length === 0) {
            console.warn('⚠️ No image files found. Files in bucket:', files.map(f => f.name));
            throw new Error('No images found');
        }
        
        // Generate photo array with public URLs
        photos = imageFiles.map((file, index) => {
            const { data } = supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(file.name);
            
            console.log(`📸 Photo ${index + 1}: ${file.name} → ${data.publicUrl}`);
            
            return {
                url: data.publicUrl,
                title: `Memory #${index + 1}`,
                caption: file.name.replace(/\.[^/.]+$/, '').replace('gambar/', ''),
                fileName: file.name,
                loaded: false,
                texture: null
            };
        });
        
        console.log('✅ Photos loaded:', photos.length);
        console.log('📋 Sample URL:', photos[0]?.url);
        
        isLoadingPhotos = false;
        
        // Update UI with total
        document.getElementById('total').textContent = photos.length;
        
        if (photos.length === 0) {
            console.warn('⚠️ No photos found in Supabase Storage');
            // Don't show alert, just fallback
            throw new Error('No photos found');
        }
        
    } catch (error) {
        console.error('❌ Error loading photos from Supabase:', error);
        console.log('📁 Falling back to local photos...');
        // Fallback to local
        loadLocalPhotos();
    }
}

function loadLocalPhotos() {
    console.log('📁 Falling back to local photos...');
    const totalPhotos = 44;
    const photoExtension = 'jpeg';
    
    for (let i = 1; i <= totalPhotos; i++) {
        photos.push({
            url: `gambar/${i}.${photoExtension}`,
            title: `Memory #${i}`,
            caption: `Beautiful moment ${i} together`,
            fileName: `${i}.${photoExtension}`,
            loaded: false,
            texture: null
        });
    }
    
    isLoadingPhotos = false;
    document.getElementById('total').textContent = photos.length;
    console.log('✅ Local photos loaded:', photos.length);
}

// Three.js Setup
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
}

function createParticles(pattern) {
    if (particleSystem) scene.remove(particleSystem);
    
    const count = 5000;
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
            return { x: Math.cos(theta) * Math.sin(phi) * 2, y: Math.sin(theta) * Math.sin(phi) * 2, z: Math.cos(phi) * 2 };
        case 'heart':
            const t = (i / total) * Math.PI * 2;
            return { x: 1.5 * Math.sin(t) ** 3, y: 1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t), z: Math.sin(t) * Math.cos(t) * 0.5 };
        case 'spiral':
            const st = (i / total) * Math.PI * 4;
            const r = st * 0.3;
            return { x: Math.cos(st) * r, y: (i / total - 0.5) * 4, z: Math.sin(st) * r };
        case 'wave':
            const x = (i / total - 0.5) * 8;
            return { x: x, y: Math.sin(x * 2) * Math.cos(i * 0.1), z: Math.cos(x * 2) * Math.sin(i * 0.1) };
        case 'galaxy':
            const a = (i / total) * Math.PI * 4;
            const d = (i / total) * 3;
            return { x: Math.cos(a) * d, y: (Math.random() - 0.5) * 0.5, z: Math.sin(a) * d };
        case 'cube':
            return { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 4 };
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
            for (let i = 0; i < positions.length; i += 3) {
                const idx = i / 3;
                const dx = original[i], dy = original[i + 1], dz = original[i + 2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
                const ndx = dx / dist, ndy = dy / dist, ndz = dz / dist;
                const disperseAmount = Math.sin(time * 2 + idx * 0.01) * 1.5;
                const wave = Math.cos(time * 1.5 + idx * 0.02) * 0.3;
                
                positions[i] = original[i] + ndx * disperseAmount + wave;
                positions[i + 1] = original[i + 1] + ndy * disperseAmount + wave;
                positions[i + 2] = original[i + 2] + ndz * disperseAmount + wave;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.rotation.y += 0.003;
            particleSystem.rotation.x += 0.001;
            particleSystem.material.opacity = 0.4;
        } else {
            particleSystem.material.opacity = 0.9;
        }
        
        currentScale += (targetScale - currentScale) * 0.1;
        particleSystem.scale.setScalar(currentScale);
    }
    
    if (photoPlane) {
        if (isSlideshow) {
            photoPlane.material.opacity = Math.min(photoPlane.material.opacity + 0.05, 0.8);
            photoPlane.rotation.z = Math.sin(time * 0.5) * 0.03;
            photoPlane.position.x = Math.sin(time * 0.4) * 0.15;
            photoPlane.position.y = Math.cos(time * 0.35) * 0.15;
            const scalePulse = 1 + Math.sin(time * 0.8) * 0.05;
            photoPlane.scale.set(scalePulse, scalePulse, 1);
            
            if (photoPlane.userData.glow) {
                const glowPulse = (Math.sin(time * 2) + 1) * 0.2;
                photoPlane.userData.glow.material.opacity = glowPulse;
                photoPlane.userData.glow.rotation.z = Math.sin(time * 0.3) * 0.05;
                photoPlane.userData.glow.position.x = photoPlane.position.x;
                photoPlane.userData.glow.position.y = photoPlane.position.y;
                const glowScale = scalePulse * (1 + glowPulse * 0.3);
                photoPlane.userData.glow.scale.set(glowScale, glowScale, 1);
            }
        } else {
            photoPlane.material.opacity = Math.max(photoPlane.material.opacity - 0.03, 0.25);
            if (photoPlane.userData.glow) {
                photoPlane.userData.glow.material.opacity = Math.max(photoPlane.userData.glow.material.opacity - 0.05, 0);
            }
        }
    }
    
    renderer.render(scene, camera);
}

function updatePhotoTexture() {
    if (isLoadingPhotos || photos.length === 0) {
        console.log('⏳ Waiting for photos to load...');
        return;
    }
    
    const photo = photos[currentPhoto];
    console.log('🖼️ Loading photo:', photo.fileName);
    
    textureLoader.load(
        photo.url,
        (texture) => {
            console.log('✅ Photo loaded:', photo.fileName);
            if (photoPlane?.material) {
                photoPlane.material.map = texture;
                photoPlane.material.needsUpdate = true;
                photos[currentPhoto].loaded = true;
            }
        },
        undefined,
        (error) => {
            console.error('❌ Error loading photo:', photo.fileName, error);
        }
    );
}

// MediaPipe
function initMediaPipe() {
    hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults(onResults);
    
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadeddata = () => {
                document.getElementById('status').classList.add('active');
                document.getElementById('statusText').textContent = 'Camera Active';
                const cam = new Camera(video, { onFrame: async () => await hands.send({ image: video }), width: 640, height: 480 });
                cam.start();
            };
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
            targetScale = 1.5;
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

function startSlideshow() {
    if (isSlideshow || isLoadingPhotos || photos.length === 0) return;
    document.getElementById('welcome').classList.add('hidden');
    document.getElementById('progress').classList.add('active');
    isSlideshow = true;
    updatePhotoTexture();
    slideshowInterval = setInterval(nextPhoto, 300);
}

function stopSlideshow() {
    isSlideshow = false;
    document.getElementById('progress').classList.remove('active');
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

function nextPhoto() {
    if (photos.length === 0) return;
    currentPhoto = (currentPhoto + 1) % photos.length;
    viewedPhotos.add(currentPhoto);
    updateUI();
    updatePhotoTexture();
    updateProgress();
}

function updateUI() {
    if (photos.length === 0) return;
    document.getElementById('current').textContent = currentPhoto + 1;
    document.getElementById('total').textContent = photos.length;
    document.getElementById('title').textContent = photos[currentPhoto].title;
    document.getElementById('viewed').textContent = viewedPhotos.size;
}

function updateProgress() {
    if (photos.length === 0) return;
    const circle = document.getElementById('progressCircle');
    const progress = (currentPhoto + 1) / photos.length;
    const offset = 283 - (progress * 283);
    circle.style.strokeDashoffset = offset;
}

function openPhoto() {
    if (photos.length === 0) return;
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

function initEvents() {
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    });
    
    let audioOn = false;
    document.getElementById('audioBtn').addEventListener('click', function() {
        audioOn = !audioOn;
        this.classList.toggle('muted', !audioOn);
    });
    
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPattern = this.dataset.pattern;
            createParticles(currentPattern);
        });
    });
    
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
    
    document.getElementById('closeBtn').addEventListener('click', closePhoto);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        document.getElementById('time').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

async function init() {
    console.log('🚀 Initializing with Supabase...');
    
    // Initialize Supabase and load photos first
    await initSupabase();
    
    // Then init Three.js and UI
    initThree();
    initEvents();
    updateUI();
    
    // Load first photo when available
    if (photos.length > 0) {
        updatePhotoTexture();
    }
    
    startTimer();
    setTimeout(initMediaPipe, 500);
    
    console.log('✅ Initialization complete!');
}

init();
