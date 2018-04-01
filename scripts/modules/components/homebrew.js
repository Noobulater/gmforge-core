sync.render("ui_elementBuilder", function(obj, app, scope){
  var ctx = obj.data.context; // use this for context

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var list = $("<div>").appendTo(div);
  list.addClass("padding");

  var contents = $("<div>").appendTo(div);


  return div;
});

sync.render("ui_homebrew", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  if (!game.locals["homebrew"]) {
    game.locals["homebrew"] = game.locals["homebrew"] || sync.obj();
    game.locals["homebrew"].data = game.locals["homebrew"].data || {
      templates : duplicate(game.templates),
      previewChar : sync.dummyObj(),
      previewItem : sync.dummyObj(),
      previewPage : sync.dummyObj(),
    };
    game.locals["homebrew"].data.previewChar.data = duplicate(game.templates.character);
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

    game.locals["homebrew"].data.previewPage.data = duplicate(game.templates.page);
    game.locals["homebrew"].data.previewPage.sync = function(){game.locals["homebrew"].data.previewPage.update()};
    game.locals["homebrew"].data.previewPage.update = function(rObj, newObj, target){
      game.locals["homebrew"].update();
      sync.update(game.locals["homebrew"].data.previewPage, newObj, target);
    };
  }
  var obj = game.locals["homebrew"];

  var optionsBar = $("<div>").appendTo(div);
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
      select.attr("lookup", "templates.actions.c");
      obj.addApp(select);
    });


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
  items.append(genIcon("briefcase", "Items/Spells"));
  items.click(function(){
    content.empty();
    menu.empty();

    optionsBar.children().removeClass("highlight").addClass("background");
    $(this).addClass("highlight").removeClass("background");

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

      var newApp = sync.newApp("ui_renderItem").appendTo(content);
      newApp.removeClass("application");
      newApp.addClass("lightoutline");
      newApp.css("width", assetTypes["i"].width);
      newApp.css("height", assetTypes["i"].height);
      game.locals["homebrew"].data.previewItem.addApp(newApp);
    });
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

    var newApp = sync.newApp("ui_renderPage").appendTo(content);
    newApp.removeClass("application");
    newApp.addClass("lightoutline");
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

      var select = sync.newApp("ui_JSON").appendTo(content);
      select.addClass("fit-xy");
      select.attr("lookup", "templates.constants");
      obj.addApp(select);
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
      select.attr("lookup", "templates.tables");
      obj.addApp(select);
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
      select.attr("lookup", "templates");
      obj.addApp(select);
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

      var subOptions = $("<div>").appendTo(buttonDiv);
      subOptions.addClass("flexrow");

      var button = $("<button>").appendTo(subOptions);
      button.append("Update all assets to the latest version");
      button.click(function(){
        var content = $("<div>");
        content.addClass("flexcolumn flexmiddle");
        content.append("<div class='flexmiddle'><b>This will alter all existing characters, are you sure?</b></div>");

        var button = $("<button>").appendTo(content);
        button.append("Yes");
        button.click(function(){
          game.templates;
          for (var i in game.entities.data) {
            var ent = game.entities.data[i];
            if (ent.data && ent.data._t == "c") {

              if (game.templates.display.sheet.health) {
                sync.traverse(ent.data, game.templates.display.sheet.health, ent.data.counters.wounds);
              }

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

      var button = $("<button>").appendTo(subOptions);
      button.addClass("focus");
      button.append("Restore to original Templates");
      button.click(function(){
        if (game.locals["gameList"][game.config.data.game]) {
          runCommand("updateTemplate", duplicate(game.locals["gameList"][game.config.data.game].templates));
        }
        else {
          sendAlert({text : "This is a custom game, can't restore templates(still being built)"});
        }
      });

      var button = $("<button>").appendTo(buttonDiv);
      button.addClass("highlight alttext");
      button.css("font-size", "2.0em");
      button.append("Finalize Game Template");
      button.click(function(){
        var button = $("<button>");
        button.append("Confirm (Can't be undone)");
        button.click(function(){
          var template = duplicate(obj.data.previewChar.data);
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

          var template = duplicate(obj.data.previewPage.data);
          delete template._d;
          delete template._s;
          delete template._c;

          obj.data.templates.page = template;

          runCommand("updateTemplate", duplicate(obj.data.templates));
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
  contentWrap.css("overflow", "auto");

  var content = $("<div>").appendTo(contentWrap);
  content.addClass("fit-xy flexmiddle");
  content.css("position", "absolute");

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

  actor.click();

  return div;
});
