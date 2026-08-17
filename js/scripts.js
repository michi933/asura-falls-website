const siteRootUrl = new URL('../', document.currentScript.src);

document.addEventListener('DOMContentLoaded', async () => {
    // GitHub Pages serves folder routes with a trailing slash. Keep the
    // dependable folder structure while presenting cleaner browser URLs.
    const cleanRoutes = new Set(['/history/', '/gallery/', '/imprint/']);
    if (cleanRoutes.has(window.location.pathname)) {
        const cleanPath = window.location.pathname.slice(0, -1);
        window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    }

    /**
     * Language preference and translated interface text.
     * The browser language is used once; an explicit choice is remembered.
     */
    const supportedLanguages = ['en', 'de'];
    const translations = { en: {}, de: {} };
    const siteContent = { shows: [], press: [] };
    const savedLanguage = localStorage.getItem('asura-falls-language');
    let currentLanguage = supportedLanguages.includes(savedLanguage)
        ? savedLanguage
        : (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';

    const localized = (value) => {
        if (!value || typeof value !== 'object') return value || '';
        return value[currentLanguage]
            || value.en
            || value.de
            || Object.values(value).find(candidate => typeof candidate === 'string' && candidate.trim())
            || '';
    };

    const translate = key => translations[currentLanguage][key]
        || translations.en[key]
        || translations.de[key]
        || '';

    const parseContentResponse = async response => {
        const text = (await response.text()).replace(/^\uFEFF/, '');
        return JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
    };

    const renderShows = () => {
        const container = document.getElementById('shows-content');
        if (!container) return;
        container.innerHTML = siteContent.shows.map(show => {
            const location = show.location ? `<p><strong>${translate('shows.location')}</strong> ${localized(show.location)}</p>` : '';
            const withArtists = show.with ? `<p><strong>${translate('shows.with')}</strong> ${localized(show.with)}</p>` : '';
            const description = show.description ? `<p>${localized(show.description)}</p>` : '';
            const ticket = show.ticketLabel
                ? show.url
                    ? `<a href="${show.url}" class="btn btn-tickets" target="_blank" rel="noopener noreferrer">${localized(show.ticketLabel)}</a>`
                    : `<span class="btn btn-tickets ticket-label">${localized(show.ticketLabel)}</span>`
                : '';
            return `<article class="show-card animate-on-scroll visible">
                <img src="${show.image}" alt="${localized(show.title)}" class="show-image" loading="lazy">
                <div class="show-info"><h3>${localized(show.title)}</h3>${description}${location}${withArtists}${ticket}</div>
            </article>`;
        }).join('');
    };

    const renderPress = () => {
        const container = document.getElementById('press-content');
        if (!container) return;
        container.innerHTML = siteContent.press.map(item => `
            <div class="col-md-6 mb-4 animate-on-scroll visible">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                    <article class="content-box press-box h-100">
                        <img src="${item.image}" alt="${localized(item.imageAlt)}" class="img-fluid rounded mb-3" loading="lazy">
                        <h4>${localized(item.title)}</h4><p class="text-muted">${localized(item.description)}</p>
                    </article>
                </a>
            </div>`).join('');
    };

    const applyLanguage = (language, persist = false) => {
        currentLanguage = supportedLanguages.includes(language) ? language : 'en';
        if (persist) localStorage.setItem('asura-falls-language', currentLanguage);
        document.documentElement.lang = currentLanguage;
        const route = document.body.dataset.page
            || window.location.pathname.replace(/\/+$/, '').split('/').pop()
            || 'home';
        const setMetaContent = (selector, content) => {
            const element = document.querySelector(selector);
            if (element && content) element.setAttribute('content', content);
        };
        const title = translate(`page.${route}.title`);
        const description = translate(`page.${route}.description`);
        if (title) document.title = title;
        setMetaContent('meta[name="description"]', description);
        setMetaContent('meta[property="og:title"]', title);
        setMetaContent('meta[property="og:description"]', description);
        setMetaContent('meta[property="og:locale"]', currentLanguage === 'de' ? 'de_DE' : 'en_US');
        setMetaContent('meta[name="twitter:title"]', title);
        setMetaContent('meta[name="twitter:description"]', description);
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const translated = translate(element.dataset.i18n);
            if (translated) element.textContent = translated.replace('{service}', element.dataset.service || '');
        });
        const longForm = {
            '.band-intro': translate('bandIntro'),
            '.member-bio h3': translate('memberHeadings'),
            '.member-bio p': translate('memberBios'),
            '.history-content p': translate('historyParagraphs')
        };
        Object.entries(longForm).forEach(([selector, texts]) => {
            if (!Array.isArray(texts)) return;
            document.querySelectorAll(selector).forEach((element, index) => {
                if (texts[index]) element.textContent = texts[index];
            });
        });
        document.querySelectorAll('.language-toggle button').forEach(button => {
            const active = button.dataset.language === currentLanguage;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active.toString());
        });
        renderShows();
        renderPress();
        document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: currentLanguage } }));
    };

    document.querySelectorAll('.language-toggle button').forEach(button => {
        button.addEventListener('click', () => applyLanguage(button.dataset.language, true));
    });

    document.querySelectorAll('[data-current-year]').forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    try {
        const [englishResponse, germanResponse] = await Promise.all([
            fetch(new URL('data/en.json', siteRootUrl)),
            fetch(new URL('data/de.json', siteRootUrl))
        ]);
        if (!englishResponse.ok || !germanResponse.ok) throw new Error('Translation request failed');
        [translations.en, translations.de] = await Promise.all([
            parseContentResponse(englishResponse),
            parseContentResponse(germanResponse)
        ]);
    } catch (error) {
        console.error('Unable to load website translations.', error);
    }

    applyLanguage(currentLanguage);

    if (document.getElementById('shows-content') || document.getElementById('press-content')) {
        try {
            const [showsResponse, pressResponse] = await Promise.all([
                fetch(new URL('data/shows.json', siteRootUrl)),
                fetch(new URL('data/press.json', siteRootUrl))
            ]);
            if (!showsResponse.ok || !pressResponse.ok) throw new Error('Content request failed');
            [siteContent.shows, siteContent.press] = await Promise.all([
                parseContentResponse(showsResponse),
                parseContentResponse(pressResponse)
            ]);
            renderShows();
            renderPress();
        } catch (error) {
            console.error('Unable to load website content.', error);
        }
    }

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
        // If it's a link to the home page plus a hash from another page
        else if (href.includes('#')) {
            const [path, hash] = href.split('#');
            const currentPath = window.location.pathname;
            
            // If we are already on the page the hash refers to
            if (currentPath.endsWith(path) || ((path === './' || path === '../' || path === '/') && currentPath.endsWith('/'))) {
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
     * Active section indicator.
     * Highlights the home-page navigation link for the section currently
     * passing beneath the fixed navbar.
     */
    const sectionNavLinks = Array.from(document.querySelectorAll('.navbar a[href*="#"]'))
        .map(link => {
            const hash = new URL(link.href, window.location.href).hash;
            return { link, section: hash ? document.querySelector(hash) : null };
        })
        .filter(item => item.section);

    if (sectionNavLinks.length) {
        let sectionUpdateQueued = false;

        const updateActiveSection = () => {
            sectionUpdateQueued = false;
            const marker = window.scrollY + navHeight() + 40;
            let activeItem = null;

            const atPageBottom = window.scrollY + window.innerHeight
                >= document.documentElement.scrollHeight - 2;

            if (atPageBottom) {
                activeItem = sectionNavLinks[sectionNavLinks.length - 1];
            } else {
                sectionNavLinks.forEach(item => {
                    const sectionTop = item.section.getBoundingClientRect().top + window.scrollY;
                    if (sectionTop <= marker) activeItem = item;
                });
            }

            sectionNavLinks.forEach(item => {
                const active = item === activeItem;
                item.link.classList.toggle('active', active);
                if (active) {
                    item.link.setAttribute('aria-current', 'location');
                } else {
                    item.link.removeAttribute('aria-current');
                }
            });
        };

        const queueActiveSectionUpdate = () => {
            if (sectionUpdateQueued) return;
            sectionUpdateQueued = true;
            requestAnimationFrame(updateActiveSection);
        };

        window.addEventListener('scroll', queueActiveSectionUpdate, { passive: true });
        window.addEventListener('resize', queueActiveSectionUpdate);
        window.addEventListener('hashchange', queueActiveSectionUpdate);
        updateActiveSection();
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
