// playful confirm page
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    let noClicks = 0;
    const MAX_NO_CLICKS = 3;
    let autoMove;

    function moveNoButton() {
        const padding = 12;
        const bw = noBtn.offsetWidth;
        const bh = noBtn.offsetHeight;
        const maxX = Math.max(window.innerWidth - bw - padding, padding);
        const maxY = Math.max(window.innerHeight - bh - padding, padding);
        const left = Math.floor(Math.random() * (maxX - padding)) + padding;
        const top = Math.floor(Math.random() * (maxY - padding)) + padding;
        noBtn.style.left = left + 'px';
        noBtn.style.top = top + 'px';
        noBtn.style.position = 'fixed';
    }

    function goToValentine(delay = 600) {
        setTimeout(() => { window.location.href = 'valentine.html'; }, delay);
    }

    yesBtn.addEventListener('click', function () {
        yesBtn.disabled = true;
        yesBtn.textContent = 'ดีใจจัง! 💕';
        document.body.classList.add('celebrate');
        if (autoMove) clearInterval(autoMove);
        goToValentine(700);
    });

    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('touchstart', function (e) { e.preventDefault(); moveNoButton(); });
    noBtn.addEventListener('click', function (e) {
        noClicks++;
        moveNoButton();
        if (noClicks >= MAX_NO_CLICKS) {
            setTimeout(() => { alert('เป็นแฟนสิ 💕'); }, 80);
            goToValentine(450);
        }
    });

    autoMove = setInterval(moveNoButton, 2500);
    moveNoButton();
    window.addEventListener('resize', moveNoButton);
});