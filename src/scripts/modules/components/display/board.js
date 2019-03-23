sync.render("ui_boardActions", function(obj, app, scope) {
  var content = $("<div>");
  content.addClass("flexcolumn");

  game.state.listen[obj.id()] = function(){obj.update();}
  if (isNaN(obj.id()) && obj.id().match("_") && hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var cloudWrap = genIcon("cloud-download", "Download Asset").appendTo(content);
    cloudWrap.attr("title", "Download Asset");
    cloudWrap.addClass("bold");
    cloudWrap.click(function(ev){
      if (game.locals["storage"]) {
        for (var i in game.locals["storage"].data.l) {
          var listEntry = game.locals["storage"].data.l[i];
          var split = obj.id().split("_");
          if (obj.data._c == getCookie("UserID") && listEntry._uid == split[1]) {
            listEntry.move = true;
            runCommand("moveAssets", {l : game.locals["storage"].data.l});
            delete listEntry.move;
            game.entities.listen[obj.id()] = function(src, update, target) {
              for (var key in src.data) {
                var newEnt = src.data[key];
                if (newEnt.data && newEnt.data._c == split[0] && newEnt.data._uid == split[1]) {
                  obj.removeApp(app);
                  newEnt.addApp(app);
                  return false;
                }
              }
              return true;
            }
            break;
          }
        }
      }
      else {
        sendAlert({text : "Asset Storage hasn't loaded yet"});
      }
      ev.preventDefault();
      ev.stopPropagation();
    });
  }
  else {
    var buttonList = $("<div>");
    buttonList.addClass("lrpadding flexcolumn");

    var tabs = game.state.data.tabs;
    var active;
    for (var i in tabs) {
      if (obj.id() == tabs[i].index) {
        active = i;
        break;
      }
    }

    if (hasSecurity(getCookie("UserID"), "Assistant Master") || active != null) {
      var open = $("<button>").appendTo(content);
      open.addClass("highlight alttext");
      open.append(genIcon("log-in", "Enter"));
      open.click(function(){
        var tabs = game.state.data.tabs;
        var active;
        for (var i in tabs) {
          if (obj.id() == tabs[i].index) {
            active = i;
            break;
          }
        }
        if (active) {
          if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
            $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
            $("#"+app.attr("targetApp")).removeAttr("scrollTop");
            $("#"+app.attr("targetApp")).removeAttr("zoom");
          }
          for (var i in game.state._apps) {
            if ($("#"+game.state._apps[i]).length) {
              $("#"+game.state._apps[i]).attr("tab", active);
            }
          }
          game.state.update();
        }
        else if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
          game.state.data.tabs.push({index : obj.id(), ui : "ui_board"});
          if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
            $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
            $("#"+app.attr("targetApp")).removeAttr("scrollTop");
            $("#"+app.attr("targetApp")).removeAttr("zoom");
          }
          for (var i in game.state._apps) {
            if ($("#"+game.state._apps[i]).length) {
              $("#"+game.state._apps[i]).attr("tab", game.state.data.tabs.length-1);
            }
          }
          game.state.sync("updateState");
        }
        layout.coverlay($(".piece-quick-edit"));
        layout.coverlay(obj.id()+"-actions");
      });
    }
  }

  return content;
});

sync.render("ui_boardControls", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true", layer : app.attr("layer") || 0};
  if (game.config.data.offline) {
    scope.local = true;
  }

  if (scope.layer >= data.layers.length - 1) {
    // fuck fireffox
    scope.layer = data.layers.length - 1;
    app.attr("layer", data.layers.length - 1);
  }
  scope.layer = Math.max(scope.layer, 0);

  var div = $("<div>");
  var optionsBar = $("<div>")//.appendTo(div);
  optionsBar.addClass("flexrow flexwrap flexaround background alttext");

  var security = genIcon("lock").appendTo(optionsBar);
  security.addClass("lrpadding");
  security.attr("title", "Configure who can access this");
  security.click(function(){
    var content = sync.newApp("ui_rights");
    obj.addApp(content);

    var frame = ui_popOut({
      target : $(this),
      align : "right",
      id : "ui-rights-dialog",
    }, content);
  });

  var bEdit = genIcon("tint", "Filters").appendTo(optionsBar);
  bEdit.addClass("lrpadding");
  bEdit.attr("title", "Filters");
  bEdit.click(function(){
    var targetApp = $("#"+app.attr("target"));
    var content = sync.newApp("ui_boardFilters");
    content.attr("local", scope.local);
    content.attr("viewOnly", scope.viewOnly);
    content.attr("target", targetApp.attr("id"));
    obj.addApp(content);

    ui_popOut({
      target : app,
      id : "board-background-editing-"+targetApp.attr("id"),
    }, content);
  });

  var bEdit = genIcon("cog", "Advanced").appendTo(optionsBar);
  bEdit.addClass("lrpadding");
  bEdit.attr("title", "Advanced");
  bEdit.click(function(){
    var targetApp = $("#"+app.attr("target"));
    var content = sync.newApp("ui_backgroundControls");
    content.attr("local", scope.local);
    content.attr("viewOnly", scope.viewOnly);
    content.attr("target", targetApp.attr("id"));
    obj.addApp(content);

    ui_popOut({
      target : app,
      id : "board-background-editing-"+targetApp.attr("id"),
    }, content);
    layout.coverlay("board-controls-"+targetApp.attr("id"));
  });

  var gColor = genInput({
    parent : controls,
    placeholder : "Color",
    value : data.gc,
  });

  var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
    cols : [
      "rgba(255, 255, 255, 0.25)",
      "rgba(187, 0, 0, 0.25)",
      "rgba(0, 187, 0, 0.25)",
      "rgba(0, 15, 255, 0.25)",
      "rgba(255, 240, 0, 0.25)",
      "rgba(176, 0, 187, 0.25)",
      "rgba(51, 51, 51, 0.25)"
    ],
    hideColor : true,
    update : true,
    colorChange : function(ev, ui, col){
      gColor.val(col);
      gColor.change();
    }
  }).addClass("flexmiddle flex");
  var wColDiv = $("<div>");
  wColDiv.addClass("flexrow");

  var weatherType = $("<select>").appendTo(wColDiv);

  var optionList = ["None", "Rain", "Rain Mix", "Downpour", "Snow"];
  for (var i in optionList) {
    var option = $("<option>").appendTo(weatherType);
    option.attr("value", optionList[i].toLowerCase());
    option.text(optionList[i]);
    if (data.options.weather == optionList[i].toLowerCase()) {
      option.attr("selected", "selected");
    }
  }
  weatherType.attr("value", data.options.weather);

  var wColor = $("<button>").appendTo(wColDiv);
  wColor.addClass("padding outline smooth");
  wColor.attr("background", data.options.weatherStyle || "");
  wColor.css("background", data.options.weatherStyle || "");
  wColor.css("width", "2em");
  wColor.click(function(){
    var optionList = [];
    var submenu = [
      "rgba(34,34,34,1)",
      "rgba(187,0,0,1)",
      "rgba(255,153,0,1)",
      "rgba(255,240,0,1)",
      "rgba(0,187,0,1)",
      "rgba(0,115,230,1)",
      "rgba(176,0,187,1)",
      "rgba(255,115,255,1)",
      "rgba(255,255,255,1)",
    ];
    for (var i in submenu) {
      optionList.push({
        icon : "tint",
        style : {"background-color" : submenu[i], "color" : "transparent"},
        click : function(ev, ui){
          var col = ui.css("background-color");
          var correctedCol = col.replace("rgb(", "rgba(");
          if (weatherType.val() == "rain" || weatherType.val() == "rain mix" || weatherType.val() == "downpour") {
            wColor.attr("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
            wColor.css("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
          }
          else if (weatherType.val() == "snow") {
            wColor.attr("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
            wColor.css("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
          }
          else {
            wColor.attr("background", "");
            wColor.css("background", "");
          }
        },
      });
    }

    optionList.push({
      icon : "tint",
      style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
      click : function(ev, ui){
        var col = ui.css("background-color");
        var correctedCol = col.replace("rgb(", "rgba(");
        if (weatherType.val() == "rain") {
          wColor.attr("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
          wColor.css("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
        }
        else if (weatherType.val() == "snow") {
          wColor.attr("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
          wColor.css("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
        }
        else {
          wColor.attr("background", "");
          wColor.css("background", "");
        }
      },
    });

    optionList.push({
      icon : "cog",
      click : function(){
        var target = wColor;
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : true,
          update : true,
          colorChange : function(ev, ui, value){
            var correctedCol = value.split(",");
            var str = "";
            for (var i=0; i<correctedCol.length-1; i++) {
              str += correctedCol[i]+",";
            }
            str = str.substring(0, str.length-1) + ")";
            correctedCol = str;
            if (weatherType.val() == "rain") {
              wColor.attr("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
              wColor.css("background", "linear-gradient(to bottom, "+correctedCol.replace(")", ",0)")+" 0%, "+correctedCol.replace(")", ",0.5)")+" 100%)");
            }
            else if (weatherType.val() == "snow") {
              wColor.attr("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
              wColor.css("background", "radial-gradient("+correctedCol.replace(")", ",1.0)")+" 0%, "+correctedCol.replace(")", ",0)")+" 50%)");
            }
            else {
              wColor.attr("background", "");
              wColor.css("background", "");
            }
          }
        });

        ui_popOut({
          target : wColor,
          id : "piece-color",
          align : "right"
        }, primaryCol);
      },
    });
    var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
    menu.removeClass("outline");
  });


  var boardScaleWrap = $("<div>");
  boardScaleWrap.addClass("flexrow");

  var scale = genInput({
    parent : boardScaleWrap,
    value : (data.options.unitScale || 1),
    type : "number",
    min : 1,
    style : {"width" : "50px"}
  });

  var units = genInput({
    parent : boardScaleWrap,
    value : (data.options.unit || "un"),
    style : {"width" : "50px"}
  });

  var size = $("<div>");
  size.addClass("flexrow");

  var width = genInput({
    parent : size,
    type : "number",
    placeholder : "width",
    value : data.w,
    style : {"width" : "50px"},
  });

  var height = genInput({
    parent : size,
    type : "number",
    placeholder : "height",
    value : data.h,
    style : {"width" : "50px", color : "#333"},
  });

  var offsets = $("<div>");
  offsets.addClass("flexrow");

  var gridX = genInput({
    parent : offsets,
    type : "number",
    placeholder : "pixels",
    value : data.gridX,
    style : {"width" : "50px", color : "#333"},
  });

  var gridY = genInput({
    parent : offsets,
    type : "number",
    placeholder : "pixels",
    value : data.gridY,
    style : {"width" : "50px", color : "#333"},
  });

  var sizes = $("<div>");
  sizes.addClass("flexrow");

  var wPos = genInput({
    parent : sizes,
    type : "number",
    placeholder : "pixels",
    value : data.gridW,
    style : {"width" : "50px", color : "#333"},
  });
  var hPos;

  if (data.options && data.options.hex) {
    hPos = genInput({
      parent : sizes,
      type : "number",
      placeholder : "pixels",
      value : data.gridH,
      style : {"width" : "50px", color : "#333"},
    });
  }

  var gridTypeWrap = $("<div>");
  gridTypeWrap.addClass("flexrow");

  var gridType = $("<select>").appendTo(gridTypeWrap);

  if (data.options && data.options.hex) {
    gridType.append("<option value='Grid'>Grid</option>");
    gridType.append("<option value='Hex' selected='selected'>Hex</option>");
  }
  else {
    gridType.append("<option value='Grid' selected='selected'>Grid</option>");
    gridType.append("<option value='Hex'>Hex</option>");
  }

  var gridButton = $("<button>").appendTo(gridTypeWrap);
  gridButton.addClass("padding outline smooth");
  gridButton.css("background", data.gc);
  gridButton.css("width", "2em");
  gridButton.click(function(){
    var optionList = [];
    var submenu = [
      "rgba(34,34,34,1)",
      "rgba(187,0,0,1)",
      "rgba(255,153,0,1)",
      "rgba(255,240,0,1)",
      "rgba(0,187,0,1)",
      "rgba(0,115,230,1)",
      "rgba(176,0,187,1)",
      "rgba(255,115,255,1)",
      "rgba(255,255,255,1)",
    ];
    for (var i in submenu) {
      optionList.push({
        icon : "tint",
        style : {"background-color" : submenu[i], "color" : "transparent"},
        click : function(ev, ui){
          gridButton.css("background", ui.css("background-color"));
        },
      });
    }

    optionList.push({
      icon : "tint",
      style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
      click : function(ev, ui){
        gridButton.css("background", "rgba(0,0,0,0)");
      },
    });

    optionList.push({
      icon : "cog",
      click : function(){
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : true,
          update : true,
          colorChange : function(ev, ui, value){
            gridButton.css("background", value);
          }
        });

        ui_popOut({
          target : gridButton,
          id : "piece-color",
          align : "right"
        }, primaryCol);
      },
    });
    var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
    menu.removeClass("outline");
  });

  //gridType.append("<option value='Iso'>Iso</option>");

  var hpType = $("<select>");

  var optionList = ["Show All", "Has Access", "Never Show"];
  for (var i in optionList) {
    var option = $("<option>").appendTo(hpType);
    option.attr("value", i);
    option.text(optionList[i]);
    if ((data.options.hpMode || 0) == i) {
      option.attr("selected", "selected");
    }
  }
  hpType.attr("value", data.options.hpMode);

  var bgDrop = $("<div>");
  bgDrop.addClass("flexrow");

  var url = $("<button>").appendTo(bgDrop);
  url.addClass("hover2 smooth padding");
  url.attr("src", data.map);
  url.css("background-image", "url('"+data.map+"')");
  url.css("background-size", "contain");
  url.css("background-repeat", "no-repeat");
  url.css("background-position", "center");
  url.css("width", "50px");
  url.click(function(){
    var imgList = sync.render("ui_filePicker")(obj, app, {
      filter : "img",
      change : function(ev, ui, val){
        url.attr("src", val);
        url.css("background-image", "url('"+val+"')");
        layout.coverlay("icons-picker");
      }
    });

    var pop = ui_popOut({
      target : $(this),
      id : "icons-picker",
      prompt : true,
      align : "top",
      style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
    }, imgList);
    pop.resizable();
  });

  var repeat = $("<select>").appendTo(bgDrop);

  var optionList = ["No Repeat", "Repeat"];
  for (var i in optionList) {
    var option = $("<option>").appendTo(repeat);
    option.attr("value", optionList[i].toLowerCase());
    option.text(optionList[i]);
    if (data.options.weather == optionList[i].toLowerCase()) {
      option.attr("selected", "selected");
    }
  }
  repeat.attr("value", data.options.weather);

  var bgButton = $("<button>")//.appendTo(gridTypeWrap);
  bgButton.addClass("padding outline smooth");
  bgButton.css("background", data.c || "white");
  bgButton.css("width", "2em");
  bgButton.click(function(){
    var optionList = [];
    var submenu = [
      "rgba(34,34,34,1)",
      "rgba(187,0,0,1)",
      "rgba(255,153,0,1)",
      "rgba(255,240,0,1)",
      "rgba(0,187,0,1)",
      "rgba(0,115,230,1)",
      "rgba(176,0,187,1)",
      "rgba(255,115,255,1)",
      "rgba(255,255,255,1)",
    ];
    for (var i in submenu) {
      optionList.push({
        icon : "tint",
        style : {"background-color" : submenu[i], "color" : "transparent"},
        click : function(ev, ui){
          bgButton.css("background", ui.css("background-color"));
        },
      });
    }
    optionList.push({
      icon : "cog",
      click : function(){
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : true,
          update : true,
          colorChange : function(ev, ui, value){
            bgButton.css("background", value);
          }
        });

        ui_popOut({
          target : bgButton,
          id : "piece-color",
          align : "right"
        }, primaryCol);
      },
    });
    var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
    menu.removeClass("outline");
  });


  data.info = data.info || {name : sync.newValue(null, "[No Name]")};
  data.options = data.options || {};
  var controls = ui_controlForm({
    inputs : {
      "Grid X/Y Offset" : offsets,
      "Grid Size" : sizes,
    },
    click : function(ev, inputs) {
      var lastGrid = data.gridW;

      data.gridX = Math.min(Number(gridX.val()), 1600);
      data.gridY = Math.min(Number(gridY.val()), 1600);
      data.gridW = Math.min(Number(wPos.val()), 640);
      if (hPos) {
        data.gridH = Math.min(Number(hPos.val()), 640);
      }
      else {
        data.gridH = Math.min(Number(wPos.val()), 640);
      }
      data.gc = gridButton.css("background-color");

      var gridScale = lastGrid/data.gridW;
      if (lastGrid && data.gridW && data.options) {
        if (data.options.unitScale == null && game.templates.grid) {
          data.options.unitScale = game.templates.grid.unitScale;
        }
        data.options.unitScale = data.options.unitScale / gridScale;
      }

      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
      layout.coverlay("board-controls");
    }
  }).appendTo(div);
  return div;
});

sync.render("ui_boardFilters", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};
  if (game.config.data.offline) {
    scope.local = true;
  }
  var div = $("<div>");
  var filterWrap = genIcon("refresh", "Reset Filters");
  filterWrap.addClass("flex flexmiddle");
  filterWrap.click(function(){
    brightness.val(100);
    contrast.val(100);
    gray.val(0);
    hue.val(0);
    invert.val(0);
    sepia.val(0);
  });

  var brightness = genInput({
    type : "range",
    min : 50,
    max : 150,
    step : 5,
  }, 1);

  var contrast = genInput({
    type : "range",
    min : 50,
    max : 100,
    step : 5,
  }, 1);

  var gray = genInput({
    type : "range",
    min : 0,
    max : 100,
    step : 5,
  }, 1);

  var hue = genInput({
    type : "range",
    min : 0,
    max : 360,
    step : 30,
  }, 1);

  var invert = genInput({
    type : "range",
    min : 0,
    max : 100,
    step : 5,
  }, 1);

  var sepia = genInput({
    type : "range",
    min : 0,
    max : 100,
    step : 5,
  }, 1);

  brightness.val(100);
  contrast.val(100);
  gray.val(0);
  hue.val(0);
  invert.val(0);
  sepia.val(0);

  if (data.options && data.options.filter) {
    var filters = data.options.filter;
    brightness.val(parseInt(filters["brightness"]) || 100);
    contrast.val(parseInt(filters["contrast"]) || 100);
    gray.val(parseInt(filters["grayscale"]) || 0);
    hue.val(parseInt(filters["hue-rotate"]) || 0);
    invert.val(parseInt(filters["invert"]) || 0);
    sepia.val(parseInt(filters["sepia"]) || 0);
  }

  var controls = ui_controlForm({
    inputs : {
      "Filters" : filterWrap,
      "Brightness" : $("<div>").addClass("flexmiddle flex").append(brightness),
      //"Contrast" : contrast,
      "Grayscale" : $("<div>").addClass("flexmiddle flex").append(gray),
      "Hue Shift" : $("<div>").addClass("flexmiddle flex").append(hue),
      "Inverted" : $("<div>").addClass("flexmiddle flex").append(invert),
      "Sepia" : $("<div>").addClass("flexmiddle flex").append(sepia),
    },
    lblStyle : "width : 100px",
    click : function(ev, inputs) {
      data.options.filter = {};
      if (brightness.val() != 100) {
        data.options.filter["brightness"] = brightness.val();
      }
      else {
        delete data.options.filter["brightness"];
      }
      if (contrast.val() != 100) {
        data.options.filter["contrast"] = contrast.val();
      }
      else {
        delete data.options.filter["contrast"];
      }
      if (gray.val() != 0) {
        data.options.filter["grayscale"] = gray.val();
      }
      else {
        delete data.options.filter["grayscale"];
      }
      if (hue.val() != 0) {
        data.options.filter["hue-rotate"] = hue.val();
      }
      else {
        delete data.options.filter["hue-rotate"];
      }
      if (invert.val() != 0) {
        data.options.filter["invert"] = invert.val();
      }
      else {
        delete data.options.filter["inverts"];
      }
      if (sepia.val() != 0) {
        data.options.filter["sepia"] = sepia.val();
      }
      else {
        delete data.options.filter["sepia"];
      }

      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    }
  }).appendTo(div);

  return div;
});

sync.render("ui_boardEditor", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {
    viewOnly : (app.attr("viewOnly") == "true"),
    local : (app.attr("local") == "true"),
    printing : (app.attr("printing") == "true"),
    layer : (app.attr("layer") || 0),
  };

  var targetApp = app;

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var buttonList = $("<div>")//.appendTo(div);
  buttonList.addClass("flexrow fit-x");

  var playmode = $("<button>").appendTo(buttonList);
  playmode.addClass("subtitle flex");
  playmode.text("Play Mode");
  playmode.click(function(){
    var content = $("<div>");
    content.addClass("flexcolumn");

    var optimizer = $("<button>").appendTo(content);
    optimizer.addClass("highlight alttext hover2");
    optimizer.attr("title", "Condenses the map size down to the smallest it can be, attempts to merge 'tiled' pieces for added performance and removes duplicate tiles.");
    optimizer.append("With Optimizer");
    optimizer.click(function(){
      if (boardApi.saveChanges(obj)) {
        targetApp.removeAttr("background");
        targetApp.removeAttr("ignore");
        targetApp.removeAttr("local");

        layout.coverlay("save-changes");
      }
    });

    var noOptimizer = $("<button>").appendTo(content);
    noOptimizer.addClass("background alttext hover2");
    noOptimizer.append("Without Optimizer");
    noOptimizer.click(function(){
      if (boardApi.saveChanges(obj, true)) {
        targetApp.removeAttr("background");
        targetApp.removeAttr("ignore");
        targetApp.removeAttr("local");

        layout.coverlay("save-changes");
      }
    });

    var discard = $("<button>").appendTo(content);
    discard.addClass("subtitle");
    discard.css("margin", "1em");
    discard.append("Discard Changes");
    discard.click(function(){
      if (boardApi.saveChanges(obj, "discard")) {
        targetApp.removeAttr("background");
        targetApp.removeAttr("ignore");
        targetApp.removeAttr("local");
        obj.update();

        layout.coverlay("save-changes");
      }
    });

    var pop = ui_popOut({
      target : $(this),
      align : "bottom",
      id : "save-changes",
      title : "Save Changes...",
    }, content);
  });

  var tilemode = $("<button>").appendTo(buttonList);
  tilemode.addClass("subtitle flex");
  tilemode.text("Tile Mode");
  tilemode.click(function(){
    targetApp.attr("background", true);
    obj.update();
  });

  if (targetApp.attr("background") == "true") {
    tilemode.addClass("highlight alttext");
  }
  else {
    playmode.addClass("highlight alttext");
  }

  var tabWrapper = $("<div>").appendTo(div);
  tabWrapper.addClass("flexcolumn flex");

  var tabBar = genNavBar("foreground alttext subtitle", "flexcolumn flex", "4px");
  tabBar.addClass("flex flexcolumn");
  tabBar.appendTo(tabWrapper);

  tabBar.generateTab("Layer Order", "align-justify", function(parent){
    var layers = sync.render("ui_boardLayers")(obj, app, scope).appendTo(parent);
    layers.addClass("inactive flex");

    app.attr("tab", "Layer Order");
  });

  tabBar.generateTab("Tile Sheets", "picture", function(parent) {
    var content = sync.newApp("ui_boardSheets").appendTo(parent);
    content.attr("local", scope.local);
    content.attr("viewOnly", scope.viewOnly);
    content.attr("targetApp", app.attr("id"));
    obj.addApp(content);
    app.attr("tab", "Tile Sheets");
  });

  function tabWrap(key, icon, target) {
    tabBar.generateTab(key, icon, function(parent){
      var content = $("<div>").appendTo(parent);
      content.addClass("flex flexcolumn");
      content.css("position", "relative");
      content.css("overflow", "auto");

      var list = $("<div>").appendTo(content);
      list.addClass("fit-x");
      list.css("position", "absolute");
      list.sortable({
        update : function(ev, ui) {
          var newIndex;
          var count = 0;
          $(ui.item).attr("ignore", true);
          list.children().each(function(){
            if ($(this).attr("ignore")){
              newIndex = count;
            }
            count += 1;
          });
          var old = obj.data.layers[scope.layer][target].splice($(ui.item).attr("index"), 1);
          util.insert(obj.data.layers[scope.layer][target], newIndex, old[0]);
          boardApi.updateLayer(scope.layer, null, obj);
        }
      });
      for (var i in obj.data.layers[scope.layer][target]) {
        var itemWrap = $("<div>").appendTo(list);
        itemWrap.addClass("white hover2 flexrow");
        itemWrap.attr("index", i);
        itemWrap.click(function(){
          var index = $(this).attr("index");
          list.children().each(function(){
            $(this).removeClass("highlight2");
          });
          $(this).addClass("highlight2");

          var index = $(this).attr("index");
          // To Do :
          // unselect all
          var itemData = obj.data.layers[scope.layer][target][index];
          list.children().each(function(){
            $(this).removeClass("highlight2");
          });
          $(this).addClass("highlight2");
          if (itemData.x != null && itemData.y != null) {
            boardApi.scrollTo(targetApp, itemData.x + itemData.w/2, itemData.y + itemData.h/2);
          }
          if (!_down[16]) {
            boardApi.clearSelection(targetApp);
          }
          boardApi.lookup(scope.layer, target, $(this).attr("index"), targetApp).select();
        });
        var wrap = $("<div>").appendTo(itemWrap);
        wrap.addClass("alttext foreground spadding");

        var number = $("<b class='alttext spadding'>#"+i+"</b>").appendTo(itemWrap);
        var remove = genIcon("trash").appendTo(wrap);
        remove.addClass("flexmiddle");
        remove.attr("index", i);
        remove.click(function(ev){
          var index = $(this).attr("index");
          ui_prompt({
            target : $(this),
            confirm : "Delete",
            click : function(){
              obj.data.layers[scope.layer][target].splice(index, 1);
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          });
          ev.stopPropagation();
          ev.preventDefault();
        });

        if (target == "t") {
          var canvasWrap = $("<div>").appendTo(itemWrap);
          canvasWrap.addClass("fit-x outlinebottom");
          canvasWrap.css("position", "relative");
          canvasWrap.css("overflow", "hidden");
          canvasWrap.css("height", (data.gridH || 64) * 2);
          canvasWrap.css("margin", "0.25em");

          var tileData = obj.data.layers[scope.layer][target][i];

          var img = $("<canvas>").appendTo(canvasWrap);
          img.attr("width", tileData.w);
          img.attr("height", tileData.h);
          img.css("position", "absolute");
          img.css("pointer-events", "none");

          var sheetData = data.sheets[tileData.s];
          var tileW = sheetData.gW + sheetData.p;
          var tileH = sheetData.gH + sheetData.p;
          var xGrid = Math.ceil(sheetData.w/(tileW));
          var yGrid = Math.ceil(sheetData.h/(tileH));

          var sX = (tileData.i % xGrid) * tileW;
          var sY = Math.floor(tileData.i / xGrid) * tileH;

          var isHex = data.options && data.options.hex;

          var dummyCanvas = $("<canvas>");
          dummyCanvas.attr("width", tileData.w);
          dummyCanvas.attr("height", tileData.h);
          if (tileData.t && (tileData.w >= (data.gridW || tileData.w) && tileData.h >= (data.gridH || tileData.h)) && !(isHex)) {
            var tileX = (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p;
            var tileY = (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p;
            var gridX = Math.floor((tileData.w || data.gridW)/tileX);
            var gridY = Math.floor((tileData.h || data.gridH)/tileY);
            var width = (tileX || tileData.w || data.gridW);
            var height = (tileY || tileData.h || data.gridH);
            for (var x=0; x<gridX; x++) {
              for (var y=0; y<gridY; y++) {
                dummyCanvas.drawImage({
                  source : sheetData.i,
                  x : (x * width),
                  y : (y * height),
                  width : width,
                  height : height,
                  sWidth: tileX,
                  sHeight: tileY,
                  sx: sX, sy: sY,
                  fromCenter : false,
                  rotate : tileData.r || 0,
                });
              }
            }
          }
          else {
            if (isHex) {
              dummyCanvas.drawLine({
                mask : true,
                strokeStyle: 'rgba(0,0,0,0)',
                strokeWidth: 1,
                x1: (tileData.x)-1, y1: (tileData.y + (tileData.h || data.gridH)/2),
                x2: (tileData.x + (tileData.w || data.gridW) * 4/16), y2: (tileData.y)-1,
                x3: (tileData.x + (tileData.w || data.gridW) * 12/16), y3: (tileData.y)-1,
                x4: (tileData.x + (tileData.w || data.gridW))+1, y4: (tileData.y + (tileData.h || data.gridH)/2),
                x5: (tileData.x + (tileData.w || data.gridW) * 12/16), y5: (tileData.y + (tileData.h || data.gridH))+1,
                x6: (tileData.x + (tileData.w || data.gridW) * 4/16), y6: (tileData.y + (tileData.h || data.gridH))+1,
                x7: (tileData.x)-1, y7: (tileData.y + (tileData.h || data.gridH)/2),
              }).drawImage({
                source : sheetData.i,
                width : (tileData.w || data.gridW),
                height : (tileData.h || data.gridH),
                sWidth: (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p,
                sHeight: (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p,
                sx: sX, sy: sY,
                fromCenter: false,
                rotate : tileData.r || 0,
              }).restoreCanvas();
            }
            else {
              dummyCanvas.drawImage({
                source : sheetData.i,
                width : (tileData.w || data.gridW),
                height : (tileData.h || data.gridH),
                sWidth: (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p,
                sHeight: (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p,
                sx: sX, sy: sY,
                fromCenter: false,
                rotate : tileData.r || 0,
              });
            }
          }
          img.drawImage({
            source : dummyCanvas[0],
            layer : true,
            width : tileData.w, height : tileData.h,
            strokeStyle: "rgba(0,0,0,0)",
            strokeWidth: 4,
            fromCenter : false,
          });
        }
        else if (target == "p") {
          number.css("background-color", obj.data.layers[scope.layer][target][i].c || "#333");
          if (obj.data.layers[scope.layer][target][i].i && obj.data.layers[scope.layer][target][i].i.trim()) {
            var imgWrap = $("<div>").appendTo(itemWrap);
            imgWrap.addClass("flexmiddle");

            var img = $("<img>").appendTo(imgWrap);
            img.attr("src", obj.data.layers[scope.layer][target][i].i);
            img.attr("width", "20px");
            img.attr("height", "20px");
          }
          var ent = getEnt(obj.data.layers[scope.layer][target][i].eID);
          if (ent) {
            if (ent.data._t == "c") {
              var summary = sync.render("ui_characterCombatSummary")(ent, app, {viewOnly : true}).addClass("flex").appendTo(itemWrap);
              $(summary.children()[0]).removeClass("outline");
              summary.addClass("outlinebottom");
            }
            else {
              sync.render("ui_ent")(ent, app, {viewOnly : true}).addClass("flex outlinebottom").appendTo(itemWrap);
            }
          }
          else {
            var filler = $("<div>").appendTo(itemWrap);
            filler.addClass("outlinebottom flex");
          }
        }
        else if (target == "d") {
          var drawing = obj.data.layers[scope.layer][target][i];
          if (drawing) {
            number.css("background-color", drawing.c || "#333");
            number.css("outline-color", drawing.c2 || "#333");

            if (drawing.t) {
              if (drawing.t == "t") {
                itemWrap.append("<text class='subtitle spadding outlinebottom'>"+drawing.text+"</text>");
              }
            }
          }
        }
      }

      if (app) {
        app.attr("tab", key);
      }
    });
  }
  tabWrap("Tiles", "th", "t");
  tabWrap("Pieces", "pushpin", "p");
  tabWrap("Drawings", "pencil", "d");

  tabBar.selectTab(app.attr("tab") || "Tile Sheets");

  return div;
});


sync.render("ui_backgroundControls", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};
  if (game.config.data.offline) {
    scope.local = true;
  }
  var targetApp = $("#"+app.attr("target"));
  var div = $("<div>");
  var optionsBar = $("<div>")//.appendTo(div);
  optionsBar.addClass("flexrow flexwrap flexaround highlight alttext outline");
  optionsBar.css("color", "white");

  var showViewPort = genIcon("facetime-video", "Save Default View").appendTo(optionsBar);
  showViewPort.attr("title", "Assign the default ViewPort");
  showViewPort.click(function(){
    var zoom = parseInt(targetApp.attr("zoom"))/100 || 1;

    data.vX = (Number(targetApp.attr("scrollLeft")) + $("#"+targetApp.attr("id")+"-scroll").width()/2)/zoom;
    data.vY = (Number(targetApp.attr("scrollTop")) + $("#"+targetApp.attr("id")+"-scroll").height()/2)/zoom;
    data.vZ = zoom * 100;
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
    sendAlert({text : "Default View Updated"});
  });

  var bColor = genInput({
    placeholder : "Color",
    value : data.c,
  });

  var colDiv = sync.render("ui_colorPicker")(obj, app, {
    hideColor : true,
    update : true,
    colorChange : function(ev, ui, col){
      bColor.val(col);
      bColor.change();
    }
  }).addClass("flexmiddle flex");

  var shapeInput = genInput({
    type : "number",
    value : data.pD || 0
  });

  var shapeDiv = $("<div>");
  shapeDiv.addClass("flex flexaround");
  shapeDiv.css("padding", "4px");

  var shapes = ["0", "20%", "50%"];
  for (var s in shapes) {
    var shape = $("<div>").appendTo(shapeDiv);
    shape.addClass("outline");
    shape.css("padding", "8px");
    shape.css("cursor", "pointer");
    shape.css("border-radius", shapes[s]);
    shape.attr("index", s);
    if (data.pD == s) {
      shape.css("background-color", "rgba(0,255,0,0.2)");
    }
    shape.click(function(){
      shapeInput.val(parseInt($(this).attr("index")));
    });
  }

  var controls = ui_controlForm({
    inputs : {
      "Piece Width" : data.pW,
      "Piece Height" : data.pH,
      "Piece Color" : data.pC || "transparent",
      "Piece Shape" : shapeInput,
      "   " : shapeDiv,
    },
    click : function(ev, inputs) {

      data.options = data.options || {};

      data.pW = Math.min(Number(inputs["Piece Width"].val()), 3200);
      data.pH = Math.min(Number(inputs["Piece Height"].val()), 3200);
      data.pC = inputs["Piece Color"].val();
      data.pD = Number(inputs["Piece Shape"].val());

      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
      layout.coverlay("board-background-editing-"+targetApp.attr("id"));
    }
  }).appendTo(div);

  return div;
});

sync.render("ui_boardList", function(obj, app, scope) {
  if (!obj) {
    game.entities.addApp(app);
    return $("<div>");
  }

  var data = obj.data;
  scope = scope || {local : app.attr("local") == "true"};
  if (game.config.data.offline) {
    scope.local = true;
  }
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexaround background alttext outline");
  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var button = genIcon("plus", "New Map").appendTo(optionsBar);
    button.addClass("lrpadding");
    button.attr("title", "Creates a New Map");
    button.click(function(){
      runCommand("createBoard", {data : {}});
    });
    var boardList = $("<div>").appendTo(div);
    boardList.addClass("flexrow flexaround flexwrap lightoutline flex");
  }

  for (var key in data) {
    var ent = data[key];
    if (ent && ent.data["_t"] == "b" && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
      //build a preview
      var boardPlate = $("<div>").appendTo(boardList);
      boardPlate.addClass("flexcolumn");
      function boardWrap(parent, index) {
        var board = sync.render("ui_boardCard")(ent, app, {
          click : function(ev, ui, charObj) {
            game.state.data.tabs = game.state.data.tabs || [];
            game.state.data.tabs.push({ui : "ui_board", index : index});
            game.state.sync("updateState");
          }
        });
        board.css("background-color", "white");
        board.appendTo(parent);
      }
      boardWrap(boardPlate, key);

      var useButton = $("<button>").appendTo(boardPlate);
      useButton.addClass("fit-x");
      useButton.attr("index", key);
      useButton.append("Use Map");
      useButton.click(function(ev){
        game.state.data.tabs = game.state.data.tabs || [];
        game.state.data.tabs.push({ui : "ui_board", index : $(this).attr("index")});
        game.state.sync("updateState");
      });
    }
  }
  return div;
});

sync.render("ui_boardSelection", function(obj, app, scope) {
  var data = game.entities.data;
  scope = scope || {local : app.attr("local") == "true"};
  if (game.config.data.offline) {
    scope.local = true;
  }

  var div = $("<div>");
  div.addClass("fit-xy");

  var columns = $("<div>").appendTo(div);
  columns.addClass("flexrow flexbetween");

  var tempApp = sync.newApp("ui_boardList");
  tempApp.appendTo(columns);

  var preview = $("<div>").appendTo(columns);
  preview.addClass("lightoutline");
  preview.css("width", "100%");
  preview.css("height", "55vh");
  preview.attr("id", "boardPreview");

  game.entities.addApp(tempApp);

  return div;
});

sync.render("ui_boardListener", function(obj, app, scope) {
  if (!obj) {
    game.state.addApp(app);
    return $("<div>");
  }
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexaround foreground bold");
  optionsBar.css("color", "transparent");
  optionsBar.css("font-size", "1.2em");
  optionsBar.css("padding", "3px");

  var create = genIcon("plus").appendTo(optionsBar);
  create.css("pointer-events", "none");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexaround background bold");
  optionsBar.css("color", "transparent");

  var create = genIcon("plus").appendTo(optionsBar);
  create.css("pointer-events", "none");

  setTimeout(function(){
    $(".application[ui-name='ui_board']").each(function(){
      var boardApp = $(this);
      var ent = getEnt(boardApp.attr("entindex"));
      if (ent) {
        optionsBar.remove();
        var newApp = sync.newApp("ui_boardEditor").appendTo(div);
        newApp.addClass("flex");
        newApp.attr("viewOnly", boardApp.attr("viewOnly"));
        newApp.attr("layer", boardApp.attr("layer"));
        newApp.attr("local", boardApp.attr("local"));
        newApp.attr("targetApp", boardApp.attr("id"));
        newApp.attr("hideLayers", "true");
        ent.addApp(newApp);
      }
    });
  }, 100);

  return div;
});
