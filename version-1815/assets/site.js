(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  var params = new URLSearchParams(window.location.search);
  if (searchInput && params.get('q')) {
    searchInput.value = params.get('q');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var term = normalize(searchInput ? searchInput.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize((card.dataset.title || '') + ' ' + (card.dataset.meta || ''));
      var filterText = normalize((card.dataset.filter || '') + ' ' + (card.dataset.type || ''));
      var matchTerm = !term || text.indexOf(term) !== -1;
      var matchFilter = activeFilter === 'all' || filterText.indexOf(normalize(activeFilter)) !== -1;
      var showCard = matchTerm && matchFilter;
      card.hidden = !showCard;
      if (showCard) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    applyFilters();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filterButton || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });
})();
