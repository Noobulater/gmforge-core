boardApi.pix.rebuildFogData = function(obj, app) {
  var application = boardApi.pix.apps[app.attr("id")];
  var data = obj.data;
  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  boardApi.pix.fog[obj.id()] = [];
  var startingFog = [
    {x1 : 0, y1 : data.h, x2 : 0, y2 : 0},
    {x1 : 0, y1 : 0, x2 : data.w, y2 : 0},

    {x1 : data.w, y1 : 0, x2 : data.w, y2 : data.h},
    {x1 : data.w, y1 : data.h, x2 : 0, y2 : data.h},
  ];
  var finalFog = [];
  for (var key in startingFog) {
    var fogData = startingFog[key];
    finalFog.push({x : fogData.x1, y : fogData.y1, x1 : fogData.x1, y1 : fogData.y1, x2 : fogData.x2, y2 : fogData.y2});
    finalFog.push({x : fogData.x2, y : fogData.y2, x1 : fogData.x1, y1 : fogData.y1, x2 : fogData.x2, y2 : fogData.y2});
  }
  var dynamic = false;
  for (var lid in obj.data.layers) {
    var layerData = obj.data.layers[lid];

    if (!layerData.h) {
      for (var i in layerData.w) {
        dynamic = true;
        var wallData = layerData.w[i];
        finalFog.push({x : wallData.x1, y : wallData.y1, x1 : wallData.x1, y1 : wallData.y1, x2 : wallData.x2, y2 : wallData.y2});
        finalFog.push({x : wallData.x2, y : wallData.y2, x1 : wallData.x1, y1 : wallData.y1, x2 : wallData.x2, y2 : wallData.y2});
      }
    }
  }

  // rebuild all application caches
  boardApi.pix.fog[obj.id()] = finalFog;
  for (var key in application.views) {
    if (key != "self") {
      var split = key.split("-");
      if (split && split.length == 3 && obj.data.layers[split[0]] && obj.data.layers[split[0]][split[1]] && obj.data.layers[split[0]][split[1]][split[2]]) {
        var pieceData = obj.data.layers[split[0]][split[1]][split[2]];
        var range = null;
        if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
          var ent = getEnt(pieceData.eID);
          var context = sync.defaultContext();
          if (ent && ent.data) {
            context[ent.data._t] = duplicate(ent.data);
          }
          var auraData = pieceData.o.Sight;
          range = boardApi.pix.scale(sync.eval(auraData.d, context), obj, true);
        }
        application.views[key] = boardApi.pix.buildDynamicFog(obj, app, pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
      }
      else if (application.views[key]) {
        application.views[key].destroy(true);
        delete application.views[key];
      }
    }
  }
}

boardApi.pix.rebuildDynamicFog = function(obj, app, x, y) {
  var returnFill;
  var application = boardApi.pix.apps[app.attr("id")];
  if (application && application.board == obj.id()) {
    var stage = application.stage;
    var fogCont = stage.children[4];
    application.renderer.render(boardApi.pix.apps[app.attr("id")].fogCache.background, application.opaqueRender, false, null, false);
    application.renderer.render(boardApi.pix.apps[app.attr("id")].fogCache.map, application.opaqueRender, false, null, false);
    application.renderer.render(boardApi.pix.apps[app.attr("id")].fogCache.fog, application.fogRender, false, null, false);
    if (boardApi.pix.fog[obj.id()] && boardApi.pix.fog[obj.id()].length) {
      if (x != null || y != null) {
        var fogFill = boardApi.pix.buildDynamicFog(obj, app, x, y);
        application.renderer.render(fogFill, application.fogRender, false, null, false);
        returnFill = fogFill;
      }
      for (var key in application.views) {
        if (key == "self") {
          var selfX = application.views["self"].x;
          var selfY = application.views["self"].y;
          if (selfX != null && selfY != null) {
            var fogFill = boardApi.pix.buildDynamicFog(obj, app, selfX, selfY);
            application.renderer.render(fogFill, application.fogRender, false, null, false);
          }
        }
        else {
          // sanity check
          var split = key.split("-");
          if (split && split.length == 3) {
            if (obj.data.layers[split[0]] && obj.data.layers[split[0]][split[1]] && obj.data.layers[split[0]][split[1]][split[2]]) {
              application.renderer.render(application.views[key], application.fogRender, false, null, false);
            }
            else if (application.views[key]) {
              application.views[key].destroy(true);
              delete application.views[key];
            }
          }
          else if (application.views[key]) {
            application.views[key].destroy(true);
            delete application.views[key];
          }
        }
      }
    }
    fogCont.alpha = 1;

    return returnFill;
  }
}

boardApi.pix.buildDynamicFog = function(obj, app, x, y, range) {
  var x = x + 0.0001;
  var y = y + 0.0001;

  var data = obj.data;
  var hasGrid = data.gridW && data.gridW;
  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  var zoom = Number(app.attr("zoom"))/100;

  var fogFillCont = new PIXI.Container();

  var fogFill = new PIXI.Graphics();
  fogFillCont.addChild(fogFill);
  /*if (data.options && data.options.fog) {
    fogFill.beginFill(0xFFFFFF, 1);
    if (hasGrid) {
      fogFill.drawRect(0, 0, Math.ceil(obj.data.w/data.gridW)*data.gridW + (data.gridX || 0), Math.ceil(obj.data.h/data.gridH)*data.gridH + (data.gridY || 0));
    }
    else {
      fogFill.drawRect(0, 0, obj.data.w, obj.data.h);
    }
    fogFill.endFill();
  }*/

  var fog = duplicate(boardApi.pix.fog[obj.id()]);
  var points = [];

  function fireRay(x1, y1, x2, y2, r1x, r1y) {
    var startInt = util.intersectRay(x1, x2, y1, y2, x, y, r1x, r1y);
    var startDist = Number.POSITIVE_INFINITY;
    if (startInt) {
      startDist = util.dist(startInt[0], x, startInt[1], y);
    }
    for (var j=0; j<fog.length; j++) {
      var cD = fog[j];
      if (j != i) {
        // check the starting point
        var cRS = util.intersectRay(cD.x1, cD.x2, cD.y1, cD.y2, x, y, r1x, r1y);
        if (cRS) { // there is another intersection
          var cDS = util.dist(cRS[0], x, cRS[1], y);
          //fogFill.drawCircle(cDS[0], cDS[1], 2);
          //fogFill.lineStyle(2, 0xAA000A, 1);
          // check to see if the other intesection is closer
          if (startDist > cDS) {
            startInt = cRS;
            startDist = cDS;
          }
        }
      }
    }
    if (startInt) {
      var rX = startInt[0]-x;
      var rY = startInt[1]-y;

      var ang = Math.atan2(rY, rX) + Math.PI/2;

      points.push({x : startInt[0], y : startInt[1], ang : ang});
    }
  }
  var delay = 0;
  for (var i=0; i<fog.length; i++) {
    var fogData = fog[i];

    var x1 = fogData.x1;
    var y1 = fogData.y1;

    var x2 = fogData.x2;
    var y2 = fogData.y2;

    var r1x = fogData.x-x;
    var r1y = fogData.y-y;

    // fire one to the left and right slightly
    fireRay(x1, y1, x2, y2, r1x-0.1, r1y+0.1);

    fireRay(x1, y1, x2, y2, r1x, r1y);

    fireRay(x1, y1, x2, y2, r1x+0.1, r1y-0.1);
  }

  // sort the intersection points
  var dupeCheck = {};

  points.sort(function(a,b){
    return b.ang-a.ang;
  });

  fogFill.lineStyle(1, 0x000000, 1);
  fogFill.beginFill(0x000000, 1);

  for (var i=0; i<points.length; i++) {
    if (i == 0) {
      fogFill.moveTo(points[i].x, points[i].y);
    }
    else {
      fogFill.lineTo(points[i].x, points[i].y);
    }
  }
  fogFill.closePath();
  if (range != null) {
    var mask = new PIXI.Graphics();
    mask.x = x;
    mask.y = y;
    mask.lineStyle(3, 0x000000, 0.6);
    mask.drawCircle(0, 0, range);
    mask.lineStyle(0, 0x000000, 0);
    mask.beginFill(1, 0x000000, 1);
    mask.drawCircle(0, 0, range);
    mask.endFill();

    fogFillCont.mask = mask;
    fogFillCont.addChild(mask);
  }

  return fogFillCont;
}

boardApi.pix.rebuildFog = function(obj, app) {
  var data = obj.data;
  var hasGrid = data.gridW && data.gridW;
  var application = boardApi.pix.apps[app.attr("id")];
  var userID = app.attr("UserID") || getCookie("UserID");
  var hasRights = hasSecurity(userID, "Rights", data) || hasSecurity(userID, "Game Master");
  if (application && application.board == obj.id()) {
    var fogFill = boardApi.pix.apps[app.attr("id")].fogCache.fog;
    fogFill.clear();
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

    for (var lid in data.layers) {
      var layerData = data.layers[lid];
      var playerVision = app.attr("UserID") && !layerData.h && (!layerData._s || layerData._s.default == 1);
      var layerVisible = !layerData.h && (hasRights || hasSecurity(userID, "Visible", layerData));
      layerVisible = layerVisible || (lid == app.attr("layer"));

      for (var index in layerData.p) {
        var pieceData = layerData.p[index];
        if (boardApi.pix.apps[app.attr("id")].views[lid+"-p-"+index]) {
          boardApi.pix.apps[app.attr("id")].views[lid+"-p-"+index].destroy(true);
        }
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
              range = boardApi.pix.scale(sync.eval(auraData.d, context), obj, true);
            }
            boardApi.pix.apps[app.attr("id")].views[lid+"-p-"+index] = boardApi.pix.buildDynamicFog(obj, app, pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
          }
        }
      }

      if (playerVision || (!app.attr("UserID") && layerVisible)) {
        var reveal = layerData.r;
        for (var rID in reveal) {
          if (reveal[rID].f) {
            fogFill.beginFill(0xFFFFFF, 1);
          }
          else {
            fogFill.beginFill(0, 1);
          }
          fogFill.drawRect(reveal[rID].x, reveal[rID].y, reveal[rID].w || reveal[rID].width, reveal[rID].h || reveal[rID].height);
          fogFill.endFill();
        }
      }
    }

    if (!app.attr("UserID") && hasRights) {
      boardApi.pix.apps[app.attr("id")].fogCache.fogCont.alpha = Math.min(0.8, util.RGB_ALPHA(data.c));
      boardApi.pix.apps[app.attr("id")].opaqueRender.alpha = 0;
    }
    else {
      boardApi.pix.apps[app.attr("id")].fogCache.fogCont.alpha = Math.min(1, util.RGB_ALPHA(data.c));
      boardApi.pix.apps[app.attr("id")].opaqueRender.alpha = 1;
    }
    boardApi.pix.rebuildFogData(obj, app);
    // redraw fog from w.e position you are at
    boardApi.pix.rebuildDynamicFog(obj, app);
  }
}
