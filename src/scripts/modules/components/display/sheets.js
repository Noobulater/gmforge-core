sync.render("ui_sheet", function(obj, app, scope) {
  var boardData = obj.data;

  if (app.attr("targetapp")) {
    app = $("#"+app.attr("targetapp"));
  }

  scope = scope || {local : app.attr("local") == "true", index : app.attr("index"), hideOptions : app.attr("hideoptions") == "true", source : app.attr("source") == "true"};
  var data = boardData.sheets[scope.index];

  if (data.objs == null || data.objs.length == 0) {
    scope.source = true;
  }

  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");
  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow flexbetween background boxinshadow");

  var button = $("<button>").appendTo(optionsBar);
  button.addClass("subtitle");
  button.append("Show Atlas");
  button.click(function(){
    if (scope.source) {
      app.removeAttr("source");
    }
    else {
      app.attr("source", "true");
    }
    obj.update();
  });

  if (scope.source) {
    button.addClass("highlight alttext");

    var moveToCollection = genIcon("cloud-upload", "Add Sheet to Collection");//.appendTo(optionsBar);
    moveToCollection.addClass("alttext");
    moveToCollection.attr("title", "Add to Collection");
    moveToCollection.css("color", "white");
    moveToCollection.click(function(){
      var content = $("<div>");
      var newApp = sync.newApp("ui_boardStamps", null, {});
      for (var setID in game.locals["stamps"].data.sets) {
        var set = $("<div>").appendTo(content);
        set.addClass("hover2 outline");
        set.attr("id", setID);
        set.append("<b>"+game.locals["stamps"].data.sets[setID].name+"</b>");
        set.click(function(){
          var setID = $(this).attr("id");
          ui_prompt({
            target : $(this),
            inputs : {"Name" : ""},
            id : "prompt",
            click : function(ev, inputs) {
              game.locals["stamps"].data.sets[setID].sheets[inputs["Name"].val()] = boardData.sheets[scope.index];
              game.locals["stamps"].update();
              layout.coverlay("prompt");
              layout.coverlay("move-sheet-to-collection");
            }
          });
        });
      }
      var pop = ui_popOut({
        target : $(this),
        id : "move-sheet-to-collection"
      }, content);
    });


    var moveToCollection = genIcon("unchecked", "Save Object").appendTo(optionsBar);
    moveToCollection.addClass("alttext");
    moveToCollection.css("color", "white");
    moveToCollection.attr("title", "Save Selection as Object");
    moveToCollection.click(function(){
      data.objs = data.objs || [];
      var cont = true;
      for (var i in data.objs) {
        if (JSON.stringify(data.objs[i]) == JSON.stringify(floatingTile)) {
          cont = false;
          break;
        }
      }
      if (floatingTile) {
        if (cont) {
          data.objs.push(duplicate(floatingTile));

          sendAlert({text : "Object Saved"});

          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
        else {
          sendAlert({text : "Duplicate detected"});
        }
      }
      else {
        sendAlert({text : "No Tile"});
      }
    });

    var controls;

    var hide = genIcon("cog").appendTo(optionsBar);
    hide.addClass("alttext lrmargin");
    hide.css("color", "white");
    hide.click(function(){
      if (app.attr("hideoptions") == "true") {
        app.removeAttr("hideoptions");
        controls.show();
      }
      else {
        app.attr("hideoptions", true);
        controls.hide();
      }
    });

    var sheetContainer = $("<div>").appendTo(div);
    sheetContainer.css("min-height", "20vh");
    sheetContainer.css("flex", "1");
    sheetContainer.css("position", "relative");
    sheetContainer.css("overflow", "auto");
    sheetContainer.attr("_lastScrollTop", app.attr("_lastScrollTop_sheet"));
    sheetContainer.attr("_lastScrollLeft", app.attr("_lastScrollLeft_sheet"));

    var sheetContent = $("<div>").appendTo(sheetContainer);
    sheetContent.css("position", "absolute");

    if (data.i) {
      sheetContent.css("width", data.w);
      sheetContent.css("height", data.h);
      sheetContent.css("background-image", "url('"+data.i+"')");
      sheetContent.css("background-size", "100% 100%");
      sheetContent.css("background-repeat", "no-repeat");
    }
    var tilePlate = $("<div>").appendTo(div);
    tilePlate.addClass("flexmiddle");

    var xGrid = Math.ceil(data.w/(data.gW + data.p));
    var yGrid = Math.ceil(data.h/(data.gH + data.p));

    if (data.w && data.h && data.gW && data.gH) {
      sheetContent.selectable({
        start : function(ev, ui) {
          $("#sheet-selection").remove();
          var xPos = ev.pageX;
          var yPos = ev.pageY;
          var offset = sheetContent.offset();
          xPos = xPos - offset.left;
          yPos = yPos - offset.top;

          xPos = xPos + sheetContent.scrollLeft();
          yPos = yPos + sheetContent.scrollTop();
          sheetContent.attr("start-x", xPos);
          sheetContent.attr("start-y", yPos);
          $(ui.helper).css("pointer-events", "none");
        },
        stop: function(ev, ui) {
          $(ui.helper).css("pointer-events", "none");
          var sX = sheetContent.attr("start-x");
          var sY = sheetContent.attr("start-y");
          var eX = ev.pageX;
          var eY = ev.pageY;
          var offset = sheetContent.offset();
          eX = eX - offset.left;
          eY = eY - offset.top;

          eX = eX + sheetContent.scrollLeft();
          eY = eY + sheetContent.scrollTop();
          if (eX < sX) {
            sX = eX;
            eX = sheetContent.attr("start-x");
          }
          if (eY < sY) {
            sY = eY;
            eY = sheetContent.attr("start-y");
          }
          var gridX = Math.max(Math.floor(sX/(data.gW + data.p)),0);
          var gridY = Math.max(Math.floor(sY/(data.gH + data.p)),0);
          var gridW = Math.ceil(eX/(data.gW + data.p))-gridX;
          var gridH = Math.ceil(eY/(data.gH + data.p))-gridY;

          var tileHighlight = $("<div>").appendTo(sheetContent);
          tileHighlight.addClass("sheet-hover");
          tileHighlight.attr("id", "sheet-selection");
          tileHighlight.css("position", "absolute");
          tileHighlight.css("left", gridX * (data.gW + data.p));
          tileHighlight.css("top", gridY * (data.gH + data.p));
          tileHighlight.css("width", gridW * (data.gW + data.p));
          tileHighlight.css("height", gridH * (data.gH + data.p));
          tileHighlight.attr("sIndex", scope.index);
          tileHighlight.attr("tile", gridX + xGrid * gridY);
          tileHighlight.attr("board", obj.id());
          tileHighlight.attr("gridW", gridW);
          tileHighlight.attr("gridH", gridH);
          tileHighlight.contextmenu(function(){
            floatingTile = null;
            $(this).remove();
            return false;
          })
          floatingTile = {
            s : scope.index,
            i : gridX + xGrid * gridY,
            board : obj.id(),
            gW : gridW,
            gH : gridH,
            w : gridW * (data.gW + data.p),
            h : gridH * (data.gH + data.p),
          }

          app.attr("_lastScrollTop_sheet", sheetContainer.scrollTop());
          app.attr("_lastScrollLeft_sheet", sheetContainer.scrollLeft());
        }
      });
      sheetContent.contextmenu(function(){
        floatingTile = null;
        obj.update();
        return false;
      });
    }
  }
  else {

    var checkWrap = $("<div>").appendTo(optionsBar);
    checkWrap.addClass("flexmiddle alttext subtitle lrmargin");

    var checkbox = genInput({
      type : "checkbox",
      parent : checkWrap,
      style : {"margin" : "0"}
    }).addClass("random-rotation-check");
    if (randomRot) {
      checkbox.prop("checked", true);
    }
    checkbox.change(function(){
      if ($(this).prop("checked") == true) {
        randomRot = true;
      }
      else {
        randomRot = false;
      }
    });
    $("<b>Random Rotation</b>").appendTo(checkWrap);


    var sheetContainer = $("<div>").appendTo(div);
    sheetContainer.addClass("flex flexcolumn");
    sheetContainer.css("overflow", "auto");
    sheetContainer.attr("_lastScrollTop", app.attr("_lastScrollTop_sheet"));
    sheetContainer.attr("_lastScrollLeft", app.attr("_lastScrollLeft_sheet"));
    var search = genInput({
      //parent : sheetContainer,
      classes : "fit-x",
      placeholder : "Search"
    });

    var tileList = $("<div>").appendTo(sheetContainer);
    tileList.addClass("fit-x flexrow flexwrap");

    if (hasSecurity(getCookie("UserID"), "Rights")) {
      tileList.sortable({
        filter : ".inventoryContent",
        update : function(ev, ui) {
          var newIndex;
          var count = 0;
          $(ui.item).attr("ignore", true);
          tileList.children().each(function(){
            if ($(this).attr("ignore")){
              newIndex = count;
            }
            count += 1;
          });
          var old = data.objs.splice($(ui.item).attr("index"), 1);
          util.insert(data.objs, newIndex, old[0]);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    }
    console.log(data.objs);
    for (var i=0; i<data.objs.length; i++) {

    }
    for (var i=0; i<data.objs.length; i++) {
      var tileData = data.objs[i];

      var canvasWrap = $("<div>").appendTo(tileList);
      canvasWrap.addClass("hover2 outline smooth");
      canvasWrap.attr("index", i);
      canvasWrap.css("position", "relative");
      canvasWrap.css("overflow", "hidden");
      canvasWrap.css("width", 64);
      canvasWrap.css("height", 64);
      canvasWrap.css("margin", "0.25em");
      canvasWrap.click(function(){
        if (checkbox.prop("checked")) {
          randomRot = true;
        }
        tileList.children().removeClass("highlight");
        sendAlert({text : "Tile Selected"});
        floatingTile = duplicate(data.objs[$(this).attr("index")]);
        floatingTile.sheet = scope.index;
        $(this).addClass("highlight");
      });
      canvasWrap.contextmenu(function(){
        var index = $(this).attr("index");
        var actionsList = [
          {
            name : "Remove",
            click : function(){
              data.objs.splice(index, 1);
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
          },
        ];

        ui_dropMenu($(this), actionsList, {id : "tile-option"});
        return false;
      });

      var img = $("<canvas>").appendTo(canvasWrap);
      img.attr("width", 64);
      img.attr("height", 64);
      img.css("position", "absolute");
      img.css("pointer-events", "none");

      var sheetData = obj.data.sheets[tileData.s || scope.index];
      var tileW = sheetData.gW + sheetData.p;
      var tileH = sheetData.gH + sheetData.p;
      var xGrid = Math.ceil(sheetData.w/(tileW));
      var yGrid = Math.ceil(sheetData.h/(tileH));

      var aspectW = 1;
      var aspectH = 1;
      if (sheetData.nW && sheetData.nH) {
        aspectW = sheetData.w/sheetData.nW;
        aspectH = sheetData.h/sheetData.nH;
      }

      var sX = (tileData.i % xGrid) * tileW;
      var sY = Math.floor(tileData.i / xGrid) * tileH;

      var w = (tileData.gW * (data.gridW || 64));
      var h = (tileData.gH * (data.gridH || 64));
      var sW = (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p;
      var sH = (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p;

      var isHex = obj.data.options && obj.data.options.hex;

      var dummyCanvas = $("<canvas>");
      dummyCanvas.attr("width", Math.max(w,h));
      dummyCanvas.attr("height", Math.max(w,h));

      if (tileData.t && (w >= (data.gridW || w) && h >= (data.gridH || h)) && !(isHex)) {
        var tileX = (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p;
        var tileY = (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p;
        var gridX = Math.floor((w || obj.data.gridW)/tileX);
        var gridY = Math.floor((h || obj.data.gridH)/tileY);
        var width = (tileX || w || obj.data.gridW);
        var height = (tileY || h || obj.data.gridH);
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
            x1: (tileData.x)-1, y1: (tileData.y + (h || obj.data.gridH)/2),
            x2: (tileData.x + (w || obj.data.gridW) * 4/16), y2: (tileData.y)-1,
            x3: (tileData.x + (w || obj.data.gridW) * 12/16), y3: (tileData.y)-1,
            x4: (tileData.x + (w || obj.data.gridW))+1, y4: (tileData.y + (h || obj.data.gridH)/2),
            x5: (tileData.x + (w || obj.data.gridW) * 12/16), y5: (tileData.y + (h || obj.data.gridH))+1,
            x6: (tileData.x + (w || obj.data.gridW) * 4/16), y6: (tileData.y + (h || obj.data.gridH))+1,
            x7: (tileData.x)-1, y7: (tileData.y + (h || obj.data.gridH)/2),
          }).drawImage({
            source : sheetData.i,
            width : (w || obj.data.gridW),
            height : (h || obj.data.gridH),
            sWidth: (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p,
            sHeight: (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p,
            sx: sX, sy: sY,
            fromCenter: false,
            rotate : tileData.r || 0,
          }).restoreCanvas();
        }
        else {
          dummyCanvas.drawRect({
            fillStyle : "rgba(235,235,228,0.4)",
            x : Math.max(h-w, 0)/2, y : Math.max(w-h, 0)/2,
            width : w,
            height : h,
            fromCenter : false,
          });
          dummyCanvas.drawImage({
            source : sheetData.i,
            x : Math.max(h-w, 0)/2, y : Math.max(w-h, 0)/2,
            width : w,
            height : h,
            sWidth: sW / aspectW,
            sHeight: sH / aspectH,
            sx: sX / aspectW, sy: sY / aspectH,
            fromCenter: false,
            rotate : tileData.r || 0,
          });
        }
      }
      img.drawImage({
        source : dummyCanvas[0],
        layer : true,
        width : 64, height : 64,
        strokeStyle: "rgba(0,0,0,0)",
        strokeWidth: 4,
        fromCenter : false,
      });
    }
  }

  controls = $("<div>").appendTo(div);
  controls.addClass("subtitle");


  var url = $("<button>");
  url.addClass("background alttext");
  url.append("Select Image");
  url.click(function(){
    var imgList = sync.render("ui_filePicker")(obj, app, {
      filter : "img",
      change : function(ev, ui, val){
        var imgVal = val;
        var img = $("<img>").appendTo(sheetContent);
        img.attr("src",val);
        padding.attr("disabled", "true");
        width.attr("disabled", "true");
        height.attr("disabled", "true");
        img.bind("load", function(){
          data.w = $(this).width();
          data.h = $(this).height();
          data.nW = $(this)[0].naturalWidth;
          data.nH = $(this)[0].naturalHeight;
          data.i = imgVal;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        });
        layout.coverlay("icons-picker");
      }
    });

    var pop = ui_popOut({
      target : $(this),
      prompt : true,
      id : "icons-picker",
      align : "top",
      style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
    }, imgList);
    pop.resizable();
  });

  var padding = genInput({
    placeholder : "Grid Padding",
    value : data.p,
  });
  padding.change(function(){
    data.p = parseInt($(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });
  var whcontrols = $("<div>")
  whcontrols.addClass("flexrow");
  var width = genInput({
    parent : whcontrols,
    placeholder : "Grid Width",
    value : data.gW,
  });
  width.change(function(){
    data.gW = parseInt($(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var height = genInput({
    parent : whcontrols,
    placeholder : "Grid Height",
    value : data.gH,
  });
  height.change(function(){
    data.gH = parseInt($(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var iwhcontrols = $("<div>")
  iwhcontrols.addClass("flexrow");
  var width = genInput({
    parent : iwhcontrols,
    placeholder : "Image Width",
    value : data.w,
  });
  width.change(function(){
    data.w = parseInt($(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var height = genInput({
    parent : iwhcontrols,
    placeholder : "Image Height",
    value : data.h,
  });
  height.change(function(){
    data.h = parseInt($(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var controlForm = ui_controlForm({
    inputs : {
      "Source(URL)" : url,
      "Source (W/H)" : iwhcontrols,
      "Tile Spacing" : padding,
      "Tile (W/H)" : whcontrols,
    }
  }).appendTo(controls);

  if (scope.hideOptions) {
    controls.hide();
  }
  return div;
});

sync.render("ui_boardSheets", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {local : app.attr("local") == "true"};

  var div = $("<div>");
  div.addClass("flexcolumn flex");
  div.css("position", "relative");

  if (!layout.mobile) {
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
      if (dt.getData("Text")) {
        var imgVal = dt.getData("Text");
        var img = $("<img>").appendTo(app);
        img.attr("src", dt.getData("Text"));
        if (imgVal) {
          img.bind("load", function(){
            obj.data.sheets.push({
              p : 0,
              gW : data.gridW || 64,
              gH : data.gridH || 64,
              i : imgVal,
              w : $(this)[0].naturalWidth,
              h : $(this)[0].naturalHeight,
              nW : $(this)[0].naturalWidth,
              nH : $(this)[0].naturalHeight,
            });
            obj.update();
            layout.coverlay(app.attr("id")+"-drag-overlay");
          });
        }
      }
    });
    div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
    div.mouseout(function(){
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
  }

  var listWrap = $("<div>").appendTo(div);
  listWrap.addClass("flex");
  listWrap.css("position", "relative");
  listWrap.css("overflow", "auto");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexaround foreground alttext subtitle");

  var create = genIcon("plus", "New").appendTo(optionsBar);
  create.attr("title", "Create Tile Sheet");
  create.click(function(){
    obj.data.sheets.push({p : 0, gW : data.gridW || 64, gH : data.gridH || 64});
    obj.update();
  });

  var create = genIcon("cloud-download", "Load").appendTo(optionsBar);
  create.attr("title", "Load Tile Sheet");
  create.click(function(){
    var newApp = sync.newApp("ui_boardStamps", null, {tile : true, board : obj.id()});

    var pop = ui_popOut({
      target : $("body"),
      id : "load-tiles",
      style : {"width" : "400px", height : "600px"}
    }, newApp);
    pop.resizable();
  });

  var list = $("<div>").appendTo(listWrap);
  list.addClass("flexrow flexwrap fit-x");
  list.css("position", "absolute");
  list.sortable({
    update : function(ev, ui){
      var newOrder = [];
      $(ui.item).attr("ignore", true);
      list.children().each(function(){
        newOrder.push(obj.data.sheets[$(this).attr("index")]);
      });
      obj.data.sheets = newOrder;
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    }
  });

  for (var i in data.sheets) {
    var sheetContainer = $("<div>").appendTo(list);
    sheetContainer.addClass("outline white smooth");
    sheetContainer.attr("index", i);

    var optionsBar = $("<div>").appendTo(sheetContainer);
    optionsBar.addClass("flexaround outlinebottom");

    var del = genIcon("trash").appendTo(optionsBar);
    del.attr("index", i);
    del.attr("title", "Delete Tile Sheet");
    del.click(function(){
      var index = $(this).attr("index");
      ui_prompt({
        target : $(this),
        confirm : "Delete Sheet",
        click : function() {
          for (var lid in data.layers) {
            var layerData = data.layers[lid];
            var removeList = {};
            for (var key in layerData.t) {
              //cleanup what references the sheet
              var decorData = layerData.t[key];
              if (decorData.s == index) {
                removeList[key] = true;
              }
            }
            removeList = Object.keys(removeList);
            for (var i=removeList.length-1; i>=0; i--) {
              obj.data.layers[lid].t.splice(removeList[i],1);
            }
          }
          obj.data.sheets.splice(index, 1);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
      });
    });

    var sheetPlate = $("<div>").appendTo(sheetContainer);
    sheetPlate.addClass("hover2 flexmiddle");
    sheetPlate.css("padding", "0.5em");
    sheetPlate.attr("index", i);

    var sheet = $("<div>").appendTo(sheetPlate);
    sheet.css("width", "4em");
    sheet.css("height", "4em");
    sheet.css("position", "relative");
    sheet.css("background-image", "url('"+ data.sheets[i].i +"')");
    sheet.css("background-repeat", "no-repeat");
    sheet.css("background-size", "contain");
    sheet.css("background-position", "center");

    sheetPlate.click(function(){
      var index = $(this).attr("index");

      var newApp = sync.newApp("ui_sheet");
      newApp.attr("index", $(this).attr("index"));

      if (data.sheets[index].i) {
        newApp.attr("hideOptions", true);
      }
      if (scope.local) {
        newApp.attr("local", "true");
      }
      obj.addApp(newApp);
      var popout = ui_popOut({
        target : $("body"),
        id : "sheet-"+index+"-display",
        dragThickness : "0.5em",
        align : "bottom",
        minimize : true,
        title : "sheet",
        style : {"width" : "400px", "height" : "600px"}
      }, newApp);
      popout.addClass("board-"+app.attr("board")+"-sheet-controls");
      popout.resizable();
    });
  }

  if (list.children().length == 0) {
    var loadSheet = $("<div>").appendTo(list);
    loadSheet.addClass("flexmiddle outline smooth fit-xy hover2 bold");
    loadSheet.append("<text style='font-size : 1.6em;'>Load in some sheets to get started</text>");
    loadSheet.click(function(){
      var newApp = sync.newApp("ui_boardStamps", null, {tile : true, board : obj.id()});

      var pop = ui_popOut({
        target : app,
        id : "load-tiles",
        align : "left",
        style : {"width" : "400px", height : "300px"}
      }, newApp);
      pop.resizable();
    });
  }

  return div;
});
