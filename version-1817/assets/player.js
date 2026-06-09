(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-hls-src]');
    var overlay = shell.querySelector('[data-player-overlay]');
    var button = shell.querySelector('[data-player-play]');
    var status = shell.parentElement ? shell.parentElement.querySelector('[data-player-status]') : null;

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');
    var attached = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已加载，可以开始观看。');
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在尝试恢复播放源。');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解码异常，正在尝试恢复。');
            hls.recoverMediaError();
          } else {
            setStatus('播放源暂时无法加载，请刷新页面或更换浏览器。');
            hls.destroy();
          }
        });
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('已使用浏览器原生 HLS 播放能力。');
      } else {
        video.src = source;
        setStatus('已绑定播放源；如无法播放，请使用支持 HLS 的现代浏览器。');
      }
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      } else if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('loadedmetadata', function () {
      setStatus('影片信息已加载。');
    });

    video.addEventListener('error', function () {
      setStatus('视频加载失败，请刷新页面或稍后再试。');
    });

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      attachSource();
    }, { once: true });

    attachSource();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player-shell]').forEach(setupPlayer);
  });

  window.addEventListener('beforeunload', function () {
    document.querySelectorAll('video').forEach(function (video) {
      if (video._hls) {
        video._hls.destroy();
        video._hls = null;
      }
    });
  });
}());
