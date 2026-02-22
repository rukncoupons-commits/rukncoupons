/* Rukn Al-Coupons Client-Side JavaScript */

'use strict';

// --- Slider ---
let currentSlide = 0;
let sliderInterval = null;

function goToSlide(index) {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    if (!track) return;

    const slides = track.querySelectorAll('.slider-slide');
    if (slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
        dot.classList.toggle('bg-white', i === currentSlide);
        dot.classList.toggle('scale-125', i === currentSlide);
        dot.classList.toggle('bg-white/50', i !== currentSlide);
    });
}

function initSlider() {
    const track = document.getElementById('slider-track');
    if (!track) return;
    const slides = track.querySelectorAll('.slider-slide');
    if (slides.length <= 1) return;

    sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    const slider = document.getElementById('hero-slider');
    slider.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    slider.addEventListener('mouseleave', () => {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });
}

// --- Country Switcher ---
function toggleCountryDropdown() {
    const dropdown = document.getElementById('country-dropdown');
    dropdown && dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('country-dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('country-dropdown')?.classList.add('hidden');
    }
});

function switchCountry(code) {
    const path = window.location.pathname.split('/').filter(Boolean);
    if (path.length > 0) path[0] = code;
    else path.push(code);
    window.location.href = '/' + path.join('/');
}

// --- Coupon Modal ---
let activeCoupon = { id: '', code: '', link: '' };

function openCouponModal(id, storeName, logoUrl, title, code, link) {
    activeCoupon = { id, code, link };

    // Fill content
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-logo-img').src = logoUrl;

    const codeSection = document.getElementById('modal-code-section');
    const dealSection = document.getElementById('modal-deal-section');
    const btnText = document.getElementById('modal-main-btn-text');
    const helpText = document.getElementById('modal-help-text');

    if (code) {
        document.getElementById('modal-code').textContent = code;
        codeSection.classList.remove('hidden');
        dealSection.classList.add('hidden');
        btnText.textContent = 'انسخ الكود وتسوق';
        helpText.classList.remove('hidden');
        // Auto copy on open
        copyToClipboard(code);
    } else {
        codeSection.classList.add('hidden');
        dealSection.classList.remove('hidden');
        btnText.textContent = 'الذهاب إلى العرض';
        helpText.classList.add('hidden');
    }

    // Reset icons
    document.getElementById('copy-icon').classList.remove('hidden');
    document.getElementById('check-icon').classList.add('hidden');

    // Show modal
    const modal = document.getElementById('coupon-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Track usage
    fetch(`/api/coupon/use/${id}`, { method: 'POST' }).catch(() => { });
}

function closeModal() {
    const modal = document.getElementById('coupon-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function copyCodeOnly() {
    if (activeCoupon.code) {
        copyToClipboard(activeCoupon.code);
        document.getElementById('copy-icon').classList.add('hidden');
        document.getElementById('check-icon').classList.remove('hidden');
        showToast('تم نسخ الكود!', 'success');
        setTimeout(() => {
            document.getElementById('copy-icon').classList.remove('hidden');
            document.getElementById('check-icon').classList.add('hidden');
        }, 2000);
    }
}

function copyAndShop() {
    const btn = document.getElementById('modal-main-btn');
    const btnText = document.getElementById('modal-main-btn-text');

    if (activeCoupon.code) {
        copyToClipboard(activeCoupon.code);
        btnText.textContent = '✅ تم النسخ!';
        btn.classList.add('bg-green-500');
        btn.classList.remove('bg-blue-600');
    } else {
        btnText.textContent = 'جاري التحويل...';
    }

    if (activeCoupon.link) {
        window.open(activeCoupon.link, '_blank');
    }

    setTimeout(() => {
        closeModal();
        // Reset button
        btn.classList.remove('bg-green-500');
        btn.classList.add('bg-blue-600');
    }, 1500);
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
}

// --- Toast ---
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-lg border-r-4 min-w-[280px] flex items-center gap-3 bg-white pointer-events-auto transition-all duration-300 transform translate-y-10 opacity-0`;

    const colors = { success: 'border-green-500', error: 'border-red-500', info: 'border-blue-500' };
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    toast.classList.add(colors[type] || colors.info);
    toast.innerHTML = `<span class="text-xl">${icons[type]}</span><span class="text-sm font-bold">${msg}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
});
