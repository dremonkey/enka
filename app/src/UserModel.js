define(function(require, exports, module) {
  // ## Dependencies
  var _ = require('lodash');
  var db = require('localforage');

  // ## Famous Dependencies
  var OptionsManager = require('famous/core/OptionsManager');
  var Timer = require('famous/utilities/Timer');

  // ## App Dependencies
  var LivesController = require('LivesController');

  function _init() {

    db.ready().then(function() {
      
      db.getItem('created').then(function(created) {

        // if user exists in the db, load him/her
        if (created) {
          console.log('loading user');

          var options = {};
          var promises = [];

          _.each(this.constructor.DEFAULT_OPTIONS, function(val, key) {
            var promise = db.getItem(key).then(function(value) {
              options[key] = value;
            }.bind(this));

            promises.push(promise);
          }.bind(this));

          Promise.all(promises).then(function() {
            this.setOptions(options);
          }.bind(this));

        }
        // otherwise create a new user
        else {

          if (!this.options.created) {
            this.options.created = Date.now();
          }

          this.save(this.options);
        }

        this._instance = this;

      }.bind(this));
    }.bind(this));
  }

  function User(options) {
    
    if (this._instance) {
      return this._instance;
    }

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);
    _.extend(this.options, this.constructor.DEFAULT_OPTIONS);

    // initialize user
    _init.call(this);
  }

  User._instance = null;

  User.DEFAULT_OPTIONS = {
    created: '',
    latestStage: 1,
    latestLevel: 1,
    lives: 5,
    lastDeath: '',
    lastRecharge: ''
  };

  User.prototype.save = function(data) {
    db.ready().then(function() {
      _.each(data, function(val, key) {
        db.setItem(key, val, function() {
          console.log('Saved `' + key + '` to DB with value `' + val + '`');
        });
      });
    }.bind(this));
  };

  /**
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  User.prototype.getOptions = function getOptions() {
      return this._optionsManager.value();
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  User.prototype.setOptions = function setOptions(options) {
      this._optionsManager.patch(options);
  };

  User.prototype.hasUnlockedStage = function(stage) {

  };

  /**
   * 
   */
  User.prototype.getLatestLevel = function() {
    return {
      stage: this.options.latestStage,
      level: this.options.latestLevel
    };
  };

  User.prototype.setLatestLevel = function(stage, level) {

    var options = {
      latestStage: stage,
      latestLevel: level
    };
    
    // update options
    this.setOptions(options);

    // save to databse
    this.save(options);
  };

  module.exports = User;
});