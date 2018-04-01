sync.render("ui_storyBoard", function(obj, app, scope){
  var data = obj.data;
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"};

  var zoom = parseInt(app.attr("zoom")) / 100 || 1;

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  if (!scope.viewOnly) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexaround flexwrap background outline alttext");

    var addAll = genIcon("list", "Insert All Adventure Pages").appendTo(optionsBar);
    var add = genIcon("plus", "Insert Adventure Page").appendTo(optionsBar);
    add.click(function(){
      var ignore = {};
      for (var i in data.story) {
        ignore[data.story[i].eID] = true;
      }
      var content = sync.render("ui_entList")(obj, app, {
        filter : "p",
        list : data.entities,
        ignore : ignore,
        click : function(ev, ui, eObj) {
          obj.data.story.push({
            eID : eObj.id(),
            x : 0,
            y : 0,
          });
          obj.sync("updateAsset");
          layout.coverlay("adventure-insert");
        }
      });

      ui_popOut({
        target : $(this),
        id : "adventure-insert",
      }, content);
    });
  }

  var editor = $("<div>").appendTo(div);
  editor.addClass("outline flexcolumn storyDrop");
  editor.css("flex", "1");
  editor.css("position", "relative");
  editor.css("overflow", "scroll");
  if (!scope.viewOnly) {
    editor.sortable({
      update : function(ev, ui){
        if ($(ui.item).attr("src")) {
          if ($(ui.item).attr("src") == "state") {
            game.state.update(); // refresh the list
          }
          else if ($(ui.item).attr("src") == "players") {
            game.players.update(); // refresh the list
          }
          else {
            game.entities.data[$(ui.item).attr("src")].update(); // refresh the list
          }
        }
        else {
          game.entities.update(); // refresh the list
        }
        // create a piece if there is an entity reference
        if ($(ui.item).attr("index")) {
          var ent = game.entities.data[$(ui.item).attr("index")];
          if (ent) {
            data.story.push({
              eID : $(ui.item).attr("index"),
              x : 0,
              y : 0,
            });
          }
        }
        obj.sync("updateAsset");
      }
    });
  }

  for (var i in data.story) {
    var sData = data.story[i];
    var index = sData.eID;
    var xPos = sData.x;
    var yPos = sData.y;
    var marker = $("<div>").appendTo(editor);
    marker.addClass("outline storyMarker");
    marker.css("position", "absolute");
    marker.css("top", yPos);
    marker.css("left", xPos);
    marker.attr("index", i);
    var zoom = 1;
    var ent = game.entities.data[index];
    if (ent && ent.data && ent.data["_t"] == "p") {
      var optionsBar = $("<div>").appendTo(marker);
      optionsBar.addClass("fit-x flexaround flexwrap outline background alttext");
      if (sData.c) {
        optionsBar.css("background-color", sData.c);
      }
      if (scope.viewOnly) {
        var del = genIcon("trash").appendTo(optionsBar);
        del.attr("title", "Click to Delete");
        del.attr("index", i);
        del.click(function(){
          data.story.splice($(this).attr("index"));
          obj.sync("updateAsset");
        });
        var edit = genIcon("pencil").appendTo(optionsBar);
        edit.attr("title", "Click to Edit");
        edit.attr("index", i);
        edit.click(function(){
          var sData = data.story[$(this).attr("index")];
          var index = sData.eID;
          var ent = game.entities.data[index];

          var content;
          if (scope.viewOnly) {
            content = sync.newApp("ui_renderPage");
          }
          else {
            content = sync.newApp("ui_editPage");
          }

          content.attr("viewOnly", "true");

          var popout = ui_popOut({
            title : sync.rawVal(ent.data.info.name),
            target : $(this),
            align : "bottom",
            minimize : true,
            maximize : true,
            dragThickness : "0.5em",
            resizable : true,
            style : {"max-width" : "none", width : "30vw", height : "30vh"},
          }, content);
          popout.css("padding", "0px");
          popout.addClass("floating-app");

          ent.addApp(content);
        });

        var status = genIcon("tint").appendTo(optionsBar);
        status.attr("title", "Click to complete");
        status.attr("index", i);
        status.click(function(){
          var targ = $(this).parent();
          var content = $("<div>");
          var title = $("<b>Title</b><br>").appendTo(content);

          var input = genInput({
            parent : content,
            value : data.story[$(this).attr("index")].t,
            style : {"font-size" : "0.8em"},
            i : $(this).attr("index")
          });
          input.change(function(){
            data.story[$(this).attr("i")].t = ($(this).val() || "").substring(0,25);
            obj.sync("updateAsset")
          });

          var colDiv = $("<div>").appendTo(content);
          colDiv.addClass("flexaround");
          colDiv.css("padding", "4px");

          var cols = ["#FFFFFF", "#BB0000", "#00BB00", "#000FFF", "#FFF000", "#B000BB", "#333333"];
          for (var c in cols) {
            var col = $("<div>").appendTo(colDiv);
            col.addClass("outline");
            col.css("cursor", "pointer");
            col.css("padding", "4px");
            col.css("background-color", cols[c]);
            col.attr("index", c);
            col.attr("i", $(this).attr("index"));
            col.click(function(){
              data.story[$(this).attr("i")].c = cols[$(this).attr("index")];
              obj.sync("updateAsset");
              layout.coverlay("adventure-page-color");
            });
          }
          ui_popOut({
            target : targ,
            id : "adventure-page-color",
            align : "top"
          }, content);
        });
      }
      var read = genIcon("book").appendTo(optionsBar);
      read.attr("title", "Click to Read");
      read.attr("index", i);
      read.click(function(){
        var sData = data.story[$(this).attr("index")];
        var index = sData.eID;
        var ent = game.entities.data[index];

        var content = sync.newApp("ui_renderPage");

        var popout = ui_popOut({
          title : sync.rawVal(ent.data.info.name),
          target : $(this),
          align : "bottom",
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {"max-width" : "none", width : "30vw", height : "60vh"},
        }, content);
        popout.css("padding", "0px");
        popout.addClass("floating-app");

        ent.addApp(content);
      });

      var ref = genIcon("envelope").appendTo(optionsBar);
      ref.attr("title", "Click to see References");

      var page = sync.render("ui_pageCard")(ent, app, {
        viewOnly : true,
        click : function(ev, ui, charObj) {
          var content = sync.newApp("ui_renderPage");

          var popout = ui_popOut({
            title : sync.rawVal(charObj.data.info.name),
            target : app,
            minimize : true,
            maximize : true,
            dragThickness : "0.5em",
            resizable : true,
            style : {"max-width" : "none", width : "30vw", height : "60vh"},
          }, content);
          popout.css("padding", "0px");
          popout.addClass("floating-app");

          charObj.addApp(content);
        }
      }).appendTo(marker);
      page.css("background-color", "white");

      if (sData.t) {
        marker.append("<i class='fit-x flexmiddle' style='font-size: 0.8em'>"+sData.t+"</i>");
      }
    }
    if (!scope.viewOnly) {
      marker.draggable({
        containment : "parent",
        snap: ".storyMarker",
        snapMode: "both",
        stop : function(ev, ui){
          // update everything out
          var helper = $(ui.helper);
          var storyData = obj.data.story[helper.attr("index")];
          var diffX = parseInt(ui.position.left) / zoom - storyData.x;
          var diffY = parseInt(ui.position.top) / zoom - storyData.y;
          storyData.x = (storyData.x + diffX);
          storyData.y = (storyData.y + diffY);
          obj.sync("updateAsset");
          ev.stopPropagation();
        }
      });
      marker.contextmenu(function(ev){
        var selected = $(".marker-selected");
        var piece = $(this);

        $(".marker-selected").removeClass("marker-selected");
        if (layout.mobile) {
          if (piece.hasClass("marker-selected")) {

          }
          else {
            piece.addClass("marker-selected");
          }
        }
        else {
          piece.addClass("marker-selected");
        }
        ev.stopPropagation();
      });
    }
  }

  return div;
});

sync.render("ui_planner", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"};
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  if (!obj) {
    var retDiv = $("<div>");

    var butt = $("<button>Click to Refresh</button>");
    butt.click(function(){
      retDiv.empty();
      retDiv.append(sync.render("ui_planner")(obj, app, scope));
    });
    butt.appendTo(retDiv);

    sync.render("ui_entList")(obj, app, {
      filter : "a",
      click : function(ev, ui, ent) {
        ent.addApp(app);
      }
    }).appendTo(retDiv);

    return retDiv;
  }

  var data = obj.data;
  if (!scope.viewOnly) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("background alttext outline flexrow flexaround");

    var trash = genIcon("trash", "Delete Adventure").appendTo(optionsBar);
    trash.attr("title", "Delete this Adventure");
    trash.click(function(){
      ui_prompt({
        target : $(this),
        id : "confirm-delete-adventure",
        click : function(){
          runCommand("deleteEntity", {id : obj.id()});
        }
      });
    });

    var clear = genIcon("remove", "Clear Adventure").appendTo(optionsBar);
    clear.attr("title", "Clear the contents of this Adventure");
    clear.click(function(){
      ui_prompt({
        target : $(this),
        id : "confirm-clear-adventure",
        click : function(){
          obj.data = duplicate(game.templates.adventure);
          obj.sync("updateAsset");
        }
      });
    });
    if (obj.data._c == getCookie("UserID")) {
      var store = genIcon("cloud-upload", "Export Adventure");
      if (obj.data["_uid"]) {
        store = genIcon("cloud-upload", "Re-Package Adventure");
      }
      store.appendTo(optionsBar);
      store.attr("title", "Save this Adventure as a Package");
      store.click(function(){
        runCommand("storeAsset", {id: obj.id()});
        layout.coverlay("quick-storage-popout");
      });
    }
  }

  var body = genNavBar();
  body.addClass("fit-x flexcolumn flex");
  body.appendTo(div);

  body.generateTab("Adventure Info", "info-sign", function(parent){
    parent.addClass("flexcolumn flex");

    var content = $("<div>").appendTo(parent);
    content.addClass("flexcolumn");
    content.css("flex", "1");

    var newApp;
    if (!scope.viewOnly) {
      newApp = sync.render("ui_editPage")(obj, app, scope);
    }
    else {
      newApp = sync.render("ui_renderPage")(obj, app, scope);
    }

    content.append(newApp);
    if (app) {
      app.attr("_tab", "Adventure Info");
    }
  });

  body.generateTab("Story Board", "book", function(parent){
    parent.addClass("flexcolumn flex");

    var content = $("<div>").appendTo(parent);
    content.addClass("flexcolumn");
    content.css("flex", "1");

    content.append(sync.render("ui_storyBoard")(obj, app, scope));
    if (app) {
      app.attr("_tab", "Story Board");
    }
  });

  function tabWrap(name, icon, filter, click) {
    body.generateTab(name, icon, function(parent){
      parent.addClass("flexcolumn flex");

      var optionsBar = $("<div>").appendTo(parent);
      optionsBar.addClass("fit-x flexaround outline flexwrap background alttext");

      var wrapper = $("<div>").appendTo(parent);
      wrapper.addClass("flexcolumn flex");

      //genIcon("list", "Import All "+name+"").appendTo(optionsBar);
      if (!scope.viewOnly) {
      var add = genIcon("share-alt", "Insert "+name).appendTo(optionsBar);

        add.click(function(){
          var ignore = {};
          for (var i in game.entities.data) {
            if (isNaN(i)) {
              ignore[i] = true;
            }
          }
          for (var key in obj.data.entities) {
            ignore[obj.data.entities[key]] = true;
          }
          var content = sync.render("ui_entList")(obj, app, {
            filter : filter,
            click : click,
            ignore : ignore,
          });
          if (content.children().length > 0) {
            ui_popOut({
              target : $(this),
              id : "adventure-insert",
            }, content);
          }
        });
      }
      var ignore = {};
      for (var i in game.entities.data) {
        if (isNaN(i)) {
          ignore[i] = true;
        }
      }
      for (var key in obj.data.entities) {
        ignore[obj.data.entities[key]] = true;
      }
      var content = $("<div>").appendTo(wrapper);
      content.addClass("flexaround flexwrap");
      content.css("flex", "1");

      for (var key in obj.data.entities) {
        var ent = game.entities.data[obj.data.entities[key]];
        if (ent && ent.data && ent.data["_t"] == filter) {
          var wrapper = $("<div>").appendTo(content);
          wrapper.addClass("flexcolumn");

          if (filter == "b") {
            wrapper.append(sync.render("ui_boardCard")(ent, app, {viewOnly : true}));
          }
          else if (filter == "c") {
            wrapper.append(sync.render("ui_charCard")(ent, app, {viewOnly : true}));
          }
          else if (filter == "g") {
            wrapper.append(sync.render("ui_groupCard")(ent, app, {viewOnly : true}).addClass("outline"));
          }
          else if (filter == "p") {
            wrapper.append(sync.render("ui_pageCard")(ent, app, {
              viewOnly : true,
              click : function(ev, ui, charObj) {
                var content = sync.newApp("ui_renderPage");

                var popout = ui_popOut({
                  title : sync.rawVal(charObj.data.info.name),
                  target : app,
                  align : "bottom",
                  minimize : true,
                  maximize : true,
                  dragThickness : "0.5em",
                  resizable : true,
                  style : {"max-width" : "none", width : "30vw", height : "60vh"},
                }, content);
                popout.css("padding", "0px");
                popout.addClass("floating-app");

                charObj.addApp(content);
              }
            }));
          }
          else if (filter == "v") {
            wrapper.append(sync.render("ui_vehicleCard")(ent, app, {viewOnly : true}));
          }
          if (!scope.viewOnly) {
            var optionsBar = $("<div>").appendTo(wrapper);
            optionsBar.addClass("fit-x flexaround focus flexwrap outline");

            var remove = genIcon("remove").appendTo(optionsBar);
            remove.addClass("alttext");
            remove.attr("index", ent.id());
            remove.click(function(){
              for (var key in obj.data.entities) {
                if (obj.data.entities[key] == $(this).attr("index")) {
                  obj.data.entities.splice(key, 1);
                  break;
                }
              }
              obj.sync("updateAsset");
            });
          }
        }
      }

      if (app) {
        app.attr("_tab", name);
      }
    });
  }
  tabWrap("Boards", "globe", "b",
    function(ev, ui, eObj) {
      if (!util.contains(data.entities, eObj.id())) {
        data.entities.push(eObj.id());
      }
      obj.sync("updateAsset");
      layout.coverlay("adventure-insert");
    }
  );
  tabWrap("Actors", "user", "c",
  function(ev, ui, eObj) {
    if (!util.contains(data.entities, eObj.id())) {
      data.entities.push(eObj.id());
    }
    obj.sync("updateAsset");
    layout.coverlay("adventure-insert");
  });
  tabWrap("Groups", "unchecked", "g",
  function(ev, ui, eObj) {
    if (!util.contains(data.entities, eObj.id())) {
      data.entities.push(eObj.id());
    }
    // loop through and add group contents
    for (var i in eObj.data.list) {
      if (!util.contains(data.entities, eObj.data.list[i])) {
        data.entities.push(eObj.data.list[i]);
      }
    }
    obj.sync("updateAsset");
    layout.coverlay("adventure-insert");
  });
  tabWrap("Resources", "duplicate", "p",
  function(ev, ui, eObj) {
    if (!util.contains(data.entities, eObj.id())) {
      data.entities.push(eObj.id());
    }
    obj.sync("updateAsset");
    layout.coverlay("adventure-insert");
  });
  tabWrap("Vehicles", "plane", "v",
  function(ev, ui, eObj) {
    if (!util.contains(data.entities, eObj.id())) {
      data.entities.push(eObj.id());
    }
    obj.sync("updateAsset");
    layout.coverlay("adventure-insert");
  });
  if (app) {
    if (!app.attr("_tab")) {
      app.attr("_tab", "Adventure Info");
    }
    body.selectTab(app.attr("_tab"));
  }
  else {
    body.selectTab("Adventure Info");
  }
  //body.css("flex", "1");
  //body.addClass("outline");

  return div;
});
