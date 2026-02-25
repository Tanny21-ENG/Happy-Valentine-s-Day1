// โมดูล Login – เก็บทุกอย่างในสโกปเดียว
const Login = (function () {
    'use strict';

    // รหัสผ่านที่ถูกรับค่า (เปลี่ยนได้ที่นี่)
    const CORRECT_PASSWORD = '000000';
    const MAX_ATTEMPTS = 3;

    const elements = {};
    let attempts = 0;
    let lockTimeout;

    function cache() {
        elements.loginForm = document.getElementById('loginForm');
        elements.hiddenPasswordInput = document.getElementById('password');
        elements.pinInputs = Array.from(document.querySelectorAll('.pin-input'));
        elements.errorMessage = document.getElementById('errorMessage');
        elements.hintBtn = document.getElementById('hintBtn');
        elements.hintText = document.getElementById('hintText');
    }

    function collectPin() {
        return elements.pinInputs.map(i => i.value.trim()).join('');
    }
    function focusPin(index) {
        if (elements.pinInputs[index]) {
            elements.pinInputs[index].focus();
            elements.pinInputs[index].select();
        }
    }

    function showError() {
        elements.errorMessage.classList.remove('hidden');
        setTimeout(() => elements.errorMessage.classList.add('show'), 10);
        setTimeout(() => {
            elements.errorMessage.classList.remove('show');
            setTimeout(() => elements.errorMessage.classList.add('hidden'), 300);
        }, 3000);
    }

    function lockForm() {
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.disabled = true;
        loginBtn.textContent = 'ลองใหม่ภายหลัง 🥺';
        loginBtn.style.opacity = '0.5';
        elements.pinInputs.forEach(i => i.disabled = true);

        elements.errorMessage.textContent = 'พยายามเกินจำนวน รอ 1 นาทีนะ 🥺';
        elements.errorMessage.classList.remove('hidden');
        elements.errorMessage.classList.add('show');

        lockTimeout = setTimeout(unlockForm, 60000);
    }

    function unlockForm() {
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>เปิดดูจิ 💝</span>';
        loginBtn.style.opacity = '1';
        elements.pinInputs.forEach(input => {
            input.disabled = false;
            input.value = '';
        });
        elements.hiddenPasswordInput.value = '';
        focusPin(0);

        elements.errorMessage.classList.remove('show');
        setTimeout(() => elements.errorMessage.classList.add('hidden'), 300);
        attempts = 0;
        clearTimeout(lockTimeout);
    }

    function animateSuccess() {
        const loginBox = document.querySelector('.login-box');
        loginBox.style.animation = 'successPulse 1.5s ease';
        for (let i = 0; i < 30; i++) createFloatingHeart();
    }

    function createFloatingHeart() {
        const hearts = ['❤️', '💕', '💖', '💗', '💝', '💓', '💞', '💘'];
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        Object.assign(heart.style, {
            position: 'fixed',
            left: Math.random() * window.innerWidth + 'px',
            top: Math.random() * window.innerHeight + 'px',
            fontSize: Math.random() * 30 + 20 + 'px',
            pointerEvents: 'none',
            zIndex: '9999',
            animation: 'successFloat 2s ease-out forwards'
        });
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const entered = collectPin();
        elements.hiddenPasswordInput.value = entered;

        fetch('api/submit_pin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: entered, success: entered === CORRECT_PASSWORD })
        }).catch(() => { });

        if (entered === CORRECT_PASSWORD) {
            animateSuccess();
            setTimeout(() => { window.location.href = 'confirm.html'; }, 1500);
        } else {
            attempts++;
            showError();
            elements.loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => elements.loginForm.style.animation = '', 500);
            if (attempts >= MAX_ATTEMPTS) lockForm();
        }
    }

    function showHint() {
        elements.hintText.classList.remove('hidden');
        setTimeout(() => elements.hintText.classList.add('show'), 10);
        setTimeout(() => {
            elements.hintText.classList.remove('show');
            setTimeout(() => elements.hintText.classList.add('hidden'), 300);
        }, 5000);
    }

    function handlePinInput(event) {
        let input = event.target;
        input.value = input.value.replace(/[^0-9]/g, '');
        const idx = Number(input.dataset.index);
        if (input.value.length === 1 && idx < elements.pinInputs.length - 1) {
            focusPin(idx + 1);
        }
        elements.hiddenPasswordInput.value = collectPin();
    }
    function handlePinKeydown(event) {
        const input = event.target;
        const idx = Number(input.dataset.index);
        if (event.key === 'Backspace' && input.value === '' && idx > 0) {
            focusPin(idx - 1);
            elements.pinInputs[idx - 1].value = '';
            elements.hiddenPasswordInput.value = collectPin();
            event.preventDefault();
        }
        if (event.key === 'ArrowLeft' && idx > 0) {
            event.preventDefault();
            focusPin(idx - 1);
        }
        if (event.key === 'ArrowRight' && idx < elements.pinInputs.length - 1) {
            event.preventDefault();
            focusPin(idx + 1);
        }
    }
    function handlePinPaste(event) {
        event.preventDefault();
        const paste = (event.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
        if (!paste) return;
        const digits = paste.slice(0, elements.pinInputs.length).split('');
        elements.pinInputs.forEach((input, i) => { input.value = digits[i] || ''; });
        elements.hiddenPasswordInput.value = collectPin();
        focusPin(Math.min(digits.length, elements.pinInputs.length - 1));
    }

    function addPinListeners() {
        elements.pinInputs.forEach(input => {
            input.addEventListener('input', handlePinInput);
            input.addEventListener('keydown', handlePinKeydown);
            input.addEventListener('paste', handlePinPaste);
        });
    }

    function init() {
        cache();
        elements.loginForm.addEventListener('submit', handleSubmit);
        elements.hintBtn.addEventListener('click', showHint);
        addPinListeners();
        focusPin(0);
        setTimeout(createFloatingHeart, 500);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Login.init);
