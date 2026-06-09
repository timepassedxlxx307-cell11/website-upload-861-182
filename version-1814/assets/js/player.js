(function () {
  function startMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    if (!video || !button) {
      return;
    }

    var hls = null;
    var attached = false;
    var attaching = false;

    function attachStream(callback) {
      if (attached) {
        callback();
        return;
      }
      if (attaching) {
        window.setTimeout(function () {
          attachStream(callback);
        }, 120);
        return;
      }
      attaching = true;
      video.poster = options.poster;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.m3u8);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          attached = true;
          attaching = false;
          callback();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            attaching = false;
          }
        });
        window.setTimeout(function () {
          if (!attached) {
            attached = true;
            attaching = false;
            callback();
          }
        }, 1400);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.m3u8;
        video.addEventListener("loadedmetadata", function onReady() {
          video.removeEventListener("loadedmetadata", onReady);
          attached = true;
          attaching = false;
          callback();
        });
        window.setTimeout(function () {
          if (!attached) {
            attached = true;
            attaching = false;
            callback();
          }
        }, 900);
      } else {
        attaching = false;
      }
    }

    function playVideo() {
      button.classList.add("is-hidden");
      attachStream(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.startMoviePlayer = startMoviePlayer;
})();
