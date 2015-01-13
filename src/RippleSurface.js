var View = require('famous/core/View');
var RenderNode = require('famous/core/RenderNode');
var Surface = require('famous/core/Surface');
var Transform = require('famous/core/Transform');
var Transitionable = require('famous/transitions/Transitionable');
var Modifier = require('famous/core/Modifier');
var ContainerSurface = require('famous/surfaces/ContainerSurface');
var Easing           = require('famous/transitions/Easing');

var Ripple = require('./Ripple');
    
function RippleSurface() {
    View.apply(this, arguments);
    
    this._rotationTransitionable = new Transitionable(this.options.rotation);
    this._translationTransitionable = new Transitionable(this.options.translation);
    this.id = this.options.id;
    this._rootModifier = new Modifier({
      // opacity : 0.2,
      transform : function() {
        var r = Transform.rotate.apply(this, this._rotationTransitionable.get());
        var t = Transform.translate.apply(this, this._translationTransitionable.get());
        return Transform.multiply(r, t);
      }.bind(this)
    });
    this._rootNode = this.add(this._rootModifier);

    this._createSurface();
    this._bindEvents();
}

RippleSurface.prototype = Object.create(View.prototype);
RippleSurface.prototype.constructor = RippleSurface;

RippleSurface.DEFAULT_OPTIONS = {
  classes : ['backface'],
  rotation : [0, 0, 0],
  translation : [0, 0, 0]
};

RippleSurface.prototype.ripple = function ripple(x, y, delay) {
  var rect = this.containerSurface._currentTarget.getBoundingClientRect();
  x = x - rect.left;
  y = y - rect.top;
  
  var ripple = new Ripple({
    x : x,
    y : y,
    // rippleSpeed : this.options.rippleSpeed,
    // rippleBorderColor : this.options.rippleBorderColor,
    // rippleFillColor : this.options.rippleFillColor,
    // rippleLifetime : this.options.rippleLifetime,
    // curve : this.options.curve,
  });
  
  //fire it off.  
  ripple.start(delay);
  this.containerSurface.add(ripple);
}

/* PRIVATE */

RippleSurface.prototype._bindEvents = function() {
  this._eventInput.on('ripple', function(data) {
    if(data.rippleTTL > 0) {
      //ripple this surface, 
      this.ripple(data.clientX, data.clientY, 500);

      //emit event with ttl - 1
      data.layerId = this.id;
      data.rippleTTL -= 1;
      this._eventOutput.emit('rippled', data);  
    }
  }.bind(this));
}

RippleSurface.prototype._createSurface = function() {

  this.containerSurface = new ContainerSurface({
    classes : this.options.classes,
    size: [300, 300],
    properties : {
      '-webkit-box-shadow' : '0px 0px 2px 2px rgba(255, 255, 255, 1)',
      overflow: 'hidden'
    }
  });

  this.containerSurface.on('click', function(data) {
    this.ripple(data.clientX, data.clientY);
    
    data.layerId = this.id;
    data.rippleTTL = 5;
    this._eventOutput.emit('rippled', data);
  }.bind(this));
  
  this.containerSurface.pipe(this._eventOutput);
  this._rootNode.add(this.containerSurface);
}


module.exports = RippleSurface;
