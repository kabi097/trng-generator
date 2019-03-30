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
  
  
const entropy2 = (str) => {
	const set = {};
  
	str.split('').forEach(
	  c => (set[c] ? set[c]++ : (set[c] = 1))
	);
  
	return Object.keys(set).reduce((acc, c) => {
	  const p = set[c] / str.length;
	  return acc - (p * (Math.log(p) / Math.log(2)));
	}, 0);
};

const canvas_input = document.querySelector('#canvas_input');
const context = canvas_input.getContext('2d');

const canvas_output = document.querySelector('#canvas_output');
const context2 = canvas_output.getContext('2d');

var current_8bit_array = [];	
var current_8bit_array_from_source = [];	
var histogram_data = [];	
var histogram_data_from_source = [];

var long_string = '';

var mouse = {x: 0, y: 0};
var original = [];
var N = 400;
var K = 5000;

function reset_histogram() {
	for (let i=0; i<256; i++) {
		histogram_data[i] = 0;
		histogram_data_from_source[i] = 0;
	}

}

reset_histogram();

function get_pixel_array(canvas, size) {
	var array = [];
	var ctx = canvas.getContext('2d');

	for (let i=0; i<canvas_input.width/size; i++) {
        for (let j=0; j<canvas_input.height/size; j++) {
            var imgData=ctx.getImageData(i*size,j*size,1,1);
            count = 0;
            for (let k=0; k<imgData.data.length; k++) {
                if (imgData.data[k]!=0) {
									array.push([i*size,j*size]);
									break;	
                }
            }
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
	//-----------------------------------------
	// for (let i=0; i<current_8bit_array.length; i++) {
	// 	histogram_data[current_8bit_array[i]] = histogram_data[current_8bit_array[i]]+1;
	// }

	histogram_data = [...transform_to_bin(canvas_output)].map((value, index) => {
		return histogram_data[index] + parseInt(value);
	});

	//histogram_data = uniq = [...new Set(histogram_data)];

	var trace = {
		y: histogram_data,
		type: 'bar',
	  };
	var data = [trace];
	Plotly.newPlot('histogram', data);

	//Histogram 2
	//-----------------------------------------	

	// for (let i=0; i<current_8bit_array_from_source.length; i++) {
	// 	histogram_data_from_source[current_8bit_array_from_source[i]] = histogram_data_from_source[current_8bit_array_from_source[i]]+1;
	// }
	
	histogram_data_from_source = [...transform_to_bin(canvas_input)].map((value, index) => {
		return histogram_data_from_source[index] + parseInt(value);
	});



	//histogram_data = uniq = [...new Set(histogram_data)];

	var trace2 = {
		y: histogram_data_from_source,
		type: 'bar',
	  };
	var data2 = [trace2];
	Plotly.newPlot('histogram2', data2);
});

const button_reset_histogram = document.querySelector("#reset_histogram");

button_reset_histogram.addEventListener('click', function() {
	current_8bit_array = [];
	current_8bit_array_from_source = [];
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

});

canvas_input.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    context.fillRect(mouse.x, mouse.y, 5, 5);
	// original.push([
	// 	e.pageX - this.offsetLeft, 
	// 	e.pageY - this.offsetTop,
	// ]);
}, false);

let tileWidth = canvas_input.width / 16;
let tileHeight = canvas_input.height / 16;
const button_binary = document.querySelector("#binary");

button_binary.addEventListener('click', function() {
	clear(context2);
	var string = '';

	//Post-processing
	var discretized = get_pixel_array(canvas_input, 5);
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

	// for (let c=0; c<discretized.length; c++) {
	// 	context2.fillRect(discretized[c][0], discretized[c][1], 5, 5);
	// }
	
	string = transform_to_bin(canvas_output);
	
	current_8bit_array = bin_to_8bit_array(string);	

	current_8bit_array_from_source = bin_to_8bit_array(transform_to_bin(canvas_input));
	
	document.querySelector("#inputText").value = string;
	long_string = long_string+string;	
	document.querySelector("#entropy").innerHTML = entropy(long_string);
});

const button_clear = document.querySelector("#clear");

button_clear.addEventListener('click', function() {
	original = [];
	clear(context);
	clear(context2);
});

