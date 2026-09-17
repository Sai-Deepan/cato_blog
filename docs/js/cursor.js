  const pointer = document.getElementById('pointerCursor');
  const follow = document.getElementById('followCursor');

  let mouseX = 0, mouseY = 0;
  let pointerX = 0, pointerY = 0;
  let followX = 0, followY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Pointer: fast, tight tracking
    pointerX += (mouseX - pointerX) * 0.35;
    pointerY += (mouseY - pointerY) * 0.35;
    pointer.style.left = pointerX + 'px';
    pointer.style.top = pointerY + 'px';

    // Follow: slower, laggier tracking
    followX += (mouseX - followX) * 0.12;
    followY += (mouseY - followY) * 0.12;
    follow.style.left = followX + 'px';
    follow.style.top = followY + 'px';

    requestAnimationFrame(animate);
  }
  animate();

  // Expand the follow cursor + inject text when hovering tagged elements
  document.querySelectorAll('[data-cursor-text]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follow.textContent = el.getAttribute('data-cursor-text');
      follow.classList.add('expanded');
    });
    el.addEventListener('mouseleave', () => {
      follow.textContent = '';
      follow.classList.remove('expanded');
    });
  });
