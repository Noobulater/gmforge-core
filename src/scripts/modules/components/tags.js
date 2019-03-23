sync.render("ui_tags", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), path : app.attr("path")};

  var div = $("<div>");
  div.addClass("flexrow fit-x");
  div.css("color", "#333");
  div.css("text-shadow", "none");

  var data = sync.traverse(obj.data, (scope.path || ""));
  data.tags = data.tags || {};
  game.templates.tags = game.templates.tags || {};

  if (scope.path) {
    scope.path = scope.path+".";
  }

  var tagList = $("<div>").appendTo(div);
  tagList.addClass("flexrow flexaround flex flexwrap subtitle");

  var createOptions = $("<div>").appendTo(div);
  createOptions.addClass("flexrow flexmiddle");

  var markedTags = false;
  var keys = Object.keys(data.tags) || [];
  keys.sort();

  for (var tagKey in keys) {
    var tag = keys[tagKey];
    if (data.tags[tag]) {
      markedTags = true;
      var tagBubble = $("<div>").appendTo(tagList);
      tagBubble.addClass("flexrow flexbetween smooth lrpadding");
      tagBubble.attr("index", tag);

      var remove = genIcon((!scope.viewOnly)?("remove"):(""), tag)
      remove.addClass("inactive");

      var triangle = $("<div>");
      triangle.css("border-top", "10px solid transparent");
      triangle.css("border-bottom", "10px solid transparent");
      triangle.css("border-left", "10px solid rgba(235, 235, 228, 1)");
      
      if (game.templates.tags && game.templates.tags[tag]) {
        var tagData = game.templates.tags[tag];
        if (tagData.hint) {
          tagBubble.attr("hint", tagData.hint);
        }
        if (tagData.bCol) {
          remove.css("background", tagData.bCol);
          triangle.css("border-left", "10px solid " + tagData.bCol);
        }
        if (tagData.color) {
          tagBubble.css("color", tagData.color);
        }
        /*tagBubble.hover(function(){
          var tag = $(this).attr("index");

          var effectsList = $("<div>");
          effectsList.addClass("flexcolumn subtitle");

          var newTag = game.templates.tags[tag];

          if (newTag.calc.length) {
            var ctx = sync.defaultContext();
            ctx[obj.data._t] = duplicate(obj.data);

            for (var id in newTag.calc) {
              var calcData = newTag.calc[id];

              var calcPlate = $("<div>").appendTo(effectsList);
              calcPlate.addClass("flexrow flexbetween fit-x");

              var targetPlate = $("<div>").appendTo(calcPlate);
              targetPlate.addClass("flexmiddle");

              var targetName = calcData.target;
              if (targetName.match("\.modifiers")) {
                targetName = targetName.substring(0, targetName.match("\.modifiers").index);
              }
              else {
                calcPlate.append("<b class='lrpadding'> = </b>");
              }

              var target = sync.traverse(obj.data, targetName);
              if (target instanceof Object) {
                targetPlate.append(target.name);
              }
              else {
                targetPlate.append(calcData.target);
              }

              var eqPlate = $("<div>").appendTo(calcPlate);
              eqPlate.addClass("flexmiddle flex lrpadding");

              if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                var val = sync.eval(calcData.eq, ctx);

                if (isNaN(val)) {
                  eqPlate.append(val);
                }
                else {
                  if (val > 0 && calcData.target.match("\.modifiers")) {
                    eqPlate.append("+"+val);
                  }
                  else {
                    eqPlate.append(val);
                  }
                }
              }
              else {
                eqPlate.append("<i>condition not met</i>");
              }
            }
          }
          else {
            effectsList.text("No Effects");
          }

          var pop = ui_popOut({
            target : $(this),
            align : "bottom",
            noCss : true,
            hideclose : true,
            style : {"padding" : "0.5em", "background-color" : "white"},
            id : app.attr("id")+"-hint-dialog"
          }, effectsList);
          pop.hover(function(){layout.coverlay($(this))});
        },
        function(){
          layout.coverlay(app.attr("id")+"-hint-dialog");
        });*/
      }

      remove.appendTo(tagBubble);
      remove.attr("index", tag);
      remove.addClass("bold spadding flexmiddle");


      triangle.appendTo(tagBubble);

      if (!scope.viewOnly) {
        remove.click(function(){
          delete obj.data.tags[$(this).attr("index")];
          if (game.templates.tags[$(this).attr("index")]) {
            var effects = game.templates.tags[$(this).attr("index")].calc;
            for (var eid in effects) {
              if (effects[eid].target.match(".modifiers")) {
                sync.traverse(obj.data, effects[eid].target, "");
              }
            }
          }
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay(app.attr("id")+"-hint-dialog");
        });
      }
    }
  }

  if (!scope.viewOnly) {
    data.tags = data.tags || {};

    var newTagInput = genInput({
      type : "list",
      list : "tag-list",
      parent : createOptions,
      placeholder : "Add Tag",
      style : {"width" : "130px"}
    }).addClass("flexmiddle subtitle");
    newTagInput.focus(function(){
      layout.coverlay("tag-list");
      var dataList = $("<datalist>").appendTo(div);
      dataList.attr("id", "tag-list");
      for (var tag in (scope.tagList || game.templates.tags)) {
        if (!data.tags[tag]) {
          var option = $("<option>").appendTo(dataList);
          option.attr("value", tag);
        }
      }
    });
    newTagInput.change(function(){
      var val = ($(this).val() || "").toLowerCase();
      val = replaceAll(val, ".", "");
      var tagSplit = val.split(",");
      for (var i in tagSplit) {
        var val = tagSplit[i];
        if (val && val.trim()) {
          if (!data.tags[val]) {
            data.tags[val] = 1;
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
          else {
            sendAlert({text : "Tag already applied"});
            $(this).val();
          }
        }
      }
    });
  }

  return div;
});

sync.render("ui_manageTags", function(obj, app, scope){
  obj.data.templates.tags = obj.data.templates.tags || {};

  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle flex");

  var newTag = genInput({
    parent : div,
    placeholder : "Enter a new Tag",
    classes : "line middle margin",
  });
  newTag.change(function(){
    if ($(this).val()) {
      var tag = $(this).val();
      tag = replaceAll(tag.toLowerCase(), "\.", "");
      tag = replaceAll(tag, "$", "");
      obj.data.templates.tags[tag] = {};
      obj.update();
    }
  });

  var sorted = Object.keys(obj.data.templates.tags);
  sorted.sort(function(a,b){
    return String(a).localeCompare(String(b));
  });

  for (var i in sorted) {
    var tag = sorted[i];

    var tagData = obj.data.templates.tags[tag];

    var tagBubbleWrapWrap = $("<div>").appendTo(div);
    tagBubbleWrapWrap.addClass("flexrow flexaround");

    var tagBubbleWrap = $("<div>").appendTo(tagBubbleWrapWrap);
    tagBubbleWrap.addClass("flexrow lrpadding");

    var tagBubble = $("<div>").appendTo(tagBubbleWrap);
    tagBubble.addClass("flexrow flexbetween smooth lrpadding");
    tagBubble.attr("index", tag);

    var tagName = $("<div>").appendTo(tagBubble);
    tagName.addClass("inactive flexmiddle bold");
    tagName.append(tag);

    var triangle = $("<div>").appendTo(tagBubble);
    triangle.css("border-top", "10px solid transparent");
    triangle.css("border-bottom", "10px solid transparent");
    triangle.css("border-left", "10px solid rgba(235, 235, 228, 1)");

    if (obj.data.templates.tags && obj.data.templates.tags[tag]) {
      var tagData = obj.data.templates.tags[tag];
      if (tagData.bCol) {
        tagName.css("background", tagData.bCol);
        triangle.css("border-left", "10px solid " + tagData.bCol);
      }
      if (tagData.color) {
        tagBubble.css("color", tagData.color);
      }
    }

    var tagBubbleColor = $("<div>").appendTo(tagBubbleWrapWrap);
    tagBubbleColor.addClass("flexrow flex lrpadding");

    var bckCol = $("<div>").appendTo(tagBubbleColor);
    bckCol.addClass("lpadding hover2 outline smooth");
    bckCol.attr("title", "Background Color");
    bckCol.attr("tag", tag);
    bckCol.css("background", tagData.bCol || "rgba(235,235,228,1)");
    bckCol.click(function(){
      var tag = $(this).attr("tag");
      var content = sync.render("ui_colorPicker")(obj, content, {
        hideColor : true,
        custom : true,
        color : tagData.bCol,
        colorChange : function(ev, ui, newCol) {
          obj.data.templates.tags[tag].bCol = newCol;
          bckCol.css("background", newCol);
          layout.coverlay("color-picker");
          obj.update();
        }
      });
      var pop = ui_popOut({
        target : $(this),
        id : "color-picker",
      }, content);
    });

    var textCol = $("<div>").appendTo(tagBubbleColor);
    textCol.addClass("lpadding hover2 outline smooth");
    textCol.attr("title", "Text Color");
    textCol.attr("tag", tag);
    textCol.css("background", tagData.color || "#333");
    textCol.click(function(){
      var tag = $(this).attr("tag");
      var content = sync.render("ui_colorPicker")(obj, content, {
        hideColor : true,
        custom : true,
        color : tagData.color,
        colorChange : function(ev, ui, newCol) {
          obj.data.templates.tags[tag].color = newCol;
          textCol.css("background", newCol);
          layout.coverlay("color-picker");
          obj.update();
        }
      });
      var pop = ui_popOut({
        target : $(this),
        id : "color-picker",
      }, content);
    });

    var remove = genIcon("info-sign").appendTo(tagBubbleColor);
    remove.addClass("flexmiddle bold lrmargin");
    if (!obj.data.templates.tags[tag].hint) {
      remove.addClass("dull");
    }
    remove.attr("title", "Tag Hint");
    remove.attr("tag", tag);
    remove.click(function(){
      var tag = $(this).attr("tag");
      ui_prompt({
        target : $(this),
        inputs : {
          "Tag Hint" : obj.data.templates.tags[tag].hint,
        },
        click : function(ev, inputs){
          if (inputs["Tag Hint"].val()) {
            obj.data.templates.tags[tag].hint = inputs["Tag Hint"].val();
          }
          else {
            delete obj.data.templates.tags[tag].hint;
          }
          obj.update();
        }
      });
    });

    var remove = genIcon("trash").appendTo(tagBubbleColor);
    remove.addClass("destroy flexmiddle bold");
    remove.attr("Remove Tag");
    remove.attr("tag", tag);
    remove.click(function(){
      var tag = $(this).attr("tag");
      delete obj.data.templates.tags[tag];
      obj.update();
    });
  }

  return div;
});
