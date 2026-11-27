const menus = [...document.querySelectorAll('.catalog-menu')];
for (const menu of menus) {
  menu.addEventListener('toggle', () => {
    if (menu.open) menus.filter(other => other !== menu).forEach(other => { other.open = false; });
  });
  menu.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return;
    event.stopPropagation();
    menu.open = false;
    menu.querySelector('summary').focus();
  });
}
document.addEventListener('click', event => {
  for (const menu of menus) {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  }
});

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
for (const chooser of document.querySelectorAll('.team-options')) {
  const buttons=Array.from(chooser.querySelectorAll('button'));
  for (const button of buttons) button.addEventListener('click',()=>{
    for(const item of buttons) {
      const active=item===button;
      item.setAttribute('aria-pressed',String(active));
      document.getElementById(item.getAttribute('aria-controls')).hidden=!active;
    }
  });
}
