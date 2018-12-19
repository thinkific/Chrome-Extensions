var runtimePort = chrome.runtime.connect({
  name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
  if (!message || !message.messageFromContentScript1234) {
    return;
  }
});

var isRecording = false;
chrome.storage.sync.get('isRecording', function(obj) {
  document.getElementById('default-section').style.display = obj.isRecording === 'true' ? 'none' : 'block';
  document.getElementById('stop-section').style.display = obj.isRecording === 'true' ? 'block' : 'none';

  isRecording = obj.isRecording === 'true';

  // auto-stop-recording
  if (isRecording === true) {
    document.getElementById('stop-recording').click();

    chrome.tabs.query({}, function(tabs) {
    var tabIds = [];
    var url = 'chrome-extension://' + chrome.runtime.id + '/video.html';
    for (var i = tabs.length - 1; i >= 0; i--) {
      if (tabs[i].url === url) {
        tabIds.push(tabs[i].id);
        chrome.tabs.update(tabs[i].id, {
            active: true,
            url: url
        });
        break;
      }
    }
    if (tabIds.length) {
      chrome.tabs.remove(tabIds);
    }
    });
  }
});

document.getElementById('stop-recording').onclick = function() {
  chrome.storage.sync.set({
    isRecording: 'false'
  }, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      stopRecording: true,
      dropdown: true
    });
    window.close();
  });
};

let settings = {
  enableTabCaptureAPI: 'false',
  enableTabCaptureAPIAudioOnly: 'false',
  enableMicrophone: 'false',
  enableCamera: 'false',
  enableScreen: 'false',
  isRecording: 'true',
  enableSpeakers: 'false'
};

document.getElementById('recording-type').onchange = function(e) {
  const choice = e.target.value;
  const cameraSelectContainer = document.getElementById('camera-select-container');

  switch (choice) {
    case "0":
      cameraSelectContainer.classList.add('is-hidden');
      settings.enableScreen = 'true';
      break;
    case "1":
      cameraSelectContainer.classList.remove('is-hidden');
      settings.enableCamera = 'true';
      break;
    case "2":
      cameraSelectContainer.classList.remove('is-hidden');
      settings.enableScreen = 'true';
      settings.enableCamera = 'true';
      break;
    default:
      setScreen();
      break;
  }
}

document.getElementById('mic-toggle').onchange = function(e) {
  const isEnabled = e.target.checked;
  const micSelectContainer = document.getElementById('microphone-select-container');
  if (isEnabled) {
    micSelectContainer.classList.remove('is-hidden');
    settings.enableMicrophone = 'true';
  } else {
    micSelectContainer.classList.add('is-hidden');
    settings.enableMicrophone = 'false';
  }
}

document.getElementById('speaker-toggle').onchange = function(e) {
  const isEnabled = e.target.checked;
  if (isEnabled) {
    settings.enableSpeakers = 'true';
  } else {
    settings.enableSpeakers = 'false';
  }
}

document.getElementById('button-start-recording').onclick = function(e) {
  console.log(settings);
  chrome.storage.sync.set(settings, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      startRecording: true,
      dropdown: true
    });
    window.close();
  });
}

// camera & mic
// microphone-devices
function onGettingDevices(result, stream) {
  chrome.storage.sync.get('microphone', function(storage) {
    result.audioInputDevices.forEach(function(device, idx) {
      var option = document.createElement('option');
      option.innerHTML = device.label || device.id;
      option.value = device.id;

      if (!storage.microphone && idx === 0) {
        option.selected = true;
      }

      if (storage.microphone && storage.microphone === device.id) {
        option.selected = true;
      }

      document.getElementById('microphone-devices').appendChild(option);
    });
  });

  chrome.storage.sync.get('camera', function(storage) {
    result.videoInputDevices.forEach(function(device, idx) {
      var option = document.createElement('option');
      option.innerHTML = device.label || device.id;
      option.value = device.id;

      if (!storage.camera && idx === 0) {
        option.selected = true;
      }

      if (storage.camera && storage.camera === device.id) {
        option.selected = true;
      }

      document.getElementById('camera-devices').appendChild(option);
    });
  });

  stream && stream.getTracks().forEach(function(track) {
    track.stop();
  });
}

getAllAudioVideoDevices(function(result) {
  if (result.audioInputDevices.length && !result.audioInputDevices[0].label) {
    var constraints = { audio: true, video: true };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      var video = document.createElement('video');
      video.muted = true;
      if('srcObject' in video) {
        video.srcObject = stream;
      }
      else {
        video.src = URL.createObjectURL(stream);
      }

      onGettingDevices(result, stream);
    }).catch(function() {
      onGettingDevices(result);
    });
    return;
  }

  onGettingDevices(result);
});

document.getElementById('microphone-devices').onchange = function() {
  chrome.storage.sync.set({
    microphone: this.value
  });
};

document.getElementById('camera-devices').onchange = function() {
  chrome.storage.sync.set({
    camera: this.value
  });
};
