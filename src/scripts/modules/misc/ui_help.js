sync.render("ui_renderHelp", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  div.load("https://files.gmforge.io/file/help/main.html", function( response, status, xhr ) {
    if (status == "error") {
      var reload = $("<button>").appendTo(div);
      reload.append("Unable to load docs");
    }
  });

  return div;
});
