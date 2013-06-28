/**
 * The PubSub class holds on to all registered channels
 * and provides methods to set/get channels
 * 
 */
var PubSub = function(){
	this.channels = {};
};

PubSub.prototype = {

	/**
	 * Add a Channel
	 * 
	 * @param  {Channel} channel the channel object
	 * @return {void}
	 */
	addChannel: function(channel){
		this.channels[channel.name] = channel;
	},

	/**
	 * Get a Channel by name
	 * 
	 * @param  {String} name   the channel name
	 * @return {Channel}
	 */
	getChannel: function(name){

		if (typeof this.channels[name] === 'undefined'){
			console.log('unable to find channel: ' + name);
			process.exit();
		}

		return this.channels[name];
	}
};

module.exports = PubSub;