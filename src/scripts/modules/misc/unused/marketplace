sync.render("ui_marketEntry", function(obj, app, scope) {
  var expanded = $("<div>");
  expanded.addClass("flex flexcolumn");

  var entry = scope.list[scope.index];

  $.ajax({
    url: '/retrieveUser?id='+entry.owner,
    error: function(code) {
      console.log(code);
    },
    dataType: 'json',
    success: function(data) {
      var usrPfl = sync.obj();
      usrPfl.data = data;

      var navBar = genNavBar("background alttext", "flex");
      navBar.addClass("flex fit-x");

      navBar.generateTab("Description", "book", function(parent){
        var tempObj = sync.dummyObj();
        tempObj.data = duplicate(entry.data);
        if (tempObj.data.info.notes.name != "url") {
          var viewPort = $("<div>").appendTo(parent);
          viewPort.addClass("flexcolumn flex padding");
          viewPort.css("overflow", "auto");

          var page = sync.render("ui_renderPage")(tempObj, app, {viewOnly : true});
          page.appendTo(viewPort);
        }
        else {
          setTimeout(function(){parent.append("<iframe src='"+sync.val(tempObj.data.info.notes)+"' width='"+(parent.width())+"' height='"+(parent.height())+"'>")}, 10);
        }
      });
      navBar.selectTab("Description");
      navBar.addClass("outlinebottom");
      navBar.appendTo(expanded);

      var iconWrap = $("<div>").appendTo(expanded);
      iconWrap.addClass("flexcolumn");
      iconWrap.append("<div class='background alttext'><b class='lrpadding'>Support this creator!</b></div>");

      var newApp = sync.newApp("ui_userProfile");
      newApp.attr("viewOnly", "true");
      newApp.attr("width", "64px");
      newApp.attr("height", "64px");
      newApp.attr("minimized", "true");
      newApp.addClass("fit-x");
      usrPfl.addApp(newApp);
      iconWrap.append(newApp);

      navBar.generateTab("Comments", "comment", function(parent){
        var commentList = $("<div>").appendTo(parent);
        commentList.addClass("flex flexcolumn flexmiddle");
        commentList.append("<b style='color : rgba(235,235,228)'>Loading Comments</b>");
        $.ajax({
          url: '/thread',
          error: function(code) {
            console.log(code);
            commentList.empty();
            commentList.append("<b style='color : rgba(235,235,228)'>No Comments Yet</b>");
          },
          dataType: 'json',
          data : {id : entry._uid},
          success: function(cData) {
            buildComments(cData)
          },
          type: 'GET'
        });

        function buildComments(cData) {
          commentList.empty();
          if (cData) {
            commentList.removeClass("flexmiddle");
            commentList.css("padding", "2em");

            var ratingDiv = $("<div>").appendTo(commentList)
            ratingDiv.addClass("flexbetween");
            ratingDiv.append("<b>Overall Rating</b>");
            ratingDiv.css("font-size", "1.5em");

            var rating = $("<i>No Rating</i>").appendTo(ratingDiv);
            var rTotal = 0;
            var upVotes = 0;
            var downVotes = 0;
            for (var user in cData.r) {
              rTotal += parseInt(cData.r[user]);
              if (parseInt(cData.r[user]) > 0) {
                upVotes++;
              }
              else if (parseInt(cData.r[user]) < 0) {
                downVotes++;
              }
            }
            if (rTotal > 0) {
              rating.text("Positive");
              rating.addClass("lrpadding outline highlight2 alttext");
            }
            else if (rTotal < 0) {
              rating.text("Negative");
            }

            for (var i in cData.c) {
              var commentData = cData.c[i];
              var commentWrap = $("<div>").appendTo(commentList);
              commentWrap.addClass("lightoutline");

              var name = $("<div class='flexbetween'><b>"+commentData.n+"</b></div>").appendTo(commentWrap);
              if (cData.r[commentData.o] == 1) {
                name.append(genIcon("thumbs-up", "Liked this"));
              }
              else if (cData.r[commentData.o] == -1) {
                name.append(genIcon("thumbs-down"));
              }
              commentWrap.append("<p class='lrpadding' style='font-size:0.8em;'>"+commentData.t+"</p>");
            }
          }
          else {
            commentList.append("<b style='color : rgba(235,235,228)'>No Comments Yet</b>");
          }
        }

        if (getCookie("UserID")) {
          var replyDiv = $("<div>").appendTo(parent);
          replyDiv.addClass("flexcolumn lightoutline");

          var titleDiv = $("<div>").appendTo(replyDiv);
          titleDiv.addClass("flexbetween");

          var comment = $("<b>Leave a Comment</b>").appendTo(titleDiv);

          var ratingDiv = $("<div>").appendTo(titleDiv);
          var thumbdown = genIcon("thumbs-down").appendTo(ratingDiv);
          thumbdown.click(function(){
            $.ajax({
              url: '/comment',
              error: function(code) {
                console.log(code);
              },
              dataType: 'json',
              data : {id : entry._uid, r : -1},
              success: function(cData) {
                buildComments(cData);
              },
              type: 'GET'
            });
          });

          var thumbup = genIcon("thumbs-up").appendTo(ratingDiv);
          thumbup.click(function(){
            $.ajax({
              url: '/comment',
              error: function(code) {
                console.log(code);
              },
              dataType: 'json',
              data : {id : entry._uid, r : 1},
              success: function(cData) {
                buildComments(cData);
              },
              type: 'GET'
            });
          });

          var textArea = $("<textarea>").appendTo(replyDiv);
          textArea.attr("placeholder", "");
          textArea.attr("maxlength", "255");
          textArea.css("width", "100%");
          textArea.css("height", "100px");

          var button = $("<button>").appendTo(replyDiv);
          button.addClass("fit-x");
          button.append("Post Comment");
          button.click(function(){
            if (textArea.val()) {
              $.ajax({
                url: '/comment',
                error: function(code) {
                  console.log(code);
                },
                dataType: 'json',
                data : {id : entry._uid, t : textArea.val()},
                success: function(cData) {
                  buildComments(cData);
                },
                type: 'GET'
              });
            }
          });
        }
      });
      navBar.generateTab("Suggestions", "link", function(parent){
        var commentList = $("<div>").appendTo(parent);
        commentList.addClass("flex flexcolumn");
        commentList.css("padding", "1em");

        $("<b>The Author Suggests</b>").appendTo(commentList);

        var suggestDiv = $("<div>").appendTo(commentList);
        suggestDiv.addClass("flexcolumn flexmiddle lightoutline");
        suggestDiv.css("padding", "2em");
        suggestDiv.append("<i>No Suggestions Yet</i>");
      });
    },
    type: 'GET'
  });

  return expanded;
});

sync.render("ui_marketListing", function(obj, app, scope) {
  var data = obj.data;
  var listing = data.listing;

  var marketDiv = $("<div>");
  marketDiv.addClass("flexrow outline");
  if (scope.mode == "list") {
    marketDiv.addClass("flexaround flexwrap");
  }
  marketDiv.css("overflow", "auto");

  for (var i in listing) {
    if (!scope.filter || listing[i].a == scope.filter && !listing[i].delist) {
      var obj = sync.dummyObj();
      obj.data = duplicate(listing[i].data);

      var wrapper = $("<div>").appendTo(marketDiv);
      wrapper.attr("index", i);
      if (!scope.mode) {
        wrapper.addClass("lrpadding");
      }

      if (!scope.ignoreGame) {
        var iconDiv = $("<div>");
        iconDiv.addClass("flexcolumn");

        for (var keyy in listing[i].g) {
          if (listing[i].g[keyy]) {
            var icon = $("<div>").appendTo(iconDiv);
            icon.addClass("outline");
            icon.css("min-width", "4em");
            if (game.locals["gameList"][listing[i].g[keyy]]) {
              icon.css("background-image", "url('"+game.locals["gameList"][listing[i].g[keyy]].info.img.current+"')");
            }
            else {
              icon.css("background-image", "url('/content/lock.png')");
            }
            icon.css("background-size", "contain");
            icon.css("background-repeat", "no-repeat");
            icon.css("background-position", "center");
            icon.css("width", "100%");
            icon.css("height", "2em");
          }
        }
        if (iconDiv.children().length == 0) {
          iconDiv.remove();
        }
      }

      var item = sync.render("ui_adventureCard")(obj, app, {label : iconDiv, mode : scope.mode}).appendTo(wrapper);
      item.attr("index", i);
      item.css("background-color", "white");
      item.click(function(){
        var ind = $(this).attr("index");

        marketDiv.children().each(function(){
          $($(this).children()[1]).remove();
          $(this).removeClass("highlight2");
        });
        $(this).parent().addClass("highlight2");
        var buttonDiv = $("<div>").appendTo($(this).parent());
        buttonDiv.addClass("flexrow fit-x");

        if (listing[ind].owner == getCookie("UserID")) {
          var del = $("<button class='focus flex'>De-List</button>").appendTo(buttonDiv);
          del.attr("title", "Removes this entry from the listing, this will cause all subscribers to lose access to their content");
          del.attr("id", listing[ind]._uid);
          del.attr("index", ind);
          del.click(function(){
            runCommand("deListAsset", {index : $(this).attr("index"), _t : listing[$(this).attr("index")].a});
            layout.coverlay("community-chest");
          });
        }
        var marketWrap = $("<div>");
        marketWrap.addClass("flexcolumn flex");

        var marketEntry = sync.render("ui_marketEntry")(obj, app, {index : ind, parent : marketDiv, list : listing, mode : scope.mode}).appendTo(marketWrap);
        marketEntry.addClass("flex");

        var download = $("<button>Download Asset</button>").appendTo(marketWrap);
        if (scope.filter == "pk") {
          download.text("Subscribe to Content");
        }
        else if (scope.filter == "st") {
          download.text("Download Collection");
        }
        download.attr("title", "Moves into your storage for use");
        download.attr("id", ind);
        download.click(function(){
          runCommand("downloadAsset", {index : $(this).attr("id"), _t : listing[$(this).attr("id")].a, market : scope.market});
          layout.coverlay("market-listing");
        });
        var popOut = ui_popOut({
          target : $(this),
          id : "market-listing",
          minimize : true,
          title : sync.rawVal(listing[ind].data.info.name),
          dragThickness : "0.5em",
          style : {"width" : "640px", height : "75vh"},
        }, marketWrap);
        popOut.resizable();
      });
    }
  }

  return marketDiv;
});

sync.render("ui_marketPlace", function(obj, app, scope) {
  var tabBar = genNavBar("background alttext", "fit-y");
  tabBar.addClass("fit-y");

  if (hasSecurity(getCookie("UserID"), "Game Master")) {
    tabBar.generateTab("Starter Adventures", "book", function(parent) {
      $.ajax({
        url: '/retrieveMarket?id=oa',
        error: function(code) {
          console.log(code);
        },
        dataType: 'json',
        success: function(data) {
          sync.render("ui_marketListing")(data, app, {filter : "a", market : "o"}).appendTo(parent);
        },
        type: 'GET'
      });
    });
  }

  tabBar.generateTab("Official Content", "certificate", function(parent) {
    var confirm = $("<div>").appendTo(parent);
    confirm.addClass("flexcolumn flexmiddle");

    var warning = $("<p>").appendTo(confirm);
    warning.append("This section is for official content produced by Game Master, or directly from companies who own roleplaying games.");

    $.ajax({
      url: '/retrieveMarket?id=opk',
      error: function(code) {
        console.log(code);
      },
      dataType: 'json',
      success: function(data) {
        sync.render("ui_marketListing")(data, app, {filter : "pk", market : "o"}).appendTo(parent);
      },
      type: 'GET'
    });
  });
  /*tabBar.generateTab("Quality Content", "usd", function(parent) {
    var confirm = $("<div>").appendTo(parent);
    confirm.addClass("flexcolumn flexmiddle");

    var warning = $("<p>").appendTo(confirm);
    warning.append("This section is for content that has been through an approval process and contains quality content.");
  });*/
  tabBar.generateTab("Community Creations", "fire", function(parent) {
    var confirm = $("<div>").appendTo(parent);
    confirm.addClass("flexcolumn flex flexmiddle");

    var warning = $("<p>").appendTo(confirm);
    warning.append("This section contains contains <b>FREE</b> content and could contain adult content. Content here is not officially sponsored by Game Master, therefor by proceeding you acknowledge that you are of age(18 in the US) to view this content.");

    var butt = $("<button>").appendTo(confirm);
    butt.append("Confirm");
    butt.addClass("flexmiddle");
    butt.click(function(){
      parent.empty();

      var tabContent = genNavBar(null, null, "8px");
      tabContent.addClass("fit-y");
      tabContent.appendTo(parent);

      tabContent.generateTab("Adventures", "book", function(parent) {
        parent.addClass("flex");
        $.ajax({
          url: '/retrieveMarket?id=ca',
          error: function(code) {
            console.log(code);
          },
          dataType: 'json',
          success: function(data) {
            sync.render("ui_marketListing")(data, app, {filter : "a"}).appendTo(parent);
          },
          type : "GET",
        });
        if (app) {
          app.attr("cc_tab", "Adventures");
        }
      });
      tabContent.generateTab("Boards", "globe", function(parent) {
        parent.addClass("flex");
        $.ajax({
          url: '/retrieveMarket?id=cb',
          error: function(code) {
            console.log(code);
          },
          dataType: 'json',
          success: function(data) {
            sync.render("ui_marketListing")(data, app, {filter : "b", ignoreGame : true}).appendTo(parent);
          },
          type : "GET",
        });
        if (app) {
          app.attr("cc_tab", "Boards");
        }
      });
      /*tabContent.generateTab("Actors", "user", function(parent) {
        sync.render("ui_storageList")(obj, app, {filter : "c"}).appendTo(parent);
        if (app) {
          app.attr("cc_tab", "Actors");
        }
      });*/
      tabContent.generateTab("Content Packs", "envelope", function(parent) {
        parent.addClass("flex");
        $.ajax({
          url: '/retrieveMarket?id=cpk',
          error: function(code) {
            console.log(code);
          },
          dataType: 'json',
          success: function(data) {
            sync.render("ui_marketListing")(data, app, {filter : "pk"}).appendTo(parent);
          },
          type : "GET",
        });
        if (app) {
          app.attr("cc_tab", "Content Packs");
        }
      });
      /*tabContent.generateTab("Resources", "duplicate", function(parent) {
        sync.render("ui_storageList")(obj, app, {filter : "p"}).appendTo(parent);
        if (app) {
          app.attr("cc_tab", "Resources");
        }
      });
      tabContent.generateTab("Vehicles", "plane", function(parent) {
        parent.addClass("flex");
        sync.render("ui_marketListing")(data, app, {filter : "v"}).appendTo(parent);
        if (app) {
          app.attr("cc_tab", "Vehicles");
        }
      });*/

      if (app) {
        if (!app.attr("cc_tab")) {
          app.attr("cc_tab", "Adventures");
        }
        tabContent.selectTab(app.attr("cc_tab"));
      }
      else {
        tabContent.selectTab("Adventures");
      }
    });
  });

  tabBar.selectTab("Starter Adventures");

  return tabBar;
});

sync.render("ui_shareMarket", function(obj, app, scope) {
  var marketDiv = $("<div>");
  marketDiv.addClass("flexrow flex");

  var listWrapper = $("<div>").appendTo(marketDiv);
  listWrapper.addClass("flexcolumn flex");

  var expanded = $("<div>").appendTo(marketDiv);
  expanded.addClass("fit-y outline");
  expanded.css("max-width", "50%");
  expanded.css("overflow", "auto");

  function openPopout(cObj, listing, collection) {
    var options = $("<div>");
    options.addClass("flexcolumn flex");

    game.locals["marketSubmission"] = sync.dummyObj();
    game.locals["marketSubmission"].data = {
      info : {
        name : sync.newValue("Name", "Click to Enter Title"),
        img : sync.newValue("Image"),
        notes : sync.newValue("Notes", "Enter your entry details here")
      },
      tags : [],
    };
    if (cObj.data && cObj.data.name) {
      sync.val(game.locals["marketSubmission"].data.info.name, cObj.data.name);
    }

    if (cObj.data && cObj.data.info) {
      if (cObj.data.info.name) {
        game.locals["marketSubmission"].data.info.name = duplicate(cObj.data.info.name);
      }
      if (cObj.data.info.img) {
        game.locals["marketSubmission"].data.info.img = duplicate(cObj.data.info.img);
      }
      if (cObj.data.info.notes) {
        game.locals["marketSubmission"].data.info.notes = duplicate(cObj.data.info.notes);
      }
    }
    if (!collection) {
      var uniqueID;
      if (cObj && cObj.data && cObj.data._uid) {
        uniqueID = cObj.data._uid;
        for (var i in listing) {
          if (listing[i]._uid == getCookie("UserID")+"_"+uniqueID && !listing[i].delist) {
            options.append("<div><i>CURRENTLY LISTED</i></div>");
            break;
          }
        }
      }
    }

    var dummy = game.locals["marketSubmission"];

    var newApp = sync.newApp("ui_editPage");
    newApp.addClass("flex");
    newApp.css("padding", "1em");
    newApp.appendTo(options);
    dummy.addApp(newApp);

    var form = $("<div>").appendTo(options);
    form.addClass("flexcolumn");
    form.append("<b>iframe redirect?</b>");

    var url = genInput({
      parent : form,
      placeholder : "Leave blank to use the description above or enter URL",
    });
    url.change(function(){
      expanded.empty();
      if ($(this).val()) {
        game.locals["marketSubmission"].data.info.notes.name = "url";
        expanded.append("<iframe src='"+$(this).val()+"' width='"+expanded.width()+"' height='"+($(document).height() * 0.65)+"'>");
        game.locals["marketSubmission"].update();
      }
      else if (cObj.data.info.notes.name != "url") {
        game.locals["marketSubmission"].data.info.notes.name = "Notes";
        expanded.append(sync.render("ui_renderPage")(cObj, app, {viewOnly : true}).removeClass("outline"));
        game.locals["marketSubmission"].update();
      }
    });

    form.append("<p style='font-size:0.8em;'>URL redirect can move users to your own site, or show something more complicated than what the page editor can support.</p>");

    var row = $("<div>").appendTo(form);
    row.addClass("flexrow");

    var column = $("<div>").appendTo(row);
    column.addClass("flexcolumn");

    var wrap = $("<div>").appendTo(column);
    wrap.addClass("flexmiddle");
    wrap.css("display", "inline-block");

    var checkbox = genInput({
      parent : wrap,
      type : "checkbox",
      style : {"margin" : "0"},
      disabled : "true",
    }).appendTo(wrap);
    wrap.append("<b>Official Content</b>");

    var wrap = $("<div>").appendTo(column);
    wrap.addClass("flexmiddle");
    wrap.css("display", "inline-block");

    var checkbox = genInput({
      parent : wrap,
      type : "checkbox",
      style : {"margin" : "0"}
    }).appendTo(wrap);
    checkbox.attr("checked", "true");
    wrap.append("<b>Community Content</b>");

    var tagWrap = $("<div>").appendTo(form);
    tagWrap.addClass("flexcolumn");
    tagWrap.append("<b>Tags</b>");

    var tagList = $("<div>").appendTo(form);

    var butt = $("<button>").appendTo(form);
    butt.append("Confirm Submission");
    butt.addClass("flexmiddle");
    butt.click(function(){
      if (collection) {
        game.locals["marketSubmission"].data.set = collection;
        game.locals["marketSubmission"].data._t = "st";
        runCommand("listCollection", game.locals["marketSubmission"].data);
      }
      else {
        runCommand("listAsset", {id : getCookie("UserID")+"_"+cObj.data._uid, data : game.locals["marketSubmission"].data});
      }
      //layout.coverlay("market-submission", 500);
    });
    return options;
  }

  var submitNav = genNavBar(null, null, "8px");
  submitNav.addClass("flex");
  submitNav.appendTo(listWrapper);
  var storageList = {};
  for (var i in game.locals["storage"].data.l) {
    var listing = game.locals["storage"].data.l[i];
    if (game.locals["storage"].data.s[listing._uid]) {
      storageList[listing._uid] = game.locals["storage"].data.s[listing._uid];
    }
  }
  $.ajax({
    url: '/retrieveMarket?id=ca',
    error: function(code) {
      console.log(code);
    },
    dataType: 'json',
    success: function(data) {
      submitNav.generateTab("Adventures", "book", function(parent) {
        parent.addClass("flex");
        parent.css("height", "300px");
        parent.css("overflow", "auto");
        var list = $("<div>").appendTo(parent);
        if (game.locals["storage"]) {
          var pkList = sync.render("ui_entList")(obj, app, {
            list : storageList,
            filter : "a",
            click : function(ev, ui, cObj){
              list.find(".highlight2").removeClass("highlight2");
              ui.addClass("highlight2");
              expanded.empty();
              expanded.css("width", "50%");

              var newApp = sync.newApp("ui_renderPage").appendTo(expanded);
              newApp.addClass("fit-xy");
              newApp.attr("viewOnly", "true");
              newApp.attr("local", "true");
              cObj.addApp(newApp);

              if (cObj.data._uid) {
                if (cObj.data._c == getCookie("UserID")) {
                  var popout = ui_popOut({
                    id : "market-submission",
                    target : ui,
                    style : {"width" : "30vw"},
                  }, openPopout(cObj, data));
                  popout.resizable();
                }
                else {
                  sendAlert({text : "You do not own the asset"});
                }
              }
              else {
                sendAlert({text : "No Unique ID, please re-upload asset"});
              }
            }
          }).appendTo(list);
          pkList.css("padding", "1em");
        }
        if (app) {
          app.attr("cc_tab", "Adventures");
        }
      });
    },
    type : "GET"
  });
  $.ajax({
    url: '/retrieveMarket?id=cb',
    error: function(code) {
      console.log(code);
    },
    dataType: 'json',
    success: function(data) {
      submitNav.generateTab("Boards", "globe", function(parent) {
        parent.addClass("flex");
        parent.css("height", "300px");
        parent.css("overflow", "auto");
        var list = $("<div>").appendTo(parent);
        if (game.locals["storage"]) {
          var pkList = sync.render("ui_entList")(obj, app, {
            list : storageList,
            filter : "b",
            click : function(ev, ui, cObj){
              list.find(".highlight2").removeClass("highlight2");
              ui.addClass("highlight2");
              expanded.empty();
              expanded.css("width", "50%");

              var newApp = sync.newApp("ui_board").appendTo(expanded);
              newApp.addClass("fit-xy");
              newApp.attr("viewOnly", "true");
              newApp.attr("local", "true");
              cObj.addApp(newApp);

              if (cObj.data._uid) {
                if (cObj.data._c == getCookie("UserID")) {
                  var popout = ui_popOut({
                    id : "market-submission",
                    target : ui,
                    style : {"width" : "30vw"},
                  }, openPopout(cObj, data));
                  popout.resizable();
                }
                else {
                  sendAlert({text : "You do not own the asset"});
                }
              }
              else {
                sendAlert({text : "No unique ID, please re-upload asset"});
              }
            }
          }).appendTo(list);
          pkList.css("padding", "1em");
        }
        if (app) {
          app.attr("cc_tab", "Boards");
        }
      });
    },
    type : "GET"
  });
  $.ajax({
    url: '/retrieveMarket?id=cpk',
    error: function(code) {
      console.log(code);
    },
    dataType: 'json',
    success: function(data) {
      submitNav.generateTab("Content Packs", "envelope", function(parent) {
        parent.addClass("flex");
        parent.css("height", "300px");
        parent.css("overflow", "auto");
        var list = $("<div>").appendTo(parent);
        if (game.locals["storage"]) {
          var pkList = sync.render("ui_entList")(obj, app, {
            list : storageList,
            filter : "pk",
            click : function(ev, ui, cObj){
              list.find(".highlight2").removeClass("highlight2");
              ui.addClass("highlight2");
              expanded.empty();
              expanded.css("width", "50%");

              var newApp = sync.newApp("ui_contentEditor").appendTo(expanded);
              newApp.addClass("fit-xy");
              newApp.attr("viewOnly", "true");
              newApp.attr("local", "true");
              cObj.addApp(newApp);

              if (cObj.data._uid) {
                if (cObj.data._c == getCookie("UserID") || (isNaN(cObj.id()) && cObj.id().match(getCookie("UserID")))) {
                  var popout = ui_popOut({
                    id : "market-submission",
                    target : ui,
                    style : {"width" : "30vw"},
                  }, openPopout(cObj));
                  popout.resizable();
                }
                else {
                  sendAlert({text : "You do not own the asset"});
                }
              }
              else {
                sendAlert({text : "No unique ID, please re-upload asset"});
              }
            }
          }).appendTo(list);
          pkList.css("padding", "1em");
        }
        if (app) {
          app.attr("cc_tab", "Content Packs");
        }
      });
    },
    type: 'GET'
  });
  sync.newApp("ui_boardStamps", null, {});
  $.ajax({
    url: '/retrieveMarket?id=cst',
    error: function(code) {
      console.log(code);
    },
    dataType: 'json',
    success: function(data) {
      submitNav.generateTab("Collections", "inbox", function(parent) {
        parent.addClass("flex");
        parent.css("height", "300px");
        parent.css("overflow", "auto");
        var list = $("<div>").appendTo(parent);
        if (game.locals["stamps"]) {
          for (var key in game.locals["stamps"].data.sets) {
            if (key > 0) {
              var collection = $("<div>").appendTo(list);
              collection.addClass("flexmiddle outline hover2");
              collection.append("<b>"+game.locals["stamps"].data.sets[key].name+"</b>");
              collection.attr("key", key);
              collection.click(function(){
                list.find(".highlight2").removeClass("highlight2");
                $(this).addClass("highlight2");
                expanded.empty();
                expanded.css("width", "50%");

                var set = game.locals["stamps"].data.sets[$(this).attr("key")];

                var popout = ui_popOut({
                  id : "market-submission",
                  target : $(this),
                  style : {"width" : "30vw"},
                }, openPopout(game.locals["stamps"].data, data, set));
                popout.resizable();

                var stamps = $("<div>").appendTo(expanded);
                stamps.append("<b>Stamps</b>");

                var stampList = $("<div>").appendTo(stamps);
                stampList.addClass("flexrow flexaround flexwrap lightoutline");
                for (var i in set.stamps) {
                  var sheet = $("<div>").appendTo(stampList);
                  sheet.addClass("lrpadding hover2");
                  sheet.attr("img", set.stamps[i].i);
                  sheet.css("width", "4em");
                  sheet.css("height", "4em");
                  sheet.css("position", "relative");
                  sheet.css("background-image", "url('"+ set.stamps[i].i +"')");
                  sheet.css("background-repeat", "no-repeat");
                  sheet.click(function(){
                    var img = $(this).attr("img");
                    var wrap = $("<div>");
                    wrap.addClass("flexcolumn");
                    wrap.css("position", "relative");
                    wrap.css("padding-top", "1em");

                    var image = $("<img src='"+img+"'></img>").appendTo(wrap);
                    image.css("position", "absolute");
                    image.bind("load", function(){
                      wrap.css("max-width", "30vw");
                      wrap.css("max-height", "30vh");
                      wrap.css("width", $(this).width());
                      wrap.css("height", $(this).height());
                      image.css("width", $(this).width() * ((Math.random()/10) + 0.8));
                      image.css("height", $(this).height() * ((Math.random()/10) + 0.8));
                    });
                    image.contextmenu(function(){
                      return false;
                    });
                    var pop = ui_popOut({
                      target : $("body"),
                      id : "sheet-preview",
                      title : "Image is higher resolution when downloaded",
                    }, wrap);
                    pop.css("z-index", "1000000");
                  });
                }

                var sheets = $("<div>").appendTo(expanded);
                sheets.append("<b>Tiles</b>");

                var sheetList = $("<div>").appendTo(sheets);
                sheetList.addClass("flexrow flexaround flexwrap lightoutline");
                for (var i in set.sheets) {
                  var sheet = $("<div>").appendTo(sheetList);
                  sheet.addClass("lrpadding hover2");
                  sheet.attr("img", set.sheets[i].i);
                  sheet.css("width", "4em");
                  sheet.css("height", "4em");
                  sheet.css("position", "relative");
                  sheet.css("background-image", "url('"+ set.sheets[i].i +"')");
                  sheet.css("background-repeat", "no-repeat");
                  sheet.click(function(){
                    var img = $(this).attr("img");
                    var wrap = $("<div>");
                    wrap.addClass("flexcolumn");
                    wrap.css("position", "relative");
                    wrap.css("padding-top", "1em");

                    var image = $("<img src='"+img+"'></img>").appendTo(wrap);
                    image.css("position", "absolute");
                    image.bind("load", function(){
                      wrap.css("max-width", "30vw");
                      wrap.css("max-height", "30vh");
                      wrap.css("width", $(this).width());
                      wrap.css("height", $(this).height());
                      image.css("width", $(this).width() * ((Math.random()/10) + 0.8));
                      image.css("height", $(this).height() * ((Math.random()/10) + 0.8));
                    });
                    image.contextmenu(function(){
                      return false;
                    });
                    var pop = ui_popOut({
                      target : $("body"),
                      id : "sheet-preview",
                      title : "Image is higher resolution when downloaded",
                    }, wrap);
                    pop.css("z-index", "1000000");
                  });
                }
              });
            }
          }
        }
        if (app) {
          app.attr("cc_tab", "Collections");
        }
      });
    },
    type: 'GET'
  });
  return marketDiv;
});

sync.render("ui_newMarket", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flex flexrow");

  var options = $("<div>").appendTo(div);
  options.addClass("flexcolumn");
  options.css("min-width", "150px");

  var search = genInput({
    parent : options,
    placeholder : "Keyword Search",
  }, 1);
  search.change(function(e) {
    var searchStr = search.val();
    if (searchStr) {
      listings.children().each(function(){
        var listWrap = $(this);
        if (listWrap.is(":visible")) {
          var listingData = game.locals["listings"][listWrap.attr("m")+listWrap.attr("f")];
          var listing = $($($(this).children()[1]).children()[0]);
          listing.children().each(function(){
            var listData = listingData.data.listing[$(this).attr("index")];
            if (listData) {
              if ((sync.rawVal(listData.data.info.name || "")).toLowerCase().match(searchStr.toLowerCase())) {
                $(this).show();
              }
              else {
                $(this).hide();
              }
            }
          });
        }
      });
    }
    else {
      listings.children().each(function(){
        var listWrap = $(this);
        if (listWrap.is(":visible")) {
          var listing = $($($(this).children()[1]).children()[0]);
          listing.children().each(function(){
            $(this).show();
          });
        }
      });
    }
  });

  options.append("<b>Type</b>");
  var assetTypes = $("<div>").appendTo(options);
  assetTypes.addClass("flexrow");
  assetTypes.css("padding-left", "1em");

  var checkWrap = $("<div>").appendTo(assetTypes);
  checkWrap.addClass("flexmiddle");

  var check = genInput({
    parent : checkWrap,
    type : "checkbox",
    style : {"margin-top" : "0px"},
    filter : "o",
  });
  check.prop("checked", true);
  check.change(function(){
    if ($(this).prop("checked") == true) {
      listings.find("div[t~='"+$(this).attr("filter")+"']").fadeOut();
      if (!listings.find("div[t='"+$(this).attr("filter")+"']").is(":visible")) {
        listings.find("div[t='"+$(this).attr("filter")+"']").fadeIn();
      }
    }
    else {
      listings.find("div[t='"+$(this).attr("filter")+"']").fadeOut();
    }
  });

  $("<text>Official</text>").appendTo(checkWrap);

  var assetTypes = $("<div>").appendTo(options);
  assetTypes.addClass("flexrow");
  assetTypes.css("padding-left", "1em");

  var checkWrap = $("<div>").appendTo(assetTypes);
  checkWrap.addClass("flexmiddle");

  var check = genInput({
    parent : checkWrap,
    type : "checkbox",
    style : {"margin-top" : "0px"},
    filter : "c",
  });
  check.prop("checked", true);
  check.change(function(){
    if ($(this).prop("checked") == true) {
      listings.find("div[t~='"+$(this).attr("filter")+"']").fadeOut();
      if (!listings.find("div[t='"+$(this).attr("filter")+"']").is(":visible")) {
        listings.find("div[t='"+$(this).attr("filter")+"']").fadeIn();
      }
    }
    else {
      listings.find("div[t='"+$(this).attr("filter")+"']").fadeOut();
    }
  });

  $("<text>Community Chest</text>").appendTo(checkWrap);

  var categories = {
    //"a" : {n : "Adventures", i : "book", ui : "ui_planner", width : "60vw", height : "40vh"},
    "c" : {n : "Actors", i : "user", ui : "ui_characterSheet"},
    "st" : {n : "Collections", i : "picture", ui : "ui_characterSheet", ignoreGame : true},
    //"pk" : {n : "Content Packages", i : "envelope", ui : "ui_contentEditor"},
    "b" : {n : "Maps", i : "globe", ui : "ui_board", width : "60vw", height : "60vh"},
    "p" : {n : "Resources", i : "file", ui : "ui_renderPage", width : "40vw", height : "30vh"},
    //"v" : {n : "Vehicles", i : "plane", ui : "ui_vehicle"},
  };

  options.append("<b>Asset Type</b>");
  for (var i in categories) {
    var assetTypes = $("<div>").appendTo(options);
    assetTypes.addClass("flexrow");
    assetTypes.css("padding-left", "1em");

    var checkWrap = $("<div>").appendTo(assetTypes);
    checkWrap.addClass("flexmiddle");

    var check = genInput({
      parent : checkWrap,
      type : "checkbox",
      style : {"margin-top" : "0px"},
      filter : i,
    });
    check.prop("checked", true);
    check.change(function(){
      if ($(this).prop("checked") == true) {
        listings.find("div[f~='"+$(this).attr("filter")+"']").fadeOut();
        if (!listings.find("div[f='"+$(this).attr("filter")+"']").is(":visible")) {
          listings.find("div[f='"+$(this).attr("filter")+"']").fadeIn();
        }
      }
      else {
        listings.find("div[f='"+$(this).attr("filter")+"']").fadeOut();
      }
    });
    genIcon(categories[i].i, categories[i].n).appendTo(checkWrap);
  }

  options.append("<b>Tags</b>");

  game.locals["listings"] = {};

  var tagList = $("<div>").appendTo(options);
  tagList.addClass("flexrow flexwrap");
  tagList.css("width", "150px");

  var tags = [];

  function updateTags(){
    var selectedTags = [];
    tagList.children().each(function(){
      if ($(this).hasClass("highlight alttext")) {
        selectedTags.push(tags[$(this).attr("index")]);
      }
    });
    listings.children().each(function(){
      var listWrap = $(this);
      if (listWrap.is(":visible")) {
        var listingData = game.locals["listings"][listWrap.attr("m")+listWrap.attr("f")];
        var listing = $($($(this).children()[1]).children()[0]);
        listing.children().each(function(){
          var listData = listingData.data.listing[$(this).attr("index")];
          if (listData) {
            if (selectedTags.length) {
              $(this).hide();
              for (var i in selectedTags) {
                var tag = selectedTags[i];
                if (util.contains(listData.t, tag)) {
                  $(this).show();
                }
              }
            }
            else {
              $(this).show();
            }
          }
        });
      }
    });
  }
  function rebuildTags() {
    tagList.empty();
    for (var i in tags) {
      var button = $("<button>").appendTo(tagList);
      button.css("margin-left", "4px");
      button.css("margin-right", "4px");
      button.append(tags[i]);
      button.attr("index", i);
      button.click(function(){
        if (!$(this).hasClass("highlight alttext")) {
          $(this).addClass("highlight alttext");
        }
        else {
          $(this).removeClass("highlight alttext");
        }
        updateTags();
      });
    }
  }

  var buffer = $("<div>").appendTo(options);
  buffer.addClass("flex");

  var share = $("<button>");//.appendTo(options);
  share.addClass("highlight alttext");
  share.append(genIcon("cloud-upload", "Share My Creations").css("color","white"));
  share.click(function(){
    var frame = layout.page({title: "Share My Creations", blur : 0.5, width: "90%", id: "community-chest"});
    if (layout.mobile) {
      frame.css("width", "95vw");
    }
    var newApp = sync.newApp("ui_shareMarket", null, {});
    newApp.appendTo(frame);
    newApp.css("height", "80vh");
  });

  var viewPort = $("<div>").appendTo(div);
  viewPort.addClass("flex fit-y outline");
  viewPort.css("overflow", "auto");

  var listings = $("<div>").appendTo(viewPort);
  listings.addClass("flexcolumn fit-x");

  var cates = [
    //{n : "Featured Content", f : "pk", m : "opk", t : "o"},
    //{n : "Official Adventures", f : "a", m : "oa", t : "o"},
    //{n : "Official Collections", f : "st", m : "ost", t : "o", ignoreGame : true},
    {n : "Official Content", f : "pk", m : "opk", t : "o"},
    //{n : "Newest Additions", f : "pk", m : "opk", t : "o"},

    //{n : "Community Adventures", f : "a", m : "ca", t : "c"},
    {n : "Community Maps", f : "b", m : "cb", t : "c"},
    //{n : "Community Collections", f : "st", m : "cst", t : "c", ignoreGame : true},
    {n : "Community Content", f : "pk", m : "cpk", t : "c"},
  ];
  for (var i in cates) {
    function loadCategory(catData, index) {
      var listWrap = $("<div>").appendTo(listings);
      listWrap.attr("index", index);
      listWrap.attr("f", catData.f);
      listWrap.attr("m", catData.m);
      listWrap.attr("t", catData.t);
      listWrap.css("margin-bottom", "1em");
      listWrap.css("background-color", "rgb(235,235,228)");

      $.ajax({
        url: '/retrieveMarket?id='+catData.m,
        error: function(code) {
          console.log(code);
        },
        dataType: 'json',
        success: function(data) {
          if (Object.keys(data.data.listing).length) {
            var rebuild = false;
            for (var i in data.data.listing) {
              var listData = data.data.listing[i];
              for (var tg in listData.t) {
                if (!util.contains(tags, listData.t[tg])) {
                  tags.push(listData.t[tg]);
                  rebuild = true;
                }
              }
            }
            if (rebuild) {
              rebuildTags();
            }
            game.locals["listings"][catData.m+catData.f] = data;
            var category = $("<div>").appendTo(listWrap);
            category.addClass("outline alttext flexaround");
            category.append("<b>"+catData.n+"</b>");

            var listMode = genIcon("th-list").appendTo(category);
            listMode.click(function(){
              listing.empty();
              listing.addClass("flexcolumn");
              listing.removeClass("flexrow");
              var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, mode : "list", ignoreGame : catData.ignoreGame}).appendTo(listing);
              list.removeClass("outline flexrow flexaround flexmiddle flexwrap");
              list.addClass("flexcolumn");
            });
            var textMode = genIcon("th").appendTo(category);
            textMode.click(function(){
              listing.empty();
              listing.addClass("flexrow");
              listing.removeClass("flexcolumn");
              var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, ignoreGame : catData.ignoreGame}).appendTo(listing);
              list.removeClass("outline");
            });
            var iconMode = genIcon("th-large").appendTo(category);
            iconMode.click(function(){
              listing.empty();
              listing.addClass("flexrow");
              listing.removeClass("flexcolumn");
              var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, mode : "large", ignoreGame : catData.ignoreGame}).appendTo(listing);
              list.removeClass("outline");
            });

            if (catData.t == "c") {
              category.addClass("background");
            }
            else {
              category.css("font-size", "1.2em");
              category.addClass("highlight");
              iconMode.css("color", "white");
              listMode.css("color", "white");
              textMode.css("color", "white");
            }
            var listing = $("<div>").appendTo(listWrap);
            listing.addClass("flexrow outline");
            listing.css("overflow-x");
            listing.append("<div class='flexmiddle' style='min-height : 100px'><i>Loading...</i></div>");

            listWrap.fadeIn();
            listWrap.hover(function(){
              if ($(this).attr("done") != "true") {
                listing.children().children().show();
                $(this).attr("done", "true");
              }
            });
            setTimeout(function(){
              if (listWrap.is(":visible")) {
                listing.empty();
                var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, ignoreGame : catData.ignoreGame}).appendTo(listing);
                list.children().hide();
                list.removeClass("outline");
                var fade = 0;
                var endofList = $("<div class='flexmiddle lrpadding'><i>End of Listing</i></div>").appendTo(list);
                endofList.hide();
                list.children().each(function(index, ui){
                  var entry = $(this);
                  function wrap(entry, index) {
                    setTimeout(function(){
                      if (!entry.is(":visible")) {
                        entry.fadeIn();
                        if (index == list.children().length-2) {
                          listWrap.attr("done", "true");
                        }
                      }
                    }, fade);
                    fade += 500;
                  }
                  wrap(entry, index);
                });
              }
            }, 500);
          }
          else {
            listWrap.remove();
          }
        },
        type: 'GET'
      });
    }
    loadCategory(cates[i], i);
  }

  return div;
});
