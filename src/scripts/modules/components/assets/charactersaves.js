// legacy support

sync.render("ui_characterSaves", function(obj, app, scope){
  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var data = obj.data;

  var counterDiv = $("<div>");
  counterDiv.addClass("flexaround");

  var counter = $("<div>").appendTo(counterDiv);
  counter.css("text-align", "center");
  counter.append("<div><b>Combat Maneuvers</b></div>");

  var savingDiv = $("<div>").appendTo(counter);
  savingDiv.addClass("flexrow flexmiddle");

  var content = $("<div>");
  content.addClass("flexcolumn flexmiddle");

  var bonus = genInput({
    parent : content,
    type : "number",
    value : data.counters.cmb,
    placeholder : "Custom",
    index : index,
    disabled : scope.viewOnly,
    raw : true,
    obj : obj,
    cmd : "updateAsset",
    style : {"width": "50px", "font-size" : "0.8em"}
  });

  var total = sync.val(data.counters.cmb);
  if (total >= 0) {
    total = "+" + total;
  }

  var context = {};
  context["b"] = savingObj;
  context["stat"] = index;
  context["statKey"] = statRef;
  context["c"] = obj.data;

  var statUI = ui_modified({
    parent : savingDiv,
    title : data.counters.cmb.name,
    value : data.counters.cmb,
    total : total,
    reveal : true,
    diceable : {
      msg : "@me.name+' Combat "+data.counters.cmb.name+"'",
      ui : "ui_statTest",
      data : "$die=d20;#roll=d20;{roll}+{c:counters:cmb}",
    },
    context : context,
  }, content);
  statUI.css("background-color", "white");

  var content = $("<div>");
  content.addClass("flexcolumn flexmiddle");

  var bonus = genInput({
    parent : content,
    type : "number",
    value : data.counters.cmd,
    placeholder : "Custom",
    index : index,
    disabled : scope.viewOnly,
    raw : true,
    obj : obj,
    cmd : "updateAsset",
    style : {"width": "50px", "font-size" : "0.8em"}
  });

  var total = sync.val(data.counters.cmd);
  if (total >= 0) {
    total = "+" + total;
  }

  var statUI = ui_modified({
    parent : savingDiv,
    title : data.counters.cmd.name,
    value : data.counters.cmd,
    total : total,
    reveal : true,
    diceable : {
      msg : "@me.name+' Combat "+data.counters.cmd.name+"'",
      ui : "ui_statTest",
      data : "$die=d20;#roll=d20;{roll}+{c:counters:cmd}",
    },
    context : context,
  }, content);

  statUI.css("background-color", "white");

  var counter = $("<div>").appendTo(counterDiv);
  counter.css("text-align", "center");
  counter.append("<div><b>" + data.counters.saving.name +"</b></div>");

  var savingDiv = $("<div>").appendTo(counter);
  savingDiv.addClass("flexmiddle flexwrap");

  for (var index in data.counters.saving.current) {
    var statRef = data.stats[index];
    var savingObj = data.counters.saving.current[index];
    if (statRef && savingObj) {
      sync.modifier(savingObj, statRef.name, sync.modified(statRef, 0));

      var content = $("<div>");
      content.addClass("flexcolumn flexmiddle");

      var bonus = genInput({
        parent : content,
        type : "number",
        value : sync.rawVal(savingObj),
        placeholder : "Bonus",
        index : index,
        disabled : scope.viewOnly,
        raw : true,
        style : {"width": "50px", "font-size" : "0.8em"}
      });
      bonus.change(function(){
        sync.rawVal(data.counters.saving.current[$(this).attr("index")], parseInt($(this).val()));
        obj.sync("updateAsset");
      });

      var total = sync.val(savingObj);
      if (total >= 0) {
        total = "+" + total;
      }

      var context = {};
      context["saving"] = savingObj;
      context["stat"] = index;
      context["statKey"] = statRef;
      context["c"] = obj.data;

      var statUI = ui_modified({
        parent : savingDiv,
        title : savingObj.name,
        value : savingObj,
        total : total,
        reveal : true,
        diceable : {
          msg : "@me.name+' Saving Throw("+index+")'",
          ui : "ui_statTest",
          data : "$die=d20;#roll=d20;{roll}+{saving}"
        },
        context : context,
      }, content);
      statUI.css("background-color", "white");
    }
  }
  return counterDiv;
});

sync.render("ui_characterSavesProf", function(obj, app, scope){
  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var data = obj.data;

  var counterDiv = $("<div>");
  counterDiv.addClass("flexaround flexwrap");

  var counter = $("<div>").appendTo(counterDiv);
  counter.css("text-align", "center");
  counter.append("<div><b>" + data.counters.saving.name +"</b></div>");

  var savingDiv = $("<div>").appendTo(counter);
  savingDiv.addClass("flexmiddle flexwrap");

  for (var index in data.counters.saving.current) {
    var statRef = data.stats[index];
    var savingObj = data.counters.saving.current[index];

    if (statRef && savingObj) {
      if ((sync.modified(statRef, 0) || 0)) {
        sync.modifier(savingObj, statRef.name, (sync.modified(statRef, 0) || 0));
      }

      var content = $("<div>");
      content.addClass("flexcolumn flexmiddle");

      var checkWrapper = $("<div>").appendTo(content);
      checkWrapper.css("width", "auto");
      checkWrapper.addClass("flexmiddle");

      var check = genInput({
        parent : checkWrapper,
        type : "checkbox",
        value : sync.rawVal(savingObj),
        index : index,
        disabled : scope.viewOnly
      });
      check.hover(function(){
        var pop = ui_popOut({
          target : $(this),
          align : "top",
          id : "prof-popout",
          hideclose : true,
        }, "<t style='font-size : 0.8em'>Proficient</t>");
        pop.removeClass("boxshadow");
      },
      function(){
        $("#prof-popout").remove();
      });
      if (sync.rawVal(savingObj) > 0) {
        sync.modifier(savingObj, data.counters.proficiency.name, (sync.val(data.counters.proficiency) || 0));
        check.prop("checked", true);
      }
      check.css("margin", "0");
      check.change(function() {
        if ($(this).prop("checked")) {
          sync.rawVal(data.counters.saving.current[$(this).attr("index")], 1);
        }
        else {
          sync.rawVal(data.counters.saving.current[$(this).attr("index")], "");
          sync.removeModifier(data.counters.saving.current[$(this).attr("index")], data.counters.proficiency.name);
        }
        obj.sync("updateAsset");
      });

      var bonus = genInput({
        parent : checkWrapper,
        type : "number",
        value : (sync.modifier(savingObj, "Bonus") || 0),
        placeholder : "Bonus",
        index : index,
        disabled : scope.viewOnly,
        style : {"width": "50px", "font-size" : "0.8em",}
      });
      bonus.change(function(){
        sync.modifier(data.counters.saving.current[$(this).attr("index")], "Bonus", parseInt($(this).val()));
        obj.sync("updateAsset");
      });

      var total = sync.modified(savingObj, 0);
      if (total >= 0) {
        total = "+" + total;
      }

      var context = {};
      context["saving"] = savingObj;
      context["stat"] = index;
      context["statKey"] = statRef;
      context["c"] = obj.data;

      var statUI = ui_modified({
        parent : savingDiv,
        title : statRef.name,
        value : savingObj,
        click : function(ev, ui, options) {
          sync.removeModifier(options.value, ui.attr("index"));
          obj.sync("updateAsset");
        },
        total : total,
        reveal : true,
        diceable : {
          msg : "@me.name+' Saving Throw("+index+")'",
          ui : "ui_statTest",
          data : "$die=d20;#roll=d20;{roll}+M{saving}"
        },
        context : context,
      }, content);
      statUI.css("background-color", "white");
    }
  }
  return counterDiv;
});
