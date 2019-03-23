sync.render("ui_JSON", function(obj, app, scope) {
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    lookup : app.attr("lookup"),
    textEdit : app.attr("textEdit") == "true",
    hideConfirm : app.attr("hideConfirm") == "true",
    closeTarget : app.attr("closeTarget"),
    width : app.attr("width"),
    height : app.attr("height")
  };

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var data = obj.data;
  var value = obj.data;
  if (scope.lookup) {
    value = sync.traverse(data, scope.lookup || "");
  }
  var errorFeedback = $("<div>").appendTo(div);
  errorFeedback.addClass("flexmiddle destroy");

  var inputTest = $("<textarea>").appendTo(div);
  inputTest.addClass("flex subtitle");
  inputTest.attr("id", app.attr("id") + "-json-edit");
  if (scope.viewOnly) {
    inputTest.attr("disabled", true);
  }
  inputTest.css("min-width", scope.width || "300px");
  inputTest.css("min-height", scope.height || "300px");
  inputTest.text(JSON.stringify(value, null, 2));
  inputTest.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  inputTest.attr("_lastScrollLeft", app.attr("_lastScrollLeft"));
  inputTest.scroll(function(){
    app.attr("_lastScrollTop", $(this).scrollTop());
    app.attr("_lastScrollLeft", $(this).scrollLeft());
  });
  inputTest.change(function(){
    errorFeedback.empty();
    try {
      var newData = eval("var variable = "+$(this).val()+"; variable");
      if (scope.lookup) {
        sync.traverse(obj.data, scope.lookup || "", newData);
      }
      else {
        obj.data = newData;
      }
      obj.update();
      if (app.attr("closeTarget")) {
        layout.coverlay(app.attr("closeTarget"));
      }
    }
    catch(err) {
      errorFeedback.append("<b title='"+err+"'>Error Parsing Data</b>");
    }
  });
  if (!scope.hideConfirm) {
    var button = $("<button>").appendTo(div);
    button.append("Confirm");
    
    setTimeout(function(){
      var editor = ace.edit(app.attr("id") + "-json-edit");
      editor.setTheme("ace/theme/monokai");
      div.css("min-width", scope.width || "300px");
      div.css("min-height", scope.height || "300px");
      $(editor.container).css("margin","0");
      $(editor.container).addClass("flex");
      editor.setOptions({
        autoScrollEditorIntoView: true
      });
      $(editor.container).hover(function(){
        editor.resize();
      });
      editor.session.setMode("ace/mode/" + (app.attr("lang") || "json"));
      button.click(function(){
        errorFeedback.empty();
        try {
          var newData = eval("var variable = "+editor.getValue()+"; variable");
          if (scope.lookup) {
            sync.traverse(obj.data, scope.lookup || "", newData);
          }
          else {
            obj.data = newData;
          }
          obj.update();
          if (app.attr("closeTarget")) {
            layout.coverlay(app.attr("closeTarget"));
          }
        }
        catch(err) {
          errorFeedback.append("<b title='"+err+"'>Error Parsing Data</b>");
        }
      });
    }, 100);
  }
  return div;
});

sync.render("ui_diceDisplayBuilder", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", display : app.attr("diceKey")};
  var div = $("<div>");
  div.addClass("flexrow flex");

  var colWrap = $("<div>").appendTo(div);
  colWrap.addClass("flexcolumn flex");

  var col = $("<div>").appendTo(colWrap);
  col.addClass("flexrow flexwrap padding");

  for (var i in obj.data.templates.display.ui) {
    var button = $("<button>").appendTo(col);
    if (scope.display == i) {
      button.addClass("highlight alttext");
    }
    button.attr("key", i);
    button.append(i);
    button.click(function(){
      app.attr("diceKey", $(this).attr("key"));
      obj.update();
    });
  }

  var plus = $("<button>").appendTo(col);
  plus.addClass("background alttext");
  plus.append("New Display");
  plus.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Identifier" : {placeholder : "The unique identifier"}
      },
      click : function(ev, inputs) {
        if (inputs["Identifier"].val()) {
          obj.data.templates.display.ui[inputs["Identifier"].val()] = {
            classes : "",
            style : {},
            dice : {},
            displays : {},
            results : {},
          };
          obj.update();
        }
      }
    });
  });

  if (scope.display) {
    app.attr("lookup", "templates.display.ui."+scope.display);

    var select = sync.render("ui_JSON")(obj, app, null).appendTo(colWrap);
    select.addClass("flex padding");

    var dataRollWrap = $("<div>").appendTo(div);
    dataRollWrap.addClass("flexcolumn flex2");
    dataRollWrap.append("<b class='underline'>Test your Display</b>");

    var dataDiv = $("<div>").appendTo(dataRollWrap);
    dataDiv.addClass("flexrow flex padding");

    var flavorText = $("<textarea>").appendTo(dataDiv);
    flavorText.addClass("flex");
    flavorText.val(app.attr("flavor") || "");
    flavorText.attr("placeholder", "Flavor Text");
    flavorText.change(function(){
      app.attr("flavor", $(this).val());
      obj.update();
    });

    var eqText = $("<textarea>").appendTo(dataDiv);
    eqText.addClass("flex");
    eqText.val(app.attr("equation") || "d20");
    eqText.attr("placeholder", "Equation");
    eqText.change(function(){
      app.attr("equation", $(this).val());
      obj.update();
    });

    var dataRoll = $("<div>").appendTo(dataRollWrap);
    dataRoll.addClass("flexcolumn flexmiddle flex padding");

    var wrapObj = {eventData : sync.executeQuery((app.attr("equation") || "d20"), sync.defaultContext()), flavor : "Flavor Text"};

    dataRoll.append("<b class='underline'>Result</b>");

    dataRoll.append("<b>"+(sync.eval(app.attr("flavor"), sync.defaultContext()) || "")+"</b>");

    var display = sync.render("ui_newDiceResults")(wrapObj, app, {display : obj.data.templates.display.ui[scope.display]}).appendTo(dataRoll);
    display.css("width", "350px");
    display.css("min-height", "200px");

    dataRoll.append("<b class='flex'></b>");
  }

  return div;
});

sync.render("ui_homebrew", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  div.css("padding-top", "2em");
  if (!game.locals["homebrew"]) {
    game.locals["homebrew"] = game.locals["homebrew"] || sync.obj();
    game.locals["homebrew"].data = game.locals["homebrew"].data || {
      templates : duplicate(game.templates),
      previewChar : sync.dummyObj(),
      previewItem : sync.dummyObj(),
      previewPage : sync.dummyObj(),
    };

    game.locals["homebrew"].data.templates.info = game.locals["homebrew"].data.templates.info || duplicate(game.templates.page.info);

    game.locals["homebrew"].data.previewInfo = sync.obj();

    game.locals["homebrew"].data.templates.info = game.locals["homebrew"].data.templates.info || {};
    game.locals["homebrew"].data.templates.info.name = game.locals["homebrew"].data.templates.info.name || sync.newValue("Name");
    game.locals["homebrew"].data.templates.info.img = game.locals["homebrew"].data.templates.info.img || sync.newValue("Image");
    game.locals["homebrew"].data.templates.info.notes = game.locals["homebrew"].data.templates.info.notes || sync.newValue("Notes");

    game.locals["homebrew"].data.previewInfo.data = {_t : "p", info : duplicate(game.locals["homebrew"].data.templates.info)};
    game.locals["homebrew"].data.previewInfo.update = function(rObj, newObj, target){
      obj.data.templates.info = duplicate(game.locals["homebrew"].data.previewInfo.data.info);
    };

    if (game.templates.build) {
      for (var k in game.templates.actors) {
        function wrap(key){
          game.locals["homebrew"].data.previewChar[key] = sync.dummyObj();
          game.locals["homebrew"].data.previewChar[key].data = duplicate(game.templates.actors[key]);
          game.locals["homebrew"].data.previewChar[key].data._d = duplicate(game.templates.display.actors[key]);
          game.locals["homebrew"].data.previewChar[key].sync = function(){game.locals["homebrew"].data.previewChar[key].update()};
          game.locals["homebrew"].data.previewChar[key].update = function(rObj, newObj, target){
            game.locals["homebrew"].update();
            sync.update(game.locals["homebrew"].data.previewChar[key], newObj, target);
          };
        }
        wrap(k);
      }

      for (var k in game.templates.elements) {
        function wrap(key){
          game.locals["homebrew"].data.previewItem[key] = sync.dummyObj();
          game.locals["homebrew"].data.previewItem[key].data = duplicate(game.templates.elements[key]);
          game.locals["homebrew"].data.previewItem[key].data._d = duplicate(game.templates.display.elements[key]);
          game.locals["homebrew"].data.previewItem[key].sync = function(){game.locals["homebrew"].data.previewItem[key].update()};
          game.locals["homebrew"].data.previewItem[key].update = function(rObj, newObj, target){
            game.locals["homebrew"].update();
            sync.update(game.locals["homebrew"].data.previewItem[key], newObj, target);
          };
        }
        wrap(k);
      }
    }
    else {
      game.locals["homebrew"].data.previewChar.data = duplicate(game.templates.character);
      if (game.templates.build) {
        game.locals["homebrew"].data.previewChar.data._a = duplicate(game.templates.actions.c);
      }
      game.locals["homebrew"].data.previewChar.data._d = duplicate(game.templates.display.sheet);
      game.locals["homebrew"].data.previewChar.data._calc = duplicate(game.templates.display.sheet.calc);
      game.locals["homebrew"].data.previewChar.sync = function(){game.locals["homebrew"].data.previewChar.update()};
      game.locals["homebrew"].data.previewChar.update = function(rObj, newObj, target){
        game.locals["homebrew"].update();
        sync.update(game.locals["homebrew"].data.previewChar, newObj, target);
      };

      game.locals["homebrew"].data.previewItem.data = duplicate(game.templates.item);
      game.locals["homebrew"].data.previewItem.sync = function(){game.locals["homebrew"].data.previewItem.update()};
      game.locals["homebrew"].data.previewItem.update = function(rObj, newObj, target){
        game.locals["homebrew"].update();
        sync.update(game.locals["homebrew"].data.previewItem, newObj, target);
      };
    }



    game.locals["homebrew"].data.previewPage.data = duplicate(game.templates.page);
    game.locals["homebrew"].data.previewPage.data.info.notes.current = `<h1 style="margin: 0; font-size: 3.0em; font-weight: bolder;" data-mce-style="margin: 0; font-size: 3.0em; font-weight: bolder;">Header 1</h1><hr class="h1" style="display: block; outline: none; border: none; width: 100%; height: 4px; background: grey; margin-top: 0px; margin-bottom: 0.5em;" data-mce-style="display: block; outline: none; border: none; width: 100%; height: 4px; background: grey; margin-top: 0px; margin-bottom: 0.5em;"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec sapien maximus, dapibus odio quis, tincidunt sem. Etiam consectetur tempus tincidunt. Sed placerat massa tortor, in laoreet ligula iaculis nec. Vivamus gravida consectetur urna eu pharetra. Morbi tempus purus nec ornare accumsan.</p><p>&nbsp;<br></p><h2 style="margin: 0; font-size: 1.4em; font-weight: bold;" data-mce-style="margin: 0; font-size: 1.4em; font-weight: bold;">&nbsp;Header 2</h2><hr class="h2" style="display: block; outline: none; border: none; width: 100%; height: 1px; background: grey; margin-top: 0px; margin-bottom: 0.5em;" data-mce-style="display: block; outline: none; border: none; width: 100%; height: 1px; background: grey; margin-top: 0px; margin-bottom: 0.5em;"><p>&nbsp;Pellentesque posuere, magna eget dapibus condimentum, felis purus varius nunc, vitae condimentum odio diam eget risus. Donec in arcu vitae massa ullamcorper hendrerit. Maecenas dignissim orci et consectetur tristique. Mauris hendrerit sit amet tellus sed consectetur. Fusce in elit nulla. Integer massa tortor, tristique a eleifend id, sollicitudin a ex.</p><p>&nbsp;<br></p><p><strong>Horizontal Break</strong></p><hr style="display: block; width: 100%; height: 2px; background-color: grey; margin-top: 0px; margin-bottom: 1em;" data-mce-style="display: block; width: 100%; height: 2px; background-color: grey; margin-top: 0px; margin-bottom: 1em;"><p>Nulla rutrum libero quis porttitor auctor. Vestibulum ultrices risus turpis, at iaculis ante varius vitae. Maecenas eleifend, sem et venenatis malesuada, mauris felis lobortis odio, ut facilisis ante erat ut tortor. Curabitur faucibus sollicitudin odio, ut mattis odio finibus nec. In quis viverra turpis. Fusce tellus nisi, auctor eget euismod a, feugiat in metus. Mauris at cursus ante. Proin in est quis enim rutrum pretium eu vel lorem. Praesent auctor semper vestibulum. Pellentesque varius erat sit amet posuere bibendum. Fusce sit amet est nec mi sollicitudin rutrum. Pellentesque et massa diam.</p><p>&nbsp;<br></p><p>&nbsp;<br></p>`;

    game.locals["homebrew"].data.previewPage.sync = function(){game.locals["homebrew"].data.previewPage.update()};
    game.locals["homebrew"].data.previewPage.update = function(rObj, newObj, target){
      game.locals["homebrew"].update();
      sync.update(game.locals["homebrew"].data.previewPage, newObj, target);
    };
  }
  var obj = game.locals["homebrew"];

  var optionsBar = $("<div>");
  optionsBar.addClass("flexrow");
  optionsBar.css("font-size", "1.6em");

  var actor = $("<div>").appendTo(optionsBar);
  actor.addClass("background alttext flex outline smooth padding flexmiddle hover2");
  actor.append(genIcon("user", "Actors"));
  actor.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");
    if (!game.templates.build) {
      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle background hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("Actions");
      option.click(function(){
        menu.children().removeClass("highlight").addClass("background");
        $(this).addClass("highlight").removeClass("background");

        content.empty();

        var select = sync.newApp("ui_JSON").appendTo(content);
        select.addClass("fit-xy");
        select.css("max-width", "50%");
        select.attr("lookup", "templates.actions.c");
        obj.addApp(select);
      });
    }

    if (game.templates.build) {
      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle create hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("New Actor");
      option.click(function(){
        ui_prompt({
          target : $(this),
          inputs : {"Actor Name" : ""},
          click : function(ev, inputs){
            var actorType = inputs["Actor Name"].val();
            obj.data.templates.actors[actorType] = {
              _t : "c",
              _type : actorType,
              info: {
                name: {
                  name: "Name",
                  current: "Default" + actorType
                },
                img: {
                  "name": "Art"
                },
                notes: {
                  "name": "Notes"
                }
              }
            };
            obj.data.templates.display.actors[actorType] = {};
            game.locals["homebrew"].data.previewChar[actorType] = game.locals["homebrew"].data.previewChar[actorType] || sync.obj();
            game.locals["homebrew"].data.previewChar[actorType].data = duplicate(obj.data.templates.actors[actorType]);
            actor.click();
          }
        });
      });

      for (var k in obj.data.templates.actors) {
        var option = $("<div>").appendTo(menu);
        option.addClass("alttext flexmiddle background hover2 lrpadding");
        option.css("font-size", "1.6em");
        option.text(k);
        option.click(function(){
          menu.children().removeClass("highlight").addClass("background");
          $(this).addClass("highlight").removeClass("background");
          content.empty();

          var newApp = sync.newApp("ui_characterSheetv2").appendTo(content);
          newApp.removeClass("application");
          newApp.addClass("lightoutline");
          newApp.attr("homebrew", true);
          newApp.css("width", assetTypes["c"].width);
          newApp.css("height", assetTypes["c"].height);
          game.locals["homebrew"].data.previewChar[$(this).text()].addApp(newApp);

          var actorType = $(this).text();
          var deleteActor = $("<div>").appendTo(content);
          deleteActor.addClass("destroy link");
          deleteActor.text("Delete Actor Type");
          deleteActor.click(function(){
            delete obj.data.templates.actors[actorType];
            delete obj.data.templates.display.actors[actorType];
            delete game.locals["homebrew"].data.previewChar[actorType];
            actor.click();
          });
        });
      }
      option.click();
    }
    else {
      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle background hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("Character Sheet");
      option.click(function(){
        menu.children().removeClass("highlight").addClass("background");
        $(this).addClass("highlight").removeClass("background");
        content.empty();

        var newApp = sync.newApp("ui_characterSheet").appendTo(content);
        newApp.removeClass("application");
        newApp.addClass("lightoutline");
        newApp.attr("homebrew", true);
        newApp.css("width", assetTypes["c"].width);
        newApp.css("height", assetTypes["c"].height);
        game.locals["homebrew"].data.previewChar.addApp(newApp);
      });
      option.click();
    }

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Initiative");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      select.attr("lookup", "templates.initiative");
      obj.addApp(select);
    });

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Tags");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_manageTags").appendTo(content);
      select.addClass("fit-xy");
      obj.addApp(select);
    });
  });


  var items = $("<div>").appendTo(optionsBar);
  items.addClass("background alttext flex outline smooth padding flexmiddle hover2");
  items.append(genIcon("briefcase", "Elements"));
  items.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");

    var option;
    if (!game.templates.build) {
      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle background hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("Actions");
      option.click(function(){
        menu.children().removeClass("highlight").addClass("background");
        $(this).addClass("highlight").removeClass("background");

        content.empty();

        var select = sync.newApp("ui_JSON").appendTo(content);
        select.addClass("fit-xy");
        select.css("max-width", "50%");
        select.attr("lookup", "templates.actions.i");
        obj.addApp(select);
      });

      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle background hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("Item");
      option.click(function(){
        menu.children().removeClass("highlight").addClass("background");
        $(this).addClass("highlight").removeClass("background");
        content.empty();

        var newApp = sync.newApp("ui_renderItemv2").appendTo(content);
        newApp.removeClass("application");
        newApp.addClass("lightoutline");
        newApp.attr("homebrew", "true");
        newApp.css("width", assetTypes["i"].width);
        newApp.css("height", assetTypes["i"].height);
        game.locals["homebrew"].data.previewItem.addApp(newApp);
      });
    }
    else {
      var option = $("<div>").appendTo(menu);
      option.addClass("alttext flexmiddle create hover2 lrpadding");
      option.css("font-size", "1.6em");
      option.text("New Element");
      option.click(function(){
        ui_prompt({
          target : $(this),
          inputs : {"Element Name" : "", "Drop to Location" : {placeholder : "(Optional)"}},
          click : function(ev, inputs){
            var actorType = inputs["Element Name"].val();
            obj.data.templates.elements[actorType] = {
              _t : "i",
              _type : actorType,
              info: {
                name: {
                  name: "Name",
                  current: "Default" + actorType
                },
                img: {
                  "name": "Art"
                },
                notes: {
                  "name": "Notes"
                }
              }
            };
            if (inputs["Drop to Location"].val()) {
              obj.data.templates.elements[actorType]._drop = inputs["Drop to Location"].val();
            }
            obj.data.templates.display.elements[actorType] = {};
            game.locals["homebrew"].data.previewItem[actorType] = game.locals["homebrew"].data.previewItem[actorType] || sync.obj();
            game.locals["homebrew"].data.previewItem[actorType].data = duplicate(obj.data.templates.elements[actorType]);
            items.click();
          }
        });
      });

      for (var i in obj.data.templates.elements) {
        var option = $("<div>").appendTo(menu);
        option.addClass("alttext flexmiddle background hover2 lrpadding");
        option.css("font-size", "1.6em");
        option.text(i);
        option.click(function(){
          menu.children().removeClass("highlight").addClass("background");
          $(this).addClass("highlight").removeClass("background");
          content.empty();

          var newApp = sync.newApp("ui_renderItemv2").appendTo(content);
          newApp.removeClass("application");
          newApp.addClass("lightoutline");
          newApp.attr("homebrew", "true");
          newApp.css("width", assetTypes["i"].width);
          newApp.css("height", assetTypes["i"].height);
          game.locals["homebrew"].data.previewItem[$(this).text()].addApp(newApp);

          var actorType = $(this).text();
          var deleteActor = $("<div>").appendTo(content);
          deleteActor.addClass("destroy link");
          deleteActor.text("Delete Element");
          deleteActor.click(function(){
            delete obj.data.templates.elements[actorType];
            delete obj.data.templates.display.elements[actorType];
            delete game.locals["homebrew"].data.previewItem[actorType];
            items.click();
          });
        });
      }
    }

    option.click();
  });

  var visuals = $("<div>").appendTo(optionsBar);
  visuals.addClass("background alttext flex outline smooth padding flexmiddle hover2");
  visuals.append(genIcon("file", "Resources"));
  visuals.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");

    var contentWrap = $("<div>").appendTo(content);
    contentWrap.addClass("flexrow");

    var stylePage = sync.newApp("ui_stylePage").appendTo(contentWrap);
    stylePage.removeClass("application");
    stylePage.addClass("lightoutline");
    stylePage.css("width", assetTypes["p"].width);
    stylePage.css("height", assetTypes["p"].height);
    game.locals["homebrew"].data.previewPage.addApp(stylePage);

    var newApp = sync.newApp("ui_renderPage").appendTo(contentWrap);
    newApp.removeClass("application");
    newApp.addClass("lightoutline");
    newApp.css("text-align", "left");
    newApp.attr("viewOnly", "true");
    newApp.css("width", assetTypes["p"].width);
    newApp.css("height", assetTypes["p"].height);
    game.locals["homebrew"].data.previewPage.addApp(newApp);
  });

  var macros = $("<div>").appendTo(optionsBar);
  macros.addClass("background alttext flex outline smooth padding flexmiddle hover2");
  macros.append(genIcon("cog", "Game Mechanics"));
  macros.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Constants");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");
      content.empty();

      var ctx = sync.defaultContext();
      ctx["c"] = duplicate(game.locals["homebrew"].data.previewChar.data);
      ctx["i"] = duplicate(game.locals["homebrew"].data.previewItem.data);

      content.append("<i>Constants are shortcuts for complicated macros, write a long equation, and refer to it with '#:myConstant'</i>");

      var constantList = $("<div>").appendTo(content);
      constantList.addClass("fit-xy scroll-y");
      constantList.css("max-width", "50%");

      function buildConstant(i) {
        var constantWrap = $("<div>").appendTo(constantList);
        constantWrap.addClass("flexrow flexmiddle");

        var constantLookupWrap = $("<div>").appendTo(constantWrap);
        constantLookupWrap.addClass("flexmiddle");
        constantLookupWrap.append("<text>#:</text>");

        var constantLookup = genInput({
          parent : constantLookupWrap,
          classes : "line middle",
          value : i,
        });
        constantLookup.change(function(){
          delete obj.data.templates.constants[i];
          obj.data.templates.constants[$(this).val()] = constantValue.val();
          rebuildConstants();
        });

        var constantValue = genInput({
          parent : constantWrap,
          classes : "line lrmargin fit-x middle",
          value : obj.data.templates.constants[i],
        });
        constantValue.change(function(){
          obj.data.templates.constants[i] = $(this).val();
        });

        var remove = genIcon("trash").appendTo(constantWrap);
        remove.addClass("destroy");
        remove.click(function(){
          delete obj.data.templates.constants[i];
          rebuildConstants();
        });
      }
      function rebuildConstants(){
        constantList.empty();
        for (var i in obj.data.templates.constants) {
          buildConstant(i);
        }

        var addConstant = genIcon("plus", "New Constant").appendTo(constantList);
        addConstant.addClass("create fit-x flexmiddle");
        addConstant.click(function(){
          ui_prompt({
            target : $(this),
            inputs : {
              "Constant Lookup" : {placeholder : "The Text after '#:' to use"}
            },
            click : function(ev, inputs){
              if (inputs["Constant Lookup"].val() && !inputs["Constant Lookup"].val().match(" ")) {
                obj.data.templates.constants[inputs["Constant Lookup"].val()] = "";
                rebuildConstants();
              }
              else {
                sendAlert({text : "Constants can't have spaces or be empty"});
              }
            }
          });

        });
      }
      rebuildConstants();
    });
    option.click();

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Dice Actions");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      select.attr("lookup", "templates.effects");
      obj.addApp(select);
    });

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Dice Displays");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_diceDisplayBuilder").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      obj.addApp(select);
    });

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Dice Types");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      select.attr("lookup", "templates.dice");
      obj.addApp(select);
    });

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Tables");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      select.attr("lookup", "templates.tables");
      obj.addApp(select);

      /*var constantList = $("<div>").appendTo(content);
      constantList.addClass("fit-xy scroll-y");
      constantList.css("max-width", "50%");

      function buildConstant(i) {
        var constantWrap = $("<div>").appendTo(constantList);
        constantWrap.addClass("flexrow flexmiddle");

        var constantLookupWrap = $("<div>").appendTo(constantWrap);
        constantLookupWrap.addClass("flexmiddle");
        constantLookupWrap.append("<text>#:</text>");

        var constantLookup = genInput({
          parent : constantLookupWrap,
          classes : "line middle",
          value : i,
        });
        constantLookup.change(function(){
          delete obj.data.templates.constants[i];
          obj.data.templates.constants[$(this).val()] = constantValue.val();
          rebuildConstants();
        });

        var constantValue = genInput({
          parent : constantWrap,
          classes : "line subtitle lrmargin fit-x middle",
          value : obj.data.templates.constants[i],
        });
        constantValue.change(function(){
          obj.data.templates.constants[i] = $(this).val();
        });

        var remove = genIcon("trash").appendTo(constantWrap);
        remove.addClass("destroy");
        remove.click(function(){
          delete obj.data.templates.constants[i];
          rebuildConstants();
        });
      }
      function rebuildConstants(){
        constantList.empty();
        for (var i in obj.data.templates.constants) {
          buildConstant(i);
        }

        var addConstant = genIcon("plus", "New Constant").appendTo(constantList);
        addConstant.addClass("create fit-x flexmiddle");
        addConstant.click(function(){
          ui_prompt({
            target : $(this),
            inputs : {
              "Constant Lookup" : {placeholder : "The Text after '#:' to use"}
            },
            click : function(ev, inputs){
              if (inputs["Constant Lookup"].val() && !inputs["Constant Lookup"].val().match(" ")) {
                obj.data.templates.constants[inputs["Constant Lookup"].val()] = "";
                rebuildConstants();
              }
              else {
                sendAlert({text : "Constants can't have spaces or be empty"});
              }
            }
          });

        });
      }
      rebuildConstants();*/
    });
  });

  var finalize = $("<div>").appendTo(optionsBar);
  finalize.addClass("background alttext flex outline smooth padding flexmiddle hover2");
  finalize.append(genIcon("check", "Finalize"));
  finalize.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");

    var wrap = $("<div>");
    wrap.addClass("flexcolumn flexmiddle");

    var versionField = genInput({
      classes : "line",
      parent : wrap,
      placeholder : game.templates.version + " (Current Version)"
    });

    wrap.append("<b class='subtitle'>To stop version popups, enter in your own custom version</b>");


    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Raw JSON");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.css("max-width", "50%");
      select.attr("lookup", "templates");
      select.attr("hideConfirm", "true");
      obj.addApp(select);

      var button = $("<button>").appendTo(content);
      button.addClass("highlight alttext fit-x");
      button.css("font-size", "2.0em");
      button.css("max-width", "50%");
      button.append("Finalize from JSON");
      button.click(function(){
        var button = $("<button>");
        button.append("Confirm (Can't be undone)");
        button.click(function(){
          runCommand("updateTemplate", duplicate(obj.data.templates));
          layout.coverlay("confirm-template");
        });

        ui_popOut({
          target : $(this),
          id : "confirm-template",
        }, button);
      });
    });

    var option = $("<div>").appendTo(menu);
    option.addClass("alttext flexmiddle background hover2 lrpadding");
    option.css("font-size", "1.6em");
    option.text("Finalize");
    option.click(function(){
      menu.children().removeClass("highlight").addClass("background");
      $(this).addClass("highlight").removeClass("background");

      content.empty();

      var buttonDiv = $("<div>").appendTo(content);
      buttonDiv.addClass("flexcolumn flexmiddle");

      var newApp = sync.newApp("ui_editPage").appendTo(buttonDiv);
      newApp.attr("autosave", true);
      newApp.attr("entry", true);
      newApp.css("width", "600px");
      newApp.css("height", "600px");
      game.locals["homebrew"].data.previewInfo.addApp(newApp);

      var subOptions = $("<div>").appendTo(buttonDiv);
      subOptions.addClass("flexrow");

      if (!game.templates.build) {
        var button = $("<button>").appendTo(subOptions);
        button.append("Force Assets to the latest version");
        button.click(function(){
          var content = $("<div>");
          content.addClass("flexcolumn flexmiddle");
          content.append("<div class='flexmiddle'><b>This will alter all existing assets, are you sure?</b></div>");

          var button = $("<button>").appendTo(content);
          button.append("Yes");
          button.click(function(){
            game.templates;
            for (var i in game.entities.data) {
              var ent = game.entities.data[i];
              if (ent.data && ent.data._t == "c") {
                merge(ent.data.info, game.templates.character.info);
                merge(ent.data.counters, game.templates.character.counters);
                merge(ent.data.stats, game.templates.character.stats);
                for (var j in ent.data.inventory) {
                  merge(ent.data.inventory[j], game.templates.item);
                }
                var newTalents = {};
                for (var j in ent.data.talents) {
                  ent.data.talents = ent.data.talents || {};
                  newTalents[j] = ent.data.talents[j];
                }
                game.entities.data[i].data.talents = newTalents;

                var newSpecials = {};
                for (var j in ent.data.specials) {
                  ent.data.specials = ent.data.specials || {};
                  newSpecials[j] = ent.data.specials[j];
                }
                game.entities.data[i].data.specials = newSpecials;

                var newSkills = duplicate(game.templates.character.skills);
                for (var j in ent.data.skills) {
                  ent.data.skills = ent.data.skills || {};
                  var found = false;
                  for (var k in newSkills) {
                    if (ent.data.skills[j].name.toLowerCase() == newSkills[k].name.toLowerCase()) {
                      newSkills[k] = ent.data.skills[j];
                      found = true;
                      break;
                    }
                  }
                  if (!found) {
                    newSkills[(Object.keys(newSkills).length || 0)] = ent.data.skills[j];
                  }
                }
                game.entities.data[i].data.skills = newSkills;

                for (var j in ent.data.traits) {
                  ent.data.tags = ent.data.tags || {};
                  ent.data.tags["trait_"+ent.data.traits[j].name] = 1;
                }
                for (var j in ent.data.proficient) {
                  ent.data.tags = ent.data.tags || {};
                  ent.data.tags["prof_"+j] = 1;
                }
                ent.sync("updateAsset");
              }
              else if (ent.data && ent.data._t == "g") {
                ent.sync("deleteAsset");
              }
              else if (ent.data && ent.data._t == "v") {
                merge(ent.data.info, game.templates.vehicle.info);
                merge(ent.data.counters, game.templates.vehicle.counters);
                merge(ent.data.stats, game.templates.vehicle.stats);
                for (var j in ent.data.inventory) {
                  merge(ent.data.inventory[j], game.templates.item);
                }
                ent.sync("updateAsset");
              }
            }
            layout.coverlay("confirm-template");
          });

          var button = $("<button>").appendTo(content);
          button.append("No");
          button.click(function(){
            layout.coverlay("confirm-template");
          });

          ui_popOut({
            target : $(this),
            id : "confirm-template",
          }, content);
        });
      }

      var button = $("<button>").appendTo(buttonDiv);
      button.css("width", "600px");
      button.append("Print System Builder JSON");
      button.click(function(){
        if (game.templates.build) {
          for (var key in obj.data.templates.actors) {
            var template = duplicate(obj.data.previewChar[key].data);

            obj.data.templates.display.actors[key] = duplicate(template._d);

            delete template._d;
            delete template._s;
            delete template._c;

            obj.data.templates.actors[key] = template;
          }
          for (var key in obj.data.templates.elements) {
            var template = duplicate(obj.data.previewItem[key].data);

            obj.data.templates.display.elements[key] = duplicate(template._d);

            delete template._d;
            delete template._s;
            delete template._c;

            obj.data.templates.elements[key] = template;
          }
        }
        else {
          var template = duplicate(obj.data.previewChar.data);
          obj.data.templates.display.sheet.calc = template._calc;
          if (game.templates.build) {
            game.templates.actions.c = duplicate(template._a);
          }
          delete template._a;
          delete template._d;
          delete template._s;
          delete template._c;
          delete template._calc;

          obj.data.templates.character = template;
          obj.data.templates.display.sheet.content = duplicate(obj.data.previewChar.data._d.content);
          obj.data.templates.display.sheet.style = duplicate(obj.data.previewChar.data._d.style);

          var template = duplicate(obj.data.previewItem.data);
          delete template._d;
          delete template._s;
          delete template._c;

          obj.data.templates.item = template;
        }

        var template = duplicate(obj.data.previewPage.data);
        delete template._d;
        delete template._s;
        delete template._c;
        delete template.info.notes.current;
        obj.data.templates.page = template;

        ui_popOut({
          target : $("body"),
          title : "JSON Printout",
          style : {"width" : "600px", "height" : "600px"}
        }, genInput({classes : "flex subtitle", type : "textarea", value : JSON.stringify(obj.data.templates, 2, 2)}));
      });

      var button = $("<button>").appendTo(subOptions);
      button.addClass("focus");
      button.css("width", "600px");
      button.append("Restore to original Templates");
      button.click(function(){
        if (game.locals["gameList"][game.templates.identifier]) {
          runCommand("updateTemplate", duplicate(game.locals["gameList"][game.templates.identifier]));
        }
        else {
          sendAlert({text : "This is a custom game, can't restore templates"});
        }
      });

      var button = $("<button>").appendTo(buttonDiv);
      button.addClass("highlight alttext");
      button.css("font-size", "2.0em");
      button.css("width", "600px");
      button.append("Use these templates for current World");
      button.click(function(){
        var button = $("<button>");
        button.append("Confirm (Can't be undone)");
        button.click(function(){
          if (obj.data.templates.build) {
            for (var key in obj.data.templates.actors) {
              var template = duplicate(obj.data.previewChar[key].data);

              obj.data.templates.display.actors[key] = duplicate(template._d);

              delete template._d;
              delete template._s;
              delete template._c;

              obj.data.templates.actors[key] = template;
            }
            for (var key in obj.data.templates.elements) {
              var template = duplicate(obj.data.previewItem[key].data);

              obj.data.templates.display.elements[key] = duplicate(template._d);

              delete template._d;
              delete template._s;
              delete template._c;

              obj.data.templates.elements[key] = template;
            }
          }
          else {
            var template = duplicate(obj.data.previewChar.data);
            obj.data.templates.display.sheet.calc = template._calc;
            if (game.templates.build) {
              game.templates.actions.c = duplicate(template._a);
            }
            delete template._a;
            delete template._d;
            delete template._s;
            delete template._c;
            delete template._calc;

            obj.data.templates.character = template;
            obj.data.templates.display.sheet.content = duplicate(obj.data.previewChar.data._d.content);
            obj.data.templates.display.sheet.style = duplicate(obj.data.previewChar.data._d.style);

            var template = duplicate(obj.data.previewItem.data);
            delete template._d;
            delete template._s;
            delete template._c;

            obj.data.templates.item = template;
          }

          var template = duplicate(obj.data.previewPage.data);
          delete template._d;
          delete template._s;
          delete template._c;
          delete template.info.notes.current;
          obj.data.templates.page = template;

          runCommand("updateTemplate", obj.data.templates);
          layout.coverlay("confirm-template");
        });

        ui_popOut({
          target : $(this),
          id : "confirm-template",
        }, button);
      });
    });
    option.click();

  });

  var contentWrap = $("<div>").appendTo(div);
  contentWrap.addClass("flex2");
  contentWrap.css("position", "relative");

  var contentWrapWrap = $("<div>").appendTo(contentWrap);
  contentWrapWrap.addClass("fit-xy");
  contentWrapWrap.css("position", "absolute");
  contentWrapWrap.css("overflow", "auto");

  var content = $("<div>").appendTo(contentWrapWrap);
  content.addClass("flexcolumn flexmiddle");
  content.css("min-width", "100%");
  content.css("min-height", "100%");

  var menu = $("<div>");
  if (!app.attr("hidemenu")) {
    menu.appendTo(contentWrap);
  }
  menu.addClass("flexcolumn");
  menu.css("position", "absolute");
  menu.css("left", "100px");
  menu.css("bottom", "100px");
  menu.css("transition", "opacity 0.5s");
  menu.css("opacity", "0.25");
  menu.hover(function(){
    menu.css("opacity", "1.0");
  },
  function(){
    menu.css("opacity", "0.25");
  });
  menu.mousedown(function(ev){
    ev.stopPropagation();
  });
  menu.mouseup(function(ev){
    ev.stopPropagation();
  });
  menu.click(function(ev){
    ev.stopPropagation();
  });
  optionsBar.appendTo(div);

  actor.click();


  
  return div;
});
