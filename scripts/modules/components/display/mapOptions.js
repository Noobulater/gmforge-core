sync.render("ui_mapOptions", function(obj, app, scope) {
  var targetApp = $("#"+app.attr("id"));
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexrow fit-x lrpadding");

  if (app.attr("configuring") && app.attr("configuring") != "advanced") {
    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn flex subtitle middle");
    background.append("<b class='underline' style='font-size:1.4em;'>Background</b>");

    var bgCol = genIcon("tint", "Color (Fog)").appendTo(background);
    bgCol.css("font-size", "0.8em");
    bgCol.click(function(){
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
            obj.data.c = ui.css("background-color");
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          },
        });
      }
      optionList.push({
        icon : "tint",
        style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
        click : function(ev, ui){
          obj.data.c = "rgba(0,0,0,0)";
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        },
      });
      optionList.push({
        icon : "cog",
        click : function(){
          var primaryCol = sync.render("ui_colorPicker")(obj, app, {
            hideColor : true,
            custom : true,
            colorChange : function(ev, ui, value){
              obj.data.c = value;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
              layout.coverlay("grid-color");
            }
          });

          ui_popOut({
            target : gridColor,
            id : "grid-color",
          }, primaryCol);
        },
      });
      var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
      menu.removeClass("outline");
    });

    var bgImg = genIcon("picture", "Image").appendTo(background);
    bgImg.css("font-size", "0.8em");
    bgImg.click(function(){
      var imgList = sync.render("ui_filePicker")(obj, app, {
        filter : [
          "img",
          "video",
          "png",
          "jpg",
          "jpeg",
          "bmp",
          "ico",
          "apng",
          "gif",
          "mp4",
          "ogg",
          "webm"
        ],
        change : function(ev, ui, val){

          if (val.match(".mp4") || val.match(".webm") || val.match(".ogg")) {
            var vid = document.createElement("video");
            vid.src = val;
            vid.addEventListener('loadedmetadata', function(){
              var width = this.videoWidth;
              var height = this.videoHeight;
              var aspect = width/height;
              if (width > height) {
                width = Math.min(width, 3200);
                height = Math.ceil(width/aspect);
              }
              else {
                height = Math.min(height, 3200);
                width = Math.ceil(height*aspect);
              }
              data.w = Math.max(Math.min(width, 3200), 640);
              data.h = Math.max(Math.min(height, 3200), 480);
              data.map = val;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            });
          }
          else {
            var img = new Image();
            img.src = val;
            img.onload = function(){
              var width = this.naturalWidth;
              var height = this.naturalHeight;
              var aspect = width/height;
              if (width > height) {
                width = Math.min(width, 3200);
                height = Math.ceil(width/aspect);
              }
              else {
                height = Math.min(height, 3200);
                width = Math.ceil(height*aspect);
              }
              data.w = Math.min(width, 3200);
              data.h = Math.min(height, 3200);
              data.map = val;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          }
          if (!val) {
            delete data.map;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
          layout.coverlay("icons-picker");
        }
      });

      var pop = ui_popOut({
        target : app,
        prompt : true,
        id : "icons-picker",
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, imgList);
      pop.resizable();
    });

    background.append("<b class='flex'></b>");

    background.append("<b class='underline' style='font-size: 0.8em'>Visual Effects</b>");

    var time = genIcon("time", "Time of Day").appendTo(background);
    time.css("font-size", "0.8em");
    time.click(function(){
      var actionsList = [
        {
          name : "Day",
          click : function(){
            data.options.filter = obj.data.options.filter || {};
            delete obj.data.options.filter.brightness;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Night",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 45,
            };
            obj.data.options.filter.brightness = 45;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Dawn",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 85,
            };
            obj.data.options.filter.brightness = 85;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Dusk",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 75,
            };
            obj.data.options.filter.brightness = 75;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        }
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });

    var weather = genIcon("cloud", "Weather").appendTo(background);
    weather.css("font-size", "0.8em");
    weather.click(function(){
      var actionsList = [
        {
          name : "None",
          click : function(){
            data.options.weather = null;
            data.options.weatherStyle = null;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Light Rain",
          click : function(){
            data.options.weather = "rain";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Normal Rain",
          click : function(){
            data.options.weather = "rain mix";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Heavy Rain",
          click : function(){
            data.options.weather = "downpour";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Snow",
          click : function(){
            data.options.weather = "snow";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });

    var bgImg = genIcon("tint", "Filter").appendTo(background);
    bgImg.css("font-size", "0.8em");
    bgImg.click(function(){
      var actionsList = [
        {
          name : "Reset",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Old-timey",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["grayscale"] = 70;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Memory",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["sepia"] = 40;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Bent Reality",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["invert"] = 100;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });

    background.append("<b class='flex'></b>");

    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn flex subtitle middle");
    background.css("margin-left", "0.5em");
    background.css("margin-right", "0.5em");
    background.css("min-width", "120px");
    background.append("<b class='underline' style='font-size:1.4em'>Grid</b>");


    if (obj.data.gridW && obj.data.gridH) {
      var gridColor = genIcon("tint", "Configure Grid").appendTo(background);
      gridColor.addClass("subtitle");
      gridColor.click(function(){
        var content = sync.newApp("ui_boardControls");
        content.attr("local", scope.local);
        content.attr("viewOnly", scope.viewOnly);
        content.attr("target", app.attr("id"));
        content.css("font-size", "1.2em");
        obj.addApp(content);

        ui_popOut({
          target : $(this),
          id : "board-controls",
          title : "Grid Options"
        }, content);
      });
    }

    if (!data.options || !data.options.hex) {
      var drawGrid = genIcon("edit", "Draw Grid").appendTo(background);
      drawGrid.addClass("subtitle");
      drawGrid.click(function(){
        if (!game.locals["drawing"]) {
          game.locals["drawing"] = sync.obj();
          game.locals["drawing"].data = {};
        }
        game.locals["drawing"].data.drawing = "grid";
        game.locals["drawing"].data.target = app.attr("id");
        game.locals["drawing"].update();
        sendAlert({text : "Draw a square matching the grid on the map"});
      });

      var drawGrid = genIcon("move", "Shift Grid").appendTo(background);
      drawGrid.addClass("subtitle");
      drawGrid.click(function(){
        if (!game.locals["drawing"]) {
          game.locals["drawing"] = sync.obj();
          game.locals["drawing"].data = {};
        }
        game.locals["drawing"].data.drawing = "shiftg";
        game.locals["drawing"].data.target = app.attr("id");
        game.locals["drawing"].update();
        sendAlert({text : "Shift the grid by dragging it around"});
      });
    }

    if (obj.data.gridW && obj.data.gridH) {
      var gridColor = genIcon("tint", "Grid Color").appendTo(background);
      gridColor.addClass("subtitle");
      gridColor.click(function(){
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
            attr : {colVal : submenu[i]},
            click : function(ev, ui){
              obj.data.gc = ui.attr("colVal").replace(",1)",",0.20)");
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            },
          });
        }
        optionList.push({
          icon : "tint",
          style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
          click : function(ev, ui){
            obj.data.gc = "rgba(0,0,0,0)";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          },
        });
        optionList.push({
          icon : "cog",
          click : function(){
            var primaryCol = sync.render("ui_colorPicker")(obj, app, {
              hideColor : true,
              custom : true,
              colorChange : function(ev, ui, value){
                obj.data.gc = value;
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
                layout.coverlay("grid-color");
              }
            });

            ui_popOut({
              target : gridColor,
              id : "grid-color",
            }, primaryCol);
          },
        });
        var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
        menu.removeClass("outline");
      });

      if (data.options && data.options.hex) {
        var gridType = genIcon("", "Switch to Squares").appendTo(background);
        gridType.addClass("subtitle");
        gridType.click(function(){
          data.options = data.options || {};
          delete data.options.hex;
          data.gridW = 64;
          data.gridH = 64;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        });
      }
      else {
        var gridType = genIcon("", "Switch to Hex")//.appendTo(background);
        gridType.addClass("subtitle");
        gridType.click(function(){
          data.options = data.options || {};
          data.options.hex = true;
          data.gridW = 140;
          data.gridH = 120;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        });
      }
    }

    background.append("<b class='flex'></b>");

    if (obj.data.gridW && obj.data.gridH) {
      var disableGrid = genIcon("remove", "Disable Grid").appendTo(background);
      disableGrid.addClass("subtitle destroy");
      disableGrid.click(function(){
        obj.data.gridW = 0;
        obj.data.gridH = 0;
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }
    else {
      var enableGrid = genIcon("ok", "Enable Grid").appendTo(background);
      enableGrid.addClass("subtitle create");
      enableGrid.click(function(){
        obj.data.gridW = 64;
        obj.data.gridH = 64;
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }

    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn flex subtitle middle");

    background.append("<b class='underline' style='font-size:1.4em'>Map</b>");

    var checkWrap = $("<div>")//.appendTo(background);
    checkWrap.addClass("flexrow");

    var healthbars = genIcon("", "Background").appendTo(checkWrap);
    healthbars.addClass("subtitle");

    var checkWrap = $("<div>").appendTo(checkWrap);
    checkWrap.addClass("flexrow flexmiddle");

    var repeatType = $("<select>").appendTo(checkWrap);
    repeatType.addClass("lrmargin");
    repeatType.css("font-size", "0.6em");
    repeatType.css("color", "#333");
    repeatType.css("text-shadow", "none");

    var optionList = ["No-Repeat", "Repeat-All", "Fit"];
    for (var i in optionList) {
      var option = $("<option>").appendTo(repeatType);
      option.attr("value", optionList[i]);
      option.text(optionList[i]);
      if ((data.options.bgRepeat=="repeat-all" && i == 1) || (data.options.bgRepeat=="fit" && i == 2)) {
        option.attr("selected", "selected");
      }
    }
    repeatType.attr("value", data.options.bgRepeat);
    repeatType.change(function(){
      obj.data.options = obj.data.options || {};
      obj.data.options.bgRepeat = $(this).val().toLowerCase();
      if (obj.data.options.bgRepeat == "no-repeat") {
        delete obj.data.options.bgRepeat;
      }
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexcolumn");
    var healthbars = genIcon("cog", "Boundries").appendTo(checkWrap);
    healthbars.addClass("subtitle");
    healthbars.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Width" : {value : data.w, min : 320, max : 3200},
          "Height" : {value : data.h, min : 320, max : 3200}
        },
        click : function(ev, inputs){
          obj.data.w = Number(inputs["Width"].val() || data.w);
          obj.data.h = Number(inputs["Height"].val() || data.h);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    });

    var showViewPort = genIcon("unchecked", "Piece Defaults").appendTo(background);
    showViewPort.addClass("subtitle");
    showViewPort.attr("title", "Change the default pieces");
    showViewPort.click(function(){
      var content = sync.newApp("ui_backgroundControls");
      content.attr("target", targetApp.attr("id"));
      obj.addApp(content);

      ui_popOut({
        target : app,
        title : "Default Piece Options",
        id : "board-background-editing-"+targetApp.attr("id"),
      }, content);
    });

    /*var rescaleMap = genIcon("resize-window", "Re-Scale Map").appendTo(checkWrap);
    rescaleMap.addClass("subtitle");
    rescaleMap.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Width" : {value : data.w, min : 320, max : 3200},
          "Height" : {value : data.h, min : 320, max : 3200}
        },
        click : function(ev, inputs){
          obj.data.w = Number(inputs["Width"].val() || data.w);
          obj.data.h = Number(inputs["Height"].val() || data.h);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    });*/

    var showViewPort = genIcon("facetime-video", "Save View").appendTo(background);
    showViewPort.addClass("subtitle");
    showViewPort.attr("title", "Assign the default ViewPort");
    showViewPort.click(function(){
      var zoom = parseInt(app.attr("zoom"))/100 || 1;

      obj.data.vX = boardApi.pix.apps[app.attr("id")].stage.x - $("#"+app.attr("id")).width()/2/zoom;
      obj.data.vY = boardApi.pix.apps[app.attr("id")].stage.y - $("#"+app.attr("id")).height()/2/zoom;
      obj.data.vZ = zoom * 100;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
      sendAlert({text : "Default View Updated"});
    });

    background.append("<b class='flex'></b>");

    var draw = genIcon("cog", "Advanced").appendTo(background);
    draw.addClass("subtitle");
    draw.click(function(){
      app.attr("configuring", "advanced");
      var parent = $("#"+app.attr("id")+"-menu-"+obj.id());
      parent.replaceWith(boardApi.pix.buildMenu(obj, app, scope, true));
    });
  }
  else {
    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn subtitle");

    background.append("<b class='underline' style='font-size : 1.2em;'>Tools</b>");

    var healthbars = genIcon("flash", "Map Optimizer")//.appendTo(background);
    healthbars.addClass("subtitle");
    healthbars.click(function(){
      boardApi.saveChanges(obj);
      sendAlert({text : "Optimized"});
    });

    var scale = genIcon("globe", "Map Scale").appendTo(background);
    scale.addClass("subtitle");
    scale.click(function(){
      if (!game.locals["drawing"]) {
        game.locals["drawing"] = sync.obj();
        game.locals["drawing"].data = {};
      }
      game.locals["drawing"].data.target = app.attr("id");

      var mapScaleWrapper = $("<div>");
      mapScaleWrapper.addClass("flexcolumn");

      var mapScale = $("<div>").appendTo(mapScaleWrapper);
      mapScale.addClass("flexrow");

      var mapScaleWrap = $("<div>").appendTo(mapScale);
      mapScaleWrap.addClass("flexcolumn");
      mapScaleWrap.append("<b class='subtitle'>Current Divisor</b>");

      var mapScaleInput = genInput({
        parent : mapScaleWrap,
        classes : "line",
        type : "number",
        placeholder : "Unit Distance",
        value : obj.data.options.unitScale,
        style : {"width" : "150px", "text-align" : "center"},
      });
      mapScaleInput.change(function(){
        game.locals["drawing"].data.scaleSize = $(this).val();
        obj.data.options.unitScale = $(this).val();
      });

      var mapScaleWrap = $("<div>").appendTo(mapScale);
      mapScaleWrap.addClass("flexcolumn");
      mapScaleWrap.append("<b class='subtitle'>Unit</b>");
      var scaleType = genInput({
        parent : mapScaleWrap,
        classes : "line",
        placeholder : "(m,ft,..)",
        value : obj.data.options.unit,
        style : {"width" : "50px"},
      });
      scaleType.change(function(){
        game.locals["drawing"].data.scaleUnit = $(this).val();
        obj.data.options.unit = $(this).val();
      });
      game.locals["drawing"].data.scaleUnit = game.locals["drawing"].data.scaleUnit || obj.data.options.unit;

      var confirm = $("<button>").appendTo(mapScaleWrapper);
      confirm.addClass("highlight alttext");
      confirm.append("Draw Scale to Divisor");
      confirm.click(function(){
        game.locals["drawing"].data.drawing = "scale";
        game.locals["drawing"].update();
        sendAlert({text : "Draw a line to specify the scale of the map"});
        layout.coverlay("grid-scale");
      });

      var pop = ui_popOut({
        target : app,
        id : "grid-scale",
        title : "Draw Map Scale"
      }, mapScaleWrapper);
    });


    var rights = genIcon("lock", "Rights").appendTo(background);
    rights.addClass("subtitle");
    rights.click(function(){
      var contentWrap = $("<div>");
      contentWrap.addClass("flexcolumn flex");

      var content = sync.newApp("ui_rights").appendTo(contentWrap);
      obj.addApp(content);

      contentWrap.append("<b class='subtitle lrpadding lrmargin flexmiddle'>Board Rights behave differently, and in most cases<br> shouldn't be changed. Proceed with caution</b>");

      var frame = ui_popOut({
        target : app,
        id : "ui-rights-dialog",
      }, contentWrap);
    });

    var rights = genIcon("globe", "Set Parent Map").appendTo(background);
    rights.addClass("subtitle");
    rights.click(function(){
      var content = sync.render("ui_assetPicker")(obj, app, {
        filter : "b",
        select : function(ev, ui, ent, options, entities){
          obj.data.options.zoomAsset = ent.id();
          obj.sync("updateAsset");
          layout.coverlay("add-asset");
        }
      });
      var pop = ui_popOut({
        target : $("body"),
        prompt : true,
        id : "add-asset",
        title : "Parent Map",
        style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
      }, content);
      pop.resizable();
    });
    if (obj.data.options.zoomAsset) {
      var rights = genIcon("remove", "Clear Parent Map").appendTo(background);
      rights.addClass("subtitle");
      rights.click(function(){
        delete obj.data.options.zoomAsset;
        obj.sync("updateAsset");
        layout.coverlay("add-asset");
      });
    }

    var showViewPort = genIcon("unchecked", "Piece Defaults")//.appendTo(background);
    showViewPort.addClass("subtitle");
    showViewPort.attr("title", "Change the default pieces");
    showViewPort.click(function(){
      var content = sync.newApp("ui_backgroundControls");
      content.attr("target", targetApp.attr("id"));
      obj.addApp(content);

      ui_popOut({
        target : app,
        title : "Default Piece Options",
        id : "board-background-editing-"+targetApp.attr("id"),
      }, content);
    });

    var showViewPort = genIcon("facetime-video", "Save View").appendTo(background);
    showViewPort.addClass("subtitle");
    showViewPort.attr("title", "Assign the default ViewPort");
    showViewPort.click(function(){
      var zoom = parseInt(app.attr("zoom"))/100 || 1;

      obj.data.vX = boardApi.pix.apps[app.attr("id")].stage.x - $("#"+app.attr("id")).width()/2/zoom;
      obj.data.vY = boardApi.pix.apps[app.attr("id")].stage.y - $("#"+app.attr("id")).height()/2/zoom;
      obj.data.vZ = zoom * 100;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
      sendAlert({text : "Default View Updated"});
    });

    background.append("<div class='flex'></div>");

    background.append("<b class='underline' style='font-size: 0.8em'>Visual Effects</b>");

    var time = genIcon("time", "Time of Day").appendTo(background);
    time.css("font-size", "0.8em");
    time.click(function(){
      var actionsList = [
        {
          name : "Day",
          click : function(){
            data.options.filter = obj.data.options.filter || {};
            delete obj.data.options.filter.brightness;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Night",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 45,
            };
            obj.data.options.filter.brightness = 45;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Dawn",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 85,
            };
            obj.data.options.filter.brightness = 85;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Dusk",
          click : function(){
            data.options.filter = obj.data.options.filter || {
              brightness : 75,
            };
            obj.data.options.filter.brightness = 75;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        }
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });

    var weather = genIcon("cloud", "Weather").appendTo(background);
    weather.css("font-size", "0.8em");
    weather.click(function(){
      var actionsList = [
        {
          name : "None",
          click : function(){
            data.options.weather = null;
            data.options.weatherStyle = null;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Light Rain",
          click : function(){
            data.options.weather = "rain";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Normal Rain",
          click : function(){
            data.options.weather = "rain mix";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Heavy Rain",
          click : function(){
            data.options.weather = "downpour";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Snow",
          click : function(){
            data.options.weather = "snow";
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });

    var bgImg = genIcon("tint", "Filter").appendTo(background);
    bgImg.css("font-size", "0.8em");
    bgImg.click(function(){
      var actionsList = [
        {
          name : "Reset",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Old-timey",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["grayscale"] = 70;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Memory",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["sepia"] = 40;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Bent Reality",
          click : function(){
            data.options.filter = data.options.filter || {}
            for (var i in data.options.filter) {
              if (i != "brightness") {
                delete data.options.filter[i];
              }
            }
            data.options.filter["invert"] = 100;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        },
      ];
      ui_dropMenu($(this), actionsList, {id : "time"});
    });


    var draw = genIcon("cog", "Normal Options")//.appendTo(background);
    draw.addClass("subtitle");
    draw.click(function(){
      app.attr("configuring", "true");
      var parent = $("#"+app.attr("id")+"-menu-"+obj.id());
      parent.replaceWith(boardApi.pix.buildMenu(obj, app, scope, true));
    });

    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn flex subtitle");
    background.css("margin-left", "1em");
    background.css("margin-right", "1em");
    background.append("<b class='underline middle' style='font-size : 1.2em;'>Selects</b>");

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexrow");

    var healthbars = genIcon("", "Default Layer").appendTo(checkWrap);
    healthbars.addClass("subtitle flex");

    var checkWrap = $("<div>").appendTo(checkWrap);
    checkWrap.addClass("flexrow flexmiddle");

    var hpType = $("<select>").appendTo(checkWrap);
    hpType.addClass("lrmargin");
    hpType.css("font-size", "0.6em");
    hpType.css("color", "#333");
    hpType.css("text-shadow", "none");

    for (var i in data.layers) {
      var option = $("<option>").appendTo(hpType);
      option.attr("value", i);
      option.text(data.layers[i].n);
      if ((data.options.pLayer || 0) == i) {
        option.attr("selected", "selected");
      }
    }
    hpType.attr("value", data.options.pLayer);
    hpType.change(function(){
      data.options = data.options || {};
      data.options.pLayer = $(this).val();
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexrow");

    var healthbars = genIcon("", "Grid Layer").appendTo(checkWrap);
    healthbars.addClass("subtitle flex");

    var checkWrap = $("<div>").appendTo(checkWrap);
    checkWrap.addClass("flexrow flexmiddle");

    var hpType = $("<select>").appendTo(checkWrap);
    hpType.addClass("lrmargin");
    hpType.css("font-size", "0.6em");
    hpType.css("color", "#333");
    hpType.css("text-shadow", "none");

    for (var i in data.layers) {
      var option = $("<option>").appendTo(hpType);
      option.attr("value", i);
      option.text(data.layers[i].n);
      if ((data.options.gLayer || 0) == i) {
        option.attr("selected", "selected");
      }
    }
    hpType.attr("value", data.options.gLayer);
    hpType.change(function(){
      data.options = data.options || {};
      data.options.gLayer = $(this).val();
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexrow");

    var healthbars = genIcon("", "Health Bars").appendTo(checkWrap);
    healthbars.addClass("subtitle flex");

    var checkWrap = $("<div>").appendTo(checkWrap);
    checkWrap.addClass("flexrow flexmiddle");

    var hpType = $("<select>").appendTo(checkWrap);
    hpType.addClass("lrmargin");
    hpType.css("font-size", "0.6em");
    hpType.css("color", "#333");
    hpType.css("text-shadow", "none");

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
    hpType.change(function(){
      data.options = data.options || {};
      data.options.hpMode = $(this).val();
      console.log($(this).val());
      if (data.options.hpMode == 0) {
        delete data.options.hpMode;
      }
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    background.append("<div class='lpadding'></div>");

    var background = $("<div>").appendTo(background);
    background.addClass("flexcolumn flex middle");
    background.append("<b class='underline middle' style='font-size : 1.2em;'>Toggles</b>");

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexrow");

    var checkCursors = genInput({
      classes : "lrmargin",
      parent : checkWrap,
      type : "checkbox",
      value : data.options.cursorToggle
    });

    var cursors = genIcon("hands-up", "Show Cursors").appendTo(checkWrap);
    cursors.addClass("subtitle lrmargin");
    checkWrap.click(function(){
      data.options = data.options || {};
      data.options.cursorToggle = !data.options.cursorToggle;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var checkWrap = $("<div>").appendTo(background);
    checkWrap.addClass("flexrow");

    var checkDraw = genInput({
      classes : "lrmargin",
      parent : checkWrap,
      type : "checkbox",
      value : data.options.freeDraw
    });

    var draw = genIcon("pencil", "Player Drawing").appendTo(checkWrap);
    draw.addClass("subtitle lrmargin");

    checkWrap.click(function(){
      data.options = data.options || {};
      data.options.freeDraw = !data.options.freeDraw;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });


    var background = $("<div>").appendTo(div);
    background.addClass("flexcolumn flex subtitle");

    background.append("<b class='underline middle' style='font-size : 1.2em;'>Filters</b>");

    var content = sync.newApp("ui_boardFilters").appendTo(background);
    content.attr("local", scope.local);
    content.attr("viewOnly", scope.viewOnly);
    content.attr("target", targetApp.attr("id"));
    obj.addApp(content);

  }

  return div;
});


sync.render("ui_mapBackground", function(obj, app, scope){
  var targetApp = $("#"+app.attr("id"));
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexrow fit-x lrpadding");

  var background = $("<div>").appendTo(div);
  background.addClass("flexcolumn flex subtitle middle");

  background.append("<b class='underline' style='font-size:1.4em;'>Background</b>");


  var bgImg = $("<div>").appendTo(background);
  bgImg.addClass("outline smooth flexmiddle white");
  if (data.map && (data.map.match(".mp4") || data.map.match(".webm") || data.map.match(".ogg"))) {
    genIcon("play").css("pointer-events", "none");
  }
  else {
    bgImg.css("background-image", "url('"+ obj.data.map || "/content/quickstart.png" +"')");
    bgImg.css("background-size", "contain");
    bgImg.css("background-repeat", "no-repeat");
    bgImg.css("background-position", "center");
  }
  bgImg.css("width", "300px");
  bgImg.css("height", "150px");
  bgImg.css("font-size", "1.4em");
  if (!scope.viewOnly) {
    bgImg.addClass("hover2");
    bgImg.click(function(){
      var imgList = sync.render("ui_filePicker")(obj, app, {
        filter : [
          "img",
          "video",
          "png",
          "jpg",
          "jpeg",
          "bmp",
          "ico",
          "apng",
          "gif",
          "mp4",
          "ogg",
          "webm"
        ],
        change : function(ev, ui, val){

          if (val.match(".mp4") || val.match(".webm") || val.match(".ogg")) {
            var vid = document.createElement("video");
            vid.src = val;
            vid.addEventListener('loadedmetadata', function(){
              var width = this.videoWidth;
              var height = this.videoHeight;
              var aspect = width/height;
              if (width > height) {
                width = Math.min(width, 3200);
                height = Math.ceil(width/aspect);
              }
              else {
                height = Math.min(height, 3200);
                width = Math.ceil(height*aspect);
              }
              data.w = Math.max(Math.min(width, 3200), 640);
              data.h = Math.max(Math.min(height, 3200), 480);
              data.map = val;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            });
          }
          else {
            var img = new Image();
            img.src = val;
            img.onload = function(){
              var width = this.naturalWidth;
              var height = this.naturalHeight;
              var aspect = width/height;
              if (width > height) {
                width = Math.min(width, 3200);
                height = Math.ceil(width/aspect);
              }
              else {
                height = Math.min(height, 3200);
                width = Math.ceil(height*aspect);
              }
              data.w = Math.min(width, 3200);
              data.h = Math.min(height, 3200);
              data.map = val;
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          }
          if (!val) {
            delete data.map;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
          layout.coverlay("icons-picker");
        }
      });

      var pop = ui_popOut({
        target : app,
        prompt : true,
        id : "icons-picker",
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, imgList);
      pop.resizable();
    });
  }

  var checkWrap = $("<div>").appendTo(background);
  checkWrap.addClass("flexcolumn flexmiddle");

  var healthbars = genIcon("cog", "Size").appendTo(checkWrap);
  healthbars.addClass("subtitle");
  healthbars.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Width" : {value : data.w, min : 320, max : 3200},
        "Height" : {value : data.h, min : 320, max : 3200}
      },
      click : function(ev, inputs){
        obj.data.w = Number(inputs["Width"].val() || data.w);
        obj.data.h = Number(inputs["Height"].val() || data.h);
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      }
    });
  });

  var background = $("<div>").appendTo(div);
  background.addClass("flexcolumn flex subtitle middle");

  background.append("<b class='underline' style='font-size:1.4em;'>Color</b>");

  var bgCol = $("<div>").appendTo(background);
  bgCol.addClass("outline smooth flexmiddle white");
  bgCol.css("background", obj.data.c);
  bgCol.css("width", "150px");
  bgCol.css("height", "150px");
  if (!scope.viewOnly) {
    bgCol.addClass("hover2");
    bgCol.click(function(){
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
      var primaryCol = sync.render("ui_colorPicker")(obj, app, {
        hideColor : true,
        custom : true,
        colorChange : function(ev, ui, value){
          obj.data.c = value;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay("grid-color");
        }
      });

      ui_popOut({
        target : bgCol,
        id : "grid-color",
      }, primaryCol);
    });
  }

  return div;
});

sync.render("ui_mapGrid", function(obj, app, scope){
  var targetApp = $("#"+app.attr("id"));
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexrow fit-x lrpadding");

  var background = $("<div>").appendTo(div);
  background.addClass("flexcolumn flex subtitle middle");
  background.css("margin-left", "0.5em");
  background.css("margin-right", "0.5em");
  background.css("min-width", "120px");
  background.append("<b class='underline' style='font-size:1.4em'>Tools</b>");

  if (obj.data.gridW && obj.data.gridH) {
    var gridColor = genIcon("tint", "Configure Grid").appendTo(background);
    gridColor.addClass("subtitle");
    gridColor.click(function(){
      var content = sync.newApp("ui_boardControls");
      content.attr("local", scope.local);
      content.attr("viewOnly", scope.viewOnly);
      content.attr("target", app.attr("id"));
      content.css("font-size", "1.2em");
      obj.addApp(content);

      ui_popOut({
        target : $(this),
        id : "board-controls",
        title : "Grid Options"
      }, content);
    });
  }

  if (!data.options || !data.options.hex) {
    var drawGrid = genIcon("edit", "Draw Grid").appendTo(background);
    drawGrid.addClass("subtitle");
    drawGrid.click(function(){
      if (!game.locals["drawing"]) {
        game.locals["drawing"] = sync.obj();
        game.locals["drawing"].data = {};
      }
      game.locals["drawing"].data.drawing = "grid";
      game.locals["drawing"].data.target = app.attr("id");
      game.locals["drawing"].update();
      sendAlert({text : "Draw a square matching the grid on the map"});
    });

    var drawGrid = genIcon("move", "Shift Grid").appendTo(background);
    drawGrid.addClass("subtitle");
    drawGrid.click(function(){
      if (!game.locals["drawing"]) {
        game.locals["drawing"] = sync.obj();
        game.locals["drawing"].data = {};
      }
      game.locals["drawing"].data.drawing = "shiftg";
      game.locals["drawing"].data.target = app.attr("id");
      game.locals["drawing"].update();
      sendAlert({text : "Shift the grid by dragging it around"});
    });
  }

  if (obj.data.gridW && obj.data.gridH) {
    if (data.options && data.options.hex) {
      var gridType = genIcon("", "Switch to Squares").appendTo(background);
      gridType.addClass("subtitle");
      gridType.click(function(){
        data.options = data.options || {};
        delete data.options.hex;
        data.gridW = 64;
        data.gridH = 64;
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }
    else {
      var gridType = genIcon("", "Switch to Hex")//.appendTo(background);
      gridType.addClass("subtitle");
      gridType.click(function(){
        data.options = data.options || {};
        data.options.hex = true;
        data.gridW = 140;
        data.gridH = 120;
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }
  }

  background.append("<b class='flex'></b>");

  if (obj.data.gridW && obj.data.gridH) {
    var disableGrid = genIcon("remove", "Disable Grid").appendTo(background);
    disableGrid.addClass("subtitle destroy");
    disableGrid.click(function(){
      obj.data.gridW = 0;
      obj.data.gridH = 0;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
  }
  else {
    var enableGrid = genIcon("ok", "Enable Grid").appendTo(background);
    enableGrid.addClass("subtitle create");
    enableGrid.click(function(){
      obj.data.gridW = 64;
      obj.data.gridH = 64;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
  }


  var background = $("<div>").appendTo(div);
  background.addClass("flexcolumn flex subtitle middle");
  background.css("margin-left", "0.5em");
  background.css("margin-right", "0.5em");
  background.css("min-width", "120px");
  background.append("<b class='underline' style='font-size:1.4em'>Color</b>");

  var bgCol = $("<div>").appendTo(background);
  bgCol.addClass("outline smooth flexmiddle white");
  bgCol.css("background", obj.data.gc);
  bgCol.css("width", "150px");
  bgCol.css("height", "150px");
  if (!scope.viewOnly) {
    bgCol.addClass("hover2");
    bgCol.click(function(){
      var optionList = [];
      var submenu = [
        "rgba(34,34,34,0.2)",
        "rgba(187,0,0,0.2)",
        "rgba(255,153,0,0.2)",
        "rgba(255,240,0,0.2)",
        "rgba(0,187,0,0.2)",
        "rgba(0,115,230,0.2)",
        "rgba(176,0,187,0.2)",
        "rgba(255,115,255,0.2)",
        "rgba(255,255,255,0.2)",
      ];
      var primaryCol = sync.render("ui_colorPicker")(obj, app, {
        hideColor : true,
        custom : true,
        colors : submenu,
        colorChange : function(ev, ui, value){
          obj.data.gc = value;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay("grid-color");
        }
      });

      ui_popOut({
        target : bgCol,
        id : "grid-color",
      }, primaryCol);
    });
  }

  return div;
});
