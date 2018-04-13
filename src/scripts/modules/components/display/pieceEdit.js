var _quickEditCache;
sync.render("ui_pieceQuickEdit", function(obj, app, scope){
  scope = scope || {
    board : app.attr("board"),
    layer : app.attr("layer"),
    piece : app.attr("piece"),
    zoom : parseInt(app.attr("zoom"))/100,
  };

  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  var misc = $("<div>"); // reserved for actions
  misc.addClass("fit-x");

  var miscWrap = $("<div>").appendTo(misc);
  miscWrap.addClass("flexrow flex");
  miscWrap.css("font-size", "1.2em");

  if (app.attr("lastLength") && obj.data.layers[scope.layer].p.length != app.attr("lastLength")) {
    // change detected
    var changeFound = false;
    for (var i in obj.data.layers[scope.layer].p) {
      if (JSON.stringify(obj.data.layers[scope.layer].p[i]) == JSON.stringify(_quickEditCache)) {
        scope.piece = i;
        app.attr("piece", i);
        changeFound = true;
        break;
      }
    }
    if (!changeFound) {
      layout.coverlay($(".piece-quick-edit"));
    }
  }
  var pieceData = obj.data.layers[scope.layer].p[scope.piece];
  _quickEditCache = duplicate(pieceData);
  app.attr("lastLength", obj.data.layers[scope.layer].p.length);
  if (pieceData) {
    var charIndex = pieceData.eID;
    var noteIndex = pieceData.nID;
    var char;
    if (charIndex instanceof Object) {
      char = getEnt(charIndex[0]);
    }
    else {
      char = getEnt(charIndex);
    }

    var hasBoardRights = hasSecurity(getCookie("UserID"), "Rights", obj.data);
    var hasRights = hasBoardRights || hasSecurity(getCookie("UserID"), "Game Master");
    if (!hasRights && char) {
      hasRights = hasSecurity(getCookie("UserID"), "Rights", char.data);
    }

    var title = genInput({
      //parent : div,
      value : pieceData.t,
      classes : "outline alttext middle subtitle",
      style : {"background-color" : "rgb(0,0,0,0.8)", "box-shadow" : "none"}
    });
    title.change(function(){
      obj.data.layers[scope.layer].p[scope.piece].t = $(this).val();
      if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
      }
    });

    if (!(charIndex instanceof Object)) {
      if (char && char.data._t == "c" && (hasRights || hasSecurity(getCookie("UserID"), "Visible", char.data))) {
        /*if (game.templates.display.sheet.health) {
          var health = game.templates.display.sheet.health;
          var newApp = sync.newApp("ui_editable").appendTo(div);
          newApp.addClass("alttext hover2 subtitle smooth outline fit-x");
          newApp.css("pointer-events", "auto");
          newApp.attr("lookup", health);
          newApp.css("background-color", "rgba(0,0,0,0.8)");
          if (hasRights) {
            newApp.css("cursor", "pointer");
            newApp.click(function(ev){
              if (obj.data.layers[scope.layer].p[scope.piece].hp) {
                delete obj.data.layers[scope.layer].p[scope.piece].hp;
              }
              else {
                obj.data.layers[scope.layer].p[scope.piece].hp = true;
              }
              layout.coverlay("icons-picker");
              if (!hasBoardRights && hasRights) {
                runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
                boardApi.boardMove($(".board-"+obj.id()), "board-"+obj.id()+"-piece-"+scope.layer+"-"+scope.piece, obj.data.layers[scope.layer].p[scope.piece]);
              }
              else if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
              ev.preventDefault();
              ev.stopPropagation();
            });
          }
          else {
            newApp.attr("viewOnly", "true");
          }
          char.addApp(newApp);
        }
        */

        var newApp = sync.newApp("ui_hotActions").appendTo(misc);
        newApp.addClass("alttext smooth outline");
        newApp.css("background-color", "rgba(0,0,0,0.8)");
        newApp.css("pointer-events", "auto");
        setTimeout(function(){
          newApp.css("max-width", div.width());
          char.addApp(newApp);
        });
      }
    }
    if ((!pieceData.eID || hasRights) && (pieceData.e && (pieceData.e.t == 1 || hasBoardRights))) {
      var button = $("<button>").appendTo(div);
      button.addClass("highlight subtitle alttext");
      button.css("pointer-events", "auto");
      button.text("Fire Trigger!");
      button.click(function(){
        var ctx = sync.defaultContext();
        ctx[obj.data._t] = {layers : {}};
        for (var lid in obj.data.layers) {
          ctx[obj.data._t].layers[lid] = {h : obj.data.layers[lid].h};
        }

        for (var cID in pieceData.e.calc) {
          var calcData = pieceData.e.calc[cID];
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
                  boardApi.pix.updateLayer(calcData.target.split(".")[1], {r : true}, obj);
                }
              }
            }
          }
        }
      });
    }

    var parent = $("<div>").appendTo(div);
    parent.addClass("flexrow flexbetween fit-x");
    parent.css("position", "relative");

    var leftPad = $("<div>").appendTo(parent);
    leftPad.addClass("flex flexcolumn alttext");
    leftPad.css("pointer-events", "auto");

    var leftPadWrap = $("<div>").appendTo(leftPad);
    leftPadWrap.css("background", "rgba(0,0,0,0.8)");
    if (hasRights) {
      leftPadWrap.addClass("outline smooth");
      var invisible = pieceData.v;
      var reveal = genIcon("eye-open");
      reveal.appendTo(leftPadWrap);
      reveal.addClass("flexmiddle spadding");
      reveal.attr("title", "Piece's visibility to players");
      reveal.click(function(){
        obj.data.layers[scope.layer].p[scope.piece].v = !pieceData.v;
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
      });
      if (invisible) {
        reveal.changeIcon("eye-close");
      }
    }
    if (hasBoardRights) {
      leftPadWrap.addClass("outline smooth");
      var locked = pieceData.l;
      var pin = genIcon("pushpin").appendTo(leftPadWrap);
      pin.addClass("flexmiddle spadding");
      pin.attr("title", "Piece can only be interacted with when on this layer");
      pin.click(function(){
        obj.data.layers[scope.layer].p[scope.piece].l = !pieceData.l;
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
      });
      if (locked) {
        pin.addClass("highlight2 alttext");
      }

      var del = genIcon("trash").appendTo(leftPadWrap);
      del.addClass("flexmiddle spadding");
      del.attr("title", "Delete this piece");
      del.click(function(){
        ui_prompt({
          target : $(this),
          confirm : "Delete Piece",
          click : function(ev, inputs){
            var delEnt = getEnt(obj.data.layers[scope.layer].p[scope.piece].eID);
            if (delEnt && delEnt.data && delEnt.data.tags && delEnt.data.tags["temp"]) {
              if (hasSecurity(getCookie("UserID"), "Owner", delEnt.data)) {
                delEnt.sync("deleteAsset");
              }
            }
            layout.coverlay($(".piece-quick-edit"));
            boardApi.pix.destroyObject(scope.layer, "p", scope.piece, obj);
          }
        });
      });

      var statusEffects = genIcon("exclamation-sign").appendTo(leftPadWrap);
      statusEffects.addClass("flexmiddle spadding");
      statusEffects.attr("title", "Effects");
      statusEffects.click(function(){
        var optionList = [];
        var content = $("<div>");
        content.addClass("flexcolumn");

        for (var key in util.art.Effects) {
          var img = $("<img>").appendTo(content);
          img.addClass("hover2");
          img.attr("src", util.art.Effects[key].src);
          img.attr("width", "30px");
          img.attr("height", "30px");
          if (obj.data.layers[scope.layer].p[scope.piece].rpg && util.contains(obj.data.layers[scope.layer].p[scope.piece].rpg, util.art.Effects[key].src)) {
            img.addClass("highlight outline smooth");
          }
          img.click(function(){
            obj.data.layers[scope.layer].p[scope.piece].rpg = obj.data.layers[scope.layer].p[scope.piece].rpg || [];
            var rpg = obj.data.layers[scope.layer].p[scope.piece].rpg;
            if (rpg && util.contains(rpg, $(this).attr("src"))) {
              for (var key=0; key<rpg.length; key++) {
                if (rpg[key] == $(this).attr("src")) {
                  rpg.splice(key, 1);
                  break;
                }
              }
            }
            else {
              rpg.push($(this).attr("src"));
            }
            runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
            boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
            statusEffects.click();
          });
        }

        optionList.push({
          name : content,
          style : {"color" : "transparent"},
        });
        var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true, align : "center"});
        menu.removeClass("outline");
      });
      statusEffects.contextmenu(function(ev){
        delete obj.data.layers[scope.layer].p[scope.piece].rpg;
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
        layout.coverlay("icons-picker");
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });

    }

    var padding = $("<div>").appendTo(leftPad);
    padding.addClass("flex");

    var leftPadWrap = $("<div>").appendTo(leftPad);
    leftPadWrap.css("background", "rgba(0,0,0,0.8)");

    var entDiv;
    if (charIndex && char) {
      entDiv = $("<div>").appendTo(parent);
      entDiv.addClass("outline white round flexmiddle subtitle fit-x");
      entDiv.css("width", pieceData.w * scope.zoom+ 30);
      entDiv.css("height", pieceData.h * scope.zoom + 30);
      entDiv.css("max-height", "400px");
      entDiv.css("max-width", "400px");
      if (charIndex instanceof Object) {
        entDiv.css("min-width", "150px");
      }
      entDiv.css("position", "relative");
      entDiv.css("overflow", "visible");
      entDiv.css("opacity", "0");
      entDiv.css("pointer-events", "none");
      if (char.data._t == "c") {
        entDiv.css("background-image", "url('"+(sync.rawVal(char.data.info.img) || "/content/icons/blankchar.png")+"')");
      }
      else {
        entDiv.css("background-image", "url('"+(sync.rawVal(char.data.info.img) || "/content/icons/Scroll1000p.png")+"')");
      }
      entDiv.css("background-repeat", "no-repeat");
      entDiv.css("background-position", "center");
      entDiv.css("background-size", "contain");
      if (hasSecurity(getCookie("UserID"), "Visible", char.data)) {
        entDiv.append("<text class='alttext fit-x outline lrpadding' style='background-color : rgba(0,0,0,0.7);'>"+(sync.rawVal(char.data.info.name) || "No Name")+"</text>");
        leftPadWrap.addClass("outline smooth");
        var summary = genIcon("link");
        summary.appendTo(leftPadWrap);
        summary.addClass("flexmiddle spadding");
        summary.attr("title", "Change Asset Link");
        summary.css("pointer-events", "auto");
        summary.click(function(ev){
          if (layout.mobile) {
            $(".piece-quick-edit").remove();
          }
          var content = sync.render("ui_assetPicker")(obj, app, {
            rights : "Visible",
            select : function(ev, ui, ent, options){
              obj.data.layers[scope.layer].p[scope.piece].eID = ent.id();
              if (ent.data.info && ent.data.info.img) {
                if (ent.data.info.img.min) {
                  obj.data.layers[scope.layer].p[scope.piece].i = ent.data.info.img.min;
                }
              }
              layout.coverlay("add-asset");
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
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
        });
        summary.contextmenu(function(ev){
          delete obj.data.layers[scope.layer].p[scope.piece].eID;
          runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
          boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
          sync.updateApp(app, obj);
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        });
      }
      if (char.data._t == "b" && !(charIndex instanceof Object)) {
        var content = sync.newApp("ui_boardActions").appendTo(misc);
        content.attr("targetApp", app.attr("targetApp"));
        content.css("pointer-events", "auto");
        char.addApp(content);
      }

      if (hasRights) {
        entDiv.addClass("hover2");
        entDiv.click(function(){
          if (layout.mobile) {
            $(".piece-quick-edit").remove();
          }
          assetTypes[char.data._t].preview(char, $(this));
        });
        entDiv.contextmenu(function(ev){
          assetTypes.contextmenu(ev, $(this), char, entDiv, []);
          ev.preventDefault();
          ev.stopPropagation();
        });
      }
    }
    else {
      entDiv = $("<div>").appendTo(parent);
      entDiv.addClass("outline white round flexmiddle subtitle hover2 fit-x");
      entDiv.css("width", pieceData.w * scope.zoom+ 30);
      entDiv.css("height", pieceData.h * scope.zoom + 30);

      if ((pieceData.w * scope.zoom+ 30) > 400 || (pieceData.h * scope.zoom + 30) > 400) {
        entDiv.css("max-height", "0");
        entDiv.css("max-width", "0");
      }

      entDiv.css("position", "relative");
      entDiv.css("overflow", "visible");
      entDiv.css("opacity", "0");
      entDiv.css("pointer-events", "none");
      entDiv.append("<text class='alttext outline lrpadding fit-x' style='background-color : rgba(0,0,0,0.8);'>No Link</text>");

      if (hasRights) {
        leftPadWrap.addClass("outline smooth");

        var summary = genIcon("link");
        summary.appendTo(leftPadWrap);
        summary.addClass("flexmiddle spadding");
        summary.attr("title", "Change Asset Link");
        summary.css("pointer-events", "auto");
        summary.click(function(ev){
          if (layout.mobile) {
            $(".piece-quick-edit").remove();
          }
          var content = sync.render("ui_assetPicker")(obj, app, {
            rights : "Visible",
            select : function(ev, ui, ent, options){
              obj.data.layers[scope.layer].p[scope.piece].eID = ent.id();
              if (ent.data.info && ent.data.info.img) {
                if (ent.data.info.img.min) {
                  obj.data.layers[scope.layer].p[scope.piece].i = ent.data.info.img.min;
                }
              }
              layout.coverlay("add-asset");
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
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
        });

        entDiv.click(function(){
          var content = sync.render("ui_assetPicker")(obj, app, {
            rights : "Visible",
            select : function(ev, ui, ent, options){
              obj.data.layers[scope.layer].p[scope.piece].eID = ent.id();
              if (ent.data.info && ent.data.info.img) {
                if (ent.data.info.img.min) {
                  obj.data.layers[scope.layer].p[scope.piece].i = ent.data.info.img.min;
                }
              }
              layout.coverlay("add-asset");
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
              ev.stopPropagation();
              ev.preventDefault();
            }
          });

          var popOut = ui_popOut({
            target : $("body"),
            prompt : true,
            id : "add-asset",
            title : "Attach Link",
            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
          }, content);
          popOut.resizable();
        });
      }
    }

    if ((pieceData.a || obj.data.layers[scope.layer].a || 0) && !(pieceData.eID instanceof Object)) {
      var altText = $("<div>").appendTo(entDiv);
      altText.addClass("alttext");
      altText.css("position", "absolute");
      altText.css("left", "0");
      altText.css("bottom", "0");
      altText.text("Alt.");

      var alt = genIcon("", (pieceData.a || obj.data.layers[scope.layer].a || 0) + " " + (obj.data.options.unit || "un")).appendTo(entDiv);
      alt.addClass("alttext");
      alt.css("position", "absolute");
      alt.css("right", "0");
      alt.css("bottom", "0");
      alt.css("pointer-events", "auto");
      if (hasRights) {
        alt.click(function(ev){
          ui_prompt({
            target : $(this),
            inputs : {"Altitude" : {type : "number", value : pieceData.a, placeholder : "Altitude"}},
            click : function(ev, inputs) {
              obj.data.layers[scope.layer].p[scope.piece].a = Number(inputs["Altitude"].val());
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
            }
          });
          ev.preventDefault();
          ev.stopPropagation();
        });
      }
    }

    var rightPad = $("<div>").appendTo(parent);
    rightPad.addClass("flex flexcolumn");
    rightPad.css("font-size", "1.2em");
    rightPad.css("pointer-events", "auto");
    if (hasRights) {
      var tokenPreview = $("<div>").appendTo(rightPad);
      tokenPreview.addClass("outline white smooth hover2");
      tokenPreview.attr("title", "Token Art");
      tokenPreview.css("width", "25px");
      tokenPreview.css("height", "25px");
      tokenPreview.css("background-image", "url('"+(pieceData.i || "")+"')");
      tokenPreview.css("background-repeat", "no-repeat");
      tokenPreview.css("background-position", "center");
      tokenPreview.css("background-size", "cover");
      tokenPreview.click(function(){
        var imgList = sync.render("ui_filePicker")(obj, app, {
          filter : "img",
          value : pieceData.i,
          change : function(ev, ui, value){
            obj.data.layers[scope.layer].p[scope.piece].i = value;
            layout.coverlay("icons-picker");
            runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
            boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
            sync.updateApp(app, obj);
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
      tokenPreview.contextmenu(function(ev){
        delete obj.data.layers[scope.layer].p[scope.piece].i;
        layout.coverlay("icons-picker");
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
        ev.preventDefault();
        ev.stopPropagation();
      });

      var colPreview = $("<div>").appendTo(rightPad);
      colPreview.addClass("smooth white hover2 flexcolumn");
      colPreview.attr("title", "Color");
      colPreview.css("width", "25px");
      colPreview.css("height", "25px");
      colPreview.css("background-image", "url('/content/checkered.png')");
      colPreview.append($("<div>").css("background", pieceData.c).addClass("flex outline"));
      colPreview.click(function(){
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
              obj.data.layers[scope.layer].p[scope.piece].c = ui.css("background-color");
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
            },
          });
        }
        optionList.push({
          icon : "cog",
          click : function(){
            var primaryCol = sync.render("ui_colorPicker")(obj, app, {
              hideColor : true,
              custom : true,
              colorChange : function(ev, ui, value){
                obj.data.layers[scope.layer].p[scope.piece].c = value;
                runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
                boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
                sync.updateApp(app, obj);
                layout.coverlay("piece-color");
              }
            });

            ui_popOut({
              target : colPreview,
              id : "piece-color",
            }, primaryCol);
          },
        });
        var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true, align : "center"});
        menu.removeClass("outline");
      });
      colPreview.contextmenu(function(ev){
        obj.data.layers[scope.layer].p[scope.piece].c = "rgba(0,0,0,0)";
        layout.coverlay("icons-picker");
        runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
        boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
        sync.updateApp(app, obj);
        ev.preventDefault();
        ev.stopPropagation();
      });

      if (hasBoardRights) {
        var shapePreview = $("<div>").appendTo(rightPad);
        shapePreview.attr("title", "Shape");
        shapePreview.css("width", "25px");
        shapePreview.css("height", "25px");
        shapePreview.addClass("hover2 flexmiddle");
        shapePreview.append(buildShape(pieceData.d || 0, pieceData.c || "rgba(0,0,0,0.8)", 20));
        shapePreview.click(function(){
          var optionList = [];
          var imgList = sync.render("ui_shapePicker")(obj, app, {
            vertical : true,
            color : pieceData.c || "rgba(0,0,0,0.8)",
            size : 30,
            shapeChange : function(ev, ui, value){
              console.log(scope.piece, value);
              obj.data.layers[scope.layer].p[scope.piece].d = value;
              runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
              boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
              sync.updateApp(app, obj);
              layout.coverlay("icons-picker");
            }
          }).addClass("flexcolumn");

          optionList.push({
            name : imgList,
            style : {"color" : "transparent"},
          });
          var menu = ui_dropMenu($(this), optionList, {"id" : "color-picker", hideClose : true, align : "center"});
          menu.removeClass("outline");
        });
        shapePreview.contextmenu(function(ev){
          delete obj.data.layers[scope.layer].p[scope.piece].d;
          runCommand("boardMove", {id : obj.id(), layer : scope.layer, type : "p", index : scope.piece, data : obj.data.layers[scope.layer].p[scope.piece]});
          boardApi.pix.updateObject(scope.layer, "p", scope.piece, obj);
          sync.updateApp(app, obj);
          layout.coverlay("icons-picker");
          ev.preventDefault();
          ev.stopPropagation();
        });
      }


      if (!(charIndex instanceof Object) && char) {
        var padding = $("<div>").appendTo(rightPad);
        padding.addClass("flex");

        var charPreview = $("<div>").appendTo(rightPad);
        charPreview.addClass("outline white smooth hover2");
        charPreview.attr("title", "Preview Sheet");
        charPreview.css("width", "25px");
        charPreview.css("height", "25px");
        if (char.data._t == "c") {
          charPreview.css("background-image", "url('"+(sync.rawVal(char.data.info.img) || "/content/icons/blankchar.png")+"')");
        }
        else {
          charPreview.css("background-image", "url('"+(sync.rawVal(char.data.info.img) || "/content/icons/Scroll1000p.png")+"')");
        }
        charPreview.css("background-repeat", "no-repeat");
        charPreview.css("background-position", "center");
        charPreview.css("background-size", "cover");
        charPreview.addClass("hover2");
        charPreview.click(function(){
          if (layout.mobile) {
            $(".piece-quick-edit").remove();
          }
          assetTypes[char.data._t].preview(char, $(this));
        });
        charPreview.contextmenu(function(ev){
          assetTypes.contextmenu(ev, $(this), char, entDiv, []);
          ev.preventDefault();
          ev.stopPropagation();
        });
      }
    }

    misc.appendTo(div);
    if (charIndex instanceof Object) {
      var centerPad = $("<div>").appendTo(div);
      centerPad.addClass("outline smooth spadding");
      centerPad.css("background-color", "rgba(0,0,0,0.8)");
      //centerPad.css("width", pieceData.w * scope.zoom + 20);
      //centerPad.css("height", pieceData.h * scope.zoom + 20);
      centerPad.css("min-width", "150px");
      centerPad.css("pointer-events", "auto");

      for (var idx=0; idx<charIndex.length; idx++) {
        var char = getEnt(charIndex[idx]);
        var hasBoardRights = hasSecurity(getCookie("UserID"), "Rights", obj.data);
        var hasRights = hasBoardRights || hasSecurity(getCookie("UserID"), "Game Master");
        if (!hasRights && char) {
          hasRights = hasSecurity(getCookie("UserID"), "Rights", char.data);
        }

        var entDiv = $("<div>").appendTo(centerPad);
        entDiv.addClass("flexcolumn");
        if (idx > 0) {
          entDiv.addClass("subtitle");
        }
        else {
          entDiv.addClass("outlinebottom smooth");
          entDiv.css("font-size", "1.2em");
        }
        entDiv.css("position", "relative");
        entDiv.css("overflow", "visible");
        entDiv.css("background-repeat", "no-repeat");
        entDiv.css("background-position", "center");
        entDiv.css("background-size", "contain");
        if (hasSecurity(getCookie("UserID"), "Visible", char.data) || char.data._t == "b") {
          var ent = sync.render("ui_ent")(char, entDiv, {
            click : function(ev, plate, char){
              plate.contextmenu();
              ev.stopPropagation();
              ev.preventDefault();
            },
            draw : function(plate, char) {
              plate.removeClass("outline");

              if (idx > 0) {
                plate.addClass("lrmargin smooth outlinebottom");
              }
              else {
                plate.css("height", "40px");
              }
              if (char.data._t == "b" && !plate.hasClass("inactive")) {
                var button = $("<button>").appendTo(plate);
                button.addClass("flexrow highlight alttext");
                button.attr("title", "Enter Map");
                button.append(genIcon("log-in"));

                button.click(function(ev) {
                  var tabs = game.state.data.tabs;
                  var active;
                  for (var i in tabs) {
                    if (char.id() == tabs[i].index) {
                      active = i;
                      break;
                    }
                  }
                  var submenu;
                  if (active) {
                    if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
                      $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
                      $("#"+app.attr("targetApp")).removeAttr("scrollTop");
                      $("#"+app.attr("targetApp")).removeAttr("zoom");
                    }
                    for (var i in game.state._apps) {
                      if ($("#"+game.state._apps[i]).length) {
                        $("#"+game.state._apps[i]).attr("tab", active);
                      }
                    }
                    game.state.update();
                  }
                  else if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
                    game.state.data.tabs.push({index : char.id(), ui : "ui_board"});
                    if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
                      $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
                      $("#"+app.attr("targetApp")).removeAttr("scrollTop");
                      $("#"+app.attr("targetApp")).removeAttr("zoom");
                    }
                    for (var i in game.state._apps) {
                      if ($("#"+game.state._apps[i]).length) {
                        $("#"+game.state._apps[i]).attr("tab", game.state.data.tabs.length-1);
                      }
                    }
                    game.state.sync("updateState");
                  }
                  layout.coverlay($(".piece-quick-edit"));
                });
              }
            }
          }).appendTo(entDiv);
          ent.addClass("white");
        }
      }
    }
  }
  else {
    div.append("<b>Piece not Found</b>");
  }


  return div;
});
