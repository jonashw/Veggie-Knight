window.onload = init;

var ctx,img,stageVeggies = [];
function init(){
	ctx = document.getElementById('canvas').getContext('2d');
	ctx.canvas.width = 500;
	ctx.canvas.height = 300;
	img = document.getElementById('img');
	document.addEventListener('keyup',function(e){
		if(e.which == 32){//spacebar
			launchVeggies(VeggieFactory.randomSet());
		}
		if(e.which == 17){//Ctrl
			GameLoop.playPause();
		}
		console.log(e.which);
	});
	GameLoop.start();
}

var GameLoop = (function(){
	function loop(){
		ctx.fillStyle = 'white';
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.fillStyle = '#333';
		ctx.strokeRect(0,0,ctx.canvas.width,ctx.canvas.height);
		stageVeggies.forEach(function(veggie,i){
			veggie.draw(img,ctx,0.33);
			veggie.update();
		});
		//remove veggies that have left the stage
		stageVeggies = stageVeggies.filter(function(veggie){
			return veggieOffStage(veggie);
		});
	}
	var _interval;
	return {
		start: function(){
			loop();
			_interval = setInterval(loop,20);
		},
		stop: function(){
			clearInterval(_interval);
			_interval = null;
		},
		playPause: function(){
			if(!!_interval){
				this.stop();
			} else {
				this.start();
			}
		}
	};
})();

function launchVeggies(veggies){
	var n = veggies.length;
	var x = 6 / (n + 0.5);
	veggies.forEach(function(veggie,i){
		veggie.pos.x = 70 * (i + x);
		veggie.pos.y = ctx.canvas.height;
		veggie.vel.y = 6.5;
		veggie.rotVel = randomRotation();
		stageVeggies.push(veggie);
	});
}

function veggieOffStage(veggie){
	return veggie.pos.y < ctx.canvas.height + 100;
}

function randomRotation(){
	var rot = Math.floor(Math.random() * 8) - 4;
	if (rot == 0){
		rot = Math.round(Math.random)
			? 0.5
			: 0.5;
	}
	return rot;
}
