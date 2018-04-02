var boardApi = {}
boardApi.saveChanges = function(obj, mode){
  if (mode == "discard") {
    runCommand("refreshEntity", {id : obj.id()});
    return true;
  }

  var data = obj.data;

  var gridWidth = data.gridW;
  var gridHeight = data.gridH;

  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;

  if (mode == null) { // run the optimizer
    function duplicateCheck(layer, index) {
      var layerData = data.layers[layer];
      var stamps = layerData.s;
      var tiles = layerData.t;
      var pieces = layerData.p;
      var strokes = layerData.d;

      var tile = duplicate(tiles[index]);
      delete tile.remove;
      if (tile.t) {
        if ((tile.w >= (data.gridW || tile.w) && tile.h >= (data.gridH || tile.h))) {
          for (var j=0; j<tiles.length; j++) {
            if (j != index) {
              var cTile = tiles[j];
              if (cTile.t) {
                if ((cTile.w >= (data.gridW || cTile.w) && cTile.h >= (data.gridH || cTile.h))) {
                  if (cTile.i == tile.i && cTile.s == tile.s) {
                    if (tile.x == cTile.x && cTile.x + cTile.w == tile.x + tile.w) {
                      // they are on the same plane
                      if ((cTile.y+cTile.h >= tile.y && cTile.y+cTile.h <= tile.y+tile.h) || (tile.y+tile.h >= cTile.y && tile.y+tile.h <= cTile.y+cTile.h)) {
                        // they overlapping
                        var changed = 0;
                        if ((cTile.y + cTile.h) - (tile.y + tile.h) > 0){
                          changed += (cTile.y + cTile.h) - (tile.y + tile.h);
                        }
                        if (cTile.y < tile.y) {
                          changed += Math.abs(tile.y-cTile.y);
                          tile.y = cTile.y;
                        }
                        tile.h += changed;
                        tile.t = true;
                        cTile.remove = true;
                      }
                    }
                    else if (tile.y == cTile.y && cTile.y + cTile.h == tile.y + tile.h) {
                      // they are on the same plane
                      if ((cTile.x+cTile.w >= tile.x && cTile.x+cTile.w <= tile.x+tile.w) || (tile.x+tile.w >= cTile.x && tile.w+tile.x <= cTile.x+cTile.w)) {
                        // they overlapping
                        var changed = 0;
                        if ((cTile.x + cTile.w) - (tile.x + tile.w) > 0){
                          changed += (cTile.x + cTile.w) - (tile.x + tile.w);
                        }
                        if (cTile.x < tile.x) {
                          changed += Math.abs(tile.x-cTile.x);
                          tile.x = cTile.x;
                        }
                        tile.w += changed;
                        tile.t = true;
                        cTile.remove = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return tile;
    }
    if (hasGrid && !(isHex)) {
      for (var lid in data.layers) {
        var layerData = data.layers[lid];
        var stamps = layerData.s;
        var tiles = layerData.t;
        var pieces = layerData.p;
        var strokes = layerData.d;

        // to do : handle rotations
        for (var i in stamps) {
          var coordData = stamps[i];
        }
        var i = 0;
        var remove = true;
        while(remove) {
          remove = false;
          for (var i=0; i<tiles.length; i++) {
            tiles[i] = duplicateCheck(lid, i);
            for (var j=tiles.length-1; j>i; j--) {
              if (tiles[j].remove) {
                tiles.splice(j, 1);
                remove = true;
              }
            }
          }
        }
      }
    }

    var x = Number(data.x || 0);
    var y = Number(data.y || 0);
    for (var lid in data.layers) {
      var layerData = data.layers[lid];
      var stamps = layerData.s;
      var tiles = layerData.t;
      var pieces = layerData.p;
      var strokes = layerData.d;

      // to do : handle rotations
      for (var i in stamps) {
        var coordData = stamps[i];
        if (Number(coordData.x || 0) + Number(coordData.w || 0) > x) {
          x = Number(coordData.x || 0) + Number(coordData.w || 0);
        }
        if (Number(coordData.y || 0) + Number(coordData.h || 0) > y) {
          y = Number(coordData.y || 0) + Number(coordData.h || 0);
        }
      }
      for (var i in tiles) {
        var coordData = tiles[i];
        if (Number(coordData.x || 0) + Number(coordData.w || 0) > x) {
          x = Number(coordData.x || 0) + Number(coordData.w || 0);
        }
        if (Number(coordData.y || 0) + Number(coordData.h || 0) > y) {
          y = Number(coordData.y || 0) + Number(coordData.h || 0);
        }
      }
      for (var i in pieces) {
        var coordData = pieces[i];
        if (Number(coordData.x || 0) + Number(coordData.w || 0) > x) {
          x = Number(coordData.x || 0) + Number(coordData.w || 0);
        }
        if (Number(coordData.y || 0) + Number(coordData.h || 0) > y) {
          y = Number(coordData.y || 0) + Number(coordData.h || 0);
        }
      }
    }
    if (Number(x) - Number(data.x || 0)) {
      data.w = Number(x) - Number(data.x || 0);
    }
    if (Number(y) - Number(data.y || 0)) {
      data.h = Number(y) - Number(data.y || 0);
    }
    obj.sync("updateAsset");
  }
  else {
    obj.sync("updateAsset");
  }
  return true;
};


boardApi.pix = {};
var time = 0;
boardApi.pix.dragging = null;
boardApi.pix.apps = {};
boardApi.pix.selections = {};
boardApi.pix.triggers = {flush : {}, cache : {}}; // a cache for triggers
boardApi.pix.fog = {};

boardApi.pix.fonts = {
  default : {
    fontFamily: "Arial",
    fontWeight: "bold",
    fontSize : 10,
    fill: "white",
    stroke: 'black',
    strokeThickness: 0,
    dropShadow: true,
    dropShadowAngle : 0.001,
    dropShadowColor: "rgba(0,0,0,1)",
    dropShadowBlur: 3,
    dropShadowDistance : 0,
  }
}

boardApi.pix.scale = function(value, obj, reverse) {
  if (value != null && !isNaN(value)) {
    if (obj.data.options && obj.data.options.unitScale) {
      if (reverse) {
        return value * obj.data.options.unitScale;
      }
      return value / obj.data.options.unitScale;
    }
  }
  return value;
}

boardApi.pix.tileLayer = function(stage, layer) {
  return stage.children[1].children[layer].children[1];
}

boardApi.pix.lookup = function(layer, type, index, app) {
  var stage = boardApi.pix.apps[app.attr("id")].stage;
  var board = getEnt(app.attr("index"));
  var layerData = board.data.layers[layer];
  var layerCont = stage.children[1].children[layer];
  if (layerCont && layerCont.children && layerCont.children.length) {
    if (type == "t") {
      var tiles = layerCont.children[1];
      if (tiles.children && tiles.children[index]) {
        // naively rebuild because I don't know how to update transformations
        return tiles.children[index];
      }
    }
    else if (type == "p") {
      var pieces = layerCont.children[2];
      if (pieces.children && pieces.children[index]) {
        // naively rebuild because I don't know how to update transformations
        return pieces.children[index];
      }
    }
    else if (type == "d") {
      var drawings = layerCont.children[3];
      if (drawings.children && drawings.children[index]) {
        // naively rebuild because I don't know how to update transformations
        return drawings.children[index];
      }
    }
  }
}

boardApi.pix.context = function(obj, app, scope, ev) {
  var actionList = [];

  var data = obj.data;

  var gridWidth = data.gridW;
  var gridHeight = data.gridH;

  var zoom = app.attr("zoom") / 100;

  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");

  var point = boardApi.pix.apps[app.attr("id")].stage.toLocal({x : ev.pageX, y : ev.pageY});

  var xPos = point.x;
  var yPos = point.y;

  var selections = null;
  for (var key in boardApi.pix.selections) {
    if (boardApi.pix.selections[key].app == app.attr("id")) {
      if (!selections) {
        selections = selections || {};
      }
      selections[key] = boardApi.pix.selections[key];
    }
  }

  var layerChoices = [];
  for (var lid in data.layers) {
    layerChoices.push({
      name : data.layers[lid].n,
      attr : {layer : lid},
      click : function(ev, ui){
        var targetLayer = ui.attr("layer");
        var layers = {};
        var selected = selections;

        var splice = {};
        var push = {
          t : [],
          p : [],
          d : [],
          w : []
        };
        for (var i in selected) {
          if (obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]) {
            push[selected[i].type].push(duplicate(obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]));
            splice[selected[i].layer] = splice[selected[i].layer] || {t : {indexs : []}, p : {indexs : []}, d : {indexs : []}, w : {indexs : []}};
            splice[selected[i].layer][selected[i].type].indexs.push(Number(selected[i].index));
            if (splice[selected[i].layer][selected[i].type].rebuild == null || splice[selected[i].layer][selected[i].type].rebuild > selected[i].index) {
              splice[selected[i].layer][selected[i].type].rebuild = Number(selected[i].index);
            }
            boardApi.pix.selections[i].selected.visible = false;
          }
        }
        for (var layer in obj.data.layers) {
          var update = {
            id : obj.id(),
            layer : layer,
            rebuild : {}
          };
          var layerData = splice[layer];
          if (layerData) {
            for (var type in layerData) {
              var typeData = layerData[type];
              if (typeData.indexs.length && typeData.rebuild != null) {
                update.cmd = "destroy";
                update.rebuild[type] = typeData.rebuild;

                typeData.indexs.sort();
                for (var idx=typeData.indexs.length-1; idx>=0; idx--) {
                  obj.data.layers[layer][type].splice(typeData.indexs[idx], 1);
                }
                if (layer == targetLayer) {
                  for (var j=0; j<push[type].length; j++) {
                    if (push[type][j]) {
                      obj.data.layers[layer][type].push(push[type][j]);
                    }
                  }
                }
              }
            }
          }
          else if (layer == targetLayer) {
            for (var type in push) {
              for (var j=0; j<push[type].length; j++) {
                if (push[type][j]) {
                  obj.data.layers[layer][type].push(push[type][j]);
                }
              }
            }
          }
          update.result = duplicate(obj.data.layers[layer]);
          boardApi.pix.applyUpdate(getCookie("UserID"), update);
          runCommand("updateBoardLayer", update);
        }

        // perform the move
      }
    })
  }

  if (selections) {
    if (hasRights) {
      actionList.push({
        name : "To Back",
        click : function(ev, ui){
          var splice = {};
          var push = {
            t : [],
            p : [],
            d : [],
            w : []
          };
          var selected = selections;
          for (var i in selected) {
            if (obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]) {
              push[selected[i].layer] = push[selected[i].layer] || {t : [], p : [], d : [], w : []};
              push[selected[i].layer][selected[i].type].push(duplicate(obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]));
              splice[selected[i].layer] = splice[selected[i].layer] || {t : {indexs : []}, p : {indexs : []}, d : {indexs : []}, w : {indexs : []}};
              splice[selected[i].layer][selected[i].type].indexs.push(Number(selected[i].index));
              splice[selected[i].layer][selected[i].type].rebuild = 0;
              boardApi.pix.selections[i].selected.visible = false;
            }
          }

          for (var layer in obj.data.layers) {
            var update = {
              id : obj.id(),
              layer : layer,
              rebuild : {}
            };
            var layerData = splice[layer];
            if (layerData) {
              for (var type in layerData) {
                var typeData = layerData[type];
                if (typeData.indexs.length && typeData.rebuild != null) {
                  update.cmd = "destroy";
                  update.rebuild[type] = typeData.rebuild;

                  typeData.indexs.sort();
                  for (var idx=typeData.indexs.length-1; idx>=0; idx--) {
                    obj.data.layers[layer][type].splice(typeData.indexs[idx], 1);
                  }
                  for (var j=push[layer][type].length-1; j>=0; j--) {
                    util.insert(obj.data.layers[layer][type], 0, push[layer][type][j]);
                  }
                }
              }
            }
            update.result = duplicate(obj.data.layers[layer]);
            boardApi.pix.applyUpdate(getCookie("UserID"), update);
            runCommand("updateBoardLayer", update);
          }
          boardApi.pix.selections = {};
        }
      });
      actionList.push({
        name : "To Front",
        click : function(ev, ui){
          var splice = {};
          var push = {
            t : [],
            p : [],
            d : [],
            w : []
          };
          var selected = selections;

          for (var i in selected) {
            if (obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]) {
              push[selected[i].layer] = push[selected[i].layer] || {t : [], p : [], d : [], w : []};
              push[selected[i].layer][selected[i].type].push(duplicate(obj.data.layers[selected[i].layer][selected[i].type][selected[i].index]));
              splice[selected[i].layer] = splice[selected[i].layer] || {t : {indexs : []}, p : {indexs : []}, d : {indexs : []}, w : {indexs : []}};
              splice[selected[i].layer][selected[i].type].indexs.push(Number(selected[i].index));
              if (splice[selected[i].layer][selected[i].type].rebuild == null || splice[selected[i].layer][selected[i].type].rebuild > selected[i].index) {
                splice[selected[i].layer][selected[i].type].rebuild = Number(selected[i].index);
              }
              boardApi.pix.selections[i].selected.visible = false;
            }
          }

          for (var layer in obj.data.layers) {
            var update = {
              id : obj.id(),
              layer : layer,
              rebuild : {}
            };
            var layerData = splice[layer];
            if (layerData) {
              for (var type in layerData) {
                var typeData = layerData[type];
                if (typeData.indexs.length && typeData.rebuild != null) {
                  update.cmd = "destroy";
                  update.rebuild[type] = typeData.rebuild;

                  typeData.indexs.sort();
                  for (var idx=typeData.indexs.length-1; idx>=0; idx--) {
                    obj.data.layers[layer][type].splice(typeData.indexs[idx], 1);
                  }
                  for (var j=0; j<push[layer][type].length; j++) {
                    if (push[layer][type][j]) {
                      obj.data.layers[layer][type].push(push[layer][type][j]);
                    }
                  }
                }
              }
            }
            update.result = duplicate(obj.data.layers[layer]);
            boardApi.pix.applyUpdate(getCookie("UserID"), update);
            runCommand("updateBoardLayer", update);
          }
          boardApi.pix.selections = {};
        }
      });
      actionList.push({
        name : "To Layer",
        submenu : layerChoices
      });
    }
  }

  if (app.attr("background") == "true") {
    if (!selections) {
      actionList.push({
        name : "Exit Build Mode",
        click : function(ev, ui){
          if (boardApi.saveChanges(obj, true)) {
            app.removeAttr("background");
            app.removeAttr("ignore");
            app.removeAttr("local");

            layout.coverlay("save-changes");
          }
        }
      });
    }
  }
  else {
    if (!selections) {
      if (hasRights) {
        actionList.push({
          name : "Create Asset",
          click : function(ev, ui){
            var content = sync.render("ui_assetPicker")(obj, app, {
              category : "c",
              select : function(ev, ui, ent, options, entities){
                var newP = {
                  x : xPos,
                  y : yPos,
                  w : (data.pW || data.gridW || 64),
                  h : (data.pH || data.gridH || 64),
                  d : (data.pD || null),
                  c : (data.pC || null),
                  eID : ent.id(),
                  i : (ent.data.info.img != null)?(ent.data.info.img.min):(null)
                };
                if (ent.data._t == "c") {
                  ent = duplicate(ent);
                  var context = sync.defaultContext();
                  context[ent.data._t] = ent.data;

                  for (var i in ent.data.info.img.modifiers) {
                    var val = ent.data.info.img.modifiers[i];
                    if (val) {
                      newP[i] = sync.eval(val, context);
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
                boardApi.pix.addObject(newP, scope.layer, "p", obj);
                layout.coverlay("add-asset");
              }
            });
            var pop = ui_popOut({
              target : $("body"),
              prompt : true,
              id : "add-asset",
              title : "Add Asset",
              style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
            }, content);
            pop.resizable();
          }
        });
        actionList.push({
          name : "Create Piece",
          click : function(ev, ui){
            var newP = {
              x : xPos,
              y : yPos,
              w : (data.pW || data.gridW || 64),
              h : (data.pH || data.gridH || 64),
              d : (data.pD || null),
              c : (data.pC || "rgba(255,255,255,1)"),
            };
            boardApi.pix.addObject(newP, scope.layer, "p", obj);
          }
        });
        actionList.push({
          name : "Create Image",
          click : function(ev, ui){
            var picker = sync.render("ui_filePicker")(obj, app, {
              filter : "img",
              change : function(ev, ui2, value) {
                if (value) {
                  var img = new Image();
                  img.src = value;
                  img.onload = function(){
                    var newP = {
                      x : xPos, y : yPos,
                      w : Math.min(this.naturalWidth, (data.pW || data.gridW || 64)), h : Math.min(this.naturalHeight, (data.pH || data.gridH || 64)),
                      i : value
                    };
                    boardApi.pix.addObject(newP, scope.layer, "p", obj);
                    layout.coverlay("icons-picker");
                  }
                }
              }
            });
            var pop = ui_popOut({
              target : ui,
              prompt : true,
              align : "right",
              id : "icons-picker",
              style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
            }, picker);
            pop.resizable();
          }
        });
      }
      else {
        actionList.push({
          name : "Create Piece",
          click : function(ev, ui) {
            var ent = getPlayerCharacter(getCookie("UserID"));
            if (ent && ent.data) {
              var proceed = true;
              for (var i in data.layers[scope.layer].p) {
                if (data.layers[scope.layer].p[i].eID == game.players.data[getCookie("UserID")].entity) {
                  proceed = false;
                  break;
                }
              }
              if (proceed) {
                var newP = {
                  x : xPos,
                  y : yPos,
                  w : (data.pW || data.gridW || 64),
                  h : (data.pH || data.gridH || 64),
                  d : (data.pD || null),
                  c : (game.players.data[getCookie("UserID")].color || data.pC || null),
                  eID : game.players.data[getCookie("UserID")].entity,
                  i : (ent.data.info.img != null)?(ent.data.info.img.min):(null)
                };
                if (ent.data._t == "c") {
                  ent = duplicate(ent);
                  var context = sync.defaultContext();
                  context[ent.data._t] = ent.data;

                  for (var i in ent.data.info.img.modifiers) {
                    var val = ent.data.info.img.modifiers[i];
                    if (val) {
                      newP[i] = sync.eval(val, context);
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
                runCommand("createPiece", {id : obj.id(), layer : scope.layer, data : newP});
              }
              else {
                sendAlert({text : "You have already been placed!"});
              }
            }
            else {
              sendAlert({text : "You are not impersonating a character"});
            }
          }
        });
      }
    }
    else if (hasRights && (boardApi.pix.fog[obj.id()] && boardApi.pix.fog[obj.id()].length)) {
      actionList.push({
        name : "Selection Vision",
        click : function(ev, ui) {
          app.attr("UserID", "default");
          boardApi.pix.rebuildFog(obj, app);
          for (var i in boardApi.pix.apps[app.attr("id")].views) {
            boardApi.pix.apps[app.attr("id")].views[i].destroy(true);
            delete boardApi.pix.apps[app.attr("id")].views[i];
          }
          for (var key in boardApi.pix.selections) {
            var selectData = boardApi.pix.selections[key];
            if (selectData.app == app.attr("id") && selectData.type == "p") {
              var pieceData = obj.data.layers[selectData.layer][selectData.type][selectData.index];
              var range;
              if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                var ent = getEnt(pieceData.eID);
                var context = sync.defaultContext();
                if (ent && ent.data) {
                  context[ent.data._t] = duplicate(ent.data);
                }
                var auraData = pieceData.o.Sight;
                range = boardApi.pix.scale(sync.eval(auraData.d, context), obj, true);
              }
              boardApi.pix.apps[app.attr("id")].views[selectData.layer+"-"+selectData.type+"-"+selectData.index] = boardApi.pix.buildDynamicFog(obj, app, pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
              boardApi.pix.rebuildDynamicFog(obj, app);
            }
          }
        }
      });
    }
  }
  if (app.attr("UserID") == "default" && (boardApi.pix.fog[obj.id()] && boardApi.pix.fog[obj.id()].length)) {
    actionList.push({
      name : "Restore Vision",
      click : function(ev, ui) {
        app.removeAttr("UserID");
        obj.update();
      }
    });
  }
  else if (app.attr("UserID")) {
    actionList.push({
      name : "Exit Player Vision",
      click : function(ev, ui) {
        app.removeAttr("UserID");
        obj.update();
      }
    });
  }
  if (app.attr("hidemenu")) {
    actionList.push({
      name : "Show Menu",
      click : function(ev, ui) {
        $("#"+app.attr("id")+"-menu-"+obj.id()).show();
        app.removeAttr("hidemenu");
      }
    });
  }
  else {
    actionList.push({
      name : "Hide Menu",
      click : function(ev, ui) {
        $("#"+app.attr("id")+"-menu-"+obj.id()).hide();
        app.attr("hidemenu", true);
      }
    });
  }
  if (hasRights) {
    actionList.push({
      name : "Map Manager",
      icon : "list-alt",
      click : function(ev, ui){
        if (game.locals["drawing"]) {
          delete game.locals["drawing"].data.drawing;
        }

        var content = sync.newApp("ui_boardEditor");
        content.attr("local", scope.local);
        content.attr("viewOnly", scope.viewOnly);
        content.attr("targetApp", app.attr("id"));
        content.attr("hideLayers", true);
        obj.addApp(content);
        if (!$("#board-layer-controls-"+obj.id()).length && $(".application[ui-name='ui_boardListener']").length == 0) {
          var pop = ui_popOut({
            target : app,
            id : "board-layer-controls-"+obj.id(),
            dragThickness : "0.5em",
            title : "Map Manager",
            minimize : true,
            align : "right",
            close : function(){
              $("#board-layer-controls-"+obj.id()).hide();
              $("#board-layer-controls-"+obj.id()).removeAttr("docked");
              return false;
            },
            style : {"width" : "20vw", height : "40vh"}
          }, content);
          pop.addClass("layoutHide");
          pop.resizable();
        }
        else {
          $("#board-layer-controls-"+obj.id()).show();
        }
      }
    });
  }

  return actionList;
}

boardApi.pix.revealLayers = function(obj, app) {
  var data = obj.data;

  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  var stage = boardApi.pix.apps[app.attr("id")].stage;
  for (var lid in data.layers) {
    var layerData = data.layers[lid];
    var playerVision = app.attr("UserID") && !layerData.h && (!layerData._s || layerData._s.default == 1);
    var layerVisible = !layerData.h && (hasRights || hasSecurity(userID, "Visible", layerData));
    layerVisible = layerVisible || (lid == app.attr("layer"));

    var layerCont = stage.children[1].children[lid];
    if (playerVision || (!app.attr("UserID") && layerVisible)) {
      layerCont.visible = true;
    }
    else {
      layerCont.visible = false;
    }
    playerVision = null;
    layerVisible = null;

    var pieces = data.layers[lid].p;

    for (var pid in pieces) {
      var pieceData = pieces[pid];
      if (pieceData.l) {
        var lyr = stage.children[1].children[lid];
        if (lyr && lyr.children && lyr.children[2] && lyr.children[2].children) {
          var pce = lyr.children[2].children[pid];
          pce.update();
        }
      }
    }
  }
}

boardApi.pix.updateLayer = function(layer, rebuild, obj, cmd) {
  var update = {
    layer : layer,
    id : obj.id(),
    rebuild : rebuild || {"r" : true},
    cmd : cmd,
    result : duplicate(obj.data.layers[layer])
  };
  boardApi.pix.applyUpdate(getCookie("UserID"), update);
  runCommand("updateBoardLayer", update);
}

boardApi.pix.addObject = function(pieceData, layer, type, obj) {
  var update = {
    layer : layer,
    id : obj.id(),
    cmd : "create",
    type : type,
    data : pieceData,
  };
  if (type == "r" || type == "w" || (pieceData.eID && obj.data.options.fog)){
    update.rebuild = update.rebuild || {};
    update.rebuild.r = true;
  }
  obj.data.layers[layer][type].push(pieceData);
  update.result = duplicate(obj.data.layers[layer]);
  update.index = obj.data.layers[layer][type].length-1;
  boardApi.pix.applyUpdate(getCookie("UserID"), update);
  runCommand("updateBoardLayer", update);
}

boardApi.pix.destroyObject = function(layer, type, index, obj) {
  var update = {
    layer : layer,
    id : obj.id(),
    cmd : "destroy",
    type : type,
  };
  obj.data.layers[layer][type].splice(index, 1);
  update.result = duplicate(obj.data.layers[layer]);
  update.index = index;
  update.rebuild = {};
  update.rebuild[type] = update.index;
  if (type == "r" || type == "w" || (pieceData.eID && obj.data.options.fog)){
    update.rebuild = update.rebuild || {};
    update.rebuild.r = true;
  }
  boardApi.pix.applyUpdate(getCookie("UserID"), update);
  runCommand("updateBoardLayer", update);
}

boardApi.pix.clearSelection = function(app) {
  for (var key in boardApi.pix.selections) {
    var selectData = boardApi.pix.selections[key];
    if (!app || app.attr("id") == selectData.app) {
      selectData.wrap.unselect();
      delete boardApi.pix.selections[key];
    }
  }
}

boardApi.pix.updateObject = function(layer, type, index, board) {
  $(".application[ui-name='ui_board']").each(function(){
    var userID = $(this).attr("UserID") || getCookie("UserID");
    if ($(this).attr("index") == board.id()) {
      var stage = boardApi.pix.apps[$(this).attr("id")].stage;
      var layerData = board.data.layers[layer];
      var layerCont = stage.children[1].children[layer];
      if (layerCont && layerCont.children && layerCont.children.length) {
        if (type == "p") {
          var pieces = layerCont.children[2];
          if (pieces.children && pieces.children[index]) {
            // naively rebuild because I don't know how to update transformations
            pieces.removeChildren();
            for (var i=0; i<layerData[type].length; i++) {
              var pieceData = layerData[type][i];
              var newChild = boardApi.pix.createPiece({data : pieceData, index : i, layer : layer}, board, $(this), {layer : layer});
              pieces.addChild(newChild);
              var selectData = boardApi.pix.selections[board.id()+"-"+layer+"-"+type+"-"+i];
              if (selectData && selectData.app == $(this).attr("id")) {
                newChild.select();
              }
              if (boardApi.pix.fog[board.id()] && boardApi.pix.fog[board.id()].length) { // if dynamic fog
                // rebuild dynamic fog cache
                if (pieceData.eID) {
                  var ent = getEnt(pieceData.eID);
                  if (ent && ent.data && ent.data._t == "c") {
                    console.log(userID);
                    if (hasSecurity(userID, "Visible", ent.data)) {
                      var range;
                      if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                        var ent = getEnt(pieceData.eID);
                        var context = sync.defaultContext();
                        if (ent && ent.data) {
                          context[ent.data._t] = duplicate(ent.data);
                        }
                        var auraData = pieceData.o.Sight;
                        range = boardApi.pix.scale(sync.eval(auraData.d, context), board, true);
                      }
                      console.log("rebuild " + layer+"-"+type+"-"+index, range, boardApi.pix.apps[$(this).attr("id")].views);
                      boardApi.pix.apps[$(this).attr("id")].views[layer+"-"+type+"-"+index] = boardApi.pix.buildDynamicFog(board, $(this), pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
                      boardApi.pix.rebuildDynamicFog(board, $(this));
                    }
                    else if (boardApi.pix.apps[$(this).attr("id")].views[layer+"-"+type+"-"+index]) {
                      boardApi.pix.apps[$(this).attr("id")].views[layer+"-"+type+"-"+index].destroy(true);
                      delete boardApi.pix.apps[$(this).attr("id")].views[layer+"-"+type+"-"+index];
                      boardApi.pix.rebuildDynamicFog(board, $(this));
                    }
                  }
                }
              }
            }
          }
        }
        else if (type == "d") {
          var drawings = layerCont.children[3];
          if (drawings.children && drawings.children[index]) {
            drawings.removeChildren();
            for (var i=0; i<layerData[type].length; i++) {
              var newChild = boardApi.pix.createDrawing({data : layerData[type][i], index : i, layer : layer}, board, $(this), {layer : layer});
              drawings.addChild(newChild);

              var selectData = boardApi.pix.selections[board.id()+"-"+layer+"-"+type+"-"+i];
              if (selectData && selectData.app == $(this).attr("id")) {
                newChild.select();
              }
            }
          }
        }
        else if (type == "t") {
          var tiles = layerCont.children[1];
          if (tiles.children && tiles.children[index]) {
            tiles.removeChildren();
            for (var i=0; i<layerData[type].length; i++) {
              var newChild = boardApi.pix.createTile({data : layerData[type][i], index : i, layer : layer}, board, $(this), {layer : layer});
              tiles.addChild(newChild);

              var selectData = boardApi.pix.selections[board.id()+"-"+layer+"-"+type+"-"+i];
              if (selectData && selectData.app == $(this).attr("id")) {
                newChild.select();
              }
            }
          }
        }
      }
    }
  });
};

boardApi.pix.moveObject = function(layer, type, index, board, newData, oldData, speed) {
  $(".application[ui-name='ui_board']").each(function(){
    var stage = boardApi.pix.apps[$(this).attr("id")].stage;
    var layerData = board.data.layers[layer];
    var layerCont = stage.children[1].children[layer];
    if (layerCont && layerCont.children && layerCont.children.length) {
      if (type == "p") {
        var pieces = layerCont.children[2];
        if (pieces.children && pieces.children[index]) {
          pieces.children[index].animate(newData, oldData, speed);
        }
      }
      else if (type == "d") {
        var drawings = layerCont.children[3];
        if (drawings.children && drawings.children[index]) {
          drawings.children[index].animate(newData, oldData, speed);
        }
      }
      else if (type == "t") {
        var tiles = layerCont.children[1];
        if (tiles.children && tiles.children[index]) {
          tiles.children[index].animate(newData, oldData, speed);
        }
      }
    }
  });
}

boardApi.pix.applyUpdate = function(userID, data, last) {
  if (data.cmd == "destroy") {
    if (game.locals["pieceBuilding"] && game.locals["pieceBuilding"].data) {
      delete game.locals["pieceBuilding"].data.layer;
      delete game.locals["pieceBuilding"].data.piece;
      game.locals["pieceBuilding"].update();
    }
  }
  var board = getEnt(data.id);
  if (board) {
    // found the board, now update it
    board.data.layers[data.layer] = data.result;
    $(".application[ui-name='ui_board']").each(function(){
      if (boardApi.pix.apps[$(this).attr("id")] && boardApi.pix.apps[$(this).attr("id")].board == data.id) {
        var stage = boardApi.pix.apps[$(this).attr("id")].stage;
        var layer = stage.children[1].children[data.layer];
        var layerData = board.data.layers[data.layer];
        var hasRights = hasSecurity(getCookie("UserID"), "Rights", board.data) || hasSecurity(getCookie("UserID"), "Game Master");
        var playerVision = $(this).attr("UserID") && !layerData.h && (!layerData._s || layerData._s.default == 1);
        var layerVisible = !layerData.h && (hasRights || hasSecurity(getCookie("UserID"), "Visible", layerData));
        layerVisible = layerVisible || (data.layer == $(this).attr("layer"));

        if (layer && layer.children && layer.children.length) {
          if (playerVision || (!$(this).attr("UserID") && layerVisible)) {
            layer.visible = true;
          }
          else {
            layer.visible = false;
          }
          // add any missing pieces
          var tiles = layer.children[1];
          if (tiles.children && tiles.children.length) {
            if (data.cmd == "destroy") {
              tiles.removeChildren();
              for (var i=0; i<layerData.t.length; i++) {
                var newChild = boardApi.pix.createTile({data : layerData.t[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer});
                tiles.addChild(newChild);

                var selectData = boardApi.pix.selections[board.id()+"-"+data.layer+"-"+data.type+"-"+i];
                if (selectData && selectData.app == $(this).attr("id")) {
                  newChild.select();
                }
              }
            }
            else {
              if (data.rebuild && data.rebuild.t != null) {
                var len = tiles.children.length;
                for (var i=data.rebuild.t; i<len; i++) {
                  if (data.cmd == "destroy" && i >= layerData.p.length) {
                    tiles.children[tiles.children.length-1].parent.removeChild(tiles.children[tiles.children.length-1]);
                  }
                  else {
                    tiles.children[i].update(board.data.layers.t[data.type][i]);
                  }
                }
              }
              var start = tiles.children.length;
              while (layerData.t.length > tiles.children.length) {
                tiles.addChild(boardApi.pix.createTile({data : layerData.t[start], index : start, layer : data.layer}, board, $(this), {layer : data.layer}));
                start++;
              }
            }
          }
          else {
            for (var i=0; i<layerData.t.length; i++) {
              tiles.addChild(boardApi.pix.createTile({data : layerData.t[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer}));
            }
          }
          var pieces = layer.children[2];
          if (pieces.children && pieces.children.length) {
            if (data.cmd == "destroy") {
              pieces.removeChildren();
              for (var i=0; i<layerData.p.length; i++) {
                var newChild = boardApi.pix.createPiece({data : layerData.p[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer});
                pieces.addChild(newChild);

                var selectData = boardApi.pix.selections[board.id()+"-"+data.layer+"-"+data.type+"-"+i];
                if (selectData && selectData.app == $(this).attr("id")) {
                  newChild.select();
                }
              }
            }
            else {
              if (data.rebuild && data.rebuild.p != null) {
                var len = pieces.children.length;
                for (var i=data.rebuild.p; i<len; i++) {
                  if (data.cmd == "destroy" && i >= layerData.p.length) {
                    pieces.children[pieces.children.length-1].parent.removeChild(pieces.children[pieces.children.length-1]);
                  }
                  else {
                    pieces.children[i].update(board.data.layers[data.layer].p[i]);
                  }
                }
              }
              var start = pieces.children.length;
              while (layerData.p.length > pieces.children.length) {
                pieces.addChild(boardApi.pix.createPiece({data : layerData.p[start], index : start, layer : data.layer}, board, $(this), {layer : data.layer}));
                start++;
              }
            }
          }
          else {
            for (var i=0; i<layerData.p.length; i++) {
              pieces.addChild(boardApi.pix.createPiece({data : layerData.p[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer}));
            }
          }
          var drawings = layer.children[3];
          if (drawings.children && drawings.children.length) {
            if (data.cmd == "destroy") {
              drawings.removeChildren();
              for (var i=0; i<layerData.d.length; i++) {
                var newChild = boardApi.pix.createDrawing({data : layerData.d[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer});
                drawings.addChild(newChild);

                var selectData = boardApi.pix.selections[board.id()+"-"+data.layer+"-"+data.type+"-"+i];
                if (selectData && selectData.app == $(this).attr("id")) {
                  newChild.select();
                }
              }
            }
            else {
              if (data.rebuild && data.rebuild.d != null) {
                var len = drawings.children.length;
                for (var i=data.rebuild.d; i<len; i++) {
                  drawings.children[i].update(board.data.layers[data.layer].d[i]);
                }
              }
              var start = drawings.children.length;
              while (layerData.d.length > drawings.children.length) {
                drawings.addChild(boardApi.pix.createDrawing({data : layerData.d[start], index : start, layer : data.layer}, board, $(this), {layer : data.layer}));
                start++;
              }
            }
          }
          else {
            for (var i=0; i<layerData.d.length; i++) {
              drawings.addChild(boardApi.pix.createDrawing({data : layerData.d[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer}));
            }
          }

          var walls = layer.children[4];
          if (walls.children && walls.children.length) {
            if (data.cmd == "destroy") {
              walls.removeChildren();
              for (var i=0; i<layerData.w.length; i++) {
                var newChild = boardApi.pix.createWall({data : layerData.w[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer});
                walls.addChild(newChild);

                var selectData = boardApi.pix.selections[board.id()+"-"+data.layer+"-"+data.type+"-"+i];
                if (selectData && selectData.app == $(this).attr("id")) {
                  newChild.select();
                }
              }
            }
            else {
              if (data.rebuild && data.rebuild.w != null) {
                var len = walls.children.length;
                for (var i=data.rebuild.w; i<len; i++) {
                  walls.children[i].update(board.data.layers[data.layer].w[i]);
                }
              }
              var start = walls.children.length;
              while (layerData.w.length > walls.children.length) {
                walls.addChild(boardApi.pix.createWall({data : layerData.w[start], index : start, layer : data.layer}, board, $(this), {layer : data.layer}));
                start++;
              }
            }
          }
          else {
            for (var i=0; i<layerData.w.length; i++) {
              walls.addChild(boardApi.pix.createWall({data : layerData.w[i], index : i, layer : data.layer}, board, $(this), {layer : data.layer}));
            }
          }
          if (data.rebuild && data.rebuild.r) {
            // updateTriggers
            for (var trigID in boardApi.pix.triggers.cache[board.id()]) {
              var split = trigID.split("-");
              var tL = split[0];
              var tI = split[1];
              var lyr = stage.children[1].children[tL];
              if (lyr && lyr.children && lyr.children[2] && lyr.children[2].children) {
                var pce = lyr.children[2].children[tI];
                pce.update();
              }
            }
          }
          if (data.rebuild && (data.rebuild.r || data.rebuild.w != null) && board.data.options.fog) {
            boardApi.pix.rebuildFog(board, $(this));
          }
        }
      }
    });
    for (var i in boardApi.pix.selections) {
      var selectData = boardApi.pix.selections[i];
      if (selectData.board == data.id) {
        if (!board.data.layers[selectData.layer] || !board.data.layers[selectData.layer][selectData.type] || !board.data.layers[selectData.layer][selectData.type][selectData.index]) {
          delete boardApi.pix.selections[i];
        }
      }
    }
  }
}

boardApi.pix.scrollTo = function(app, xPos, yPos) {
  var zoom = app.attr("zoom") / 100;
  var stage = boardApi.pix.apps[app.attr("id")].stage;
  stage.x = (-xPos*zoom + app.attr("divWidth")/2);
  stage.y = (-yPos*zoom + app.attr("divHeight")/2);
  app.attr("scrollLeft", xPos);
  app.attr("scrollTop", yPos);
}

boardApi.pix.entListen = function(entID){
  var ent = getEnt(entID);
  if (ent && ent.data) {
    ent.listen["healthbars"] = function(oldObj, newObj, override){
      setTimeout(function(){
        for (var i in boardApi.pix.apps) {
          var app = $("#"+i);
          var layers = boardApi.pix.apps[i].stage.children[1];
          if (layers && layers.children) {
            for (var lid in layers.children) {
              var layerCanvas = layers.children[lid];
              if (layerCanvas && layerCanvas.children) {
                if (layerCanvas.children[2] && layerCanvas.children[2].children) {
                  for (var index in layerCanvas.children[2].children) { // pieces
                    var piece = layerCanvas.children[2].children[index];
                    var board = getEnt(boardApi.pix.apps[i].board);
                    if (board.data && board.data.layers[lid] && board.data.layers[lid].p[index]) {
                      var pieceData = board.data.layers[lid].p[index];
                      if (pieceData && pieceData.eID == entID) {
                        piece.animate(pieceData, null, 1);
                        if (boardApi.pix.fog[board.id()] && boardApi.pix.fog[board.id()].length) { // if dynamic fog
                          var ent = getEnt(pieceData.eID);
                          if (ent && ent.data && ent.data._t == "c" && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
                            var range;
                            if (pieceData.o && pieceData.o.Sight) {
                              var ent = getEnt(pieceData.eID);
                              var context = sync.defaultContext();
                              if (ent && ent.data) {
                                context[ent.data._t] = duplicate(ent.data);
                              }
                              var auraData = pieceData.o.Sight;
                              range = boardApi.pix.scale(sync.eval(auraData.d, context), board, true);
                            }
                            boardApi.pix.apps[i].views[lid+"-p-"+index] = boardApi.pix.buildDynamicFog(board, app, pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
                            boardApi.pix.rebuildDynamicFog(board, app);
                          }
                          else if (boardApi.pix.apps[i].views[lid+"-p-"+index]) {
                            boardApi.pix.apps[i].views[lid+"-p-"+index].destroy(true);
                            delete boardApi.pix.apps[i].views[lid+"-p-"+index];
                            boardApi.pix.rebuildDynamicFog(board, app);
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
      },10);
      return true;
    }
  }
}

boardApi.pix.endDragEvent = function(ev){
  if (boardApi.pix.dragging) {
    boardApi.pix.dragging.end(ev);
    delete boardApi.pix.dragging;
  }
}

boardApi.pix.newDragEvent = function(options, ev){
  boardApi.pix.endDragEvent(ev);
  boardApi.pix.dragging = options;
}
