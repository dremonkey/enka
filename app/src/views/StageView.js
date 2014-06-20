/* globals define */

/**
 * This is the stages stripe (menu item) view
 */
define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier      = require('famous/core/Modifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var Easing        = require('famous/transitions/Easing');
  var Timer         = require('famous/utilities/Timer');

  // ## View Elements
  function _createBackground() {
    this.bg = new Surface({
      size: [undefined, this.options.height],
      content: this.options.content,
      properties: {
        backgroundColor: this.options.backgroundColor,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        color: 'white'
      }
    });

    this.bgMod = new Modifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.bgMod).add(this.bg);
    // this.node.add(this.bgMod).add(this.bg);
  }

  function _createLevelButtonView() {
    var buttonBg = new Surface({
      size: [150, 35],
      content: 'Start Playing',
      properties: {
        backgroundColor: 'black',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        color: 'white',
        textAlign: 'center'
      }
    });

    var buttonMod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.inFront
    });

    // this.add(buttonMod).add(buttonBg);
    // this.node.add(buttonMod).add(buttonBg);
    // this.add(buttonBg);
  }

  // ## Event Handlers/Listeners    
  function _setListeners(){

    function handleClick(e) {
      this._eventOutput.emit('selectStage', {
        index: this.options.index,
        // backgroundColor: this.options.backgroundColor,
        node: this,
        event: e
      });
    }

    this.bg.pipe(this._eventOutput);
    this.bg.on('click', handleClick.bind(this));
  }

  function StageView() {
    View.apply(this, arguments);

    // var viewMod = new Modifier({
    //   size: [undefined, this.options.height]
    // });

    // this.node = this.add(viewMod);

    _createBackground.call(this);
    // _createLevelButtonView.call(this);

    _setListeners.call(this);
  }

  StageView.prototype = Object.create(View.prototype);
  StageView.prototype.constructor = StageView;

  StageView.DEFAULT_OPTIONS = {
    height: 100,
    expandedHeight: window.innerHeight,
    content: 'I',
    backgroundColor: 'blue'
  };

  function _animateSize(node, options, callback) {
    var transition = {
      duration: 300,
      curve: Easing.inOutQuad
    };

    var start = options.start || 0;
    var end = options.end || 0;
    var axis = options.axis && options.axis.toLowerCase() || 'y';

    var transitionable = new Transitionable(start);

    var prerender = function() {
      var size = [];
      var pixels = transitionable.get();

      if (axis === 'x') {
        size = [pixels, undefined];
      } else if (axis === 'y') {
        size = [undefined, pixels];
      } else {
        size = [pixels, pixels];
      }

      node.setOptions({
        size: size
      });
    };

    var complete = function(){
      Engine.removeListener('prerender', prerender);
      console.log('StageView _animateSize complete');
      if (callback) callback();
    };

    Engine.on('prerender', prerender);

    transitionable.set(end, transition, complete);
  }

  StageView.prototype.expand = function() {
    _animateSize(this.bg, {
      start: this.options.height,
      end: this.options.expandedHeight,
      axis: 'y'
    });
  };

  StageView.prototype.contract = function(callback) {
    console.log('contract');
    _animateSize(this.bg, {
      start: this.options.expandedHeight,
      end: this.options.height,
      axis: 'y'
    }, callback);
  };

  module.exports = StageView;
});