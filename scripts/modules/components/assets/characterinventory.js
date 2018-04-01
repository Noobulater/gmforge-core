sync.render("ui_characterInventory", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var div = $("<div>");

  var columns = $("<div>").appendTo(div);
  columns.addClass("flexaround");

  var inventory = sync.render("ui_inventory")(obj, app, scope).appendTo(columns);
  inventory.addClass("flex");
  var equipped = false;
  for (var i in obj.data.inventory) {
    if (obj.data.inventory[i].tags && !obj.data.inventory[i].tags["noEQ"]) {
      equipped = true;
    }
  }
  if (equipped) {
    var gearContainer = $("<div>").appendTo(columns);
    gearContainer.css("width", "40%");

    var title = $("<h1 style='text-align: center;'>Gear</h1>").appendTo(gearContainer);

    var dragContainer = sync.render("ui_characterGear")(obj, app, {large : true, viewOnly : scope.viewOnly}).appendTo(gearContainer);
  }

  return div;
});
