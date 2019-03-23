var _lastBuilder = "edit";

var classesList = [
  [
    "flexcolumn",
    "flexrow",
    "flexcontainer",
    "scroll-x",
    "scroll-y",
    "flexaround",
    "flexbetween",
    "flexmiddle",
  ],
  [
    "flex",
    "flex2",
    "flex3",
    "fit-x",
    "fit-y",
    "fit-xy",
    "padding",
    "margin",
  ],
  [
    "white",
    "button",
    "highlight alttext",
    "background alttext",
    "foreground alttext",
    "hover",
    "hover2",
  ],
  [
    "subtitle",
    "size1",
    "size2",
    "size3",
    "size4",
    "size5",
    "size6",
    "size7",
    "size8",
  ],
  [
    "smooth",
    "outline",
    "outlinebottom",
    "lightoutline",
    "hardoutline",
  ]
];

sync.render("ui_addElement", function(obj, app, scope){
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    path : app.attr("lookup"),
    closeTarget : app.attr("closeTarget"),
  };

  var path = scope.path;

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  function rebuild(type){
    _lastBuilder = type;
    div.empty();

    var replace = path.replace(app.attr("id")+"_0", "");
    while (replace.match("-")) {
      replace = replace.replace("-", ".");
    }
    if (replace[0] == ".") {
      replace = replace.substring(1, replace.length);
    }
    var contentData = sync.traverse(obj.data._d.content, replace);

    var tabMenuWrap = $("<div>").appendTo(div);

    var tabMenu = $("<div>").appendTo(tabMenuWrap);
    tabMenu.addClass("flexrow fit-x");
    tabMenu.css("white-space", "nowrap");

    var editButton = $("<div>").appendTo(tabMenu);
    editButton.addClass("spadding subtitle flex flexmiddle");
    editButton.text("Configure");
    editButton.click(function(){
      rebuild("edit");
    });

    var jsonButton = $("<div>")//.appendTo(tabMenu);
    jsonButton.addClass("spadding subtitle flex flexmiddle");
    jsonButton.text("Edit JSON");
    jsonButton.click(function(){
      rebuild("json");
    });

    var simpleButton = $("<div>").appendTo(tabMenu);
    simpleButton.addClass("spadding subtitle flex flexmiddle");
    simpleButton.text("Add Attributes");
    simpleButton.click(function(){
      rebuild("attributes");
    });

    var elementButton = $("<div>").appendTo(tabMenu);
    elementButton.addClass("spadding subtitle flex flexmiddle");
    elementButton.text("Add Elements");
    elementButton.click(function(){
      rebuild("elements");
    });

    if (!contentData.display || contentData.tabs) {
      simpleButton.hide();
      elementButton.hide();
    }

    var flex = $("<div>").appendTo(tabMenu);
    flex.addClass("flex");

    var topButton = $("<div>").appendTo(tabMenu);
    topButton.addClass("spadding subtitle foreground alttext hover2 outline");
    topButton.attr("title", "Send Element to the top of its container");
    topButton.append(genIcon("arrow-up"));
    topButton.click(function(){
      var replace = path.replace(app.attr("id")+"_0", "");
      while (replace.match("-")) {
        replace = replace.replace("-", ".");
      }
      if (replace[0] == ".") {
        replace = replace.substring(1, replace.length);
      }

      var index = replace.split("\.");
      index = index[index.length-1];
      var final = replace.substring(0, replace.length-1-index.length);
      var arr = sync.traverse(obj.data._d.content, final);
      if (arr && Array.isArray(arr)) {
        util.insert(arr, 0, arr.splice(index, 1)[0]);
        obj.update();
      }
      layout.coverlay(scope.closeTarget);
    });

    var bottomButton = $("<div>").appendTo(tabMenu);
    bottomButton.addClass("spadding subtitle foreground alttext hover2 outline");
    bottomButton.attr("title", "Send Element to the bottom of its container");
    bottomButton.append(genIcon("arrow-down"));
    bottomButton.click(function(){
      var replace = path.replace(app.attr("id")+"_0", "");
      while (replace.match("-")) {
        replace = replace.replace("-", ".");
      }
      if (replace[0] == ".") {
        replace = replace.substring(1, replace.length);
      }

      var index = replace.split("\.");
      index = index[index.length-1];
      var final = replace.substring(0, replace.length-1-index.length);
      var arr = sync.traverse(obj.data._d.content, final);
      if (arr && Array.isArray(arr)) {
        arr.push(arr.splice(index, 1)[0]);
        obj.update();
      }
      layout.coverlay(scope.closeTarget);
    });

    var deleteButton = $("<div>").appendTo(tabMenu);
    deleteButton.addClass("spadding subtitle highlight alttext hover2 outline");
    deleteButton.append(genIcon("trash"));
    deleteButton.click(function(){
      var replace = path.replace(app.attr("id")+"_0", "");
      while (replace.match("-")) {
        replace = replace.replace("-", ".");
      }
      if (replace[0] == ".") {
        replace = replace.substring(1, replace.length);
      }

      var index = replace.split("\.");
      index = index[index.length-1];
      var final = replace.substring(0, replace.length-1-index.length);
      var arr = sync.traverse(obj.data._d.content, final);
      if (arr && Array.isArray(arr)) {
        arr.splice(index, 1);
        obj.update();
      }
      layout.coverlay(scope.closeTarget);
    });


    var content = $("<div>").appendTo(div);
    content.addClass("flex flexcolumn");

    if (type == "attributes") {
      elementButton.addClass("button");
      editButton.addClass("button");
      jsonButton.addClass("button");
      simpleButton.addClass("highlight alttext");

      var listWrap = $("<div>").appendTo(content);
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
              if (!_down[17]) {
                layout.coverlay(scope.closeTarget);
              }
            });
          }
        }
      }
    }
    else if (type =="elements") {
      simpleButton.addClass("button");
      editButton.addClass("button");
      jsonButton.addClass("button");
      elementButton.addClass("highlight alttext");

      var listWrap = $("<div>").appendTo(content);
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
              if (!_down[17]) {
                layout.coverlay(scope.closeTarget);
              }
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
                  var dataList = []

                  if (argData.datalist == "character") {
                    var template = {stats : "", info : "", counters : ""};
                    for (var key in template) {
                      var pathKey = key;
                      for (var subKey in obj.data[key]) {
                        pathKey = key + "." + subKey;
                        if (pathKey != "info.notes" && pathKey != "info.img") {
                          dataList.push(pathKey);
                        }
                      }
                    }
                  }
                  else {
                    for (var i in argData.datalist) {
                      dataList.push(argData.datalist[i]);
                    }
                  }

                  inputs[arg] = {
                    type : "list",
                    list : dataList
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
    else if (type == "edit") {
      simpleButton.addClass("button");
      elementButton.addClass("button");
      jsonButton.addClass("button");
      editButton.addClass("highlight alttext");

      var editOptionsWrap = $("<div>").appendTo(content);
      editOptionsWrap.addClass("flexrow flex");

      var categoryList = $("<div>").appendTo(editOptionsWrap);
      categoryList.addClass("flexcolumn background");

      var catBuild = {
        "Layout" : function(parent) {
          var fullWrap = $("<div>").appendTo(typeOptionsWrap);
          fullWrap.addClass("flexcolumn");

          util.fonts

          var inputWrap = $("<div>").appendTo(fullWrap);
          inputWrap.addClass("flexrow flexbetween subtitle");
          inputWrap.append("<b style='white-space:nowrap'>Font</b>");
          inputWrap.css("margin-bottom", "0.5em");

          var fontList = {"Default" : ""};
          for (var i in util.fonts) {
            fontList[util.fonts[i]] = util.fonts[i];
          }

          var font = genInput({
            parent : inputWrap,
            classes : "line fit-x lrmargin lrpadding",
            select : fontList,
            value : (contentData.style && contentData.style["font-family"])?(contentData.style["font-family"]):("Default")
          });
          font.change(function(){
            contentData.style = contentData.style || {};
            contentData.style["font-family"] = ($(this).val() || "");
            rebuild("edit");
            obj.update();
          });

          var inputWrap = $("<div>").appendTo(fullWrap);
          inputWrap.addClass("flexrow flexbetween subtitle");
          inputWrap.append("<b style='white-space:nowrap'>Visual Properties</b>");

          var classes = genInput({
            parent : inputWrap,
            classes : "line fit-x lrmargin lrpadding",
            value : contentData.classes,
          });
          classes.val((contentData.classes || "") + " ");
          classes.change(function(){
            contentData.classes = ($(this).val() || "").trim();
            rebuild("edit");
            obj.update();
          });

          var classesShow = genIcon("list-alt", "List").appendTo(inputWrap);
          classesShow.attr("title", "Show a List of Common Properties");
          classesShow.click(function(){
            categoryList.toggle();
            app.attr("sampleToggle", !categoryList.is(":visible"));
          });

          var remove = genIcon("trash").appendTo(inputWrap);
          remove.addClass("lrmargin destroy");

          var categoryList = $("<div>").appendTo(fullWrap);
          categoryList.addClass("flexrow flexwrap subtitle");
          if (app.attr("sampleToggle") == "true" && app.attr("sampleToggle") == true) {
            categoryList.hide();
          }

          for (var i in classesList) {
            var catList = $("<div>").appendTo(categoryList);
            catList.addClass("flexcolumn flex lrmargin");

            for (var j in classesList[i]) {
              var checkWrap = $("<div>").appendTo(catList);
              checkWrap.addClass("flexrow subtitle hover2");

              var checkbox = genInput({
                parent : checkWrap,
                type : "checkbox",
                style : {"width" : "10px", "height" : "10px"}
              });
              if (classes.val() && classes.val().match(classesList[i][j] + " ")) {
                checkbox.prop("checked", true);
              }
              var title = $("<b>").appendTo(checkWrap);
              title.addClass("flexmiddle");
              title.css("white-space", "nowrap");
              title.text(classesList[i][j]);

              checkWrap.attr("val", classesList[i][j]);
              checkWrap.click(function(){
                if (classes.val().match($(this).attr("val") + " ")) {
                  $($(this).children()[0]).prop("checked", false);
                  classes.val(classes.val().replace($(this).attr("val") + " ", ""));
                  classes.val(classes.val().replace("  ", " "));
                  if (classes.val()[0] == " ") {
                    classes.val(classes.val().substring(1, classes.val().length));
                  }
                  classes.change();
                }
                else {
                  $($(this).children()[0]).prop("checked", true);
                  classes.val(classes.val() + " " + $(this).attr("val") + " ");
                  classes.val(classes.val().replace("  ", " "));
                  if (classes.val()[0] == " ") {
                    classes.val(classes.val().substring(1, classes.val().length));
                  }
                  classes.change();
                }
              });
            }
          }
          fullWrap.append("<div class='padding'></div>");

          var inputWrap = $("<div>").appendTo(parent);
          inputWrap.addClass("flexrow flexbetween subtitle");
          inputWrap.append("<i>Children</i>");

          var remove = genIcon("trash", "Delete Children").appendTo(inputWrap);
          remove.addClass("lrmargin destroy");
          remove.click(function(){
            contentData.display = [];
            sendAlert({text : "Children deleted"});
            rebuild("edit");
            obj.update();
          });

          var inputWrap = $("<div>").appendTo(parent);
          inputWrap.addClass("flexrow flexbetween subtitle");
          inputWrap.append("<i>CSS Styling, edit in JSON</i>");

          var remove = genIcon("trash").appendTo(inputWrap);
          remove.addClass("lrmargin destroy");
          remove.click(function(){
            delete contentData.display;
            rebuild("edit");
            obj.update();
          });
        },
        "Input" : function(parent) {
          var dataList = [];

          var template = {stats : "", info : "", counters : ""};
          for (var tKey in template) {
            var pathKey = tKey;
            for (var subKey in obj.data[tKey]) {
              pathKey = tKey + "." + subKey;
              if (pathKey != "info.notes" && pathKey != "info.img") {
                dataList.push(pathKey);
              }
            }
          }
          if (!contentData.tabs && !contentData.display) {
            var targetAttribute = $("<div>").appendTo(parent);
            targetAttribute.addClass("flexrow flexbetween subtitle");
            targetAttribute.append("<b class='flex'>Attribute(target)</b>");

            var input = genInput({
              parent : targetAttribute,
              classes : "flex",
              list : dataList,
              value : contentData.target,
              style : {"width" : "125px"},
            });
            input.change(function(){
              contentData.target = $(this).val();
              rebuild("edit");
              obj.update();
            });
          }

          var fullWrap = $("<div>").appendTo(parent);
          fullWrap.addClass("flexcolumn");

          var inputWrap = $("<div>").appendTo(fullWrap);
          inputWrap.addClass("flexrow flexbetween fit-x");
          inputWrap.append("<b class='underline flex'>Type</b>");

          var typeVal = "Input";
          if (contentData.tabs || contentData.display) {
            typeVal = "Tab";
          }
          else if (contentData.click || contentData.diceable) {
            typeVal = "Button";

            var clickType = "calc";
            if (contentData.diceable) {
              clickType = "dice";

              var wrap = $("<div>").appendTo(fullWrap);
              wrap.addClass("flexrow flexbetween fit-x");
              wrap.append("<text class='bold'>Roll Message</text>");

              var input = genInput({
                parent : wrap,
                classes : "line subtitle",
                style : {"width" : "200px"},
                value : contentData.diceable.msg,
              });
              input.change(function(){
                contentData.diceable.msg = $(this).val();
                rebuild("edit");
                obj.update();
              });

              var wrap = $("<div>").appendTo(fullWrap);
              wrap.addClass("flexrow flexbetween fit-x");
              wrap.append("<text class='bold'>Pool Equation</text>");

              var input = genInput({
                parent : wrap,
                classes : "line subtitle",
                style : {"width" : "200px"},
                value : contentData.diceable.data,
              });
              input.change(function(){
                contentData.diceable.data = $(this).val();
                contentData.scope.eq = $(this).val();
                rebuild("edit");
                obj.update();
              });

              var wrap = $("<div>").appendTo(fullWrap);
              wrap.addClass("flexrow flexbetween fit-x");
              wrap.append("<text class='bold'>Dice Size</text>");

              var input = genInput({
                parent : wrap,
                classes : "line subtitle",
                style : {"width" : "50px"},
                value : contentData.scope.diceSize,
              });
              input.change(function(){
                contentData.scope.diceSize = $(this).val();
                rebuild("edit");
                obj.update();
              });
            }
            else if (contentData.click.action != null) {
              clickType = "action";

              var wrap = $("<div>").appendTo(fullWrap);
              wrap.addClass("flexrow flexbetween fit-x");
              wrap.append("<text class='bold'>Action to Roll</text>");

              var actionList = {};
              for (var key in game.templates.actions.c) {
                actionList[key] = key;
              }

              for (var actKey in obj.data._a) {
                actionList[actKey] = actKey;
              }

              var input = genInput({
                parent : wrap,
                classes : "line subtitle",
                select : actionList,
                value : contentData.click.action,
              });
              input.change(function(){
                contentData.click.action = $(this).val();
                rebuild("edit");
                obj.update();
              });


              var wrap = $("<div>").appendTo(fullWrap);
              wrap.addClass("flexrow flexbetween fit-x");
              wrap.append("<text class='bold'>Flavor Text</text>");

              var input = genInput({
                parent : wrap,
                classes : "line subtitle",
                value : contentData.click.msg,
              });
              input.change(function(){
                contentData.click.msg = $(this).val();
                rebuild("edit");
                obj.update();
              });

              if (game.templates.actions.c[contentData.click.action]) {
                contentData.click.options = contentData.click.options || {};

                input.attr("placeholder", game.templates.actions.c[contentData.click.action].eventData.msg);

                var optionList = $("<div>").appendTo(fullWrap);
                optionList.addClass("flexcolumn spadding");

                optionList.append("<b>Action Options</b>");
                for (var key in game.templates.actions.c[contentData.click.action].options) {
                  var optionData = game.templates.actions.c[contentData.click.action].options[key];

                  var wrap = $("<div>").appendTo(optionList);
                  wrap.addClass("flexrow flexbetween fit-x subtitle");
                  wrap.append("<text class='bold'>"+key+"</text>");

                  if (optionData === true) {
                    var input = genInput({
                      parent : wrap,
                      classes : "line subtitle",
                      option : key,
                      value : contentData.click.options[key],
                    });
                    input.change(function(){
                      contentData.click.options = contentData.click.options || {};
                      contentData.click.options[$(this).attr("option")] = $(this).val();
                      rebuild("edit");
                      obj.update();
                    });
                  }
                  else if (optionData instanceof Object){
                    var dupeOptions = [];
                    for (var i in optionData) {
                      dupeOptions.push(String(optionData[i]));
                    }

                    var input = genInput({
                      parent : wrap,
                      classes : "line subtitle",
                      list : dupeOptions,
                      option : key,
                      value : contentData.click.options[key],
                    });
                    input.change(function(){
                      contentData.click.options = contentData.click.options || {};
                      contentData.click.options[$(this).attr("option")] = $(this).val();
                      rebuild("edit");
                      obj.update();
                    });
                  }
                }
              }

            }
            else if (contentData.click.calc) {
              clickType = "calc";

              fullWrap.append(sync.render("ui_math")(obj, app, {calc : contentData.click.calc}));
            }
            var buttonType = genInput({
              parent : inputWrap,
              classes : "lrmargin",
              select : {
                "Change Attributes" : "calc",
                "Roll Action" : "action",
              },
              value : clickType
            });
            buttonType.change(function(){
              var val = $(this).val();
              if (val == "action") {
                contentData.click = contentData.click || {};
                contentData.click.action = Object.keys(game.templates.actions.c)[0] || "";
                delete contentData.click.calc;
                delete contentData.diceable;
              }
              else if (val == "calc") {
                contentData.click = contentData.click || {};
                contentData.click.calc = [];
                delete contentData.click.action;
                delete contentData.diceable;
              }
              else if (val == "dice") {
                var replace = path.replace(app.attr("id")+"_0", "");
                while (replace.match("-")) {
                  replace = replace.replace("-", ".");
                }
                if (replace[0] == ".") {
                  replace = replace.substring(1, replace.length);
                }
                sync.traverse(obj.data._d.content, replace, {
                  diceable : {msg : "Dice Roll", data : "1[fate]+1[proficiency]+1[d20]"},
                  ui : "ui_diceVisual",
                  scope : {
                    "classes": "flexrow flexmiddle flexwrap",
                    "diceSize": "8px",
                    "eq": "1[fate]+1[proficiency]+1[d20]"
                  }
                });
              }
              rebuild("edit");
              obj.update();
            });
          }
          else if (contentData.ui == "ui_checkbox") {
            typeVal = "Checkbox";

            var wrap = $("<div>").appendTo(fullWrap);
            wrap.addClass("flexrow flexbetween fit-x");
            wrap.append("<text class='bold'>Checked value</text>");

            var input = genInput({
              parent : wrap,
              classes : "line subtitle",
              style : {"width" : "200px"},
              value : contentData.scope.checked,
            });
            input.change(function(){
              contentData.scope.checked = $(this).val();
              rebuild("edit");
              obj.update();
            });

            var wrap = $("<div>").appendTo(fullWrap);
            wrap.addClass("flexrow flexbetween fit-x");
            wrap.append("<text class='bold'>Unchecked Value</text>");

            var input = genInput({
              parent : wrap,
              classes : "line subtitle",
              style : {"width" : "200px"},
              value : contentData.scope.unchecked,
            });
            input.change(function(){
              contentData.scope.unchecked = $(this).val();
              rebuild("edit");
              obj.update();
            });

            var wrap = $("<div>").appendTo(fullWrap);
            wrap.addClass("flexrow flexbetween fit-x");
            wrap.append("<text class='bold'>Title (optional)</text>");

            var input = genInput({
              parent : wrap,
              classes : "line subtitle",
              style : {"width" : "200px"},
              value : contentData.scope.text,
            });
            input.change(function(){
              contentData.scope.text = $(this).val();
              rebuild("edit");
              obj.update();
            });
          }
          else if (contentData.edit) {
            if (contentData.edit.select) {
              typeVal = "Dropdown";

              var listWrap = $("<div>").appendTo(fullWrap);
              listWrap.addClass("flexcolumn");

              var newListWrap = $("<div>").appendTo(listWrap);
              newListWrap.addClass("fit-x flexmiddle subtitle bold");
              newListWrap.append(genIcon("plus", "New Option"));
              newListWrap.click(function(){
                ui_prompt({
                  target : $(this),
                  inputs : {
                    "Display 'Value'" : {placeholder : ""}
                  },
                  click : function(ev, inputs) {
                    if (inputs["Display 'Value'"].val()) {
                      contentData.edit.select = contentData.edit.select || {};
                      contentData.edit.select[inputs["Display 'Value'"].val()] = inputs["Display 'Value'"].val();
                      rebuild("edit");
                      obj.update();
                    }
                  }
                })
              });

              for (var j in contentData.edit.select) {
                var listEntryWrap = $("<div>").appendTo(listWrap);
                listEntryWrap.addClass("flexrow flexbetween");

                listEntryWrap.append("<div class='flex flexmiddle white outline smooth lrpadding subtitle bold'>"+j+"</div>");

                var input = genInput({
                  classes : "flex subtitle",
                  parent : listEntryWrap,
                  placeholder : "Override Value, saved into " + contentData.target,
                  value : (contentData.edit.select[j]!=j)?(contentData.edit.select[j]):(""),
                  index : j
                });
                input.change(function(){
                  contentData.edit.select = contentData.edit.select || {};
                  contentData.edit.select[$(this).attr("index")] = $(this).val();
                  rebuild("edit");
                  obj.update();
                });

                var remove = genIcon("remove").appendTo(listEntryWrap);
                remove.addClass("lrmargin destroy");
                remove.attr("index", j);
                remove.click(function(){
                  contentData.edit.select = contentData.edit.select || {};
                  delete contentData.edit.select[$(this).attr("index")];
                  rebuild("edit");
                  obj.update();
                });
              }

            }
            else if (contentData.edit.list) {
              typeVal = "Autofill";

              var listWrap = $("<div>").appendTo(fullWrap);
              listWrap.addClass("flexcolumn");

              var newListWrap = $("<div>").appendTo(listWrap);
              newListWrap.addClass("fit-x flexmiddle subtitle bold");
              newListWrap.append(genIcon("plus", "New Option"));
              newListWrap.click(function(){
                contentData.edit.list = contentData.edit.list || [];
                contentData.edit.list.push("");
                rebuild("edit");
                obj.update();
              });

              for (var j in contentData.edit.list) {
                var listEntryWrap = $("<div>").appendTo(listWrap);
                listEntryWrap.addClass("flexrow flexbetween");

                var input = genInput({
                  classes : "fit-x subtitle",
                  parent : listEntryWrap,
                  placeholder : "Autofill Text",
                  value : contentData.edit.list[j],
                  index : j
                });
                input.change(function(){
                  contentData.edit.list = contentData.edit.list || [];
                  contentData.edit.list[$(this).attr("index")] = $(this).val();
                  rebuild("edit");
                  obj.update();
                });

                var remove = genIcon("remove").appendTo(listEntryWrap);
                remove.addClass("lrmargin destroy");
                remove.attr("index", j);
                remove.click(function(){
                  contentData.edit.list = contentData.edit.list || [];
                  contentData.edit.list.splice($(this).attr("index"), 1);
                  rebuild("edit");
                  obj.update();
                });
              }
            }
            else if (contentData.edit.type == "number") {
              typeVal = "Number";

              var optionWrap = $("<div>").appendTo(fullWrap);
              optionWrap.addClass("flexrow subtitle lrpadding lrmargin");
              optionWrap.append("<b class='flex'>Minimum</b>");

              var min = genInput({
                parent : optionWrap,
                type : "Number",
                placeholder : "Min",
                value : contentData.edit.min
              });

              var optionWrap = $("<div>").appendTo(fullWrap);
              optionWrap.addClass("flexrow subtitle lrpadding lrmargin");
              optionWrap.append("<b class='flex'>Maximum</b>");

              var max = genInput({
                parent : optionWrap,
                type : "Number",
                placeholder : "Max",
                value : contentData.edit.max
              });

              var optionWrap = $("<div>").appendTo(fullWrap);
              optionWrap.addClass("flexrow subtitle lrpadding lrmargin");
              optionWrap.append("<b class='flex'>Increment Step</b>");

              var step = genInput({
                parent : optionWrap,
                type : "Number",
                placeholder : "Step",
                value : contentData.edit.step
              });
            }
            else if (contentData.edit.type == "textarea") {
              typeVal = "Text Area";
            }
            else {
              typeVal = "Input";
            }
          }
          else {
            typeVal = "Label";
          }
          var select = genInput({
            parent : inputWrap,
            select : {
              "Autofill" : "Autofill",
              "Button" : "Button",
              "Checkbox" : "Checkbox",
              "Dropdown" : "Dropdown",
              "Input" : "Input",
              "Label" : "Label",
              "Number" : "Number",
              "Text Area" : "Text Area",
            },
            style : {"width" : "125px"},
            value : typeVal
          });
          select.change(function(){
            var typeVal = $(this).val();
            var replace = path.replace(app.attr("id")+"_0", "");
            while (replace.match("-")) {
              replace = replace.replace("-", ".");
            }
            if (replace[0] == ".") {
              replace = replace.substring(1, replace.length);
            }
            if (typeVal == "Dropdown") {
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                edit : {select : {}}
              });
            }
            else if (typeVal == "Autofill") {
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                edit : {classes : "line", list : []}
              });
            }
            else if (typeVal == "Number") {
              contentData.edit.type = "number";
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                edit : {classes : "line", type : "number"}
              });
            }
            else if (typeVal == "Text Area") {
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                edit : {type : "textarea"}
              });
            }
            else if (typeVal == "Checkbox"){
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                ui : "ui_checkbox",
                scope : {}
              });
            }
            else if (typeVal == "Button"){
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                click : {calc : []}
              });
            }
            else if (typeVal == "Label") {
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                target : contentData.target,
              });
            }
            else {
              typeVal = "Input";
              sync.traverse(obj.data._d.content, replace, {
                classes : contentData.classes,
                style : contentData.style,
                name : "",
                target : contentData.target,
                edit : {classes : "line"}
              });
            }
            rebuild("edit");
            obj.update();
          });
        },
        "Tabs" : function(parent) {
          var fullWrap = $("<div>").appendTo(typeOptionsWrap);
          fullWrap.addClass("flexcolumn flex");

          if (contentData.tabs) {
            var inputWrap = $("<div>").appendTo(fullWrap);
            inputWrap.addClass("flexrow flexbetween subtitle");
            inputWrap.append("<b style='white-space:nowrap'>Default Tab</b>");

            var selectTabs = {};
            for (var i in contentData.tabs) {
              selectTabs[i] = i;
            }

            var defaultTab = genInput({
              parent : inputWrap,
              classes : "line fit-x lrmargin lrpadding",
              placeholder : "Default Tab",
              select : selectTabs,
              value : contentData.tab,
            });
            defaultTab.change(function(){
              contentData.tab = ($(this).val() || "").trim();
              rebuild("edit");
              obj.update();
            });
          }


          var tabList = $("<div>").appendTo(fullWrap);
          tabList.addClass("flexrow flexwrap subtitle");

          var tabContent = $("<div>").appendTo(fullWrap);
          tabContent.addClass("flexcolumn flex");

          for (var i in contentData.tabs) {
            var button = $("<button>").appendTo(tabList);
            button.addClass("spadding");
            button.attr("tab", i);
            button.append("<text class='subtitle'>"+i+"</text>");
            button.click(function(){
              tabList.children().removeClass("highlight alttext");
              $(this).addClass("highlight alttext");
              tabContent.empty();

              var json = genInput({
                parent : tabContent,
                classes : "flex subtitle",
                type : "textarea",
                tab : $(this).attr("tab"),
                value : JSON.stringify(contentData.tabs[$(this).attr("tab")], 2, 2)
              });
              json.change(function(){
                try {
                  var replace = path.replace(app.attr("id")+"_0", "");
                  while (replace.match("-")) {
                    replace = replace.replace("-", ".");
                  }
                  if (replace[0] == ".") {
                    replace = replace.substring(1, replace.length);
                  }
                  var contentData = sync.traverse(obj.data._d.content, replace);
                  contentData.tabs[$(this).attr("tab")] = JSON.parse($(this).val(), 2, 2);
                  delete contentData.tabs[$(this).attr("tab")].style;
                  obj.update();
                }
                catch(e) {
                  sendAlert({text : "Error Parsing"});
                }
              });
            });

            var remove = genIcon("remove").appendTo(button);
            remove.attr("tab", i);
            remove.click(function(){
              delete contentData.tabs[$(this).attr("tab")];
              rebuild("edit");
              obj.update();
            });
          }

          var newTab = $("<div>").appendTo(tabList);
          newTab.addClass("create flexmiddle spadding");
          newTab.append(genIcon("plus", "New Tab"));
          newTab.click(function(){
            ui_prompt({
              target : app,
              inputs : {"Tab Name" : ""},
              click : function(ev, inputs) {
                if (inputs["Tab Name"].val()) {
                  if (contentData.tabs && contentData.tabs[inputs["Tab Name"].val()]) {
                    sendAlert({text : "Tab Already Exists"});
                  }
                  else {
                    contentData.tabs = contentData.tabs || {};
                    contentData.tab = contentData.tab || inputs["Tab Name"].val();
                    contentData.tabs[inputs["Tab Name"].val()] = {
                      classes : "flexcolumn flex scroll-y",
                      scrl : inputs["Tab Name"].val(),
                      display : []
                    };
                    rebuild("edit");
                    obj.update();
                  }
                }
                else {
                  sendAlert({text : "Enter a Tab Name"});
                }
              }
            })
          });
        },
        "Raw JSON" : function(parent) {
          rebuild("json");
          app.removeAttr("submenu");
        }
      };
      if (!app.attr("submenu")) {
        app.attr("submenu", "Layout");
      }
      for (var key in catBuild) {
        var button = $("<button>").appendTo(categoryList);
        button.addClass("subtitle");
        button.attr("key", key);
        if (app.attr("submenu") == key) {
          button.addClass("highlight alttext");
        }
        button.text(key);
        button.click(function(){
          app.attr("submenu", $(this).attr("key"));
          rebuild("edit");
        });
      }

      var typeOptionsWrap = $("<div>").appendTo(editOptionsWrap);
      typeOptionsWrap.addClass("flexcolumn flex spadding smooth outline scroll-xy");
      catBuild[app.attr("submenu") || "Layout"](typeOptionsWrap);
    }
    else if (type == "json") {
      simpleButton.addClass("button");
      elementButton.addClass("button");
      editButton.addClass("button");
      jsonButton.addClass("highlight alttext");

      var replace = path.replace(app.attr("id")+"_0", "");
      while (replace.match("-")) {
        replace = replace.replace("-", ".");
      }
      var select = sync.newApp("ui_JSON").appendTo(content);
      select.attr("lookup", "_d.content"+replace);
      select.attr("closeTarget", "json-editor");
      obj.addApp(select);
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

  var elementButton = $("<div>").appendTo(tabMenu);
  elementButton.addClass("spadding subtitle");
  elementButton.text("Edit JSON");
  elementButton.click(function(){
    app.attr("JSON", true);
    obj.update();
  });
  if (!app.attr("JSON")) {
    elementButton.addClass("button");
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
    elementButton.addClass("highlight alttext");

    sync.render("ui_JSON")(obj, app, scope).appendTo(div);
  }


  return div;
});
