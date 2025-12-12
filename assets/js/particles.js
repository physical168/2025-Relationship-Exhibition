function initParticlesCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let meteors = [];
    let pointer = { x: 0.5, y: 0.5 }; // 归一化指针位置，用于视差

    function initParticles() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const count = 240;
        particles = new Array(count).fill(0).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.2 + 0.3,
            z: Math.random() * 1.4 + 0.3, // 景深层：0.3-1.7 越大越靠近
            d: Math.random() * 20,
            drift: (Math.random() - 0.5) * 0.15
        }));
        meteors = [];
    }

    function moveParticles() {
        particles.forEach(p => {
            p.y -= 0.35;
            p.x += p.drift;
            if (p.y < -10) p.y = height + 10;
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
        });
    }

    function moveMeteors() {
        meteors.forEach(m => {
            m.x += m.dx * m.speed;
            m.y += m.dy * m.speed;
            m.alpha -= 0.01;
        });
        meteors = meteors.filter(m => m.x < width + 200 && m.y < height + 200 && m.alpha > 0.05);
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.lineCap = 'round';
        meteors.forEach(m => {
            ctx.strokeStyle = `rgba(255,255,255,${m.alpha})`;
            ctx.lineWidth = m.thickness;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.dx * m.length, m.y - m.dy * m.length);
            ctx.stroke();
        });
        ctx.restore();

        ctx.beginPath();
        particles.forEach(p => {
            const depthFactor = 1 / p.z; // z 越大越近
            const size = p.r * depthFactor * 1.3;
            const alpha = Math.min(1, 0.3 + depthFactor * 0.9);
            const parallaxX = (pointer.x - 0.5) * 30 * (1.2 - depthFactor);
            const parallaxY = (pointer.y - 0.5) * 30 * (1.2 - depthFactor);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.moveTo(p.x + parallaxX, p.y + parallaxY);
            ctx.arc(p.x + parallaxX, p.y + parallaxY, size, 0, Math.PI * 2, true);
        });
        ctx.fill();
        moveParticles();
        moveMeteors();
    }

    function spawnMeteor() {
        const startX = Math.random() * (width + 160) - 80;
        const startY = -40 + Math.random() * 30;
        const angle = Math.random() * 0.6 + 0.25;
        const dir = Math.random() < 0.5 ? -1 : 1;
        const speed = Math.random() * 4 + 6;
        const dx = Math.cos(angle) * dir;
        const dy = Math.sin(angle);
        meteors.push({
            x: startX,
            y: startY,
            dx,
            dy,
            speed,
            length: Math.random() * 70 + 70,
            thickness: Math.random() * 1 + 1,
            alpha: 0.9
        });
    }

    initParticles();
    const meteorTimer = setInterval(spawnMeteor, 3000);
    const drawTimer = setInterval(drawParticles, 30);
    window.addEventListener('resize', initParticles);
    window.addEventListener('pointermove', (e) => {
        pointer.x = e.clientX / Math.max(width, 1);
        pointer.y = e.clientY / Math.max(height, 1);
    });

    return () => {
        clearInterval(meteorTimer);
        clearInterval(drawTimer);
        window.removeEventListener('resize', initParticles);
        window.removeEventListener('pointermove', () => {});
    };
}
