/*
 * This file is part of the conga-pubsub module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The Channel holds on to a subcriber and publisher
 * connection for a specific channel name and provides
 * the methods to interact with the channel
 * 
 * @param  {String} name       the channel name
 * @param  {Object} publisher  the publisher connection
 * @param  {Object} subscriber the subscriber connection
 */
var Channel = function(name, publisher, subscriber){
	this.name = name;
	this.publisher = publisher;
	this.subscriber = subscriber;
}

Channel.prototype = {

	/**
	 * Connect to the channel
	 * 
	 * @param  {Function} cb
	 * @return {void}
	 */
	connect: function(cb){

		var publisher = this.publisher;
		var subscriber = this.subscriber;
		var channel = this.name;

		subscriber.connect(function(){
			subscriber.subscribe(channel, function(){
				publisher.connect(function(){
					cb();
				});
			})
		});
	},

	/**
	 * Add a listener to the channel
	 * 
	 * @param  {String} event      the subscribed event name
	 * @param  {Function} listener the handler function
	 * @return {void}
	 */
	addListener: function(event, listener){
		this.subscriber.addListener(this.name, event, listener);
	},

	/**
	 * Publish a message for a given event to the channel
	 * 
	 * @param  {String} event   the event name
	 * @param  {Object} message the message
	 * @return {void}
	 */
	publish: function(event, message){
		this.publisher.publish(this.name, event, message);
	},

	/**
	 * Subscribe to the channel
	 * 
	 * @param  {Function} cb
	 */
	subscribe: function(cb){
		this.subscriber.subscribe(this.name, cb);
	},

	/**
	 * Unsubscribe from the channel
	 * 
	 * @param  {Function} cb 
	 * @return {void}
	 */
	unsubscribe: function(cb){
		this.subscriber.unsubscribe(cb);
	}
};

module.exports = Channel;