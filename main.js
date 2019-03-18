const canvas_input = document.querySelector('#canvas_input');
const context = canvas_input.getContext('2d');

const canvas_output = document.querySelector('#canvas_output');
const context2 = canvas_output.getContext('2d');

var mouse = {x: 0, y: 0};
var original = [];
var discretized = [];
var N = 400;
var K = 5000;


function clear(ctx) {
    ctx.clearRect(0, 0, canvas_input.width, canvas_input.height);
    document.querySelector("#inputText").value = '';	
}

canvas_input.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    context.fillRect(mouse.x, mouse.y, 5, 5);
	original.push([
		e.pageX - this.offsetLeft, 
		e.pageY - this.offsetTop,
	]);
}, false);

let tileWidth = canvas_input.width / 16;
let tileHeight = canvas_input.height / 16;
const button_approache = document.querySelector("#approache");

button_approache.addEventListener('click', function() {
	clear(context2);
    var string = '';
    var count = 0;
	var x_prim;
	var y_prim;

	discretized = [];
	
	for (let a=0; a<original.length; a++) {
		discretized.push(original[a]);
	}
	
	for (let b=0; b<50; b++) {
		for (let a=0; a<discretized.length; a++) {
			discretized[a][0] = (discretized[a][0]+discretized[a][1])%N;
			discretized[a][1] = parseInt(((discretized[a][1]+K*Math.sin(N/Math.PI)))%N);
		}
	}
	
	
	for (let c=0; c<discretized.length; c++) {
		context2.fillRect(discretized[c][0], discretized[c][1], 5, 5);
	}
	
    for (let i=0; i<16; i++) {
        for (let j=0; j<16; j++) {
            var imgData=context2.getImageData(tileWidth*i,tileHeight*j,tileWidth,tileHeight);
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
	
	console.log(string);
	var integer = [];
	for (let i=0; i<string.length-1; i=i+8) {
		//console.log(string.slice(i, i+8));
		integer.push(parseInt((string.slice(i, i+8) + '').replace(/[^01]/gi, ''), 2));
	}
	console.log(integer);
	
	var trace = {
		x: integer,
		type: 'histogram',
	  };
	var data = [trace];
	Plotly.newPlot('histogram', data);
    document.querySelector("#inputText").value = string;	
});

const button_clear = document.querySelector("#clear");

button_clear.addEventListener('click', function() {
	original = [];
	clear(context);
	clear(context2);
});

