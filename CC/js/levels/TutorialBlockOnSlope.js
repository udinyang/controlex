'use strict';
if (typeof Levels === 'undefined') var Levels = {};

Levels.TutorialBlockOnSlope = function()
{
	this.name = "TutorialBlockOnSlope";
	this.title = "Tutorial #3";

	this.sampleSolution = "var dt = .02; // sample time \nvar sum_pos_error = 0; // approximates integral of error \nfunction controlFunction(block)\n{\n  // Start by finding a proportional value that keeps the block on the screen \n  // Next add a derivative term that has a response with a few oscillations \n // Finally add a 3rd integral term to eliminate the steady state error  \n// Keep the gains from each step \n \n  sum_pos_error += block.x*dt;  \n  \n  return 0;\n}";
	this.boilerPlateCode = "var dt = .02; // sample time\nfunction controlFunction(block)\n{\n  return 0;\n}";
	this.description = "Push the block under the arrow (x=0) and make it stop there. Calculate the horizontal force on the block necessary to achieve this. This time the block is on a slope. Proportional or PD control alone will not work.";
	this.model = new Models.BlockOnSlope({g: 5,x: -2,dx: 0,slope: -0.4,friction: 0});
}


Levels.TutorialBlockOnSlope.prototype.levelComplete = function()
{
	return Math.abs(this.model.x) < 0.01 
		&& Math.abs(this.model.dx) < 0.01;
}

Levels.TutorialBlockOnSlope.prototype.levelFailed = function()
{
	return false;
}


Levels.TutorialBlockOnSlope.prototype.simulate = function (dt, controlFunc)
{
	this.model = this.model.simulate (dt, controlFunc);
}

Levels.TutorialBlockOnSlope.prototype.getSimulationTime = function() {return this.model.T;}

Levels.TutorialBlockOnSlope.prototype.draw = function(ctx, canvas){this.model.draw(ctx, canvas);}

Levels.TutorialBlockOnSlope.prototype.infoText = function(ctx, canvas){return this.model.infoText();}