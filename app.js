const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");
const theaterBtn = document.querySelector(".theater-btn");
const fullScrBtn = document.querySelector(".full-screen-btn");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const timelineContainer = document.querySelector(".timeline-container");

const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR KEY PRESSING FUNCTIONALITY

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;
  switch (e.key.toLowerCase()) {
    case " ":
    case "k":
      togglePlay();
      break;
    case "f":
      toggleFullScreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//! PLAY / PAUSE VIDEO

playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});

function toggleTheaterMode() {
  //   if (videoContainer.classList.contains("theater")) {
  //     videoContainer.classList.remove("theater");
  //   } else {
  //     videoContainer.classList.add("theater");
  //   }
  videoContainer.classList.toggle("theater");
}

theaterBtn.addEventListener("click", toggleTheaterMode);

function toggleFullScreenMode() {
  //   if (videoContainer.classList.contains("full-screen")) {
  //     videoContainer.classList.remove("full-screen");
  //   } else {
  //     videoContainer.classList.add("full-screen");
  //   }

  videoContainer.classList.toggle("full-screen");
}

fullScrBtn.addEventListener("click", toggleFullScreenMode);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//! VOLUME SLIDER

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//! DURATION TIME SLIDER

video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();

    timelineContainer.style.setProperty("--progress-position", percent);
  }
}
