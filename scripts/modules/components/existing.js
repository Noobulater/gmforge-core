sync.render("ui_existing", function(obj, app, scope) {
  var content = $("<div>");
  content.addClass("flexaround flexwrap");
  var finalList = [];
  for (var key in game.entities.data) {
    var ent = game.entities.data[key];
    if (ent && (ent.data["_t"] == "c" || ent.data["_t"] == "v") && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
      var list = [];
      var listRef = sync.traverse(ent.data, scope.lookup);
      for (var listKey in listRef) {
        var refData = listRef[listKey];
        if (refData && !util.contains(finalList, JSON.stringify(refData))) {
          list.push(finalList.length);
          finalList.push(JSON.stringify(refData));
        }
      }
      if (list.length) {
        var container = $("<div>").appendTo(content);
        container.addClass("subtitle");

        var charDiv = sync.render("ui_characterSummary")(ent, app, {minimized: true, height : "35px"});
        charDiv.addClass("background alttext");
        charDiv.removeClass("fit-xy");
        charDiv.appendTo(container);

        for (var refKey in list) {
          var refData = JSON.parse(finalList[list[refKey]]);
          var refPlate = $("<div>").appendTo(container);
          refPlate.css("margin-left", "8px");
          refPlate.addClass("outline hover2");
          if (refData) {
            if (refData._t) {
              if (sync.rawVal(refData.info.img)) {
                var img = $("<img>").appendTo(refPlate);
                img.attr("width", "auto");
                img.attr("height", "25px");
                img.attr("src", sync.rawVal(refData.info.img));
              }
              var namePlate = $("<b>").appendTo(refPlate);
              namePlate.append(sync.rawVal(refData.info.name));
              refPlate.attr("index", list[refKey]);
              refPlate.click(function(){
                var refData = finalList[$(this).attr("index")];
                obj.data = JSON.parse(refData);
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
              });
            }
            else {
              var namePlate = $("<b>").appendTo(refPlate);
              namePlate.append(refData.name);
              refPlate.attr("index", list[refKey]);
              refPlate.click(function(){
                var refData = finalList[$(this).attr("index")];
                obj.data = JSON.parse(refData);
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
              });
            }
          }
        }
      }
    }
  }
  if (finalList.length){
    return content;
  }
  else {
    return $("<div>");
  }
});
