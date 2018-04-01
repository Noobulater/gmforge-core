function buildBoardIcon(data, width, height, noOffset) {
  var zoom = 1;
  var isHex;
  if (data.options && data.options.hex) {
    isHex = true;
  }

  var layerCanvas = $("<canvas>");
  layerCanvas.attr("height", width || "100px");
  layerCanvas.attr("width", height || "100px");

  var scale = Math.max(Math.max(100/data.w, 100/data.h), 0.25);

  var xPos = scale * data.w/-4;
  var yPos = scale * data.h/-4;
  if (noOffset) {
    xPos = 0;
    yPos = 0;
  }

  layerCanvas.scaleCanvas({
    x : xPos,
    y : yPos,
    scale : scale,
  });

  for (var lid in data.layers) {
    var layerData = data.layers[lid];
    var tiles = layerData.t;

    for (var index in tiles) {
      var decorData = tiles[index];
      var sheetData = data.sheets[decorData.s];
      var tileW = sheetData.gW + sheetData.p;
      var tileH = sheetData.gH + sheetData.p;
      var xGrid = Math.ceil(sheetData.w/(tileW));
      var yGrid = Math.ceil(sheetData.h/(tileH));

      var sX = (decorData.i % xGrid) * tileW;
      var sY = Math.floor(decorData.i / xGrid) * tileH;
      if (decorData.t && (decorData.w >= (data.gridW || decorData.w) && decorData.h >= (data.gridH || decorData.h)) && !(isHex)) {
        var tileX = (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p;
        var tileY = (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p;
        var gridX = Math.floor((decorData.w || data.gridW)/tileX);
        var gridY = Math.floor((decorData.h || data.gridH)/tileY);
        var width = (tileX || decorData.w || data.gridW);
        var height = (tileY || decorData.h || data.gridH);
        for (var x=0; x<gridX; x++) {
          for (var y=0; y<gridY; y++) {
            try {
              layerCanvas.drawImage({
                source : sheetData.i,
                x : (decorData.x + x * width) * zoom,
                y : (decorData.y + y * height) * zoom,
                width : width * zoom,
                height : height * zoom,
                sWidth: tileX,
                sHeight: tileY,
                sx: sX, sy: sY,
                fromCenter : false,
                rotate : decorData.r || 0,
              });
            }
            catch (err) {
              layerCanvas.drawImage({
                source : "/content/error.png",
                x : (decorData.x + x * width) * zoom,
                y : (decorData.y + y * height) * zoom,
                width : width * zoom,
                height : height * zoom,
                sWidth: tileX,
                sHeight: tileY,
                sx: sX, sy: sY,
                fromCenter : false,
                rotate : decorData.r || 0,
              });
            }
          }
        }
      }
      else {
        try {
          layerCanvas.drawImage({
            source : sheetData.i,
            x : decorData.x * zoom,
            y : decorData.y * zoom,
            width : (decorData.w || data.gridW) * zoom,
            height : (decorData.h || data.gridH) * zoom,
            sWidth: (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p,
            sHeight: (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p,
            sx: sX, sy: sY,
            fromCenter: false,
            rotate : decorData.r || 0,
          });
        }
        catch (err) {
          layerCanvas.drawImage({
            source : "/content/error.png",
            x : decorData.x * zoom,
            y : decorData.y * zoom,
            width : (decorData.w || data.gridW) * zoom,
            height : (decorData.h || data.gridH) * zoom,
            sWidth: (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p,
            sHeight: (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p,
            sx: sX, sy: sY,
            fromCenter: false,
            rotate : decorData.r || 0,
          });
        }
      }
    }
  }
  return layerCanvas;
}

sync.render("ui_boardCard", function(obj, app, scope){
  var data = obj.data;
  var info = data.info;
  var charContainer = $("<div>");
  charContainer.addClass("flexcolumn flexmiddle");
  charContainer.attr("index", obj.id());

  var charOutline = $("<div>").appendTo(charContainer);
  charOutline.addClass("outline");
  charOutline.css("cursor", "pointer");
  if (!scope.viewOnly) {
    charOutline.addClass("hover3");
  }
  var optionsBar = $("<div>").appendTo(charOutline);
  optionsBar.addClass("flexaround");

  if (hasSecurity(getCookie("UserID"), "Rights", data) && !scope.viewOnly) {
    var deleteButton = genIcon("trash").appendTo(optionsBar);
    deleteButton.attr("title", "Delete Board");
    deleteButton.click(function() {
      var popOut = ui_prompt({
        target : $(this),
        id : "confirm-delete-board",
        confirm : "Delete Board",
        click : function(){
          runCommand("deleteAsset", {id: obj.id()});
          delete game.entities.data[obj.id()];
          game.entities.update();
        }
      });
    });

    var dupe = genIcon("duplicate");
    dupe.appendTo(optionsBar);
    dupe.attr("title", "Duplicate this Board");
    dupe.click(function(){
      runCommand("createPage", data);
    });

    var security = genIcon("lock").appendTo(optionsBar);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });
  }

  var charDiv = $("<div>").appendTo(charOutline);
  charDiv.css("overflow-y", "hidden");
  charDiv.css("min-width", "8em");
  charDiv.attr("index", obj.id());
  charDiv.css("cursor", "pointer");
  charDiv.click(function(ev){
    if (scope.click) {
      scope.click(ev, $(this), obj);
    }
  });
  if (!data.info) {
    data.info = {name : sync.newValue(null, data.name)};
  }
  var title = $("<b style='text-align : center;'>"+sync.rawVal(data.info.name)+"</b>").appendTo(charDiv);
  title.addClass("flexmiddle outlinebottom");

  if (sync.rawVal(data.info.name) && sync.rawVal(data.info.name).length > 20) {
    title.addClass("subtitle");
    title.css("text-align", "center");
    if (sync.rawVal(data.info.name).length > 35) {
      title.text(sync.rawVal(data.info.name).substring(0, 33)+"..");
    }
  }

  var zoom = 1;
  var isHex;
  if (data.options && data.options.hex) {
    isHex = true;
  }

  var icon = $("<div>").appendTo(charDiv);
  icon.addClass("flexmiddle");
  icon.css("position", "relative");
  icon.css("overflow", "hidden");

  var layerCanvas = $("<canvas>").appendTo(icon);
  layerCanvas.attr("height", "100px");
  layerCanvas.attr("width", "100px");

  var scale = Math.max(Math.max(100/data.w, 100/data.h), 0.25);

  layerCanvas.scaleCanvas({
    x : scale * data.w/-4,
    y : scale * data.h/-4,
    scale : scale,
  });

  if (data.map) {
    layerCanvas.drawImage({
      source : data.map,
      width : data.w,
      height : data.h,
      fromCenter: false,
    });
  }

  for (var lid in data.layers) {
    var layerData = data.layers[lid];
    var stamps = layerData.s;
    var tiles = layerData.t;

    for (var index in stamps) {
      var stampData = stamps[index];
      layerCanvas.drawImage({
        source : stampData.i,
        x : stampData.x * zoom,
        y : stampData.y * zoom,
        width : (stampData.w || data.gridW) * zoom,
        height : (stampData.h || data.gridH) * zoom,
        fromCenter: false,
        rotate : stampData.r || 0,
      });
    }

    for (var index in tiles) {
      var decorData = tiles[index];
      var sheetData = data.sheets[decorData.s];
      var tileW = sheetData.gW + sheetData.p;
      var tileH = sheetData.gH + sheetData.p;
      var xGrid = Math.ceil(sheetData.w/(tileW));
      var yGrid = Math.ceil(sheetData.h/(tileH));

      var sX = (decorData.i % xGrid) * tileW;
      var sY = Math.floor(decorData.i / xGrid) * tileH;
      if (decorData.t && (decorData.w >= (data.gridW || decorData.w) && decorData.h >= (data.gridH || decorData.h)) && !(isHex)) {
        var tileX = (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p;
        var tileY = (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p;
        var gridX = Math.floor((decorData.w || data.gridW)/tileX);
        var gridY = Math.floor((decorData.h || data.gridH)/tileY);
        var width = (tileX || decorData.w || data.gridW);
        var height = (tileY || decorData.h || data.gridH);
        for (var x=0; x<gridX; x++) {
          for (var y=0; y<gridY; y++) {
            layerCanvas.drawImage({
              source : sheetData.i,
              x : (decorData.x + x * width) * zoom,
              y : (decorData.y + y * height) * zoom,
              width : width * zoom,
              height : height * zoom,
              sWidth: tileX,
              sHeight: tileY,
              sx: sX, sy: sY,
              fromCenter : false,
              rotate : decorData.r || 0,
            });
          }
        }
      }
      else {
        if (isHex) {
          layerCanvas.drawLine({
            strokeStyle: 'rgba(0,0,0,0)',
            strokeWidth: 1,
            x1: (decorData.x) * zoom-1, y1: (decorData.y + (decorData.h || data.gridH)/2) * zoom,
            x2: (decorData.x + (decorData.w || data.gridW) * 4/16) * zoom, y2: (decorData.y) * zoom-1,
            x3: (decorData.x + (decorData.w || data.gridW) * 12/16) * zoom, y3: (decorData.y) * zoom-1,
            x4: (decorData.x + (decorData.w || data.gridW)) * zoom+1, y4: (decorData.y + (decorData.h || data.gridH)/2) * zoom,
            x5: (decorData.x + (decorData.w || data.gridW) * 12/16) * zoom, y5: (decorData.y + (decorData.h || data.gridH)) * zoom+1,
            x6: (decorData.x + (decorData.w || data.gridW) * 4/16) * zoom, y6: (decorData.y + (decorData.h || data.gridH)) * zoom+1,
            x7: (decorData.x) * zoom-1, y7: (decorData.y + (decorData.h || data.gridH)/2) * zoom,
            mask : true,
          }).drawImage({
            source : sheetData.i,
            x : decorData.x * zoom,
            y : decorData.y * zoom,
            width : (decorData.w || data.gridW) * zoom,
            height : (decorData.h || data.gridH) * zoom,
            sWidth: (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p,
            sHeight: (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p,
            sx: sX, sy: sY,
            fromCenter: false,
            rotate : decorData.r || 0,
          }).restoreCanvas();
        }
        else {
          layerCanvas.drawImage({
            source : sheetData.i,
            x : decorData.x * zoom,
            y : decorData.y * zoom,
            width : (decorData.w || data.gridW) * zoom,
            height : (decorData.h || data.gridH) * zoom,
            sWidth: (decorData.gW || 1) * sheetData.gW + ((decorData.gW || 1)-1) * sheetData.p,
            sHeight: (decorData.gH || 1) * sheetData.gH + ((decorData.gH || 1)-1) * sheetData.p,
            sx: sX, sy: sY,
            fromCenter: false,
            rotate : decorData.r || 0,
          });
        }
      }
    }
  }

  if (scope.label) {
    var labelDiv = $("<div>").appendTo(icon);
    labelDiv.addClass("alttext background outline subtitle");
    labelDiv.css("position", "absolute");
    labelDiv.css("padding", "2px");
    if (scope.label instanceof String) {
      labelDiv.append("<i>"+scope.label+"</i>");
    }
    else {
      labelDiv.append(scope.label);
    }
  }

  if (hasSecurity(getCookie("UserID"), "Owner", data) && !scope.viewOnly) {
    var syncLabel;
    if (data._c == -1) {
      syncLabel = genIcon("remove").appendTo(icon);
      syncLabel.addClass("alttext background outline");
      syncLabel.attr("title", "Duplicate to move to Asset Storage");
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
    else {
      if (data._uid) {
        if (data._sync) {
          syncLabel = genIcon("refresh").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, and in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : false});
            ev.stopPropagation();
            return false;
          });
        }
        else {
          syncLabel = genIcon("cloud").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, but is not in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : true});
            ev.stopPropagation();
            return false;
          });
        }
      }
      else {
        syncLabel = genIcon("cloud").appendTo(icon);
        syncLabel.addClass("outline");
        syncLabel.css("background-color", "white");
        syncLabel.attr("title", "Enable Asset Storage");
        syncLabel.click(function(ev){
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-store-char",
            confirm : "Move to Asset Storage",
            click : function(){
              runCommand("storeAsset", {id: obj.id()});
              layout.coverlay("quick-storage-popout");
              syncLabel.remove();
            }
          });
          ev.stopPropagation();
          return false;
        });
      }
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
  }

  return charContainer;
});
