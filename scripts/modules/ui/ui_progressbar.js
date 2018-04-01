sync.render("ui_progressBar", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"};

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var statBar = $("<div>");
  statBar.addClass("fit-x");

  var valueBar = $("<div>").appendTo(statBar);
  valueBar.addClass("flexrow flexmiddle");
  var ctx;
  if (scope.percentage || scope.max || scope.col) {
    ctx = sync.defaultContext();
    ctx["c"] = obj.data;
  }
  if (scope.percentage && scope.max) {
    value = {current : sync.eval(scope.percentage, ctx), max : sync.eval(scope.max, ctx)};
  }

  if (value.max) {
    var progress = $("<div>").appendTo(valueBar);
    progress.addClass("outline flex");
    progress.css("position", "relative");
    progress.css("border-radius", "2px");
    progress.css("height", scope.height || "8px");
    progress.css("min-width", "20px");
    var percentage = Number(sync.val(value))/Number(value.max || sync.val(value));
    var col = "rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)";
    if (scope.col) {
      ctx["percentage"] = percentage;
      col = sync.eval(scope.col, ctx);
    }
    progress.css("background-color", col);

    var bar = $("<div>").appendTo(progress);
    if (percentage != 1) {
      bar.addClass("outline");
    }
    bar.css("position", "absolute");
    bar.css("right", 0);
    bar.css("width", 100-Math.ceil(sync.val(value)/value.max * 105)+"%");
    bar.css("background-color", "grey");
    bar.css("height", "100%");
  }

  return statBar;
});
