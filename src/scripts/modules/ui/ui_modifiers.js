sync.render("ui_modifiers", function(obj, app, scope) {
  scope = scope || {
    viewOnly : (app.attr("viewOnly") == "true"),
    modsOnly : (app.attr("modsOnly") == "true"),
    total : (app.attr("total")),
    text : app.attr("text") || "",
    modText : app.attr("modText") || ""
  };
  scope.lookup = scope.lookup || app.attr("lookup");

  var value = sync.traverse(obj.data, scope.lookup);
  var content = $("<div>");
  content.addClass("flexcolumn subtitle spadding smooth");
  content.css("background-color", "white");

  var title = $("<div>").appendTo(content);
  title.addClass("fit-x flexmiddle");

  if (scope.text) {
    title.append("<b>"+scope.text+"</b>");
  }
  else {
    title.append("<b>"+value.name+"</b>");
  }
  if (!scope.modsOnly) {
    var edit = genInput({
      parent : content,
      value : sync.rawVal(value),
      viewOnly : scope.viewOnly
    }).addClass("flexmiddle");
    edit.addClass("flex");
    edit.change(function(){
      sync.rawVal(value, parseInt($(this).val()));
      obj.sync("updateAsset");
    });
  }

  if (!scope.viewOnly) {
    var plus = genIcon("plus").appendTo(title);
    plus.addClass("create");
    plus.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {"Modifier Name" : "", "Value" : ""},
        click : function(ev, inputs, options) {
          if (inputs["Modifier Name"].val().valid()) {
            sync.modifier(value, inputs["Modifier Name"].val(), parseInt(inputs["Value"].val()));
            obj.sync("updateAsset");
          }
        }
      });
    });
  }

  if (scope.total !== "") {
    var total = 0;
    if (scope.modsOnly) {
      total += sync.modified(value, 0);
    }
    if (scope.total) {
      total += sync.eval(scope.total, {c : duplicate(obj.data)});
    }
  }

  if (scope.modText) {
    content.append("<div class='fit-x flexmiddle subtitle'><text>"+scope.modText+"</text></div>");
  }

  var mods = $("<div>").appendTo(content);
  for (var i in value.modifiers) {
    var modRow = $("<div>").appendTo(mods);
    modRow.addClass("flexrow fit-x subtitle");

    var label = $("<b>").appendTo(modRow);
    label.addClass("lrpadding flexmiddle");
    label.text(i);
    label.css("min-width", "60px");

    var val = genInput({
      classes : "line",
      parent : modRow,
      value : value.modifiers[i],
      placeholder : "Enter modifier amount (Macro)",
      index : i,
      disabled : scope.viewOnly
    }).addClass("flex");
    val.change(function(){
      sync.modifier(value, $(this).attr("index"), $(this).val());
      obj.update();
    });
    var remove = genIcon("remove").appendTo(modRow);
    remove.addClass("destroy flexmiddle");
    remove.attr("index", i);
    remove.click(function(){
      sync.removeModifier(value, $(this).attr("index"));
      obj.update();
    });
  }
  if (scope.total !== "") {
    var bold = $("<b>").appendTo(content);
    bold.addClass("fit-x flexmiddle bold");
    bold.append(total);
  }

  return content;
});
