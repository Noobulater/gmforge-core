boardApi.pix.buildPath = function(obj, sX, sY, eX, eY, color) {
  var data = obj.data;

  var gridWidth = data.gridW;
  var gridHeight = data.gridH;

  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;

  // draw Squares
  var a = sX-eX;
  var b = sY-eY;
  var slope = a/b;

  var startX = Math.floor((sX - (data.gridX || 0))/data.gridW);
  var startY = Math.floor((sY - (data.gridY || 0))/data.gridH);

  var endX = Math.floor((eX - (data.gridX || 0))/data.gridW);
  var endY = Math.floor((eY - (data.gridY || 0))/data.gridH);

  slope = (startY - endY)/(startX - endX);
  //trace the path
  var mW = (Math.abs(eX-sX))*data.gridW;
  var mH = (Math.abs(eY-sY))*data.gridH;
  var measureSize = Math.max(mW, mH);

  var dummyCanvas = new PIXI.Container();
  dummyCanvas.width = measureSize;
  dummyCanvas.height = measureSize;

  var offsetX = Math.min(startX, endX);
  var offsetY = Math.min(startY, endY);
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

      rect.beginFill(util.RGB_HEX(color), util.RGB_ALPHA(color));
      rect.lineStyle(4, 0x000000, 0.4);
      rect.drawRect((x - offsetX) * data.gridW, (y - offsetY) * data.gridH, data.gridW, data.gridH);
      rect.endFill();

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

      var rect = new PIXI.Graphics();
      rect.x = (x - offsetX) * data.gridW;
      rect.y = (y - offsetY) * data.gridH;
      rect.width = data.gridW;
      rect.height = data.gridH;
      rect.beginFill(util.RGB_HEX(color), util.RGB_ALPHA(color));
      rect.lineStyle(4, 0x000000, 0.4);
      rect.drawRect(0, 0, data.gridW, data.gridH);
      rect.endFill();

      dummyCanvas.addChild(rect);
      squares++;
    }
  }
  dummyCanvas.squares = squares;
  return dummyCanvas;
}

boardApi.pix.drawGrid = function(obj, app, scope){
  var data = obj.data;
  var isHex = data.options && data.options.hex;
  var hasGrid = data.gridW && data.gridW;

  var gridWrap = new PIXI.Graphics();
  gridWrap.x = data.x || 0;
  gridWrap.y = data.y || 0;
  gridWrap.lineStyle(1, util.RGB_HEX(data.gc), util.RGB_ALPHA(data.gc));

  gridWrap.width = data.w;
  gridWrap.height = data.h;

  if (hasGrid) {
    var xGrid = Math.ceil(data.w/(data.gridW));
    var yGrid = Math.ceil(data.h/(data.gridH));

    if (isHex) {

    }
    else {
      for (var y=0; y<yGrid; y++) {
        gridWrap.moveTo(0 + (data.gridX || 0), Math.max(y * (data.gridH), 0) + (data.gridY || 0));
        gridWrap.lineTo(Math.ceil((xGrid) * data.gridW) + (data.gridX || 0), Math.max(y * (data.gridH), 0) + (data.gridY || 0));
      }

      for (var x=0; x<xGrid; x++) {
        gridWrap.moveTo(Math.max(x * (data.gridW), 0) + (data.gridX || 0), 0 + (data.gridY || 0));
        gridWrap.lineTo(Math.max(x * (data.gridW), 0) + (data.gridX || 0), Math.ceil((yGrid) * data.gridH) + (data.gridY || 0));
      }

      gridWrap.moveTo(0 + (data.gridX || 0), Math.max((yGrid) * (data.gridH), 0) + (data.gridY || 0));
      gridWrap.lineTo(Math.ceil((xGrid) * data.gridW) + (data.gridX || 0), Math.max((yGrid) * (data.gridH), 0) + (data.gridY || 0));

      gridWrap.moveTo(Math.max((xGrid) * (data.gridW), 0) + (data.gridX || 0), 0 + (data.gridY || 0));
      gridWrap.lineTo(Math.max((xGrid) * (data.gridW), 0) + (data.gridX || 0), Math.ceil((yGrid) * data.gridH) + (data.gridY || 0));
    }
  }

  return gridWrap;
}
