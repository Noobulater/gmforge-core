sync.render("ui_charGenerator", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var newApp = sync.render("ui_template")(obj, app, scope).appendTo(div);

  var buttonBar = $("<div>").appendTo(div);
  buttonBar.addClass("fit-x flexrow");

  var button = $("<div>").appendTo(buttonBar);
  button.addClass("flex2 flexmiddle alttext highlight hover2 spadding");
  button.append("Create this character!");
  button.click(function(){
    createCharacter(obj.data.override);
  });

  return div;
});


sync.render("ui_charImporter", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  game.locals["newCharacter-"+app.attr("id")] = sync.obj("newCharacter-"+app.attr("id"));
  game.locals["newCharacter-"+app.attr("id")].data = {preview:{}, text:{}, options:{}, override:{}};

  var wrap = $("<div>").appendTo(div);
  wrap.addClass("flex flexcolumn");
  wrap.css("position", "relative");
  wrap.css("overflow", "auto");

  var newApp = sync.newApp("ui_import").appendTo(wrap);
  newApp.attr("XML", "true");
  game.locals["newCharacter-"+app.attr("id")].addApp(newApp);

  var button = $("<button>").appendTo(div);
  button.addClass("fit-x flexmiddle alttext highlight");
  button.css("font-size", "1.5em");
  button.append("Create this character!");
  button.click(function(){
    createCharacter(game.locals["newCharacter-"+app.attr("id")].data.override, true);
  });

  return div;
});
