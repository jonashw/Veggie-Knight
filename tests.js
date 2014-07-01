window.onload = function(){
	(function(){
		var stage = new Stage(
			document.getElementById('canvas1'),
			document.getElementById('img'),
			500,200);
		stage.init();
		var veggies = new VeggieFactory.fullSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 80 * (i + 1);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
	})();
	(function(){
		var stage = new Stage(
			document.getElementById('canvas2'),
			document.getElementById('img'),
			500,200);
		stage.init();
		var veggies = new VeggieFactory.fullSplitSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 50 * (i + .5);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
	})();
	(function(){
		[3,4,5,6,7,8,9,10].forEach(function(n,testIndex){
			var canvas = document.getElementById('canvas' + n);
			var stage = new Stage(
				canvas,
				document.getElementById('img'),
				500,200);
			stage.init();
			var veggies = new VeggieFactory.fullSet();
			veggies.forEach(function(veggie,i){
				veggie.pos.x = 100 * (i + 0.5);
				veggie.pos.y = 80;
				stage.veggies.push(veggie);
				veggie.rot = 45 * testIndex;
			});
			stage.draw();
			var split = false;
			setInterval(function(){
				if(split){//put them back together
					stage.veggies = veggies.slice(0);
				} else {//take them apart
					veggies.forEach(function(veggie){
						stage.splitVeggie(veggie);
					});
				}
				split = !split;
				stage.draw();
			}, 1000);
		});
	})();
	(function(){
		var canvas = document.getElementById('canvas11');
		var stage = new Stage(
			canvas,
			document.getElementById('img'),
			500,200);
		stage.init();
		var veggies = new VeggieFactory.fullSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 80 * (i + 1);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		canvas.addEventListener('click',function(e){
			//console.log('click on canvas:', e.offsetX, e.offsetY);
			var clickedVeggies = stage.getVeggiesAt(e.offsetX, e.offsetY)
			if(clickedVeggies.length == 0){
				console.log('no veggies clicked');
			} else {
				var clickedVeggieNames = clickedVeggies.map(function(veggie){
					return veggie.type;
				});
				console.log('clicked veggies:',clickedVeggieNames);
				clickedVeggies.forEach(function(veggie){
					console.log(veggie);
					stage.splitVeggie(veggie);
				});
				stage.draw();
				var wholeVeggiesLeft = stage.veggies.filter(function(veggie){
					return veggie.whole;
				});
				if(wholeVeggiesLeft.length == 0){
					setTimeout(function(){
						stage.veggies = veggies;
						stage.draw();
					},500);
				}
			}
		});
	})();
	(function(){
		var canvas = document.getElementById('canvas12');
		var ctx = canvas.getContext('2d');
		var stage = new Stage(
			canvas,
			document.getElementById('img'),
			500,200);
		stage.init();
		var controls = new Controls(canvas);
		controls.init();
		var veggies = new VeggieFactory.fullSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 80 * (i + 1);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		controls.on('swipemove',function(x,y){
			stage.getVeggiesAt(x, y).forEach(function(veggie){
				stage.splitVeggie(veggie);
			});
			stage.draw();
		});
		controls.on('swipestop',function(x,y){
			var wholeVeggiesLeft = stage.veggies.filter(function(veggie){
				return veggie.whole;
			});
			if(wholeVeggiesLeft.length == 0){
				setTimeout(function(){
					stage.veggies = veggies;
					stage.draw();
				},500);
			}
		});
	})();
};
