var plugin = require("./plugin");
module.exports = function(PluginHost) {
  var app = PluginHost.owner;
  /**
   * used like so:
   * --external-aliases privateapi,privateAPI,hiddenAPI
   * or
   * -ea privateapi,privateAPI
   */
  app.options.addDeclaration({ name: 'external-aliases', short: 'ea' });
  /**
   * used like so:
   * --internal-aliases publicapi
   * or
   * -ia publicapi
   */
  app.options.addDeclaration({ name: 'internal-aliases', short: 'ia' });

  app.converter.addComponent('internal-external', plugin.InternalExternalPlugin);
};

