sync.render("ui_vehicle", function(obj, app, scope) {
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    displayMode : parseInt(app.attr("displayMode") || 0),
    editable: (app.attr("editable") == "true"),
    markup : app.attr("markup") == "true"
  };

  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn outline");

  var sheet = scope.sheet || game.templates.display.vehicle;
  for (var i in sheet.style) {
    div.css(i, sheet.style[i]);
  }

  if (!obj.local) {
    for (var i in sheet.calc) {
      if (!sheet.calc[i].cond || sync.eval(sheet.calc[i].cond, [obj.data])) {
        var val = sheet.calc[i].eq;
        if (val && val.length) {
          val = sync.result(val, [obj.data]);
          val = sync.eval(val);
        }
        var target = sync.traverse(obj.data, sheet.calc[i].target, val);
      }
    }
  }

  if (!scope.viewOnly) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
    		var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Create</b>");
      }
  	});
    div.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer;
      if (dt.getData("Text").match("{")) {
        var ent = JSON.parse(dt.getData("Text"));
        if (ent._t == "i") {
          if (!dt.getData("spell")) {
            obj.data.inventory.push(ent);
            obj.sync("updateAsset");
          }
        }
      }

      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

  	div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
  	});
  }

  if (!scope.viewOnly) {
    var optionsBack = $("<div>").appendTo(div);
    optionsBack.addClass("alttext background outline");

    var optionsBar = $("<div>").appendTo(optionsBack);
    optionsBar.addClass("flexwrap");

    var security = genIcon("lock");
    security.attr("title", "Edit who has access to this character");
    security.appendTo(optionsBar);
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "top",
        id : "ui-rights-dialog",
      }, content);
    });

    if (hasSecurity(getCookie("UserID"), "Rights", data)) {
      var icon = genIcon("heart");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+sync.traverse(obj.data, sheet.altStat).name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : 1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });

      var icon = genIcon("heart-empty");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+sync.traverse(obj.data, sheet.altStat).name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : -1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });

      for (var i in sheet.summary) {
        var tabData = sheet.summary[i];
        var tab = genIcon(tabData.icon, tabData.name).appendTo(optionsBar);
        tab.attr("title", tabData.name);
        tab.css("margin-left", "8px");
        tab.attr("index", i);
        tab.click(function(){
          if ($(this).attr("index") < 0) {
            app.attr("displayMode", sheet.summary.length-1);
          }
          else if ($(this).attr("index") >= sheet.summary.length) {
            app.attr("displayMode", 0);
          }
          else {
            app.attr("displayMode", $(this).attr("index"));
          }
          obj.update();
        });
      }
    }
  }

  var infoPanel = $("<div>").appendTo(div);
  infoPanel.addClass("flexcolumn");

  var ctx = sync.defaultContext();
  ctx["c"] = obj.data;

  var newScope = duplicate(scope);
  newScope.display = sheet.summary[scope.displayMode].display;
  newScope.context = ctx;
  if (scope.markup) {
    newScope.markup = "vehicle"+scope.displayMode;
  }
  infoPanel.append(sync.render("ui_processUI")(obj, app, newScope));

  return div;
});

sync.render("ui_crew", function(obj, app, scope) {
  var data = obj.data;
  var div = $("<div>");

  var title = $("<h4>Crew</h4>").appendTo(div);
  title.addClass("flexmiddle");
  if (!scope.viewOnly) {
    var newCrew = genIcon("plus");
    newCrew.attr("title", "Add Crew Slot");
    newCrew.appendTo(title);
    newCrew.click(function(){
      data.crew.push({img : "/content/icons/Toolbox1000p.png", title : "Seat"});
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
  }

  var list = $("<div>").appendTo(div);
  list.addClass("fit-x flexaround flexwrap");
  for (var crewIndex in data.crew) {
    var crewData = data.crew[crewIndex];
    var crewContainer = $("<div>").appendTo(list);
    crewContainer.addClass("outline flexrow");

    var crewPlate = $("<div>").appendTo(crewContainer);
    crewPlate.addClass("flexcolumn flexmiddle subtitle");

    var crewTitle = genIcon("", (crewData.title || "").substring(0, 16)).appendTo(crewPlate);
    crewTitle.attr("title", "Change Name")
    crewTitle.attr("index", crewIndex);
    crewTitle.click(function(){
      var index = $(this).attr("index");
      ui_prompt({
        target : $(this),
        id : "change-crew-title",
        inputs : {
          "Title" : data.crew[index].title,
        },
        click : function(ev, inputs) {
          data.crew[index].title = inputs["Title"].val();
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    });

    var crewContent = $("<div>").appendTo(crewPlate);
    crewContent.addClass("outline subtitle");
    crewContent.css("width", "50px");
    crewContent.css("height", "50px");

    if (crewData.eID && game.entities.data[crewData.eID]) {
      var ent = game.entities.data[crewData.eID];
      crewContent.css("background-image", "url('"+ (sync.rawVal(ent.data.info.img)  || "/content/icons/blankchar.png") +"')");
      crewContent.css("background-size", "contain");
      crewContent.css("background-repeat", "no-repeat");
      crewContent.css("background-position", "center");
      if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
        crewContent.addClass("hover2");
        crewContent.attr("index", crewData.eID);
        crewContent.attr("name", crewData.title);
        crewContent.click(function() {
          if (_down[16]) {
            var content = sync.newApp("ui_characterSummary");
            game.entities.data[$(this).attr("index")].addApp(content);
            var popOut = ui_popOut({
              target: $(this),
              id: "char-summary-"+$(this).attr("index"),
              dragThickness : "0.5em",
              title : $(this).attr("name"),
              minimize : true,
            }, content);
            popOut.resizable();
          }
          else {
            var content = sync.newApp("ui_characterSheet");
            game.entities.data[$(this).attr("index")].addApp(content);
            var popOut = ui_popOut({
              target: $(this),
              id: "char-summary-"+$(this).attr("index"),
              dragThickness : "0.5em",
              title : $(this).attr("name"),
              minimize : true,
            }, content);
            popOut.resizable();
          }
        });
        if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          var optionsList = $("<div>").appendTo(crewContainer);
          optionsList.addClass("flexcolumn");

          var disembark = genIcon("log-out").appendTo(optionsList);
          disembark.attr("title", "Leave Vehicle");
          disembark.attr("index", crewIndex);
          disembark.click(function(){
            delete data.crew[$(this).attr("index")].eID;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          });
        }
      }
    }
    else {
      if (crewData.img) {
        crewContent.css("background-image", "url('"+ crewData.img +"')");
        crewContent.css("background-size", "contain");
        crewContent.css("background-repeat", "no-repeat");
        crewContent.css("background-position", "center");
      }
      var optionsList = $("<div>").appendTo(crewContainer);
      optionsList.addClass("flexcolumn");

      var crewMember = genIcon("user").appendTo(optionsList);
      crewMember.attr("title", "Change Crew Member");
      crewMember.attr("index", crewIndex);
      crewMember.click(function(){
        var index = $(this).attr("index");
        var content = sync.render("ui_entList")(obj, app, {
          filter : "c",
          click : function(ev, ui, charObj) {
            data.crew[index].eID = charObj.id();
            layout.coverlay("popout-chars");
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        });

        var popOut = ui_popOut({
          target : $(this),
          id : "popout-chars",
          style : {"max-height" : "25vh", "overflow-y" : "auto"}
        }, content);
      });

      var img = genIcon("picture").appendTo(optionsList);
      img.attr("title", "Change Image");
      img.attr("index", crewIndex);
      img.click(function(){
        var index = $(this).attr("index");

        var content = $("<div>");

        var iconDiv = $("<div>").appendTo(content);

        for (var i in util.art.icons) {
          var imgClick = $("<img>").appendTo(iconDiv);
          imgClick.addClass("outline hover2");
          imgClick.css("cursor", "pointer");
          imgClick.css("width", "32px");
          imgClick.css("height", "32px");
          imgClick.attr("src", "/content/icons/"+util.art.icons[i]);
          imgClick.click(function(){
            imgInput.val($(this).attr("src"));
            layout.coverlay("icons-picker");
          });
        }

        var imgInput = genInput({
          parent : content,
          value : data.crew[index].img || "",
          style : {"font-size" : "0.8em", "width" : "100%"}
        });

        var confirm = $("<button>").appendTo(content);
        confirm.addClass("fit-x");
        confirm.append("Confirm");
        confirm.click(function(){
          data.crew[index].img = imgInput.val() || "";
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay("change-crew-img", 300);
        });

        ui_popOut({
          target : $(this),
          id : "change-crew-img",
          style : {"max-width" : "30vw"}
        }, content);
      });

      var del = genIcon("trash").appendTo(optionsList);
      del.attr("title", "Delete Crew Slot");
      del.attr("index", crewIndex);
      del.click(function(){
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          id : "delete-crew",
          confirm : "Delete Slot",
          click : function(){
            data.crew.splice(index, 1);
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        });
      });
    }
  }
  return div;
});

sync.render("ui_locations", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"};
  scope.editable = (app.attr("editable") == "true");
  var div = $("<div>");
  var data = obj.data;

  var title = $("<h4 style='text-align: center;'>Locations</h4>").appendTo(div);
  if (!scope.viewOnly) {
    if (scope.editable) {
      var icon = genIcon("plus").appendTo(title);
      icon.click(function() {
        var popout = ui_prompt({
          target : $(this),
          id : "special-rule-popout",
          inputs : {"Name" : ""},
          click : function(ev, inputs) {
            if (inputs["Name"].val() && inputs["Name"].val().trim()) {
              data.body[inputs["Name"].val().trim()] = {coords: [0,0], size: ["50%","50%"], value : 0};
              obj.update();
            }
          }
        });
      });
      var icon = genIcon("ok").appendTo(title);
      icon.click(function() {
        app.removeAttr("editable");
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }
    else {
      var icon = genIcon("pencil").appendTo(title);
      icon.click(function() {
        app.attr("editable", "true");
        obj.update();
      });
    }
  }
  var newScope = {
    viewOnly : scope.viewOnly,
    url : sync.rawVal(data.info.img) || "/content/icons/blankvehicle.png",
    body : data.body,
    editable : scope.editable,
    displayText : function(ui, key){
      if (data.body[ui.attr("key")] != null && !scope.editable) {
        ui.css("text-shadow", "0px 0px 4px black");
        ui.css("color", "white");
        ui.text(data.body[ui.attr("key")].value);
      }
      else {
        ui.css("text-shadow", "0px 0px 4px white");
      }
    },
    click : function(ev, ui) {
      if (data.body[ui.attr("key")] != null) {
        if (_down["17"]) {
          data.body[ui.attr("key")].value = (data.body[ui.attr("key")].value || 0) + 1;
        }
        else {
          data.body[ui.attr("key")].value = (data.body[ui.attr("key")].value || 0) - 1;
        }
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      }
    }
  };
  if (scope.editable) {
    newScope.click = function(ev, ui) {
      delete data.body[ui.attr("key")];
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    }
  }
  var dragContainer = sync.render("ui_body")(obj, app, newScope).appendTo(div);

  return div;
});
