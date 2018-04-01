function notify(content, noteData){
  noteData = noteData || {};

  var contentWrap = $("<div>");
  contentWrap.addClass("flex flexcolumn");
  contentWrap.css("background-color", "transparent");
  contentWrap.css("position", "relative");
  contentWrap.css("overflow", "auto");

  content.appendTo(contentWrap);
  content.css("position", "absolute");

  var notification = ui_popOut({
    target : $("body"),
    title : noteData.title || "Notification",
    id : noteData.id,
    style : {"width" : "300px", "height" : "200px"}
  }, contentWrap).addClass("alttext foreground").removeClass("ui-popout");
  var max = util.getMaxZ(".ui-popout");
  notification.css("z-index", "100000000000");
  notification.resizable();
  notification.attr("docked", "top");
  util.dockReveal(notification);

  return notification;
}

function loadNotify(){
  //var content = $("<div>").load("/tabs/newlayout.html");

  //notify(content, {title : "New Layout!"});
}
