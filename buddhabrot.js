/*
* Canvas Buddhabrot
*
* @author Sebastian Porêba <www.smashinglabs.pl>
* 
* Inspired by:
* http://www.mathworks.com/matlabcentral/fileexchange/7726-pseudo-coloring
* http://jashkenas.s3.amazonaws.com/misc/buddhabrot/docs/buddhabrot.html
* http://www.planet-source-code.com/vb/scripts/ShowCode.asp?txtCodeId=1684&lngWId=7
*/
var iterations = [1250,250,50];
var points = 50000;
// var limit = 10000;

var canvas;
var context;
var N;
var image;

var exposures = [];
var maxexposure = [0,0,0];
var counter     = 0;

var run = false;

var start = 0;

function print_infobar() {
  var passed = new Date();
  var passed_s = (passed.getTime() - start) / 1000;
  
  var passed_string = [];
  passed_string[0] = Math.floor(passed_s /(60*60));
  passed_s -= passed_string[0]*60*60;
  passed_string[1] = Math.floor(passed_s /60);
  passed_s -= passed_string[1]*60;
  passed_string[2] = Math.floor(passed_s);
  if(passed_string[1] < 10) passed_string[1] = '0' + passed_string[1];
  if(passed_string[2] < 10) passed_string[2] = '0' + passed_string[2];
  
  context.fillText  ('Buddhabrot', 10, 10);
  context.fillText  ('Iteration: ' + counter, 10, 25);
  context.fillText  ('Runtime: ' + passed_string.join(":"), 10, 40);      
}

function draw() {
  if(start === 0) start = new Date().getTime();
  if(!run) return;
  counter++;
  
  plot();
  findMaxExposure();
  render();
  
  print_infobar();
  
  setTimeout(draw,0);
}

function plot() {
  var x,y,i;
  for(i = 0; i<=points; i++) {
    x = Math.random() * 3 - 2;
    y = Math.random() * 3 - 1.5;
    for(var pass=0;pass<3;pass++) iterate(x, y, pass);
  }
}

function iterate(x0, y0, pass) {
  var x = 0, y = 0, xnew, ynew, drawnX, drawnY;
  for(var i = 0; i<=iterations[pass]; i++) {
    xnew = x * x - y * y + x0;
    ynew = 2 * x * y + y0;
    if((xnew * xnew + ynew * ynew) > 4) { // inlined iterate_draw
      x = 0, y = 0, xnew, ynew, drawnX, drawnY;
      for(var i = 0; i<=iterations[pass]; i++) {
        xnew = x * x - y * y + x0;
        ynew = 2 * x * y + y0;
        if(i > 3) {
          drawnX = Math.round(N * (xnew + 2.0) / 3.0);
          drawnY = Math.round(N * (ynew + 1.5) / 3.0);
          if (0 <= drawnX && drawnX < N && 0 <= drawnY && drawnY < N) {
            exposures[pass].array_[drawnX][drawnY]++;
          }
        }
        if((xnew * xnew + ynew * ynew) > 4) return;
        x = xnew;
        y = ynew;
      }
      return;
    }
    x = xnew;
    y = ynew;
  }
  return;      
}

function findMaxExposure() {
  for(var pass=0;pass<3;pass++) {
    goog.math.Matrix.map(exposures[pass], function(value, i, j, matrix) {
      if(value > maxexposure[pass]) {
        maxexposure[pass] = value;
      }
    });
  }
}

function render() {
  var data = image.data,r,g,b, tmpExposure, i,x,y;
  
  for(var pass=0;pass<3;pass++) {
    goog.math.Matrix.map(exposures[pass], function(value, i, j, matrix) {
      var ramp = value / (maxexposure[pass]/2.5);
      if(ramp > 1 || isNaN(ramp)) ramp = 1;
      idx  = (i * N + j) * 4;
      data[idx + pass] = ramp*255;
    });
  }
  
  context.globalAlpha = 1/8;
  // Loop for each blur pass.
  for (i = 1; i <= 4; i += 1) { // 4
    for (y = -1; y < 2; y += 1) { // 3
      for (x = -1; x < 2; x += 1) {
        context.putImageData(image, 0, 0);
      }
    }
  }
  context.globalAlpha = 1.0;       
}

function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext('2d');
  context.fillStyle    = '#fff';
  context.font         = '10px sans-serif';
  context.textBaseline = 'top';        
  N = canvas.width;
  image = context.createImageData(N,N);      
  for(var pass=0;pass<3;pass++)
    exposures[pass] = new goog.math.Matrix(N,N);
    
  for(var i=0;i<N*N;i++) {
    image.data[i * 4] = 0;  // red channel
    image.data[i * 4 + 1] = 0;  // green channel
    image.data[i * 4 + 2] = 0;  // blue channel
    image.data[i * 4 + 3] = 255;  // alpha channel
  }
  
  context.putImageData(image, 0, 0);  
  context.font         = '24px sans-serif';
  context.fillText('Buddhabrot', 230, 250);
  context.fillText('Press start to calculate', 175, 300);
  
  context.font         = '10px sans-serif';
}