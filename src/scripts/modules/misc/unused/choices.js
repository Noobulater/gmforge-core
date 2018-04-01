sync.render("ui_choices", function(obj, app, scope){
  var div = $("<div>");
  if (obj && obj.data) {
    var data = obj.data;
    div.addClass("fluid");

    for (var index in data.choices) {
      var button = $("<button>").appendTo(div);
      button.css("width", 100/data.choices.length+"%");
      button.attr("ref", index);
      button.text(data.choices[index]);
      button.click(function() {
        runCommand("performChoice", {id : obj.id(), data : {choice : $(this).attr("ref")}});

        layout.coverlay(app.parent().parent(), 500);
      });
    }
  }
  return div
});
