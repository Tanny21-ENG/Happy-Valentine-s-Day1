// playful confirm page
document.addEventListener('DOMContentLoaded', function () {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    let noClicks = 0;
    const MAX_NO_CLICKS = 3;

    function goToValentine(delay = 600) {
        setTimeout(() => { window.location.href = 'valentine.html'; }, delay);
    }

    yesBtn.addEventListener('click', function () {
        yesBtn.disabled = true;
        yesBtn.textContent = 'ดีใจจัง! 💕';
        document.body.classList.add('celebrate');
        goToValentine(700);
    });

    // Move the "ไม่เป็น" button to a random on-screen position
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

    // Try to avoid accidental clicks: move on hover/touch
    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('touchstart', function (e) { e.preventDefault(); moveNoButton(); });

    noBtn.addEventListener('click', function (e) {
        noClicks++;
        moveNoButton();

        if (noClicks >= MAX_NO_CLICKS) {
            // After too many tries, prompt and go to the cover normally
            setTimeout(() => { alert('เป็นแฟนสิ 💕'); }, 80);
            goToValentine(450);
        }
    });

    // Periodically nudge the button to 'วาป' while the page is open
    const autoMove = setInterval(moveNoButton, 2500);
    // stop auto-move if user chooses 'เป็น'
    yesBtn.addEventListener('click', () => clearInterval(autoMove));

    // Ensure the "ไม่เป็น" button is placed initially in a visible spot
    moveNoButton();
    // Reposition on resize
    window.addEventListener('resize', moveNoButton);
});