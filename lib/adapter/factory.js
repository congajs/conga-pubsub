/*
 * This file is part of the conga-pubsub module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The adapter factory which returns an Adapter
 * instance of the requested type
 * 
 * @type {Object}
 */
module.exports = {

	/**
	 * Create an Adapter instance
	 * 
	 * @param  {String} type    the adapter name
	 * @param  {Object} options hash of config options for adapter
	 * @return {Object}
	 */
	factory: function(type, options){
		var Adapter = require("./" + type);
		return new Adapter(options);
	}
};