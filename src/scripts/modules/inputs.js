//cb callback
function genIcon(options, name, reverse) {
  if (!(options instanceof Object)) {
    options = {icon : options, text : name, reverse : reverse};
  }
  var link = $('<a>');

  var icon;
  if (options.reverse || reverse) {
    icon = $('<span>').appendTo(link);
    icon.addClass("glyphicon glyphicon-" + options.icon);
    if (options.text) {
      if (options.icon) {
        icon.css("padding-right", "0.25em");
      }
      link.append(options.text);
    }
  }
  else {
    if (options.text) {
      link.append(options.text);
    }
    icon = $('<span>');
    icon.addClass("glyphicon glyphicon-" + options.icon);
    if (options.text && options.icon) {
      icon.css("padding-left", "0.25em");
    }
  }
  if (options.raw) {
    link = icon;
  }
  else if (!options.reverse && !reverse) {
    icon.appendTo(link);
  }
  link.changeIcon = function(newIcon) {
    icon.removeClass(icon.attr("class"));
    icon.addClass("glyphicon glyphicon-" + newIcon);
  }

  return link;
}

function _mw_canChange(ui, delay, callback) {
  if (ui && !ui.prop("disabled")) {
    var diff = Date.now()-Number(ui.attr("_last_change"));
    if (diff > delay) {
      ui.removeAttr("_last_change");
      callback(ui);
      return true;
    }
    else {
      setTimeout(function(){_mw_canChange(ui, delay, callback)}, delay);
    }
  }
  return false;
}

var _inputUpdates;
function _stageUpdate(obj, cmd, target){
  _inputUpdates = {obj : obj, cmd : cmd, target : target, focused : document.activeElement};
  _inputSync(obj);
}
function _inputSync(obj) {
  setTimeout(function(){
    if (!$(document.activeElement).is(":input") || $(document.activeElement).attr("obj") != obj.id() || (!_inputUpdates || document.activeElement == _inputUpdates.focused)) {
      if (_inputUpdates) {
        if (_inputUpdates.cmd) {
          _inputUpdates.obj.sync(_inputUpdates.cmd, _inputUpdates.target);
        }
        else {
          _inputUpdates.obj.update();
        }
      }
      _inputUpdates = null;
    }
  }, 50);
}

function genInput(options, delay) {
  var input = $("<input>");
  if (options.paste) {
    input.bind("paste", function(ev){
      input.val(ev.originalEvent.clipboardData.getData('text') || "");
      input.change();
      input.blur();
    });
  }
  if (options.value != null) {
    if (options.type == "number" || options.type == "range") {
      input.bind('mousewheel', function(e) {
        if ($(this).prop("disabled") || (!$(this).is(':focus') && options.type != "range")) {return;}
        if (e.originalEvent.wheelDelta/120 > 0) {
          var val = (Number($(this).val()) || 0) + (Number(input.attr("step")) || 1);
          if ($(this).attr("max") != null) {
            val = Math.min(val, $(this).attr("max"));
          }
          $(this).val(val);
          $(this).attr("_last_change", Date.now());
          $(this).trigger("input");
          _mw_canChange($(this), delay || 500, function(ui){
            ui.change();
          });

          return false;
        }
        else if (e.originalEvent.wheelDelta/120 < 0) {
          var val = (Number($(this).val()) || 0) - (Number(input.attr("step")) || 1);
          if ($(this).attr("min") != null) {
            val = Math.max(val, $(this).attr("min"));
          }
          $(this).val(val);
          $(this).attr("_last_change", Date.now());
          $(this).trigger("input");
          _mw_canChange($(this), delay || 500, function(ui){
            ui.change();
          });
          return false;
        }
      });
    }
    else if (options.type == "checkbox") {
      if (options.value == "true" || options.value == true || (options.value && options.value != "false")) {
        input.prop("checked", true);
      }
      else {
        input.prop("checked", false);
      }
    }
    if (options.value instanceof Object) {
      var value = options.value;
      if (value.max) {
        input.attr("max", value.max);
      }
      if (value.min) {
        input.attr("min", value.min);
      }
      if (options.raw) {
        if (options.raw == "min") {
          input.val(value.min);
        }
        else if (options.raw == "max") {
          input.val(value.max);
        }
        else {
          input.val(sync.rawVal(value));
        }
      }
      else if (options.mod) {
        input.val(sync.modifier(value, options.mod));
      }
      else if (options.name) {
        input.val(value.name);
      }
      else {
        if (sync.val(value) != null) {
          input.val(sync.val(value));
        }
      }
      // decide once, not everytime click is run
      if (options.obj) {
        input.attr("obj", options.obj.id());
        input.blur(function(){
          _inputSync(options.obj);
        });
        if (options.cmd) {
          input.change(function() {
            if (options.raw) {
              if (options.raw == "min") {
                value.min = $(this).val();
              }
              else if (options.raw == "max") {
                value.max = $(this).val();
              }
              else {
                sync.rawVal(value, $(this).val());
              }
            }
            else if (options.mod) {
              sync.modifier(value, options.mod, $(this).val());
            }
            else if (options.name) {
              value.name = $(this).val();
            }
            else {
              sync.val(value, $(this).val());
            }
            _stageUpdate(options.obj, options.cmd, options.target);
          });
        }
        else {
          input.change(function() {
            if (options.raw) {
              if (options.raw == "min") {
                value.min = $(this).val();
              }
              else if (options.raw == "max") {
                value.max = $(this).val();
              }
              else {
                sync.rawVal(value, $(this).val());
              }
            }
            else if (options.mod) {
              sync.modifier(value, options.mod, $(this).val());
            }
            else if (options.name) {
              value.name = $(this).val();
            }
            else {
              sync.val(value, $(this).val());
            }
            _stageUpdate(options.obj, options.cmd, options.target);
          });
        }
      }
      else {
        input.change(function() {
          if (options.raw) {
            if (options.raw == "min") {
              value.min = $(this).val();
            }
            else if (options.raw == "max") {
              value.max = $(this).val();
            }
            else {
              sync.rawVal(value, $(this).val());
            }
          }
          else if (options.mod) {
            sync.modifier(value, options.mod, $(this).val());
          }
          else if (options.name) {
            value.name = $(this).val();
          }
          else {
            sync.val(value, $(this).val());
          }
        });
      }
    }
    else {
      input.val(options.value);
      if (options.type == "range" && options.value) {
        setTimeout(function(){input.val(options.value);}, 10);
      }
      // can't do anything here, javascript only passes references on objects
    }
  }

  if (options.disabled) {
    input.attr("disabled", "true");
  }

  for (var key in options) {
    var data = options[key];
    if (key == "parent") {
      input.appendTo(data);
    }
    else if (key == "classes") {
      input.addClass(data);
    }
    else if (key == "style") {
      if (options[key]) {
        for (var cssKey in data) {
          input.css(cssKey, data[cssKey]);
        }
      }
    }
    else if (key != "value" && key != "obj" && key != "cmd"){
      input.attr(key, data);
    }
  }

  input.attr("maxlength", "255");
  return input;
}

function genNavBar(navAlign, contentClass, padding) {
  var container = $("<div>");
  container.addClass("flexcolumn");

  var navDiv = $("<div>").appendTo(container);
  navDiv.addClass("flexrow flexwrap background alttext");
  navDiv.addClass(navAlign);

  var content = $("<div>").appendTo(container);
  content.addClass("flexcolumn");
  content.addClass(contentClass);

  container.generateTab = function(tabName, tabIcon, clickFunction) {
    var item = $("<div>").appendTo(navDiv);
    item.addClass("hover2 smooth");
    if (padding) {
      item.css("padding", padding);
    }
    else {
      item.css("padding", "8px");
    }

    item.click(function(e) {
      content.empty();
      navDiv.children().each(function() {
        $(this).removeClass("highlight2 outline");
      });
      $(this).addClass("highlight2 outline");
      clickFunction(content, e, $(this));
    });

    var link = genIcon(tabIcon, tabName).appendTo(item);
    link.css("color", "inherit");
    return item;
  }

  container.clean = function() {
    content.empty();
  }
  container.removeTabs = function() {
    navBar.empty();
  }
  container.selectTab = function(tabName) {
    navDiv.children().each(function() {
      if ($(this).html().search(tabName) > 0) {
        $(this).click();
      }
    });
  }
  container.displayContent = function(contentToShow) {
    content.empty();
    content.append(contentToShow);
  }

  return container;
}


function ui_dropMenuOption(parent, data, options) {
  var div = $("<div>");
  div.addClass("outlinebottom flexrow spadding ui-dropoption ui-dropmenu-class");
  div.attr("id", parent.attr("_children"));
  div.attr("_parent", parent.attr("id"));
  div.attr("_root", parent.attr("_root"));
  div.appendTo(parent);
  parent.addClass("outline");
  var max = util.getMaxZ(".ui-popout");
  div.css("z-index", max+1);

  if (data.disabled) {
    icon.css("color", "inherit");
    div.css("color", "inherit");
    div.addClass("ui-dropoption-disabled");
  }
  else {
    div.addClass("ui-dropoption");
  }

  for (var cssIndex in options.style) {
    div.css(cssIndex, options.style[cssIndex]);
  }
  for (var cssIndex in data.style) {
    div.css(cssIndex, data.style[cssIndex]);
  }
  var icon = genIcon(data.icon, data.name).appendTo(div);
  icon.addClass("flex flexbetween");

  if (data.style && data.style["color"] == "transparent") {
    icon.css("text-shadow", "0em 0em 8px transparent");
  }

  div.attr("ui-name", data.ui);
  for (var key in data.attr) {
    div.attr(key, data.attr[key]);
  }
  if (data.hover) {
    div.hover(function(ev) {
      if (data.hover) {
        data.hover.in(ev, $(this));
      }
    },
    function(ev) {
      if (data.hover) {
        data.hover.out(ev, $(this));
      }
    });
  }
  if (data.submenu) {
    if (!data.hideSub) {
      var submenu = genIcon("triangle-bottom").appendTo(div);
      submenu.css("color", "black");
      submenu.css("float", "right");
      submenu.css("margin-left", "4px");
    }
    div.attr("_children", div.attr("id") + "_c");
    div.hover(function(ev) {
      if (data.align == "match") {
        ui_dropMenu(div, data.submenu, {id : div.attr("id") + "_c", _root : div.attr("_root"), _parent : parent.attr("id"), child : true, style : options.style, match : parent});
      }
      else {
        ui_dropMenu(div, data.submenu, {id : div.attr("id") + "_c", _root : div.attr("_root"), _parent : parent.attr("id"), child : true, style : options.style});
      }
    },
    function(ev){
    });
  }
  else {
    div.hover(function(ev) {
      if ($("#"+div.attr("id") + "_c").length) {
        layout.coverlay(div.attr("id") + "_c");
      }
    },
    function(ev){
      if ($("#"+div.attr("id") + "_c").length) {
        layout.coverlay(div.attr("id") + "_c");
      }
    });
  }
  if (!data.command && !data.click) {
    div.click(function() {
      layout.coverlay(parent);
    });
  }
  if (data.click) {
    div.click(function(ev) {
      if (data.click(ev, $(this), data) != "false") {
        layout.coverlay($("#"+$(this).attr("_root")));
      }
      ev.stopPropagation();
      ev.preventDefault();
    });
  }
  return div;
}

var rootMenu;
function ui_dropMenu(target, options, style) {
  if (rootMenu && !style.child) {
    $(".ui-dropoption").remove();
    $(".ui-dropoption-disabled").remove();
  }

  var overlay = $("<div>").appendTo($("body"));
  overlay.addClass("ui-dropmenu highlight smooth ui-dropmenu-class");
  overlay.css("background-color", "white");
  overlay.css("overflow-y", "auto");
  overlay.css("overflow-x", "hidden");
  overlay.css("max-height", "80vh");
  var max = Math.max(util.getMaxZ(".ui-popout"), util.getMaxZ(".main-dock"));
  overlay.css("z-index", max+1);

  if (style) {
    if ($("#"+style.id)) {
      layout.coverlay($("#"+style.id));
    }
    for (var index in style) {
      if (index == "style") {
        for (var cssIndex in style[index]) {
          if (!layout.mobile || cssIndex != "font-size") {
            overlay.css(cssIndex, style[index][cssIndex]);
          }
        }
      }
      else {
        overlay.attr(index, style[index]);
      }
    }
  }
  if (!style.child) {
    overlay.attr("_root", overlay.attr("id"));
    overlay.attr("_createTime", Date.now());
    rootMenu = overlay.attr("id");
  }
  overlay.attr("_children", overlay.attr("id") + "_c");
  for (var index in options) {
    var div = ui_dropMenuOption(overlay, options[index], {style : style.style});
    div.addClass("white");
  }
  if ((!target || !target.hasClass("ui-dropoption")) && !style.hideClose) {
    var div = ui_dropMenuOption(overlay, {icon: "remove", name: "Close"}, {style : style.style});
    div.addClass("highlight alttext");
  }
  if (style.match) {
    target = style.match;
  }
  if (target) {
    if (style.align) {
      var offsets = target.offset();

      var max = util.getMaxZ(".ui-popout");
      overlay.css("z-index", max+1);
      overlay.css("position", "fixed");

      var x = offsets.left + target.width()/2 - overlay.outerWidth()/2;
      var y = offsets.top + target.height()/2 - overlay.outerHeight()/2;

      if (style.align) {
        if (style.align.match("right")) {
          x = offsets.left + target.outerWidth();
        }
        else if (style.align.match("left")) {
          x = offsets.left - overlay.outerWidth();
        }
        if (style.align.match("top")) {
          y = offsets.top - overlay.outerHeight();
        }
        else if (style.align.match("bottom")) {
          y = offsets.top + target.outerHeight();
        }
      }
      // keep within screen boundries
      x = x - (Number($("body").scrollLeft()) || 0);
      y = y - (Number($("body").scrollTop()) || 0);
      if (x+overlay.outerWidth() > $(window).outerWidth()) {
        x = x - ((x+overlay.outerWidth())-$(window).outerWidth());
      }
      if (x < 0) {
        x = 0;
      }
      if (y+overlay.outerHeight() > $(window).outerHeight()) {
        y = y - ((y+overlay.outerHeight())-$(window).outerHeight());
      }
      if (y < 0) {
        y = 0;
      }
      overlay.css("left", x);
      overlay.css("top", y);
    }
    else {
      var offsets = target.offset();
      if (target.css("z-index") == "auto") {
        overlay.css("z-index", 500);
      }
      else {
        overlay.css("z-index", Number(target.css("z-index"))+1);
      }
      var x = offsets.left + target.outerWidth();
      var y = offsets.top;

      overlay.css("position", "fixed");
      var height = offsets.top + overlay.outerHeight();
      if (height > $(window).outerHeight()) {
        overlay.css("top", offsets.top + ($(window).outerHeight()-height));
      }
      else {
        overlay.css("top", offsets.top);
      }
      var width = offsets.left + target.outerWidth() + overlay.outerWidth();
      if (width > $(window).outerWidth()) {
        overlay.css("left", offsets.left + target.outerWidth() + ($(window).outerWidth()-width));
      }
      else {
        overlay.css("left", offsets.left + target.outerWidth());
      }
      if (x+overlay.outerWidth() > $(window).outerWidth()) {
        x = x - ((x+overlay.outerWidth())-$(window).outerWidth());
      }
      if (x < 0) {
        x = 0;
      }
      if (y+overlay.outerHeight() > $(window).outerHeight()) {
        y = y - ((y+overlay.outerHeight())-$(window).outerHeight());
      }
      if (y < 0) {
        y = 0;
      }
      overlay.css("left", x);
      overlay.css("top", y);
    }
  }
  return overlay;
}

function ui_popOut(options, content) {
  var overlay = $("<div>").appendTo($("body"));
  overlay.addClass("boxshadow ui-popout flexcolumn");
  if (options.resizable) {
    overlay.resizable();
  }
  if (options.prompt) {
    overlay.addClass("prompt");
    overlay.mousedown(function(ev){
      overlay.removeClass("prompt");
      _promptClicked = true;
    });
  }
  overlay.hover(function(){
    if ($(this).attr("locked") && $(this).hasClass("main-dock")) {
      var max = util.getMaxZ(".main-dock");
      $(".main-dock").css("z-index", 10);
      $(this).css("z-index", 11);
    }
    else if ($(this).attr("docked")) {
      var max = Math.max(util.getMaxZ(".ui-popout"), util.getMaxZ(".main-dock"));
      if (!$(this).attr("locked")) {
        $(this).css("z-index", max+1);
      }
      if (overlay.attr("fadeHide")) {
        overlay.css("opacity", "1.0");
      }
      $(this).css("transition", "left 0.1s, top 0.1s, opacity 0.0s");
      if ($(this).attr("docked") == "left") {
        $(this).css("left", 0);
      }
      else if ($(this).attr("docked") == "right") {
        $(this).css("left", $(window).width() - $(this).width());
      }
      else if ($(this).attr("docked") == "top") {
        $(this).css("top", 0);
      }
      else if ($(this).attr("docked") == "bottom") {
        $(this).css("top", $(window).height() - $(this).height());
      }
    }
    else {
      $(this).css("transition", "");
    }
    $(".prompt").css("z-index", Math.max(util.getMaxZ(".main-dock"), util.getMaxZ(".ui-popout")) + 1);
  },
  function(){
    var overlay = $(this);
    if (!$(this).attr("locked") && !$(".ui-dropmenu-class").length && !$(".prompt").length) {
      overlay.attr("lastHoverOut", Date.now());
      setTimeout(function(){
        if (Date.now() - overlay.attr("lastHoverOut") < 500) {
          return;
        }
        if (!overlay.attr("locked") && overlay.attr("docked") && cursorInPage && !overlay.is(":hover") && !$(".prompt").length) {
          overlay.css("z-index", overlay.attr("docked-z"));
          if (overlay.attr("fadeHide")) {
            overlay.css("opacity", "0");
          }
          overlay.css("transition", "left 0.35s, top 0.35s, opacity 0.35s");
          if (overlay.attr("docked") == "left") {
            overlay.css("left", -1 * overlay.width() + 20);
          }
          else if (overlay.attr("docked") == "right") {
            overlay.css("left", $(window).width() - 20);
          }
          else if (overlay.attr("docked") == "top") {
            overlay.css("top", -1 * overlay.height() + 20);
          }
          else if (overlay.attr("docked") == "bottom") {
            overlay.css("top", $(window).height() - 20);
          }
        }
        else {
          overlay.css("transition", "opacity 0.35s");
        }
      }, (overlay.hasClass("main-dock"))?(1000):(600));
    }
  });
  if (!options.noCss) {
    overlay.addClass("white snapCss");
    overlay.css("overflow", "hidden");
    overlay.draggable({
      containment : "window",
      stack : ".ui-popout.snapCss",
      snap : ".ui-popout.snapCss",
      snapMode : "Outer",
      handle : ".dragcontrol",
      start : function(ev, ui) {
        if (overlay.attr("docked")) {
          overlay.css("transition", "");
          overlay.removeAttr("docked");
          overlay.removeAttr("_dockStartX");
          overlay.removeAttr("_dockStartY");
          overlay.removeAttr("docked-z");
        }
      },
      drag : function(ev, ui) {
        var offset = overlay.offset();
        var xPos = offset.left;
        var yPos = offset.top;

        if (xPos <= 1 || yPos <= 1 || xPos + overlay.width() >= $(window).width()-5 || yPos + overlay.height() >= $(window).height()-5) {
          var lastX = overlay.attr("_dockStartX") || ev.screenX;
          var lastY = overlay.attr("_dockStartY") || ev.screenY;

          var velX = ev.screenX - lastX;
          var velY = ev.screenY - lastY;

          if ((velX < $(window).width()*-0.10 || ev.offsetX < 10) && xPos <= 1) {
            ui.position.left -= 50;
          }
          else if ((velX > $(window).width()*0.10 || ev.offsetX > $(window).width()-10) && xPos+overlay.width() >= $(window).width()-5) {
            ui.position.left += 50;
          }
          else if ((velY < $(window).height()*-0.05) && yPos <= 1) {
            ui.position.top -= 50;
          }
          else if ((velY > $(window).height()*0.15 || ev.offsetY > $(window).height()-2) && yPos+overlay.height() >= $(window).height()-5) {
            ui.position.top += 50;
          }
          if (!overlay.attr("_dockStartX") && !overlay.attr("_dockStartY")) {
            overlay.attr("_dockStartX", ev.screenX);
            overlay.attr("_dockStartY", ev.screenY);
          }
        }
        else {
          overlay.removeAttr("_dockStartX");
          overlay.removeAttr("_dockStartY");
        }
      },
      stop : function(ev, ui){
        overlay.attr("_lastDrag", Date.now());
        var offset = overlay.offset();
        var xPos = offset.left;
        var yPos = offset.top;
        if (xPos <= 1 || yPos <= 1 || xPos + overlay.width() >= $(window).width()-5 || yPos + overlay.height() >= $(window).height()-5) {
          var lastX = overlay.attr("_dockStartX") || ev.screenX;
          var lastY = overlay.attr("_dockStartY") || ev.screenY;

          var velX = ev.screenX - lastX;
          var velY = ev.screenY - lastY;

          if ((velX < $(window).width()*-0.10 || ev.offsetX < 10) && xPos <= 1) {
            overlay.attr("docked", "left");
            overlay.css("left", -1 * overlay.width() + 20);
            overlay.css("transition", "left 0.35s, top 0.35s");
            overlay.attr("docked-z", overlay.attr("docked-z") || overlay.css("z-index"));
          }
          else if ((velX > $(window).width()*0.10 || ev.offsetX > $(window).width()-10) && xPos+overlay.width() >= $(window).width()-5) {
            overlay.attr("docked", "right");
            overlay.css("left", $(window).width() - 20);
            overlay.css("transition", "left 0.35s, top 0.35s");
            overlay.attr("docked-z", overlay.attr("docked-z") || overlay.css("z-index"));
          }
          else if ((velY < $(window).height()*-0.05) && yPos <= 1) {
            overlay.attr("docked", "top");
            overlay.css("top", -1 * overlay.height() + 20);
            overlay.css("transition", "left 0.35s, top 0.35s");
            overlay.attr("docked-z", overlay.attr("docked-z") || overlay.css("z-index"));
          }
          else if ((velY > $(window).height()*0.15 || ev.offsetY > $(window).height()-2) && yPos+overlay.height() >= $(window).height()-5) {
            overlay.attr("docked", "bottom");
            overlay.css("top", $(window).height() - 20);
            overlay.css("transition", "left 0.35s, top 0.35s");
            overlay.attr("docked-z", overlay.attr("docked-z") || overlay.css("z-index"));
          }
        }

        overlay.removeAttr("_dockStartX");
        overlay.removeAttr("_dockStartY");
        if (options.moved) {
          options.moved(ev, overlay, ui);
        }
      }
    });
  }
  else {
    overlay.css("background-color", "none");
    overlay.draggable({
      containment : "window",
      stack : ".ui-popout.snapCss",
      snap : ".ui-popout.snapCss",
      snapMode : "Outer",
      stop : function(ev, ui){
        overlay.attr("_lastDrag", Date.now());
        if (options.moved) {
          options.moved(ev, overlay, ui);
        }
      }
    });
  }

  if (options) {
    if ($("#"+options.id)) {
      $("#"+options.id).remove();
    }
    for (var index in options) {
      if (index == "style") {
        for (var cssIndex in options[index]) {
          overlay.css(cssIndex, options[index][cssIndex]);
        }
      }
      else if (index != "target" && index != "title" && index != "align" && index != "close" && index != "moved"){
        overlay.attr(index, options[index]);
      }
    }
  }

  var removeWrapper = $("<text>");
  removeWrapper.addClass("lrpadding alttext flexrow fit-x");
  removeWrapper.css("position", "absolute");
  removeWrapper.css("top", "0");
  removeWrapper.css("right", "0");
  removeWrapper.css("pointer-events", "none");
  removeWrapper.hover(function(){
    $(this).css("opacity", "");
  },
  function(){

  });

  var title;
  if (options.title) {
    var title = $("<b>").appendTo(removeWrapper);
    title.addClass("flexrow lrpadding subtitle flexmiddle middle");
    title.css("pointer-events", "auto");
    title.css("overflow", "hidden");
    title.css("white-space", "nowrap");
    if (options.title instanceof Object) {
      title.append(options.title);
    }
    else {
      title.attr("contenteditable", "true");
      title.text(options.title);
    }
  }
  removeWrapper.append("<div class='flex'></div>");
  var minimize
  if (options.minimize) {
    removeWrapper.addClass("hover");

    minimize = genIcon("minus");
    minimize.attr("title", "minimize");
    minimize.appendTo(removeWrapper);
    minimize.css("text-shadow", "0px 0px 4px white");
    minimize.css("pointer-events", "auto");
    minimize.click(function(evt) {
      if ($(this).attr("resized") == "mini") {
        if (options.maximize) {
          maximize.show();
        }
        contentContainer.show();
        overlay.css("width", overlay.attr("_lastWidth"));
        overlay.css("height", overlay.attr("_lastHeight"));
        var oldX = overlay.attr("_lastX")+"px";
        var oldY = overlay.attr("_lastY")+"px";
        overlay.attr("_lastX", overlay.offset().left);
        overlay.attr("_lastY", overlay.offset().top);
        overlay.css("left", oldX);
        overlay.css("top", oldY);
        removeWrapper.css("font-size", "");
        if (title) {
          title.attr("contenteditable", "true");
          title.text(title.text().trim());
          removeWrapper.removeClass("hover");
          title.unbind('click');
        }
        if (options.resizable) {
          overlay.resizable();
        }
        minimize.changeIcon("minus");
        $(this).removeAttr("resized");
        setTimeout(function() {
          var offsets = overlay.offset();
          var x = offsets.left;
          var y = offsets.top;
          if (x+overlay.outerWidth() > $(window).outerWidth()) {
            x = x - ((x+overlay.outerWidth())-$(window).outerWidth());
          }
          if (x < 0) {
            x = 0;
          }
          if (y+overlay.outerHeight() > $(window).outerHeight()) {
            y = y - ((y+overlay.outerHeight())-$(window).outerHeight());
          }
          if (y < 0) {
            y = 0;
          }
          overlay.css("left", x);
          overlay.css("top", y);
        }, 10);
      }
      else {
        if (options.maximize) {
          maximize.hide();
        }
        contentContainer.hide();
        overlay.attr("_lastWidth", overlay.width());
        overlay.attr("_lastHeight", overlay.height());
        var oldX = overlay.attr("_lastX")+"px";
        var oldY = overlay.attr("_lastY")+"px";
        overlay.attr("_lastX", overlay.offset().left);
        overlay.attr("_lastY", overlay.offset().top);
        overlay.css("left", oldX);
        overlay.css("top", oldY);
        removeWrapper.css("font-size", "1.6em");
        overlay.css("width", removeWrapper.width() + 36);
        overlay.css("height", removeWrapper.height());
        if (title) {
          title.removeAttr("contenteditable");
          title.text(title.text().trim());
          removeWrapper.addClass("hover");
          title.click(function(ev){
            minimize.click();
          });
        }
        minimize.changeIcon("new-window");
        $(this).attr("resized", "mini");
        if (options.resizable || !overlay.resizable('option', 'disabled')) {
          options.resizable = true;
          overlay.resizable("destroy");
        }
      }
      evt.stopPropagation();
      return false;
    });
  }
  var maximize;
  if (options.maximize) {
    maximize = genIcon("resize-full");
    maximize.attr("title", "maximize");
    maximize.css("pointer-events", "auto");
    maximize.appendTo(removeWrapper);
  }

  var removeIcon = genIcon("remove").appendTo(removeWrapper);
  removeIcon.attr("title", "Close Window");
  removeIcon.css("text-shadow", "0px 0px 4px white");
  removeIcon.css("pointer-events", "auto");
  removeIcon.click(function(ev) {
    if (options.close) {
      var cont = options.close(ev, $(this));
      if (cont === false) {
        ev.stopPropagation();
        return false;
      }
    }
    ev.stopPropagation();
    layout.coverlay(overlay);
    return false;
  });

  if (options.hideclose) {
    removeIcon.hide();
  }
  var contentContainer;
  if (!options.noCss) {
    var subOverlay = $("<div>").appendTo(overlay);
    subOverlay.addClass("flexcolumn flex");

    var dcTop = $("<div>").appendTo(subOverlay);
    dcTop.addClass("dragcontrol");
    dcTop.css("width", "auto");
    dcTop.css("min-height", "1.5em");
    dcTop.css("cursor", "pointer");
    dcTop.addClass("background");
    if (options.minimize) {
      dcTop.attr("title", "Left click to minimize, right click to remove");
      dcTop.click(function(){
        if (!overlay.attr("_lastDrag") || (Date.now()-Number(overlay.attr("_lastDrag"))) > 500) {
          overlay.attr("_lastDrag", Date.now());
          minimize.click();
        }
      });
    }
    dcTop.contextmenu(function(){
      if (!overlay.attr("_lastDrag") || (Date.now()-Number(overlay.attr("_lastDrag"))) > 500) {
        overlay.attr("_lastDrag", Date.now());
        removeIcon.click();
      }
      return false;
    });

    contentContainer = $("<div>").appendTo(subOverlay);
    contentContainer.addClass("flexrow flex");
    contentContainer.css('max-height', "100%");

    var dcLeft = $("<div>").appendTo(contentContainer);
    dcLeft.addClass("dragcontrol");
    dcLeft.css("min-width", "0px");
    dcLeft.css("cursor", "pointer");
    if (content) {
      contentContainer.append(content.addClass("white"));
      content.css("outline", "none");
    }

    var dcRight = $("<div>").appendTo(contentContainer);
    dcRight.addClass("dragcontrol");
    dcRight.css("min-width", "0px");
    dcRight.css("cursor", "pointer");

    var dcBot = $("<div>").appendTo(subOverlay);
    dcBot.addClass("dragcontrol");
    dcBot.css("width", "auto");
    dcBot.css("min-height", "0px");
    dcBot.css("cursor", "pointer");
  }
  else {
    removeWrapper.addClass("background");
    overlay.append(content);
  }

  if (options.noCss) {
    removeWrapper.removeClass("background");
  }

  if (options.maximize) {
    maximize.css("text-shadow", "0px 0px 4px white");
    maximize.click(function(evt) {
      removeWrapper.css("font-size", "");
      contentContainer.show();
      if ($(this).attr("resized") == "max") {
        removeWrapper.css("opacity", "");
        if (options.minimize) {
          minimize.show();
        }
        overlay.css("border", "");
        overlay.css("border-radius", "");
        contentContainer.find(".application[ui-name='ui_board']").each(function(){
          $(this).removeAttr("noOptions");
        });
        if (!options.noCss) {
          dcTop.css("min-height", "1.5em");
          removeWrapper.removeClass("hardoutline");
        }
        overlay.css("width", overlay.attr("_lastWidth"));
        overlay.css("height", overlay.attr("_lastHeight"));
        var oldX = overlay.attr("_lastX")+"px";
        var oldY = overlay.attr("_lastY")+"px";
        overlay.attr("_lastX", overlay.offset().left);
        overlay.attr("_lastY", overlay.offset().top);
        overlay.css("left", oldX);
        overlay.css("top", oldY);
        maximize.changeIcon("resize-full");
        $(this).removeAttr("resized");
      }
      else {
        setTimeout(function(){removeWrapper.css("opacity", "0.2");}, 50);
        if (options.minimize) {
          minimize.hide();
        }
        overlay.css("border", "none");
        overlay.css("border-radius", "0");
        contentContainer.find(".application[ui-name='ui_board']").each(function(){
          $(this).attr("noOptions", true);
        });
        if (!options.noCss) {
          dcTop.css("min-height", 0);
          removeWrapper.addClass("hardoutline");
        }
        overlay.attr("_lastWidth", overlay.width());
        overlay.attr("_lastHeight", overlay.height());
        overlay.attr("_lastX", overlay.offset().left);
        overlay.attr("_lastY", overlay.offset().top);
        overlay.css("width", "100vw");
        overlay.css("height", "100vh");
        overlay.css("left", 0);
        overlay.css("top", 0);
        overlay.css("max-width", "100vw");
        overlay.css("max-height", "100vh");
        maximize.changeIcon("resize-small");
        $(this).attr("resized", "max");
      }
      $(document).resize();
      evt.stopPropagation();
      return false;
    });
  }
  removeWrapper.appendTo(overlay);

  if (layout.mobile) {
    overlay.css("position", "fixed");
    overlay.css("top", "10vh");
    overlay.css("left", "10vw");
    overlay.css("max-width", "80vw");
    overlay.css("max-height", "80vh");
  }
  else {
    if (options.target) {
      var offsets = options.target.offset();

      /*function recurse(target) {
        if (target.parent() && target.parent().hasClass("ui-popout")) {
          overlay.css("z-index", Number(target.parent().css("z-index"))+1);
        }
        else if (target.parent().length && !target.parent().is("body") && !target.parent().hasClass("ui-dropoption")) {
          recurse(target.parent());
        }
      }
      recurse(options.target); // asisgn z-index*/
      var max = Math.max(util.getMaxZ(".ui-popout"), util.getMaxZ(".main-dock"));
      overlay.css("z-index", max+1);
      overlay.css("position", "fixed");

      var x = offsets.left + options.target.width()/2 - overlay.outerWidth()/2;
      var y = offsets.top + options.target.height()/2 - overlay.outerHeight()/2;

      if (options.align) {
        if (options.align.match("right")) {
          x = offsets.left + options.target.width();
        }
        else if (options.align.match("left")) {
          x = offsets.left - overlay.outerWidth();
        }
        if (options.align.match("top")) {
          y = offsets.top - overlay.outerHeight();
        }
        else if (options.align.match("bottom")) {
          y = offsets.top + options.target.height();
        }
      }
      // keep within screen boundries
      x = x - (Number($("body").scrollLeft()) || 0);
      y = y - (Number($("body").scrollTop()) || 0);
      if (x+overlay.outerWidth() > $(window).outerWidth()) {
        x = x - ((x+overlay.outerWidth())-$(window).outerWidth());
      }
      if (x < 0) {
        x = 0;
      }
      if (y+overlay.outerHeight() > $(window).outerHeight()) {
        y = y - ((y+overlay.outerHeight())-$(window).outerHeight());
      }
      if (y < 0) {
        y = 0;
      }
      overlay.css("left", x);
      overlay.css("top", y);
    }

    setTimeout(function(){
      $(overlay.find("input,textarea")[0]).focus();
    },0);
  }
  overlay.mousedown(function(){
    var max = Math.max(util.getMaxZ(".ui-popout"), util.getMaxZ(".main-dock"));
    $(this).css("z-index", max+1);
  });
  return overlay;
}

function ui_calender(available, clickFunc) {
  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var frame = $("<div>");

  var title = $("<b>Weekly Availablity</b>").appendTo(frame);
  title.addClass("flexmiddle");

  var table = $("<table>").appendTo(frame);
  table.addClass("outline");

  var row = $("<tr>").appendTo(table);

  for (var i in days) {
    var day = days[i];

    var dayBox = $("<td>").appendTo(row);
    dayBox.addClass("outline subtitle");
    dayBox.attr("index", i);
    dayBox.css("width", (100/days.length)+"%");
    dayBox.css("background-color", "rgba(0,0,0,0.2)");
    dayBox.css("padding", "4px");
    dayBox.append($("<b>"+day+"</b>").addClass("flexmiddle"));

    var label = $("<b>").appendTo(dayBox);
    label.addClass("flexmiddle");

    var text = "Unavailable";
    if (available[day]) {
      text = available[day];
      dayBox.css("background-color", "rgba(0,0,0,0)");
    }
    label.text(text);

    if (clickFunc) {
      dayBox.css("cursor", "pointer");
      dayBox.click(function() {
        clickFunc($(this).attr("index"), $(this));
      });
      dayBox.append($("<i>Click to Change</i>").addClass("flexmiddle"));
    }
  }
  return frame;
}

function ui_processLink(link, callback) {
  if (link) {
    var data = link;
    var extensionReg = /\/([^\/]*)\.([^\/]*)$/;
    var matched = data.match(extensionReg);
    var ext;
    if (data.match(".gifv")) {
      data = data.replace(".gifv", ".mp4");
    }
    if (data.match("https://gfycat.com/") && !data.match(".webm")) {
      data = data.replace("https://gfycat.com/", "https://zippy.gfycat.com/") + ".webm";
    }
    if (data.match("imgur") && !data.match("i.imgur")) {
      data = data.replace("imgur", "i.imgur");
      data = data.replace("gallery/", "");
    }

    var extReg = /[^\/]*\.([^\.^\/]*)$/;
    var extMatch = data.match(extReg);
    if (!extMatch) {
      // look for a PNG or JPG
      var img = new Image();
      img.src = data + ".jpg";
      img.onload = function() {callback(link, data + ".jpg");};
      img.onerror = function() {
        callback(link, data + ".png");
      };
    }
    else {
      callback(link, data);
    }
  }
  else {
    callback(null, null);
  }
}

function ui_processMedia(data, options) {
  var id;
  var parent;
  if (options) {
    id = options.id;
    parent = options.parent;
  }

  if (data && (data.match(".webm") || data.match(".mp4") || data.match(".ogg"))) {
    // no audio
    var content = $("<video>");
    content.attr('height', "auto");
    if (parent) {
      content.appendTo(parent);
      content[0].onloadeddata = function() {
        if (parent.outerWidth() < parent.outerHeight()) {
          content.attr('width', parent.outerWidth());
          content.attr('height', "auto");
        }
        else {
          content.attr('height', parent.outerHeight());
          content.attr('width', "auto");
        }
      }
    }

    content.attr("muted", true);
    content.attr("autoplay", true);
    content.attr('src', data);
    content.attr("id", id);

    if (options && options.disabled) {
      content.css("pointer-events", "none");
      content.css("-webkit-touch-callout", "none");
      content.css("-webkit-user-select", "none");
      content.css("-khtml-user-select", "none");
      content.css("-moz-user-select", "none");
      content.css("-ms-user-select", "none");
      content.css("user-select", "none");
      content.attr("autoplay", false);
    }

    return content;
  }

  var content = $("<img>");
  if (parent) {
    content.appendTo(parent)
    content.on("load", function() {
      content.css('width', parent.outerWidth());
    });
  }

  content.attr('src', data);
  content.attr("id", id);
  return content;
}

function ui_prompt(options) {
  var inputs = {};

  var content = $("<div>");
  content.addClass("spadding");
  for (var title in options.inputs) {
    var inputDiv = $("<div>").appendTo(content);
    inputDiv.append("<b>"+title+"</b>");
    var input;
    if (options.inputs[title] instanceof Object && !options.inputs[title].length) {
      var newInput = duplicate(options.inputs[title]);
      newInput.parent = inputDiv;
      newInput.style = newInput.style || {"display" : "block"}
      input = genInput(newInput);
    }
    else if (options.inputs[title] instanceof Object && options.inputs[title].length) {
      input = options.inputs[title];
      options.inputs[title].appendTo(inputDiv);
    }
    else {
      input = genInput({
        parent : inputDiv,
        value : options.inputs[title],
        style : {"display" : "block"}
      });
    }
    /*if (options.inputs[title] instanceof Object) {
      var newInput = JSON.parse(JSON.stringify(options.inputs[title]));
      newInput.parent = content;
      newInput.style = newInput.style || {"display" : "block"}
      var input = genInput(newInput);
    }
    else {
      var input = genInput({
        parent : content,
        value : options.inputs[title],
        style : {"display" : "block"}
      });
    }*/

    inputs[title] = input;
  }

  var confirm = $("<button>").appendTo(content);
  confirm.addClass("fit-x");
  confirm.append(options.confirm || "Confirm");
  confirm.click(function(ev){
    options.click(ev, inputs);
    layout.coverlay((options.id || "prompt-popout"));
  });

  var popout = ui_popOut({
    target : options.target || $("body"),
    id : (options.id || "prompt-popout"),
    style : (options.style || {}),
    align : options.align,
    close : options.close,
    noCss : options.noCss,
    hideclose : options.hideclose,
    prompt : true
  }, content);
}

function ui_modified(options, content) {
  var statUI = $("<div>");
  if (options.parent) {
    statUI.appendTo(options.parent);
  }

  statUI.addClass("ui-stat outline smooth");
  var statUITitle = $("<div>").appendTo(statUI);
  statUITitle.addClass("flexmiddle");

  if (options.title) {
    statUITitle.append("<b>"+options.title+"</b>");
  }
  if (options.modify) {
    var plus = genIcon("plus");
    plus.addClass("subtitle");
    plus.addClass("create");
    plus.attr("title", "Add a modifier");
    plus.appendTo(statUITitle);
    plus.click(function(){
      var popOut = ui_prompt({
        target : statUI,
        id : "stat-mod-add",
        inputs : {
          "Modifier Name" : {},
          "Value" : {
            value : 5,
            type : "number",
            step : 5,
          },
        },
        click : function(ev, inputs) {
          if (options.modify) {
            options.modify(ev, inputs, options);
          }
        }
      });
    });
  }

  if (content) {
    statUI.append(content);
  }

  if ((options.value && options.value.modifiers) || options.diceable || options.total) {
    var statTotal = $("<div>").appendTo(statUI);
    statTotal.addClass("flexcolumn flexmiddle");

    var total = $("<b>").appendTo(statTotal);
    if (options.diceable) {
      total.addClass("fit-x flexmiddle hover2 outlinebottom");
      total.click(function(ev) {
        var context = sync.defaultContext();
        merge(context, options.context);
        _diceable(ev, $(this), options.diceable, context);
      });
    }
    if (options.totalClick) {
      total.addClass("fit-x flexmiddle hover2 outlinebottom");
      total.click(function(ev) {
        options.totalClick(ev, $(this), options);
      });
    }

    if (options.total) {
      total.text(options.total);
    }
    else {
      total.text(sync.val(options.value));
    }
  }

  var statModifiers = $("<div>").appendTo(statUI);
  statModifiers.addClass("flexcolumn flexmiddle");
  if (options.reveal) {
    var frame = $("<div>").appendTo(statModifiers);
    frame.addClass("flexcolumn flexmiddle subtitle");

    for (var key in options.value.modifiers) {
      var statMod = $("<a>").appendTo(frame);
      statMod.attr("index", key);
      var val = options.value.modifiers[key];
      if (val > 0) {
        val = "+" + options.value.modifiers[key];
      }
      statMod.append(key + " : " + val);
      statMod.click(function(e) {
        if (options.click) {
          options.click(e, $(this), options);
        }
      });
    }
  }
  else {
    statUI.hover(function(){
      statModifiers.empty();
      if (options.hover) {
        options.hover($(this), options);
      }
      else {
        var frame = $("<div>").appendTo(statModifiers);
        frame.addClass("flexcolumn flexmiddle subtitle");

        for (var key in options.value.modifiers) {
          var statMod = $("<a>").appendTo(frame);
          statMod.attr("index", key);
          var val = options.value.modifiers[key];
          if (val > 0) {
            val = "+" + options.value.modifiers[key];
          }
          statMod.append(key + " : " + val);
          statMod.click(function(e) {
            if (options.click) {
              options.click(e, $(this), options);
            }
          });
        }
      }
    },
    function() {
      statModifiers.empty();
    });
  }

  return statUI;
}

function ui_controlForm(options) {
  var inputs = {};
  var content = $("<div>");
  content.addClass("flexcolumn outline smooth");
  for (var title in options.inputs) {
    var inputDiv = $("<div>").appendTo(content);
    inputDiv.addClass("flexrow flexbetween subtitle outlinebottom");
    if (title.trim()) {
      var label = $("<text class='flex spadding'>"+title+"</text>").appendTo(inputDiv);
      label.attr("style", options.lblStyle);
    }
    var input;
    if (options.inputs[title] instanceof Object && !options.inputs[title].length) {
      var newInput = duplicate(options.inputs[title]);
      newInput.parent = inputDiv;
      input = genInput(newInput);
    }
    else if (options.inputs[title] instanceof Object && options.inputs[title].length) {
      input = options.inputs[title];
      options.inputs[title].appendTo(inputDiv);
    }
    else {
      input = genInput({
        parent : inputDiv,
        value : options.inputs[title],
      });
    }

    inputs[title] = input;
  }
  if (options.click) {
    var confirm = $("<button>").appendTo(content);
    confirm.addClass("fit-x");
    confirm.css("color", "#333");
    confirm.css("text-shadow", "none");
    confirm.append(options.confirm || "Confirm");
    confirm.click(function(ev){
      options.click(ev, inputs, $(this));
      layout.coverlay((options.id || "prompt-popout"));
    });
  }

  return content;
}

function ui_controlHint(str, notes) {
  var controlContainer = $("<div>");
  controlContainer.addClass("flexcolumn");

  var controlRow = $("<div>").appendTo(controlContainer);
  controlRow.addClass("flexrow lightoutline");

  if (notes) {
    var div = $("<div>").appendTo(controlRow);
    div.addClass("flexmiddle");
    div.css("width", "100px");
    div.append("<text>"+notes+"</text>");
  }

  var controls = str.split(":");
  for (var i in controls) {
    var controlDiv = $("<div>").appendTo(controlRow);
    controlDiv.addClass("flexrow flex");

    var combos = controls[i].split("+");
    for (var j in combos) {
      var control = combos[j];
      var icon = $("<div>").appendTo(controlDiv);
      icon.css("background-size", "contain");
      icon.css("background-repeat", "no-repeat");
      icon.css("background-position", "center");
      if (control == "mright") {
        icon.css("background-image", "url('/content/mouse_right.png')");
        icon.css("width", "32px");
        icon.css("height", "32px");
      }
      else if (control == "mouse") {
        icon.css("background-image", "url('/content/mouse.png')");
        icon.css("width", "32px");
        icon.css("height", "32px");
      }
      else if (control == "middle") {
        icon.css("background-image", "url('/content/mouse_middle.png')");
        icon.css("width", "32px");
        icon.css("height", "32px");
      }
      else if (control == "mleft") {
        icon.css("background-image", "url('/content/mouse_left.png')");
        icon.css("width", "32px");
        icon.css("height", "32px");
      }
      else {
        icon.css("background-image", "url('/content/button.png')");
        icon.css("width", "48px");
        icon.css("height", "32px");
        icon.addClass("flexmiddle");
        icon.css("font-weight", "bolder");
        icon.css("color", "black");
        icon.text(control);
      }
      if (j < combos.length-1) {
        var icon = $("<div>").appendTo(controlDiv);
        icon.addClass("flexmiddle");
        var icon = $("<b>").appendTo(icon);
        icon.css("color", "#333333");
        icon.text("+");
      }
    }
  }
  return controlContainer;
}

/*
var nav = ui_tabs([{t: "D3"}, {t: "D4"}, {t: "D5"}, {t: "D6"}, {t: "D8"}, {t: "D12"}, {t: "D20"}, {t: "D100"}, {t: "Custom"}]);
function clear() {
  for (var v in nav.tabs) {
    nav.tabs[v].css("color", "#9d9d9d");
  }
}

for (var v in nav.tabs) {
  var tab = nav.tabs[v];
  tab.click(function() {
    clear();
    $(this).css("color", "white");
    console.log($(this).attr("tab-index"));
  });
}
*/
