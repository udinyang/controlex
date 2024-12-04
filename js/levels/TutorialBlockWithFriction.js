'use strict';
if (typeof Levels === 'undefined') var Levels = {};

Levels.TutorialBlockWithFriction = function()
{
	this.name = "TutorialBlockWithFriction";
	this.title = "Tutorial #1";

	this.sampleSolution = "function controlFunction(block)\n{\n   \n  return 1;  // apply proportional control \n}";
	this.boilerPlateCode = "function controlFunction(block)\n{\n  // Example: frequency response\n  // Apply a sine wave input force to the block \n \n  return 5*Math.sin(10*block.T);  // input force to block\n}";
	this.description = "Push the block under the arrow (x=0) and make it stop there. Write a <u>JavaScript</u> function that calculates the horizontal force on the block necessary to achieve this.";
	//this.model = new Models.BlockOnSlope({g: 0,x: -2,dx: 0,slope: 0,friction: 1});  // S22:b=1, F22:b=1, S23:b=1.25
	this.model = new Models.BlockOnSlope({g: 0,x: -1,dx: 0,slope: 0,friction: 1.25});  // S22:b=1, F22:b=1, S23:b=1.25
}


Levels.TutorialBlockWithFriction.prototype.levelComplete = function()
{
	return Math.abs(this.model.x) < 0.01 
		&& Math.abs(this.model.dx) < 0.01;
}

Levels.TutorialBlockWithFriction.prototype.levelFailed = function()
{
	return false;
}


Levels.TutorialBlockWithFriction.prototype.simulate = function (dt, controlFunc)
{
	this.model = this.model.simulate (dt, controlFunc);
}

Levels.TutorialBlockWithFriction.prototype.getSimulationTime = function() {return this.model.T;}

Levels.TutorialBlockWithFriction.prototype.draw = function(ctx, canvas){this.model.draw(ctx, canvas);}

Levels.TutorialBlockWithFriction.prototype.infoText = function(ctx, canvas){return this.model.infoText();}
