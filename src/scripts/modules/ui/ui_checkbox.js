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
  scope.cond = scope.cond || "@_value_ == @_checked_";
  if (scope.cond && sync.eval(scope.cond, {"c" : duplicate(data), _value_ : value, _checked_ : scope.checked})) {
    checkbox.prop("checked", true);
  }
  scope.saveInto = scope.saveInto || scope.lookup;
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

  if (scope.text) {
    div.append("<text>"+scope.text+"</text>");
  }

  return div;
});
