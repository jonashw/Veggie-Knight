var el;
function simulateSwipe(canvas,from,to){
	function mouseEvent(type,pos){
		var e = jQuery.Event(type,{
			offsetX: pos.x,
			offsetY: pos.y
		});
		$(canvas).trigger(e);
	}
	mouseEvent('mousedown',from);
	var steps = 50;
	var dx = (from.x - to.x) / steps;
	var dy = (from.y - to.y) / steps;
	for(var i=1; i<=steps; i++){
		mouseEvent('mousemove',{
			x: from.x - (dx * i), 
			y: from.y - (dy * i)
		});
	}
}

function runTests(testCase){
	testCase('static display of all veggies',function(canvas,img){
		var stage = new Stage(
			canvas,
			img,
			500,200);
		stage.init();
		var veggies = new VeggieFactory.fullSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 80 * (i + 1);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
	});
	testCase('static display of all splits', function(canvas, img){
		var stage = new Stage(
			canvas,
			img,
			500,200);
		stage.init();
		var veggies = new VeggieFactory.fullSplitSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 50 * (i + .5);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
	});
	[0,1,2,3,4,5,6,7].forEach(function(n){
		var degrees = n * 45;
		testCase('Toggle between whole and split: ' + degrees + ' degrees',function(canvas,img){
			var stage = new Stage(
				canvas,
				img,
				500,200);
			stage.init();
			var veggies = new VeggieFactory.fullSet();
			veggies.forEach(function(veggie,i){
				veggie.pos.x = 100 * (i + 0.5);
				veggie.pos.y = 80;
				stage.veggies.push(veggie);
				veggie.rot = 45 * n;
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
	});
	testCase('veggies should split when clicked', function(canvas,img){
		var stage = new Stage(
			canvas,
			img,
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
	});
	testCase('Veggies should split when swiped.  Multiple veggies can be swiped at once.', function(canvas, img){
		var ctx = canvas.getContext('2d');
		var stage = new Stage(
			canvas,
			img,
			500,200);
		stage.init();
		var controls = new Controls(canvas,stage);
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
	});
	testCase('A swipe is time-based.',function(canvas,img){
		var ctx = canvas.getContext('2d');
		var stage = new Stage(
			canvas,
			img,
			500,200);
		stage.init();
		var controls = new Controls(canvas,stage);
		controls.init();
		stage.draw();
		controls.on('swipemove',function(x,y){
			ctx.fillRect(x,y,3,3);
		});
		controls.on('swipestop',function(x,y){
			stage.draw();
		});
	});
	testCase(['A group of veggies can be sliced in a single swipe.',
	'<br>These veggies will be considered to be part of a *combo*.'].join(''),
	function(canvas,img,leftCol){
		leftCol.appendChild(document.createElement('br'));
		leftCol.appendChild(document.createElement('br'));
		var scoreBoard = document.createElement('div');
		scoreBoard.style['max-height'] = '60px';
		scoreBoard.style['overflow-y'] = 'auto';
		leftCol.appendChild(scoreBoard);
		var ctx = canvas.getContext('2d');
		function logCombo(comboSize){
			if(comboSize <= 0){
				return;
			}
			var comboRecord = document.createElement('div');
			comboRecord.innerHTML = comboSize + "-veggie combo!";
			if(scoreBoard.children.length){
				var firstChild = scoreBoard.children[0];
				scoreBoard.insertBefore(comboRecord,firstChild);
			} else {
				scoreBoard.appendChild(comboRecord);
			}
		}
		var stage = new Stage(canvas, img, 500,200);
		stage.init();
		var controls = new Controls(canvas,stage);
		controls.init();
		var veggies = new VeggieFactory.fullSet();
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 80 * (i + 1);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		var swipedVeggies = [];
		controls.on('swipestart swipemove',function(x,y){
			var touchedVeggies = stage.getVeggiesAt(x, y);
			touchedVeggies.forEach(function(veggie){
				stage.splitVeggie(veggie);
				if(swipedVeggies.indexOf(veggie) === -1){
					swipedVeggies.push(veggie);
				}
			});
			stage.swipeTrail.push({x:x,y:y});
			stage.draw();
		});
		controls.on('swipestop',function(x,y){
			stage.swipeTrail = [];
			logCombo(swipedVeggies.length);
			swipedVeggies = [];
			var wholeVeggiesLeft = stage.veggies.filter(function(veggie){
				return veggie.whole;
			});
			if(wholeVeggiesLeft.length == 0){
				setTimeout(function(){
					stage.veggies = veggies;
					stage.draw();
				},500);
			}
			stage.draw();
		});
	});
	function testLauncher(title,launchFn,launchDelay){
		testCase('Launcher: ' + title, function(canvas,img){
			var ctx = canvas.getContext('2d');
			var stage = new Stage(
				canvas,
				img,
				500,300);
			stage.init();
			var launcher = new VeggieLauncher(stage);
			var gameLoop = new GameLoop(stage);
			stage.draw();
			gameLoop.start();
			launchFn(launcher);
			setInterval(function(){
				launchFn(launcher);
			},launchDelay || 3000);
		});
	}
	testLauncher('convex pulse',function(launcher){
		launcher.convexPulse(VeggieFactory.randomFlush(5));
	});
	testLauncher('concave pulse',function(launcher){
		launcher.concavePulse(VeggieFactory.randomFlush(5));
	});
	testLauncher('cascade (left)',function(launcher){
		launcher.cascadeLeft(VeggieFactory.randomFlush(5));
	},3500);
	testLauncher('cascade (right)',function(launcher){
		launcher.cascadeRight(VeggieFactory.randomFlush(5));
	},3500);
	testLauncher('mortar (left)',function(launcher){
		launcher.mortarLeft(VeggieFactory.randomFlush(3));
	},3500);
	testLauncher('mortar (right)',function(launcher){
		launcher.mortarRight(VeggieFactory.randomFlush(3));
	},3500);
	testLauncher('bounce',function(launcher){
		launcher.bounce(VeggieFactory.randomFlush(5));
	},5500);
	
	testCase('Combo notice',function(canvas,img){
		var ctx = canvas.getContext('2d');
		var stage = new Stage(canvas, img, 500, 300);
		stage.init();
		stage.draw();
		for(var i=0; i<=5; i++){
			var n = i + 1;
			new ComboNotice(2 * n, 65 * n, 45 * n).draw(ctx);
		}
	});

	testCase('A combo causes a visible notice',function(canvas,img){
		var stage = new Stage(canvas, img, 500,300);
		var controls = new Controls(canvas,stage);
		var launcher = new VeggieLauncher(stage);
		var gameLoop = new GameLoop(stage);
		stage.init();
		controls.init();
		gameLoop.start();
		function launch(){
			launcher.concavePulse(VeggieFactory.fullSet());
			setTimeout(function(){
				simulateSwipe(canvas,{x:450,y:70},{x:50,y:110});
			},1600);
		}
		setInterval(launch,3000);
		launch();
		controls.on('combo',function(comboSize,x,y){
			stage.notices.push(new ComboNotice(comboSize,x,y));
			stage.draw();
		});
		stage.draw();
	});
}
