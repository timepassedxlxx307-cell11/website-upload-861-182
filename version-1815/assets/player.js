(function () {
  function startPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('[data-play-button]');
    var stream = root.getAttribute('data-stream');
    var hls;
    if (!video || !stream) {
      return;
    }
    var play = function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
    };
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!video.src || video.paused) {
        play();
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(startPlayer);
  });
})();
