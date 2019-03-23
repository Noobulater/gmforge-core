sync.render("ui_body", function(obj, app, scope){
  var data = obj.data;

  scope = scope || {viewOnly: false}; // defaults
  scope.url = scope.url || "/content/outline.png";
  scope.target = scope.target || sync.traverse(obj.data, "counters.wounds");
  scope.displayText = scope.displayText || function(button, key) {
    if (sync.modifier(scope.target, key) < 0) {
      button.text(sync.modifier(scope.target, key));
    }
  }
  scope.colorize = scope.colorize || function(ui) {
    if (sync.val(scope.target) <= 0) {
      ui.css("background-color", "rgba(255,0,0,0.3)");
    }
    else {
      ui.css("background-color", "rgba(0,255,0,0.3)");
    }
  }
  scope.click = scope.click || function(e, ui) {
    if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
      if (e.which == 1) {
        var target = scope.target;
        if (_down["18"]) {
          target = data.counters[game.templates.display.sheet.altStat];
        }
        if (e.shiftKey) {
          if (e.ctrlKey) {
            target.max = target.max + 1;
            obj.sync("updateAsset");
          }
          else {
            target.max = target.max - 1;
            obj.sync("updateAsset");
          }
        }
        else {
          if (e.ctrlKey) {
            if (sync.modified(target) < 0) {
              if (sync.modifier(target, ui.attr("data-index")) < 0) {
                sync.modifier(target, ui.attr("data-index"), Number(sync.modifier(target, ui.attr("data-index"))) + 1);
              }
              else {
                sync.removeModifier(target, ui.attr("data-index"));
              }
            }
            else {
              sync.val(target, Number(sync.rawVal(target)) + 1);
            }
            obj.sync("updateAsset");
          }
          else {
            if (sync.val(target) <= 0) {
              if (sync.modifier(target, ui.attr("data-index")) <= 0) {
                sync.modifier(target, ui.attr("data-index"), Number(sync.modifier(target, ui.attr("data-index"))) - 1);
              }
              else {
                sync.modifier(target, ui.attr("data-index"), -1);
              }
            }
            else {
              sync.val(target, Number(sync.rawVal(target)) - 1);
            }
            obj.sync("updateAsset");
          }
        }
      }
    }
  }

  if (!scope.body) {
    scope.body = {};
    scope.body["human_head"] = {url: "../content/head.png", coords: ["40%",0], size: ["20%","20%"]};
    scope.body["human_torso"] = {url: "../content/torso.png", coords: ["40%","20%"], size: ["20%","40%"]};
    scope.body["human_larm"] = {url: "../content/leftarm.png", coords: ["60%","20%"], size: ["20%","40%"]};
    scope.body["human_rarm"] = {url: "../content/rightarm.png", coords: ["20%","20%"], size: ["20%","40%"]};
    scope.body["human_rleg"] = {url: "../content/leftleg.png", coords: ["30%","60%"], size: ["20%","40%"]};
    scope.body["human_lleg"] = {url: "../content/rightleg.png", coords: ["50%","60%"], size: ["20%","40%"]};
  }

  var body = scope.body;

  var wrapper = $("<div>");
  wrapper.addClass("body-background");
  wrapper.addClass("outline smooth");
  if (scope && scope.viewOnly) {
    wrapper.css("background-color", "rgb(235,235,228)");
  }
  wrapper.css("background-image", "url('"+scope.url+"')");
  wrapper.css("position", "relative");
  wrapper.css("overflow", "hidden");

  if (isChrome()) { // not supported in firefox
    for (var key in body) {
      var part = body[key];
      var url = part.url;

      var img = $("<div>").appendTo(wrapper);
      img.addClass('body-mask');
      img.attr("key", key);
      img.css("-webkit-mask-image", "url('"+url+"')");
      img.css("mask-image", "url('"+url+"')");
      scope.colorize(img);
    }
  }
  if (scope && !scope.viewOnly && scope.target && game.config.data.game == "heresy2" && scope.refresh) {
    var refresh = genIcon("refresh").appendTo(wrapper);
    refresh.css("position", "absolute");
    refresh.css("left", "0");
    refresh.css("top", "0");
    refresh.css("pointer-events", "auto");
    refresh.click(function(ev){
      var target = scope.target;
      target.modifiers = {};
      obj.sync("updateAsset");
    });
  }
  // need the body parts to be ontop, and manually setting z-index is a poor
  // decision
  for (var key in body) {
    var part = body[key];
    if (part.size && part.coords) {
      var button = $("<div>").appendTo(wrapper);
      button.addClass("flexmiddle body-part");
      button.css("position", "absolute");
      button.css("width", part.size[0]);
      button.css("height", part.size[1]);
      button.css("left", part.coords[0]);
      button.css("top", part.coords[1]);
      button.attr("data-index", key);
      button.css("color", "black");
      button.css("font-weight", "bold");
      button.attr("title", key);
      button.attr("key", key);
      scope.displayText(button, key);
      if ((button.text() || "").length > 1) {
        button.addClass("subtitle");
      }
      if (!isChrome()) { // not supported in firefox
        var url = part.url;
        scope.colorize(button);
      }
      if (scope.editable) {
        button.draggable({
          containment : "parent",
          snap: ".body-part",
          snapMode: "both",
          snapTolerance: 4,
          stop : function(ev, ui) {
            var perX = Math.ceil(((ui.offset.left - wrapper.offset().left)-1)/wrapper.outerWidth()*100);
            var perY = Math.ceil(((ui.offset.top - wrapper.offset().top)-1)/wrapper.outerHeight()*100);
            if (body[$(ui.helper).attr("key")][0] != String(perX)+"%" && body[$(ui.helper).attr("key")][0] != String(perY)+"%"){
              body[$(ui.helper).attr("key")].coords = [String(perX)+"%", String(perY)+"%"];
              obj.update();
            }
          }
        });
        var edit = genIcon("pencil").appendTo(button);
        edit.attr("key", key);
        edit.attr("title", "Edit Size");
        edit.click(function(ev) {
          var index = $(this).attr("key");
          ui_prompt({
            target : $(this),
            id : "resize-hitbox",
            inputs : {
              "Width(%)" : {
                type : "number",
                value : parseInt(body[index].size[0]),
                min : 10,
                max : 100,
                step : 1,
              },
              "Height(%)" : {
                type : "number",
                value : parseInt(body[index].size[1]),
                min : 10,
                max : 100,
                step : 1,
              }
            },
            click : function(ev, inputs){
              body[index].size = [String(inputs["Width(%)"].val())+"%", String(inputs["Height(%)"].val())+"%"];
              obj.update();
            }
          });
        });

        var del = genIcon("trash").appendTo(button);
        del.attr("key", key);
        del.attr("title", "Delete");
        del.click(function(ev) {
          scope.click(ev, $(this));
        });
      }
      else {
        if (!scope.viewOnly) {
          button.click(function(e) {
            scope.click(e, $(this));
          });
        }
        else {
          button.css("cursor", "auto");
        }
      }
    }
  }
  return wrapper;
});
