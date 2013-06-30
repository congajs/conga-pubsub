/*
 * This file is part of the conga-pubsub module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var AdapterFactory = require("./adapter/factory");
var Channel = require("./channel");
var PubSub = require("./pubsub");

/**
 * The PubSubListener creates connections to all configured
 * pubsub channels and attaches event listeners to them
 *
 * @author  Marc Roulias <marc@lampjunkie.com>
 */
var PubSubListener = function(){};

PubSubListener.prototype = {

	/**
	 * Create the pubsub object with all channel connections
	 * and add it to the container on kernel compile
	 * 
	 * @param  {Object}   event
	 * @param  {Function} next
	 * @return {void}
	 */
	onKernelCompile: function(event, next){
		
		var self = this;
		var container = event.container;
		var config = container.get('config').get('pubsub');

		container.get('logger').debug('initializing pubsub');

		// create the main pubsub object
		var pubsub = new PubSub();

		// set pubsub on container
		container.set('pubsub', pubsub);

		this.addChannels(container, pubsub, config, function(){
			self.addListeners(container, pubsub, function(){
				next();
			});
		});
	},

	/**
	 * Add all of the configured channels to the given PubSub object
	 * 
	 * @param  {PubSub}   pubsub
	 * @param  {Object}   config
	 * @param  {Function} next 
	 * @return {void}
	 */
	addChannels: function(container, pubsub, config, next){

		container.get('logger').debug('adding pubsub channels');
		var calls = [];

		for (var i in config){

			var channelConfig = config[i];

			(function(channel, channelConfig){

				calls.push(function(cb){

					var publisher = AdapterFactory.factory(channelConfig.adapter.type, channelConfig.adapter.options);
					var subscriber = AdapterFactory.factory(channelConfig.adapter.type, channelConfig.adapter.options);
					var channel = new Channel(i, publisher, subscriber);

					pubsub.addChannel(channel);

					channel.connect(function(){
						cb();
					});
				});

			}(i, channelConfig));
		}

		container.get('async').series(calls, function(){
			next();
		})
	},

	/**
	 * Add all of the pubsub listeners to the channels
	 * they are each supposed to be registered to
	 * 
	 * @param  {Container}  container
	 * @param  {PubSub}     pubsub
	 * @param  {Function}   next
	 * @return {void}
	 */
	addListeners: function(container, pubsub, next){

		// find all tagged listeners
		var tags = container.getTagsByName('pubsub.listener');

		if (tags){
			// add listeners
			tags.forEach(function(tag){

				var obj = container.get(tag.getServiceId());
				var method = tag.getParameter('method');
				var listener = function(message){
					obj[method].call(obj, tag.getParameter('event'), message);
				};

				pubsub.getChannel(tag.getParameter('channel')).addListener(
					tag.getParameter('event'), 
					listener
				);		
			});			
		}

		next();
	}
};

module.exports = PubSubListener;