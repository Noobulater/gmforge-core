sync.render("ui_rights", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var div = $("<div>");
  div.addClass("padding");
  div.css("min-width", "400px");
  if (!(obj || obj.data || obj.data["_s"]) && !scope.security) {
    return div;
  }

  var type = $("<div>").appendTo(div);
  type.addClass("flexrow subtitle");

  var security = scope.security || obj.data["_s"];

  var blanketRights = $("<button>").appendTo(type);
  blanketRights.addClass("background alttext");
  blanketRights.text("Default Rights");
  blanketRights.click(function(){
    buildRights();
    app.attr("last_rights", "default");
  });

  var individualRights = $("<button>").appendTo(type);
  individualRights.addClass("background alttext");
  individualRights.text("Individual Rights");
  individualRights.click(function(){
    buildRights(true);
    app.attr("last_rights", "indv");
  });

  var rightsContent = $("<div>").appendTo(div);
  rightsContent.addClass("flexrow flexaround flexwrap white");
  rightsContent.css("color", "#333");
  rightsContent.css("text-shadow", "none");

  function buildRights(individual){
    rightsContent.empty();
    rightsContent.addClass("flexaround");
    if (individual) {
      rightsContent.removeClass("flexaround flexwrap");
      individualRights.removeClass("background");
      individualRights.addClass("highlight");
      blanketRights.removeClass("highlight");
      blanketRights.addClass("background");

      var playersContent = $("<div>").appendTo(rightsContent);
      playersContent.addClass("flexcolumn fit-x outline smooth");

      var players = game.players.data;
      for (var id in players) {
        if (!game.config.data.players || !game.config.data.players[id]) {
          var row = $("<div>").appendTo(playersContent);
          row.addClass("flexrow outlinebottom");

          var nameWrap = $("<div>").appendTo(row);
          nameWrap.addClass("flexcolumn flexmiddle flex lrpadding lrmargin");

          if (players[id]) {
            nameWrap.append("<b>"+players[id].displayName+"</b>");

            for (var key in game.templates.security.player) {
              if (game.templates.security.player[key] == players[id].rank) {
                nameWrap.append("<text class='subtitle'>"+key+"</text>");
                break;
              }
            }
          }
          else {
            nameWrap.text(id);
          }
          var accessControls = $("<div>").appendTo(row);
          accessControls.addClass("flexrow bold flex");

          var val = "No Access";
          for (var key in game.templates.security.object) {
            if (security[id] == game.templates.security.object[key]) {
              val = key;
            }
          }

          var select = $("<select>").appendTo(accessControls);
          select.addClass("flex");
          select.attr("UserID", id);
          select.css("padding", "4px");
          select.css("border", "none");
          select.css("outline", "none");

          if ((id == getCookie("UserID")) || scope.viewOnly) {
            select.attr("disabled", true);
            select.css("background-color", "rgb(235,235,228)");
          }
          for (var key in game.templates.security.object) {
            var option = $("<option value='"+key+"'>"+key+"</option>").appendTo(select);
          }

          if (security[id]) {
            select.val(val);
          }
          if (!scope.viewOnly) {
            select.change(function(ev) {
              if (scope.change) {
                scope.change(ev, $(this), $(this).attr("UserID"), game.templates.security.object[$(this).val()]);
              }
              else {
                var sendData = {id : obj.id(), security : {}};
                sendData.security[$(this).attr("UserID")] = game.templates.security.object[$(this).val()];
                runCommand("updateRights", sendData);
              }
            });
          }
        }
      }

      players = game.config.data.players;
      for (var id in players) {
        var row = $("<div>").appendTo(playersContent);
        row.addClass("flexrow outlinebottom");

        var nameWrap = $("<div>").appendTo(row);
        nameWrap.addClass("flexcolumn flexmiddle flex");

        if (players[id]) {
          nameWrap.append("<b>"+players[id].displayName+"</b>");

          for (var key in game.templates.security.player) {
            if (game.templates.security.player[key] == players[id].rank) {
              nameWrap.append("<text class='subtitle'>"+key+"</text>");
              break;
            }
          }
        }
        else {
          nameWrap.text(id);
        }
        var accessControls = $("<div>").appendTo(row);
        accessControls.addClass("flexrow bold flex");

        var val = "No Access";
        for (var key in game.templates.security.object) {
          if (security[id] == game.templates.security.object[key]) {
            val = key;
          }
        }

        var select = $("<select>").appendTo(accessControls);
        select.addClass("flex");
        select.attr("UserID", id);
        select.css("padding", "4px");
        select.css("border", "none");
        select.css("outline", "none");

        if ((id == getCookie("UserID")) || scope.viewOnly) {
          select.attr("disabled", true);
          select.css("background-color", "rgb(235,235,228)");
        }
        for (var key in game.templates.security.object) {
          var option = $("<option value='"+key+"'>"+key+"</option>").appendTo(select);
        }

        if (security[id]) {
          select.val(val);
        }
        if (!scope.viewOnly) {
          select.change(function(ev) {
            if (scope.change) {
              scope.change(ev, $(this), $(this).attr("UserID"), game.templates.security.object[$(this).val()]);
            }
            else {
              var sendData = {id : obj.id(), security : {}};
              sendData.security[$(this).attr("UserID")] = game.templates.security.object[$(this).val()];
              runCommand("updateRights", sendData);
            }
          });
        }
      }
    }
    else {
      blanketRights.removeClass("background");
      blanketRights.addClass("highlight");
      individualRights.removeClass("highlight");
      individualRights.addClass("background");

      var gmOnly = $("<button>").appendTo(rightsContent);
      gmOnly.append("GM Only");
      if (scope.viewOnly) {
        gmOnly.attr("disabled", true);
      }
      if (security["default"] == "@:gm()" || security["default"] == "@:gm()") {
        gmOnly.addClass("alttext highlight");
      }
      gmOnly.click(function(){
        macro.hide();
        macro.val("@:gm()");
        macro.change();
      });

      var gmOnly = $("<button>").appendTo(rightsContent);
      gmOnly.append("Players");
      if (scope.viewOnly) {
        gmOnly.attr("disabled", true);
      }
      if (security["default"] == "1") {
        gmOnly.addClass("alttext highlight");
      }
      gmOnly.click(function(){
        macro.hide();
        macro.val("1");
        macro.change();
      });

      var gmOnly = $("<button>").appendTo(rightsContent);
      gmOnly.append("Custom Macro");
      if (scope.viewOnly) {
        gmOnly.attr("disabled", true);
      }
      gmOnly.click(function(){
        macro.toggle();
      });

      var macro = genInput({
        classes : "fit-x subtitle",
        parent : rightsContent,
        value : security.default,
        disabled : scope.viewOnly,
        placeholder : "Default Macro",
      });
      macro.change(function(ev){
        if (scope.change) {
          scope.change(ev, $(this), "default", $(this).val());
        }
        else {
          var sendData = {id : obj.id(), security : {}};
          sendData.security["default"] = $(this).val();
          runCommand("updateRights", sendData);
        }
      });
      macro.hide();

      var gmOnly = genIcon("refresh", "Reset to Default").appendTo(rightsContent);
      gmOnly.addClass("flexmiddle lrmargin bold subtitle");
      gmOnly.click(function(){
        macro.hide();
        macro.val("");
        macro.change();
      });
      if (security["default"] == "" || security["default"] == null) {
        gmOnly.hide();
      }
    }
  }
  buildRights(app.attr("last_rights") == "indv");

  return div;
});
