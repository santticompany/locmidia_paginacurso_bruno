document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. REVEAL ANIMATIONS WITH INTERSECTION OBSERVER & STAGGER
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    // Configura o Intersection Observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('revealed');
                
                // Aplica stagger delay nos itens de lista internos, se existirem
                const staggerItems = element.querySelectorAll('.comparativo-list li, .trilha-card');
                staggerItems.forEach((item, index) => {
                    item.style.transitionDelay = `${index * 100}ms`;
                });
                
                // Para de observar o elemento já revelado
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.12, // Dispara quando 12% do elemento estiver visível
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       2. CARROSSEL INFINITO MARQUEE (DESKTOP & MOBILE)
       ========================================================================== */
    const carrosselWrapper = document.querySelector('.carrossel-wrapper');
    const carrosselTrack = document.getElementById('carrossel-track');
    
    // O carrossel funciona 100% via CSS (infiniteScroll) de forma fluida em todas as telas.
    // Adicionamos pausar/retomar ao tocar no mobile para melhor usabilidade.
    carrosselWrapper.addEventListener('touchstart', () => {
        carrosselTrack.style.animationPlayState = 'paused';
    }, { passive: true });
    
    carrosselWrapper.addEventListener('touchend', () => {
        carrosselTrack.style.animationPlayState = 'running';
    }, { passive: true });


    /* ==========================================================================
       4. SCROLL SUAVE PARA CLIQUES INTERNOS E ANIMAÇÃO DOS BOTÕES
       ========================================================================== */
    // Garante que o scroll suave nativo funcione perfeitamente
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    /* ==========================================================================
       5. INTERACTIVE TESTIMONIAL VIDEO CARDS
       ========================================================================== */
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        const video = container.querySelector('.testimonial-video');
        
        container.addEventListener('click', () => {
            // Pause all other videos to prevent concurrent audio play
            videoContainers.forEach(otherContainer => {
                if (otherContainer !== container) {
                    const otherVideo = otherContainer.querySelector('.testimonial-video');
                    otherVideo.pause();
                    otherContainer.classList.remove('playing');
                }
            });

            if (video.paused) {
                video.play();
                container.classList.add('playing');
            } else {
                video.pause();
                container.classList.remove('playing');
            }
        });
    });

    /* ==========================================================================
       6. CAROUSEL ARROW NAVIGATION CONTROLS
       ========================================================================== */
    const scrollContainer = document.getElementById('video-carousel-scroll');
    const navLeft = document.getElementById('video-nav-left');
    const navRight = document.getElementById('video-nav-right');
    
    if (scrollContainer && navLeft && navRight) {
        navLeft.addEventListener('click', () => {
            const cardWidth = scrollContainer.querySelector('.video-card').offsetWidth;
            scrollContainer.scrollBy({
                left: -(cardWidth + 24),
                behavior: 'smooth'
            });
        });
        
        navRight.addEventListener('click', () => {
            const cardWidth = scrollContainer.querySelector('.video-card').offsetWidth;
            scrollContainer.scrollBy({
                left: cardWidth + 24,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================================================
       7. LEAD MODAL CONTROL, PHONE MASK & AJAX SUBMISSION
       ========================================================================== */
    const modalOverlay = document.getElementById('lead-modal');
    const modalClose = document.getElementById('modal-close');
    const leadForm = document.getElementById('lead-form');
    const btnSubmit = document.getElementById('btn-submit-lead');
    const phoneInput = document.getElementById('form-telefone');

    // Intercept clicks on ALL CTA buttons with ".btn-glow-gold" class on landing page
    const ctaButtons = document.querySelectorAll('.btn-glow-gold:not(.btn-submit):not(#cta-obrigado)');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openLeadModal();
        });
    });

    function openLeadModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        }
    }

    function closeLeadModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = ''; // restore scrolling
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeLeadModal);
    }

    // Close on overlay background click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeLeadModal();
            }
        });
    }

    // Phone Input Brazil Formatting Mask (e.g. (99) 99999-9999)
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            if (!x[2]) {
                e.target.value = x[1];
            } else {
                e.target.value = '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            }
        });
    }

    // AJAX POST Submission
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (btnSubmit.classList.contains('loading')) return;

            // Show loading state
            btnSubmit.classList.add('loading');

            const formData = {
                nome: document.getElementById('form-nome').value,
                email: document.getElementById('form-email').value,
                telefone: document.getElementById('form-telefone').value,
                empresa: document.getElementById('form-empresa').value,
                segmento: document.getElementById('form-segmento').value,
                faturamento: document.getElementById('form-faturamento').value
            };

            fetch('send-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Erro na requisição.');
            })
            .then(data => {
                // Redirect to Thank You page
                window.location.href = 'obrigado.html';
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao processar cadastro. Por favor, tente novamente.');
            })
            .finally(() => {
                btnSubmit.classList.remove('loading');
            });
        });
    }

});
