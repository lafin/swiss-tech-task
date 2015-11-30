/* globals io */

'use strict';

var RTCPeerConnection = window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var socket = io.connect();

function handleFileSelect(event) {
  function onload() {
    return function(e) {
      localStream = e.target.result;
    };
  }
  var files = event.target.files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.type.match('image.*')) {
      var reader = new FileReader();
      reader.onload = onload(file);
      reader.readAsDataURL(file);
    }
  }
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

var localStream = null;
var peerConnection = null;
var sendChannel = null;

var mandatory = {
  mandatory: {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
  }
};

var socketReady = false;
socket.on('connect', onOpened)
  .on('message', onMessage);

function onOpened() {
  console.log('socket opened.');
  socketReady = true;
}

function onMessage(event) {
  if (event.type === 'offer') {
    console.log('Received offer, set offer, sending answer');
    setOffer(event);
    sendAnswer(event);
  } else if (event.type === 'answer') {
    console.log('Received answer, settinng answer SDP');
    setAnswer(event);
  } else if (event.type === 'candidate') {
    console.log('Received ICE candidate');
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: event.sdpMLineIndex,
      sdpMid: event.sdpMid,
      candidate: event.candidate
    });
    peerConnection.addIceCandidate(candidate);
  } else if (event.type === 'user dissconnected') {
    console.log('disconnected');
  }
}

function sendAnnonce(sdp) {
  socket.json.send(sdp);
}

function prepareConnection() {
  var peer = new RTCPeerConnection(null);
  sendChannel = peer.createDataChannel('channel');

  peer.ondatachannel = function(event) {
    var channel = event.channel;
    var message = '';
    channel.onopen = function() {
      console.log('Channel was opened');
      sendFile(localStream);
    };
    channel.onmessage = function(event) {
      message += event.data;
      if (event.data.slice(-2) === '==') {
        onReceived(message);
        message = '';
      }
    };
  };

  // send any ice candidates to the other peer
  peer.onicecandidate = function(event) {
    if (event.candidate) {
      sendAnnonce({
        type: 'candidate',
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    }
  };

  return peer;
}

function sendOffer() {
  if (!peerConnection) {
    peerConnection = prepareConnection();
  }
  peerConnection.createOffer(function(sessionDescription) {
    peerConnection.setLocalDescription(sessionDescription);
    console.log('Sending: SDP - Offer');
    sendAnnonce(sessionDescription);
  }, function() {}, mandatory);
}

function setOffer(event) {
  if (!peerConnection) {
    peerConnection = prepareConnection();
  }
  peerConnection.setRemoteDescription(new RTCSessionDescription(event));
}

function sendAnswer() {
  if (peerConnection) {
    peerConnection.createAnswer(function(sessionDescription) {
      peerConnection.setLocalDescription(sessionDescription);
      console.log('Sending: SDP - Answer');
      sendAnnonce(sessionDescription);
    }, function() {}, mandatory);
  }
}

function setAnswer(event) {
  if (peerConnection) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(event));
  }
}

function onSended() {
  var info = document.querySelector('#info');
  info.innerHTML += 'sended<br />';
}

function onReceived(data) {
  var images = document.querySelector('#images');
  images.innerHTML += '<img src="' + data + '" />';
}

function sendFile(data) {
  if (data) {
    var length = data.length;
    var chunk = 65536;
    for (var i = 0; i < length; i += chunk) {
      sendChannel.send(data.substr(i, chunk));
    }
    onSended();
  }
}

function send() {
  if (localStream && socketReady) {
    if (sendChannel) {
      sendFile(localStream);
    } else {
      console.log('try sendOffer.');
      sendOffer();
    }
  }
}
