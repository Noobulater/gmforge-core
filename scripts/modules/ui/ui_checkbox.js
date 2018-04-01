sync.render("ui_checkbox", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexmiddle");

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);
  
  scope.style = scope.style || {};
  scope.style["margin-top"] = "0px";

  var checkbox = genInput({
    parent : div,
    disabled : scope.viewOnly,
    type : "checkbox",
    style : scope.style
  });
  if (scope.cond && sync.eval(scope.cond, {"c" : duplicate(data)})) {
    checkbox.prop("checked", true);
  }
  if (scope.saveInto) {
    checkbox.change(function(){
      var ctx = sync.defaultContext();
      ctx["c"] = duplicate(data);
      var val = sync.traverse(obj.data, scope.saveInto);
      if ($(this).prop("checked") == true) {
        if (val instanceof Object) {
          sync.rawVal(val, sync.eval(scope.checked, ctx));
        }
        else {
          sync.traverse(obj.data, scope.saveInto, sync.eval(scope.checked, ctx));
        }
      }
      else {
        if (val instanceof Object) {
          sync.val(val, sync.eval(scope.unchecked, ctx));
        }
        else {
          sync.traverse(obj.data, scope.saveInto, sync.eval(scope.unchecked, ctx));
        }
      }
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
  }

  return div;
});
