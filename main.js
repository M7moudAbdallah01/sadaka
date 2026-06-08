/* =========================================
   SADAKA JARIYA - MAIN.JS
   ========================================= */

/* ---- Arabic numerals helper ---- */
function toArabicNums(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}
function fromArabicNums(s) {
    return parseInt(String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/* =========================================
   TASBIH COUNTER
   ========================================= */
function incrementCounter(btn) {
    const card    = btn.closest('.tasbih-card');
    const max     = parseInt(card.dataset.max) || 33;
    const countEl = btn.querySelector('.count');
    let current   = fromArabicNums(countEl.textContent);

    if (current >= max) return;

    current++;
    countEl.textContent = toArabicNums(current);

    /* progress bar */
    const fill = card.querySelector('.progress-fill');
    if (fill) fill.style.width = (current / max * 100) + '%';

    /* click feedback */
    btn.style.transform = 'scale(0.93)';
    setTimeout(() => { btn.style.transform = ''; }, 130);

    /* done state */
    if (current >= max) {
        card.classList.add('done');
        setTimeout(() => showModal(), 250);
    }
}

function clearAllCounters() {
    document.querySelectorAll('.tasbih-card').forEach(card => {
        card.classList.remove('done');
        const countEl = card.querySelector('.count');
        if (countEl) countEl.textContent = '٠';
        const fill = card.querySelector('.progress-fill');
        if (fill) fill.style.width = '0%';
    });
    showToast('تم تصفير جميع العدادات ✓');
}

/* =========================================
   COMPLETION MODAL
   ========================================= */
function showModal() {
    document.getElementById('completionModal').classList.add('open');
}
function closeModal() {
    document.getElementById('completionModal').classList.remove('open');
}

/* =========================================
   TOAST NOTIFICATION
   ========================================= */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* =========================================
   SURAT YASEEN - LOAD FROM API
   ========================================= */
let yaseenLoaded = false;

function toggleYaseen() {
    const box = document.getElementById('yaseenText');
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
        if (!yaseenLoaded) loadYaseen();
    } else {
        box.style.display = 'none';
    }
}

function loadYaseen() {
    const container = document.getElementById('yaseenAyas');
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;">جارٍ تحميل السورة...</p>';

    /* alquran.cloud API - سورة يس رقم 36 */
    fetch('https://api.alquran.cloud/v1/surah/36/ar.alafasy')
        .then(r => r.json())
        .then(data => {
            if (data.code === 200) {
                yaseenLoaded = true;
                const ayahs = data.data.ayahs;
                container.innerHTML = ayahs.map(a =>
                    `<span>${a.text} <span class="aya-num">﴿${toArabicNums(a.numberInSurah)}﴾</span> </span>`
                ).join('');
            } else {
                container.innerHTML = '<p style="text-align:center;color:#c0392b;padding:20px;">تعذّر التحميل، تحقق من الاتصال بالإنترنت</p>';
            }
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#c0392b;padding:20px;">تعذّر التحميل، تحقق من الاتصال بالإنترنت</p>';
        });
}

/* =========================================
   SHARE FUNCTIONS
   ========================================= */
function shareWhatsapp() {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('صدقة جارية عن روح المرحوم الحاج شرف الدين محمد شرف الدين عمار، شاركها ولك الأجر 🤲\n');
    window.open('https://api.whatsapp.com/send?text=' + text + url, '_blank');
}

function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
}

function copyLink() {
    const link = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => showToast('تم نسخ الرابط ✓'));
    } else {
        /* fallback for older browsers */
        const el = document.createElement('textarea');
        el.value = link;
        el.style.position = 'fixed';
        el.style.opacity  = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('تم نسخ الرابط ✓');
    }
}

/* =========================================
   SMOOTH SCROLL - Hero button
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const scrollBtn = document.getElementById('scrollBtn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('tasbih');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* Escape key closes modal */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    /* Animate cards on scroll (IntersectionObserver) */
    const cards = document.querySelectorAll('.tasbih-card, .duaa-card');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = (i * 0.05) + 's';
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        cards.forEach(c => observer.observe(c));
    }
});