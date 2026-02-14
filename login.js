// Password - คุณสามารถเปลี่ยนรหัสได้ที่นี่
const CORRECT_PASSWORD = '100226'; // รหัส 6 ตัวอักษร

// DOM Elements
const loginForm = document.getElementById('loginForm');
const hiddenPasswordInput = document.getElementById('password');
const pinInputs = Array.from(document.querySelectorAll('.pin-input'));
const errorMessage = document.getElementById('errorMessage');
const hintBtn = document.getElementById('hintBtn');
const hintText = document.getElementById('hintText');

// Maximum attempts
let attempts = 0;
const MAX_ATTEMPTS = 3;

// Form submission
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const enteredPassword = collectPin();
    hiddenPasswordInput.value = enteredPassword;

    // Check password
    if (enteredPassword === CORRECT_PASSWORD) {
        // Success animation
        createSuccessAnimation();

        // Redirect after animation
        setTimeout(() => {
            window.location.href = 'valentine.html';
        }, 1500);
    } else {
        // Wrong password
        attempts++;
        showError();

        // Shake animation
        loginForm.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);

        // Disable form after max attempts
        if (attempts >= MAX_ATTEMPTS) {
            lockForm();
        }
    }
});

// Show error message
function showError() {
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('show');
    }, 10);

    // Clear error after 3 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Lock form after max attempts
function lockForm() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'ลองใหม่ภายหลัง 🥺';
    loginBtn.style.opacity = '0.5';
    pinInputs.forEach(input => input.disabled = true);

    // Show lock message
    errorMessage.textContent = 'พยายามเกินจำนวน รอ 1 นาทีนะ 🥺';
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('show');

    // Unlock after 1 minute
    setTimeout(() => {
        unlockForm();
    }, 60000);
}

// Unlock form
function unlockForm() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span>เปิดดูจิ 💝</span>';
    loginBtn.style.opacity = '1';
    pinInputs.forEach(input => {
        input.disabled = false;
        input.value = '';
    });
    hiddenPasswordInput.value = '';
    focusPin(0);

    errorMessage.classList.remove('show');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 300);

    attempts = 0;
}

// Hint functionality
hintBtn.addEventListener('click', function () {
    hintText.classList.remove('hidden');
    setTimeout(() => {
        hintText.classList.add('show');
    }, 10);

    // Hide hint after 5 seconds
    setTimeout(() => {
        hintText.classList.remove('show');
        setTimeout(() => {
            hintText.classList.add('hidden');
        }, 300);
    }, 5000);
});

// Success animation
function createSuccessAnimation() {
    const loginBox = document.querySelector('.login-box');
    loginBox.style.animation = 'successPulse 1.5s ease';

    // Create heart explosion
    for (let i = 0; i < 30; i++) {
        createFloatingHeart();
    }
}

// Create floating hearts on success
function createFloatingHeart() {
    const hearts = ['❤️', '💕', '💖', '💗', '💝', '💓', '💞', '💘'];
    const heart = document.createElement('div');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.position = 'fixed';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.top = Math.random() * window.innerHeight + 'px';
    heart.style.fontSize = Math.random() * 30 + 20 + 'px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.animation = 'successFloat 2s ease-out forwards';

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 2000);
}

// Add custom animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-20px); }
        75% { transform: translateX(20px); }
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); background: rgba(255, 182, 193, 0.3); }
        100% { transform: scale(1); opacity: 0; }
    }
    
    @keyframes successFloat {
        0% {
            transform: translateY(0) scale(0);
            opacity: 1;
        }
        50% {
            transform: translateY(-50px) scale(1.5);
            opacity: 1;
        }
        100% {
            transform: translateY(-150px) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function collectPin() {
    return pinInputs.map(input => input.value.trim()).join('');
}

function focusPin(index) {
    if (pinInputs[index]) {
        pinInputs[index].focus();
        pinInputs[index].select();
    }
}

function handlePinInput(event) {
    const input = event.target;
    let { value } = input;

    // Keep only digits
    value = value.replace(/[^0-9]/g, '');
    input.value = value;

    const index = Number(input.dataset.index);

    if (value.length === 1 && index < pinInputs.length - 1) {
        focusPin(index + 1);
    }

    hiddenPasswordInput.value = collectPin();
}

function handlePinKeydown(event) {
    const input = event.target;
    const index = Number(input.dataset.index);

    if (event.key === 'Backspace' && input.value === '' && index > 0) {
        focusPin(index - 1);
        pinInputs[index - 1].value = '';
        hiddenPasswordInput.value = collectPin();
        event.preventDefault();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        focusPin(index - 1);
    }

    if (event.key === 'ArrowRight' && index < pinInputs.length - 1) {
        event.preventDefault();
        focusPin(index + 1);
    }
}

function handlePinPaste(event) {
    event.preventDefault();
    const pasteData = (event.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
    if (!pasteData) return;

    const digits = pasteData.slice(0, pinInputs.length).split('');
    pinInputs.forEach((input, idx) => {
        input.value = digits[idx] || '';
    });
    hiddenPasswordInput.value = collectPin();

    const nextIndex = Math.min(digits.length, pinInputs.length - 1);
    focusPin(nextIndex);
}

pinInputs.forEach(input => {
    input.addEventListener('input', handlePinInput);
    input.addEventListener('keydown', handlePinKeydown);
    input.addEventListener('paste', handlePinPaste);
});

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    focusPin(0);

    // Add welcome animation
    setTimeout(() => {
        createFloatingHeart();
    }, 500);
});
