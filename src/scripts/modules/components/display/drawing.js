function buildShape(shape, col, size) {
  size = size || 20;

  var dummyCanvas = $("<canvas>");
  dummyCanvas.attr("width", (size || 20) + "px");
  dummyCanvas.attr("height", (size || 20) + "px");
  dummyCanvas.css("pointer-events", "none");
  if (shape == 0) {
    dummyCanvas.drawRect({
      width : size, height : size,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
    });
  }
  else if (shape == 1) {
    dummyCanvas.drawRect({
      width : size, height : size,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      cornerRadius : 4
    });
  }
  else if (shape == 2) {
    dummyCanvas.drawRect({
      width : size, height : size,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      cornerRadius : 30
    });
  }
  else if (shape == 3) {
    dummyCanvas.drawPolygon({
      radius : size/2,
      y : -2,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      rotate : 180,
      sides : 3,
    });
  }
  else if (shape == 4) {
    dummyCanvas.drawPolygon({
      radius : size/2,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      disableEvents : true,
      sides : 3
    });
  }
  else if (shape == 5) {
    dummyCanvas.drawPolygon({
      radius : size/2,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      disableEvents : true,
      concavity : 0.5,
      sides : 5
    });
  }
  else if (shape) {
    dummyCanvas.drawPolygon({
      radius : size/2,
      fillStyle : col,
      strokeStyle: "rgba(0,0,0,0.4)",
      strokeWidth: 2,
      fromCenter : false,
      disableEvents : true,
      sides : shape-1
    });
  }
  return dummyCanvas;
}
sync.render("ui_shapePicker", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-x flexaround flexwrap subtitle");

  var shapes = [0,1,2,3,4,5,6,7,9];
  for (var i in shapes) {
    var shapeWrap = $("<div>").appendTo(div);
    shapeWrap.addClass("flexmiddle spadding smooth");
    if (scope.shapeChange){
      shapeWrap.addClass("hover2");
    }
    if (scope.selected == i) {
      shapeWrap.addClass(scope.selectedClass || "highlight");
    }

    var shape = buildShape(shapes[i], scope.color || "", scope.size);
    shape.appendTo(shapeWrap);
    shape.css("pointer-events", "auto");
    shape.css("cursor", "pointer");
    shape.attr("index", i);
    shape.click(function(ev){
      if (scope.shapeChange){
        scope.shapeChange(ev, $(this), shapes[$(this).attr("index")]);
      }
    });
  }

  return div;
});

sync.render("ui_colorPicker", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn");

  var color = [255,255,255,1];
  if (scope.color && scope.color.length >= 4 && scope.color[0]=="r" && scope.color[1]=="g" && scope.color[2]=="b") {
    var tempCol = scope.color.replace("rgba(", "");
    tempCol = tempCol.replace("rgb(", "");
    tempCol = tempCol.substring(0, tempCol.length-1);
    color = tempCol.split(",");
  }
  function buildPreview(parent, colr, ev) {
    parent.empty();

    var breakdownR = $("<div>").appendTo(parent);
    breakdownR.addClass("flexrow flexmiddle");
    breakdownR.append("<text class='lrpadding'>R</text>")
    var r = genInput({
      parent : breakdownR,
      type : "number",
      value : color[0],
      max : 255,
      min : 0,
      style : {"width" : "50px", "color" : "#333", "text-shadow" : "none"}
    }).addClass("lrpadding subtitle");
    r.keyup(function(){
      color[0] = Math.min($(this).val(),255);
      colBlock.css("background-color", "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      if (scope.update && scope.colorChange) {
        scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      }
    });

    var breakdownG = $("<div>").appendTo(parent);
    breakdownG.addClass("flexrow flexmiddle");
    breakdownG.append("<text class='lrpadding'>G</text>")
    var g = genInput({
      parent : breakdownG,
      type : "number",
      value : color[1],
      max : 255,
      min : 0,
      style : {"width" : "50px", "color" : "#333", "text-shadow" : "none"}
    }).addClass("lrpadding subtitle");
    g.keyup(function(){
      color[1] = Math.min($(this).val(), 255);
      colBlock.css("background-color", "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      if (scope.update && scope.colorChange) {
        scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      }
    });

    var breakdownB = $("<div>").appendTo(parent);
    breakdownB.addClass("flexrow flexmiddle");
    breakdownB.append("<text class='lrpadding'>B</text>")
    var b = genInput({
      parent : breakdownB,
      type : "number",
      value : color[2],
      max : 255,
      min : 0,
      style : {"width" : "50px", "color" : "#333", "text-shadow" : "none"}
    }).addClass("lrpadding subtitle");
    b.keyup(function(){
      color[2] = Math.min($(this).val(), 255);
      colBlock.css("background-color", "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      if (scope.update && scope.colorChange) {
        scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      }
    });

    var breakdownA = $("<div>").appendTo(parent);
    breakdownA.addClass("flexrow flexmiddle");
    breakdownA.append("<text class='lrpadding'>A</text>")
    var a = genInput({
      parent : breakdownA,
      type : "number",
      value : color[3],
      max : 1.0,
      min : 0,
      style : {"width" : "50px", "color" : "#333", "text-shadow" : "none"}
    }).addClass("lrpadding subtitle");
    a.keyup(function(){
      color[3] = Math.min(Math.ceil($(this).val()*100)/100, 1.0);
      colBlock.css("background-color", "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      if (scope.update && scope.colorChange) {
        scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
      }
    });

    var container = $("<div>").appendTo(parent);
    container.addClass("flexrow flexbetween");

    var previewColor = $("<div>").appendTo(container);
    previewColor.addClass("flexcolumn flexaround");
    previewColor.css("width", "25px");
    previewColor.css("height", "25px");
    previewColor.css("background-image", "url('/content/checkered.png')");
    previewColor.css("background-size", "100% 100%");

    var colBlock = $("<div>").appendTo(previewColor);
    colBlock.css("background-color", "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
    colBlock.addClass("flex outline");
    if (!scope.update) {
      var confirm = $("<button>").appendTo(container);
      confirm.addClass("highlight alttext smooth");
      confirm.css("margin-left", "0.25em");
      confirm.append("Confirm");
      confirm.click(function(ev){
        if (scope.colorChange) {
          scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
        }
      });
    }
    else if (scope.update && scope.colorChange && ev) {
      scope.colorChange(ev, $(this), "rgba("+color[0]+","+color[1]+","+color[2]+","+((color.length==4)?(color[3]):(1.0))+")");
    }
  }

  var colorPicker = $("<div>").appendTo(div);
  colorPicker.addClass("flexcolumn flexbetween");

  var colSelect = $("<div>").appendTo(colorPicker);
  colSelect.addClass("flexcolumn");

  var colorCode = genInput({
    parent : colSelect,
    placeholder : "Color Code",
    value : scope.color,
  }).addClass("subtitle");
  colorCode.change(function(ev){
    if (scope.colorChange) {
      scope.colorChange(ev, $(this), $(this).val());
    }
  });
  if (scope.hideColor) {
    colorCode.hide();
  }
  var colDiv = $("<div>").appendTo(colSelect);
  colDiv.addClass("fit-x");
  if (!scope.vertical) {
    colDiv.addClass("flexrow flexwrap");
  }
  else {
    colDiv.addClass("flexcolumn flexmiddle");
  }
  var cols = scope.colors || [
    "rgba(34,34,34,1)",
    "rgba(187,0,0,1)",
    "rgba(255,153,0,1)",
    "rgba(255,240,0,1)",
    "rgba(0,187,0,1)",
    "rgba(0,115,230,1)",
    "rgba(176,0,187,1)",
    "rgba(255,115,255,1)",
    "rgba(255,255,255,1)",
    /*"rgb(230, 0, 0)",
    "rgb(230, 57, 0)",
    "rgb(230, 115, 0)",
    "rgb(230, 138, 0)",
    "rgb(230, 172, 0)",
    "rgb(230, 230, 0)",
    "rgb(172, 230, 0)",
    "rgb(115, 230, 0)",
    "rgb(57, 230, 0)",
    "rgb(0, 230, 0)",
    "rgb(0, 230, 57)",
    "rgb(0, 230, 115)",
    "rgb(0, 230, 172)",
    "rgb(0, 230, 230)",
    "rgb(0, 172, 230)",
    "rgb(0, 115, 230)",
    "rgb(0, 57, 230)",
    "rgb(0, 0, 230)",
    "rgb(57, 0, 230)",
    "rgb(115, 0, 230)",
    "rgb(172, 0, 230)",
    "rgb(230, 0, 230)",
    "rgb(230, 0, 172)",
    "rgb(230, 0, 115)",
    "rgb(230, 0, 57)",
    "rgb(230, 0, 0)",*/
    "rgba(0,0,0,0)"
  ];

  for (var c in cols) {
    var col = $("<div>").appendTo(colDiv);
    col.addClass("smooth smargin");
    col.css("cursor", "pointer");
    col.attr("index", c);

    var previewCol = $("<div>").appendTo(col);
    previewCol.addClass("smooth");
    previewCol.css("pointer-events", "none");
    previewCol.css("background-image", "url('/content/checkered.png')");
    previewCol.css("background-size", "100% 100%");


    var previewCol = $("<div>").appendTo(previewCol);
    previewCol.addClass("outline");
    previewCol.css("background", cols[c]);
    previewCol.css("pointer-events", "none");
    if (scope.small) {
      previewCol.addClass("padding");
    }
    else {
      previewCol.addClass("lpadding");
    }

    col.click(function(ev){
      colorCode.val(cols[$(this).attr("index")]);
      colorCode.change();
    });
  }

  var colorPickerWrap = $("<div>").appendTo(colorPicker);
  colorPickerWrap.addClass("flexrow flexaround");

  if (!scope.custom) {
    colorPickerWrap.hide();
    if (scope.custom !== false) {
      if (!scope.vertical) {
        var showCustomWrap = $("<div>").appendTo(colDiv);
        showCustomWrap.addClass("flexmiddle lrmargin");
        var showCustom = genIcon("tint", "Custom").appendTo(showCustomWrap);
        showCustom.click(function(){
          colorPickerWrap.show();
          showCustomWrap.remove();
          colDiv.remove();
        });
      }
    }
  }

  var body = $("<div>").appendTo(colorPickerWrap);
  body.addClass("outline smooth");
  body.css("background", "linear-gradient(to right, white, "+(scope.color || "white")+")");
  body.css("width", "100px");
  body.css("height", "100px");

  var darkness = $("<div>").appendTo(body);
  darkness.css("width", "100px");
  darkness.css("height", "100px");
  darkness.css("background", "linear-gradient(to top, black, transparent)");
  darkness.css("position", "relative");
  darkness.css("cursor", "pointer");

  var caret = $("<div>").appendTo(darkness);
  caret.css("pointer-events", "none");
  caret.css("left", "0");
  caret.css("top", "0");
  caret.css("position", "absolute");
  caret.css("background", "radial-gradient(transparent, transparent, transparent, black, white, black, transparent, transparent, transparent)");
  caret.css("width", "10px");
  caret.css("height", "10px");

  darkness.mousedown(function(ev){
    $(this).attr("moving", true);
    caret.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-5, -5));
    caret.css("left", Math.max(Math.min(ev.offsetX, $(this).width())-5, -5));
    var pX = Math.max(Math.min((ev.offsetX/$(this).width()), 1), 0);
    var pXX = 0.5-0.5*pX;
    var pY = -0.5*Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);

    color = util.HSL_RGB(util.RGB_HSL(color[0], color[1], color[2])[0], pX, 0.5+pY+pXX, color[3]);
    buildPreview(previewDiv, color, ev);
    ev.preventDefault();
  });
  darkness.mousemove(function(ev){
    if ($(this).attr("moving")) {
      caret.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-5, -5));
      caret.css("left", Math.max(Math.min(ev.offsetX, $(this).width())-5, -5));
      var pX = Math.max(Math.min((ev.offsetX/$(this).width()), 1), 0);
      var pXX = 0.5-0.5*pX;
      var pY = -0.5*Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);

      color = util.HSL_RGB(util.RGB_HSL(color[0], color[1], color[2])[0], pX, 0.5+pY+pXX, color[3]);
      buildPreview(previewDiv, color);
    }
    ev.preventDefault();
  });
  darkness.mouseup(function(ev){
    if ($(this).attr("moving")) {
      caret.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-5, -5));
      caret.css("left", Math.max(Math.min(ev.offsetX, $(this).width())-5, -5));
      var pX = Math.max(Math.min((ev.offsetX/$(this).width()), 1), 0);
      var pXX = 0.5-0.5*pX;
      var pY = -0.5*Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);

      color = util.HSL_RGB(util.RGB_HSL(color[0], color[1], color[2])[0], pX, 0.5+pY+pXX, color[3]);
      buildPreview(previewDiv, color, ev);
    }

    $(this).removeAttr("moving");
    ev.preventDefault();
  });
  darkness.mouseout(function(ev){
    if ($(this).attr("moving")) {
      caret.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-5, -5));
      caret.css("left", Math.max(Math.min(ev.offsetX, $(this).width())-5, -5));
      var pX = Math.max(Math.min((ev.offsetX/$(this).width()), 1), 0);
      var pXX = 0.5-0.5*pX;
      var pY = -0.5*Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);

      color = util.HSL_RGB(util.RGB_HSL(color[0], color[1], color[2])[0], pX, 0.5+pY+pXX, color[3]);
      buildPreview(previewDiv, color, ev);
    }
    $(this).removeAttr("moving");
    ev.preventDefault();
  });

  var hue = $("<div>").appendTo(colorPickerWrap);
  hue.addClass("outline smooth");
  hue.css("width", "20px");
  hue.css("height", "100px");
  hue.css("background", "linear-gradient(to top, hsl(0, 100%, 50%), hsl(45, 100%, 50%), hsl(90, 100%, 50%), hsl(135, 100%, 50%), hsl(180, 100%, 50%), hsl(225, 100%, 50%), hsl(270, 100%, 50%), hsl(315, 100%, 50%), hsl(360, 100%, 50%))");
  hue.css("margin-left", "0.5em");
  hue.css("margin-right", "0.5em");
  hue.css("position", "relative");
  hue.css("cursor", "pointer");

  var caretHue = $("<div>").appendTo(hue);
  caretHue.css("pointer-events", "none");
  caretHue.css("left", "0");
  caretHue.css("top", "0");
  caretHue.css("position", "absolute");
  caretHue.css("background", "white")
  caretHue.css("width", "100%");
  caretHue.css("height", "4px");
  caretHue.addClass("outline");

  hue.mousedown(function(ev){
    $(this).attr("moving", true);
    caretHue.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
    var percentage = Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
    ev.preventDefault();
  });
  hue.mousemove(function(ev){
    if ($(this).attr("moving")) {
      caretHue.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var percentage = Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      body.css("background", "linear-gradient(to right, white, hsl("+(360-Math.floor(percentage * 360))+", 100%, 50%)");
      color = util.HSL_RGB((360-Math.floor(percentage * 360))/360, 1, 0.5, color[3]);
      buildPreview(previewDiv, color, ev);
    }
    ev.preventDefault();
  });
  hue.mouseup(function(ev){
    if ($(this).attr("moving")) {
      caretHue.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var percentage = Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      body.css("background", "linear-gradient(to right, white, hsl("+(360-Math.floor(percentage * 360))+", 100%, 50%)");
      color = util.HSL_RGB((360-Math.floor(percentage * 360))/360, 1, 0.5, color[3]);
      buildPreview(previewDiv, color, ev);
    }
    $(this).removeAttr("moving");
    ev.preventDefault();
  });
  hue.mouseout(function(ev){
    if ($(this).attr("moving")) {
      caretHue.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var percentage = Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      body.css("background", "linear-gradient(to right, white, hsl("+(360-Math.floor(percentage * 360))+", 100%, 50%)");
      color = util.HSL_RGB((360-Math.floor(percentage * 360))/360, 1, 0.5, color[3]);
      buildPreview(previewDiv, color, ev);
    }
    $(this).removeAttr("moving");
    ev.preventDefault();
  });

  var alpha = $("<div>").appendTo(colorPickerWrap);
  alpha.addClass("smooth");
  alpha.css("width", "20px");
  alpha.css("height", "100px");
  alpha.css("background-image", "url('/content/checkered.png')");
  alpha.css("margin-left", "0.5em");
  alpha.css("margin-right", "0.5em");

  var alpha = $("<div>").appendTo(alpha);
  alpha.addClass("outline smooth");
  alpha.css("width", "100%");
  alpha.css("height", "100px");
  alpha.css("background", "linear-gradient(to top, transparent, white)");
  alpha.css("position", "relative");
  alpha.css("cursor", "pointer");

  var caretAlpha = $("<div>").appendTo(alpha);
  caretAlpha.css("pointer-events", "none");
  caretAlpha.css("left", "0");
  caretAlpha.css("top", "0");
  caretAlpha.css("position", "absolute");
  caretAlpha.css("background", "white")
  caretAlpha.css("width", "100%");
  caretAlpha.css("height", "4px");
  caretAlpha.addClass("outline");

  alpha.mousedown(function(ev){
    $(this).attr("moving", true);
    caretAlpha.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
    ev.preventDefault();
  });
  alpha.mousemove(function(ev){
    if ($(this).attr("moving")) {
      caretAlpha.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var opacity = 1-Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      color[3] = Math.min(Math.ceil(opacity*100)/100, 1.0);
      buildPreview(previewDiv, color, ev);
    }
    ev.preventDefault();
  });
  alpha.mouseup(function(ev){
    if ($(this).attr("moving")) {
      caretAlpha.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var opacity = 1-Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      color[3] = Math.min(Math.ceil(opacity*100)/100, 1.0);;
      buildPreview(previewDiv, color, ev);
    }
    $(this).removeAttr("moving");
    ev.preventDefault();
  });
  alpha.mouseout(function(ev){
    if ($(this).attr("moving")) {
      caretAlpha.css("top", Math.max(Math.min(ev.offsetY, $(this).height())-2, 0));
      var opacity = 1-Math.max(Math.min((ev.offsetY/$(this).height()), 1), 0);
      color[3] = Math.min(Math.ceil(opacity*100)/100, 1.0);;
      buildPreview(previewDiv, color, ev);
    }
    $(this).removeAttr("moving");
    ev.preventDefault();
  });

  var previewDiv = $("<div>").appendTo(colorPickerWrap);
  previewDiv.addClass("flexcolumn flexmiddle");

  buildPreview(previewDiv, color);

  return div;
});

sync.render("ui_drawingControls", function(obj, app, scope){
  var data = obj.data;

  var board = getEnt($("#"+app.attr("targetApp")).attr("index"));
  var row = $("<div>");
  row.addClass("flexrow flexbetween fit-xy");
  if (!data.fog) {
    var drawingWrap = $("<div>").appendTo(row);
    drawingWrap.addClass("flexcolumn middle");

    drawingWrap.append("<b class='underline' style='font-size:1.2em'>Tools</b>");

    var drawingMode = genIcon("unchecked", "Box");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle spadding");
    drawingMode.attr("title", "Box");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "box") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "box") {
        data.drawing = "box";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });

    var drawingMode = genIcon("adjust", "Circle");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle spadding");
    drawingMode.attr("title", "Circle");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "circle") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "circle") {
        data.drawing = "circle";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });

    var drawingMode = genIcon("pencil", "Line");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle spadding");
    drawingMode.attr("title", "Line");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "line") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "line") {
        data.drawing = "line";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });

    var drawingMode = genIcon("certificate", "Region");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle spadding");
    drawingMode.attr("title", "Region");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "region") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "region") {
        data.drawing = "region";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });

    var drawingMode = genIcon("font", "Text");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle spadding");
    drawingMode.attr("title", "Text");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "text") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "text") {
        data.drawing = "text";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });


    /*var drawingMode = genIcon("unchecked");
    drawingMode.appendTo(row);
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (!isNaN(data.drawing)) {
      drawingMode.addClass("highlight");
    }
    drawingMode.click(function(){
      var content = $("<div>");

      var primaryCol = sync.render("ui_shapePicker")(obj, app, {
        color : "white",
        shapeChange : function(ev, ui, newShape) {
          if (isNaN(data.drawing)) {
            data.drawing = newShape;
          }
          else {
            delete data.drawing;
          }
          obj.update();
          layout.coverlay("draw-shape");
          layout.coverlay("draw-color");
          obj.target = app.attr("targetApp");
        }
      }).appendTo(content);

      ui_popOut({
        target : $(this),
        id : "draw-shape",
      }, content);
    });*/

    drawingWrap.append("<div class='flex'></div>");

    /*var drawingMode = genIcon("erase", "Erase");
    drawingMode.appendTo(drawingWrap);
    drawingMode.addClass("subtitle");
    drawingMode.attr("title", "Eraser");
    drawingMode.css("padding-left", "2px");
    drawingMode.css("padding-right", "2px");
    if (data.drawing == "erase") {
      drawingMode.addClass("highlight alttext smooth");
    }
    drawingMode.click(function(){
      if (data.drawing != "erase") {
        data.drawing = "erase";
      }
      else {
        delete data.drawing;
      }
      obj.update();
      layout.coverlay("draw-shape");
      layout.coverlay("draw-color");
      obj.target = app.attr("targetApp");
    });*/



    if (board && hasSecurity(getCookie("UserID"), "Rights", board.data)) {
      var drawingMode = genIcon("trash", "Reset");
      drawingMode.appendTo(drawingWrap);
      drawingMode.addClass("subtitle destroy");
      drawingMode.attr("title", "Clear drawings on this layer");
      drawingMode.css("padding-left", "2px");
      drawingMode.css("padding-right", "2px");
      drawingMode.click(function(){
        var layer = $("#"+app.attr("targetApp")).attr("layer");
        var button = $("<button>");
        button.addClass("highlight alttext");
        button.css("font-size", "1.6em");
        button.append("Clear Drawings");
        button.click(function(){
          board.data.layers[layer].d = [];
          board.sync("updateAsset");

          delete data.drawing;
          obj.update();
          layout.coverlay("clear-strokes");
        });

        var pop = ui_popOut({
          target : $(this),
          id : "clear-strokes",
          hideclose : true,
          noCss : true,
          prompt : true,
        }, button);
      });
    }
    if (obj.data.drawing == "text") {
      var drawingWrap = $("<div>").appendTo(row);
      drawingWrap.addClass("flexcolumn");
      drawingWrap.css("font-size", "0.6em");

      sync.render("ui_textEdit")(obj, app, scope).appendTo(drawingWrap);
    }
    else {
      var drawingWrap = $("<div>").appendTo(row);
      drawingWrap.addClass("flexcolumn spadding");
      drawingWrap.css("width", "400px");

      var colorRow = $("<div>").appendTo(drawingWrap);
      colorRow.addClass("flexrow");

      var drawColor = $("<div>");
      drawColor.appendTo(colorRow);
      drawColor.addClass("smargin lrpadding hover2 outline smooth bold flexmiddle");
      drawColor.attr("title", "Primary Color");
      drawColor.css("background-color", data.primary || "transparent");
      drawColor.text("Primary Color");
      drawColor.click(function(){
        colorPicker.empty();
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : false,
          colors : [
            "rgb(180, 0, 0)",
            "rgb(180, 7, 0)",
            "rgb(180, 65, 0)",
            "rgb(180, 88, 0)",
            "rgb(180, 122, 0)",
            "rgb(180, 130, 0)",
            "rgb(172, 130, 0)",
            "rgb(115, 130, 0)",
            "rgb(57, 130, 0)",
            "rgb(0, 130, 0)",
            "rgb(0, 13, 7)",
            "rgb(0, 13, 65)",
            "rgb(0, 13, 122)",
            "rgb(0, 13, 130)",
            "rgb(0, 172, 130)",
            "rgb(0, 115, 130)",
            "rgb(0, 57, 130)",
            "rgb(0, 0, 130)",
            "rgb(7, 0, 130)",
            "rgb(65, 0, 130)",
            "rgb(122, 0, 130)",
            "rgb(180, 0, 130)",
            "rgb(180, 0, 122)",
            "rgb(180, 0, 65)",
            "rgb(180, 0, 7)",
            "rgb(230, 0, 0)",
            "rgb(230, 57, 0)",
            "rgb(230, 115, 0)",
            "rgb(230, 138, 0)",
            "rgb(230, 172, 0)",
            "rgb(230, 230, 0)",
            "rgb(172, 230, 0)",
            "rgb(115, 230, 0)",
            "rgb(57, 230, 0)",
            "rgb(0, 230, 0)",
            "rgb(0, 230, 57)",
            "rgb(0, 230, 115)",
            "rgb(0, 230, 172)",
            "rgb(0, 230, 230)",
            "rgb(0, 172, 230)",
            "rgb(0, 115, 230)",
            "rgb(0, 57, 230)",
            "rgb(0, 0, 230)",
            "rgb(57, 0, 230)",
            "rgb(115, 0, 230)",
            "rgb(172, 0, 230)",
            "rgb(230, 0, 230)",
            "rgb(230, 0, 172)",
            "rgb(230, 0, 115)",
            "rgb(230, 0, 57)",
            "rgba(230, 0, 0, 0.5)",
            "rgba(230, 57, 0, 0.5)",
            "rgba(230, 115, 0, 0.5)",
            "rgba(230, 138, 0, 0.5)",
            "rgba(230, 172, 0, 0.5)",
            "rgba(230, 230, 0, 0.5)",
            "rgba(172, 230, 0, 0.5)",
            "rgba(115, 230, 0, 0.5)",
            "rgba(57, 230, 0, 0.5)",
            "rgba(0, 230, 0, 0.5)",
            "rgba(0, 230, 57, 0.5)",
            "rgba(0, 230, 115, 0.5)",
            "rgba(0, 230, 172, 0.5)",
            "rgba(0, 230, 230, 0.5)",
            "rgba(0, 172, 230, 0.5)",
            "rgba(0, 115, 230, 0.5)",
            "rgba(0, 57, 230, 0.5)",
            "rgba(0, 0, 230, 0.5)",
            "rgba(57, 0, 230, 0.5)",
            "rgba(115, 0, 230, 0.5)",
            "rgba(172, 0, 230, 0.5)",
            "rgba(230, 0, 230, 0.5)",
            "rgba(230, 0, 172, 0.5)",
            "rgba(230, 0, 115, 0.5)",
            "rgba(230, 0, 57, 0.5)",
          ],
          colorChange : function(ev, ui, value){
            var col = value;
            drawColor.css("background-color", col);
            obj.data.primary = col;
            obj.target = app.attr("targetApp");
            if (data.drawing == "line") {
              layout.coverlay("draw-color");
            }
          }
        }).appendTo(colorPicker);

        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : false,
          colors : [
            "rgba(0,0,0,0)",
            "rgba(34,34,34,0.5)",
            "rgba(155,155,155,0.5)",
            "rgba(255,255,255,0.5)",
            "rgba(255,255,255,1)",
            "rgba(155,155,155,1)",
            "rgba(34,34,34,1)",
          ],
          colorChange : function(ev, ui, value){
            var col = value;
            drawColor.css("background-color", col);
            obj.data.primary = col;
            obj.target = app.attr("targetApp");
            if (data.drawing == "line") {
              layout.coverlay("draw-color");
            }
          }
        }).appendTo(colorPicker);
      });

      var colorPicker = $("<div>").appendTo(drawingWrap);
      colorPicker.css("font-size", "0.4em");
      colorPicker.addClass("lpadding");

      drawColor.click();

      var drawColorSec = $("<div>");
      drawColorSec.appendTo(colorRow);
      drawColorSec.addClass("smargin lrpadding hover2 outline smooth subtitle bold flexmiddle");
      drawColorSec.attr("title", "Secondary Color");
      drawColorSec.css("background-color", data.secondary || "transparent");
      drawColorSec.text("Secondary Color");
      drawColorSec.click(function(){
        colorPicker.empty();
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : false,
          colors : [
            "rgb(180, 0, 0)",
            "rgb(180, 7, 0)",
            "rgb(180, 65, 0)",
            "rgb(180, 88, 0)",
            "rgb(180, 122, 0)",
            "rgb(180, 130, 0)",
            "rgb(172, 130, 0)",
            "rgb(115, 130, 0)",
            "rgb(57, 130, 0)",
            "rgb(0, 130, 0)",
            "rgb(0, 13, 7)",
            "rgb(0, 13, 65)",
            "rgb(0, 13, 122)",
            "rgb(0, 13, 130)",
            "rgb(0, 172, 130)",
            "rgb(0, 115, 130)",
            "rgb(0, 57, 130)",
            "rgb(0, 0, 130)",
            "rgb(7, 0, 130)",
            "rgb(65, 0, 130)",
            "rgb(122, 0, 130)",
            "rgb(180, 0, 130)",
            "rgb(180, 0, 122)",
            "rgb(180, 0, 65)",
            "rgb(180, 0, 7)",
            "rgb(230, 0, 0)",
            "rgb(230, 57, 0)",
            "rgb(230, 115, 0)",
            "rgb(230, 138, 0)",
            "rgb(230, 172, 0)",
            "rgb(230, 230, 0)",
            "rgb(172, 230, 0)",
            "rgb(115, 230, 0)",
            "rgb(57, 230, 0)",
            "rgb(0, 230, 0)",
            "rgb(0, 230, 57)",
            "rgb(0, 230, 115)",
            "rgb(0, 230, 172)",
            "rgb(0, 230, 230)",
            "rgb(0, 172, 230)",
            "rgb(0, 115, 230)",
            "rgb(0, 57, 230)",
            "rgb(0, 0, 230)",
            "rgb(57, 0, 230)",
            "rgb(115, 0, 230)",
            "rgb(172, 0, 230)",
            "rgb(230, 0, 230)",
            "rgb(230, 0, 172)",
            "rgb(230, 0, 115)",
            "rgb(230, 0, 57)",
            "rgba(230, 0, 0, 0.5)",
            "rgba(230, 57, 0, 0.5)",
            "rgba(230, 115, 0, 0.5)",
            "rgba(230, 138, 0, 0.5)",
            "rgba(230, 172, 0, 0.5)",
            "rgba(230, 230, 0, 0.5)",
            "rgba(172, 230, 0, 0.5)",
            "rgba(115, 230, 0, 0.5)",
            "rgba(57, 230, 0, 0.5)",
            "rgba(0, 230, 0, 0.5)",
            "rgba(0, 230, 57, 0.5)",
            "rgba(0, 230, 115, 0.5)",
            "rgba(0, 230, 172, 0.5)",
            "rgba(0, 230, 230, 0.5)",
            "rgba(0, 172, 230, 0.5)",
            "rgba(0, 115, 230, 0.5)",
            "rgba(0, 57, 230, 0.5)",
            "rgba(0, 0, 230, 0.5)",
            "rgba(57, 0, 230, 0.5)",
            "rgba(115, 0, 230, 0.5)",
            "rgba(172, 0, 230, 0.5)",
            "rgba(230, 0, 230, 0.5)",
            "rgba(230, 0, 172, 0.5)",
            "rgba(230, 0, 115, 0.5)",
            "rgba(230, 0, 57, 0.5)",
          ],
          colorChange : function(ev, ui, value){
            var col = value;
            drawColorSec.css("background-color", col);
            obj.data.secondary = col;
            obj.target = app.attr("targetApp");
            if (data.drawing == "line") {
              layout.coverlay("draw-color");
            }
          }
        }).appendTo(colorPicker);
      });
    }
  }
  else {
    if ((!board.data.options || !board.data.options.fog) && hasSecurity(getCookie("UserID"), "Rights", board.data)) {
      row.addClass("flexmiddle flex");

      var drawingMode = genIcon("cloud", "Enable Fog of War");
      drawingMode.appendTo(row);
      drawingMode.attr("title", "Enable Manual Fog of War");
      drawingMode.css("padding-left", "2px");
      drawingMode.css("padding-right", "2px");
      drawingMode.click(function(){
        obj.data.fog = true;
        delete obj.data.drawing;
        obj.update();

        board.data.options = board.data.options || {};
        board.data.options.fog = true;
        board.sync("updateAsset");
      });
    }
    else {
      var drawingWrap = $("<div>").appendTo(row);
      drawingWrap.addClass("flexcolumn middle");

      drawingWrap.append("<b class='underline' style='font-size:1.2em;'>Fog of War</b>");

      if (board && hasSecurity(getCookie("UserID"), "Game Master")) {
        var drawingMode = genIcon("unchecked", "Reveal/Hide");
        drawingMode.appendTo(drawingWrap);
        drawingMode.addClass("subtitle spadding");
        drawingMode.attr("title", "Reveal Area");
        drawingMode.css("padding-left", "2px");
        drawingMode.css("padding-right", "2px");
        if (data.drawing == "box") {
          drawingMode.addClass("highlight alttext smooth");
          drawingWrap.append("<i class='spadding' style='font-size:0.6em;'>Hold alt to hide area</i>");
        }
        drawingMode.click(function(){
          if (data.drawing != "box") {
            data.drawing = "box";
          }
          else {
            delete data.drawing;
          }
          obj.data.fog = true;
          obj.update();
          layout.coverlay("draw-shape");
          layout.coverlay("draw-color");
          obj.target = app.attr("targetApp");
        });

        var drawingMode = genIcon("pencil", "Draw Wall");
        drawingMode.appendTo(drawingWrap);
        drawingMode.addClass("subtitle spadding");
        drawingMode.attr("title", "Draw a Solid Wall");
        drawingMode.css("padding-left", "2px");
        drawingMode.css("padding-right", "2px");
        if (data.drawing == "line") {
          drawingMode.addClass("highlight alttext smooth");
        }
        drawingMode.click(function(){
          if (data.drawing != "line") {
            data.drawing = "line";
            sendAlert({text : "Chain Walls by holding ctrl"});
          }
          else {
            delete data.drawing;
          }
          obj.update();
          layout.coverlay("draw-shape");
          layout.coverlay("draw-color");
          obj.target = app.attr("targetApp");
        });

        var drawingMode = genIcon("tint", "Fog Color");
        drawingMode.appendTo(drawingWrap);
        drawingMode.addClass("subtitle spadding");
        drawingMode.attr("title", "Select Fog Color");
        drawingMode.css("padding-left", "2px");
        drawingMode.css("padding-right", "2px");
        drawingMode.click(function(){
          var optionList = [];

          optionList.push({
            name : "White",
            style : {fogcolor : "rgba(255,255,255,1)"},
            click : function(ev, ui){
              board.data.c = "rgba(255,255,255,1)";
              board.sync("updateAsset");
            },
          });

          optionList.push({
            name : "White (Transparent)",
            style : {fogcolor : "rgba(255,255,255,0.5)"},
            click : function(ev, ui){
              board.data.c = "rgba(255,255,255,0.5)";
              board.sync("updateAsset");
            },
          });

          optionList.push({
            name : "Grey",
            style : {fogcolor : "rgba(155,155,155,1)"},
            click : function(ev, ui){
              board.data.c = "rgba(155,155,155,1)";
              board.sync("updateAsset");
            },
          });

          optionList.push({
            name : "Grey (Transparent)",
            style : {fogcolor : "rgba(155,155,155,0.5)"},
            click : function(ev, ui){
              board.data.c = "rgba(155,155,155,0.5)";
              board.sync("updateAsset");
            },
          });

          optionList.push({
            name : "Black",
            style : {fogcolor : "rgba(5,5,5,1)"},
            click : function(ev, ui){
              board.data.c = "rgba(5,5,5,1)";
              board.sync("updateAsset");
            },
          });

          optionList.push({
            name : "Black (Transparent)",
            style : {fogcolor : "rgba(5,5,5,0.5)"},
            click : function(ev, ui){
              board.data.c = "rgba(5,5,5,0.5)";
              board.sync("updateAsset");
            },
          });


          optionList.push({
            icon : "cog",
            name : "Custom",
            click : function(ev, ui){
              var primaryCol = sync.render("ui_colorPicker")(obj, app, {
                hideColor : true,
                custom : true,
                colorChange : function(ev, ui, value){
                  board.data.c = value;
                  board.sync("updateAsset");
                  layout.coverlay("grid-color");
                }
              });

              ui_popOut({
                target : ui,
                id : "grid-color",
              }, primaryCol);
            },
          });
          var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true});
          menu.removeClass("outline");
        });

        drawingWrap.append("<div class='flex'></div>");
        var drawingMode = genIcon("trash", "Reset Layer");
        drawingMode.appendTo(drawingWrap);
        drawingMode.addClass("subtitle destroy");
        drawingMode.attr("title", "Clear all fog on layer");
        drawingMode.css("padding-left", "2px");
        drawingMode.css("padding-right", "2px");
        drawingMode.click(function(){
          var button = $("<button>");
          button.addClass("highlight alttext");
          button.css("font-size", "1.6em");
          button.append("Reset Layer");
          button.click(function(){
            var layer = $("#"+app.attr("targetApp")).attr("layer");
            if (board.data.layers[layer]) {
              board.data.layers[layer].r = [];
              board.data.layers[layer].w = [];
            };
            boardApi.pix.updateLayer(layer, {r : true, w : 0}, board, "destroy");
            obj.sync("updateAsset");
            layout.coverlay("clear-strokes");
          });

          var pop = ui_popOut({
            target : $(this),
            id : "clear-strokes",
            hideclose : true,
            noCss : true,
            prompt : true,
          }, button);
        });

        var drawingMode = genIcon("remove", "Disable Fog");
        drawingMode.appendTo(drawingWrap);
        drawingMode.addClass("subtitle destroy");
        drawingMode.attr("title", "Disable Manual Fog");
        drawingMode.css("padding-left", "2px");
        drawingMode.css("padding-right", "2px");
        drawingMode.click(function(){
          var button = $("<button>");
          button.addClass("highlight alttext");
          button.css("font-size", "1.6em");
          button.append("Disable Fog");
          button.click(function(){
            obj.data.fog = false;
            delete obj.data.drawing;
            obj.update();

            board.data.options = board.data.options || {};
            delete board.data.options.fog;
            board.sync("updateAsset");
            layout.coverlay("clear-strokes");
          });

          var pop = ui_popOut({
            target : $(this),
            id : "clear-strokes",
            hideclose : true,
            noCss : true,
            prompt : true,
          }, button);
        });
      }
    }
  }

  return row;
});
