var _actions = {
  "Actions" : {
    click : function(ev, ui, obj, app, scope) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}};

      game.locals["actions"] = game.locals["actions"] || [];
      game.locals["actions"].push(actionObj);

      var newApp = sync.newApp("ui_hotActions");
      newApp.addClass("padding");
      actionObj.addApp(newApp);

      var pop = ui_popOut({
        target : app,
        minimize : true,
        dragThickness : "0.5em",
        title : "Actions",
      }, newApp);
      pop.resizable();
    }
  },
  "Set/Roll Initiative" : {
    condition :function(obj) {return (game.state.data && game.state.data.combat != null && hasSecurity(getCookie("UserID"), "Assistant Master"))},
    click : function(ev, ui, obj, app, scope) {
      var context = sync.defaultContext();
      context[obj.data._t] = duplicate(obj.data);

      var content = $("<div>");
      content.addClass("flexcolumn flex");

      var query = genInput({
        parent : content,
        placeholder : sync.result(sync.reduce(game.templates.initiative.query, context, true), context, true)
      });

      var confirm = $("<button>").appendTo(content);
      confirm.addClass("foreground alttext flex");
      confirm.append("Roll Initiative!");
      confirm.click(function(){
        var context = sync.defaultContext();
        context[obj.data._t] = duplicate(obj.data);
        var data = sync.executeQuery(query.val() || game.templates.initiative.query, context);

        var evData = {
          msg : "rolled Initiative",
          data : data
        }

        runCommand("diceCheck", evData);

        var sp;
        var ok;
        var id = obj.id();
        if (game.state.data.combat) {
          if (game.state.data.combat.engaged[id]) {
            if (game.state.data.combat.engaged[id].sp) {
              sp = game.state.data.combat.engaged[id].sp;
            }
            if (game.state.data.combat.engaged[id].ok) {
              ok = game.state.data.combat.engaged[id].ok;
            }
          }
          game.state.data.combat.engaged[id] = data.pool;
          game.state.data.combat.engaged[id].sp = sp;
          game.state.data.combat.engaged[id].ok = ok;
          game.state.sync("updateCombatState");
          layout.coverlay("join-combat");
          layout.coverlay("olay-join-combat");
        }
      });
      if (scope.pump) {
        query.addClass("alttext line middle smargin smooth outline");
        query.css("background-color", "rgba(0,0,0,0.8)");
        query.css("font-size", "1.2em");
        query.val(query.attr("placeholder"));
        confirm.css("font-size", "1.6em");
        confirm.addClass("padding hover2");
        var pop = ui_popOut({
          target : ui,
          id : "join-combat",
          noCss : true,
          hideclose : true,
          style : {"width" : "300px"}
        }, content).addClass("lpadding").removeClass("boxshadow");
      }
      else {
        var pop = ui_popOut({
          target : ui,
          id : "join-combat",
          title : "Roll Initiative",
          style : {"width" : "300px"}
        }, content);
      }
    }
  },
  "Set/Roll Initiative (Hidden)" : {
    condition :function(obj) {return (game.state.data && game.state.data.combat != null && hasSecurity(getCookie("UserID"), "Assistant Master"))},
    click : function(ev, ui, obj, app, scope) {
      var context = sync.defaultContext();
      context[obj.data._t] = duplicate(obj.data);

      var content = $("<div>");
      content.addClass("flexcolumn flex");

      var query = genInput({
        parent : content,
        placeholder : sync.result(sync.reduce(game.templates.initiative.query, context, true), context, true)
      });

      var confirm = $("<button>").appendTo(content);
      confirm.addClass("foreground alttext flex");
      confirm.append("Roll Initiative!");
      confirm.click(function(){
        obj.data.info.hide = true;
        obj.sync("updateAsset");

        var context = sync.defaultContext();
        context[obj.data._t] = duplicate(obj.data);
        var data = sync.executeQuery(query.val() || game.templates.initiative.query, context);

        var sp;
        var ok;
        var id = obj.id();
        if (game.state.data.combat.engaged[id]) {
          if (game.state.data.combat.engaged[id].sp) {
            sp = game.state.data.combat.engaged[id].sp;
          }
          if (game.state.data.combat.engaged[id].ok) {
            ok = game.state.data.combat.engaged[id].ok;
          }
        }
        game.state.data.combat.engaged[id] = data.pool;
        game.state.data.combat.engaged[id].sp = sp;
        game.state.data.combat.engaged[id].ok = ok;
        game.state.sync("updateCombatState");
        layout.coverlay("join-combat");
        layout.coverlay("olay-join-combat");
      });
      var pop = ui_popOut({
        target : ui,
        id : "join-combat",
        title : "Roll Initiative",
        style : {"width" : "300px"}
      }, content);
    }
  },
  "Leave Combat" : {
    click : function(ev, ui, obj, app, scope) {
      runCommand("leaveCombat", {id : obj.id()});
    }
  },
  "Hide" : {
    condition : function(obj){return (!obj.data.info.hide);},
    click : function(ev, ui, obj, app, scope) {
      obj.data.info.hide = !obj.data.info.hide;
      obj.sync("updateAsset");
      game.state.update();
      if (game.locals["turnOrder"]) {
        game.locals["turnOrder"].update();
      }
    }
  },
  "Un-Hide" : {
    condition : function(obj){return (obj.data.info.hide == true);},
    click : function(ev, ui, obj, app, scope) {
      obj.data.info.hide = !obj.data.info.hide;
      obj.sync("updateAsset");
      game.state.update();
      if (game.locals["turnOrder"]) {
        game.locals["turnOrder"].update();
      }
    }
  }
}

sync.render("ui_characterPiece", function(obj, app, scope){
  var div = $("<div>");

  var data = obj.data;
  obj.data.info.img.modifiers = obj.data.info.img.modifiers || {};

  var pieceData = duplicate(obj.data.info.img.modifiers);

  var colorDiv = $("<div>");
  colorDiv.addClass("flexrow");
  var col = genInput({
    parent : colorDiv,
    placeholder : "rgba or hex",
    value : pieceData.c,
    style : {"width" : "100px"},
  });

  var colBackground = $("<div>").appendTo(colorDiv);
  colBackground.addClass("flexmiddle");

  var content = $("<div>");
  content.addClass("flexcolumn flex flexmiddle");

  function colorOptions(){
    sync.render("ui_colorPicker")(obj, content, {
      hideColor : true,
      color : col.val(),
      colorChange : function(ev, ui, newCol) {
        content.empty();
        col.val(newCol);
        colorOptions();

        colBckground.empty();
        buildShape(pieceData.d || 0, col.val()).appendTo(colBckground);
      }
    }).addClass("fit-x").css("color", "black").appendTo(content);
    sync.render("ui_shapePicker")(obj, content, {
      color : col.val(),
      shapeChange : function(ev, ui, newShape) {
        content.empty();
        pieceData.d = newShape;
        colorOptions();

        colBckground.empty();
        buildShape(pieceData.d || 0, col.val()).appendTo(colBckground);
      }
    }).addClass("fit-x").appendTo(content);
  }
  colorOptions();

  var colBckground = $("<button>").appendTo(colorDiv);
  colBckground.addClass("flexcolumn");
  colBckground.css("padding", "0px");

  var shape = pieceData.d;
  var colr = pieceData.c;
  var colPreview = buildShape(pieceData.d || 0, pieceData.c).appendTo(colBckground);

  var inputs = {
    "Piece Title" : {placeholder : "Label (Macro)", value : pieceData.t},
    "Size" : {placeholder : "Width & Height (Macro)", value : pieceData.w},
    "Rotation (Deg)" : {placeholder : "Rotation (Macro)", value : pieceData.r},
    "Altitude" : {placeholder : "Altitude (Macro)", value : pieceData.a},
  }
  inputs["Color/Shape"] = colorDiv;
  inputs[" "] = content;

  var controls = ui_controlForm({
    inputs : inputs,
    lblStyle : "min-width : 70px;",
    click : function(ev, inputs) {
      obj.data.info.img.modifiers.t = inputs["Piece Title"].val();
      obj.data.info.img.modifiers.w = inputs["Size"].val();
      obj.data.info.img.modifiers.h = inputs["Size"].val();
      obj.data.info.img.modifiers.r = inputs["Rotation (Deg)"].val();
      obj.data.info.img.modifiers.a = inputs["Altitude"].val();
      obj.data.info.img.modifiers.tr = inputs["Threat Range"].val();
      obj.data.info.img.modifiers.c = col.val();
      obj.sync("updateAsset");
      //layout.coverlay("board-settings");
    }
  }).appendTo(div);

  return div;
});

sync.render("ui_editAction", function(obj, app, scope){
  scope = scope || {mode : app.attr("mode") || "Equation"};
  obj.data.options = obj.data.options || {};
  obj.data.eventData = obj.data.eventData || {data : ""};

  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");

  var buttonDiv = $("<div>").appendTo(div);
  buttonDiv.addClass("flexrow subtitle");

  var modes = ["Equation", "Choices", "Flavor Texts", "Raw JSON"];

  for (var i in modes) {
    var button = $("<button>").appendTo(buttonDiv);
    if (modes[i] == scope.mode) {
      button.addClass("highlight alttext");
    }
    button.text(modes[i]);
    button.click(function(){
      app.attr("mode", $(this).text());
      obj.update();
    });
  }

  var button = $("<button>").appendTo(buttonDiv);
  if (obj.data.hot) {
    button.addClass("highlight alttext");
  }
  else {
    button.addClass("background alttext");
  }
  button.text("Hotbar");
  button.click(function(){
    if (obj.data.hot) {
      delete obj.data.hot;
    }
    else {
      obj.data.hot = "1";
    }
    obj.update();
    game.players.update();
  });

  if (scope.mode == "Equation") {
    div.append("<b>Default Equation</b>");

    var textarea = $("<textarea>").appendTo(div);
    textarea.addClass("flex subtitle");
    textarea.attr("placeholder", "Enter an equation with its defaults, \n#roll=d20;#penalty=2;d20+@bonus+@penalty");
    textarea.val(data.eventData.data);
    textarea.change(function(){
      obj.data.eventData.data = $(this).val();
      obj.update();
    });
  }
  else if (scope.mode == "Choices") {
    var context = sync.context(obj.data.eventData.data, {}).context;
    div.append("<b>Choices</b>");
    div.removeClass("flexcolumn");

    var datalist = $("<datalist>").appendTo(div);
    datalist.attr("id", "edit-action-context-"+app.attr("id"));

    for (var i in context) {
      datalist.append("<option>"+i+"</option>");
    }

    for (var i in data.choices) {
      var choiceWrapper = $("<div>").appendTo(div);
      choiceWrapper.addClass("flexcolumn lrpadding");

      var optionWrap = $("<div>").appendTo(choiceWrapper);
      optionWrap.addClass("flexrow flexbetween");
      optionWrap.append("<b>"+i+"</b>");

      var optionRemove = genIcon("remove").appendTo(optionWrap);
      optionRemove.addClass("destroy flexmiddle");
      optionRemove.attr("index", i);
      optionRemove.click(function(){
        delete obj.data.choices[$(this).attr("index")];
        obj.update();
      });

      for (var j in data.choices[i]) {
        var choiceWrap = $("<div>").appendTo(choiceWrapper);
        choiceWrap.addClass("flexrow subtitle");
        choiceWrap.css("padding-left", "1em");
        choiceWrap.append("<b>"+j+"</b>");

        var choiceInput = genInput({
          parent : choiceWrap,
          classes : "line lrmargin flex",
          value : (data.choices[i][j]!=null&&data.choices[i][j]!==true)?(data.choices[i][j]):(""),
          index : i,
          choice : j
        });
        choiceInput.change(function(){
          obj.data.choices[$(this).attr("index")] = obj.data.choices[$(this).attr("index")] || {};
          obj.data.choices[$(this).attr("index")][$(this).attr("choice")] = $(this).val();
        });

        var optionRemove = genIcon("remove").appendTo(choiceWrap);
        optionRemove.addClass("destroy flexmiddle");
        optionRemove.attr("index", i);
        optionRemove.attr("choice", j);
        optionRemove.click(function(){
          delete obj.data.choices[$(this).attr("index")][$(this).attr("choice")];
          obj.update();
        });
      }
      var addOption = genIcon("plus", "Context").appendTo(div);
      addOption.addClass("subtitle create");
      addOption.attr("index", i);
      addOption.click(function(){
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          inputs : {
            "Input Name" : {type : "list", list : "edit-action-context-"+app.attr("id")}
          },
          click : function(ev, inputs){
            var name = inputs["Input Name"].val();
            console.log(inputs);
            inputs["Input Name"].attr("list");
            if (name) {
              name = replaceAll(name, " ", "_");
              name = replaceAll(name, "@", "");
              name = replaceAll(name, "(", "_");
              name = replaceAll(name, ")", "_");
              name = replaceAll(name, "[", "_");
              name = replaceAll(name, "]", "_");
              name = replaceAll(name, "!", "_");
              name = replaceAll(name, "#", "_");
              name = replaceAll(name, "$", "_");
              obj.data.choices[index] = obj.data.choices[index] || {};
              console.log(name);
              obj.data.choices[index][name] = "0";
              obj.update();
            }
          }
        });
      });
    }

    var addOptionWrap = $("<div>").appendTo(div);
    addOptionWrap.addClass("flexmiddle");

    var addOption = genIcon("plus", "Add Choice").appendTo(addOptionWrap);
    addOption.addClass("create");
    addOption.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Choice Name" : ""
        },
        click : function(ev, inputs){
          var name = inputs["Choice Name"].val()
          if (name) {
            name = replaceAll(name, " ", "_");
            name = replaceAll(name, "@", "");
            name = replaceAll(name, "(", "_");
            name = replaceAll(name, ")", "_");
            name = replaceAll(name, "[", "_");
            name = replaceAll(name, "]", "_");
            name = replaceAll(name, "!", "_");
            name = replaceAll(name, "#", "_");
            name = replaceAll(name, "$", "_");
            obj.data.choices = obj.data.choices || {};
            obj.data.choices[name] = {};
            obj.update();
          }
        }
      });
    });
  }
  else if (scope.mode == "Inputs") {
    var context = sync.context(obj.data.eventData.data, {}).context;
    div.append("<b>Optional Inputs</b>");

    for (var i in data.options) {
      if (context[i]) {
        delete context[i];
      }

      var optionWrap = $("<div>").appendTo(div);
      optionWrap.addClass("flexrow flexbetween subtitle");
      optionWrap.append("<b class='subtitle'>"+i+"</b>");

      var suggestions = genIcon("info-sign", "Suggestions").appendTo(optionWrap);
      suggestions.attr("index", i);
      suggestions.click(function(){
        var optionIndex = $(this).attr("index");
        var content = $("<div>");
        content.addClass("flexcolumn");

        var suggestionList = $("<div>").appendTo(content);
        function buildSuggestions() {
          suggestionList.empty();
          for (var i in obj.data.options[optionIndex]) {
            var optionWrap = $("<div>").appendTo(suggestionList);
            optionWrap.addClass("flexrow subtitle");
            if (obj.data.options[optionIndex][i] instanceof Object) {
              var condition = genIcon("info-sign").appendTo(optionWrap);
              condition.attr("index", i);
              condition.click(function(){
                var optionIdx = $(this).attr("index");
                ui_prompt({
                  target : $(this),
                  inputs : {
                    "Condition" : {placeholder : "(Optional)", value : obj.data.options[optionIndex][optionIdx].cond},
                  },
                  click : function(ev, inputs){
                    if (data.options[optionIndex][optionIdx] instanceof Object) {
                      obj.data.options[optionIndex][optionIdx].cond = inputs["Condition"].val();
                    }
                    buildSuggestions();
                  }
                });
              });

              var value = genInput({
                classes : "line subtitle flex",
                parent : optionWrap,
                value : data.options[optionIndex][i].eq,
                index : i
              });
              value.change(function(){
                obj.data.options[optionIndex][$(this).attr("index")].eq = $(this).val();
                buildSuggestions();
              });

              var name = genInput({
                classes : "line subtitle",
                parent : optionWrap,
                value : data.options[optionIndex][i].mask,
                index : i,
                placeholder : "Mask",
                style : {"width" : "60px"},
              });
              name.change(function(){
                obj.data.options[optionIndex][$(this).attr("index")].mask = $(this).val();
                buildSuggestions();
              });
            }
            else if (data.options[optionIndex][i] !== true && data.options[optionIndex][i] !== false) {
              var value = genInput({
                classes : "line subtitle flex",
                parent : optionWrap,
                value : data.options[optionIndex][i],
                index : i
              });
              value.change(function(){
                obj.data.options[optionIndex][$(this).attr("index")] = $(this).val();
                buildSuggestions();
              });
            }

            var optionRemove = genIcon("remove").appendTo(optionWrap);
            optionRemove.addClass("destroy flexmiddle");
            optionRemove.attr("index", i);
            optionRemove.click(function(){
              delete obj.data.options[optionIndex][$(this).attr("index")];
              buildSuggestions();
            });
          }
        }
        buildSuggestions();

        var addSuggestion = genIcon("plus", "Add Suggestion").appendTo(content);
        addSuggestion.addClass("subtitle create");
        addSuggestion.click(function(){
          ui_prompt({
            target : $(this),
            inputs : {
              "Suggested Value" : "",
              "Condition" : {placeholder : "(Optional)"},
              "Value Mask" : {placeholder : "(Optional)"},
            },
            click : function(ev, inputs){
              if (inputs["Suggested Value"].val()) {
                if (data.options[optionIndex] instanceof Object) {
                  obj.data.options[optionIndex].push({eq : inputs["Suggested Value"].val(), cond : inputs["Condition"].val(), mask : inputs["Value Mask"].val()});
                }
                else {
                  obj.data.options[optionIndex] = [{eq : inputs["Suggested Value"].val(), cond : inputs["Condition"].val(), mask : inputs["Value Mask"].val()}];
                }
                obj.update();
              }
            }
          });
        });

        var pop = ui_popOut({
          target : $(this),
          id : "add-input-options",
        }, content);
      });

      var optionRemove = genIcon("remove").appendTo(optionWrap);
      optionRemove.addClass("destroy flexmiddle");
      optionRemove.attr("index", i);
      optionRemove.click(function(){
        delete obj.data.options[$(this).attr("index")];
        obj.update();
      });
    }

    var addOption = genIcon("plus", "Add Input").appendTo(div);
    addOption.addClass("subtitle create");
    addOption.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Input Name" : ""
        },
        click : function(ev, inputs){
          if (inputs["Input Name"].val()) {
            obj.data.options[inputs["Input Name"].val()] = true;
            obj.update();
          }
        }
      });
    });
  }
  else if (scope.mode == "Flavor Texts") {
    if (data.flavors && data.flavors instanceof Object) {
      div.append("<i class='flexmiddle spadding subtitle'>Random flavor text will be chosen from the list below</i>");

      for (var i in data.flavors) {
        var flavorWrap = $("<div>").appendTo(div);
        flavorWrap.addClass("flexrow subtitle");

        var condition = genIcon("info-sign").appendTo(flavorWrap);
        condition.attr("index", i);
        condition.click(function(){
          var flavorIndex = $(this).attr("index");
          ui_prompt({
            target : $(this),
            inputs : {
              "Condition" : {placeholder : "(Optional)"},
            },
            click : function(ev, inputs){
              if (data.flavors instanceof Object && obj.data.flavors[flavorIndex]) {
                obj.data.flavors[flavorIndex].cond = inputs["Condition"].val();
              }
              obj.update();
            }
          });
        });

        var icon = $("<div>").appendTo(flavorWrap);
        icon.addClass("flexcolumn flexmiddle flex lrmargin outline smooth hover");
        icon.attr("index", i);
        icon.css("max-width", "4.5em");
        icon.css("background-size", "contain");
        icon.css("background-repeat", "no-repeat");
        icon.css("background-position", "center");
        icon.css("background-image", "url('"+obj.data.flavors[i].icon+"')");
        icon.attr("title", "Right click to clear");
        icon.contextmenu(function(){
          delete obj.data.flavors[$(this).attr("index")].icon;
          obj.update();
          return false;
        });
        icon.click(function(){
          var flavorIndex = $(this).attr("index");
          var imgList = sync.render("ui_filePicker")(obj, app, {
            filter : "img",
            change : function(ev, ui, value){
              obj.data.flavors[flavorIndex].icon = value;
              obj.update();
              layout.coverlay("icons-picker");
            }
          });

          var pop = ui_popOut({
            target : $(this),
            id : "icons-picker",
            align : "top",
            prompt : true,
            style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
          }, imgList);
          pop.resizable();
        });

        var name = genInput({
          classes : "line subtitle flex",
          parent : flavorWrap,
          value : data.flavors[i].msg,
          index : i
        });
        name.change(function(){
          var flavorIndex = $(this).attr("index");
          obj.data.flavors[flavorIndex].msg = $(this).val();
          obj.update();
        });

        var optionRemove = genIcon("remove").appendTo(flavorWrap);
        optionRemove.addClass("destroy flexmiddle");
        optionRemove.attr("index", i);
        optionRemove.click(function(){
          obj.data.flavors.splice($(this).attr("index"), 1);
          if (obj.data.flavors.length < 1) {
            delete obj.data.flavors;
          }
          obj.update();
        });
      }
    }
    else {
      div.append("<b>Flavor Text</b>");

      var flavorText = genInput({
        parent : div,
        classes : "subtitle line",
        value : obj.data.eventData.msg
      });
      flavorText.change(function(){
        obj.data.eventData.msg = $(this).val();
        obj.update();
      });

      div.append("<b>Flavor Icon</b>");

      var icon = $("<div>").appendTo(div);
      icon.addClass("flexcolumn flexmiddle flex outline smooth hover");
      icon.css("background-size", "contain");
      icon.css("background-repeat", "no-repeat");
      icon.css("background-position", "center");
      icon.css("background-image", "url('"+obj.data.eventData.icon+"')");
      icon.attr("title", "Right click to clear");
      icon.contextmenu(function(){
        $(this).css("background-image", "none");
        return false;
      });
      icon.click(function(){
        var imgList = sync.render("ui_filePicker")(obj, app, {
          filter : "img",
          change : function(ev, ui, value){
            obj.data.eventData.icon = value;
            obj.update();
            layout.coverlay("icons-picker");
          }
        });

        var pop = ui_popOut({
          target : $(this),
          id : "icons-picker",
          align : "top",
          prompt : true,
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, imgList);
        pop.resizable();
      });
    }

    var addOption = genIcon("plus", "Add Flavor Text").appendTo(div);
    addOption.addClass("subtitle create");
    addOption.click(function(){
      obj.data.flavors = obj.data.flavors || [];
      if (obj.data.flavors.length == 0) {
        obj.data.flavors.push({msg : obj.data.eventData.msg, icon : obj.data.eventData.icon});
      }
      obj.data.flavors.push({msg : "New Flavor Text"});

      obj.update();
    });
  }
  else if (scope.mode == "Raw JSON") {
    sync.render("ui_JSON")(obj, app, {hideConfirm : true, height : "200px", width : "200px"}).appendTo(div);
  }

  return div;
});

var _lastAction;
sync.render("ui_actions", function(obj, app, scope){
  scope = scope || {hideContext : app.attr("hideContext") == "true", mode : parseInt(app.attr("mode") || _lastAction || 0), minimized : app.attr("minimized") == "true"};
  if (!obj) {
    var actionObj = sync.dummyObj();
    actionObj.data = {context : {}};

    game.locals["actions"] = game.locals["actions"] || [];
    game.locals["actions"].push(actionObj);

    actionObj.addApp(app);
    return $("<div>");
  }

  var titles = ["Actions", "Items", "Spells", "Skills"];
  if (app.attr("mode") == null) {
    if (obj.data.context.i) {
      app.attr("mode", 1);
      scope.mode = 1;
    }
    else if (obj.data.context.s) {
      app.attr("mode", 2);
      scope.mode = 2;
    }
  }

  function buildContext(){
    obj.data.options = obj.data.options || {};
    var ctx = sync.defaultContext();
    var ent = getEnt(obj.data.context.c);
    if (ent) {
      var itemData = ent.data.inventory[obj.data.context.i];
      var spellData = ent.data.spellbook[obj.data.context.spl];
      if (itemData && titles[scope.mode] == "Items") {
        obj.data.actions = duplicate(game.templates.actions.i) || {};
        for (var j in ent.data.inventory) {
          for (var i in ent.data.inventory[j]._a) {
            obj.data.actions[i] = ent.data.inventory[j]._a[i];
            obj.data.actions[i].custom = true;
          }
        }
      }
      else if (spellData && titles[scope.mode] == "Spells") {
        obj.data.actions = duplicate(game.templates.actions.i) || {};
        for (var j in ent.data.spellbook) {
          for (var i in ent.data.spellbook[j]._a) {
            obj.data.actions[i] = ent.data.spellbook[j]._a[i];
            obj.data.actions[i].custom = true;
          }
        }
      }
      else {
        obj.data.actions = duplicate(game.templates.actions.c) || {};
        for (var i in ent.data._a) {
          obj.data.actions[i] = ent.data._a[i];
          obj.data.actions[i].custom = true;
        }
      }

      merge(ctx, {c : duplicate(ent.data), i : duplicate(itemData) || duplicate(spellData), spl : duplicate(spellData)});
      ctx["eval"] = {};
      for (var i in obj.data.options) {
        ctx["eval"][i] = duplicate(obj.data.options[i]);
      }
    }
    if (!obj.data.manual) {
      obj.data.loc = duplicate(svd.location);
    }
    if (obj.data.loc) {
      merge(ctx, {loc : duplicate(obj.data.loc)});
    }

    return ctx;
  }


  var context = buildContext();
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");
  if (!scope.minimized) {
    div.css("font-size", "1.4em");
  }
  var ent = getEnt(obj.data.context.c);
  var img = sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png";
  if (!scope.hideContext) {
    var scopeBar = $("<div>").appendTo(div);
    scopeBar.addClass("flexrow");

    var refDiv = $("<div>").appendTo(scopeBar);
    refDiv.addClass("outline smooth hover2 white");
    if (!scope.minimized) {
      refDiv.css("width", "40px");
    }
    else {
      refDiv.css("width", "25px");
      refDiv.css("height", "25px");
    }

    refDiv.css("background-image", "url('"+(img)+"')");
    refDiv.css("background-size", "cover");
    refDiv.css("background-repeat", "no-repeat");
    refDiv.css("background-position", "center");
    refDiv.click(function(){
      if (_down["16"]) {
        var content = sync.newApp("ui_characterSummary");
        ent.addApp(content);
        var popOut = ui_popOut({
          target: $(this),
          id: "char-summary-"+ent.id(),
        }, content);
      }
      else {
        var content = sync.render("ui_assetPicker")(obj, app, {
          rights : "Visible",
          filter : "c",
          sessionOnly : true,
          hideCreate : true,
          select : function(ev, ui, ent, options){
            if (_down["16"]) {
              var content = sync.newApp("ui_characterSummary");
              ent.addApp(content);
              var popOut = ui_popOut({
                target: $(this),
                id: "char-summary-"+ent.id(),
              }, content);
            }
            else {
              data.context.c = ent.id();
              delete data.context.i;
              delete data.context.s;
              obj.update();
              layout.coverlay("ent-list");
            }
          }
        });

        var pop = ui_popOut({
          id : "ent-list",
          prompt : true,
          target : $(this),
          title : "Select Context",
          style : {width : "400px", height : "400px"}
        }, content);
      }
    });

    var name = genIcon("", sync.rawVal(ent.data.info.name)).appendTo(scopeBar);
    name.addClass("flexmiddle lrpadding bold underline");
    name.click(function(){
      assetTypes[ent.data._t].preview(ent, $(this));
    });
    name.contextmenu(function(ev){
      assetTypes.contextmenu(ev, $(this), ent, app, scope);
      ev.stopPropagation();
      return false;
    });
  }

  var actionType = $("<div>").appendTo(div);
  actionType.addClass("flexmiddle bold");

  var title = genIcon("", titles[scope.mode]).appendTo(actionType);
  title.addClass("underline");
  title.click(function(){
    delete obj.data.context.i;
    delete obj.data.context.spl;
    delete obj.data.action;
    delete obj.data.options;

    scope.mode = scope.mode + 1;
    if (scope.mode > 2) {
      scope.mode = 0;
    }
    _lastAction = scope.mode;
    app.attr("mode", scope.mode);
    obj.update();
  });

  if (obj.data.context.i) {
    var refWrap = $("<div>").appendTo(div);
    refWrap.addClass("flexrow hover2 subtitle");
    refWrap.attr("slot", obj.data.context.i);
    refWrap.click(function(){
      delete obj.data.context.i;
      obj.update();
    });
    refWrap.contextmenu(function(){
      var iRef = $(this).attr("slot");
      var ent = getEnt(obj.data.context.c);
      if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
        var actionList = [
          {
            name : "Edit Item",
            attr : {slot : iRef},
            click : function(ev, ui) {
              var iRef = ui.attr("slot");
              var frame = $("<div>");
              frame.addClass("flex flexcolumn");

              game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
              game.locals["editItem"].data = duplicate(ent.data.inventory[iRef]);

              merge(game.locals["editItem"].data, duplicate(game.templates.item));

              var newApp = sync.newApp("ui_renderItem").appendTo(frame);
              newApp.attr("char-ref", ent.id());
              newApp.attr("viewOnly", scope.viewOnly);
              if (ent.data.inventory[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", ent.data) && !hasSecurity(getCookie("UserID"), "Rights", ent.data.inventory[iRef]))  {
                newApp.attr("viewOnly", true);
              }
              newApp.attr("local", "true");

              game.locals["editItem"].addApp(newApp);

              if (!scope.viewOnly) {
                var confirm = $("<button>").appendTo(frame);
                confirm.addClass("fit-x");
                confirm.attr("index", iRef);
                confirm.append("Confirm");
                confirm.click(function(){
                  var iRef = $(this).attr("index");
                  ent.data.inventory[iRef] = duplicate(game.locals["editItem"].data);
                  ent.sync("updateAsset");
                  layout.coverlay("edit-item");
                });
              }
              var pop = ui_popOut({
                target : ui,
                align : "top",
                id : "edit-item",
                maximize : true,
                minimize : true,
                style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
              }, frame);
              pop.resizable();
            }
          }
        ];

        ui_dropMenu($(this), actionList, {id : "inline-edit"});
      }
      return false;
    });


    var refDiv = $("<div>").appendTo(refWrap);
    refDiv.addClass("outline smooth white");
    refDiv.css("width", "25px");
    refDiv.css("height", "25px");

    if (sync.rawVal(ent.data.inventory[obj.data.context.i].info.img)) {
      refDiv.css("background-image", "url('"+(sync.rawVal(ent.data.inventory[obj.data.context.i].info.img))+"')");
    }
    refDiv.css("background-size", "cover");
    refDiv.css("background-repeat", "no-repeat");
    refDiv.css("background-position", "center");

    var itemName = $("<div>").appendTo(refWrap);
    itemName.addClass("flexmiddle lrpadding");
    itemName.append(sync.rawVal(ent.data.inventory[obj.data.context.i].info.name));
  }
  else if (obj.data.context.spl) {
    var refWrap = $("<div>").appendTo(div);
    refWrap.addClass("flexrow hover2 subtitle");
    refWrap.attr("slot", obj.data.context.spl);
    refWrap.contextmenu(function(){
      var iRef = $(this).attr("slot");
      var ent = getEnt(obj.data.context.c);
      if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
        var actionList = [
          {
            name : "Edit",
            attr : {slot : iRef},
            click : function(ev, ui) {
              var iRef = ui.attr("slot");
              var frame = $("<div>");
              frame.addClass("flex flexcolumn");

              game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
              game.locals["editItem"].data = duplicate(ent.data.spellbook[iRef]);

              merge(game.locals["editItem"].data, duplicate(game.templates.item));

              var newApp = sync.newApp("ui_renderItem").appendTo(frame);
              newApp.attr("char-ref", ent.id());
              newApp.attr("viewOnly", scope.viewOnly);
              if (ent.data.spellbook[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", ent.data) && !hasSecurity(getCookie("UserID"), "Rights", ent.data.spellbook[iRef]))  {
                newApp.attr("viewOnly", true);
              }
              newApp.attr("local", "true");

              game.locals["editItem"].addApp(newApp);

              if (!scope.viewOnly) {
                var confirm = $("<button>").appendTo(frame);
                confirm.addClass("fit-x");
                confirm.attr("index", iRef);
                confirm.append("Confirm");
                confirm.click(function(){
                  var iRef = $(this).attr("index");
                  ent.data.spellbook[iRef] = duplicate(game.locals["editItem"].data);
                  ent.sync("updateAsset");
                  layout.coverlay("edit-item");
                });
              }
              var pop = ui_popOut({
                target : ui,
                align : "top",
                id : "edit-item",
                maximize : true,
                minimize : true,
                style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
              }, frame);
              pop.resizable();
            }
          }
        ];

        ui_dropMenu($(this), actionList, {id : "inline-edit"});
      }
      return false;
    });

    refWrap.click(function(){
      delete obj.data.context.spl;
      obj.update();
    });

    var refDiv = $("<div>").appendTo(refWrap);
    refDiv.addClass("outline smooth white");
    refDiv.css("width", "25px");
    refDiv.css("height", "25px");
    if (sync.rawVal(ent.data.spellbook[obj.data.context.spl].info.img)) {
      refDiv.css("background-image", "url('"+(sync.rawVal(ent.data.spellbook[obj.data.context.spl].info.img))+"')");
    }
    refDiv.css("background-size", "cover");
    refDiv.css("background-repeat", "no-repeat");
    refDiv.css("background-position", "center");

    var itemName = $("<div>").appendTo(refWrap);
    itemName.addClass("flexmiddle lrpadding");
    itemName.append(sync.rawVal(ent.data.spellbook[obj.data.context.spl].info.name));
  }

  if (titles[scope.mode] == "Items" && !obj.data.context.i) {
    var favItems = $("<div>").appendTo(div);
    favItems.addClass("flexcolumn");

    var itemList = $("<div>").appendTo(div);
    itemList.addClass("flexrow flexwrap flexaround");

    for (var i in ent.data.inventory) {
      var refWrap;
      if (ent.data.inventory[i].tags["equipped"]) {
        refWrap = $("<div>").appendTo(favItems);
        refWrap.addClass("flexrow hover2 subtitle");
        refWrap.attr("slot", i);

        var refDiv = $("<div>").appendTo(refWrap);
        refDiv.addClass("outline smooth white");
        refDiv.css("width", "25px");
        refDiv.css("height", "25px");

        if (sync.rawVal(ent.data.inventory[i].info.img)) {
          refDiv.css("background-image", "url('"+(sync.rawVal(ent.data.inventory[i].info.img))+"')");
        }
        refDiv.css("background-size", "cover");
        refDiv.css("background-repeat", "no-repeat");
        refDiv.css("background-position", "center");

        var itemName = $("<div>").appendTo(refWrap);
        itemName.addClass("flexmiddle lrpadding");
        itemName.append(sync.rawVal(ent.data.inventory[i].info.name));
      }
      else {
        refWrap = $("<div>").appendTo(itemList);
        refWrap.addClass("outline smooth hover2 white");
        refWrap.attr("title", sync.rawVal(ent.data.inventory[i].info.name));
        refWrap.attr("slot", i);
        refWrap.css("width", "25px");
        refWrap.css("height", "25px");

        if (sync.rawVal(ent.data.inventory[i].info.img)) {
          refWrap.css("background-image", "url('"+(sync.rawVal(ent.data.inventory[i].info.img))+"')");
        }
        refWrap.css("background-size", "cover");
        refWrap.css("background-repeat", "no-repeat");
        refWrap.css("background-position", "center");
      }
      refWrap.click(function(){
        obj.data.context.i = $(this).attr("slot");
        obj.update();
      });
      refWrap.contextmenu(function(){
        var iRef = $(this).attr("slot");
        var ent = getEnt(obj.data.context.c);
        if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          var actionList = [
            {
              name : "Edit",
              attr : {slot : iRef},
              click : function(ev, ui) {
                var iRef = ui.attr("slot");

                var frame = $("<div>");
                frame.addClass("flex flexcolumn");

                game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
                game.locals["editItem"].data = duplicate(ent.data.inventory[iRef]);

                merge(game.locals["editItem"].data, duplicate(game.templates.item));

                var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                newApp.attr("char-ref", ent.id());
                newApp.attr("viewOnly", scope.viewOnly);
                if (ent.data.inventory[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", ent.data) && !hasSecurity(getCookie("UserID"), "Rights", ent.data.inventory[iRef]))  {
                  newApp.attr("viewOnly", true);
                }
                newApp.attr("local", "true");

                game.locals["editItem"].addApp(newApp);

                if (!scope.viewOnly) {
                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.attr("index", iRef);
                  confirm.append("Confirm");
                  confirm.click(function(){
                    var iRef = $(this).attr("index");
                    ent.data.inventory[iRef] = duplicate(game.locals["editItem"].data);
                    ent.sync("updateAsset");
                    layout.coverlay("edit-item");
                  });
                }
                var pop = ui_popOut({
                  target : ui,
                  align : "top",
                  id : "edit-item",
                  maximize : true,
                  minimize : true,
                  style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
                }, frame);
                pop.resizable();
              }
            }
          ];

          ui_dropMenu($(this), actionList, {id : "inline-edit"});
        }
        return false;
      });
    }

    return div;
  }
  else if (titles[scope.mode] == "Spells" && !obj.data.context.spl) {
    var favItems = $("<div>").appendTo(div);
    favItems.addClass("flexcolumn");

    var itemList = $("<div>").appendTo(div);
    itemList.addClass("flexrow flexwrap flexaround");

    for (var i in ent.data.spellbook) {
      var refWrap;
      if (ent.data.spellbook[i].tags["equipped"]) {
        refWrap = $("<div>").appendTo(favItems);
        refWrap.addClass("flexrow hover2 subtitle");
        refWrap.attr("slot", i);

        var refDiv = $("<div>").appendTo(refWrap);
        refDiv.addClass("outline smooth white");
        refDiv.css("width", "25px");
        refDiv.css("height", "25px");

        if (sync.rawVal(ent.data.spellbook[i].info.img)) {
          refDiv.css("background-image", "url('"+(sync.rawVal(ent.data.spellbook[i].info.img))+"')");
        }
        refDiv.css("background-size", "cover");
        refDiv.css("background-repeat", "no-repeat");
        refDiv.css("background-position", "center");

        var itemName = $("<div>").appendTo(refWrap);
        itemName.addClass("flexmiddle lrpadding");
        itemName.append(sync.rawVal(ent.data.spellbook[i].info.name));
      }
      else {
        refWrap = $("<div>").appendTo(itemList);
        refWrap.addClass("outline smooth hover2 white");
        refWrap.attr("title", sync.rawVal(ent.data.spellbook[i].info.name));
        refWrap.css("width", "25px");
        refWrap.css("height", "25px");

        if (sync.rawVal(ent.data.spellbook[i].info.img)) {
          refWrap.css("background-image", "url('"+(sync.rawVal(ent.data.spellbook[i].info.img))+"')");
        }
        refWrap.css("background-size", "cover");
        refWrap.css("background-repeat", "no-repeat");
        refWrap.css("background-position", "center");
        refWrap.attr("slot", i);
      }
      refWrap.click(function(){
        obj.data.context.spl = $(this).attr("slot");
        obj.update();
      });
      refWrap.contextmenu(function(){
        var iRef = $(this).attr("slot");
        var ent = getEnt(obj.data.context.c);
        if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          var actionList = [
            {
              name : "Edit",
              attr : {slot : iRef},
              click : function(ev, ui) {
                var iRef = ui.attr("slot");
                var frame = $("<div>");
                frame.addClass("flex flexcolumn");

                game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
                game.locals["editItem"].data = duplicate(ent.data.spellbook[iRef]);

                merge(game.locals["editItem"].data, duplicate(game.templates.item));

                var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                newApp.attr("char-ref", ent.id());
                newApp.attr("viewOnly", scope.viewOnly);
                if (ent.data.spellbook[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", ent.data) && !hasSecurity(getCookie("UserID"), "Rights", ent.data.spellbook[iRef]))  {
                  newApp.attr("viewOnly", true);
                }
                newApp.attr("local", "true");

                game.locals["editItem"].addApp(newApp);

                if (!scope.viewOnly) {
                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.attr("index", iRef);
                  confirm.append("Confirm");
                  confirm.click(function(){
                    var iRef = $(this).attr("index");
                    ent.data.spellbook[iRef] = duplicate(game.locals["editItem"].data);
                    ent.sync("updateAsset");
                    layout.coverlay("edit-item");
                  });
                }
                var pop = ui_popOut({
                  target : ui,
                  align : "top",
                  id : "edit-item",
                  maximize : true,
                  minimize : true,
                  style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
                }, frame);
                pop.resizable();
              }
            }
          ];

          ui_dropMenu($(this), actionList, {id : "inline-edit"});
        }
        return false;
      });
    }
    return div;
  }

  var actionList = $("<div>").appendTo(div);
  actionList.addClass("flexcolumn subtitle");

  var addActionWrap = $("<div>").appendTo(div);
  addActionWrap.addClass("flexcolumn fit-x flexmiddle lrpadding bold create subtitle");

  var addAction = genIcon("plus", "Add").appendTo(addActionWrap);
  addAction.attr("title", "Add Action");
  addAction.click(function(){
    if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
      ui_prompt({
        target : $(this),
        inputs : {
          "New Action Name" : ""
        },
        click : function(ev, inputs){
          if (inputs["New Action Name"].val()) {
            if (titles[scope.mode] == "Actions") {
              ent.data._a = ent.data._a || {};
              ent.data._a[inputs["New Action Name"].val()] = {};
              obj.update();
            }
            else if (titles[scope.mode] == "Items") {
              ent.data.inventory[data.context.i]._a = ent.data.inventory[data.context.i]._a || {};
              ent.data.inventory[data.context.i]._a[inputs["New Action Name"].val()] = {};
              obj.update();
            }
            else if (titles[scope.mode] == "Spells") {
              ent.data.spellbook[data.context.spl]._a = ent.data.spellbook[data.context.spl]._a || {};
              ent.data.spellbook[data.context.spl]._a[inputs["New Action Name"].val()] = {};
              obj.update();
            }
          }
          else {
            sendAlert({text : "No Name Entered"});
          }
        }
      });
    }
  });
  if (obj.data.action || (titles[scope.mode] != "Actions"  && !obj.data.context.i && !obj.data.context.spl)) {
    addAction.hide();
  }

  var optionMenu = $("<div>").appendTo(div);
  optionMenu.attr("action", obj.data.action);
  optionMenu.addClass("flex");

  for (var key in obj.data.actions) {
    var option = $("<div>").appendTo(actionList);
    option.addClass("flexcolumn");
    option.attr("action", key);

    var optionName = $("<b>").appendTo(option);
    optionName.addClass("hover2 lrpadding");
    optionName.attr("action", key);
    if (obj.data.action == key && obj.data.actions[key].range) {
      optionName.append(key + " ("+sync.eval(obj.data.actions[key].range, context)+")");
    }
    else {
      optionName.append(key);
    }
    optionName.click(function(){
      var optionName = $(this);
      var actionData = obj.data.actions[$(this).attr("action")];
      if (!actionData.eventData) {
        var content = $("<div>");
        content.addClass("flexcolumn flex");

        var newObj = sync.obj();
        newObj.data = duplicate(actionData);

        var newApp = sync.newApp("ui_editAction").appendTo(content);
        newObj.addApp(newApp);

        var confirm = $("<button>").appendTo(content);
        confirm.addClass("highlight alttext");
        confirm.append("Confirm");
        confirm.click(function(){
          if (!newObj.data.eventData || !newObj.data.eventData.data) {
            sendAlert({text : "You must assign an equation"});
            return false;
          }
          var index = optionName.attr("action");
          if (titles[scope.mode] == "Actions") {
            ent.data._a = ent.data._a || {};
            ent.data._a[index] = newObj.data;
            runCommand("updateActions", {id : data.context.c, _a : ent.data._a});
            obj.update();
          }
          else if (titles[scope.mode] == "Items") {
            ent.data.inventory[data.context.i]._a = ent.data._a || {};
            ent.data.inventory[data.context.i]._a[index] = newObj.data;
            runCommand("updateActions", {id : data.context.c, path : "inventory."+data.context.i+".", _a : ent.data.inventory[data.context.i]._a});
            obj.update();
          }
          else if (titles[scope.mode] == "Spells") {
            ent.data.spellbook[data.context.spl]._a = ent.data._a || {};
            ent.data.spellbook[data.context.spl]._a[index] = newObj.data;
            runCommand("updateActions", {id : data.context.c, path : "spellbook."+data.context.spl+".", _a : ent.data.spellbook[data.context.spl]._a});
            obj.update();
          }
          layout.coverlay("edit-action");
        });

        var pop = ui_popOut({
          target : optionName,
          id : "edit-action",
          title : optionName.attr("action"),
          style : {height : "300px"}
        }, content);
        pop.resizable();
        return false;
      }

      if (obj.data.action != $(this).attr("action")) {
        addAction.hide();
        buildOptions($(this).attr("action"), $(this).parent());
      }
      else {
        delete obj.data.action;
        obj.update();
      }
    });
    optionName.contextmenu(function(){
      var optionName = $(this);
      var actionData = obj.data.actions[$(this).attr("action")];
      if (hasSecurity(getCookie("UserID"), "Rights", ent.data) && actionData) {
        var actionList = [];
        actionList.push({
          name : "Edit",
          click : function(){
            var content = $("<div>");
            content.addClass("flexcolumn flex");

            var newObj = sync.obj();
            newObj.data = duplicate(actionData);

            var newApp = sync.newApp("ui_editAction").appendTo(content);
            newObj.addApp(newApp);

            var confirm = $("<button>").appendTo(content);
            confirm.addClass("highlight alttext");
            confirm.append("Confirm");
            confirm.click(function(){
              if (!newObj.data.eventData || !newObj.data.eventData.data) {
                sendAlert({text : "You must assign an equation"});
                return false;
              }
              var index = optionName.attr("action");
              if (titles[scope.mode] == "Actions") {
                ent.data._a = ent.data._a || {};
                ent.data._a[index] = newObj.data;
                runCommand("updateActions", {id : data.context.c, _a : ent.data._a});
                obj.update();
              }
              else if (titles[scope.mode] == "Items") {
                ent.data.inventory[data.context.i]._a = ent.data.inventory[data.context.i]._a || {};
                ent.data.inventory[data.context.i]._a[index] = newObj.data;
                runCommand("updateActions", {id : data.context.c, path : "inventory."+data.context.i+".", _a : ent.data.inventory[data.context.i]._a});
                obj.update();
              }
              else if (titles[scope.mode] == "Spells") {
                ent.data.spellbook[data.context.spl]._a = ent.data.spellbook[data.context.spl]._a || {};
                ent.data.spellbook[data.context.spl]._a[index] = newObj.data;
                runCommand("updateActions", {id : data.context.c, path : "spellbook."+data.context.spl+".", _a : ent.data.spellbook[data.context.spl]._a});
                obj.update();
              }
              layout.coverlay("edit-action");
            });

            var pop = ui_popOut({
              target : optionName,
              id : "edit-action",
              title : optionName.attr("action"),
              style : {height : "300px"}
            }, content);
            pop.resizable();
          }
        });
        if (actionData.custom) {
          actionList.push({
            name : "Delete",
            submenu : [{name : "CONFIRM", click : function(){
              var index = optionName.attr("action");
              if (titles[scope.mode] == "Actions") {
                delete ent.data._a[index];
                runCommand("updateActions", {id : data.context.c, delete : index});
                obj.update();
              }
              else if (titles[scope.mode] == "Items") {
                runCommand("updateActions", {id : data.context.c, path : "inventory."+data.context.i+".", delete : index});
                obj.update();
              }
              else if (titles[scope.mode] == "Spells") {
                runCommand("updateActions", {id : data.context.c, path : "spellbook."+data.context.s+".", delete : index});
                obj.update();
              }
            }}]
          });
        }
        ui_dropMenu($(this), actionList, {id : "actions-drop"});
      }

      return false;
    });
  }

  var rollButtons = $("<div>").appendTo(div);
  rollButtons.addClass("flexrow");
  rollButtons.css("margin-top", "4px");

  var rollButton = $("<button>").appendTo(rollButtons);
  rollButton.addClass("highlight alttext flex");
  rollButton.append("Roll");
  rollButton.contextmenu(function(){
    var actionList = [
      //{name : "Set Manual Range"},
      //{name : "Set Manual Targets"},
      {name : "With Flavor Text", click : function(ev, ui){
        ui_prompt({
          target : ui,
          inputs : {
            "Flavor Text" : ""
          },
          click : function(ev, inputs){
            rollButton.attr("flavor", inputs["Flavor Text"].val());
            rollButton.click();
          }
        });
      }}
    ];

    ui_dropMenu($(this), actionList, {id : "actions-drop"});
    return false;
  });
  rollButton.click(function(){
    var actionData = data.actions[data.action];
    var ctx = buildContext();

    var addStr = "";
    var str = actionData.eventData.data;
    var final = "";
    var vMatch = variableRegex.exec(str);
    // save localVaribles
    var cmps = /([\/><\!\~\=])/;
    var context = sync.context(actionData.eventData.data, ctx, true);

    for (var key in data.options) {
      if (data.options[key] !== true) {
        context.context[key] = sync.newValue(data.options[key], sync.eval(data.options[key], ctx));
      }
    }
    while (vMatch) {
      if (vMatch[2] && vMatch[4] && vMatch[4][0] == "=") {
        var stack = [0];
        for (var i=1; i<vMatch[4].length; i++) {
          if (vMatch[4][i] == "=" && !((vMatch[4][i-1] || "").match(cmps) || (vMatch[4][i+1] || "").match(cmps))) {
            stack.push(i);
          }
          else if (vMatch[4][i] == ";") {
            stack.pop();
            if (stack.length == 0) {
              stack = i+1; // record the successful index
              break;
            }
          }
        }
      }
      if (!(stack instanceof Object)) {
        var newStr = vMatch[1]+(vMatch[2] || "");
        if (context.context[vMatch[2]]) {
          newStr += "="+sync.val(context.context[vMatch[2]])+";"
        }
        else {
          newStr += vMatch[4].substring(0, stack);
        }
        final += newStr;
        vMatch[0] = (vMatch[1] || "") +(vMatch[2] || "") + (vMatch[3] || "") + vMatch[4].substring(0, stack);
      }
      str = str.replace(vMatch[0], "");
      vMatch = variableRegex.exec(str);
    }
    for (var i in context.context) {
      if (!final.match(i)) {
        final += "$"+i+"="+sync.val(context.context[i])+";";
      }
    }
    final += context.str;
    var varTable = duplicate(actionData.eventData.var);
    for (var key in varTable) {
      varTable[key] = sync.eval(varTable[key], ctx);
    }
    var icon;
    var msg;
    if (actionData.flavors) {
      var choices = [];
      for (var i in actionData.flavors) {
        if (!actionData.flavors[i].cond || sync.eval(actionData.flavors[i].cond, ctx)) {
          choices.push(duplicate(actionData.flavors[i]));
        }
      }
      var choice = Math.floor(Math.random() * choices.length);
      icon = actionData.flavors[choice].icon;
      msg = sync.eval(actionData.flavors[choice].msg, ctx);
    }
    else {
      icon = actionData.eventData.icon;
      msg = sync.eval(actionData.eventData.msg, ctx);
    }
    if (rollButton.attr("flavor")) {
      msg = rollButton.attr("flavor");
      rollButton.removeAttr("flavor");
    }
    var eventData = {
      f : sync.rawVal(ctx.c.info.name),
      icon : icon,
      msg : msg,
      ui : actionData.eventData.ui,
      data : sync.executeQuery(final, ctx),
      var : varTable
    };

    if (rollButton.attr("private") == "true") {
      var priv = {};
      priv[getCookie("UserID")] = true;
      eventData.p = priv;
    }
    runCommand("diceCheck", eventData);
    setTimeout(function(){
      for (var i in actionData.followup) {
        if (actionData.followup[i].cond == null || sync.eval(actionData.followup[i].cond, ctx)) {
          var eventData = {
            f : sync.rawVal(ctx.c.info.name),
            icon : actionData.followup[i].icon,
            msg : sync.eval(actionData.followup[i].msg, ctx),
            ui : actionData.followup[i].ui,
            data : sync.executeQuery(actionData.followup[i].data, ctx),
            var : varTable
          };
          if (rollButton.attr("private") == "true") {
            var priv = {};
            priv[getCookie("UserID")] = true;
            eventData.p = priv;
          }
          runCommand("diceCheck", eventData);
        }
      }
    }, 100);

    rollButton.removeAttr("private");
  });

  var privateRoll = $("<button>").appendTo(rollButtons);
  privateRoll.addClass("background subtitle alttext");
  privateRoll.append("Private");
  privateRoll.click(function(){
    rollButton.attr("private", "true");
    rollButton.click();
  });
  privateRoll.contextmenu(function(){
    var actionList = [
      //{name : "Set Manual Range"},
      //{name : "Set Manual Targets"},
      {name : "With Flavor Text", click : function(ev, ui){
        ui_prompt({
          target : ui,
          inputs : {
            "Flavor Text" : ""
          },
          click : function(ev, inputs){
            rollButton.attr("private", "true");
            rollButton.attr("flavor", inputs["Flavor Text"].val());
            rollButton.click();
          }
        });
      }}
    ];

    ui_dropMenu($(this), actionList, {id : "actions-drop"});
    return false;
  });

  rollButtons.hide();

  function buildOptions(action) {
    var context = buildContext();
    obj.data.action = action;
    actionList.children().each(function(){
      if ($(this).attr("action") != action) {
        $(this).hide();
        $(this).removeClass("underline");
      }
      else {
        $(this).addClass("underline");
        if (obj.data.actions[action].range) {
          $($(this).children()[0]).text(action + " ("+sync.eval(obj.data.actions[action].range, context)+")");
        }
        else {
          $($(this).children()[0]).text(action);
        }
      }
    });
    optionMenu.attr("action", action);
    optionMenu.empty();

    var actionData = data.actions[action];

    if (actionData.choices) {
      var choices = $("<div>").appendTo(optionMenu);
      choices.addClass("flexrow flexwrap flexmiddle subtitle");

      for (var choiceKey in actionData.choices) {
        var choice = $("<button>").appendTo(choices);
        choice.addClass("alttext subtitle");
        if (JSON.stringify(data.options) == JSON.stringify(actionData.choices[choiceKey])) {
          choice.addClass("highlight");
        }
        else {
          choice.addClass("background");
        }
        choice.attr("key", choiceKey);
        choice.append(choiceKey);
        choice.click(function(){
          data.options = duplicate(actionData.choices[$(this).attr("key")]);
          obj.update();
        });
      }
    }

    for (var key in actionData.options) {
      var optionWrap = $("<div>").appendTo(optionMenu);
      optionWrap.addClass("lrmargin flexrow flexbetween subtitle");
      optionWrap.append("<b>"+key+"</b>");
      var optionValue = genInput({
        parent : optionWrap,
        classes : "line lrmargin",
        index : key,
        val : data.options[key] || "",
        value : (data.options[key] != null&&data.options[key]!==true)?(sync.eval(data.options[key] || "", context)):(""),
        style : {"width" : "25px", "text-align" : "center", "transition" : "width 0.25s"}
      });
      if (!scope.minimized) {
        optionValue.css("width", "30px");
      }

      optionValue.blur(function(){
        if (!scope.minimized) {
          $(this).css("width", "30px");
        }
        else {
          $(this).css("width", "25px");
        }
        $(this).css("text-align", "center");
        if ($(this).attr("val")) {
          $(this).val(sync.eval($(this).attr("val"), buildContext()));
        }
        $(this).removeAttr("placeholder");
      });
      optionValue.change(function(){
        var key = $(this).attr("index");
        if ($(this).val()) {
          data.options[key] = $(this).val();
          $(this).attr("val", $(this).val());
          $(this).val(sync.eval($(this).val(), buildContext()));
        }
        else {
          $(this).removeAttr("val");
          delete data.options[key];
        }
        $(this).blur();
        layout.coverlay("drop-actions-suggestions");
      });
      optionValue.focus(function(){
        var optionValue = $(this);
        var actionData = data.actions[data.action];
        if (actionData.options && actionData.options[$(this).attr("index")] instanceof Object && $(this).val() == "") {
          var actionList = [];
          for (var i in actionData.options[$(this).attr("index")]) {
            var optionData = actionData.options[$(this).attr("index")][i];
            if (optionData instanceof Object) {
              if (!optionData.cond || sync.eval(optionData.cond, buildContext())) {
                actionList.push({
                  name : String(optionData.mask || optionData.eq),
                  attr : {val : optionData.eq},
                  click : function(ev, ui){
                    optionValue.val(ui.attr("val"), buildContext());
                    optionValue.change();
                  }
                });
              }
            }
            else {
              actionList.push({
                name : String(optionData),
                attr : {val : optionData},
                click : function(ev, ui){
                  optionValue.val(ui.attr("val"), buildContext());
                  optionValue.change();
                }
              });
            }
          }
          ui_dropMenu($(this), actionList, {"id" : "drop-actions-suggestions", hideClose : true});
        }

        var ctx = sync.context(actionData.eventData.data, buildContext()).context;
        if (sync.rawVal(ctx[$(this).attr("index")])) {
          $(this).attr("placeholder", sync.rawVal(ctx[$(this).attr("index")]));
        }
        if (!scope.minimized) {
          $(this).css("width", "150px");
        }
        else {
          $(this).css("width", Math.max(Math.min(150, ($(this).attr("val") || "").length*12), 75)+"px");
        }
        $(this).css("text-align", "left");
        $(this).val($(this).attr("val"));
      });
      optionValue.contextmenu(function(){
        var optionValue = $(this);
        if (actionData.options && actionData.options[$(this).attr("index")] instanceof Object) {
          var actionList = [];
          for (var i in actionData.options[$(this).attr("index")]) {
            var optionData = actionData.options[$(this).attr("index")][i];
            if (optionData instanceof Object) {
              if (!optionData.cond || sync.eval(optionData.cond, buildContext())) {
                actionList.push({
                  name : String(optionData.mask || optionData.eq),
                  attr : {val : optionData.eq},
                  click : function(ev, ui){
                    optionValue.val(ui.attr("val"), buildContext());
                    optionValue.change();
                  }
                });
              }
            }
            else {
              actionList.push({
                name : String(optionData),
                attr : {val : optionData},
                click : function(ev, ui){
                  optionValue.val(ui.attr("val"), buildContext());
                  optionValue.change();
                }
              });
            }
          }
          ui_dropMenu($(this), actionList, {"id" : "drop-actions-suggestions", hideClose : true, style : {"font-size" : "0.8em"}});
        }
        return false;
      });
    }

    rollButtons.show();
  }
  if (obj.data.action) {
    buildOptions(obj.data.action);
  }

  return div;
});

function _diceable(ev, ui, evData, ctx) {
  var eventData = duplicate(evData);
  var context = duplicate(ctx);
  if (_down["17"]) {
    snd_diceRoll.play();
    eventData.msg = sync.eval(eventData.msg, context);
    eventData.data = sync.executeQuery(eventData.data, context);
    runCommand("diceCheck", eventData);
  }
  else {
    function modifiedRoll(ev, ui2) {
      var pool = game.templates.dice.pool;
      if (pool[game.templates.dice.defaults[0]].value) {
        eventData.msg = sync.eval(eventData.msg, context);
        eventData.data = sync.executeQuery(eventData.data, context, true);
        var content = $("<div>");

        var dicePool = $("<div>").appendTo(content);
        dicePool.addClass("flexrow flexwrap outlinebottom");
        function buildPool() {
          dicePool.empty();
          for (var key in eventData.data.equations) {
            var value = eventData.data.equations[key];

            var die = sync.render("ui_dice")(value, content, {
              key : sync.rawVal(value.ctx.die),
              width : "3em",
              height : "3em",
              value : 0,
            }).appendTo(dicePool);
            die.attr("index", key);
            die.css("cursor", "pointer");
            die.click(function(){
              eventData.data.equations.splice($(this).attr("index"), 1);
              buildPool();
            });
          }
        }
        var modPool = $("<div>").appendTo(content);
        modPool.addClass("flexrow flexwrap outlinebottom");

        for (var key in pool) {
          if (pool[key].static) {
            var value = pool[key];
            var addDie = sync.render("ui_dice")(sync.process("$die="+key+";"+value.value, null, true), content, {
              key : key,
              width : "2em",
              height : "2em",
              value : 0
            }).appendTo(modPool);
            addDie.css("cursor", "pointer");
            addDie.css("opacity", "0.5");
            addDie.hover(function(){
              $(this).css("opacity", "");
            },
            function(){
              $(this).css("opacity", "0.5");
            });
            addDie.attr("name", key);
            addDie.attr("value", pool[key].value);
            addDie.click(function(){
              eventData.data.equations.push(sync.process("$die="+$(this).attr("name")+";"+$(this).attr("value"), null, true));
              buildPool();
            });
          }
        }
        buildPool();
        var confirm = $("<button>").appendTo(content);
        confirm.addClass("fit-x flexmiddle");
        confirm.append("Confirm");
        confirm.click(function(ev){
          snd_diceRoll.play();
          var diceKeys = game.templates.dice.keys;
          eventData.data.pool = {};
          for (var key in eventData.data.equations) {
            var eq = eventData.data.equations[key];
            eq.r = sync.reduce(eq.e);
            eq.v = sync.eval(eq.r);
            if (sync.rawVal(eq.ctx.die) && game.templates.dice.pool[sync.rawVal(eq.ctx.die)]) {
              var diceData = game.templates.dice.pool[sync.rawVal(eq.ctx.die)];
              if (diceData && diceData.results) {
                var valueData = diceData.results[eq.v];
                for (var key in valueData) {
                  if (eventData.data.pool[key]) {
                    eventData.data.pool[key] += valueData[key];
                  }
                  else {
                    eventData.data.pool[key] = valueData[key];
                  }
                }
              }
            }
          }
          runCommand("diceCheck", eventData);
          layout.coverlay("diceable-modified");
        });
        ui_popOut({
          target : ui,
          id : "diceable-modified",
        }, content);
      }
      else {
        ui_prompt({
          target : ui,
          id : "diceable-modified",
          inputs : {
            "Modifier Amount" : {type : "number", value : 0}
          },
          click : function(ev, inputs) {
            snd_diceRoll.play();
            if (eventData.inverted) {
              eventData.data = eventData.data + "-" + inputs["Modifier Amount"].val();
            }
            else {
              eventData.data = eventData.data + "+" + inputs["Modifier Amount"].val();
            }
            eventData.msg = sync.eval(eventData.msg, context);
            eventData.data = sync.executeQuery(eventData.data, context);
            runCommand("diceCheck", eventData);
          }
        });
      }
    }
    var pool = game.templates.dice.pool;
    if (pool[game.templates.dice.defaults[0]].value) {
      modifiedRoll(ev, ui);
      return;
    }
    var optionList = [{
      name : "Roll",
      click : function(ev, ui) {
        snd_diceRoll.play();
        eventData.msg = sync.eval(eventData.msg, context);
        eventData.data = sync.executeQuery(eventData.data, context);
        runCommand("diceCheck", eventData);
      },
    },
    {
      name : "Roll - Modified",
      click : modifiedRoll,
    }];
    if (game.templates.dice.modifiers) {
      var bonus = {name : "Roll - Bonus", submenu : []};
      var penalty = {name : "Roll - Penalty", submenu : []};

      for (var key in game.templates.dice.modifiers) {
        var name = game.templates.dice.modifiers[key];

        bonus.submenu.push({
          name : "+"+name,
          attr : {mod : game.templates.dice.modifiers[key]},
          click : function(ev, ui) {
            if (eventData.inverted) {
              eventData.data = eventData.data + "-" + parseInt(ui.attr("mod"));
            }
            else {
              eventData.data = eventData.data + "+" + parseInt(ui.attr("mod"));
            }
            eventData.msg = sync.eval(eventData.msg, context);
            eventData.data = sync.executeQuery(eventData.data, context);
            runCommand("diceCheck", eventData);
          }
        });
        penalty.submenu.push({
          name : "-"+name,
          attr : {mod : game.templates.dice.modifiers[key]},
          click : function(ev, ui) {
            if (eventData.inverted) {
              eventData.data = eventData.data + "+" + parseInt(ui.attr("mod"));
            }
            else {
              eventData.data = eventData.data + "-" + parseInt(ui.attr("mod"));
            }
            eventData.msg = sync.eval(eventData.msg, context);
            eventData.data = sync.executeQuery(eventData.data, context);
            runCommand("diceCheck", eventData);
          }
        });
      }
      optionList.push(bonus);
      optionList.push(penalty);
    }
    /*var apps = $('.application[ui-name="ui_roll"]');
    var counter = 0;
    apps.each(function(){
      var thisApp = $(this);
      counter = counter + 1;
      optionList.push({
        name : "Roller - "+counter,
        hover : {
          in : function(ev, ui){
            var apps = $('.application[ui-name="ui_roll"]');
            apps.each(function(){
              $(this).removeClass("highlight2");
            });
            thisApp.addClass("highlight2");
          },
          out : function(ev, ui){
            var apps = $('.application[ui-name="ui_roll"]');
            apps.each(function(){
              $(this).removeClass("highlight2");
            });
          }
        },
        click : function(ev, ui) {
          var diceTemplates = game.templates.dice;
          var die = diceTemplates.pool[diceTemplates.defaults[0]].value;
          for (var key in _syncList) {
            if (util.contains(_syncList[key]._apps, thisApp.attr("id"))) {
              _syncList[key].data.equations = eventData.data.equations;
              _syncList[key].update();
              break;
            }
          }
          thisApp.removeClass("highlight2");
        },
        submenu : [{
          name : "Add Dice",
          hover : {
            in : function(ev, ui){
              var apps = $('.application[ui-name="ui_roll"]');
              apps.each(function(){
                $(this).removeClass("highlight2");
              });
              thisApp.addClass("highlight2");
            },
            out : function(ev, ui){
              var apps = $('.application[ui-name="ui_roll"]');
              apps.each(function(){
                $(this).removeClass("highlight2");
              });
            }
          },
          click : function(ev, ui) {
            for (var key in _syncList) {
              if (util.contains(_syncList[key]._apps, thisApp.attr("id"))) {
                _syncList[key].data.equations = _syncList[key].data.equations || [];
                for (var ky in eventData.data.equations) {
                  _syncList[key].data.equations.push(eventData.data.equations[ky]);
                }
                _syncList[key].update();
                break;
              }
            }
            thisApp.removeClass("highlight2");
          }
        }]
      });
    })*/
    var dropMenu = ui_dropMenu(ui, optionList, {id: "dice-app-selection-menu"});
  }
}


sync.render("ui_renderAction", function(obj, app, scope){
  scope = scope || {minimized : app.attr("minimized") == "true"};

  obj.data.options = obj.data.options || {};
  var actionKey = obj.data.action;
  var actionData = obj.data.actionData;
  var itemData;
  var spellData;
  function buildContext(){
    var ctx = sync.defaultContext();
    var ent = getEnt(obj.data.context.c);
    if (ent) {
      if (obj.data.context.i instanceof Object) {
        itemData = obj.data.context.i;
      }
      else if (obj.data.context.i) {
        itemData = ent.data.inventory[obj.data.context.i];
      }
      if (obj.data.context.spl instanceof Object) {
        spellData = obj.data.context.spl;
      }
      else if (obj.data.context.spl) {
        spellData = ent.data.spellbook[obj.data.context.spl];
      }
      merge(ctx, {c : duplicate(ent.data), i : duplicate(itemData) || duplicate(spellData), spl : duplicate(spellData)});

      ctx["eval"] = {};
      for (var i in obj.data.options) {
        ctx["eval"][i] = duplicate(obj.data.options[i]);
      }
    }
    return ctx;
  }

  var context = buildContext();

  var saveNewRollWrap = $("<div>");
  saveNewRollWrap.addClass("flexcolumn");

  if (scope.minimized) {
    saveNewRollWrap.addClass("subtitle spadding");
  }
  else {
    saveNewRollWrap.addClass("white smooth outline padding");
  }

  var saveNewRoll = $("<div>").appendTo(saveNewRollWrap);
  saveNewRoll.addClass("lrmargin background padding outline bold smooth hover2 alttext flexcolumn flexmiddle");
  if (itemData) {
    saveNewRoll.text(sync.rawVal(itemData.info.name) + ":" + actionKey);
  }
  else if (spellData) {
    saveNewRoll.text(sync.rawVal(spellData.info.name) + ":" + actionKey);
  }
  else {
    saveNewRoll.text(actionKey);
  }


  if (actionData.choices) {
    saveNewRollWrap.removeClass("spadding");
    saveNewRoll.removeClass("background padding outline smooth alttext hover2");

    var choiceWrap = $("<div>").appendTo(saveNewRoll);
    choiceWrap.addClass("flexrow flexwrap flexmiddle alttext");

    for (var choiceKey in actionData.choices) {
      var saveNewRoll = $("<div>").appendTo(choiceWrap);
      saveNewRoll.addClass("background subtitle hover2 spadding outline smooth");
      saveNewRoll.attr("key", choiceKey);
      if (!scope.minimized) {
        if (Object.keys(actionData.choices[choiceKey]).length && JSON.stringify(obj.data.options) == JSON.stringify(actionData.choices[choiceKey])) {
          saveNewRoll.addClass("highlight");
        }
      }

      if (actionData.range && String(sync.eval(actionData.range, context)).toLowerCase() == choiceKey.toLowerCase()) {
        saveNewRoll.removeClass("background");
        saveNewRoll.addClass("highlight");
      }
      saveNewRoll.text(choiceKey);
      saveNewRoll.click(function(){
        obj.data.options = duplicate(actionData.choices[$(this).attr("key")]);
        if (scope.minimized) {
          rollButton.click();
        }
        else {
          obj.update();
        }
      });
      saveNewRoll.contextmenu(function(){
        if (scope.minimized) {
          rollButton.contextmenu();
          return false;
        }
      });
    }
  }
  else {
    saveNewRoll.click(function(){
      if (scope.minimized) {
        rollButton.click();
      }
      else {
        obj.update();
      }
    });
    saveNewRoll.contextmenu(function(){
      if (scope.minimized) {
        rollButton.contextmenu();
        return false;
      }
    });
  }

  var expandedDiv = $("<div>").appendTo(saveNewRollWrap);
  expandedDiv.addClass("flexcolumn");

  var optionMenu = $("<div>").appendTo(expandedDiv);
  optionMenu.attr("action", actionKey);
  optionMenu.addClass("flex");

  var rollButtons = $("<div>").appendTo(expandedDiv);
  rollButtons.addClass("flexrow");
  rollButtons.css("margin-top", "4px");

  var rollButton = $("<button>").appendTo(rollButtons);
  rollButton.addClass("highlight alttext flex");
  rollButton.append("Roll");
  rollButton.contextmenu(function(){
    var actionList = [
      //{name : "Set Manual Range"},
      //{name : "Set Manual Targets"},
      {name : "With Flavor Text", click : function(ev, ui){
        ui_prompt({
          target : ui,
          inputs : {
            "Flavor Text" : ""
          },
          click : function(ev, inputs){
            rollButton.attr("flavor", inputs["Flavor Text"].val());
            rollButton.click();
          }
        });
      }},
      {name : "Private", click : function(ev, ui) {
        rollButton.attr("private", "true");
        rollButton.click();
      }}
    ];
    if (scope.minimized) {
      ui_dropMenu(saveNewRollWrap, actionList, {id : "actions-drop", align : "top"});
    }
    else {
      ui_dropMenu($(this), actionList, {id : "actions-drop"});
    }
    return false;
  });
  rollButton.click(function(){
    var ctx = buildContext();

    var addStr = "";
    var str = actionData.eventData.data;
    var final = "";
    var vMatch = variableRegex.exec(str);
    // save localVaribles
    var cmps = /([\/><\!\~\=])/;
    var context = sync.context(actionData.eventData.data, ctx, true);

    for (var key in obj.data.options) {
      if (obj.data.options[key] !== true) {
        context.context[key] = sync.newValue(obj.data.options[key], sync.eval(obj.data.options[key], ctx));
      }
    }
    while (vMatch) {
      if (vMatch[2] && vMatch[4] && vMatch[4][0] == "=") {
        var stack = [0];
        for (var i=1; i<vMatch[4].length; i++) {
          if (vMatch[4][i] == "=" && !((vMatch[4][i-1] || "").match(cmps) || (vMatch[4][i+1] || "").match(cmps))) {
            stack.push(i);
          }
          else if (vMatch[4][i] == ";") {
            stack.pop();
            if (stack.length == 0) {
              stack = i+1; // record the successful index
              break;
            }
          }
        }
      }
      if (!(stack instanceof Object)) {
        var newStr = vMatch[1]+(vMatch[2] || "");
        if (context.context[vMatch[2]]) {
          newStr += "="+sync.val(context.context[vMatch[2]])+";"
        }
        else {
          newStr += vMatch[4].substring(0, stack);
        }
        final += newStr;
        vMatch[0] = (vMatch[1] || "") +(vMatch[2] || "") + (vMatch[3] || "") + vMatch[4].substring(0, stack);
      }
      str = str.replace(vMatch[0], "");
      vMatch = variableRegex.exec(str);
    }
    for (var i in context.context) {
      if (!final.match(i)) {
        final += "$"+i+"="+sync.val(context.context[i])+";";
      }
    }
    final += context.str;
    var varTable = duplicate(actionData.eventData.var);
    for (var key in varTable) {
      varTable[key] = sync.eval(varTable[key], ctx);
    }
    var icon;
    var msg;
    if (actionData.flavors) {
      var choices = [];
      for (var i in actionData.flavors) {
        if (!actionData.flavors[i].cond || sync.eval(actionData.flavors[i].cond, ctx)) {
          choices.push(duplicate(actionData.flavors[i]));
        }
      }
      var choice = Math.floor(Math.random() * choices.length);
      icon = actionData.flavors[choice].icon;
      msg = sync.eval(actionData.flavors[choice].msg, ctx);
    }
    else {
      icon = actionData.eventData.icon;
      msg = sync.eval(actionData.eventData.msg, ctx);
    }
    if (rollButton.attr("flavor")) {
      msg = rollButton.attr("flavor");
      rollButton.removeAttr("flavor");
    }
    var eventData = {
      f : sync.rawVal(ctx.c.info.name),
      icon : icon,
      msg : msg,
      ui : actionData.eventData.ui,
      data : sync.executeQuery(final, ctx),
      var : varTable
    };

    if (rollButton.attr("private") == "true") {
      var priv = {};
      priv[getCookie("UserID")] = true;
      eventData.p = priv;
    }
    runCommand("diceCheck", eventData);
    setTimeout(function(){
      for (var i in actionData.followup) {
        if (actionData.followup[i].cond == null || sync.eval(actionData.followup[i].cond, ctx)) {
          var eventData = {
            f : sync.rawVal(ctx.c.info.name),
            icon : actionData.followup[i].icon,
            msg : sync.eval(actionData.followup[i].msg, ctx),
            ui : actionData.followup[i].ui,
            data : sync.executeQuery(actionData.followup[i].data, ctx),
            var : varTable
          };
          if (rollButton.attr("private") == "true") {
            var priv = {};
            priv[getCookie("UserID")] = true;
            eventData.p = priv;
          }
          runCommand("diceCheck", eventData);
        }
      }
    }, 100);

    rollButton.removeAttr("private");
  });

  var privateRoll = $("<button>").appendTo(rollButtons);
  privateRoll.addClass("background subtitle alttext");
  privateRoll.append("Private");
  privateRoll.click(function(){
    rollButton.attr("private", "true");
    rollButton.click();
  });
  privateRoll.contextmenu(function(){
    var actionList = [
      //{name : "Set Manual Range"},
      //{name : "Set Manual Targets"},
      {name : "With Flavor Text", click : function(ev, ui){
        ui_prompt({
          target : ui,
          inputs : {
            "Flavor Text" : ""
          },
          click : function(ev, inputs){
            rollButton.attr("private", "true");
            rollButton.attr("flavor", inputs["Flavor Text"].val());
            rollButton.click();
          }
        });
      }}
    ];

    ui_dropMenu($(this), actionList, {id : "actions-drop"});
    return false;
  });

  for (var key in actionData.options) {
    var optionWrap = $("<div>").appendTo(optionMenu);
    optionWrap.addClass("lrmargin flexrow flexbetween subtitle");
    optionWrap.append("<b>"+key+"</b>");
    var optionValue = genInput({
      parent : optionWrap,
      classes : "line lrmargin",
      index : key,
      val : obj.data.options[key] || "",
      value : (obj.data.options[key] != null&&obj.data.options[key]!==true)?(sync.eval(obj.data.options[key] || "", context)):(""),
      style : {"width" : "50px", "text-align" : "center", "transition" : "width 0.25s"}
    });

    optionValue.blur(function(){
      $(this).css("width", "50px");
      $(this).css("text-align", "center");
      if ($(this).attr("val")) {
        $(this).val(sync.eval($(this).attr("val"), buildContext()));
      }
      $(this).removeAttr("placeholder");
    });
    optionValue.change(function(){
      var key = $(this).attr("index");
      if ($(this).val()) {
        obj.data.options[key] = $(this).val();
        $(this).attr("val", $(this).val());
        $(this).val(sync.eval($(this).val(), buildContext()));
      }
      else {
        $(this).removeAttr("val");
        delete obj.data.options[key];
      }
      $(this).blur();
      layout.coverlay("drop-actions-suggestions");
    });
    optionValue.focus(function(){
      var optionValue = $(this);
      if (actionData.options && actionData.options[$(this).attr("index")] instanceof Object && $(this).val() == "") {
        var actionList = [];
        for (var i in actionData.options[$(this).attr("index")]) {
          var optionData = actionData.options[$(this).attr("index")][i];
          if (optionData instanceof Object) {
            if (!optionData.cond || sync.eval(optionData.cond, buildContext())) {
              actionList.push({
                name : String(optionData.mask || optionData.eq),
                attr : {val : optionData.eq},
                click : function(ev, ui){
                  optionValue.val(ui.attr("val"), buildContext());
                  optionValue.change();
                }
              });
            }
          }
          else {
            actionList.push({
              name : String(optionData),
              attr : {val : optionData},
              click : function(ev, ui){
                optionValue.val(ui.attr("val"), buildContext());
                optionValue.change();
              }
            });
          }
        }
        ui_dropMenu($(this), actionList, {"id" : "drop-actions-suggestions", hideClose : true});
      }

      var ctx = sync.context(actionData.eventData.data, buildContext()).context;
      if (sync.rawVal(ctx[$(this).attr("index")])) {
        $(this).attr("placeholder", sync.rawVal(ctx[$(this).attr("index")]));
      }
      if (!scope.minimized) {
        $(this).css("width", "150px");
      }
      else {
        $(this).css("width", Math.max(Math.min(150, ($(this).attr("val") || "").length*12), 75)+"px");
      }
      $(this).css("text-align", "left");
      $(this).val($(this).attr("val"));
    });
    optionValue.contextmenu(function(){
      var optionValue = $(this);
      if (actionData.options && actionData.options[$(this).attr("index")] instanceof Object) {
        var actionList = [];
        for (var i in actionData.options[$(this).attr("index")]) {
          var optionData = actionData.options[$(this).attr("index")][i];
          if (optionData instanceof Object) {
            if (!optionData.cond || sync.eval(optionData.cond, buildContext())) {
              actionList.push({
                name : String(optionData.mask || optionData.eq),
                attr : {val : optionData.eq},
                click : function(ev, ui){
                  optionValue.val(ui.attr("val"), buildContext());
                  optionValue.change();
                }
              });
            }
          }
          else {
            actionList.push({
              name : String(optionData),
              attr : {val : optionData},
              click : function(ev, ui){
                optionValue.val(ui.attr("val"), buildContext());
                optionValue.change();
              }
            });
          }
        }
        ui_dropMenu($(this), actionList, {"id" : "drop-actions-suggestions", hideClose : true, style : {"font-size" : "0.8em"}});
      }
      return false;
    });
  }

  if (scope.minimized) {
    expandedDiv.hide();
  }

  return saveNewRollWrap;
});

sync.render("ui_manageActions", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flex foreground");

  for (var actionKey in game.templates.actions[obj.data._t]) {
    if (!obj.data._a || !obj.data._a[actionKey]) {
      var saveNewRollWrap = $("<div>").appendTo(div);
      saveNewRollWrap.addClass("white smooth outline padding flexrow flexmiddle");

      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : scope.cref || obj.id()}, action : actionKey, actionData : duplicate(game.templates.actions[obj.data._t][actionKey])};
      if (scope.cref) {
        actionObj.data.context.c = scope.cref;
        actionObj.data.context.i = duplicate(obj.data);
      }
      game.locals["actionsList"] = game.locals["actionsList"] || {};
      game.locals["actionsList"][app.attr("id")+"-"+obj.data._t+"-"+actionKey] = actionObj;

      var renderWrap = $("<div>").appendTo(saveNewRollWrap);
      renderWrap.addClass("flexcolumn flexmiddle");

      var actionApp = sync.newApp("ui_renderAction").appendTo(renderWrap);
      actionObj.addApp(actionApp);

      var newObj = sync.obj();
      newObj.data = duplicate(game.templates.actions[obj.data._t][actionKey]);

      var newApp = sync.newApp("ui_editAction").appendTo(saveNewRollWrap);
      newApp.css("height", "300px");
      newObj.addApp(newApp);
      function attachListener(newObj, actionKey, actionObj) {
        newObj.listen["updateParent"] = function(orgObj){
          if (!game.templates.actions[obj.data._t] || !game.templates.actions[obj.data._t][actionKey] || JSON.stringify(orgObj.data) != JSON.stringify(game.templates.actions[obj.data._t][actionKey])) {
            obj.data._a = obj.data._a || {};
            obj.data._a[actionKey] = duplicate(orgObj.data);
          }
          actionObj.data.actionData = duplicate(orgObj.data);
          actionObj.update();
          return true;
        }
      }
      attachListener(newObj, actionKey, actionObj);
    }
    else {
      var saveNewRollWrap = $("<div>").appendTo(div);
      saveNewRollWrap.addClass("white smooth outline padding flexrow flexmiddle");

      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, action : actionKey, actionData : duplicate(obj.data._a[actionKey])};
      if (scope.cref) {
        actionObj.data.context.c = scope.cref;
        actionObj.data.context.i = duplicate(obj.data);
      }

      game.locals["actionsList"] = game.locals["actionsList"] || {};
      game.locals["actionsList"][app.attr("id")+"-"+obj.data._t+"-"+actionKey] = actionObj;

      var renderWrap = $("<div>").appendTo(saveNewRollWrap);
      renderWrap.addClass("flexcolumn flexmiddle");

      var actionApp = sync.newApp("ui_renderAction").appendTo(renderWrap);
      actionObj.addApp(actionApp);

      var removeAction = genIcon("refresh", "Restore Action to Default").appendTo(renderWrap);
      removeAction.addClass("destroy subtitle");
      removeAction.attr("index", actionKey);
      removeAction.click(function(){
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          confirm : "Restore to Default",
          click : function(){
            delete obj.data._a[index];
            obj.update();
          }
        });
      });

      var newObj = sync.obj();
      newObj.data = duplicate(obj.data._a[actionKey]);

      var newApp = sync.newApp("ui_editAction").appendTo(saveNewRollWrap);
      newApp.css("height", "300px");
      newObj.addApp(newApp);
      function attachListener(newObj, actionKey, actionObj) {
        newObj.listen["updateParent"] = function(orgObj){
          if (!game.templates.actions[obj.data._t] || !game.templates.actions[obj.data._t][actionKey] || JSON.stringify(orgObj.data) != JSON.stringify(game.templates.actions[obj.data._t][actionKey])) {
            obj.data._a = obj.data._a || {};
            obj.data._a[actionKey] = duplicate(orgObj.data);
          }
          actionObj.data.actionData = duplicate(orgObj.data);
          actionObj.update();
          return true;
        }
      }
      attachListener(newObj, actionKey, actionObj);
    }
  }

  for (var actionKey in obj.data._a) {
    if (!game.templates.actions[obj.data._t] || !game.templates.actions[obj.data._t][actionKey]) {
      var saveNewRollWrap = $("<div>").appendTo(div);
      saveNewRollWrap.addClass("white smooth outline padding flexrow flexmiddle");

      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, action : actionKey, actionData : duplicate(obj.data._a[actionKey])};
      if (scope.cref) {
        actionObj.data.context.c = scope.cref;
        actionObj.data.context.i = duplicate(obj.data);
      }

      game.locals["actionsList"] = game.locals["actionsList"] || {};
      game.locals["actionsList"][app.attr("id")+"-"+obj.data._t+"-"+actionKey] = actionObj;

      var renderWrap = $("<div>").appendTo(saveNewRollWrap);
      renderWrap.addClass("flexcolumn flexmiddle");

      var actionApp = sync.newApp("ui_renderAction").appendTo(renderWrap);
      actionObj.addApp(actionApp);

      var removeAction = genIcon("remove", "Destroy Custom Action").appendTo(renderWrap);
      removeAction.addClass("destroy subtitle");
      removeAction.attr("index", actionKey);
      removeAction.click(function(){
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          confirm : "Delete Action",
          click : function(){
            delete obj.data._a[index];
            obj.update();
          }
        });
      });

      var newObj = sync.obj();
      newObj.data = duplicate(obj.data._a[actionKey]);

      var newApp = sync.newApp("ui_editAction").appendTo(saveNewRollWrap);
      newApp.css("height", "300px");
      newObj.addApp(newApp);
      function attachListener(newObj, actionKey, actionObj) {
        newObj.listen["updateParent"] = function(orgObj){
          if (!game.templates.actions[obj.data._t] || !game.templates.actions[obj.data._t][actionKey] || JSON.stringify(orgObj.data) != JSON.stringify(game.templates.actions[obj.data._t][actionKey])) {
            obj.data._a = obj.data._a || {};
            obj.data._a[actionKey] = duplicate(orgObj.data);
          }
          actionObj.data.actionData = duplicate(orgObj.data);
          actionObj.update();
          return true;
        }
      }
      attachListener(newObj, actionKey, actionObj);
    }
  }

  var addActionWrap = $("<div>").appendTo(div);
  addActionWrap.addClass("fit-x flexmiddle subtitle alttext bold spadding");

  var addAction = genIcon("plus", "New Action").appendTo(addActionWrap);
  addAction.attr("title", "Add a New Action");
  addAction.click(function(){
    if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || !obj.data._s) {
      ui_prompt({
        target : $(this),
        inputs : {
          "New Action Name" : ""
        },
        click : function(ev, inputs){
          var name = inputs["New Action Name"].val();
          if (name) {
            obj.data._a = obj.data._a || {};
            obj.data._a[name] = {};
            obj.update();
          }
          else {
            sendAlert({text : "No Name Entered"});
          }
        }
      });
    }
  });

  return div;
});

sync.render("ui_hotActions", function(char, app, scope){
  scope = scope || {};

  var savedRollWrap = $("<div>");
  savedRollWrap.addClass("flexrow flexwrap flex");
  if (!scope.noAround) {
    savedRollWrap.addClass("flexaround");
  }
  else {
    savedRollWrap.css("overflow", "auto");
  }

  for (var actionKey in game.templates.actions.c) {
    var actionData = duplicate(game.templates.actions.c[actionKey]);
    if (char.data._a && char.data._a[actionKey]) {
      actionData = duplicate(char.data._a[actionKey]);
    }
    var context = {c : char.id()}
    var hot = sync.eval(actionData.hot, context);

    if (actionData.hot) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : context, action : actionKey, actionData : actionData};

      game.locals["actionsList"] = game.locals["actionsList"] || {};
      game.locals["actionsList"][app.attr("id")+"-"+char.data._t+"-"+actionKey] = actionObj;

      var rollWrap = $("<div>").appendTo(savedRollWrap);

      var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
      actionApp.attr("minimized", "true");
      actionApp.css("outline", "none");
      actionApp.css("border", "none");
      actionObj.addApp(actionApp);
    }
  }

  for (var actionKey in char.data._a) {
    var actionData = duplicate(char.data._a[actionKey]);
    var context = {c : char.id()}
    var hot = sync.eval(actionData.hot, context);
    if (hot) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : char.id()}, action : actionKey, actionData : actionData};

      game.locals["actionsList"] = game.locals["actionsList"] || {};
      game.locals["actionsList"][app.attr("id")+"-"+char.data._t+"-"+actionKey] = actionObj;

      var rollWrap = $("<div>").appendTo(savedRollWrap);

      var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
      actionApp.attr("minimized", "true");
      actionApp.css("outline", "none");
      actionApp.css("border", "none");
      actionObj.addApp(actionApp);
    }
  }
  for (var itemKey in char.data.inventory) {
    for (var actionKey in game.templates.actions.i) {
      var actionData = duplicate(game.templates.actions.i[actionKey]);
      if (char.data.inventory[itemKey]._a && char.data.inventory[itemKey]._a[actionKey]) {
        actionData = duplicate(char.data.inventory[itemKey]._a[actionKey]);
      }
      var context = {c : char.id()};
      context.i = char.data.inventory[itemKey];
      var hot = sync.eval(actionData.hot, context);

      if (hot) {
        var actionObj = sync.dummyObj();
        actionObj.data = {context : context, action : actionKey, actionData : actionData};

        game.locals["actionsList"] = game.locals["actionsList"] || {};
        game.locals["actionsList"][app.attr("id")+"-i-"+actionKey] = actionObj;

        var rollWrap = $("<div>").appendTo(savedRollWrap);

        var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
        actionApp.attr("minimized", "true");
        actionApp.attr("title", char.data.inventory[itemKey].info.name.current);
        actionApp.css("outline", "none");
        actionApp.css("border", "none");
        actionObj.addApp(actionApp);
      }
    }
    for (var actionKey in char.data.inventory[itemKey]._a) {
      var hot = sync.eval(actionData.range, context)
      var actionData = duplicate(char.data.inventory[itemKey]._a[actionKey]);
      var context = {c : char.id()}
      context.i = char.data.inventory[itemKey];
      var hot = sync.eval(actionData.hot, context);

      if ((!game.templates.actions.i) || (!game.templates.actions.i[actionKey] && hot)) {
        var actionObj = sync.dummyObj();
        actionObj.data = {context : context, action : actionKey, actionData : actionData};

        game.locals["actionsList"] = game.locals["actionsList"] || {};
        game.locals["actionsList"][app.attr("id")+"-i-"+actionKey] = actionObj;

        var rollWrap = $("<div>").appendTo(savedRollWrap);

        var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
        actionApp.attr("minimized", "true");
        actionApp.attr("title", char.data.inventory[itemKey].info.name.current);
        actionApp.css("outline", "none");
        actionApp.css("border", "none");
        actionObj.addApp(actionApp);
      }
    }
  }
  for (var itemKey in char.data.spellbook) {
    for (var actionKey in game.templates.actions.i) {
      var actionData = duplicate(game.templates.actions.i[actionKey]);
      if (char.data.spellbook[itemKey]._a && char.data.spellbook[itemKey]._a[actionKey]) {
        actionData = duplicate(char.data.spellbook[itemKey]._a[actionKey]);
      }
      var context = {c : char.id()}
      context.i = char.data.spellbook[itemKey];
      var hot = sync.eval(actionData.hot, context);
      if (hot) {
        var actionObj = sync.dummyObj();
        actionObj.data = {context : context, action : actionKey, actionData : actionData};

        game.locals["actionsList"] = game.locals["actionsList"] || {};
        game.locals["actionsList"][app.attr("id")+"-s-"+actionKey] = actionObj;

        var rollWrap = $("<div>").appendTo(savedRollWrap);

        var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
        actionApp.attr("minimized", "true");
        actionApp.attr("title", char.data.spellbook[itemKey].info.name.current);
        actionApp.css("outline", "none");
        actionApp.css("border", "none");
        actionObj.addApp(actionApp);
      }
    }
    for (var actionKey in char.data.spellbook[itemKey]._a) {
      var context = {c : char.id()}
      context.i = char.data.spellbook[itemKey];
      var actionData = duplicate(char.data.spellbook[itemKey]._a[actionKey]);
      var hot = sync.eval(actionData.hot, context);

      if ((!game.templates.actions.i) || (!game.templates.actions.i[actionKey] && hot)) {
        var actionObj = sync.dummyObj();
        actionObj.data = {context : context, action : actionKey, actionData : actionData};

        game.locals["actionsList"] = game.locals["actionsList"] || {};
        game.locals["actionsList"][app.attr("id")+"-s-"+actionKey] = actionObj;

        var rollWrap = $("<div>").appendTo(savedRollWrap);

        var actionApp = sync.newApp("ui_renderAction").appendTo(rollWrap);
        actionApp.attr("minimized", "true");
        actionApp.attr("title", char.data.spellbook[itemKey].info.name.current);
        actionApp.css("outline", "none");
        actionApp.css("border", "none");
        actionObj.addApp(actionApp);
      }
    }
  }

  return savedRollWrap;
});
