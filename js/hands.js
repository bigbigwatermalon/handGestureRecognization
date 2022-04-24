const video3 = document.getElementsByClassName('input_video3')[0]; // 返回class列表
const out3 = document.getElementsByClassName('output3')[0];
const controlsElement3 = document.getElementsByClassName('control3')[0];
const canvasCtx3 = out3.getContext('2d'); // 只返回匹配的第一个元素，如果没有匹配项，返回null。
const fpsControl = new FPS();

const spinner = document.querySelector('.loading');

var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientWidth;
// document.getElementById("inputLine").width = document.documentElement.clientWidth;

var socket

function send(e) {
    socket.send(e);
}

function connectServer() {
    var host = "ws://" + document.getElementById("ip").value + ":" + document.getElementById("port").value
        // var host = "ws://127.0.0.1:8888/";
    socket = new WebSocket(host);
    socket.onopen = function() {
        document.getElementById("demo").innerHTML = "建立链接";
        socket.send("admin:123456");
    }
    socket.onmessage = function(e) {
        // 当客户端收到服务端发来的消息时，
        //触发onmessage事件，参数e.data包含server传递过来的数据
        // document.getElementById("demo").innerHTML = "Recv" + e.data;
        document.getElementById("demo").innerHTML = e.data;
    }
    alert("链接服务器成功！");
}


spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};

function onResultsHands(results) {
    document.body.classList.add('loaded');
    fpsControl.tick();

    canvasCtx3.save();
    canvasCtx3.clearRect(0, 0, out3.width, out3.height);
    canvasCtx3.drawImage(
        results.image, 0, 0, out3.width, out3.height);
    if (results.multiHandLandmarks && results.multiHandedness) {
        for (let index = 0; index < results.multiHandLandmarks.length; index++) {
            const classification = results.multiHandedness[index];
            const isRightHand = classification.label === 'Right';
            const landmarks = results.multiHandLandmarks[index];
            drawConnectors(canvasCtx3, landmarks, HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' });
            // drawConnectors(
            //         canvasCtx3, landmarks, HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' }),
            //     drawLandmarks(canvasCtx3, landmarks, {
            //         color: isRightHand ? '#00FF00' : '#FF0000',
            //         fillColor: isRightHand ? '#FF0000' : '#00FF00',
            //         radius: (x) => {
            //             return lerp(x.from.z, -0.15, .1, 10, 1);
            //         }
            //     });
            var jObj = JSON.stringify(landmarks)
            send(jObj)
                // send(landmarks);
                // document.getElementById("demo2") = 
                // var arr = Object.keys(landmarks)
                // console.log('hello world!', arr);
                // console.log(landmarks['0'])
        }
    } else {
        document.getElementById("demo").innerHTML = "无"
    }
    canvasCtx3.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
    }
});
hands.onResults(onResultsHands);

const camera = new Camera(video3, {
    onFrame: async() => {
        await hands.send({ image: video3 });
    },
    width: 580,
    height: 520
});
camera.start();

new ControlPanel(controlsElement3, {
        selfieMode: true,
        maxNumHands: 2,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    })
    .add([
        new StaticText({ title: 'MediaPipe Hands' }),
        fpsControl,
        new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
        new Slider({ title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1 }),
        new Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
        new Slider({
            title: 'Min Tracking Confidence',
            field: 'minTrackingConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(options => {
        video3.classList.toggle('selfie', options.selfieMode);
        hands.setOptions(options);
    });