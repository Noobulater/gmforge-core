sync.render("ui_math", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly"), update : function(newList){}};

  var div = $("<div>");
  div.addClass("flex scroll-y scroll-x");

  var char;

  var ctx = sync.defaultContext();
  ctx[obj.data._t] = obj.data;
  if (scope.cref) {
    char = getEnt(scope.cref);
    ctx[char.data._t] = duplicate(char.data);
  }

  function buildCalcPlate(index, parent) {
    var calcData = scope.calc[index];
    var calcWrap = $("<div>").appendTo(parent);
    calcWrap.addClass("flexrow flexmiddle");

    var dataList = [];

    var template = {stats : "", info : "", counters : ""};

    for (var tKey in template) {
      var pathKey = tKey;
      if (scope.cref) {
        for (var subKey in char.data[tKey]) {
          pathKey = tKey + "." + subKey;
          if (pathKey != "info.notes" && pathKey != "info.img") {
            dataList.push(pathKey);
          }
        }
      }
      else {
        for (var subKey in obj.data[tKey]) {
          pathKey = tKey + "." + subKey;
          if (pathKey != "info.notes" && pathKey != "info.img") {
            dataList.push(pathKey);
          }
        }
      }
    }


    var condition = genIcon("question-sign").appendTo(calcWrap);
    condition.addClass("subtitle spadding");
    if (calcData.cond) {
      if (sync.eval(calcData.cond, ctx)) {
        condition.addClass("create");
      }
      else {
        condition.addClass("destroy");
      }
    }
    condition.click(function(){
      ui_prompt({
        target : $(this),
        id : "change-condition",
        inputs : {
          "Condition" : $("<textarea>").css("height", "100px").addClass("fit-x subtitle").attr("disabled", scope.viewOnly).text(scope.calc[index].cond),
        },
        click : function(ev, inputs) {
          scope.calc[index].cond = String(inputs["Condition"].val() || "");
          rebuild();
        }
      });
    });

    var targetInput = genInput({
      parent : calcWrap,
      classes : "subtitle line",
      list : dataList,
      style : {"width" : "125px"},
      value : calcData.target,
      viewOnly : scope.viewOnly
    });
    targetInput.change(function(){
      scope.calc[index].target = $(this).val();
      rebuild();
    });

    calcWrap.append("<text class='flexmiddle lrmargin subtitle'>=</text>");

    var targetInput = genInput({
      parent : calcWrap,
      classes : "flex2 subtitle line middle",
      value : calcData.eq,
      viewOnly : scope.viewOnly
    });
    targetInput.change(function(){
      scope.calc[index].eq = $(this).val();
      rebuild();
    });

    calcWrap.append("<text class='flexmiddle lrmargin subtitle'>=</text>");

    var result = $("<div>").appendTo(calcWrap);
    result.addClass("bold flexmiddle subtitle lrpadding");
    result.attr("title", "Resulting Value, written into " + scope.calc[index].target);
    result.text(sync.eval(scope.calc[index].eq, ctx));

    var remove = genIcon("remove").appendTo(calcWrap);
    remove.addClass("destroy subtitle spadding");
    remove.click(function(){
      scope.calc.splice(index, 1);
      rebuild();
    });
  }

  function rebuild() {
    div.empty();

    var buildList = {};
    for (var j in scope.calc) {
      var calcData = scope.calc[j];

      buildList[calcData.cond || ""] = buildList[calcData.cond || ""] || [];
      buildList[calcData.cond || ""].push(j);
    }

    for (var cond in buildList) {
      var category = $("<div>").appendTo(div);
      category.addClass("flexcolumn spadding smooth outline");

      if (cond) {
        var condLabel = $("<text>").appendTo(category);
        condLabel.addClass("subtitle outlinebottom");

        if (sync.eval(cond, ctx)) {
          condLabel.addClass("create");
        }
        else {
          category.addClass("inactive");
          condLabel.addClass("destroy");
        }
        condLabel.text(cond);
      }
      for (var k in buildList[cond]) {
        buildCalcPlate(buildList[cond][k], category);
      }
      if (!scope.viewOnly) {
        var addCalc = $("<div>").appendTo(category);
        addCalc.addClass("subtitle create flexmiddle");
        addCalc.attr("cond", cond);
        addCalc.append(genIcon("plus", "Add Calculation"));
        addCalc.click(function(ev){
          scope.calc.push({target : "", cond : $(this).attr("cond"), eq : ""});
          rebuild();
        });
      }
      category.css("margin-bottom", "0.5em");
    }
    if (!div.children().length) {
      if (!scope.viewOnly) {
        var addCalc = $("<div>").appendTo(div);
        addCalc.addClass("subtitle create flexmiddle");
        addCalc.append(genIcon("plus", "Add Calculation"));
        addCalc.click(function(ev){
          scope.calc.push({target : "", eq : ""});
          rebuild();
        });
      }
    }
  }
  rebuild();

  return div;
});
