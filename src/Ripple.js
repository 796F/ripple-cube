var View             = require('famous/core/View');
var Surface          = require('famous/core/Surface');
var Transform        = require('famous/core/Transform');
var Modifier         = require('famous/core/Modifier');
var RenderNode       = require('famous/core/RenderNode');
var Transitionable   = require('famous/transitions/Transitionable');
var SpringTransition = require('famous/transitions/SpringTransition');
var Easing           = require('famous/transitions/Easing');
var StateModifier    = require('famous/modifiers/StateModifier');
var Circle           = require('famous/physics/bodies/Circle');
var Particle         = require('famous/physics/bodies/Particle');
var Vector           = require('famous/math/Vector');
var EventEmitter     = require('famous/core/EventEmitter');
var RotationalSpring = require('famous/physics/forces/RotationalSpring');
var Quaternion       = require('famous/math/Quaternion');

function Ripple() {
    View.apply(this, arguments);

    this._rippleScaleTransitionable = new Transitionable(0);
    this._rippleOpacityTransitionable = new Transitionable(1);
    var rippleProperties = this.options.properties;
    rippleProperties['-webkit-box-shadow'] = '0px 0px 3px 3px rgba(' + this.options.rippleBorderColor.join(',') + ')';
    rippleProperties['background'] = 'rgba(' + this.options.rippleFillColor.join(',') + ')';
    
    this.active = false; 
    this._rippleSurface = new Surface({
      size : [500, 500],
      properties : rippleProperties,
      classes : ['backface']
    });

    this._rippleModifier = new Modifier({
      opacity : function() {
        return this._rippleOpacityTransitionable.get();
      }.bind(this),
      origin: [0.5, 0.5],
      transform: function() {
        var scale = this._rippleScaleTransitionable.get();
        var t = Transform.translate(this.options.x, this.options.y, 0);
        var s = Transform.scale(scale, scale, 1);
        return Transform.multiply(t, s);
      }.bind(this)
    });

    this.add(this._rippleModifier).add(this._rippleSurface);
}

Ripple.prototype = Object.create(View.prototype);
Ripple.prototype.constructor = Ripple;

Ripple.DEFAULT_OPTIONS = {
  properties : {
    // border : '2px solid rgba(107,203,255,1)',
    '-webkit-box-shadow' : '0px 0px 3px 3px rgba(107,203,255,0.6)',
    borderRadius : '50%',
    pointerEvents : 'none'
  },
  classesRipple : ['backface'],
  rippleSpeed : 100000,
  rippleLifetime : 50000,
  rippleBorderColor : [107,203,255, 1],
  rippleFillColor : [107,203,255, 0],
  curve : Easing.outQuart
};

Ripple.prototype.render = function render() {
  if(this.active) {
    return this._node.render();
  }else{
    return undefined;
  }
}

Ripple.prototype.start = function start(delay) {
  this.active = true;
  this._rippleScaleTransitionable.delay(delay);
  this._rippleScaleTransitionable.set(2, { duration : this.options.rippleSpeed, curve : this.options.curve });
  this._rippleOpacityTransitionable.delay(delay);
  this._rippleOpacityTransitionable.set(0, { duration : this.options.rippleLifetime }, function() {
    this.active = false;
  }.bind(this))

}

/* Private */

function _ExpDecayFn(t) {
}

module.exports = Ripple;
