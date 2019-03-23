sync.render("ui_rawNotes", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var notes = sync.render("ui_renderPage")(obj, app, {viewOnly : true}).appendTo(div);
  notes.addClass("flex");
  notes.removeClass("lpadding");
  notes.css("position", "relative");

  if (!scope.viewOnly) {
    var edit = genIcon("edit").appendTo(notes);
    edit.addClass("spadding subtitle glow");
    edit.attr("title", "Edit Notes");
    edit.css("position", "absolute");
    edit.css("top", "0");
    edit.css("right", "0");
    edit.click(function(){
      if (!layout.mobile) {
        var content = sync.newApp("ui_editPage");
        content.attr("saveClose", "character-notes-"+app.attr("id"));

        var popout = ui_popOut({
          id : "character-notes-"+app.attr("id"),
          title : sync.rawVal(obj.data.info.name),
          target : app,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : "600px", height : "700px"}
        }, content);
        popout.css("padding", "0px");
        popout.addClass("floating-app");

        obj.addApp(content);
      }
      else {
        var frame = layout.page({title: "", blur : 0.5, width: "90%", id: "edit-char-notes"});
        frame.css("width", "95vw");

        var content = sync.newApp("ui_editPage");
        content.appendTo(frame);
        obj.addApp(content);
      }
    });
  }

  for (var key in scope.style) {
    notes.css(key, scope.style[key]);
  }

  return div;
});

sync.render("ui_rawNotesv2", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var notes = sync.render("ui_renderPage")(obj, app, {viewOnly : true}).appendTo(div);
  notes.addClass("flex");
  notes.removeClass("lpadding");
  notes.css("position", "relative");

  if (!scope.viewOnly) {
    var edit = genIcon("edit").appendTo(notes);
    edit.addClass("spadding subtitle glow");
    edit.attr("title", "Edit Notes");
    edit.css("position", "absolute");
    edit.css("top", "0");
    edit.css("right", "0");
    edit.click(function(){
      if (!layout.mobile) {
        var content = sync.newApp("ui_editPage");
        content.attr("saveClose", "character-notes-"+app.attr("id"));

        div.replaceWith(content);

        sync.updateApp(content, obj);
      }
      else {
        var frame = layout.page({title: "", blur : 0.5, width: "90%", id: "edit-char-notes"});
        frame.css("width", "95vw");

        var content = sync.newApp("ui_editPage");
        content.appendTo(frame);
        obj.addApp(content);
      }
    });
  }

  for (var key in scope.style) {
    notes.css(key, scope.style[key]);
  }

  return div;
});

sync.render("ui_characterNotes", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  if (!scope.noPadding) {
    div.addClass("padding");
  }

  var notes = sync.render("ui_renderPage")(obj, app, {viewOnly : true}).appendTo(div);
  notes.addClass("outline smooth white padding flex");
  notes.css("position", "relative");
  if (scope.noOutline) {
    notes.removeClass("outline");
  }

  if (scope.removePadding) {
    notes.removeClass("padding");
  }

  if (!scope.viewOnly) {
    var edit = genIcon("edit").appendTo(notes);
    edit.addClass("spadding subtitle glow");
    edit.attr("title", "Edit Notes");
    edit.css("position", "absolute");
    edit.css("top", "0");
    edit.css("right", "0");
    edit.click(function(){
      if (!layout.mobile) {
        var content = sync.newApp("ui_editPage");
        content.attr("saveClose", "character-notes-"+app.attr("id"));

        var popout = ui_popOut({
          id : "character-notes-"+app.attr("id"),
          title : sync.rawVal(obj.data.info.name),
          target : app,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : "600px", height : "700px"}
        }, content);
        popout.css("padding", "0px");
        popout.addClass("floating-app");

        obj.addApp(content);
      }
      else {
        var frame = layout.page({title: "", blur : 0.5, width: "90%", id: "edit-char-notes"});
        frame.css("width", "95vw");

        var content = sync.newApp("ui_editPage");
        content.appendTo(frame);
        obj.addApp(content);
      }
    });
  }

  for (var key in scope.style) {
    notes.css(key, scope.style[key]);
  }

  return div;
});
