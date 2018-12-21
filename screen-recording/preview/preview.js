var video = document.querySelector("video");
var fname = document.querySelector("#file-name");
var fduration = document.querySelector("#file-duration");
var header = document.querySelector("header");
var downloadBtn = document.getElementById("btn-download");
var currentVideo = document.getElementById("current-video");
var playBtn = document.getElementById("btn-play");
var pauseBtn = document.getElementById("btn-pause");
var volumeBtn = document.getElementById("btn-volume");
var fullScreenBtn = document.getElementById("btn-full-screen");
var seekBar = document.getElementById("seek-bar");
var seeker = document.getElementById("seeker");
var volumeGauge = document.getElementById("volume-gauge");
var recentFile = localStorage.getItem('selected-file');
var videoDuration
var file;

function onGettingFile(f, item) {
  file = f;

  if (!file) {
    const message = document.getElementById('file-info__message')
    message.classList.remove('is-hidden');

    if (item && item.name) {
      message.innerHTML = item.display + ' has no video data.';
    } else {
      message.innerHTML = 'You did NOT record anything yet.';
    }
    return;
  }

  file.item = item;

  if(!file.url || file.url.toString().toLowerCase().indexOf('youtube') !== -1) {
    file.url = URL.createObjectURL(file);
  }

  (function() {
    // this function calculates the duration
    var hidden = document.createElement("video");
    var url = file.url;
    hidden.currentTime = 9999999999;
    hidden.onloadedmetadata = function() {
      if (url !== file.url) return;

      if (hidden.duration === Infinity) {
        setTimeout(hidden.onloadedmetadata, 1000);
        return;
      }
      videoDuration = hidden.duration;
      fduration.innerHTML = formatSecondsAsTime(hidden.duration);
      hidden.parentNode.removeChild(hidden);
    };
    hidden.style =
      "position: absolute; top: -99999999999; left: -99999999999; opacity: 0;";
    (document.body || document.documentElement).appendChild(hidden);
    hidden.muted = true;
    hidden.src = file.url;
    hidden.play();
  })();

  video.src = file.url;
  video.currentTime = 9999999999;

  if (
    file.name &&
    (file.name.indexOf(".mp3") !== -1 ||
      file.name.indexOf(".wav") !== -1 ||
      file.name.indexOf(".ogg") !== -1)
  ) {
    video.style.background = "url(images/no-video.png) no-repeat center center";
    video.currentTime = 0;
  } else {
    video.style.background = "";
  }

  fname.innerHTML = item.display;

  video.onclick = function() {
    video.onclick = null;
    video.style.cursor = "";
    video.play();
  };

  downloadBtn.href = file.url;
  downloadBtn.download = file.name;

  localStorage.setItem('selected-file', file.name);
}

DiskStorage.GetLastSelectedFile(recentFile, function (file) {
  if (!file) {
    onGettingFile(file);
    return;
  }

  DiskStorage.GetFilesList(function (list) {
    if (!recentFile) {
      onGettingFile(file, list[0]);
      return;
    }

    var found;
    list.forEach(function (item) {
      if (typeof item === 'string') {
        if (item === recentFile) {
          found = {
            name: item,
            display: item,
            php: '',
            youtube: ''
          };
        }
      } else if (item.name === recentFile) {
        found = item;
      }
    });

    if (!found) {
      onGettingFile(file, list[0]);
      return;
    }

    onGettingFile(file, found);
  });
});

function formatSecondsAsTime(secs) {
  var hr = Math.floor(secs / 3600);
  var min = Math.floor((secs - hr * 3600) / 60);
  var sec = Math.floor(secs - hr * 3600 - min * 60);

  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }

  if (hr <= 0) {
    return min + ":" + sec;
  }

  return hr + ":" + min + ":" + sec;
}


noUiSlider.create(seekBar, {
  start: [0, 100],
  connect: true,
  range: {
    'min': 0,
    'max': 100
  }
});

noUiSlider.create(seeker, {
  start: 0,
  range: {
    'min': 0,
    'max': 100
  }
});

noUiSlider.create(volumeGauge, {
  start: 40,
  range: {
    'min': 0,
    'max': 100
  }
});

volumeGauge.noUiSlider.on("change", function(e) {
  const volume = e[0] / 100;
  currentVideo.volume = volume;
});

seeker.noUiSlider.on('change', function (e) {
  const percentageInTime = videoDuration * (e[0] / 100);
  currentVideo.currentTime = percentageInTime;
});

playBtn.onclick = function(e) {
  e.stopPropagation();
  currentVideo.play();
  playBtn.classList.add("d-none");
  pauseBtn.classList.remove("d-none");
};

pauseBtn.onclick = function(e) {
  e.stopPropagation();
  currentVideo.pause();
  pauseBtn.classList.add("d-none");
  playBtn.classList.remove("d-none");
};

currentVideo.onended = function() {
  pauseBtn.classList.add("d-none");
  playBtn.classList.remove("d-none");
  seeker.noUiSlider.set(0);
};

fullScreenBtn.onclick = function(e) {
  e.stopPropagation();
  currentVideo.requestFullscreen()
};

volumeBtn.onclick = function(e) {
  e.stopPropagation();
  if (volumeGauge.classList.contains("is-hidden")) {
    volumeGauge.classList.remove("is-hidden");
  } else {
    volumeGauge.classList.add("is-hidden");
  }
};

currentVideo.ontimeupdate = function(e) {
  const timeInPercentage = (e.target.currentTime / videoDuration) * 100;
  seeker.noUiSlider.set(timeInPercentage);
};
