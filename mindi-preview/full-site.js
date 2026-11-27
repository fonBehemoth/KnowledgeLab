const videoVisibility = new IntersectionObserver(entries => {
  for (const {target: video, intersectionRatio} of entries) {
    if (intersectionRatio < 0.55) {
      video.pause();
      continue;
    }
    video.play().catch(() => {
      // Native controls remain available if the browser blocks autoplay.
    });
  }
}, { threshold: 0.55 });

document.querySelectorAll('.film video').forEach(video => videoVisibility.observe(video));

for (const link of document.querySelectorAll('[data-animation]')) {
  const image = link.querySelector('img');
  const label = link.querySelector('span');
  const stop = {ru:'Остановить анимацию',uk:'Зупинити анімацію',en:'Stop animation'}[document.documentElement.lang];
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const playing = link.dataset.playing === 'true';
    link.dataset.playing = String(!playing);
    image.src = playing ? link.dataset.still : link.dataset.animation;
    label.textContent = playing ? label.dataset.play : stop;
  });
}
