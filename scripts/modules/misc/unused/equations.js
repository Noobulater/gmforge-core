/*{
  die : "d20",
  terms : [
    {value : 5},
    {lookup : "stats:Str", value : 0, min : 0, max : 10, type : "rawVal"}
    {lookup : "stats:Str", value : 0, min : 0, max : 10, type : "val"}
    {lookup : "stats:Str", value : 0, min : 0, max : 10, type : "modified"}
    {lookup : "stats:Str:modifiers:Stat-Bonus", min : 0, max : 10} // raw value
  ]
}*/

/*sync.render("ui_savedEquations", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexcolumn");

  var eqList = obj.data;

  var newEquation = $("<button>Save New Equation</button>").appendTo(div);
  newEquation.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Name" : "",
        "Equation" : "",
      },
      confirm : "Save Equation",
      click : function(ev, inputs) {
        if (inputs["Name"].val() && inputs["Equation"].val()) {
          eqList[inputs["Name"].val()] = inputs["Equation"].val();
          localStorage.setItem("saved-equations", JSON.stringify(eqList));
        }
      }
    });
  });

  if (Object.keys(eqList).length) {
    for (var key in eqList) {
      var link = genIcon("", key).appendTo(div);
      link.attr("value", eqList[key]);
      link.click(function(){
        var val = $(this).attr("value");
        $(this).val(obj.data.eventData.data.equations);
        obj.data.eventData.data.equations = val;
        obj.update();
      });
    }
  }

  return div;
});*/

sync.render("ui_savedEquations", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexcolumn");

  var eqList = localStorage.getItem("saved-equations");
  if (eqList) {
    eqList = JSON.parse(eqList);
  }
  else {
    eqList = {};
  }

  var tabBar = genNavBar("background alttext");
  tabBar.appendTo(div);
  for (var gameKey in eqList) {
    function tabWrap(gameKey) {
      tabBar.generateTab(gameKey, "book", function(container) {
        if (Object.keys(eqList[gameKey]).length) {
          for (var key in eqList[gameKey]) {
            var titleWrapper = $("<div>").appendTo(container);
            titleWrapper.addClass("fit-x hover2");
            titleWrapper.append("<b class='outlinebottom'>"+key+"</b>");
            titleWrapper.attr("value", eqList[gameKey][key]);
            titleWrapper.click(function(){
              var val = $(this).attr("value");
              $(this).val(obj.data.str);
              obj.data.str = val;
              obj.update();
            });

            var wrapper = $("<div>").appendTo(titleWrapper);
            wrapper.addClass("flexbetween");

            var link = genIcon("", eqList[gameKey][key]).appendTo(wrapper);

            var removeEq = genIcon("remove").appendTo(wrapper);
            removeEq.addClass("destroy");
            removeEq.attr("index", key);
            removeEq.click(function(ev) {
              delete eqList[gameKey][$(this).attr("index")];
              localStorage.setItem("saved-equations", JSON.stringify(eqList));
              removeEq.parent().parent().remove();
              ev.stopPropagation();
            });
          }
        }
      });
    }
    tabWrap(gameKey);
  }
  tabBar.selectTab(game.config.data.game);

  var newEquation = $("<button>New Equation</button>").appendTo(div);
  newEquation.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Name" : "",
        "Equation" : "",
        "Category" : {placholder : "optional"},
      },
      confirm : "Save Equation",
      click : function(ev, inputs) {
        if (inputs["Name"].val() && inputs["Equation"].val()) {
          eqList = eqList || {};
          eqList[inputs["Category"].val() || game.config.data.game] = eqList[inputs["Category"].val() || game.config.data.game] || {};
          eqList[inputs["Category"].val() || game.config.data.game][inputs["Name"].val()] = inputs["Equation"].val();
          localStorage.setItem("saved-equations", JSON.stringify(eqList));
          var parent = div.parent();
          parent.empty()
          parent.append(sync.render("ui_savedEquations")(obj, app, scope));
        }
      }
    });
  });

  return div;
});

sync.render("ui_equationBuilder", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true", noRoll : app.attr("noRoll") == "true"};
  var data = obj.data;

  var div = $("<div>");

  var eqButton = $("<div>").appendTo(div);
  eqButton.addClass("flexbetween");
  eqButton.append("<b>Equation Builder</b>");

  var saveEqWrap = $("<div>").appendTo(eqButton);
  saveEqWrap.addClass("flexmiddle");

  var savedEq = genIcon("book", "Saved Equations");
  savedEq.appendTo(saveEqWrap);
  savedEq.addClass("subtitle");

  savedEq.click(function(){
    var newApp = sync.render("ui_savedEquations")(obj, app, scope);
    var popOut = ui_popOut({
      id : "saved-equations",
      target : $(this),
      align : "top",
    }, newApp);
  });

  var input = genInput({
    parent : div,
    value : obj.data.str,
    style : {"width": "100%", "font-size" : "0.8em"},
    title : "Enter Modifier Amount"
  });
  input.change(function(){
    var val = $(this).val();
    $(this).val(obj.data.str);
    obj.data.str = val;
    obj.update();
  });

  var preview = $("<div>").appendTo(div);
  preview.addClass("flexmiddle");
  var ctx = duplicate(obj.data.context);
  var context = sync.context(obj.data.str, ctx, true);
  merge(ctx, context.ctx);
  preview.append("<i>"+sync.reduce(context.str, ctx, true)+"</i>");

  if (!scope.noRoll) {
    var button = $("<button>").appendTo(div);
    button.append("Roll Equation!");
    button.addClass("fit-x");
    button.click(function(){
      snd_diceRoll.play();
      var ctx = duplicate(obj.data.context);
      var context = sync.context(obj.data.str, ctx, true);
      merge(ctx, context.ctx);

      var eq = data.str;
      var copy = duplicate(data.eventData);
      copy.data.equations = sync.executeQuery(eq, ctx);
      runCommand("diceCheck", copy);
    });
  }
  return div;
});

function ui_buildthing(click){
  var div = $("<div>");
  div.css("padding-right", "8px");
  div.css("overflow", "auto");

  function navigate(target, key) {
    var wrapper = $("<div>");
    wrapper.css("padding-left", "8px");
    if (target[key] instanceof Object && Object.keys(target[key]).length) {
      if (target[key].current || target[key].current != null || target[key].modifiers != null) {

      }
      else {
        wrapper.append("<b class='outlinebottom'>"+key+"</b>");
        for (var k in target[key]) {
          var wrap = navigate(target[key][k], k);
          if (target[key][k]) {
            if (target[key][k].name) {
              wrap.append("<b>"+target[key][k].name+"</b>");
            }
            else {
              wrap.append("<b>"+k+"</b>");
            }

            if (target[key][k].current != null || target[key][k].modifiers != null) {
              var choices = $("<div>").appendTo(wrap);
              choices.addClass("flexcolumn subtitle");
              choices.css("padding-left", "8px");

              var rawVal = $("<button>").appendTo(choices);
              rawVal.attr("target", key + "." + k);
              rawVal.append("Raw Value");
              rawVal.click(function(ev){
                click(ev, $(this));
              });

              var val = $("<button>").appendTo(choices);
              val.attr("target", key + "." + k);
              val.append("Value");
              val.click(function(ev){
                click(ev, $(this));
              });

              var modified = $("<button>").appendTo(choices);
              modified.attr("target", key + "." + k);
              modified.append("Modified");
              modified.click(function(ev){
                click(ev, $(this));
              });
            }
          }
          wrapper.append(wrap);
        }
      }
    }
    return wrapper;
  }
  div.addClass("flexrow");
  for (var key in game.templates.character) {
    if (key.charAt(0) != "_" && (key == "stats" || key == "counters")) {
      div.append(navigate(game.templates.character, key));
    }
  }

  return div;
}

var equation = sync.newValue("Equation");
function buildEquations() {
  var target = $("#preview");
  target.empty();
  for (var i in equation.modifiers) {
    target.append("<b>+</b>");
    var button = $("<button>").appendTo(target);
    button.append(equation.modifiers[i]);
    var diceData = game.templates.dice.pool[equation.modifiers[i]];
    if (diceData) {
      button.addClass("dice alttext");
      for (var key in diceData.display) {
        button.css(key, diceData.display[key]);
      }
    }
    button.attr("index", i);
    button.click(function(){
      var mods = duplicate(equation.modifiers);
      delete mods[$(this).attr("index")];
      equation.modifiers = {};
      for (var key in mods) {
        equation.modifiers[Object.keys(equation.modifiers).length] = mods[key];
      }
      buildEquations();
    });
  }
  $(target.children()[0]).remove();
}


function equationBuilder() {
  var div = $("<div>");
  div.append("<b>Equation Builder</b>");

  var preview = $("<div>").appendTo(div);
  preview.attr("id", "preview");

  var option = $("<div>").appendTo(div);
  option.append("<b>Add Term</b>");

  var optionsBar = $("<div>").appendTo(option);

  var button = $("<button>Dice</button>").appendTo(optionsBar);
  button.click(function(){
    var extraDice = $("<div>");

    for (var index in game.templates.dice.pool) {
      var diceData = game.templates.dice.pool[index];

      var extraDiceContainer = $("<div>").appendTo(extraDice);
      extraDiceContainer.css("width", "auto");
      extraDiceContainer.css("display", "inline-block");

      var dice = $("<button>").appendTo(extraDiceContainer);
      dice.attr("index", index);
      dice.css("display", "flex");
      dice.css("background-color", "#333");
      dice.css("color", "white");
      dice.css("border", "1px solid black");
      dice.css("border-radius", "4px");
      dice.css("display", "inline-block");
      dice.css("width", "3em");
      dice.css("height", "3em");
      dice.css("font-weight", "bold");
      dice.addClass("flexmiddle");

      var label = $("<div>").appendTo(dice);
      label.css("text-align", "center");
      label.css("font-size", "1em");
      label.css("font-weight", "bold");
      label.css("width", "auto");
      label.css("height", "auto");
      label.css("pointer-events", "none");
      label.text(diceData.value);

      dice.append(label);

      for (var key in diceData.display) {
        dice.css(key, diceData.display[key]);
      }

      dice.click(function() {
        sync.modifier(equation, Object.keys(equation.modifiers || {}).length, $(this).attr("index"));
        layout.coverlay("add-dice", 500);
        buildEquations();
      });
    }

    var input = genInput({
      parent : extraDice,
      placeholder : "Custom Equation",
      style : {"width": "100%"},
      index : index,
      title : "Enter any dice d<sides>, eg 1d433 or D5000"
    });

    input.change(function() {
      sync.modifier(equation, Object.keys(equation.modifiers || {}).length, $(this).val());
      layout.coverlay("add-dice", 500);
      buildEquations();
    });

    ui_popOut({
      id : "add-dice",
      target : $(this),
      align : "bottom",
      style : {"width": "10.5em"},
    }, extraDice);
  });

  var button = $("<button>Reference</button>").appendTo(optionsBar);
  button.click(function(){
    function click(ev, ui) {
      sync.modifier(equation, Object.keys(equation.modifiers || {}).length, ui.attr("target"));
      layout.coverlay("popout");
      buildEquations();
    }

    ui_popOut({
      id : "popout",
      target : div,
      align : "right",
    }, ui_buildthing(click));
  });

  ui_popOut({
    id : "dd",
    target : $("body"),
  }, div);
}
