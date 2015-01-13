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

var RippleSurface    = require('./RippleSurface');

var MouseSync      = require("famous/inputs/MouseSync");
var TouchSync      = require("famous/inputs/TouchSync");
var ScrollSync     = require("famous/inputs/ScrollSync");
var GenericSync    = require("famous/inputs/GenericSync");

GenericSync.register({
    "mouse"  : MouseSync,
    "touch"  : TouchSync,
    "scroll" : ScrollSync
});

var FaceRotations = {
  FRONT : [0, 0, 0],
  RIGHT: [Math.PI/2, 0, 0],
  TOP: [0, Math.PI/2, 0]
}


function RippleCube() {
    View.apply(this, arguments);

    this._rotationTransitionable = new Transitionable([0, 0, 0]);

    this._rootModifier = new Modifier({
      origin : [0.5, 0.5],
      align : [0.5, 0.5],
      transform : function () {
        var t = Transform.translate.apply(this, [0, 0, 0]);
        var r = Transform.rotate.apply(this, this._rotationTransitionable.get());
        return Transform.multiply(t, r);
      }.bind(this)
    });

    this._rootNode = this.add(this._rootModifier);

    this.sync = new GenericSync({
      "mouse"  : {},
      "touch"  : {},
      "scroll" : {scale : 0.3}
    });

    this.xLayers = [];
    this.yLayers = {};
    this.zLayers = {};

    this._createBackground();
    this._createXLayers();
    // this._createYLayers();
    // this._createZLayers();
    this._bindEvents();
}

RippleCube.prototype = Object.create(View.prototype);
RippleCube.prototype.constructor = RippleCube;

RippleCube.DEFAULT_OPTIONS = {};

RippleCube.prototype._createXLayers = function() {
  for(var i=0; i<11; i++) {
    var layerId = i;
    var layer = new RippleSurface({
      rotation : FaceRotations.FRONT,
      translation : [0, 0, (i-5) * 30],
      id : layerId
    });


    // layer._eventOutput.on('rippled', function(data) {
    //   try{
    //     this.xLayers[data.layerId-1]._eventInput.emit('ripple', data);
    //   }catch(err) {}
      
    //   try {
    //     this.xLayers[data.layerId+1]._eventInput.emit('ripple', data);
    //   }catch(err) {}
    //   // console.log(data.layerId, data.clientX, data.clientY);
    // }.bind(this));

    layer.pipe(this.sync);
    this.xLayers.push(layer);
    this._rootNode.add(layer);  
  }
  
}

RippleCube.prototype._createYLayers = function() {
  for(var i=0; i<11; i++) {
    var layer = new RippleSurface({
      rotation : FaceRotations.TOP,
      translation : [0, 0, (i-5) * 30]
    });
    layer.pipe(this.sync);
    this.yLayers.push(layer);
    this._rootNode.add(layer);  
  }
}

RippleCube.prototype._createZLayers = function() {
  for(var i=0; i<11; i++) {
    var layer = new RippleSurface({
      rotation : FaceRotations.RIGHT,
      translation : [0, 0, (i-5) * 30],
      id : 'z' + i
    });
    layer.pipe(this.sync);
    this.zLayers.push(layer);
    this._rootNode.add(layer);
  }
}

RippleCube.prototype._createBackground = function() {
  this._background = new Surface({
    size: [undefined, undefined]
  });
  this._background.pipe(this.sync);
  this.add(this._background);
}


RippleCube.prototype._bindEvents = function() {
  var self = this;

  // self._eventHandler.on('prismPressed', function(data) {
  //   self._prism.ripple(data.clientX, data.clientY);
  // });

  self.sync.on('update', function(data) {
    self._rotationTransitionable.halt();
    var old_rotation = self._rotationTransitionable.get();
    old_rotation[1] += data.delta[0]/100;
    old_rotation[0] -= data.delta[1]/100;

    var layerId = Math.ceil(Math.random()* self.xLayers.length) - 1;
    if(Math.random() > 0.9) self.xLayers[layerId]._eventInput.emit('ripple', {
      clientX : 0.5 * window.innerWidth, 
      clientY : 0.5 * window.innerHeight
    });
  });
}

module.exports = RippleCube;
