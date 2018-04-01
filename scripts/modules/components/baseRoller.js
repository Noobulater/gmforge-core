var shakeEvent;

sync.render("ui_dice", function(obj, app, scope){
  if (!game.templates || !game.templates.dice) {
    return $("<diV>");
  }
  var diceArray = game.templates.dice.pool;
  scope = scope || {};
  scope.width = scope.width || "50px";
  scope.height = scope.height || "50px";
  scope["font-size"] = scope["font-size"] || "1.2em";

  var value = obj;
  var context = value.ctx;
  var key = game.templates.dice.defaults[0];
  if (context && context["die"]) {
    key = sync.rawVal(context["die"]);
  }
  var diceData = diceArray[key] || diceArray[game.templates.dice.defaults[0]]; // for custom

  scope.translate = scope.translate || function(ui, valueObj, result) {
    if (diceData && diceData.translations) {
      ui.empty();
      ui.css("width", "100%");
      ui.css("height", "100%");

      if (result == null) {
        result = value.v;
      }
      if (result != null && !String(result).match(diceRegex)) {
        result = sync.eval(result);
        if (diceData.translations[result]) {
          for (var imgIndex in diceData.translations[result].imgs) {
            var img = diceData.translations[result].imgs[imgIndex];
            if (img) {
              var imgDiv = $("<div>").appendTo(ui);
              imgDiv.css("background-image", "url('"+img+"')");
              imgDiv.css("background-repeat", "no-repeat");
              imgDiv.css("background-position", "center");
              imgDiv.css("background-size", "contain");
              imgDiv.css("margin", "auto");
              imgDiv.css("width", Math.floor(100/diceData.translations[result].imgs.length) + "%");
              imgDiv.css("height", Math.floor(100/diceData.translations[result].imgs.length) + "%");
            }
          }
        }
      }
    }
    else {
      ui.css("width", "auto");
      ui.css("height", "auto");
      if (result == null || (result != null && String(result).match(diceRegex))) {
        ui.text(diceData.value);
      }
      else {
        ui.text(result);
      }
    }
  }

  var die = $("<div>");

  die.addClass("flexmiddle");
  die.css("border-radius", "20%");
  die.css("width", scope.width);
  die.css("height", scope.height);
  die.css("position", "relative");

  if (sync.rawVal(value.ctx.die) == "d2") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("border-radius", "50%");
    dieShape.css("background-color", "#333");
  }
  else if (sync.rawVal(value.ctx.die) == "d4") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d4.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
    /*var size = parseInt(scope.width);

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("left", 0);
    shape.css("border-left", size/2-1+"px solid transparent");
    shape.css("border-bottom", size+"px solid #333");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 2);
    shape.css("height", size);
    shape.css("left", size/2-1);
    shape.css("top", 0);
    shape.css("background", "#333");
    shape.css("border-radius-top-left", "2px");
    shape.css("border-radius-top-right", "2px");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("right", 0);
    shape.css("border-right", size/2-1+"px solid transparent");
    shape.css("border-bottom", size+"px solid #333");*/
  }
  else if (sync.rawVal(value.ctx.die) == "d6") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d6.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d8") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d8.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
    /*
    var size = parseInt(scope.width);

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("bottom", size/2);
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-bottom", size/2+"px solid #333");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("top", size/2);
    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-top", size/2+"px solid #333");*/
  }
  else if (sync.rawVal(value.ctx.die) == "d10") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d10.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
    /*var size = parseInt(scope.width);

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("bottom", size*(5/8));
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-bottom", size/3+"px solid #333");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", size);
    shape.css("height", size*(1/4));
    shape.css("background", "#333");
    shape.css("top", size*(3/8));

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("top", size*(5/8));
    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-top", size/3+"px solid #333");*/
  }
  else if (sync.rawVal(value.ctx.die) == "d12") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d12.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
    /*var size = parseInt(scope.width);

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", size * 1.1);
    shape.css("height", 0);
    shape.css("top", size*(1/3));
    shape.css("border-left", size/4+"px solid transparent");
    shape.css("border-right", size/4+"px solid transparent");
    shape.css("border-top", size*(2/3)+"px solid #333");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("bottom", size*(2/3));
    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-bottom", Math.ceil(size/3)+"px solid #333");*/
  }
  else if (sync.rawVal(value.ctx.die) == "d20") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d20.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
    /*var size = parseInt(scope.width);

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("bottom", size*(4/5));
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-bottom", size/5+"px solid #333");

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("width", size);
    shape.css("height", size*(3/5));
    shape.css("background", "#333");
    shape.css("top", size*(1/5));

    var shape = $("<div>").appendTo(die);
    shape.css("position", "absolute");

    shape.css("top", size*(4/5));
    shape.css("width", 0);
    shape.css("height", 0);
    shape.css("border-left", size/2+"px solid transparent");
    shape.css("border-right", size/2+"px solid transparent");
    shape.css("border-top", size/5+"px solid #333");*/
  }
  else {
    die.addClass("dice");
  }


  for (var key in diceData.display) {
    die.css(key, diceData.display[key]);
  }

  var rollResult = $("<div>").appendTo(die);
  rollResult.css("position", "absolute");
  rollResult.css("text-align", "center");
  rollResult.css("color", "white");
  rollResult.css("font-size", scope["font-size"]);
  rollResult.css("font-weight", "bold");
  rollResult.css("word-break", "keep-all");
  rollResult.attr("key", sync.rawVal(value.ctx.die)); // dice type
  rollResult.css("pointer-events", "none");

  for (var key in scope.attr) {
    rollResult.attr(key, scope.attr[key]);
  }

  scope.translate(rollResult, value, scope.value);
  die.attr("title", value.e + "\n" + value.r);

  return die;
});


sync.render("ui_baseRoller", function(obj, app, scope){
  var diceArray = game.templates.dice.pool;
  var localReference = "roll-"+app.attr("id");
  if (!obj) {
    if (!game.locals[localReference]) {
      game.locals[localReference] = sync.obj(localReference);
      game.locals[localReference].data = {
        editable: true,
        custom: true,
        local: true,
        ui : game.templates.dice.ui,
        // default equations
        equations : [
          sync.process("$die="+game.templates.dice.defaults[0]+";"+diceArray[game.templates.dice.defaults[0]].value, null, true),
        ],
      };
      game.locals[localReference].addApp(app);
      return $("<div>");
    }
    else {
      obj = game.locals[localReference];
    }
  }

  var data = obj.data;
  if (app.attr("event") == "true") {
    data = data.data; // its an event
  }

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  scope = scope || {};
  scope.translate = scope.translate || function(ui, valueObj, result) {
    var diceData;
    if (valueObj.ctx.die) {
      diceData = diceArray[sync.rawVal(valueObj.ctx.die)];
    }
    if (diceData && diceData.translations) {
      ui.empty();
      ui.css("width", "100%");
      ui.css("height", "100%");
      if (result) {
        result = sync.eval(result);
      }
      else if (valueObj && sync.modifier(valueObj, "result") != null) {
        result = sync.eval(sync.modifier(valueObj, "result"));
      }
      if (diceData.translations[result]) {
        for (var imgIndex in diceData.translations[result].imgs) {
          var img = diceData.translations[result].imgs[imgIndex];
          if (img) {
            var imgDiv = $("<div>").appendTo(ui);
            imgDiv.css("background-image", "url('"+img+"')");
            imgDiv.css("background-repeat", "no-repeat");
            imgDiv.css("background-position", "center");
            imgDiv.css("background-size", "contain");
            imgDiv.css("margin", "auto");
            imgDiv.css("width", Math.floor(100/diceData.translations[result].imgs.length) + "%");
            imgDiv.css("height", Math.floor(100/diceData.translations[result].imgs.length) + "%");
          }
        }
      }
    }
    else {
      ui.css("width", "auto");
      ui.css("height", "auto");
      if (!result) {
        if (diceData) {
          ui.text(diceData.value);
        }
        else {
          ui.text(valueObj.name);
        }
        if (valueObj.modifiers && valueObj.modifiers["result"] != null) {
          ui.text(sync.modifier(valueObj, "result"));
        }
      }
      else {
        ui.text(result);
      }
    }
  }
  var resultsDiv;
  scope.click = scope.click || function(ev, ui) {
    //snd_diceRoll.play();

    function delayResult(diceResult, raw, delay, end) {
      var result = sync.eval(value.e, data.equations[diceResult.attr("valueIndex")].ctx);
      scope.translate(diceResult, data.equations[diceResult.attr("valueIndex")], result);
      if (Date.now() < end) {
        setTimeout(function(){delayResult(diceResult, raw, delay, end)}, delay);
      }
      else {
        // turns the roll into an equation
        var eq = data.equations[diceResult.attr("valueIndex")];
        scope.translate(diceResult, eq, eq.v);
        obj.update();
      }
    }
    var unrolled;
    for (var index in data.equations) {
      var value = data.equations[index];
      if (!value.v) {
        var result = sync.eval(value.e, value.ctx);
        value.r = sync.reduce(value.e, value.ctx);
        value.v = sync.eval(value.r, value.ctx);
        $("#"+obj.id()+"-equation-"+index+"-result").attr("valueIndex", index);
        $("#"+obj.id()+"-equation-"+index+"-result").attr("amt", amt);
        delayResult(
          $("#"+obj.id()+"-equation-"+index+"-result"),
          $("#"+obj.id()+"-equation-"+index+"-raw"),
          10,
          Date.now()+500
        );
        ui.hide();
        if (unrolled == null) {
          unrolled = [];
        }
        unrolled.push(value);
      }
    }
    if (unrolled == null) {
      for (var index in data.equations) {
        var value = data.equations[index];
        value.r = sync.reduce(value.e, value.ctx);
        value.v = sync.eval(value.r, value.ctx);
        var amt = Math.ceil(Math.random() * result);

        $("#"+obj.id()+"-equation-"+index+"-result").attr("valueIndex", index);
        $("#"+obj.id()+"-equation-"+index+"-result").attr("amt", amt);
        delayResult(
          $("#"+obj.id()+"-equation-"+index+"-result"),
          $("#"+obj.id()+"-equation-"+index+"-raw"),
          10,
          Date.now()+500
        );
        ui.hide();
      }
    }
    obj.data.pool = {};
    for (var index in data.equations) {
      if (data.equations[index].ctx && data.equations[index].ctx.die) {
        var diceData = game.templates.dice.pool[sync.rawVal(data.equations[index].ctx.die)];
        if (diceData && diceData.results) {
          var valueData = diceData.results[data.equations[index].v];
          for (var key in valueData) {
            if (obj.data.pool[key]) {
              obj.data.pool[key] += valueData[key];
            }
            else {
              obj.data.pool[key] = valueData[key];
            }
          }
        }
      }
    }
    setTimeout(function(){
      if (data.editable || data.local) {
        var str;
        if (!data.private) {
          var evData = {
            msg : sync.eval("@me.name+' rolled'", sync.defaultContext()),
            ui : data.ui,
            data : {
              pool : data.pool,
              equations : data.equations,
            }
          }
          runCommand("diceCheck", evData);
          obj.update();
        }
      }
      else {
        runCommand("performRoll", {id : obj.id(), data : {equations : data.equations}});
        obj.update();
      }
    }, 550);
  }


  if (data.local) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexaround flexwrap background outline");
    optionsBar.css("color", "white");

    var dataList = $("<datalist>").appendTo(optionsBar);
    dataList.attr("id", "roll-ui-list");

    for (var i in game.templates.display.ui) {
      var option = $("<option>").appendTo(dataList);
      option.attr("value", i);
    }

    var ui = genInput({
      parent : optionsBar,
      type : "list",
      list : "roll-ui-list",
      placeholder : "Select UI Display",
      disabled: scope.viewOnly,
      style : {color : "#333"}
    });
    ui.change(function(){
      data.ui = ($(this).val() || "").trim();
      obj.update();
    });
    if (scope.viewOnly) {
      ui.css("background-color", "rgb(235,235,228)");
    }
    ui.val(data.ui);

    if (!scope.viewOnly) {
      var priv;
      if (data.private) {
        var share = genIcon("cloud", "Share Roll to Feed").appendTo(optionsBar);
        share.attr("title", "Prints this dice roll out to the event log");
        share.click(function(){
          var evData = {
            msg : sync.eval("@me.name+' rolled'", sync.defaultContext()),
            ui : data.ui,
            data : {
              equations : data.equations,
            }
          }
          runCommand("diceCheck", evData);
        });
        priv = genIcon("eye-close", "Private");
        priv.attr("title", "Click this to make all subsequent rolls automatically print to the event log");
      }
      else {
        priv = genIcon("eye-open", "Public");
        priv.attr("title", "Click this to hide all subsequent rolls");
      }
      priv.appendTo(optionsBar);
      priv.click(function() {
        data.private = !data.private;
        obj.update();
      });
    }
  }

  var diceChoices = $("<div>").appendTo(div);
  diceChoices.css("width", "100%");

  if (data.editable && !scope.viewOnly) {
    var extendedDice = genIcon("option-vertical").appendTo(diceChoices);
    extendedDice.attr("title", "More Dice Choices");
    extendedDice.click(function() {
      var extraDice = $("<div>");

      for (var index in game.templates.dice.pool) {
        var diceData = game.templates.dice.pool[index];

        var extraDiceContainer = $("<div>").appendTo(extraDice);
        extraDiceContainer.addClass("flexrow flexwrap");
        extraDiceContainer.css("width", "auto");

        var dice = $("<button>").appendTo(extraDiceContainer);
        dice.attr("index", index);
        dice.attr("value", diceData.value);
        dice.css("display", "flex");
        dice.css("background", "none");
        dice.css("background-color", "#333");
        dice.css("color", "white");
        dice.css("border", "1px solid black");
        dice.css("border-radius", "4px");
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
          var val = sync.process("$die="+$(this).attr("index")+";"+$(this).attr("value"), null, true);
          data.equations.push(val);

          if (data.local) {
            obj.addApp(app);
          }
          obj.update();
        });
      }
      if ($("#dice-popout").length) {
        layout.coverlay($("#dice-popout"));
      }
      else {
        var popout = ui_popOut({
          target : $(this),
          align : "top",
          id : "dice-popout",
          style : {"width": "10.5em"},
        }, extraDice);
      }
    });
    for (var i in game.templates.dice.defaults) {
      var index = game.templates.dice.defaults[i];
      var diceData = game.templates.dice.pool[index];
      var dice = $("<div>").appendTo(diceChoices);
      dice.addClass("choice");
      dice.attr("index", index);
      dice.attr("value", diceData.value);
      dice.text(diceData.value);

      for (var key in diceData.display) {
        dice.css(key, diceData.display[key]);
      }

      dice.click(function() {
        data.equations.push(sync.process("$die="+$(this).attr("index")+";"+$(this).attr("value"), null, true));

        if (data.local) {
          obj.addApp(app);
        }
        obj.update();
      });
    }

    var input = genInput({
      parent : diceChoices,
      placeholder : "Custom",
      style : {"width": "4em"},
      index : index,
      disabled : scope.viewOnly,
      title : "Enter any dice d<sides>, eg 1d433 or D5000"
    });

    input.change(function() {
      var val = $(this).val();
      if ($(this).val().valid()) {
        if (!isNaN($(this).val())) {
          val = "d" + val;
        }
        data.equations.push(sync.process(val, sync.defaultContext()));

        if (data.local) {
          obj.addApp(app);
        }
        zobj.update();
      }
    });

    var clear = genIcon("trash", "clear").appendTo(diceChoices);
    clear.click(function() {
      data.equations = [];
      if (data.local) {
        obj.addApp(app);
      }
      obj.update();
    });
  }

  var equationList = $("<div>").appendTo(div);
  if (data.equations.length && data.equations.length == 1) {
    equationList.addClass("flexmiddle");
  }
  for (var index in data.equations) {
    var value = data.equations[index];
    var diceData;
    if (value.ctx && value.ctx.die) {
      diceData = diceArray[sync.rawVal(value.ctx.die)];
      if (!diceData) {
        diceData = {value : sync.rawVal(value.ctx.die)};
      }
    }

    var equation = $("<div>").appendTo(equationList);
    equation.addClass("flexmiddle");

    equation.addClass("outline");

    var dicePlate = $("<div>").appendTo(equation);
    dicePlate.addClass("flexmiddle");

    var title = $("<b>").appendTo(dicePlate);
    title.append(sync.rawVal(value.ctx.die));

    var diceContainer = $("<div>").appendTo(equation);
    diceContainer.addClass("flexmiddle");
    var die = sync.render("ui_dice")(value, app, {
      attr : {
        "key" : sync.rawVal(value.ctx.die),
        "id" : obj.id()+"-equation-"+index+"-result",
        "index" : index,
      },
      value : value.v,
    });
    die.appendTo(diceContainer);

    if (!scope.viewOnly) {
      if (data.custom) { // can attach custom modifiers
        for (var key in value.modifiers) {
          if (key != "result") {
            var vale = sync.eval(value.modifiers[key]);
            var link = genIcon("", key+" - "+vale).appendTo(equation);
            link.addClass("fit-x flexmiddle subtitle");
            link.attr("index", index);
            link.attr("key", key);
            link.click(function() {
              sync.removeModifier(data.equations[$(this).attr("index")], $(this).attr("key"));
              obj.update();
            });
          }
        }

        die.css("cursor", "pointer");
        die.attr("eq-index", index);

        if (data.local && !scope.viewOnly) {
          var optionsBar = $("<div>").appendTo(equation);
          optionsBar.addClass("flexbetween");

          var deleteButton = genIcon("trash").appendTo(optionsBar);
          deleteButton.addClass("destroy");
          deleteButton.attr("index", index);
          deleteButton.attr("title", "Delete Die");
          deleteButton.click(function() {
            data.equations.splice($(this).attr("index"), 1);
            if (data.local) {
              obj.addApp(app);
            }
            obj.update();
          });

          var duplicate = genIcon("pencil").appendTo(optionsBar);
          duplicate.attr("index", index);
          duplicate.attr("title", "Edit Die");
          duplicate.click(function() {
            var reference = data.equations[$(this).attr("index")];
            ui_prompt({
              target : $(this),
              id : "change-eq",
              inputs : {
                "Equation" : reference.e || "",
              },
              click : function(eq, inputs) {
                if (inputs["Equation"].val() != reference.e) {
                  reference = sync.process(inputs["Equation"].val(), null, true);
                  if (data.local) {
                    obj.addApp(app);
                  }
                  obj.update();
                }
              }
            });
          });

          var duplicate = genIcon("duplicate").appendTo(optionsBar);
          duplicate.attr("index", index);
          duplicate.attr("title", "Duplicate Die");
          duplicate.click(function() {
            data.equations.push(duplicate(data.equations[$(this).attr("index")]));
            if (data.local) {
              obj.addApp(app);
            }
            obj.update();
          });
        }
      }
    }
    else {
      for (var key in value.ctx) {
        if (key != "result") {
          var link;
          link = $("<b>"+key+" - "+(sync.val(value.ctx[key]))+"</b>").appendTo(equation);
          link.addClass("fit-x flexmiddle subtitle");
        }
      }
    }
  }
  //defined above
  resultsDiv = $("<div>").appendTo(div);
  resultsDiv.addClass("flex flexmiddle");
  if (data.ui) {
    var wrapObj = sync.dummyObj();
    wrapObj.data = {data : {equations : data.equations, pool : data.pool}};
    equationList.addClass("outlinebottom");
    var proceed = false;
    for (var i in data.equations) {
      if (data.equations[i].v) {
        proceed = true;
        break;
      }
    }
    if (proceed) {
      var display = sync.render("ui_newDiceResults")(wrapObj, app, {display : game.templates.display.ui[data.ui]}).appendTo(resultsDiv);
      display.addClass("flex");
    }
  }

  if (!scope.viewOnly) {
    var button = $("<button>");
    button.addClass("fit-x");
    button.append("Roll");
    if (data.editable && data.custom) {
      button.appendTo(div);
      if (data.local) {
        //privateRoll.appendTo(diceChoices);
      }
    }
    else {
      button.css("width", "100%");
      button.appendTo(div);
      if (data.local) {
        //privateRoll.appendTo(div);
      }
    }
    button.click(function(ev) {
      scope.click(ev, $(this));
    });
    if (layout.mobile) {
      button.text(button.text() + "(Or Shake!)");
      //listen to shake event
      shakeEvent = new Shake({threshold: 15});
      shakeEvent.start();
      function createListener() {
        if (button.is(":visible") && !button.attr("shaked")) {
          button.attr("shaked", true);
          button.click();
        }
      }
      window.addEventListener('shake', createListener, false);

      //check if shake is supported or not.
      if(!("ondevicemotion" in window)){alert("Not Supported");}
    }
  }

  return div;
});

sync.render("ui_statRoller", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};

  var div = $("<div>");
  div.addClass("flex flexcolumn");

  var data = obj.data;

  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow flexwrap flexaround background alttext outline");
  if (data.eventList.length) {
    var dataList = $("<datalist>").appendTo(optionsBar);
    dataList.attr("id", "roll-ui-list");

    var option = $("<option>").appendTo(dataList);
    for (var i in game.templates.display.ui) {
      var option = $("<option>").appendTo(dataList);
      option.attr("value", i);
    }

    var ui = genInput({
      parent : optionsBar,
      type : "list",
      list : "roll-ui-list",
      placeholder : "Select UI Display",
      disabled: scope.viewOnly,
      style : {color : "#333"}
    });
    ui.change(function(){
      for (var i in data.eventList) {
        var eventData = data.eventList[i].data;
        eventData.ui = ($(this).val() || "").trim();
        if (eventData.data) {
          eventData.data.ui = eventData.data.ui;
        }
      }
      obj.update();
    });
    if (scope.viewOnly) {
      ui.css("background-color", "rgb(235,235,228)");
    }
  }

  var addRollWrap = $("<div>").appendTo(optionsBar);
  addRollWrap.addClass("flexmiddle");

  var addRoll = genIcon("plus", "Add Character").appendTo(addRollWrap);
  addRoll.click(function(){
    var content = $("<div>");
    content.css("max-height", "40vh");
    content.css("overflow", "auto");
    sync.render("ui_entList")(obj, app, {
      rights : "Visible",
      filter : "c",
      click : function(ev, ui, ent) {
        var eqBuilderObj = sync.dummyObj();
        var ctx = sync.defaultContext();
        ctx["c"] = ent.data;
        ctx["_cID"] = ent.id();
        eqBuilderObj.data = {context : ctx, eq : "$die="+die+";"+die};

        obj.data.eventList.push(eqBuilderObj);

        layout.coverlay("roll-ent-list");
        obj.update();
      }
    }).appendTo(content);

    ui_popOut({
      target : $(this),
      id : "roll-ent-list",
    }, content);
  });
  if (data.eventList.length > 1) {
    var addRollWrap = $("<div>").appendTo(optionsBar);
    addRollWrap.addClass("flexmiddle");

    var selectStat = genIcon("plus", "Select Stat").appendTo(addRollWrap);
    selectStat.click(function(){
      var content = $("<div>");
      content.addClass("flexcolumn");

      for (var key in game.templates.character.stats) {
        var infoPanel = $("<button>").appendTo(content);
        infoPanel.append(game.templates.character.stats[key].name);
        infoPanel.attr("index", key);
        infoPanel.click(function(){
          var statKey = $(this).attr("index");
          for (var i in data.eventList) {
            var eventData = data.eventList[i].data;
            eventData.context["statKey"] = statKey;
            eventData.context["die"] = die;
            eventData.context["modifier"] = eventData.context["modifier"] || 0;
            eventData.str = "#threshold=@c.stats."+statKey+";$die="+die+";"+die+"+"+"@modifier";
          }
          obj.update();
          layout.coverlay("roll-stat-list");
        });
      }

      ui_popOut({
        target : $(this),
        id : "roll-stat-list",
      }, content);
    });

    var addRollWrap = $("<div>").appendTo(optionsBar);
    addRollWrap.addClass("flexmiddle");

    var selectMod = genIcon("plus", "Select Modifier").appendTo(addRollWrap);
    selectMod.click(function(){
      var arr = duplicate(game.templates.dice.modifiers);

      var modsWrapper = $("<div>");
      modsWrapper.append("<b>Bonus</b>");

      var bonusWrapper = $("<div>").appendTo(modsWrapper);
      bonusWrapper.addClass("subtitle");

      modsWrapper.append("<b>Penalty</b>");

      var penalWrapper = $("<div>").appendTo(modsWrapper);
      penalWrapper.addClass("subtitle");

      if (arr && arr.length) {
        var mods = $("<div>").appendTo(bonusWrapper);
        mods.addClass("flexrow flexwrap subtitle");

        arr.sort(function(a,b){return a-b;});
        for (var i in arr) {
          var value = arr[i];

          var dice = $("<button>").appendTo(bonusWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("+"+value);

          dice.click(function() {
            bonusWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            for (var i in data.eventList) {
              var eventData = data.eventList[i].data;

              if (eventData.advanced) {
                eventData.str += "+" + $(this).attr("val");
              }
              else {
                eventData.str = "#threshold=@c.stats."+eventData.context["statKey"]+";$die="+eventData.context["die"]+";"+eventData.context["die"]+"+@modifier";
              }
              if (game.templates.dice.defaults)
              eventData.context["modifier"] = $(this).attr("val");
            }
            obj.update();
            layout.coverlay("mods-pop");
          });

          var dice = $("<button>").appendTo(penalWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("-"+value);

          dice.click(function() {
            penalWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            for (var i in data.eventList) {
              var eventData = data.eventList[i].data;
              if (eventData.advanced) {
                eventData.str += "-" + $(this).attr("val");
              }
              else {
                eventData.str = "#threshold=@c.stats."+eventData.context["statKey"]+";$die="+eventData.context["die"]+";"+eventData.context["die"]+"-@modifier";
              }
              eventData.context["modifier"] = $(this).attr("val");
            }
            obj.update();
            layout.coverlay("mods-pop");
          });
        }
      }

      var pop = ui_popOut({
        target : $(this),
        id : "mods-pop",
        align : "bottom",
      }, modsWrapper);
    });
  }
  if (data.eventList.length) {
    var roll = $("<button>").appendTo(optionsBar);
    roll.css("color", "#333");
    roll.append("Roll All");
    roll.click(function(){
      for (var i in data.eventList) {
        var eventData = data.eventList[i].data;
        eventData.data = sync.executeQuery(eventData.str, duplicate(eventData.context));
      }
      obj.update();
    });

    var clear = $("<button>").appendTo(optionsBar);
    clear.css("color", "#333");
    clear.append("Clear All");
    clear.click(function(){
      data.eventList = [];
      obj.update();
    });
  }

  var eventListWrap = $("<div>").appendTo(div);
  eventListWrap.addClass("flex flexcolumn");
  eventListWrap.css("overflow", "auto");
  eventListWrap.css("position", "relative");
  eventListWrap.scroll(function(){
    app.attr("_lastScrollTop", eventListWrap.scrollTop());
    app.attr("_lastScrollLeft", eventListWrap.scrollLeft());
  });

  var eventList = $("<div>").appendTo(eventListWrap);
  eventList.addClass("fit-x flexcolumn");
  eventList.css("position", "absolute");
  eventList.sortable({
    update : function(ev, ui) {
      var newIndex;
      var count = 0;
      $(ui.item).attr("ignore", true);
      eventList.children().each(function(){
        if ($(this).attr("ignore")){
          newIndex = count;
        }
        count += 1;
      });
      var old = obj.data.eventList.splice($(ui.item).attr("index"), 1);
      util.insert(obj.data.eventList, newIndex, old[0]);
      obj.update();
    }
  });

  var helper = $("<div>").appendTo(eventList);
  helper.addClass("flexmiddle subtitle");
  //var helpLink = genIcon("question-sign", "Equation Rules").appendTo(helper);

  for (var evKey in data.eventList) {
    var eventData = data.eventList[evKey].data;

    var equationDiv = $("<div>").appendTo(eventList);
    equationDiv.addClass("flexrow flexaround outline");
    equationDiv.attr("index", evKey);

    var header = $("<div>").appendTo(equationDiv);
    header.addClass("flexrow flexbetween");

    var remove = genIcon("trash").appendTo(header);
    remove.attr("index", evKey);
    remove.addClass("destroy");
    remove.click(function(){
      data.eventList.splice($(this).attr("index"), 1);
      obj.update();
    });


    var refPlate = $("<div>").appendTo(equationDiv);
    refPlate.addClass("flexcolumn flexmiddle");
    refPlate.css("width", "25%");

    if (eventData.context["_cID"]) {
      var ent = game.entities.data[eventData.context["_cID"]];
      if (ent.data && ent.data._t == "c") {
        var imgPlate = sync.render("ui_characterSummary")(ent, app, {minimized : true, viewOnly : true}).appendTo(refPlate);
        imgPlate.addClass("outlinebottom hover2 fit-x");
        imgPlate.css("cursor", "pointer");
        imgPlate.attr("index", evKey);
        imgPlate.click(function(){
          var evKey = $(this).attr("index");
          if (_down["16"]) {
            if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
              var content = sync.newApp("ui_characterSummary");
              ent.addApp(content);
              var popOut = ui_popOut({
                target: $(this),
                id: "char-summary-"+$(this).attr("index"),
              }, content);
            }
            else {
              sendAlert({text : "No Access"});
            }
          }
          else {
            var content = $("<div>");
            content.css("max-height", "40vh");
            content.css("overflow", "auto");
            sync.render("ui_entList")(obj, app, {
              rights : "Visible",
              filter : "c",
              click : function(ev, ui, ent) {
                obj.data.eventList[evKey].data.context["c"] = ent.data;
                obj.data.eventList[evKey].data.context["_cID"] = ent.id();

                layout.coverlay("roll-ent-list");
                obj.update();
              }
            }).appendTo(content);

            ui_popOut({
              target : $(this),
              id : "roll-ent-list",
            }, content);
          }
        });
      }
    }

    var newStat;
    var ref = $("<div>");
    if (eventData.advanced) {
      ref.addClass("flexmiddle subtitle");
      ref.appendTo(refPlate);

      var advanced = genIcon("cog", "Basic").appendTo(ref);
      advanced.attr("index", evKey);
      advanced.click(function(){
        data.eventList[$(this).attr("index")].data.advanced = false;
        obj.update();
      });
    }
    else {
      ref.css("width", "40%");
      ref.addClass("flexcolumn flexmiddle");
      ref.appendTo(equationDiv);
      ref.css("font-size", "1.5em");
    }

    if (eventData.context["statKey"]) {
      newStat = genIcon("search", eventData.context["c"].stats[eventData.context["statKey"]].name).appendTo(ref);
    }
    else {
      newStat = genIcon("search", "Select Stat").appendTo(ref);
    }
    if (!eventData.advanced) {
      var advanced = genIcon("cog", "Advanced").appendTo(refPlate);
      advanced.attr("index", evKey);
      advanced.addClass("subtitle");
      advanced.click(function(){
        data.eventList[$(this).attr("index")].data.advanced = true;
        obj.update();
      });
    }
    newStat.attr("index", evKey);
    newStat.click(function(){
      var content = $("<div>");
      content.addClass("flexcolumn");

      var eventData = data.eventList[$(this).attr("index")].data;
      for (var key in game.templates.character.stats) {
        var infoPanel = $("<button>").appendTo(content);
        infoPanel.append(game.templates.character.stats[key].name);
        infoPanel.attr("index", key);
        infoPanel.click(function(){
          var statKey = $(this).attr("index");
          eventData.context["statKey"] = statKey;
          eventData.context["die"] = die;
          eventData.context["modifier"] = eventData.context["modifier"] || 0;
          eventData.str = "#threshold=@c.stats."+statKey+";$die="+die+";"+die+"+"+"@modifier";
          obj.update();
          layout.coverlay("roll-stat-list");
        });
      }

      ui_popOut({
        target : $(this),
        id : "roll-stat-list",
      }, content);
    });
    if (eventData.advanced) {
      var refDiv = $("<div>").appendTo(equationDiv);
      refDiv.addClass("flexcolumn flexmiddle lightoutline");

      var newApp = sync.newApp("ui_equationBuilder").appendTo(refDiv);
      newApp.attr("noRoll", "true");
      data.eventList[evKey].addApp(newApp);

      var ref = $("<div>").appendTo(refDiv);
      ref.addClass("fit-x flexaround subtitle");
    }
    var modifiers;
    if (eventData.advanced) {
      modifiers = genIcon("plus", "Add Bonus/Penalty");
    }
    else {
      var modStr = eventData.context["modifier"] || 0;
      if (modStr >= 0) {
        modStr = "+" + modStr;
      }
      modifiers = genIcon("", "Bonus/Penalty : " + modStr);
      modifiers.css("font-size", "0.6em");
    }
    modifiers.appendTo(ref);
    modifiers.attr("index", evKey);
    modifiers.click(function(){
      var eventData = data.eventList[$(this).attr("index")].data;
      var arr = duplicate(game.templates.dice.modifiers);

      var modsWrapper = $("<div>");
      modsWrapper.append("<b>Bonus</b>");

      var bonusWrapper = $("<div>").appendTo(modsWrapper);
      bonusWrapper.addClass("subtitle");

      modsWrapper.append("<b>Penalty</b>");

      var penalWrapper = $("<div>").appendTo(modsWrapper);
      penalWrapper.addClass("subtitle");

      if (arr && arr.length) {
        var mods = $("<div>").appendTo(bonusWrapper);
        mods.addClass("flexrow flexwrap subtitle");

        arr.sort(function(a,b){return a-b;});
        for (var i in arr) {
          var value = arr[i];

          var dice = $("<button>").appendTo(bonusWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("+"+value);

          dice.click(function() {
            bonusWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            if (eventData.advanced) {
              eventData.str += "+" + $(this).attr("val");
            }
            else {
              eventData.context["modifier"] = Number($(this).attr("val"));
            }
            obj.update();
            layout.coverlay("mods-pop");
          });

          var dice = $("<button>").appendTo(penalWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("-"+value);

          dice.click(function() {
            penalWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            if (eventData.advanced) {
              eventData.str += "-" + $(this).attr("val");
            }
            else {
              eventData.context["modifier"] = Number($(this).attr("val")) * -1;
            }
            obj.update();
            layout.coverlay("mods-pop");
          });
        }
      }

      var pop = ui_popOut({
        target : $(this),
        id : "mods-pop",
        align : "bottom",
      }, modsWrapper);
    });
    if (eventData.advanced) {
      var reference = genIcon("plus", "Add Reference").appendTo(ref);
      reference.attr("index", evKey);
      reference.click(function(){
        var eventData = data.eventList[$(this).attr("index")];
        var content = $("<div>");
        content.addClass("flexrow subtitle");

        var section = $("<div>").appendTo(content);
        section.append("<div><b>Stats</b></div>");
        section.addClass("flexcolumn");

        for (var key in game.templates.character.stats) {
          var infoPanel = $("<button>").appendTo(section);
          infoPanel.append(game.templates.character.stats[key].name);
          infoPanel.attr("index", key);
          infoPanel.click(function(){
            var statKey = $(this).attr("index");
            var evData = eventData.data;
            if (game.templates.display.sheet.rules.statBonus) {
              evData.str += "+"+sync.val(game.templates.display.sheet.rules.statBonus);
            }
            else {
              evData.str += "+@c.stats."+statKey;
            }
            obj.update();
            layout.coverlay("roll-stat-list");
          });
        }

        var section = $("<div>").appendTo(content);
        section.append("<div><b>Counters</b></div>");
        section.addClass("flexcolumn");

        for (var key in game.templates.character.counters) {
          if (sync.rawVal(game.templates.character.counters[key]) instanceof Object) {
            var sub = $("<div>").appendTo(section);
            sub.addClass("flexcolumn lrpadding");
            sub.append("<i>"+game.templates.character.counters[key].name+"</i>");
            var subObj = sync.rawVal(game.templates.character.counters[key]);
            for (var subKey in subObj) {
              var infoPanel = $("<button>").appendTo(sub);
              infoPanel.append(subObj[subKey].name || subKey);
              infoPanel.attr("index", key);
              infoPanel.attr("subIndex", subKey);
              infoPanel.addClass("subtitle");
              infoPanel.click(function(){
                var statKey = $(this).attr("index");
                var subKey = $(this).attr("subIndex");
                var evData = eventData.data;
                evData.str += "+@counters."+statKey+".current."+subKey;

                obj.update();
                layout.coverlay("roll-stat-list");
              });
            }
          }
          else {
            var infoPanel = $("<button>").appendTo(section);
            infoPanel.append(game.templates.character.counters[key].name);
            infoPanel.attr("index", key);
            infoPanel.click(function(){
              var statKey = $(this).attr("index");
              var evData = eventData.data;
              evData.str += "+@c.counters."+statKey;

              obj.update();
              layout.coverlay("roll-stat-list");
            });
          }
        }

        ui_popOut({
          target : $(this),
          id : "roll-stat-list",
          align : "bottom",
        }, content);
      });
    }

    //refDiv.append("<i>Equation Preview</i>");

    var resultPlate = $("<div>").appendTo(equationDiv);
    resultPlate.addClass("flexcolumn");
    resultPlate.css("width", "35%");

    if (eventData.data) {
      sync.render("ui_newDiceResults")(data.eventList[evKey], app, {display : game.templates.display.ui[eventData.ui]}).appendTo(resultPlate);
    }
    else {
      resultPlate.append("<div class='flexmiddle' style='font-size:0.8em'><i>No Results</i></div>");
    }
    if (eventData.advanced) {
      var ui = genInput({
        parent : resultPlate,
        type : "list",
        list : "roll-ui-list",
        placeholder : "Select UI Display",
        disabled: scope.viewOnly,
        index : evKey,
        style : {color : "#333"}
      });
      ui.val(eventData.ui);
      ui.change(function(){
        var eventData = data.eventList[$(this).attr("index")].data;
        eventData.ui = ($(this).val() || "").trim();
        if (eventData.data) {
          eventData.data.ui = eventData.ui;
        }
        obj.update();
      });
      if (scope.viewOnly) {
        ui.css("background-color", "rgb(235,235,228)");
      }
    }
  }

  return div;
});

sync.render("ui_skillRoller", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};

  var div = $("<div>");
  div.addClass("flex flexcolumn");

  var data = obj.data;

  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow flexwrap flexaround background alttext outline");

  if (data.eventList.length) {
    var dataList = $("<datalist>").appendTo(optionsBar);
    dataList.attr("id", "roll-ui-list");

    var option = $("<option>").appendTo(dataList);
    for (var i in game.templates.display.ui) {
      var option = $("<option>").appendTo(dataList);
      option.attr("value", i);
    }

    var ui = genInput({
      parent : optionsBar,
      type : "list",
      list : "roll-ui-list",
      placeholder : "Select UI Display",
      disabled: scope.viewOnly,
      style : {color : "#333"}
    });
    ui.change(function(){
      for (var i in data.eventList) {
        var eventData = data.eventList[i].data;
        eventData.ui = ($(this).val() || "").trim();
        if (eventData.data) {
          eventData.data.ui = eventData.data.ui;
        }
      }
      obj.update();
    });
    if (scope.viewOnly) {
      ui.css("background-color", "rgb(235,235,228)");
    }
  }

  var addRollWrap = $("<div>").appendTo(optionsBar);
  addRollWrap.addClass("flexmiddle");

  var addRoll = genIcon("plus", "Add Character").appendTo(addRollWrap);
  addRoll.click(function(){
    var content = $("<div>");
    content.css("max-height", "40vh");
    content.css("overflow", "auto");
    sync.render("ui_entList")(obj, app, {
      rights : "Visible",
      filter : "c",
      click : function(ev, ui, ent) {
        var eqBuilderObj = sync.dummyObj();
        var ctx = sync.defaultContext();
        ctx["c"] = ent.data;
        ctx["_cID"] = ent.id();
        eqBuilderObj.data = {context : ctx, eq : "$die="+die+";"+die};

        obj.data.eventList.push(eqBuilderObj);

        layout.coverlay("roll-ent-list");
        obj.update();
      }
    }).appendTo(content);

    ui_popOut({
      target : $(this),
      id : "roll-ent-list",
    }, content);
  });
  if (data.eventList.length > 1) {
    var addRollWrap = $("<div>").appendTo(optionsBar);
    addRollWrap.addClass("flexmiddle");

    var selectStat = genIcon("plus", "Select Skill").appendTo(addRollWrap);
    selectStat.click(function(){
      var rTable = game.templates.character;

      var content = $("<div>");
      content.addClass("flexcolumn");

      if ($("#skill-list").length) {
        $("#skill-list").remove();
      }
      var dataList = $("<datalist>").appendTo(content);
      dataList.attr("id", "skill-list");

      var skillRegex = /\(([^(]+[^)]+)\)/;

      for (var index in rTable.skills) {
        var skill = rTable.skills[index];
        if (skillRegex.exec(skill.name)) {
          var option = $("<option>").appendTo(dataList);
          option.attr("value", skill.name);
        }
      }

      var skill = genInput({
        parent : content,
        type : "list",
        list : "skill-list",
        placeholder : "Type in Skill",
        disabled: scope.viewOnly,
      });
      if (scope.viewOnly) {
        skill.css("background-color", "rgb(235,235,228)");
      }
      skill.change(function(){
        var skillRef;
        for (var key in obj.data.eventList) {
          skillRef = null;
          var eventData = obj.data.eventList[key].data;
          if (eventData.context["_cID"] != null && game.entities.data[eventData.context["_cID"]]) {
            rTable = duplicate(game.entities.data[eventData.context["_cID"]].data);
            for (var index in rTable.skills) {
              if (rTable.skills[index] && rTable.skills[index].name.toLowerCase() == $(this).val().toLowerCase()) {
                skillRef = index;
                break;
              }
            }
            if (skillRef != null) {
              var skillRegex = /\((.+)\)/;
              var statRes = skillRegex.exec(rTable.skills[skillRef].name);
              if (statRes) {
                delete eventData.context["stat"];
                delete eventData.context["statKey"];
                for (var statKey in rTable.stats) {
                  if (statKey.toLowerCase() == statRes[1].toLowerCase().trim()) {
                    eventData.context["statKey"] = statKey;
                    break;
                  }
                }
              }
              eventData.context["stat"] = rTable.stats[eventData.context["statKey"]];
              eventData.context["skill"] = rTable.skills[skillRef];
              eventData.context["skillKey"] = skillRef;
              if (game.templates.display.sheet.skills.inverted) {
                eventData.str = game.templates.display.sheet.skills.roll+"-{modifier}";
              }
              else {
                eventData.str = game.templates.display.sheet.skills.roll+"+{modifier}";
              }
            }
          }
        }
        if (skillRef != null) {
          obj.update();
          layout.coverlay("roll-skill-list");
        }
      });

      ui_popOut({
        target : $(this),
        id : "roll-skill-list",
      }, content);
    });

    var addRollWrap = $("<div>").appendTo(optionsBar);
    addRollWrap.addClass("flexmiddle");

    var selectMod = genIcon("plus", "Select Modifier").appendTo(addRollWrap);
    selectMod.click(function(){
      var arr = duplicate(game.templates.dice.modifiers);

      var modsWrapper = $("<div>");
      modsWrapper.append("<b>Bonus</b>");

      var bonusWrapper = $("<div>").appendTo(modsWrapper);
      bonusWrapper.addClass("subtitle");

      modsWrapper.append("<b>Penalty</b>");

      var penalWrapper = $("<div>").appendTo(modsWrapper);
      penalWrapper.addClass("subtitle");

      if (arr && arr.length) {
        var mods = $("<div>").appendTo(bonusWrapper);
        mods.addClass("flexrow flexwrap subtitle");

        arr.sort(function(a,b){return a-b;});
        for (var i in arr) {
          var value = arr[i];

          var dice = $("<button>").appendTo(bonusWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("+"+value);

          dice.click(function() {
            bonusWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            for (var i in data.eventList) {
              var eventData = data.eventList[i].data;

              if (eventData.advanced) {
                eventData.str += "+" + $(this).attr("val");
              }
              else {
                if (game.templates.display.sheet.skills.inverted) {
                  eventData.str = game.templates.display.sheet.skills.roll+"-{modifier}";
                }
                else {
                  eventData.str = game.templates.display.sheet.skills.roll+"+{modifier}";
                }
              }
              if (game.templates.dice.defaults)
              eventData.context["modifier"] = $(this).attr("val");
            }
            obj.update();
            layout.coverlay("mods-pop");
          });

          var dice = $("<button>").appendTo(penalWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("-"+value);

          dice.click(function() {
            penalWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            for (var i in data.eventList) {
              var eventData = data.eventList[i].data;
              if (eventData.advanced) {
                eventData.str += "-" + $(this).attr("val");
              }
              else {
                eventData.str = "#threshold=@c.stats."+eventData.context["statKey"]+";$die="+eventData.context["die"]+";"+eventData.context["die"]+"-@modifier";
              }
              eventData.context["modifier"] = $(this).attr("val");
            }
            obj.update();
            layout.coverlay("mods-pop");
          });
        }
      }

      var pop = ui_popOut({
        target : $(this),
        id : "mods-pop",
        align : "bottom",
      }, modsWrapper);
    });
  }
  if (data.eventList.length) {
    var roll = $("<button>").appendTo(optionsBar);
    roll.css("color", "#333");
    roll.append("Roll All");
    roll.click(function(){
      for (var i in data.eventList) {
        var eventData = data.eventList[i].data;
        eventData.data = sync.executeQuery(eventData.str, duplicate(eventData.context));
      }
      obj.update();
    });

    var clear = $("<button>").appendTo(optionsBar);
    clear.css("color", "#333");
    clear.append("Clear All");
    clear.click(function(){
      data.eventList = [];
      obj.update();
    });
  }

  var eventListWrap = $("<div>").appendTo(div);
  eventListWrap.addClass("flex flexcolumn");
  eventListWrap.css("overflow", "auto");
  eventListWrap.css("position", "relative");
  eventListWrap.scroll(function(){
    app.attr("_lastScrollTop", eventListWrap.scrollTop());
    app.attr("_lastScrollLeft", eventListWrap.scrollLeft());
  });

  var eventList = $("<div>").appendTo(eventListWrap);
  eventList.addClass("fit-x flexcolumn");
  eventList.css("position", "absolute");
  eventList.sortable({
    update : function(ev, ui) {
      var newIndex;
      var count = 0;
      $(ui.item).attr("ignore", true);
      eventList.children().each(function(){
        if ($(this).attr("ignore")){
          newIndex = count;
        }
        count += 1;
      });
      var old = obj.data.eventList.splice($(ui.item).attr("index"), 1);
      util.insert(obj.data.eventList, newIndex, old[0]);
      obj.update();
    }
  });

  var helper = $("<div>").appendTo(eventList);
  helper.addClass("flexmiddle subtitle");
  //var helpLink = genIcon("question-sign", "Equation Rules").appendTo(helper);

  for (var evKey in data.eventList) {
    var eventData = data.eventList[evKey].data;

    var equationDiv = $("<div>").appendTo(eventList);
    equationDiv.addClass("flexrow flexaround outline");
    equationDiv.attr("index", evKey);

    var header = $("<div>").appendTo(equationDiv);
    header.addClass("flexrow flexbetween");

    var remove = genIcon("trash").appendTo(header);
    remove.attr("index", evKey);
    remove.addClass("destroy");
    remove.click(function(){
      data.eventList.splice($(this).attr("index"), 1);
      obj.update();
    });


    var refPlate = $("<div>").appendTo(equationDiv);
    refPlate.addClass("flexcolumn flexmiddle");
    refPlate.css("width", "25%");

    if (eventData.context["_cID"]) {
      var ent = game.entities.data[eventData.context["_cID"]];
      if (ent.data && ent.data._t == "c") {
        var imgPlate = sync.render("ui_characterSummary")(ent, app, {minimized : true, viewOnly : true}).appendTo(refPlate);
        imgPlate.addClass("outlinebottom hover2 fit-x");
        imgPlate.css("cursor", "pointer");
        imgPlate.attr("index", evKey);
        imgPlate.click(function(){
          var evKey = $(this).attr("index");
          if (_down["16"]) {
            if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
              var content = sync.newApp("ui_characterSummary");
              ent.addApp(content);
              var popOut = ui_popOut({
                target: $(this),
                id: "char-summary-"+$(this).attr("index"),
              }, content);
            }
            else {
              sendAlert({text : "No Access"});
            }
          }
          else {
            var content = $("<div>");
            content.css("max-height", "40vh");
            content.css("overflow", "auto");
            sync.render("ui_entList")(obj, app, {
              rights : "Visible",
              filter : "c",
              click : function(ev, ui, ent) {
                obj.data.eventList[evKey].data.context["c"] = ent.data;
                obj.data.eventList[evKey].data.context["_cID"] = ent.id();

                layout.coverlay("roll-ent-list");
                obj.update();
              }
            }).appendTo(content);

            ui_popOut({
              target : $(this),
              id : "roll-ent-list",
            }, content);
          }
        });
      }
    }

    var newStat;
    var ref = $("<div>");
    if (eventData.advanced) {
      ref.addClass("flexmiddle subtitle");
      ref.appendTo(refPlate);

      var advanced = genIcon("cog", "Basic").appendTo(ref);
      advanced.attr("index", evKey);
      advanced.click(function(){
        data.eventList[$(this).attr("index")].data.advanced = false;
        obj.update();
      });
    }
    else {
      ref.css("width", "40%");
      ref.addClass("flexcolumn flexmiddle");
      ref.appendTo(equationDiv);
      ref.css("font-size", "1.5em");
    }

    if (eventData.context["statKey"]) {
      newStat = genIcon("search", eventData.context["c"].skills[eventData.context["skillKey"]].name).appendTo(ref);
    }
    else {
      newStat = genIcon("search", "Select Skill").appendTo(ref);
    }
    if (!eventData.advanced) {
      var advanced = genIcon("cog", "Advanced").appendTo(refPlate);
      advanced.attr("index", evKey);
      advanced.addClass("subtitle");
      advanced.click(function(){
        data.eventList[$(this).attr("index")].data.advanced = true;
        obj.update();
      });
    }
    newStat.attr("index", evKey);
    newStat.click(function(){
      var rTable = game.templates.character;

      var content = $("<div>");
      content.addClass("flexcolumn");

      if ($("#skill-list").length) {
        $("#skill-list").remove();
      }
      var dataList = $("<datalist>").appendTo(content);
      dataList.attr("id", "skill-list");

      var skillRegex = /\(([^(]+[^)]+)\)/;

      for (var index in rTable.skills) {
        var skill = rTable.skills[index];
        if (skillRegex.exec(skill.name)) {
          var option = $("<option>").appendTo(dataList);
          option.attr("value", skill.name);
        }
      }

      var skill = genInput({
        parent : content,
        type : "list",
        list : "skill-list",
        placeholder : "Type in Skill",
        disabled: scope.viewOnly,
      });
      if (scope.viewOnly) {
        skill.css("background-color", "rgb(235,235,228)");
      }
      var key = $(this).attr("index")
      skill.change(function(){
        var skillRef;
        var eventData = obj.data.eventList[key].data;
        if (eventData.context["_cID"] != null && game.entities.data[eventData.context["_cID"]]) {
          rTable = duplicate(game.entities.data[eventData.context["_cID"]].data);
          for (var index in rTable.skills) {
            if (rTable.skills[index] && rTable.skills[index].name.toLowerCase() == $(this).val().toLowerCase()) {
              skillRef = index;
              break;
            }
          }
          if (skillRef != null) {
            var skillRegex = /\((.+)\)/;
            var statRes = skillRegex.exec(rTable.skills[skillRef].name);
            if (statRes) {
              delete eventData.context["stat"];
              delete eventData.context["statKey"];
              for (var statKey in rTable.stats) {
                if (statKey.toLowerCase() == statRes[1].toLowerCase().trim()) {
                  eventData.context["statKey"] = statKey;
                  break;
                }
              }
            }
            eventData.context["stat"] = rTable.stats[eventData.context["statKey"]];
            eventData.context["skill"] = rTable.skills[skillRef];
            eventData.context["skillKey"] = skillRef;
            if (game.templates.display.sheet.skills.inverted) {
              eventData.str = game.templates.display.sheet.skills.roll+"-{modifier}";
            }
            else {
              eventData.str = game.templates.display.sheet.skills.roll+"+{modifier}";
            }
          }
        }
        if (skillRef != null) {
          obj.update();
          layout.coverlay("roll-skill-list");
        }
      });

      ui_popOut({
        target : $(this),
        id : "roll-skill-list",
      }, content);
    });
    if (eventData.advanced) {
      var refDiv = $("<div>").appendTo(equationDiv);
      refDiv.addClass("flexcolumn flexmiddle lightoutline flex");

      var newApp = sync.newApp("ui_equationBuilder").appendTo(refDiv);
      newApp.addClass("flex");
      newApp.attr("noRoll", "true");
      data.eventList[evKey].addApp(newApp);

      var ref = $("<div>").appendTo(refDiv);
      ref.addClass("fit-x flexaround subtitle");
    }
    var modifiers;
    if (eventData.advanced) {
      modifiers = genIcon("plus", "Add Bonus/Penalty");
    }
    else {
      var modStr = eventData.context["modifier"] || 0;
      if (modStr >= 0) {
        modStr = "+" + modStr;
      }
      modifiers = genIcon("", "Bonus/Penalty : " + modStr);
      modifiers.css("font-size", "0.6em");
    }
    modifiers.appendTo(ref);
    modifiers.attr("index", evKey);
    modifiers.click(function(){
      var eventData = data.eventList[$(this).attr("index")].data;
      var arr = duplicate(game.templates.dice.modifiers);

      var modsWrapper = $("<div>");
      modsWrapper.append("<b>Bonus</b>");

      var bonusWrapper = $("<div>").appendTo(modsWrapper);
      bonusWrapper.addClass("subtitle");

      modsWrapper.append("<b>Penalty</b>");

      var penalWrapper = $("<div>").appendTo(modsWrapper);
      penalWrapper.addClass("subtitle");

      if (arr && arr.length) {
        var mods = $("<div>").appendTo(bonusWrapper);
        mods.addClass("flexrow flexwrap subtitle");

        arr.sort(function(a,b){return a-b;});
        for (var i in arr) {
          var value = arr[i];

          var dice = $("<button>").appendTo(bonusWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("+"+value);

          dice.click(function() {
            bonusWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            if (eventData.advanced) {
              eventData.str += "+" + $(this).attr("val");
            }
            else {
              eventData.context["modifier"] = Number($(this).attr("val"));
            }
            obj.update();
            layout.coverlay("mods-pop");
          });

          var dice = $("<button>").appendTo(penalWrapper);
          dice.addClass("hover2");
          dice.attr("val", value);
          dice.text("-"+value);

          dice.click(function() {
            penalWrapper.children().removeClass("focus");
            $(this).addClass("focus");
            if (eventData.advanced) {
              eventData.str += "-" + $(this).attr("val");
            }
            else {
              eventData.context["modifier"] = Number($(this).attr("val")) * -1;
            }
            obj.update();
            layout.coverlay("mods-pop");
          });
        }
      }

      var pop = ui_popOut({
        target : $(this),
        id : "mods-pop",
        align : "bottom",
      }, modsWrapper);
    });
    if (eventData.advanced) {
      var reference = genIcon("plus", "Add Reference").appendTo(ref);
      reference.attr("index", evKey);
      reference.click(function(){
        var eventData = data.eventList[$(this).attr("index")];
        var content = $("<div>");
        content.addClass("flexrow subtitle");

        var section = $("<div>").appendTo(content);
        section.append("<div><b>Stats</b></div>");
        section.addClass("flexcolumn");

        for (var key in game.templates.character.stats) {
          var infoPanel = $("<button>").appendTo(section);
          infoPanel.append(game.templates.character.stats[key].name);
          infoPanel.attr("index", key);
          infoPanel.click(function(){
            var statKey = $(this).attr("index");
            var evData = eventData.data;
            if (game.templates.display.sheet.rules.statBonus) {
              evData.str += "+"+sync.val(game.templates.display.sheet.rules.statBonus);
            }
            else {
              evData.str += "+@c.stats."+statKey;
            }
            obj.update();
            layout.coverlay("roll-stat-list");
          });
        }

        var section = $("<div>").appendTo(content);
        section.append("<div><b>Counters</b></div>");
        section.addClass("flexcolumn");

        for (var key in game.templates.character.counters) {
          if (sync.rawVal(game.templates.character.counters[key]) instanceof Object) {
            var sub = $("<div>").appendTo(section);
            sub.addClass("flexcolumn lrpadding");
            sub.append("<i>"+game.templates.character.counters[key].name+"</i>");
            var subObj = sync.rawVal(game.templates.character.counters[key]);
            for (var subKey in subObj) {
              var infoPanel = $("<button>").appendTo(sub);
              infoPanel.append(subObj[subKey].name || subKey);
              infoPanel.attr("index", key);
              infoPanel.attr("subIndex", subKey);
              infoPanel.addClass("subtitle");
              infoPanel.click(function(){
                var statKey = $(this).attr("index");
                var subKey = $(this).attr("subIndex");
                var evData = eventData.data;
                evData.str += "+@counters."+statKey+".current."+subKey;

                obj.update();
                layout.coverlay("roll-stat-list");
              });
            }
          }
          else {
            var infoPanel = $("<button>").appendTo(section);
            infoPanel.append(game.templates.character.counters[key].name);
            infoPanel.attr("index", key);
            infoPanel.click(function(){
              var statKey = $(this).attr("index");
              var evData = eventData.data;
              evData.str += "+@c.counters."+statKey;

              obj.update();
              layout.coverlay("roll-stat-list");
            });
          }
        }

        ui_popOut({
          target : $(this),
          id : "roll-stat-list",
          align : "bottom",
        }, content);
      });
    }

    //refDiv.append("<i>Equation Preview</i>");

    var resultPlate = $("<div>").appendTo(equationDiv);
    resultPlate.addClass("flexcolumn");
    resultPlate.css("width", "35%");

    if (eventData.data) {
      sync.render("ui_newDiceResults")(data.eventList[evKey], app, {display : game.templates.display.ui[eventData.ui]}).appendTo(resultPlate);
    }
    else {
      resultPlate.append("<div class='flexmiddle' style='font-size:0.8em'><i>No Results</i></div>");
    }
    if (eventData.advanced) {
      var ui = genInput({
        parent : resultPlate,
        type : "list",
        list : "roll-ui-list",
        placeholder : "Select UI Display",
        disabled: scope.viewOnly,
        index : evKey,
        style : {color : "#333"}
      });
      ui.val(eventData.ui);
      ui.change(function(){
        var eventData = data.eventList[$(this).attr("index")].data;
        eventData.ui = ($(this).val() || "").trim();
        if (eventData.data) {
          eventData.data.ui = eventData.ui;
        }
        obj.update();
      });
      if (scope.viewOnly) {
        ui.css("background-color", "rgb(235,235,228)");
      }
    }
  }

  return div;
});

sync.render("ui_roll", function(obj, app, scope){
  var diceArray = game.templates.dice.pool;
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};

  var div = $("<div>");
  if (!obj) {
    game.locals["fullRoller"] = game.locals["fullRoller"] || sync.obj();
    var diceArray = game.templates.dice.pool;

    game.locals["baseRoller"] = game.locals["baseRoller"] || sync.obj();
    game.locals["baseRoller"].data = game.locals["baseRoller"].data || {
      editable: true,
      custom: true,
      local: true,
      ui : game.templates.dice.ui,
      // default equations
      equations : [
        sync.process("$die="+game.templates.dice.defaults[0]+";"+diceArray[game.templates.dice.defaults[0]].value, null, true),
      ],
    };

    game.locals["statTest"] = game.locals["statTest"] || sync.obj();
    game.locals["statTest"].data = game.locals["statTest"].data || {eventList : []};

    game.locals["skillTest"] = game.locals["skillTest"] || sync.obj();
    game.locals["skillTest"].data = game.locals["skillTest"].data || {eventList : []};

    game.locals["fullRoller"].data = {tabs : [
      {ui : "ui_baseRoller", obj : game.locals["baseRoller"], name : "Dice Pool"},
      {ui : "ui_statRoller", obj : game.locals["statTest"], name : "Stat Test"},
      {ui : "ui_skillRoller", obj : game.locals["skillTest"], name : "Skill Test"},
    ]};

    game.locals["fullRoller"].addApp(app);
    return div;
  }

  div.addClass("flex flexcolumn");

  var data = obj.data;

  var tabBar = genNavBar("background alttext", "flex", "8px");
  tabBar.addClass("flex");
  tabBar.appendTo(div);

  function tabWrap(tabData){
    var icon = "registration-mark";
    if (tabData.ui == "ui_statRoller") {
      icon = "wrench";
    }
    else if (tabData.ui == "ui_skillRoller") {
      icon = "education";
    }
    tabBar.generateTab(tabData.name, icon, function(parent) {
      layout.coverlay("new-tab");
      var newApp = sync.newApp(tabData.ui || "ui_baseRoller").appendTo(parent);
      tabData.obj.addApp(newApp);
      app.attr("_tab", tabData.name);
    });
  }

  for (var i in data.tabs) {
    tabWrap(data.tabs[i]);
  }

  tabBar.generateTab("New Tab", "plus", function(parent, tab){
    var dataList = $("<datalist>").appendTo(parent);
    dataList.attr("id", "tab-list");

    var option = $("<option>").appendTo(dataList);
    option.attr("value", "Dice Roller");

    var option = $("<option>").appendTo(dataList);
    option.attr("value", "Stat Test");

    var option = $("<option>").appendTo(dataList);
    option.attr("value", "Skill Test");

    ui_prompt({
      target : parent,
      id : "new-tab",
      inputs : {
        "Name" : "",
        "Type" : {
          type : "list",
          list : "tab-list",
          placeholder : "(Optional)",
        },
      },
      click : function(ev, inputs){
        if (inputs["Name"].val()) {
          if (inputs["Type"].val() == "Stat Test") {
            var newObj = sync.obj();
            newObj.data = {eventList : []};
            data.tabs.push({ui : "ui_statRoller", obj : newObj, name : inputs["Name"].val()});
          }
          else if (inputs["Type"].val() == "Skill Test") {
            var newObj = sync.obj();
            newObj.data = {eventList : []};
            data.tabs.push({ui : "ui_skillRoller", obj : newObj, name : inputs["Name"].val()});
          }
          else {
            var newObj = sync.obj();
            newObj.data = {
              editable: true,
              custom: true,
              local: true,
              // default equations
              equations : [
                {
                  e : "$die="+game.templates.dice.defaults[0]+";"+diceArray[game.templates.dice.defaults[0]].value,
                }
              ],
            };
            data.tabs.push({ui : "ui_baseRoller", obj : newObj, name : inputs["Name"].val()});
          }
          app.attr("_tab", inputs["Name"].val());
          obj.update();
        }
        else {
          sendAlert({text : "Enter a Name"});
        }
      }
    });
  });

  tabBar.selectTab(app.attr("_tab") || "Dice Pool");

  return div;
});
