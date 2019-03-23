var layout = {};
layout.mobile = true;

// NoSleep.min.js v0.5.0 - git.io/vfn01 - Rich Tibbett - MIT license
!function(A){function e(A,e,o){var t=document.createElement("source");t.src=o,t.type="video/"+e,A.appendChild(t)}var o={Android:/Android/gi.test(navigator.userAgent),iOS:/AppleWebKit/.test(navigator.userAgent)&&/Mobile\/\w+/.test(navigator.userAgent)},t={WebM:"data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",MP4:"data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=="},i=function(){return o.iOS?this.noSleepTimer=null:o.Android&&(this.noSleepVideo=document.createElement("video"),this.noSleepVideo.setAttribute("loop",""),e(this.noSleepVideo,"webm",t.WebM),e(this.noSleepVideo,"mp4",t.MP4)),this};i.prototype.enable=function(A){o.iOS?(this.disable(),this.noSleepTimer=window.setInterval(function(){window.location.href='/',window.setTimeout(window.stop,0)},A||15e3)):o.Android&&this.noSleepVideo.play()},i.prototype.disable=function(){o.iOS?this.noSleepTimer&&(window.clearInterval(this.noSleepTimer),this.noSleepTimer=null):o.Android&&this.noSleepVideo.pause()},A.NoSleep=i}(this);


var debugging = false;

assetTypes.filePicker.width = "90vw";
assetTypes.filePicker.height = "90vh";

assetTypes.assetPicker.width = "90vw";
assetTypes.assetPicker.height = "90vh";

layout.saveApps = function(){
  var arry = [];
  for (var key in layout.apps.data.apps) {
    var ob = layout.apps.data.apps[key];
    if (ob instanceof Object) {
      arry.push(ob.attr("ui-name"));
    }
    else {
      arry.push(ob);
    }
  };
  setCookie("_mobile_saveApps", JSON.stringify({arry : arry}), 9000000);
}

layout.loadApps = function(){
  var arryObj = JSON.parse(getCookie("_mobile_saveApps") || '{"arry":["ui_displayManager","ui_textBox","ui_assetManager","ui_combatManager"]}');
  if (arryObj.arry) {
    var arry = arryObj.arry;
    var first = false;
    sync.newApp(arry[0], null, {}).appendTo($("#viewPort"));
    layout.apps.data.apps = arry;
  }
  else {
    var charApp = sync.newApp("ui_display", game.state).appendTo($("#viewPort"));
    layout.apps.data.apps.push(charApp);
    game.state.addApp(charApp);
  }
  var app = sync.newApp("ui_layout_apps").css("flex", "none").appendTo($("#viewPort").parent());
  app.addClass("background alttext");
  layout.apps.addApp(app);
}

function ui_dropMenuOption(parent, data, options) {
  var div = $("<div>").appendTo(parent);
  div.addClass("outlinebottom flexrow spadding");
  div.attr("id", parent.attr("_children"));
  div.attr("_parent", parent.attr("id"));
  div.attr("_root", parent.attr("_root"));

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
    var submenu = genIcon("triangle-bottom").appendTo(div);
    submenu.css("color", "black");
    submenu.css("float", "right");
    submenu.css("margin-left", "4px");
    div.attr("_children", div.attr("id") + "_c");
    div.click(function(ev) {
      if (data.click) {
        var copy = duplicate(data);
        delete copy.submenu;
        copy.click = data.click;
        data.submenu.push(copy);
      }
      ui_dropMenu(parent, data.submenu, {id : div.attr("id") + "_c", _root : div.attr("_root"), style : options.style});
      ev.stopPropagation();
      parent.remove();
      return false;
    });
  }
  else {
    if (!data.command && !data.click) {
      div.click(function() {
        layout.coverlay(parent);
      });
    }
    if (data.click) {
      div.attr("title", "clickable");
      div.click(function(ev) {
        if (data.click(ev, $(this), data) != "false") {
          layout.coverlay($("#"+$(this).attr("_root")));
        }
        ev.stopPropagation();
        ev.preventDefault();
      });
    }
  }
  return div;
}

layout.overlay = function(options) {
  var overlay = $("<div>").appendTo($("body"));

  if ($("#"+options.id)) {
    $("#"+options.id).remove();
  }

  for (var index in options) {
    if (index == "style") {
      for (var cssIndex in options[index]) {
        overlay.css(cssIndex, options[index][cssIndex]);
      }
    }
    else if (index != "target") {
      overlay.attr(index, options[index]);
    }
  }

  if (options.target) {
    var offsets = options.target.offset();
    var width = options.target.outerWidth();
    var height = options.target.outerHeight();

    overlay.css("width", width);
    overlay.css("height", height);
    if (options.target.css("z-index") == "auto") {
      overlay.css("z-index", 80);
    }
    else {
      overlay.css("z-index", Number(options.target.css("z-index"))+1);
    }

    overlay.css("position", "absolute");
    overlay.css("top", offsets.top);
    overlay.css("left", offsets.left);
    overlay.css("bottom", offsets.bottom);
    overlay.css("right", offsets.right);
  }

  overlay.css("font-size", "2em");

  return overlay;
}

layout.coverlay = function(id, fadeOut) {
  function recurse(elem, fadeOut) {
    elem.css("pointer-events", "none");
    elem.children().each(function() {
      recurse($(this));
    });
    if (elem.attr("_children")) {
      $("[id="+elem.attr("_children")+"]").each(function(){
        recurse($(this));
      });
      if (fadeOut) {
        $("[id="+elem.attr("_children")+"]").fadeTo(fadeOut, 0);
        setTimeout(function(){
          $("[id="+elem.attr("_children")+"]").each(function(){
            $(this).remove();
          });
        }, fadeOut);
      }
      else {
        $("[id="+elem.attr("_children")+"]").each(function(){
          $(this).remove();
        });
      }
    }
  }
  var overlay;
  if (id instanceof Object) {
    overlay = id;
  }
  else {
    overlay = $("#"+id);
  }
  if (fadeOut) {
    recurse(overlay, fadeOut);
    overlay.fadeOut(fadeOut, 0);
    setTimeout(function(){overlay.remove()}, fadeOut);
  }
  else {
    recurse(overlay);
    overlay.remove();
  }
}

layout.page = function(options, content) {
  var frame = $("<div>").appendTo("body");
  frame.addClass("viewPort");
  //frame.css("z-index", 59);
  if (options) {
    if ($("#"+options.id)) {
      $("#"+options.id).remove();
      frame.attr("id", options.id);
    }
    for (var cssIndex in options.style) {
      frame.css(cssIndex, options.style[cssIndex]);
    }
  }

  frame.css("position", "absolute");
  frame.css("top", "0");
  frame.css("left", "0");
  frame.css("right", "0");
  frame.css("bottom", "0");
  frame.css("pointer-events", "none");
  frame.css("background-color", "rgba(0,0,0,0)");
  frame.addClass("flexmiddle");

  var div = $("<div>").appendTo(frame);
  div.addClass("popup");
  div.css("width", "95vw");
  div.css("margin", "auto");
  div.css("pointer-events", "auto");
  div.css("width", "95vh");
  //div.css("z-index", 60);

  if (!options.hideclose) {
    var removeWrapper = $("<b>").appendTo(div);
    removeWrapper.css("position", "absolute");
    removeWrapper.css("top", "0");
    removeWrapper.css("right", "0");
    removeWrapper.css("width", "auto");
    removeWrapper.css("pointer-events", "none");

    var removeIcon = genIcon("remove").appendTo(removeWrapper);
    removeIcon.css("text-shadow", "0px 0px 4px white");
    removeIcon.click(function(evt) {
      evt.stopPropagation();
      layout.coverlay(frame, 500);
      return false;
    });
  }

  if (options) {
    if (options.title) {
      div.append("<div style='text-align:center; font-weight:800;'>"+options.title+"</div>");
    }
    if (options.prompt) {
      div.append("<div style='text-align:center; margin-bottom: 1em;'>"+options.prompt+"</div>");
    }
    if (options.blur) {
      frame.css("background-color", "rgba(0,0,0,"+options.blur+")");
      frame.css("pointer-events", "auto");
      frame.hide();
      frame.fadeIn();
    }
    if (options.align) {
      if (options.align.match("right")) {
        div.css("margin-left", "auto");
        div.css("margin-right", "1%");
      }
      else if (options.align.match("left")) {
        div.css("margin-right", "auto");
        div.css("margin-left", "1%");
      }
      if (options.align.match("top")) {
        div.css("margin-top", "1%");
        div.css("margin-bottom", "auto");
      }
      else if (options.align.match("bottom")) {
        div.css("margin-top", "auto");
        div.css("margin-bottom", "1%");
      }
    }
  }
  if (content) {
    content.appendTo(div);
  }
  setTimeout(function(){
    $(frame.find("input")[0]).focus();
  },0);
  return div;
}
layout.load = function(){}
layout.init = function(){
  layout.apps = sync.obj();
  layout.apps.data = {apps : []};

  sync.render("ui_layout_apps", function(obj, app, scope){
    var div = $("<div>");
    div.addClass("flexaround flexwrap fit-x");

    var icons = {
      "ui_roll" : "registration-mark",
      "ui_displayManager" : "modal-window",
      "ui_homebrew" : "edit",
      "ui_textBox" : "list",
      "ui_pdf" : "folder-open",
      "ui_characterSheet" : "tasks",
      "ui_assetManager" : "list-alt",
      "ui_combatManager" : "fire",
      "ui_resourcePage" : "asterisk",
    };
    for (var key in obj.data.apps) {
      var icon;
      if (obj.data.apps[key] instanceof Object) {
        icon = genIcon(icons[obj.data.apps[key].attr("ui-name")]).appendTo(div);
      }
      else {
        icon = genIcon(icons[obj.data.apps[key]]).appendTo(div);
      }
      icon.css("font-size", "2.0em");
      icon.css("padding-left", "8px");
      icon.css("padding-right", "8px");
      icon.attr("key", key);
      icon.click(function(){
        if (obj.data.remove) {
          obj.data.apps.splice($(this).attr("key"), 1);
          obj.data.remove = false;
          layout.saveApps();
          obj.update();
        }
        else {
          $("#viewPort").children().each(function(){
            $(this).hide();
          });
          if (obj.data.apps[$(this).attr("key")] instanceof Object) {
            obj.data.apps[$(this).attr("key")].show();
            // build all apps within it
            sync.rebuildApp(obj.data.apps[$(this).attr("key")].attr("id"));
            obj.data.apps[$(this).attr("key")].find(".application").each(function(){
              sync.rebuildApp($(this).attr("id"));
            });
          }
          else {
            obj.data.apps[$(this).attr("key")] = sync.newApp(obj.data.apps[$(this).attr("key")], null, {});
            obj.data.apps[$(this).attr("key")].appendTo($("#viewPort"));
          }
        }
      });
    }
    return div;
  });

  $("#viewPort").append(sync.newApp("").attr("id", "preview-app"));
  $("#viewPort").children().each(function(){
    $(this).hide();
  });

  mediaPlayer = {};
  mediaPlayer.width = Math.round(parseInt($(window).width()) * 0.75);
  mediaPlayer.height = mediaPlayer.width / 2;

  layout.loadApps();

  var noSleep = new NoSleep();
  noSleep.enable();
};

$(window).on("orientationchange",function(){
  _resizeDelay();
  lastResize = Date.now();
  setTimeout(function(){
    _resizeDelay();
  }, 500);
});
