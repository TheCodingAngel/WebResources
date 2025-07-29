var videoManager;

class VideoManager {
    #videos = [];
    #counter = 0;
    #redrawRequested = false;
    #start = null;

    #canvas;
    #context;

    constructor() {
        try {
            this.#canvas = document.createElement("canvas");
            this.#canvas.width = 500;
            this.#canvas.height = 500;
            this.#context = this.#canvas.getContext('2d');
        } catch (err) {
            console.log(err);
        }
    }

    loadVideo(path) {
        let video = document.createElement('video');
        video.onloadedmetadata = function () {
            videoManager.#videos.push(this);
        };
        video.src = path;
    }

    requestRedraw() {
        if (!this.#redrawRequested) {
            window.requestAnimationFrame((timeStamp) => {
                this.drawVideo(0, timeStamp);
            });
            this.#redrawRequested = true;
        }
    }

    drawVideo(videoIndex, timeStamp) {
        let video = this.#videos[videoIndex];

        if (this.#start == null) {
            this.#start = timeStamp;
        }

        let duration = video.duration;
        if ((timeStamp - start) / 1000 <= 10) {
            this.#context.drawImage(video, 0, 0, this.#canvas.width, this.#canvas.height);
            requestRedraw();
        }
    }

    playVideo(videoIndex) {
        let video = this.#videos[videoIndex];
        if (video) {
            video.style.display = "block";
            video.play();
        } else {
            console.log("Incorrect video index: " + videoIndex);
        }
    }
}