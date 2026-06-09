(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("hero-slide-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
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
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var form = document.querySelector("[data-filter-form]");
        var root = document.querySelector("[data-filter-root]");
        if (!form || !root) {
            return;
        }
        var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-card"));
        var queryInput = form.querySelector("[data-filter-query]");
        var categorySelect = form.querySelector("[data-filter-category]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var regionInput = form.querySelector("[data-filter-region]");
        var params = new URLSearchParams(window.location.search);
        var incoming = params.get("q");
        if (incoming && queryInput) {
            queryInput.value = incoming;
        }

        function matches(card) {
            var query = queryInput ? text(queryInput.value) : "";
            var category = categorySelect ? text(categorySelect.value) : "";
            var year = yearSelect ? text(yearSelect.value) : "";
            var region = regionInput ? text(regionInput.value) : "";
            var haystack = text([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.category,
                card.dataset.tags
            ].join(" "));
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (category && text(card.dataset.category) !== category) {
                return false;
            }
            if (year && text(card.dataset.year) !== year) {
                return false;
            }
            if (region && text(card.dataset.region).indexOf(region) === -1) {
                return false;
            }
            return true;
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle("is-hidden", !matches(card));
            });
        }

        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        form.addEventListener("submit", function (event) {
            if (root) {
                event.preventDefault();
                apply();
            }
        });
        apply();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
