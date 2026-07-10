document.addEventListener('DOMContentLoaded', () => {
    /**
     * 1. Navigation & Smooth Scroll
     * Optimized to handle same-page anchors and cross-page hash links.
     * EXCLUDES carousel controls to prevent jumping.
     */
    const navHeight = () => document.querySelector('.navbar').offsetHeight;

    const smoothScrollTo = (target) => {
        const targetElement = typeof target === 'string' ? document.getElementById(target) : target;
        if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navHeight() - 10);
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            return true;
        }
        return false;
    };

    const handleLinkClick = (e) => {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        // Ignore carousel controls and empty links
        if (!href || href === '#' || href === 'javascript:void(0)' || link.classList.contains('carousel-control-prev') || link.classList.contains('carousel-control-next')) {
            return;
        }

        // If it's a simple hash link on the current page
        if (href.startsWith('#')) {
            if (smoothScrollTo(href.substring(1))) {
                e.preventDefault();
                history.pushState(null, null, href);
                closeMobileMenu();
            }
        } 
        // If it's a link to index.html#hash from another page
        else if (href.includes('#')) {
            const [path, hash] = href.split('#');
            const currentPath = window.location.pathname;
            
            // If we are already on the page the hash refers to
            if (currentPath.endsWith(path) || (path === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
                if (smoothScrollTo(hash)) {
                    e.preventDefault();
                    history.pushState(null, null, '#' + hash);
                    closeMobileMenu();
                }
            }
        }
    };

    const closeMobileMenu = () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const toggler = document.querySelector('.navbar-toggler');
            if (toggler) toggler.click();
        }
    };

    document.querySelectorAll('a[href*="#"]').forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });

    // Handle hash on initial page load
    if (window.location.hash) {
        setTimeout(() => smoothScrollTo(window.location.hash.substring(1)), 200);
    }

    /**
     * 2. Scroll Animation (Optimized with requestAnimationFrame for smoothness)
     */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    /**
     * 3. Media Loaders (YouTube / Spotify)
     */
    const setupLoader = (btnId, placeholderId, iframeHtml) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const placeholder = document.getElementById(placeholderId);
                placeholder.innerHTML = iframeHtml;
                placeholder.style.background = 'transparent';
                placeholder.style.border = 'none';
            });
        }
    };

    setupLoader('loadYouTube', 'youtube-placeholder', 
        '<iframe style="border-radius:12px; border:none; width:100%; height:352px;" src="https://www.youtube.com/embed/videoseries?list=PLV8oNL8D_M-BPqYUnhmC_LzIbsH4a2o3a" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>');
    
    setupLoader('loadSpotify', 'spotify-placeholder', 
        '<iframe style="border-radius:12px; border:none; width:100%; height:352px;" src="https://open.spotify.com/embed/artist/1M0iXpavLgKsRaZfiB18ne?utm_source=generator&theme=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>');

    /**
     * 4. Back to Top Logic
     */
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTop.classList.add("visible");
            } else {
                backToTop.classList.remove("visible");
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * 5. Gallery Filter Logic
     */
    const filterButtons = document.querySelectorAll('.btn-filter');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.style.display = (category === 'all' || item.classList.contains(category)) ? 'block' : 'none';
                });
            });
        });
    }
});

/**
 * Global Lightbox Functions
 */
function showImage(src) {
    const overlay = document.getElementById('imageOverlay');
    const img = document.getElementById('overlayImage');
    if (overlay && img) {
        img.src = src;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Lightbox Closer
(function() {
    const lightboxOverlay = document.getElementById('imageOverlay');
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', () => {
            lightboxOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
})();
