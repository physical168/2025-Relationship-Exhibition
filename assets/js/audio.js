function initAudioControls() {
    const bgm = document.getElementById('bgm');
    const musicToggle = document.getElementById('music-toggle');
    if (!bgm || !musicToggle) return;

    const updateMusicUI = () => {
        musicToggle.textContent = bgm.paused ? '▶︎' : '❚❚';
        musicToggle.setAttribute('aria-pressed', bgm.paused ? 'false' : 'true');
    };

    const tryPlayOnce = () => {
        bgm.muted = false;
        bgm.play().catch(() => {});
        updateMusicUI();
    };

    window.addEventListener('pointerdown', tryPlayOnce, { once: true });
    window.addEventListener('touchstart', tryPlayOnce, { once: true });

    musicToggle.addEventListener('click', () => {
        if (bgm.paused) bgm.play(); else bgm.pause();
        updateMusicUI();
    });

    updateMusicUI();
}
