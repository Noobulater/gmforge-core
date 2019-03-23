var _cachegen;

function buildDecisionTree(data) {
  var regex = /\n(\t*)([^=^\?^{^\n]*)(\?[\w'\s^\n]+)*=({[0-9]*[\(\[<])/im;
  // construct the regex that matches the indentation and then do it

  function parseOptions(str) {
    var result = null;

    var params = str.match(regex);
    // first seperate the body from the options
    if (params) { // check for nested choices
      var options = str.substring(params.index, str.length);
      var optionsList = options.split("\n"+params[1]+")}");
      optionsList.splice(optionsList.length-1, 1);

      for (var i in optionsList) {
        var params = optionsList[i].match(regex);
        if (params) {
          // Gather all information about what can be chosen
          var choice = {};
          choice.name = params[2];
          choice.tip = params[3];
          if (!isNaN(params[4].charAt(1))) {
            choice.number = parseInt(params[4].charAt(1));
          }
          if (params[4].charAt(1) == "(" || params[4].charAt(2) == "(") {
            choice.exclusive = true;
          }
          optionsList[i] = optionsList[i].replace(params[0], "");
          result = result || [];

          choice.choices = [];
          var choiceList = optionsList[i].split("\n"+params[1]+"	>}");
          choiceList.splice(choiceList.length-1, 1);
          for (var cIndex in choiceList) {
            choiceList[cIndex] = choiceList[cIndex] + "\n"+params[1]+"	>}";
            choice.choices.push(parseData(choiceList[cIndex]));
          }
          result.push(choice);
        }
      }
    }
    return result;
  }

  function parseData(str, abort) {
    var params = str.match(regex);
    if (params) {
      var result = {};
      result.name = params[2];
      result.tip = params[3];
      result.data = str.substring(0, params.index);
      var contents = str.substring(params.index, str.length);
      var correction = contents.match("\n"+params[1]+"[>\\]\\)]}");
      if (correction) {
        contents = contents.substring(0, correction.index);
        contents = contents.replace(params[0], "");

        var split = contents.match(regex);
        // seperate the options from the data
        if (split) {
          result.data = contents.substring(0, split.index);
          result.choices = parseOptions(contents.substring(split.index, contents.length));
        }
        else {
          result.data = contents;
        }
      }
    }
    return result;
  }

  return parseData(data);
}

sync.render("ui_template", function(obj, app, scope){
  if (!obj || !obj.data) {return $("<div>");}

  if ($("#template-hint").length > 0) {
    layout.coverlay($("#template-hint"));
  }

  scope = scope || {viewOnly: app.attr("viewOnly") == "true", local : app.attr("local") == "true"};
  var data = obj.data;
  var div = $("<div>");
  div.addClass("flex flexcolumn");

  var template = obj.data.template;
  if (!template) {
    if (_cachegen) {
      template = duplicate(_cachegen);
    }
    else {
      _cachegen = buildDecisionTree(obj.data.templateText || "\n No Template={<>}");
      template = duplicate(_cachegen);
    }
  }

  var optionContainer = $("<div>").appendTo(div);

  var title = $("<b>").appendTo(optionContainer);
  title.addClass("flexmiddle");
  title.append(template.name);
  title.css("font-size", "1.5em");

  var optionsDiv = $("<div>").appendTo(optionContainer);
  optionsDiv.addClass("flexaround lrpadding");

  var container = $("<div>").appendTo(optionsDiv);
  container.addClass("flexmiddle");
  container.css("width", "auto");

  var check = genInput({
    parent : container,
    type : "checkbox",
    style : {"margin" : "0", "width" : "12px", "height" : "12px"},
  });
  if (!data.options.free) {
    check.prop("checked", true);
  }
  check.change(function(){
    if ($(this).prop("checked") == true) {
      delete data.options.free;
    }
    else {
      data.options.free = true;
    }
    obj.update();
  });

  var namePlate = $("<b>").appendTo(container);
  namePlate.text("Restrictions");

  var container = $("<div>").appendTo(optionsDiv);
  container.addClass("flexmiddle");
  container.css("width", "auto");

  var check = genInput({
    parent : container,
    type : "checkbox",
    style : {"margin" : "0", "width" : "12px", "height" : "12px"},
  });
  if (data.options.all) {
    check.prop("checked", true);
  }
  check.change(function(){
    if ($(this).prop("checked") == true) {
      data.options.all = true;
    }
    else {
      delete data.options.all;
    }
    obj.update();
  });

  var namePlate = $("<b>").appendTo(container);
  namePlate.text("Show All");

  var random = $("<button>").appendTo(optionsDiv);
  random.addClass("subtitle highlight alttext");
  random.append("Random");
  random.click(function(){
    data.text = [];
    function recurseChoose(choice, state){
      if (choice) {
        if (choice.data) {
          data.text[state] = choice.data;
        }
        if (choice.choices && choice.choices.length) {
          var number = choice.number || 1;
          if (choice.exclusive) {
            for (var i=0; i<number; i++) {
              var index = Math.floor(choice.choices.length * Math.random());
              recurseChoose(choice.choices[index], state + "." + index);
              choice.choices.splice(index, 1);
            }
          }
          else {
            // build viable choices
            var choiceSelection = [];
            for (var i=0;i<choice.choices.length; i++) {
              if (choice.choices[i].data) {
                choiceSelection.push(choiceSelection);
              }
              else {
                recurseChoose(choice.choices[i], state + "." + i);
              }
            }

            for (var i=0; i<number; i++) {
              var index = choiceSelection[Math.floor(choiceSelection.length * Math.random())];
              recurseChoose(choice.choices[index], state + "." + index);
            }
          }
        }
      }
    };
    for (var i in template.choices) {
      recurseChoose(duplicate(template.choices[i]), i);
    }
    obj.update();
  });

  var random = $("<button>").appendTo(optionsDiv);
  random.addClass("subtitle background alttext");
  random.append("Reset");
  random.click(function(){
    data.text = {};
    obj.update();
  });

  var choiceColumnWrap = $("<div>").appendTo(div);
  choiceColumnWrap.addClass("flex");
  choiceColumnWrap.css("overflow", "auto");
  choiceColumnWrap.css("position", "relative");
  choiceColumnWrap.scroll(function() {
    app.attr("_lastScrollTop_opt", $(this).scrollTop());
  });

  var choiceColumn = $("<div>").appendTo(choiceColumnWrap);
  choiceColumn.addClass("fit-x");
  choiceColumn.css("position", "absolute");

  var keys = Object.keys(data.text);
  data.override = JSON.parse(JSON.stringify(game.templates.character || {}));
  for (var key in data.text) {
    maxify(data.text[key], data.override, game.templates);
  }

  function buildUI(choice, state, depth, parent) {
    var body = $("<div>"); // this is where the names go
    body.css("font-size", 22 - depth*2);

    var containerT = $("<div>").appendTo(body);
    containerT.addClass("flexrow fit-x");

    var margin = $("<div>").appendTo(containerT);
    margin.addClass("secondary");
    margin.css("width", 15*depth+"px");

    var nonmargin = $("<div>").appendTo(containerT);
    nonmargin.addClass("flexbetween fit-x");
    nonmargin.addClass("flex", "2");

    var container = $("<div>").appendTo(nonmargin);
    container.addClass("flexmiddle lrpadding");
    container.css("width", "auto");

    var namePlate = $("<b>").appendTo(container);
    namePlate.addClass("spadding subtitle");
    namePlate.text(choice.name);

    if (choice.tip) {
      var icon = genIcon("info-sign").appendTo(namePlate);
      icon.attr("tip", choice.tip);
      icon.css("padding-left", "10px");
      icon.click(function(ev) {
        if ($("#template-hint").length > 0) {
          layout.coverlay($("#template-hint"));
        }
        else {
          var popFrame = ui_popOut({
            target: $(this),
            id: "template-hint",
            hideclose : true,
            align : "top",
            style: {"z-index": 2000}
          }, $("<p style='text-align:center; margin: 0;'>"+$(this).attr("tip")+"</p>"));
        }
        ev.stopPropagation();
        return false;
      });
    }

    if (choice.data && depth != 0) {
      containerT.attr("title", "Right Click for details");
      containerT.contextmenu(function(ev){
        var content = $("<div>");
        content.addClass("flexcolumn subtitle spadding");
        content.css("text-align", "left");
        content.css("padding-top", "1em");
        var reg = /(traits|counters|talents|feats|inventory|gear|equipment|skills|stats|info|spells|spellbook|spellslots|psychic|aptitudes|apts|proficiency|other|description|notes|specials|proficiencies|proficient|tags)\s*[-|:|=|;]\s*/ig
        var cleanup = replaceAll(replaceAll(choice.data.trim(), "\t", ""), "\n", "<br>");
        var arr = cleanup.match(reg);
        for (var i=0; i<arr.length; i++) {
          cleanup = cleanup.replace(arr[i], "<b style='font-size : 1.5em; font-family : bolsterbold'>"+arr[i].substring(0,arr[i].length-2)+"</b>");
        }
        content.append("<p>"+cleanup+"</p>");
        content.css("max-height", "25vh");
        content.css("overflow-y", "auto");

        ui_popOut({
          target : $(this),
          align : "right",
          title : "Choice Bonuses",
          id : "option-preview",
          style : {"width": "400px"}
        }, content);

        ev.stopPropagation();
        return false;
      });
      nonmargin.addClass("outlinebottom");
      namePlate.css("font-weight", "normal");
      container.css("padding-left", "4px");

      nonmargin.addClass("hover2");
      nonmargin.css("cursor", "pointer");

      var check = genInput({
        type : "checkbox",
        state : state,
        data : choice.data,
        style : {"margin" : "0", "width" : "12px", "height" : "12px", "margin-left" : "8px"},
      });
      if (data.text[state]) {
        check.prop("checked", true);
      }
      namePlate.before(check);

      if (parent && !parent.cData.exclusive && parent.cData.number) {
        check.change(function(ev) {
          if ($(this).prop("checked") == true) {
            data.text[$(this).attr("state")] = $(this).attr("data");
          }
          else {
            if (!data.options.free) {
              for (var i in keys) {
                if ($(this).attr("state") == keys[i].substring(0, $(this).attr("state").length) && data.text[keys[i]]) {
                  // delete all dependent states
                  delete data.text[keys[i]];
                }
              }
            }
            delete data.text[$(this).attr("state")];
          }
          if (!data.options.all) {
            obj.update();
          }
        });
        var bonus = (data.text[state] || "").length/choice.data.length;
        for (var i=0; i<(bonus+parent.left)-1; i++) {
          var check = genInput({
            type : "checkbox",
            state : state,
            data : choice.data,
            number : i+2,
            style : {"margin" : "0", "width" : "12px", "height" : "12px"},
          });
          namePlate.before(check);
          if (data.text[state] && data.text[state].length >= choice.data.length*(i+2)) {
            check.prop("checked", true);
          }
          check.change(function(ev) {
            if ($(this).prop("checked") == true) {
              data.text[$(this).attr("state")] = "";
              for (var i=0; i<parseInt($(this).attr("number")); i++) {
                data.text[$(this).attr("state")] = data.text[$(this).attr("state")] + $(this).attr("data");
              }
            }
            else {
              delete data.text[$(this).attr("state")];
            }
            if (!data.options.all) {
              obj.update();
            }
            ev.stopPropagation();
            return false;
          });
        }
      }
      else {
        check.css("pointer-events", "none");
        nonmargin.attr("state", state);
        nonmargin.attr("data", choice.data)
        nonmargin.click(function(ev){
          if (check.prop("checked") == true) {
            check.prop("checked", false);
          }
          else {
            check.prop("checked", true);
          }
          if (check.prop("checked") == true) {
            data.text[$(this).attr("state")] = $(this).attr("data");
          }
          else {
            if (!data.options.free) {
              for (var i in keys) {
                if ($(this).attr("state") == keys[i].substring(0, $(this).attr("state").length) && data.text[keys[i]]) {
                  // delete all dependent states
                  delete data.text[keys[i]];
                }
              }
            }
            delete data.text[$(this).attr("state")];
          }
          if (!data.options.all) {
            obj.update();
          }
          ev.stopPropagation();
          return false;
        });
      }
    }
    else {
      if (depth < 2) {
        nonmargin.addClass("foreground");
        nonmargin.css("text-shadow", "0 0 0.25em black")
        nonmargin.css("color", "white");
      }
      else {
        nonmargin.addClass("inactive outlinebottom subtitle");
      }
      nonmargin.addClass("spadding");
      if (choice.exclusive && choice.number) {
        namePlate.text(namePlate.text() + " ("+choice.number+")")
      }
      if (!choice.exclusive && choice.number) {
        namePlate.text(namePlate.text() + " ["+choice.number+"]")
      }
    }

    if (data.text[state] || (!choice.data || choice.data.trim().length == 0) || data.options.all) {
      for (var index in choice.choices) {
        var nextChoice = choice.choices[index];
        if ((nextChoice.choices || nextChoice.data)) {
          // good spot to check permissions to see if we can even check this one
          // check to see if there are any other choices in this Domain
          /*var tempState = state.split(".");
          tempState.splice(tempState.length-1, 1);
          var parentState = "";
          for (var k in tempState) {
            parentState = parentState + tempState[k] + ".";
          }

          if (choice.exclusive && !util.contains(keys, parentState)) {*/
          var show = true;
          var number = 0; // for determining visibility
          if (!data.options.all && !data.options.free) {
            if (choice.exclusive) {
              for (var i in keys) {
                var pArr = keys[i].split(".");
                var pStr = pArr[0];
                for (var j=1; j<pArr.length-1; j++) {
                  pStr = pStr + "." + pArr[j];
                }
                if (state == pStr && state+"."+index != keys[i]) {
                  if (!choice.number) {
                    show = false;
                    break;
                  }
                  else {
                    number = number + 1;
                  }
                }
              }
              if (choice.number && number >= choice.number) {
                show = false;
              }
            }
            else if (choice.number) {
              for (var i in keys) {
                var pArr = keys[i].split(".");
                var pStr = pArr[0];
                for (var j=1; j<pArr.length-1; j++) {
                  pStr = pStr + "." + pArr[j];
                }
                if (state == pStr && data.text[keys[i]]) {
                  // verify how many times it has been picked
                  var ref = keys[i].split(".");
                  var refChoice = choice.choices[ref[ref.length-1]];
                  number = number + data.text[keys[i]].length/refChoice.data.length;
                }
              }
              if (number >= choice.number && !data.text[state+"."+index]) {
                show = false;
              }
            }
          }
          if (show) {
            buildUI(nextChoice, state+"."+index, depth+1, {cData : choice, left : choice.number-number}).appendTo(body);
          }
        }
      }
    }
    return body;
  }

  /*if (!scope.local) {
    var link = genIcon("unchecked", "Use Content Factory").appendTo(div);
    link.click(function(){
      var entList = sync.render("ui_entList")(obj, app, {
        list : game.locals["storage"].data.s,
        filter : "pk",
        click : function(ev, ui, ent){
          obj.data.template = duplicate(ent.data.template);
          obj.update();
          layout.coverlay("select-factory");
        },
      });

      ui_popOut({
        target : $(this),
        id : "select-factory",
      }, entList);
    });
  }*/
  for (var i in template.choices) {
    var category = template.choices[i]; // each one gets a column
    var choiceList = $("<div>").appendTo(choiceColumn);
    buildUI(category, i, 0).addClass("smooth margin outline").css("margin-bottom", "2em").appendTo(choiceList);
  }

  // preserver scroll
  choiceColumnWrap.attr("_lastScrollTop", app.attr("_lastScrollTop_opt"));

  return div;
});
