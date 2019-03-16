const canvas_input = document.querySelector('#canvas_input');
const context = canvas_input.getContext('2d');

var mouse = {x: 0, y: 0};

canvas_input.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    context.fillRect(mouse.x, mouse.y, 5, 5);
}, false);

let tileWidth = canvas_input.width / 16;
let tileHeight = canvas_input.height / 16;
const button_approache = document.querySelector("#approache");

button_approache.addEventListener('click', function() {
    var string = '';
    var count = 0;
    for (let i=0; i<16; i++) {
        for (let j=0; j<16; j++) {
            var imgData=context.getImageData(tileWidth*i,tileHeight*j,tileWidth,tileHeight);
            count = 0;
            for (let k=0; k<imgData.data.length; k++) {
                if (imgData.data[k]!=0) {
                    count++; 
                }
            }
            if (count%2==0) {
                string += '0';
            } else {
                string += '1';
            }
        }
    }
    document.querySelector("#inputText").value = string;
});

const button_clear = document.querySelector("#clear");
button_clear.addEventListener('click', function() {
    context.clearRect(0, 0, canvas_input.width, canvas_input.height);
    document.querySelector("#inputText").value = '';
});