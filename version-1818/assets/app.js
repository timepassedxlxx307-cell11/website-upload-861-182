(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (!slides.length) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHeroTimer();
        });
    });

    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            startHeroTimer();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            startHeroTimer();
        });
    }

    startHeroTimer();

    document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
        button.addEventListener('click', function () {
            var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
            var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
            var target = document.getElementById(targetId);

            if (target) {
                target.scrollBy({ left: direction * 420, behavior: 'smooth' });
            }
        });
    });

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-button');
        var url = player.getAttribute('data-video-url');
        var hlsInstance = null;
        var isReady = false;

        function prepare() {
            if (!video || !url || isReady) {
                return;
            }

            isReady = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            video.addEventListener('click', function () {
                prepare();
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.site-player').forEach(initializePlayer);

    function normalizeText(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function createResultCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link">' +
                    '<figure class="movie-poster">' +
                        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<figcaption class="movie-tags">' + tags + '</figcaption>' +
                    '</figure>' +
                    '<div class="movie-card-body">' +
                        '<h3>' + escapeHtml(movie.title) + '</h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="movie-meta">' +
                            '<span>' + escapeHtml(movie.year) + '</span>' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                            '<span>' + escapeHtml(movie.type) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initializeSearch() {
        var data = window.SITE_SEARCH_DATA || [];
        var form = document.getElementById('siteSearchForm');
        var input = document.getElementById('siteSearchInput');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var results = document.getElementById('searchResults');
        var info = document.getElementById('searchResultInfo');

        if (!form || !input || !results) {
            return;
        }

        var years = Array.from(new Set(data.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort().reverse();

        years.forEach(function (year) {
            var option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        input.value = getQueryValue('q');

        function render() {
            var keyword = normalizeText(input.value);
            var typeValue = typeFilter.value;
            var yearValue = yearFilter.value;
            var matched = data.filter(function (movie) {
                var content = normalizeText([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' '));
                var keywordMatched = !keyword || content.indexOf(keyword) !== -1;
                var typeMatched = !typeValue || movie.type === typeValue;
                var yearMatched = !yearValue || movie.year === yearValue;
                return keywordMatched && typeMatched && yearMatched;
            }).slice(0, 120);

            results.innerHTML = matched.map(createResultCard).join('');
            info.textContent = matched.length ? '已显示匹配结果' : '没有找到匹配结果';
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });

        input.addEventListener('input', render);
        typeFilter.addEventListener('change', render);
        yearFilter.addEventListener('change', render);
        render();
    }

    initializeSearch();
})();
