function ScoreBoard(controls,stage){
	var _score = 0;
	var _typeLog = {};
	var _comboLog = {};
	function logOccurrence(tallyLog,key){
		if(!(key in tallyLog)){
			tallyLog[key] = 0;
		}
		tallyLog[key]++;
	}
	function initListeners(self){
		controls.on('combo',function(comboSize,x,y,veggieTypes){
			stage.notices.push(new ComboNotice(comboSize,x,y));
			_score += comboSize;
			logOccurrence(_comboLog, comboSize);
			syncScore();
		});
		controls.on('slice',function(veggieType){
			_score += 1;
			logOccurrence(_typeLog, veggieType);
			syncScore();
		});
	}
	function syncScore(){
		stage.score = _score;
	}
	return {
		getScore:       function(){ return _score; },
		getScoreByType: function(){ return _typeLog; },
		getCombos:      function(){ return _comboLog; },
		init: function(){
			initListeners(this);
			syncScore();
		}
	};
}
