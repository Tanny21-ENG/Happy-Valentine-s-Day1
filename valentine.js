// Initialize celebrated flag from localStorage (disabled celebration overlay)
let celebrated = true; // Always true = overlay won't show
// Countdown for a 1-year period (start 10/02/69 BE → end 10/02/70 BE)
function updateCountdown() {
    // BE 2569 ("69") → AD 2026 ; BE 2570 ("70") → AD 2027
    const startDate = new Date('2026-02-10T00:00:00'); // 10/02/69 (start)
    const endDate = new Date('2027-02-10T00:00:00');   // 10/02/70 (complete)
    const now = new Date();

    const header = document.querySelector('.love-counter h3');

    // Determine which target to count toward
    let target = null;
    if (now < startDate) {
        target = startDate;
        if (header) header.textContent = 'นับถอยหลังจะเริ่ม — 10/02/69';
    } else if (now >= startDate && now < endDate) {
        target = endDate;
        if (header) header.textContent = 'นับถอยหลังสู่ครบ 1 ปี (10/02/69 → 10/02/70)';
    } else if (now >= endDate) {
        // COMPLETED: the 1-year period
        if (header) header.textContent = 'ครบ 1 ปีแล้ว 🎉';
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        // Trigger celebration overlay (only if not shown yet)
        if (!celebrated) {
            console.log('Triggering celebration overlay...');
            showCelebrationOverlay();
        }
        return;
    }

    const diff = target - now;
    if (diff <= 0) {
        // edge case — fall back to zeros
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseMessage = document.getElementById('surpriseMessage');
const musicBtn = document.getElementById('musicBtn');
const music = document.getElementById('bgMusic');
const musicIcon = musicBtn.querySelector('.music-icon');
const volumeSlider = document.getElementById('volumeSlider');
const videoPopup = document.getElementById('videoPopup');
const videoClose = document.getElementById('videoClose');
const surpriseVideo = document.getElementById('surpriseVideo');

function openVideoPopup() {
    if (!videoPopup) return;

    videoPopup.classList.remove('hidden');
    videoPopup.setAttribute('aria-hidden', 'false');
    surpriseVideo?.play().catch(() => {
        // Autoplay might be blocked; show controls already visible
    });
    document.body.style.overflow = 'hidden';
}

function closeVideoPopup() {
    if (!videoPopup) return;

    videoPopup.classList.add('hidden');
    videoPopup.setAttribute('aria-hidden', 'true');
    if (surpriseVideo) {
        surpriseVideo.pause();
        surpriseVideo.currentTime = 0;
    }
    document.body.style.overflow = '';
}

if (surpriseBtn) {
    surpriseBtn.addEventListener('click', function () {
        if (surpriseMessage) {
            surpriseMessage.classList.remove('hidden');
            setTimeout(() => {
                surpriseMessage.classList.add('show');
            }, 10);
        }

        createHeartBurst();
        openVideoPopup();

        this.textContent = 'ฉันรักเธอมาก ❤️';
        this.disabled = true;
        this.style.opacity = '0.8';

        if (music && music.paused) {
            music.play().then(() => {
                musicBtn.classList.add('playing');
                musicIcon.textContent = '🎵';
            }).catch(() => {
                /* ignore autoplay block */
            });
        }
    });
}

if (videoClose) {
    videoClose.addEventListener('click', closeVideoPopup);
}

if (videoPopup) {
    videoPopup.addEventListener('click', (event) => {
        if (event.target === videoPopup) {
            closeVideoPopup();
        }
    });
}

if (music && volumeSlider) {
    music.volume = parseFloat(volumeSlider.value);
    volumeSlider.addEventListener('input', () => {
        music.volume = parseFloat(volumeSlider.value);
    });
}

const memoryPopup = document.getElementById('memoryPopup');
const popupClose = document.getElementById('popupClose');
const popupTitle = memoryPopup?.querySelector('.popup-title');
const popupGallery = memoryPopup?.querySelector('.popup-gallery');

function openMemoryPopup(card) {
    if (!memoryPopup || !popupTitle || !popupGallery) return;

    const title = card.getAttribute('data-title') || 'ความทรงจำของเรา';
    const images = (card.getAttribute('data-images') || '').split(',').filter(Boolean);

    popupTitle.textContent = title;
    popupGallery.innerHTML = '';

    if (images.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'popup-placeholder';
        placeholder.textContent = 'ยังไม่มีภาพในความทรงจำนี้ แต่เรายังคงจำความรู้สึกได้เสมอ 💕';
        popupGallery.appendChild(placeholder);
    } else {
        images.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src.trim();
            img.alt = `${title} ${index + 1}`;
            popupGallery.appendChild(img);
        });
    }

    memoryPopup.classList.remove('hidden');
}

function closeMemoryPopup() {
    if (memoryPopup) {
        memoryPopup.classList.add('hidden');
    }
}

document.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => openMemoryPopup(card));
});

if (popupClose) {
    popupClose.addEventListener('click', closeMemoryPopup);
}

if (memoryPopup) {
    memoryPopup.addEventListener('click', (event) => {
        if (event.target === memoryPopup) {
            closeMemoryPopup();
        }
    });
}

function startBackgroundMusic() {
    if (music && music.paused) {
        music.play().then(() => {
            musicBtn.classList.add('playing');
            musicIcon.textContent = '🎵';
        }).catch(() => {
        });
    }
}

musicBtn.addEventListener('click', () => {
    if (music.paused) {
        music.play();
        musicBtn.classList.add('playing');
        musicIcon.textContent = '🎵';
    } else {
        music.pause();
        musicBtn.classList.remove('playing');
        musicIcon.textContent = '🔇';
    }
});

document.addEventListener('click', function handleFirstClick() {
    startBackgroundMusic();
    document.removeEventListener('click', handleFirstClick);
});

document.addEventListener('touchstart', function handleFirstTouch() {
    startBackgroundMusic();
    document.removeEventListener('touchstart', handleFirstTouch);
});

window.addEventListener('load', function () {
    startBackgroundMusic();
});

// Create heart burst effect
function createHeartBurst() {
    const colors = ['❤️', '💕', '💖', '💗', '💝'];
    const container = document.body;

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = colors[Math.floor(Math.random() * colors.length)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight / 2 + 'px';
            heart.style.fontSize = Math.random() * 20 + 20 + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '9999';
            heart.style.animation = 'floatUp 3s ease-out forwards';

            container.appendChild(heart);

            // Remove heart after animation
            setTimeout(() => {
                heart.remove();
            }, 3000);
        }, i * 50);
    }
}

// Add interactive hover effects to memory cards
document.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        // Create small floating heart
        const heart = document.createElement('div');
        heart.textContent = '💕';
        heart.style.position = 'absolute';
        heart.style.pointerEvents = 'none';
        heart.style.fontSize = '20px';
        heart.style.animation = 'floatUp 2s ease-out forwards';
        heart.style.zIndex = '10';

        const rect = this.getBoundingClientRect();
        heart.style.left = rect.left + rect.width / 2 + 'px';
        heart.style.top = rect.top + 'px';

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 2000);
    });
});

// Add click interaction to reason items
document.querySelectorAll('.reason-item').forEach((item, index) => {
    item.addEventListener('click', function () {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';

        const rect = this.getBoundingClientRect();
        ripple.style.left = event.clientX - rect.left + 'px';
        ripple.style.top = event.clientY - rect.top + 'px';

        this.style.position = 'relative';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create random floating hearts periodically
function createRandomHeart() {
    const hearts = ['❤️', '💕', '💖', '💗', '💝'];
    const heart = document.createElement('div');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.position = 'fixed';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.top = window.innerHeight + 50 + 'px';
    heart.style.fontSize = Math.random() * 15 + 15 + 'px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1';
    heart.style.opacity = '0.4';
    heart.style.animation = 'floatUp 10s linear forwards';

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 10000);
}

// Create a new random heart every 3 seconds
setInterval(createRandomHeart, 3000);

// Global function to close celebration overlay
window.closeCelebrationOverlay = function () {
    console.log('Closing celebration via global function');
    const overlay = document.getElementById('celebrationOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

// Celebration overlay and confetti when anniversary completes
function showCelebrationOverlay() {
    console.log('showCelebrationOverlay called, celebrated =', celebrated);
    if (celebrated) {
        console.log('Already celebrated, skipping.');
        return;
    }
    celebrated = true;
    localStorage.setItem('celebrationShown', 'true');

    const overlay = document.getElementById('celebrationOverlay');
    if (!overlay) {
        console.error('celebrationOverlay element not found');
        return;
    }

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    console.log('Overlay shown');

    // Ensure music is playing for mood
    if (music && music.paused) {
        music.play().catch(() => { });
        musicBtn.classList.add('playing');
    }

    // Start repeated heart bursts for a short while
    createHeartBurst();
    const heartInterval = setInterval(createHeartBurst, 800);

    // Confetti generator
    const confettiContainer = document.getElementById('confettiContainer');
    const colors = ['#ff6b81', '#ff9a9e', '#ffd3e2', '#ffe8f0', '#ffd1dc'];
    const confettiInterval = setInterval(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        confettiContainer.appendChild(piece);
        setTimeout(() => piece.remove(), 4500);
    }, 80);

    // Stop periodic effects after a timeout
    setTimeout(() => {
        clearInterval(confettiInterval);
        clearInterval(heartInterval);
    }, 8000);

    // Setup close button 
    const closeBtn = document.getElementById('celebrateClose');
    if (closeBtn) {
        closeBtn.style.pointerEvents = 'auto';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '10001';
        closeBtn.onclick = window.closeCelebrationOverlay;
        console.log('Close button set up with onclick to window.closeCelebrationOverlay');
    } else {
        console.error('celebrateClose button not found');
    }

    // Click outside to close
    overlay.onclick = function (e) {
        console.log('Overlay click, target:', e.target.id || e.target.className);
        if (e.target === overlay) {
            window.closeCelebrationOverlay();
        }
    };
}

// Add keyboard interaction - Press 'L' for love
document.addEventListener('keypress', function (event) {
    if (event.key === 'l' || event.key === 'L') {
        const messages = [
            'ฉันรักเธอ ❤️',
            'เธอน่ารักที่สุด 💕',
            'รักนะที่รัก 💖',
            'ขอบคุณที่อยู่ข้างๆ ฉัน 💗',
            'เธอคือทุกสิ่ง 💝'
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        const popup = document.createElement('div');
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.fontSize = '2rem';
        popup.style.color = '#e83e8c';
        popup.style.fontWeight = 'bold';
        popup.style.zIndex = '10000';
        popup.style.animation = 'fadeInOut 2s ease forwards';
        popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.2)';

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 2000);
    }
});

// Add fade in out animation
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(fadeStyle);

// Touch interaction for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function (e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    // Swipe up to create hearts
    if (touchStartY - touchEndY > 50) {
        createHeartBurst();
    }
});

// Page visibility change - create hearts when returning to tab
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        createHeartBurst();
    }
});

// Initialize with a welcome animation
window.addEventListener('load', function () {
    setTimeout(() => {
        createHeartBurst();
    }, 500);
});
