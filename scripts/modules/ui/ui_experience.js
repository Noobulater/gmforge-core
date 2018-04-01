sync.render("ui_expCounter", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var counter = $("<div>").appendTo(div);
  counter.addClass("middle outline spadding smooth");
  counter.css("background-color", "white");
  counter.append("<div><b>" + value.name +"</b></div>");

  var counterDiv = $("<div>").appendTo(counter);
  counterDiv.addClass("subtitle");

  if (scope.level) {
    var level = sync.traverse(obj.data, scope.level) || scope.level;
    var levelDiv = $("<div>").appendTo(counterDiv);
    levelDiv.addClass("flexaround flexwrap");
    if (!scope.viewOnly) {
      var levelMinus = genIcon("minus").appendTo(levelDiv);
      levelMinus.click(function(){
        sync.val(level, sync.val(level) - 1);
        obj.sync("updateAsset");
      });
    }
    var levelVal = $("<b>").appendTo(levelDiv);
    levelVal.append((level.name || "") + " " + sync.val(level));
    if (!scope.viewOnly) {
      var levelPlus = genIcon("plus").appendTo(levelDiv);
      levelPlus.click(function(){
        sync.val(level, sync.val(level) + 1);
        obj.sync("updateAsset");
      });
    }
  }

  counterDiv.append("<div>Cur : "+sync.modified(value, (sync.rawVal(value) * -1))+"</div>");
  counterDiv.append("<div>Total : "+sync.modified(value, 0)+"</div>");

  var expBar = $("<div>").appendTo(counterDiv);
  expBar.addClass("flexaround");
  if (!scope.viewOnly) {
    var reduce = genIcon("minus");
    reduce.appendTo(expBar);
    reduce.click(function(){
      var popOut = ui_prompt({
        target : $(this),
        id : "exp-reduce",
        inputs : {
          "Reduce Experience" : {
            value : 5,
            type : "number",
            min : 0,
            step : 5,
          },
        },
        click : function(ev, inputs) {
          sync.rawVal(value, sync.rawVal(value)+parseInt(inputs["Reduce Experience"].val()));
          obj.sync("updateAsset");
        }
      });
    });

    var edit = genIcon("pencil");
    edit.attr("title", "Advanced");
    edit.appendTo(expBar);
    edit.click(function(){
      var content = sync.newApp("ui_modifiers");
      content.attr("viewOnly", scope.viewOnly);
      content.attr("lookup", "counters.exp");
      content.attr("text", "Spent " + value.name);
      content.attr("modText", "Earned Experience");
      content.attr("total", "R@counters.exp-M@counters.exp");
      obj.addApp(content);

      ui_popOut({
        target : $(this),
        align : "top",
        id : "modify-exp"
      }, content);
    });

    var add = genIcon("plus");
    add.appendTo(expBar);
    add.click(function(){
      var popOut = ui_prompt({
        target : $(this),
        id : "exp-add",
        inputs : {
          "Reason" : {
            placeholder : "Why did you add this?"
          },
          "Add Experience" : {
            value : 5,
            type : "number",
            min : 0,
            step : 5,
          },
        },
        click : function(ev, inputs) {
          if (inputs["Reason"].val()) {
            sync.modifier(value, inputs["Reason"].val(), sync.modifier(value, inputs["Reason"].val()) + parseInt(inputs["Add Experience"].val()));
          }
          else {
            sync.modifier(value, "added", sync.modifier(value, "added") + parseInt(inputs["Add Experience"].val()));
          }
          obj.sync("updateAsset");
        }
      });
    });
  }

  return div;
});
