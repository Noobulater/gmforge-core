sync.render("ui_maxbox", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", lookup : app.attr("lookup")};
  var div = $("<div>");

  if (scope.title) {
    var title = $("<div>").appendTo(div);
    title.addClass("flexmiddle");
    title.append("<b>"+scope.title+"</b>");
  }
  var data = obj.data;
  var value = sync.traverse(obj.data, scope.lookup);

  var counter = $("<div>").appendTo(div);
  counter.addClass("middle outline smooth spadding");
  counter.css("background-color", "white");
  counter.append("<div><b>" + value.name +"</b></div>");

  var counterDiv = $("<div>").appendTo(counter);
  counterDiv.addClass("flexaround");

  var curDiv = $("<div>").appendTo(counterDiv);
  curDiv.append("<div style='font-size: 0.8em'>Cur</div>");
  var input = genInput({
    parent : curDiv,
    min : value.min || 0,
    value : value,
    disabled : scope.viewOnly,
    style : {"width" : "30px", "text-align" : "center"}
  });
  input.change(function(){
    value.max = Math.max(Number($(this).val()), value.max);
    sync.val(value, Number($(this).val()));
    obj.sync("updateAsset");
  });

  var maxDiv = $("<div>").appendTo(counterDiv);
  maxDiv.append("<div style='font-size: 0.8em'>Max</div>");
  var maxInput = genInput({
    parent : maxDiv,
    min : 0,
    value : value.max,
    disabled : scope.viewOnly,
    style : {"width" : "30px", "text-align" : "center"}
  });
  maxInput.change(function(){
    value.max = Number($(this).val());
    obj.sync("updateAsset");
  });

  return div;
});
