sync.render("ui_link", function(obj, app, scope){
  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var div = genIcon(sync.eval(scope.icon, scope.context || {c : obj.data}), sync.eval(scope.name, scope.context || {c : obj.data}));
  if (scope.classes) {
    div.addClass(scope.classes);
  }
  if (scope.style) {
    for (var i in scope.style) {
      div.css(i, scope.style[i]);
    }
  }
  if (scope.click) {
    div.click(function(){
      if ((scope.cond == null || sync.eval(scope.cond, scope.context))) {
        var content = sync.newApp(scope.click);
        content.attr("lookup", scope.lookup);
        for (var i in scope.attr) {
          content.attr(i, scope.attr[i]);
        }
        obj.addApp(content);

        var pop = ui_popOut({
          target : $(this),
          id : app.attr("id")+"-"+scope.lookup+"-"+scope.click,
          style : {width : scope.width, height : scope.height}
        }, content);
        pop.resizable();
      }
    });
  }
  return div;
});
