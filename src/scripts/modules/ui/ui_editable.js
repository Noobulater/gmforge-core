sync.render("ui_editable", function(obj, app, scope){
  scope = scope || {
    viewOnly : app.attr("viewOnly") == "true",
    lookup : app.attr("lookup"),
    increment : Number(app.attr("increment")),
    bar : app.attr("bar") == "true",
  };

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var valueBar = $("<div>");

  if (value && (!obj.data._s || hasSecurity(getCookie("UserID"), "Visible", obj.data))) {
    valueBar.addClass("flexrow flexmiddle");

    var infoPlate = $("<div>").appendTo(valueBar);
    infoPlate.addClass("flexmiddle");
    if (scope.viewOnly || !scope.increment) {
      infoPlate.addClass("lrpadding");
    }

    if (!scope.viewOnly && (!obj.data._s || hasSecurity(getCookie("UserID"), "Rights", obj.data)) && scope.increment) {
      var remove = genIcon("refresh").appendTo(infoPlate);
      remove.addClass("lrpadding");
      remove.click(function(ev){
        value.modifiers = {};
        obj.sync("updateAsset");
        ev.stopPropagation();
      });

      var remove = genIcon("minus").appendTo(infoPlate);
      remove.addClass("lrpadding");
      remove.click(function(ev){
        sync.val(value, Number(sync.val(value))-scope.increment);
        obj.sync("updateAsset");
        ev.stopPropagation();
      });
    }

    var woundLabel = $("<b>").appendTo(infoPlate);
    woundLabel.css("white-space", "nowrap");
    if (value.max) {
      woundLabel.text(value.name+":"+sync.val(value)+"/"+value.max);
    }
    else {
      woundLabel.text(value.name+":"+sync.val(value));
    }
    woundLabel.addClass("flexmiddle");
    if (!scope.viewOnly && scope.ui) {
      woundLabel.addClass("hover2");
      woundLabel.css("pointer-events", "auto");
      woundLabel.css("text-decoration", "underline");

      woundLabel.click(function(){
        var newApp = sync.newApp(scope.ui);
        newApp.attr("lookup", scope.lookup);
        newApp.attr("viewOnly", scope.viewOnly);

        obj.addApp(newApp);
        ui_popOut({
          target : $(this),
          id : "assign",
        }, newApp);
      });
    }

    if (!scope.viewOnly && (!obj.data._s || hasSecurity(getCookie("UserID"), "Rights", obj.data)) && scope.increment) {
      var add = genIcon("plus").appendTo(infoPlate);
      add.addClass("lrpadding");
      add.click(function(ev){
        sync.val(value, Number(sync.val(value))+scope.increment);
        obj.sync("updateAsset");
        ev.stopPropagation();
      });
    }

    if (scope.bar) {
      var barWrap = $("<div>").appendTo(valueBar);
      barWrap.addClass("flex");

      sync.render("ui_progressBar")(obj, app, scope).appendTo(barWrap);
    }
  }
  return valueBar;
});

sync.render("ui_diceVisual", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass(scope.classes);

  var ctx = sync.defaultContext();
  ctx[obj.data._t] = duplicate(obj.data);

  var query = sync.executeQuery(sync.eval(duplicate(scope.eq), ctx), ctx, !scope.roll);
  for (var index in query.equations) {
    sync.render("ui_dice")(query.equations[index], app, {width : sync.eval(scope.diceSize, ctx), height : sync.eval(scope.diceSize, ctx)}).appendTo(div);
  }

  return div;
});
