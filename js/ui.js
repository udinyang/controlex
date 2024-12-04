'use strict';

var CC = {};


// interpret url param as shared code.
CC.sharedCode = false;
if(document.location.search.length > 1){
	CC.sharedCode = document.location.search.substring(1);
}

CC.canvas = document.getElementById('cas');
CC.context = CC.canvas.getContext('2d');

(function(){
	var $canvas = $('#cas');
	function resizeCanvas() {
		CC.canvas.width = $canvas.width();
		CC.canvas.height = $canvas.height();
	}
	$( window ).resize(resizeCanvas);
	resizeCanvas();
})();

CC.loadCodeAndReset = function () {
	this.activeLevel = new this.levels[this.activeLevelName].constructor();
	$('#userscript').remove();
	try {
		var e = $("<script id='userscript'>\ncontrolFunction=undefined;controlFunction = (function(){\n	'use strict';\n	"+this.editor.getValue()+"\n	return controlFunction;\n})();\n</script>");	
		$('body').append(e);
	}
	catch(e) {
		this.pause();
		this.logError(e);
		return false;
	}
	return true;
}

CC.loadLevel = function(name) {
	if(!(name in CC.levels)) name = 'TutorialBlockWithFriction';
	localStorage.setItem("lastLevel",name);
	this.activeLevelName = name;
	this.activeLevel = new this.levels[name].constructor();
	$('#levelDescription').html(this.activeLevel.description);
	$('#levelTitle').text(this.activeLevel.title);
	document.title = this.activeLevel.title +' ';
	var savedCode = localStorage.getItem(this.activeLevel.name+"Code");
	if(typeof savedCode == 'string' && savedCode.length > 10)
		this.editor.setValue(savedCode);
	else 
		this.editor.setValue(this.activeLevel.boilerPlateCode);
	CC.loadCodeAndReset();
	showPopup('#levelStartPopup');
};

CC.share_BLOB = function(){
	return (""+window.location).split('?')[0] + "?" + btoa(JSON.stringify({code:CC.editor.getValue(), lvl_id:CC.activeLevelName}));
};


(function(){
	var runSimulation = false;
	CC.pause = function () {
		this.pauseButton.hide();
		this.playButton.show();
		runSimulation = false;
	};
	CC.play = function () {
		this.pauseButton.show();
		this.playButton.hide();
		runSimulation = true;
	};
	CC.running = function(){return runSimulation;};
})();

CC.editorSetCode_preserveOld = function(code) {
	var lines = this.editor.getValue().split(/\r?\n/);
	for (var i = 0; i < lines.length; i++) if(!lines[i].startsWith('//') && lines[i].length > 0) lines[i] = '//'+lines[i];
	var oldCode = lines.join("\n");
	this.editor.setValue(code + "\n\n"+oldCode+"\n");
}

CC.loadBoilerplate = function(){ this.editorSetCode_preserveOld(this.activeLevel.boilerPlateCode); };
CC.loadSampleSolution = function(){ this.editorSetCode_preserveOld(this.activeLevel.sampleSolution); };

CC.clearErrors = function (){ this.logText.text(''); };
CC.logError = function(s) {
	var timeStamp = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");	
	CC.logText.text((CC.logText.text()+"\n["+timeStamp+"] "+s).trim());
	CC.logText.scrollTop(CC.logText.prop("scrollHeight") - CC.logText.height());
};

function clearMonitor() {CC.variableInfo.text('');}
function monitor(name,val) {
	if(typeof val == 'number') val = ""+round(val,4);
	CC.variableInfo.text(CC.variableInfo.text()+name+" = "+val+"\n");
}

//jlh 2
function printdata(name,val) {
	if(typeof val == 'number') val = ""+round(val,4);
	CC.variableInfo.text(CC.variableInfo.text()+name+" = ["+val+"];\n\n");
}


function showPopup(p) {
	CC.popups.hide();
	$(p).show();
	if(p)CC.pause();
}

CC.gameLoop = (function() {
	if(this.running()) {
		clearMonitor();
		try { this.activeLevel.simulate(0.02,controlFunction); }
		catch(e) {
			this.pause();
			this.logError(e);
		}
		
		if(this.activeLevel.levelFailed()) 
			this.pause();

		if(this.activeLevel.levelComplete()) {
			this.levelSolvedTime.text(round(this.activeLevel.getSimulationTime(),2));
			showPopup('#levelCompletePopup');
		}
		this.variableInfo.text(this.variableInfo.text()+this.activeLevel.infoText());	
	}
	this.activeLevel.draw(this.context,this.canvas);
	
	if(this.running()) requestAnimationFrame(this.gameLoop);
	else setTimeout( function() {requestAnimationFrame(CC.gameLoop);}, 200);
}).bind(CC);

CC.levels = {
	TutorialBlockWithFriction:    {constructor: Levels.TutorialBlockWithFriction,    lineBreakAfter: false},
	TutorialBlockWithoutFriction: {constructor: Levels.TutorialBlockWithoutFriction, lineBreakAfter: false},
	TutorialBlockOnSlope:         {constructor: Levels.TutorialBlockOnSlope,         lineBreakAfter: true },
	CruiseControlIntro:           {constructor: Levels.CruiseControlIntro,           lineBreakAfter: false},
	CruiseControl2:               {constructor: Levels.CruiseControl2,               lineBreakAfter: true },
	StabilizeSinglePendulum:      {constructor: Levels.StabilizeSinglePendulum,      lineBreakAfter: false},
	SwingUpSinglePendulum:        {constructor: Levels.SwingUpSinglePendulum,        lineBreakAfter: false},
	StabilizeDoublePendulum:      {constructor: Levels.StabilizeDoublePendulum,      lineBreakAfter: true },
	RocketLandingNormal:          {constructor: Levels.RocketLandingNormal,          lineBreakAfter: false},
	RocketLandingUpsideDown:      {constructor: Levels.RocketLandingUpsideDown,      lineBreakAfter: false},
	RocketLandingMulti:           {constructor: Levels.RocketLandingMulti,           lineBreakAfter: false},
	RocketLandingHoverslam:       {constructor: Levels.RocketLandingHoverslam,       lineBreakAfter: true },
	VehicleSteeringSimple:        {constructor: Levels.VehicleSteeringSimple,        lineBreakAfter: false},
	VehicleRacing:                {constructor: Levels.VehicleRacing,                lineBreakAfter: true },
	MultirotorIntro:              {constructor: Levels.MultirotorIntro,              lineBreakAfter: false},
	MultirotorObstacles:          {constructor: Levels.MultirotorObstacles,          lineBreakAfter: false},
	MultirotorFlip:               {constructor: Levels.MultirotorFlip,               lineBreakAfter: false},
};


///////////////////// initialize ////////////////////////

// Cache DOM
CC.pauseButton = $('#pauseButton');
CC.playButton = $('#playButton');
CC.variableInfo = $('#variableInfo');
CC.popups = $('.popup');
CC.logText = $('#errorsBox pre');
CC.levelSolvedTime = $('#levelSolvedTime');
CC.variableInfo = $('#variableInfo');
CC.varInfoShowButton = $('#varInfoShowButton');
CC.varInfoHideButton = $('#varInfoHideButton');
CC.tipsButton = $('#tipsButton');
CC.boilerplateButton = $('#boilerplateButton');
CC.solutionButton = $('#solutionButton');
CC.levelmenuButton = $('#levelmenuButton');
CC.restartButton = $('#restartButton');
CC.errorsBoxUpButton = $('#errorsBoxUpButton');
CC.errorsBoxDownButton = $('#errorsBoxDownButton');
CC.shareButton = $('#shareButton');
CC.shareLink = $('#shareLink');

// button events
(function(){
	function toggleVariableInfo() {
		CC.variableInfo.toggle();
		CC.varInfoShowButton.toggle();
		CC.varInfoHideButton.toggle();
	}
	CC.varInfoShowButton.on('click', toggleVariableInfo.bind(CC));
	CC.varInfoHideButton.on('click', toggleVariableInfo.bind(CC));
})();

(function () {
	function makeErrorLogBig(){CC.errorsBoxUpButton.hide();CC.errorsBoxDownButton.show();$('.smallErrorBox').removeClass('smallErrorBox').addClass('bigErrorBox');}
	function makeErrorLogSmall(){CC.errorsBoxUpButton.show();CC.errorsBoxDownButton.hide();$('.bigErrorBox').removeClass('bigErrorBox').addClass('smallErrorBox');}
	makeErrorLogSmall();
	CC.errorsBoxUpButton.on('click', makeErrorLogBig);
	CC.errorsBoxDownButton.on('click', makeErrorLogSmall);
})();

CC.pauseButton.on('click', CC.pause.bind(CC));
CC.playButton.on('click', CC.play.bind(CC));
CC.tipsButton.on('click', function() {showPopup('#tipsPopup');});
CC.boilerplateButton.on('click', CC.loadBoilerplate.bind(CC));
CC.solutionButton.on('click', CC.loadSampleSolution.bind(CC));
CC.levelmenuButton.on('click', function() {showPopup('#levelMenuPopup');});
CC.restartButton.on('click', function() {if(CC.loadCodeAndReset()) CC.play();});
CC.shareButton.on('click', function() {showPopup('#sharePopup');CC.shareLink.val(CC.share_BLOB()).focus().select();});

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

$('#varInfoShowButton').hide();
if(CC.sharedCode === false){
	CC.editor = CodeMirror.fromTextArea(document.getElementById("CodeMirrorEditor"), {lineNumbers: true, mode: "javascript", matchBrackets: true, lineWrapping:true});
	CC.editor.on("change", function () {localStorage.setItem(CC.activeLevel.name+"Code", CC.editor.getValue());});
} else {
	CC.editor = CodeMirror.fromTextArea(document.getElementById("CodeMirrorEditor"), {lineNumbers: true, mode: "javascript", matchBrackets: true, lineWrapping:true, readOnly: true});
}
shortcut.add("Alt+Enter",function() {if(CC.loadCodeAndReset())CC.play();}, {'type':'keydown','propagate':true,'target':document});
shortcut.add("Alt+P",function() {if(CC.running())CC.pause();else CC.play();}, {'type':'keydown','propagate':true,'target':document});
shortcut.add("Esc",function() {showPopup(null);}, {'type':'keydown','propagate':true,'target':document});


// popup close button
$('.popup').prepend($('<button type="button" class="btn btn-danger closeButton" onclick="showPopup(null);" data-toggle="tooltip" data-placement="bottom" title="Close [ESC]"><span class="glyphicon glyphicon-remove"> </span></button>'));

// level load buttons
for(var name in CC.levels) {
	var level = new CC.levels[name].constructor();
	var e = $('<button type="button" class="btn btn-primary" onclick="CC.loadLevel(\''+name+'\');">'+level.title+'</button>');	
	$('#levelList').append(e);
	if(CC.levels[name].lineBreakAfter)
		$('#levelList').append($('<br />'));
}

// make buttons pretty
$(document).ready(function() {$('[data-toggle="tooltip"]').tooltip();});
$('#buttons').cleanWhitespace();
$('.popup').cleanWhitespace();
$('button').attr('data-placement',"bottom");
$('button').attr('data-toggle',"tooltip");
$('button').each(function(index, element){if(element.className==='') element.className='btn btn-primary';});


CC.pause();


// normal mode
if(CC.sharedCode === false) {
	try { CC.loadLevel(localStorage.getItem("lastLevel")); }
	catch (e) { CC.logError(e); }
	CC.loadCodeAndReset();
// show shared code
} else {
	CC.boilerplateButton.remove();
	CC.solutionButton.remove();
	CC.levelmenuButton.remove();
	CC.shareButton.remove();
	$('.CodeMirror').css('background-color','#ddd');
	try {
		var share_params = JSON.parse(atob(CC.sharedCode));
		CC.loadLevel(share_params.lvl_id);
		CC.editor.setValue(share_params.code);
		CC.loadCodeAndReset();
		CC.play();
	} catch (e) {
		CC.logError("Error loading shared code.");
		CC.logError(e);
	}	
	showPopup(null);
}

CC.gameLoop();