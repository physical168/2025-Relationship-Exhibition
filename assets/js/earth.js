function initEarthGlobe() {
    const earthContainer = document.getElementById('earth-container');
    if (!earthContainer || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    earthContainer.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const loader = new THREE.TextureLoader();
    const earthTex = loader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
    const earthGeom = new THREE.SphereGeometry(3, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({ map: earthTex, specular: 0x222222, shininess: 8 });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    globeGroup.add(earthMesh);

    const atmosphereGeom = new THREE.SphereGeometry(3.05, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({ color: 0x6ea8ff, transparent: true, opacity: 0.1, side: THREE.BackSide });
    globeGroup.add(new THREE.Mesh(atmosphereGeom, atmosphereMat));

    const starsGeom = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 60 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.cos(phi);
        starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starsGeom, starsMat));

    const cities = [
        { name: '武汉', en: 'Wuhan', lat: 30.5928, lon: 114.3055 },
        { name: '洛杉矶', en: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
        { name: '尼斯', en: 'Nice', lat: 43.7102, lon: 7.2620 },
        { name: '都柏林', en: 'Dublin', lat: 53.3498, lon: -6.2603 },
    ];
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const markerGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const markerMat = new THREE.MeshPhongMaterial({
        color: 0xf5d06f,
        emissive: 0x6b4b1a,
        emissiveIntensity: 0.45,
        shininess: 40
    });

    function latLonToVector3(lat, lon, radius) {
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon + 180);
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    function makeLabelTexture(text) {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 64;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        const grad = ctx.createLinearGradient(0, 0, c.width, 0);
        grad.addColorStop(0, 'rgba(20,24,35,0.65)');
        grad.addColorStop(1, 'rgba(40,45,65,0.65)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.strokeRect(1.5, 1.5, c.width - 3, c.height - 3);
        ctx.fillStyle = '#f8fbff';
        ctx.font = 'bold 26px "Playfair Display", "Inter", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(text, c.width / 2, c.height / 2);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    cities.forEach(city => {
        const pos = latLonToVector3(city.lat, city.lon, 3.02);
        const m = new THREE.Mesh(markerGeom, markerMat.clone());
        m.position.copy(pos);
        markerGroup.add(m);

        const labelMat = new THREE.SpriteMaterial({ map: makeLabelTexture(`${city.en}`), transparent: true, depthWrite: false });
        const label = new THREE.Sprite(labelMat);
        label.scale.set(2.0, 0.48, 1);
        label.position.copy(pos.clone().normalize().multiplyScalar(3.25));
        markerGroup.add(label);
    });

    camera.position.set(0, 0, 9);
    let isDragging = false;
    let prev = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    earthContainer.addEventListener('pointerdown', (e) => {
        isDragging = true;
        prev.x = e.clientX;
        prev.y = e.clientY;
    });
    window.addEventListener('pointerup', () => { isDragging = false; });
    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        prev.x = e.clientX;
        prev.y = e.clientY;
        rotation.y += dx * 0.005;
        rotation.x += dy * 0.005;
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
    });

    function animateEarth() {
        requestAnimationFrame(animateEarth);
        if (!isDragging) rotation.y += 0.0008;
        globeGroup.rotation.set(rotation.x, rotation.y, 0);
        renderer.render(scene, camera);
    }
    animateEarth();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
}
