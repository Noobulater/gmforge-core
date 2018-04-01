sync.render("ui_characterArmor", function(obj, app, scope){
  var data = obj.data;
  var div = $("<div>");
  scope = scope || {viewOnly: false};
  var newScope = duplicate(scope);
  newScope.target = sync.newValue("Armor");
  sync.rawVal(newScope.target, sync.eval("@:armor()", {c : duplicate(obj.data)}));
  newScope.width = scope.width || "75px";
  newScope.height = scope.height || "75px";
  newScope.viewOnly = true;

  return sync.render(scope.armor || "ui_armorParted")(obj, app, newScope);
});


sync.render("ui_characterBody", function(obj, app, scope){
  var data = obj.data;
  var div = $("<div>");

  var container = $("<div>").appendTo(div);
  container.addClass("flexmiddle");

  var gear = sync.render("ui_characterArmor")(obj, app, scope).appendTo(container);
  scope.refresh = true;
  var body = sync.render("ui_body")(obj, app, scope).appendTo(container);
  var gear = sync.render("ui_characterGear")(obj, app, scope);
  if (scope.minimized) {
    body.css("width", "100px");
    body.css("height", "100px");
    gear.addClass("subtitle");
    gear.appendTo(div);
  }
  else {
    gear.appendTo(container);
  }


  return div;
});
