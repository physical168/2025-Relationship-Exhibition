function initLoveFloat() {
    const container = document.getElementById('love-float-canvas');
    if (!container || !window.THREE) return;

    const loveWords = [
        "我爱你", "I Love You", "Je t'aime", "愛してる", "사랑해",
        "Ich liebe dich", "Te amo", "Ti amo", "Я тебя люблю", "Eu te amo",
        "Saranghae", "Aishiteru"
    ];

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x020305, 8, 35);

    const camera = new THREE.PerspectiveCamera(
        65,
        Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
        0.1,
        1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const particles = [];
    const particleCount = 80;

    function createTextSprite(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 56;
        ctx.font = `bold ${fontSize}px "Playfair Display", "Noto Serif SC", serif`;
        const metrics = ctx.measureText(text);
        const width = Math.max(metrics.width + 80, 260);
        const height = fontSize * 1.7;
        canvas.width = width;
        canvas.height = height;
        ctx.font = `bold ${fontSize}px "Playfair Display", "Noto Serif SC", serif`;
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = "rgba(255, 182, 193, 0.75)";
        ctx.shadowBlur = 16;
        ctx.fillText(text, width / 2, height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85, color: 0xffffff });
        const sprite = new THREE.Sprite(material);
        const scale = 0.022;
        sprite.scale.set(width * scale, height * scale, 1);
        return sprite;
    }

    function resetParticle(sprite, initial = false) {
        sprite.position.x = (Math.random() - 0.5) * 30;
        sprite.position.y = (Math.random() - 0.5) * 20;
        sprite.position.z = initial ? (Math.random() * -40) : -40;
        sprite.material.rotation = (Math.random() - 0.5) * 0.25;
        const scaleVar = 0.8 + Math.random() * 0.5;
        sprite.scale.multiplyScalar(scaleVar);
    }

    for (let i = 0; i < particleCount; i++) {
        const word = loveWords[Math.floor(Math.random() * loveWords.length)];
        const sprite = createTextSprite(word);
        resetParticle(sprite, true);
        scene.add(sprite);
        particles.push(sprite);
    }

    let speed = 0.05;
    let targetSpeed = 0.05;
    let resetTimer;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    function animateLove() {
        requestAnimationFrame(animateLove);
        speed += (targetSpeed - speed) * 0.05;
        particles.forEach(p => {
            p.position.z += speed;
            if (p.position.z > camera.position.z) resetParticle(p);
        });
        renderer.render(scene, camera);
    }
    animateLove();

    let pointerDown = false;
    let startX = 0;
    const adjustSpeed = (deltaX) => {
        targetSpeed = clamp(targetSpeed - deltaX * 0.0012, 0.05, 0.9);
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { targetSpeed = 0.05; }, 800);
    };

    container.addEventListener('pointerdown', (e) => { pointerDown = true; startX = e.clientX; });
    window.addEventListener('pointerup', () => { pointerDown = false; });
    window.addEventListener('pointermove', (e) => {
        if (!pointerDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 6) {
            adjustSpeed(dx);
            startX = e.clientX;
        }
    });
    container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
        adjustSpeed(e.deltaX);
    }, { passive: true });

    const resize = () => {
        const w = Math.max(container.clientWidth, 1);
        const h = Math.max(container.clientHeight, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(resize);
        ro.observe(container);
    } else {
        window.addEventListener('resize', resize);
    }
}
