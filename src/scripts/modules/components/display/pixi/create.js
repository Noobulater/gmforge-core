boardApi.createObject = function(options, obj, app, scope) {
  var data = obj.data;
  var layer = options.layer;
  var type = options.type;
  var index = options.index;
  var objectData = options.data;
  if (!objectData && layer != null && type != null && index != null) {
    objectData = obj.data.layers[layer][type][index];
  }

  var objectWrap = new PIXI.Container();
  objectWrap.lookup = {layer : layer, type : type, index : index};

  var object = new PIXI.Container();
  objectWrap.addChild(object);

  var objectSelected = new PIXI.Container();
  objectSelected.visible = false;
  objectWrap.addChild(objectSelected);

  var outline = new PIXI.Graphics();
  var rotateHandle = new PIXI.Graphics();
  objectSelected.addChild(outline);
  objectSelected.addChild(rotateHandle);

  var handles = {
    t : {cursor : "n-resize"},
    tr : {cursor : "ne-resize"},
    r : {cursor : "e-resize"},
    br : {cursor : "be-resize"},
    b : {cursor : "b-resize"},
    bl : {cursor : "bl-resize"},
    l : {cursor : "l-resize"},
    tl : {cursor : "nl-resize"},
  };

  for (var i in handles) {
    var handleData = handles[i];
    var dragHandle = new PIXI.Graphics();
    objectSelected.addChild(dragHandle);
    dragHandle.interactive = true;
    dragHandle.buttonMode = true;
    dragHandle.cursor = handleData.cursor;
    dragHandle.axis = i;

    dragHandle.on("mouseover", function(ev){
      var layer = objectWrap.lookup.layer;
      var type = objectWrap.lookup.type;
      var index = objectWrap.lookup.index;
      var clickPos = this.toGlobal({x : this.x, y : this.y});

      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;

      var width = objectSelected.width;
      var height = objectSelected.height;

      var handlePos = {
        tr : {cursor : "ne-resize", x : width-6, y : -5},
        r : {cursor : "e-resize", x : width-6, y : height/2-6},
        br : {cursor : "se-resize", x : width-6, y : height-6},
        b : {cursor : "s-resize", x : width/2-5, y : height-6},
        bl : {cursor : "sw-resize", x : -5, y : height-6},
        l : {cursor : "w-resize", x : -5, y : height/2-6},
        tl : {cursor : "nw-resize", x : -5, y : -5},
        t : {cursor : "n-resize", x : width/2-5, y : -5},
      };
      var pData = obj.data.layers[layer][type][index];
      var keysOrigin = ["tr", "r", "br", "b", "bl", "l", "tl", "t"];
      var keys = ["tr", "r", "br", "b", "bl", "l", "tl", "t"];
      var offset = Math.floor(pData.r/45);
      for (var i=0;i<offset;i++) {
        keys.push(keys.splice(0,1)[0]);
      }
      for (var i in keys) {
        handles[keysOrigin[i]].cursor = handlePos[keys[i]].cursor;
        //handles[keysOrigin[i]].axis = keys[i];
      }

      //handles[choiceHandle].cursor = handlePos[j].cursor;
      //handles[choiceHandle].axis = j;
    });
    dragHandle.on("mousedown", function(ev){
      var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
      if (key == 1) {
        var layer = objectWrap.lookup.layer;
        var type = objectWrap.lookup.type;
        var index = objectWrap.lookup.index;
        var pieceData = obj.data.layers[layer][type][index];

        var axis = this.axis;
        function resize(ev, round) {
          var pData = obj.data.layers[layer][type][index];
          var zoom = Number(app.attr("zoom"))/100;
          var xPos = pData.x;
          var yPos = pData.y;
          var w = pData.w;
          var h = pData.h;

          var finalX;
          var finalY;
          var finalW;
          var finalH;

          var startX = boardApi.dragging.pageX;
          var startY = boardApi.dragging.pageY;
          var endX = ev.pageX;
          var endY = ev.pageY;

          var r = (pData.r || 0)/180 * (Math.PI);
          var dist = Math.sqrt((endX-startX)*(endX-startX)+(endY-startY)*(endY-startY));

          var changeX = Math.cos(r)*dist;
          var changeY = Math.sin(r)*dist;
          if (axis.match("l")) {
            var focal = objectSelected.toLocal({x : ev.pageX + w, y : ev.pageY + h});
            finalW = (w/zoom + (w/zoom-focal.x))*zoom;
            finalX = xPos + (w-finalW/zoom);
          }
          else if (axis.match("r")) {
            var focal = objectSelected.toLocal({x : ev.pageX, y : ev.pageY});
            finalW = focal.x;
          }
          if (axis.match("b")) {
            var focal = objectSelected.toLocal({x : ev.pageX, y : ev.pageY});
            finalH = focal.y;
          }
          else if (axis.match("t")) {
            var focal = objectSelected.toLocal({x : ev.pageX + w, y : ev.pageY + h});
            finalH = h/zoom + (h/zoom-focal.y)*zoom;
            finalY = yPos + (h-finalH)/zoom;
          }

          if (finalX == null) {
            finalX = xPos;
          }
          if (finalY == null) {
            finalY = yPos;
          }
          if (finalW == null) {
            finalW = w;
          }
          if (finalH == null) {
            finalH = h;
          }

          if (round && data.gridW && data.gridH) {
            finalX = Math.round(finalX/data.gridW) * data.gridW + data.gridX || 0;
            finalY = Math.round(finalY/data.gridH) * data.gridH + data.gridY || 0;
            finalW = Math.round(finalW/data.gridW) * data.gridW;
            finalH = Math.round(finalH/data.gridH) * data.gridH;
          }
          else {
            finalX = Math.round(finalX * 10) / 10;
            finalY = Math.round(finalY * 10) / 10;
            finalW = Math.round(finalW * 10) / 10;
            finalH = Math.round(finalH * 10) / 10;
          }

          return {w : Math.abs(finalW), h : Math.abs(finalH), x : finalX, y : finalY};
        }
        boardApi.newDragEvent({
          startX : pieceData.x,
          startY : pieceData.y,
          startW : pieceData.w,
          startH : pieceData.h,
          pageX : ev.data.originalEvent.pageX,
          pageY : ev.data.originalEvent.pageY,
          startObject : objectData,
          move : function(ev){
            var result = resize(ev);
            boardApi.dragging.startObject.x = result.x || boardApi.dragging.startObject.x;
            boardApi.dragging.startObject.y = result.y || boardApi.dragging.startObject.y;
            boardApi.dragging.startObject.w = result.w || boardApi.dragging.startObject.w;
            boardApi.dragging.startObject.h = result.h || boardApi.dragging.startObject.h;
            objectWrap.update(boardApi.dragging.startObject);
          },
          end : function(ev){
            var result = resize(ev, !_down[16]);
            var layer = objectWrap.lookup.layer;
            var type = objectWrap.lookup.type;
            var index = objectWrap.lookup.index;
            var pData = obj.data.layers[layer][type][index];
            pData.x = result.x || pData.x;
            pData.y = result.y || pData.y;
            pData.w = result.w || pData.w;
            pData.h = result.h || pData.h;
            objectWrap.update(pData);
            setTimeout(function(){
              objectWrap.update(pData);
              if (objectWrap.resize) {
                objectWrap.resize(ev);
              }
            }, 10);
            delete boardApi.dragging;
          }
        }, ev);
      }
      boardApi.objectClick = true;
    });
    handles[i] = dragHandle;
  }
  object.on("mouseover", function(ev){
    if ((objectWrap.canSelect && !objectWrap.canSelect(ev)) || (objectWrap.canInteract && !objectWrap.canInteract(ev))) {
      rotateHandle.visible = false;
      object.cursor = "";
    }
    else {
      rotateHandle.visible = true;
      object.cursor == "pointer";
    }
  });
  objectWrap.select = function(){
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;
    if (!objectWrap.canSelect || objectWrap.canSelect()) {
      objectSelected.visible = true;
      boardApi.selections[obj.id()+"-"+layer+"-"+type+"-"+index] = {
        layer : layer,
        index : index,
        type : type,
        board : obj.id(),
        app : app.attr("id"),
        wrap : objectWrap,
        image : object,
        selected : objectSelected
      };
    }
  }
  objectWrap.unselect = function(){
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;
    objectSelected.visible = false;
    delete boardApi.selections[obj.id()+"-"+layer+"-"+type+"-"+index];
  }
  object.on("mousedown", function(ev){
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;

    if (objectWrap.canSelect && !objectWrap.canSelect(ev)) {
      return;
    }

    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (key == 1) {
      objectWrap.update();
      if (!_down[16] && !boardApi.objectClick) {
        if (Object.keys(boardApi.selections).length <= 1) {
          for (var id in boardApi.selections) {
            boardApi.selections[id].selected.visible = false;
            delete boardApi.selections[id];
          }
        }
      }
      if (objectSelected.visible && _down[16]) {
        objectWrap.unselect();
      }
      else {
        objectWrap.select();
      }

      if (objectWrap.canInteract && !objectWrap.canInteract(ev)) {
        boardApi.newDragEvent({
          move : function(ev){},
          end : function(ev){delete boardApi.dragging},
        });
        return;
      }
      if (!boardApi.dragging) {
        var pData;
        if (layer != null && type != null && index != null) {
          pData = obj.data.layers[layer][type][index];
        }
        var offset = ev.data.getLocalPosition(objectWrap);
        var ent = getEnt(pData.eID);
        var context = sync.defaultContext();
        if (ent && ent.data) {
          context[ent.data._t] = duplicate(ent.data);
        }

        boardApi.newDragEvent({
          offsetX : offset.x,
          offsetY : offset.y,
          move : function(ev){
            if (!objectWrap.canChange || objectWrap.canChange(ev)) {
              var layer = objectWrap.lookup.layer;
              var type = objectWrap.lookup.type;
              var index = objectWrap.lookup.index;
              var stage = boardApi.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              var deltaX = focal.x-objectWrap.x-boardApi.dragging.offsetX;
              var deltaY = focal.y-objectWrap.y-boardApi.dragging.offsetY;

              if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
                boardApi.dragging.dragged = true;
                layout.coverlay($(".piece-quick-edit"));
              }

              for (var key in boardApi.selections) {
                if (boardApi.selections[key].type == type) {
                  if (!boardApi.selections[key].wrap.canChange || boardApi.selections[key].wrap.canChange()) {
                    boardApi.selections[key].wrap.x += deltaX;
                    boardApi.selections[key].wrap.y += deltaY;
                  }
                  else {
                    boardApi.selections[key].wrap.unselect();
                  }
                }
              }
              // disabled until more optimized solution can be found
              if (false && boardApi.fog[obj.id()] && boardApi.fog[obj.id()].length < 800 && obj.data.options.fog) {
                if (type == "p" && pData.eID && hasSecurity(getCookie("UserID"), "Visible", getEnt(pData.eID).data)) {
                  var range;
                  if (pData.eID && pData.o && pData.o.Sight) {
                    var auraData = pData.o.Sight;
                    range = boardApi.scale(sync.eval(auraData.d, context), obj, true);
                  }
                  boardApi.apps[app.attr("id")].views[layer+"-"+type+"-"+index] = boardApi.buildDynamicFog(obj, app, objectWrap.x + pData.w/2, objectWrap.y + pData.h/2, range);
                  boardApi.rebuildDynamicFog(obj, app);
                }
              }
            }
          },
          end : function(ev){
            var layer = objectWrap.lookup.layer;
            var type = objectWrap.lookup.type;
            var index = objectWrap.lookup.index;
            var stage = boardApi.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            if (!pData) {
              delete boardApi.dragging;
              return;
            }
            var isHex = obj.data.options && obj.data.options.hex;
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            var offsetX = boardApi.dragging.offsetX;
            var offsetY = boardApi.dragging.offsetY;
            if (data.gridW) {
              offsetX = boardApi.dragging.offsetX%(data.gridW);
            }
            if (data.gridH) {
              offsetY = boardApi.dragging.offsetY%(data.gridH);
            }

            var finalX = objectWrap.x+offsetX;
            var finalY = objectWrap.y+offsetY;
            var now = Date.now();
            if (!boardApi.dragging.dragged || (objectWrap.canChange && !objectWrap.canChange(ev))) {
              if (!object._doubleClicked) {
                if (objectWrap.onclick) {
                  objectWrap.onclick(ev);
                }
                object._doubleClicked = now;
              }
              else {
                if (object._doubleClicked && object._doubleClicked + 650 >= now && objectWrap.dblclick) {
                  objectWrap.dblclick(ev);
                }
                if (object._doubleClicked + 650 < now && objectWrap.onclick) {
                  objectWrap.onclick(ev);
                }
                delete object._doubleClicked;
              }
            }
            else if (Math.abs(finalX-pData.x) > 1 && Math.abs(finalY-pData.y) > 1) {
              if (!_down[16] && data.gridW && data.gridH) {
                if (isHex) {
                  var xGrid = Math.floor((finalX - (data.gridX || 0))/(data.gridW * 0.75));
                  var yGrid;

                  finalX = (xGrid * data.gridW + (data.gridX || 0) - (xGrid * data.gridW + (data.gridX || 0))/4);
                  if (xGrid % 2) {
                    yGrid = Math.floor((finalY - (data.gridY || 0) - data.gridH/2)/data.gridH);
                    finalY = (yGrid * data.gridH + (data.gridY || 0) + data.gridH/2);
                  }
                  else {
                    yGrid = Math.floor((finalY - (data.gridY || 0))/data.gridH);
                    finalY = (yGrid * data.gridH + (data.gridY || 0));
                  }
                }
                else {
                  var xGrid = Math.floor((finalX - (data.gridX || 0))/data.gridW);
                  var yGrid = Math.floor((finalY - (data.gridY || 0))/data.gridH);
                  finalX = (xGrid * data.gridW + (data.gridX || 0));
                  finalY = (yGrid * data.gridH + (data.gridY || 0));
                }
              }
              else {
                finalX -= offsetX;
                finalY -= offsetY;
              }

              var deltaX = pData.x - finalX;
              var deltaY = pData.y - finalY;
              // changed
              for (var key in boardApi.selections) {
                var selectData = boardApi.selections[key];
                if (selectData.type == type) {
                  obj.data.layers[selectData.layer][selectData.type][selectData.index].x -= deltaX;
                  obj.data.layers[selectData.layer][selectData.type][selectData.index].y -= deltaY;
                  selectData.wrap.x = obj.data.layers[selectData.layer][selectData.type][selectData.index].x;
                  selectData.wrap.y = obj.data.layers[selectData.layer][selectData.type][selectData.index].y;
                  if (selectData.wrap.move) {
                    selectData.wrap.move(ev, deltaX, deltaY);
                  }
                  var pieceData = obj.data.layers[selectData.layer][selectData.type][selectData.index];
                  if (boardApi.fog[obj.id()] && boardApi.fog[obj.id()].length) {
                    if (selectData.type == "p" && pieceData.eID) {
                      var ent = getEnt(pieceData.eID);
                      var userID = app.attr("UserID") || getCookie("UserID");
                      var hasRights = hasSecurity(userID, "Rights", obj.data) || hasSecurity(userID, "Game Master");
                      if (ent && ent.data._t == "c" && (hasRights || hasSecurity(userID, "Visible", ent.data))) {
                        var range;
                        if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                          var auraData = pieceData.o.Sight;
                          range = boardApi.scale(sync.eval(auraData.d, context), obj, true);
                        }
                        boardApi.apps[app.attr("id")].views[selectData.layer+"-"+selectData.type+"-"+selectData.index] = boardApi.buildDynamicFog(obj, app, selectData.wrap.x + pieceData.w/2, selectData.wrap.y + pieceData.h/2, range);
                        boardApi.rebuildDynamicFog(obj, app);
                      }
                    }
                  }
                }
              }
            }
            delete boardApi.dragging;
          }
        }, ev);
      }
    }
    boardApi.objectClick = true;
  });
  object.on("mouseup", function(ev){});
  object.on("mouseupoutside", function(ev){});
  rotateHandle.on("mousedown", function(ev){
    layout.coverlay($(".piece-quick-edit"));
    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (key == 1) {
      boardApi.newDragEvent({
        move : function(ev){
          var xPos = ev.pageX;
          var yPos = ev.pageY;

          for (var key in boardApi.selections) {
            var selectData = boardApi.selections[key];
            var focal = selectData.image.toGlobal({x : selectData.selected.width/2-5, y : selectData.selected.height/2});

            var angle = Math.atan2(focal.y - yPos, focal.x - xPos);
            selectData.image.rotation = angle - Math.PI / 2;
            selectData.selected.rotation = angle - Math.PI / 2;
          }
        },
        end : function(ev){
          var xPos = ev.pageX;
          var yPos = ev.pageY;

          for (var key in boardApi.selections) {
            var selectData = boardApi.selections[key];
            var focal = selectData.image.toGlobal({x : selectData.selected.width/2-5, y : selectData.selected.height/2});

            var angle = Math.atan2(focal.y - yPos, focal.x - xPos);
            if (!_down[16]) {
              angle = Math.round((angle/Math.PI * 180) / 45) * 45 * Math.PI / 180
            }
            selectData.image.rotation = angle - Math.PI / 2;
            selectData.selected.rotation = angle - Math.PI / 2;

            var newData = obj.data.layers[selectData.layer][selectData.type][selectData.index];
            newData.r = (angle * 180/Math.PI + 270)%360;
            if (selectData.wrap.rotate) {
              selectData.wrap.rotate(ev);
            }
            selectData.wrap.update();
          }

          delete boardApi.dragging;
        }
      }, ev);
    }
    boardApi.objectClick = true;
  });


  objectWrap.update = function(objectData) {
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;
    if (!objectData && layer != null && type != null && index != null) {
      objectData = obj.data.layers[layer][type][index];
    }
    if (objectData) {
      var width = objectData.w;
      var height = objectData.h;

      objectWrap.x = objectData.x;
      objectWrap.y = objectData.y;

      object.x = objectData.w/2;
      object.y = objectData.h/2;
      object.pivot.x = objectData.w/2;
      object.pivot.y = objectData.h/2;
      object.rotation = (objectData.r || 0)/180 * (Math.PI);
      if (layer != null && type != null && index != null && (!objectData.v || !objectData.l || app.attr("layer") == layer)) {
        object.hitArea = new PIXI.Rectangle(0, 0, objectData.w, objectData.h);
        object.interactive = true;
        object.buttonMode = true;
      }
      else {
        object.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
      }

      objectSelected.rotation = (objectData.r || 0)/180 * (Math.PI);

      objectSelected.x = objectData.w/2;
      objectSelected.y = objectData.h/2;
      objectSelected.pivot.x = objectData.w/2;
      objectSelected.pivot.y = objectData.h/2;

      outline.clear();
      outline.beginFill(0x000000, 0);
      outline.lineStyle(4, 0xFF8a42, 1);
      outline.drawRect(0, 0, objectData.w, objectData.h);
      outline.endFill();

      var zoom = Number(app.attr("zoom"))/100;
      rotateHandle.clear();
      rotateHandle.beginFill(0xFFFFFF);
      rotateHandle.lineStyle(2/zoom, 0xFF0000, 0.5);
      rotateHandle.drawCircle(8/zoom, 0, 8/zoom);
      rotateHandle.endFill();
      rotateHandle.x = objectData.w/2 - 6/zoom;
      rotateHandle.y = -25/zoom;
      rotateHandle.width = 13/zoom;
      rotateHandle.height = 13/zoom;
      rotateHandle.interactive = true;
      rotateHandle.buttonMode = true;

      var size = Math.min(11,width/3)/zoom;
      var handlePos = {
        tr : {cursor : "ne-resize", x : width-size/2, y : -size/2},
        r : {cursor : "e-resize", x : width-size/2, y : height/2-size/2},
        br : {cursor : "se-resize", x : width-size/2, y : height-size/2},
        b : {cursor : "s-resize", x : width/2-size/2, y : height-size/2},
        bl : {cursor : "sw-resize", x : -size/2, y : height-size/2},
        l : {cursor : "w-resize", x : -size/2, y : height/2-size/2},
        tl : {cursor : "nw-resize", x : -size/2, y : -size/2},
        t : {cursor : "n-resize", x : width/2-size/2, y : -size/2},
      };

      for (var i in handlePos) {
        var dragHandle = handles[i];
        dragHandle.x = handlePos[i].x;
        dragHandle.y = handlePos[i].y;
        dragHandle.clear();
        dragHandle.beginFill(0xFFFFFF);
        dragHandle.lineStyle(1/zoom, 0xFF0000, 0.5);
        dragHandle.drawRoundedRect(0, 0, size, size, 2);
        dragHandle.endFill();
        dragHandle.cursor = handlePos[i].cursor;
        if (objectData.r || (objectData.lookup && objectData.lookup.type == "d") || !hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
          dragHandle.visible = false;
        }
        else {
          var zoom = Number(app.attr("zoom"))/100;
          if (zoom != 1 && (i != "r" && i != "br" && i != "b")) {
            dragHandle.visible = false;
          }
          else {
            dragHandle.visible = true;
          }
        }
      }
      if (objectWrap.rebuild) {
        objectWrap.rebuild(objectData);
      }
    }
  }
  objectWrap.animate = function(endData, startData, time) {
    var time = time || 1;
    if (boardApi.apps[app.attr("id")] && boardApi.apps[app.attr("id")].stage) {
      if (objectWrap.animating) {
        objectWrap.update();
        boardApi.apps[app.attr("id")].ticker.remove(objectWrap.animating);
      }
      if (!objectWrap.start) {
        if (startData) {
          objectWrap.start = startData;
        }
        else {
          var layer = objectWrap.lookup.layer;
          var type = objectWrap.lookup.type;
          var index = objectWrap.lookup.index;
          objectWrap.start = duplicate(obj.data.layers[layer][type][index]);
          objectWrap.start.x = objectWrap.x;
          objectWrap.start.y = objectWrap.y;
        }
      }
      if (!endData) {
        var layer = objectWrap.lookup.layer;
        var type = objectWrap.lookup.type;
        var index = objectWrap.lookup.index;
        endData = obj.data.layers[layer][type][index];
      }
      // sanitize the data;
      objectWrap.start.x = objectWrap.start.x || 0;
      objectWrap.start.y = objectWrap.start.y || 0;
      objectWrap.start.w = objectWrap.start.w || 0;
      objectWrap.start.h = objectWrap.start.h || 0;
      objectWrap.start.r = objectWrap.start.r || 0;

      var endData = duplicate(endData);
      endData.x = (endData.x!=null)?(endData.x):(objectWrap.start.x);
      endData.y = (endData.y!=null)?(endData.y):(objectWrap.start.y);
      endData.w = (endData.w!=null)?(endData.w):(objectWrap.start.w);
      endData.h = (endData.h!=null)?(endData.h):(objectWrap.start.h);
      endData.r = (endData.r!=null)?(endData.r):(objectWrap.start.r);

      objectWrap.force = Date.now() + time * 1000;
      objectWrap.duration = time;
      objectWrap.end = endData;
      objectWrap.animating = function(delta) {
        if (objectWrap.animating) {
          var sX = objectWrap.start.x;
          var sY = objectWrap.start.y;
          var sW = objectWrap.start.w;
          var sH = objectWrap.start.h;
          var sR = objectWrap.start.r;
          var eX = objectWrap.end.x;
          var eY = objectWrap.end.y;
          var eW = objectWrap.end.w;
          var eH = objectWrap.end.h;
          var eR = objectWrap.end.r;
          var vel = {
            x : (endData.x-objectWrap.start.x),
            y : (endData.y-objectWrap.start.y),
            w : (endData.w-objectWrap.start.w),
            h : (endData.h-objectWrap.start.h),
            r : endData.r-objectWrap.start.r,
          };

          var diff = endData.r-objectWrap.start.r;
          var change = Math.min(360-Math.abs(diff), Math.abs(diff));
          if (change <= 180) {
            if (diff >= 0) {
              vel.r = change;
            }
            else {
              vel.r = change*-1;
            }
          }
          else {
            vel.r = (change-180);
          }

          var now = Date.now();
          if ((objectWrap.force && objectWrap.force > now)) {
            var percentage = Math.max((objectWrap.force-now)/1000/time, 0);
            objectWrap.start.x = objectWrap.end.x - vel.x * percentage;
            objectWrap.start.y = objectWrap.end.y - vel.y * percentage;
            objectWrap.start.w = objectWrap.end.w - vel.w * percentage;
            objectWrap.start.h = objectWrap.end.h - vel.h * percentage;
            objectWrap.start.r = objectWrap.end.r - vel.r * percentage;
            objectWrap.update(objectWrap.start);
          }
          if (objectWrap.force <= now) {
            // finish the animation
            objectWrap.update(objectWrap.end);
            boardApi.apps[app.attr("id")].ticker.remove(objectWrap.animating);
            delete objectWrap.force;
            delete objectWrap.end;
            delete objectWrap.duration;
            delete objectWrap.start;
            delete objectWrap.animating;
          }
        }
      }
      boardApi.apps[app.attr("id")].ticker.add(objectWrap.animating);
    }
  }
  objectWrap.update(options.objectData);
  return objectWrap;
}

boardApi.createDrawing = function(options, obj, app, scope) {
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var objectData = options.data;
  options.type = "d";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var pieceWrap = boardApi.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};

  pieceWrap.canSelect = function(ev){
    return pieceWrap.canInteract(ev);
  }

  pieceWrap.canInteract = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer][type][index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
      return false;
    }
    if (app.attr("background")) {
      return false;
    }
    if ((hasRights || objectData.uID == getCookie("UserID")) && app.attr("layer") == layer ) {
      return true;
    }
    return false;
  }
  pieceWrap.resize = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer][type][index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");

    if ((hasRights || objectData.uID == getCookie("UserID")) && !floatingTile) {
      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }
  pieceWrap.rotate = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer][type][index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");

    if ((hasRights || objectData.uID == getCookie("UserID")) && !floatingTile) {
      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }
  pieceWrap.move = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer][type][index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if ((hasRights || objectData.uID == getCookie("UserID")) && !floatingTile) {
      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }

  var piece = pieceWrap.children[0];
  var pieceSelected = pieceWrap.children[1];
  var outline = pieceSelected.children[0];

  pieceWrap.rebuild = function(objectData) {
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    if (!objectData && layer != null && index != null) {
      objectData = obj.data.layers[layer][type][index];
    }

    var x = objectData.x;
    var y = objectData.y;
    var width = Math.max(10, objectData.w);
    var height = Math.max(10, objectData.h);

    var recreate = false;
    if (piece.children && piece.children.length && piece.children[0]) {
      if (piece.children[0].drawing != objectData.drawing) {
        piece.children[0].destroy(true);
        recreate = true;
      }
    }
    else {
      recreate = true;
    }

    var token;
    if (objectData.drawing == "free") {
      if (recreate) {
        token = new PIXI.Sprite.fromImage(objectData.i);
        piece.addChild(token);
      }
      else {
        token = piece.children[0];
      }
      token.width = width;
      token.height = height;
    }
    else if (objectData.drawing == "box") {
      if (objectData.i) {
        var mask;
        if (recreate) {
          var text = new PIXI.Texture.fromImage(objectData.i);
          token = new PIXI.TilingSprite(text, objectData.w, objectData.h);
          token.drawing = objectData.drawing;
          piece.addChild(token);

          mask = new PIXI.Graphics();
          piece.addChild(mask);
        }
        else {
          token = piece.children[0];
          mask = piece.children[1];
        }

        mask.clear();
        mask.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        mask.lineStyle(objectData.ls || 2, util.RGB_HEX(objectData.c2), util.RGB_ALPHA(objectData.c2));
        mask.drawRect(0, 0, objectData.w, objectData.h);
        mask.endFill();
        mask.w = width;
        mask.h = height;
        token.mask = mask;
      }
      else {
        if (recreate) {
          token = new PIXI.Graphics();
          piece.addChild(token);
        }
        else {
          token = piece.children[0];
        }
        token.clear();
        token.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        token.lineStyle(objectData.ls || 2, util.RGB_HEX(objectData.c2), util.RGB_ALPHA(objectData.c2));
        token.drawRect(0, 0, objectData.w, objectData.h);
        token.endFill();
        token.w = width;
        token.h = height;
      }
    }
    else if (objectData.drawing == "line") {
      if (recreate) {
        token = new PIXI.Graphics();
        piece.addChild(token);
      }
      else {
        token = piece.children[0];
      }
      token.clear();
      token.lineStyle(objectData.ls || 3, util.RGB_HEX(objectData.c1 || objectData.c2), util.RGB_ALPHA(objectData.c1 || objectData.c2));
      token.moveTo(objectData.x1, objectData.y1);
      token.lineTo(objectData.x2, objectData.y2);
    }
    else if (objectData.drawing == "circle") {
      if (objectData.i) {
        var mask;
        if (recreate) {
          var text = new PIXI.Texture.fromImage(objectData.i);
          token = new PIXI.TilingSprite(text, objectData.w, objectData.h);
          token.drawing = objectData.drawing;
          piece.addChild(token);

          mask = new PIXI.Graphics();
          token.mask = mask;
          piece.addChild(mask);
        }
        else {
          token = piece.children[0];
          mask = piece.children[1];
        }

        mask.clear();
        mask.lineStyle(objectData.ls || 3, util.RGB_HEX(objectData.c2), util.RGB_ALPHA(objectData.c2));
        mask.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        mask.drawCircle(objectData.radius,objectData.radius,objectData.radius);
        mask.endFill();
      }
      else {
        if (recreate) {
          token = new PIXI.Graphics();
          piece.addChild(token);
        }
        else {
          token = piece.children[0];
        }
        token.clear();
        token.lineStyle(objectData.ls || 3, util.RGB_HEX(objectData.c2), util.RGB_ALPHA(objectData.c2));
        token.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        token.drawCircle(objectData.radius,objectData.radius,objectData.radius);
        token.endFill();
      }
    }
    else if (objectData.drawing == "text") {
      if (recreate) {
        token = new PIXI.Text(null, new PIXI.TextStyle(objectData.style || boardApi.fonts.default));
        piece.addChild(token);
      }
      else {
        token = piece.children[0];
      }
      if (JSON.stringify(token.style) != JSON.stringify(objectData.style)) {
        token.style = objectData.style;
        token.dirty = true;
      }
      token.text = objectData.text;
    }
    else if (objectData.drawing == "region") {
      if (objectData.i) {
        var mask;
        if (recreate) {
          var text = new PIXI.Texture.fromImage(objectData.i);
          token = new PIXI.TilingSprite(text, objectData.w, objectData.h);
          token.drawing = objectData.drawing;
          piece.addChild(token);

          mask = new PIXI.Graphics();
          piece.addChild(mask);
        }
        else {
          token = piece.children[0];
          mask = piece.children[1];
        }

        mask.clear();
        mask.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        mask.lineStyle(objectData.ls || 3, util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        mask.moveTo(objectData.regions[0].x-objectData.x, objectData.regions[0].y-objectData.y);
        for (var i=1; i<objectData.regions.length; i++) {
          var regionData = objectData.regions[i];
          mask.lineTo(objectData.regions[i].x-objectData.x, objectData.regions[i].y-objectData.y);
        }
        mask.lineTo(objectData.regions[0].x-objectData.x, objectData.regions[0].y-objectData.y);
        mask.closePath();
        mask.endFill();
        token.mask = mask;
      }
      else {
        if (recreate) {
          token = new PIXI.Graphics();
          piece.addChild(token);
        }
        else {
          token = piece.children[0];
        }
        token.clear();
        token.beginFill(util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        token.lineStyle(objectData.ls || 3, util.RGB_HEX(objectData.c1), util.RGB_ALPHA(objectData.c1));
        token.moveTo(objectData.regions[0].x-objectData.x, objectData.regions[0].y-objectData.y);
        for (var i=1; i<objectData.regions.length; i++) {
          var regionData = objectData.regions[i];
          token.lineTo(objectData.regions[i].x-objectData.x, objectData.regions[i].y-objectData.y);
        }
        token.lineTo(objectData.regions[0].x-objectData.x, objectData.regions[0].y-objectData.y);
        token.closePath();
        token.endFill();
      }
    }
  }
  pieceWrap.update(options.data);
  return pieceWrap;
}

boardApi.createTile = function(options, obj, app, scope){
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;

  options.type = "t";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var pieceWrap = boardApi.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};
  pieceWrap.tileData = duplicate(options.data);

  pieceWrap.canSelect = function(ev){
    return pieceWrap.canInteract(ev);
  }

  pieceWrap.canInteract = function(ev){
    if (!pieceWrap.lookup || pieceWrap.lookup.layer == null || pieceWrap.lookup.type == null || pieceWrap.lookup.index == null) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer][type][index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
      return false;
    }
    if (hasRights && app.attr("background") && !floatingTile) {
      return true;
    }
    return false;
  }

  pieceWrap.resize = function(){
    pieceWrap.rebuild(null, true);
  }

  var piece = pieceWrap.children[0];
  var pieceSelected = pieceWrap.children[1];
  var outline = pieceSelected.children[0];

  pieceWrap.rebuild = function(tileData, rebuild) {
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    if (!tileData && layer != null && index != null) {
      tileData = obj.data.layers[layer].t[index];
    }
    var x = tileData.x;
    var y = tileData.y;
    var width = Math.max(10, tileData.w);
    var height = Math.max(10, tileData.h);
    if (rebuild || !piece.children || piece.children.length == 0) {
      for (var i in piece.children) {
        piece.children[i].visible = false;
      }

      var sheetData = data.sheets[tileData.s];
      if (sheetData) {
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
        var sX = (tileData.i % xGrid) * tileW / aspectW;
        var sY = Math.floor(tileData.i / xGrid) * tileH / aspectH;
        var sW = Math.min(((tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p) / aspectW, sheetData.w);
        var sH = Math.min(((tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p) / aspectH, sheetData.h);

        var texture = new PIXI.Texture(PIXI.loader.resources[sheetData.i].texture);
        if (sX + sW > texture.baseTexture.width) {
          sW = sW - ((sX + sW)-texture.baseTexture.width);
        }
        if ((sY + sH) > texture.baseTexture.height) {
          sH = sH - ((sY + sH)-texture.baseTexture.height);
        }
        texture.frame = new PIXI.Rectangle(sX, sY, sW, sH);

        if (tileData.t && (width >= (data.gridW || width) && height >= (data.gridH || height)) && !(isHex)) {
          piece.width = width;
          piece.height = height;
          var tileX = (tileData.gW || 1) * sheetData.gW + ((tileData.gW || 1)-1) * sheetData.p;
          var tileY = (tileData.gH || 1) * sheetData.gH + ((tileData.gH || 1)-1) * sheetData.p;
          var gridX = Math.floor((width || data.gridW)/tileX);
          var gridY = Math.floor((height || data.gridH)/tileY);
          var widthT = (tileX || width || data.gridW);
          var heightT = (tileY || height || data.gridH);
          for (var x=0; x<gridX; x++) {
            for (var y=0; y<gridY; y++) {
              var token = new PIXI.Sprite(texture);
              token.x = (x * widthT);
              token.y = (y * heightT);
              token.width = tileX;
              token.height = tileY;

              piece.addChild(token);
            }
          }
        }
        else {
          var token = new PIXI.Sprite(texture);
          token.scale.x = width/sW;
          token.scale.y = height/sH;
          piece.x = width/2;
          piece.y = height/2;
          piece.width = width;
          piece.height = height;
          piece.pivot.x = width/2;
          piece.pivot.y = height/2;

          piece.addChild(token);
        }
        for (var i in piece.children) {
          if (!piece.children[i].visible) {
            piece.children[i].destroy();
          }
        }
      }
    }
  }
  pieceWrap.update(options.data);
  return pieceWrap;
}

boardApi.drawShape = function(objectData, stand, lineStyle, isHex){
  if (objectData.d == null || objectData.d == 0) {
    var sX = 0;
    var sY = 0;
    if (isHex) {
      stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
      stand.moveTo(sX + 0, sY + objectData.h/2);
      stand.lineTo(sX + objectData.w * 1/4, sY + 0);
      stand.lineTo(sX + objectData.w * 3/4, sY + 0);
      stand.lineTo(sX + objectData.w-0, sY + objectData.h/2);
      stand.lineTo(sX + objectData.w * 3/4, sY + objectData.h-0);
      stand.lineTo(sX + objectData.w * 1/4, sY + objectData.h-0);
      stand.lineTo(sX + 0, sY + objectData.h/2);
      stand.endFill();
    }
    else {
      stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
      stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
      stand.drawRect(1, 1, objectData.w-1, objectData.h-1);
      stand.endFill();
    }
  }
  else if (objectData.d == 1) {
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawRoundedRect(1, 1, objectData.w-1, objectData.h-1, Math.min(objectData.w, objectData.h)*0.1);
    stand.endFill();
  }
  else if (objectData.d == 2) {
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawEllipse(objectData.w/2-1, objectData.h/2-1, objectData.w/2-1, objectData.h/2-1);
    stand.endFill();
  }
  else if (objectData.d == 3) {
    var path = [
      0, 0,
      objectData.w, 0,
      objectData.w/2, objectData.h,
      0, 0
    ];
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawPolygon(path);
    stand.endFill();
  }
  else if (objectData.d == 4) {
    var path = [
      objectData.w/2, 0,
      0, objectData.h,
      objectData.w, objectData.h,
      objectData.w/2, 0
    ];
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawPolygon(path);
    stand.endFill();
  }
  else if (objectData.d == 5) {
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawStar(objectData.w/2,objectData.h/2,5,objectData.w/2,objectData.w/4);
    stand.endFill();
  }
  else if (objectData.d == 6) {
    var path = [
      objectData.w/2, 0,
      objectData.w, objectData.h * 2/5,
      objectData.w * 4/5, objectData.h,
      objectData.w * 1/5, objectData.h,
      0, objectData.h * 2/5,
      objectData.w/2, 0,
    ];
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawPolygon(path);
    stand.endFill();
  }
  else if (objectData.d == 7) {
    var path = [
      objectData.w * 5/7, 0,
      objectData.w, objectData.h * 3/6,
      objectData.w * 5/7, objectData.h,
      objectData.w * 2/7, objectData.h,
      0, objectData.h * 3/6,
      objectData.w * 2/7, 0,
      objectData.w * 5/7, 0,
    ];
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawPolygon(path);
    stand.endFill();
  }
  else if (objectData.d == 9) {
    var path = [
      objectData.w * 4/6, 0,
      objectData.w, objectData.h * 2/6,
      objectData.w, objectData.h * 4/6,
      objectData.w * 4/6, objectData.h,
      objectData.w * 2/6, objectData.h,
      0, objectData.h * 4/6,
      0, objectData.h * 2/6,
      objectData.w * 2/6, 0,
      objectData.w * 4/6, 0,
    ];
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawPolygon(path);
    stand.endFill();
  }
}

boardApi.createPiece = function(options, obj, app, scope){
  if (options.data == null) {
    console.error("null value");
  }
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var objectData = options.data;
  options.type = "p";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var pieceWrap = boardApi.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};
  pieceWrap.canSelect = function(){
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if (_down[17] || (objectData.l && app.attr("layer") != layer)) {
      return false;
    }

    if (objectData.eID || hasRights) {
      return true;
    }
    return false;
  };

  pieceWrap.canInteract = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if (_down[17] || (objectData.l && app.attr("layer") != layer)) {
      return false;
    }
    if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
      return false;
    }

    if (app.attr("background")) {
      return false;
    }

    if (objectData.l && app.attr("layer") != layer) {
      return false;
    }

    if (hasRights) {
      return true;
    }
    var ent = getEnt(objectData.eID);
    if ((hasSecurity(getCookie("UserID"), "Rights", obj.data) || (ent && (ent.data._t == "b" || hasSecurity(getCookie("UserID"), "Rights", ent.data)))) && !floatingTile) {
      return true;
    }

    return false;
  }
  pieceWrap.canChange = function(){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");

    if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing) {
      return false;
    }

    if (app.attr("background")) {
      return false;
    }

    if (objectData.l && app.attr("layer") != layer) {
      return false;
    }

    if (hasRights) {
      return true;
    }
    var ent = getEnt(objectData.eID);
    if ((hasSecurity(getCookie("UserID"), "Rights", obj.data) || (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) && !floatingTile) {
      return true;
    }

    return false;
  }

  pieceWrap.resize = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var ent = getEnt(objectData.eID);
    if ((hasSecurity(getCookie("UserID"), "Rights", obj.data) || (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) && !floatingTile) {
      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }
  pieceWrap.rotate = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var ent = getEnt(objectData.eID);
    if ((hasSecurity(getCookie("UserID"), "Rights", obj.data) || (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) && !floatingTile) {
      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }
  pieceWrap.move = function(ev, deltaX, deltaY){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var ent = getEnt(objectData.eID);
    if ((hasSecurity(getCookie("UserID"), "Rights", obj.data) || (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) && !floatingTile) {
      if (!hasSecurity(getCookie("UserID"), "Rights", obj.data) && !obj.data.options.noCollide && obj.data.options.fog) {
        var endX = objectData.x + objectData.w/2;
        var endY = objectData.y + objectData.h/2;

        var startX = endX + deltaX;
        var startY = endY + deltaY;
        var moveDist = util.dist(startX, endX, startY, endY);

        var fog = duplicate(boardApi.fog[obj.id()]);
        fog.splice(0,8); // get rid of the boundries
        for (var i in fog) {
          if (util.intersectLine(fog[i].x1, fog[i].y1, fog[i].x2, fog[i].y2, startX, startY, endX, endY)) {
            if (!$("#wall-warning").length) {
              sendAlert({text : "You can't move through walls!", id : "wall-warning"});
            }
            obj.data.layers[layer].p[index].x = startX - objectData.w/2;
            obj.data.layers[layer].p[index].y = startY - objectData.h/2;
            pieceWrap.update();

            runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : duplicate(obj.data.layers[layer].p[index])});
            return false;
          }
        }
      }

      if (Object.keys(boardApi.triggers.cache[obj.id()]).length && objectData && !objectData.e) {
        var oldX = objectData.x + deltaX;
        var oldY = objectData.y + deltaY;

        var midX = objectData.x + objectData.w/2;
        var midY = objectData.y + objectData.h/2;

        var ctx = sync.defaultContext();
        ctx[obj.data._t] = {layers : {}};
        for (var lid in obj.data.layers) {
          ctx[obj.data._t].layers[lid] = {h : obj.data.layers[lid].h};
        }
        for (var k in boardApi.triggers.cache[obj.id()]) {
          var triggered = [];
          var tP = boardApi.triggers.cache[obj.id()][k];
          if ((tP.layer != layer || tP.index != index) && obj.data.layers[tP.layer]) {
            tP = obj.data.layers[tP.layer].p[tP.index];
            if (tP) {
              if (tP.e.t > 1) {
                if (tP.e.t == 2 && (tP.x < midX && tP.x + tP.w > midX && tP.y < midY && tP.y + tP.h > midY)) { // pressure plate
                  triggered.push(duplicate(boardApi.triggers.cache[obj.id()][k]));
                }
                else if ((tP.e.t == 3)) { // trip wire
                  if (!(tP.x < oldX + objectData.w/2 && tP.x + tP.w > oldX + objectData.w/2 && tP.y < oldY + objectData.h/2 && tP.y + tP.h > oldY + objectData.h/2)) {
                    if (util.intersectBox(oldX + objectData.w/2, oldY + objectData.h/2, midX, midY, tP.x, tP.y, tP.w, tP.h)) {
                      triggered.push(duplicate(boardApi.triggers.cache[obj.id()][k]));
                    }
                  }
                }
              }
              if (triggered.length) {
                var tLayer = boardApi.triggers.cache[obj.id()][k].layer;
                var tIndex = boardApi.triggers.cache[obj.id()][k].index;
                boardApi.triggers.flush[obj.id()][tLayer+"-"+tIndex] = function(k) {
                  var tP = boardApi.triggers.cache[obj.id()][k];
                  if (obj.data.layers[tP.layer]) {
                    tP = obj.data.layers[tP.layer].p[tP.index];
                    if (tP) {
                      for (var cID in tP.e.calc) {
                        var calcData = tP.e.calc[cID];
                        if (calcData) {
                          if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                            if (util.events[calcData.e] && util.events[calcData.e].fire) { // equation
                              util.events[calcData.e].fire(obj, app, calcData, tP, ctx);
                            }
                            else {
                              var val = sync.eval(calcData.eq, ctx);
                              var target = sync.traverse(obj.data, calcData.target);
                              if (target instanceof Object) {
                                sync.rawVal(target, val);
                              }
                              else {
                                sync.traverse(obj.data, calcData.target, val);
                              }
                              if (calcData.target.match("layers\.")) {
                                boardApi.updateLayer(calcData.target.split(".")[1], null, obj);
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
          }
        }
      }

      runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : objectData});
      return true;
    }
    return false;
  }
  pieceWrap.onclick = function(ev) {
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var pieceData = obj.data.layers[layer].p[index];

    var point = pieceWrap.toGlobal({x : pieceSelected.width/2-5, y : 0});
    var ent = getEnt(pieceData.eID);
    if (Object.keys(boardApi.selections).length == 1 && $(".piece-quick-edit").length == 1 && $(".piece-quick-edit-app").attr("idstr") == obj.id()+"-"+layer+"-p-"+index) {
      if (!game.locals["drawing"] || !game.locals["drawing"].data || game.locals["drawing"].data.target != app.attr("id") || !game.locals["drawing"].data.drawing) {
        if (!pieceData.eID) {
          var content = sync.render("ui_assetPicker")(obj, app, {
            rights : "Visible",
            select : function(ev, ui, ent, options){
              obj.data.layers[layer].p[index].eID = ent.id();
              if (ent.data.info && ent.data.info.img) {
                if (ent.data.info.img.min) {
                  obj.data.layers[layer].p[index].i = ent.data.info.img.min;
                }
              }
              layout.coverlay("add-asset");
              runCommand("boardMove", {id : obj.id(), layer : layer, type : "p", index : index, data : obj.data.layers[layer].p[index]});
              boardApi.updateObject(layer, "p", index, obj);
              ev.stopPropagation();
              ev.preventDefault();
            }
          });
          var popOut = ui_popOut({
            target : $("body"),
            prompt : true,
            id : "add-asset",
            title : "Change Link",
            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
          }, content);
          popOut.resizable();
        }
        else if (ent && ent.data && hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          assetTypes[ent.data._t].preview(ent, $(".piece-quick-edit"));
          layout.coverlay($(".piece-quick-edit"));
        }
      }
      return;
    }
    if ($(".piece-quick-edit").length == 0 || $(".piece-quick-edit-app").attr("layer") != layer || $(".piece-quick-edit-app").attr("piece") != index || $(".piece-quick-edit-app").attr("board") != obj.id()) {
      if ((pieceWrap.canChange && !pieceWrap.canChange(ev)) || (Object.keys(boardApi.selections).length == 1 && Object.keys(boardApi.selections)[0] == obj.id()+"-"+layer+"-p-"+index)) {
        if (game.locals["pieceBuilding"] && game.locals["pieceBuilding"].data) {
          if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
            game.locals["pieceBuilding"].data.layer = layer;
            game.locals["pieceBuilding"].data.piece = index;
            game.locals["pieceBuilding"].update();
          }
        }
        //boardApi.drawThreats(board, true);
        //board.drawLayers();
        layout.coverlay($(".piece-quick-edit"));

        var content = sync.newApp("ui_pieceQuickEdit");
        content.addClass("piece-quick-edit-app");
        content.attr("board", obj.id());
        content.attr("layer", layer);
        content.attr("piece", index);
        content.attr("idstr", obj.id()+"-"+layer+"-p-"+index);
        content.attr("zoom", app.attr("zoom"));
        content.attr("targetApp", app.attr("id"));
        content.css("outline", "none");
        obj.addApp(content);

        var popout = ui_popOut({
          target : app,
          id : "piece-popout-"+obj.id()+"-"+layer+"-"+index,
          noCss : true,
          hideclose : true,
        }, content);
        popout.draggable("destroy");
        popout.addClass("piece-quick-edit");
        popout.css("border", "none");
        popout.css("box-shadow", "none");
        popout.css("pointer-events", "none");
        var left = point.x-Number(popout.outerWidth())/2;
        var top = point.y;
        if (pieceData.e) {
          top = top - 35;
        }
        else if (ent && ent.data._t == "b") {
          top = top - 20;
        }
        else {
          top = top - 15;
        }
        popout.offset({
          left : Math.max(Math.min(left, $(window).outerWidth()-popout.width()),0),
          top : Math.max(Math.min(top, $(window).outerHeight()-popout.height()),0)
        });

        //scope.layer = layer;
        //app.attr("layer", scope.layer);
      }
    }
    if (hasSecurity(getCookie("UserID"), "Rights", data) || (pieceData.eID && ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) {
      if (!app.attr("creating") || (_down["16"] && _down["18"])) {
        if ((_down["16"] && _down["18"])) {
          if (ent && ent.data["_t"] == "b") {
            game.state.data.tabs = game.state.data.tabs || [];
            var tabs = game.state.data.tabs;
            var active;
            for (var i in tabs) {
              if (ent.id() == tabs[i].index) {
                active = i;
                break;
              }
            }
            if (!active) {
              active = tabs.length;
              game.state.data.tabs.push({index : pieceData.eID, ui : "ui_board"});
              app.removeAttr("zoom");
              for (var i in game.state._apps) {
                if ($("#"+game.state._apps[i]).length) {
                  $("#"+game.state._apps[i]).attr("tab", active);
                }
              }
              game.state.sync("updateState");
            }
            else {
              app.removeAttr("zoom");
              for (var i in game.state._apps) {
                if ($("#"+game.state._apps[i]).length) {
                  $("#"+game.state._apps[i]).attr("tab", active);
                }
              }
              game.state.update();
            }
          }
          else if (ent) {
            var popout = assetTypes[ent.data._t].summary(ent, app, null, null, true);
          }
          else if (pieceData.e) {
            var ctx = sync.defaultContext();
            ctx[obj.data._t] = {layers : {}};
            for (var lid in obj.data.layers) {
              ctx[obj.data._t].layers[lid] = {h : obj.data.layers[lid].h};
            }

            for (var cID in pieceData.e.calc) {
              var calcData = pieceData.e.calc[cID];
              if (calcData) {
                if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                  var val = sync.eval(calcData.eq, ctx);
                  var target = sync.traverse(obj.data, calcData.target);
                  if (target instanceof Object) {
                    sync.rawVal(target, val);
                  }
                  else {
                    sync.traverse(obj.data, calcData.target, val);
                  }
                  if (calcData.target.match("layers\.")) {
                    boardApi.updateLayer(calcData.target.split(".")[1], {r : true}, obj);
                  }
                }
              }
            }
          }
          layout.coverlay($(".piece-quick-edit"));
        }
      }
    }
  }

  var piece = pieceWrap.children[0];
  var pieceSelected = pieceWrap.children[1];
  var outline = pieceSelected.children[0];

  var stand = new PIXI.Graphics();
  piece.addChild(stand);

  var healthbar = new PIXI.Graphics();
  pieceWrap.addChild(healthbar);

  var title = new PIXI.Text("", new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
    fontWeight: "bold",
    fill: "white",
    stroke: 'black',
    align : "center",
    strokeThickness: 3,
    dropShadow: true,
    dropShadowColor: "rgba(0,0,0,0.2)",
    dropShadowAngle : 0.01,
    dropShadowDistance : 0,
    dropShadowBlur: 2,
    wordWrap: true,
    wordWrapWidth: objectData.w,
  }));
  pieceWrap.addChild(title);

  var statusEffects = new PIXI.Container();
  pieceWrap.addChild(statusEffects);

  pieceWrap.rebuild = function(objectData, rebuild) {
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var isHex = obj.data.options && obj.data.options.hex;

    if (!objectData && layer != null && index != null) {
      objectData = obj.data.layers[layer].p[index];
    }

    var x = objectData.x;
    var y = objectData.y;
    var width = Math.max(10, objectData.w);
    var height = Math.max(10, objectData.h);

    var lineStyle = true;
    if (objectData.i) {
      lineStyle = false;
    }
    stand.clear();
    boardApi.drawShape(objectData, stand, lineStyle, isHex);

    var recreate = false;
    if (piece.children && piece.children.length && piece.children[1]) {
      if (piece.children[1].i != objectData.i || piece.children[1].eID != objectData.eID) {
        piece.children[1].destroy(true);
        if (piece.children[2]) {
          piece.children[2].destroy(true);
        }
        recreate = true;
      }
    }
    else {
      recreate = true;
    }

    var token;
    if (recreate) {
      if (objectData.i) {
        objectData.i = String(objectData.i);
        if (objectData.i[0] != "/" && layout.webclient) {
          objectData.i = "";
        }
        var resource = PIXI.loader.resources[objectData.i];
        if (objectData.i && objectData.i.trim() && objectData.i.match(".mp4") || objectData.i.match(".webm") || objectData.i.match(".ogg")) {
          var videoText = PIXI.Texture.fromVideoUrl(objectData.i);
          videoText.baseTexture.source.loop = 1;
          videoText.baseTexture.source.volume = 0;

          token = new PIXI.Sprite(videoText);
          token.i = objectData.i;
        }
        else if (objectData.i && objectData.i.trim() && objectData.i.match(".gif") && false) {
          if (resource && resource.gifFrames && resource.gifFrames.length) {
            token = new PIXI.extras.AnimatedSprite(resource.gifFrames);
            token.animationSpeed = 0.2;
            token.i = objectData.i;
            token.gotoAndPlay(Math.round(Math.random() * resource.gifFrames.length - 1));
          }
          else if (!resource) {
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
            var onLoad = function(loader, res){
              Object.keys(res).forEach(function(k){
                if (res[k].extension == "gif" && res[k].data && !res[k].gifFrames) {
                   res[k].gifFrames = getFrames(res[k]);
                 }
              });
              obj.update();
            };

            PIXI.loaders.Resource.setExtensionLoadType('gif', PIXI.loaders.Resource.LOAD_TYPE.XHR);
            PIXI.loaders.Resource.setExtensionXhrType('gif', PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER);
            PIXI.loader.add(objectData.i).load(onLoad);

            token = new PIXI.Sprite.fromImage(objectData.i);
            token.i = objectData.i;
          }
          else {
            token = new PIXI.Sprite.fromImage(objectData.i);
          }
        }
        else {
          token = new PIXI.Sprite.fromImage(objectData.i);
        }
        token.x = objectData.w/2;
        token.y = objectData.h/2;
        token.width = objectData.w * (objectData.ts || 1);
        token.height = objectData.h * (objectData.ts || 1);
        token.anchor.x = 0.5;
        token.anchor.y = 0.5;
        token.i = objectData.i;
        token.eID = duplicate(objectData.eID);
        piece.addChild(token);
      }
      else if (objectData.eID) {
        var ent = getEnt(objectData.eID);
        if (ent) {
          var img = sync.rawVal(ent.data.info.img);
          if (ent.data._t == "c") {
            img = img || "/content/icons/blankchar.png";
          }
          else {
            img = "";
          }
          if (img[0] == "/") {
            token = new PIXI.Sprite.fromImage(img);
            if (ent.data._t == "c") {
              //token.mask = stand;
            }
            token.x = objectData.w/2;
            token.y = objectData.h/2;
            token.width = objectData.w;
            token.height = objectData.h;
            token.anchor.x = 0.5;
            token.anchor.y = 0.5;
            token.i = objectData.i;
            token.eID = duplicate(objectData.eID);
            piece.addChild(token);

            var mask = new PIXI.Graphics();
            boardApi.drawShape(objectData, mask, lineStyle, isHex);
            piece.addChild(mask);
            token.mask = mask;
          }
        }
      }
    }
    else if (piece.children && piece.children.length && piece.children[1]){
      piece.children[1].x = objectData.w/2;
      piece.children[1].y = objectData.h/2;
      if (objectData.i) {
        piece.children[1].width = objectData.w * (objectData.ts || 1);
        piece.children[1].height = objectData.h * (objectData.ts || 1);
      }
      else {
        piece.children[1].width = objectData.w;
        piece.children[1].height = objectData.h;
      }
      if (piece.children[1].mask) {
        piece.children[1].mask.clear();
        boardApi.drawShape(objectData, piece.children[1].mask, lineStyle, isHex);
      }
    }

    var showHP = false;
    var percentage;
    var hpHeight = 0;
    if (objectData.eID) {
      var ent = getEnt(objectData.eID);
      if (ent && ent.data && ent.data._t == "c") {
        boardApi.entListen(objectData.eID);
        if (!objectData.hp || objectData.hpb) {
          if (!obj.data.options.hpMode || obj.data.options.hpMode == 1 && (ent && ent.data && hasSecurity(getCookie("UserID"), "Visible", ent.data))) {
            var count = 0;
            healthbar.clear();
            if (!objectData.hpb) {
              var path;
              var boxed;
              var color;
              var hpStuff;
              if (game.templates.display.sheet && game.templates.display.sheet.health) {
                hpStuff = game.templates.display.sheet.health;
              }
              else if (game.templates.build && game.templates.display && game.templates.display.actors && game.templates.display.actors[ent.data._type]) {
                hpStuff = game.templates.display.actors[ent.data._type].health;
              }

              if (hpStuff instanceof Object) {
                path = hpStuff.target;
                boxed = hpStuff.boxed;
                color = hpStuff.color;
              }
              else {
                path = hpStuff;
              }
              if (path) {
                percentage = sync.traverse(ent.data, path);
                if (percentage instanceof Object && percentage.max) {
                  percentage = Math.min(Math.max(Number(percentage.current)/Number(percentage.max), 0), 1);

                  if (!objectData.hp) {
                    hpHeight = 6*Math.min(Math.max(Math.floor(objectData.h/64),1),3);
                    var endHP = percentage;
                    if (pieceWrap.force) {
                      var timePerc = Math.min((Date.now()-pieceWrap.force)/1000/pieceWrap.duration, 0);
                      percentage = endHP + (endHP-(healthbar.last || percentage))* timePerc;
                    }
                    showHP = "rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)";

                    if (boxed) {
                      var healthEnt = sync.traverse(ent.data, path);
                      var limit = Math.min(healthEnt.max || healthEnt.current, 15);
                      var width = (objectData.w-4);
                      for (var i=0; i<limit; i++) {
                        healthbar.beginFill(0x333333, 0.5);
                        healthbar.lineStyle(1,0x333333, 0.5);
                        healthbar.drawRect(1 + ((2+width)/limit) * i, 0, width/limit-1, hpHeight);
                        healthbar.endFill();
                        if (i < healthEnt.current) {
                          healthbar.beginFill(util.RGB_HEX(color || ("rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)")), 0.7);
                          healthbar.drawRect(1 + ((2+width)/limit) * i, 0, width/limit-1, hpHeight);
                          healthbar.endFill();
                        }
                      }
                    }
                    else {
                      healthbar.beginFill(0x333333, 0.5);
                      healthbar.lineStyle(1,0x333333, 0.5);
                      healthbar.drawRect(1, 0, (objectData.w-4), hpHeight);
                      healthbar.endFill();
                      healthbar.beginFill(util.RGB_HEX(color || ("rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)")), 0.7);
                      healthbar.drawRect(1, 0, (objectData.w-4)*percentage, hpHeight);
                      healthbar.endFill();
                    }

                    healthbar.last = percentage;

                    count++;
                  }
                }
              }
            }
            else {
              for (var key in objectData.hpb) {
                if (!objectData.hp) {
                  hpHeight = 6*Math.min(Math.max(Math.floor(objectData.h/64),1),3);
                  showHP = true;
                  var percentage = Math.min(Math.max(Number(ent.data.counters[key].current)/Number(ent.data.counters[key].max), 0), 1);
                  if (game.templates.display.sheet && ("counters."+key) == game.templates.display.sheet.health) {
                    var endHP = percentage;
                    healthbar.beginFill(0x333333, 0.5);
                    healthbar.lineStyle(1,0x333333, 0.5);
                    healthbar.drawRect(1, 0, (objectData.w-4), hpHeight);
                    healthbar.endFill();
                    healthbar.beginFill(util.RGB_HEX("rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)"), 0.7);
                    healthbar.drawRect(1, 0, (objectData.w-4)*percentage, hpHeight);
                    healthbar.endFill();
                  }
                  else {
                    if (objectData.hpb[key].b && ent.data.counters[key].current <= 15) {
                      var limit = Math.min(ent.data.counters[key].max || ent.data.counters[key].current, 15);
                      var width = (objectData.w-4);
                      for (var i=0; i<limit; i++) {
                        healthbar.beginFill(0x333333, 0.5);
                        healthbar.lineStyle(1,0x333333, 0.5);
                        healthbar.drawRect(1 + ((2+width)/limit) * i, hpHeight + (2 + 3) * count + 4, width/limit-1, 3);
                        healthbar.endFill();
                        if (i < ent.data.counters[key].current) {
                          healthbar.beginFill(util.RGB_HEX(objectData.hpb[key].c), 0.7);
                          healthbar.drawRect(1 + ((2+width)/limit) * i, hpHeight + (2 + 3) * count + 4, width/limit-1, 3);
                          healthbar.endFill();
                        }
                      }
                    }
                    else {
                      healthbar.beginFill(0x333333, 0.5);
                      healthbar.lineStyle(1,0x333333, 0.5);
                      healthbar.drawRect(1, hpHeight + (2 + 3) * count + 4, (objectData.w-4), 3);
                      healthbar.endFill();
                      healthbar.beginFill(util.RGB_HEX(objectData.hpb[key].c), 0.7);
                      healthbar.drawRect(1, hpHeight + (2 + 3) * count + 4, (objectData.w-4)*percentage, 3);
                      healthbar.endFill();
                    }

                    count++;
                  }
                }
              }
            }
            healthbar.x = 1;
            healthbar.y = objectData.h-2-hpHeight;
            healthbar.visible = true;
          }
        }
      }
    }
    if (!showHP) {
      healthbar.visible = false;
    }
    if (objectData.rpg) {
      for (var i=0; i<objectData.rpg.length; i++) {
        var found = false;
        for (var key=0; key<statusEffects.children.length; key++) {
          if (statusEffects.children[key].img == objectData.rpg[i]) {
            found = true;
          }
        }
        if (!found) {
          var effect = new PIXI.Sprite.fromImage(objectData.rpg[i]);
          effect.width = 20;
          effect.height = 20;
          effect.img = objectData.rpg[i];
          statusEffects.addChild(effect);
        }
      }
      for (var key=statusEffects.children.length-1; key>=0; key--) {
        statusEffects.children[key].x = objectData.w-key * 20-20;
        statusEffects.children[key].y = 0;
        if (!util.contains(objectData.rpg, statusEffects.children[key].img)) {
          statusEffects.removeChild(statusEffects.children[key]);
        }
      }
    }
    else {
      statusEffects.removeChildren();
    }

    if (objectData.t) {
      title.anchor.x = 0.5;
      title.anchor.y = 0.5;
      title.x = objectData.w/2;
      title.y = (objectData.eID == null)?(objectData.h/2):(objectData.h + 10);
      title.text = objectData.t;
      if (title.text != objectData.t) {
        title.text = objectData.t;
        title.dirty = true;
      }
      title.visible = true;
    }
    else {
      title.visible = false;
    }
    if (objectData.v) {
      var ent = getEnt(objectData.eID);
      if ((ent && ent.data && hasSecurity(getCookie("UserID"), "Visible", ent.data)) || hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
        pieceWrap.alpha = 0.5;
      }
      else {
        pieceWrap.alpha = 0;
      }
    }
    else {
      pieceWrap.alpha = 1;
    }
    if ((objectData.e || boardApi.triggers.cache[obj.id()][layer+"-"+index]) && layer != null && index != null) {
      if (!objectData.e) {
        delete boardApi.triggers.cache[obj.id()][layer+"-"+index];
      }
      else {
        boardApi.triggers.cache[obj.id()][layer+"-"+index] = {layer : layer, index : index};
      }
    }
  }
  pieceWrap.update(options.data);
  return pieceWrap;
}

boardApi.createWall = function(options, obj, app, scope) {
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var objectData = options.data;
  options.type = "w";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var piece = new PIXI.Container();
  piece.lookup = {layer : layer, type : type, index : index};

  piece.canInteract = function(ev){
    return false;
  }

  piece.select = function(){
    var layer = piece.lookup.layer;
    var type = piece.lookup.type;
    var index = piece.lookup.index;
    if (!piece.canChange || piece.canChange()) {
      token.selected = true;
      if (obj.data.layers[layer] && obj.data.layers[layer][type][index]) {
        piece.update();
      }
      boardApi.selections[obj.id()+"-"+layer+"-"+type+"-"+index] = {
        layer : layer,
        index : index,
        type : type,
        board : obj.id(),
        app : app.attr("id"),
        wrap : piece,
        image : piece,
        selected : piece
      };
    }
  }
  piece.unselect = function(){
    var layer = piece.lookup.layer;
    var type = piece.lookup.type;
    var index = piece.lookup.index;
    token.selected = false;
    if (obj.data.layers[layer] && obj.data.layers[layer][type][index]) {
      piece.update();
    }
    delete boardApi.selections[obj.id()+"-"+layer+"-"+type+"-"+index];
  }

  var token = new PIXI.Graphics();
  piece.addChild(token);

  var handle1 = new PIXI.Container();
  piece.addChild(handle1);

  piece.move = function(ev, deltaX, deltaY){
    boardApi.rebuildFogData(obj, app);
    boardApi.rebuildDynamicFog(obj, app);
    var layer = piece.lookup.layer;
    var type = piece.lookup.type;
    var index = piece.lookup.index;
    if ((objectData.e || boardApi.triggers.cache[obj.id()][layer+"-"+index]) && layer != null && index != null) {
      if (!objectData.e) {
        delete boardApi.triggers.cache[obj.id()][layer+"-"+index];
      }
      else {
        boardApi.triggers.cache[obj.id()][layer+"-"+index] = {layer : layer, index : index};
      }
    }
  }

  var circle = new PIXI.Graphics();
  circle.beginFill(0xFFFFFF);
  circle.lineStyle(1, 0x000000, 1);
  circle.drawCircle(0, 0, 4);
  circle.endFill();
  handle1.addChild(circle);
  handle1.width = 8;
  handle1.height = 8;
  handle1.hitArea = new PIXI.Rectangle(-4, -4, 8, 8);
  handle1.interactive = true;
  handle1.buttonMode = true;
  handle1.cursor = "pointer";
  handle1.mousedown = function(ev){
    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (key == 1) {
      if (!boardApi.dragging) {
        if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing && game.locals["drawing"].data.fog) {
          var layer = piece.lookup.layer;
          var type = piece.lookup.type;
          var index = piece.lookup.index;
          var pData = obj.data.layers[layer][type][index];
          boardApi.startX = pData.x1;
          boardApi.startY = pData.y1;
        }
        else {
          var stage = boardApi.apps[app.attr("id")].stage;
          var offset = ev.data.getLocalPosition(stage);
          boardApi.newDragEvent({
            startX : offset.x,
            startY : offset.y,
            move : function(ev){
              var layer = piece.lookup.layer;
              var type = piece.lookup.type;
              var index = piece.lookup.index;
              var stage = boardApi.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              var deltaX = focal.x;
              var deltaY = focal.y;

              if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
                boardApi.dragging.dragged = true;
                layout.coverlay($(".piece-quick-edit"));
              }
              pData.x1 = focal.x;
              pData.y1 = focal.y;
              if (piece.move) {
                piece.move(ev);
              }
              piece.update();
            },
            end : function(ev){
              var layer = piece.lookup.layer;
              var type = piece.lookup.type;
              var index = piece.lookup.index;
              var stage = boardApi.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var original = stage.toLocal({x : ev.pageX, y : ev.pageY});
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              if (!_down[16] && data.gridW && data.gridH) {
                var xGrid = Math.round((focal.x - (data.gridX || 0))/data.gridW);
                var yGrid = Math.round((focal.y - (data.gridY || 0))/data.gridH);
                var gridInc = data.gridW;

                if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.gridInc) {
                  gridInc = game.locals["drawing"].data.gridInc;
                  xGrid = Math.round((focal.x-(data.gridX || 0)) / gridInc);
                  yGrid = Math.round((focal.y-(data.gridY || 0)) / gridInc);
                }
                focal.x = (xGrid * gridInc + (data.gridX || 0));
                focal.y = (yGrid * gridInc + (data.gridY || 0));
                if (_down[18]) {
                  var distX = focal.x-original.x;
                  var distY = focal.y-original.y;

                  focal.x = (xGrid * gridInc + (data.gridX || 0));
                  focal.y = (yGrid * gridInc + (data.gridY || 0));

                  if (Math.abs(distX) < Math.abs(distY)) {
                    if (distY > 0) {
                      focal.y -= gridInc/2;
                    }
                    else {
                      focal.y += gridInc/2;
                    }
                  }
                  else {
                    if (distX > 0) {
                      focal.x -= gridInc/2;
                    }
                    else {
                      focal.x += gridInc/2;
                    }
                  }
                }
              }
              pData.x1 = focal.x;
              pData.y1 = focal.y;
              if (util.dist(pData.x2, pData.x1, pData.y2, pData.y1) < 4 && util.dist(pData.x1, original.x, pData.y1, original.y) < 6) {
                boardApi.destroyObject(layer, type, index, obj);
              }
              else {
                if (piece.move) {
                  piece.move(ev);
                }
                piece.update();
                runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : pData});
              }
              delete boardApi.dragging;
            }
          });
        }
      }
    }
  };

  var handle2 = new PIXI.Container();
  piece.addChild(handle2);

  var circle = new PIXI.Graphics();
  circle.beginFill(0xFFFFFF);
  circle.lineStyle(1, 0x000000, 1);
  circle.drawCircle(0, 0, 4);
  circle.endFill();
  handle2.addChild(circle);
  handle2.width = 8;
  handle2.height = 8;
  handle2.hitArea = new PIXI.Rectangle(-4, -4, 8, 8);
  handle2.interactive = true;
  handle2.buttonMode = true;
  handle2.cursor = "pointer";
  handle2.mousedown = function(ev){
    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (!boardApi.dragging) {
      if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing && game.locals["drawing"].data.fog) {
        var layer = piece.lookup.layer;
        var type = piece.lookup.type;
        var index = piece.lookup.index;
        var pData = obj.data.layers[layer][type][index];
        boardApi.startX = pData.x2;
        boardApi.startY = pData.y2;
      }
      else {
        var stage = boardApi.apps[app.attr("id")].stage;
        var offset = ev.data.getLocalPosition(stage);
        boardApi.newDragEvent({
          startX : offset.x,
          startY : offset.y,
          move : function(ev){
            var layer = piece.lookup.layer;
            var type = piece.lookup.type;
            var index = piece.lookup.index;
            var stage = boardApi.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            var deltaX = focal.x;
            var deltaY = focal.y;

            if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
              boardApi.dragging.dragged = true;
              layout.coverlay($(".piece-quick-edit"));
            }
            pData.x2 = focal.x;
            pData.y2 = focal.y;
            if (piece.move) {
              piece.move(ev);
            }
            piece.update();
          },
          end : function(ev){
            var layer = piece.lookup.layer;
            var type = piece.lookup.type;
            var index = piece.lookup.index;
            var stage = boardApi.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            var original = stage.toLocal({x : ev.pageX, y : ev.pageY});
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            if (!_down[16] && data.gridW && data.gridH) {
              var xGrid = Math.round((focal.x - (data.gridX || 0))/data.gridW);
              var yGrid = Math.round((focal.y - (data.gridY || 0))/data.gridH);
              var gridInc = data.gridW;

              if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.gridInc) {
                gridInc = game.locals["drawing"].data.gridInc;
                xGrid = Math.round((focal.x-(data.gridX || 0)) / gridInc);
                yGrid = Math.round((focal.y-(data.gridY || 0)) / gridInc);
              }

              focal.x = (xGrid * gridInc + (data.gridX || 0));
              focal.y = (yGrid * gridInc + (data.gridY || 0));

              if (_down[18]) {
                var distX = focal.x-original.x;
                var distY = focal.y-original.y;

                focal.x = (xGrid * gridInc + (data.gridX || 0));
                focal.y = (yGrid * gridInc + (data.gridY || 0));

                if (Math.abs(distX) < Math.abs(distY)) {
                  if (distY > 0) {
                    focal.y -= gridInc/2;
                  }
                  else {
                    focal.y += gridInc/2;
                  }
                }
                else {
                  if (distX > 0) {
                    focal.x -= gridInc/2;
                  }
                  else {
                    focal.x += gridInc/2;
                  }
                }
              }
            }
            pData.x2 = focal.x;
            pData.y2 = focal.y;
            if (util.dist(pData.x2, pData.x1, pData.y2, pData.y1) < 4 && util.dist(pData.x2, original.x, pData.y2, original.y) < 6) {
              boardApi.destroyObject(layer, type, index, obj);
            }
            else {
              if (piece.move) {
                piece.move(ev);
              }
              piece.update();
              runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : pData});
            }
            delete boardApi.dragging;
          }
        });
      }
    }
  };

  piece.update = function(objectData) {
    var layer = piece.lookup.layer;
    var type = piece.lookup.type;
    var index = piece.lookup.index;
    if (!objectData && layer != null && index != null) {
      objectData = obj.data.layers[layer][type][index];
    }
    var userID = app.attr("UserID") || getCookie("UserID");
    var hasRights = hasSecurity(userID, "Rights", obj.data) || hasSecurity(userID, "Game Master");

    var zoom = Number(app.attr("zoom"))/100;
    var x = Math.min(objectData.x1, objectData.x2);
    var y = Math.min(objectData.y1, objectData.y2);
    var w = Math.max(objectData.x1, objectData.x2);
    var h = Math.max(objectData.y1, objectData.y2);

    piece.x = x;
    piece.y = y;
    piece.pivot.x = 0;
    piece.pivot.y = 0;

    token.clear();
    if (token.selected) {
      token.lineStyle(4, 0xFF8a42, 1);
    }
    else {
      token.lineStyle(3, 0x000000, 1);
    }
    token.moveTo(objectData.x1-x, objectData.y1-y);
    token.lineTo(objectData.x2-x, objectData.y2-y);
    token.lineStyle(1, 0xFFFFFF, 1);
    token.moveTo(objectData.x1-x, objectData.y1-y);
    token.lineTo(objectData.x2-x, objectData.y2-y);

    handle1.x = objectData.x1-x;
    handle1.y = objectData.y1-y;

    handle2.x = objectData.x2-x;
    handle2.y = objectData.y2-y;

    if (hasRights) {
      piece.visible = true;
    }
    else {
      piece.visible = false;
    }
  }
  piece.update(options.data);
  return piece;
}
