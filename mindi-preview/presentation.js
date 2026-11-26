const expenseOptions = [...document.querySelectorAll('[data-expense]')];
const ring = document.querySelector('.expense-ring');
const expenseResult = document.querySelector('.expense-result');
const palette = ['#1875b8', '#46b1e5', '#b97520', '#7997a8'];
const totalLabel = expenseResult.querySelector('span').textContent;
const totalAmount = expenseResult.querySelector('strong').textContent;

function selectExpense(selected) {
  let start = 0;
  const stops = expenseOptions.map((button, index) => {
    const end = start + Number(button.dataset.ratio) * 100;
    const color = selected && button !== selected ? 'var(--ring-muted)' : palette[index];
    const stop = `${color} ${start}% ${end}%`;
    start = end;
    return stop;
  });
  ring.style.background = `conic-gradient(${stops.join(', ')})`;
  expenseOptions.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
  expenseResult.querySelector('span').textContent = selected ? selected.querySelector('span').textContent : totalLabel;
  expenseResult.querySelector('strong').textContent = selected ? selected.querySelector('small').textContent : totalAmount;
  expenseResult.querySelector('small').textContent = selected ? selected.querySelector('strong').textContent : '';
}
function toggleExpense(button) {
  selectExpense(button.getAttribute('aria-pressed') === 'true' ? undefined : button);
}
expenseOptions.forEach(button => button.addEventListener('click', () => toggleExpense(button)));
ring.addEventListener('click', event => {
  const bounds = ring.getBoundingClientRect();
  const radius = bounds.width / 2;
  const x = event.clientX - bounds.left - radius;
  const y = event.clientY - bounds.top - radius;
  const distance = Math.hypot(x, y) / radius;
  if (distance < 0.76 || distance > 1) return;
  let position = (Math.atan2(x, -y) / (2 * Math.PI) + 1) % 1;
  for (const button of expenseOptions) {
    position -= Number(button.dataset.ratio);
    if (position < 0) {
      toggleExpense(button);
      return;
    }
  }
});
selectExpense();

const flow = document.querySelector('[data-inputs]');
const nodes = [...flow.querySelectorAll('.signal-node')];
const results = [...flow.querySelectorAll('[data-flow-result]')];
const inputs = flow.dataset.inputs.split('|');

function selectDirection(selected, index) {
  nodes.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
  flow.dataset.activeRow = String(Math.floor(index / 2));
  results[0].textContent = inputs[index];
  results[1].textContent = `${inputs[index]} · ${flow.dataset.rights}`;
}
nodes.forEach((button, index) => button.addEventListener('click', () => selectDirection(button, index)));
selectDirection(nodes[0], 0);

if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('presentation-enter');
      observer.unobserve(target);
    }
  }, { threshold: 0.16 });
  document.querySelectorAll('.presentation-reveal').forEach(section => observer.observe(section));
}
