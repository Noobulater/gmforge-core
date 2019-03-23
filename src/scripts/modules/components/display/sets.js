sync.render("ui_boardStamps", function(obj, app, scope) {
  scope = scope || {
    viewOnly : app.attr("viewOnly"),
    local : app.attr("local") == "true",
    selected : app.attr("set") || 0,
    board : app.attr("board"),
    tile : app.attr("tile") == "true",
    custom : app.attr("custom") == "true",
  };
  if (game.config.data.offline) {
    scope.local = true;
  }
  if (!obj) {
    game.locals["stamps"] = game.locals["stamps"] || sync.obj();
    game.locals["stamps"].data = game.locals["stamps"].data || {
      _t : "st",
      sets : [],
      defaults : []
    };
    if (game.locals["stamps"].data.defaults.length == 0) {
      $.ajax({
        url: '/getCollections',
        error: function(code) {
          console.log(code);
        },
        type : "GET",
        dataType: 'json',
        success: function(cData) {
          for (var d in cData) {
            $.ajax({
              url: '/collections/'+cData[d],
              type : "GET",
              error: function(code) {
                console.log(code);
              },
              dataType: 'text',
              success: function(data) {
                try {
                  game.locals["stamps"].data.defaults.push(JSON.parse(data));
                }
                catch (err) {

                }
                game.locals["stamps"].update();
              }
            });
          }
        }
      });
    }
    app.attr("board", scope.board);
    app.attr("tile", scope.tile);
    game.locals["stamps"].addApp(app);
    return $("<div>");
  }
  var data = obj.data;

  var stampDiv = $("<div>");
  stampDiv.addClass("flexcolumn flex");
  stampDiv.css("border-width", "2px");

  var board = game.entities.data[app.attr("board")];

  var stampWrap = $("<div>").appendTo(stampDiv);
  stampWrap.addClass("flexrow flex");

  var content = $("<div>").appendTo(stampWrap);
  content.addClass("flexcolumn fit-y");

  var contentHeader = $("<div>").appendTo(content);
  contentHeader.addClass("background alttext lpadding flexmiddle");
  contentHeader.css("font-size", "1.2em");

  contentHeader.append("<text>Collections</text>");

  var setList = $("<div>").appendTo(content);
  setList.addClass("flexcolumn flex");

  for (var i in data.defaults) {
    var set = $("<div>").appendTo(setList);
    set.addClass("smooth outline hover2 flexrow spadding");

    if (i == scope.selected && !scope.custom) {
      set.addClass("highlight alttext");
    }
    if (i > 0) {
      set.append("<b class='flex flexmiddle'>"+data.defaults[i].name+"</b>");
    }
    else {
      set.append("<b class='flex middle'>"+data.defaults[i].name+"</b>");
    }

    set.attr("index", i);
    set.click(function(){
      app.attr("set", $(this).attr("index"));
      app.removeAttr("custom");
      obj.update();
      layout.coverlay("select-stamps");
    });
  }

  for (var i in data.sets) {
    var set = $("<div>").appendTo(setList);
    set.addClass("smooth outline hover2 flexrow spadding");
    if (i == scope.selected && scope.custom) {
      set.addClass("highlight alttext");
    }
    if (i > 0) {
      set.append("<b class='flex flexmiddle'>"+data.sets[i].name+"</b>");
    }
    else {
      set.append("<b class='flex flexmiddle'>"+data.sets[i].name+"</b>");
    }

    set.attr("index", i);
    set.click(function(){
      app.attr("set", $(this).attr("index"));
      app.attr("custom", "true");
      obj.update();
      layout.coverlay("select-stamps");
    });
    if (i != 0) {
      var del = genIcon("remove").appendTo(set);
      del.addClass("background lrpadding outline alttext");
      del.attr("index", i);
      del.attr("title", "Delete Collection");
      del.addClass("destroy");
      del.click(function(){
        data.sets.splice($(this).attr("index"));
        obj.sync("storeCollection");
      });
    }
  }
  var doScale;
  if (!scope.viewOnly) {
    setList.addClass("outlinebottom");

    var subOptions = $("<div>").appendTo(content);
    subOptions.addClass("flexcolumn flexmiddle foreground alttext padding subtitle");

    var checkWrap = $("<div>").appendTo(subOptions);
    checkWrap.addClass("flexmiddle");

    var doScale = genInput({
      type : "checkbox",
      parent : checkWrap,
    });
    doScale.prop("checked", true);
    doScale.css("margin-top", "0");

    checkWrap.append("Scale to Grid Size");

    var newCollection = genIcon("plus", "New Collection")//.appendTo(subOptions);
    newCollection.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Collection Name" : ""
        },
        click : function(ev, inputs){
          data.sets.push({name : inputs["Collection Name"].val(), stamps : [], sheets : {}});
          obj.update();
        }
      })
    });

    if (scope.custom) {
      var addStamp = genIcon("plus", "Add Sheet").appendTo(subOptions);
      addStamp.click(function(){
        ui_prompt({
          target : $(this),
          inputs : {
            "Name" : "",
            "URL" : "",
            "Padding" : {type : "number", value : 0},
            "Grid Width" : {type : "number", value : 32},
            "Grid Height" : {type : "number", value : 32},
          },
          click : function(ev, inputs) {
            if (inputs["URL"].val() && inputs["Name"].val()) {
              data.sets[scope.selected].sheets[inputs["Name"].val()] = {};
              var imgData = data.sets[scope.selected].sheets[inputs["Name"].val()];
              imgData.p = inputs["Padding"].val();
              imgData.gW = inputs["Grid Width"].val();
              imgData.gH = inputs["Grid Height"].val();
              if (imgData.i == inputs["URL"].val()) {
                obj.sync("storeCollection");
              }
              else {
                imgData.i = inputs["URL"].val();
                var img = $("<img>").appendTo(addStamp);
                img.attr("src", imgData.i);
                img.bind("load", function(){
                  imgData.w = $(this).width();
                  imgData.h = $(this).height();
                  imgData.p = inputs["Padding"].val();
                  imgData.gW = inputs["Grid Width"].val();
                  imgData.gH = inputs["Grid Height"].val();
                  obj.sync("storeCollection");
                });
              }
            }
          }
        });
      });
    }
  }

  var listWrapper = $("<div>").appendTo(stampWrap);
  listWrapper.addClass("flexcolumn flex");
  var target = data.defaults;
  if (scope.custom) {
    target = data.sets;
  }
  if (target[scope.selected]) {
    if (target[scope.selected].legal) {
      var license = $("<div class='background alttext flexmiddle fit-x lrpadding'><a "+((target[scope.selected].legal.href != null)?("href='"+target[scope.selected].legal.href+"' target='_blank'"):(""))+">"+(target[scope.selected].legal.name || "License")+"</a></div>").appendTo(listWrapper);
      license.attr("title", "License");
      if (target[scope.selected].legal.license) {
        license.click(function(){
          var content = $("<div>");
          if (target[scope.selected].legal.html) {
            content.css("width", "30vw");
            content.css("height", "40vh");
            setTimeout(function(){
              var newFrame = $("<iframe>").appendTo(content);
              newFrame.attr("width", content.width());
              newFrame.attr("height", content.height());
              newFrame.attr("sandbox", "");
              newFrame.css("border", "none");
              newFrame.css("outline", "none");

              var str = target[scope.selected].legal.license;
              str = replaceAll(str, "href=", "nolinks=");
              str = replaceAll(str, "iframe", "div");

              newFrame.contents().find('html').html(str);
            }, 10);
          }
          else {
            content = $("<textarea>");
            content.css("border", "none");
            content.css("disabled", "true");
            content.css("width", "30vw");
            content.css("height", "40vh");
            content.text(target[scope.selected].legal.license);
          }
          var pop = ui_popOut({
            target : $(this),
            id : "license",
          }, content);
        });
      }
    }

    var stampList = $("<div>").appendTo(listWrapper);
    stampList.addClass("flexrow flexaround flexwrap flex lpadding scroll-y");

    if (!layout.mobile) {
      stampList.on("dragover", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!$("#"+app.attr("id")+"-drag-overlay").length) {
          var olay = layout.overlay({
            target : app,
            id : app.attr("id")+"-drag-overlay",
            style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
          });
          olay.addClass("flexcolumn flexmiddle alttext");
          olay.css("font-size", "2em");
          olay.append("<b>Drop to Create</b>");
        }
      });

      stampList.on('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var dt = ev.originalEvent.dataTransfer;
        if (dt.getData("Text")) {
          var imgVal = dt.getData("Text");
          var img = $("<img>").appendTo(app);
          img.attr("src", dt.getData("Text"));
          if (imgVal) {
            img.bind("load", function(){
              ui_prompt({
                target : stampList,
                inputs : {"Name" : ""},
                click : function(ev, inputs){
                  if (inputs["Name"].val() && inputs["Name"].val().trim()) {
                    obj.target[scope.selected].sheets[inputs["Name"].val().trim()] = {
                      p : 0,
                      gW : 32,
                      gH : 32,
                      i : imgVal,
                      w : img[0].naturalWidth,
                      h : img[0].naturalHeight,
                      nW : img[0].naturalWidth,
                      nH : img[0].naturalHeight
                    };
                    obj.update();
                  }
                }
              });
              img.hide();
              layout.coverlay(app.attr("id")+"-drag-overlay");
            });
          }
        }
      });
      stampList.on("dragleave", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
      stampList.mouseout(function(){
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
    }

    for (var i in target[scope.selected].sheets) {
      var urls = target[scope.selected].sheets;
      var imgWrap = $("<div>").appendTo(stampList);
      imgWrap.addClass("outline smooth flexcolumn lmargin flex hover2");
      imgWrap.attr("key", i);
      imgWrap.css("min-width", "70px");
      imgWrap.css("min-height", "70px");
      imgWrap.css("padding", "2px");
      imgWrap.css("overflow", "hidden");
      imgWrap.append("<div class='outlinebottom flexmiddle'><b>"+i+"</b></div>");
      imgWrap.click(function(){
        var newSheet = duplicate(urls[$(this).attr("key")]);
        newSheet.legal = target[scope.selected].legal;
        if (doScale.prop("checked") && board.data.gridW && board.data.gridH) {
          var scaleX = board.data.gridW/newSheet.gW;
          var scaleY = board.data.gridH/newSheet.gH;
          newSheet.nW = (newSheet.nW || newSheet.w);
          newSheet.nH = (newSheet.nH || newSheet.h);
          newSheet.w = (newSheet.w) * scaleX;
          newSheet.h = (newSheet.h) * scaleY;
          newSheet.gW = newSheet.gW * scaleX;
          newSheet.gH =  newSheet.gH * scaleY;
          if (newSheet.objs) {
            for (var i=0; i<newSheet.objs.length; i++) {
              var tileData = newSheet.objs[i];
              tileData.w = (tileData.w) * scaleX;
              tileData.h = (tileData.h) * scaleY;
            }
          }
        }
        board.data.sheets.push(newSheet);
        board.sync("updateAsset");
      });
      var sheet = $("<div>").appendTo(imgWrap);
      sheet.addClass("flex");
      sheet.css("background-image", "url('"+ urls[i].i +"')");
      sheet.css("background-repeat", "no-repeat");
      sheet.css("background-position", "center");
      sheet.css("background-size", "contain");

      if (scope.custom) {
        sheet.addClass("outlinebottom");

        var optionsBar = $("<div>").appendTo(imgWrap);
        optionsBar.addClass("flexaround smooth");

        var edit = genIcon("pencil").appendTo(optionsBar);
        edit.addClass("lrpadding");
        edit.attr("index", i);
        edit.click(function(ev){
          var imgData = urls[$(this).attr("index")];
          ui_prompt({
            target : $(this),
            inputs : {
              "URL" : imgData.i,
              "Padding" : {type : "number", value : imgData.p},
              "Grid Width" : {type : "number", value : imgData.gW},
              "Grid Height" : {type : "number", value : imgData.gH},
            },
            click : function(ev, inputs) {
              imgData.p = inputs["Padding"].val();
              imgData.gW = inputs["Grid Width"].val();
              imgData.gH = inputs["Grid Height"].val();
              if (imgData.i == inputs["URL"].val()) {
                obj.sync("storeCollection");
              }
              else {
                imgData.i = inputs["URL"].val();
                var img = $("<img>").appendTo(edit);
                img.attr("src", imgData.i);
                img.bind("load", function(){
                  imgData.w = $(this).width();
                  imgData.h = $(this).height();
                  imgData.p = inputs["Padding"].val();
                  imgData.gW = inputs["Grid Width"].val();
                  imgData.gH = inputs["Grid Height"].val();
                  obj.sync("storeCollection");
                });
              }
            }
          });
          ev.preventDefault();
          ev.stopPropagation();
        });

        var del = genIcon("trash").appendTo(optionsBar);
        del.addClass("lrpadding");
        del.attr("index", i);
        del.addClass("destroy");
        del.click(function(ev){
          delete urls[$(this).attr("index")];
          obj.sync("storeCollection");
          ev.preventDefault();
          ev.stopPropagation();
        });
      }
    }

    stampDiv.append("<div class='flexmiddle subtitle'><i>By using these tiles you accept to their license and terms (if applicable)</i></div>");
  }
  return stampDiv;
});
