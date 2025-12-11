function initIntersectionAndTiltAndAdvice() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const header = entry.target.querySelector('.section-header');
                if (header) header.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('section').forEach(sec => observer.observe(sec));

    const cards = document.querySelectorAll('.tilt-card');
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 90;
        const y = (window.innerHeight / 2 - e.pageY) / 90;
        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
        });
    });

    document.querySelectorAll('.advice-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('active'));
    });
}
