// load css
require('./styles');

// Load polyfills
require('famous-polyfills');

// import dependencies
var Engine = require('famous/core/Engine');
var RippleCube = require('./RippleCube');
// create the main context
var mainContext = Engine.createContext();
mainContext.setPerspective(1000);
var rippleCube = new RippleCube();
mainContext.add(rippleCube);
