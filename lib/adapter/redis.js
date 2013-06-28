/*
 * This file is part of the conga-pubsub module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// third-party modules
var redis = require("redis");

/**
 * The RedisAdapter creates a connection to a
 * redis instance and provides methods to deal
 * with pub/sub
 * 
 * @param  {Object} config the connection config
 */
var RedisAdapter = function(config){
	this.config = config;
	this.listeners = {};
}

RedisAdapter.prototype = {

	/**
	 * Hash of registered listeners
	 * 
	 * @type {Object}
	 */
	listeners: {},

	/**
	 * Connect to the redis server
	 * 
	 * @param  {Function} cb
	 * @return {void}
	 */
	connect: function(cb){

		this.client = redis.createClient(this.config.port, this.config.host, this.config);

		var listeners = this.listeners;

		this.client.on("message", function(channel, msg){

			var message = JSON.parse(msg);

			// find listeners
			if (typeof listeners[channel] !== 'undefined' && listeners[channel][message.event] !== 'undefined'){
				
				var ls = listeners[channel][message.event];

				if (typeof ls !== 'undefined'){
					ls.forEach(function(listener){
						listener(message.message);
					});				
				}
			}
		});

		this.client.on("ready", function(){
			cb();
		});

		this.client.on("error", function(err){
			console.log("REDIS ERROR-------");
			console.log(err);
		});
		
	},

	/**
	 * Subscribe to a channel
	 * 
	 * @param  {String}   channel   the channel name
	 * @param  {Function} cb
	 * @return {void}
	 */
	subscribe: function(channel, cb){

		this.client.subscribe(channel);

		this.client.on("subscribe", function(){
			cb();
		});
	},

	/**
	 * Unsubscribe from the current channel
	 * 
	 * @param  {Function} cb 
	 * @return {void}
	 */
	unsubscribe: function(cb){
		this.client.unsubscribe();
		cb();
	},

	/**
	 * Add a listener for a channel and event
	 * 
	 * @param  {String}   channel  the channel name
	 * @param  {String}   event    the event name
	 * @param  {Function} listener the listener function
	 * @return {void}
	 */
	addListener: function(channel, event, listener){

		// make sure that channel exists
		if (typeof this.listeners[channel] === 'undefined'){
			this.listeners[channel] = {};
		}

		// make sure that event exists
		if (typeof this.listeners[channel][event] === 'undefined'){
			this.listeners[channel][event] = [];
		}

		// add the listener
		this.listeners[channel][event].push(listener);
	},

	/**
	 * Publish a message to the given channel
	 * 
	 * @param  {String} channel  the channel name
	 * @param  {String} event    the event name
	 * @param  {Object} message  the message
	 * @return {void}
	 */
	publish: function(channel, event, message){

		// build the actual message
		var msg = {
			event: event,
			message: message
		};

		this.client.publish(channel, JSON.stringify(msg));
	}
};

module.exports = RedisAdapter;