google.charts.load("current", {packages:["corechart"]});

// Shannon entropy
const entropy = str => {
	return [...new Set(str)]
	  .map(chr => {
		return str.match(new RegExp(chr, 'g')).length;
	  })
	  .reduce((sum, frequency) => {
		let p = frequency / str.length;
		return sum + p * Math.log2(1 / p);
	  }, 0);
};

const canvas_input = document.querySelector('#canvas_input');
const context = canvas_input.getContext('2d');

const canvas_output = document.querySelector('#canvas_output');
const context2 = canvas_output.getContext('2d');

var histogram_data = new Array(255).fill(0);
var histogram_data_from_source = new Array(255).fill(0);

var long_string = '';
var long_string_from_source = '';

var mouse = {x: 0, y: 0};
var N = 400;
var K = 5000;

function get_post_processing_coordinates(canvas, size) {
	var array = [];
	var ctx = canvas.getContext('2d');

	for (let i=0; i<canvas_input.width/size; i++) {
        for (let j=0; j<canvas_input.height/size; j++) {
            var imgData=ctx.getImageData(i*size,j*size,1,1);
						count = 0;
						imgData.data.forEach((value, index) => {
							if (value!=0) array.push([i*size,j*size]);
						});
		}
	}
	return array;
}

function transform_to_bin(canvas) {
	var string = '';
	var ctx = canvas.getContext('2d');
	let width = canvas_input.width / 16;
	let height = canvas_input.height / 16;

	for (let i=0; i<16; i++) {
        for (let j=0; j<16; j++) {
						var imgData=ctx.getImageData(width*i,height*j,width,height);
						count = 0;
						count = imgData.data.reduce((counter, pixel) => {
							if (pixel!=0) return counter+1;
							else return counter;
						});
            if (count%2==0) {
                string += '0';
            } else {
                string += '1';
            }
		}
	}
	return string;
} 

function bin_to_8bit_array(string) {
	var integer = [];
	for (let i=0; i<string.length-1; i=i+8) {
		integer.push(parseInt((string.slice(i, i+8) + '').replace(/[^01]/gi, ''), 2));
	}
	return integer;
}

function clear(ctx) {
    ctx.clearRect(0, 0, canvas_input.width, canvas_input.height);
    document.querySelector("#inputText").value = '';	
}
clear(context);

const button_add_to_histogram = document.querySelector("#add_to_histogram");

button_add_to_histogram.addEventListener('click', function() {
	//Histogram 1
	histogram_data = [...transform_to_bin(canvas_output)].map((value, index) => {
		return histogram_data[index] + parseInt(value);
	});

	var trace = {
		y: histogram_data,
		type: 'bar',
	  };
	var data = [trace];
	Plotly.newPlot('histogram', data);

	//Histogram 2
	histogram_data_from_source = [...transform_to_bin(canvas_input)].map((value, index) => {
		return histogram_data_from_source[index] + parseInt(value);
	});

	var trace2 = {
		y: histogram_data_from_source,
		type: 'bar',
	  };
	var data2 = [trace2];
	Plotly.newPlot('histogram2', data2);
});

const button_reset_histogram = document.querySelector("#reset_histogram");

button_reset_histogram.addEventListener('click', function() {
	var trace = {
		x: [],
		type: 'histogram',
	  };
	var data = [trace];
	Plotly.newPlot('histogram', data);

	var trace2 = {
		x: [],
		type: 'histogram',
	  };
	var data2 = [trace];
	Plotly.newPlot('histogram2', data);

	long_string = "";
});

canvas_input.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    context.fillRect(mouse.x, mouse.y, 5, 5);
}, false);

let tileWidth = canvas_input.width / 16;
let tileHeight = canvas_input.height / 16;
const button_binary = document.querySelector("#binary");

button_binary.addEventListener('click', function() {
	clear(context2);
	var string = '';

	//Post-processing
	var discretized = get_post_processing_coordinates(canvas_input, 5);
	for (let b=0; b<50; b++) {
		discretized = discretized.map((value, index) => {
			return [
				parseInt((value[0]+value[1])%N),
				parseInt((value[1]+K*Math.sin(N/Math.PI))%N),
			];
		});
		// for (let a=0; a<discretized.length; a++) {
		// 	discretized[a][0] = parseInt((discretized[a][0]+discretized[a][1])%N);
		// 	discretized[a][1] = parseInt(((discretized[a][1]+K*Math.sin(N/Math.PI)))%N);
		// }
	}

	discretized.forEach((value, index) => {
		context2.fillRect(value[0], value[1], 5, 5);
	});
	
	string = transform_to_bin(canvas_output);
	string_from_source = transform_to_bin(canvas_input);
		
	document.querySelector("#inputText").value = string;
	long_string += string;	
	long_string_from_source += string_from_source;
	document.querySelector("#entropy1").innerHTML = entropy(long_string);
	document.querySelector("#entropy2").innerHTML = entropy(long_string_from_source);
});

const button_clear = document.querySelector("#clear");

button_clear.addEventListener('click', function() {
	clear(context);
	clear(context2);
});

