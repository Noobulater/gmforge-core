sync.render("ui_characterGear", function(obj, app, scope){
  var data = obj.data;
  var div = $("<div>");
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var gearContainer = $("<div>").appendTo(div);
  gearContainer.css("background-color", "white");
  for (var index in data.inventory) {
    var itemData = data.inventory[index];
    if (itemData.tags && itemData.tags["equipped"] && !sync.modifier(itemData.info.name, "noEQ")) {
      var equipment = $("<div>").appendTo(gearContainer);
      equipment.addClass("spadding outline smooth fit-x");
      equipment.attr("index", index);
      if (!scope.viewOnly && game.templates.actions && game.templates.actions["i"]) {
        equipment.addClass("hover2");
        equipment.click(function(){
          var itemIndex = $(this).attr("index");
          var itemData = data.inventory[$(this).attr("index")];

          var actionObj = sync.dummyObj();
          actionObj.data = {context : {c : obj.id(), i : itemIndex}};

          game.locals["actionsList"] = game.locals["actionsList"] || {};
          game.locals["actionsList"][app.attr("id")+"-"+obj.data._t] = actionObj;

          var actionApp = sync.newApp("ui_renderAction");
          actionObj.addApp(actionApp);

          var pop = ui_popOut({
            target : $(this),
            minimize : true,
            prompt : true,
            dragThickness : "0.5em",
            title : "Action"
          }, actionApp);
          pop.resizable();
        });
      }
      var newScope = duplicate(scope);
      newScope.display = game.templates.display.item.summary;
      newScope.lookup = "inventory."+index+".";
      newScope.context = sync.defaultContext();
      newScope.context.i = itemData;

      equipment.append(sync.render("ui_processUI")(obj, app, newScope));
    }
  }
  return div;
});
