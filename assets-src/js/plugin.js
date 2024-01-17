
const $ = window.jQuery;

/**
 * Generate a jQuery plugin
 * https://gist.github.com/monkeymonk/c08cb040431f89f99928132ca221d647
 *
 * @param pluginName [string] Plugin name
 * @param className [object] Class of the plugin
 * @param shortHand [bool] Generate a shorthand as $.pluginName
 *
 * @example
 * import plugin from 'plugin';
 *
 * class MyPlugin {
 *     constructor(element, options) {
 *         // ...
 *     }
 * }
 *
 * MyPlugin.DEFAULTS = {};
 *
 * plugin('myPlugin', MyPlugin');
 */

export default function plugin(pluginName, className, shortHand = false) {
	let dataName = `${pluginName}`;
	let dataOptionsName = `${dataName.toLowerCase()}-options`;
	let old = $.fn[pluginName];

	$.fn[pluginName] = function (option) {
		return this.each(function () {
			let $this = $(this);
			let data = $this.data(dataName);
			let dataOptions = $this.data(dataOptionsName);
			let options = $.extend({}, className.DEFAULTS, dataOptions, typeof option === 'object' && option);

			if (!data) {
				$this.data(dataName, (data = new className(this, options)));
			}

			if (typeof option === 'string') {
				data[option]();
			}
		});
	};

	// - Short hand
	if (shortHand) {
		$[pluginName] = (options) => $({})[pluginName](options);
	}

	// - No conflict
	$.fn[pluginName].noConflict = () => $.fn[pluginName] = old;
}
