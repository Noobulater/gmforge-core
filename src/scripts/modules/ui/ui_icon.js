sync.render("ui_token", function(obj, app, scope){
  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var def = "/content/icons/blankchar.png";
  if (data._t && data._t == "p") {
    def = "/content/icons/Scroll1000p.png";
  }

  var img = $("<img>");
  img.attr("src" , (value.min || sync.rawVal(value) || def));
  img.addClass(scope.classes);
  img.css("width", scope.width || "auto");
  img.css("min-width", "10px");
  img.css("min-height", "30px");
  img.css("height", scope.height || "30px");
  if (!scope.viewOnly) {
    img.addClass("hover2");
    img.click(function(){
      var imgList = sync.render("ui_filePicker")(obj, app, {
        filter : "img",
        value : value.min,
        change : function(ev, ui, val){
          value.min = val;
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
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
  }
  img.contextmenu(function(ev){
    assetTypes["img"].contextmenu(ev, $(this), (value.min || sync.rawVal(value) || def));
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });
  return img;
});

sync.render("ui_image", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", image : app.attr("img"), lookup : app.attr("lookup") || "info.img", classes : app.attr("classes"), mode : app.attr("mode")};

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var def = "/content/icons/blankchar.png";
  if (data._t && data._t == "p") {
    def = "/content/icons/Scroll1000p.png";
  }
  else if (data._t && data._t == "i") {
    def = "/content/icons/Chest1000p.png";
  }
  def = scope.def || def;

  var imgContainer = $("<div>");
  imgContainer.addClass("flex");
  imgContainer.css("background-image", "url('"+ (sync.rawVal(scope.image || value) || def) +"')");
  imgContainer.css("background-size", "contain");
  imgContainer.css("background-repeat", "no-repeat");
  imgContainer.css("background-position", "center");
  imgContainer.contextmenu(function(ev){
    assetTypes["img"].contextmenu(ev, $(this), (sync.rawVal(scope.image || value) || def));
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });

  if (scope.mode == "preview") {
    imgContainer.css("background-size", "cover");
    imgContainer.css("background-repeat", "no-repeat");
    imgContainer.css("background-position", "center 25%");
  }

  if (app.attr("showTemp") && obj.data.tags["temp"]) {
    imgContainer.addClass("flexmiddle");
    imgContainer.append("<b class='inactive smooth smargin spadding' style='font-size : 8px; color:#333; text-shadow:none;' title='Assets tagged with `temp` are deleted when their tokens are removed from a map'>Temp.</b>");
  }

  if (scope.classes) {
    imgContainer.addClass(scope.classes);
  }
  if (scope.title) {
    var context = scope.context || sync.defaultContext();
    if (!scope.context) {
      context[obj.data._t || "c"] = duplicate(obj.data);
    }
    imgContainer.append("<text>"+sync.eval(scope.title, context)+"</text>");
  }

  if (!scope.viewOnly) {
    imgContainer.addClass("hover2");
    imgContainer.click(function(ev) {
      var imgList = sync.render("ui_filePicker")(obj, app, {
        filter : "img",
        value : sync.rawVal(value),
        change : function(ev, ui, val){
          sync.rawVal(value, val);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
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
      ev.stopPropagation();
      ev.preventDefault();
    });
  }

  return imgContainer;
});

sync.render("ui_avatarIcon", function(obj, app, scope){
  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  var img = $("<div>");
  img.addClass("flex");
  img.css("background-image", "url('"+ (sync.rawVal(scope.image || value) || "/content/icons/blankchar.png") +"')");
  img.css("background-size", "contain");
  img.css("background-repeat", "no-repeat");
  img.css("background-position", "center");

  return img;
});


sync.render("ui_icon", function(obj, app, scope){
  var div = $("<i>");

  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  if (sync.rawVal(scope.image || value)) {
    var img = $("<img>");
    img.attr("height", scope.height || "25px");
    img.attr("width", scope.width || "auto");
    img.attr("src", sync.rawVal(scope.image || value));
    return img;
  }

  return div;
});
