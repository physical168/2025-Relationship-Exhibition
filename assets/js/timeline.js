function initTimelineScroll() {
    const scrollContainer = document.getElementById('scrollContainer');
    if (!scrollContainer) return;
    scrollContainer.addEventListener('wheel', (evt) => {
        if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
            evt.preventDefault();
            scrollContainer.scrollLeft += evt.deltaY;
        }
    }, { passive: false });
}
