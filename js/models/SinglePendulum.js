'use strict';
if (typeof Models === 'undefined') var Models = {};

Models.SinglePendulum = function(params)
{
	var nVars = Object.keys(this.vars).length;
	for(var i = 0; i < nVars; i++)
	{
		var key = Object.keys(this.vars)[i];
		this[key] = (typeof params[key] == 'undefined')?this.vars[key]:params[key];
	}
}

Models.SinglePendulum.prototype.vars = 
{
	m0: 10,
	m1: .5,
	L: 1,
	g: 9.81,
	theta: 0.2,
	dtheta: 0,
	x: 0,
	dx: 0,
	F: 0,
	T: 0
};

Models.SinglePendulum.prototype.simulate = function (dt, controlFunc)
{
	var copy = new Models.SinglePendulum(this);
	var state = [this.x, this.dx, this.theta, this.dtheta];
	copy.F = controlFunc(new Models.SinglePendulum(this));
	copy.F = Math.max(-50,Math.min(50,copy.F));
	if(typeof copy.F != 'number' || isNaN(copy.F)) throw "Error: The controlFunction must return a number.";
	var soln = numeric.dopri(0,dt,state,function(t,x){ return Models.SinglePendulum.ode(copy,x); },1e-4).at(dt);	
	
	copy.x = soln[0];
	copy.dx = soln[1];
	copy.theta = soln[2];
	copy.dtheta = soln[3];
	copy.T = this.T + dt;
	return copy;
}

Models.SinglePendulum.ode = function (_this, x)
{
	var s = Math.sin(x[2]);
	var c = Math.cos(x[2]);
	var dthetasq = x[3] * x[3];
	
	var M = [[_this.m0,0,0,0,-s],
		[0,0,_this.m1,0,s],
		[0,0,0,_this.m1,c],
		[1,_this.L*c,-1,0,0],
		[0,-_this.L*s,0,-1,0]];
	var b = [_this.F,0,-_this.m1*_this.g,s*dthetasq*_this.L,c*dthetasq*_this.L];
	var ddx = numeric.solve(M,b)
	return [x[1],ddx[0],x[3],ddx[1]];
}


Models.SinglePendulum.prototype.draw = function (ctx, canvas)
{
	resetCanvas(ctx,canvas);
	ctx.translate(0,-this.L);
	
	var cartWidth = 0.4*this.L;
	var cartHeight = 0.7*cartWidth;
	
	var tipX = this.x+this.L*Math.sin(this.theta);
	var tipY = this.L*Math.cos(this.theta)+cartHeight;
	
	// ground
	ctx.strokeStyle="#333366";
	drawLine(ctx,-100,-.025,100,-.025,0.05);
	
	// cart
	ctx.fillStyle="#4444FF";
	ctx.fillRect(this.x-cartWidth/2,0,cartWidth,cartHeight);
		
	// shaft
	ctx.strokeStyle="#AAAAFF";
    ctx.lineCap = 'round';
	drawLine(ctx,this.x,cartHeight,tipX,tipY,this.L/20.0);
		
	// tip-mass
	ctx.beginPath();
	ctx.arc(tipX, tipY, this.L/7, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#4444FF';
	ctx.fill();
	
	// force arrow
	var forceArrow = {x1:this.x,y1:0.5*cartHeight,x2:this.x+0.1*this.F,y2:0.5*cartHeight};
	ctx.strokeStyle="#FF0000";
    ctx.lineCap = 'round';	
	drawLine(ctx,forceArrow.x1,forceArrow.y1,forceArrow.x2,forceArrow.y2,this.L/40.0);
	drawLine(ctx,forceArrow.x2,forceArrow.y2,forceArrow.x2-Math.sign(this.F)*0.1,forceArrow.y2+0.05,this.L/40.0);
	drawLine(ctx,forceArrow.x2,forceArrow.y2,forceArrow.x2-Math.sign(this.F)*0.1,forceArrow.y2-0.05,this.L/40.0);
}

Models.SinglePendulum.prototype.infoText = function ()
{
	return  "/* Horizontal position       */ pendulum.x      = " + round(this.x,2)
		+ "\n/* Horizontal velocity       */ pendulum.dx     = " + round(this.dx,2)
		+ "\n/* Angle from vertical (rad) */ pendulum.theta  = " + round(this.theta,2)
		+ "\n/* Angular velocity (rad/s)  */ pendulum.dtheta = " + round(this.dtheta,2)
		+ "\n/* Simulation time (s)       */ pendulum.T      = " + round(this.T,2);	
}