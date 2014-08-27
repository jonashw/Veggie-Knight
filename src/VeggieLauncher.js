var VeggieLauncher = function(stage){
	function randomRotation(){
		var rot = Math.floor(Math.random() * 8) - 4;
		if (rot == 0){
			return Math.round(Math.random) ? 0.5 : 0.5;
		} else {
			return rot;
		}
	}
	function centerD(d,veggies){
		var n = veggies.length;
		var w = stage.getWidth();
		var h = stage.getHeight();
		var dx = w / (d * n); //all pieces should be launched from the center quarter
		var x_c = w / 2; //center of the board
		var x_0 = x_c - ((n/2) * dx); //starting point
		var xOffset = 30;
		veggies.forEach(function(veggie,i){
			veggie.pos.x = x_0 + ((1 + i) * dx) - xOffset;
			veggie.pos.y = h;
		});
	}
	function convexAngles(veggies){
		var n = veggies.length;
		var dr = 1;
		var r_0 = -Math.floor(n/2);
		veggies.forEach(function(veggie,i){
			veggie.vel.y = 6.5;
			veggie.vel.x = r_0 + (i * dr);
		});
	}
	function concaveAngles(veggies){
		var n = veggies.length;
		var dr = 1;
		var r_0 = Math.floor(n/2);
		veggies.forEach(function(veggie,i){
			veggie.vel.y = 6.5;
			veggie.vel.x = r_0 - (i * dr);
		});
	}
	function launchAsync(veggies, delayMS, stepFn, doneFn){
		//veggies - to be added to the stage, one by one
		//delayMS - the delay (in MS) between adding veggies
		//stepFn - an optional function that will be called on each veggie (for mutation)
		//doneFn - an optional function that will be called once all veggies are launched
		var loop = function(i){
			if(i >= veggies.length){
				if(!!doneFn) doneFn();
				return;
			}
			var veggie = veggies[i];
			setTimeout(function(){
				if(!!stepFn) stepFn(veggie);
				veggie.rotVel = randomRotation();
				stage.veggies.push(veggie);
				loop(i+1);
			},delayMS);
		}
		loop(0);
	}
	function launch(veggies){
		veggies.forEach(function(veggie){
			veggie.rotVel = randomRotation();
			stage.veggies.push(veggie);
		});
	}
	function cascade(reverse,veggies){
		centerD(3,veggies);
		convexAngles(veggies);
		if(reverse) veggies.reverse();
		launchAsync(veggies,200);
	}
	function mortar(right,veggies){
		var x = right ? stage.getWidth() : 0;
		var y = stage.getHeight();
		var v_x = Random.range(1,4);
		if(right) v_x = -v_x;
		launchAsync(veggies,500,function(veggie){
			veggie.pos.x = x;
			veggie.pos.y = y;
			veggie.vel.y = 6.5;
			veggie.vel.x = v_x;
		});
	}
	function frenzy(right,veggies){
		var x = right ? stage.getWidth() : 0;
		var y = stage.getHeight() / 3;
		launchAsync(veggies,200,function(veggie){
			veggie.pos.x = x;
			veggie.pos.y = y;
			veggie.vel.y = Random.range(1,2) + 0.5;
			veggie.vel.x = Random.range(5,6);
			if(right) veggie.vel.x = -veggie.vel.x;
		});
	}
	function bouncedVeggies(veggies){
		centerD(1,veggies);
		// (2): 0 1
		// (4): 0 3 1 2 
		// (5): 0 4 1 3 2
		// (6): 0 5 1 4 2 3
		var veggies2 = [];
		var veggiesCopy = veggies.slice(0);
		while(veggiesCopy.length){
			veggies2.push(veggiesCopy.shift());
			veggiesCopy.reverse();
		}
		return veggies2;
	}
	//
	var launchMethodNames = [
		'convexPulse',
		'concavePulse',
		'cascadeRight',
		'cascadeLeft',
		'mortarRight',
		'mortarLeft',
		'bounce'
	];
	return {
		randomLaunch: function(veggies){
			var i = Math.floor(Math.random() * launchMethodNames.length);
			var k = launchMethodNames[i];
			this[k](veggies);
		},
		convexPulse: function(veggies){
			centerD(100,veggies);
			convexAngles(veggies);
			launch(veggies);
		},
		concavePulse: function(veggies){
			centerD(3,veggies);
			concaveAngles(veggies);
			launch(veggies);
		},
		bounce: function(veggies){
			launchAsync(bouncedVeggies(veggies),300,function(veggie){
				veggie.vel.y = 6.5;
			});
		},
		bounce: function(veggies){
			launchAsync(bouncedVeggies(veggies),300,function(veggie){
				veggie.vel.y = 6.5;
			});
		},
		rain: function(veggies){
			launchAsync(bouncedVeggies(veggies),300,function(veggie){
				veggie.pos.y = -50;
				veggie.vel.y = -2;
			});
		},
		cascadeRight: cascade.bind(null,false),
		cascadeLeft:  cascade.bind(null,true),
		mortarLeft:    mortar.bind(null,false),
		mortarRight:   mortar.bind(null,true),
		frenzyLeft:    frenzy.bind(null,false),
		frenzyRight:   frenzy.bind(null,true)
	};
};
