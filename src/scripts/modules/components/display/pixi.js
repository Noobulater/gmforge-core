var floatingTile;
var randomRot;
var lastvideo;
sync.render("ui_board", function(obj, app, scope) {
  scope = scope || {
    viewOnly : (app.attr("viewOnly") == "true"),
    local : (app.attr("local") == "true"),
    layer : app.attr("layer"),
    noOptions : (app.attr("noOptions") == "true")
  };
  var lastSelections = boardApi.selections[app.attr("id")] || {};
  boardApi.triggers[obj.id()] = [];
  if (floatingTile && floatingTile.board != obj.id() || !app.attr("background")) {
    (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
    floatingImage = null;
    floatingTile = null;
  }

  if (game.locals["newAssetList"] && util.contains(game.locals["newAssetList"], obj.id()) && !obj.data.map) {
    app.attr("configuring", "background");
  }

  var data = obj.data;
  data.options = data.options || {};

  if (!app.attr("layer") && data.options && data.options.pLayer && !hasRights) {
    app.attr("layer", data.options.pLayer);
    scope.layer = data.options.pLayer;
  }
  if (scope.layer >= data.layers.length - 1) {
    // fuck fireffox
    scope.layer = data.layers.length - 1;
    app.attr("layer", data.layers.length - 1);
  }
  scope.layer = Math.max(scope.layer || 0, 0);

  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  if (data.options.pLayer != null && !hasRights) {
    scope.layer = data.options.pLayer;
  }
  // set some important app variables
  app.attr("index", obj.id());
  app.attr("layer", scope.layer);

  if (game.config.data.offline) {
    scope.local = true;
  }
  if (app.attr("zoom") == null && data.vZ) {
    app.attr("zoom", data.vZ);
  }
  else if (app.attr("zoom") == null) {
    app.attr("zoom", "100");
  }

  var portWidth = Number(app.attr("divWidth") || 0);
  var portHeight = Number(app.attr("divHeight") || 0);

  var gridWidth = data.gridW;
  var gridHeight = data.gridH;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var zoom = Number(app.attr("zoom")) / 100 || 1;

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var divRow = $("<div>").appendTo(div);
  divRow.addClass("flex noSelect");
  divRow.css("position", "relative");
  divRow.css("overflow", "hidden");

  var fullLoaded = true;
  for (var i in data.sheets) {
    if (data.sheets[i].i && !PIXI.loader.resources[data.sheets[i].i]) {
      fullLoaded = false;
      break;
    }
  }

  if (data.map && data.map.match(".gif") && !PIXI.loader.resources[data.map] && false) {
    fullLoaded = false;
  }
  for (var k in data.layers) {
    for (var p in data.layers[k].p) {
      if (data.layers[k].p[p].i && data.layers[k].p[p].i.match(".gif") && !PIXI.loader.resources[data.layers[k].p[p].i] && false) {
        fullLoaded = false;
        break;
      }
    }
  }

  if (app.attr("divWidth") && app.attr("divHeight") && fullLoaded) {
    if (app.attr("scrollLeft") == null && data.vX != null) {
      app.attr("scrollLeft", data.vX + (portWidth)/2/zoom);
    }
    if (app.attr("scrollTop") == null && data.vY != null) {
      app.attr("scrollTop", data.vY + (portHeight)/2/zoom);
    }
    var scrollLeft = Number(app.attr("scrollLeft")) || 0;
    var scrollTop = Number(app.attr("scrollTop")) || 0;

    divRow.css("max-width", app.width() || 0);
    divRow.css("max-height", app.height() || 0);

    var divRowWrapper = $("<div>").appendTo(divRow);
    divRowWrapper.addClass("fit-xy");
    divRowWrapper.css("overflow", "hidden");
    divRowWrapper.css("position", "absolute");

    if (data.c) {
      divRowWrapper.css("background-color", data.c);
    }
    if (boardApi.apps[app.attr("id")]) {
      boardApi.apps[app.attr("id")].destroy(true);
      boardApi.apps[app.attr("id")] = null;
    }
    boardApi.apps[app.attr("id")] = new PIXI.Application({
      width: portWidth,         // default: 800
      height: portHeight,        // default: 600
      antialias: true,    // default: false
      transparent: true, // default: false
      resolution: 1,       // default: 1
    });
    boardApi.apps[app.attr("id")].floatingImage = null;
    var floatingImage = boardApi.apps[app.attr("id")].floatingImage;
    boardApi.apps[app.attr("id")].views = {};


    boardApi.apps[app.attr("id")].opaqueBase = new PIXI.BaseRenderTexture(obj.data.w, obj.data.h, PIXI.SCALE_MODES.LINEAR);
    boardApi.apps[app.attr("id")].opaqueRender = new PIXI.RenderTexture(boardApi.apps[app.attr("id")].opaqueBase);

    boardApi.apps[app.attr("id")].fogBase = new PIXI.BaseRenderTexture(obj.data.w, obj.data.h, PIXI.SCALE_MODES.LINEAR);
    boardApi.apps[app.attr("id")].fogRender = new PIXI.RenderTexture(boardApi.apps[app.attr("id")].fogBase);

    boardApi.apps[app.attr("id")].expBase = new PIXI.BaseRenderTexture(obj.data.w, obj.data.h, PIXI.SCALE_MODES.LINEAR);
    boardApi.apps[app.attr("id")].expRender = new PIXI.RenderTexture(boardApi.apps[app.attr("id")].expBase);

    boardApi.apps[app.attr("id")].board = obj.id();

    boardApi.rebuildFogData(obj, app); // this is here for a reason, don't remove

    var emitter;
    var elapsed = Date.now();

    boardApi.triggers.cache[obj.id()] = boardApi.triggers.cache[obj.id()] || {};
    boardApi.triggers.flush[obj.id()] = boardApi.triggers.flush[obj.id()] || {};
    var boardCanvas = boardApi.apps[app.attr("id")];
    boardCanvas.stage.cZoom = Number(app.attr("zoom")) / 100 || 1;
    boardCanvas.ticker.add(function(delta){
      // Threat ticker
      if (emitter) { // weather stuff
        var now = Date.now();

      	emitter.update((now - elapsed) * 0.001);
      	elapsed = now;
      }

      zoom = Number(app.attr("zoom")) / 100 || 1;
      var startZoom = boardCanvas.stage.scale.x;

      var startX = boardCanvas.stage.x;
      var startY = boardCanvas.stage.y;
      if (boardCanvas.stage.dX && boardCanvas.stage.dY && (Math.abs(boardCanvas.stage.dX-startX) > 3 || Math.abs(boardCanvas.stage.dY-startY) > 3)) {
        boardCanvas.stage.x = util.lerp(startX, boardCanvas.stage.dX, 0.2);
        boardCanvas.stage.y = util.lerp(startY, boardCanvas.stage.dY, 0.2);
        app.attr("scrollLeft", boardCanvas.stage.x);
        app.attr("scrollTop", boardCanvas.stage.y);
      }
      else {
        delete boardCanvas.stage.dX;
        delete boardCanvas.stage.dY;
      }

      if (boardCanvas.stage.dZoom && boardCanvas.stage.dZoom != startZoom && !boardCanvas.stage.dX && !boardCanvas.stage.dY) {
        var focal = boardCanvas.stage.toLocal({x : portWidth/2, y : portHeight/2});
        boardCanvas.stage.x -= focal.x * (util.lerp(startZoom, boardCanvas.stage.dZoom, 0.2)-startZoom);
        boardCanvas.stage.y -= focal.y * (util.lerp(startZoom, boardCanvas.stage.dZoom, 0.2)-startZoom);
        boardCanvas.stage.scale.set(util.lerp(startZoom, boardCanvas.stage.dZoom, 0.2));
        app.attr("scrollLeft", boardCanvas.stage.x);
        app.attr("scrollTop", boardCanvas.stage.y);
      }

      for (var key in boardApi.triggers.flush[obj.id()]) {
        boardApi.triggers.flush[obj.id()][key](key);
        delete boardApi.triggers.flush[obj.id()][key];
      }
      if (app.attr("background") != "true") {
        cursorLayer.clear();
        if (data.beacons) {
          for (var i=data.beacons.length-1; i>=0; i--) {
            var beaconData = data.beacons[i];
            beaconData.size = beaconData.size || 0;
            if (!beaconData.gfx) {
              var beacon = new PIXI.Graphics();
              beaconLayer.addChild(beacon);
              beaconData.gfx = beacon;
            }
            if (beaconData.gfx && beaconData.size < 128) {
              beaconData.gfx.clear();
              beaconData.gfx.lineStyle(4, util.RGB_HEX(beaconData.col), 1-(beaconData.size/128));
              beaconData.gfx.drawCircle(beaconData.x, beaconData.y, beaconData.size);
              beaconData.gfx.endFill();
              beaconData.size += 1 * delta;
            }
            else {
              data.beacons.splice(i, 1);
              beaconLayer.removeChild(beaconData.gfx);
            }
          }
        }
        if (data.cursors) {
          var i = 0;
          if (cursorTextLayer.children && cursorTextLayer.children.length) {
            for (var j=0; j<cursorTextLayer.children.length; j++) {
              cursorTextLayer.children[j].visible = false;
              cursorMeasureLayer.children[j].visible = false;
            }
          }

          var delay = 1000;
          var now = Date.now();
          for (var userID in game.players.data) {
            // draw cursors of all players in the game
            if (data.cursors[userID] && userID != getCookie("UserID") && !data.cursors[userID].v) {
              if (data.options.cursorToggle) {
                cursorLayer.clear();
                if (cursorTextLayer.children && cursorTextLayer.children.length) {
                  cursorTextLayer.removeChildren(true);
                }
                if (cursorMeasureLayer.children && cursorMeasureLayer.children.length) {
                  cursorMeasureLayer.removeChildren(true);
                }
              }
              else {
                var cursorData = data.cursors[userID];
                var name = game.players.data[userID].displayName || "[No Name]";
                var drawX = data.cursors[userID].x;
                var drawY = data.cursors[userID].y;
                var col = util.RGB_HEX(game.players.data[userID].color || "rgba(0,0,0,0.5)");


                var namePlate;
                if (!cursorTextLayer.children || !cursorTextLayer.children[i]) {
                  namePlate = new PIXI.Text(game.players.data[userID].displayName, new PIXI.TextStyle(boardApi.fonts.default));
                  cursorTextLayer.addChild(namePlate);
                }
                else {
                  namePlate = cursorTextLayer.children[i];
                }
                namePlate.visible = true;
                namePlate.lastX = drawX + 8;
                namePlate.lastY = drawY;
                if (namePlate.lastX != namePlate.x || namePlate.lastY != namePlate.y) {
                  if (!namePlate.force) {
                    namePlate.force = now;
                  }
                  var percentage = Math.min((namePlate.force-now)/delay, 0);
                  namePlate.x = drawX + 8 + (((drawX + 8) - namePlate.x) * percentage);
                  namePlate.y = drawY + ((drawY - namePlate.y) * percentage);
                }

                if (namePlate.force && (now-namePlate.force) > delay) {
                  namePlate.x = drawX + 8;
                  namePlate.y = drawY;
                  delete namePlate.force;
                }

                cursorLayer.lineStyle(2, col);
                cursorLayer.drawCircle(namePlate.x-8, namePlate.y, 4/zoom);
                namePlate.style.fontSize = Math.max(10, 10/zoom);
                namePlate.text = game.players.data[userID].displayName;
                var measurePlate;
                if (!cursorMeasureLayer.children || !cursorMeasureLayer.children[i]) {
                  measurePlate = new PIXI.Text(null, new PIXI.TextStyle(boardApi.fonts.default));
                  cursorMeasureLayer.addChild(measurePlate);
                }
                else {
                  measurePlate = cursorMeasureLayer.children[i];
                }
                measurePlate.visible = false;

                if (cursorData.mX && cursorData.mY) {
                  var finalX = drawX;
                  var finalY = drawY;
                  var cX = cursorData.mX;
                  var cY = cursorData.mY;

                  cursorLayer.lineStyle(2, col);
                  cursorLayer.moveTo(cX, cY);
                  cursorLayer.lineTo(finalX, finalY);

                  var a = finalX - cX;
                  var b = finalY - cY;
                  var dist = Math.sqrt(a*a + b*b);

                  var text;
                  if (cursorData.mL) {
                    var length = Math.round(Math.abs(Math.floor(dist * 10)/10) / (data.options.unitScale || 1) * 10)/10;
                    var height = Math.abs(data.layers[cursorData.l].alt || 0);
                    if (cursorData.mL != cursorData.l) {
                      height = (data.layers[cursorData.mL].alt || 0) - (data.layers[cursorData.l].alt || 0);
                      if (height > 0) {
                        height = "+" + height;
                      }
                      var hyp = Math.round(Math.sqrt(length*length+height*height)*10)/10;
                      text = (data.options.unit || "un") + " : " + hyp + " (ALT. "+height+")";
                    }
                    else {
                      var hyp = Math.round(Math.sqrt(length*length+height*height)*10)/10;
                      text = (data.options.unit || "un") + " : " + hyp;
                    }
                  }
                  else {
                    text = Math.round(Math.abs(Math.floor(dist * 10)/10) / (data.options.unitScale || 1) * 10)/10 + " " + (data.options.unit || "un");
                  }

                  var dirX = (Math.abs(finalX-cX)/(cX-finalX)) || 0;
                  var dirY = (Math.abs(finalY-cY)/(cY-finalY)) || 0;

                  measurePlate.visible = true;
                  measurePlate.x = finalX - (finalX - cX)/2;
                  measurePlate.y = finalY - (finalY - cY)/2 + 20;
                  measurePlate.text = text;
                  measurePlate.style.fontSize = Math.max(10, 10/zoom);
                }
                i++;
              }
            }
          }
        }

        if (boardCanvas.stage.showThreats || Object.keys(boardApi.selections).length == 1) {
          threatCont.clear();
          var max = 0;
          for (var selection in boardApi.selections) {
            var selection = boardApi.selections[selection];
            if (selection.board == obj.id()) {
              var pieceData = data.layers[selection.layer][selection.type][selection.index];
              if (pieceData) {
                var context = sync.defaultContext();
                if (pieceData.eID != null) {
                  var ent = getEnt(pieceData.eID);
                  if (ent && ent.data) {
                    context[ent.data._t] = duplicate(ent.data);
                  }
                }
                var range;
                if (pieceData.o) {
                  var sortedO = Object.keys(pieceData.o).sort(function(a,b){
                    return sync.eval(pieceData.o[b].dist, context)-sync.eval(pieceData.o[b].dist, context);
                  });
                  var gridSlots = {};
                  for (var idx in sortedO) {
                    var key = sortedO[idx];
                    var auraData = pieceData.o[sortedO[idx]];
                    var range = Math.min(boardApi.scale(sync.eval(auraData.d, context), obj, true), obj.data.w);

                    var color = util.RGB_HEX(auraData.c || pieceData.c);
                    var alpha = util.RGB_ALPHA(auraData.c || pieceData.c);
                    if (!auraData.c) {
                      alpha = 0.5;
                    }

                    if (auraData.s) {
                      if (hasGrid && !isHex && range >= data.gridW && pieceData.w == data.gridW && pieceData.h == data.gridH) {
                        var midX = Math.floor((pieceData.x + pieceData.w/2)/data.gridW)*data.gridW + data.gridX || 0;
                        var midY = Math.floor((pieceData.y + pieceData.h/2)/data.gridW)*data.gridW + data.gridY || 0;

                        // count down squares from the top, expanding out
                        var countRight = Math.ceil(range/data.gridW);
                        for (var x=countRight; x>=countRight*-1; x--) {
                          var countUp = Math.max(countRight-Math.abs(x));
                          for (var y=countUp; y>=countUp*-1; y--) {
                            var xPos = pieceData.x-x*(data.gridW);
                            var yPos = pieceData.y-y*(data.gridW);


                            var overlapX = false;
                            var overlapY = false;
                            if ((xPos + data.gridW) > pieceData.x && (xPos + data.gridW) <= (pieceData.x + pieceData.w)) {
                              overlapX = true
                            }
                            if ((yPos + data.gridH) > pieceData.y && (yPos + data.gridH) <= (pieceData.y + pieceData.h)) {
                              overlapY = true;
                            }
                            if (!overlapX || !overlapY) {
                              if (!gridSlots[x+","+y]) {
                                threatCont.lineStyle(0, color, alpha);
                                threatCont.beginFill(color, alpha);
                                threatCont.drawRect(xPos, yPos, data.gridW, data.gridH);
                                threatCont.endFill();
                              }
                              else {
                                threatCont.beginFill(color, alpha);
                                threatCont.drawRect(xPos + data.gridW/4, yPos + data.gridH/4, data.gridW/2, data.gridH/2);
                                threatCont.endFill();
                              }
                              gridSlots[x+","+y] = true;
                            }
                          }
                        }
                      }
                    }
                    else {
                      threatCont.lineStyle(3, color, 0.35);
                      threatCont.drawCircle(pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
                    }
                  }
                }
              }
            }
          }
        }
        else {
          threatCont.clear();
        }
      }
      else {
        threatCont.clear();
      }
      lastTick = Date.now();
    });

    var board = $(boardCanvas.view).appendTo(divRowWrapper);
    board.addClass("board-"+obj.id() + " board dropContent");
    board.attr("index", obj.id());
    board.attr("uid", app.attr("id"));
    board.attr("background", app.attr("background"));
    board.attr("layer", scope.layer);
    board.attr("local", scope.local);
    board.attr("hpMode", (obj.data.options && obj.data.options.hpMode)?(obj.data.options.hpMode):("0"));
    board.css("position", "absolute");
    board.css("left", "0");
    board.css("top", "0");
    if (hasRights) {
      board.on("dragover", function(ev) {
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
      board.on('drop', function(ev, ui){
        ev.preventDefault();
        ev.stopPropagation();
        var dt = ev.originalEvent.dataTransfer||$(ui.draggable).data("dt");
        var files = dt.files;
        var focal = boardCanvas.stage.toLocal({x : ev.originalEvent.pageX, y : ev.originalEvent.pageY});
        var xPos = focal.x;
        var yPos = focal.y;
        if (board.attr("draw-start-x") || board.attr("draw-start-y")) {return;}
        if (false) {//files.length) {
          for (var i=0; i<files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function(e){
              // Should look like data:,<jibberish_data> based on which method you called
              var img = new Image();
              img.src = e.target.result;
              img.onload = function(){
                if (hasGrid) {
                  if (isHex) {
                    var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
                    var yGrid;
                    xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                    if (xGrid % 2) {
                      yGrid = Math.floor((yPos - (data.gridY || 0) - data.gridH/2)/data.gridH);
                      yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                    }
                    else {
                      yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                      yPos = (yGrid * data.gridH + (data.gridY || 0));
                    }
                  }
                  else {
                    var xGrid = Math.floor((xPos - (data.gridX || 0))/data.gridW);
                    var yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                    xPos = (xGrid * data.gridW + (data.gridX || 0));
                    yPos = (yGrid * data.gridH + (data.gridY || 0));
                  }
                }

                if (app.attr("background") == "true") {
                  data.sheets = data.sheets || [];
                  var push = -1;
                  for (var i in data.sheets) {
                    if (data.sheets[i].i == dt.getData("Text")) {
                      push = i;
                      break;
                    }
                  }
                  if (push == -1) {
                    push = data.sheets.length;
                    data.sheets.push({gW : this.naturalWidth, gH : this.naturalHeight, i : e.target.result, w : this.naturalWidth, h : this.naturalHeight, nW : this.naturalWidth, nH : this.naturalHeight, p : 0});
                  }
                  else {
                    data.sheets[push] = {gW : this.naturalWidth, gH : this.naturalHeight, i : e.target.result, w : this.naturalWidth, h : this.naturalHeight, nW : this.naturalWidth, nH : this.naturalHeight, p : 0};
                  }
                  data.layers[scope.layer].t.push({
                    x : xPos, y : yPos,
                    w : this.naturalWidth, h : this.naturalHeight,
                    s : push,
                    i : 0
                  });
                  sendAlert({text : "Tile Sheet Added"});
                }
                else {
                   data.layers[scope.layer].p.push({
                    x : xPos, y : yPos,
                    w : (data.pW || data.gridW || 64),
                    h : (data.pH || data.gridH || 64),
                    i : e.target.result
                  });
                  sendAlert({text : "Token Added"});
                }
                if (!scope.local) {
                  obj.sync("updateAsset");
                }
                else {
                  obj.update();
                }
                layout.coverlay(app.attr("id")+"-drag-overlay");
              }
              img.onerror = function(){
                sendAlert({text : "Error Occured"});
                layout.coverlay(app.attr("id")+"-drag-overlay");
              }
            };
            reader.onerror = function(){
              sendAlert({text : "Error Occured"});
              layout.coverlay(app.attr("id")+"-drag-overlay");
            }
            reader.readAsDataURL(files[i]);
          }
        }
        else if (_dragTransfer && _dragTransfer.type == "label") {
          var labelData = _dragTransfer.data;
          if (hasRights) {
            data.layers[scope.layer].d.push({
              x : xPos, y : yPos,
              c : labelData.pri, c2 : labelData.sec, c3 : labelData.box, p : labelData.padding, fontFamily : labelData.fontFamily, fontSize : labelData.fontSize, text : labelData.text,
              w : labelData.bold, t : "t", s : labelData.shadowBlur, sc : labelData.shadowColor, align : labelData.align
            });
            obj.sync("updateAsset");
          }
          else {
            runCommand("textPreviewAddDrawing", {id : obj.id(), layer : scope.layer, data : {
                x : xPos, y : yPos,
                c : labelData.pri, c2 : labelData.sec, c3 : labelData.box, p : labelData.padding, fontFamily : labelData.fontFamily, fontSize : labelData.fontSize, text : labelData.text,
                w : labelData.bold, t : "t", s : labelData.shadowBlur, sc : labelData.shadowColor
              },
            });
          }
          _dragTransfer = null;
        }
        else if (dt.getData("Text")) {
          var img = new Image();
          var url = dt.getData("Text");
          url = url.replace("http://localhost"+(getCookie("privatePort") || 30000), "");
          url = url.replace("http://127.0.0.1:"+(getCookie("privatePort") || 30000), "");
          img.src = url;
          img.onload = function(){
            if (hasGrid) {
              if (isHex) {
                var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
                var yGrid;
                xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                if (xGrid % 2) {
                  yGrid = Math.floor((yPos - (data.gridY || 0) - data.gridH/2)/data.gridH);
                  yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                }
                else {
                  yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                  yPos = (yGrid * data.gridH + (data.gridY || 0));
                }
              }
              else {
                var xGrid = Math.floor((xPos - (data.gridX || 0))/data.gridW);
                var yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                xPos = (xGrid * data.gridW + (data.gridX || 0));
                yPos = (yGrid * data.gridH + (data.gridY || 0));
              }
            }

            if (app.attr("background") == "true") {
              data.sheets = data.sheets || [];
              var push = -1;
              for (var i in data.sheets) {
                if (data.sheets[i].i == dt.getData("Text")) {
                  push = i;
                  break;
                }
              }
              if (push == -1) {
                push = data.sheets.length;
                data.sheets.push({gW : this.naturalWidth, gH : this.naturalHeight, i : img.src, w : this.naturalWidth, h : this.naturalHeight, nW : this.naturalWidth, nH : this.naturalHeight, p : 0});
              }
              else {
                data.sheets[push] = {gW : this.naturalWidth, gH : this.naturalHeight, i : img.src, w : this.naturalWidth, h : this.naturalHeight, nW : this.naturalWidth, nH : this.naturalHeight, p : 0};
              }
              data.layers[scope.layer].t.push({
                x : xPos, y : yPos,
                w : this.naturalWidth, h : this.naturalHeight,
                s : push,
                i : 0
              });
              sendAlert({text : "Tile Sheet Added"});
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
            }
            else {
              var newP = {
                 x : xPos, y : yPos,
                 w : (data.pW || data.gridW || 64),
                 h : (data.pH || data.gridH || 64),
                 i : url
               };
              boardApi.addObject(newP, scope.layer, "p", obj);
              sendAlert({text : "Token Added"});
            }
          }
        }
        else if (dt && dt.getData("OBJ")) {
          var ent = JSON.parse(dt.getData("OBJ"));
          if (ent._t != "i") {
            ent.tags = ent.tags || {};
            ent._flags = ent._flags || {};
            if (_down["17"]) {
              delete ent._flags["temp"];
            }
            else {
              ent._flags["temp"] = true;
            }

            if (ent._t == "b") {
              if (!game.config.data.offline) {
                runCommand("createBoard", ent);
              }
              else {
                game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
                game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
                game.entities.data["tempObj"+game.config.data.offline++].data = ent;
                game.entities.update();
              }
            }
            else if (ent._t == "c") {
              createCharacter(ent, true);
              game.entities.update();
            }
            else if (ent._t == "p") {
              if (!game.config.data.offline) {
                runCommand("createPage", ent);
              }
              else {
                game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
                game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
                game.entities.data["tempObj"+game.config.data.offline++].data = ent;
                game.entities.update();
              }
            }


            game.locals["newAssetList"] = game.locals["newAssetList"] || [];
            var lastKeys = Object.keys(game.entities.data);
            game.entities.listen["newAsset"] = function(rObj, newObj, target) {
              var change = true;
              var keyIndex;
              for (var key in game.entities.data) {
                if (!util.contains(lastKeys, key)) {
                  game.locals["newAssetList"].push(key);
                  keyIndex = key;
                  change = false;
                }
              }
              var ent = getEnt(keyIndex);
              if (ent && hasSecurity(userID, "Rights", ent.data)) {
                if (!_down["16"] && hasGrid) {
                  if (isHex) {
                    var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
                    var yGrid;
                    xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                    if (xGrid % 2) {
                      yGrid = Math.floor((yPos - (data.gridY || 0) - data.gridH/2)/data.gridH);
                      yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                    }
                    else {
                      yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                      yPos = (yGrid * data.gridH + (data.gridY || 0));
                    }
                  }
                  else {
                    xPos = (data.gridX || 0) + (Math.floor((xPos-(data.gridX || 0))/data.gridW)) * data.gridW;
                    yPos = (data.gridY || 0) + (Math.floor((yPos-(data.gridY || 0))/data.gridH)) * data.gridH;
                  }
                }

                if (!_down["16"]) {
                  for (var index in data.layers[scope.layer].p) {
                    if (data.layers[scope.layer].p[index] && data.layers[scope.layer].p[index].eID == keyIndex) {
                      data.layers[scope.layer].p[index].x = xPos;
                      data.layers[scope.layer].p[index].y = yPos;
                      if (!scope.local) {
                        runCommand("boardMove", {id : obj.id(), index : index, layer : scope.layer, type : "p", data : data.layers[scope.layer].p[index]});
                        boardApi.moveObject(scope.layer, "p", index, obj);
                      }
                      else {
                        obj.update();
                      }
                      return;
                    }
                  }
                }
                var newP = {
                  x : xPos,
                  y : yPos,
                  w : (data.pW || data.gridW || 64),
                  h : (data.pH || data.gridH || 64),
                  d : (data.pD || null),
                  c : (data.pC || null),
                  eID : keyIndex,
                  i : (ent.data.info.img != null)?(ent.data.info.img.min):(null)
                };
                if (newP.eID) {
                  var ent = getEnt(newP.eID);
                  if (ent.data._t == "c") {
                    ent = duplicate(ent);
                    var context = sync.defaultContext();
                    context[ent.data._t] = ent.data;
                    for (var i in ent.data.info.img.modifiers) {
                      var val = ent.data.info.img.modifiers[i];
                      if (val) {
                        newP[i] = val;
                      }
                    }
                    if (ent.data.info.img.modifiers) {
                      if (ent.data.info.img.modifiers.w) {
                        newP.w = Math.max(newP.w/(data.options.unitScale || 1), data.gridW || 10);
                      }
                      if (ent.data.info.img.modifiers.h) {
                        newP.h = Math.max(newP.h/(data.options.unitScale || 1), data.gridH || 10);
                      }
                    }
                  }
                }
                if (hasSecurity(userID, "Rights", data)) {
                  boardApi.addObject(newP, scope.layer, "p", obj);
                }
                else {
                  //boardApi.addObject(newP, scope.layer, "p", obj);
                }
              }
              return change;
            }
          }
        }
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
      board.on("dragleave", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
    }
    board.sortable({
      over : function(ev, ui){
        if ($(ui.item).attr("index")) {
          if (!$("#"+app.attr("id")+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : app,
              id : app.attr("id")+"-drag-overlay",
              style : {"pointer-events" : "none"}
            });
            olay.addClass("flexcolumn flexmiddle alttext focus");
            olay.css("font-size", "2em");
            olay.append("<b>Drop to Create</b>");
          }
        }
      },
      out : function(ev, ui) {
        layout.coverlay(app.attr("id")+"-drag-overlay");
      },
      update : function(ev, ui) {
        board.empty();
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
        var focal = boardCanvas.stage.toLocal({x : ev.pageX, y : ev.pageY});
        var xPos = focal.x;
        var yPos = focal.y;

        if ($(ui.item).hasClass("tile-drop-board-"+obj.id())) {
          if (!_down["16"] && hasGrid) {
            if (isHex) {
              var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
              var yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
              xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
              if (xGrid % 2) {
                yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
              }
              else {
                yPos = (yGrid * data.gridH + (data.gridY || 0));
              }
            }
            else {
              xPos = (data.gridX || 0) + (Math.floor((xPos-(data.gridX || 0))/data.gridW)) * data.gridW;
              yPos = (data.gridY || 0) + (Math.floor((yPos-(data.gridY || 0))/data.gridH)) * data.gridH;
            }
          }
          data.layers[scope.layer].t.push({
            x : xPos,
            y : yPos,
            w : (($(ui.item).attr("gridW") || 1) * (data.gridW || 64)),
            h : (($(ui.item).attr("gridH") || 1) * (data.gridH || 64)),
            gW : $(ui.item).attr("gridW"),
            gH : $(ui.item).attr("gridH"),
            i : $(ui.item).attr("tile"),
            s : $(ui.item).attr("sIndex"),
          });
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
        else if ($(ui.item).attr("index")) {
          var ent = getEnt($(ui.item).attr("index"));
          if (ent.data._t != "i") {
            if (ent && hasSecurity(userID, "Rights", ent.data)) {
              if (!_down["16"] && hasGrid) {
                if (isHex) {
                  var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
                  var yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
                  xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                  if (xGrid % 2) {
                    yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                  }
                  else {
                    yPos = (yGrid * data.gridH + (data.gridY || 0));
                  }
                }
                else {
                  xPos = (data.gridX || 0) + (Math.floor((xPos-(data.gridX || 0))/data.gridW)) * data.gridW;
                  yPos = (data.gridY || 0) + (Math.floor((yPos-(data.gridY || 0))/data.gridH)) * data.gridH;
                }
              }

              if (!_down["16"]) {
                for (var index in data.layers[scope.layer].p) {
                  if (data.layers[scope.layer].p[index] && data.layers[scope.layer].p[index].eID == $(ui.item).attr("index")) {
                    var oldData = data.layers[scope.layer].p[index];
                    data.layers[scope.layer].p[index].x = xPos;
                    data.layers[scope.layer].p[index].y = yPos;
                    if (!scope.local) {
                      runCommand("boardMove", {id : obj.id(), index : index, layer : scope.layer, type : "p", data : data.layers[scope.layer].p[index]});
                      boardApi.moveObject(scope.layer, "p", index, obj);
                    }
                    else {
                      obj.update();
                    }
                    return;
                  }
                }
              }
              var newP = {
                x : xPos,
                y : yPos,
                w : (data.pW || data.gridW || 64),
                h : (data.pH || data.gridH || 64),
                d : (data.pD || null),
                c : (data.pC || null),
                eID : $(ui.item).attr("index"),
                i : (ent.data.info.img != null)?(ent.data.info.img.min):(null)
              };
              if (newP.eID) {
                var ent = getEnt(newP.eID);
                if (ent.data._t == "c") {
                  ent = duplicate(ent);
                  var context = sync.defaultContext();
                  context[ent.data._t] = ent.data;

                  for (var i in ent.data.info.img.modifiers) {
                    var val = ent.data.info.img.modifiers[i];
                    if (val) {
                      newP[i] = val;
                    }
                  }
                  if (ent.data.info.img.modifiers) {
                    if (ent.data.info.img.modifiers.w) {
                      newP.w = Math.max(newP.w/(data.options.unitScale || 1), 10);
                    }
                    if (ent.data.info.img.modifiers.h) {
                      newP.h = Math.max(newP.h/(data.options.unitScale || 1), 10);
                    }
                  }
                }
              }
              if (hasSecurity(userID, "Rights", data)) {
                boardApi.addObject(newP, scope.layer, "p", obj);
              }
            }
          }
        }
        else if ($(ui.item).attr("cardSrc")) {
          if (!_down["16"] && hasGrid) {
            if (isHex) {
              var xGrid = Math.floor((xPos - (data.gridX || 0))/(data.gridW * 0.75));
              var yGrid = Math.floor((yPos - (data.gridY || 0))/data.gridH);
              xPos = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
              if (xGrid % 2) {
                yPos = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
              }
              else {
                yPos = (yGrid * data.gridH + (data.gridY || 0));
              }
            }
            else {
              xPos = (data.gridX || 0) + (Math.floor((xPos-(data.gridX || 0))/data.gridW)) * data.gridW;
              yPos = (data.gridY || 0) + (Math.floor((yPos-(data.gridY || 0))/data.gridH)) * data.gridH;
            }
          }

          var value = $(ui.item).attr("cardSrc");
          var img = new Image();
          img.src = value;
          img.onload = function(){
            var aspect = this.naturalWidth/this.naturalHeight;

            var imageWidth = this.naturalWidth;
            var imageHeight = this.naturalHeight;
            var areaHeight = (data.pH || data.gridH || 64);
            var areaWidth = (data.pW || data.gridW || 64);

            if (aspect >= 1) { // landscape
              imageWidth = areaWidth;
              imageHeight = imageWidth / aspect;
              if (imageHeight > areaHeight) {
                imageHeight = areaHeight;
                imageWidth = areaHeight * aspect;
              }
            }
            else { // portrait
              imageHeight = areaHeight;
              imageWidth = imageHeight * aspect;
              if (imageWidth > areaWidth) {
                imageWidth = areaWidth;
                imageHeight = areaWidth / aspect;
              }
            }

            var newP = {
              x : xPos, y : yPos,
              w : imageWidth, h : imageHeight,
              i : value
            };
            boardApi.addObject(newP, scope.layer, "p", obj);
          }
        }
        ev.stopPropagation(); //don't go through boards
      }
    });
    if (!isChrome()) {
      board.bind('wheel', function(ev) {
        ev.preventDefault();
        layout.coverlay($(".piece-quick-edit"));
        if (ev.originalEvent.deltaY < 0) {
          if (_down[16]) {
            var selected = boardApi.selections;
            if (Object.keys(boardApi.selections) && Object.keys(boardApi.selections).length == 1) {
              var index = Object.keys(selected)[0];
              if (selected[index].type == "p" && selected[index].index != null) {
                var pieceData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
                var ent = getEnt(pieceData.eID);
                pieceData.r = (pieceData.r || 0) + 45;
                if (!scope.local) {
                  runCommand("boardMove", {id : obj.id(), layer : selected[index].layer, type : selected[index].type, index : selected[index].index, data : pieceData});
                  boardApi.moveObject(scope.layer, "p", index, obj);
                }
                selected[index].image.rotation = (pieceData.r || 0)/180 * (Math.PI);
                selected[index].selected.rotation = (pieceData.r || 0)/180 * (Math.PI);
              }
              else if (selected[index].type == "t" && selected[index].index != null) {
                var tileData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
                tileData.r = (tileData.r || 0) + 45;
                selected[index].image.rotation = (tileData.r || 0)/180 * (Math.PI);
                selected[index].selected.rotation = (tileData.r || 0)/180 * (Math.PI);
              }
            }
            else if (floatingTile) {
              floatingTile.r = (floatingTile.r || 0) + 45;
              if (floatingImage) {
                floatingImage.children[0].rotation = (floatingTile.r || 0)/180 * (Math.PI);
              }
            }
            else {
              boardCanvas.stage.x += (data.gridW || 50) * zoom;
            }
          }
          else {
            if (_down[17]) {
              boardCanvas.stage.y += (data.gridH || 50) * zoom;
            }
            else {
              if (!(board.attr("measure-x") || board.attr("measure-y"))) {
                var zoomRange = $("#"+app.attr("id")+"-zoom-range-"+obj.id());
                zoomRange.val(Number(zoomRange.val())+10);
                zoomRange.change();
              }
              else {
                for (var i=Number(board.attr("measure-layer") || 0); i<obj.data.layers.length; i++) {
                  if (board.attr("measure-layer") == null || obj.data.layers[board.attr("measure-layer")].alt != obj.data.layers[i].alt) {
                    if (hasRights || hasSecurity(userID, "Visible", obj.data.layers[i])) {
                      board.attr("measure-layer", i);
                      boardApi.measureMove(board, ev, obj, app, scope);
                      board.drawLayers();
                      break;
                    }
                  }
                }
              }
            }
          }
          return false;
        }
        else if (ev.originalEvent.deltaY > 0) {
          if (_down[16]) {
            var selected = boardApi.selections;
            if (Object.keys(selected) && Object.keys(selected).length == 1) {
              var index = Object.keys(selected)[0];
              if (selected[index].type == "p" && selected[index].index != null) {
                var pieceData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
                var ent = getEnt(pieceData.eID);
                pieceData.r = (pieceData.r || 0) - 45;
                if (!scope.local) {
                  runCommand("boardMove", {id : obj.id(), layer : selected[index].layer, type : selected[index].type, index : selected[index].index, data : pieceData});
                  boardApi.moveObject(scope.layer, "p", index, obj);
                }
                selected[index].image.rotation = (pieceData.r || 0)/180 * (Math.PI);
                selected[index].selected.rotation = (pieceData.r || 0)/180 * (Math.PI);
              }
              else if (selected[index].type == "t" && selected[index].index != null) {
                var tileData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
                tileData.r = (tileData.r || 0) - 45;
                selected[index].image.rotation = (tileData.r || 0)/180 * (Math.PI);
                selected[index].selected.rotation = (tileData.r || 0)/180 * (Math.PI);
              }
            }
            else if (floatingTile) {
              floatingTile.r = (floatingTile.r || 0) - 45;
              if (floatingImage) {
                floatingImage.children[0].rotation = (floatingTile.r || 0)/180 * (Math.PI);
              }
            }
            else {
              boardCanvas.stage.x -= (data.gridW || 50) * zoom;
            }
          }
          else {
            if (_down[17]) {
              boardCanvas.stage.y -= (data.gridH || 50) * zoom;
            }
            else {
              if (!(board.attr("measure-x") || board.attr("measure-y"))) {
                var zoomRange = $("#"+app.attr("id")+"-zoom-range-"+obj.id());
                zoomRange.val(Number(zoomRange.val())-10);
                zoomRange.change();
              }
              else {
                for (var i=Number(board.attr("measure-layer") || 0); i>=0; i--) {
                  if (board.attr("measure-layer") == null || obj.data.layers[board.attr("measure-layer")].alt != obj.data.layers[i].alt) {
                    if (hasRights || hasSecurity(userID, "Visible", obj.data.layers[i])) {
                      board.attr("measure-layer", i);
                      boardApi.measureMove(board, ev, obj, app, scope);
                      board.drawLayers();
                      break;
                    }
                  }
                }
              }
            }
          }
          return false;
        }
      });
    }
    board.bind('mousewheel', function(ev) {
      ev.preventDefault();
      layout.coverlay($(".piece-quick-edit"));
      if (ev.originalEvent.wheelDelta/120 > 0) {
        if (_down[16]) {
          var selected = boardApi.selections;
          if (Object.keys(boardApi.selections) && Object.keys(boardApi.selections).length == 1) {
            var index = Object.keys(selected)[0];
            if (selected[index].type == "p" && selected[index].index != null) {
              var pieceData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
              var ent = getEnt(pieceData.eID);
              pieceData.r = (pieceData.r || 0) + 45;
              if (!scope.local) {
                runCommand("boardMove", {id : obj.id(), layer : selected[index].layer, type : selected[index].type, index : selected[index].index, data : pieceData});
                boardApi.moveObject(scope.layer, "p", index, obj);
              }
              selected[index].image.rotation = (pieceData.r || 0)/180 * (Math.PI);
              selected[index].selected.rotation = (pieceData.r || 0)/180 * (Math.PI);
            }
            else if (selected[index].type == "t" && selected[index].index != null) {
              var tileData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
              tileData.r = (tileData.r || 0) + 45;
              selected[index].image.rotation = (tileData.r || 0)/180 * (Math.PI);
              selected[index].selected.rotation = (tileData.r || 0)/180 * (Math.PI);
            }
          }
          else if (floatingTile) {
            floatingTile.r = (floatingTile.r || 0) + 45;
            if (floatingImage) {
              floatingImage.children[0].rotation = (floatingTile.r || 0)/180 * (Math.PI);
            }
          }
          else {
            boardCanvas.stage.x += (data.gridW || 50) * zoom;
          }
        }
        else {
          if (_down[17]) {
            boardCanvas.stage.y += (data.gridH || 50) * zoom;
          }
          else {
            if (!(board.attr("measure-x") || board.attr("measure-y"))) {
              var zoomRange = $("#"+app.attr("id")+"-zoom-range-"+obj.id());
              zoomRange.val(Number(zoomRange.val())+10);
              zoomRange.change();
            }
            else {
              for (var i=Number(board.attr("measure-layer") || 0); i<obj.data.layers.length; i++) {
                if (board.attr("measure-layer") == null || obj.data.layers[board.attr("measure-layer")].alt != obj.data.layers[i].alt) {
                  if (hasRights || hasSecurity(userID, "Visible", obj.data.layers[i])) {
                    board.attr("measure-layer", i);
                    boardApi.measureMove(board, ev, obj, app, scope);
                    board.drawLayers();
                    break;
                  }
                }
              }
            }
          }
        }
        return false;
      }
      else if (ev.originalEvent.wheelDelta/120 < 0) {
        if (_down[16]) {
          var selected = boardApi.selections;
          if (Object.keys(selected) && Object.keys(selected).length == 1) {
            var index = Object.keys(selected)[0];
            if (selected[index].type == "p" && selected[index].index != null) {
              var pieceData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
              var ent = getEnt(pieceData.eID);
              pieceData.r = (pieceData.r || 0) - 45;
              if (!scope.local) {
                runCommand("boardMove", {id : obj.id(), layer : selected[index].layer, type : selected[index].type, index : selected[index].index, data : pieceData});
                boardApi.moveObject(scope.layer, "p", index, obj);
              }
              selected[index].image.rotation = (pieceData.r || 0)/180 * (Math.PI);
              selected[index].selected.rotation = (pieceData.r || 0)/180 * (Math.PI);
            }
            else if (selected[index].type == "t" && selected[index].index != null) {
              var tileData = obj.data.layers[selected[index].layer][selected[index].type][selected[index].index];
              tileData.r = (tileData.r || 0) - 45;
              selected[index].image.rotation = (tileData.r || 0)/180 * (Math.PI);
              selected[index].selected.rotation = (tileData.r || 0)/180 * (Math.PI);
            }
          }
          else if (floatingTile) {
            floatingTile.r = (floatingTile.r || 0) - 45;
            if (floatingImage) {
              floatingImage.children[0].rotation = (floatingTile.r || 0)/180 * (Math.PI);
            }
          }
          else {
            boardCanvas.stage.x -= (data.gridW || 50) * zoom;
          }
        }
        else {
          if (_down[17]) {
            boardCanvas.stage.y -= (data.gridH || 50) * zoom;
          }
          else {
            if (!(board.attr("measure-x") || board.attr("measure-y"))) {
              var zoomRange = $("#"+app.attr("id")+"-zoom-range-"+obj.id());
              zoomRange.val(Number(zoomRange.val())-10);
              zoomRange.change();
            }
            else {
              for (var i=Number(board.attr("measure-layer") || 0); i>=0; i--) {
                if (board.attr("measure-layer") == null || obj.data.layers[board.attr("measure-layer")].alt != obj.data.layers[i].alt) {
                  if (hasRights || hasSecurity(userID, "Visible", obj.data.layers[i])) {
                    board.attr("measure-layer", i);
                    boardApi.measureMove(board, ev, obj, app, scope);
                    board.drawLayers();
                    break;
                  }
                }
              }
            }
          }
        }
        return false;
      }
    });

    boardCanvas.stage.interactive = true;
    if (!layout.mobile) {
      board.mousedown(function(ev){
        window.getSelection().removeAllRanges();

        var localCoord = boardCanvas.stage.toLocal({x : ev.pageX, y : ev.pageY});
        var finalX = localCoord.x;
        var finalY = localCoord.y;
        var key = ev.keyCode || ev.which;
        $(".main-dock").css("pointer-events", "none");
        $(".boardMenu").css("pointer-events", "none");
        if (!boardApi.objectClick && key == 1) {
          if (!boardApi.dragging) {
            if (_down[17] && !(game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing)) {
              boardApi.newDragEvent({
                startX : finalX,
                startY : finalY,
                measuring : true,
                move : function(ev){
                  var stage = boardApi.apps[app.attr("id")].stage;
                  var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

                  if (floatingImage) {
                    if (floatingImage._mode != "measure") {
                      (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                      floatingImage = new PIXI.Container();
                      floatingImage._mode = "measure";
                      floatingImage.addChild(new PIXI.Graphics());
                      floatingImage.addChild(new PIXI.Text());
                    }
                  }
                  else {
                    floatingImage = new PIXI.Container();
                    floatingImage._mode = "measure";

                    var textStyle = new PIXI.TextStyle({
                      fontFamily: "Arial",
                      fontWeight: "bold",
                      fill: "white",
                      stroke: 'black',
                      strokeThickness: 3,
                      dropShadow: true,
                      dropShadowColor: "rgba(0,0,0,0.2)",
                      dropShadowBlur: 2,
                      dropShadowAngle: 0,
                    });

                    floatingImage.addChild(new PIXI.Graphics());
                    floatingImage.addChild(new PIXI.Text("", textStyle));
                  }

                  var visual = floatingImage.children[0];
                  var textCanvas = floatingImage.children[1];

                  var sX = boardApi.dragging.startX;
                  var sY = boardApi.dragging.startY;

                  var eX = focal.x;
                  var eY = focal.y;

                  if (!_down[16] && hasGrid) {
                    if (isHex) {
                      var xGrid = Math.floor((sX - (data.gridX || 0))/(data.gridW * 0.75));
                      var yGrid;
                      sX = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4) + data.gridW/2;
                      if (xGrid % 2) {
                        yGrid = Math.floor((sY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                        sY = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                      }
                      else {
                        yGrid = Math.floor((sY - (data.gridY || 0))/data.gridH);
                        sY = (yGrid * data.gridH + (data.gridY || 0));
                      }
                      sY += data.gridH/2;

                      var xGrid = Math.floor((eX - (data.gridX || 0))/(data.gridW * 0.75));
                      var yGrid;
                      eX = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4) + data.gridW/2;
                      if (xGrid % 2) {
                        yGrid = Math.floor((eY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                        eY = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                      }
                      else {
                        yGrid = Math.floor((eY - (data.gridY || 0))/data.gridH);
                        eY = (yGrid * data.gridH + (data.gridY || 0));
                      }
                      eY += data.gridH/2;
                    }
                    else {
                      sX = Math.floor((sX-(data.gridX || 0))/data.gridW) * data.gridW + (data.gridX || 0) + data.gridW/2;
                      sY = Math.floor((sY-(data.gridY || 0))/data.gridH) * data.gridH + (data.gridY || 0) + data.gridH/2;
                      eX = Math.floor((eX-(data.gridX || 0))/data.gridW) * data.gridW + (data.gridX || 0) + data.gridW/2;
                      eY = Math.floor((eY-(data.gridY || 0))/data.gridH) * data.gridH + (data.gridY || 0) + data.gridH/2;
                    }
                  }

                  visual.clear();
                  visual.lineStyle(4, 0x000000, 1);
                  visual.drawCircle(sX, sY, 2, 2);
                  visual.moveTo(sX, sY);
                  visual.lineTo(eX, eY);

                  var a = sX-eX;
                  var b = sY-eY;

                  var startX = Math.floor((sX - (data.gridX || 0))/data.gridW);
                  var startY = Math.floor((sY - (data.gridY || 0))/data.gridH);

                  var endX = Math.floor((eX - (data.gridX || 0))/data.gridW);
                  var endY = Math.floor((eY - (data.gridY || 0))/data.gridH);

                  var slope = (startY - endY)/(startX - endX);
                  //trace the path
                  var mW = (Math.abs(eX-sX))*data.gridW;
                  var mH = (Math.abs(eY-sY))*data.gridH;
                  var measureSize = Math.max(mW, mH);

                  var offsetX = Math.min(startX, endX);
                  var offsetY = Math.min(startY, endY);

                  if (hasGrid && !isHex) {
                    var squares = 0;

                    // draw Squares
                    visual.beginFill(util.RGB_HEX("rgba(0,255,0,0.3)"), util.RGB_ALPHA("rgba(0,255,0,0.3)"));
                    visual.lineStyle(1, 0x000000, 1);
                    if (Math.abs(slope) < 1) {
                      var squares = 0;
                      var loopStart = startX;
                      var loopEnd = endX+1;
                      if (startX > endX) {
                        loopStart = endX;
                        loopEnd = startX+1;
                      }

                      for (var x=loopStart; x<loopEnd; x++) {
                        var y = startY + Math.floor((x - startX) * slope);

                        visual.drawRect((Math.min(startX,endX) + (x - offsetX)) * data.gridW + (data.gridX || 0), (Math.min(startY,endY) + (y - offsetY)) * data.gridH + (data.gridY || 0), data.gridW, data.gridH);

                        squares++;
                      }
                    }
                    else {
                      var squares = 0;
                      var loopStart = startY;
                      var loopEnd = endY+1;
                      if (startY > endY) {
                        loopStart = endY;
                        loopEnd = startY+1;
                      }
                      for (var y=loopStart; y<loopEnd; y++) {
                        var x = startX + Math.floor((y - startY) / slope);

                        visual.drawRect((Math.min(startX,endX) + (x - offsetX)) * data.gridW + (data.gridX || 0), (Math.min(startY,endY) + (y - offsetY)) * data.gridH + (data.gridY || 0), data.gridW, data.gridH);

                        squares++;
                      }
                      visual.endFill();
                    }

                    floatingImage.squares = squares-1;
                  }
                  var dist = Math.sqrt(a*a + b*b);
                  var text;
                  var location = {sq : floatingImage.squares, flat : Math.abs(dist)};
                  if (board.attr("measure-layer") || board.attr("alt-override")) {
                    var length = location.flat;
                    var height = Math.abs(obj.data.layers[scope.layer].alt || 0);
                    if (canvas.attr("measure-layer") != scope.layer || (canvas.attr("alt-override") && height != canvas.attr("alt-override"))) {
                      if (canvas.attr("alt-override")) {
                        height = Number(canvas.attr("alt-override"));
                      }
                      else {
                        height = (obj.data.layers[canvas.attr("measure-layer")].alt || 0);
                      }
                      height = height - (obj.data.layers[scope.layer].alt || 0);
                      var hyp = Math.sqrt(length*length+height*height);
                      location.dist = Math.round(hyp / (data.options.unitScale || 1) * 10) / 10;
                      location.alt = Math.round(height / (data.options.unitScale || 1) * 10) / 10;
                      location.flat = Math.round(location.flat / (data.options.unitScale || 1) * 10) / 10;
                      height = location.alt;
                      if (height > 0) {
                        height = "+" + height;
                      }
                      text = (data.options.unit || "un") + "" + location.dist + " (ALT. "+height+")";
                    }
                    else {
                      var hyp = Math.sqrt(length*length+height*height);
                      location.flat = Math.round(location.flat / (data.options.unitScale || 1) * 10) / 10;
                      location.dist = Math.round(hyp / (data.options.unitScale || 1) * 10) / 10;
                      text = (data.options.unit || "un") +" : " + location.dist;
                    }
                  }
                  else {
                    location.flat = Math.round(location.flat / (data.options.unitScale || 1) * 10) / 10;
                    location.dist = location.flat;
                    text = location.dist + "" + (data.options.unit || "un");
                  }

                  if (game.locals["actions"]) {
                    for (var i in game.locals["actions"]) {
                      var actObj = game.locals["actions"][i];
                      if (actObj.data && !actObj.data.manual) {
                        actObj.data.loc = location;
                        actObj.update();
                      }
                    }
                  }
                  if (game.locals["actionsList"]) {
                    for (var i in game.locals["actionsList"]) {
                      var actObj = game.locals["actionsList"][i];
                      if (actObj.data && !actObj.data.manual) {
                        actObj.data.loc = location;
                        actObj.update();
                      }
                    }
                  }
                  svd.location = location;
                  var textSquares = parseInt(boardApi.scale(floatingImage.squares * data.gridW, obj)) + "" + (data.options.unit || "un");
                  if (floatingImage.squares == null) {
                    textSquares = "";
                  }
                  else if (textSquares != text) {
                    text = textSquares + "\n(" + (text || "") + ")";
                  }
                  var dirX = (Math.abs(eX-sX)/(sX-eX)) || 0;
                  var dirY = (Math.abs(eY-sY)/(sY-eY)) || 0;

                  textCanvas.text = text;
                  textCanvas.pivot.x = textCanvas.width/2;
                  textCanvas.pivot.y = textCanvas.height/2;
                  textCanvas.x = eX + dirX * 20 + (textCanvas.width || 0) * (dirX/Math.abs(dirX) || 0);
                  textCanvas.y = eY + dirY * 20 + (textCanvas.height || 0) * (dirY/Math.abs(dirY) || 0);

                  stage.cursor = "none";
                  stage.addChild(floatingImage);
                  if (!scope.local) {
                    var update = {id : obj.id(), data : {
                      x : eX, y : eY, l : scope.layer, mX : sX, mY : sY,
                      v : (app.attr("hideCursor") == "true")}
                    };
                    if (time <= Date.now()) {
                      runCommand("updateBoardCursor", update);
                      time = Date.now() + 100;
                    }
                  }
                },
                end : function(ev) {
                  var stage = boardApi.apps[app.attr("id")].stage;
                  var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});
                  (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                  floatingImage = null;
                  delete stage.cursor;
                  delete boardApi.dragging;
                }
              });
            }
            else {
              if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
                if (game.locals["drawing"].data.drawing == "free") {
                  var xPos = localCoord.x;
                  var yPos = localCoord.y;

                  var tempCanvas = $("<canvas>").appendTo(divRow);
                  tempCanvas.attr("width", divRow.width());
                  tempCanvas.attr("height", divRow.height());
                  tempCanvas.css("position", "absolute");
                  tempCanvas.css("left", 0);
                  tempCanvas.css("top", 0);
                  tempCanvas.css("pointer-events", "none");
                  var ctx = tempCanvas[0].getContext('2d');
                  ctx.beginPath();
                  ctx.lineWidth = game.locals["drawing"].data.lineSize || 12;
                  ctx.strokeStyle = game.locals["drawing"].data.primary;
                  ctx.lineCap = 'round';

                  var ppts = [];
                  ppts.push({x : ev.pageX, y : ev.pageY});
                  var minX = xPos;
                  var minY = yPos;
                  var maxX = xPos;
                  var maxY = yPos;

                  boardApi.newDragEvent({
                    startX : xPos,
                    startY : yPos,
                    lastX : ev.pageX,
                    lastY : ev.pageY,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      ctx.lineWidth = game.locals["drawing"].data.lineSize || 6;
                      ctx.strokeStyle = game.locals["drawing"].data.primary;
                      ctx.lineCap = 'round';
                      if (Math.floor(boardApi.dragging.lastX) != Math.floor(ev.pageX) || Math.floor(boardApi.dragging.lastY) != Math.floor(ev.pageY)) {
                        ppts.push({x : ev.pageX, y : ev.pageY});

                        ctx.clearRect(0, 0, tempCanvas.width(), tempCanvas.height());

                        ctx.beginPath();
                    		ctx.moveTo(ppts[0].x, ppts[0].y);

                    		for (var i = 1; i < ppts.length - 2; i++) {
                    			var c = (ppts[i].x + ppts[i + 1].x) / 2;
                    			var d = (ppts[i].y + ppts[i + 1].y) / 2;

                    			ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
                    		}

                        ctx.quadraticCurveTo(
                    			ppts[i].x,
                    			ppts[i].y,
                    			ppts[i + 1].x,
                    			ppts[i + 1].y
                    		);
                    		ctx.stroke();
                        boardApi.dragging.lastX = ev.pageX;
                        boardApi.dragging.lastY = ev.pageY;

                        minX = Math.min(end.x, minX);
                        minY = Math.min(end.y, minY);
                        maxX = Math.max(end.x, maxX);
                        maxY = Math.max(end.y, maxY);
                      }
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;

                      util.trimCanvas(ctx);

                      var x1 = boardApi.dragging.startX;
                      var y1 = boardApi.dragging.startY;
                      var x2 = end.x;
                      var y2 = end.y;

                      boardApi.addObject({
                        x : minX,
                        y : minY,
                        w : Math.max(maxX-minX, 5),
                        h : Math.max(maxY-minY, 5),
                        i : tempCanvas[0].toDataURL(),
                        c1 : game.locals["drawing"].data.primary || "rgba(50,50,50,1)",
                        c2 : game.locals["drawing"].data.secondary || "rgba(255,255,255,0)",
                        drawing : "free",
                        uID : getCookie("UserID")
                      }, scope.layer, "d", obj);

                      delete boardApi.dragging;
                      tempCanvas.remove();
                    }
                  }, ev);
                }
                if (game.locals["drawing"].data.drawing == "line") {
                  var xPos = localCoord.x;
                  var yPos = localCoord.y;

                  if (!_down[16] && hasGrid) {
                    if (game.locals["drawing"].data.fog && game.locals["drawing"].data.gridInc) {
                      var gridInc = game.locals["drawing"].data.gridInc;
                      xPos = Math.round((localCoord.x-(data.gridX || 0)) / gridInc) * gridInc + (data.gridX || 0);
                      yPos = Math.round((localCoord.y-(data.gridY || 0)) / gridInc) * gridInc + (data.gridY || 0);
                    }
                    else {
                      xPos = Math.round((localCoord.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                      yPos = Math.round((localCoord.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                    }
                  }
                  if (boardApi.startX) {
                    xPos = boardApi.startX;
                    delete boardApi.startX;
                  }
                  if (boardApi.startY) {
                    yPos = boardApi.startY;
                    delete boardApi.startY;
                  }
                  boardApi.newDragEvent({
                    startX : xPos,
                    startY : yPos,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "line") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "line";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "line";
                        stage.addChild(floatingImage);
                      }
                      floatingImage.clear();
                      floatingImage.lineStyle(3, util.RGB_HEX(game.locals["drawing"].data.primary || "rgba(50,50,50,1)"), util.RGB_ALPHA(game.locals["drawing"].data.primary || "rgba(50,50,50,1)"));
                      if (game.locals["drawing"].data.fog) {
                        floatingImage.lineStyle(3, 0x000000);
                      }
                      else {
                        floatingImage.lineStyle(3, util.RGB_HEX(game.locals["drawing"].data.primary || "rgba(50,50,50,1)"), util.RGB_ALPHA(game.locals["drawing"].data.primary || "rgba(50,50,50,1)"));
                      }
                      floatingImage.moveTo(boardApi.dragging.startX, boardApi.dragging.startY);
                      if (!_down[16] && hasGrid) {
                        var xPos;
                        var yPos;
                        if (game.locals["drawing"].data.fog && game.locals["drawing"].data.gridInc) {
                          var gridInc = game.locals["drawing"].data.gridInc;
                          xPos = Math.round((end.x-(data.gridX || 0)) / gridInc) * gridInc + (data.gridX || 0);
                          yPos = Math.round((end.y-(data.gridY || 0)) / gridInc) * gridInc + (data.gridY || 0);
                        }
                        else {
                          xPos = Math.round((end.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                          yPos = Math.round((end.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        }

                        floatingImage.lineTo(xPos, yPos);
                      }
                      else {
                        floatingImage.lineTo(end.x, end.y);
                      }
                      floatingImage.alpha = 1;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var x1 = boardApi.dragging.startX;
                      var y1 = boardApi.dragging.startY;
                      var x2 = end.x;
                      var y2 = end.y;

                      if (!_down[16] && hasGrid) {
                        if (game.locals["drawing"].data.fog && game.locals["drawing"].data.gridInc) {
                          var gridInc = game.locals["drawing"].data.gridInc;
                          x1 = Math.round((x1-(data.gridX || 0)) / gridInc) * gridInc + (data.gridX || 0);
                          y1 = Math.round((y1-(data.gridY || 0)) / gridInc) * gridInc + (data.gridY || 0);
                          x2 = Math.round((x2-(data.gridX || 0)) / gridInc) * gridInc + (data.gridX || 0);
                          y2 = Math.round((y2-(data.gridY || 0)) / gridInc) * gridInc + (data.gridY || 0);
                        }
                        else {
                          x1 = Math.round((x1-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                          y1 = Math.round((y1-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                          x2 = Math.round((x2-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                          y2 = Math.round((y2-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        }
                      }

                      var minX = Math.min(x1, x2);
                      var minY = Math.min(y1, y2);
                      var maxX = Math.max(x1, x2);
                      var maxY = Math.max(y1, y2);
                      var key = ev.keyCode || ev.which;
                      if (game.locals["drawing"].data.fog) {
                        if (x1 != x2 || y1 != y2) {
                          boardApi.addObject({
                            x1 : x1,
                            y1 : y1,
                            x2 : x2,
                            y2 : y2,
                          }, scope.layer, "w", obj);
                        }
                      }
                      else {
                        boardApi.addObject({
                          x : minX,
                          y : minY,
                          w : Math.max(maxX-minX, 1),
                          h : Math.max(maxY-minY, 1),
                          x1 : x1-minX,
                          y1 : y1-minY,
                          x2 : x2-minX,
                          y2 : y2-minY,
                          c1 : game.locals["drawing"].data.primary || "rgba(50,50,50,1)",
                          c2 : game.locals["drawing"].data.secondary || "rgba(255,255,255,0)",
                          drawing : "line",
                          uID : getCookie("UserID")
                        }, scope.layer, "d", obj);
                      }

                      if (!_down[17]) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                      }
                      else {
                        boardApi.dragging.startX = end.x;
                        boardApi.dragging.startY = end.y;
                      }
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "scale") {
                  var xPos = localCoord.x;
                  var yPos = localCoord.y;
                  if (!_down[16] && hasGrid) {
                    xPos = Math.round((localCoord.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                    yPos = Math.round((localCoord.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                  }

                  boardApi.newDragEvent({
                    startX : xPos,
                    startY : yPos,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "scale") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "scale";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "scale";
                        stage.addChild(floatingImage);
                      }
                      floatingImage.clear();
                      floatingImage.lineStyle(2, 0xFF8a42);

                      if (!_down[16] && hasGrid) {
                        var xPos = Math.round((end.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        var yPos = Math.round((end.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        floatingImage.moveTo(boardApi.dragging.startX, boardApi.dragging.startY-6);
                        floatingImage.lineTo(boardApi.dragging.startX, boardApi.dragging.startY+6);
                        floatingImage.moveTo(boardApi.dragging.startX, boardApi.dragging.startY);
                        floatingImage.lineTo(xPos, yPos);
                        floatingImage.moveTo(xPos, yPos-6);
                        floatingImage.lineTo(xPos, yPos+6);
                      }
                      else {
                        floatingImage.moveTo(boardApi.dragging.startX, boardApi.dragging.startY-6);
                        floatingImage.lineTo(boardApi.dragging.startX, boardApi.dragging.startY+6);

                        floatingImage.moveTo(boardApi.dragging.startX, boardApi.dragging.startY);
                        floatingImage.lineTo(end.x, end.y);

                        floatingImage.moveTo(end.x, end.y-6);
                        floatingImage.lineTo(end.x, end.y+6);
                      }
                      floatingImage.alpha = 1;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var x1 = boardApi.dragging.startX;
                      var y1 = boardApi.dragging.startY;
                      var x2 = end.x;
                      var y2 = end.y;

                      if (!_down[16] && hasGrid) {
                        x1 = Math.round((x1-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        y1 = Math.round((y1-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        x2 = Math.round((x2-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        y2 = Math.round((y2-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                      }

                      var minX = Math.min(x1, x2);
                      var minY = Math.min(y1, y2);
                      var maxX = Math.max(x1, x2);
                      var maxY = Math.max(y1, y2);

                      /*boardApi.addObject({
                        x : minX,
                        y : minY,
                        w : maxX-minX,
                        h : maxY-minY,
                        x1 : x1-minX,
                        y1 : y1-minY,
                        x2 : x2-minX,
                        y2 : y2-minY,
                        c1 : game.locals["drawing"].data.primary || "rgba(255,255,255,0)",
                        c2 : game.locals["drawing"].data.secondary || "rgba(255,255,255,0)",
                        drawing : "line",
                        uID : getCookie("UserID")
                      }, scope.layer, "d", obj);*/

                      var dist = util.dist(minX, maxX, minY, maxY);
                      obj.data.options.unit = game.locals["drawing"].data.scaleUnit || obj.data.options.unit;
                      obj.data.options.unitScale = Math.round(dist/game.locals["drawing"].data.scaleSize*100)/100

                      delete game.locals["drawing"].data.drawing;
                      delete game.locals["drawing"].data.scaleSize;
                      delete game.locals["drawing"].data.scaleUnit;
                      game.locals["drawing"].data.target = app.attr("id");
                      game.locals["drawing"].update();

                      sendAlert({text : "Map has been scaled!"})
                      obj.sync("updateAsset");

                      (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                      floatingImage = null;
                      delete boardApi.dragging;
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "circle") {
                  var xPos = localCoord.x;
                  var yPos = localCoord.y;
                  if (!_down[16] && hasGrid) {
                    xPos = Math.floor((localCoord.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                    yPos = Math.floor((localCoord.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                  }

                  boardApi.newDragEvent({
                    startX : xPos,
                    startY : yPos,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "circle") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "circle";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "circle";
                        stage.addChild(floatingImage);
                      }

                      var x1 = boardApi.dragging.startX;
                      var y1 = boardApi.dragging.startY;
                      var x2 = end.x;
                      var y2 = end.y;
                      var radius = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
                      if (!_down[16] && hasGrid) {
                        x1 = Math.floor((x1-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0) + data.gridW/2;
                        y1 = Math.floor((y1-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0) + data.gridH/2;
                        radius = Math.floor(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) / data.gridW) * data.gridW + data.gridW/2;
                      }

                      floatingImage.clear();
                      floatingImage.beginFill(util.RGB_HEX(game.locals["drawing"].data.primary), util.RGB_ALPHA(game.locals["drawing"].data.primary));
                      floatingImage.lineStyle(3, util.RGB_HEX(game.locals["drawing"].data.secondary || "rgba(0,0,0,0.4)"), util.RGB_ALPHA(game.locals["drawing"].data.secondary || "rgba(0,0,0,0.4)"));
                      floatingImage.drawCircle(x1,y1,radius);
                      floatingImage.endFill();
                      floatingImage.alpha = 0.5;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var x1 = boardApi.dragging.startX;
                      var y1 = boardApi.dragging.startY;
                      var x2 = end.x;
                      var y2 = end.y;

                      var radius = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

                      if (!_down[16] && hasGrid) {
                        x1 = Math.floor((x1-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0) + data.gridW/2;
                        y1 = Math.floor((y1-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0) + data.gridH/2;
                        radius = Math.floor(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) / data.gridW) * data.gridW + data.gridW/2;
                      }

                      boardApi.addObject({
                        x : x1 - radius,
                        y : y1 - radius,
                        w : radius * 2,
                        h : radius * 2,
                        radius : radius,
                        c1 : game.locals["drawing"].data.primary || "rgba(255,255,255,0)",
                        c2 : game.locals["drawing"].data.secondary || "rgba(0,0,0,0.4)",
                        drawing : "circle",
                        uID : getCookie("UserID")
                      }, scope.layer, "d", obj);

                      if (!_down[17]) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                      }
                      else {
                        boardApi.dragging.startX = end.x;
                        boardApi.dragging.startY = end.y;
                      }
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "region") {
                  var regions = [];
                  var xPos = localCoord.x;
                  var yPos = localCoord.y;
                  if (!_down[16] && hasGrid) {
                    xPos = Math.round((localCoord.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                    yPos = Math.round((localCoord.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                  }
                  regions.push({x : xPos, y : yPos});

                  boardApi.newDragEvent({
                    startX : xPos,
                    startY : yPos,
                    regions : regions,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var regions = boardApi.dragging.regions;
                      if (floatingImage) {
                        if (floatingImage._mode != "region") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "region";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "region";
                        stage.addChild(floatingImage);
                      }
                      floatingImage.clear();
                      floatingImage.lineStyle(3, util.RGB_HEX(game.locals["drawing"].data.primary), util.RGB_ALPHA(game.locals["drawing"].data.primary));
                      floatingImage.moveTo(regions[0].x, regions[0].y);
                      for (var i=1; i<regions.length; i++) {
                        floatingImage.lineTo(regions[i].x, regions[i].y);
                      }
                      floatingImage.lineStyle(3, util.RGB_HEX(game.locals["drawing"].data.primary), util.RGB_ALPHA(game.locals["drawing"].data.primary) * 0.5);
                      if (!_down[16] && hasGrid) {
                        var xPos = Math.round((end.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        var yPos = Math.round((end.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        floatingImage.lineTo(xPos, yPos);
                      }
                      else {
                        floatingImage.lineTo(end.x, end.y);
                      }
                      floatingImage.alpha = 1;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var startX = boardApi.dragging.startX;
                      var startY = boardApi.dragging.startY;
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      if (!_down[16] && hasGrid) {
                        end.x = Math.round((end.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        end.y = Math.round((end.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                      }

                      var dist = Math.sqrt((end.x-startX)*(end.x-startX)+(end.y-startY)*(end.y-startY));
                      if (dist < 5) {
                        // add drawing
                        var minX = Number.POSITIVE_INFINITY;
                        var minY = Number.POSITIVE_INFINITY;
                        var maxX = Number.NEGATIVE_INFINITY;
                        var maxY = Number.NEGATIVE_INFINITY;

                        for (var i in boardApi.dragging.regions) {
                          var regionData = boardApi.dragging.regions[i];
                          if (regionData.x < minX) {
                            minX = regionData.x;
                          }
                          if (regionData.x > maxX) {
                            maxX = regionData.x;
                          }
                          if (regionData.y < minY) {
                            minY = regionData.y;
                          }
                          if (regionData.y > maxY) {
                            maxY = regionData.y;
                          }
                        }
                        boardApi.addObject({
                          regions : boardApi.dragging.regions,
                          x : minX, y : minY,
                          w : maxX-minX, h : maxY-minY,
                          c1 : game.locals["drawing"].data.primary || "rgba(255,255,255,0)",
                          c2 : game.locals["drawing"].data.secondary || "rgba(255,255,255,0)",
                          drawing : "region",
                          uID : getCookie("UserID")
                        }, scope.layer, "d", obj);
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                      }
                      else {
                        if (!_down[16] && hasGrid) {
                          end.x = Math.round((end.x-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                          end.y = Math.round((end.y-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                          boardApi.dragging.regions.push({x : end.x, y : end.y});
                        }
                        else {
                          boardApi.dragging.regions.push({x : end.x, y : end.y});
                        }
                      }
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "grid") {
                  boardApi.newDragEvent({
                    startX : localCoord.x,
                    startY : localCoord.y,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "grid") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "grid";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "box";
                        stage.addChild(floatingImage);
                      }

                      var xPos = Math.min(boardApi.dragging.startX, end.x);
                      var yPos = Math.min(boardApi.dragging.startY, end.y);
                      var width = Math.abs(end.x-boardApi.dragging.startX);
                      var height = Math.abs(end.y-boardApi.dragging.startY);

                      floatingImage.clear();
                      floatingImage.x = xPos;
                      floatingImage.y = yPos;
                      floatingImage.lineStyle(1/zoom, 0xFF8a42);
                      floatingImage.drawRect(0, 0, width, height);
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var lastGrid = data.gridW;

                      var xPos = Math.min(boardApi.dragging.startX, end.x);
                      var yPos = Math.min(boardApi.dragging.startY, end.y);
                      var width = Math.abs(end.x-boardApi.dragging.startX);
                      var height = Math.abs(end.y-boardApi.dragging.startY);

                      var gridd = Math.min(width, height);

                      if (data.gridW && Math.abs(data.gridW-width) < 2) {
                        data.gridW = Math.min(width, height);
                        data.gridH = Math.min(width, height);
                      }
                      else {
                        width = Math.ceil(width, 10);
                        height = Math.ceil(height, 10);
                        data.gridW = Math.min(width, height);
                        data.gridH = Math.min(width, height);
                      }

                      data.gridX = xPos % data.gridW;
                      data.gridY = yPos % data.gridH;

                      var gridScale = lastGrid/data.gridW;
                      if (lastGrid && obj.data.gridW && obj.data.options && obj.data.options.unitScale) {
                        obj.data.options.unitScale = obj.data.options.unitScale * gridScale;
                      }

                      if (!scope.local) {
                        obj.sync("updateAsset");
                      }
                      else {
                        obj.update();
                      }

                      (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                      floatingImage = null;
                      delete boardApi.dragging;
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "shiftg") { // grid shift
                  var offset = drawnGrid.toLocal({x : ev.pageX, y : ev.pageY});
                  boardApi.newDragEvent({
                    offsetX : offset.x,
                    offsetY : offset.y,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                      }

                      var xPos = Math.round((end.x-boardApi.dragging.offsetX)*10)/10;
                      var yPos = Math.round((end.y-boardApi.dragging.offsetY)*10)/10;

                      drawnGrid.x = xPos;
                      drawnGrid.y = yPos;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var xPos = Math.round((end.x-boardApi.dragging.offsetX)*10)/10 + data.gridX;
                      var yPos = Math.round((end.y-boardApi.dragging.offsetY)*10)/10 + data.gridY;

                      data.gridX = Math.min(xPos, data.gridW-xPos) % data.gridW;
                      data.gridY = Math.min(yPos, data.gridH-yPos) % data.gridH;

                      if (!scope.local) {
                        obj.sync("updateAsset");
                      }
                      else {
                        obj.update();
                      }

                      (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                      floatingImage = null;
                      delete boardApi.dragging;
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "box") {
                  boardApi.newDragEvent({
                    startX : localCoord.x,
                    startY : localCoord.y,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "box") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Graphics();
                          floatingImage._mode = "box";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Graphics();
                        floatingImage._mode = "box";
                        stage.addChild(floatingImage);
                      }

                      var xPos = Math.min(boardApi.dragging.startX, end.x);
                      var yPos = Math.min(boardApi.dragging.startY, end.y);
                      var width = Math.abs(end.x-boardApi.dragging.startX);
                      var height = Math.abs(end.y-boardApi.dragging.startY);

                      if (!_down[16]) {
                        xPos = Math.floor((xPos-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        yPos = Math.floor((yPos-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        width = (Math.ceil(((Math.max(boardApi.dragging.startX, end.x)-xPos)-(data.gridX || 0)) / data.gridW)) * data.gridW;
                        height = (Math.ceil(((Math.max(boardApi.dragging.startY, end.y)-yPos)-(data.gridY || 0)) / data.gridH)) * data.gridH;
                      }

                      floatingImage.clear();
                      floatingImage.x = xPos;
                      floatingImage.y = yPos;
                      if (!game.locals["drawing"].data.fog) {
                        floatingImage.beginFill(util.RGB_HEX(game.locals["drawing"].data.primary), util.RGB_ALPHA(game.locals["drawing"].data.primary));
                        if (game.locals["drawing"].data.secondary) {
                          floatingImage.lineStyle(1, util.RGB_HEX(game.locals["drawing"].data.secondary), util.RGB_ALPHA(game.locals["drawing"].data.secondary));
                        }
                        floatingImage.drawRect(0, 0, width, height);
                        floatingImage.endFill();
                      }
                      else {
                        floatingImage.beginFill(util.RGB_HEX("rgba(255,255,255,0.5)"), util.RGB_ALPHA("rgba(255,255,255,0.5)"));
                        floatingImage.lineStyle(1, util.RGB_HEX("rgba(255,255,255,0.5)"), util.RGB_ALPHA("rgba(255,255,255,0.5)"));
                        floatingImage.drawRect(0, 0, width, height);
                        floatingImage.endFill();
                      }
                      floatingImage.alpha = 0.5;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      var xPos = Math.min(boardApi.dragging.startX, end.x);
                      var yPos = Math.min(boardApi.dragging.startY, end.y);
                      var width = Math.abs(end.x-boardApi.dragging.startX);
                      var height = Math.abs(end.y-boardApi.dragging.startY);

                      if (!_down[16] && hasGrid) {
                        xPos = Math.floor((xPos-(data.gridX || 0)) / data.gridW) * data.gridW + (data.gridX || 0);
                        yPos = Math.floor((yPos-(data.gridY || 0)) / data.gridH) * data.gridH + (data.gridY || 0);
                        width = (Math.ceil(((Math.max(boardApi.dragging.startX, end.x)-xPos)-(data.gridX || 0)) / data.gridW)) * data.gridW;
                        height = (Math.ceil(((Math.max(boardApi.dragging.startY, end.y)-yPos)-(data.gridY || 0)) / data.gridH)) * data.gridH;
                      }

                      if (!_down[17]) {
                        if (!game.locals["drawing"].data.fog) {
                          boardApi.addObject({
                            x : xPos,
                            y : yPos,
                            w : width,
                            h : height,
                            c1 : game.locals["drawing"].data.primary || "rgba(255,255,255,1)",
                            c2 : game.locals["drawing"].data.secondary || "rgba(255,255,255,0)",
                            drawing : "box",
                            uID : getCookie("UserID")
                          }, scope.layer, "d", obj);
                        }
                        else {
                          boardApi.addObject({
                            x : xPos,
                            y : yPos,
                            w : width,
                            h : height,
                            f : _down[18] || game.locals["drawing"].data.hiding
                          }, scope.layer, "r", obj);
                        }
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                      }
                      else {
                        boardApi.dragging.startX = end.x;
                        boardApi.dragging.startY = end.y;
                      }
                    }
                  }, ev);
                }
                else if (game.locals["drawing"].data.drawing == "text") {
                  boardApi.newDragEvent({
                    startX : localCoord.x,
                    startY : localCoord.y,
                    move : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      stage.cursor = "none";
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});

                      if (floatingImage) {
                        if (floatingImage._mode != "text") {
                          (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                          floatingImage = new PIXI.Text("Sample Text", game.locals["drawing"].data.label.style || boardApi.fonts.default);
                          floatingImage._mode = "text";

                          stage.addChild(floatingImage);
                        }
                      }
                      else {
                        floatingImage = new PIXI.Text("Sample Text", game.locals["drawing"].data.label.style || boardApi.fonts.default);
                        floatingImage._mode = "text";
                        stage.addChild(floatingImage);
                      }
                      floatingImage.x = end.x;
                      floatingImage.y = end.y;
                      floatingImage.text = game.locals["drawing"].data.label.text;
                      floatingImage.style = game.locals["drawing"].data.label.style || {
                        fontFamily: "Arial",
                        fontWeight: "bold",
                        fontSize : 16,
                        fill: "black",
                        stroke: 'white',
                        strokeThickness: 0,
                        dropShadow: true,
                        dropShadowColor: "rgba(0,0,0,1)",
                        dropShadowBlur: 3,
                        dropShadowDistance : 0,
                      };
                      floatingImage.dirty = true;
                      floatingImage.alpha = 1;
                    },
                    end : function(ev){
                      var stage = boardApi.apps[app.attr("id")].stage;
                      stage.cursor = "";
                      var end = stage.toLocal({x : ev.pageX, y : ev.pageY});
                      var key = ev.keyCode || ev.which;
                      if (key != 1) {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        delete boardApi.dragging;
                        return;
                      }

                      if (!_down[17]) {
                        boardApi.addObject({
                          x : end.x,
                          y : end.y,
                          w : floatingImage.width,
                          h : floatingImage.height,
                          style : duplicate(game.locals["drawing"].data.label.style),
                          text : duplicate(game.locals["drawing"].data.label.text),
                          drawing : "text",
                          uID : getCookie("UserID")
                        }, scope.layer, "d", obj);

                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;

                        delete boardApi.dragging;
                      }
                      else {
                        boardApi.dragging.startX = end.x;
                        boardApi.dragging.startY = end.y;
                      }
                    }
                  }, ev);
                }
              }
              else {
                boardApi.newDragEvent({
                  selectX : finalX,
                  selectY : finalY,
                  move : function(ev){
                    var stage = boardApi.apps[app.attr("id")].stage;
                    var localCoord = stage.toLocal({x : ev.pageX, y : ev.pageY});
                    var finalX = localCoord.x;
                    var finalY = localCoord.y;

                    selectionLayer.clear();
                    selectionLayer.x = Math.min(boardApi.dragging.selectX, finalX);
                    selectionLayer.y = Math.min(boardApi.dragging.selectY, finalY);
                    selectionLayer.beginFill(0x000000, 0);
                    selectionLayer.lineStyle(4, 0xFF8a42, 1);
                    selectionLayer.drawRect(0, 0, Math.abs(boardApi.dragging.selectX-finalX), Math.abs(boardApi.dragging.selectY-finalY));
                    selectionLayer.endFill();
                  },
                  end : function(ev){
                    var stage = boardApi.apps[app.attr("id")].stage;
                    var localCoord = stage.toLocal({x : ev.pageX, y : ev.pageY});
                    var finalX = localCoord.x;
                    var finalY = localCoord.y;
                    var key = ev.keyCode || ev.which;
                    if (key != 1) {
                      (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                      floatingImage = null;
                      delete boardApi.dragging;
                      return;
                    }

                    if (!_down[16] && !boardApi.objectClick) {
                      if ($(".piece-quick-edit").length) {
                        layout.coverlay($(".piece-quick-edit"));
                      }
                      else {
                        for (var id in boardApi.selections) {
                          boardApi.selections[id].wrap.unselect();
                          delete boardApi.selections[id];
                        }

                        if (Number(app.attr("_lastClick")) + 300 >= Date.now() && util.dist(finalX, Number(app.attr("_lastClickX")), finalY, Number(app.attr("_lastClickY"))) < 5) { // double clicked
                          app.removeAttr("_lastClick");
                          app.removeAttr("_lastClickX");
                          app.removeAttr("_lastClickY");
                          runCommand("updateBoardCursor", {id : obj.id(), data : {x : finalX, y : finalY, l : scope.layer, b : true}});
                          delete boardApi.dragging;
                          return;
                        }
                        app.attr("_lastClickX", finalX);
                        app.attr("_lastClickY", finalY);
                        app.attr("_lastClick", Date.now());
                      }
                    }

                    var sX = boardApi.dragging.selectX;
                    var sY = boardApi.dragging.selectY;
                    var eX = finalX;
                    var eY = finalY;
                    if (eX < sX) {
                      sX = eX;
                      eX = boardApi.dragging.selectX;
                    }
                    if (eY < sY) {
                      sY = eY
                      eY = boardApi.dragging.selectY;
                    }

                    if (hasSecurity(userID, "Rights", data) && floatingTile) {
                      var layerData = obj.data.layers[scope.layer];
                      if (!_down[16] && hasGrid) {
                        if (isHex) {
                          var xGrid = Math.floor((sX - (data.gridX || 0))/(data.gridW * 0.75));
                          var yGrid;

                          sX = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                          if (xGrid % 2) {
                            yGrid = Math.floor((sY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                            sY = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                          }
                          else {
                            yGrid = Math.floor((sY - (data.gridY || 0))/data.gridH);
                            sY = (yGrid * data.gridH + (data.gridY || 0));
                          }

                          var xGrid = Math.floor((eX - (data.gridX || 0))/(data.gridW * 0.75));
                          var yGrid;
                          eX = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                          if (xGrid % 2) {
                            yGrid = Math.floor((eY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                            eY = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                          }
                          else {
                            yGrid = Math.floor((eY - (data.gridY || 0))/data.gridH);
                            eY = (yGrid * data.gridH + (data.gridY || 0));
                          }
                        }
                        else {
                          var xGrid = Math.floor((sX - (data.gridX || 0))/data.gridW);
                          var yGrid = Math.floor((sY - (data.gridY || 0))/data.gridH);
                          sX = (xGrid * data.gridW + (data.gridX || 0));
                          sY = (yGrid * data.gridH + (data.gridY || 0));

                          var xGrid = Math.floor((eX - (data.gridX || 0))/data.gridW);
                          var yGrid = Math.floor((eY - (data.gridY || 0))/data.gridH);
                          eX = (xGrid * data.gridW + (data.gridX || 0));
                          eY = (yGrid * data.gridH + (data.gridY || 0));
                        }
                      }
                      var gridX = Math.floor((eX-sX)/(data.gridW || 64));
                      var gridY = Math.floor((eY-sY)/(data.gridH || 64));
                      var tiled = ((gridX+1) > floatingTile.gW || (gridY+1) > floatingTile.gH);
                      if (isHex) {
                        tiled = false;
                      }
                      var rotation = floatingTile.r;
                      if (randomRot && floatingTile.r == null) {
                        rotation = Math.floor(Math.random() * 4) * 90;
                      }

                      var newTile = {
                        x : sX,
                        y : sY,
                        w : Math.max(Math.ceil((gridX+1)/(floatingTile.gW || 1)),1) * (data.gridW || 64) * (floatingTile.gW || 1),
                        h : Math.max(Math.ceil((gridY+1)/(floatingTile.gH || 1)),1) * (data.gridH || 64) * (floatingTile.gH || 1),
                        gW : floatingTile.gW,
                        gH : floatingTile.gH,
                        i : floatingTile.i,
                        s : floatingTile.s,
                        t : tiled,
                        r : rotation,
                      };
                      data.layers[scope.layer].t.push(newTile);
                      var newCont = boardApi.createTile({data : newTile, layer : scope.layer, index : data.layers[scope.layer].t.length-1}, obj, app, scope);
                      stage.children[1].children[scope.layer].children[1].addChild(newCont);
                      if (randomRot) {
                        floatingTile.r = Math.floor(Math.random() * 4) * 90;
                        floatingImage.children[0].rotation = (floatingTile.r || 0)/180 * (Math.PI);
                      }
                      //boardApi.tileLayer(stage, scope.layer).addChild(newCont);
                      if (app.attr("background") != "true") {
                        (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                        floatingImage = null;
                        floatingTile = null;
                        if (!scope.local) {
                          obj.sync("updateAsset");
                        }
                        else {
                          obj.update();
                        }
                      }
                    }
                    else {
                      if (!app.attr("background")) {
                        if (game.locals["drawing"] && game.locals["drawing"].data && !game.locals["drawing"].data.drawing && game.locals["drawing"].data.fog && app.attr("menuOption") == "Fog of War") {
                          for (var lid in stage.children[1].children) {
                            var layerData = stage.children[1].children[lid];
                            var walls = layerData.children[4];
                            if (walls && walls.children) {
                              for (var index in walls.children) {
                                var wallData = obj.data.layers[lid].w[index];
                                if (eX-sX > 3 && eY-sY > 3) {
                                  if ((wallData.x1 >= sX && wallData.x2 >= sX) && wallData.x1 < eX && wallData.x2 < eX) {
                                    if ((wallData.y1 >= sY && wallData.y2 >= sY) && wallData.y1 < eY && wallData.y2 < eY) {
                                      var wallWrap = walls.children[index];
                                      wallWrap.select();
                                    }
                                  }
                                }
                              }
                            }
                          }
                          sendAlert({text : "Selecting Fog of War Walls", id : "selecting-walls", duration : 1000});
                        }
                        else {
                          for (var lid in stage.children[1].children) {
                            var layerData = stage.children[1].children[lid];
                            var pieces = layerData.children[2];
                            if (pieces && pieces.children) {
                              for (var index in pieces.children) {
                                var pieceData = obj.data.layers[lid].p[index];
                                if (eX-sX > 3 && eY-sY > 3) {
                                  if ((pieceData.x >= sX || pieceData.x + pieceData.w >= sX) && pieceData.x < eX) {
                                    if ((pieceData.y >= sY || pieceData.y + pieceData.h >= sY) && pieceData.y < eY) {
                                      if (!pieceData.l || (pieceData.l && (app.attr("layer") || 0) == lid)) {
                                        if (hasRights || (pieceData.eID && getEnt(pieceData.eID) && hasSecurity(userID, "Rights", getEnt(pieceData.eID).data))) {
                                          // select Pieces
                                          var pieceWrap = pieces.children[index];
                                          var selection = pieceWrap.children[1];
                                          selection.visible = true;

                                          boardApi.selections[obj.id()+"-"+lid+"-p-"+index] = {
                                            layer : lid,
                                            index : index,
                                            type : "p",
                                            board : obj.id(),
                                            app : app.attr("id"),
                                            wrap : pieceWrap,
                                            image : pieceWrap.children[0],
                                            selected : selection
                                          };
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      else {
                        for (var lid in stage.children[1].children) {
                          var layerData = stage.children[1].children[lid];
                          var tiles = layerData.children[1];
                          if (tiles && tiles.children) {
                            for (var index in tiles.children) {
                              var pieceData = obj.data.layers[lid].t[index];
                              if (eX-sX > 3 && eY-sY > 3) {
                                if ((pieceData.x >= sX || pieceData.x + pieceData.w >= sX) && pieceData.x < eX) {
                                  if ((pieceData.y >= sY || pieceData.y + pieceData.h >= sY) && pieceData.y < eY) {
                                    if (!pieceData.l || (pieceData.l && (app.attr("layer") || 0) == lid)) {
                                      if (hasRights) {
                                        // select Pieces
                                        var pieceWrap = tiles.children[index];
                                        var selection = pieceWrap.children[1];
                                        selection.visible = true;

                                        boardApi.selections[obj.id()+"-"+lid+"-t-"+index] = {
                                          layer : lid,
                                          index : index,
                                          type : "t",
                                          board : obj.id(),
                                          app : app.attr("id"),
                                          wrap : pieceWrap,
                                          image : pieceWrap.children[0],
                                          selected : selection
                                        };
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      // 1:layers -  0:BG 1:tile 2:piece 3:draw 4:fog
                    }
                    selectionLayer.clear();
                    delete boardApi.dragging;
                  }
                }, ev);
              }
            }
          }
        }
        if (key == 2 || key == 3) {
          // dragscroll
          layout.coverlay($(".piece-quick-edit"));
          if (!boardApi.dragging) {
            var stage = boardApi.apps[app.attr("id")].stage;
            stage.cursor = "move";
            boardApi.newDragEvent({
              selectX : ev.pageX,
              selectY : ev.pageY,
              move : function(ev){
                var deltaX = ev.pageX-boardApi.dragging.selectX;
                var deltaY = ev.pageY-boardApi.dragging.selectY;

                var limitX = 100;
                var limitY = 100;

                if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
                  boardApi.dragging.dragged = true;
                  layout.coverlay($(".piece-quick-edit"));
                }

                stage.x = stage.x + deltaX * 1;
                //stage.x = Math.max(Math.min(stage.x, limitX), (((data.x || 0)+data.w+limitX)*-1 + Number(portWidth)/zoom)*zoom);
                stage.y = stage.y + deltaY * 1;
                //stage.y = Math.max(Math.min(stage.y, limitY), (((data.y || 0)+data.h+limitY)*-1 + Number(portHeight)/zoom)*zoom);
                boardApi.dragging.selectX = ev.pageX;
                boardApi.dragging.selectY = ev.pageY;
              },
              end : function(ev){
                var stage = boardApi.apps[app.attr("id")].stage;
                delete stage.cursor;

                var deltaX = ev.pageX-boardApi.dragging.selectX;
                var deltaY = ev.pageY-boardApi.dragging.selectY;

                var limitX = 100;
                var limitY = 100;

                stage.x = stage.x + deltaX * 1;
                //stage.x = Math.max(Math.min(stage.x, limitX), (((data.x || 0)+data.w+limitX)*-1 + Number(portWidth)/zoom)*zoom);
                stage.y = stage.y + deltaY * 1;
                //stage.y = Math.max(Math.min(stage.y, limitY), (((data.y || 0)+data.h+limitY)*-1 + Number(portHeight)/zoom)*zoom);

                app.attr("scrollLeft", stage.x);
                app.attr("scrollTop", stage.y);
                if (!boardApi.dragging.dragged && !(game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing)) {
                  if (floatingTile) {
                    floatingTile = null;
                    (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                    floatingImage = null;
                  }
                  else {
                    var actions = boardApi.context(obj, app, scope, ev);

                    $(".ui-dropmenu-class").remove();
                    setTimeout(function(){
                      var pop = ui_dropMenu(board, actions, {});
                    }, 10);
                    ev.preventDefault();
                  }
                }

                delete boardApi.dragging;
              }
            }, ev);
          }
        }
      });
      board.mousemove(function(ev){
        var stage = boardApi.apps[app.attr("id")].stage;
        var localCoord = boardCanvas.stage.toLocal({x : ev.pageX, y : ev.pageY});
        var finalX = localCoord.x;
        var finalY = localCoord.y;
        if (!scope.local && !boardApi.dragging) {
          var focal = boardCanvas.stage.toLocal({x : ev.pageX, y : ev.pageY});
          var update = {id : obj.id(), data : {
            x : focal.x, y : focal.y, l : scope.layer,
            v : (app.attr("hideCursor") == "true")}
          };
          if (time <= Date.now()) {
            runCommand("updateBoardCursor", update);
            time = Date.now() + 100;
          }
        }
        if (app.attr("background") == "true" || floatingTile) {
          if (hasSecurity(userID, "Rights", data)) {
            var layerData = obj.data.layers[scope.layer];
            if (floatingTile) {
              if (!floatingImage || JSON.stringify(floatingImage.tileData) != JSON.stringify(floatingTile)) {
                if (floatingImage) {
                  (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
                }

                floatingImage = boardApi.createTile({data : floatingTile}, obj, app, scope);
                floatingImage.alpha = 0.5;
                stage.addChild(floatingImage);
                // scale floatinTile
                floatingTile.w = Math.max(floatingTile.w, data.gridW);
                floatingTile.h = Math.max(floatingTile.h, data.gridH); // Temporary filler, not correct
                floatingImage.rebuild(floatingTile, true);
              }
              if (!_down[16] && hasGrid) {

                if (isHex) {
                  var xGridd = Math.floor((finalX - (data.gridX || 0))/(data.gridW * 0.75));
                  var yGridd;
                  finalX = (xGridd * data.gridW + (data.gridX || 0) - (xGridd * data.gridW + (data.gridX || 0))/4);
                  if (xGridd % 2) {
                    yGridd = Math.floor((finalY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                    finalY = (yGridd * data.gridH + (data.gridY || 0) + data.gridH/2);
                  }
                  else {
                    yGridd = Math.floor((finalY - (data.gridY || 0))/data.gridH);
                    finalY = (yGridd * data.gridH + (data.gridY || 0));
                  }
                }
                else {
                  var xGridd = Math.floor((finalX - (data.gridX || 0))/data.gridW);
                  var yGridd = Math.floor((finalY - (data.gridY || 0))/data.gridH);
                  finalX = ((xGridd * data.gridW + (data.gridX || 0)));
                  finalY = ((yGridd * data.gridH + (data.gridY || 0)));
                }
              }
              floatingImage.x = finalX;
              floatingImage.y = finalY;
            }
            else if (floatingImage) {
              (floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
              floatingImage = null;
            }
          }
        }
      });
      board.mouseup(function(ev){
        var key = ev.keyCode || ev.which;
        if (!boardApi.objectClick && app.attr("rebuildmenu") && key != 2) {
          app.removeAttr("menuOption");

          if ($("#"+app.attr("id")+"-menu-"+obj.id()).length) {
            $("#left-content").empty();
            var menu = sync.render("ui_boardMenuLeft")(obj, app, scope).appendTo("#left-content");
          }

          app.removeAttr("rebuildmenu");
        }
      });

      board.click(function(ev){
        if (boardApi.objectClick) {
          boardApi.objectClick = false;
        }
        var key = ev.keyCode || ev.which;
        if (key == 2 || key == 3) {

        }
      });
      board.contextmenu(function(ev){
        if (floatingTile) {
          floatingTile = null;
          //(floatingImage!=null&&floatingImage.parent!=null)?(floatingImage.parent.removeChild(floatingImage)):(null);
          //floatingImage = null;
        }
        if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
          if (game.locals["drawing"].data.drawing == "scale") {
            delete game.locals["drawing"].data.drawing;
            delete game.locals["drawing"].data.scaleSize;
            delete game.locals["drawing"].data.scaleUnit;
            game.locals["drawing"].data.target = app.attr("id");
            sendAlert({text : "Stopped drawing scale"});
          }
          else {
            sendAlert({text : "Paint Tool Cleared"});
          }
          delete game.locals["drawing"].data.drawing;
          game.locals["drawing"].update();
        }
        return false;
      });
    }
    else {
      board.on("touchstart", function(ev){
        var stage = boardApi.apps[app.attr("id")].stage;
        var localCoord = boardCanvas.stage.toLocal({x : ev.touches[0].pageX, y : ev.touches[0].pageY});
        var finalX = localCoord.x;
        var finalY = localCoord.y;
        boardApi.newDragEvent({
          selectX : ev.touches[0].pageX,
          selectY : ev.touches[0].pageY,
        });
        sendAlert({text : "Start" + boardApi.dragging.selectX});
        if (!scope.local) {
          var update = {id : obj.id(), data : {
            x : finalY, y : finalY, l : scope.layer,
            v : (app.attr("hideCursor") == "true")}
          };
          if (time <= Date.now()) {
            runCommand("updateBoardCursor", update);
            time = Date.now() + 100;
          }
        }
      });
      board.on("touchmove", function(ev){
        var stage = boardApi.apps[app.attr("id")].stage;
        var localCoord = boardCanvas.stage.toLocal({x : ev.touches[0].pageX, y : ev.touches[0].pageY});
        var finalX = localCoord.x;
        var finalY = localCoord.y;
        if (!scope.local) {
          var update = {id : obj.id(), data : {
            x : finalY, y : finalY, l : scope.layer,
            v : (app.attr("hideCursor") == "true")}
          };
          if (time <= Date.now()) {
            runCommand("updateBoardCursor", update);
            time = Date.now() + 100;
          }
        }
        if (boardApi.dragging) {
          var deltaX = ev.touches[0].pageX-boardApi.dragging.selectX;
          var deltaY = ev.touches[0].pageY-boardApi.dragging.selectY;

          var limitX = 100;
          var limitY = 100;
          sendAlert({text : ev.touches[0].pageX + " " + boardApi.dragging.selectX + "-" + ev.touches.length});
          if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
            boardApi.dragging.dragged = true;
            layout.coverlay($(".piece-quick-edit"));
            stage.x = stage.x + deltaX * 1;
            //stage.x = Math.max(Math.min(stage.x, limitX), (((data.x || 0)+data.w+limitX)*-1 + Number(portWidth)/zoom)*zoom);
            stage.y = stage.y + deltaY * 1;
            //stage.y = Math.max(Math.min(stage.y, limitY), (((data.y || 0)+data.h+limitY)*-1 + Number(portHeight)/zoom)*zoom);
            boardApi.dragging.selectX = ev.touches[0].pageX;
            boardApi.dragging.selectY = ev.touches[0].pageY;
          }
        }
      });
      board.on("touchend", function(ev){
        var stage = boardApi.apps[app.attr("id")].stage;
        var localCoord = boardCanvas.stage.toLocal({x : ev.touches[0].pageX, y : ev.touches[0].pageY});
        var finalX = localCoord.x;
        var finalY = localCoord.y;
        if (!scope.local) {
          var update = {id : obj.id(), data : {
            x : finalY, y : finalY, l : scope.layer,
            v : (app.attr("hideCursor") == "true")}
          };
          if (time <= Date.now()) {
            runCommand("updateBoardCursor", update);
            time = Date.now() + 100;
          }
        }
        app.attr("scrollLeft", stage.x);
        app.attr("scrollTop", stage.y);
        delete boardApi.dragging;
        sendAlert({text : "End"});
      });
    }


    if ($("#"+app.attr("id")+"-menu-"+obj.id()).length) {
      $("#left-content").empty();
      var menu = sync.render("ui_boardMenuLeft")(obj, app, scope).appendTo("#left-content");
    }

    if (data.options) {
      var filterStr = "";
      for (var key in data.options.filter) {
        if (key == "hue-rotate") {
          filterStr = filterStr + " " + key + "("+data.options.filter[key]+"deg)";
        }
        else {
          filterStr = filterStr + " " + key + "("+data.options.filter[key]+"%)";
        }
      }
      board.css("webkit-filter", filterStr);
      board.css("filter", filterStr);
    }

    if (data.options && data.options.weather && data.options.weather != "none") {
      var filter = $("<div>").appendTo(divRowWrapper);
      filter.css("width", portWidth);
      filter.css("height", portHeight);
      filter.css("position", "absolute");
      filter.css("overflow", "hidden");
      filter.css("pointer-events", "none");
      filter.css("left", "0");
      filter.css("top", "0");
      if (data.options.isometric) {
        filter.css("transform", "rotateX(0deg) rotateY(0deg) rotateZ(-45deg)");
      }
      /*var count = 60;
      if (data.options.weather == "rain mix") {
        count = 90;
      }
      else if (data.options.weather == "downpour") {
        count = 120;
      }
      else if (data.options.weather == "blizzard") {
        count = 90;
      }
      for (var i=0; i<count; i++) {
        var drop = $("<div>").appendTo(filter);
        drop.css("pointer-events", "none");
        drop.css("left", Math.random() * 100 + "%");
        if (data.options.weather == "rain") {
          drop.addClass("rain");
          drop.css("animation", "drop "+(Math.random()+1.2)+"s linear infinite");
          drop.css("animation-delay", "-"+(Math.random()+1.2)+"s");
        }
        else if (data.options.weather == "rain mix") {
          if (Math.round(Math.random() * 2) == 0) {
            drop.addClass("rain");
            drop.css("animation", "drop "+(Math.random()+1.2)+"s linear infinite");
            drop.css("animation-delay", "-"+(Math.random()+1.2)+"s");
          }
          else {
            drop.addClass("downpour");
            drop.css("animation", "downpour "+(Math.random()+0.8)+"s linear infinite");
            drop.css("animation-delay", "-"+(Math.random()+1.2)+"s");
          }
        }
        else if (data.options.weather == "downpour") {
          drop.addClass("downpour");
          drop.css("animation", "downpour "+(Math.random()+0.8)+"s linear infinite");
          drop.css("animation-delay", "-"+(Math.random()+1.2)+"s");
        }
        else if (data.options.weather == "snow") {
          drop.addClass("snow");
          var size = Math.random() * 5;
          drop.css("width", (15 + size)+"px");
          drop.css("height", (15 + size)+"px");

          var animSpeed = (Math.random()*8.4+4.8);
          drop.css("transition", "left "+animSpeed+"s");
          var variation = Math.round(Math.random() * 5);
          if (variation == 0) {
            drop.css("animation", "snowdrop-right "+animSpeed+"s linear infinite");
          }
          if (variation == 1) {
            drop.css("animation", "snowdrop-right-hard "+animSpeed+"s linear infinite");
          }
          else if (variation == 2) {
            drop.css("animation", "snowdrop-left-hard "+animSpeed+"s linear infinite");
          }
          else if (variation == 3) {
            drop.css("animation", "drop "+animSpeed+"s linear infinite");
          }
          else {
            drop.css("animation", "snowdrop-left "+animSpeed+"s linear infinite");
          }
          drop.css("animation-delay", "-"+(Math.random()*4.8+1.2)+"s");
        }
        if (data.options.weatherStyle) {
          drop.css("background", data.options.weatherStyle);
        }
      }
      */
    }

    // constuct a container for each layer

    var conts = {};

    if (lastvideo) {
      lastvideo.destroy(true);
    }
    var fogBackground = new PIXI.Container();
    var bgMask;
    if (data.map && data.map.match(".gif") && PIXI.loader.resources[data.map] && PIXI.loader.resources[data.map].gifFrames && PIXI.loader.resources[data.map].gifFrames.length  && false) {
      bgMask = new PIXI.extras.AnimatedSprite(PIXI.loader.resources[data.map].gifFrames);
      bgMask.width = data.w;
      bgMask.height = data.h;
      bgMask.animationSpeed = 0.2;
      bgMask.gotoAndPlay(Math.round(Math.random() * PIXI.loader.resources[data.map].gifFrames.length - 1));
      boardCanvas.stage.addChild(bgMask);
    }
    else if (data.map && (data.map.match(".mp4") || data.map.match(".webm") || data.map.match(".ogg"))) {
      var videoText = PIXI.Texture.fromVideoUrl(data.map);
      videoText.baseTexture.source.loop = 1;
      $(videoText.baseTexture.source).addClass(app.attr("id")+"-videoSource");

      lastvideo = videoText;

      bgMask = new PIXI.Sprite(videoText);
      bgMask.width = data.w;
      bgMask.height = data.h;

      boardCanvas.stage.addChild(bgMask);
    }
    else if (data.map) {
      bgMask = new PIXI.Sprite.fromImage(data.map);
      bgMask.width = data.w;
      bgMask.height = data.h;

      boardCanvas.stage.addChild(bgMask);
    }
    else {
      bgMask = new PIXI.Container(); // background filler
      boardCanvas.stage.addChild(bgMask);
    }

    // 1:layers -  0:BG 1:tile 2:piece 3:draw 4:fog

    var layers = new PIXI.Container();
    boardCanvas.stage.addChild(layers);

    var threatCont = new PIXI.Graphics();
    boardCanvas.stage.addChild(threatCont);

    var fogFill = new PIXI.Graphics();
    if (data.options && data.options.fog) {
      fogFill.beginFill(0xFFFFFF, 1);
      if (hasGrid) {
        fogFill.drawRect(0, 0, Math.ceil(obj.data.w/data.gridW)*data.gridW + (data.gridX || 0), Math.ceil(obj.data.h/data.gridH)*data.gridH + (data.gridY || 0));
      }
      else {
        fogFill.drawRect(0, 0, obj.data.w, obj.data.h);
      }
      fogFill.endFill();
    }

    var drawnGrid = false;
    var plyChar = getPlayerCharacter(getCookie("UserID"));
    for (var lid in data.layers) {
      var layerData = data.layers[lid];
      var playerVision = app.attr("UserID") && !layerData.h && (!layerData._s || layerData._s.default == 1);
      var layerVisible = !layerData.h && (hasRights || hasSecurity(userID, "Visible", layerData));
      layerVisible = layerVisible || (lid == scope.layer);

      var layerCont = new PIXI.Container();
      layers.addChild(layerCont);

      var tiles = layerData.t;
      var pieces = layerData.p;
      var strokes = layerData.d;
      layerData.r = layerData.r || [];
      layerData.w = layerData.w || [];
      var reveal = layerData.r; // fog of war
      var walls = layerData.w;

      var bgCont = new PIXI.Container();
      layerCont.addChild(bgCont);

      var tileCont = new PIXI.Container();
      tileCont.name = "layer";
      layerCont.addChild(tileCont);

      var pieceCont = new PIXI.Container();
      layerCont.addChild(pieceCont);

      var drawCont = new PIXI.Container();
      layerCont.addChild(drawCont);

      var wallCont = new PIXI.Container();
      layerCont.addChild(wallCont);

      var gridImage;

      for (var index in tiles) {
        var tileData = tiles[index];
        var tile = boardApi.createTile({data : duplicate(tileData), layer : lid, index : index}, obj, app, scope);
        tileCont.addChild(tile);

        fogBackground.addChild(boardApi.createTile({data : duplicate(tileData)}, obj, app, scope));
      }

      if (!drawnGrid && (!data.options || (data.options.gLayer == null || data.options.gLayer == -1 || data.options.gLayer == lid))) {
        drawnGrid = boardApi.drawGrid(obj, app, scope);
        layerCont.addChild(drawnGrid);
      }
      for (var index in pieces) {
        var pieceData = pieces[index];
        var piece = boardApi.createPiece({data : duplicate(pieceData), layer : lid, index : index}, obj, app, scope);
        if (pieceData.eID) {
          var ent = getEnt(pieceData.eID);
          if (ent && ent.data && ent.data._t == "c" && hasSecurity(userID, "Visible", ent.data)) {
            var range = null;
            if (pieceData.o && pieceData.o.Sight) {
              var context = sync.defaultContext();
              if (ent && ent.data) {
                context[ent.data._t] = duplicate(ent.data);
              }
              var auraData = pieceData.o.Sight;
              range = boardApi.scale(sync.eval(auraData.d, context), obj, true);
            }
            boardApi.apps[app.attr("id")].views[lid+"-p-"+index] = boardApi.buildDynamicFog(obj, app, pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
          }
        }
        if (app.attr("background")) {
          piece.children[0].interactive = false;
          piece.alpha = 0.05;
        }
        pieceCont.addChild(piece);
        if (pieceData.l && !pieceData.e) {
          var dupe = duplicate(pieceData);
          delete dupe.v;
          fogBackground.addChild(boardApi.createPiece({data : dupe}, obj, app, scope));
        }
      }

      for (var index in strokes) {
        var drawData = strokes[index];
        var draw = boardApi.createDrawing({data : duplicate(drawData), layer : lid, index : index}, obj, app, scope);
        drawCont.addChild(draw);

        fogBackground.addChild(boardApi.createDrawing({data : duplicate(drawData)}, obj, app, scope));
      }
      if (hasRights) {
        for (var index in walls) {
          var wallData = walls[index];
          var wall = boardApi.createWall({data : duplicate(wallData), layer : lid, index : index}, obj, app, scope);
          wallCont.addChild(wall);
        }
      }

      if (playerVision || (!app.attr("UserID") && layerVisible)) {
        if (data.options && data.options.fog) {
          for (var rID in reveal) {
            if (reveal[rID].f) {
              fogFill.beginFill(0xFFFFFF, 1);
            }
            else {
              fogFill.beginFill(0, 1);
            }
            fogFill.drawRect(reveal[rID].x,reveal[rID].y,reveal[rID].w || reveal[rID].width,reveal[rID].h || reveal[rID].height);
            fogFill.endFill();
          }
        }
      }
      else {
        layerCont.visible = false;
      }
    }

    var fogContainer = new PIXI.Container();
    var fogCont = new PIXI.Graphics();

    var fogMask = new PIXI.Container();

    boardApi.apps[app.attr("id")].fogCache = {fogContainer : fogContainer, fogCont : fogCont, fog : fogFill, background : bgMask, map : fogBackground};

    if (bgMask.texture && bgMask.texture.baseTexture && !bgMask.texture.baseTexture.hasLoaded) {
      var bgMaskFill = new PIXI.Graphics();
      if (data.options && data.options.fog) {
        bgMaskFill.beginFill(util.RGB_HEX(obj.data.c), 1);
        if (hasGrid) {
          bgMaskFill.drawRect(0, 0, Math.ceil(obj.data.w/data.gridW)*data.gridW + (data.gridX || 0), Math.ceil(obj.data.h/data.gridH)*data.gridH + (data.gridY || 0));
        }
        else {
          bgMaskFill.drawRect(0, 0, obj.data.w, obj.data.h);
        }
        bgMaskFill.endFill();
        boardApi.apps[app.attr("id")].renderer.render(bgMaskFill, boardApi.apps[app.attr("id")].opaqueRender, false, null, false);
        function check(){
          if (bgMask.texture && bgMask.texture.baseTexture && bgMask.texture.baseTexture.hasLoaded) {
            bgMaskFill.destroy(true);
            boardApi.rebuildFog(obj, app);
          }
          else {
            setTimeout(function(){check();}, 100);
          }
        }
        check();
      }
    }
    boardApi.apps[app.attr("id")].renderer.render(bgMask, boardApi.apps[app.attr("id")].opaqueRender, false, null, false);
    boardApi.apps[app.attr("id")].renderer.render(fogBackground, boardApi.apps[app.attr("id")].opaqueRender, false, null, false);

    boardApi.apps[app.attr("id")].renderer.render(fogFill, boardApi.apps[app.attr("id")].fogRender, false, null, false);
    boardApi.apps[app.attr("id")].renderer.render(fogFill, boardApi.apps[app.attr("id")].expRender, false, null, false);

    if (data.options && data.options.fog) {
      var opaqueRender = new PIXI.Sprite(boardApi.apps[app.attr("id")].opaqueRender);
      fogContainer.addChild(opaqueRender);
      fogContainer.addChild(fogCont);

      fogContainer.mask = new PIXI.Sprite(boardApi.apps[app.attr("id")].fogRender);
      fogContainer.addChild(fogContainer.mask);
      fogCont.beginFill(util.RGB_HEX(obj.data.c), 1);
      if (hasGrid) {
        fogCont.drawRect(0, 0, Math.ceil(obj.data.w/data.gridW)*data.gridW + (data.gridX || 0), Math.ceil(obj.data.h/data.gridH)*data.gridH + (data.gridY || 0));
      }
      else {
        fogCont.drawRect(0, 0, obj.data.w, obj.data.h);
      }
      fogCont.endFill();
      fogCont.mask = new PIXI.Sprite(boardApi.apps[app.attr("id")].expRender);
      fogContainer.addChild(fogCont.mask);

      if (!app.attr("UserID") && hasRights) {
        fogCont.alpha = Math.min(0.8, util.RGB_ALPHA(data.c));
        opaqueRender.alpha = 0;
      }
      else {
        fogCont.alpha = Math.min(1, util.RGB_ALPHA(data.c));
        opaqueRender.alpha = 1;
      }
    }
    else {
      fogCont.alpha = 0;
    }
    boardCanvas.stage.addChild(fogContainer);

    var beaconLayer = new PIXI.Container();
    boardCanvas.stage.addChild(beaconLayer);

    var weatherLayer = new PIXI.Container();
    boardCanvas.stage.addChild(weatherLayer);

    if (data.options && data.options.weather && data.options.weather != "none") {
      if (data.options.weather == "rain") {
        var lifetime = obj.data.w / 2000 + 0.05;
        emitter = new PIXI.particles.Emitter(
          weatherLayer,
          [PIXI.Texture.fromImage('/content/lightrain.png')],
          {
            "alpha": {
              "start": 0.08,
              "end": 0.08
            },
            "scale": {
              "start": 1,
              "end": 1
            },
            "color": {
              "start": "ffffff",
              "end": "ffffff"
            },
            "speed": {
              "start": 2000,
              "end": 2000
            },
            "startRotation": {
              "min": 90,
              "max": 90
            },
            "rotationSpeed": {
              "min": 0,
              "max": 0
            },
            "lifetime": {
              "min": lifetime,
              "max": lifetime
            },
            "blendMode": "normal",
            "frequency": 0.09,
            "emitterLifetime": 0,
            "maxParticles": 1000,
            "pos": {
              "x": 0,
              "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
              "x": 0,
              "y": -100,
              "w": obj.data.w + 50,
              "h": 20
            }
          }
        );
      }
      else if (data.options.weather == "rain mix") {
        var lifetime = obj.data.w / 2000 + 0.05;
        emitter = new PIXI.particles.Emitter(
          weatherLayer,
          [PIXI.Texture.fromImage('/content/rain.png')],
          {
            "alpha": {
              "start": 0.08,
              "end": 0.08
            },
            "scale": {
              "start": 1,
              "end": 1
            },
            "color": {
              "start": "ffffff",
              "end": "ffffff"
            },
            "speed": {
              "start": 2000,
              "end": 2000
            },
            "startRotation": {
              "min": 90,
              "max": 90
            },
            "rotationSpeed": {
              "min": 0,
              "max": 0
            },
            "lifetime": {
              "min": lifetime,
              "max": lifetime
            },
            "blendMode": "normal",
            "frequency": 0.02,
            "emitterLifetime": 0,
            "maxParticles": 1000,
            "pos": {
              "x": 0,
              "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
              "x": 0,
              "y": -100,
              "w": obj.data.w + 50,
              "h": 20
            }
          }
        );
      }
      else if (data.options.weather == "downpour") {
        var lifetime = obj.data.w / 3000 + 0.02;
        emitter = new PIXI.particles.Emitter(
          weatherLayer,
          [PIXI.Texture.fromImage('/content/hardrain.png')],
          {
            "alpha": {
              "start": 0.08,
              "end": 0.08
            },
            "scale": {
              "start": 1,
              "end": 1
            },
            "color": {
              "start": "ffffff",
              "end": "ffffff"
            },
            "speed": {
              "start": 3000,
              "end": 3000
            },
            "startRotation": {
              "min": 85,
              "max": 85
            },
            "rotationSpeed": {
              "min": 0,
              "max": 0
            },
            "lifetime": {
              "min": lifetime,
              "max": lifetime
            },
            "blendMode": "normal",
            "frequency": 0.004,
            "emitterLifetime": 0,
            "maxParticles": 2000,
            "pos": {
              "x": 0,
              "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
              "x": -100,
              "y": -100,
              "w": obj.data.w + 50,
              "h": 20
            }
          }
        );
      }
      else if (data.options.weather == "snow") {
        var lifetime = obj.data.w / 200 + 1;
        emitter = new PIXI.particles.Emitter(
          weatherLayer,
          [PIXI.Texture.fromImage('/content/snowflake.png'), PIXI.Texture.fromImage('/content/snowflake1.png'), PIXI.Texture.fromImage('/content/snowflake2.png')],
          {
            "alpha": {
              "start": 0.73,
              "end": 0.46
            },
            "scale": {
              "start": 0.15,
              "end": 0.2,
              "minimumScaleMultiplier":0.5
            },
            "color": {
              "start": "ffffff",
              "end": "ffffff"
            },
            "speed": {
              "start": 200,
              "end": 200
            },
            "startRotation": {
              "min": 80,
              "max": 90
            },
            "rotationSpeed": {
              "min": 0,
              "max": 200
            },
            "lifetime": {
              "min": lifetime,
              "max": lifetime
            },
            "blendMode": "normal",
            "ease": [
              {
                "s": 0,
                "cp": 0.379,
                "e": 0.548
              },
              {
                "s": 0.548,
                "cp": 0.717,
                "e": 0.676
              },
              {
                "s": 0.676,
                "cp": 0.635,
                "e": 1
              }
            ],
            "frequency": 0.02,
            "emitterLifetime": 0,
            "maxParticles": 2000,
            "pos": {
              "x": 0,
              "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
              "x": 0,
              "y": -100,
              "w": obj.data.w,
              "h": 20
            }
          }
        );
      }
    }

    var cursorLayer = new PIXI.Graphics();
    boardCanvas.stage.addChild(cursorLayer);

    var cursorTextLayer = new PIXI.Container();
    boardCanvas.stage.addChild(cursorTextLayer);

    var cursorMeasureLayer = new PIXI.Container();
    boardCanvas.stage.addChild(cursorMeasureLayer);

    var selectionLayer = new PIXI.Graphics();
    boardCanvas.stage.addChild(selectionLayer);


    if (!drawnGrid) {
      drawnGrid = boardApi.drawGrid(obj, app, scope);
      boardCanvas.stage.addChild(drawnGrid);
    }

    boardApi.rebuildFog(obj, app);


    // negative because backwards compatible
    boardCanvas.stage.x = scrollLeft;
    boardCanvas.stage.y = scrollTop;
    boardCanvas.stage.scale.set(zoom);

    var newMenu = boardApi.buildMenu(obj, app, scope);
    newMenu.appendTo(divRowWrapper);
    if (app.attr("hidemenu")) {
      newMenu.hide();
    }
  }
  else {
    divRow.addClass("flexcolumn");
    divRow.append("<div class='flexcolumn flex flexmiddle'><div class='loader lpadding'></div></div>");
    //if (obj.data._t == "b"){

    //}
    setTimeout(function(){
      var loaded = {};

      if (!divRow.width() && !divRow.height()) {
        obj.update();
      }
      else {
        app.attr("divWidth", divRow.width());
        app.attr("divHeight", divRow.height());
      }

      var resourceList = [];
      for (var i=0; i<data.sheets.length; i++) {
        if (!PIXI.loader.resources[data.sheets[i].i]) {
          resourceList.push(data.sheets[i].i);
        }
      }
      PIXI.loaders.Resource.setExtensionLoadType('gif', PIXI.loaders.Resource.LOAD_TYPE.XHR);
      PIXI.loaders.Resource.setExtensionXhrType('gif', PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER);

      if (data.map && data.map.match(".gif") && !util.contains(resourceList, data.map)  && false) {
        resourceList.push(data.map);
      }
      for (var k in data.layers) {
        for (var p in data.layers[k].p) {
          if (data.layers[k].p[p].i && data.layers[k].p[p].i.match(".gif") && !util.contains(resourceList, data.layers[k].p[p].i) && false) {
            resourceList.push(data.layers[k].p[p].i);
          }
        }
      }
      var getFrames = function(r){
        var frames           = [];
        var gif              = new GIF(new Uint8Array(r.data));
        var gifFrames        = gif.decompressFrames(true);
        var gifWidth         = gifFrames[0].dims.width;
        var gifHeight        = gifFrames[0].dims.height;
        var gifCanvas        = document.createElement('canvas');
        var gifCtx           = gifCanvas.getContext('2d');
        var gifImageData     = gifCtx.createImageData(gifWidth, gifHeight);
        gifCanvas.width  = gifWidth * gifFrames.length;
        gifCanvas.height = gifHeight;
        var gifSpriteSheet = new PIXI.BaseTexture.fromCanvas(gifCanvas);
        gifFrames.map(function(f, i){
          gifImageData.data.set(f.patch);
          gifCtx.putImageData(gifImageData, i * gifWidth, 0);
        }).map(function(f, i){
          frames.push(new PIXI.Texture(gifSpriteSheet, new PIXI.Rectangle(i * gifWidth, 0, gifWidth, gifHeight)));
        });
        if (Math.floor(Math.log2(gifWidth)) != Math.ceil(Math.log2(gifWidth)) || Math.floor(Math.log2(gifHeight)) != Math.ceil(Math.log2(gifHeight))) {
          sendAlert({text : ".gif size must be a power of 2"});
          return [];
        }
        else {
          return frames;
        }
      };
      function onLoad(loader, res){
        Object.keys(res).forEach(function(k){
          if (res[k].extension == "gif" && res[k].data && !res[k].gifFrames && false) {
            res[k].gifFrames = getFrames(res[k]);
          }
        });
        if (hasRights) {
          app.attr("hideCursor", "true");
        }
        setTimeout(function(){obj.update();}, 100);
      };

      PIXI.loader.add(resourceList).load(onLoad);

      /*function checkLoaded(sheet) {
        var fullLoaded = true;
        for (var i=0; i<data.sheets.length; i++) {
          if (!loaded[i]) {
            fullLoaded = false;
          }
        }
        if (!data.sheets.length || fullLoaded)  {
          if (hasRights) {
            app.attr("hideCursor", "true");
          }
          setTimeout(function(){obj.update();}, 100);
        }
      }
      function loadWrap(sheet) {
        if (!data.sheets[sheet].i || PIXI.loader.resources[data.sheets[sheet].i]) {
          loaded[sheet] = true;
          checkLoaded(sheet);
          if (data.sheets[Number(sheet)+1]) {
            loadWrap(Number(sheet)+1);
          }
        }
        else {
          PIXI.loader.add(data.sheets[sheet].i).load(setup);
          function setup() {
            loaded[sheet] = true;
            if (data.sheets[Number(sheet)+1]) {
              loadWrap(Number(sheet)+1);
            }
            checkLoaded(sheet);
          }
        }
      }
      for (var i=0; i<data.sheets.length; i++) {
        loadWrap(i);
        break;
      }
      if (!data.sheets.length)  {
        if (hasRights) {
          app.attr("hideCursor", "true");
        }
        setTimeout(function(){obj.update();}, 100);
      }*/
    }, 200);
  }

  return div;
});
