sync.render("ui_crits", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  var data = obj.data;

  var title = $("<div>").appendTo(div);
  title.append("<b>Critical Damage</b>");
  if (!scope.viewOnly) {
    var icon = genIcon("plus").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      ui_prompt({
        target : $(this),
        id : "add-crit",
        inputs : {
          "Critical" : ""
        },
        click : function(ev, inputs) {
          data.crits.push(sync.newValue("Crit", inputs["Critical"].val()));
          obj.sync("updateAsset");
          layout.coverlay("add-crit");
        }
      });
    });
  }
  for (var k in data.crits) {
    var crit = genIcon("", sync.val(data.crits[k])).appendTo(div);
    crit.css("background-color", "white");
    crit.attr("index", k);
    crit.addClass("subtitle");
    crit.click(function(){
      data.crits.splice($(this).attr("index"), 1);
      obj.sync("updateAsset");
    });
  }
  return div;
});
