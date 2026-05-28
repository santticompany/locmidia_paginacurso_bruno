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
       2. CARROSSEL ADAPTATIVO (DESKTOP AUTO-SCROLL vs MOBILE SWIPE)
       ========================================================================== */
    const carrosselWrapper = document.querySelector('.carrossel-wrapper');
    const carrosselTrack = document.getElementById('carrossel-track');
    
    // Função para configurar comportamento baseado na largura da tela
    function setupCarousel() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // No mobile, remove a animação CSS infinita para permitir o swipe nativo
            carrosselTrack.style.animation = 'none';
            carrosselWrapper.style.overflowX = 'auto';
            carrosselWrapper.style.scrollSnapType = 'x mandatory';
            
            // Adiciona scroll snap nos cards para um swipe mais premium
            const cards = carrosselTrack.querySelectorAll('.carrossel-card');
            cards.forEach(card => {
                card.style.scrollSnapAlign = 'center';
            });
            
            // Opcional: auto-scroll lento no mobile quando o usuário não estiver interagindo
            startMobileAutoScroll();
        } else {
            // No desktop, restaura a animação CSS ultra fluida
            carrosselTrack.style.animation = '';
            carrosselWrapper.style.overflowX = 'hidden';
            carrosselWrapper.style.scrollSnapType = 'none';
            
            const cards = carrosselTrack.querySelectorAll('.carrossel-card');
            cards.forEach(card => {
                card.style.scrollSnapAlign = 'unset';
            });
            
            stopMobileAutoScroll();
        }
    }
    
    // Lógica de auto-scroll suave para o Mobile
    let mobileScrollInterval = null;
    let isUserInteracting = false;
    let interactionTimeout = null;
    
    function startMobileAutoScroll() {
        stopMobileAutoScroll();
        
        mobileScrollInterval = setInterval(() => {
            if (!isUserInteracting) {
                const maxScrollLeft = carrosselWrapper.scrollWidth - carrosselWrapper.clientWidth;
                
                // Se chegou ao fim, reseta suavemente
                if (carrosselWrapper.scrollLeft >= maxScrollLeft - 5) {
                    carrosselWrapper.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carrosselWrapper.scrollBy({ left: 180, behavior: 'smooth' });
                }
            }
        }, 4000); // Rola a cada 4 segundos
    }
    
    function stopMobileAutoScroll() {
        if (mobileScrollInterval) {
            clearInterval(mobileScrollInterval);
            mobileScrollInterval = null;
        }
    }
    
    // Detecta interação do usuário no mobile para pausar o auto-scroll temporariamente
    carrosselWrapper.addEventListener('touchstart', () => {
        isUserInteracting = true;
        clearTimeout(interactionTimeout);
    }, { passive: true });
    
    carrosselWrapper.addEventListener('touchend', () => {
        // Aguarda 5 segundos após o fim da interação para retomar o auto-scroll
        interactionTimeout = setTimeout(() => {
            isUserInteracting = false;
        }, 5000);
    }, { passive: true });

    // Inicializa e monitora resize da tela
    setupCarousel();
    window.addEventListener('resize', setupCarousel);


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


});
