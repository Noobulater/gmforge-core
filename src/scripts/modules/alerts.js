var _alertCount = 0;
function sendAlert(options) {
  if (getCookie("disableAlerts") == "true") {
    return false;
  }
  if (options instanceof String) {
    options = {text : options};
  }
  _alertCount++;

  if (options.p && !options.p[getCookie("UserID")]) {
    return;
  }

  var alert = $("<div>");
  alert.addClass("ui-popout padding");
  alert.attr("_alertCount", _alertCount);
  alert.css("position", "relative");
  alert.css("padding-left", "1em");
  alert.css("padding-right", "1em");
  alert.css("pointer-events", "auto");
  alert.css("max-width", "90vw");
  if (options.id && $("#"+options.id).length) {
    $("#"+options.id).remove();
  }
  alert.attr("id", options.id);

  var close = genIcon("remove").appendTo(alert);
  close.css("position", "absolute");
  close.css("right", "0");
  close.css("z-index", "100000000");
  close.click(function(){
    layout.coverlay(alert, (options.fadeTime || 500));
  });
  var chatContainer = $("<div>").appendTo(alert);
  chatContainer.addClass("flexrow fit-x outlinebottom");

  if (options.color) {
    alert.css("background-color", options.color);
  }
  else {
    alert.css("background-color", "white");
  }

  var textContainer = $("<div>").appendTo(chatContainer);
  textContainer.addClass("flexbetween");
  textContainer.css("width", "100%");

  if (options.classes) {
    alert.addClass(options.classes);
  }

  var chatDiv = $("<p>").appendTo(textContainer);
  chatDiv.css("margin-bottom", "0");
  var postType = {};

  var chatIcon = $("<span>");
  if (options.href) {
    chatIcon.append("<img style='width : auto; max-width : 6em; height: 2em; border-radius:10%; border: 1px solid black;' src='"+options.href+"'></img>");
  }
  if (options.user && !options.evID) {
    chatIcon.append("<b>"+options.user+"</b>");
    chatDiv.append(chatIcon);
    if (options.text) {
      chatIcon.append("<text style='word-break:break-all;'> : "+options.text+"</text>");
      chatDiv.append(chatIcon);
    }
  }
  else if (options.text) {
    chatIcon.append("<b style='font-size:0.8em' title='"+(options.user || "")+"'>"+options.text+"</b>");
    chatDiv.append(chatIcon);
  }

  if (options.media) {
    chatContainer.addClass("outline");

    var mediaContainer = $("<div>").appendTo(chatContainer);
    mediaContainer.addClass("flexmiddle");

    var mediaLink = $("<a>").appendTo(mediaContainer);
    mediaLink.addClass("flexcolumn flexmiddle");
    mediaLink.attr("href", options.media);
    mediaLink.attr("target", "_");
    mediaLink.text(options.media.substring(0, 50));

    var media = ui_processMedia(options.media);
    media.appendTo(mediaLink);
    media.css("width", "auto");
    media.css("max-width", "100%");
    media.css("height", "100px");
    if (!media.is("img")) {
      media[0].pause();
    }
  }
  if (options.evID) {
    function hasAccess(eventID) {
      var ev = game.events.data[eventID];
      if (ev && hasSecurity(getCookie("UserID"), "Visible", ev.data)){
        return true;
      }
      return false;
    }
    if (hasAccess(options.evID)) {
      var display;
      if (game.templates.display.ui && game.templates.display.ui[options.ui || game.templates.dice.ui]) {
        display = game.templates.display.ui[options.ui || game.templates.dice.ui];
      }
      var diceRes = sync.render("ui_newDiceResults")(game.events.data[options.evID], alert, {display : display});
      diceRes.appendTo(chatContainer);
    }
  }
  function coverAlert(alertPanel, fade, duration, alertCount) {
    setTimeout(function(){
      if (alertPanel.attr("_alertCount") == alertCount) {
        layout.coverlay(alertPanel, fade);
      }
    }, duration);
  }

  if (options.player) {
    if ($("#main-menu").length && $("#main-menu").css("opacity") == 0 && $("#main-menu").attr("docked") && !$("#main-menu").attr("locked")) {
      util.dockReveal($("#main-menu"));
      $("#chat-button").click();
    }
    else {
      $("#chat-button").addClass("highlight");
    }

    return alert;
    alert.css("padding", "0");
    alert.css("background-color", "white");

    chatContainer.empty();
    chatContainer.addClass("padding flexcolumn");
    chatContainer.removeClass("outlinebottom");
    chatContainer.css("max-width", "280px");

    var contentPlate = $("<div>").appendTo(chatContainer);
    contentPlate.addClass("bold flex subtitle");
    contentPlate.text(options.text);
    contentPlate.css("overflow-wrap", "break-word");

    if (options.f) {
      if (options.text && options.text.match("/me") && options.text.match("/me").index == 0) {
        if (options.f == options.user) {
          contentPlate.addClass("flexmiddle");
        }
        contentPlate.css("font-style", "italic");
        contentPlate.text(contentPlate.text().replace("/me", ""));
      }
      else {
        if (options.text && options.text.match("/w") && options.text.match("/w").index == 0) {
          contentPlate.css("background-color", "rgba(66,108,66,0.2)");
          contentPlate.css("font-style", "italic");
          contentPlate.css("font-size", "0.9em");
          contentPlate.text(contentPlate.text().replace("/w", ""));
        }

        if (options.evID) {
          contentPlate.addClass("padding");
          contentPlate.text("");
          function hasAccess(eventID) {
            var ev = game.events.data[eventID];
            if (ev && hasSecurity(getCookie("UserID"), "Visible", ev.data)){
              return true;
            }
            return false;
          }
          if (hasAccess(options.evID)) {
            var display;
            if (game.templates.display.ui && game.templates.display.ui[options.ui || game.templates.dice.ui]) {
              display = game.templates.display.ui[options.ui || game.templates.dice.ui];
            }
            var diceRes = sync.render("ui_newDiceResults")(game.events.data[options.evID], alert, {display : display});
            diceRes.addClass("flex");
            diceRes.appendTo(chatContainer);
          }
        }
        else {
          contentPlate.addClass("lpadding");
        }
        if (options.text && options.text.match("/y") && options.text.match("/y").index == 0) {
          contentPlate.removeClass("lpadding");
          alert.css("background-color", "rgb(255,232,204)");

          contentPlate.css("-webkit-text-stroke-width", "1px");
          contentPlate.css("font-style", "italic");
          contentPlate.css("font-size", "1.4em");
          contentPlate.text(contentPlate.text().replace("/y", ""));
        }
      }
    }
    else if (options.user) {
      if (options.text && options.text.match("/me") && options.text.match("/me").index == 0) {
        contentPlate.css("font-style", "italic");
        contentPlate.text(contentPlate.text().replace("/me", ""));
      }
      else if (options.text && options.text.match("/w") && options.text.match("/w").index == 0) {
        contentPlate.css("background-color", "rgba(66,108,66,0.2)");
        contentPlate.css("font-style", "italic");
        contentPlate.css("font-size", "0.9em");
        contentPlate.text(contentPlate.text().replace("/w", ""));
      }
      else if (options.text && options.text.match("/y") && options.text.match("/y").index == 0) {
        contentPlate.css("-webkit-text-stroke-width", "1px");
        contentPlate.css("font-style", "italic");
        contentPlate.css("font-size", "1.4em");
        alert.css("background-color", "rgb(255,232,204)");

        contentPlate.text(contentPlate.text().replace("/y", ""));
      }

      if (options.evID) {
        function hasAccess(eventID) {
          var ev = game.events.data[eventID];
          if (ev && hasSecurity(getCookie("UserID"), "Visible", ev.data)){
            return true;
          }
          return false;
        }
        if (hasAccess(options.evID)) {
          contentPlate.text(options.text);
          var display;
          if (game.templates.display.ui && game.templates.display.ui[options.ui || game.templates.dice.ui]) {
            display = game.templates.display.ui[options.ui || game.templates.dice.ui];
          }
          var diceRes = sync.render("ui_newDiceResults")(game.events.data[options.evID], alert, {display : display});
          diceRes.addClass("flex");
          diceRes.appendTo(chatContainer);
        }
      }
      else {
        contentPlate.addClass("subtitle");
      }
    }
    else {
      contentPlate.addClass("flexmiddle subtitle lpadding");
      contentPlate.removeClass("bold");

      chatContainer.css("background", options.color);
    }

    if (options.media) {
      var mediaContainer = $("<div>").appendTo(contentPlate);
      mediaContainer.addClass("flexmiddle flex");

      mediaContainer.append("<a class='flex spadding fit-x' target='_blank'>"+options.media+"</a>");

      var mediaLink = $("<a>").appendTo(mediaContainer);
      mediaLink.addClass("flexcolumn flexmiddle");
      mediaLink.attr("href", options.media);
      mediaLink.attr("target", "_");
      mediaLink.attr("title", options.media);
      //mediaLink.text(options.media.substring(0, 50) + "...");
      //mediaLink.css("word-break", "break-all");

      var media = ui_processMedia(options.media);
      media.appendTo(mediaLink);
      media.css("width", "auto");
      media.css("max-width", "100%");
      media.css("height", "100px");
      if (!media.is("img")) {
        media[0].pause();
      }
    }

    if (!layout.mobile) {
      $(".playerPlate").each(function(){
        if ($(this).attr("UserID") == options.player) {
          close.remove();
          alert.addClass("flex flexmiddle");
          alert.css("font-size", "");

          var target = $(this);
          if ($(".player-alert-"+options.player).length) {
            target = $($(".player-alert-"+options.player)[$(".player-alert-"+options.player).length-1]);
          }
          var pop = ui_popOut({
            target : target,
            id : "popout-alert-player-"+options.player+"-"+$(".player-alert-"+options.player).length,
            _alertCount : _alertCount,
            align : "top",
            title : (getPlayerCharacterName(options.player) || getPlayerName(options.player)),
            style : {"min-width" : Math.max($(this).outerWidth(), 150), "max-width" : Math.max($(this).outerWidth(), 300), "box-shadow" : "inset 0 0 1em " + (options.color || "transparent"), "min-height" : Math.max($(this).outerHeight(), 100)}
          }, alert).addClass("player-alert-"+options.player);
          if (options.duration != -1) {
            coverAlert($("#"+pop.attr("id")), options.fadeTime || 500, options.duration || 6000, _alertCount);
          }
        }
      });
    }
    else {
      $("#alertList").empty();
      alert.appendTo($("#alertList"));
      if (options.duration != -1) {
        coverAlert(alert, options.fadeTime || 500, options.duration || 4000, _alertCount);
      }
    }
  }
  else {
    alert.addClass("bounce");
    alert.appendTo($("#alertList"));
    if (options.duration != -1) {
      coverAlert(alert, options.fadeTime || 500, options.duration || 4000, _alertCount);
    }
  }

  return alert;
}

//sendAlert({text : "Test Alert", duration : 3000});
