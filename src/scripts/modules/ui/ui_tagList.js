sync.render("ui_tagList", function(obj, app, scope){
  var data = obj.data;
  data.tags = data.tags || {};

  var div = $("<div>");
  div.addClass("padding");

  var info = data.info;

  var title = $("<b class='flexmiddle'>"+((scope.title!=null)?(scope.title):("Tags"))+"</b>").appendTo(div);
  if (!scope.viewOnly) {
    var icon = genIcon("tag").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      var content = $("<div>");
      content.addClass("flexcolumn subtitle");

      var newTagInput = genInput({
        parent : content,
        type : "list",
        list : "tag-list",
        placeholder : scope.title
      });
      newTagInput.focus(function(){
        layout.coverlay("tag-list");
        var dataList = $("<datalist>").appendTo(div);
        dataList.attr("id", "tag-list");

        for (var tag in game.templates.tags) {
          if (!data.tags[tag] && (!scope.filter || tag.split("_")[0] == scope.filter)) {
            var option = $("<option>").appendTo(dataList);
            if (scope.filter) {
              option.attr("value", tag.split("_")[1]);
            }
            else {
              option.attr("value", tag);
            }
          }
        }
      });
      newTagInput.change(function(){
        var val = ($(this).val() || "");
        if (val && val.trim()) {
          if (scope.filter) {
            val = scope.filter + "_" + val;
          }
          if (!data.tags[val]) {
            data.tags[val] = 1;
            // apply tag effects
            if (game.templates.tags && game.templates.tags[val]) {
              var effects = game.templates.tags[val].calc;
              var ctx = sync.defaultContext();
              // resolve effect
              for (var id in effects) {
                ctx[obj.data._t] = duplicate(obj.data);
                if (scope.path) {
                  ctx["i"] = duplicate(sync.traverse(obj.data, scope.path));
                }
                if (!effects[id].cond || sync.eval(effects[id].cond, ctx)) {
                  sync.traverse(obj.data, effects[id].target, sync.eval(effects[id].eq, ctx));
                }
              }
            }
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
          layout.coverlay("add-tag-list");
        }
      });
      var button = $("<button>").appendTo(content);
      button.append("Confirm");

      var pop = ui_popOut({
        target : $(this),
        id : "add-tag-list",
        title : "New Tag"
      }, content);
    });
  }

  var tagDiv = $("<div>").appendTo(div);
  tagDiv.addClass("subtitle");
  if (scope.classes) {
    tagDiv.addClass(scope.classes);
  }

  var tagList = [];
  if (scope.filter) {
    for (var i in data.tags) {
      if (i.split("_")[0] == scope.filter) {
        tagList.push(i);
      }
    }
  }
  else {
    tagList = Object.keys(data.tags);
  }
  tagList.sort(function(a,b){return a-b;});

  for (var index in tagList) {
    var tag = tagList[index];
    var tagBubble = $("<div>").appendTo(tagDiv);
    tagBubble.addClass("flexrow flexbetween outline smooth");
    tagBubble.attr("index", tag);
    tagBubble.css("background", "rgba(235,235,228,1)");
    tagBubble.css("margin-right", "0.5em");

    if (game.templates.tags && game.templates.tags[tag]) {
      var tagData = game.templates.tags[tag];
      if (tagData.bCol) {
        tagBubble.css("background", tagData.bCol);
      }
      if (tagData.color) {
        tagBubble.css("color", tagData.color);
      }
      tagBubble.hover(function(){
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
        pop.hover(function(){layout.coverlay($(this))})
      },
      function(){
        layout.coverlay(app.attr("id")+"-hint-dialog");
      });
    }

    var tagName = tag;
    if (scope.filter) {
      tagName = tagName.split("_")[1];
    }

    var remove = genIcon((!scope.viewOnly)?("remove"):(""), tagName).appendTo(tagBubble);
    remove.attr("index", tag);
    remove.addClass("bold spadding fit-x flexmiddle");
    if (!scope.viewOnly) {
      remove.click(function(){
        delete obj.data.tags[$(this).attr("index")];
        if (game.templates.tags && game.templates.tags[$(this).attr("index")]) {
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

  return div;
});
