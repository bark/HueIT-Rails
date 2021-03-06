/**
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  l       The lightness
* @return  Array           The RGB representation
*/
function hslToRgb(h, s, l){
	var r, g, b;

	if(s == 0){
		r = g = b = l; // achromatic
	}else{
		function hue2rgb(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [r * 255, g * 255, b * 255];
}
/**
* draw() is called first when the body loads, and then on each change of value (hue,bri,sat).
* the h,s,l value is taken from each
*/
function draw(id,hue,sat,light){
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");
	if(light>0.8) {
		light = 0.8;
	}else if(light<0.2) {
		light = 0.2;
	}

	rgb = hslToRgb(hue,sat,light);
	r = Math.round(rgb[0]);
	g = Math.round(rgb[1]);
	b = Math.round(rgb[2]);

	/**
	* So here we create a half circle and we set the fillStyle to the current color of Hue, Saturation and Brightness level
	*/
	ctx.beginPath();
	ctx.arc(15,15,14,0,2*Math.PI,false);
	ctx.fillStyle= "rgb(" + r + "," + g + "," + b + ")";
	ctx.fill();
	ctx.lineWidth=2;
	ctx.strokeStyle='#EDEDED';
	ctx.stroke();
}

// Used when disregarding the value of the selectors, only wanting to draw the color of the bulb or if it is off
function drawLamp(id, hue, sat, bri) {
	if (!document.getElementById("switch_" + id).checked) {
		draw("color_shower_" + id, 0, 0, 1);
	} else {
		draw("color_shower_" + id, hue/65535, sat/254, bri/254);
	}
}

//Draws the square that shows the value of the hue and saturation sliders
function draw_shower(){
	var canvas = document.getElementById("color_shower");
	var ctx = canvas.getContext("2d");
	light = 0.5;
	hue = document.getElementById("hue").value/65535;
	sat = document.getElementById("sat").value/254;

	rgb = hslToRgb(hue,sat,light);
	
	XY = rgb_to_XY(rgb[0],rgb[1],rgb[2]);
	XY = limit_XY_values(XY[0],XY[1]);
	rgb = XY_to_rgb(XY[0], XY[1], light);

	r = Math.round(rgb[0]);
	g = Math.round(rgb[1]);
	b = Math.round(rgb[2]);

	/**
	* So here we create a half circle and we set the fillStyle to the current color of Hue, Saturation and Brightness level
	*/
	ctx.beginPath();
	ctx.rect(0,40,200,150);
	ctx.fillStyle= "rgb(" + r + "," + g + "," + b + ")";
	ctx.fill();
	ctx.lineWidth=3;
	ctx.strokeStyle='#EDEDED';
	ctx.stroke();
}

function limit_XY_values(x,y) {
	//Limits the x values to the red triangle in http://www.developers.meethue.com/documentation/core-concepts
	if (x < 0.167) {
		x = 0.167;
	} else if (x > 0.675) {
		x = 0.675;
	}

	//Limits the y values to the red triangle in http://www.developers.meethue.com/documentation/core-concepts
	if (x >= 0.167 && x <= 0.4091 && (1.97439075*x-0.28972325) > y) {
		y = 1.97439075*x-0.28972325;
	} else if (x >= 0.167 && x <= 0.675 && (0.5511811*x-0.0527047) < y) {
		y = 0.5511811*x-0.0527047;
	} else if (x >=0.4091 && x <= 0.675 && (-0.73711922*x+0.81955547198) > y) {
		y = -0.73711922*x+0.81955547198;
	}

	return [x, y];
}

// Takes RGB values and returns array with XY values
function rgb_to_XY(ired,igreen,iblue){
	// For the hue bulb the corners of the triangle are:
	// -Red: 0.675, 0.322
	// -Green: 0.4091, 0.518
	// -Blue: 0.167, 0.04
	var normalizedToOne = [ired / 255, igreen / 255, iblue / 255]

	var red, green, blue;

	// Make red more vivid
	if (normalizedToOne[0] > 0.04045) {
	    red = Math.pow(
	            (normalizedToOne[0] + 0.055) / (1.0 + 0.055), 2.4);
	} else {
	    red =  (normalizedToOne[0] / 12.92);
	}

	// Make green more vivid
	if (normalizedToOne[1] > 0.04045) {
	    green =  Math.pow((normalizedToOne[1] + 0.055) / (1.0 + 0.055), 2.4);
	} else {
	    green = (normalizedToOne[1] / 12.92);
	}

	// Make blue more vivid
	if (normalizedToOne[2] > 0.04045) {
	    blue =  Math.pow((normalizedToOne[2] + 0.055) / (1.0 + 0.055), 2.4);
	} else {
	    blue = (normalizedToOne[2] / 12.92);
	}

	var X =  (red * 0.649926 + green * 0.103455 + blue * 0.197109);
	var Y =  (red * 0.234327 + green * 0.743075 + blue * 0.022598);
	var Z =  (red * 0.0000000 + green * 0.053077 + blue * 1.035763);

	var x = X / (X + Y + Z);
	var y = Y / (X + Y + Z);

	return [x, y];

}

function XY_to_rgb(x,y,bri) {
	// Based on https://github.com/PhilipsHue/PhilipsHueSDK-iOS-OSX/commit/f41091cf671e13fe8c32fcced12604cd31cceaf3
	var z = 1.0 - x - y;
	var Y = bri;
	var X = (Y/y)*x;
	var Z = (Y/y)*z;
	// calculate rgb values
	var r = X  * 1.4628067 - Y * 0.1840623 - Z * 0.2743606;
    var g = -X * 0.5217933 + Y * 1.4472381 + Z * 0.0677227;
    var b = X  * 0.0349342 - Y * 0.0968930 + Z * 1.2884099;

    // Apply gamma correction
    if (r <= 0.0031308) {
    	r = 12.92 * r;
    } else {
    	r = (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    }

    if (g <=  0.0031308) {
    	g = 12.92 * g; 
    } else {
    	g = (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    }

    if (b <= 0.0031308) {
    	b = 12.92 * b;
    } else {
    	b = (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
    }

    return [r * 255, g * 255, b * 255];
}