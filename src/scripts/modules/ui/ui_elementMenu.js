var _lastBuilder;
sync.render("ui_addElement", function(obj, app, scope){
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    path : app.attr("lookup"),
    closeTarget : app.attr("closeTarget"),
  };

  var path = scope.path;

  var div = $("<div>");
  div.addClass("flex");

  function rebuild(type){
    _lastBuilder = type;
    div.empty();

    var tabMenu = $("<div>").appendTo(div);
    tabMenu.addClass("flexrow");

    var simpleButton = $("<div>").appendTo(tabMenu);
    simpleButton.addClass("spadding subtitle");
    simpleButton.text("Attributes");
    simpleButton.click(function(){
      rebuild("attributes");
    });

    var jsonbutton = $("<div>").appendTo(tabMenu);
    jsonbutton.addClass("spadding subtitle");
    jsonbutton.text("Elements");
    jsonbutton.click(function(){
      rebuild("elements");
    });

    var content = $("<div>").appendTo(div);

    if (type == "attributes") {
      jsonbutton.addClass("button");
      simpleButton.addClass("highlight alttext");

      var listWrap = $("<div>").appendTo(div);
      listWrap.addClass("foreground");
      listWrap.css("overflow", "auto");
      listWrap.css("max-height", "600px");
      listWrap.css("width", "400px");

      var keys = {};
      var template = {stats : "", info : "", counters : ""};
      for (var key in template) {
        var templateWrap = $("<div>").appendTo(listWrap);
        templateWrap.addClass("flexcolumn");

        templateWrap.append("<b class='alttext lrmargin'>"+key+"</b>");

        var templateData = $("<div>").appendTo(templateWrap);
        templateData.addClass("flexcolumn white outline smooth padding");

        var pathKey = key;
        for (var subKey in obj.data[key]) {
          pathKey = key + "." + subKey;
          if (pathKey != "info.notes" && pathKey != "info.img") {
            var attrOption = $("<div>").appendTo(templateData);
            attrOption.addClass("flexrow subtitle button lrmargin");
            attrOption.attr("path", pathKey);
            if (!keys[subKey]) {
              attrOption.append("<text class='flexmiddle' style='width:100px'>"+subKey+"</text>");
              keys[subKey] = true;
            }
            else {
              attrOption.append("<text class='flexmiddle' style='width:100px'>"+pathKey+"</text>");
            }
            attrOption.append("<b>"+obj.data[key][subKey].name+"</b>");
            attrOption.click(function(){
              var replace = path.replace(app.attr("id")+"_0", "");
              while (replace.match("-")) {
                replace = replace.replace("-", ".");
              }
              if (replace[0] == ".") {
                replace = replace.substring(1, replace.length);
              }
              var target = sync.traverse(obj.data._d.content, replace);
              target.display = target.display || [];
              target.display.push({
                classes : "flexrow",
                target : $(this).attr("path"),
                edit : {classes : "line lrmargin"}
              });
              obj.update();
              layout.coverlay(scope.closeTarget);
            });
          }
        }
      }
    }
    else {
      simpleButton.addClass("button");
      jsonbutton.addClass("highlight alttext");

      var listWrap = $("<div>").appendTo(div);
      listWrap.addClass("foreground");
      listWrap.css("overflow", "auto");
      listWrap.css("max-height", "600px");
      listWrap.css("width", "400px");

      var interfaces = duplicate(util.interfaces);

      for (var category in interfaces) {
        var templateWrap = $("<div>").appendTo(listWrap);
        templateWrap.addClass("flexcolumn");
        templateWrap.append("<b class='alttext lrmargin'>"+category+"</b>");

        var templateData = $("<div>").appendTo(templateWrap);
        templateData.addClass("flexcolumn white outline smooth padding");

        for (var key in interfaces[category]) {
          var intData = interfaces[category][key];

          var inputWrap = $("<div>").appendTo(templateData);
          inputWrap.addClass("button lrmargin flexmiddle subtitle");
          inputWrap.attr("index", key);
          inputWrap.attr("category", category);
          inputWrap.text(key);
          inputWrap.click(function(){
            var inputData = duplicate(interfaces[$(this).attr("category")][$(this).attr("index")]);
            function submitData() {
              if (!path) {
                obj.data._d.content.display = obj.data._d.content.display || [];
                obj.data._d.content.display.push(inputData.content);
              }
              else {
                var replace = path.replace(app.attr("id")+"_0", "");
                while (replace.match("-")) {
                  replace = replace.replace("-", ".");
                }
                if (replace[0] == ".") {
                  replace = replace.substring(1, replace.length);
                }
                var target = sync.traverse(obj.data._d.content, replace);
                target.display = target.display || [];
                target.display.push(inputData.content);
              }
              obj.update();
              layout.coverlay(scope.closeTarget);
            }
            if (!inputData.arguments) {
              submitData();
            }
            else {
              var inputs = {};

              for (var arg in inputData.arguments) {
                var argData = inputData.arguments[arg];
                inputs[arg] = {};
                if (argData.datalist) {
                  var dataList = $("<datalist>").appendTo(listWrap);
                  dataList.attr("id", "argument-data-list");

                  if (argData.datalist == "character") {
                    var template = {stats : "", info : "", counters : ""};
                    for (var key in template) {
                      var pathKey = key;
                      for (var subKey in obj.data[key]) {
                        pathKey = key + "." + subKey;
                        if (pathKey != "info.notes" && pathKey != "info.img") {
                          var option = $("<option>").appendTo(dataList);
                          option.attr("value", pathKey);
                        }
                      }
                    }
                  }
                  else {
                    for (var i in argData.datalist) {
                      var option = $("<option>").appendTo(dataList);
                      option.attr("value", argData.datalist[i]);
                    }
                  }

                  inputs[arg] = {
                    type : "list",
                    list : "argument-data-list",
                  };
                }
                inputs[arg].category = $(this).attr("category");
                inputs[arg].index = $(this).attr("index");
                inputs[arg].arg = arg;
                inputs[arg].placeholder = argData.placeholder;
                inputs[arg].value = argData.default;
              }

              ui_prompt({
                target : $(this),
                inputs : inputs,
                click : function(ev, inputs){
                  for (var key in inputs) {
                    var inputEl = inputs[key];
                    var intData = interfaces[inputEl.attr("category")][inputEl.attr("index")];
                    var argData = interfaces[inputEl.attr("category")][inputEl.attr("index")].arguments[inputEl.attr("arg")];
                    inputData.content = JSON.parse(replaceAll(JSON.stringify(inputData.content), inputEl.attr("arg"), inputEl.val()));
                  }
                  submitData();
                },
              });
            }
          });
        }
      }
    }
  }

  rebuild(_lastBuilder || "attributes");

  return div;
});

sync.render("ui_elementMenu", function(obj, app, scope){
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    lookup : app.attr("lookup"),
    textEdit : app.attr("textEdit") == "true",
    hideConfirm : app.attr("hideConfirm") == "true",
    closeTarget : app.attr("closeTarget"),
    width : app.attr("width"),
    height : app.attr("height")
  };

  var data = obj.data;
  var value = obj.data;
  if (scope.lookup) {
    value = sync.traverse(data, scope.lookup || "");
  }

  var div = $("<div>");
  div.addClass("flex");

  var tabMenu = $("<div>").appendTo(div);
  tabMenu.addClass("flexrow");

  var simpleButton = $("<div>").appendTo(tabMenu);
  simpleButton.addClass("spadding subtitle");
  simpleButton.text("Simple");
  simpleButton.click(function(){
    app.removeAttr("JSON");
    obj.update();
  });

  var jsonbutton = $("<div>").appendTo(tabMenu);
  jsonbutton.addClass("spadding subtitle");
  jsonbutton.text("raw JSON");
  jsonbutton.click(function(){
    app.attr("JSON", true);
    obj.update();
  });
  if (!app.attr("JSON")) {
    jsonbutton.addClass("button");
    simpleButton.addClass("highlight alttext");

    for (var key in value) {
      var inputWrap = $("<div>").appendTo(div);
      inputWrap.addClass("flexrow");

      inputWrap.append("<b class='lrpadding subtitle'>"+key+"</b>");

      if (value[key] instanceof Object) {
        inputWrap.addClass("inactive subtitle");
        inputWrap.append("<i class='flex lrpadding subtitle flexmiddle'> Too Complicated </i>");
      }
      else {
        inputWrap.addClass("padding");

        var input = genInput({
          classes : "line subtitle fit-x lrmargin",
          parent : inputWrap,
          value : value[key],
          lookup : scope.lookup + "." + key,
        });
        input.change(function(){
          sync.traverse(obj.data, $(this).attr("lookup"), $(this).val());
          obj.update();
        });
      }
    }

  }
  else {
    simpleButton.addClass("button");
    jsonbutton.addClass("highlight alttext");

    sync.render("ui_JSON")(obj, app, scope).appendTo(div);
  }


  return div;
});
