sync.render("ui_textEdit", function(obj, app, scope){
  scope = scope || {}

  var board = getEnt($("#"+app.attr("targetApp")).attr("index"));

  var data = obj.data;
  obj.data.label = obj.data.label || {
    text : "",
    style : {
      fontFamily: "Arial",
      fontSize : 26,
      fill: "white",
      stroke: "transparent",
      strokeThickness: 0,
      dropShadow: true,
      dropShadowBlur: 3,
      dropShadowDistance : 0,
    }
  };
  var style = obj.data.label.style;
  var hasRights = hasSecurity(getCookie("UserID"), "Rights", data) || hasSecurity(getCookie("UserID"), "Game Master");

  var content = $("<div>");
  content.addClass("flexcolumn");

  var textWrap = $("<div>").appendTo(content);
  textWrap.addClass("flexrow");

  var text = genInput({
    parent : textWrap,
    classes : "flex middle size3",
    placeholder : "Enter Text Here",
    value : obj.data.label.text,
    style : {"color" : "#333"}
  });
  text.change(function(){
    game.locals["drawing"].data.label.text = $(this).val();
  });


  var weightWrap = $("<div>").appendTo(content);
  weightWrap.addClass("flexrow flexaround flexwrap size2");

  var textWrap = $("<div>").appendTo(weightWrap);
  textWrap.addClass("flexrow flexmiddle");

  var col = genIcon("", "Font Size").appendTo(textWrap);
  col.addClass("lrpadding lrmargin");

  var size = genInput({
    parent : textWrap,
    type : "number",
    classes : "lrmargin middle",
    min : 8,
    value : style.fontSize || 26,
    style : {"width" : "70px", color : "#333"}
  });
  size.change(function(){
    game.locals["drawing"].data.label.style.fontSize = Number($(this).val());
  });

  var textWrap = $("<div>").appendTo(weightWrap);
  textWrap.addClass("flexrow");

  var col = genIcon("", "Font").appendTo(textWrap);
  col.addClass("lrpadding lrmargin");

  var select = $("<select>").appendTo(textWrap);
  select.css("color", "#333");
  select.css("width", "130px");
  for (var i in util.fonts) {
    var option = $("<option>").appendTo(select);
    option.attr("value", util.fonts[i]);
    option.text(util.fonts[i]);
    if (style.fontFamily == util.fonts[i]) {
      option.attr("selected", true);
    }
  }
  select.change(function(){
    obj.data.label.style.fontFamily = $(this).val();
  });

  var alignWrap = $("<div>")//.appendTo(weightWrap);
  alignWrap.addClass("lrpadding lrmargin")
  var left = genIcon("align-left").appendTo(alignWrap);
  var center = genIcon("align-center").appendTo(alignWrap);
  var right = genIcon("align-right").appendTo(alignWrap);

  var colorWrap = $("<div>").appendTo(content);
  colorWrap.addClass("flexrow flexbetween lrpadding lrmargin");

  var optionWrap = $("<div>").appendTo(colorWrap);
  optionWrap.addClass("flexcolumn");

  var col = genIcon("text-background", "Color").appendTo(optionWrap);
  col.click(function(){
    colorPicker.empty();
    optionWrap.children().removeClass("highlight");
    $(this).addClass("highlight");
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
        "rgba(0,0,0,0)",
        "rgba(34,34,34,0.5)",
        "rgba(155,155,155,0.5)",
        "rgba(255,255,255,0.5)",
        "rgba(255,255,255,1)",
        "rgba(155,155,155,1)",
        "rgba(34,34,34,1)",
      ],
      colorChange : function(ev, ui, value){
        obj.data.label.style.fill = value;
      }
    }).appendTo(colorPicker);

  });

  var out = genIcon("unchecked", "Outline").appendTo(optionWrap);
  out.click(function(){
    colorPicker.empty();
    optionWrap.children().removeClass("highlight");
    $(this).addClass("highlight");

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
        "rgba(0,0,0,0)",
        "rgba(34,34,34,0.5)",
        "rgba(155,155,155,0.5)",
        "rgba(255,255,255,0.5)",
        "rgba(255,255,255,1)",
        "rgba(155,155,155,1)",
        "rgba(34,34,34,1)",
      ],
      colorChange : function(ev, ui, value){
        obj.data.label.style.stroke = value;
      }
    }).appendTo(colorPicker);
  });

  var shade = genIcon("text-color", "Shadow").appendTo(optionWrap);
  shade.click(function(){
    colorPicker.empty();
    optionWrap.children().removeClass("highlight");
    $(this).addClass("highlight");

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
        "rgba(0,0,0,0)",
        "rgba(34,34,34,0.5)",
        "rgba(155,155,155,0.5)",
        "rgba(255,255,255,0.5)",
        "rgba(255,255,255,1)",
        "rgba(155,155,155,1)",
        "rgba(34,34,34,1)",
      ],
      colorChange : function(ev, ui, value){
        obj.data.label.style.dropShadowColor = value;
      }
    }).appendTo(colorPicker);
  });

  var colorPicker = $("<div>").appendTo(colorWrap);
  colorPicker.addClass("lrpadding lrmargin");
  colorPicker.css("font-size", "0.6em");

  /*function colorWrap(fn) {
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
          fn(ui.css("background-color"));
        },
      });
    }
    optionList.push({
      icon : "tint",
      style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
      click : function(ev, ui){
        fn(null);
      },
    });
    optionList.push({
      icon : "cog",
      click : function(){
        var primaryCol = sync.render("ui_colorPicker")(obj, app, {
          hideColor : true,
          custom : true,
          colorChange : function(ev, ui, value){
            fn(value);
          }
        });

        ui_popOut({
          target : colorColumn,
          align : "right",
          id : "piece-color",
        }, primaryCol);
      },
    });
    return optionList;
  }

  var colorColumn = $("<div>").appendTo(content);
  colorColumn.addClass("flexrow white smooth outline");
  colorColumn.css("text-shadow", "none");
  colorColumn.css("color", "#333");
  function buildColorOptions() {
    colorColumn.empty();
    var primary = genIcon("text-background").appendTo(colorColumn);
    primary.attr("title", "Text Fill");
    primary.css("color", obj.data.label.pri || "#333");
    primary.click(function(){
      var actionsList = colorWrap(
        function(value) {
          obj.data.label.pri = value;
          primary.css("color", obj.data.label.pri || "#333");
          updateLabel();
        }
      );

      ui_dropMenu($(this), actionsList, {"id" : "font", hideClose : true});
    });

    var secondary = genIcon("text-color").appendTo(colorColumn);
    secondary.attr("title", "Text Outline");
    secondary.css("color", obj.data.label.sec || "#333");
    secondary.click(function(){
      var actionsList = colorWrap(
        function(value) {
          if (value) {
            obj.data.label.bold = 1;
          }
          else {
            delete obj.data.label.bold;
          }
          obj.data.label.sec = value;
          secondary.css("color", obj.data.label.sec || "#333");
          updateLabel();
        }
      );

      ui_dropMenu($(this), actionsList, {"id" : "font", hideClose : true});
    });

    var shadow = genIcon("text-color").appendTo(colorColumn);
    shadow.attr("title", "text shadow");
    shadow.css("color", "transparent");
    shadow.css("text-shadow", "0em 0em 8px " + obj.data.label.shadowColor || "transparent");
    shadow.click(function(){
      var actionsList = colorWrap(
        function(value) {
          obj.data.label.shadowColor = value;
          shadow.css("text-shadow", "0em 0em 8px " + obj.data.label.shadowColor || "transparent");
          updateLabel();
        }
      );

      ui_dropMenu($(this), actionsList, {"id" : "font", hideClose : true});
    });

    var boxColor = genIcon("unchecked").appendTo(colorColumn);
    boxColor.attr("title", "box color");
    boxColor.css("color", obj.data.label.box || "#333");
    boxColor.click(function(){
      var actionsList = colorWrap(
        function(value) {
          obj.data.label.padding = obj.data.label.padding || 4;
          obj.data.label.box = value;
          boxColor.css("color", value || "#333");
          updateLabel();
        }
      );

      ui_dropMenu($(this), actionsList, {"id" : "font", hideClose : true});
    });

    var fill = $("<div>").appendTo(colorColumn);
    fill.addClass("flex");

    var textSize = genIcon("text-size").appendTo(colorColumn);
    textSize.attr("title", "text-size");
    textSize.click(function(){
      var actionsList = [];

      var sizes = [
        8,
        10,
        12,
        14,
        16,
        24,
        36,
        48,
        56,
        108
      ]

      for (var i in sizes) {
        actionsList.push({
          name : sizes[i] + "px",
          attr : {size : i},
          click : function(ev, ui){
            obj.data.label.fontSize = sizes[ui.attr("size")];
            updateLabel();
          }
        })
      }

      ui_dropMenu($(this), actionsList, {"id" : "font"});
    });

    var font = genIcon("font").appendTo(colorColumn);
    font.attr("title", "Font Selection");
    font.click(function(){
      var actionsList = [];

      var fonts = util.fonts;

      for (var i in fonts) {
        actionsList.push({
          name : fonts[i],
          attr : {font : i},
          click : function(ev, ui){
            obj.data.label.fontFamily = fonts[ui.attr("font")];
            updateLabel();
          }
        })
      }

      ui_dropMenu($(this), actionsList, {"id" : "font"});
    });

    var fill = $("<div>").appendTo(colorColumn);
    fill.addClass("flex");

    var alignLeft = genIcon("align-left").appendTo(colorColumn);
    alignLeft.attr("title", "Align Left");
    alignLeft.click(function(){
      obj.data.label.align = "left";
      updateLabel();
    });

    var alignCenter = genIcon("align-center").appendTo(colorColumn);
    alignCenter.attr("title", "Align Center");
    alignCenter.click(function(){
      delete obj.data.label.align;
      updateLabel();
    });

    var alignRight = genIcon("align-right").appendTo(colorColumn);
    alignRight.attr("title", "Align Right");
    alignRight.click(function(){
      obj.data.label.align = "right";
      updateLabel();
    });

    var fill = $("<div>").appendTo(colorColumn);
    fill.addClass("flex");

    var clear = genIcon("refresh").appendTo(colorColumn);
    clear.attr("title", "Clear settings");
    clear.click(function(){
      obj.data.label = {
        fontSize : 24,
        shadowBlur : 10,
        shadowColor : "black",
        fontFamily : "Arial",
        align : "center",
        bold : 0,
        pri : "white",
      };
      text.val("");
      buildColorOptions();
      updateLabel();
    });
  }
  buildColorOptions();
  var wrap = $("<div>").appendTo(content);
  wrap.addClass("flexrow");

  var text = $("<textarea>").appendTo(wrap);
  text.attr("placeholder", "Text (Macro)");
  text.addClass("flex");
  text.css("color", "#333");
  text.css("text-shadow", "none");
  text.val(obj.data.label.text);
  text.keyup(function(){
    obj.data.label.text = $(this).val();
  });*/

  return content;
});
