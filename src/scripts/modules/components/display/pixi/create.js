boardApi.pix.createObject = function(options, obj, app, scope) {
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

          var startX = boardApi.pix.dragging.pageX;
          var startY = boardApi.pix.dragging.pageY;
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
        boardApi.pix.newDragEvent({
          startX : pieceData.x,
          startY : pieceData.y,
          startW : pieceData.w,
          startH : pieceData.h,
          pageX : ev.data.originalEvent.pageX,
          pageY : ev.data.originalEvent.pageY,
          startObject : objectData,
          move : function(ev){
            var result = resize(ev);
            boardApi.pix.dragging.startObject.x = result.x || boardApi.pix.dragging.startObject.x;
            boardApi.pix.dragging.startObject.y = result.y || boardApi.pix.dragging.startObject.y;
            boardApi.pix.dragging.startObject.w = result.w || boardApi.pix.dragging.startObject.w;
            boardApi.pix.dragging.startObject.h = result.h || boardApi.pix.dragging.startObject.h;
            objectWrap.update(boardApi.pix.dragging.startObject);
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
            delete boardApi.pix.dragging;
          }
        }, ev);
      }
      boardApi.pix.objectClick = true;
    });
    handles[i] = dragHandle;
  }
  object.on("mouseover", function(ev){
    if (objectWrap.canInteract && !objectWrap.canInteract(ev)) {
      object.cursor = "";
    }
    else {
      object.cursor == "pointer";
    }
  });
  objectWrap.select = function(){
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;
    if (!objectWrap.canChange || objectWrap.canChange()) {
      objectSelected.visible = true;
      boardApi.pix.selections[obj.id()+"-"+layer+"-"+type+"-"+index] = {
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
    delete boardApi.pix.selections[obj.id()+"-"+layer+"-"+type+"-"+index];
  }
  object.on("mousedown", function(ev){
    var layer = objectWrap.lookup.layer;
    var type = objectWrap.lookup.type;
    var index = objectWrap.lookup.index;
    if (objectWrap.canInteract && !objectWrap.canInteract(ev)) {
      return;
    }

    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (key == 1) {
      objectWrap.update();
      if (!_down[16] && !boardApi.pix.objectClick) {
        if (Object.keys(boardApi.pix.selections).length <= 1) {
          for (var id in boardApi.pix.selections) {
            boardApi.pix.selections[id].selected.visible = false;
            delete boardApi.pix.selections[id];
          }
        }
      }
      objectWrap.select();

      if (!boardApi.pix.dragging) {
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

        boardApi.pix.newDragEvent({
          offsetX : offset.x,
          offsetY : offset.y,
          move : function(ev){
            if (!objectWrap.canChange || objectWrap.canChange(ev)) {
              var layer = objectWrap.lookup.layer;
              var type = objectWrap.lookup.type;
              var index = objectWrap.lookup.index;
              var stage = boardApi.pix.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              var deltaX = focal.x-objectWrap.x-boardApi.pix.dragging.offsetX;
              var deltaY = focal.y-objectWrap.y-boardApi.pix.dragging.offsetY;

              if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
                boardApi.pix.dragging.dragged = true;
                layout.coverlay($(".piece-quick-edit"));
              }

              for (var key in boardApi.pix.selections) {
                if (boardApi.pix.selections[key].type == type) {
                  boardApi.pix.selections[key].wrap.x += deltaX;
                  boardApi.pix.selections[key].wrap.y += deltaY;
                }
              }
              // disabled until more optimized solution can be found
              if (false && boardApi.pix.fog[obj.id()] && boardApi.pix.fog[obj.id()].length < 800 && obj.data.options.fog) {
                if (type == "p" && pData.eID && hasSecurity(getCookie("UserID"), "Visible", getEnt(pData.eID).data)) {
                  var range;
                  if (pData.eID && pData.o && pData.o.Sight) {
                    var auraData = pData.o.Sight;
                    range = boardApi.pix.scale(sync.eval(auraData.d, context), obj, true);
                  }
                  boardApi.pix.apps[app.attr("id")].views[layer+"-"+type+"-"+index] = boardApi.pix.buildDynamicFog(obj, app, objectWrap.x + pData.w/2, objectWrap.y + pData.h/2, range);
                  boardApi.pix.rebuildDynamicFog(obj, app);
                }
              }
            }
          },
          end : function(ev){
            var layer = objectWrap.lookup.layer;
            var type = objectWrap.lookup.type;
            var index = objectWrap.lookup.index;
            var stage = boardApi.pix.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            if (!pData) {
              delete boardApi.pix.dragging;
              return;
            }
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            var offsetX = boardApi.pix.dragging.offsetX;
            var offsetY = boardApi.pix.dragging.offsetY;
            if (data.gridW) {
              offsetX = boardApi.pix.dragging.offsetX%(data.gridW);
            }
            if (data.gridH) {
              offsetY = boardApi.pix.dragging.offsetY%(data.gridH);
            }

            var finalX = objectWrap.x+offsetX;
            var finalY = objectWrap.y+offsetY;
            var now = Date.now();
            if (!boardApi.pix.dragging.dragged || (objectWrap.canChange && !objectWrap.canChange(ev))) {
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
                var xGrid = Math.floor((finalX - (data.gridX || 0))/data.gridW);
                var yGrid = Math.floor((finalY - (data.gridY || 0))/data.gridH);
                finalX = (xGrid * data.gridW + (data.gridX || 0));
                finalY = (yGrid * data.gridH + (data.gridY || 0));
              }
              else {
                finalX -= offsetX;
                finalY -= offsetY;
              }

              var deltaX = pData.x - finalX;
              var deltaY = pData.y - finalY;
              // changed
              for (var key in boardApi.pix.selections) {
                var selectData = boardApi.pix.selections[key];
                if (selectData.type == type) {
                  obj.data.layers[selectData.layer][selectData.type][selectData.index].x -= deltaX;
                  obj.data.layers[selectData.layer][selectData.type][selectData.index].y -= deltaY;
                  selectData.wrap.x = obj.data.layers[selectData.layer][selectData.type][selectData.index].x;
                  selectData.wrap.y = obj.data.layers[selectData.layer][selectData.type][selectData.index].y;
                  if (selectData.wrap.move) {
                    selectData.wrap.move(ev, deltaX, deltaY);
                  }
                  var pieceData = obj.data.layers[selectData.layer][selectData.type][selectData.index];
                  if (boardApi.pix.fog[obj.id()] && boardApi.pix.fog[obj.id()].length) {
                    if (selectData.type == "p" && pieceData.eID) {
                      var ent = getEnt(pieceData.eID);
                      var userID = app.attr("UserID") || getCookie("UserID");
                      var hasRights = hasSecurity(userID, "Rights", obj.data) || hasSecurity(userID, "Game Master");
                      if (ent && ent.data._t == "c" && (hasRights || hasSecurity(userID, "Visible", ent.data))) {
                        var range;
                        if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                          var auraData = pieceData.o.Sight;
                          range = boardApi.pix.scale(sync.eval(auraData.d, context), obj, true);
                        }
                        boardApi.pix.apps[app.attr("id")].views[selectData.layer+"-"+selectData.type+"-"+selectData.index] = boardApi.pix.buildDynamicFog(obj, app, selectData.wrap.x + pieceData.w/2, selectData.wrap.y + pieceData.h/2, range);
                        boardApi.pix.rebuildDynamicFog(obj, app);
                      }
                    }
                  }
                }
              }
            }
            delete boardApi.pix.dragging;
          }
        }, ev);
      }
    }
    boardApi.pix.objectClick = true;
  });
  object.on("mouseup", function(ev){});
  object.on("mouseupoutside", function(ev){});
  rotateHandle.on("mousedown", function(ev){
    layout.coverlay($(".piece-quick-edit"));
    var key = ev.data.originalEvent.keyCode || ev.data.originalEvent.which;
    if (key == 1) {
      boardApi.pix.newDragEvent({
        move : function(ev){
          var xPos = ev.pageX;
          var yPos = ev.pageY;

          for (var key in boardApi.pix.selections) {
            var selectData = boardApi.pix.selections[key];
            var focal = selectData.image.toGlobal({x : selectData.selected.width/2-5, y : selectData.selected.height/2});

            var angle = Math.atan2(focal.y - yPos, focal.x - xPos);
            selectData.image.rotation = angle - Math.PI / 2;
            selectData.selected.rotation = angle - Math.PI / 2;
          }
        },
        end : function(ev){
          var xPos = ev.pageX;
          var yPos = ev.pageY;

          for (var key in boardApi.pix.selections) {
            var selectData = boardApi.pix.selections[key];
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

          delete boardApi.pix.dragging;
        }
      }, ev);
    }
    boardApi.pix.objectClick = true;
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
        if (objectData.r) {
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
    if (boardApi.pix.apps[app.attr("id")] && boardApi.pix.apps[app.attr("id")].stage) {
      if (objectWrap.animating) {
        objectWrap.update();
        boardApi.pix.apps[app.attr("id")].ticker.remove(objectWrap.animating);
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
            boardApi.pix.apps[app.attr("id")].ticker.remove(objectWrap.animating);
            delete objectWrap.force;
            delete objectWrap.end;
            delete objectWrap.duration;
            delete objectWrap.start;
            delete objectWrap.animating;
          }
        }
      }
      boardApi.pix.apps[app.attr("id")].ticker.add(objectWrap.animating);
    }
  }
  objectWrap.update(options.objectData);
  return objectWrap;
}

boardApi.pix.createDrawing = function(options, obj, app, scope) {
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;
  var objectData = options.data;
  options.type = "d";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var pieceWrap = boardApi.pix.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};

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
    if (objectData.drawing == "box") {
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
        token = new PIXI.Text(null, new PIXI.TextStyle(objectData.style || boardApi.pix.fonts.default));
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

boardApi.pix.createTile = function(options, obj, app, scope){
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;

  options.type = "t";

  var layer = options.layer;
  var type = options.type;
  var index = options.index;

  var pieceWrap = boardApi.pix.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};
  pieceWrap.tileData = duplicate(options.data);

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

boardApi.pix.drawShape = function(objectData, stand, lineStyle){
  if (objectData.d == null || objectData.d == 0) {
    stand.beginFill(util.RGB_HEX(objectData.c), util.RGB_ALPHA(objectData.c));
    stand.lineStyle(2, 0x000000, (lineStyle)?(0.4):(0));
    stand.drawRect(1, 1, objectData.w-1, objectData.h-1);
    stand.endFill();
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

boardApi.pix.createPiece = function(options, obj, app, scope){
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

  var pieceWrap = boardApi.pix.createObject(options, obj, app, scope);
  pieceWrap.lookup = {layer : layer, type : type, index : index};

  pieceWrap.canInteract = function(ev){
    if (!pieceWrap.lookup) {return false;}
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;
    var objectData = obj.data.layers[layer].p[index];
    var hasRights = hasSecurity(getCookie("UserID"), "Rights", obj.data) || hasSecurity(getCookie("UserID"), "Game Master");
    if (_down[17]) {
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
      var triggered = [];
      if (Object.keys(boardApi.pix.triggers.cache[obj.id()]).length && objectData && !objectData.e) {
        var oldX = objectData.x + deltaX;
        var oldY = objectData.y + deltaY;

        var midX = objectData.x + objectData.w/2;
        var midY = objectData.y + objectData.h/2;

        var ctx = sync.defaultContext();
        ctx[obj.data._t] = {layers : {}};
        for (var lid in obj.data.layers) {
          ctx[obj.data._t].layers[lid] = {h : obj.data.layers[lid].h};
        }
        for (var k in boardApi.pix.triggers.cache[obj.id()]) {
          var tP = boardApi.pix.triggers.cache[obj.id()][k];
          if (tP.layer != layer || tP.index != index) {
            tP = obj.data.layers[tP.layer].p[tP.index];
            if (tP.e.t > 1) {
              if (tP.e.t == 2 && (tP.x < midX && tP.x + tP.w > midX && tP.y < midY && tP.y + tP.h > midY)) {
                triggered.push(duplicate(boardApi.pix.triggers.cache[obj.id()][k]));
              }
              else if ((tP.e.t == 3)) {
                if (!(tP.x < oldX + objectData.w/2 && tP.x + tP.w > oldX + objectData.w/2 && tP.y < oldY + objectData.h/2 && tP.y + tP.h > oldY + objectData.h/2)) {
                  if (util.intersectBox(oldX + objectData.w/2, oldY + objectData.h/2, midX, midY, tP.x, tP.y, tP.w, tP.h)) {
                    triggered.push(duplicate(boardApi.pix.triggers.cache[obj.id()][k]));
                  }
                }
              }
            }
            if (triggered.length) {
              var tLayer = boardApi.pix.triggers.cache[obj.id()][k].layer;
              var tIndex = boardApi.pix.triggers.cache[obj.id()][k].index;
              boardApi.pix.triggers.flush[obj.id()][tLayer+"-"+tIndex] = function() {
                for (var cID in tP.e.calc) {
                  var calcData = tP.e.calc[cID];
                  if (calcData) {
                    if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                      if (calcData.e == 4) { // equation
                        var evData = {
                          icon : calcData.data.href,
                          msg : sync.eval(calcData.msg, ctx),
                          ui : calcData.ui,
                          p : calcData.p,
                          data : sync.executeQuery(calcData.data, ctx),
                        }
                        runCommand("diceCheck", evData);
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
                          boardApi.pix.updateLayer(calcData.target.split(".")[1], null, obj);
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
    if (Object.keys(boardApi.pix.selections).length == 1 && $(".piece-quick-edit").length == 1 && $(".piece-quick-edit-app").attr("idstr") == obj.id()+"-"+layer+"-p-"+index) {
      if (!game.locals["drawing"] || !game.locals["drawing"].data || game.locals["drawing"].data.target != app.attr("id") || !game.locals["drawing"].data.drawing) {
        var temp;
        if (!app.attr("creating")) {
          app.attr("creating", true);
          app.removeAttr("drawing");
          app.removeAttr("configuring");
          temp = true;
        }
        var parent = $("#"+app.attr("id")+"-menu-"+obj.id());
        parent.replaceWith(boardApi.pix.buildMenu(obj, app, scope));

        game.locals["pieceBuilding"].data.layer = layer;
        game.locals["pieceBuilding"].data.piece = index;
        game.locals["pieceBuilding"].update();

        if (temp) {
          app.removeAttr("creating");
          app.removeAttr("drawing");
          app.removeAttr("configuring");
          app.attr("rebuildmenu", true);
        }

        layout.coverlay($(".piece-quick-edit"));
      }
      return;
    }
    if ($(".piece-quick-edit").length == 0 || $(".piece-quick-edit-app").attr("layer") != layer || $(".piece-quick-edit-app").attr("piece") != index || $(".piece-quick-edit-app").attr("board") != obj.id()) {
      if ((pieceWrap.canChange && !pieceWrap.canChange(ev)) || (Object.keys(boardApi.pix.selections).length == 1 && Object.keys(boardApi.pix.selections)[0] == obj.id()+"-"+layer+"-p-"+index)) {
        if (game.locals["pieceBuilding"] && game.locals["pieceBuilding"].data) {
          game.locals["pieceBuilding"].data.layer = layer;
          game.locals["pieceBuilding"].data.piece = index;
          game.locals["pieceBuilding"].update();
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

        scope.layer = layer;
        app.attr("layer", scope.layer);
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
                    boardApi.pix.updateLayer(calcData.target.split(".")[1], {r : true}, obj);
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

  var healthbar = new PIXI.Graphics();
  pieceWrap.addChild(healthbar);

  var statusEffects = new PIXI.Container();
  pieceWrap.addChild(statusEffects);

  pieceWrap.rebuild = function(objectData, rebuild) {
    var layer = pieceWrap.lookup.layer;
    var type = pieceWrap.lookup.type;
    var index = pieceWrap.lookup.index;

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
    boardApi.pix.drawShape(objectData, stand, lineStyle);

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
        if (objectData.i && objectData.i.trim() && objectData.i.match(".mp4") || objectData.i.match(".webm") || objectData.i.match(".ogg")) {
          var videoText = PIXI.Texture.fromVideoUrl(objectData.i);
          videoText.baseTexture.source.loop = 1;
          videoText.baseTexture.source.volume = 0;

          token = new PIXI.Sprite(videoText);
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
            boardApi.pix.drawShape(objectData, mask, lineStyle);
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
        boardApi.pix.drawShape(objectData, piece.children[1].mask, lineStyle);
      }
    }

    var showHP = false;
    var percentage;

    if (objectData.eID) {
      var ent = getEnt(objectData.eID);
      if (ent && ent.data) {
        boardApi.pix.entListen(objectData.eID);
        if (!objectData.hp && game.templates.display.sheet.health) {
          if (!obj.data.options.hpMode || obj.data.options.hpMode == 1 && (ent && ent.data && hasSecurity(getCookie("UserID"), "Visible", ent.data))) {
            percentage = sync.traverse(ent.data, game.templates.display.sheet.health);
            if (percentage instanceof Object && percentage.max) {
              percentage = Math.max(Number(percentage.current)/Number(percentage.max), 0);
              if (!objectData.hp) {
                var hpHeight = 6*Math.min(Math.max(Math.floor(objectData.h/64),1),3);

                healthbar.clear();
                var endHP = percentage;
                if (pieceWrap.force) {
                  var timePerc = Math.min((Date.now()-pieceWrap.force)/1000/pieceWrap.duration, 0);
                  percentage = endHP + (endHP-(healthbar.last || percentage))* timePerc;
                }
                showHP = "rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)";

                healthbar.beginFill(0x333333, 0.5);
                healthbar.lineStyle(1,0x333333, 0.5);
                healthbar.drawRect(1, 0, (objectData.w-4), hpHeight);
                healthbar.endFill();
                healthbar.beginFill(util.RGB_HEX("rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)"), 0.7);
                healthbar.drawRect(1, 0, (objectData.w-4)*percentage, hpHeight);
                healthbar.endFill();
                healthbar.x = 1;
                healthbar.y = objectData.h-2-hpHeight;
                healthbar.visible = true;
                healthbar.last = percentage;
              }
            }
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
      title.y = (objectData.eID == null)?(objectData.h/2):(10);
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
    if ((objectData.e || boardApi.pix.triggers.cache[obj.id()][layer+"-"+index]) && layer != null && index != null) {
      if (!objectData.e) {
        delete boardApi.pix.triggers.cache[obj.id()][layer+"-"+index];
      }
      else {
        boardApi.pix.triggers.cache[obj.id()][layer+"-"+index] = {layer : layer, index : index};
      }
    }
  }
  pieceWrap.update(options.data);
  return pieceWrap;
}

boardApi.pix.createWall = function(options, obj, app, scope) {
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
      boardApi.pix.selections[obj.id()+"-"+layer+"-"+type+"-"+index] = {
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
    delete boardApi.pix.selections[obj.id()+"-"+layer+"-"+type+"-"+index];
  }

  var token = new PIXI.Graphics();
  piece.addChild(token);

  var handle1 = new PIXI.Container();
  piece.addChild(handle1);

  piece.move = function(ev, deltaX, deltaY){
    boardApi.pix.rebuildFogData(obj, app);
    boardApi.pix.rebuildDynamicFog(obj, app);
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
      if (!boardApi.pix.dragging) {
        if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing && game.locals["drawing"].data.fog) {
          var layer = piece.lookup.layer;
          var type = piece.lookup.type;
          var index = piece.lookup.index;
          var pData = obj.data.layers[layer][type][index];
          boardApi.pix.startX = pData.x1;
          boardApi.pix.startY = pData.y1;
        }
        else {
          var stage = boardApi.pix.apps[app.attr("id")].stage;
          var offset = ev.data.getLocalPosition(stage);
          boardApi.pix.newDragEvent({
            startX : offset.x,
            startY : offset.y,
            move : function(ev){
              var layer = piece.lookup.layer;
              var type = piece.lookup.type;
              var index = piece.lookup.index;
              var stage = boardApi.pix.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              var deltaX = focal.x;
              var deltaY = focal.y;

              if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
                boardApi.pix.dragging.dragged = true;
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
              var stage = boardApi.pix.apps[app.attr("id")].stage;
              var pData = obj.data.layers[layer][type][index];
              var original = stage.toLocal({x : ev.pageX, y : ev.pageY});
              var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

              if (!_down[16] && data.gridW && data.gridH) {
                var xGrid = Math.round((focal.x - (data.gridX || 0))/data.gridW);
                var yGrid = Math.round((focal.y - (data.gridY || 0))/data.gridH);
                focal.x = (xGrid * data.gridW + (data.gridX || 0));
                focal.y = (yGrid * data.gridH + (data.gridY || 0));
                if (_down[18]) {
                  var distX = focal.x-original.x;
                  var distY = focal.y-original.y;

                  focal.x = (xGrid * data.gridW + (data.gridX || 0));
                  focal.y = (yGrid * data.gridH + (data.gridY || 0));

                  if (Math.abs(distX) < Math.abs(distY)) {
                    if (distY > 0) {
                      focal.y -= data.gridH/2;
                    }
                    else {
                      focal.y += data.gridH/2;
                    }
                  }
                  else {
                    if (distX > 0) {
                      focal.x -= data.gridW/2;
                    }
                    else {
                      focal.x += data.gridW/2;
                    }
                  }
                }
              }
              pData.x1 = focal.x;
              pData.y1 = focal.y;
              if (util.dist(pData.x2, pData.x1, pData.y2, pData.y1) < 4 && util.dist(pData.x1, original.x, pData.y1, original.y) < 6) {
                boardApi.pix.destroyObject(layer, type, index, obj);
              }
              else {
                if (piece.move) {
                  piece.move(ev);
                }
                piece.update();
                runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : pData});
              }
              delete boardApi.pix.dragging;
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
    if (!boardApi.pix.dragging) {
      if (game.locals["drawing"] && game.locals["drawing"].data && game.locals["drawing"].data.drawing && game.locals["drawing"].data.fog) {
        var layer = piece.lookup.layer;
        var type = piece.lookup.type;
        var index = piece.lookup.index;
        var pData = obj.data.layers[layer][type][index];
        boardApi.pix.startX = pData.x2;
        boardApi.pix.startY = pData.y2;
      }
      else {
        var stage = boardApi.pix.apps[app.attr("id")].stage;
        var offset = ev.data.getLocalPosition(stage);
        boardApi.pix.newDragEvent({
          startX : offset.x,
          startY : offset.y,
          move : function(ev){
            var layer = piece.lookup.layer;
            var type = piece.lookup.type;
            var index = piece.lookup.index;
            var stage = boardApi.pix.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            var deltaX = focal.x;
            var deltaY = focal.y;

            if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
              boardApi.pix.dragging.dragged = true;
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
            var stage = boardApi.pix.apps[app.attr("id")].stage;
            var pData = obj.data.layers[layer][type][index];
            var original = stage.toLocal({x : ev.pageX, y : ev.pageY});
            var focal = stage.toLocal({x : ev.pageX, y : ev.pageY});

            if (!_down[16] && data.gridW && data.gridH) {
              var xGrid = Math.round((focal.x - (data.gridX || 0))/data.gridW);
              var yGrid = Math.round((focal.y - (data.gridY || 0))/data.gridH);
              focal.x = (xGrid * data.gridW + (data.gridX || 0));
              focal.y = (yGrid * data.gridH + (data.gridY || 0));
              if (_down[18]) {
                var distX = focal.x-original.x;
                var distY = focal.y-original.y;

                focal.x = (xGrid * data.gridW + (data.gridX || 0));
                focal.y = (yGrid * data.gridH + (data.gridY || 0));

                if (Math.abs(distX) < Math.abs(distY)) {
                  if (distY > 0) {
                    focal.y -= data.gridH/2;
                  }
                  else {
                    focal.y += data.gridH/2;
                  }
                }
                else {
                  if (distX > 0) {
                    focal.x -= data.gridW/2;
                  }
                  else {
                    focal.x += data.gridW/2;
                  }
                }
              }
            }
            pData.x2 = focal.x;
            pData.y2 = focal.y;
            if (util.dist(pData.x2, pData.x1, pData.y2, pData.y1) < 4 && util.dist(pData.x2, original.x, pData.y2, original.y) < 6) {
              boardApi.pix.destroyObject(layer, type, index, obj);
            }
            else {
              if (piece.move) {
                piece.move(ev);
              }
              piece.update();
              runCommand("boardMove", {id : obj.id(), layer : layer, type : type, index : index, data : pData});
            }
            delete boardApi.pix.dragging;
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
