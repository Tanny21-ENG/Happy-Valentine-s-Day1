(function () {
    'use strict';

    // --- เก็บ element ทุกตัวที่จะใช้งาน (cache) ---
    const el = {
        header: null,
        days: null,
        hours: null,
        minutes: null,
        seconds: null,
        surpriseBtn: null,
        surpriseMessage: null,
        musicBtn: null,
        music: null,
        musicIcon: null,
        volumeSlider: null,
        videoPopup: null,
        videoClose: null,
        surpriseVideo: null,
        memoryPopup: null,
        popupClose: null,
        popupTitle: null,
        popupGallery: null,
        maskToggle: null,
        pinCells: null,
        celebrationOverlay: null,
        celebrateClose: null,
        confettiContainer: null
    };

    // สถานะภายใน
    let celebrated = true; // ตั้งเป็น true หากไม่ต้องการให้เด้งเอง
    let heartInterval, confettiInterval;

    // ฟังก์ชันช่วยสั้น ๆ
    function $(s) { return document.querySelector(s); }
    function $all(s) { return Array.from(document.querySelectorAll(s)); }
    function createElem(tag, props) {
        const e = document.createElement(tag);
        for (const k in props) e[k] = props[k];
        return e;
    }

    // เก็บ element
    function cacheElements() {
        el.header = $('.love-counter h3');
        el.days = $('#days');
        el.hours = $('#hours');
        el.minutes = $('#minutes');
        el.seconds = $('#seconds');
        el.surpriseBtn = $('#surpriseBtn');
        el.surpriseMessage = $('#surpriseMessage');
        el.musicBtn = $('#musicBtn');
        el.music = $('#bgMusic');
        el.musicIcon = el.musicBtn?.querySelector('.music-icon');
        el.volumeSlider = $('#volumeSlider');
        el.videoPopup = $('#videoPopup');
        el.videoClose = $('#videoClose');
        el.surpriseVideo = $('#surpriseVideo');
        el.memoryPopup = $('#memoryPopup');
        el.popupClose = $('#popupClose');
        el.popupTitle = el.memoryPopup?.querySelector('.popup-title');
        el.popupGallery = el.memoryPopup?.querySelector('.popup-gallery');
        el.maskToggle = $('#maskPins');
        el.pinCells = $all('.pin-cell');
        el.celebrationOverlay = $('#celebrationOverlay');
        el.celebrateClose = $('#celebrateClose');
        el.confettiContainer = $('#confettiContainer');
    }

    // -----------------------------------
    // นับถอยหลัง
    // -----------------------------------
    function updateCountdown() {
        const now = new Date();
        const startDate = new Date('2026-02-10T00:00:00');
        const endDate = new Date('2027-02-10T00:00:00');
        let target, headerText;

        if (now < startDate) {
            target = startDate;
            headerText = 'นับถอยหลังจะเริ่ม — 10/02/69';
        } else if (now < endDate) {
            target = endDate;
            headerText = 'นับถอยหลังสู่ครบ 1 ปี (10/02/69 → 10/02/70)';
        } else {
            // ครบปีแล้ว
            if (el.header) el.header.textContent = 'ครบ 1 ปีแล้ว 🎉';
            ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
                const d = document.getElementById(id);
                if (d) d.textContent = '0';
            });
            if (!celebrated) showCelebrationOverlay();
            return;
        }

        if (el.header) el.header.textContent = headerText;

        const diff = target - now;
        if (diff <= 0) {
            ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
                const d = document.getElementById(id);
                if (d) d.textContent = '0';
            });
            return;
        }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        el.days.textContent = days;
        el.hours.textContent = String(hours).padStart(2, '0');
        el.minutes.textContent = String(mins).padStart(2, '0');
        el.seconds.textContent = String(secs).padStart(2, '0');
    }

    // -----------------------------------
    // เพลงพื้นหลัง
    // -----------------------------------
    function startBackgroundMusic() {
        if (el.music && el.music.paused) {
            el.music.play().then(() => {
                el.musicBtn.classList.add('playing');
                if (el.musicIcon) el.musicIcon.textContent = '🎵';
            }).catch(() => { });
        }
    }

    // -----------------------------------
    // ป๊อปอัพ
    // -----------------------------------
    function openVideoPopup() {
        if (!el.videoPopup) return;
        el.videoPopup.classList.remove('hidden');
        el.videoPopup.setAttribute('aria-hidden', 'false');
        el.surpriseVideo?.play().catch(() => { });
        document.body.style.overflow = 'hidden';
    }
    function closeVideoPopup() {
        if (!el.videoPopup) return;
        el.videoPopup.classList.add('hidden');
        el.videoPopup.setAttribute('aria-hidden', 'true');
        if (el.surpriseVideo) {
            el.surpriseVideo.pause();
            el.surpriseVideo.currentTime = 0;
        }
        document.body.style.overflow = '';
    }

    function openMemoryPopup(card) {
        if (!el.memoryPopup || !el.popupTitle || !el.popupGallery) return;
        const title = card.getAttribute('data-title') || 'ความทรงจำของเรา';
        const images = (card.getAttribute('data-images') || '').split(',').filter(Boolean);
        el.popupTitle.textContent = title;
        el.popupGallery.innerHTML = '';
        if (images.length === 0) {
            const placeholder = createElem('div', { className: 'popup-placeholder' });
            placeholder.textContent = 'ยังไม่มีภาพในความทรงจำนี้ แต่เรายังคงจำความรู้สึกได้เสมอ 💕';
            el.popupGallery.appendChild(placeholder);
        } else {
            images.forEach((src, i) => {
                const img = createElem('img', { src: src.trim(), alt: `${title} ${i + 1}` });
                el.popupGallery.appendChild(img);
            });
        }
        el.memoryPopup.classList.remove('hidden');
    }
    function closeMemoryPopup() {
        el.memoryPopup?.classList.add('hidden');
    }

    // -----------------------------------
    // เอฟเฟกต์หัวใจ / confetti
    // -----------------------------------
    function createHeartBurst() {
        const colors = ['❤️', '💕', '💖', '💗', '💝'];
        const container = document.body;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const heart = createElem('div', { textContent: colors[Math.floor(Math.random() * colors.length)] });
                Object.assign(heart.style, {
                    position: 'fixed',
                    left: Math.random() * window.innerWidth + 'px',
                    top: window.innerHeight / 2 + 'px',
                    fontSize: Math.random() * 20 + 20 + 'px',
                    pointerEvents: 'none',
                    zIndex: '9999',
                    animation: 'floatUp 3s ease-out forwards'
                });
                container.appendChild(heart);
                setTimeout(() => heart.remove(), 3000);
            }, i * 50);
        }
    }
    function createRandomHeart() {
        const hearts = ['❤️', '💕', '💖', '💗', '💝'];
        const heart = createElem('div', { textContent: hearts[Math.floor(Math.random() * hearts.length)] });
        Object.assign(heart.style, {
            position: 'fixed',
            left: Math.random() * window.innerWidth + 'px',
            top: window.innerHeight + 50 + 'px',
            fontSize: Math.random() * 15 + 15 + 'px',
            pointerEvents: 'none',
            zIndex: '1',
            opacity: '0.4',
            animation: 'floatUp 10s linear forwards'
        });
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 10000);
    }

    // -----------------------------------
    // ตั้ง event ต่าง ๆ
    // -----------------------------------
    function attachSurpriseBtn() {
        if (!el.surpriseBtn) return;
        el.surpriseBtn.addEventListener('click', function () {
            el.surpriseMessage?.classList.remove('hidden');
            setTimeout(() => el.surpriseMessage?.classList.add('show'), 10);
            createHeartBurst();
            openVideoPopup();
            this.textContent = 'ฉันรักเธอมาก ❤️';
            this.disabled = true;
            this.style.opacity = '0.8';
            if (el.music && el.music.paused) startBackgroundMusic();
        });
    }
    function attachMiscListeners() {
        el.videoClose?.addEventListener('click', closeVideoPopup);
        el.videoPopup?.addEventListener('click', e => { if (e.target === el.videoPopup) closeVideoPopup(); });
        el.memoryPopup?.addEventListener('click', e => { if (e.target === el.memoryPopup) closeMemoryPopup(); });
        el.popupClose?.addEventListener('click', closeMemoryPopup);

        el.musicBtn?.addEventListener('click', () => {
            if (el.music.paused) {
                el.music.play();
                el.musicBtn.classList.add('playing');
                el.musicIcon.textContent = '🎵';
            } else {
                el.music.pause();
                el.musicBtn.classList.remove('playing');
                el.musicIcon.textContent = '🔇';
            }
        });
        el.volumeSlider?.addEventListener('input', () => {
            el.music.volume = parseFloat(el.volumeSlider.value);
        });

        el.maskToggle?.addEventListener('change', () => {
            const show = !el.maskToggle.checked;
            el.pinCells.forEach(td => {
                td.textContent = show ? td.dataset.pin : '••••••';
            });
        });

        if (el.celebrateClose) {
            el.celebrateClose.style.pointerEvents = 'auto';
            el.celebrateClose.style.cursor = 'pointer';
            el.celebrateClose.onclick = window.closeCelebrationOverlay;
        }
    }
    function attachGlobalActions() {
        document.addEventListener('keypress', function (event) {
            if (event.key.toLowerCase() === 'l') {
                const msgs = [
                    'ฉันรักเธอ ❤️', 'เธอน่ารักที่สุด 💕', 'รักนะที่รัก 💖',
                    'ขอบคุณที่อยู่ข้างๆ ฉัน 💗', 'เธอคือทุกสิ่ง 💝'
                ];
                const message = msgs[Math.floor(Math.random() * msgs.length)];
                const popup = createElem('div', { textContent: message });
                Object.assign(popup.style, {
                    position: 'fixed', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: '2rem', color: '#e83e8c', fontWeight: 'bold',
                    zIndex: '10000', animation: 'fadeInOut 2s ease forwards',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                });
                document.body.appendChild(popup);
                setTimeout(() => popup.remove(), 2000);
            }
        });

        let touchStartX = 0, touchStartY = 0;
        document.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        document.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX;
            const dy = e.changedTouches[0].clientY;
            if (touchStartY - dy > 50) createHeartBurst();
        });

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) createHeartBurst();
        });

        const startOnInteraction = () => {
            startBackgroundMusic();
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
        window.addEventListener('load', () => {
            startBackgroundMusic();
            setTimeout(createHeartBurst, 500);
        });
    }

    // -----------------------------------
    // overlay ฉลอง
    // -----------------------------------
    function showCelebrationOverlay() {
        if (celebrated) return;
        celebrated = true;
        localStorage.setItem('celebrationShown', 'true');
        if (!el.celebrationOverlay) return;
        el.celebrationOverlay.classList.remove('hidden');
        el.celebrationOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (el.music && el.music.paused) startBackgroundMusic();
        createHeartBurst();
        heartInterval = setInterval(createHeartBurst, 800);

        const colors = ['#ff6b81', '#ff9a9e', '#ffd3e2', '#ffe8f0', '#ffd1dc'];
        confettiInterval = setInterval(() => {
            const piece = createElem('div', { className: 'confetti-piece' });
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.confettiContainer.appendChild(piece);
            setTimeout(() => piece.remove(), 4500);
        }, 80);

        setTimeout(() => {
            clearInterval(confettiInterval);
            clearInterval(heartInterval);
        }, 8000);

        el.celebrateClose && (el.celebrateClose.onclick = window.closeCelebrationOverlay);

        el.celebrationOverlay.onclick = function (e) {
            if (e.target === el.celebrationOverlay) window.closeCelebrationOverlay();
        };
    }

    // เริ่มเมื่อ DOM พร้อม
    document.addEventListener('DOMContentLoaded', function () {
        cacheElements();
        attachSurpriseBtn();
        attachMiscListeners();
        attachGlobalActions();
        setInterval(updateCountdown, 1000);
        updateCountdown();
        setInterval(createRandomHeart, 3000);

        celebrated = localStorage.getItem('celebrationShown') === 'true';
    });

    // ฟังก์ชันที่ใช้ข้ามโมดูล
    window.showCelebrationOverlay = showCelebrationOverlay;
    window.closeCelebrationOverlay = function () {
        const o = el.celebrationOverlay;
        if (o) {
            o.classList.add('hidden');
            o.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

})();
