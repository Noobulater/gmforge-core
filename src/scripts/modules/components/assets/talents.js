//talents are felxible data that user enters, I have no intention of making this an automated system
sync.render("ui_renderTalent", function(obj, app, scope){
  if (!obj) {return $("<div>");}
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), minimized : (app.attr("minimized") == "true")};
  // if talentData is present, then use it to present data
  // only use scope.talentData when viewOnly
  var talentData = scope.talentData || obj.data;

  if (talentData.length) {
    return $("<div>"+talentData+"</div>");
  }

  var div = $("<div>");
  div.addClass("flex");

  if (!scope.viewOnly) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("background alttext flexrow flexaround");

    var existing = genIcon("list", "Existing").appendTo(optionsBar);
    existing.attr("title", "Select from a list of existing content");
    existing.click(function(){
      var content = sync.render("ui_existing")(obj, app, {lookup : app.attr("lookup") || "talents"});
      if (content.children().length) {
        ui_popOut({
          target : div,
          id : "item-picker",
          align : "top",
          style : {"width" : "50vw", "height" : "35vh", "overflow-y" : "scroll"}
        }, content).resizable();
      }
    });
    var pack = genIcon("envelope", "Content Pack");//.appendTo(optionsBar);
    pack.attr("title", "Select from a list of a content package");

    var del = genIcon("trash", "Clear All Data").appendTo(optionsBar);
    del.attr("title", "Clear out All Data");
    del.click(function(){
      obj.data = sync.newValue();
      obj.update();
    });
  }
  else {
    div.css("padding-left", "0.5em");
    div.css("padding-right", "0.5em");
  }

  var talentDiv = $("<div>").appendTo(div);
  talentDiv.addClass("flexbetween");

  if (!scope.viewOnly) {
    var name = genInput({
      parent : talentDiv,
      value : talentData.name,
      placeholder : "Talent Name",
      style : {"width" : "30%"}
    });
    name.change(function(){
      obj.data.name = $(this).val();
      obj.update();
    });

    var rank = genInput({
      parent : talentDiv,
      value : sync.modifier(obj.data, "rank") || "",
      placeholder : "Rank",
      style : {"width" : "30%"}
    });
    rank.change(function(){
      sync.modifier(obj.data, "rank", $(this).val());
      obj.update();
    });

    if ($("#talent-filter-list").length) {
      $("#talent-filter-list").remove();
    }
    var dataList = $("<datalist>").appendTo(filter);
    dataList.attr("id", "talent-filter-list");

    var filterList = {};
    for (var index in obj.data.talents) {
      var tData = obj.data.talents[index];
      if (tData && sync.modifier(tData, "filter")) {
        filterList[sync.modifier(tData, "filter")];
      }
    }
    for (var index in filterList) {
      var option = $("<option>").appendTo(dataList);
      option.attr("value", index);
    }

    var filter = genInput({
      parent : talentDiv,
      value : sync.modifier(obj.data, "filter") || "",
      type : "list",
      list : "talent-filter-list",
      placeholder : "Filter",
      style : {"width" : "10%"},
      disabled : scope.viewOnly
    });
    if (scope.viewOnly) {
      filter.css("background-color", "rgb(235,235,228)");
    }
    filter.val(sync.modifier(obj.data, "filter"));
    filter.change(function(){
      sync.modifier(obj.data, "filter", $(this).val());
      obj.update();
    });

    var notes = $("<textarea>").appendTo(div);
    notes.addClass("fit-x subtitle");
    notes.css("height", "200px");
    notes.append(sync.rawVal(obj.data));
    notes.change(function(){
      sync.rawVal(obj.data, $(this).val());
      obj.update();
    });
  }
  else {
    var name = $("<b>").appendTo(talentDiv);
    name.addClass("subtitle");
    name.append(talentData.name);

    if (sync.modifier(talentData, "rank")) {
      var level = $("<text>").appendTo(talentDiv);
      level.append(sync.modifier(talentData, "rank"));
    }

    talentDiv.click(function(){
      var frame = $("<div>");
      frame.addClass("flexcolumn flex");

      var tRef = $(this).attr("index");
      var talentData = scope.talentData;

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
        prompt : true,
        title : sync.rawVal(talentData.name),
        style : {width : "400px", height : "400px"}
      }, frame);
      pop.resizable();
    });
  }

  return div;
});

sync.render("ui_characterTalentList", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var div = $("<div>");
  div.css("background-color", "white");

  var keys = Object.keys(data.talents);
  keys.sort(function(a,b){
    var name1 = data.talents[a].name;
    var name2 = data.talents[b].name;
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
    var talentData = data.talents[index];
    if (talentData && (!scope.filter || sync.modifier(talentData, "filter") == scope.filter)) {
      var talentCont = $("<div>").appendTo(div);
      talentCont.addClass("fit-x outline talentContent smooth spadding");
      if (scope.minimized) {
        //talentCont.addClass("subtitle");
      }
      if (!scope.viewOnly) {
        var key = $("<text>").appendTo(talentCont);
        key.addClass("subtitle lrpadding flexmiddle");
        key.attr("title", "@c.talents."+index);
        key.append("@");
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
          key.attr("index", index);
          key.click(function(ev){
            var oldIndex = $(this).attr("index");
            var pop = ui_prompt({
              target : $(this),
              inputs : {"Change Key" : {placeholder : "Assign a new key"}},
              click : function(ev, inputs) {
                var newKey = inputs["Change Key"].val();
                if (newKey) {
                  if (!obj.data.talents[newKey] && obj.data.talents[oldIndex]) {
                    obj.data.talents[newKey] = obj.data.talents[oldIndex];
                    delete obj.data.talents[index];
                    obj.sync("updateAsset");
                  }
                  else {
                    sendAlert({text : "Another entry exists with this key"});
                  }
                }
                else {
                  sendAlert({text : "Enter valid key"});
                }
              }
            });
            ev.stopPropagation();
            ev.preventDefault();
          });
        }

        talentCont.addClass("flexbetween hover2");
        talentCont.css("cursor", "pointer");
        talentCont.attr("index", index);
        talentCont.click(function(){
          var frame = $("<div>");
          frame.addClass("flexcolumn flex");

          var tRef = $(this).attr("index");
          var talentData = data.talents[tRef];

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

      sync.render("ui_renderTalent")(obj, app, {talentData: talentData, viewOnly: true, minimized : scope.minimized}).appendTo(talentCont);

      if (!scope.viewOnly) {
        var icon = genIcon("edit").appendTo(talentCont);
        icon.attr("index", index);
        icon.attr("title", "Edit Talent");
        icon.click(function(ev) {
          var frame = $("<div>");
          frame.addClass("flexcolumn flex");

          var tRef = $(this).attr("index");
          var talentData = data.talents[tRef];

          game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
          game.locals["editTalent"].data = duplicate(game.templates.page);
          game.locals["editTalent"].data._t = "t";
          game.locals["editTalent"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
          game.locals["editTalent"].data.info.img = sync.newValue("Img", null);
          game.locals["editTalent"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

          var newApp = sync.newApp("ui_editPage").appendTo(frame);
          newApp.attr("autosave", true);
          newApp.attr("entry", true);
          game.locals["editTalent"].addApp(newApp);

          var confirm = $("<button>").appendTo(frame);
          confirm.addClass("fit-x");
          confirm.append("Confirm");
          confirm.click(function(){
            if (sync.rawVal(game.locals["editTalent"].data.info.name)) {
              data.talents[tRef].name = duplicate(game.locals["editTalent"].data.info.name.current);
              data.talents[tRef].current = duplicate(game.locals["editTalent"].data.info.notes.current);
              obj.sync("updateAsset");
              layout.coverlay("edit-talent");
            }
            else {
              sendAlert({text : "Name required"});
            }
          });

          var pop = ui_popOut({
            target : $("body"),
            id : "edit-talent",
            title : "Editing Talent",
            style : {width : "400px", height : "400px"}
          }, frame);
          pop.resizable();
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });

        var icon = genIcon("trash").appendTo(talentCont);
        icon.addClass("destroy");
        icon.attr("index", index);
        icon.click(function(ev) {
          // remove from spells, and remove from equipment
          var talentIndex = $(this).attr("index");
          ui_prompt({
            target : $(this),
            id : "delete-talent-confirmation",
            confirm : "Delete Talent",
            click : function(){
              delete data.talents[talentIndex];
              obj.sync("updateAsset");
            }
          });
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });
      }
    }
  }
  return div;
});

sync.render("ui_characterTalents", function(obj, app, scope) {
  if (!obj) {return $("<div>");}
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), minimized : (app.attr("minimized") == "true")};

  var data = obj.data;
  var div = $("<div>");
  if (!scope.hideTitle) {
    if (!scope.minimized) {
      var title = $("<h1 style='text-align: center;'>"+(scope.title || "Talents")+" </h1>").appendTo(div);
      if (!scope.viewOnly) {
        var icon = genIcon("plus").appendTo(title);
        icon.addClass("create");
        icon.click(function() {
          ui_prompt({
            target : $(this),
            inputs : {
              "Name" : ""
            },
            click : function(ev, inputs) {
              if (inputs["Name"].val() && !obj.data.talents[inputs["Name"].val()]) {
                obj.data.talents[inputs["Name"].val()] = sync.newValue(inputs["Name"].val());
                obj.sync("updateAsset");
              }
              else {
                sendAlert({text : "Invalid Name"});
              }
            }
          });
        });
      }
    }
    else {
      var title = $("<b>"+(scope.title || "Talents")+"</b>").appendTo(div);
      title.addClass("fit-x flexmiddle");
    }
  }

  var filterList = {};
  for (var index in obj.data.talents) {
    var tData = obj.data.talents[index];
    if (tData && sync.modifier(tData, "filter")) {
      filterList[sync.modifier(tData, "filter")] = true;
    }
  }
  if (Object.keys(filterList).length && !scope.minimized) {
    var talentTabs = genNavBar();
    talentTabs.css("margin", "1em");
    talentTabs.css("background-color", "white");
    talentTabs.appendTo(div);

    talentTabs.generateTab("All Talents", "list", function(parent) {
      parent.append(sync.render("ui_characterTalentList")(obj, app, {viewOnly: scope.viewOnly, minimized : true}));
    });
    function tabWrap(level) {
      talentTabs.generateTab(level, "", function(parent) {
        var columns = $("<div>").appendTo(parent);
        columns.addClass("flexcolumn");
        columns.append(sync.render("ui_characterTalentList")(obj, app, {viewOnly: scope.viewOnly, filter : level}));

        if (app) {
          app.attr("talent_tab", level);
        }
      });
    }

    for (var key in filterList) {
      tabWrap(key);
    }

    if (app) {
      if (!app.attr("talent_tab")) {
        app.attr("talent_tab", "All Talents");
      }
      talentTabs.selectTab(app.attr("talent_tab"));
    }
    else {
      talentTabs.selectTab("All Talents");
    }
  }
  else {
    div.addClass("spadding");
    sync.render("ui_characterTalentList")(obj, app, {viewOnly: scope.viewOnly, minimized : true}).appendTo(div);
  }
  return div;
});
