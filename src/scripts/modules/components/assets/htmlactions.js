sync.render("ui_manageActionsv2", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"}

  var div = $("<div>");
  div.addClass("fit-xy");
  if (obj.data._hud) {
    for (var k in obj.data._hud) {
      var newApp = sync.newApp("ui_editActionv2").appendTo(div);
      newApp.attr("path", app.attr("path"));
      newApp.attr("index", app.attr("index"));
      newApp.attr("char-ref", app.attr("char-ref"));
      newApp.attr("action", k);
      newApp.attr("homebrew", app.attr("homebrew"));
      newApp.css("outline", "none");

      // update it this way so it doesn't rebuild the sheets for each action
      obj._apps.push(newApp.attr("id"));
      sync.updateApp(newApp, obj);
    }
  }
  if (!scope.viewOnly) {
    var actionWrap = $("<div>").appendTo(div);
    actionWrap.addClass("flexmiddle");

    var newAction = genIcon("plus", "New Action").appendTo(actionWrap);
    newAction.addClass("subtitle create");
    newAction.click(function(){
      ui_prompt({
        parent : $(this),
        inputs : {
          "Action Name" : "",
          "Flavor Text" : {placeholder : "Optional"},
          "Equation To Roll" : {placeholder : "Optional"},
        },
        click : function(ev, inputs) {
          var actionName = inputs["Action Name"].val();
          obj.data._hud = obj.data._hud || {};
          obj.data._hud[actionName] = {hot : 1, display : `<button>
  `+actionName+`
    <click>
      <chat roll='`+(inputs["Equation To Roll"].val() || "2d20 + 2")+`' flavor='`+(inputs["Flavor Text"].val() || "dice rolled")+`'/>
    </click>
  </button>`};
          obj.sync("updateAsset");
        }
      });
    });
  }

  return div;
});

sync.render("ui_actionsv2", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"}

  var div = $("<div>");
  div.addClass("flexrow flexwrap");

  var ent = getEnt(obj.data.c);

  if (ent && ent.data) {
    for (var k in ent.data._hud) {
      var newApp = sync.newApp("ui_renderActionv2").appendTo(div);
      newApp.attr("action", k);
      newApp.attr("viewOnly", scope.viewOnly);
      newApp.css("min-width", "100px");
      newApp.css("outline", "none");
      // update it this way so it doesn't rebuild the sheets for each action
      ent._apps.push(newApp.attr("id"));
      sync.updateApp(newApp, ent);
    }

    var lists = game.templates.hudLookups || ["inventory", "spellbook"];
    for (var t in lists) {
      var targetList = sync.traverse(ent.data, lists[t]);
      for (var index in targetList) {
        var itemData = targetList[index];
        for (var k in itemData._hud) {
          var newApp = sync.newApp("ui_renderActionv2").appendTo(div);
          newApp.attr("path", lists[t]);
          newApp.attr("index", index);
          newApp.attr("action", k);
          newApp.attr("viewOnly", scope.viewOnly);
          newApp.css("outline", "none");
          newApp.css("min-width", "100px");
          // update it this way so it doesn't rebuild the sheets for each action
          ent._apps.push(newApp.attr("id"));
          sync.updateApp(newApp, ent);
        }
      }
    }
  }
  return div;
});

sync.render("ui_renderActionv2", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"}

  var context = sync.defaultContext();
  context[obj.data._t] = duplicate(obj.data);

  var actionObj = obj.data._hud || {};
  var processed;

  if (app.attr("path") && app.attr("index")) {
    var lookup = sync.traverse(obj.data, app.attr("path") + "." + app.attr("index"));
    if (lookup && lookup instanceof Object) {
        actionObj = lookup._hud || {};
      context[lookup._t] = duplicate(lookup);

      processed = duplicate(actionObj[app.attr("action")].display);
      processed = processed.replace(new RegExp("%path%", 'g'), "c." + app.attr("path") + "." + app.attr("index"));
      processed = processed.replace(new RegExp("%index%", 'g'), app.attr("index"));
    }
  }
  else {
    processed = duplicate(actionObj[app.attr("action")].display);
  }
  if (actionObj[app.attr("action")] && (actionObj[app.attr("action")].hot == null || sync.eval(actionObj[app.attr("action")].hot, context))) {
    app.show();
    return sync.render("ui_processUI")(obj, app, {display : processed, context : context, viewOnly : scope.viewOnly});
  }
  app.hide();
  return $("<div>");
});

sync.render("ui_editActionv2", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"}

  var action = app.attr("action");

  var actionData = obj.data._hud[action] || {};

  var div = $("<div>");
  var ent;

  if (actionData) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexrow fit-x flexmiddle subtitle background alttext lrpadding");
    optionsBar.append(action);

    var context = sync.defaultContext();
    context[obj.data._t] = duplicate(obj.data);

    var processed = duplicate(actionData.display);

    if (app.attr("char-ref")) {
      ent = getEnt(app.attr("char-ref"));
      if (ent && ent.data) {
        context[ent.data._t] = duplicate(ent.data);

        processed = processed.replace(new RegExp("%path%", 'g'), ent.data._t + "." + app.attr("path") + "." + app.attr("index"));
        processed = processed.replace(new RegExp("%index%", 'g'), app.attr("index"));
      }
    }
    var wrap = $("<div>").appendTo(div);
    wrap.addClass("padding flexmiddle");
    wrap.css("background", "rgba(0,0,0,0.4)");

    if (ent) {
      sync.render("ui_processUI")(ent, app, {display : processed, context : context, viewOnly : scope.viewOnly}).appendTo(wrap);
    }
    else {
      sync.render("ui_processUI")(obj, app, {display : processed, context : context, viewOnly : scope.viewOnly}).appendTo(wrap);
    }

    optionsBar.append("<div class='flex'></div>");

    var hotBarMenu = $("<div>").appendTo(optionsBar);
    hotBarMenu.addClass("flexrow alttext outline smooth spadding flex2");
    hotBarMenu.text("When...");
    if (sync.eval(actionData.hot, context)) {
      hotBarMenu.addClass("highlight");
    }
    else {
      hotBarMenu.addClass("background");
    }
    var hotBar = genInput({
      parent : hotBarMenu,
      classes : "middle lrmargin subtitle flex",
      value : actionData.hot,
      disabled : scope.viewOnly,
      style : {"color" : "#333"}
    });
    hotBar.change(function(){
      obj.data._hud = obj.data._hud || {};
      obj.data._hud[action] = obj.data._hud[action] || {hot : 1, display : ""};
      obj.data._hud[action].hot = $(this).val();
      obj.sync("updateAsset");
    });

    hotBarMenu.append("= 1");
    if (obj.data._hud) {
      var restore = genIcon("trash").appendTo(optionsBar);
      restore.addClass("destroy lrmargin");
      restore.attr("title", "Delete Action");
      restore.click(function(){
        delete obj.data._hud[action];
        obj.sync("updateAsset");
      });
    }

    var textarea = genInput({
      classes : "flex subtitle",
      parent : wrap,
      type : "textarea",
      value : actionData.display,
      disabled : scope.viewOnly,
      style : {"min-height" : "150px", "min-width" : "50%"}
    });
    textarea.change(function(){
      obj.data._hud = obj.data._hud || {};
      obj.data._hud[action] = obj.data._hud[action] || {hot : 1, display : ""};
      obj.data._hud[action].display = $(this).val();
      obj.sync("updateAsset");
    });
  }

  return div;
});
