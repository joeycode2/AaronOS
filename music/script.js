window.onerror = function(errorMsg, url, lineNumber){
    alert("oof, u got a error\n\n" + url + '[' + lineNumber + ']:\n' + errorMsg)
}

function getId(target){
    return document.getElementById(target);
}
var iframeMode = 0;
window.aosTools_connectFailListener = function(){
    var aosStylesheet = document.createElement("link");
    aosStylesheet.rel = "stylesheet";
    aosStylesheet.href = "../styleBeta.css";
    document.head.prepend(aosStylesheet);
    iframeMode = 0;
}
window.aosTools_connectListener = function(){
    aosTools.sendRequest({
        action: "appwindow:open_window"
    }, console.log);
    iframeMode = 1;
}
if(window.aosTools){
    aosTools.testConnection();
}

var audio = new Audio();
var audioDuration = 1;
function updateProgress(){
    progressBar.style.width = audio.currentTime / audioDuration * 100 + "%";
    progressBar.style.backgroundColor = getColor(audio.currentTime / audioDuration * 255);
    requestAnimationFrame(updateProgress);
}
requestAnimationFrame(updateProgress);

/*global AudioContext*/

var audioContext;
var mediaSource;

var delayNode;
function setDelay(newDelay){
    delayNode.delayTime.value = (newDelay || 0);
}

var analyser;

var visData;

var microphone;

var folderInput = getId("folderInput");
var fileInput = getId("fileInput");
var fileWeirdInput = getId("fileWeirdInput");
var songList = getId("songList");
var progressBar = getId("progress");
var currentlyPlaying = getId("currentlyPlaying");

var files = [];
var filesAmount = 0;
var fileNames = [];
var filesLength = 0;

var supportedFormats = ['aac', 'aiff', 'wav', 'm4a', 'mp3', 'amr', 'au', 'weba', 'oga', 'wma', 'flac', 'ogg', 'opus', 'webm'];

var URL;

function listSongs(){
    var str = "";
    for(var i in fileNames){
        str += '<div id="song' + i + '" onclick="selectSong(' + i + ')">' + fileNames[i][1] + ": " + fileNames[i][3] + fileNames[i][0] + '</div>';
    }
    songList.innerHTML = str;
}

function loadFolder(event){
    audio.pause();
    currentSong = -1;
    files = folderInput.files;
    filesAmount = files.length;
    filesLength = 0;
    fileNames = [];
    for(var i = 0; i < filesAmount; i++){
        if(files[i].type.indexOf("audio/") === 0){
            var fileName = files[i].name.split('.');
            if(fileName[fileName.length - 1] !== 'mid' && fileName[fileName.length - 1] !== 'midi'){
                var filePath = '';
                if(files[i].webkitRelativePath){
                    filePath = files[i].webkitRelativePath.split('/');
                    filePath.pop();
                    filePath.shift();
                    if(filePath.length > 0){
                        filePath = filePath.join(": ");
                        filePath += ': ';
                    }else{
                        filePath = '';
                    }
                }
                filesLength++;
                if(supportedFormats.indexOf(fileName[fileName.length - 1]) > -1){
                    fileName.pop();
                }
                fileNames.push([fileName.join('.'), i, URL.createObjectURL(files[i]), filePath]);
            }
        }
    }
    listSongs();
    var disabledElements = document.getElementsByClassName('disabled');
    while(disabledElements.length > 0){
        disabledElements[0].classList.remove('disabled');
    }
    if(!smokeEnabled){
        smokeElement.classList.add("disabled");
    }
    
    audioContext = new AudioContext();
    mediaSource = audioContext.createMediaElementSource(audio);
    
    delayNode = audioContext.createDelay();
    delayNode.delayTime.value = 0.25;
    delayNode.connect(audioContext.destination);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -70;
    analyser.smoothingTimeConstant = 0;
    mediaSource.connect(analyser);
    analyser.connect(delayNode);
    
    visData = new Uint8Array(analyser.frequencyBinCount);
    
    getId("introduction").classList.add('disabled');
    getId("visualizer").classList.add('disabled');
    getId("selectOverlay").classList.add('disabled');
    setVis("none");
    
    winsize = [window.innerWidth, window.innerHeight];
    if(fullscreen){
        size = [window.innerWidth, window.innerHeight];
    }else{
        size = [window.innerWidth - 8, window.innerHeight - 81];
    }
    getId("visCanvas").width = size[0];
    getId("visCanvas").height = size[1];
    
    requestAnimationFrame(globalFrame);
}

function loadFiles(event){
    audio.pause();
    currentSong = -1;
    files = fileInput.files;
    filesAmount = files.length;
    filesLength = 0;
    fileNames = [];
    for(var i = 0; i < filesAmount; i++){
        if(files[i].type.indexOf("audio/") === 0){
            var fileName = files[i].name.split('.');
            if(fileName[fileName.length - 1] !== 'mid' && fileName[fileName.length - 1] !== 'midi'){
                var filePath = '';
                if(files[i].webkitRelativePath){
                    filePath = files[i].webkitRelativePath.split('/');
                    filePath.pop();
                    filePath.shift();
                    filePath.join(": ");
                    filePath += ': ';
                }
                filesLength++;
                if(supportedFormats.indexOf(fileName[fileName.length - 1]) > -1){
                    fileName.pop();
                }
                fileNames.push([fileName.join('.'), i, URL.createObjectURL(files[i]), filePath]);
            }
        }
    }
    listSongs();
    var disabledElements = document.getElementsByClassName('disabled');
    while(disabledElements.length > 0){
        disabledElements[0].classList.remove('disabled');
    }
    
    audioContext = new AudioContext();
    mediaSource = audioContext.createMediaElementSource(audio);
    
    delayNode = audioContext.createDelay();
    delayNode.delayTime.value = 0.25;
    delayNode.connect(audioContext.destination);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -70;
    analyser.smoothingTimeConstant = 0;
    mediaSource.connect(analyser);
    analyser.connect(delayNode);
    
    visData = new Uint8Array(analyser.frequencyBinCount);
    
    getId("introduction").classList.add('disabled');
    getId("visualizer").classList.add('disabled');
    getId("selectOverlay").classList.add('disabled');
    setVis("none");
    
    winsize = [window.innerWidth, window.innerHeight];
    if(fullscreen){
        size = [window.innerWidth, window.innerHeight];
    }else{
        size = [window.innerWidth - 8, window.innerHeight - 81];
    }
    getId("visCanvas").width = size[0];
    getId("visCanvas").height = size[1];
    
    requestAnimationFrame(globalFrame);
}

function loadWeirdFiles(event){
    audio.pause();
    currentSong = -1;
    files = fileWeirdInput.files;
    filesAmount = files.length;
    filesLength = 0;
    fileNames = [];
    for(var i = 0; i < filesAmount; i++){
        var fileName = files[i].name.split('.');
        var filePath = '';
        if(files[i].webkitRelativePath){
            filePath = files[i].webkitRelativePath.split('/');
            filePath.pop();
            filePath.shift();
            filePath.join(": ");
            filePath += ': ';
        }
        filesLength++;
        if(supportedFormats.indexOf(fileName[fileName.length - 1]) > -1){
            fileName.pop();
        }
        fileNames.push([fileName.join('.'), i, URL.createObjectURL(files[i]), filePath]);
    }
    listSongs();
    var disabledElements = document.getElementsByClassName('disabled');
    while(disabledElements.length > 0){
        disabledElements[0].classList.remove('disabled');
    }
    
    audioContext = new AudioContext();
    mediaSource = audioContext.createMediaElementSource(audio);
    
    delayNode = audioContext.createDelay();
    delayNode.delayTime.value = 0.25;
    delayNode.connect(audioContext.destination);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -70;
    analyser.smoothingTimeConstant = 0;
    mediaSource.connect(analyser);
    analyser.connect(delayNode);
    
    visData = new Uint8Array(analyser.frequencyBinCount);
    
    getId("introduction").classList.add('disabled');
    getId("visualizer").classList.add('disabled');
    getId("selectOverlay").classList.add('disabled');
    setVis("none");
    
    winsize = [window.innerWidth, window.innerHeight];
    if(fullscreen){
        size = [window.innerWidth, window.innerHeight];
    }else{
        size = [window.innerWidth - 8, window.innerHeight - 81];
    }
    getId("visCanvas").width = size[0];
    getId("visCanvas").height = size[1];
    
    requestAnimationFrame(globalFrame);
}

var microphoneActive = 0;

function loadMicrophone(event){
    audio.pause();
    currentSong = -1;

    var disabledElements = document.getElementsByClassName('disabled');
    while(disabledElements.length > 0){
        disabledElements[0].classList.remove('disabled');
    }
    if(!smokeEnabled){
        smokeElement.classList.add("disabled");
    }
    
    audioContext = new AudioContext();
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -70;
    analyser.smoothingTimeConstant = 0;
    
    visData = new Uint8Array(analyser.frequencyBinCount);
    
    getId("introduction").classList.add('disabled');
    getId("visualizer").classList.add('disabled');
    getId("selectOverlay").classList.add('disabled');
    setVis("none");
    
    winsize = [window.innerWidth, window.innerHeight];
    if(fullscreen){
        size = [window.innerWidth, window.innerHeight];
    }else{
        size = [window.innerWidth - 8, window.innerHeight - 81];
    }
    getId("visCanvas").width = size[0];
    getId("visCanvas").height = size[1];

    navigator.webkitGetUserMedia({audio:true}, function(stream){
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
    }, function(){alert('error');});
    
    microphoneActive = 1;
    
    requestAnimationFrame(globalFrame);
}

var currentSong = -1;

function selectSong(id){
    currentSong = id;
    audio.pause();
    audio.currentTime = 0;
    audio.src = fileNames[id][2];
    getId("currentlyPlaying").innerHTML = fileNames[id][1] + ": " + fileNames[id][0];
    document.title = fileNames[id][0] + " | aOS Music Player";
    if(iframeMode){
        aosTools.sendRequest({
            action: "appwindow:set_caption",
            content: "Music Player | " + fileNames[id][0],
            conversation: "set_caption"
        });
    }
    try{
        document.getElementsByClassName("selected")[0].classList.remove("selected");
    }catch(err){
        // no song is selected
    }
    getId("song" + id).classList.add("selected");
}

function play(){
    if(!microphoneActive){
        if(currentSong === -1){
            selectSong(0);
        }else{
            audio.play();
        }
    }
}
function pause(){
    if(!microphoneActive){
        audio.pause();
    }
}

function firstPlay(){
    audioDuration = audio.duration;
    play();
}
audio.addEventListener("canplaythrough", firstPlay);

function setProgress(e){
    if(!microphoneActive && currentSong !== -1){
        var timeToSet = e.pageX - 5;
        if(timeToSet < 5){
            timeToSet = 0;
        }
        timeToSet /= size[0];
        timeToSet *= audio.duration;
        audio.currentTime = timeToSet;
    }
}

function back(){
    if(!microphoneActive){
        if(audio.currentTime < 3){
            currentSong--;
            if(currentSong < 0){
                currentSong = fileNames.length - 1;
            }
            selectSong(currentSong);
        }else{
            audio.currentTime = 0;
        }
    }
}
function next(){
    if(!microphoneActive){
        currentSong++;
        if(currentSong > fileNames.length - 1){
            currentSong = 0;
        }
        selectSong(currentSong);
    }
}
audio.addEventListener("ended", next);

// courtesy Stack Overflow
function shuffleArray(array){
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function shuffle(){
    if(!microphoneActive){
        audio.pause();
        audio.currentTime = 0;
        currentSong = 0;
        shuffleArray(fileNames);
        listSongs();
        selectSong(0);
    }
}

function refresh(){
    window.location = "?refresh=" + (new Date()).getTime();
}

var performanceMode = 0;
function togglePerformance(){
    if(performanceMode){
        if(currVis !== "none"){
            size[0] *= 2;
            size[1] *= 2;
            getId("visCanvas").width = size[0];
            getId("visCanvas").height = size[1];
            getId("visCanvas").style.imageRendering = "";
            getId("smokeCanvas").width = size[0];
            getId("smokeCanvas").height = size[1];
            getId("smokeCanvas").style.imageRendering = "";
        }
    }else{
        if(currVis !== "none"){
            size[0] /= 2;
            size[1] /= 2;
            getId("visCanvas").width = size[0];
            getId("visCanvas").height = size[1];
            getId("visCanvas").style.imageRendering = "pixelated";
            getId("smokeCanvas").width = size[0];
            getId("smokeCanvas").height = size[1];
            getId("smokeCanvas").style.imageRendering = "pixelated";
        }
    }
    performanceMode = Math.abs(performanceMode - 1);
    if(vis[currVis].sizechange){
        vis[currVis].sizechange();
    }
}

var winsize = [window.innerWidth, window.innerHeight];
var size = [window.innerWidth - 8, window.innerHeight - 81];
var fullscreen = 0;
function toggleFullscreen(){
    if(fullscreen){
        size = [window.innerWidth - 8, window.innerHeight - 81];
        if(performanceMode){
            size[0] /= 2;
            size[1] /= 2;
        }
        getId("visualizer").style.border = "";
        getId("visualizer").style.bottom = "";
        getId("visualizer").style.left = "";
        getId("visualizer").style.width = "";
        getId("visualizer").style.height = "";
        getId("visCanvas").width = size[0];
        getId("visCanvas").height = size[1];
        document.body.style.background = '';
        fullscreen = 0;
        if(currVis !== "none"){
            resizeSmoke();
            if(vis[currVis].sizechange){
                vis[currVis].sizechange();
            }
        }
    }else{
        size = [window.innerWidth, window.innerHeight];
        if(performanceMode){
            size[0] /= 2;
            size[1] /= 2;
        }
        getId("visualizer").style.border = "none";
        getId("visualizer").style.bottom = "0";
        getId("visualizer").style.left = "0";
        getId("visualizer").style.width = "100%";
        getId("visualizer").style.height = "100%";
        getId("visCanvas").width = size[0];
        getId("visCanvas").height = size[1];
        document.body.style.background = '#000';
        fullscreen = 1;
        if(currVis !== "none"){
            resizeSmoke();
            if(vis[currVis].sizechange){
                vis[currVis].sizechange();
            }
        }
    }
}

var fps = 0;
var currFPS = 0;
var lastSecond = 0;
var fpsEnabled = 0;
function toggleFPS(){
    fpsEnabled = Math.abs(fpsEnabled - 1);
}

var canvasElement = getId("visCanvas");
var canvas = canvasElement.getContext("2d");

var smokeElement = getId("smokeCanvas");
var smoke = smokeElement.getContext("2d");

var highFreqRange = 0;

function globalFrame(){
    requestAnimationFrame(globalFrame);
    if(winsize[0] !== window.innerWidth || winsize[1] !== window.innerHeight){
        winsize = [window.innerWidth, window.innerHeight];
        if(fullscreen){
            size = [window.innerWidth, window.innerHeight];
        }else{
            size = [window.innerWidth - 8, window.innerHeight - 81];
        }
        if(performanceMode){
            size[0] /= 2;
            size[1] /= 2;
        }
        getId("visCanvas").width = size[0];
        getId("visCanvas").height = size[1];
        if(currVis !== "none"){
            if(smokeEnabled){
                resizeSmoke();
            }
            if(vis[currVis].sizechange){
                vis[currVis].sizechange();
            }
        }
    }
    if(currVis !== "none"){
        analyser.getByteFrequencyData(visData);
        if(highFreqRange){
            var tempsize = size[0];
            for(var i = 0; i < tempsize; i++){
                visData[i] = Math.max(visData[i * 2], visData[i * 2 + 1]);
            }
        }
        if(smokeEnabled){
            smokeFrame();
        }
        vis[currVis].frame();
        if(fpsEnabled){
            fps++;
            var currSecond = (new Date().getSeconds());
            if(currSecond !== lastSecond){
                currFPS = fps;
                fps = 0;
                lastSecond = currSecond;
            }
            canvas.font = '12px aosProFont, monospace';
            canvas.fillStyle = 'rgba(0, 0, 0, 0.5)';
            canvas.fillRect(1, 1, 14, 9);
            canvas.fillStyle = '#FFF';
            canvas.fillText(String(currFPS), 2.5, 9);
        }
    }
}

var colors = {
    bluegreenred: {
        name: "Default",
        image: "colors/default.png",
        func: function(amount){
            return 'rgba(' +
                ((amount > 200) * ((amount - 200) * 4.6)) + ',' +
                (amount - ((amount > 220) * ((amount - 220) * 7.2))) + ',' +
                (255 - amount) + ',' +
                (amount / 255) + ')';
        }
    },
    beta: {
        name: "Default Solid",
        image: "colors/defaultSolid.png",
        func: function(amount){
            return 'rgb(' +
                ((amount > 200) * ((amount - 200) * 4.6)) + ',' +
                (amount - ((amount > 220) * ((amount - 220) * 7.2))) + ',' +
                (255 - amount) + ')';
        }
    },
    defStatic: {
        name: "Default Static",
        image: "colors/defaultStatic.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'rgb(0,' + position + ',' + (255 - position) + ')';
            }else{
                return 'rgb(0,' + amount + ',' + (255 - amount) + ')';
            }
        }
    },
    alpha: {
        name: "Alpha",
        image: "colors/alpha.png",
        func: function(amount){
            return 'rgb(0,' + amount + ',' + (255 - amount) + ')';
        }
    },
    intensityGlow: {
        name: "Intensity",
        image: "colors/intensity.png",
        func: function(amount){
            return 'rgba(' +
                ((amount >= 127) * 255 + (amount < 127) * (amount * 2)) + ',' +
                ((amount < 127) * 255 + (amount >= 127) * ((254.5 - amount) * 2)) + ',' +
                '0,' + (amount / 255) + ')';
        }
    },
    intensity: {
        name: "Intensity Solid",
        image: "colors/intensitySolid.png",
        func: function(amount){
            return 'rgb(' +
                ((amount >= 127) * 255 + (amount < 127) * (amount * 2)) + ',' +
                ((amount < 127) * 255 + (amount >= 127) * ((254.5 - amount) * 2)) + ',' +
                '0)';
        }
    },
    intensityStatic: {
        name: "Intensity Static",
        image: "colors/intensityStatic.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'rgb(' +
                    ((position >= 127) * 255 + (position < 127) * (position * 2)) + ',' +
                    ((position < 127) * 255 + (position >= 127) * ((254.5 - position) * 2)) + ',' +
                    '0)';
            }else{
                return 'rgb(' +
                    ((amount >= 127) * 255 + (amount < 127) * (amount * 2)) + ',' +
                    ((amount < 127) * 255 + (amount >= 127) * ((254.5 - amount) * 2)) + ',' +
                    '0)';
            }
        }
    },
    'SEPARATOR_THEMES" disabled="': {
        name: "---------------",
        func: function(){
            return '#000';
        }
    },
    fire: {
        name: "Fire",
        image: "colors/fire.png",
        func: function(amount){
            //return 'rgba(' +
            //    amount + ',' +
            //    ((amount > 200) * amount * 0.25 + (amount > 127) * amount * 0.5 + (amount <= 127) * amount * 0.1) + ',0, ' + (amount / 255) + ')';
            return 'rgba(255,' +
                (Math.pow(amount, 2) / 255) + ',0,' +
                (amount / 255) + ')';
        }
    },
    rainbowStatic: {
        name: "Rainbow",
        image: "colors/rainbowStatic.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'hsl(' +
                    (position * this.multiplier) +
                    ',100%,50%)';
            }else{
                return 'hsl(' +
                    (amount * this.multiplier) +
                    ',100%,50%)';
            }
        },
        multiplier: 360 / 255
    },
    rainbowActive: {
        name: "Rainbow Active",
        image: "colors/rainbowActive.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'hsla(' +
                    (position * this.multiplier) +
                    ',100%,50%,' +
                    (amount / this.alphaDivisor + 0.25) + ')';
            }else{
                return 'hsla(' +
                    (amount * this.multiplier) +
                    ',100%,50%,' +
                    (amount / this.alphaDivisor + 0.25) + ')';
            }
        },
        multiplier: 360 / 255,
        alphaDivisor: 255 * (4/3)
    },
    queen: {
        name: "Queen",
        image: "colors/queen.png",
        func: function(amount){
            return 'rgba(' +
                (amount * amount / 510 + 127) + ',' +
                ((amount > 127) * ((amount - 127) * 1.6)) + ',' +
                (255 - amount) + ',' +
                (amount / 255) + ')';
        }
    },
    queenSolid: {
        name: "Queen Solid",
        image: "colors/queenSolid.png",
        func: function(amount){
            return 'rgb(' +
                (amount * amount / 510 + 127) + ',' +
                ((amount > 127) * ((amount - 127) * 1.6)) + ',' +
                (255 - amount) + ')';
        }
    },
    queenStatic: {
        name: "Queen Static",
        image: "colors/queenStatic.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'rgb(' +
                    (position * position / 510 + 127) + ',' +
                    ((position > 127) * ((position - 127) * 1.6)) + ',' +
                    (255 - position) + ')';
            }else{
                return 'rgb(' +
                    (amount * amount / 510 + 127) + ',' +
                    ((amount > 127) * ((amount - 127) * 1.6)) + ',' +
                    (255 - amount) + ')';
            }
        },
        sqrt127: Math.sqrt(127)
    },
    prideGlow: {
        name: "Pride",
        image: "colors/pride.png",
        func: function(amount){
            /*return 'rgba(' +
                (
                    (amount < 95) * 255 +
                    (amount >= 95 && amount < 159) * (159 - amount) * this.divide255by64 +
                    (amount >= 207) * ((207 - amount) * -1) * this.divide255by96
                ) + ',' +
                (
                    (amount < 95) * amount * this.divide255by96 +
                    (amount >= 95 && amount < 159) * 255 +
                    (amount >= 159 && amount < 207) * (207 - amount) * this.divide255by48
                ) + ',' +
                (
                    (amount >= 159 && amount < 207) * ((159 - amount) * -1) * this.divide255by48 +
                    (amount >= 207) * 255
                ) + ',' + (amount / 255) + ')';
            */
        return 'hsla(' + amount + ',100%,50%,' + (amount / 255) + ')';
        },
        divide255by96: 255 / 96,
        divide255by64: 255 / 64,
        divide255by48: 255 / 48
    },
    pride: {
        name: "Pride Solid",
        image: "colors/prideSolid.png",
        func: function(amount){
            /*return 'rgb(' +
                (
                    (amount < 95) * 255 +
                    (amount >= 95 && amount < 159) * (159 - amount) * this.divide255by64 +
                    (amount >= 207) * ((207 - amount) * -1) * this.divide255by96
                ) + ',' +
                (
                    (amount < 95) * amount * this.divide255by96 +
                    (amount >= 95 && amount < 159) * 255 +
                    (amount >= 159 && amount < 207) * (207 - amount) * this.divide255by48
                ) + ',' +
                (
                    (amount >= 159 && amount < 207) * ((159 - amount) * -1) * this.divide255by48 +
                    (amount >= 207) * 255
                ) + ')';*/
            return 'hsl(' + amount + ',100%,50%)';
        },
        divide255by96: 255 / 96,
        divide255by64: 255 / 64,
        divide255by48: 255 / 48
    },
    prideStatic: {
        name: "Pride Static",
        image: "colors/prideStatic.png",
        func: function(amount, position){
            if(typeof position === "number"){
                return 'hsl(' + position + ',100%,50%)';
            }else{
                return 'hsl(' + amount + ',100%,50%)';
            }
        }
    },
    prideBlocky: {
        name: "Pride Blocky",
        image: "colors/prideBlocky.png",
        func: function(amount, position){
            if(typeof position === "number"){
                var numOfCols = this.prideColors.length;
                var selCol = Math.floor(position / 255 * numOfCols);
                if(selCol < 0){ selCol = 0; }
                if(selCol > numOfCols - 1){ selCol = numOfCols; }
                return 'hsl(' + this.prideColors[selCol] + ',100%,50%)';
            }else{
                var numOfCols = this.prideColors.length;
                var selCol = Math.floor(amount/ 255 * numOfCols);
                if(selCol < 0){ selCol = 0; }
                if(selCol > numOfCols - 1){ selCol = numOfCols; }
                return 'hsl(' + this.prideColors[selCol] + ',100%,50%)';
            }
        },
        prideColors: [0, 33, 55, 110, 175, 235, 265]
    },
    'SEPARATOR_GLOWS" disabled="': {
        name: "---------------",
        func: function(){
            return '#000';
        }
    },
    whiteglow: {
        name: "White Glow",
        image: "colors/whiteGlow.png",
        func: function(amount){
            return 'rgba(255, 255, 255, ' + (amount / 255) + ')';
        }
    },
    redglow: {
        name: "Red Glow",
        image: "colors/redGlow.png",
        func: function(amount){
            return 'rgba(255,0,0,' + (amount / 255) + ')';
        }
    },
    greenglow: {
        name: "Green Glow",
        image: "colors/greenGlow.png",
        func: function(amount){
            return 'rgba(0,255,0,' + (amount / 255) + ')';
        }
    },
    blueglow: {
        name: "Blue Glow",
        image: "colors/blueGlow.png",
        func: function(amount){
            return 'rgba(0,0,255,' + (amount / 255) + ')';
        }
    },
    electricglow: {
        name: "Electric Glow",
        image: "colors/electricGlow.png",
        func: function(amount){
            return 'rgba(0,255,255,' + (amount / 255) + ')';
        }
    },
    indigoglow: {
        name: "Indigo Glow",
        image: "colors/indigoGlow.png",
        func: function(amount){
            return 'rgba(75, 0, 130, ' + (amount / 255) + ')';
        }
    },
    'SEPARATOR_SOLID_COLORS" disabled="': {
        name: "---------------",
        func: function(){
            return '#000';
        }
    },
    white: {
        name: "Solid White",
        image: "colors/solidWhite.png",
        func: function(amount){
            return '#FFF';
        }
    },
    red: {
        name: "Solid Red",
        image: "colors/solidRed.png",
        func: function(amount){
            return '#A00';
        }
    },
    green: {
        name: "Solid Green",
        image: "colors/solidGreen.png",
        func: function(amount){
            return '#0A0';
        }
    },
    blue: {
        name: "Solid Blue",
        image: "colors/solidBlue.png",
        func: function(amount){
            return '#00A';
        }
    },
    electric: {
        name: "Solid Electric",
        image: "colors/solidElectric.png",
        func: function(amount){
            return '#0FF';
        }
    },
    indigo: {
        name: "Solid Indigo",
        image: "colors/solidIndigo.png",
        func: function(amount){
            return '#4B0082';
        }
    }
}

var currColor = "bluegreenred";
function setColor(newcolor){
    //getColor = (colors[newcolor] || colors.bgr).func;
    if(colors[newcolor]){
        currColor = newcolor;
    }else{
        currColor = "redgreenblue";
    }
    progressBar.style.outline = "2px solid " + getColor(255);
}
function getColor(power, position){
    return colors[currColor].func(power, position);
}
progressBar.style.outline = "2px solid " + getColor(255);

function setVis(newvis){
    if(currVis){
        vis[currVis].stop();
    }
    if(vis[newvis]){
        currVis = newvis;
    }else{
        currVis = "none";
    }
    if(smokeEnabled){
        resizeSmoke();
    }
    vis[currVis].start();
}

var currVis = null;
var vis = {
    none: {
        name: "Song List",
        start: function(){
            getId("visualizer").classList.add("disabled");
            getId("songList").classList.remove("disabled");
            //analyser.disconnect(delayNode);
            //mediaSource.disconnect(analyser);
            //mediaSource.connect(delayNode);
        },
        frame: function(){
            
        },
        stop: function(){
            getId("visualizer").classList.remove("disabled");
            getId("songList").classList.add("disabled");
            //mediaSource.disconnect(delayNode);
            //mediaSource.connect(analyser);
            //analyser.connect(delayNode);
        }
    },
    'SEPARATOR_BARS" disabled="': {
        name: '---------------',
        start: function(){

        },
        frame: function(){

        },
        stop: function(){

        }
    },
    monstercat: {
        name: "Monstercat",
        image: "visualizers/monstercat.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var left = size[0] * 0.1;
            var maxWidth = size[0] * 0.8;
            var barWidth = maxWidth / 96;
            var barSpacing = maxWidth / 64;
            var maxHeight = size[1] * 0.5 - size[1] * 0.2;
            
            var monstercatGradient = canvas.createLinearGradient(0, Math.round(size[1] / 2) + 4, 0, size[1]);
            monstercatGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            monstercatGradient.addColorStop(0.1, 'rgba(0, 0, 0, 1)');
            canvas.fillStyle = monstercatGradient;
            canvas.fillRect(0, Math.round(size[1] / 2) + 4, size[0], Math.round(size[1] / 2) - 4);
            
            for(var i = 0; i < 64; i++){
                var strength = 0;
                for(var j = 0; j < 16; j++){
                    //strength = Math.max(visData[i * 16 + j], strength);
                    //strength += visData[i * 16 + j];
                    //strength += Math.pow(visData[i * 16 + j], 2) / 255;
                    strength += Math.sqrt(visData[i * 16 + j]) * this.sqrt255;
                }
                strength = Math.round(strength / 16);
                
                var fillColor = getColor(strength, i * 4);
                canvas.fillStyle = fillColor;
                canvas.fillRect(
                    Math.round(left + i * barSpacing),
                    Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight),
                    Math.round(barWidth),
                    Math.round(strength / 255 * maxHeight + 5)
                );
                canvas.fillStyle = "#000";
                canvas.fillRect(
                    Math.round(left + i * barSpacing),
                    Math.floor(size[1] / 2) + 4,
                    Math.round(barWidth),
                    Math.round(strength / 255 * maxHeight + 5)
                );
                if(smokeEnabled){
                    smoke.fillStyle = fillColor;
                    smoke.fillRect(
                        Math.round(left + i * barSpacing),
                        Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight),
                        Math.round(barWidth),
                        Math.round((strength / 255 * maxHeight + 5) * 2)
                    );
                }
            }
            //updateSmoke(left, size[1] * 0.2, maxWidth, size[1] * 0.3 + 10);
            canvas.fillStyle = '#FFF';
            canvas.font = (size[1] * 0.25) + 'px aosProFont, sans-serif';
            canvas.fillText((fileNames[currentSong] || ["Song Name"])[0].toUpperCase(), Math.round(left) + 0.5, size[1] * 0.75, Math.floor(maxWidth));
        },
        stop: function(){
            
        },
        sqrt255: Math.sqrt(255)
    },
    obelisks: {
        name: "Obelisks",
        image: "visualizers/obelisks.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var left = size[0] * 0.1;
            var maxWidth = size[0] * 0.8;
            var barWidth = maxWidth / 96;
            var barSpacing = maxWidth / 64;
            var maxHeight = size[1] * 0.5 - size[1] * 0.2;

            var monstercatGradient = canvas.createLinearGradient(0, Math.round(size[1] / 2) + 4, 0, size[1]);
            monstercatGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            monstercatGradient.addColorStop(0.1, 'rgba(0, 0, 0, 1)');
            canvas.fillStyle = monstercatGradient;
            canvas.fillRect(0, Math.round(size[1] / 2) + 4, size[0], Math.round(size[1] / 2) - 4);

            for(var i = 0; i < 64; i++){
                var strength = 0;
                for(var j = 0; j < 16; j++){
                    //strength = Math.max(visData[i * 16 + j], strength);
                    //strength += visData[i * 16 + j];
                    //strength += Math.pow(visData[i * 16 + j], 2) / 255;
                    strength += Math.sqrt(visData[i * 16 + j]) * this.sqrt255;
                }
                strength = Math.round(strength / 16);
                
                smoke.fillStyle = getColor(strength, i * 4);
                smoke.fillRect(
                    Math.round(left + i * barSpacing),
                    Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight),
                    Math.round(barWidth),
                    Math.round((strength / 255 * maxHeight + 5) * 2)
                );
                canvas.fillStyle = "rgba(0, 0, 0, 0.85)";
                canvas.fillRect(
                    Math.round(left + i * barSpacing),
                    Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight),
                    Math.round(barWidth),
                    Math.round((strength / 255 * maxHeight + 5) * 2)
                );
                canvas.fillStyle = "rgba(0, 0, 0, 0.5)";
                canvas.fillRect(
                    Math.round(left + i * barSpacing) + 1,
                    Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight) + 1,
                    Math.round(barWidth) - 2,
                    Math.round((strength / 255 * maxHeight + 5) * 2) - 2
                )
                canvas.fillStyle = "#000";
                canvas.fillRect(
                    Math.round(left + i * barSpacing) + 2,
                    Math.floor(size[1] / 2) - Math.round(strength / 255 * maxHeight) + 2,
                    Math.round(barWidth) - 4,
                    Math.round((strength / 255 * maxHeight + 5) * 2) - 4
                );
            }
            //updateSmoke(left, size[1] * 0.2, maxWidth, size[1] * 0.3 + 10);
            canvas.fillStyle = '#FFF';
            canvas.font = (size[1] * 0.25) + 'px aosProFont, sans-serif';
            canvas.fillText((fileNames[currentSong] || ["No Song"])[0].toUpperCase(), Math.round(left) + 0.5, size[1] * 0.75, Math.floor(maxWidth));
            if(!smokeEnabled){
                canvas.font = "12px aosProFont, Courier, monospace";
                canvas.fillText("Enable Smoke for this visualizer.", Math.round(left) + 0.5, size[1] * 0.25, Math.floor(maxWidth));
            }
        },
        stop: function(){
            
        },
        sqrt255: Math.sqrt(255)
    },
    curvedAudioVision: {
        name: "Curved Lines",
        image: "visualizers/curvedLines_av.png",
        start: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var xdist = size[0] / (this.lineCount + 2) / 2;
            var ydist = size[1] / (this.lineCount + 2) / 2;
            xdist = Math.min(xdist, ydist);
            var datastep = 1024 / this.lineCount;
            var colorstep = 255 / this.lineCount;
            var center = size[1] / 2;
            for(var i = 0; i < this.lineCount; i++){
                var pos = Math.floor((i + 1) * xdist);
                var enddata = (i + 1) * datastep;
                var strength = 0;
                var samples = 0;
                for(var j = Math.round(i * datastep); j < enddata; j++){
                    //if(visData[j] > 127){
                        strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength += Math.pow(visData[j] * 1.5, 2) / 255;
                        //strength = Math.max(strength, visData[j]);
                        samples++;
                    //}else{
                    //    strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength = Math.max(strength, visData[j]);
                    //    samples++;
                    //}
                }
                strength /= samples;
                //if(strength > 255){
                //    strength = 255;
                //}
                canvas.strokeStyle = getColor(strength, i * colorstep);
                smoke.strokeStyle = getColor(strength, i * colorstep);

                var circlePoints = [
                    {x: xdist * this.lineCount, y: 0},
                    {x: xdist * this.lineCount, y: 2 * xdist * this.lineCount},
                    {x: xdist * this.lineCount + (xdist * (i + 1)), y: xdist * this.lineCount}
                ]
                var currCircle = this.circleFromThreePoints(...circlePoints);
                var tri = [
                    Math.sqrt(
                        Math.pow(
                            circlePoints[2].x -
                            circlePoints[0].x
                        , 2) + 
                        Math.pow(
                            circlePoints[2].y - 
                            circlePoints[0].y
                        , 2)
                    ),
                    currCircle.r,
                    currCircle.r
                ];
                // (b2 + c2 − a2) / 2bc
                var angle = Math.acos(this.deg2rad((tri[1]*tri[1] + tri[2]*tri[2] - tri[0]*tri[0]) / (2 * tri[1] * tri[2])));
                canvas.beginPath();
                canvas.arc(
                    currCircle.x + (size[0] - xdist * this.lineCount * 2) / 2,
                    currCircle.y + (size[1] / 2 - xdist * this.lineCount),
                    currCircle.r,
                    ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61))) * -1) * (strength / 255),
                    ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61)))) * (strength / 255)
                );
                canvas.stroke();
                if(smokeEnabled){
                    smoke.beginPath();
                    smoke.arc(
                        currCircle.x + (size[0] - xdist * this.lineCount * 2) / 2,
                        currCircle.y + (size[1] / 2 - xdist * this.lineCount),
                        currCircle.r,
                        ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61))) * -1) * (strength / 255),
                        ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61)))) * (strength / 255)
                    );
                    smoke.stroke();
                }

                circlePoints[0].x *= -1;
                circlePoints[1].x *= -1;
                circlePoints[2].x *= -1;
                currCircle = this.circleFromThreePoints(...circlePoints);
                canvas.beginPath();
                canvas.arc(
                    currCircle.x + (size[0] / 2 + xdist * this.lineCount),
                    currCircle.y + (size[1] / 2 - xdist * this.lineCount),
                    currCircle.r,
                    ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61))) * -1) * (strength / 255) + this.deg2rad(180),
                    ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61)))) * (strength / 255) + this.deg2rad(180)
                );
                canvas.stroke();
                if(smokeEnabled){
                    smoke.beginPath();
                    smoke.arc(
                        currCircle.x + (size[0] / 2 + xdist * this.lineCount),
                        currCircle.y + (size[1] / 2 - xdist * this.lineCount),
                        currCircle.r,
                        ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61))) * -1) * (strength / 255) + this.deg2rad(180),
                        ((angle - this.deg2rad(Math.pow((this.lineCount - i - 1) * 1.83, 1.61)))) * (strength / 255) + this.deg2rad(180)
                    );
                    smoke.stroke();
                }
            }
        },
        stop: function(){
            canvas.lineCap = "square";
            canvas.lineWidth = 1;
            smoke.lineCap = "square";
            smoke.lineWidth = 1;
        },
        sizechange: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        lineWidth: 6,
        lineCount: 9,
        sqrt255: Math.sqrt(255),
        deg2rad: function(degrees){
            return degrees * this.piBy180;
        },
        piBy180: Math.PI / 180,
        circleFromThreePoints: function(p1, p2, p3) { // from Circle.js

            var x1 = p1.x;
            var y1 = p1.y;
            var x2 = p2.x;
            var y2 = p2.y;
            var x3 = p3.x;
            var y3 = p3.y;
            
            var a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
            
            var b = (x1 * x1 + y1 * y1) * (y3 - y2) 
                    + (x2 * x2 + y2 * y2) * (y1 - y3)
                    + (x3 * x3 + y3 * y3) * (y2 - y1);
            
            var c = (x1 * x1 + y1 * y1) * (x2 - x3) 
                    + (x2 * x2 + y2 * y2) * (x3 - x1) 
                    + (x3 * x3 + y3 * y3) * (x1 - x2);
            
            var x = -b / (2 * a);
            var y = -c / (2 * a);
            
            return {
                x: x,
                y: y,
                r: Math.hypot(x - x1, y - y1)
            };
        }
    },
    centeredAudioVision: {
        name: "Centered Lines",
        image: "visualizers/centeredLines_av.png",
        start: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var xdist = size[0] / (this.lineCount + 2);
            var datastep = 1024 / this.lineCount;
            var colorstep = 255 / this.lineCount;
            var center = size[1] / 2;
            for(var i = 0; i < this.lineCount; i++){
                var pos = Math.floor((i + 1) * xdist);
                var enddata = (i + 1) * datastep;
                var strength = 0;
                var samples = 0;
                for(var j = Math.round(i * datastep); j < enddata; j++){
                    //if(visData[j] > 127){
                        strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength += Math.pow(visData[j] * 1.5, 2) / 255;
                        //strength = Math.max(strength, visData[j]);
                        samples++;
                    //}else{
                    //    strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength = Math.max(strength, visData[j]);
                    //    samples++;
                    //}
                }
                strength /= samples;
                //if(strength > 255){
                //    strength = 255;
                //}
                canvas.strokeStyle = getColor(strength, i * colorstep);
                smoke.strokeStyle = getColor(strength, i * colorstep);
                
                canvas.beginPath();
                canvas.moveTo(pos, center - (center * (strength / 383)) - 1);
                canvas.lineTo(pos, center + (center * (strength / 383)) + 1);
                canvas.stroke();
                if(smokeEnabled){
                    smoke.beginPath();
                    smoke.moveTo(pos, center - (center * (strength / 383)) - 8);
                    smoke.lineTo(pos, center + (center * (strength / 383)) + 8);
                    smoke.stroke();
                }
            }
        },
        stop: function(){
            canvas.lineCap = "square";
            canvas.lineWidth = 1;
            smoke.lineCap = "square";
            smoke.lineWidth = 1;
        },
        sizechange: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        lineWidth: 6,
        lineCount: 18,
        sqrt255: Math.sqrt(255)
    },
    caveAudioVision: {
        name: "Cave Lines",
        image: "visualizers/caveLines_av.png",
        start: function(){
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var xdist = size[0] / (this.lineCount + 2);
            var datastep = 1024 / this.lineCount;
            var colorstep = 255 / this.lineCount;
            var caveCieling = Math.round(size[1] / 18);
            var center = size[1] / 2;
            for(var i = 0; i < this.lineCount; i++){
                var pos = Math.floor((i + 1) * xdist);
                var enddata = (i + 1) * datastep;
                var strength = 0;
                var samples = 0;
                for(var j = Math.round(i * datastep); j < enddata; j++){
                    //if(visData[j] > 127){
                        strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength += Math.pow(visData[j] * 1.5, 2) / 255;
                        //strength = Math.max(strength, visData[j]);
                        samples++;
                    //}else{
                    //    strength += Math.sqrt(visData[j]) * this.sqrt255;
                        //strength += Math.pow(visData[j], 2) / 255;
                        //strength += visData[j];
                        //strength = Math.max(strength, visData[j]);
                    //    samples++;
                    //}
                }
                strength /= samples;
                //if(strength > 255){
                //    strength = 255;
                //}
                canvas.strokeStyle = getColor(strength, i * colorstep);
                smoke.strokeStyle = getColor(strength, i * colorstep);
                
                canvas.beginPath();
                canvas.moveTo(pos, caveCieling);
                canvas.lineTo(pos, (center * (strength / 383)) + caveCieling + 4);
                canvas.moveTo(pos, size[1] - caveCieling);
                canvas.lineTo(pos, size[1] - (center * (strength / 383)) - caveCieling - 4);
                canvas.stroke();
                if(smokeEnabled){
                    smoke.beginPath();
                    smoke.moveTo(pos, 0);
                    smoke.lineTo(pos, (center * (strength / 383)) + caveCieling + 12);
                    smoke.moveTo(pos, size[1]);
                    smoke.lineTo(pos, size[1] - (center * (strength / 383)) - caveCieling - 12);
                    smoke.stroke();
                    canvas.fillStyle = "#000";
                    canvas.fillRect(0, 0, size[0], caveCieling);
                    canvas.fillRect(0, size[1] - caveCieling, size[0], size[1]);
                }
            }
        },
        stop: function(){
            canvas.lineWidth = 1;
            smoke.lineWidth = 1;
        },
        sizechange: function(){
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        lineWidth: 6,
        lineCount: 18,
        sqrt255: Math.sqrt(255)
    },
    spikes1to1: {
        name: "Spikes Classic",
        image: "visualizers/spikesClassic.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            canvas.fillStyle = "#000";
            canvas.fillRect(0, size[1] / 2 + 127, size[0], size[1] / 2 - 127);
            smoke.clearRect(0, 0, size[0], size[1]);
            var left = size[0] / 2 - 512;
            var top = size[1] / 2 - 128;
            for(var i = 0; i < 1024; i++){
                this.drawLine(i, visData[i], left, top);
            }
            //updateSmoke();
        },
        stop: function(){
            
        },
        drawLine: function(x, h, l, t){
            var fillColor = getColor(h, x / 4);
            canvas.fillStyle = fillColor;
            canvas.fillRect(l + x, t + (255 - h), 1, h);
            if(smokeEnabled){
                smoke.fillStyle = fillColor;
                smoke.fillRect(l + x, t + (255 - h), 1, h * 2);
            }
        }
    },
    spikes: {
        name: "Spikes Stretch",
        image: "visualizers/spikesStretch.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var step = size[0] / 1024;
            var last = -1;
            var heightFactor = size[1] / 255;
            var widthFactor = 255 / size[0];
            for(var i = 0; i < 1024; i++){
                var strength = 0;
                if(i === 0){
                    strength = visData[i];
                    this.drawLine(0, strength, heightFactor);
                }else{
                    var last = Math.floor(step * (i - 1));
                    var curr = Math.floor(step * i);
                    var next = Math.floor(step * (i + 1));
                    if(last < curr - 1){
                        // stretched
                        for(var j = 0; j < curr - last - 1; j++){
                            //strength = ((j + 1) / (curr - last + 1) * visData[i - 1] + (curr - last - j + 1) / (curr - last + 1) * visData[i]);
                            strength = (visData[i] + visData[i - 1]) / 2;
                            this.drawLine(curr - j - 1, strength, heightFactor, widthFactor);
                        }
                        strength = visData[i];
                        this.drawLine(curr, strength, heightFactor, widthFactor);
                    }else if(curr === last && next > curr){
                        // compressed
                        for(var j = 0; j < (1 / step); j++){
                            strength += visData[i - j];
                        }
                        strength /= Math.floor(1 / step) + 1;
                        this.drawLine(curr, strength, heightFactor, widthFactor);
                    }else if(last === curr - 1){
                        strength = visData[i];
                        this.drawLine(curr, strength, heightFactor, widthFactor);
                    }
                }
            }
            //updateSmoke();
        },
        stop: function(){
            
        },
        drawLine: function(x, h, fact, widthFact){
            var fillColor = getColor(h, x * widthFact);
            canvas.fillStyle = fillColor;
            canvas.fillRect(x, (255 - h)  * fact, 1, size[1] - (255 - h) * fact);
            if(smokeEnabled){
                smoke.fillStyle = fillColor;
                smoke.fillRect(x, (255 - h)  * fact, 1, size[1] - (255 - h) * fact);
            }
        }
    },
    spikesAccumulate: {
        name: "Spikes Accumulate",
        image: "visualizers/spikesAccumulate.png",
        start: function(){
            this.totals = new Array(1024).fill(0);
            this.max = 0;
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var left = size[0] / 2 - 512;
            var top = 0;
            for(var i = 0; i < 1024; i++){
                this.totals[i] += visData[i];
                if(this.totals[i] > this.max){
                    this.max = this.totals[i];
                }
                if(this.max / 255 > size[1]){
                    this.drawLine(i, this.totals[i] / this.max * size[1], left, top, visData[i]);
                }else{
                    this.drawLine(i, this.totals[i] / 255, left, top, visData[i]);
                }
            }
            //updateSmoke();
        },
        stop: function(){
            this.totals = [];
            this.max = 0;
        },
        drawLine: function(x, h, l, t, c){
            var fillColor = getColor(c, x / 4);
            canvas.fillStyle = fillColor;
            canvas.fillRect(l + x, t + (size[1] - h), 1, h);
            if(smokeEnabled){
                smoke.fillStyle = fillColor;
                smoke.fillRect(l + x, t + (size[1] - h), 1, h * 2);
            }
        },
        max: 0,
        totals: []
    },
    'SEPARATOR_CIRCLES" disabled="': {
        name: '---------------',
        start: function(){

        },
        frame: function(){

        },
        stop: function(){

        }
    },
    rings: {
        name: "Rings",
        image: "visualizers/rings.png",
        start: function(){
            this.ringPositions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.8);
            var ringWidth = Math.round(ringHeight * 0.023);
            canvas.lineWidth = ringWidth;
            canvas.lineCap = "round";
            smoke.lineWidth = ringWidth;
            smoke.lineCap = "round";
            var ringPools = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            //var ringAvgs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 1024; i++){
                var currPool = Math.floor(i / 102.4);
                ringPools[currPool] = Math.max(visData[i], ringPools[currPool]);
                //ringPools[currPool] += visData[i];
                //ringAvgs[currPool]++;
            }
            //for(var i in ringPools){
            //    ringPools[i] /= ringAvgs[i];
            //}
            for(var i = 0; i < 10; i++){
                var strength = Math.pow(ringPools[i], 2) / 65025;
                var ringColor = getColor(strength * 255, (9 - i) * 28);
                this.ringPositions[i] += strength * 5;
                if(this.ringPositions[i] >= 360){
                    this.ringPositions[i] -= 360;
                }
                canvas.strokeStyle = ringColor;
                smoke.strokeStyle = ringColor;
                this.degArc(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);
                if(smokeEnabled){
                    this.degArcSmoke(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);
                }
            }
            //updateSmoke(size[0] / 2 - ringHeight / 2, size[1] / 2 - ringHeight / 2, ringHeight, ringHeight);
        },
        stop: function(){
            canvas.lineWidth = 1;
            canvas.lineCap = "butt";
            smoke.lineWidth = "1";
            smoke.lineCap = "butt";
        },
        ringPositions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        TAU: Math.PI * 2,
        degArc: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.stroke();
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.stroke();
        }
    },
    ghostRings: {
        name: "Ghost Rings",
        image: "visualizers/ghostRings.png",
        start: function(){
            this.ringPositions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.8);
            var ringWidth = Math.round(ringHeight * 0.023);
            canvas.lineCap = "round";
            smoke.lineWidth = ringWidth;
            smoke.lineCap = "round";
            var ringPools = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            //var ringAvgs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 1024; i++){
                var currPool = Math.floor(i / 102.4);
                ringPools[currPool] = Math.max(visData[i], ringPools[currPool]);
                //ringPools[currPool] += visData[i];
                //ringAvgs[currPool]++;
            }
            //for(var i in ringPools){
            //    ringPools[i] /= ringAvgs[i];
            //}
            for(var i = 0; i < 10; i++){
                var strength = Math.pow(ringPools[i], 2) / 65025;
                var ringColor = getColor(strength * 255, (9 - i) * 28);
                this.ringPositions[i] += strength * 5;
                if(this.ringPositions[i] >= 360){
                    this.ringPositions[i] -= 360;
                }

                smoke.strokeStyle = ringColor;
                this.degArcSmoke(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);
                /*
                canvas.lineWidth = ringWidth;
                canvas.strokeStyle = 'rgba(0, 0, 0, 0.85)';
                this.degArc(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);
                canvas.lineWidth = ringWidth - 4;
                canvas.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                this.degArc(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);
                canvas.lineWidth = ringWidth - 8;
                canvas.strokeStyle = '#000';
                this.degArc(center[0], center[1], ringWidth * 2 * (i + 1), this.ringPositions[i], this.ringPositions[i] + 180);*/
            }
            if(!smokeEnabled){
                canvas.fillStyle = '#FFF';
                canvas.font = '12px aosProFont, Courier, monospace';
                canvas.fillText("Enable Smoke for this visualizer.", center[0] - ringHeight / 2 + 0.5, center[1] - 6, ringHeight);
            }
            //updateSmoke(size[0] / 2 - ringHeight / 2, size[1] / 2 - ringHeight / 2, ringHeight, ringHeight);
        },
        stop: function(){
            canvas.lineWidth = 1;
            canvas.lineCap = "butt";
            smoke.lineWidth = "1";
            smoke.lineCap = "butt";
        },
        ringPositions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        TAU: Math.PI * 2,
        degArc: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.stroke();
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.stroke();
        }
    },
    circleLines: {
        name: "Circle Lines",
        image: "visualizers/circleLines.png",
        start: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.6);
            var ringMaxRadius = ringHeight * 0.5;
            var ringMinRadius = ringHeight * 0.25;
            var ringMaxExpand = Math.round(Math.min(size[0], size[1]) * 0.2);
            var drumStrength = 0;
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 180; i++){
                drumStrength += Math.pow(visData[i], 2) / 255;
            }
            drumStrength /= 180;

            var randomOffset = [0, 0];

            var lineDist = 360 / this.lineCount;
            var colorDist = 255 / this.lineCount;
            var dataDist = Math.round(1024 / this.lineCount);
            for(var i = 0; i < this.lineCount; i++){
                var strength = 0;
                var dataStop = (i + 1) * dataDist;
                var samples = 0;
                for(var j = i * dataDist; j < dataStop; j++){
                    strength += Math.sqrt(visData[j]) * this.sqrt255;
                    samples++;
                }
                strength /= samples;
                
                var firstPoint = this.findNewPoint(
                    size[0] / 2,
                    size[1] / 2,
                    i * lineDist + 90,
                    ringMinRadius + drumStrength / 255 * ringMaxExpand - 5
                );
                var secondPoint = this.findNewPoint(
                    size[0] / 2,
                    size[1] / 2,
                    i * lineDist + 90,
                    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand
                )
                canvas.strokeStyle = getColor(strength, i * colorDist);
                canvas.beginPath();
                canvas.moveTo(firstPoint.x, firstPoint.y);
                canvas.lineTo(secondPoint.x, secondPoint.y);
                canvas.stroke();
                if(smokeEnabled){
                    smoke.strokeStyle = getColor(strength, i * colorDist);
                    smoke.beginPath();
                    smoke.moveTo(firstPoint.x, firstPoint.y);
                    smoke.lineTo(secondPoint.x, secondPoint.y);
                    smoke.stroke();
                }
            }

            
            canvas.fillStyle = '#212121';
            this.degArc2(
                size[0] / 2 + randomOffset[0],
                size[1] / 2 + randomOffset[1],
                ringMinRadius * 0.7 + drumStrength / 255 * ringMaxExpand - 5,
                0,
                360
            );
        },
        stop: function(){
            canvas.lineCap = "butt";
            canvas.lineWidth = 1;
            smoke.lineCap = "butt";
            smoke.lineWidth = 1;
        },
        sizechange: function(){
            canvas.lineCap = "round";
            canvas.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
            smoke.lineCap = "round";
            smoke.lineWidth = this.lineWidth - (performanceMode * 0.5 * this.lineWidth);
        },
        lineCount: 36,
        lineWidth: 6,
        TAU: Math.PI * 2,
        sqrt255: Math.sqrt(255),
        degArc2: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        findNewPoint: function(x, y, angle, distance) { // from codershop on Stack Overflow
            var result = {};
        
            result.x = /*Math.round*/(Math.cos(angle * Math.PI / 180) * distance + x);
            result.y = /*Math.round*/(Math.sin(angle * Math.PI / 180) * distance + y);
        
            return result;
        }
    },
    circle: {
        name: "Treble Circle",
        image: "visualizers/trebleCircle.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.6);
            var ringMaxRadius = ringHeight * 0.5;
            var ringMinRadius = ringHeight * 0.25;
            var ringMaxExpand = Math.round(Math.min(size[0], size[1]) * 0.2);
            var randomShake = Math.round(Math.min(size[0], size[1]) * 0.03);
            var drumStrength = 0; // drums is all under line 150... lmao i didnt even measure that it's just a total guess
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 180; i++){
                drumStrength += Math.pow(visData[i], 2) / 255;
            }
            drumStrength /= 180;

            var randomOffset = [(Math.random() - 0.5) * drumStrength / 255 * randomShake, (Math.random() - 0.5) * drumStrength / 255 * randomShake];

            for(var i = 0; i < 844; i += 4){
                var strength = (visData[i + 180] + visData[i + 181] + visData[i + 182] + visData[i + 183]) / 4;
                canvas.fillStyle = getColor(strength, i * 0.3);
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    i / 844 * 180 + 90,
                    (i + 4.1) / 844 * 180 + 90
                );
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    90 - (i + 4.1) / 844 * 180,
                    90 - i / 844 * 180
                );
                if(smokeEnabled){
                    smoke.fillStyle = getColor(strength, i * 0.3);
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        i / 844 * 180 + 90,
                        (i + 3.1) / 844 * 180 + 90
                    );
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        90 - (i + 4.1) / 844 * 180,
                        90 - i / 844 * 180
                    );
                }
            }

            canvas.fillStyle = '#000';
            this.degArc2(
                size[0] / 2 + randomOffset[0],
                size[1] / 2 + randomOffset[1],
                ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                0,
                360
            );
            if(smokeEnabled){
                smoke.fillStyle = '#000';
                this.degArc2smoke(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                    0,
                    360
                );
            }
            //updateSmoke(size[0] / 2 - ringHeight / 2, size[1] / 2 - ringHeight / 2, ringHeight, ringHeight);
        },
        stop: function(){

        },
        TAU: Math.PI * 2,
        degArc: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.moveTo(size[0] / 2, size[1] / 2);
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        degArc2: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.moveTo(size[0] / 2, size[1] / 2);
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.fill();
        },
        degArc2smoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.fill();
        },
    },
    bassCircle: {
        name: "Bass Circle",
        image: "visualizers/bassCircle.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.6);
            var ringMaxRadius = ringHeight * 0.5;
            var ringMinRadius = ringHeight * 0.25;
            var ringMaxExpand = Math.round(Math.min(size[0], size[1]) * 0.2);
            var randomShake = Math.round(Math.min(size[0], size[1]) * 0.03);
            var drumStrength = 0; // drums is all under line 150... lmao i didnt even measure that it's just a total guess
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 180; i++){
                drumStrength += Math.pow(visData[i], 2) / 255;
            }
            drumStrength /= 180;

            var randomOffset = [(Math.random() - 0.5) * drumStrength / 255 * randomShake, (Math.random() - 0.5) * drumStrength / 255 * randomShake];

            for(var i = 0; i < 180; i++){
                canvas.fillStyle = getColor(visData[i], i * 1.4);
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    i + 90,
                    (i + 1.1) + 90
                );
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    90 - (i + 1.1),
                    90 - i
                );
                if(smokeEnabled){
                    smoke.fillStyle = getColor(visData[i], i * 1.4);
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        i + 90,
                        (i + 1.1) + 90
                    );
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        90 - (i + 1.1),
                        90 - i
                    );
                }
            }

            canvas.fillStyle = '#000';
            this.degArc2(
                size[0] / 2 + randomOffset[0],
                size[1] / 2 + randomOffset[1],
                ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                0,
                360
            );
            if(smokeEnabled){
                smoke.fillStyle = '#000';
                this.degArc2smoke(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                    0,
                    360
                );
            }
            //updateSmoke(size[0] / 2 - ringHeight / 2, size[1] / 2 - ringHeight / 2, ringHeight, ringHeight);
        },
        stop: function(){

        },
        TAU: Math.PI * 2,
        degArc: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.moveTo(size[0] / 2, size[1] / 2);
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        degArc2: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.moveTo(size[0] / 2, size[1] / 2);
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.fill();
        },
        degArc2smoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.fill();
        },
    },
    layerCircle: {
        name: "Layered Circle",
        image: "visualizers/layeredCircle.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
            }
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.6);
            var ringMaxRadius = ringHeight * 0.5;
            var ringMinRadius = ringHeight * 0.25;
            var ringMaxExpand = Math.round(Math.min(size[0], size[1]) * 0.2);
            var randomShake = Math.round(Math.min(size[0], size[1]) * 0.03);
            var drumStrength = 0; // drums is all under line 150... lmao i didnt even measure that it's just a total guess
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 0; i < 180; i++){
                drumStrength += Math.pow(visData[i], 2) / 255;
            }
            drumStrength /= 180;

            var randomOffset = [(Math.random() - 0.5) * drumStrength / 255 * randomShake, (Math.random() - 0.5) * drumStrength / 255 * randomShake];

            canvas.fillStyle = getColor(127);
            canvas.beginPath();
            canvas.moveTo(size[0] / 2, size[1] / 2);

            if(smokeEnabled){
                smoke.fillStyle = getColor(127);
                smoke.beginPath();
                smoke.moveTo(size[0] / 2, size[1] / 2);
            }

            for(var i = -180; i < 181; i++){
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + visData[Math.abs(i)] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    i + 90,
                    i + 90,
                    //(i + 1.1) + 90
                );
                //this.degArc(
                //    size[0] / 2 + randomOffset[0],
                //    size[1] / 2 + randomOffset[1],
                //    ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                //    //90 - (i + 1.1),
                //    90 - i,
                //    90 - i
                //);
                if(smokeEnabled){
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + visData[Math.abs(i)] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        i + 90,
                        i + 90,
                        //(i + 1.1) + 90
                    );
                    //this.degArcSmoke(
                    //    size[0] / 2 + randomOffset[0],
                    //    size[1] / 2 + randomOffset[1],
                    //    ringMinRadius + visData[i] / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    //    //90 - (i + 1.1),
                    //    90 - i,
                    //    90 - i
                    //);
                }
            }

            canvas.fill();
            if(smokeEnabled){
                smoke.fill();
            }

            canvas.fillStyle = getColor(255);
            canvas.beginPath();
            canvas.moveTo(size[0] / 2, size[1] / 2);

            if(smokeEnabled){
                smoke.fillStyle = getColor(255);
                smoke.beginPath();
                smoke.moveTo(size[0] / 2, size[1] / 2);
            }

            for(var i = -844; i < 845; i += 4){
                var strength = (visData[Math.abs(i) + 180] + visData[Math.abs(i) + 181] + visData[Math.abs(i) + 182] + visData[Math.abs(i) + 183]) / 4;
                
                this.degArc(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    i / 844 * 180 + 90,
                    i / 844 * 180 + 90,
                    //(i + 4.1) / 844 * 180 + 90
                );
                //this.degArc(
                //    size[0] / 2 + randomOffset[0],
                //    size[1] / 2 + randomOffset[1],
                //    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                //    90 - (i + 4.1) / 844 * 180,
                //    90 - i / 844 * 180
                //);
                if(smokeEnabled){
                    this.degArcSmoke(
                        size[0] / 2 + randomOffset[0],
                        size[1] / 2 + randomOffset[1],
                        ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                        i / 844 * 180 + 90,
                        i / 844 * 180 + 90,
                        //(i + 3.1) / 844 * 180 + 90
                    );
                    //this.degArcSmoke(
                    //    size[0] / 2 + randomOffset[0],
                    //    size[1] / 2 + randomOffset[1],
                    //    ringMinRadius + strength / 255 * ringMinRadius + drumStrength / 255 * ringMaxExpand,
                    //    90 - (i + 4.1) / 844 * 180,
                    //    90 - i / 844 * 180
                    //);
                }
            }

            canvas.fill();
            if(smokeEnabled){
                smoke.fill();
            }

            canvas.fillStyle = '#000';
            this.degArc2(
                size[0] / 2 + randomOffset[0],
                size[1] / 2 + randomOffset[1],
                ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                0,
                360
            );
            if(smokeEnabled){
                smoke.fillStyle = '#000';
                this.degArc2smoke(
                    size[0] / 2 + randomOffset[0],
                    size[1] / 2 + randomOffset[1],
                    ringMinRadius + drumStrength / 255 * ringMaxExpand - 5,
                    0,
                    360
                );
            }
            //updateSmoke(size[0] / 2 - ringHeight / 2, size[1] / 2 - ringHeight / 2, ringHeight, ringHeight);
        },
        stop: function(){

        },
        TAU: Math.PI * 2,
        degArc: function(x, y, r, a, b){
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
        },
        degArc2: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            canvas.fill();
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
        },
        degArc2smoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
            smoke.fill();
        },
    },
    eclipse: {
        name: "Eclipse",
        image: "visualizers/eclipse.png",
        start: function(){
            
        },
        frame: function(){
            smoke.clearRect(0, 0, size[0], size[1]);
            var ringHeight = Math.round(Math.min(size[0], size[1]) * 0.8);
            var ringWidth = ringHeight * 0.5;
            var strokeWidth = ringWidth * 0.4;
            var strokePosition = ringWidth * 0.8;
            smoke.lineWidth = strokeWidth;
            var center = [Math.round(size[0] / 2), Math.round(size[1] / 2)];
            for(var i = 510; i > -1; i -= 2){
                var strength = Math.pow(Math.max(visData[i], visData[i + 1]), 2) / 255;
                smoke.strokeStyle = getColor(strength);
                var linePosition = (i * 0.5) * this.ratio_360_1024;
                this.degArcSmoke(center[0], center[1], strokePosition, linePosition + 90, linePosition + 91);
                smoke.stroke();
                linePosition *= -1;
                this.degArcSmoke(center[0], center[1], strokePosition, linePosition + 90, linePosition + 91);
                smoke.stroke();
            }
            for(var i = 512; i < 1024; i += 2){
                var strength = Math.pow(Math.max(visData[i], visData[i + 1]), 2) / 255;
                smoke.strokeStyle = getColor(strength);
                var linePosition = (i * 0.5) * this.ratio_360_1024;
                this.degArcSmoke(center[0], center[1], strokePosition, linePosition + 90, linePosition + 91);
                smoke.stroke();
                linePosition *= -1;
                this.degArcSmoke(center[0], center[1], strokePosition, linePosition + 90, linePosition + 91);
                smoke.stroke();
            }
            //updateSmoke(center[0] - ringWidth - 1, center[1] - ringWidth - 1, ringHeight + 1, ringHeight + 1);
            //smoke.putImageData(smoke.getImageData(center[0], center[1] - ringWidth - 1, -1 * ringWidth - 1, ringHeight), center[0], center[1] - ringWidth - 1);
            var ringGradient = canvas.createRadialGradient(center[0], center[1], (ringWidth) * 0.8, center[0], center[1], ringWidth);
            ringGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            ringGradient.addColorStop(0.95, 'rgba(0, 0, 0, 0.9)');
            ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            canvas.clearRect(0, 0, size[0], size[1]);
            canvas.fillStyle = ringGradient;
            this.degArc(center[0], center[1], ringWidth, 0, 360);
            canvas.fill();
            if(!smokeEnabled){
                canvas.fillStyle = "#FFF";
                canvas.font = "12px aosProFont, Courier, monospace";
                canvas.fillText("Enable Smoke for this visualizer.", center[0] - ringWidth + 15.5, center[1] - 6, ringWidth - 30);
            }
        },
        stop: function(){
            smoke.lineWidth = 1;
        },
        TAU: Math.PI * 2,
        sqrt255: Math.sqrt(255),
        degArc: function(x, y, r, a, b){
            canvas.beginPath();
            canvas.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
        },
        degArcSmoke: function(x, y, r, a, b){
            smoke.beginPath();
            smoke.arc(x, y, r, (a / 360) * this.TAU, (b / 360) * this.TAU);
        },
        ratio_360_1024: 360 / 1024
    },
    'SEPARATOR_FULL_SCREEN" disabled="': {
        name: '---------------',
        start: function(){

        },
        frame: function(){

        },
        stop: function(){

        }
    },
    spectrum: {
        name: "Spectrum",
        image: "visualizers/spectrum.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var step = size[0] / 1024;
            var last = -1;
            for(var i = 0; i < 1024; i++){
                var strength = 0;
                if(i === 0){
                    strength = visData[i];
                    this.drawLine(0, strength);
                }else{
                    var last = Math.floor(step * (i - 1));
                    var curr = Math.floor(step * i);
                    var next = Math.floor(step * (i + 1));
                    if(last < curr - 1){
                        // stretched
                        for(var j = 0; j < curr - last - 1; j++){
                            //strength = ((j + 1) / (curr - last + 1) * visData[i - 1] + (curr - last - j + 1) / (curr - last + 1) * visData[i]);
                            strength = (visData[i] + visData[i - 1]) / 2;
                            this.drawLine(curr - 1, strength);
                        }
                        strength = visData[i];
                        this.drawLine(curr, strength);
                    }else if(curr === last && next > curr){
                        // compressed
                        for(var j = 0; j < (1 / step); j++){
                            strength += visData[i - j];
                        }
                        strength /= Math.floor(1 / step) + 1;
                        this.drawLine(curr, strength);
                    }else if(last === curr - 1){
                        strength = visData[i];
                        this.drawLine(curr, strength);
                    }
                }
            }
        },
        stop: function(){
            
        },
        drawLine: function(x, colorAmount){
            if(smokeEnabled){
                smoke.fillStyle = getColor(colorAmount);
                smoke.fillRect(x, 0, 1, size[1]);
            }else{
                canvas.fillStyle = getColor(colorAmount);
                canvas.fillRect(x, 0, 1, size[1]);
            }
        }
    },
    solidColor: {
        name: "Solid Color",
        image: "visualizers/solidColor.png",
        start: function(){
            
        },
        frame: function(){
            var avg = 0;
            var avgtotal = 0;
            for(var i = 0; i < 1024; i++){
                avg += Math.sqrt(visData[i]) * this.sqrt255;
            }
            avg /= 1024;
            //avg /= 1024;
            //avg *= 255;
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
                smoke.fillStyle = getColor(avg);
                smoke.fillRect(0, 0, size[0], size[1]);
            }else{
                canvas.fillStyle = getColor(avg);
                canvas.fillRect(0, 0, size[0], size[1]);
            }
        },
        stop: function(){
            
        },
        sqrt255: Math.sqrt(255)
    },
    bassSolidColor: {
        name: "Bass Solid Color",
        image: "visualizers/bassSolidColor.png",
        start: function(){
            
        },
        frame: function(){
            var avg = 0;
            var avgtotal = 0;
            for(var i = 0; i < 180; i++){
                avg += Math.sqrt(visData[i]) * this.sqrt255;
            }
            avg /= 180;
            //avg /= 1024;
            //avg *= 255;
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
                smoke.fillStyle = getColor(avg);
                smoke.fillRect(0, 0, size[0], size[1]);
            }else{
                canvas.fillStyle = getColor(avg);
                canvas.fillRect(0, 0, size[0], size[1]);
            }
        },
        stop: function(){
            
        },
        sqrt255: Math.sqrt(255)
    },
    windowRecolor: {
        name: "Window Color",
        image: "visualizers/windowColor.png",
        start: function(){
            
        },
        frame: function(){
            var avg = 0;
            var avgtotal = 0;
            for(var i = 0; i < 1024; i++){
                avg += Math.sqrt(visData[i]) * this.sqrt255;
            }
            avg /= 1024;
            //avg /= 1024;
            //avg *= 255;
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
                smoke.fillStyle = getColor(avg);
                smoke.fillRect(0, 0, size[0], size[1]);
            }else{
                canvas.fillStyle = getColor(avg);
                canvas.fillRect(0, 0, size[0], size[1]);
            }
            canvas.fillStyle = "#FFF";
            canvas.font = "12px aosProFont, Courier, monospace";
            canvas.fillText("Load this visualizer in AaronOS and your window borders will color themselves to the beat.", 10.5, 20);
            document.title = "WindowRecolor:" + getColor(avg);
        },
        stop: function(){
            document.title = "AaronOS Music Player";
        },
        sqrt255: Math.sqrt(255)
    },
    bassWindowRecolor: {
        name: "Bass Window Color",
        image: "visualizers/bassWindowColor.png",
        start: function(){
            
        },
        frame: function(){
            var avg = 0;
            var avgtotal = 0;
            for(var i = 0; i < 180; i++){
                avg += Math.sqrt(visData[i]) * this.sqrt255;
            }
            avg /= 180;
            //avg /= 1024;
            //avg *= 255;
            canvas.clearRect(0, 0, size[0], size[1]);
            if(smokeEnabled){
                smoke.clearRect(0, 0, size[0], size[1]);
                smoke.fillStyle = getColor(avg);
                smoke.fillRect(0, 0, size[0], size[1]);
            }else{
                canvas.fillStyle = getColor(avg);
                canvas.fillRect(0, 0, size[0], size[1]);
            }
            canvas.fillStyle = "#FFF";
            canvas.font = "12px aosProFont, Courier, monospace";
            canvas.fillText("Load this visualizer in AaronOS and your window borders will color themselves to the beat.", 10.5, 20);
            document.title = "WindowRecolor:" + getColor(avg);
        },
        stop: function(){
            document.title = "AaronOS Music Player";
        },
        sqrt255: Math.sqrt(255)
    },
    'SEPARATOR_PITCH" disabled="': {
        name: '---------------',
        start: function(){

        },
        frame: function(){

        },
        stop: function(){

        }
    },
    spectrogramClassic: {
        name: "Spectrogram Classic",
        image: "visualizers/spectrogramClassic.png",
        start: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
        },
        frame: function(){
            var left = size[0] / 2 - 512;
            canvas.putImageData(canvas.getImageData(left, 0, left + 1024, size[1]), left, -1);
            var strength = 0;
            for(var i = 0; i < 1024; i++){
                strength = visData[i];
                canvas.fillStyle = getColor(strength);
                canvas.fillRect(left + i, size[1] - 1, 1, 1);
            }
        },
        sizechange: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
        },
        stop: function(){
            
        }
    },
    spectrogram: {
        name: "Spectrogram Stretch",
        image: "visualizers/spectrogramStretch.png",
        start: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
        },
        frame: function(){
            canvas.putImageData(canvas.getImageData(0, 0, size[0], size[1]), 0, -1);
            var step = size[0] / 1024;
            var last = -1;
            var heightFactor = size[1] / 255;
            for(var i = 0; i < 1024; i++){
                var strength = 0;
                if(i === 0){
                    strength = visData[i];
                    canvas.fillStyle = getColor(strength);
                    canvas.fillRect(0, size[1] - 1, 1, 1);
                }else{
                    var last = Math.floor(step * (i - 1));
                    var curr = Math.floor(step * i);
                    var next = Math.floor(step * (i + 1));
                    if(last < curr - 1){
                        // stretched
                        for(var j = 0; j < curr - last - 1; j++){
                            //strength = ((j + 1) / (curr - last + 1) * visData[i - 1] + (curr - last - j + 1) / (curr - last + 1) * visData[i]);
                            strength = (visData[i] + visData[i - 1]) / 2;
                            canvas.fillStyle = getColor(strength);
                            canvas.fillRect(curr - j - 1, size[1] - 1, 1, 1);
                        }
                        strength = visData[i];
                        canvas.fillStyle = getColor(strength);
                        canvas.fillRect(curr, size[1] - 1, 1, 1);
                    }else if(curr === last && next > curr){
                        // compressed
                        for(var j = 0; j < (1 / step); j++){
                            strength += visData[i - j];
                        }
                        strength /= Math.floor(1 / step) + 1;
                        canvas.fillStyle = getColor(strength);
                        canvas.fillRect(curr, size[1] - 1, 1, 1);
                    }else if(last === curr - 1){
                        strength = visData[i];
                        canvas.fillStyle = getColor(strength);
                        canvas.fillRect(curr, size[1] - 1, 1, 1);
                    }
                }
            }
        },
        sizechange: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
        },
        stop: function(){
            
        }
    },
    avgPitch: {
        name: "Average Pitch",
        image: "visualizers/averagePitch.png",
        start: function(){

        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var mult = size[0] / 1024;
            //var roundMult = Math.round(mult);
            //var halfMult = Math.round(mult / 2);
            for(var i = 1; i < 10; i++){
                if(this.history[i].length === 0){
                    continue;
                }
                canvas.globalAlpha = Math.sqrt(i - 1) * 3.16227766 / 10;
                canvas.fillStyle = getColor(this.history[i][1], this.history[i][2] / 4);
                canvas.fillRect(this.history[i - 1][0], 0, this.history[i][0] - this.history[i - 1][0], size[1]);
                if(smokeEnabled){
                    smoke.globalAlpha = Math.sqrt(i - 1) * 3.16227766 / 10;
                    smoke.fillStyle = getColor(this.history[i][1], this.history[i][2] / 4);
                    smoke.fillRect(this.history[i - 1][0], 0, this.history[i][0] - this.history[i - 1][0], size[1]);
                }
            }
            var avgPitch = 0;
            var avgPitchMult = 0;
            var avgVolume = 0;
            for(var i = 0; i < 1024; i++){
                avgVolume += Math.sqrt(visData[i]) * this.sqrt255;
                //avgVolume += visData[i];
                avgPitch += i * visData[i];
                avgPitchMult += visData[i];
            }
            avgVolume /= 1024;
            avgPitch /= avgPitchMult;
            canvas.globalAlpha = 1;
            canvas.fillStyle = getColor(avgVolume, avgPitch / 4);
            canvas.fillRect(this.history[9][0], 0, Math.round(avgPitch * mult) - this.history[9][0], size[1]);
            if(smokeEnabled){
                smoke.globalAlpha = 1;
                smoke.fillStyle = getColor(avgVolume, avgPitch / 4);
                smoke.fillRect(this.history[9][0], 0, Math.round(avgPitch * mult) - this.history[9][0], size[1]);
            }
            this.history.shift();
            this.history[9] = [Math.round(avgPitch * mult), avgVolume, avgPitch];
        },
        stop: function(){
            this.history = [
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                []
            ];
        },
        history: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        sqrt255: Math.sqrt(255)
    },
    'SEPARATOR_TESTS" disabled="': {
        name: '---------------',
        start: function(){

        },
        frame: function(){

        },
        stop: function(){

        }
    },
    piano: {
        name: "Piano Test",
        image: "visualizers/pianoTest.png",
        start: function(){
            /*

            1014 = 739.989 = F5#

            957 = 698.456 = F5
            
            ----
            
            47 = 138.591 = C3#
            
            45 = 130.813 = C3
            
            ----
            
            lowest note line = 45
            
            highest note line = 1014
            
            0.0629514964 notes per line on average
            
            57 lines per note @ high
            
            2 lines per note @ low
            
            ----
            
            61 keys in total
            
            1014-45 = 969 screen lines

            left edge = 40

            45 47 50 53 56 59 63 67 71 75 80 84 89 95 100 106 112 119 126 134 142 150 159 169 179 189 200 212 225 238 253 268 284 301 320 339 359 379 402 426 452 478 507 537 569 603 638 676 717 759 808 855 907 960 1018 1078 1142 1210 1282 1358 1439
            
            */
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            smoke.clearRect(0, 0, size[0], size[1]);
            var finalKey = this.keys.length - 1;
            var pianoWidth = finalKey * 20 + finalKey + 22;
            var pianoLeft = size[0] / 2 - Math.floor(pianoWidth / 2);
            var pianoTop = size[1] / 2 - 201;
            canvas.fillStyle = "#7F7F7F";
            canvas.fillRect(pianoLeft, pianoTop, pianoWidth, 402);
            for(var i = 0; i <= finalKey; i++){
                if(i === 0){
                    var leftCount = Math.floor(this.keys[i] - (this.keys[i + 1] - this.keys[i]) * 0.25);
                    var rightCount = Math.round(this.keys[i] + (this.keys[i + 1] - this.keys[i]) * 0.25);
                }else if(i === finalKey){
                    var leftCount = Math.floor(this.keys[i] - (this.keys[i] - this.keys[i - 1]) * 0.25);
                    var rightCount = Math.round(this.keys[i] + (this.keys[i] - this.keys[i - 1]) * 0.25);
                }else{
                    var leftCount = Math.floor(this.keys[i] - (this.keys[i] - this.keys[i - 1]) * 0.25);
                    var rightCount = Math.round(this.keys[i] + (this.keys[i + 1] - this.keys[i]) * 0.25);
                }
                var strength = 0;
                for(var j = leftCount; j < rightCount; j++){
                    //strength += Math.sqrt(visData[j]) * this.sqrt255;
                    //strength += Math.pow(visData[j], 2) / 255;
                    strength += visData[j];
                    //strength = Math.max(strength, visData[j]);
                }
                strength /= rightCount - leftCount;
                if(this.blackKeys[i]){
                    canvas.fillStyle = "#000";
                    canvas.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 200);
                    canvas.fillStyle = getColor(strength);
                    canvas.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 200);
                    if(smokeEnabled){
                        smoke.fillStyle = getColor(strength);
                        smoke.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 200);
                    }
                }else{
                    canvas.fillStyle = "#FFF";
                    canvas.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 400);
                    canvas.fillStyle = getColor(strength);
                    canvas.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 400);
                    if(smokeEnabled){
                        smoke.fillStyle = getColor(strength);
                        smoke.fillRect(pianoLeft + i * 20 + i + 1, pianoTop + 1, 20, 400);
                    }
                }
            }
        },
        stop: function(){

        },
        sqrt255: Math.sqrt(255),
        keys: [
            45, 47, 50, 53, 56, 59, 63, 67, 71, 75, 80, 84, 89, 95,
            100, 106, 112, 119, 126, 134, 142, 150, 159, 169, 179, 189,
            200, 212, 225, 238, 253, 268, 284, 301, 320, 339, 359, 379,
            402, 426, 452, 478, 507, 537, 569, 603, 638, 676, 717, 759,
            808, 855, 907, 960, 1018, 1078, 1142, 1210, 1282, 1358, 1439
        ],
        blackKeys: [
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0
        ]
    },
    bassSplit: {
        name: "Bass Split (&lt;180)",
        image: "visualizers/bassSplit.png",
        start: function(){
            
        },
        frame: function(){
            canvas.clearRect(0, 0, size[0], size[1]);
            canvas.fillStyle = "#000";
            canvas.fillRect(0, size[1] / 2 + 127, size[0], size[1] / 2 - 127);
            smoke.clearRect(0, 0, size[0], size[1]);
            var left = size[0] / 2 - 512;
            var top = size[1] / 2 - 128;
            for(var i = 0; i < 1024; i++){
                this.drawLine(i, visData[i], left + (i >= 180) * 90 - (i < 180) * 90, top);
            }
            //updateSmoke();
        },
        stop: function(){
            
        },
        drawLine: function(x, h, l, t){
            var fillColor = getColor(h, x / 4);
            canvas.fillStyle = fillColor;
            canvas.fillRect(l + x, t + (255 - h), 1, h);
            if(smokeEnabled){
                smoke.fillStyle = fillColor;
                smoke.fillRect(l + x, t + (255 - h), 1, h * 2);
            }
        }
    },
    colorTest: {
        name: "Color Test",
        image: "visualizers/colorTest.png",
        start: function(){

        },
        frame: function(){
            smoke.clearRect(0, 0, size[0], size[1]);
            smoke.fillStyle = '#111';
            smoke.fillRect(0, 0, size[0], size[1] * 0.15);
            for(var i = 0; i < size[0]; i++){
                smoke.fillStyle = getColor(i / size[0] * 255);
                smoke.fillRect(i, size[1] * 0.75, 1, size[1] * 0.25);
            }
            //updateSmoke();
            canvas.clearRect(0, 0, size[0], size[1]);
            for(var i = 0; i < size[0]; i++){
                canvas.fillStyle = getColor(i / size[0] * 255);
                canvas.fillRect(i, 0, 1, size[1]);
            }
            canvas.clearRect(0, size[1] * 0.5, size[0], size[1] * 0.25);
        },
        stop: function(){

        }
    }
};

for(var i in colors){
    getId('colorfield').innerHTML += '<option value="' + i + '">' + colors[i].name + '</option>';
}

for(var i in vis){
    getId('visfield').innerHTML += '<option value="' + i + '">' + vis[i].name + '</option>';
}

var smokeEnabled = 0;
var smokePos = [0, 0];
function toggleSmoke(){
    if(smokeEnabled){
        smokeElement.style.filter = "";
        smoke.clearRect(0, 0, size[0], size[1]);
        smokeElement.classList.add("disabled");
        canvasElement.style.backgroundPosition = "";
        canvasElement.style.backgroundImage = "";
        smokeEnabled = 0;
    }else{
        smokeElement.classList.remove("disabled");
        canvasElement.style.backgroundPosition = "0px 0px";
        canvasElement.style.backgroundImage = "url(smoke_transparent.png)";
        smokeEnabled = 1;
        resizeSmoke();
        if(vis[currVis].sizechange){
            vis[currVis].sizechange();
        }
    }
}
function resizeSmoke(){
    smokeElement.width = size[0];
    smokeElement.height = size[1];
    if(smokeEnabled){
        if(performanceMode){
            smokeElement.style.filter = "blur(" + Math.round((size[0] * 2 + size[1] * 2) / 50) + "px) brightness(3)";
        }else{
            smokeElement.style.filter = "blur(" + Math.round((size[0] + size[1]) / 50) + "px) brightness(3)";
        }
    }
}
function updateSmoke(leftpos, toppos, shortwidth, shortheight){
    if(smokeEnabled){
        smoke.clearRect(0, 0, size[0], size[1]);
        smoke.putImageData(canvas.getImageData(leftpos || 0, toppos || 0, shortwidth || size[0], shortheight || size[1]), leftpos || 0, toppos || 0);
    }
}
function smokeFrame(){
    smokePos[0] += 2;
    smokePos[1]++;
    if(smokePos[0] >= 1000){
        smokePos[0] -= 1000;
    }
    if(smokePos[1] >= 1000){
        smokePos[1] -= 1000;
    }
    canvasElement.style.backgroundPosition = smokePos[0] + "px " + smokePos[1] + "px";
}

resizeSmoke();

function openVisualizerMenu(){
    if(getId("selectOverlay").classList.contains("disabled")){
        getId("selectOverlay").classList.remove("disabled");
        var tempHTML = '';
        for(var i in vis){
            if(i.indexOf("SEPARATOR") === -1){
                var namecolor = "";
                if(i === getId("visfield").value){
                    namecolor = ' style="outline:2px solid ' + getColor(255) + ';"';
                }
                if(vis[i].image){
                    tempHTML += '<div' + namecolor + ' class="visOption" onclick="overrideVis(\'' + i + '\')"><img src="' + vis[i].image + '">' + vis[i].name + '</div>';
                }else{
                    tempHTML += '<div' + namecolor + ' class="visOption" onclick="overrideVis(\'' + i + '\')"><span></span>' + vis[i].name + '</div>';
                }
            }else{
                tempHTML += '<div style="height:auto;background:none;"><hr></div>';
            }
        }
        getId("selectContent").innerHTML = tempHTML;
        getId("selectContent").scrollTop = 0;
    }else{
        closeMenu();
    }
}

function overrideVis(selectedVisualizer){
    getId("visfield").value = selectedVisualizer;
    closeMenu();
    getId("visfield").onchange();
}

function openColorMenu(){
    if(getId("selectOverlay").classList.contains("disabled")){
        getId("selectOverlay").classList.remove("disabled");
        var tempHTML = '';
        for(var i in colors){
            if(i.indexOf("SEPARATOR") === -1){
                var namecolor = "";
                if(i === getId("colorfield").value){
                    namecolor = ' style="outline:2px solid ' + getColor(255) + ';"';
                }
                if(colors[i].image){
                    tempHTML += '<div' + namecolor + ' class="colorOption" onclick="overrideColor(\'' + i + '\')">' + colors[i].name + '<br><img src="' + colors[i].image + '"></div>';
                }else{
                    tempHTML += '<div' + namecolor + ' class="colorOption" onclick="overrideColor(\'' + i + '\')"></span>' + colors[i].name + '</div>';
                }
            }else{
                tempHTML += '<div style="height:auto;background:none;"><hr></div>';
            }
        }
        getId("selectContent").innerHTML = tempHTML;
        getId("selectContent").scrollTop = 0;
    }else{
        closeMenu();
    }
}

function overrideColor(selectedColor){
    getId("colorfield").value = selectedColor;
    closeMenu();
    getId("colorfield").onchange();
}

function closeMenu(){
    getId("selectContent").innerHTML = "";
    getId("selectOverlay").classList.add("disabled");
}