sync.render("ui_charGenerator", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  game.locals["newCharacter-"+app.attr("id")] = sync.obj("newCharacter-"+app.attr("id"));
  game.locals["newCharacter-"+app.attr("id")].data = {preview:{}, text:{}, options:{}, override:{}};

  var wrap = $("<div>").appendTo(div);
  wrap.addClass("flex");
  wrap.css("position", "relative");
  wrap.css("overflow", "auto");

  var newApp = sync.newApp("ui_template").appendTo(wrap);
  game.locals["newCharacter-"+app.attr("id")].addApp(newApp);

  var buttonBar = $("<div>").appendTo(div);
  buttonBar.addClass("fit-x flexrow");

  var button = $("<button>").appendTo(buttonBar);
  button.addClass("flex flexmiddle alttext background");
  button.append("Input Custom Generator");
  button.click(function(){
    var imgList = sync.render("ui_filePicker")(obj, app, {
      filter : "gen",
      change : function(ev, ui, value){
        sendAlert({text : "Loading generator " + value});

        $.ajax({
          url: value,
          error : function (data) {
            console.log(data);
          },
          dataType : "text",
          success: function (data){
            game.templates.generation = "\n"+data;
            _cachegen = null;
            game.locals["newCharacter-"+app.attr("id")].update();
            sendAlert({text : "Loaded Successfully"});
          }
        });
        layout.coverlay("template-picker");
      }
    });

    var pop = ui_popOut({
      target : $(this),
      id : "template-picker",
      align : "top",
      prompt : true,
      style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
    }, imgList);
    pop.resizable();
  });

  var button = $("<button>").appendTo(buttonBar);
  button.addClass("flex2 flexmiddle alttext highlight");
  button.css("font-size", "1.5em");
  button.append("Create this character!");
  button.click(function(){
    createCharacter(game.locals["newCharacter-"+app.attr("id")].data.override);
  });

  return div;
});


sync.render("ui_charImporter", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  game.locals["newCharacter-"+app.attr("id")] = sync.obj("newCharacter-"+app.attr("id"));
  game.locals["newCharacter-"+app.attr("id")].data = {preview:{}, text:{}, options:{}, override:{}};

  var wrap = $("<div>").appendTo(div);
  wrap.addClass("flex flexcolumn");
  wrap.css("position", "relative");
  wrap.css("overflow", "auto");

  var newApp = sync.newApp("ui_import").appendTo(wrap);
  newApp.attr("XML", "true");
  game.locals["newCharacter-"+app.attr("id")].addApp(newApp);

  var button = $("<button>").appendTo(div);
  button.addClass("fit-x flexmiddle alttext highlight");
  button.css("font-size", "1.5em");
  button.append("Create this character!");
  button.click(function(){
    createCharacter(game.locals["newCharacter-"+app.attr("id")].data.override, true);
  });

  return div;
});
