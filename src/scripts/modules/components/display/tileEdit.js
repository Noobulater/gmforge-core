sync.render("ui_tileEdit", function(obj, app, scope){
  scope = scope || {
    layer : app.attr("layer"),
    tile : app.attr("tile"),
    local : app.attr("local") == "true",
  };
  var div = $("<div>");

  var tileData = obj.data.layers[scope.layer].t[scope.tile];

  if (tileData) {
    var positions = $("<div>");
    positions.addClass("flexrow");

    var misc = $("<div>");
    misc.addClass("fit-x flexaround");
    misc.css("font-size", "1.2em");

    var tiledDiv = $("<div>").appendTo(misc);
    tiledDiv.addClass("flexmiddle lrpadding");

    var tiled = genInput({
      parent : tiledDiv,
      type : "checkbox"
    }).css("margin", "0").addClass("lrpadding");
    if (tileData.t) {
      tiled.prop("checked", true);
    }

    tiledDiv.append("<b class='lrpadding'>Tiled</b>");

    var pin = genIcon("pushpin").appendTo(misc);
    pin.addClass("flex flexmiddle");
    pin.attr("title", "Piece can only be interacted by double clicking on it");
    if (tileData.l) {
      pin.addClass("smooth highlight outline alttext");
    }
    pin.click(function(){
      tileData.l = !tileData.l;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var del = genIcon("trash").appendTo(misc);
    del.addClass("flex flexmiddle");
    del.attr("title", "Delete this Tile");
    del.click(function(){
      ui_prompt({
        target : $(this),
        confirm : "Delete Tile",
        click : function(ev, inputs){
          obj.data.layers[scope.layer].t.splice(scope.tile, 1);
          layout.coverlay("tile-popout-"+obj.id()+"-"+scope.layer+"-"+scope.tile);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    });

    var xPos = genInput({
      parent : positions,
      type : "number",
      min : 0,
      placeholder : "xPos",
      value : tileData.x,
      style : {"width" : "50px"},
    });

    var yPos = genInput({
      parent : positions,
      type : "number",
      min : 0,
      placeholder : "yPos",
      value : tileData.y,
      style : {"width" : "50px"},
    });

    var sizes = $("<div>");
    sizes.addClass("flexrow");

    var wPos = genInput({
      parent : sizes,
      type : "number",
      min : 16,
      placeholder : "width",
      value : tileData.w,
      style : {"width" : "50px"},
    });

    var hPos = genInput({
      parent : sizes,
      type : "number",
      min : 16,
      placeholder : "height",
      value : tileData.h,
      style : {"width" : "50px"},
    });

    var controls = ui_controlForm({
      inputs : {
        "" : misc,
        "Position(X,Y)" : positions,
        "Size(W,H)" : sizes,
        "Rotation" : tileData.r
      },
      click : function(ev, inputs) {
        tileData.t = (tiled.prop("checked") == true);
        tileData.x = Number(xPos.val());
        tileData.y = Number(yPos.val());
        tileData.w = Number(wPos.val());
        tileData.h = Number(hPos.val());
        tileData.r = Number(inputs["Rotation"].val());
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
        layout.coverlay("tile-popout-"+obj.id()+"-"+scope.layer+"-"+scope.tile);
      }
    }).appendTo(div);
  }
  else {
    div.append("<b>Tile not Found</b>");
  }

  return div;
});
