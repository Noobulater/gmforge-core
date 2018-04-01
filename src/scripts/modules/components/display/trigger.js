sync.render("ui_triggerBuilder", function(obj, app, scope){
  scope = scope || {
    board : app.attr("board"),
    layer : app.attr("layer"),
    piece : app.attr("piece"),
  };

  var board = getEnt(scope.board);
  var pieceData = board.data.layers[scope.layer].p[scope.piece];

  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn");

  var row = $("<div>").appendTo(div);
  row.addClass("flexrow flexaround");

  var collDiv = $("<div>").appendTo(row);
  collDiv.addClass("flexcolumn flex spadding");
  /*collDiv.append("<b>Trigger</b>");

  collDiv.append("<b class='spadding'>Fire Condition</b>");

  var condition = genInput({
    parent : collDiv,
    placeholder : "Condition (Optional, Macro)",
    value : data.c,
    style : {"width" : "100%"}
  });
  condition.change(function(){
    data.c = $(this).val();
    obj.update();
  });*/

  var effectDiv = $("<div>").appendTo(div);
  effectDiv.addClass("flexcolumn");

  var effectTgt = $("<div>").appendTo(effectDiv);
  effectTgt.addClass("flexrow flex spadding");

  effectTgt.append("<b>Trigger Type</b>");

  var effect = $("<select>").appendTo(effectTgt);
  effect.addClass("smooth lrmargin flex");
  //effect.append("<option value='0'>Resolve Macro</option>");
  effect.append("<option value=1>Hide Layer</option>");
  effect.append("<option value=2>Reveal Layer</option>");
  effect.append("<option value=3>Toggle Layer</option>");
  effect.append("<option value=4>Roll Dice</option>");
  effect.change(function(){
    data.e = $(this).val();
    if (data.e) {
      if (data.e >= 4) {
        obj.data = {e : data.e, msg : "Activated Trap!", data : game.templates.dice.defaults[0]};
      }
      else {
        data = {target : "layers.0.h", eq : "0"};
      }
    }
    obj.update();
  });
  effect.children().each(function(){
    if ($(this).attr("value") == data.e) {
      $(this).attr("selected", true);
    }
  });

  var targetDiv = $("<div>").appendTo(effectDiv);
  targetDiv.addClass("flexcolumn");

  if (data.e == 1) {
    targetDiv.addClass("flex spadding");
    targetDiv.append("<b class='subtitle'>Target Layer</b>");

    var layers = $("<select>").appendTo(targetDiv);
    layers.addClass("smooth");
    for (var lid=0; lid<board.data.layers.length; lid++) {
      layers.append("<option value='"+lid+"'>"+board.data.layers[lid].n+"</option>");
    }

    layers.children().each(function(){
      data.target = data.target || "layers.0.h";
      if ($(this).attr("value") == data.target.split(".")[1]) {
        $(this).attr("selected", true);
      }
    });
    layers.change(function(){
      obj.data = {target : "layers."+$(this).val()+".h", eq : "1", e : 1};
      obj.update();
    });
  }
  else if (data.e == 2) {
    targetDiv.addClass("flex spadding");
    targetDiv.append("<b class='subtitle'>Target Layer</b>");

    var layers = $("<select>").appendTo(targetDiv);
    layers.addClass("smooth");
    for (var lid=0; lid<board.data.layers.length; lid++) {
      layers.append("<option value='"+lid+"'>"+board.data.layers[lid].n+"</option>");
    }
    layers.children().each(function(){
      if ($(this).attr("value") == data.target.split(".")[1]) {
        $(this).attr("selected", true);
      }
    });
    layers.change(function(){
      obj.data = {target : "layers."+$(this).val()+".h", eq : "0", e : 2};
      obj.update();
    });
  }
  else if (data.e == 3) {
    targetDiv.addClass("flex spadding");
    targetDiv.append("<b class='subtitle'>Target Layer</b>");

    var layers = $("<select>").appendTo(targetDiv);
    layers.addClass("smooth");

    for (var lid=0; lid<board.data.layers.length; lid++) {
      layers.append("<option value='"+lid+"'>"+board.data.layers[lid].n+"</option>");
    }
    layers.children().each(function(){
      if ($(this).attr("value") == data.target.split(".")[1]) {
        $(this).attr("selected", true);
      }
    });
    layers.change(function(){
      obj.data = {target : "layers."+$(this).val()+".h", eq : "(@b.layers."+$(this).val()+".h == 1)?(0):(1)", e : 3};
      obj.update();
    });
  }
  else if (data.e == 4) {
    targetDiv.addClass("flex spadding");

    var flavor = genInput({
      parent : targetDiv,
      classes : "line flex",
      value : obj.data.msg,
      placeholder : "Flavor Text (Optional)",
    });
    flavor.change(function(){
      obj.data.msg = $(this).val();
    });

    targetDiv.append("<b class='subtitle smargin'>Equation to Roll</b>");

    var equation = $("<textarea>").appendTo(targetDiv);
    equation.addClass("smooth");
    equation.attr("placeholder", "Enter a macro equation here");
    equation.text(obj.data.data || "");
    equation.change(function(){
      obj.data.data = $(this).val();
    });

    targetDiv.append("<b class='subtitle smargin'>Extra Options</b>");

    var optionsBar = $("<div>").appendTo(targetDiv);
    optionsBar.addClass("flexrow flexaround flexwrap fit-x subtitle");

    var gmOnly = $("<button>").appendTo(optionsBar);
    gmOnly.addClass("flexmiddle alttext");
    if (obj.data.p && obj.data.p.default) {
      gmOnly.addClass("highlight");
    }
    else {
      gmOnly.addClass("background");
    }
    gmOnly.text("GM Only?");
    gmOnly.click(function(){
      obj.data.p = obj.data.p || {};
      if (obj.data.p.default) {
        delete obj.data.p;
      }
      else {
        obj.data.p.default = "@:gm()";
      }
      obj.update();
    });

    var dataList = $("<datalist>").appendTo(optionsBar);
    dataList.attr("id", "dice-display-list");

    for (var key in game.templates.display.ui) {
      var option = $("<option>").appendTo(dataList);
      option.attr("value", key);
    }

    var ui = genInput({
      parent : optionsBar,
      classes : "line lrmargin",
      type : "list",
      list : "dice-display-list",
      value : obj.data.ui,
      placeholder : "Dice Display (Optional)",
    });
    ui.val(obj.data.ui);
    ui.change(function(){
      obj.data.ui = $(this).val();
    });

    var cond = genInput({
      parent : optionsBar,
      classes : "line flex lrmargin",
      value : obj.data.cond,
      placeholder : "Condition Macro",
    });
    cond.val(obj.data.cond);
    cond.change(function(){
      obj.data.cond = $(this).val();
    });
  }
  else {
    var effect = $("<div>").appendTo(div);

    var dataList = $("<datalist>").appendTo(effect);
    dataList.attr("id", "trigger-calc-target");
    var template = {stats : "", info : "", counters : ""};
    for (var key in template) {
      var path = key;
      for (var subKey in game.templates.character[key]) {
        path = key + "." + subKey;
        var option = $("<option>").appendTo(dataList);
        option.attr("value", path);
      }
    }

    var target = genInput({
      parent : effect,
      type : "list",
      list : "trigger-calc-target",
      placeholder : "Target",
      value : data.target,
    });
    target.change(function(){
      obj.data.target = $(this).val();
      obj.update();
    });

    var effectMacro = genInput({
      parent : effect,
      placeholder : "Effect (Optional, Macro)",
      value : data.eq,
    });
    effectMacro.change(function(){
      obj.data.eq = $(this).val();
      obj.update();
    });
  }

  return div;
});
