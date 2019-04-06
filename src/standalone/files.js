var _deleting = false;
var _authToken;
var _lastFilePicker = "Local";
var _localAuth = false;
var _authTokenCloud;
var _lastSamplePick;
var _audioPreview;

sync.render("ui_filePicker", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var navBar = genNavBar(null, "flex");
  navBar.addClass("fit-x flex");
  navBar.appendTo(div);
  if (!scope.filter || scope.filter == "img" || (scope.filter instanceof Object && util.contains(scope.filter, "img"))) {
    navBar.generateTab("Sample Content", "folder-open", function(parent) {
      var imgList = $("<div>").appendTo(parent);
      imgList.addClass("flexcolumn flex");

      if (!layout.mobile) {
        imgList.on("dragover", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (!$("#"+app.attr("id")+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : div,
              id : app.attr("id")+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none", "z-index" : "1000000000000"}
            });
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("z-index", util.getMaxZ(".ui-popout")+1);
            olay.css("font-size", "2em");
            olay.append("<b>Drop to Upload</b>");
          }
        });
        imgList.on('drop', function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          var dt = ev.originalEvent.dataTransfer;

          if (dt.getData("Text")) {
            var img = new Image();
            img.src = dt.getData("Text");
            img.onload = function(){
              custom.val($(this).attr("src"));
              custom.change();
            }
          }
          layout.coverlay(app.attr("id")+"-drag-overlay");
        });

        imgList.on("dragleave", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          layout.coverlay(app.attr("id")+"-drag-overlay");
        });
        imgList.mouseout(function(){
          layout.coverlay(app.attr("id")+"-drag-overlay");
        });
      }

      var navCategory = genNavBar(null, "flex", "4px");
      navCategory.addClass("fit-x flex");
      navCategory.removeClass("flexcolumn");
      navCategory.addClass("flexrow");
      $(navCategory.children()[0]).removeClass("flexrow").addClass("flexcolumn subtitle middle");
      navCategory.appendTo(imgList);
      for (var index in util.art) {
        function tabWrap(index) {
          navCategory.generateTab(index, "", function(prnt) {
            prnt.css("position", "relative");
            prnt.css("overflow", "auto");

            _lastSamplePick = index;
            var rows = $("<div>").appendTo(prnt);
            rows.addClass("flexrow flexwrap fit-x");
            rows.css("position", "absolute");

            for (var i in util.art[index]) {
              var imgClick = $("<img>").appendTo(rows);
              imgClick.addClass("outline hover2");
              imgClick.css("cursor", "pointer");
              if (index == "Icons" || index == "Nouns") {
                imgClick.css("width", "48px");
                imgClick.css("height", "48px");
              }
              else {
                imgClick.css("height", "128px");
                rows.addClass("flexaround flex");
              }
              if (util.art[index][i] instanceof Object) {
                imgClick.attr("src", util.art[index][i].src);
              }
              else {
                imgClick.attr("src", "/content/icons/"+util.art[index][i]);
              }
              imgClick.click(function(){
                custom.val($(this).attr("src"));
                custom.change();
              });
            }
            $("<div>").addClass("flex").appendTo(prnt);
            if (index == "Nouns") {
              var namePlate = $("<div>").appendTo(prnt);
              namePlate.addClass("subtitle bold flexmiddle alttext outline");
              namePlate.css("background-color", "rgba(0,0,0,0.8)");
              namePlate.append("<a href='/content/nouns/credits.txt' target='_' class='lrpadding lrmargin'>Art by : The Noun Project</a>");
            }
            if (index == "Sci-fi") {
              var namePlate = $("<div>").appendTo(prnt);
              namePlate.addClass("subtitle bold flexmiddle alttext outline");
              namePlate.css("background-color", "rgba(0,0,0,0.8)");
              namePlate.append("<a href='http://thompsonpeters.com/eote/maps/' target='_' class='lrpadding lrmargin'>Art by : Peter Thompson,<br> check out his site!</a>");

              var imgClick = $("<img>").appendTo(namePlate);
              imgClick.addClass("round");
              imgClick.attr("src", "/content/peter/peter.png");
              imgClick.css("width", "64px");
              imgClick.css("height", "64px");
            }
            if (index == "Area") {
              var namePlate = $("<div>").appendTo(prnt);
              namePlate.addClass("subtitle bold flexmiddle alttext outline");
              namePlate.css("background-color", "rgba(0,0,0,0.8)");
              namePlate.append("<a href='https://www.patreon.com/blueswordgames' target='_' class='lrpadding lrmargin'>Art by : Blue Sword Games,<br> check out his patreon!</a>");

              var imgClick = $("<img>").appendTo(namePlate);
              imgClick.addClass("round");
              imgClick.attr("src", "/content/bluesword/bluesword.jpg");
              imgClick.css("width", "64px");
              imgClick.css("height", "64px");

            }
            if (index == "Dungeons") {
              var namePlate = $("<div>").appendTo(prnt);
              namePlate.addClass("subtitle bold flexmiddle alttext outline");
              namePlate.css("background-color", "rgba(0,0,0,0.8)");
              namePlate.append("<a href='https://www.patreon.com/elventower' target='_' class='lrpadding lrmargin'>Art by : Elven Tower Cartography,<br> check out his patreon!</a>");

              var imgClick = $("<img>").appendTo(namePlate);
              imgClick.attr("src", "/content/etc/etc.png");
              imgClick.css("width", "64px");
              imgClick.css("height", "64px");
            }
            if (index == "Worldmaps") {
              var namePlate = $("<div>").appendTo(prnt);
              namePlate.addClass("subtitle bold flexmiddle alttext outline");
              namePlate.css("background-color", "rgba(0,0,0,0.8)");
              namePlate.append("<a href='https://arsheesh.deviantart.com/art/A-Free-Fantasy-Map-294623008' target='_' class='lrpadding lrmargin'>Art by : Arsheesh,<br> check out his deviantart!</a>");

              var imgClick = $("<img>").appendTo(namePlate);
              imgClick.attr("src", "https://a.deviantart.net/avatars/a/r/arsheesh.png?5");
              imgClick.css("width", "64px");
              imgClick.css("height", "64px");
            }
          });
        }
        tabWrap(index);
      }
      navCategory.selectTab(_lastSamplePick || "Icons");

      _lastFilePicker = null;
    });
  }
  //navBar.generateTab("Cloud", "cloud", function(parent) {parent.append("<b>Coming Soon!</b>"); _lastFilePicker = "Cloud";});
  if (!layout.mobile) {
    navBar.generateTab("Local", "inbox", function(parent) {
      sync.render("ui_fileBrowser")(obj, app, {
        filter : scope.filter,
        change : function(ev, ui, value) {
          custom.val(value);
          custom.change();
        }
      }).appendTo(parent);

      _lastFilePicker = "Local";
    });
  }

  var customWrap = $("<div>").appendTo(div);
  customWrap.addClass("flexrow subtitle");
  if (scope.hideURL) {
    customWrap.hide();
  }
  var custom = genInput({
    parent : customWrap,
    placeholder : "Direct URL",
    value : scope.value,
  });
  custom.addClass("flex");
  custom.change(function(ev){
    if (scope.change && scope.change instanceof Function) {
      var path = $(this).val().split("\\");
      var name = path[path.length-1].split("/")[path[path.length-1].split("/").length-1];
      var finalPath = "";
      for (var i in path) {
        finalPath += path[i];
        if (i < path.length-1) {
          finalPath += "/";
        }
      }
      scope.change(ev, $(this), finalPath, name);
    }
  });

  var button = $("<div>").appendTo(customWrap);
  button.addClass("background hover2 outline alttext flexmiddle spadding");
  button.css("font-size", "1.2em");
  button.text("Clear/Delete");
  button.click(function(){
    custom.val("");
    custom.change();
  });

  navBar.selectTab(_lastFilePicker || "Sample Content");

  return div;
});

sync.render("ui_fileBrowser", function(obj, app, scope) {
  scope = scope || {width : app.attr("width"), height : app.attr("height"), fontsize : app.attr("fontsize")};

  game.locals["localFolders"] = game.locals["localFolders"] || sync.obj();
  game.locals["localFolders"].data = game.locals["localFolders"].data || {};
  var fileSource = game.locals["localFolders"];
  var route = "http://127.0.0.1:30000";
  var authToken = "";
  game.user = {token : ""};
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");


  if (!layout.mobile) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
        var olay = layout.overlay({
          target : div,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        olay.append("<b>Drop to Upload</b>");
      }
    });
    div.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer;
      var files = dt.files;

      if (files.length) {
        var uploadFiles = [];
        var successes = {};
        for (var i=0; i<files.length; i++) {
          function readFile(file, index) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(ev) {
              successes[index] = true;
              uploadFiles.push({name : files[index].name, blob : ev.target.result.split(",")[1], path : "/"});
              for (var j=0; j<files.length; j++) {
                if (!successes[j]) {
                  return false;
                }
              }
              var id;
              if (upload[0].files.length > 1) {
                sendAlert({text : "Uploading files...", duration : -1, id : "file-chunk"});
              }
              else {
                id = "file-"+index;
                sendAlert({text : "Uploading " + files[index].name + "...", duration : -1, id : "file-"+index});
              }
              $.ajax({
                type: 'POST',
                url: '/upload',
                data: {upload : uploadFiles, userID : getCookie("UserID"), auth : authToken},
                error: function(code) {
                  console.log(code);
                  _deleting = false;
                  sendAlert({text : "Uploading Failed : " + code.responseText});
                  layout.coverlay($(".file-chunk"), 1000);
                  layout.coverlay(id, 1000);
                },
                dataType: 'json',
                success: function(resData) {
                  _deleting = false;
                  buildList(resData);
                  sendAlert({text : "Upload Successful"});
                  layout.coverlay($(".file-chunk"), 1000);
                  layout.coverlay(id, 1000);
                }
              });
            };
          }
          readFile(files[i], i);
        }
      }
      else if (dt.getData("Text")) {
        var img = new Image();
        img.src = dt.getData("Text");
        img.onload = function(){
          if (scope.change && scope.change instanceof Function) {
            var path = img.src.split("\\");
            var name = path[path.length-1].split("/")[path[path.length-1].split("/").length-1];

            scope.change(ev, $(this), img.src, name);
          }
        }
      }
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

    div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
    div.mouseout(function(){
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
  }


  var buttonDiv = $("<div>");
  buttonDiv.addClass("flexrow flexbetween subtitle foreground outline fit-x");

  /*var search = genInput({
    placeholder : "Search",
    parent : buttonDiv
  });*/

  var rootControls = $("<div>").appendTo(buttonDiv);
  rootControls.addClass("flexrow flexmiddle");

  var maxFile = $("<div>").appendTo(buttonDiv);
  maxFile.addClass("flex flexrow flexmiddle lrmargin");

  var upload = genInput({
    type : "file",
    parent : buttonDiv,
  }).addClass("white outline");
  upload.css("opacity", "0");
  upload.css("width", "1px");

  upload.change(function(){
    if (upload.attr("path")) {
      var path = upload.attr("path").split("\\");
      var finalPath = "";
      for (var i in path) {
        finalPath += path[i];
        if (i < path.length-1) {
          finalPath += "/";
        }
      }

      var uploadFiles = [];
      var successes = {};
      for (var i=0; i<upload[0].files.length; i++) {
        function readFile(file, index) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function(ev) {
            successes[index] = true;
            uploadFiles.push({name : upload[0].files[index].name, blob : ev.target.result.split(",")[1], path : finalPath});
            for (var j=0; j<upload[0].files.length; j++) {
              if (!successes[j]) {
                return false;
              }
            }
            var id;
            if (upload[0].files.length > 1) {
              sendAlert({text : "Uploading files...", duration : -1, id : "file-chunk"});
            }
            else {
              id = "file-"+index;
              sendAlert({text : "Uploading " + upload[0].files[index].name + "...", duration : -1, id : "file-"+index});
            }
            $.ajax({
              type: 'POST',
              url: '/upload',
              data: {upload : uploadFiles, userID : getCookie("UserID"), auth : authToken},
              error: function(code) {
                _deleting = false;
                sendAlert({text : "Uploading Failed : " + code.responseText});
                layout.coverlay($(".file-chunk"), 1000);
                layout.coverlay(id, 1000);
              },
              dataType: 'json',
              success: function(resData) {
                _deleting = false;
                buildList(resData);
                sendAlert({text : "Upload Successful"});
                layout.coverlay($(".file-chunk"), 1000);
                layout.coverlay(id, 1000);
              }
            });
            upload.removeAttr("path");
            upload.val('');
          };
        }
        readFile(upload[0].files[i], i);
      }
    }
  });

  var listWrap = $("<div>").appendTo(div);
  listWrap.addClass("flex");
  listWrap.css("position", "relative");
  listWrap.css("overflow-y", "auto");
  listWrap.css("overflow-x", "hidden");
  listWrap.css("cursor", "pointer");
  listWrap.click(function(ev){
    upload.click();
    ev.stopPropagation();
    ev.preventDefault();
  });

  var list = $("<div>").appendTo(listWrap);
  list.addClass("fit-x flexcolumn flexwrap");
  list.css("position", "absolute");
  list.click(function(ev){
    ev.stopPropagation();
    ev.preventDefault();
  });

  var files = [];
  function buildList(data){
    _localAuth = data;

    list.empty();
    function buildPlate(data, depth){
      var listWrap = $("<div>");
      listWrap.addClass("flexcolumn");
      listWrap.css("color", "#333");

      var allListWrap = $("<div>");
      allListWrap.addClass("flexcolumn");

      var newFolder;
      if (data.path) {
        newFolder = genIcon("folder-close");
      }
      else {
        newFolder = genIcon("folder-close", "New Folder");
        newFolder.addClass("subtitle");
      }
      newFolder.addClass("alttext lrpadding");
      newFolder.attr("filename", data.path);
      newFolder.css("color", "white");
      newFolder.click(function(ev){
        var pathToFile = $(this).attr("filename") || "\\";
        ui_prompt({
          target : $(this),
          id : "hover",
          inputs : {"Folder Name" : {placeholder : "Enter Folder Name"}},
          click : function(ev, inputs) {
            if (inputs["Folder Name"].val()) {
              sendAlert({text : "Creating..."});
              _deleting = true;
              $.ajax({
                url: '/create',
                data: {path : pathToFile+inputs["Folder Name"].val(), userID : getCookie("UserID"), auth : authToken},
                error: function(code) {
                  console.log(code);
                  _deleting = false;
                  sendAlert({text : "Creation Failed"});
                },
                dataType: 'json',
                success: function(resData) {
                  _deleting = false;
                  buildList(resData);
                  sendAlert({text : "Created Folder" + "\\custom\\" + pathToFile + inputs["Folder Name"].val()});
                }
              });
            }
          }
        });
        ev.stopPropagation();
        ev.preventDefault();
      });

      var folderList = $("<div>").appendTo(allListWrap);
      folderList.addClass("flexcolumn");

      var list = $("<div>").appendTo(allListWrap);
      list.addClass("flexcolumn fileContent");
      list.attr("path", data.path);
      list.sortable({
        connectWith : ".fileContent",
        update : function(ev, ui) {
          ev.stopPropagation();
          ev.preventDefault();

          var ui = $(ui.item);
          var isChild = false;
          list.children().each(function(){
            if ($(this).attr("path") == ui.attr("path")) {
              isChild = true;
            }
          });
          if (!isChild) {
            var newPath = list.attr("path");

            var fileName = ui.attr("filename").replace(ui.attr("path"), "");
            var directPath = ui.attr("filename");
            var slash = "";
            if (directPath[0] != "\\" && directPath[0] != "/") {
              directPath = "\\" + directPath;
            }
            else {
              slash = "\\";
            }
            $.ajax({
              url: '/move',
              data : {userID : getCookie("UserID"), auth : authToken, path : directPath, newPath : newPath+slash+fileName},
              error: function(code) {
                console.log(code);
                if (code.responseText) {
                  sendAlert({text : code.responseText});
                }
                $.ajax({
                  url: '/files',
                  error: function(code) {
                    console.log(code);
                  },
                  dataType: 'json',
                  success: function(resData) {
                    buildList(resData);
                  },
                  type: 'GET'
                });
              },
              dataType: 'json',
              success: function(resData) {
                buildList(resData);
              }
            });
          }
          else {
            $(ui.item).remove();
          }
        }
      });

      if (data.path) {
        var folderName = data.path;
        folderName = folderName.substring(0, folderName.length-1);
        folderName = folderName.split("\\");
        folderName = folderName[folderName.length-1];

        var folderPlate = $("<div>").appendTo(listWrap);
        folderPlate.addClass("flexrow flexbetween lrpadding alttext bold hover2");
        folderPlate.attr("filename", data.path);
        folderPlate.css("text-align", "left");

        var name = genIcon("", folderName).appendTo(folderPlate);
        name.addClass("subtitle");

        var optionWrap = $("<div>").appendTo(folderPlate);
        optionWrap.addClass("flexrow");

        var uploadLabel = genIcon("cloud-upload").appendTo(optionWrap);
        uploadLabel.attr("filename", data.path);
        uploadLabel.attr("title", "Upload file to folder");
        uploadLabel.click(function(ev){
          upload.attr("path", $(this).attr("filename"));
          upload.click();
          ev.stopPropagation();
          ev.preventDefault();
        });

        newFolder.appendTo(optionWrap);
        newFolder.attr("title", "Creates a new folder in this folder");

        var del = genIcon("trash").appendTo(optionWrap);
        del.attr("filename", data.path);
        del.click(function(ev){
          var pathToFile = $(this).attr("filename");
          if (!_deleting) {
            if (pathToFile[0] != "\\" && pathToFile[0] != "/") {
              pathToFile = "\\" + pathToFile;
            }
            ui_prompt({
              target : $(this),
              confirm : "Delete Folder",
              inputs : {"Confirmation" : {placeholder : "Type 'Delete' to confirm"}},
              click : function(ev, inputs) {
                if (inputs["Confirmation"].val() == "Delete") {
                  _deleting = true;
                  sendAlert({text : "Deleting..."});
                  folderPlate.remove();
                  $.ajax({
                    url: '/delete',
                    data : {userID : getCookie("UserID"), auth : authToken, path : pathToFile},
                    error: function(code) {
                      console.log(code);
                      _deleting = false;
                      sendAlert({text : "Deletion Failed..."});
                    },
                    dataType: 'json',
                    success: function(resData) {
                      _deleting = false;
                      buildList(resData);
                      sendAlert({text : "Deleted Successfully..."});
                    }
                  });
                }
              }
            });
          }
          else {
            sendAlert({text : "Deletion in progress"});
          }
          ev.stopPropagation();
          ev.preventDefault();
        });

        if (!layout.fileControls) {
          uploadLabel.hide();
          newFolder.hide();
          del.hide();
        }

        folderPlate.click(function(){
          if (list.is(":visible")) {
            $(this).removeClass("highlight outlinebottom");
            $(this).addClass("background");
            allListWrap.hide();
            delete fileSource.data[$(this).attr("filename")];
          }
          else {
            fileSource.data[$(this).attr("filename")] = true;
            $(this).removeClass("background");
            $(this).addClass("highlight outlinebottom");
            allListWrap.show();
          }
        });

        folderList.css("margin-left", "1em");

        list.css("margin-left", "1em");
        list.css("margin-bottom", "4px");
        list.css("min-height", "1px");
        if (fileSource.data[data.path]) {
          folderPlate.addClass("highlight outlinebottom");
          allListWrap.show();
        }
        else {
          folderPlate.addClass("background");
          allListWrap.hide();
        }
      }
      else {
        if (rootControls.children().length <= 1) {
          newFolder.appendTo(rootControls);
          newFolder.removeClass("subtitle");

          var uploadLabel = genIcon("cloud-upload", "Upload").appendTo(rootControls);
          uploadLabel.addClass("alttext lrpadding");
          uploadLabel.attr("filename", "/");
          uploadLabel.css("color", "white");
          uploadLabel.click(function(ev){
            upload.attr("path", $(this).attr("filename"));
            upload.click();
            ev.stopPropagation();
            ev.preventDefault();
          });

          if (!layout.fileControls) {
            uploadLabel.hide();
            newFolder.hide();
          }

          var uploadLabel = genIcon("folder-open", "Open In File Browser").appendTo(rootControls);
          uploadLabel.addClass("alttext lrpadding");
          uploadLabel.attr("filename", "/");
          uploadLabel.css("color", "white");
          uploadLabel.click(function(ev){
            $.ajax({
              url: '/openFiles',
              type : "GET"
            });
          });

          var search = $("<div>")//.appendTo(rootControls);
          search.addClass("flexrow fit-x flexmiddle");

          var searchIcon = genIcon("search").appendTo(search);
          searchIcon.addClass("lrpadding alttext");
          searchIcon.attr("title", "Search");

          var searchInput = genInput({
            classes : "flex",
            parent : search,
            placeholder : "Search Terms"
          }).addClass("subtitle");
          searchInput.keyup(function(ev){
            var str = ($(this).val() || "").toLowerCase();
            list.children().each(function(){
              if ($(this).attr("index") && str) {
                resourceWrap.hide();
                var ent = getEnt($(this).attr("index"));
                if (ent) {
                  var name = (sync.rawVal(ent.data.info.name) || "").toLowerCase();
                  var hide = false;
                  for (var tag in ent.data.tags) {
                    if (tag.match(String(str))) {
                      hide = true;
                      break;
                    }
                  }
                  if (name.match(String(str))) {
                    hide = true;
                  }
                  if (!hide) {
                    $(this).hide();
                  }
                  else {
                    $(this).show();
                  }
                }
              }
              else {
                resourceWrap.show();
                $(this).fadeIn();
              }
            });
          });
        }
      }
      allListWrap.appendTo(listWrap);

      for (var i in data.c) {
        var fileData = data.c[i];
        if (fileData instanceof Object) {
          buildPlate(fileData, (depth || 0) + 1).appendTo(folderList);
        }
        else {
          var fileName = fileData;
          fileName = fileName.split("\\");
          fileName = fileName[fileName.length-1];

          var fileWrap = $("<div>").appendTo(list);
          fileWrap.addClass("flexrow lrpadding outlinebottom white");
          fileWrap.attr("filename", fileData);
          fileWrap.attr("path", data.path);
          fileWrap.css("text-align", "left");
          fileWrap.css("font-family", "Scaly Sans");
          if (i == data.c.length-1) {
            fileWrap.removeClass("outlinebottom");
          }
          fileWrap.contextmenu(function(ev){
            var ui = $(this);
            var fileName = ui.attr("filename").replace(ui.attr("path"), "");
            var directPath = ui.attr("filename");
            ui_prompt({
              target : $(this),
              inputs : {
                "Rename" : {value : fileName.split(".")[0], style : {"width" : "300px", display : "block"}},
              },
              click : function(ev, inputs){
                if (inputs["Rename"].val() && inputs["Rename"].val().trim() && !inputs["Rename"].val().match("\\.\\.")) {
                  var slash = "";
                  if (directPath[0] != "\\" && directPath[0] != "/") {
                    directPath = "\\" + directPath;
                  }
                  else {
                    slash = "\\";
                  }
                  $(ui.children()[2]).text("Renaming...");
                  $.ajax({
                    url: '/move',
                    data : {userID : getCookie("UserID"), auth : authToken, path : directPath, newPath : directPath.replace(fileName, inputs["Rename"].val()+"."+fileName.split(".")[1])},
                    error: function(code) {
                      console.log(code);
                      if (code.responseText) {
                        sendAlert({text : code.responseText});
                      }
                      $.ajax({
                        url: '/files',
                        error: function(code) {
                          console.log(code);
                        },
                        dataType: 'json',
                        success: function(resData) {
                          buildList(resData);
                        },
                        type: 'GET'
                      });
                    },
                    dataType: 'json',
                    success: function(resData) {
                      buildList(resData);
                    }
                  });
                }
              }
            });

            ev.stopPropagation();
            ev.preventDefault();
          });
          if (scope.change && scope.change instanceof Function) {
            fileWrap.addClass("hover2");
            fileWrap.click(function(ev){
              pathToFile = $(this).attr("filename");
              if (pathToFile[0] != "\\" && pathToFile[0] != "/") {
                pathToFile = "\\" + pathToFile;
              }
              var path = $(this).attr("filename").split("\\");
              var name = path[path.length-1].split("/")[path[path.length-1].split("/").length-1];
              scope.change(ev, $(this), ""+game.user.token+"\\custom\\"+pathToFile, name);
            });
          }

          /*fileWrap.on("dragstart", function(ev){
            var dt = ev.originalEvent.dataTransfer;
            var str = "";
            var transfer = $(this).attr("filename").split("\\");
            for (var i in transfer) {
              str += transfer[i] + "/";
            }
            dt.setData("Text", "http://127.0.0.1:28563"+str.substring(0, str.length-1));
          });*/

          var str = "";
          var transfer = fileData.split("\\");
          for (var i in transfer) {
            str += transfer[i];
            if (i != transfer.length-1) {
              str += "/";
            }
          }
          var mediaType = util.mediaType(str.toLowerCase());
          var imgPreview = $("<img>").appendTo(fileWrap);
          imgPreview.addClass("hover2");
          imgPreview.attr("type", mediaType);
          imgPreview.css("font-size", scope.fontsize || "20px");
          imgPreview.css("height", scope.height || "25px");
          imgPreview.css("width", scope.width || "auto");
          imgPreview.mousedown(function(ev){
            ev.stopPropagation();
          });
          if (!data.path) {
            imgPreview.attr("srcFile", "\\custom\\"+str);
          }
          else {
            imgPreview.attr("srcFile", "\\custom"+str);
          }
          if (mediaType == "img") {
            imgPreview.attr("src", imgPreview.attr("srcFile"));
            fileWrap.attr("src", imgPreview.attr("srcFile"));
          }
          else if (mediaType == "audio") {
            var audioPreview = genIcon("volume-up");
            audioPreview.attr("src", imgPreview.attr("srcFile"));
            audioPreview.click(function(){
              if (_audioPreview && _audioPreview.src == $(this).attr("src")) {
                if (!_audioPreview.paused) {
                  _audioPreview.pause();
                }
                else {
                  _audioPreview.play();
                }
              }
              else {
                if (_audioPreview) {
                  _audioPreview.pause();
                }
                _audioPreview = new Audio($(this).attr("src"));
                _audioPreview.volume = 0.2;
                _audioPreview.oncanplay = function(){
                  if (!_audioPreview.loadcheck) {
                    _audioPreview.currentTime = Math.round((_audioPreview.duration || 10)/2);
                    _audioPreview.loadcheck = true;
                    _audioPreview.play();
                  }
                }
              }
            });
            imgPreview.replaceWith(audioPreview);
          }
          else if (mediaType == "video") {
            imgPreview.replaceWith(genIcon("media"));
          }
          else if (mediaType == "pdf") {
            imgPreview.replaceWith(genIcon("book"));
          }
          else {
            imgPreview.replaceWith(genIcon("list-alt"));
          }
          if (mediaType && scope.filter && (scope.filter != mediaType.toLowerCase() || (scope.filter instanceof Object && !util.contains(scope.filter, mediaType.toLowerCase())))) {
            fileWrap.removeClass("hover2");
            fileWrap.addClass("subtitle");
            fileWrap.css("background-color", "rgb(235,235,228)");
            imgPreview.css("height", "15px");
          }
          else {
            if (assetTypes[mediaType]) {
              imgPreview.click(function(ev){
                var path = $(this).attr("src");
                if (path[0] == "\\") {
                  path = path.replace("\\", "/");
                }
                assetTypes[imgPreview.attr("type")].preview(ev, $(this), path);
                ev.stopPropagation();
                ev.preventDefault();
              });

              imgPreview.contextmenu(function(ev){
                var path = $(this).attr("src");
                if (path[0] == "\\") {
                  path = path.replace("\\", "/");
                }
                assetTypes[$(this).attr("type")].contextmenu(ev, $(this), path);
                ev.stopPropagation();
                ev.preventDefault();
                return false;
              });
            }
          }

          fileWrap.append("<div class='flex'></div>");
          var name = genIcon("", fileName).appendTo(fileWrap);
          name.addClass("flexmiddle");
          name.css("max-width", "80%");
          name.css("overflow", "hidden");

          if (fileName.length > 30) {
            name.addClass("subtitle");
            name.attr("title", fileName);
          }
          fileWrap.append("<div class='flex'></div>");

          var del = genIcon("trash").appendTo(fileWrap);
          del.addClass("destroy");
          del.attr("filename", fileData);
          del.click(function(ev){
            var pathToFile = $(this).attr("filename");
            if (!_deleting) {
              if (pathToFile[0] != "\\" && pathToFile[0] != "/") {
                pathToFile = "\\" + pathToFile;
              }
              var parent = $(this).parent();
              ui_prompt({
                target : $(this),
                confirm : "Confirm Delete",
                click : function(ev, inputs) {
                  _deleting = true;
                  parent.remove();
                  sendAlert({text : "Deleting..."});
                  $.ajax({
                    url: '/delete',
                    data : {userID : getCookie("UserID"), auth : authToken, path : pathToFile},
                    error: function(code) {
                      console.log(code);
                      _deleting = false;
                      sendAlert({text : "Deletion Failed..."});
                    },
                    dataType: 'json',
                    success: function(resData) {
                      _deleting = false;
                      buildList(resData);
                      sendAlert({text : "Deletion Successful"});
                    }
                  });
                }
              });
            }
            else {
              sendAlert({text : "Deletion in progress"});
            }
            ev.stopPropagation();
            ev.preventDefault();
          });
          if (!layout.fileControls) {
            del.hide();
          }
        }
      }
      return listWrap;
    }
    buildPlate(data).removeClass("outline").appendTo(list);
    maxFile.empty();
    if (data.size) {
      maxFile.append(sync.render("ui_progressBar")(obj || {data : {}}, app, {percentage : data.size, max : data.max, col : "rgb(@:int(200*@percentage),@:int(200-200*@percentage),0)"}).removeClass("fit-x").addClass("flex"));
      var label = $("<div class='alttext flexmiddle lrmargin' style='position : relative;'><div style='position : absolute; text-overflow: ellipsis; width : 50px;'>"+Math.round(data.size/data.max*100)+"%</div></div>").appendTo(maxFile);
      label.css("transition", "width 0.5s");
      label.css("width", "50px");
      maxFile.hover(function(){
        label.css("width", "120px");
        label.empty();
        label.append("<div style='position : absolute; text-overflow: ellipsis; width : 120px;'>"+Math.round(data.size/1024/1024) + "mb / " + "100mb"+"</div>");
        label.text();
      },
      function(){
        label.css("width", "50px");
        label.empty();
        label.append("<div style='position : absolute; text-overflow: ellipsis; width : 50px;'>"+Math.round(data.size/data.max*100)+"%</div>");
      });
    }
  }


  var loader = $("<div>").appendTo(list);
  loader.addClass("fit-xy flexcolumn flexmiddle lpadding");

  var title = $("<text>").appendTo(loader);
  title.addClass("flexmiddle flex middle");
  title.css("font-size", "2em");
  title.css("-webkit-text-stroke-width", "2px");
  title.text("Establishing Connection...");

  var loading = $("<div class='loader' style='height : 50px; width : 50px;'></div>").appendTo(loader);


  var retryButton;
  function attempConnect(){
    $.ajax({
      url: '/files',
      error: function(code) {
        console.log(code);
      },
      dataType: 'json',
      success: function(resData) {
        buildList(resData);
      },
      type: 'GET'
    });
  }
  var refresh = genIcon("refresh", "Refresh").appendTo(rootControls);
  refresh.addClass("alttext lrpadding");
  refresh.css("color", "white");
  refresh.click(function(){
    sendAlert({text : "Refreshing"});
    route = _localAuth;
    attempConnect();
  });
  if (_localAuth) {
    list.addClass("foreground outline");
    $.ajax({
      url: '/files'+"?userID="+getCookie("UserID")+"&auth="+authToken,
      error: function(code) {
        console.log(code);
      },
      dataType: 'json',
      success: function(resData) {
        buildList(resData);
      },
      type: 'GET'
    });
    buildList(_localAuth);
  }
  else {
    attempConnect();
  }

  buttonDiv.appendTo(div);

  return div;
});

sync.render("ui_gameCtrl", function(obj, app, scope){
  if (!obj) {
    obj = game.config;
  }
  var div = $("<div>");
  var data = {};
  if (obj && obj.data) {
    data = obj.data;
  }

  var columns = $("<div>").appendTo(div);
  columns.addClass("flexrow flexbetween");

  var gameConfigCol = $("<div>").appendTo(columns);
  gameConfigCol.css("flex", "1");

  var customScripts = $("<div>").appendTo(gameConfigCol);
  customScripts.addClass("flexcolumn");

  var addScript = genIcon("plus", "Add Extension")//.appendTo(customScripts);
  addScript.click(function(){
    var imgList = sync.render("ui_filePicker")(obj, app, {
      filter : "js",
      change : function(ev, ui, value){
        game.config.data.scripts = game.config.data.scripts || [];
        game.config.data.scripts.push(value);
        obj.sync("updateConfig");
        sync.updateApp(app, game.config);
        layout.coverlay("icons-picker");
      }
    });
    var pop = ui_popOut({
      target : $(this),
      prompt : true,
      id : "icons-picker",
      align : "top",
      style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
    }, imgList);
    pop.resizable();
  });

  for (var i in game.config.data.scripts) {
    var scriptName = $("<b class='subtitle'>"+game.config.data.scripts[i]+"</b>").appendTo(customScripts);

    var remove = genIcon("remove").appendTo(scriptName);
    remove.addClass("destroy");
    remove.attr("index", i);
    remove.click(function(){
      $(this).parent().remove();
      game.config.data.scripts = game.config.data.scripts || [];
      game.config.data.scripts.splice($(this).attr("index"), 1);
      obj.sync("updateConfig");
    });
  }


  var button = $("<button>").appendTo(gameConfigCol);
  button.addClass("focus");
  button.append("RESTORE ORIGNAL TEMPLATES");
  button.click(function(){
    if (game.locals["gameList"][game.templates.identifier]) {
      runCommand("updateTemplate", duplicate(game.locals["gameList"][game.templates.identifier]));
    }
    else {
      var choices = $("<div>");
      choices.addClass("flexcolumn fit-x");

      for (var i in game.locals["gameList"]) {
        var option = $("<button>").appendTo(choices);
        option.addClass("fit-x");
        option.attr("index", i);
        option.text(sync.rawVal(game.locals["gameList"][i].info.name));
        option.click(function(){
          runCommand("updateTemplate", duplicate(game.locals["gameList"][$(this).attr("index")]));
          layout.coverlay("restore");
        });
      }

      ui_popOut({
        target : $(this),
        id : "restore",
        style : {"width" : "400px", "height" : "400px"}
      }, choices);
    }
  });

  if (!game.config.data.offline) {
    var save = $("<button>")//.appendTo(gameConfigCol);
    save.attr("title", "Edit in Offline Mode");
    save.append("Go Offline");
    save.click(function() {
      setCookie("offlineGame");
      runCommand("goOffline");
      layout.coverlay("game-options-popout");
    });
  }

  return div;
});
