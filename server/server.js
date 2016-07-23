var PNG = require('node-png').PNG,
	fs = require('fs');
	//http = require('http');

var request = require('ajax-request');
var express = require('express');
var url = require('url');
var app = express();
var port = process.env.PORT || 8080;

app.set('port',port);
app.use('/',express.static('./public'));
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers" ,"Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/?',function(req,res){

    res.writeHead(200, {'Content-Type': 'image/png'});
    var urlPart = url.parse(req.url,true);
    var query = urlPart.query;

    var max_iter = query.iterations;
    var width = query.xParts*10;
    var height = query.yParts*10;
    var sx = -1;
	var ex = 1;
	var sy = -1;
	var ey = 1;
    
	console.log("Requesting "+sx+", "+ex+", "+sy+", "+ey+", "+max_iter+ ", " +width +" ," + height);
	
	var p = make_mandel(width, height, max_iter, sx, ex, sy, ey);
	
	var bufs=[]
	p.pack().on('data', function(data) {
		bufs.push(data)
	}).on('end', function(data) {
		if(data)
			bufs.push(data)
		ret = Buffer.concat(bufs)
		res.end(ret)
	})
	
});  


function make_mandel(w, h, iters, sx, ex, sy, ey)
{
	var p = new PNG({
		filterType: -1,
		width: w,
		height: h
	})
	var dx = (ex-sx) / p.width
	var dy = (ey-sy) / p.height
	
	var fy=sy;
	for(var j=0; j<p.height; j++) {
		var fx=sx;
		for (var i=0; i<p.width; i++) {
			var re=fx, im=fy
			var v = 0;
			for( ; v<iters && (re * re + im * im) < 4; v++)  {
				var ore = re
				re = fx + re * re - im * im;
				im = fy + 2 * ore * im;
			}
			v = iters-v  // if we reach max iters this is always 0
			var idx = (j*p.width + i) << 2

			var color = coloring(v, iters);

			p.data[idx] = color[0]
			p.data[idx+1] = color[1]
			p.data[idx+2] = color[2]
			p.data[idx+3] = 0xFF
			fx += dx
		}
		fy += dy
	}
	return p
}



function coloring(iteration, maxIterations){

	if(iteration < maxIterations && iteration > 0){

		var i = Math.floor(iteration % (colorMap.length-1));
		var color1 = colorMap[i];
		var color2 = colorMap[i+1];

		var alpha = iteration % 1

		var r = Math.round(lerp(color1[0], color2[0], alpha));
		var g = Math.round(lerp(color1[1], color2[1], alpha));
		var b = Math.round(lerp(color1[2], color2[2], alpha));
		return [r,g,b];
	}else{
		return [0,0,0];
	}


}

var colorMap = [[255,0,0], [255,17,0], [255,34,0], [255,51,0], [255,68,0], [255,85,0], [255,102,0], [255,119,0], [255,136,0], [255,153,0], [255,170,0], [255,187,0], [255,204,0], [255,221,0], [255,238,0], [255,255,0], [255,255,0], [255,238,0], [255,221,0], [255,204,0], [255,187,0], [255,170,0], [255,153,0], [255,136,0], [255,119,0], [255,102,0], [255,85,0], [255,68,0], [255,51,0], [255,34,0], [255,17,0], [255,0,0] ];
function lerp(v0,v1,t){return (1-t)*v0+t*v1;}



app.get("/loaderio-3ee65588c026abe7ae13767aa6b8da53.txt", function (req, res, next){
    res.write("loaderio-3ee65588c026abe7ae13767aa6b8da53");
    res.end();
})


app.get("/tests", function (req, res, next){
    res.status(200).send({
            "keys": ["iterations","xParts","yParts"] ,
            "values": [
                     [500, 10,10]
            ]
        }
    );
})

app.get("/ping", function (req, res, next){
    res.status(200).send({result:"ok"});
})


app.listen(port);
console.log('listening' + port);

