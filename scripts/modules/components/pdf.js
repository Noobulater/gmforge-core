var _hasAccepted;

sync.render("ui_resourcePage", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", website : app.attr("url"), resourcePath : app.attr("resourcePath")};
  if (!obj) {
    game.config.addApp(app);
    return $("<div>");
  }
  var resourcePath = scope.resourcePath;

  var div = $("<div>");
  div.addClass("flexrow fit-xy");
  var data = obj.data;

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("foreground flexcolumn");
  optionsBar.css("padding-top", $($(".main-dock")[1]).height());

  var frameWrap = $("<div>").appendTo(div);
  frameWrap.css("position", "relative");
  frameWrap.css("overflow-y", "hidden");
  function recurseSort(list) {
    list.sort(function(a,b){
      if ((a.name || "").toLowerCase() < (b.name || "").toLowerCase()) {
        return -1;
      }
      else if ((a.name || "").toLowerCase() > (b.name || "").toLowerCase()) {
        return 1;
      }
      return 0;
    });
    for (var i=0; i<list.length; i++) {
      if (list[i] && list[i].res) {
        list[i].res = recurseSort(list[i].res);
      }
    }
    return list;
  }
  obj.data.resources = recurseSort(obj.data.resources);

  function loadTabs(){
    optionsBar.empty();

    function renderTab(tabData, key, fullPath) {
      var tabWrap = $("<div>");
      tabWrap.addClass("lrmargin flexrow bold");
      if (tabData._s && tabData._s.default && tabData._s.default != 1) {
        tabWrap.css("background-color", "rgb(235,235,228)");
      }
      var resourceWrap = $("<div>").appendTo(tabWrap);
      resourceWrap.addClass("flexcolumn fit-x");
      resourceWrap.attr("fullPath", fullPath);
      if (tabData.url) {
        var newApp = sync.newApp("ui_tab").appendTo(resourceWrap);
        newApp.addClass("underline link");
        newApp.css("outline", "none");
        newApp.attr("tabName", tabData.name);
        if (tabData.type == "asset") {
          getEnt(tabData.url).addApp(newApp);
        }
        else {
          sync.render("ui_tab")(null, newApp, null).appendTo(newApp);
        }
        resourceWrap.attr("url", tabData.url);
        resourceWrap.attr("type", tabData.type);
        resourceWrap.click(function(ev){
          app.attr("resourcePath", $(this).attr("fullPath"));
          loadUrl($(this).attr("url"), $(this).attr("type"), $(this).attr("fullPath"));
          ev.stopPropagation();
          ev.preventDefault();
        });
      }
      else {
        if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
          resourceWrap.append("<b class='hover2 lrpadding'>"+tabData.name+"</b>");
          resourceWrap.click(function(ev){
            var actionList = [
              {
                name : "PDF",
                icon : "book",
                click : function(ev, ui){
                  var picker = sync.render("ui_filePicker")(obj, app, {
                    filter : "pdf",
                    change : function(ev, ui2, value) {
                      ui_prompt({
                        target : ui,
                        inputs : {
                          "Page #" : {placeholder : "(Optional)"}
                        },
                        click : function(ev, inputs) {
                          var page;
                          if (inputs["Page #"].val() != null) {
                            page = "#page="+inputs["Page #"].val() || 1;
                          }

                          var resData = {
                            name : value.split("/")[value.split("/").length-1].split(".")[0],
                            url : value + page,
                            type : "pdf"
                          };
                          var resource = sync.traverse(obj.data.resources, fullPath);
                          resource.res = resource.res || [];
                          resource.res.push(resData);
                          obj.sync("updateConfig");
                        }
                      });
                      layout.coverlay("resource-picker");
                    }
                  });
                  var pop = ui_popOut({
                    target : ui,
                    prompt : true,
                    align : "right",
                    id : "resource-picker",
                    style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
                  }, picker);
                  pop.resizable();
                }
              },
              {
                name : "Website",
                icon : "link",
                click : function(ev, ui){
                  ui_prompt({
                    target : ui,
                    inputs : {
                      "Resource Name" : "",
                      "Website URL" : ""
                    },
                    click : function(ev, inputs){
                      if (inputs["Resource Name"].val() || inputs["Website URL"].val()) {
                        var url = inputs["Website URL"].val();
                        if (url.match("https://")) {
                          var tabData = sync.traverse(obj.data.resources, fullPath);
                          tabData.res = tabData.res || [];
                          tabData.res.push({url : url, name : inputs["Resource Name"].val() || url, type : "website"});
                          obj.sync("updateConfig");
                        }
                        else {
                          sendAlert({"text" : "Websites must be secured ( https:// )"});
                        }
                      }
                    }
                  });
                }
              },
              {
                name : "Asset",
                icon : "unchecked",
                click : function(ev, ui){
                  var content = sync.render("ui_assetPicker")(obj, app, {
                    sessionOnly : true,
                    category : "p",
                    select : function(ev, ui, ent, options, entities){
                      var tabData = sync.traverse(obj.data.resources, fullPath);
                      tabData.res = tabData.res || [];
                      tabData.res.push({url : ent.id(), type : "asset"});
                      obj.sync("updateConfig");
                      layout.coverlay("add-asset");
                    }
                  });
                  var pop = ui_popOut({
                    target : $("body"),
                    prompt : true,
                    id : "add-asset",
                    title : "Pick Asset",
                    style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
                  }, content);
                  pop.resizable();
                }
              },
              {
                name : "Image",
                icon : "picture",
                click : function(ev, ui){
                  var picker = sync.render("ui_filePicker")(obj, app, {
                    filter : "img",
                    change : function(ev, ui2, value, name) {
                      var resData = {
                        name : value.split("/")[value.split("/").length-1].split(".")[0],
                        url : value,
                        name : name,
                        type : "img",
                      };
                      var tabData = sync.traverse(obj.data.resources, fullPath);
                      tabData.res = tabData.res || [];
                      tabData.res.push(resData);
                      obj.sync("updateConfig");
                      layout.coverlay("resource-picker");
                    }
                  });
                  var pop = ui_popOut({
                    target : ui,
                    prompt : true,
                    align : "right",
                    id : "resource-picker",
                    style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
                  }, picker);
                  pop.resizable();
                }
              },
              {
                name : "Sub-category",
                click : function(ev, ui){
                  ui_prompt({
                    target : ui,
                    inputs : {
                      "Category Name" : "",
                    },
                    click : function(ev, inputs){
                      if (inputs["Category Name"].val()) {
                        var tabData = sync.traverse(obj.data.resources, fullPath);
                        tabData.res = tabData.res || [];
                        tabData.res.push({name : inputs["Category Name"].val()});
                        obj.sync("updateConfig");
                      }
                    }
                  });
                }
              }
            ];

            ui_dropMenu($(this), actionList, {id : "add-resource"});
            ev.stopPropagation();
            ev.preventDefault();
          });
        }
        else {
          resourceWrap.append("<b class='lrpadding'>"+tabData.name+"</b>");
        }      }
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        resourceWrap.contextmenu(function(ev){
        var ui = $(this);
        var actionList = [];
        actionList.push(
          {
            name : "Rename",
            click : function(ev, ui2) {
              ui_prompt({
                target : ui,
                inputs : {
                  "Rename" : sync.traverse(obj.data.resources, fullPath).name
                },
                click : function(ev, inputs){
                  if (inputs["Rename"].val()) {
                    sync.traverse(obj.data.resources, fullPath).name = inputs["Rename"].val();
                    obj.sync("updateConfig");
                  }
                }
              });
            }
          }
        );
        actionList.push(
          {
            name : "Access",
            click : function(ev, ui2) {
              var content = $("<div>");
              content.addClass("flexcolumn");

              var tabData = sync.traverse(obj.data.resources, fullPath);

              var securityContent = $("<div>").appendTo(content);
              function buildSecurity() {
                var secTbl = {};
                secTbl[getCookie("UserID")] = 1;
                secTbl = sync.traverse(obj.data.resources, fullPath)._s || secTbl;
                var sec = sync.render("ui_rights")(obj, app, {
                  security : secTbl,
                  change : function(ev, ui, userID, newSecurity){
                    sync.traverse(obj.data.resources, fullPath)._s = sync.traverse(obj.data.resources, fullPath)._s || secTbl;
                    if (userID == "default" && newSecurity === "") {
                      sync.traverse(obj.data.resources, fullPath)._s[userID] = "1";
                    }
                    else {
                      sync.traverse(obj.data.resources, fullPath)._s[userID] = newSecurity;
                    }
                    obj.sync("updateConfig");
                    securityContent.empty();
                    buildSecurity().appendTo(securityContent);
                  }
                });
                return sec;
              }
              buildSecurity().appendTo(securityContent);

              ui_popOut({
                target : ui,
                id : "tab-options",
              }, content);
            }
          }
        );
        if (resourceWrap.attr("type") != "asset") {
          actionList.push(
            {
              name : "Change link",
              click : function(ev, ui){
                var tabData = sync.traverse(obj.data.resources, fullPath);
                ui_prompt({
                  target : ui,
                  inputs : {
                    "Resource URL" : tabData.url
                  },
                  click : function(ev, inputs){
                    if (inputs["Resource URL"].val()) {
                      var url = inputs["Resource URL"].val();
                      var tabData = sync.traverse(obj.data.resources, fullPath);
                      tabData.url = inputs["Resource URL"].val();
                      obj.sync("updateConfig");
                    }
                    else {
                      var tabData = sync.traverse(obj.data.resources, fullPath);
                      delete tabData.url;
                      obj.sync("updateConfig");
                    }
                  }
                });
              }
            }
          );
        }
        actionList.push(
          {
            name : "Add resource",
            submenu : [
              {
                name : "PDF",
                icon : "book",
                click : function(ev, ui){
                  var picker = sync.render("ui_filePicker")(obj, app, {
                    filter : "pdf",
                    change : function(ev, ui2, value) {
                      ui_prompt({
                        target : ui,
                        inputs : {
                          "Page #" : {placeholder : "(Optional)"}
                        },
                        click : function(ev, inputs) {
                          var page;
                          if (inputs["Page #"].val() != null) {
                            page = "#page="+inputs["Page #"].val();
                          }

                          var resData = {
                            name : value.split("/")[value.split("/").length-1].split(".")[0],
                            url : value + page,
                            type : "pdf"
                          };
                          var resource = sync.traverse(obj.data.resources, fullPath);
                          resource.res = resource.res || [];
                          resource.res.push(resData);
                          obj.sync("updateConfig");
                        }
                      });
                      layout.coverlay("resource-picker");
                    }
                  });
                  var pop = ui_popOut({
                    target : ui,
                    prompt : true,
                    align : "right",
                    id : "resource-picker",
                    style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
                  }, picker);
                  pop.resizable();
                }
              },
              {
                name : "Website",
                icon : "link",
                click : function(ev, ui){
                  ui_prompt({
                    target : ui,
                    inputs : {
                      "Resource Name" : "",
                      "Website URL" : ""
                    },
                    click : function(ev, inputs){
                      if (inputs["Resource Name"].val() || inputs["Website URL"].val()) {
                        var url = inputs["Website URL"].val();
                        if (url.match("https://")) {
                          var tabData = sync.traverse(obj.data.resources, fullPath);
                          tabData.res = tabData.res || [];
                          tabData.res.push({url : url, name : inputs["Resource Name"].val() || url, type : "website"});
                          obj.sync("updateConfig");
                        }
                        else {
                          sendAlert({"text" : "Websites must be secured ( https:// )"});
                        }
                      }
                    }
                  });
                }
              },
              {
                name : "Asset",
                icon : "unchecked",
                click : function(ev, ui){
                  var content = sync.render("ui_assetPicker")(obj, app, {
                    sessionOnly : true,
                    category : "p",
                    select : function(ev, ui, ent, options, entities){
                      var tabData = sync.traverse(obj.data.resources, fullPath);
                      tabData.res = tabData.res || [];
                      tabData.res.push({url : ent.id(), type : "asset"});
                      obj.sync("updateConfig");
                      layout.coverlay("add-asset");
                    }
                  });
                  var pop = ui_popOut({
                    target : $("body"),
                    prompt : true,
                    id : "add-asset",
                    title : "Pick Asset",
                    style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
                  }, content);
                  pop.resizable();
                }
              },
              {
                name : "Image",
                icon : "picture",
                click : function(ev, ui){
                  var picker = sync.render("ui_filePicker")(obj, app, {
                    filter : "img",
                    change : function(ev, ui2, value, name) {
                      var resData = {
                        name : value.split("/")[value.split("/").length-1].split(".")[0],
                        url : value,
                        name : name,
                        type : "img",
                      };
                      var resource = sync.traverse(obj.data.resources, fullPath);
                      resource.res = resource.res || [];
                      resource.res.push(resData);
                      obj.sync("updateConfig");
                      layout.coverlay("resource-picker");
                    }
                  });
                  var pop = ui_popOut({
                    target : ui,
                    prompt : true,
                    align : "right",
                    id : "resource-picker",
                    style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
                  }, picker);
                  pop.resizable();
                }
              },
              {
                name : "Sub-category",
                click : function(ev, ui){
                  ui_prompt({
                    target : ui,
                    inputs : {
                      "Category Name" : "",
                    },
                    click : function(ev, inputs){
                      if (inputs["Category Name"].val()) {
                        var tabData = sync.traverse(obj.data.resources, fullPath);
                        tabData.res = tabData.res || [];
                        tabData.res.push({name : inputs["Category Name"].val()});
                        obj.sync("updateConfig");
                      }
                    }
                  });
                }
              }
            ]
          }
        );
        if (tabData.url) {
          actionList.push({
            name : "Force players to link",
            click : function(ev, ui){
              runCommand("forceTab", {index : app.attr("tabKey"), path : fullPath});
            }
          });
        }
        actionList.push(
          {
            name : "Remove resource",
            submenu : [
              {
                name : "CONFIRM",
                icon : "trash",
                click : function(ev, ui) {
                  var newPath = "";
                  var pathArray = fullPath.split(".");
                  for (var i=0; i<pathArray.length-1; i++) {
                    newPath += pathArray[i] + ".";
                  }
                  sync.traverse(obj.data.resources, newPath.substring(0, newPath.length-1)).splice(pathArray[pathArray.length-1], 1);
                  obj.sync("updateConfig");
                }
              }
            ]
          }
        );

        ui_dropMenu($(this), actionList, {id : "resource-option"});
        ev.stopPropagation();
        ev.preventDefault();
      });
      }
      var subCat = $("<div>").appendTo(resourceWrap);
      subCat.addClass("flexcolumn subtitle lrpadding lrmargin");
      for (var i in tabData.res) {
        if (tabData.res[i] && (!tabData.res[i]._s || hasSecurity(getCookie("UserID"), "Visible", tabData.res[i]))) {
          renderTab(tabData.res[i], i, fullPath+".res."+i).appendTo(subCat);
        }
      }

      return tabWrap;
    }

    var createWrap = $("<div>").appendTo(optionsBar);
    createWrap.addClass("flexrow alttext flexmiddle");

    var listWrap = $("<div>").appendTo(optionsBar);
    listWrap.addClass("flexcolumn fit-xy");
    listWrap.css("position", "relative");
    listWrap.css("overflow-y", "auto");
    listWrap.css("min-width", "250px");

    var tabList = $("<div>").appendTo(listWrap);
    tabList.addClass("flexcolumn fit-x lrpadding");
    tabList.css("position", "absolute");
    tabList.css("padding-bottom", "75px");

    for (var key in obj.data.resources) {
      if (obj.data.resources[key] && (!obj.data.resources[key]._s || hasSecurity(getCookie("UserID"), "Visible", obj.data.resources[key]))) {
        var tabWrap = $("<div>").appendTo(tabList);
        tabWrap.addClass("flexrow white outline spadding smooth");
        tabWrap.css("font-size", "1.2em");

        if (obj.data.resources[key]._s && obj.data.resources[key]._s.default && obj.data.resources[key]._s.default != 1) {
          tabWrap.css("background-color", "rgb(235,235,228)");
        }

        var tab = renderTab(obj.data.resources[key], key, key).appendTo(tabWrap);
        tab.addClass("flex");

        var remove = genIcon("remove").appendTo(tabWrap);
        remove.attr("index", key);
        remove.click(function(){
          var index = $(this).attr("index");
          var button = $("<button>");
          button.addClass("highlight alttext");
          button.css("font-size", "1.6em");
          button.append("Delete Category");
          button.click(function(){
            delete obj.data.resources[index];
            obj.sync("updateConfig");
            layout.coverlay("clear-category");
          });

          var pop = ui_popOut({
            target : $(this),
            id : "clear-category",
            hideclose : true,
            noCss : true,
            prompt : true,
          }, button);
        });
      }
    }

    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var buttonWrap = $("<div>").appendTo(createWrap);
      buttonWrap.addClass("flexcolumn flexmiddle");

      var add = genIcon("plus", "Add Category...").appendTo(buttonWrap);
      add.attr("title", "Add a new Category");
      add.click(function(){
        obj.data.resources.push({name : "New Category"});
        obj.sync("updateConfig");
      });

      var add = genIcon("", "Copy from your PDFs!").appendTo(buttonWrap);
      add.addClass("subtitle");
      add.attr("title", "Use the PDF app to copy images from PDF");
      add.click(function(){
        var newApp = sync.newApp("ui_pdf", null, {});

        ui_popOut({
          prompt : true,
          target : $("body"),
          style : {width : "60vw", height : "80vh"}
        }, newApp);
      });
    }
  }

  function loadUrl(url, type, resourcePath) {
    frameWrap.empty();
    if (type == "asset") {
      var ent = getEnt(url);

      var frameWrapper = $("<div>").appendTo(frameWrap);
      frameWrapper.addClass("fit-xy");
      frameWrapper.css("position", "relative");
      frameWrapper.css("overflow", "auto");

      var frameWrapper = $("<div>").appendTo(frameWrapper);
      frameWrapper.addClass("flexcolumn flexmiddle fit-x");
      frameWrapper.css("position", "absolute");
      frameWrapper.css("min-height", "100%");
      frameWrapper.css("text-align", "left");

      var newFrame = sync.newApp(assetTypes[ent.data._t].handout || assetTypes[ent.data._t].ui).appendTo(frameWrapper);
      newFrame.attr("viewOnly", true);
      newFrame.removeClass("application");
      newFrame.css("width", assetTypes[ent.data._t].width || "100%");
      newFrame.css("height", assetTypes[ent.data._t].height || frameWrapper.height());
      ent.addApp(newFrame);
    }
    else if (type == "pdf") {
      var newFrame = $("<object>").appendTo(frameWrap);
      newFrame.attr("type", "application/pdf");
      newFrame.attr("data", url);
      newFrame.attr("width", "100%");
      newFrame.attr("height", "100%");
    }
    else if (type == "img") {
      var split = String(resourcePath).split(".");
      var index = split[split.length-1];
      var newPath = "";
      for (var i in split) {
        newPath += split[i] + ".";
      }
      newPath = newPath.substring(0, newPath.length-2);
      var imageWrapper = $("<div>").appendTo(frameWrap);
      imageWrapper.css("width", "100%");
      imageWrapper.css("height", "100%");
      imageWrapper.css("position", "relative");
      imageWrapper.css("overflow", "auto");
      imageWrapper.css("background-image", "url('"+url+"')");
      imageWrapper.css("background-repeat", "no-repeat");
      imageWrapper.css("background-position", "center");
      imageWrapper.css("background-size", "contain");
      imageWrapper.css("padding-bottom", "1.5em");
      imageWrapper.scroll(function(ev){
        if (($(this).scrollTop()-(imageWrapper.attr("lastScroll") || 0)) < 0 && $(this).scrollTop() == 0 && !imageWrapper.attr("transferring")) {
          var newIndex = Math.max(index-1, 0);
          var newResource = newPath + newIndex;
          var resourceData = sync.traverse(obj.data.resources, newResource);
          if (resourceData.type == type && index != newIndex) {
            imageWrapper.attr("transferring", true);
            index = newIndex;
            var newImg = $("<img>")
            newImg.attr("src", resourceData.url);
            newImg.css("zoom", zoom+"%");
            newImg[0].onload = function(){
              imgContainer.empty();
              imgContainer.append(newImg);
              img = newImg;
              img.css("margin-top", "100px");
              img.css("margin-bottom", "100px");
              imageWrapper.scrollTop(imageWrapper[0].scrollHeight-1);
              setTimeout(function(){imageWrapper.removeAttr("transferring")}, 100);
            }
          }
        }
        else if (($(this).scrollTop()-(imageWrapper.attr("lastScroll") || 0)) > 0 && $(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight && !imageWrapper.attr("transferring")) {
          var newIndex = Math.max(Number(index)+1, 0);
          var newResource = newPath + newIndex;
          var resourceData = sync.traverse(obj.data.resources, newResource);
          if (resourceData.type == type && index != newIndex) {
            imageWrapper.attr("transferring", true);
            index = newIndex;
            var newImg = $("<img>")
            newImg.attr("src", resourceData.url);
            newImg.css("zoom", zoom+"%");
            newImg[0].onload = function(){
              imgContainer.empty();
              imgContainer.append(newImg);
              img = newImg;
              img.css("margin-top", "100px");
              img.css("margin-bottom", "100px");
              imageWrapper.scrollTop(1);
              setTimeout(function(){imageWrapper.removeAttr("transferring")}, 100);
            }
          }
        }
        imageWrapper.attr("lastScroll", $(this).scrollTop());
      });

      var imgContainer = $("<div>").appendTo(imageWrapper);
      imgContainer.addClass("flexmiddle");
      imgContainer.css("position", "absolute");
      imgContainer.css("min-width", "100%");

      imgContainer.hide();

      var img = $("<img>").appendTo(imgContainer);
      img.attr("src", url);

      var zoom = 100;

      var zoomContainer = $("<div>").appendTo(frameWrap);
      zoomContainer.addClass("flexcolumn flexmiddle");
      zoomContainer.css("width", "auto");
      zoomContainer.css("position", "absolute");
      zoomContainer.css("left", "100px");
      zoomContainer.css("bottom", "100px");


      var checkboxWrap = $("<div>")//.appendTo(zoomContainer);
      checkboxWrap.addClass("flexmiddle subtitle bold");

      var checkbox = genInput({
        parent : checkboxWrap,
        type : "checkbox",
        value : app.attr("scrollNext"),
        style : {"margin-top" : "0px"}
      });
      //checkboxWrap.append("Scroll to Next");

      var maxZoom = 200;
      var typeI = "range";
      if (layout.mobile) {
        maxZoom = 1000;
        typeI = "number";
      }
      var zoomRange = genInput({
        parent : zoomContainer,
        type : typeI,
        min : 25,
        value : 100,
        step : 5,
        style : {"width": "100px", color : "black"},
        max : maxZoom
      }, 1);
      zoomRange.val(zoom);
      zoomRange.bind("input", function(){
        imgContainer.show();
        imageWrapper.css("background", "none");
        zoom = $(this).val();
        img.css("zoom", zoom + "%");
        img.css("margin-top", "100px");
        img.css("margin-bottom", "100px");
      });

    }
    else if (type == "website") {
      var newFrame = $("<iframe>").appendTo(frameWrap);
      newFrame.attr("src", url);
      newFrame.attr("width", "100%");
      newFrame.attr("height", "100%");
      newFrame.css("border", "none");
      newFrame.css("outline", "none");
    }
  }

  if (!hasSecurity(getCookie("UserID"), "Assistant Master") && !_hasAccepted) {
    optionsBar.addClass("flexmiddle flex alttext");
    optionsBar.removeClass("flexrow flexaround");
    optionsBar.append("<div>Make sure you trust your GM before accessing these resources</div>");

    var confirm = $("<button>").appendTo(optionsBar);
    confirm.addClass("highlight alttext");
    confirm.append("I trust them, and accept what they could show me");
    confirm.click(function(){
      frameWrap.addClass("fit-xy");
      optionsBar.removeClass("flexmiddle flex alttext");
      optionsBar.addClass("flexrow");
      loadTabs();
      if (resourcePath) {
        var resourceData = sync.traverse(obj.data.resources, resourcePath);
        loadUrl(resourceData.url, resourceData.type, resourcePath);
      }
      _hasAccepted = true;
    });
  }
  else {
    optionsBar.removeClass("flexmiddle flex");
    frameWrap.addClass("fit-xy");
    loadTabs();
    if (resourcePath) {
      var resourceData = sync.traverse(obj.data.resources, resourcePath);
      setTimeout(function(){loadUrl(resourceData.url, resourceData.type, resourcePath)}, 100);
    }
  }

  app.removeAttr("forced");

  return div;
});


sync.render("ui_pdf", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", pdf : app.attr("url")};
  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");

  var zoom = parseInt(app.attr("zoom")) / 100 || 1;

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("outline background alttext flexaround flexwrap");
  optionsBar.css("min-width", "200px");
  optionsBar.css("min-height", "22px");
  if (scope.pdf) {
    showPDF(scope.pdf, filePicker.get(0).files[0].name);
  }
  else {
    var filePicker = genInput({
      parent : optionsBar,
      type : "file",
      accept : "application/pdf",
      id : app.attr("id")+"-pdf-upload"
    });
    filePicker.change(function(){
      // Send the object url of the pdf
      showPDF(URL.createObjectURL(filePicker.get(0).files[0]), filePicker.get(0).files[0].name);
    });
  }
  var bookmarkBar = $("<div>");
  bookmarkBar.appendTo(optionsBar);

  var controlBar = $("<div>").appendTo(div);
  controlBar.addClass("outline background alttext flexrow flexaround");

  var pdfCanvasContainer = $("<div>").appendTo(div);
  pdfCanvasContainer.css("flex", "1");
  pdfCanvasContainer.css("position", "relative");
  pdfCanvasContainer.css("overflow", "scroll");

  var pdfCanvas = $("<canvas>").appendTo(pdfCanvasContainer);
  pdfCanvas.css("position", "absolute");
  pdfCanvas.attr("width", Math.round($(window).outerWidth() *(3/4)));
  pdfCanvas.attr("height", Math.round($(window).outerHeight() *(3/4)));
  var PDF,
      CURRENT_PAGE,
      TOTAL_PAGES,
      PAGE_RENDERING_IN_PROGRESS = 0,
      CANVAS = pdfCanvas.get(0).getContext('2d'),
      WIDTH;
  // Initialize and load the PDF
  function showPDF(pdf_url, filename) {
    controlBar.css("min-height", "22px");
    controlBar.empty();
    bookmarkBar.empty();
    pdfCanvasContainer.css("min-width", "200px");
    pdfCanvasContainer.css("min-height", "300px");

    app.attr("PDF_DOC", pdf_url);
    PDFJS.getDocument({url: pdf_url}).then(function(pdf_doc) {
      var list = genIcon("bookmark", "Bookmarks").appendTo(bookmarkBar);
      list.click(function(){
        var bookMarkList = JSON.parse(getCookie("GM_PDF_Bookmarks") || "{}") || {};
        var keys = bookMarkList[filename] || {};
        var options = [];
        for (var key in keys) {
          options.push({
            name : key,
            attr : {key : key},
            submenu : [{
              name : "Delete",
              attr : {
                key : key
              },
              click : function(ev, ui) {
                var bookMarkList = JSON.parse(getCookie("GM_PDF_Bookmarks") || {}) || {};
                delete bookMarkList[filename][ui.attr("key")];
                setCookie("GM_PDF_Bookmarks", JSON.stringify(bookMarkList), 9999999);
              }
            }],
            click : function(ev, ui) {
              var bookMarkList = JSON.parse(getCookie("GM_PDF_Bookmarks") || {}) || {};
              var data = bookMarkList[filename][ui.attr("key")];
              pdfCanvasContainer.scrollTop(data.y);
              pdfCanvasContainer.scrollLeft(data.x);
              zoomRange.val(data.zoom * 100);
              zoomRange.change();
              setTimeout(function(){
                showPage(data.page);
              }, 1);
            }
          });
        }
        var dropMenu = ui_dropMenu($(this), options, {id: "pdf-bookmark-menu"});
      });
      var bookmark = genIcon("star-empty");
      bookmark.css("margin-left", "1em");
      bookmark.appendTo(bookmarkBar);
      bookmark.click(function(){
        ui_prompt({
          target : $(this),
          id : "pdf-bookmark",
          inputs : {
            "Name" : ""
          },
          click : function(ev, inputs) {
            var bookMarkList = JSON.parse(getCookie("GM_PDF_Bookmarks") || "{}") || {};
            bookMarkList[filename] = bookMarkList[filename] || {};
            bookMarkList[filename][(inputs["Name"].val() || "").trim()] = {
              page : CURRENT_PAGE,
              zoom : zoom,
              x : pdfCanvasContainer.scrollLeft(),
              y : pdfCanvasContainer.scrollTop()
            }
            setCookie("GM_PDF_Bookmarks", JSON.stringify(bookMarkList), 9999999);
            bookmark.changeIcon("star");
          }
        });
      });
      PDF = pdf_doc;
      TOTAL_PAGES = PDF.numPages;
      // Load and render a specific page of the PDF
      function showPage(page_no) {
        PAGE_RENDERING_IN_PROGRESS = 1;
        CURRENT_PAGE = page_no;

        PDF.getPage(page_no).then(function(page) {
          // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
          var scale_required = pdfCanvas.get(0).width / page.getViewport(1).width;

          // Get viewport of the page at required scale
          var viewport = page.getViewport(scale_required);
          // Set canvas height
          pdfCanvas.get(0).height = viewport.height;
          if (WIDTH == null) {
            WIDTH = pdfCanvas.get(0).width;
          }
          var renderContext = {
            canvasContext: CANVAS,
            viewport: viewport
          };
          // Render the page contents in the canvas
          page.render(renderContext).then(function() {
            PAGE_RENDERING_IN_PROGRESS = 0;
          });
        });
        current.val(page_no);
        bookmark.changeIcon("star-empty");
        var bookMarkList = JSON.parse(getCookie("GM_PDF_Bookmarks") || "{}") || {};
        if (bookMarkList[filename]) {
          for (var key in bookMarkList[filename]) {
            if (bookMarkList[filename][key].page == CURRENT_PAGE) {
              bookmark.changeIcon("star");
              break;
            }
          }
        }
      }
      controlBar.empty();
      var previous = genIcon("backward").appendTo(controlBar);
      previous.click(function() {
        if(CURRENT_PAGE != 1)
          showPage(--CURRENT_PAGE);
        current.val(CURRENT_PAGE);
      });
      // Next page of the PDF

      var current = genInput({
        parent : controlBar,
        type : "number",
        placeholder : "Page #",
        style : {color : "black", width : "100px", "font-size" : "1em"}
      });
      current.val(CURRENT_PAGE);
      current.change(function(){
        CURRENT_PAGE = Math.round(Number($(this).val()) || 0);
        CURRENT_PAGE = Math.min(Math.max(CURRENT_PAGE, 0), TOTAL_PAGES);
        showPage(CURRENT_PAGE);
      });

      var next = genIcon("forward").appendTo(controlBar);
      next.click(function() {
        if(CURRENT_PAGE != TOTAL_PAGES)
          showPage(++CURRENT_PAGE);
        current.val(CURRENT_PAGE);
      });

      var zoomContainer = $("<div>").appendTo(controlBar);
      zoomContainer.addClass("flexaround");
      zoomContainer.css("width", "auto");

      var zoomOut = genIcon("zoom-out").appendTo(zoomContainer);
      zoomOut.click(function(){
        app.attr("zoom", Math.max(parseInt(zoomRange.val()) - 25, 25));
        zoomRange.val(Math.max(parseInt(zoomRange.val()) - 25, 25));
        zoom = parseInt(app.attr("zoom")) / 100 || 1;
        pdfCanvas.get(0).width = Math.round(WIDTH * zoom);
        showPage(CURRENT_PAGE);
        zoomLabel.text(Math.round(zoom*100) + "%");
      });

      var maxZoom = 200;
      var type = "range";
      if (layout.mobile) {
        maxZoom = 1000;
        type = "number";
      }

      var zoomRange = genInput({
        parent : zoomContainer,
        type : type,
        min : 25,
        value : 100,
        step : 5,
        style : {"width": "100px", color : "black"},
        max : maxZoom
      }, 1);
      zoomRange.val(zoom * 100);
      zoomRange.change(function(){
        app.attr("zoom", $(this).val());
        zoom = parseInt(app.attr("zoom")) / 100 || 1;
        pdfCanvas.get(0).width = Math.round(WIDTH * zoom);
        showPage(CURRENT_PAGE);
        zoomLabel.text(Math.round(zoom*100) + "%");
      });
      var zoomIn = genIcon("zoom-in").appendTo(zoomContainer);
      zoomIn.click(function(){
        app.attr("zoom", Math.min(parseInt(zoomRange.val()) + 25, maxZoom));
        zoomRange.val(Math.min(parseInt(zoomRange.val()) + 25, maxZoom));
        zoom = parseInt(app.attr("zoom")) / 100 || 1;
        pdfCanvas.get(0).width = Math.round(WIDTH * zoom);
        showPage(CURRENT_PAGE);
        zoomLabel.text(Math.round(zoom*100) + "%");
      });

      var zoomLabel = $("<b>").appendTo(zoomContainer);
      zoomLabel.text(Math.round(zoom*100) + "%");
      // Show the first page
      showPage(1);
    }).catch(function(error) {
      // If error re-show the upload button
      alert(error.message);
    });
  }
  return div;
});
