(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var inputs = document.querySelectorAll('[data-search-input]');

    inputs.forEach(function (input) {
        var scope = input.closest('[data-search-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    });
})();
