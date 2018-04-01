sync.render("ui_characterProficiency", function(obj, app, scope){
  var data = obj.data;
  var div = $("<div>");
  div.addClass("padding");
  
  var info = data.info;

  var title = $("<b class='flexmiddle'>"+(scope.name || "Proficiencies")+"</b>").appendTo(div);
  if (!scope.viewOnly) {
    var icon = genIcon("plus").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      ui_prompt({
        target : $(this),
        id : "add-proficincy",
        inputs : {
          "Name" : ""
        },
        click : function(ev, inputs) {
          data.proficient[inputs["Name"].val()] = true;
          obj.sync("updateAsset");
        }
      });
    });
  }

  var proficientList = $("<div>").appendTo(div);
  proficientList.addClass("subtitle");

  for (var index in data.proficient) {
    var infoPlate = $("<div>").appendTo(proficientList);
    infoPlate.addClass("flexbetween outline spadding");
    infoPlate.css("background-color", "white");

    var name = $("<b>").appendTo(infoPlate);
    name.append(index);

    if (scope.viewOnly) {
      infoPlate.css("background-color", "rgb(235,235,228)");
    }
    else {
      var icon = genIcon("remove").css("color", "red").appendTo(infoPlate);
      icon.css("text-align", "center");
      icon.attr("ref", index);
      icon.click(function() {
        delete data.proficient[$(this).attr("ref")];
        obj.sync("updateAsset");
      });
    }
  }

  return div;
});
