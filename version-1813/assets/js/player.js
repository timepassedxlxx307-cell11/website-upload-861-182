import { H as Hls } from "./hls-vendor.js";

export function initMoviePlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var button = document.querySelector(options.buttonSelector);
    var source = options.source;
    var hls = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    function load() {
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return Promise.resolve();
        }
        video.src = source;
        return Promise.resolve();
    }

    function play() {
        hideOverlay();
        load().then(function () {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            play();
        });
    }
    if (overlay) {
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                play();
            }
        });
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            play();
        }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("error", function () {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
