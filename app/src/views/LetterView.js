define(function(require, exports, module) {
  var _             = require('lodash');
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Modifier      = require('famous/core/Modifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var Easing        = require('famous/transitions/Easing');
  var Timer         = require('famous/utilities/Timer');

  var letters = {
    F: {
      animationChain: ['height', 'width', 'width'],
      surfaces: [{
        origin: [0, 1],
        size: [37, 125],
        backgroundColor: '#282C38',
        translate: Transform.translate(0, 0, 0),
        zIndex: 10
      }, {
        origin: [0, 0],
        size: [80, 37],
        backgroundColor: '#FA1435',
        translate: Transform.translate(0, 0, 0),
        zIndex: 15
      }, {
        origin: [0, 0],
        size: [80, 37],
        backgroundColor: '#18C5DC',
        translate: Transform.translate(0, 46, 0),
        zIndex: 5
      }]
    },

    pyramid: {
      animationChain: ['height', 'height', 'height'],
      surfaces:[{
        origin: [0.5, 1],
        size: [160, 40],
        classes: ['logo', 'logo-brick', 'logo-bottom'],
        translate: Transform.translate(0, 0, 1),
        zIndex: 5
      }, {
        origin: [0.5, 1],
        size: [100, 25],
        classes: ['logo', 'logo-brick', 'logo-middle'],
        translate: Transform.translate(0, -45, 1),
        zIndex: 5
      }, {
        origin: [0.5, 1],
        size: [65, 16],
        classes: ['logo', 'logo-brick', 'logo-top'],
        translate: Transform.translate(0, -75, 1),
        zIndex: 5
      }]
    }
  };

  function _createLetterSurface(options) {
    return new Surface({
      size: [options.width, options.height],
      classes: options.classes || [],
      properties: {
        backgroundColor: options.backgroundColor,
        zIndex: options.zIndex,
        pointerEvents: 'none'
      }
    });
  }

  function _createLetterModifier(options) {
    return new Modifier({
      origin: options.origin,
      transform: options.translate
    });
  }

  function _animateLetterSurface(node, options, duration) {
    var dur = duration || duration === 0 ? duration : 250;

    Timer.setTimeout(function() {
      var transition = {duration: dur, curve: Easing.inOutQuad };

      var start = 0;
      var end = !options.width && options.size[0] || !options.height && options.size[1];

      var transitionable = new Transitionable(start);

      function prerender() {
        var width = options.width || transitionable.get();
        var height = options.height || transitionable.get();

        node.setOptions({
          size: [width, height]
        });
      }

      function complete() {
        Engine.removeListener('prerender', prerender.bind(this));
      }

      Engine.on('prerender', prerender.bind(this));

      transitionable.set(end, transition, complete.bind(this));
    }.bind(this, options.index), options.index * dur);
  }

  function _createLetter(letter) {

    // retrieve the letter definition
    letter = letters[letter];

    for (var i = 0; i < letter.surfaces.length; i++) {
      var options = _.extend({}, letter.surfaces[i]);

      options.index = i;

      if (letter.animationChain[i] === 'width') {
        options.height = options.size[1];
        options.width = 0;
      }
      else {
        options.height = 0;
        options.width = options.size[0];
      }

      var surface = _createLetterSurface(options);
      var modifier = _createLetterModifier(options);

      surface._options = options;

      this._surfaces.push(surface);
      this.add(modifier).add(surface);
    }
  }

  function LetterView() {
    View.apply(this, arguments);

    this._surfaces = [];

    _createLetter.call(this, this.options.letter);
  }

  LetterView.prototype = Object.create(View.prototype);
  LetterView.prototype.constructor = LetterView;

  LetterView.DEFAULT_OPTIONS = {
    letter: 'pyramid'
  };

  LetterView.prototype.show = function(callback) {
    var dur = 250;

    for (var i = 0; i < this._surfaces.length; i++) {
      var surface = this._surfaces[i];
      _animateLetterSurface(surface, surface._options, dur);
    }

    Timer.setTimeout(function() {
      if (callback) {
        callback();
      }
    }, dur * this._surfaces.length);
  };

  module.exports = LetterView;
});
