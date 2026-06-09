(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var scopes = $$('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = $('[data-filter-input]', scope);
      var type = $('[data-filter-type]', scope);
      var year = $('[data-filter-year]', scope);
      var cards = $$('[data-card]', root);
      var empty = $('[data-empty]', root);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okType = !typeValue || card.getAttribute('data-type') === typeValue;
          var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var showCard = okKeyword && okType && okYear;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var player = video.closest('.player');
    var cover = player ? $('.player-cover', player) : null;
    var ready = false;
    var instance = null;

    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls();
        instance.loadSource(streamUrl);
        instance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      ready = true;
    }

    function play() {
      attach();
      if (player) {
        player.classList.add('playing');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (player) {
        player.classList.add('playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (instance && instance.destroy) {
        instance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
