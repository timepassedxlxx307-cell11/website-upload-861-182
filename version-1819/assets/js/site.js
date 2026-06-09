(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
                slide.setAttribute('aria-hidden', idx === current ? 'false' : 'true');
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var result = panel.querySelector('[data-filter-result]');
            var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
            var scope = document.querySelector(scopeSelector) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');

            if (q && input && !input.value) {
                input.value = q;
            }

            function value(el) {
                return el ? el.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = value(input);
                var regionValue = value(region);
                var typeValue = value(type);
                var yearValue = value(year);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    var ok = true;

                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (regionValue && String(card.dataset.region || '').toLowerCase().indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    if (typeValue && String(card.dataset.type || '').toLowerCase().indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && String(card.dataset.year || '').toLowerCase() !== yearValue) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '当前匹配 ' + visible + ' 部作品';
                }
            }

            [input, region, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var stream = player.getAttribute('data-stream');
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                prepare();
                player.classList.add('is-playing');
                if (video) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!prepared) {
                        play();
                    }
                });
            }
            player.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    play(event);
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
