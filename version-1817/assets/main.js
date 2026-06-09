(function () {
  function closest(element, selector) {
    while (element && element.nodeType === 1) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
      var id = row.getAttribute('data-scroll-row');
      var left = document.querySelector('[data-scroll-left="' + id + '"]');
      var right = document.querySelector('[data-scroll-right="' + id + '"]');

      if (left) {
        left.addEventListener('click', function () {
          row.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }

      if (right) {
        right.addEventListener('click', function () {
          row.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-search-input]');
      var region = scope.querySelector('[data-region-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var count = scope.querySelector('[data-result-count]');
      var empty = scope.querySelector('[data-no-results]');

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function applyFilter() {
        var query = normalize(search ? search.value : '');
        var regionValue = normalize(region ? region.value : '');
        var typeValue = normalize(type ? type.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search-text'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', applyFilter);
      }
      if (region) {
        region.addEventListener('change', applyFilter);
      }
      if (type) {
        type.addEventListener('change', applyFilter);
      }
      applyFilter();
    });

    document.addEventListener('click', function (event) {
      var anchor = closest(event.target, 'a[href^="#"]');
      if (!anchor) {
        return;
      }
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}());
