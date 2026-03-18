// ========================================
// Mr. Dave Idiomas — script.js (index)
// WP: Registrar via wp_enqueue_scripts()
// ========================================

// ---- Pricing Tabs ----
const precoTabs = document.querySelectorAll('.preco-tab');
const precoContents = document.querySelectorAll('.preco-content');

precoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        precoTabs.forEach(t => t.classList.remove('active'));
        precoContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
    });
});

// ---- Header scroll effect ----
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        header.style.background = 'rgba(15, 23, 42, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,.3)';
    } else {
        header.style.background = 'rgba(15, 23, 42, 0.9)';
        header.style.boxShadow = 'none';
    }
});

// ---- Mobile menu ----
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;width:100%;background:var(--color-bg-secondary);padding:1.5rem 2rem;gap:1.25rem;border-top:1px solid rgba(255,255,255,.1);';
        }
    });
}

// ---- Smooth scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = document.querySelector('.header').offsetHeight + 20;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            const navLinks = document.querySelector('.nav-links');
            if (window.innerWidth <= 968 && navLinks.style.display === 'flex') navLinks.style.display = 'none';
        }
    });
});

// ---- Contato form ----
const contatoForm = document.getElementById('contatoForm');
if (contatoForm) {
    contatoForm.addEventListener('submit', e => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const interesse = document.getElementById('interesse').value;
        const mensagem = document.getElementById('mensagem').value;
        // WP: integrar com Contact Form 7, WPForms, ou backend customizado
        // Placeholder: redireciona para WhatsApp com os dados
        const texto = `Olá! Meu nome é ${nome}, email: ${email}. Interesse: ${interesse}. ${mensagem}`;
        const url = `https://wa.me/5512988336873?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
        contatoForm.reset();
    });
}

// ---- Intersection observer para animações ----
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.curso-card, .preco-card, .feature-item, .info-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `all 0.5s ease ${i * 0.07}s`;
    observer.observe(el);
});

// ---- WhatsApp number update utility ----
window.updateWhatsApp = (num) => {
    document.querySelectorAll('.whatsapp-float').forEach(btn => {
        const msg = encodeURIComponent('Olá! Quero saber mais sobre os cursos do Mr. Dave Idiomas');
        btn.href = `https://wa.me/${num}?text=${msg}`;
    });
};

// ---- Phone mask ----
const tel = document.getElementById('telefone');
if (tel) {
    tel.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d)((\d{4}))$/, '$1-$2');
        e.target.value = v;
    });
}

console.log('%cMr. Dave Idiomas 🌍', 'color:#818cf8;font-size:18px;font-weight:bold;');
