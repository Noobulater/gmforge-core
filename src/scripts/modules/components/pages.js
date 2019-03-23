sync.render("ui_editPage", function(obj, app, scope){
  if (!obj) {
    var retDiv = $("<div>");

    var butt = $("<button>Click to Refresh</button>");
    butt.click(function(){
      retDiv.empty();
      retDiv.append(sync.render("ui_editPage")(obj, app, scope));
    });
    butt.appendTo(retDiv);

    sync.render("ui_entList")(obj, app, {
      filter : "p",
      click : function(ev, ui, ent) {
        ent.addApp(app);
      }
    }).appendTo(retDiv);

    return retDiv;
  }
  var data = obj.data;
  var info = data.info;

  if (info.img.modifiers && data._t != "c") {
    sync.modifier(obj.data.info.notes, "style", duplicate(info.img.modifiers));
    delete obj.data.info.img.modifiers;
  }

  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), autoSave : app.attr("autoSave") == "true", entry : app.attr("entry") == "true", hideOptions : app.attr("hideOptions") == "true"};

  if (game.locals[app.attr("id")+"-edit-page"] != null) {
    data = game.locals[app.attr("id")+"-edit-page"].data;
    info = game.locals[app.attr("id")+"-edit-page"].data.info;
  }
  else {
    game.locals[app.attr("id")+"-edit-page"] = game.locals[app.attr("id")+"-edit-page"] || sync.obj();
    game.locals[app.attr("id")+"-edit-page"].data = duplicate(obj.data);
  }

  var div = $("<div>");
  div.addClass("flexcolumn fit-y");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("background alttext flexrow flexbetween");
  if (scope.noOptions) {
    optionsBar.hide();
  }

  if (obj.data._t != "c") {
    var namePlate = $("<div>").appendTo(optionsBar);
    namePlate.addClass("flexrow flexmiddle");

    var config = $("<div>").appendTo(namePlate);
    config.addClass("flexcolumn flexmiddle lrmargin");

    var security = genIcon("lock").appendTo(config);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });

    var del = genIcon("refresh").appendTo(config);
    del.addClass("destroy bold");
    del.attr("title", "Clear Notes");
    del.click(function(){
      ui_prompt({
        target : $(this),
        confirm : "Confirm Delete",
        click : function() {
          sync.rawVal(obj.data.info.notes, "");
          obj.sync("updateAsset");
        }
      });
    });

    var imgWrap = $("<div>").appendTo(namePlate);
    imgWrap.addClass("flex flexcolumn lrmargin");
    imgWrap.css("width", "35px");
    imgWrap.css("height", "35px");

    var img = sync.render("ui_image")(obj, app, {lookup : "info.img", viewOnly : scope.viewOnly}).appendTo(imgWrap);
    img.addClass("white smooth outline");

    var nameWrap = $("<div>").appendTo(namePlate);
    nameWrap.addClass("flexrow lrmargin");

    var title = genInput({
      parent : nameWrap,
      classes : "line",
      title : "Change this page's name",
      value : sync.rawVal(obj.data.info.name),
    });
    title.attr("title", "Change this page's Name");
    title.change(function(){
      sync.rawVal(obj.data.info.name, $(this).val());
      obj.sync("updateAsset");
    });

    if (obj.data._t == "p") {
      var select = $("<select>").appendTo(nameWrap);
      select.addClass("subtitle lrmargin");
      select.css("width", "100px");
      select.css("color", "#333");
      select.css("text-shadow", "none");

      for (var key in util.resourceTypes) {
        select.append("<option>"+key+"</option>");
      }
      select.children().each(function(){
        if ($(this).text() == sync.rawVal(obj.data.info.mode)) {
          $(this).attr("selected", "selected");
        }
      });
      select.change(function(){
        if (!obj.data.info.mode) {
          obj.data.info.mode = sync.newValue("Mode");
        }
        sync.rawVal(obj.data.info.mode, $(this).val());
        obj.sync("updateAsset");
      });

      var live = genIcon("eye-open", "View").appendTo(nameWrap);
      live.addClass("lrmargin subtitle flexmiddle");
      live.attr("title", "Creates a popup previewing your changes");
      live.css("text-align", "left");
      live.click(function(){
        var content = sync.newApp("ui_renderPage");
        content.attr("viewOnly", "true");
        content.attr("preview", "true");
        game.locals[app.attr("id")+"-edit-page"].addApp(content);

        var pop = ui_popOut({
          target : app,
          id : "live-preview-"+app.attr("id"),
          align : "right",
          title : "Live Preview",
          style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
        }, content);
        pop.resizable();
      });

      /*
      var recover = genIcon("refresh", "Recover").appendTo(recoverWrap);
      recover.attr("title", "Check the caches for a backup");
      recover.click(function(){
        var list = $("<div>");
        list.addClass("flexcolumn");

        for (var key in game.locals) {
          if (key.match("-edit-page") && game.locals[key]) {
            var optionWrap = $("<div>").appendTo(list);
            optionWrap.addClass("spadding outline smooth hover2 bold flexmiddle");
            optionWrap.append(sync.rawVal(game.locals[key].data.info.name));
            optionWrap.attr("key", key);
            optionWrap.click(function(){
              var key = $(this).attr("key");
              var content = $("<div>");
              content.addClass("flexcolumn flex");

              var render = sync.newApp("ui_renderPage").appendTo(content);
              render.attr("viewOnly", true);
              game.locals[key].addApp(render);

              var confirm = $("<button>").appendTo(content);
              confirm.addClass("highlight alttext spadding");
              confirm.append("Restore to this version");
              confirm.click(function(){
                var old = duplicate(obj.data.info);
                obj.data.info = duplicate(game.locals[key].data.info);
                game.locals[key].data.info = old;
                obj.update();
                layout.coverlay(key+"-recover");
              });

              var pop = ui_popOut({
                target : app,
                id : key+"-recover",
                align : "right",
                style : {"width" : assetTypes["p"].width, "height" : assetTypes["p"].height}
              }, content);
              pop.resizable();
            });
          }
        }

        var pop = ui_popOut({
          target : app,
          id : app.attr("id")+"-recover",
        }, list);
        pop.resizable();
      });
      */
    }
  }

  var content = $("<div>").appendTo(div);
  content.addClass("flexcolumn flex");
  if (sync.rawVal(obj.data.info.mode) == "HTML") {
    var editorContent = $("<textarea>").appendTo(content);
    editorContent.addClass("flex subtitle");
    editorContent.attr("id", "adventure-editor-"+app.attr("id"));
    editorContent.val(sync.rawVal(info.notes));

    var examples = $("<div>").appendTo(content);
    examples.addClass("flexaround subtitle");

    var spaceWars = $("<a>").appendTo(examples);
    spaceWars.text("Checkout or example : Space Wars Intro!");
    spaceWars.click(function(){
      editorContent.val(spacewars);
      editorContent.change();
    });
    var saveWrap = $("<div>").appendTo(optionsBar);
    saveWrap.addClass("flexcolumn flexmiddle lrmargin");

    if (obj.data._t == "p") {
      var save = genIcon("book", "Finalize").appendTo(saveWrap);
      save.attr("title", "Finalize Page");
      save.click(function(){
        app.attr("from", "ui_editPage");
        app.attr("ui-name", "ui_renderPage");
        sync.rawVal(obj.data.info.notes, editorContent.val());
        obj.sync("updateAsset");
        game.locals[app.attr("id")+"-edit-page"] = null;
      });
    }

    var save = genIcon("floppy-disk", "Save ");
    save.appendTo(saveWrap);
    save.attr("title", "Save Changes");
    save.click(function(){
      if (app.attr("targetApp")) {
        $("#"+app.attr("targetApp")).removeAttr("viewingNotes");
      }

      save.text("Save");
      sync.rawVal(obj.data.info.notes, editorContent.val());
      obj.sync("updateAsset");
      game.locals[app.attr("id")+"-edit-page"] = null;
      if (app.attr("saveClose")) {
        layout.coverlay(app.attr("saveClose"));
      }
    });

    editorContent.keyup(function(){
      sync.rawVal(game.locals[app.attr("id")+"-edit-page"].data.info.notes, $(this).val());
      game.locals[app.attr("id")+"-edit-page"].update();

      if (scope.autoSave) {
        sync.rawVal(obj.data.info.notes, $(this).val());
      }
      else {
        save.get(0).innerHTML = save.get(0).innerHTML.replace("Save ", "Save*");
      }
    });
  }
  else if (util.resourceTypes[sync.rawVal(obj.data.info.mode)] && util.resourceTypes[sync.rawVal(obj.data.info.mode)].edit) {
    util.resourceTypes[sync.rawVal(obj.data.info.mode)].edit(obj, app, scope, content)
  }
  else {
    var saveWrap = $("<div>").appendTo(optionsBar);
    saveWrap.addClass("flexcolumn flexmiddle lrmargin");

    if (obj.data._t == "p") {
      var save = genIcon("book", "Finalize").appendTo(saveWrap);
      save.attr("title", "Finalize Page");
      save.click(function(){
        app.attr("from", "ui_editPage");
        app.attr("ui-name", "ui_renderPage");
        sync.rawVal(obj.data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
        obj.sync("updateAsset");
        game.locals[app.attr("id")+"-edit-page"] = null;
      });
    }

    var editorWrap = $("<div>").appendTo(content);
    editorWrap.addClass("");

    var editorContent = $("<textarea>").appendTo(editorWrap);
    editorContent.attr("id", "adventure-editor-"+app.attr("id"));
    editorContent.attr("maxlength", "10000");
    editorContent.attr("placeholder", "");
    editorContent.val(unpurge(sync.rawVal(info.notes)));
    editorContent.css("opacity", "0");
    setTimeout(function(){
      editorContent.css("opacity", "");
      tinymce.execCommand('mceRemoveEditor', true, "adventure-editor-"+app.attr("id"));
      var entNames = [];
      for (var i in game.entities.data) {
        var ent = game.entities.data[i];
        if (hasSecurity(getCookie("UserID"), "Visible", ent.data) && ent.data.info && sync.rawVal(ent.data.info.name) && sync.rawVal(ent.data.info.name).length > 3) {
          entNames.push({name : sync.rawVal(ent.data.info.name), id : ent.id()});
        }
      }
      tinymce.init({
        toolbar_items_size : 'small',
        selector : "#adventure-editor-"+app.attr("id"),
        menubar : false,
        themes : "custom",
        skin : "light",
        plugins : [
          'advlist autolink textcolor lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen hr spellchecker',
          'insertdatetime media contextmenu paste code mention visualblocks placeholder'
        ],
        content_style: ".mce-content-body {font-size:12px;}",
        browser_spellcheck : true,
        mentions : {
          delimiter : "@",
          delay : "100",
          source: entNames,
          insert: function(item) {
            return "<a href='|asset|="+item.id+"'>"+item.name+"</a>";
          }
        },
        extended_valid_elements : "div[data]",
        //toolbar : 'undo redo | insert | styleselect visualblocks | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media ',
        toolbar : "title subtitle bold italic line | alignleft aligncenter alignright | outdent indent | forecolor backcolor | bullist numlist",
        contextmenu : "underline strikethrough | link image inserttable fileLink audioLink | assetLink settingLink effectLink combatLink rollTable macroLink | visualblocks",
        resize : false,
        height : 50,
        pagebreak_split_block: true,
        setup : function(editor) {
          editor.addButton('title', {
            text: "H1",
            tooltip : "Header",
            onclick: function () {
              var selection = tinyMCE.get("adventure-editor-"+app.attr("id")).selection.getContent({'format': 'text'});
              if (selection) {
                selection = selection.trim();
              }
              tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<h1 style='margin:0; font-size:3.0em; font-weight:bolder;'>"+selection+"</h1><hr class='h1' style='display : block; outline : none; border : none; width : 100%; height : 4px; background : grey; margin-top:0px; margin-bottom:0.5em;'></hr><p></p>");
            },
            onpostrender : function() {
              var btn = $(this.$el[0]).find(".mce-txt");
              btn.css("font-weight", "bold");
              btn.css("font-size", "1.2em");
            }
          });
          editor.addButton('subtitle', {
            text: "H2",
            tooltip : "Sub Header",
            onclick: function () {
              var selection = tinyMCE.get("adventure-editor-"+app.attr("id")).selection.getContent({'format': 'text'});
              if (selection) {
                selection = selection.trim();
              }
              tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<h2 style='margin:0; font-size:1.4em; font-weight:bold;'>"+selection+"</h2><hr class='h2' style='display : block; outline : none; border : none; width : 100%; height : 1px; background : grey; margin-top:0px; margin-bottom:0.5em;'></hr><p></p>");
            },
            onpostrender : function() {
              var btn = $(this.$el[0]).find(".mce-txt");
              btn.css("font-weight", "bold");
            }
          });

          editor.addButton('line', {
            icon : "hr",
            tooltip : "Horizontal Break",
            onclick: function () {
              tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<hr style='display : block; width : 100%; height : 2px; background-color : grey; margin-top:0px; margin-bottom:1em;'></hr>");
            },
            onpostrender : function() {
              var btn = $(this.$el[0]).find(".mce-txt");
              btn.css("font-weight", "bold");
            }
          });
          editor.addMenuItem('fileLink', {
            text: "File",
            onclick: function() {
              var content = sync.render("ui_filePicker")(obj, app, {allowExternal : true, change : function(ev, ui, val){
                tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<img src='"+val+"' width='"+(editorWrap.width()-30)+"'></img>");
                layout.coverlay("image-selection");
              }});

              var pop = ui_popOut({
                target : editorWrap,
                prompt : true,
                id : "image-selection",
                style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('audioLink', {
            text: "Sound",
            onclick: function() {
              var content = sync.render("ui_filePicker")(obj, app, {allowExternal : true, filter : "audio", change : function(ev, ui, val, name){
                tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='sound"+val+"'>"+name+"</a>");
                layout.coverlay("image-selection");
              }});

              var pop = ui_popOut({
                target : editorWrap,
                prompt : true,
                id : "image-selection",
                style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('assetLink', {
            text: "Asset",
            onclick: function () {
              var ignore = {};
              ignore[obj.id()] = true;
              var content = sync.render("ui_assetPicker")(obj, app, {
                rights : "Visible",
                ignore : ignore,
                select : function(ev, ui, ent, options, entities){
                  var name = sync.rawVal(ent.data.info.name);
                  var img = (sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
                  var id = ent.id();
                  if (ent.data._t == "p" && sync.rawVal(ent.data.info.mode) == "Roll Table") {
                    var tableStr = "<table style='width : 100%;'>";

                    var tableData;

                    if (sync.rawVal(ent.data.info.notes) && sync.rawVal(ent.data.info.notes)[0] == "{") {
                      try {
                        tableData = JSON.parse(sync.rawVal(ent.data.info.notes));
                      }
                      catch (e) {
                        tableData = {headers : [], contents : []};
                      }
                    }
                    else {
                      tableData = {headers : [], contents : []};
                    }

                    tableStr += "<tr>";
                    for (var i=0; i<tableData.headers.length; i++) {
                      var contentData = tableData.headers[i];

                      tableStr += "<td>"+(contentData.name || "")+"</td>";
                    }
                    tableStr += "</tr>";
                    for (var i=0; i<tableData.contents.length; i++) {
                      var contentData = tableData.contents[i];

                      tableStr += "<tr><td>"+(contentData.name || "")+"</td><td>"+(contentData.value || "")+"</td></tr>";
                    }
                    tableStr += "</table>";

                    var str = "";
                    if (sync.rawVal(ent.data.info.name) && sync.rawVal(ent.data.info.name).trim()) {
                      str += "<h2 style='margin:0; font-size:1.4em; font-weight:bold;'>"+sync.rawVal(ent.data.info.name)+"</h2><hr class='h2' style='display : block; outline : none; border : none; width : 100%; height : 1px; background : grey; margin-top:0px;'></hr>";
                    }
                    str += tableStr;

                    tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, str);
                  }
                  else {
                    tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='|asset|="+id+"'>"+(name || id)+"</a>");
                  }

                  layout.coverlay("add-asset");
                }
              });
              var pop = ui_popOut({
                target : $("body"),
                prompt : true,
                id : "add-asset",
                title : "Add Asset Link...",
                style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('effectLink', {
            text: "Special Effects",
            onclick: function () {
              var settingObj = sync.obj();
              settingObj.data = {setting : {}};

              var content = $("<div>");
              content.addClass("flexcolumn flex flexmiddle foreground");

              for (var key in util.effects) {
                var effectButton = $("<button>").appendTo(content);
                effectButton.addClass("background alttext");
                effectButton.text(key);
                effectButton.css("min-width", "200px");
                effectButton.click(function(){
                  tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='effect_"+$(this).text()+"'>"+$(this).text()+"</a>");
                  layout.coverlay("effect-selection");
                });
              }

              var pop = ui_popOut({
                target : editorWrap,
                title : "Special Effects",
                id : "effect-selection",
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('settingLink', {
            text: "Time / Weather / Temp",
            onclick: function () {
              var settingObj = sync.obj();
              settingObj.data = {setting : {}};

              var content = $("<div>");
              content.addClass("background flexcolumn flex flexmiddle spadding");

              var newApp = sync.newApp("ui_setting").appendTo(content);
              settingObj.addApp(newApp);

              var button = $("<button>").appendTo(content);
              button.addClass("fit-x flexmiddle");
              button.append("Confirm");
              button.click(function(){
                tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='setting"+JSON.stringify(settingObj.data)+"'>"+"Setting"+"</a>");
                layout.coverlay("setting-selection");
              });

              var pop = ui_popOut({
                target : editorWrap,
                title : "Time / Weather / Temp",
                id : "setting-selection",
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('combatLink', {
            text: "Combat",
            onclick: function () {
              var combatObj = sync.obj();
              combatObj.data = {combat : {engaged : {}, current : {}}};

              var content = $("<div>");
              content.addClass("flexcolumn flex");

              var newApp = sync.newApp("ui_turnOrder").appendTo(content);
              combatObj.addApp(newApp);

              var button = $("<button>").appendTo(content);
              button.addClass("fit-x flexmiddle");
              button.append("Confirm");
              button.click(function(){
                tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='combat"+JSON.stringify(combatObj.data)+"'>"+"Combat"+"</a>");
                layout.coverlay("combat-selection");
              });

              var pop = ui_popOut({
                target : $("body"),
                id : "combat-selection",
                style : {"width" : "400px", "height" : "400px"}
              }, content);
              pop.resizable();
            }
          });

          editor.addMenuItem('rollTable', {
            text: "Roll Table",
            onclick: function () {
              var ent = sync.obj();
              ent.data = duplicate(game.templates.page);
              sync.rawVal(ent.data.info.name, " ");
              sync.rawVal(ent.data.info.mode, "Roll Table");

              var content = $("<div>");
              content.addClass("flexcolumn flex");

              var newApp = sync.newApp("ui_editPage").appendTo(content);
              newApp.attr("entry", "true");
              newApp.attr("hideOptions", "true");
              ent.addApp(newApp);

              var button = $("<button>").appendTo(content);
              button.addClass("fit-x flexmiddle");
              button.append("Confirm");
              button.click(function(){
                var tableStr = "<table style='width : 100%;'>";

                var tableData;

                if (sync.rawVal(ent.data.info.notes) && sync.rawVal(ent.data.info.notes)[0] == "{") {
                  try {
                    tableData = JSON.parse(sync.rawVal(ent.data.info.notes));
                  }
                  catch (e) {
                    tableData = {headers : [], contents : []};
                  }
                }
                else {
                  tableData = {headers : [], contents : []};
                }

                tableStr += "<tr>";
                for (var i=0; i<tableData.headers.length; i++) {
                  var contentData = tableData.headers[i];

                  tableStr += "<td>"+(contentData.name || "")+"</td>";
                }
                tableStr += "</tr>";
                for (var i=0; i<tableData.contents.length; i++) {
                  var contentData = tableData.contents[i];

                  tableStr += "<tr><td>"+(contentData.name || "")+"</td><td>"+(contentData.value || "")+"</td></tr>";
                }
                tableStr += "</table>";
                var str = "";
                if (sync.rawVal(ent.data.info.name) && sync.rawVal(ent.data.info.name).trim()) {
                  str += "<h2 style='margin:0; font-size:1.4em; font-weight:bold;'>"+sync.rawVal(ent.data.info.name)+"</h2><hr class='h2' style='display : block; outline : none; border : none; width : 100%; height : 1px; background : grey; margin-top:0px;'></hr>";
                }
                str += tableStr;

                tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, str);
                layout.coverlay("combat-selection");
              });

              var pop = ui_popOut({
                target : editorWrap,
                id : "combat-selection",
                style : {"width" : "50vw", "height" : "40vh"}
              }, content);
              pop.resizable();
            }
          });

          /*editor.addMenuItem('condLink', {
            text: "Conditional Section",
            onclick: function () {
              var content = $("<div>");
              content.addClass("flexcolumn");
              content.append("<i class='subtitle fit-x flexmiddle'>Selection will be affected</i>");

              var button = $("<button>").appendTo(content);
              button.addClass("subtitle");
              button.append("GM Only");

              var input = $("<textarea>").appendTo(content);
              input.addClass("subtitle");

              button.click(function(){
                input.val("@:gm()");
              });

              var button = $("<button>").appendTo(content);
              button.append("Confirm");
              button.click(function(){
                var text = tinyMCE.get("adventure-editor-"+app.attr("id")).selection.getContent({'format': 'html'});
                if (text && text.length > 0) {
                  tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, '<div data="'+input.val()+'">'+text+'</div>');
                }
                layout.coverlay("cond-selection");
              });

              var pop = ui_popOut({
                target : editorWrap,
                id : "cond-selection",
              }, content);
            }
          });*/

          editor.addMenuItem('macroLink', {
            text: "Roll Equation",
            onclick: function () {
              var pop = ui_prompt({
                target : editorWrap,
                id : "macro-selection",
                inputs : {
                  "Equation" : ""
                },
                click : function(ev, inputs) {
                  if (inputs["Equation"].val()) {
                    tinyMCE.get("adventure-editor-"+app.attr("id")).execCommand('mceInsertContent', false, "<a href='macro'>"+inputs["Equation"].val()+"</a>");
                  }
                  layout.coverlay("macro-selection");
                }
              });
            }
          });
        },
        init_instance_callback : function(editor) {
          var delay = 1;
          if (isChrome()) {
            delay = 0;
          }
          setTimeout(function(){
            var part = $(editor.editorContainer);
            var height = $("#"+editor.editorContainer.id).height() - $(editor.contentAreaContainer).height();
            editor.theme.resizeTo("100%", content.height()-height-4);
          }, delay);

          var save = genIcon("floppy-disk", "Save ");
          save.appendTo(saveWrap);
          save.attr("title", "Save Changes");
          save.click(function(){
            if (app.attr("targetApp")) {
              $("#"+app.attr("targetApp")).removeAttr("viewingNotes");
            }
            save.text("Save");
            sync.rawVal(obj.data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
            obj.sync("updateAsset");
            game.locals[app.attr("id")+"-edit-page"] = game.locals[app.attr("id")+"-edit-page"] || sync.obj();
            game.locals[app.attr("id")+"-edit-page"].data = duplicate(obj.data);
            if (app.attr("saveClose")) {
              layout.coverlay(app.attr("saveClose"));
            }
          });
          editor.on('Change', function(ev) {
            sync.rawVal(game.locals[app.attr("id")+"-edit-page"].data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
            game.locals[app.attr("id")+"-edit-page"].update();

            if (scope.autoSave) {
              sync.rawVal(obj.data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
            }
            else {
              save.get(0).innerHTML = save.get(0).innerHTML.replace("Save ", "Save*");
            }
          });
          editor.on("keyup", function(){
            sync.rawVal(game.locals[app.attr("id")+"-edit-page"].data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
            game.locals[app.attr("id")+"-edit-page"].update();

            if (scope.autoSave) {
              sync.rawVal(obj.data.info.notes, tinyMCE.get("adventure-editor-"+app.attr("id")).getContent({format : 'raw'}));
            }
            else {
              save.get(0).innerHTML = save.get(0).innerHTML.replace("Save ", "Save*");
            }
          });
        }
      });
    }, 0);
  }
  if (scope.hideOptions) {
    optionsBar.hide();
  }
  if (scope.entry) {
    optionsBar.empty();

    var title = genInput({
      parent : optionsBar,
      classes : "line smargin",
      title : "Change this page's name",
      value : sync.rawVal(obj.data.info.name),
    });
    title.attr("title", "Change this page's Name");
    title.change(function(){
      sync.rawVal(obj.data.info.name, $(this).val());
      obj.sync("updateAsset");
    });
  }

  return div;
});

sync.render("ui_stylePage", function(obj, app, scope){
  if (!obj) {
    return $("<div>");
  }
  var data = obj.data;
  var info = data.info;

  if (info.img.modifiers && data._t != "c") {
    sync.modifier(obj.data.info.notes, "style", duplicate(info.img.modifiers));
    delete obj.data.info.img.modifiers;
  }

  if (!sync.modifier(obj.data.info.notes, "style")) {
    sync.modifier(obj.data.info.notes, "style", {});
  }

  var content = $("<div>");
  content.addClass("flexcolumn flex");
  content.css("position", "relative");

  var beta = $("<b>").appendTo(content);
  beta.addClass("lrpadding outline smooth highlight");
  beta.css("color", "white");
  beta.css("font-size", "0.8em");
  beta.css("position", "absolute");
  beta.css("right", "0");
  beta.append("Beta");

  var styleOptions = $("<div>").appendTo(content);
  styleOptions.addClass("flexrow foreground");

  var basic = $("<button>").appendTo(styleOptions);
  basic.addClass("background alttext");
  basic.text("Basic Settings");
  basic.click(function(){
    styleOptions.children().removeClass("highlight").addClass("background");
    $(this).removeClass("background");
    $(this).addClass("highlight");
    rebuildOptions("basic");
  });

  var h1 = $("<button>").appendTo(styleOptions);
  h1.addClass("background alttext");
  h1.text("Header 1");
  h1.click(function(){
    styleOptions.children().removeClass("highlight").addClass("background");
    $(this).removeClass("background");
    $(this).addClass("highlight");
    rebuildOptions("header1");
  });

  var h2 = $("<button>").appendTo(styleOptions);
  h2.addClass("background alttext");
  h2.text("Header 2");
  h2.click(function(){
    styleOptions.children().removeClass("highlight").addClass("background");
    $(this).removeClass("background");
    $(this).addClass("highlight");
    rebuildOptions("header2");
  });

  var styleEntry = $("<div>").appendTo(content);
  styleEntry.addClass("flexcolumn flex subtitle");

  var colChoices = [
    "rgb(180, 0, 0)",
    "rgb(180, 7, 0)",
    "rgb(180, 65, 0)",
    "rgb(180, 88, 0)",
    "rgb(180, 122, 0)",
    "rgb(180, 130, 0)",
    "rgb(172, 130, 0)",
    "rgb(115, 130, 0)",
    "rgb(57, 130, 0)",
    "rgb(0, 130, 0)",
    "rgb(0, 13, 7)",
    "rgb(0, 13, 65)",
    "rgb(0, 13, 122)",
    "rgb(0, 13, 130)",
    "rgb(0, 172, 130)",
    "rgb(0, 115, 130)",
    "rgb(0, 57, 130)",
    "rgb(0, 0, 130)",
    "rgb(7, 0, 130)",
    "rgb(65, 0, 130)",
    "rgb(122, 0, 130)",
    "rgb(180, 0, 130)",
    "rgb(180, 0, 122)",
    "rgb(180, 0, 65)",
    "rgb(180, 0, 7)",
    "rgb(230, 0, 0)",
    "rgb(230, 57, 0)",
    "rgb(230, 115, 0)",
    "rgb(230, 138, 0)",
    "rgb(230, 172, 0)",
    "rgb(230, 230, 0)",
    "rgb(172, 230, 0)",
    "rgb(115, 230, 0)",
    "rgb(57, 230, 0)",
    "rgb(0, 230, 0)",
    "rgb(0, 230, 57)",
    "rgb(0, 230, 115)",
    "rgb(0, 230, 172)",
    "rgb(0, 230, 230)",
    "rgb(0, 172, 230)",
    "rgb(0, 115, 230)",
    "rgb(0, 57, 230)",
    "rgb(0, 0, 230)",
    "rgb(57, 0, 230)",
    "rgb(115, 0, 230)",
    "rgb(172, 0, 230)",
    "rgb(230, 0, 230)",
    "rgb(230, 0, 172)",
    "rgb(230, 0, 115)",
    "rgb(230, 0, 57)",
    "rgb(34,34,34)",
    "rgb(255,255,255)",
    "rgba(0,0,0,0)"
  ];

  function rebuildOptions(optionVal) {
    styleEntry.empty();
    if (optionVal == "basic") {
      var general = $("<div>").appendTo(styleEntry);
      general.addClass("flexrow flexaround");

      var imageDiv = $("<div>").appendTo(general);
      imageDiv.addClass("flexcolumn");

      var img = $("<div>").appendTo(imageDiv);
      img.addClass("hover2 flexmiddle lmargin outline smooth");

      var style = sync.modifier(info.notes, "bgStyle");
      for (var i in style) {
        img.css(i, style[i]);
      }
      var processedPage = $("<div>").appendTo(img);
      processedPage.css("width", assetTypes["p"].width);
      processedPage.css("height", assetTypes["p"].height);
      processedPage.css("zoom", "33%");

      var style = sync.modifier(info.notes, "style");
      for (var i in style) {
        processedPage.css(i, style[i]);
      }

      img.click(function(){
        var contentDiv = $("<div>");
        contentDiv.addClass("flexrow flexaround");

        function buildSample(modifiers) {
          var sampleImage = $("<div>");
          sampleImage.addClass("outline spadding hover2 smooth flexmiddle");
          var style = modifiers.bgStyle || {};
          for (var i in style) {
            sampleImage.css(i, style[i]);
          }

          var processedPage = $("<div>").appendTo(sampleImage);
          processedPage.css("width", assetTypes["p"].width);
          processedPage.css("height", assetTypes["p"].height);
          processedPage.css("zoom", "33%");

          var style = modifiers.style || {};
          for (var i in style) {
            processedPage.css(i, style[i]);
          }

          sampleImage.click(function(){
            obj.data.info.notes.modifiers = modifiers;
            obj.sync("updateAsset");
            layout.coverlay("sample-pages");
          });
          return sampleImage;
        }

        for (var i in util.pageSamples) {
          buildSample(duplicate(util.pageSamples[i])).appendTo(contentDiv);
        }

        ui_popOut({
          target : $(this),
          title : "Sample Notes",
          id : "sample-pages",
          prompt : true,
        }, contentDiv);
      });

      imageDiv.append("<b>Basic Font</b>");
      var fonts = util.fonts;

      var select = $("<select>").appendTo(imageDiv);
      select.css("width", "200px");

      var option = $("<option>").appendTo(select);
      option.attr("value", "");
      option.text("Default");
      for (var i in fonts) {
        var option = $("<option>").appendTo(select);
        option.attr("value", fonts[i]);
        option.text(fonts[i]);
        if (obj.data.info.notes.modifiers.style["font-family"] == fonts[i]) {
          option.attr("selected", true);
        }
      }
      select.change(function(){
        obj.data.info.notes.modifiers.style["font-family"] = $(this).val();
        obj.sync("updateAsset");
      });

      imageDiv.append("<b>Basic Text Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : obj.data.info.notes.modifiers.style["color"],
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            delete obj.data.info.notes.modifiers.style["color"];
          }
          else {
            obj.data.info.notes.modifiers.style["color"] = col;
          }
          obj.sync("updateAsset");
        }
      }).appendTo(imageDiv);

      imageDiv.append("<b>Basic Text Shadow</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        hideColor : true,
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            delete obj.data.info.notes.modifiers.style["text-shadow"];
          }
          else {
            obj.data.info.notes.modifiers.style["text-shadow"] = "0em 0em 4px " + col;
          }
          obj.sync("updateAsset");
        }
      }).appendTo(imageDiv);

      var basicRow = $("<div>").appendTo(general);
      basicRow.addClass("flexcolumn");

      basicRow.append("<b>Default Horizontal Line</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : obj.data.info.notes.modifiers.style["color"],
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            delete obj.data.info.notes.modifiers["HR"];
          }
          else {
            obj.data.info.notes.modifiers["HR"] = col;
          }
          obj.sync("updateAsset");
        }
      }).appendTo(basicRow);

      var newApp = sync.newApp("ui_JSON").appendTo(basicRow);
      newApp.attr("lookup", "info.notes.modifiers.style");
      newApp.attr("height", "200px");
      obj.addApp(newApp);

      var newApp = sync.newApp("ui_JSON").appendTo(basicRow);
      newApp.attr("lookup", "info.notes.modifiers.bgStyle");
      newApp.attr("height", "200px");
      obj.addApp(newApp);
    }
    else if (optionVal == "header1") {
      styleEntry.append("<b>H1 Font</b>");
      var fonts = util.fonts;

      var select = $("<select>").appendTo(styleEntry);
      var option = $("<option>").appendTo(select);
      option.attr("value", "");
      option.text("Default");

      for (var i in fonts) {
        var option = $("<option>").appendTo(select);
        option.attr("value", fonts[i]);
        option.text(fonts[i]);
        if (sync.modifier(obj.data.info.notes, "H1F") == fonts[i]) {
          option.attr("selected", true);
        }
      }
      select.change(function(){
        sync.modifier(obj.data.info.notes, "H1F", $(this).val());
        obj.sync("updateAsset");
      });

      styleEntry.append("<b>H1 Relative Size</b>");
      var input = genInput({
        parent : styleEntry,
        type : "range",
        min : 2.0,
        step : 0.1,
        max : 4.0,
        value : sync.modifier(obj.data.info.notes, "H1FS") || 3,
      });
      input.change(function(){
        sync.modifier(obj.data.info.notes, "H1FS", $(this).val());
        obj.sync("updateAsset");
      });

      styleEntry.append("<b>H1 Line Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "HR1"),
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "HR1", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "HR1", col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);


      styleEntry.append("<b>H1 Text Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "H1C"),
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "H1C", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "H1C", col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);


      styleEntry.append("<b>H1 Shadow Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "H1S"),colors : colChoices,
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "H1S", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "H1S", "0em 0em 4px " + col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);
    }
    else if (optionVal == "header2") {
      styleEntry.append("<b>H2 Font</b>");
      var fonts = util.fonts;

      var select = $("<select>").appendTo(styleEntry);
      var option = $("<option>").appendTo(select);
      option.attr("value", "");
      option.text("Default");
      for (var i in fonts) {
        var option = $("<option>").appendTo(select);
        option.attr("value", fonts[i]);
        option.text(fonts[i]);
        if (sync.modifier(obj.data.info.notes, "H2F") == fonts[i]) {
          option.attr("selected", true);
        }
      }
      select.change(function(){
        sync.modifier(obj.data.info.notes, "H2F", $(this).val());
        obj.sync("updateAsset");
      });

      styleEntry.append("<b>H2 Relative Size</b>");

      var input = genInput({
        parent : styleEntry,
        type : "range",
        min : 1.0,
        step : 0.1,
        max : 3.0,
        value : sync.modifier(obj.data.info.notes, "H2FS") || 2,
      });
      input.change(function(){
        sync.modifier(obj.data.info.notes, "H2FS", $(this).val());
        obj.sync("updateAsset");
      });
      styleEntry.append("<b>H2 Line Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "HR2"),
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "HR2", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "HR2", col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);

      styleEntry.append("<b>H2 Text Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "H2C"),
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "H2C", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "H2C", col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);

      styleEntry.append("<b>H2 Shadow Color</b>");
      var colDiv1 = sync.render("ui_colorPicker")(obj, app, {
        color : sync.modifier(obj.data.info.notes, "H2S"),
        colors : colChoices,
        colorChange : function(ev, ui, col){
          if (col == "transparent" || col == "rgba(0,0,0,0)") {
            sync.modifier(obj.data.info.notes, "H2S", "");
          }
          else {
            sync.modifier(obj.data.info.notes, "H2S", "0em 0em 2px " + col);
          }
          obj.sync("updateAsset");
        }
      }).appendTo(styleEntry);
    }
    /*
    var primaryCol = sync.render("ui_colorPicker")(obj, app, {
      hideColor : true,
      custom : false,
      colors : [
        "rgb(180, 0, 0)",
        "rgb(180, 7, 0)",
        "rgb(180, 65, 0)",
        "rgb(180, 88, 0)",
        "rgb(180, 122, 0)",
        "rgb(180, 130, 0)",
        "rgb(172, 130, 0)",
        "rgb(115, 130, 0)",
        "rgb(57, 130, 0)",
        "rgb(0, 130, 0)",
        "rgb(0, 13, 7)",
        "rgb(0, 13, 65)",
        "rgb(0, 13, 122)",
        "rgb(0, 13, 130)",
        "rgb(0, 172, 130)",
        "rgb(0, 115, 130)",
        "rgb(0, 57, 130)",
        "rgb(0, 0, 130)",
        "rgb(7, 0, 130)",
        "rgb(65, 0, 130)",
        "rgb(122, 0, 130)",
        "rgb(180, 0, 130)",
        "rgb(180, 0, 122)",
        "rgb(180, 0, 65)",
        "rgb(180, 0, 7)",
        "rgb(230, 0, 0)",
        "rgb(230, 57, 0)",
        "rgb(230, 115, 0)",
        "rgb(230, 138, 0)",
        "rgb(230, 172, 0)",
        "rgb(230, 230, 0)",
        "rgb(172, 230, 0)",
        "rgb(115, 230, 0)",
        "rgb(57, 230, 0)",
        "rgb(0, 230, 0)",
        "rgb(0, 230, 57)",
        "rgb(0, 230, 115)",
        "rgb(0, 230, 172)",
        "rgb(0, 230, 230)",
        "rgb(0, 172, 230)",
        "rgb(0, 115, 230)",
        "rgb(0, 57, 230)",
        "rgb(0, 0, 230)",
        "rgb(57, 0, 230)",
        "rgb(115, 0, 230)",
        "rgb(172, 0, 230)",
        "rgb(230, 0, 230)",
        "rgb(230, 0, 172)",
        "rgb(230, 0, 115)",
        "rgb(230, 0, 57)",
      ],
      colorChange : function(ev, ui, value){

      }
    }).appendTo(styleEntry);
    */
    app.attr("option", optionVal);
  }

  if (app.attr("option")) {
    rebuildOptions(app.attr("option"));
  }
  else {
    basic.click();
  }
  return content;
});


/*
{
  "padding": "2em",
  "margin-top": "43px",
  "margin-bottom": "73px",
  "margin-left": "4em",
  "margin-right": "4em",
  "color": "white",
  "overflow": "auto",
  "max-height": "640px",
  "display": "block"
}

{
  "background-image": "url('https://i.imgur.com/6cfwFee.jpg')",
  "background-size": "contain",
  "background-repeat": "no-repeat",
  "background-position": "center",
  "font-size": "1.2em"
}
*/


sync.render("ui_rollText", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn outline smooth");

  if (scope.context.var) {
    var titlePlate = $("<div>").appendTo(div);
    titlePlate.addClass("outlinebottom spadding flexmiddle");
    titlePlate.text(scope.context.var.rollTitle);

    var displayPlate = $("<div>").appendTo(div);
    displayPlate.addClass("spadding");
    displayPlate.append(scope.context.var.rollText);
  }

  return div;
});

sync.render("ui_renderPage", function(obj, app, scope){
  if (!obj) {
    return $("<div>");
  }
  var data = obj.data;
  var info = data.info;
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), preview : (app.attr("preview") == "true")};

  if (info.img.modifiers && data._t != "c") {
    sync.modifier(obj.data.info.notes, "style", duplicate(info.img.modifiers));
    delete obj.data.info.img.modifiers;
  }

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  if (!scope.viewOnly) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("background alttext flexrow flexbetween lrpadding");

    var stylePage = genIcon("tint", "Style Page").appendTo(optionsBar);
    stylePage.attr("title", "Change the style of how this page renders");
    stylePage.click(function(){
      var newApp = sync.newApp("ui_stylePage");
      obj.addApp(newApp);

      var pop = ui_popOut({
        target : app,
        align : "right",
        id : "page-styling",
        title : "Page Style",
        style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
      }, newApp);
    });

    var edit = genIcon("pencil", "Edit Page").appendTo(optionsBar);
    edit.click(function(){
      app.attr("from", "ui_renderPage");
      app.attr("ui-name", "ui_editPage");
      var ent = getEnt(obj.id()) || obj;
      ent.update();
    });
  }
  var contentWrap = $("<div>").appendTo(div);
  contentWrap.addClass("flexcolumn flex");
  contentWrap.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  contentWrap.attr("_lastScrollLeft", app.attr("_lastScrollLeft"));
  contentWrap.css("position", "relative");
  contentWrap.css("overflow-y", "auto");
  contentWrap.scroll(function(){
    app.attr("_lastScrollTop", $(this).scrollTop());
    app.attr("_lastScrollLeft", $(this).scrollLeft());
  });

  if (data && data.options) {
    var filterStr = "";
    for (var key in data.options.filter) {
      if (key == "hue-rotate") {
        filterStr = filterStr + " " + key + "("+data.options.filter[key]+"deg)";
      }
      else {
        filterStr = filterStr + " " + key + "("+data.options.filter[key]+"%)";
      }
    }
    contentWrap.css("background-color", "rgb(255,255,255)");
    contentWrap.css("-webkit-filter", filterStr);
    contentWrap.css("filter", filterStr);
  }

  if (util.resourceTypes[sync.rawVal(obj.data.info.mode)] && util.resourceTypes[sync.rawVal(obj.data.info.mode)].view) {
    util.resourceTypes[sync.rawVal(obj.data.info.mode)].view(obj, app, scope, contentWrap);
  }
  else {
    var content = $("<div>").appendTo(contentWrap);
    content.addClass("flexrow fit-x");
    content.css("max-width", "100%");
    content.css("min-height", "100%");
    content.css("position", "absolute");

    var style = sync.modifier(info.notes, "bgStyle");
    for (var i in style) {
      content.css(i, style[i]);
    }

    var preview = util.processPage(sync.rawVal(info.notes), obj, app, scope).appendTo(content);
    preview.addClass("flexcolumn flex lpadding");
    preview.css("overflow", "hidden");
    var style = sync.modifier(info.notes, "style");
    for (var i in style) {
      preview.css(i, style[i]);
    }
  }

  return div;
});


/*
H1C :"white",
H1F : "Tahoma, Geneva, sans-serif",
H1FS : 2,
H1S : "0em 0em 4px rgb(0, 230, 230)",
H2C : "rgb(0, 230, 172)",
H2F : `"Lucida Console", Monaco, monospace"`,
H2FS : 1.5,
H2S : "0em 0em 2px rgb(0, 230, 172)",
HR : "rgba(187,0,0,1)",
HR1 : "rgb(0, 115, 130)",
HR2 : "rgba(187,0,0,1)",
bgStyle : {
  "background-image" : "url('https://i.imgur.com/6cfwFee.jpg')",
  "background-position" : "center",
  "background-repeat" : "no-repeat",
  "background-size" : "contain",
  "font-size" : "1.2em",
},
style : {
  color : "rgb(0, 230, 230)",
  display :  "block",
  margin-bottom : "73px",
  margin-left : "4em",
  margin-right : "4em",
  margin-top : "43px",
  max-height : "640px",
  overflow : "auto",
  padding : "2em",
  text-shadow : "0em 0em 4px rgb(0, 115, 230)"
}
*/

sync.render("ui_pageCard", function(obj, app, scope){
  var data = obj.data;
  var info = data.info;
  var charContainer = $("<div>");
  charContainer.addClass("flexcolumn flexmiddle pageContent");
  charContainer.attr("index", obj.id());

  var charOutline = $("<div>").appendTo(charContainer);
  charOutline.addClass("outline");
  charOutline.css("cursor", "pointer");

  var optionsBar = $("<div>").appendTo(charOutline);
  optionsBar.addClass("flexaround");

  if (hasSecurity(getCookie("UserID"), "Rights", data) && !scope.viewOnly) {
    var deleteButton = genIcon("trash").appendTo(optionsBar);
    deleteButton.attr("title", "Delete Page");
    deleteButton.click(function() {
      var popOut = ui_prompt({
        target : $(this),
        id : "confirm-delete-page",
        confirm : "Delete Page",
        click : function(){
          runCommand("deleteAsset", {id: obj.id()});
          delete game.entities.data[obj.id()];
          game.entities.update();
        }
      });
    });

    var dupe = genIcon("duplicate");
    dupe.appendTo(optionsBar);
    dupe.attr("title", "Duplicate this Page");
    dupe.click(function(){
      runCommand("createPage", data);
    });

    if (scope.edit) {
      var edit = genIcon("pencil").appendTo(optionsBar);
      edit.attr("title", "Edit this Page");
      edit.click(function(ev) {
        scope.edit(ev, this, obj);
      });
    }

    var security = genIcon("lock").appendTo(optionsBar);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });
  }

  var charDiv = $("<div>").appendTo(charOutline);
  charDiv.attr("index", obj.id());
  if (!scope.mode) {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "8em");

    charContainer.css("max-width", "150px");
    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle outlinebottom");

    if (sync.val(info.name) && sync.val(info.name).length > 20) {
      title.addClass("subtitle");
      if (sync.val(info.name).length > 35) {
        title.text(sync.val(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/Scroll1000p.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "6em");
  }
  else if (scope.mode == "list") {
    charContainer.removeClass("flexmiddle");
    charOutline.addClass("flex flexcolumn");

    charDiv.addClass("flex flexrow");
    charDiv.css("cursor", "pointer");

    var icon = $("<img>").appendTo(charDiv);
    icon.attr("src", (sync.val(info.img) || "/content/icons/blankchar.png"));
    icon.attr("width", "auto");
    icon.attr("height", "25px");
    icon.addClass("outline");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle flex");
  }
  else if (scope.mode == "large") {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "25em");

    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle");
    title.css("font-size", "1.5em");

    if (sync.val(info.name) && sync.val(info.name).length > 20) {
      title.css("font-size", "1.2em");
      title.css("text-align", "center");
      if (sync.val(info.name).length > 35) {
        title.text(sync.val(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/Scroll1000p.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "auto");
    icon.css("height", "15em");
  }
  charDiv.click(function(ev){
    if (scope.click) {
      scope.click(ev, $(this), obj);
    }
  });

  if (scope.label) {
    var labelDiv = $("<div>").appendTo(icon);
    labelDiv.addClass("alttext background outline spadding subtitle");
    labelDiv.css("position", "absolute");
    if (scope.label instanceof String) {
      labelDiv.append("<i>"+scope.label+"</i>");
    }
    else {
      labelDiv.append(scope.label);
    }
  }

  if (hasSecurity(getCookie("UserID"), "Owner", data) && !scope.viewOnly) {
    var syncLabel;
    if (data._c == -1) {
      syncLabel = genIcon("remove").appendTo(icon);
      syncLabel.addClass("alttext background outline");
      syncLabel.attr("title", "Duplicate to move to Asset Storage");
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
    else {
      if (data._uid) {
        if (data._sync) {
          syncLabel = genIcon("refresh").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, and is in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : false});
            ev.stopPropagation();
            return false;
          });
        }
        else {
          syncLabel = genIcon("cloud").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, but is not in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : true});
            ev.stopPropagation();
            return false;
          });
        }
      }
      else {
        syncLabel = genIcon("cloud").appendTo(icon);
        syncLabel.addClass("outline");
        syncLabel.css("background-color", "white");
        syncLabel.attr("title", "Enable Asset Storage");
        syncLabel.click(function(ev){
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-store-char",
            confirm : "Move to Asset Storage",
            click : function(){
              runCommand("storeAsset", {id: obj.id()});
              layout.coverlay("quick-storage-popout");
              syncLabel.remove();
            }
          });
          ev.stopPropagation();
          return false;
        });
      }
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
  }

  return charContainer;
});



sync.render("ui_adventureCard", function(obj, app, scope){
  var data = obj.data;
  var info = data.info;
  var charContainer = $("<div>");
  charContainer.addClass("flexcolumn flexmiddle advContent");
  charContainer.attr("index", obj.id());

  var charOutline = $("<div>").appendTo(charContainer);
  charOutline.addClass("outline");
  charOutline.css("cursor", "pointer");

  var optionsBar = $("<div>").appendTo(charOutline);
  optionsBar.addClass("flexaround");

  if (hasSecurity(getCookie("UserID"), "Rights", data) && !scope.viewOnly) {
    var deleteButton = genIcon("trash").appendTo(optionsBar);
    deleteButton.attr("title", "Delete Adventure");
    deleteButton.click(function() {
      var popOut = ui_prompt({
        target : $(this),
        id : "confirm-delete-page",
        confirm : "Delete Adventure",
        click : function(){
          runCommand("deleteAsset", {id: obj.id()});
          delete game.entities.data[obj.id()];
          game.entities.update();
        }
      });
    });

    if (scope.edit) {
      var edit = genIcon("pencil").appendTo(optionsBar);
      edit.attr("title", "Edit this Adventure");
      edit.click(function(ev) {
        scope.edit(ev, this, obj);
      });
    }

    var security = genIcon("lock").appendTo(optionsBar);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });
  }

  var charDiv = $("<div>").appendTo(charOutline);
  charDiv.attr("index", obj.id());
  if (!scope.mode) {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "8em");

    charContainer.css("max-width", "150px");
    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle outlinebottom");

    if (sync.val(info.name) && sync.val(info.name).length > 20) {
      title.addClass("subtitle");
      if (sync.val(info.name).length > 35) {
        title.text(sync.val(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/Book1000p.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "6em");
  }
  else if (scope.mode == "list") {
    charContainer.removeClass("flexmiddle");
    charOutline.addClass("flex flexcolumn");

    charDiv.addClass("flex flexrow");
    charDiv.css("cursor", "pointer");

    var icon = $("<img>").appendTo(charDiv);
    icon.attr("src", (sync.val(info.img) || "/content/icons/blankchar.png"));
    icon.attr("width", "auto");
    icon.attr("height", "25px");
    icon.addClass("outline");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle flex");
  }
  else if (scope.mode == "large") {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "25em");

    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.val(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle");
    title.css("font-size", "1.5em");

    if (sync.val(info.name) && sync.val(info.name).length > 20) {
      title.css("font-size", "1.2em");
      title.css("text-align", "center");
      if (sync.val(info.name).length > 35) {
        title.text(sync.val(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/Book1000p.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "auto");
    icon.css("height", "15em");
  }
  charDiv.click(function(ev){
    if (scope.click) {
      scope.click(ev, $(this), obj);
    }
  });

  if (scope.label) {
    var labelDiv = $("<div>").appendTo(icon);
    labelDiv.addClass("alttext background outline subtitle spadding");
    labelDiv.css("position", "absolute");
    if (scope.label instanceof String) {
      labelDiv.append("<i>"+scope.label+"</i>");
    }
    else {
      labelDiv.append(scope.label);
    }
  }

  return charContainer;
});

sync.render("ui_pageList", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};
  if (!obj) {
    game.entities.addApp(app);
    return $("<div>");
  }
  var div = $("<div>");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("outline background alttext flexrow flexaround");
  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var button = genIcon("duplicate", "Create Page");
    button.attr("title", "Create a Page");
    button.appendTo(optionsBar);
    button.click(function() {
      if (!game.config.data.offline) {
        runCommand("createPage", {data : {}});
      }
      else {
        game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
        game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
        game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.page);
        game.entities.update();
      }
    });

    var button = genIcon("book", "Create Adventure");
    button.attr("title", "Create an Adventure");
    button.appendTo(optionsBar);
    button.click(function() {
      if (!game.config.data.offline) {
        runCommand("createAdventure", {data : {}});
      }
      else {
        game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
        game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
        game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.adventure);
        game.entities.update();
      }
    });
  }

  var advText = $("<b>").appendTo(div);
  advText.addClass("fit-x flexmiddle");

  var adventures = $("<div>").appendTo(div);
  adventures.addClass("flexrow flexaround flexwrap");

  var pageText = $("<b>").appendTo(div);
  pageText.addClass("fit-x flexmiddle");

  var pages = $("<div>").appendTo(div);
  pages.addClass("flexrow flexaround flexwrap");
  pages.sortable({
    filter : ".pageContent",
    connectWith : ".dropContent",
  });
  for (var index in obj.data) {
    var ent = obj.data[index];
    if (ent && ent.data) {
      if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
        if (ent.data["_t"] == "p") {
          pageText.text("Resources");
          var page = sync.render("ui_pageCard")(ent, app, {
            edit : function(ev, ui, charObj) {
              var content = sync.newApp("ui_editPage");

              var popout = ui_popOut({
                title : sync.rawVal(charObj.data.info.name),
                target : $("body"),
                minimize : true,
                maximize : true,
                dragThickness : "0.5em",
                resizable : true,
                style : {width : "80vw", height : "80vh"},
                id : "edit-page-"+charObj.id()
              }, content);
              popout.css("padding", "0px");
              popout.addClass("floating-app");

              charObj.addApp(content);
            },
            click : function(ev, ui, charObj) {
              var content = sync.newApp("ui_renderPage");

              var popout = ui_popOut({
                title : sync.rawVal(charObj.data.info.name),
                target : app,
                align : "bottom",
                minimize : true,
                maximize : true,
                dragThickness : "0.5em",
                resizable : true,
                style : {width : "40vw", height : "70vh"},
              }, content);
              popout.css("padding", "0px");
              popout.addClass("floating-app");

              charObj.addApp(content);
            }
          });
          page.addClass("pageContent");
          page.css("background-color", "white");
          page.attr("index", index);
          page.appendTo(pages);
        }
        else if (ent.data["_t"] == "a") {
          advText.text("Adventures");
          var adv = sync.render("ui_adventureCard")(ent, app, {
            edit : function(ev, ui, charObj) {
              var content = sync.newApp("ui_planner");

              var popout = ui_popOut({
                title : sync.rawVal(charObj.data.info.name),
                target : app,
                minimize : true,
                maximize : true,
                dragThickness : "0.5em",
                resizable : true,
                style : {width : "80vw", height : "80vh"},
                id : "edit-page-"+charObj.id()
              }, content);
              popout.css("padding", "0px");
              popout.addClass("floating-app");

              charObj.addApp(content);
            },
            click : function(ev, ui, charObj) {
              var content = sync.newApp("ui_planner");

              var popout = ui_popOut({
                title : sync.rawVal(charObj.data.info.name),
                target : app,
                minimize : true,
                maximize : true,
                dragThickness : "0.5em",
                resizable : true,
                style : {"max-width" : "none"},
              }, content);
              popout.css("padding", "0px");
              popout.addClass("floating-app");

              charObj.addApp(content);
            }
          });
          adv.css("background-color", "white");
          adv.appendTo(adventures);
        }
      }
    }
  }
  return div;
});

var spacewars = `<style>

/*
-----------------------------
---------Credit goes to : https://css-tricks.com/snippets/css/star-wars-crawl-text/
------------------------------
*/

.scrolling {
  display: flex;
  justify-content: center;
  position: relative;
  height: 800px;
  color: #feda4a;
  font-family: 'Pathway Gothic One', sans-serif;
  font-size: 500%;
  font-weight: 600;
  letter-spacing: 0px;
  line-height: 150%;
  perspective: 400px;
  text-align: justify;
}

.crawl {
  position: relative;
  top: 9999px;
  transform-origin: 50% 100%;
  animation: crawl 60s linear;
}

.crawl > .title {
  font-size: 90%;
  text-align: center;
}

.crawl > .title h1 {
  margin: 0 0 100px;
  text-transform: uppercase;
}

@keyframes crawl {
  0% {
    top: 600px;
    transform: rotateX(20deg)  translateZ(0);
  }
  100% {
    top: -6000px;
    transform: rotateX(25deg) translateZ(-2500px);
  }
}
</style>
<div class='fit-xy' style=' background : #000; overflow : hidden; position:relative;'>
  <div style='height : 40%'></div>

  <section class="scrolling">

    <div class="crawl">

      <div class="title">
        <p>Are you a GM?</p>
        <h1>eval{@:gm()?"Yes":"No"}</h1>
      </div>

      <p>eval{@time}</p>
      <p>eval{@weather}</p>
      <p>eval{@temp}</p>

    </div>

  </section>
  <div style='width : 100%; height : 40%; position : absolute; left : 0; top : 0; background : linear-gradient(to top, transparent, black 75%);'></div>
</div>
`;
