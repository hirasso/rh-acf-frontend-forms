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

export default function plugin(
  pluginName: string,
  className: any,
  shortHand = false,
) {
  let dataName = `${pluginName}`;
  let dataOptionsName = `${dataName.toLowerCase()}-options`;
  let old = ($.fn as any)[pluginName];

  ($.fn as any)[pluginName] = function (this: any, option: any) {
    return this.each(function (this: any) {
      let $this = $(this);
      let data = $this.data(dataName);
      let dataOptions = $this.data(dataOptionsName);
      let options = $.extend(
        {},
        className.DEFAULTS,
        dataOptions,
        typeof option === "object" && option,
      );

      if (!data) {
        $this.data(dataName, (data = new className(this, options)));
      }

      if (typeof option === "string") {
        data[option]();
      }
    });
  };

  // - Short hand
  if (shortHand) {
    $[pluginName] = (options: any) =>
      ($({})[pluginName as any] as any)(options);
  }

  // - No conflict
  ($.fn as any)[pluginName].noConflict = () =>
    (($.fn as any)[pluginName] = old);
}
