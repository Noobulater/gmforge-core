boardApi.pix.menu = {}


function buildHotKey(desc, name, controls){
  var hotkeyDiv = $("<div>");
  hotkeyDiv.addClass("flexrow flexbetween");
  hotkeyDiv.css("margin-bottom","5px");
  if (name) {
    var icon = $("<div>").appendTo(hotkeyDiv);
    icon.addClass("flexmiddle alttext lrmargin");
    icon.css("background-size", "contain");
    icon.css("background-repeat", "no-repeat");
    icon.css("background-position", "center");
    icon.css("font-size", "1.2em");
    icon.css("font-weight", "nonrmal");
    icon.append(genIcon({raw : true, icon : name}));
    hotkeyDiv.append("<div class='flexmiddle lrmargin'><b class='alttext'>=</b></div>");
  }

  var controlDiv = $("<div>").appendTo(hotkeyDiv);
  controlDiv.addClass("flex flexrow");

  var combos = controls.split("+");
  for (var j in combos) {
    var control = combos[j].trim();
    var icon = $("<div>").appendTo(controlDiv);
    icon.css("background-size", "contain");
    icon.css("background-repeat", "no-repeat");
    icon.css("background-position", "center");
    var plusstr = "+";
    if (control == "mright") {
      icon.css("background-image", "url('/content/mouse_right.png')");
      icon.css("width", "1.8em");
      icon.css("height", "1.8em");
    }
    else if (control == "mleft") {
      icon.css("background-image", "url('/content/mouse_left.png')");
      icon.css("width", "1.8em");
      icon.css("height", "1.8em");
    }
    else if (control == "middle") {
      icon.css("background-image", "url('/content/mouse_middle.png')");
      icon.css("width", "1.8em");
      icon.css("height", "1.8em");
    }
    else if (control == "mouse") {
      icon.css("background-image", "url('/content/mouse.png')");
      icon.css("width", "1.8em");
      icon.css("height", "1.8em");
    }
    else if (control == "arrow-left") {
      icon.addClass("flexmiddle hardoutline spadding");
      icon.css("background-color", "white");
      icon.append(genIcon({raw : true, icon : "arrow-left"}));
    }
    else if (control == "arrow-up") {
      icon.addClass("flexmiddle hardoutline spadding");
      icon.css("background-color", "white");
      icon.append(genIcon({raw : true, icon : "arrow-up"}));
    }
    else if (control == "arrow-right") {
      icon.addClass("flexmiddle hardoutline spadding");
      icon.css("background-color", "white");
      icon.append(genIcon({raw : true, icon : "arrow-right"}));
    }
    else if (control == "arrow-down") {
      icon.addClass("flexmiddle hardoutline spadding");
      icon.css("background-color", "white");
      icon.append(genIcon({raw : true, icon : "arrow-down"}));
    }
    else {
      icon.addClass("flexmiddle lrpadding");
      icon.css("background-color", "white");
      icon.css("font-weight", "bolder");
      icon.css("color", "#333");
      icon.css("border-radius","2px");
      icon.css("text-shadow", "none");
      icon.text(control);
    }
    if (j < combos.length-1) {
      controlDiv.append("<b class='alttext lrmargin flexmiddle'>"+plusstr+"</b>");
    }
  }
  hotkeyDiv.attr("title",desc);
  hotkeyDiv.tooltip({
    container: 'body',
    placement: 'right'
  });
  return hotkeyDiv;
}

boardApi.pix.buildMenu = function(obj, app, scope, opaque) {
  var data = obj.data;

  var stage = boardApi.pix.apps[app.attr("id")].stage;
  var userID = app.attr("userID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  var gridWidth = data.gridW;
  var gridHeight = data.gridH;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var zoom = Number(app.attr("zoom")) / 100 || 1;
  var scrollLeft = 0;
  var scrollTop = 0;
  var portWidth = app.attr("divWidth");
  var portHeight = app.attr("divHeight");




  var newMenu = $("<div>");
  newMenu.addClass("flexrow padding");
  newMenu.attr("id", app.attr("id")+"-menu-"+obj.id());
  newMenu.css("position", "absolute");
  newMenu.css("left", "8%");
  newMenu.css("bottom", "8%");
  newMenu.css("max-width", "84%");

  if (!opaque) {
    newMenu.css("opacity", "0.15");
    newMenu.css("transition", "opacity 0.1s");
    newMenu.css("pointer-events", "none");
  }

  var optionsBar = $("<div>").appendTo(newMenu);
  optionsBar.addClass("flexcolumn boardMenu");
  optionsBar.css("width", "175px");
  optionsBar.css("pointer-events", "auto");
  optionsBar.css("text-align", "left");
  optionsBar.hover(function(){
    newMenu.css("opacity", "1.0");
  },
  function(){
    newMenu.css("opacity", "0.15");
  });
  optionsBar.mousedown(function(ev){
    _mouseupCleanup(ev);
    ev.stopPropagation();
  });

  var menuContainer = $("<div>");
  menuContainer.appendTo(newMenu);
  menuContainer.addClass("flexcolumn padding flex");
  menuContainer.attr("id", app.attr("id")+"-menuContent-"+obj.id());
  menuContainer.css("pointer-events", "none");
  menuContainer.append("<div class='flex'></div>");

  var menuContent = $("<div>");

  function rebuildMenu() {
    menuContainer.empty();
    menuContainer.append("<div class='flex'></div>");
    menuContent.css("min-height", "");
    if (app.attr("creating")) {
      if (!game.locals["pieceBuilding"]) {
        game.locals["pieceBuilding"] = sync.obj();
        game.locals["pieceBuilding"].data = {};
      }
      game.locals["pieceBuilding"].data.target = app.attr("id");
      game.locals["pieceBuilding"].data.pieceData = game.locals["pieceBuilding"].data.pieceData || {};

      menuContent = sync.newApp("ui_pieceBuilder").appendTo(menuContainer);
      menuContent.addClass("smooth padding boardMenu");
      menuContent.attr("target", obj.id());
      menuContent.attr("targetApp", app.attr("id"));
      menuContent.css("pointer-events", "auto");
      menuContent.css("overflow", "hidden");
      menuContent.css("min-height", "250px");
      menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      if (game.locals["pieceBuilding"].data.layer && game.locals["pieceBuilding"].data.piece) {
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        menuContent.css("transition", "background 2.0s");
      }
      menuContent.hover(function(){
        newMenu.css("opacity", "1.0");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      },
      function(){
        newMenu.css("opacity", "0.15");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      });
      menuContent.mousedown(function(ev){
        _mouseupCleanup(ev);
        ev.stopPropagation();
      });

      menuContent.addClass("fit-x");
      menuContent.css("font-size", "1.0em");
      game.locals["pieceBuilding"].addApp(menuContent);
    }
    else {
      $("#asset-manager-board-"+obj.id()).remove();
    }
    if (app.attr("drawing")) {
      menuContent = sync.newApp("ui_drawingControls").appendTo(menuContainer);
      menuContent.addClass("smooth padding boardMenu");
      menuContent.attr("target", obj.id());
      menuContent.attr("targetApp", app.attr("id"));
      menuContent.css("pointer-events", "auto");
      menuContent.css("overflow", "hidden");
      menuContent.css("min-height", "225px");
      menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      menuContent.css("transition", "background 2.0s");
      menuContent.hover(function(){
        newMenu.css("opacity", "1.0");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      },
      function(){
        newMenu.css("opacity", "0.15");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      });
      menuContent.mousedown(function(ev){
        _mouseupCleanup(ev);
        ev.stopPropagation();
      });

      if (!game.locals["drawing"]) {
        game.locals["drawing"] = sync.obj();
        game.locals["drawing"].data = {};
      }
      game.locals["drawing"].data.target = app.attr("id");

      menuContent.addClass("alttext fit-x");
      menuContent.css("font-size", "1.4em");

      game.locals["drawing"].addApp(menuContent);
    }

    if (app.attr("configuring") && hasRights) {
      if (app.attr("background")) {
        menuContent = sync.render("ui_layerOptions")(obj, app, scope).appendTo(menuContainer);
        menuContent.addClass("smooth padding boardMenu");
        menuContent.css("pointer-events", "auto");
        menuContent.css("overflow", "hidden");
        menuContent.css("min-height", "200px");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        menuContent.css("transition", "background 2.0s");
        menuContent.hover(function(){
          newMenu.css("opacity", "1.0");
          menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        },
        function(){
          newMenu.css("opacity", "0.15");
          menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        });
        menuContent.mousedown(function(ev){
          _mouseupCleanup(ev);
          ev.stopPropagation();
        });
        menuContent.addClass("alttext fit-x");
        menuContent.css("font-size", "1.6em");
      }
      else {
        if (app.attr("configuring") == "background") {
          menuContent = sync.render("ui_mapBackground")(obj, app, scope).appendTo(menuContainer);
        }
        else if (app.attr("configuring") == "grid") {
          menuContent = sync.render("ui_mapGrid")(obj, app, scope).appendTo(menuContainer);
        }
        else {
          menuContent = sync.render("ui_mapOptions")(obj, app, scope).appendTo(menuContainer);
        }
        menuContent.addClass("smooth padding boardMenu");
        menuContent.css("pointer-events", "auto");
        menuContent.css("overflow", "hidden");
        menuContent.css("min-height", "200px");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        menuContent.css("transition", "background 2.0s");
        menuContent.hover(function(){
          newMenu.css("opacity", "1.0");
          menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        },
        function(){
          newMenu.css("opacity", "0.15");
          menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
        });
        menuContent.mousedown(function(ev){
          _mouseupCleanup(ev);
          ev.stopPropagation();
        });
        menuContent.addClass("alttext fit-x");
        menuContent.css("font-size", "1.6em");
      }
    }

    if (app.attr("background") == "true" && !app.attr("configuring") && hasRights) {
      menuContent = sync.newApp("ui_easySheets").appendTo(menuContainer);
      menuContent.addClass("boardMenu");
      menuContent.attr("target", obj.id());
      menuContent.attr("targetApp", app.attr("id"));
      menuContent.css("pointer-events", "auto");
      menuContent.css("overflow", "hidden");
      menuContent.css("min-height", "260px");
      menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      menuContent.css("transition", "background 2.0s");
      menuContent.hover(function(){
        newMenu.css("opacity", "1.0");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      },
      function(){
        newMenu.css("opacity", "0.15");
        menuContent.css("background", "radial-gradient(rgba(34,34,34,1.0), rgba(0,0,0,1.0))");
      });
      menuContent.mousedown(function(ev){
        _mouseupCleanup(ev);
        ev.stopPropagation();
      });
      var newObj = sync.dummyObj();
      newObj.data = {};
      newObj.addApp(menuContent);
    }
    if (menuContainer.children().length <= 1) {
      menuContent = $("<div>").appendTo(menuContainer);
      menuContent.addClass("boardMenu flexcolumn smooth lrmargin");
      menuContent.css("pointer-events", "auto");
      menuContent.css("overflow", "hidden");
      menuContent.hover(function(){
        newMenu.css("opacity", "1.0");
      },
      function(){
        newMenu.css("opacity", "0.15");
      });
      menuContent.mousedown(function(ev){
        _mouseupCleanup(ev);
        ev.stopPropagation();
      });

      var hints = $("<div>").appendTo(menuContent);
      hints.addClass("flexcolumn flexmiddle alttext subtitle");
      hints.css("align-items","flex-start");
      buildHotKey("Map Menu","list-alt", "mright").appendTo(hints);
      buildHotKey("Ping/Beacon", "hand-up", "mleft + mleft").appendTo(hints);
      buildHotKey("Move around", "move", "mright + mouse").appendTo(hints);
      buildHotKey("Select", "resize-full", "mleft + mouse").appendTo(hints);
      buildHotKey("Measure","resize-horizontal", "Ctrl + mleft").appendTo(hints);

      menuContainer.removeClass("padding")
    }
  }
  rebuildMenu();

  function rebuildOptions() {
    optionsBar.empty();
    var option = $("<highlight>").appendTo(optionsBar);
    option.addClass("flexrow hover2 fit-x alttext flexmiddle");
    option.css("font-size", "1.4em");
    option.css("-webkit-text-stroke-color", "white");
    option.css("-webkit-text-stroke-width", "1px");
    option.css("-webkit-text-fill-color", "white");

    var nameInput = genInput({
      parent : option,
      classes : "line smooth subtitle middle",
      disabled : !hasRights,
      value : sync.rawVal(data.info.name) || "[No Name]",
      style : {"width" : "300px", "background" : "rgb(33,46,55)"}
    });

    if (nameInput.val() && nameInput.val().length > 15) {
      option.css("font-size", "1.2em");
    }

    nameInput.change(function(){
      sync.rawVal(obj.data.info.name, $(this).val() || "[No Name]");
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
    nameInput.blur(function(){
      name.show();
      nameInput.hide();
    });
    nameInput.hide();
    nameInput.click(function(ev) {
      ev.stopPropagation();
    });

    var name = $("<b>").appendTo(option);
    name.addClass("underline");
    name.text(sync.rawVal(data.info.name) || "[No Name]");

    if (hasRights) {
      name.attr("title", "Rename Map");
      option.click(function(){
        name.hide();
        nameInput.show();
        nameInput.focus();
      });
    }

    var newZoomWrap = $("<div>").appendTo(optionsBar);
    newZoomWrap.addClass("alttext fit-x");
    newZoomWrap.css("font-size", "1.4em");

    var zoomContainer = $("<div>").appendTo(newZoomWrap);
    zoomContainer.addClass("flexrow flexmiddle fit-x");

    var zoomRange = genInput({
      classes : "flex large",
      parent : zoomContainer,
      type : "range",
      min : 40,
      max : 200,
      step : 1,
    }, 1);
    zoomRange.val(100);
    zoomRange.css("height", "14px");
    zoomRange.attr("id", app.attr("id")+"-zoom-range-"+obj.id());
    zoomRange.val(zoom * 100);
    zoomRange.bind("input", function(){
      var lastZoom = zoom;

      layout.coverlay($(".piece-quick-edit"));
      app.attr("zoom", Number($(this).val()));

      zoom = $(this).val()/100;

      stage.dZoom = zoom;

      zoomIn.attr("title", $(this).val()+"%");
      //boardApi.drawCursors(board, true);
    });
    zoomRange.contextmenu(function(){
      zoomRange.val(data.vZ || 100);
      zoomRange.change();
      return false;
    });
    zoomRange.change(function(){
      var lastZoom = zoom;

      layout.coverlay($(".piece-quick-edit"));
      app.attr("zoom", Number($(this).val()));

      zoom = $(this).val()/100;

      stage.dZoom = zoom;

      for (var key in boardApi.pix.selections) {
        if (boardApi.pix.selections[key].app == app.attr("id")) {
          boardApi.pix.selections[key].wrap.update();
        }
      }

      zoomIn.attr("title", $(this).val()+"%");
      //boardApi.drawCursors(board, true);
      if (lastZoom == 0.4 && $(this).val() == 40) {
        var ent = getEnt(obj.data.options.zoomAsset);
        if (ent && ent.data && ent.data._t == "b") {
          game.state.data.tabs = game.state.data.tabs || [];
          var tabs = game.state.data.tabs;
          var active;
          for (var i in tabs) {
            if (ent.id() == tabs[i].index) {
              active = i;
              break;
            }
          }
          app.attr("zoom", 100);
          app.removeAttr("scrollLeft");
          app.removeAttr("scrollTop");

          for (var lid in ent.data.layers) {
            var layerData = ent.data.layers[lid];
            for (var pid in layerData.p) {
              if (obj.id() == layerData.p[pid].eID) {
                app.attr("scrollLeft", (layerData.p[pid].x + layerData.p[pid].w/2 - app.width()/2)*-1);
                app.attr("scrollTop", (layerData.p[pid].y + layerData.p[pid].h/2 - app.height()/2)*-1);
                break;
              }
            }
          }

          if (!active) {
            active = tabs.length;
            game.state.data.tabs.push({index : ent.id(), ui : "ui_board"});
            for (var i in game.state._apps) {
              if ($("#"+game.state._apps[i]).length) {
                $("#"+game.state._apps[i]).attr("tab", active);
              }
            }
            game.state.sync("updateState");
          }
          else {
            for (var i in game.state._apps) {
              if ($("#"+game.state._apps[i]).length) {
                $("#"+game.state._apps[i]).attr("tab", active);
              }
            }
            game.state.update();
          }
        }
      }
      else if (lastZoom = 2 && $(this).val() == 200) {
        var selections = null;
        for (var key in boardApi.pix.selections) {
          if (boardApi.pix.selections[key].app == app.attr("id")) {
            if (!selections) {
              selections = selections || {};
            }
            selections[key] = boardApi.pix.selections[key];
          }
        }
        if (selections && Object.keys(selections).length == 1) {
          var selectData = selections[Object.keys(selections)[0]];
          if (selectData.type == "p" && selectData.board == obj.id()) {
            var pieceData = obj.data.layers[selectData.layer][selectData.type][selectData.index];
            var ent = getEnt(pieceData.eID);
            if (ent && ent.data && ent.data._t == "b") {
              game.state.data.tabs = game.state.data.tabs || [];
              var tabs = game.state.data.tabs;
              var active;
              for (var i in tabs) {
                if (ent.id() == tabs[i].index) {
                  active = i;
                  break;
                }
              }
              app.removeAttr("zoom");
              app.removeAttr("scrollLeft");
              app.removeAttr("scrollTop");
              if (!active) {
                active = tabs.length;
                game.state.data.tabs.push({index : ent.id(), ui : "ui_board"});
                for (var i in game.state._apps) {
                  if ($("#"+game.state._apps[i]).length) {
                    $("#"+game.state._apps[i]).attr("tab", active);
                  }
                }
                game.state.sync("updateState");
              }
              else {
                for (var i in game.state._apps) {
                  if ($("#"+game.state._apps[i]).length) {
                    $("#"+game.state._apps[i]).attr("tab", active);
                  }
                }
                game.state.update();
              }
            }
          }
        }
      }
    });


    var zoomIn = genIcon("search").appendTo(zoomContainer);
    zoomIn.addClass("lrpadding");
    zoomIn.attr("title", "Set Manual Zoom");
    zoomIn.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {"Set Zoom" : {placeholder : zoomIn.attr("title") || Math.round(zoom*100) + "%", type : "number", step : 5, min : 25, max : 500}},
        click : function(ev, inputs){
          if (inputs["Set Zoom"].val()) {
            zoomRange.attr("max", "500");
            zoomRange.val(inputs["Set Zoom"].val());
            zoomRange.change();
            zoomRange.attr("max", "200");
          }
        }
      });
    });

    if (hasRights) {
      var option = $("<div>").appendTo(optionsBar);
      option.addClass("alttext hover2 fit-x spadding option outline smooth");
      option.css("font-size", "1.2em");
      if (app.attr("background")) {
        option.addClass("flexmiddle");
        option.text("Layer");
      }
      else {
        option.text("Background");
      }
      if (app.attr("configuring") == "background") {
        option.addClass("highlight");
      }
      else {
        option.addClass("background");
      }
      option.click(function(){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }
        app.removeAttr("creating");
        app.removeAttr("drawing");
        if (app.attr("configuring") == "background") {
          app.removeAttr("configuring");
        }
        else {
          app.attr("configuring", "background");
        }
        optionsBar.find(".option").addClass("background");
        optionsBar.find(".option").removeClass("highlight");
        if (app.attr("configuring") == "background") {
          $(this).addClass("highlight");
          $(this).removeClass("background");
        }
        else {
          $(this).addClass("background");
          $(this).removeClass("highlight");
        }
        rebuildMenu();
      });
    }

    if (!game.locals["drawing"]) {
      game.locals["drawing"] = sync.obj();
      game.locals["drawing"].data = {};
    }
    if ((app.attr("background") != "true") && hasRights) {
      var option = $("<div>");//.appendTo(optionsBar);
      option.addClass("alttext hover2 fit-x spadding option outline smooth");
      option.css("font-size", "1.2em");
      option.text("Create");
      if (app.attr("creating")) {
        option.addClass("highlight");
      }
      else {
        option.addClass("background");
      }
      option.click(function(){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }
        app.removeAttr("drawing");
        app.removeAttr("configuring");
        if (game.locals["pieceBuilding"]) {
          delete game.locals["pieceBuilding"].data.layer;
          delete game.locals["pieceBuilding"].data.piece;
        }

        if (app.attr("creating")) {
          app.removeAttr("creating");
        }
        else {
          app.attr("creating", "true");
        }
        optionsBar.find(".option").addClass("background");
        optionsBar.find(".option").removeClass("highlight");
        if (app.attr("creating")) {
          $(this).addClass("highlight");
          $(this).removeClass("background");
        }
        else {
          $(this).addClass("background");
          $(this).removeClass("highlight");
        }
        rebuildMenu();
      });
    }
    if ((app.attr("background") != "true") && ((!scope.local && (data.options && data.options.freeDraw)) || hasRights)) {
      var optionDraw = $("<div>").appendTo(optionsBar);
      optionDraw.addClass("alttext hover2 fit-x spadding option outline smooth");
      optionDraw.css("font-size", "1.2em");
      optionDraw.text("Draw");
      if (app.attr("drawing") && !game.locals["drawing"].data.fog) {
        optionDraw.addClass("highlight");
      }
      else {
        optionDraw.addClass("background");
      }
      optionDraw.click(function(){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }
        app.removeAttr("creating");
        app.removeAttr("configuring");
        if (app.attr("drawing") && !game.locals["drawing"].data.fog) {
          app.removeAttr("drawing");
        }
        else {
          app.attr("drawing", "true");
          delete game.locals["drawing"].data.fog;
        }
        optionsBar.find(".option").addClass("background");
        optionsBar.find(".option").removeClass("highlight");
        if (app.attr("drawing")) {
          $(this).addClass("highlight");
          $(this).removeClass("background");
          game.locals["drawing"].data.drawing = "line";
        }
        else {
          $(this).addClass("background");
          $(this).removeClass("highlight");
        }
        rebuildMenu();
      });

      if (hasRights) {
        var option = $("<div>").appendTo(optionsBar);
        option.addClass("alttext hover2 fit-x spadding option outline smooth");
        option.css("font-size", "1.2em");
        option.text("Fog of War");
        if (app.attr("drawing") && game.locals["drawing"].data.fog) {
          option.addClass("highlight");
        }
        else {
          option.addClass("background");
        }
        option.click(function(){
          if (game.locals["drawing"]) {
            delete game.locals["drawing"].data.drawing;
          }
          app.removeAttr("creating");
          app.removeAttr("configuring");
          if (app.attr("drawing") && game.locals["drawing"].data.fog) {
            app.removeAttr("drawing");
          }
          else {
            app.attr("drawing", "true");
            game.locals["drawing"].data.fog = true;
          }
          optionsBar.find(".option").addClass("background");
          optionsBar.find(".option").removeClass("highlight");
          if (app.attr("drawing")) {
            $(this).addClass("highlight");
            $(this).removeClass("background");
          }
          else {
            $(this).addClass("background");
            $(this).removeClass("highlight");
          }
          rebuildMenu();
        });
      }

      if (hasRights) {
        var option = $("<div>").appendTo(optionsBar);
        option.addClass("alttext hover2 fit-x spadding option outline smooth");
        option.css("font-size", "1.2em");
        if (app.attr("background")) {
          option.addClass("flexmiddle");
          option.text("Layer");
        }
        else {
          option.text("Grid");
        }
        if (app.attr("configuring") == "grid") {
          option.addClass("highlight");
        }
        else {
          option.addClass("background");
        }
        option.click(function(){
          if (game.locals["drawing"]) {
            delete game.locals["drawing"].data.drawing;
          }
          app.removeAttr("creating");
          app.removeAttr("drawing");
          if (app.attr("configuring") == "grid") {
            app.removeAttr("configuring");
          }
          else {
            app.attr("configuring", "grid");
          }
          optionsBar.find(".option").addClass("background");
          optionsBar.find(".option").removeClass("highlight");
          if (app.attr("configuring") == "grid") {
            $(this).addClass("highlight");
            $(this).removeClass("background");
          }
          else {
            $(this).addClass("background");
            $(this).removeClass("highlight");
          }
          rebuildMenu();
        });
      }
    }
    if (hasRights && !app.attr("background")) {
      var option = $("<div>").appendTo(optionsBar);
      option.addClass("alttext hover2 fit-x spadding option outline smooth");
      option.css("font-size", "1.2em");
      option.text("Map Builder");
      if (app.attr("menuContent")) {
        option.addClass("highlight");
      }
      else {
        option.addClass("background");
      }
      option.click(function(){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }
        app.removeAttr("drawing");
        app.removeAttr("creating");
        app.removeAttr("configuring");
        app.attr("background", "true");
        rebuildMenu();
        rebuildOptions();
      });
    }

    if (app.attr("background") == "true") {
      var option = $("<div>").appendTo(optionsBar);
      option.addClass("alttext highlight hover2 fit-x spadding flexmiddle");
      option.css("font-size", "1.2em");
      option.text("Exit Builder");
      option.click(function(){
        app.removeAttr("background");
        app.removeAttr("drawing");
        app.removeAttr("creating");
        app.removeAttr("configuring");
        if (boardApi.saveChanges(obj, true)) {
          app.removeAttr("local");
        }
        floatingTile = null;
        rebuildOptions();
        rebuildMenu();
      });
    }

    var iconBar = $("<div>").appendTo(optionsBar);
    iconBar.addClass("flexrow flexbetween flexwrap spadding");
    iconBar.css("background", "rgba(0,0,0,0.8)");

    var iconBar = $("<div>").appendTo(optionsBar);
    iconBar.addClass("flexrow flexbetween spadding");
    iconBar.css("background", "rgba(0,0,0,0.8)");

    if ((!scope.local && (data.options && data.options.cursorToggle)) || hasRights) {
      if (app.attr("background") != "true") {
        var option = genIcon("hand-up").appendTo(iconBar);
        option.addClass("hover2 flexmiddle");
        option.attr("title", "Hide your Cursor");
        if (app.attr("hideCursor") == "true") {
          option.removeClass("highlight");
          option.addClass("dull");
          option.attr("title", "Show your Cursor");
        }
        else {
          option.addClass("alttext");
        }
        option.click(function(){
          if (app.attr("hideCursor") == "true") {
            $(this).removeClass("dull");
            $(this).addClass("alttext");
            app.removeAttr("hideCursor");
            $(this).attr("title", "Hide your Cursor");
          }
          else {
            app.attr("hideCursor", "true");
            $(this).removeClass("alttext");
            $(this).addClass("dull");
            $(this).attr("title", "Show your Cursor");
            if (!scope.local) {
              runCommand("updateBoardCursor", {id : obj.id(), data : {x : 0, y : 0, v : true}});
            }
          }
        });
      }
      else {
        runCommand("updateBoardCursor", {id : obj.id(), data : {x : 0, y : 0, v : true}});
      }
    }

    var option = genIcon("screenshot").appendTo(iconBar);
    option.addClass("hover2 alttext flexmiddle");
    option.attr("title", "Center To Default View");
    option.click(function(){
      var portWidth = Number(app.attr("divWidth") || 0);
      var portHeight = Number(app.attr("divHeight") || 0);
      boardApi.pix.scrollTo(app, obj.data.vX || 0 + portWidth/2, obj.data.vY || 0 + portHeight/2);
    });

    if (hasRights && !app.attr("background")) {
      var option = $("<div>").appendTo(iconBar);
      option.addClass("alttext hover2 flexmiddle subtitle option alttext spadding outline smooth");
      option.text("Options");
      if (app.attr("configuring") == "advanced") {
        option.addClass("highlight");
      }
      else {
        option.addClass("background");
      }
      option.click(function(){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }
        app.removeAttr("creating");
        app.removeAttr("drawing");
        if (app.attr("configuring") == "advanced") {
          app.removeAttr("configuring");
        }
        else {
          app.attr("configuring", "advanced");
        }
        optionsBar.find(".option").addClass("background");
        optionsBar.find(".option").removeClass("highlight");
        if (app.attr("configuring") == "advanced") {
          $(this).addClass("highlight");
          $(this).removeClass("background");
        }
        else {
          $(this).addClass("background");
          $(this).removeClass("highlight");
        }
        rebuildMenu();
      });
    }

    if (hasSecurity(getCookie("UserID"), "Assistant Master") && app.attr("background") != "true") {
      var option = $("<div>").appendTo(iconBar);
      if (!app.attr("UserID") && hasRights) {
        option.addClass("hover2 flexmiddle subtitle");
        option.append("<text class='background flexmiddle alttext spadding smooth outline'>Player Vision</text>");
      }
      else {
        option.addClass("hover2 flexmiddle subtitle");
        option.append("<text class='highlight flexmiddle alttext spadding smooth outline'>Player Vision</text>");
      }
      option.click(function(){
        if (app.attr("UserID")) {
          app.removeAttr("UserID");
          obj.update();
        }
        else {
          var actionsList = [];
          for (var i in game.players.data) {
            if (i != getCookie("UserID") && !(game.config.data.players && game.config.data.players[i])) {
              actionsList.push({
                name : game.players.data[i].displayName,
                attr : {uid : i},
                click : function(ev, ui){
                  app.attr("UserID", ui.attr("uid"));
                  obj.update();
                }
              });
            }
          }
          for (var i in game.config.data.players) {
            if (i != getCookie("UserID")) {
              actionsList.push({
                name : game.config.data.players[i].displayName || game.config.data.players[i].name,
                attr : {uid : i},
                click : function(ev, ui){
                  app.attr("UserID", ui.attr("uid"));
                  obj.update();
                }
              });
            }
          }
          if (actionsList.length) {
            ui_dropMenu($(this), actionsList, {id : "player-vision"});
          }
          else {
            sendAlert({text : "You need an active player or permanent player to reference"});
          }
        }

      });
    }

    if (hasRights) {
      var layerWrap = $("<div>").appendTo(optionsBar);
      layerWrap.addClass("flexrow alttext fit-x subtitle padding smooth");
      layerWrap.css("background", "rgba(0,0,0,0.8)");

      var layerBar = $("<div>").appendTo(layerWrap);
      layerBar.addClass("flexrow flex flexmiddle fit-x");


      var visible = genIcon("eye-open", "Layer");
      visible.addClass("flexrow");
      visible.appendTo(layerBar);
      visible.attr("title", "Layer Currently Visible");

      if (data.layers[scope.layer].h) {
        visible.changeIcon("eye-close", "Layer");
        visible.attr("title", "Layer Currently Hidden");
      }
      visible.click(function(){
        obj.data.layers[scope.layer].h = !obj.data.layers[scope.layer].h;
        if (data.layers[scope.layer].h) {
          visible.changeIcon("eye-close");
          visible.attr("title", "Layer Currently Hidden");
        }
        else {
          visible.changeIcon("eye-open");
          visible.attr("title", "Layer Currently Visible");
        }
        boardApi.pix.updateLayer(scope.layer, null, obj);
        boardApi.pix.revealLayers(obj, app);
      });

      var select = $("<select>").appendTo(layerBar);
      select.addClass("smooth fit-x subtitle lrmargin");
      select.attr("Layer", "Current Layer");
      select.css("color", "#333");
      if (data.layers && data.layers[scope.layer]  && data.layers[scope.layer]._s && (data.layers[scope.layer]._s.default != 1 && data.layers[scope.layer]._s.default != null)) {
        select.addClass("inactive");
      }
      for (var key in data.layers) {
        var option = $("<option val='"+key+"'>"+data.layers[key].n+"</option>").appendTo(select);
        if (key == scope.layer) {
          if (data.layers[scope.layer]._s && (data.layers[scope.layer]._s.default != 1 && data.layers[scope.layer]._s.default != null)) {
            option.text(option.text()+"(GM Only)");
          }
          option.attr("selected", "selected");
        }
      }
      select.change(function(){
        var newLayer = $(this).find("option:selected").attr("val");
        app.attr("layer", newLayer);
        scope.layer = newLayer;
        if (data.layers[scope.layer].h) {
          visible.changeIcon("eye-close");
          visible.attr("title", "Layer Currently Hidden");
        }
        else {
          visible.changeIcon("eye-open");
          visible.attr("title", "Layer Currently Visible");
        }
        boardApi.pix.revealLayers(obj, app);
      });

      var edit = genIcon("option-vertical").appendTo(layerBar);
      edit.attr("title", "Layer Options");
      edit.click(function(){
        var actionList = [];
        actionList.push(
          {
            name : "Create new Layer",
            click : function(){
              obj.data.layers.push({
                n : "New Layer",
                _s : {default : "1"},
                t : [], //tiles
                p : [], //pieces
                d : [], //drawing
              });
              app.attr("layer", obj.data.layers.length-1);
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          }
        );

        /*if (obj.data.layers[scope.layer].l) {
          actionList.push({
            name : "Activate this Layer",
            click : function(){
              delete obj.data.layers[scope.layer].l;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          });
        }
        else {
          actionList.push({
            name : "De-activate this Layer",
            click : function(){
              obj.data.layers[scope.layer].l = 1;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          });
        }*/
        actionList.push({
          name : "Delete Layer",
          submenu : [
            {
              name : "CONFIRM",
              click : function(){
                obj.data.layers.splice(1, scope.layer);
                console.log("deleted", scope.layer);
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
              }
            }
          ]
        });
        if (!obj.data.layers[scope.layer].h) {
          actionList.push({
            name : "Hide this Layer",
            click : function(){
              obj.data.layers[scope.layer].h = 1;
              boardApi.pix.updateLayer(scope.layer, null, obj);
              boardApi.pix.revealLayers(obj, app);
            }
          });
        }
        else {
          actionList.push({
            name : "Show this Layer",
            click : function(){
              delete obj.data.layers[scope.layer].h;
              boardApi.pix.updateLayer(scope.layer, null, obj);
              boardApi.pix.revealLayers(obj, app);
            }
          });
        }
        actionList.push({
          name : "Layer Access",
          click : function(ev, ui){
            var index = scope.layer;
            var content = $("<div>");
            content.addClass("flexcolumn");

            var securityContent = $("<div>").appendTo(content);
            function buildSecurity() {
              var secTbl = {};
              secTbl[getCookie("UserID")] = 1;
              secTbl = obj.data.layers[index]._s || secTbl;
              var sec = sync.render("ui_rights")(obj, app, {
                security : secTbl,
                change : function(ev, ui, userID, newSecurity){
                  obj.data.layers[index]._s = obj.data.layers[index]._s || secTbl;
                  if (userID == "default" && newSecurity === "") {
                    obj.data.layers[index]._s[userID] = "1";
                  }
                  else {
                    obj.data.layers[index]._s[userID] = newSecurity;
                  }
                  if (!scope.local) {
                    obj.sync("updateAsset");
                  }
                  else {
                    obj.update();
                  }
                  securityContent.empty();
                  buildSecurity().appendTo(securityContent);
                }
              });
              return sec;
            }
            buildSecurity().appendTo(securityContent);

            var optionsBar = $("<div>").appendTo(content);
            optionsBar.addClass("flexrow flexaround");

            var rename = genIcon("pencil", "Rename").appendTo(optionsBar);
            rename.attr("title", "Change layer name");
            rename.click(function(){
              ui_prompt({
                target : $(this),
                id : "layer-rename",
                inputs : {"Name" : obj.data.layers[index].n},
                click : function(ev, inputs) {
                  obj.data.layers[index].n = inputs["Name"].val();
                  if (!scope.local) {
                    obj.sync("updateAsset");
                  }
                  else {
                    obj.update();
                  }
                }
              });

              layout.coverlay("layer-options");
            });

            var height = genIcon("resize-vertical", "Altitude : " + (obj.data.layers[index].alt || 0)).appendTo(optionsBar);
            height.attr("title", "Change layer name");
            height.click(function(){
              ui_prompt({
                target : $(this),
                id : "layer-height",
                inputs : {"Altitude" : obj.data.layers[index].alt},
                click : function(ev, inputs) {
                  obj.data.layers[index].alt = inputs["Altitude"].val();
                  if (!scope.local) {
                    obj.sync("updateAsset");
                  }
                  else {
                    obj.update();
                  }
                }
              });

              layout.coverlay("layer-options");
            });

            if (index != 0) {
              var del = genIcon("trash", "Delete Layer").appendTo(optionsBar);
              del.attr("title", "Delete Layer");
              del.addClass("destroy");
              del.click(function(){
                obj.data.layers.splice(index, 1);
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
                layout.coverlay("layer-options");
              });
            }
            else {
              var del = genIcon("trash", "Delete Layer").appendTo(optionsBar);
              del.attr("title", "Delete Layer");
              del.addClass("dull");
            }
            var popout = ui_popOut({
              target : ui,
              id : "layer-options",
            }, content);
          }
        });

        ui_dropMenu($(this), actionList, {id : "layer-controls"});
        return false;
      });
    }
  }
  rebuildOptions();

  return newMenu;
}
