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

});
