sync.render("ui_newDiceResults", function(obj, app, scope) {
  // in this context obj is a list of equations
  var scope = scope || {};

  var div = $("<div>");
  var evData = obj.data;
  var data = evData.data;
  var resContext = {
    diceKeys : duplicate(game.templates.dice.keys),
  };
  resContext["pool"] = data.pool;
  resContext["var"] = data.var;

  var diceDisplay = scope.display || {};

  div.addClass(diceDisplay.classes);
  for (var styKey in diceDisplay.style) {
    div.css(styKey, diceDisplay.results.style[styKey]);
  }

  var rolls = $("<div>").appendTo(div);
  rolls.addClass("flexmiddle flex flexwrap");

  var resultsWrap = $("<div>").appendTo(div);
  resultsWrap.addClass("flexcolumn");
  if (diceDisplay.results) {
    resultsWrap.addClass(diceDisplay.results.classes);

    for (var styKey in diceDisplay.results.style) {
      resultsWrap.css(styKey, diceDisplay.results.style[styKey]);
    }
    if (diceDisplay.results.title) {
      var res = sync.render("ui_processUI")(obj, app, {display : diceDisplay.results.title});
      res.appendTo(resultsWrap);
    }
  }

  var results = $("<div>");
  if (diceDisplay.display) {
    results = sync.render("ui_processUI")(obj, app, {display : diceDisplay.display});
  }
  results.appendTo(resultsWrap);

  if (data.equations.length == 1) {
    var equationContainer = $("<div>").appendTo(rolls);
    equationContainer.addClass("flexmiddle");

    var breakDiv = $("<div>").appendTo(equationContainer);
    breakDiv.addClass("flexcolumn flexmiddle");
    if (sync.reduce(data.equations[0].e, data.equations[0].ctx, true, true) != data.equations[0].r) {
      breakDiv.attr("title", data.equations[0].e + "\n" + sync.reduce(data.equations[0].e, data.equations[0].ctx, true, true));
    }
    else {
      breakDiv.attr("title", data.equations[0].e);
    }

  /*  var breakDown = $("<b>"+data.equations[0].e+"</b>").appendTo(breakDiv);
    breakDown.addClass("subtitle spadding");*/
    var breakDown = $("<text>"+data.equations[0].r+"</text>").appendTo(breakDiv);
    breakDown.addClass("subtitle spadding");
  }

  for (var index in data.equations) {
    var dieContainer = $("<div>").appendTo(rolls);
    dieContainer.addClass("flexmiddle");

    var dice = $("<div>").appendTo(dieContainer);
    dice.addClass("flexcolumn flexmiddle");

    var top = $("<text>");
    top.addClass("subtitle");
    var diceBool = diceDisplay.dice && (!diceDisplay.dice.cond || sync.eval(diceDisplay.dice.cond, data.equations[index].ctx));
    if (diceBool) {
      if (diceDisplay.dice.width) {
        scope.width = diceDisplay.dice.width;
      }
      if (diceDisplay.dice.height) {
        scope.height = diceDisplay.dice.height;
      }
      if (diceDisplay.dice['font-size']) {
        scope['font-size'] = diceDisplay.dice['font-size'];
      }

      if (diceDisplay.dice.top) {
        top.text(sync.eval(diceDisplay.dice.top, data.equations[index].ctx));
      }
    }
    var total = data.equations[index].v;

    var die = sync.render("ui_dice")(data.equations[index], app, {width : (scope.width || "35px"), height : (scope.height || "35px"), "font-size" : (scope["font-size"] || "1.25em"), value : total});
    die.addClass("lrmargin");

    var bottom = $("<text>");
    bottom.addClass("subtitle");
    if (diceBool) {
      bottom.text(sync.eval(diceDisplay.dice.bottom, data.equations[index].ctx));
    }

    var after = $("<div>");
    if (diceBool) {
      for (var key in diceDisplay.dice.results) {
        var resData = diceDisplay.dice.results[key];
        if (resData.cond && sync.eval(resData.cond, data.equations[index].ctx)) {
          die.addClass(resData.classes);
          for (var styKey in resData.style) {
            dice.css(styKey, resData.style[styKey]);
          }
          if (resData.top === "") {
            top.text("");
          }
          else if (resData.top) {
            top.text(sync.eval(resData.top, data.equations[index].ctx));
          }

          if (resData.bottom === "") {
            bottom.text("");
          }
          else if (resData.bottom) {
            bottom.text(sync.eval(resData.bottom, data.equations[index].ctx));
          }
          if (resData.display) {
            after.append(sync.render("ui_processUI")(obj, app, {display : resData.display, context : data.equations[index].ctx}));
          }
          if (resData.results) {
            var res = sync.render("ui_processUI")(obj, app, {display : resData.results, context : data.equations[index].ctx});
            if (res.children().length) {
              res.appendTo(results);
            }
          }
        }
      }
    }

    top.appendTo(dice);
    die.appendTo(dice);
    bottom.appendTo(dice);
    after.appendTo(dice);
  }
  if (diceDisplay.results && diceDisplay.results.display) {
    var res = sync.render("ui_processUI")(obj, app, {display : diceDisplay.results.display, context : resContext});
    res.appendTo(results);
  }
  if (results.children().length == 0) {
    resultsWrap.remove();
  }

  return div;
});

sync.render("ui_dicePooler", function(obj, app, scope){
  scope = scope || {};
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn flex");
  var pool = game.templates.dice.defaults;
  if (app.attr("show") == "true") {
    pool = Object.keys(game.templates.dice.pool);
  }

  var diceList = $("<div>").appendTo(div);
  diceList.addClass("flexrow fit-x");

  var diceWrap = $("<div>").appendTo(diceList);
  diceWrap.addClass("flexcolumn");

  var dicePoolWrap = $("<div>").appendTo(diceList);
  dicePoolWrap.addClass("flexcolumn flex");

  for (var i=0; i<pool.length; i++) {
    var index = pool[i];
    var diceData = game.templates.dice.pool[index];

    var dice = $("<button>").appendTo(diceWrap);
    dice.addClass("flexmiddle bold lrmargin outline smooth");
    dice.attr("index", index);
    dice.attr("title", diceData.value);
    dice.css("background", "none");
    dice.css("background-color", "#333");
    dice.css("border-radius", "4px");
    dice.css("color", "white");
    dice.css("min-width", "4em");
    dice.css("min-height", "30px");

    var label = $("<div>").appendTo(dice);
    label.css("text-align", "center");
    label.css("pointer-events", "none");
    label.text(index);

    dice.append(label);

    for (var key in diceData.display) {
      dice.css(key, diceData.display[key]);
    }

    dice.click(function() {
      data.dice = data.dice || {};
      data.dice[$(this).attr("index")] = data.dice[$(this).attr("index")] || 0;
      data.dice[$(this).attr("index")] = data.dice[$(this).attr("index")] + 1;

      obj.update();
    });


    var diceCountWrap = $("<div>").appendTo(dicePoolWrap);
    diceCountWrap.addClass("flexrow fit-x");
    diceCountWrap.css("min-height", "30px");
    diceCountWrap.css("position", "relative");
    diceCountWrap.css("overflow", "hidden");

    var diceCountWrap = $("<div>").appendTo(diceCountWrap);
    diceCountWrap.addClass("flexrow");
    diceCountWrap.css("min-height", "30px");
    diceCountWrap.css("position", "absolute");

    if (data.dice && data.dice[index]) {
      if (data.dice[index] > 1) {
        var count = $("<div>").appendTo(diceCountWrap);
        count.addClass("flexmiddle subtitle bold");
        count.append("<text>x"+data.dice[index]+"</text>");
      }
      for (var k=0; k<data.dice[index]; k++) {
        var dice = sync.render("ui_dice")({ctx : {die : index}}, app, {width : "25px", height : "25px", value : ""}).appendTo(diceCountWrap);
        dice.addClass("flexmiddle bold smargin hover2");
        dice.attr("index", index);
        dice.attr("title", index);
        dice.click(function(){
          data.dice[$(this).attr("index")] -= 1;
          if (data.dice[$(this).attr("index")] <= 0) {
            delete data.dice[$(this).attr("index")];
          }
          obj.update();
        });
      }
    }
    else {
      dice.css("opacity", "0.5");
    }
  }

  return div;
});

sync.render("ui_diceEffect", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var rowWrap = $("<div>").appendTo(div);
  rowWrap.addClass("flexrow flex");

  var actionSelect = $("<div>").appendTo(rowWrap);
  actionSelect.addClass("flexcolumn");

  for (var i in effects) {
    var effectData = effects[i];

    var button = $("<button>").appendTo(actionSelect);
    button.addClass("highlight alttext");
    button.append(effectData.name);
  }

  var targetDiv = $("<div>").appendTo(rowWrap);
  targetDiv.addClass("flexcolumn flex");
  targetDiv.css("position", "relative");
  targetDiv.css("overflow-y", "auto");

  var entList = $("<div>").appendTo(targetDiv);
  entList.addClass("flexcolumn fit-x outline smooth");
  entList.css("position", "absolute");

  for (var id in game.entities.data) {
    var ent = game.entities.data[id];
    if (ent && ent.data._t == "c") {
      var entWrap = $("<div>").appendTo(entList);
      entWrap.addClass("flexcolumn outlinebottom");
      entWrap.attr("index", id);

      var content = sync.render("ui_ent")(ent, entWrap, {
        height : "40px",
        click : function(ev, ui, ent){
          obj.data.targets[ent.id()] = !obj.data.targets[ent.id()];
          obj.update();
        }
      }).appendTo(entWrap);
      content.removeClass("outline");

      if (obj.data.targets[id]) {
        entWrap.addClass("highlight alttext");
        if (effects[0].calc.length) {
          var effectsList = $("<div>").appendTo(entWrap);
          effectsList.addClass("padding background");

          var ctx = {};
          if (game.events.data[obj.data.evID].data) {
            ctx["pool"] = duplicate(game.events.data[obj.data.evID].data.data.pool);
            ctx["loc"] = duplicate(game.events.data[obj.data.evID].data.data.loc);
          }
          ctx[ent.data._t] = duplicate(ent.data);

          for (var i in effects[0].calc) {
            var calcData = effects[0].calc[i];

            var calcPlate = $("<div>").appendTo(effectsList);
            calcPlate.addClass("flexrow flexbetween fit-x");

            var targetPlate = $("<div>").appendTo(calcPlate);
            targetPlate.addClass("flexmiddle");

            var targetName = calcData.target;
            if (targetName.match("\.modifiers")) {
              targetName = targetName.substring(0, targetName.match("\.modifiers").index);
            }
            else {
              calcPlate.append("<b class='lrpadding'> = </b>");
            }

            var target = sync.traverse(ent.data, targetName);
            if (target instanceof Object) {
              targetPlate.append(target.name);
            }
            else {
              targetPlate.append(calcData.target);
            }

            var eqPlate = $("<div>").appendTo(calcPlate);
            eqPlate.addClass("flexmiddle flex lrpadding");

            if (calcData.cond == null || sync.eval(calcData.cond, ctx)) {
              var val = sync.eval(calcData.eq, ctx);

              if (isNaN(val)) {
                eqPlate.append(val);
              }
              else {
                if (val > 0 && calcData.target.match("\.modifiers")) {
                  eqPlate.append("+"+val);
                }
                else {
                  eqPlate.append(val);
                }
              }
            }
            else {
              eqPlate.append("<i>condition not met</i>");
            }
          }
        }
      }
    }
  }

  var equationDiv = $("<div>").appendTo(div);
  equationDiv.addClass("flexcolumn");

  var equation = genInput({
    parent : equationDiv,
    value : "@:armor(human_head)-@total",
  });

  return div;
});

sync.render("ui_hotRolls", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexrow flex");

  sync.render("ui_playerToken")(obj, app, {userID : getCookie("UserID"), centered : true, height : "50px"}).appendTo(div);

  var char = getPlayerCharacter(getCookie("UserID"));
  if (char && char.data) {
    sync.render("ui_hotActions")(char, app, scope).appendTo(div);
    char.listen["actionUpdate"] = function() {
      if (getPlayerCharacter(getCookie("UserID")) && getPlayerCharacter(getCookie("UserID")).id() == char.id()) {
        obj.update();
        return true;
      }
    }
  }

  return div;
});
