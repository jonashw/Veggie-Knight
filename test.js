var el;
function simulateSwipe(canvas,from,to,steps){
	function mouseEvent(type,pos){
		var e = jQuery.Event(type,{
			offsetX: pos.x,
			offsetY: pos.y
		});
		$(canvas).trigger(e);
	}
	mouseEvent('mousedown',from);
	var steps = steps || 50;
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
			veggie.pos.x = 80 * (i + 0.5);
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
		var veggiesPerRow = 10;
		veggies.forEach(function(veggie,i){
			veggie.pos.x = 50 * ((i % veggiesPerRow) + 0.5);
			veggie.pos.y = 60 * (1 + 1.5 * Math.floor(i / veggiesPerRow));
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
				500,250);
			stage.init();
			var veggies = new VeggieFactory.fullSet();
			var veggiesPerRow = 5;
			veggies.forEach(function(veggie,i){
				veggie.pos.x = 100 * ((i % veggiesPerRow) + 0.5);
				veggie.pos.y = 70 * (1 + 1.5 * Math.floor(i / veggiesPerRow));
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
			veggie.pos.x = 80 * (i + 0.5);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		canvas.addEventListener('click',function(e){
			var clickedVeggies = stage.getVeggiesAt(e.offsetX, e.offsetY)
			if(clickedVeggies.length == 0){
				console.log('no veggies clicked');
			} else {
				var clickedVeggieNames = clickedVeggies.map(function(veggie){
					return veggie.type;
				});
				clickedVeggies.forEach(function(veggie){
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
			veggie.pos.x = 80 * (i + 0.5);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		SwipeEvents(canvas);
		$(canvas).on('swipemove',function(e,pos){
			stage.getVeggiesAt(pos.x, pos.y).forEach(function(veggie){
				stage.splitVeggie(veggie);
			});
			stage.draw();
		});
		$(canvas).on('swipestop',function(e,pos){
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
		SwipeEvents(canvas);
		var controls = new Controls(canvas,stage);
		controls.init();
		stage.draw();
		$(canvas).on('swipemove',function(e,pos){
			ctx.fillRect(pos.x,pos.y,3,3);
		});
		$(canvas).on('swipestop',function(e,pos){
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
			veggie.pos.x = 80 * (i + 0.5);
			veggie.pos.y = 80;
			stage.veggies.push(veggie);
		});
		stage.draw();
		var swipedVeggies = [];
		$(canvas).on('swipestart swipemove',function(e,pos){
			var touchedVeggies = stage.getVeggiesAt(pos.x, pos.y);
			touchedVeggies.forEach(function(veggie){
				stage.splitVeggie(veggie);
				if(swipedVeggies.indexOf(veggie) === -1){
					swipedVeggies.push(veggie);
				}
			});
			stage.swipeTrail.push(pos);
			stage.draw();
		});
		$(canvas).on('swipestop',function(e,pos){
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
	testLauncher('frenzy (left)',function(launcher){
		launcher.frenzyLeft(VeggieFactory.randomFlush(6));
	},2000);
	testLauncher('frenzy (right)',function(launcher){
		launcher.frenzyRight(VeggieFactory.randomFlush(6));
	},2000);
	testLauncher('frenzy (both)',function(launcher){
		launcher.frenzyLeft(VeggieFactory.randomSet(6));
		launcher.frenzyRight(VeggieFactory.randomSet(6));
	},2000);

	testCase('Normal mode', function(canvas,img){
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
		new NormalMode(gameLoop, launcher).start();
	});

	testCase('Frenzy mode (2 second bursts)', function(canvas,img){
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
		new FrenzyMode(gameLoop, launcher, 2000).start();
	});
	
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
			launcher.concavePulse(VeggieFactory.randomSet(5));
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

	testCase('swipe resolution is such that all veggies are sliced between two swipe points',function(canvas,img){
		var stage = new Stage(canvas, img, 500,300);
		var controls = new Controls(canvas,stage);
		var launcher = new VeggieLauncher(stage);
		var gameLoop = new GameLoop(stage);
		stage.init();
		controls.init();
		gameLoop.start();
		function launch(){
			launcher.concavePulse(VeggieFactory.flush('bellpepper',5));
			setTimeout(function(){
				simulateSwipe(canvas,{x:450,y:100},{x:50,y:100},1);
			},1600);
		}
		setInterval(launch,3000);
		launch();
		stage.draw();
	});
	
	testCase('Pause screen (press Space Bar)',function(canvas,img){
		var stage = new Stage(canvas, img, 500, 300);
		var gameLoop = new GameLoop(stage);
		var controls = new Controls(canvas,stage,gameLoop);
		var scoreBoard = new ScoreBoard(controls,stage,gameLoop);
		var launcher = new VeggieLauncher(stage);
		var pauseScreen = new PauseScreen(canvas,scoreBoard,gameLoop);
		stage.init();
		pauseScreen.init();
		controls.init();
		scoreBoard.init();
		stage.draw();
		gameLoop.start();
		function launch(){
			launcher.concavePulse(VeggieFactory.fullSet());
		}
		setInterval(launch,3000);
		launch();
	});
}
