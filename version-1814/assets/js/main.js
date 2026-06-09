(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-toolbar]"));
    toolbars.forEach(function (toolbar) {
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      toolbar.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter-button]");
        if (!button) {
          return;
        }
        var value = button.getAttribute("data-filter-button");
        toolbar.querySelectorAll("[data-filter-button]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        cards.forEach(function (card) {
          var matched = value === "all" || card.getAttribute("data-year") === value || (card.getAttribute("data-filter") || "").indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
        });
      });
    });
  }

  function cardTemplate(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(item.url) + '" class="card-link">',
      '<figure class="card-cover"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><figcaption>' + escapeHtml(item.type) + '</figcaption></figure>',
      '<div class="card-content"><div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row">' + tags + '</div></div>',
      '</a></article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function setupSearch() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-form] input[name='q']");
    var title = document.querySelector("[data-search-title]");
    var desc = document.querySelector("[data-search-desc]");
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lowered = query.toLowerCase();
    var found = window.SEARCH_ITEMS.filter(function (item) {
      return item.search.toLowerCase().indexOf(lowered) !== -1;
    }).slice(0, 96);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (desc) {
      desc.textContent = found.length ? "已根据关键词筛选出相关影片。" : "没有找到完全匹配的影片，可尝试更换关键词。";
    }
    results.innerHTML = found.length ? found.map(cardTemplate).join("") : "";
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
