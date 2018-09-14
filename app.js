var express = require("express");
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var cv = require('opencv');
var port = process.env.port || 3000;
// face detection properties
var rectColor = [0, 255, 0]; //color green
var rectThickness = 2;

app.use(express.static(__dirname + "/client"));

app.get('/', function (req, res) {
    res.redirect('index.html');
});

io.on('connection', function (socket) {
    socket.on('canvasUpdated', function (bimage) {
        let buffer = Buffer.from(bimage);       
        modifyCanvas(buffer).then((blb) => {
            try {
                socket.broadcast.emit('canvasModified', blb);
            } catch (e) {
                console.log(e);
            }
        });
    });
});

http.listen(port, function () {
    console.log("Server running at port " + port);
});


let modifyCanvas = (canvasBlob) => {
    return new Promise((resolve, reject) => {
            cv.readImage(canvasBlob, function (err, im) {              
              if (err) {
                    throw err;
                  }
                //detect the face here and put rectangle around it           
                im.detectObject('/home/adesh/code/imagetweak/node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
                    if (err) throw err;
                
                    for (var i = 0; i < faces.length; i++) {
                        face = faces[i];  
                        im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
                    }    
                    // after image modification send it back
                    let arraybuffer = im.toBuffer();                  
                    resolve(arraybuffer);                    
            });
       
    });
});
}

