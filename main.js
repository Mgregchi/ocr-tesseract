//import Tesseract from 'tesseract.js';
const status = document.querySelector('#status');
const result = document.querySelector("#result");
var textForm = document.getElementById("textForm");
var canvas = document.getElementById('canvas');
var width = 320;    // We will scale the photo width to this
var height = 0;     // This will be computed based on the input stream

var video = document.querySelector("#video");
var notify = document.querySelector("#notify");
var photo = document.getElementById('photo');

//var stopVideo = document.querySelector("#stop");
var startVid = document.querySelector("#start");
//var takePic = document.getElementById('takePic');
var takePic = $("#takePic");
var resetbutton = $("#resetbutton");
//var paused = false;
//var playing = true;
state = {"mode":begin, "bool": false};
var streaming = false;
var hid = false;

function begin(a) {
  takePic.removeClass("disabled");
  resetbutton.removeClass("disabled");
  if(hid === true) video.removeAttribute("hidden");// Skip hidden elements  
  let constraints = {video:true/*{
    facingMode: {
      exact: "environment"
    }
  }*/};

  notify.innerHTML = "";
  //resetbutton = document.getElementById("resetbutton");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (error) {
        //const OverconstrainedError
        
        //console.log("Something went wrong! "+ error);
        var conError = error.name.toString()
        //console.log(conError==="OverconstrainedError");
        if(conError === "OverconstrainedError") notify.innerHTML="Use mobile device";// console.log("No environ");
        else(notify.innerHTML="Oops! You must accept camera permission ");
        /* Alert the copied text */
        //alert("Oops! You must accept camera permission ");
        errAlert();       
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
        streaming = true;
        
        }
  }, false);
  /*
  takePic.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
  }, false);
  */

  takePic.click(function(){
    //console.log("TAKEPIC");
    takepicture();
  });

  resetbutton.click(function(){
      clearphoto();
  });

  //clearphoto();       

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
  if(hid === true) video.removeAttribute("hidden");// Skip hidden elements  

}

function stop(e) {

  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
  canvas.setAttribute("src", null);
  /*
  video.setAttribute('width', 0);
  video.setAttribute('height', 0);
  canvas.setAttribute('width', 0);
  canvas.setAttribute('height', 0);
  */
  takePic.addClass("disabled");
  resetbutton.addClass("disabled");
}

function clearphoto() {
  var context = canvas.getContext('2d');
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL('image/png');
  canvas.width = 0;
  canvas.height = 0;
  //photo.setAttribute('src', null);//data
  // Hide video
  video.removeAttribute("hidden");
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
    video.setAttribute("hidden", true);
    hid = true;
    console.log("UNDER")
    recog(data);


  } else {
    clearphoto();
  }
}    



var copyBtn = document.getElementById("copyBtn");
copyBtn.onclick = textCopy;
function textCopy() {
  
  /* Get the text field */
  var copyText = document.getElementById("result");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");
  notify.innerHTML="Copied the text: " + copyText.value;
  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
  errAlert();
}

function recog(img) {
  var proc = document.getElementById("proc");
  //copyBtn.removeAttribute(copyBtn.className.search("disabled"), '');

  Tesseract.recognize(
    img,//'https://tesseract.projectnaptha.com/img/eng_bw.png',
    'eng',
    /*
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);
  })
  */
    { logger:m=> proc.textContent =m.status}
  ).then(({ data: {text} } ) => {
    result.removeAttribute("hidden");
    result.value =text

  })
    //copyBtn.removeClass("disabled");

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
// Can also be used for toasts
function errAlert(msg, gfg) {
  var confirmBox = $("#alert");
    
  /* Trace message to display */
  confirmBox.find(".message").text(msg);
    
  /* Calling function */
  confirmBox.find(".yes").unbind().click(function() 
  {
     confirmBox.hide();
  });
  confirmBox.find(".yes").click(gfg);
  confirmBox.show();
}

