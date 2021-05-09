//import Tesseract from 'tesseract.js';
const status = document.querySelector('#status');
const result = document.querySelector("#result")

var canvas = document.getElementById('canvas');
var width = 320;    // We will scale the photo width to this
var height = 0;     // This will be computed based on the input stream

var video = document.querySelector("#video");
var notify = document.querySelector("#notify");
var photo = document.getElementById('photo');

//var stopVideo = document.querySelector("#stop");
var startVid = document.querySelector("#start");
var takePic = document.getElementById('takePic');
var resetbutton = null;
//var paused = false;
//var playing = true;
state = {"mode":begin, "bool": false};
var streaming = false;


function begin(a) {
  let constraints = {video: true,
    facingMode: {
      exact: "environment"
    }
  };

  resetbutton = document.getElementById("resetbutton");
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (error) {
        console.log("Something went wrong! "+ error);
        notify.innerHTML="Oops! You must accept camera permission ";
        reset(begin,false,"start")
      
      });
  }

  video.addEventListener('canplay', function(ev){
        if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
        
        if (isNaN(height)) {
            height = width / (4/3);
        }
        
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
        
        }
  }, false);
  takePic.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
  }, false);
    
  resetbutton.addEventListener("click", function(ev){
      clearphoto();
  });

  clearphoto();       

}

startVid.addEventListener("click", ()=>{
  if (state.mode ===begin && state.bool === false ) {
    begin()
    reset(stop, true, "stop")

  } else {
    stop();
    reset(begin, false, "start")
  }
  /*
  startVid.onclick = function(){
    startVid.innerHTML = "stop";
  
      
  }
  */
})

//stopVideo.addEventListener("click", stop, true);

//var btn = document.querySelector("#start");
/*
startVid.addEventListener("click", state.mode, state.bool);
startVid.onclick = function(){
  startVid.innerHTML = "stop";
  state.mode = stop()
  state.bool = true
  console.log(state.mode)
}
*/
function reset(mode,bool,rText) {
  state.mode = mode
  state.bool = bool
  startVid.innerHTML = rText;      
}

function stop(e) {

  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
  video.srcObject = null;      
}

function clearphoto() {
  var context = canvas.getContext('2d');
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', null);//data
}

function takepicture() {
  var context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
  
    var data = canvas.toDataURL('image/png');
    //console.log("UNCHANGED ", data)
    // Attempt to send the data to server
    // then put the response as src
    recog(data)

  } else {
    clearphoto();
  }
}    

function recog(img) {
  result.textContent = "Loading...";

  Tesseract.recognize(
    img,//'https://tesseract.projectnaptha.com/img/eng_bw.png',
    'eng',
    /*
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);
  })
  */
    { logger:m=> result.textContent =m.status}
  ).then(({ data: {text} } ) => {
    result.textContent =text
  })
/*

  const { createWorker, createScheduler } = Tesseract//require('tesseract.js');

  const scheduler = createScheduler();
  const worker1 = createWorker();
  const worker2 = createWorker();
  const rectangles = [
    {
      left: 0,
      top: 0,
      width: 500,
      height: 250,
    },
    {
      left: 500,
      top: 0,
      width: 500,
      height: 250,
    },
  ];

  (async () => {
    await worker1.load();
    await worker2.load();
    await worker1.loadLanguage('eng');
    await worker2.loadLanguage('eng');
    await worker1.initialize('eng');
    await worker2.initialize('eng');
    scheduler.addWorker(worker1);
    scheduler.addWorker(worker2);
    const results = await Promise.all(rectangles.map((rectangle) => (
      scheduler.addJob('recognize', img, {rectangle})//'https://tesseract.projectnaptha.com/img/eng_bw.png', { rectangle })
    )));
    console.log(results.map(r => r.data.text));
    await scheduler.terminate();
  })();
*/
}