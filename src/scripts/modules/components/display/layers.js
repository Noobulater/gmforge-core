sync.render("ui_layerOptions", function(obj, app, scope){

  var div = $("<div>");
  div.addClass("flexrow flexbetween");

  var optionsDiv = $("<div>").appendTo(div);
  optionsDiv.addClass("flexcolumn subtitle");

  var layerNameWrap = $("<div>").appendTo(optionsDiv);
  layerNameWrap.addClass("flexcolumn flexmiddle");
  layerNameWrap.append("<b class='subtitle'>Layer Name</b>");

  var layerNameWrap = $("<div>").appendTo(optionsDiv);
  layerNameWrap.addClass("flexrow flexbetween");

  var layerName = genInput({
    parent : layerNameWrap,
    classes : "line lrmargin middle",
    value : obj.data.layers[scope.layer].n,
  });
  layerName.change(function(){
    obj.data.layers[scope.layer].n = $(this).val();
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  optionsDiv.append("<div class='flex'></div>");

  var layerNameWrap = $("<div>").appendTo(optionsDiv);
  layerNameWrap.addClass("flexcolumn flexmiddle");
  layerNameWrap.append("<b class='flex'>Revealed</b>");

  var revealed = $("<div>").appendTo(layerNameWrap);
  revealed.addClass("flexrow");

  var no = $("<button>").appendTo(revealed);
  no.addClass("bold alttext");
  no.text("No");
  if (obj.data.layers[scope.layer].h) {
    no.addClass("highlight");
  }
  else {
    no.addClass("background");
  }
  no.click(function(){
    obj.data.layers[scope.layer].h = 1;
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var yes = $("<button>").appendTo(revealed);
  yes.addClass("bold alttext");
  yes.text("Yes");
  if (obj.data.layers[scope.layer].h) {
    yes.addClass("background");
  }
  else {
    yes.addClass("highlight");
  }
  yes.click(function(){
    delete obj.data.layers[scope.layer].h;
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });
  /*
  var layerNameWrap = $("<div>").appendTo(optionsDiv);
  layerNameWrap.addClass("flexrow flexbetween");
  layerNameWrap.append("<b class='flex'>Interactions</b>");

  var no = $("<button>").appendTo(layerNameWrap);
  no.addClass("bold alttext");
  no.text("No");
  if (obj.data.layers[scope.layer].h) {
    no.addClass("highlight");
  }
  else {
    no.addClass("background");
  }
  no.click(function(){
    obj.data.layers[scope.layer].h = 1;
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var yes = $("<button>").appendTo(layerNameWrap);
  yes.addClass("bold alttext");
  yes.text("Yes");
  if (obj.data.layers[scope.layer].h) {
    yes.addClass("background");
  }
  else {
    yes.addClass("highlight");
  }
  yes.click(function(){
    delete obj.data.layers[scope.layer].h;
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });*/

  var securityContent = $("<div>").appendTo(div);
  securityContent.addClass("flexcolumn white outline smooth");
  securityContent.css("font-size", "0.6em");
  securityContent.css("color", "#333");
  securityContent.css("text-shadow", "none");
  securityContent.css("overflow", "auto");
  var secTbl = {};
  secTbl[getCookie("UserID")] = 1;
  secTbl = obj.data.layers[scope.layer]._s || secTbl;
  var sec = sync.render("ui_rights")(obj, app, {
    security : secTbl,
    displayDefault : true,
    change : function(ev, ui, userID, newSecurity){
      obj.data.layers[scope.layer]._s = obj.data.layers[scope.layer]._s || secTbl;
      if (userID == "default" && newSecurity === "") {
        obj.data.layers[scope.layer]._s[userID] = "1";
      }
      else {
        obj.data.layers[scope.layer]._s[userID] = newSecurity;
      }
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    }
  }).appendTo(securityContent);

  return div;
});

sync.render("ui_boardLayers", function(obj, app, scope) {
  var data = obj.data;
  scope = scope || {
    viewOnly : (app.attr("viewOnly") == "true"),
    local : (app.attr("local") == "true"),
    printing : (app.attr("printing") == "true"),
    layer : (app.attr("layer") || 0),
  };

  var targetApp = $("#"+app.attr("targetApp"));
  scope.layer = targetApp.attr("layer") || 0;

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  if (game.config.data.offline) {
    scope.local = true;
  }
  if (scope.layer >= obj.data.layers.length - 1) {
    scope.layer = obj.data.layers.length - 1;
    scope.layer = Math.max(scope.layer, 0);
    targetApp.attr("layer", obj.data.layers.length - 1);
  }

  var layerWrapper = $("<div>").appendTo(div);
  layerWrapper.addClass("flex");
  layerWrapper.css("position", "relative");
  layerWrapper.css("overflow", "auto");

  var layerContainer = $("<div>").appendTo(layerWrapper);
  layerContainer.addClass("fit-x");
  layerContainer.css("position", "absolute");

  if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
    layerContainer.sortable({
      update : function(ev, ui) {
        var newIndex;
        var count = 0;
        $(ui.item).attr("ignore", true);
        layerContainer.children().each(function(){
          if ($(this).attr("ignore")){
            newIndex = count;
          }
          count += 1;
        });
        var old = obj.data.layers.splice($(ui.item).attr("index"), 1);
        util.insert(obj.data.layers, newIndex, old[0]);
        app.attr("rebuildmenu", true);
        obj.sync("updateAsset");
      }
    });
  }

  for (var i in obj.data.layers) {
    var layerPlate = $("<div>").appendTo(layerContainer);
    layerPlate.addClass("flexrow");
    layerPlate.attr("index", i);

    var optionsBar = $("<div>").appendTo(layerPlate);
    optionsBar.addClass("flexrow flexmiddle foreground bold lrpadding");

    var options = genIcon("cog").appendTo(optionsBar);
    options.attr("index", i);
    options.attr("title", "options");
    options.css("color", "white");
    options.click(function(){
      var index = $(this).attr("index");
      var content = $("<div>");
      content.addClass("flexcolumn");

      var filter = genIcon("filter", "Filters");//.appendTo(content);
      filter.attr("title", "Change this layer's filter");
      filter.click(function(){
        var content = $("<div>");

        var filterWrap = genIcon("refresh", "Reset Filters");
        filterWrap.addClass("flex flexmiddle");
        filterWrap.click(function(){
          brightness.val(100);
          contrast.val(100);
          gray.val(0);
          hue.val(0);
          invert.val(0);
          sepia.val(0);
          opacity.val(100)
        });

        var brightness = genInput({
          type : "range",
          value : 100,
          min : 50,
          max : 150,
        });

        var contrast = genInput({
          type : "range",
          value : 100,
          min : 50,
          max : 100,
        });

        var gray = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        var hue = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 360,
        });

        var invert = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        var sepia = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        var opacity = genInput({
          type : "range",
          value : 100,
          min : 0,
          max : 100,
        });

        brightness.val(100);
        contrast.val(100);
        gray.val(0);
        hue.val(0);
        invert.val(0);
        sepia.val(0);

        if (obj.data.layers[index].o && obj.data.layers[index].o.f) {
          var filters = obj.data.layers[index].o.f;
          brightness.val(parseInt(filters["brightness"]) || 100);
          contrast.val(parseInt(filters["contrast"]) || 100);
          gray.val(parseInt(filters["grayscale"]) || 0);
          hue.val(parseInt(filters["hue-rotate"]) || 0);
          invert.val(parseInt(filters["invert"]) || 0);
          sepia.val(parseInt(filters["sepia"]) || 0);
          opacity.val(parseInt(filters["opacity"]) || 100);
        }

        var controls = ui_controlForm({
          inputs : {
            "Filters" : filterWrap,
            "Brigtness" : brightness,
            "Contrast" : contrast,
            "Grayscale" : gray,
            "Hue Shift" : hue,
            "Inverted" : invert,
            "Sepia" : sepia,
            "Opacity" : opacity,
          },
          click : function(ev, inputs) {
            obj.data.layers[index].o = obj.data.layers[index].o || {};
            obj.data.layers[index].o.f = obj.data.layers[index].o.f || {};
            if (brightness.val() != 100) {
              obj.data.layers[index].o.f["brightness"] = brightness.val();
            }
            else {
              delete obj.data.layers[index].o.f["brightness"];
            }
            if (contrast.val() != 100) {
              obj.data.layers[index].o.f["contrast"] = contrast.val();
            }
            else {
              delete obj.data.layers[index].o.f["contrast"];
            }
            if (gray.val() != 0) {
              obj.data.layers[index].o.f["grayscale"] = gray.val();
            }
            else {
              delete obj.data.layers[index].o.f["grayscale"];
            }
            if (hue.val() != 0) {
              obj.data.layers[index].o.f["hue-rotate"] = hue.val();
            }
            else {
              delete obj.data.layers[index].o.f["hue-rotate"];
            }
            if (invert.val() != 0) {
              obj.data.layers[index].o.f["invert"] = invert.val();
            }
            else {
              delete obj.data.layers[index].o.f["invert"];
            }
            if (sepia.val() != 0) {
              obj.data.layers[index].o.f["sepia"] = sepia.val();
            }
            else {
              delete obj.data.layers[index].o.f["sepia"];
            }
            if (opacity.val() != 0) {
              obj.data.layers[index].o.f["opacity"] = opacity.val();
            }
            else {
              delete obj.data.layers[index].o.f["opacity"];
            }
            app.attr("rebuildmenu", true);
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        }).appendTo(content);

        ui_popOut({
          target : $(this),
          id : "layer-filter",
        }, content);
      });

      var securityContent = $("<div>").appendTo(content);
      function buildSecurity() {
        var secTbl = {};
        secTbl[getCookie("UserID")] = 1;
        secTbl = obj.data.layers[index]._s || secTbl;
        var sec = sync.render("ui_rights")(obj, app, {
          security : secTbl,
          change : function(ev, ui, userID, newSecurity){
            obj.data.layers[index]._s = obj.data.layers[index]._s || secTbl;
            if (userID == "default" && newSecurity === "") {
              obj.data.layers[index]._s[userID] = "1";
            }
            else {
              obj.data.layers[index]._s[userID] = newSecurity;
            }
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
            securityContent.empty();
            buildSecurity().appendTo(securityContent);
          }
        });
        return sec;
      }
      buildSecurity().appendTo(securityContent);

      var optionsBar = $("<div>").appendTo(content);
      optionsBar.addClass("flexrow flexaround");

      var height = genIcon("resize-vertical", "Altitude : " + (obj.data.layers[index].alt || 0))//.appendTo(optionsBar);
      height.attr("title", "Change layer name");
      height.click(function(){
        ui_prompt({
          target : $(this),
          id : "layer-height",
          inputs : {"Altitude" : obj.data.layers[index].alt},
          click : function(ev, inputs) {
            obj.data.layers[index].alt = inputs["Altitude"].val();
            app.attr("rebuildmenu", true);
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
        });

        layout.coverlay("layer-options");
      });

      if (index != 0) {
        var del = genIcon("trash", "Delete Layer").appendTo(optionsBar);
        del.attr("title", "Delete Layer");
        del.addClass("destroy");
        del.click(function(){
          obj.data.layers.splice(index, 1);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay("layer-options");
        });
      }
      else {
        var del = genIcon("trash", "Delete Layer").appendTo(optionsBar);
        del.attr("title", "Delete Layer");
        del.addClass("dull");
      }
      var popout = ui_popOut({
        target : $(this),
        id : "layer-options",
      }, content);
    });
    options.css("padding-right", "0");

    var ignore = genIcon("ok-circle");
    //ignore.appendTo(optionsBar);
    ignore.addClass("lrpadding");
    ignore.attr("index", i);
    ignore.attr("title", "Interactions enabled");
    ignore.css("color", "white");

    if (obj.data.layers[i].l) {
      ignore.changeIcon("ban-circle");
      ignore.attr("title", "Interactions disabled");
    }
    ignore.click(function(){
      var index = $(this).attr("index");

      obj.data.layers[index].l = !obj.data.layers[index].l;
      app.attr("rebuildmenu", true);
      obj.update();
    });

    var layerLabel = $("<div>").appendTo(layerPlate);
    layerLabel.addClass("outlinebottom flex white link flexrow spadding");
    layerLabel.attr("index", i);
    layerLabel.css("border-radius", "0px");

    var nameInput = genInput({
      parent : layerLabel,
      value : obj.data.layers[i].n,
      classes : "line fit-x bold",
      placeholder : "Layer Name",
      index : i,
      style : {"color" : "#333"}
    });
    nameInput.click(function(ev){
      ev.stopPropagation();
    });
    nameInput.change(function(){
      var index = $(this).attr("index");
      obj.data.layers[index].n = $(this).val();
      app.attr("rebuildmenu", true);
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var optionsBar = $("<div>").appendTo(layerPlate);
    optionsBar.addClass("foreground outlinebottom bold flexmiddle");

    var hidden = genIcon("eye-open", "Visible");
    hidden.css("color", "white");
    if (obj.data.layers[i].h) {
      hidden.changeIcon("eye-close", "Hidden");
    }
    hidden.addClass("subtitle lrpadding flexmiddle");
    hidden.appendTo(optionsBar);
    hidden.attr("index", i);
    hidden.click(function(){
      if (!obj.data.layers[$(this).attr("index")].h) {
        obj.data.layers[$(this).attr("index")].h = true;
      }
      else {
        delete obj.data.layers[$(this).attr("index")].h;
      }
      app.attr("rebuildmenu", true);
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
      layout.coverlay("layer-options");
    });
  }

  if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexrow flexmiddle foreground bold subtitle");
    optionsBar.css("color", "white");

    var create = genIcon("plus", "New Layer").appendTo(optionsBar);
    create.attr("title", "Create a new layer");
    create.click(function(){
      app.attr("rebuildmenu", true);
      obj.data.layers.push({
        n : "New Layer",
        _s : {default : "1"},
        t : [], //tiles
        p : [], //pieces
        d : [], //drawing
      });
      obj.sync("updateAsset");
    });
  }

  return div;
});
