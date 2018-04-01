sync.render("ui_characterSpecials", function(obj, app, scope) {
  var div = $("<div>");

  var data = obj.data;
  var info = data.info;

  var specials = $("<div>").appendTo(div);

  var title = $("<b class='flexmiddle'>Special Rules</b>").appendTo(specials);
  if (!scope.viewOnly) {
    var icon = genIcon("plus").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      var popout = ui_prompt({
        target : $(this),
        id : "special-rule-popout",
        inputs : {"Name" : ""},
        click : function(ev, inputs) {
          obj.data.specials = obj.data.specials || {};
          obj.data.specials[inputs["Name"].val()] = sync.newValue(inputs["Name"].val());
          obj.sync("updateAsset");
          layout.coverlay("special-rule-popout");
        }
      });
    });
  }
  var specialList = $("<div>").appendTo(div);
  specialList.css("background-color", "white");

  var keys = Object.keys(data.specials);
  keys.sort(function(a,b){
    var name1 = data.specials[a].name;
    var name2 = data.specials[b].name;
    if (name1 > name2) {
      return 1;
    }
    else if (name1 < name2) {
      return -1;
    }
    return 0;
  });

  for (var ind in keys) {
    var index = keys[ind];
    var specialData = data.specials[index];
    if (specialData) {
      var specialCont = $("<div>").appendTo(specialList);
      specialCont.addClass("fit-x outline specialContent");
      if (scope.minimized) {
        specialCont.addClass("subtitle");
      }
      if (!scope.viewOnly) {
        specialCont.addClass("hover2 flexbetween");
        specialCont.css("cursor", "pointer");
        specialCont.attr("index", index);

        var key = $("<text>").appendTo(specialCont);
        key.addClass("subtitle lrpadding flexmiddle");
        key.attr("title", "@c.specials."+index);
        key.append("@");
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
          key.attr("index", index);
          key.click(function(){
            var oldIndex = $(this).attr("index");
            var pop = ui_prompt({
              target : $(this),
              inputs : {"Change Macro Key" : {placeholder : "Assign a new macro key"}},
              click : function(ev, inputs) {
                var newKey = inputs["Change Macro Key"].val();
                if (newKey) {
                  if (!obj.data.specials[newKey] && obj.data.specials[oldIndex]) {
                    obj.data.specials[newKey] = obj.data.specials[oldIndex];
                    delete obj.data.specials[oldIndex];
                    obj.sync("updateAsset");
                  }
                  else {
                    sendAlert({text : "Another entry exists with this macro key"});
                  }
                }
                else {
                  sendAlert({text : "Enter valid macro key"});
                }
              }
            });
          });
        }
      }

      var talent = sync.render("ui_renderTalent")(obj, app, {talentData: specialData, viewOnly: true}).appendTo(specialCont);
      talent.addClass("spadding");
      talent.attr("index", index);
      if (!scope.viewOnly) {
        talent.click(function(){
          var frame = $("<div>");
          frame.addClass("flexcolumn flex");

          var tRef = $(this).attr("index");
          var talentData = data.specials[tRef];

          var viewTalent = sync.obj("viewTalent");
          viewTalent.data = duplicate(game.templates.page);
          viewTalent.data._t = "t";
          viewTalent.data.info.name = sync.newValue("Name", duplicate(talentData.name));
          viewTalent.data.info.img = sync.newValue("Img", null);
          viewTalent.data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

          var newApp  = sync.newApp("ui_renderPage").appendTo(frame);
          newApp.attr("viewOnly", true);
          viewTalent.addApp(newApp);

          var pop = ui_popOut({
            target : $("body"),
            id : "view-talent",
            title : sync.rawVal(talentData.name),
            style : {width : "400px", height : "400px"}
          }, frame);
          pop.resizable();
        });
      }
      if (!scope.viewOnly && !scope.minimized) {
        var icon = genIcon("edit").appendTo(specialCont);
        icon.attr("index", index);
        icon.attr("title", "Edit Special");
        icon.click(function(ev) {
          var frame = $("<div>");
          frame.addClass("flexcolumn flex");

          var tRef = $(this).attr("index");
          var talentData = data.specials[tRef];

          game.locals["editSpecial"] = game.locals["editSpecial"] || sync.obj("editSpecial");
          game.locals["editSpecial"].data = duplicate(game.templates.page);
          game.locals["editSpecial"].data._t = "t";
          game.locals["editSpecial"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
          game.locals["editSpecial"].data.info.img = sync.newValue("Img", null);
          game.locals["editSpecial"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

          var newApp  = sync.newApp("ui_editPage").appendTo(frame);
          newApp.attr("autosave", true);
          newApp.attr("entry", true);
          game.locals["editSpecial"].addApp(newApp);

          var confirm = $("<button>").appendTo(frame);
          confirm.addClass("fit-x");
          confirm.append("Confirm");
          confirm.click(function(){
            if (sync.rawVal(game.locals["editSpecial"].data.info.name)) {
              data.specials[tRef].name = duplicate(game.locals["editSpecial"].data.info.name.current);
              data.specials[tRef].current = duplicate(game.locals["editSpecial"].data.info.notes.current);
              obj.sync("updateAsset");
              layout.coverlay("edit-special");
            }
            else {
              sendAlert({text : "Name required"});
            }
          });

          var pop = ui_popOut({
            target : $("body"),
            id : "edit-special",
            title : "Editing Special",
            style : {width : "400px", height : "400px"}
          }, frame);
          pop.resizable();
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });


        var icon = genIcon("trash").appendTo(specialCont);
        icon.addClass("destroy");
        icon.attr("index", index);
        icon.click(function() {
          // remove from spells, and remove from equipment
          var talentIndex = $(this).attr("index");
          ui_prompt({
            target : $(this),
            id : "delete-speical-confirmation",
            confirm : "Delete Special Rule",
            click : function(){
              delete data.specials[talentIndex];
              obj.sync("updateAsset");
            }
          });
          return false;
        });
      }
    }
  }
  return div;
});
