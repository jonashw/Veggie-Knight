function PauseScreen(canvas,scoreBoard,gameLoop){
	var el;

	function hide(){ el.style.display = 'none'; }
	function show(){
		el.style.display = 'block';
		el.style.width = canvas.width + 'px';
		el.style.height = canvas.height + 'px';
		var canvasOffset = $(canvas).offset();
		el.style.left = canvasOffset.left + 'px';
		el.style.top = canvasOffset.top + 'px';
   	}

	function tableWrapper(columnTitles,rows){
		var table = document.createElement('table');
		$(table)
			.addClass('table-bordered table-condensed pull-left')
			.css({
				'color':'white',
				'margin':'1em 0 0 1em'
			});
		var header = document.createElement('thead');
		table.appendChild(header);
		var headerRow = document.createElement('tr');
		header.appendChild(headerRow);
		columnTitles.forEach(function(title){
			$('<th></th>').text(title).appendTo(headerRow);
		});
		var body = document.createElement('tbody');
		table.appendChild(body);
		rows.forEach(function(row){
			body.appendChild(row);
		});
		return table;
	}
	function typeTable(){//this is so dumb
		var typeScores = scoreBoard.getScoreByType();
		var scores = [];
		for(var k in typeScores){
			scores.push({type:k,count:typeScores[k]});
		}
		scores.sort(function(a,b){
			return b.count - a.count;
		});
		var rows = [];
		scores.forEach(function(score){
			var tr = document.createElement('tr');
			var td1 = document.createElement('td');
			tr.appendChild(td1);
			var td2 = document.createElement('td');
			tr.appendChild(td2);
			td1.innerText = score.type;
			td2.innerText = score.count;
			rows.push(tr);
		});
		if(scores.length === 0){
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.setAttribute('colspan',2);
			tr.appendChild(td);
			td.innerText = 'None yet';
			rows.push(tr);
		}
		
		var table = tableWrapper(['Veggie Type','Count'],rows);
		if(scores.length > 0){
			var total = scores.reduce(function(tot,score){
				return tot + score.count;
			},0);
			var tfoot = $('<tfoot></tfoot>').append(
				$('<tr></tr>').append(
					$('<td></td>').text('Total')
				).append(
					$('<td></td>').text(total)
				)
			).appendTo(table);
		}
		return table;
	}

	function comboTable(){//this is so dumb
		var comboCounts = scoreBoard.getCombos();
		var combos = [];
		for(var k in comboCounts){
			combos.push({size:k, count:comboCounts[k], points:k * comboCounts[k]});
		}
		combos.sort(function(a,b){
			return b.points - a.points;
		});
		var rows = [];
		combos.forEach(function(combo){
			var tr = document.createElement('tr');
			var td1 = document.createElement('td');
			tr.appendChild(td1);
			var td2 = document.createElement('td');
			tr.appendChild(td2);
			var td3 = document.createElement('td');
			tr.appendChild(td3);
			td1.innerText = combo.size;
			td2.innerText = combo.count;
			td3.innerText = combo.points; 
			rows.push(tr);
		});
		if(combos.length === 0){
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.setAttribute('colspan',3);
			tr.appendChild(td);
			td.innerText = 'None yet';
			rows.push(tr);
		}
		var table = tableWrapper(['Combo Size','Count','Points'],rows);
		if(combos.length > 0){
			var total = {
				count:0,
				points:0
			};
			combos.forEach(function(combo){
				total.count += combo.count;
				total.points += combo.points;
			});
			var tfoot = $('<tfoot></tfoot>').append(
				$('<tr></tr>').append(
					$('<td></td>').text('Total')
				).append(
					$('<td></td>').text(total.count)
				).append(
					$('<td></td>').text(total.points)
				)
			).appendTo(table);
		}
		return table;
	}

	function update(){
		$(el)
			.empty()
			.append(typeTable())
			.append(comboTable());
	}

	return {
		init: function(){
			el = document.createElement('div');
			el.style.background = 'rgba(0,0,0,0.5)';
			el.style.position = 'absolute';
			$(el).appendTo(document.body);
			var self = this;
			gameLoop.on('stop',function(){
				self.show();
			});
			gameLoop.on('start',function(){
				self.hide();
			});
			hide();
		},
		getElement: function(){ return el; },
		show: function(){
			update();
			show();
		},
		hide: hide
	};
}
