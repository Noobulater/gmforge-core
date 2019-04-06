function openSplash(secondOpen, tab){
  var originalFrame = layout.overlay({target : $("body"), id : "splash-screen"});
  originalFrame.addClass("flexrow flexaround");
  originalFrame.css("background", "rgba(0,0,0,0.8)");
  originalFrame.css("font-size", "");
  var max = util.getMaxZ(".ui-popout");
  originalFrame.css("z-index", max+1);

  if (!getCookie("UserID").valid()) {
    var button = $("#auth");
    button.click(function(){
      var popOut = ui_popOut({
        target : $(this),
        align : "bottom",
        id : "auth-dialog",
        style : {"width" : "10vw"}
      }, authDialog());
    });
  };

  var newsContainer = $("<div>").appendTo(originalFrame);
  newsContainer.addClass("flexcolumn flex lpadding");

  //newsContainer.load("https://files.gmforge.io/file/tabs/left.html");

  /*newsContainer.load("https://files.gmforge.io/file/builds/patcher.html");*/

  var frame = $("<div>").appendTo(originalFrame);
  frame.addClass("flexcolumn flex2 flexmiddle");

  var newsContainer = $("<div>").appendTo(originalFrame);
  newsContainer.addClass("flexcolumn flex lpadding");

  //newsContainer.load("https://files.gmforge.io/file/tabs/right.html");


  var imgWrap = $("<div>").appendTo(frame);
  imgWrap.addClass("flexcolumn flexmiddle");
  imgWrap.css("background", "radial-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(255,255,255,0), rgba(255,255,255,0))");

  var icon = $("<div>").appendTo(imgWrap);
  icon.css("width", "35vh");
  icon.css("height", "35vh");
  icon.css("background-image", "url('/content/brand.png')");
  icon.css("background-repeat", "no-repeat");
  icon.css("background-size", "cover");
  icon.css("background-position", "center");

  var buttons = $("<div>").appendTo(frame);
  buttons.addClass("flexcolumn");
  buttons.css("min-width", "262px");

  if (!window.mobilecheck() && secondOpen) {
    var sandbox = $("<button>").appendTo(buttons);
    sandbox.addClass("hardoutline smooth highlight flex flexmiddle hover2 padding");
    sandbox.css("margin-bottom", "1em");

    var flashText = $("<text>").appendTo(sandbox);
    flashText.addClass("flexmiddle");
    flashText.css("color", "white");
    flashText.css("font-size", "2em");
    flashText.css("font-family", "Arial");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.text("Resume");

    sandbox.click(function(){
      layout.coverlay($("#splash-screen"), 500);
    });

    if ($("#viewPort").attr("local") == "true" || $("#viewPort").attr("local") == true) {
      var sandbox = $("<button>").appendTo(buttons);
      sandbox.addClass("hardoutline smooth background flex flexmiddle hover2 padding");
      sandbox.css("margin-bottom", "1em");

      var flashText = $("<text>").appendTo(sandbox);
      flashText.addClass("flexmiddle");
      flashText.css("color", "white");
      flashText.css("font-size", "2em");
      flashText.css("font-family", "Arial");
      flashText.css("text-shadow", "0px 0px 3px black");
      flashText.text("Rejoin as GM");
      sandbox.click(function(){
        window.location.href = "/join?userID=localhost";
      });
    }
  }
  if ($("#viewPort").attr("host") == "true" || $("#viewPort").attr("host") == true) {
    var joinIn = $("<div>").appendTo(buttons);
    joinIn.addClass("flexcolumn hardoutline smooth background flex flexmiddle hover2 padding");

    var flashText = $("<text>").appendTo(joinIn);
    flashText.addClass("flexmiddle bold");
    flashText.attr("id", "join");
    flashText.css("color", "white");
    flashText.css("font-size", "2em");
    flashText.css("font-family", "Arial");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.text("Join a Game!");

    var fading2 = false;
    joinIn.click(function(){
      var button = $(this);
      $("#join").fadeOut(500);
      $(this).css("min-height", $(this).height());
      if (fading2) {return true;}
      fading2 = true;
      setTimeout(function(){
        var input = genInput({
          parent : joinIn,
          classes : "fit-x line alttext margin middle subtitle",
          placeholder : "Place Game Invite here",
        });

        var button = $("<div>").appendTo(joinIn);
        button.addClass("fit-x");
        button.text("Join through Invite");
        button.css("font-size", "1.4em");
        button.css("font-family", "Arial");
        button.click(function(){
          if (input.val().match("http")) {
            window.location.href = input.val();
          }
          else {
            window.location.href = "http://"+input.val();
          }
        });
      }, 400);
    });

    var signin = $("<div>").appendTo(buttons);
    signin.addClass("hardoutline smooth background flex flexmiddle hover2 padding");

    var flashText = $("<text>").appendTo(signin);
    flashText.addClass("flexmiddle bold");
    flashText.attr("id", "start");
    flashText.css("color", "white");
    flashText.css("font-size", "2em");
    flashText.css("font-family", "Arial");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.text("Start a Game!");

    var fading = false;
    signin.click(function(){
      $("#start").fadeOut();
      $(this).css("min-height", $(this).height());
      if (fading) {return true;}
      fading = true;
      setTimeout(function(){
        var wrap = $("<div>").appendTo(signin);

        var rootControls = $("<div>").appendTo(wrap);
        rootControls.addClass("flexmiddle subtitle");

        var uploadLabel = genIcon("folder-open", "Open In File Browser").appendTo(rootControls);
        uploadLabel.addClass("alttext lrpadding");
        uploadLabel.attr("filename", "/");
        uploadLabel.css("color", "white");
        uploadLabel.click(function(ev){
          $.ajax({
            url: '/openFiles?path=/worlds',
            type : "GET"
          });
        });


        var pickerWrap = $("<div>").appendTo(wrap);
        pickerWrap.addClass("white smooth scroll-y");
        pickerWrap.css("color", "#333");
        pickerWrap.css("width", "400px");
        pickerWrap.css("height", "200px");
        var worldList;
        function refresh() {
          $.ajax({
            url: "/getWorlds",
            error: function(code) {
              console.log(code);
            },
            dataType: 'json',
            success: function(resData) {
              worldList = resData;
              pickerWrap.empty();
              if (resData.length == 0) {
                startText.addClass("highlight bounce");
              }
              for (var i in resData) {
                var picker = $("<div>").appendTo(pickerWrap);
                picker.addClass("link");
                picker.attr("val", resData[i]);
                picker.text(resData[i]);
                picker.click(function(){
                  var val = $(this).attr("val");
                  $.ajax({
                    url: "/loadGame",
                    error: function(code) {
                      console.log(code);
                    },
                    dataType: 'json',
                    data : {gameData : val, gameName : val},
                    success: function(resData) {
                      window.location.href = "/join";
                      layout.coverlay($("#splash-screen"), 500);
                    },
                    type: 'GET'
                  });
                });
              }
            },
            type: 'GET'
          });
        }
        refresh();

        var newGame = $("<button>").appendTo(wrap);
        newGame.addClass("background alttext");
        newGame.css("font-size", "1.2em");
        newGame.append("Refresh Worlds");
        newGame.click(function(){
          $.ajax({
            url: "/workshopSync",
            error: function(code) {
              console.log(code);
              refresh();
            },
            dataType: 'json',
            success: function(list) {
              refresh();
            },
            type: 'GET'
          });
        });

        var newGame = $("<button>").appendTo(wrap);
        newGame.addClass("highlight alttext");
        newGame.css("font-size", "1.2em");
        newGame.append("Start a New Game");
        newGame.click(function(){
          $.ajax({
            url: "/workshopSync",
            error: function(code) {
              console.log(code);
            },
            dataType: 'json',
            success: function(list) {
              $.ajax({
                 url: '/gameList',
                 error: function(code) {
                   console.log(code);
                 },
                 dataType: 'json',
                 success: function(data) {
                  game.locals["gameList"] = data.list;

                  var slot = $(this).attr("index");
                  var frame = layout.page({title: "Creating Game...", prompt: "", width : "800px", blur: 0.5, id: "gamePreview", style : {"z-index" : "100000000000000"}});

                  var confirmation = $("<div>").appendTo(frame);
                  confirmation.addClass("flexcolumn");

                  game.locals["createSession"] = sync.obj("createSession");
                  game.locals["createSession"].data = {
                    name : sync.newValue("Enter Your Game Title", "An adventure begins..."),
                    password : sync.newValue("Enter Your Password"),
                    capacity : sync.newValue("Max Players", 1, 1, 10),
                    img : sync.newValue("Image Goes Here")
                  };


                  var infoPanel = $("<div>").appendTo(confirmation);
                  infoPanel.addClass("flexcolumn");

                  var panel = $("<div>").appendTo(infoPanel);

                  var panelWraap = $("<div>").appendTo(panel);
                  panelWraap.addClass("flexmiddle");

                  var buttonWrap = $("<div>").appendTo(panelWraap);
                  buttonWrap.addClass("flexmiddle");
                  buttonWrap.hide();

                  var button = $("<button>").appendTo(buttonWrap);
                  button.addClass("highlight alttext hover2");
                  button.text("V2 Systems (HTML)");
                  button.click(function(){
                    $(this).parent().children().removeClass("highlight").addClass("background");
                    $(this).addClass("highlight").removeClass("background");
                    gameList.children().each(function(){
                      if ($(this).attr("build")) {
                        $(this).show();
                      }
                      else {
                        $(this).hide();
                      }
                    });
                  });

                  var button = $("<button>").appendTo(buttonWrap);
                  button.addClass("background alttext hover2");
                  button.text("V1 Systems (JSON)");
                  button.click(function(){
                    $(this).parent().children().removeClass("highlight").addClass("background");
                    $(this).addClass("highlight").removeClass("background");
                    gameList.children().each(function(){
                      if ($(this).attr("build")) {
                        $(this).hide();
                      }
                      else {
                        $(this).show();
                      }
                    });
                  });

                  panelWraap.append("<div class='lrpadding lrmargin'></div>");
                  var refreshWorkshop = genIcon("refresh", "Refresh").appendTo(panelWraap);
                  refreshWorkshop.click(function(){
                    $.ajax({
                      url: "/workshopSync",
                      error: function(code) {
                        console.log(code);
                      },
                      dataType: 'json',
                      success: function(list) {
                        $.ajax({
                           url: '/gameList',
                           error: function(code) {
                             console.log(code);
                             newGame.click();

                           },
                           dataType: 'json',
                           success: function(data) {
                             game.locals["gameList"] = data.list;
                             newGame.click();
                             sendAlert({text : "success"});
                           },
                           type : "GET",
                        });
                      },
                      type: 'GET'
                    });
                  });

                  panelWraap.append("<div class='lrpadding lrmargin'></div>");
                  var installWorkshop = genIcon("wrench", "Browse the Workshop!").appendTo(panelWraap);
                  installWorkshop.attr("target", "_");
                  installWorkshop.attr("href", "https://steamcommunity.com/app/842250/workshop/");

                  var gameList = $("<div>").appendTo(panel);
                  gameList.addClass("flexrow flexwrap smooth");

                  for (var i in game.locals["gameList"]) {
                    if (game.locals["gameList"][i].show !== false) {
                      var gameSelect = $("<div>").appendTo(gameList);
                      gameSelect.addClass("hover2 outline smooth");
                      gameSelect.attr("build", game.locals["gameList"][i].build);
                      if (!game.locals["gameList"][i].build) {
                        gameSelect.hide();
                        buttonWrap.show();
                      }
                      if (game.locals["createSession"].data.game == i) {
                        gameSelect.addClass("highlight");
                      }
                      gameSelect.css("background-image", "url('"+sync.rawVal(game.locals["gameList"][i].info.img)+"')");
                      gameSelect.css("background-repeat", "no-repeat");
                      gameSelect.css("background-position", "center");
                      gameSelect.css("background-size", "cover");
                      gameSelect.css("width", "9em");
                      gameSelect.css("height", "6em");
                      if (game.locals["gameList"][i].beta) {
                        gameSelect.css("position", "relative");
                        gameSelect.append("<highlight style='-webkit-text-stroke-color:white; position : absolute; top:0; left:0; font-size:0.8em; font-family:Arial;' class='highlight outline smooth lrpadding'>Beta</highlight>");
                      }
                      gameSelect.attr("index", i);
                      gameSelect.attr("img", sync.rawVal(game.locals["gameList"][i].info.img));
                      gameSelect.click(function() {

                        game.locals["createSession"].data.game = $(this).attr("index");
                        game.locals["createSession"].data.img = $(this).attr("img");
                        game.locals["createSession"].data.templates = game.locals["gameList"][$(this).attr("index")];
                        game.locals["createSession"].update();

                        sheetPreview.empty();

                        var sheet = $("<img>").appendTo(sheetPreview);
                        sheet.attr("src", game.locals["gameList"][$(this).attr("index")].info.img.current);
                        sheet.css("max-height", "200px");

                        gameList.children().each(function() {
                          $(this).removeClass("highlight");
                        });
                        $(this).addClass("highlight");
                        button.show();
                      });
                      var child = $("<p>").appendTo(gameSelect);
                      child.addClass("fit-xy alttext flexmiddle subtitle");
                      child.css("background", "linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,0.4), rgba(0,0,0,0))")
                      child.text(sync.rawVal(game.locals["gameList"][i].info.name));
                      child.hide();

                      gameSelect.hover(function(){
                        $(this).children().fadeIn();
                      },
                      function(){
                        $(this).children().fadeOut();
                      });
                    }
                  }

                  var gamePreview = $("<div>").appendTo(confirmation);
                  gamePreview.addClass("flexcolumn flex");

                  var previewWrap = $("<div>");

                  var sheetPreview = $("<div>").appendTo(gamePreview);
                  sheetPreview.addClass("flexcolumn fit-x flexmiddle");
                  previewWrap.css("height", "400px");

                  var gameWrap = $("<div>").appendTo(gamePreview);
                  gameWrap.addClass("flexcolumn flexaround flex");

                  var button = $("<button>").appendTo(gameWrap);
                  button.addClass("flexmiddle highlight alttext");
                  button.css("font-size", "2em");
                  button.append("Create");
                  button.hide();
                  button.click(function(){
                    var data = game.locals["createSession"].data;
                    var templates = data.templates;
                    ui_prompt({
                      target : $(this),
                      inputs : {
                        "File Name" : {placeholder : "No Special Characters"}
                      },
                      style : {"z-index" : "10000000000000000000000000"},
                      click : function(ev, inputs) {
                        if (inputs["File Name"].val()) {
                          if (!util.contains(worldList, inputs["File Name"].val()+".world")) {
                            $.ajax({
                              url: "/loadGame",
                              error: function(code) {
                                console.log(code);
                              },
                              dataType: "json",
                              data : {gameName : inputs["File Name"].val()+".world", gameKey : data.game},
                              success: function(resData) {
                                window.location.href = "/join";
                                layout.coverlay($("#splash-screen"), 500);
                              },
                              type: 'GET'
                            });
                          }
                          else {
                            alert("A world already exists with that name");
                          }
                        }
                      }
                    });
                  });
                },
                type : "GET",
             });
           },
           type: 'GET'
         });
        });
      }, 800);
    });

    var startText = $("<a>").appendTo(buttons);
    startText.addClass("flexmiddle bold dull spadding");
    startText.attr("target", "_");
    startText.attr("href", "https://steamcommunity.com/sharedfiles/filedetails/?id=1398462708");
    startText.css("font-family", "Arial");
    startText.css("color", "white");
    startText.css("text-shadow", "0px 0px 3px black");
    startText.text("Multiplayer Setup!");

    var flashText = $("<a>").appendTo(buttons);
    flashText.addClass("flexmiddle bold dull spadding");
    flashText.attr("id", "start");
    flashText.css("font-family", "Arial");
    flashText.css("color", "white");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.text("Options/Users");
    flashText.click(function(){
      $.ajax({
        url: "/getOptions",
        error: function(code) {
          console.log(code);
        },
        dataType: 'json',
        success: function(optionData) {
          var content = $("<div>");
          content.addClass("flexcolumn flex");

          var optionWrap = $("<div>").appendTo(content);
          optionWrap.addClass("flexrow subtitle lrpadding");

          optionWrap.append("<b>Host Display Name</b>");

          var hostName = genInput({
            parent : optionWrap,
            value : optionData.hostName,
            placeholder : "localhost",
            classes : "line lrmargin flex subtitle",
          });
          hostName.change(function(){
            optionData.hostName = $(this).val();
            $.ajax({
              url: "/updateOptions",
              error: function(code) {
                console.log(code);
              },
              data: {options : JSON.stringify(optionData, 2, 2)},
              dataType: 'json',
              success: function() {
                buildAccounts();
              },
              type : "GET",
            });
          });

          var optionWrap = $("<div>").appendTo(content);
          optionWrap.addClass("flexrow subtitle lrpadding");

          optionWrap.append("<b>Remote GM Password</b>");

          var hostPW = genInput({
            parent : optionWrap,
            value : optionData.hostPW,
            placeholder : "Remote GM Password",
            classes : "line lrmargin flex subtitle",
          });
          hostPW.change(function(){
            optionData.hostPW = $(this).val();
            $.ajax({
              url: "/updateOptions",
              error: function(code) {
                console.log(code);
              },
              data: {options : JSON.stringify(optionData, 2, 2)},
              dataType: 'json',
              success: function() {
                buildAccounts();
              },
              type : "GET",
            });
          });

          var optionWrap = $("<div>").appendTo(content);
          optionWrap.addClass("flexrow subtitle lrpadding");

          var fullScreen = genInput({
            type : "checkbox",
            parent : optionWrap
          });
          fullScreen.change(function(){
            optionData.fullscreen = ($(this).prop("checked") == true);
            $.ajax({
              url: "/updateOptions",
              error: function(code) {
                console.log(code);
              },
              data: {options : JSON.stringify(optionData, 2, 2)},
              dataType: 'json',
              success: function(optionData) {

              },
              type : "GET",
            });
          });
          fullScreen.prop("checked", optionData.fullscreen);
          optionWrap.append("<b>Fullscreen on start</b>");

          var optionWrap = $("<div>").appendTo(content);
          optionWrap.addClass("flexrow subtitle lrpadding");

          optionWrap.append("<b>Port</b>");

          var portNumber = genInput({
            classes : "line lrmargin fit-x",
            parent : optionWrap,
            type : "number",
            min : 1,
            max : 55555,
            value : optionData.port || 30000
          });
          portNumber.change(function(){
            optionData.port = $(this).val();
            $.ajax({
              url: "/updateOptions",
              error: function(code) {
                console.log(code);
              },
              data: {options : JSON.stringify(optionData, 2, 2)},
              dataType: 'json',
              success: function(optionData) {

              },
              type : "GET",
            });
          });

          var accountListWrap = $("<div>").appendTo(content);
          accountListWrap.addClass("flex");
          accountListWrap.css("overflow", "auto");
          accountListWrap.css("position", "relative");

          var accountList = $("<div>").appendTo(accountListWrap);
          accountList.addClass("fit-x");
          accountList.css("position", "absolute");

          function buildAccounts(){
            accountList.empty();
            for (var i in optionData.accounts) {
              var account = optionData.accounts[i];

              var accountPlate = $("<div>").appendTo(accountList);
              accountPlate.addClass("flexcolumn");
              accountPlate.css("margin-bottom", "2em");

              var accountKey = $("<div>").appendTo(accountPlate);
              accountKey.addClass("flexrow flexbetween lrpadding");
              accountKey.append(i);

              var remove = genIcon("remove", "Delete Account").appendTo(accountKey);
              remove.addClass("destroy subtitle");
              remove.attr("index", i);
              remove.click(function(){
                var index = $(this).attr("index");

                ui_prompt({
                  target : $(this),
                  click : function(){
                    delete optionData.accounts[index];
                    $.ajax({
                      url: "/updateOptions",
                      error: function(code) {
                        console.log(code);
                      },
                      data: {options : JSON.stringify(optionData, 2, 2)},
                      dataType: 'json',
                      success: function() {
                        buildAccounts();
                      },
                      type : "GET",
                    });
                  }
                });
              });

              var accountData = $("<div>").appendTo(accountPlate);
              accountData.addClass("flexrow flexbetween");

              var displayName = genInput({
                parent : accountData,
                value : account.displayName,
                placeholder : "Display Name",
                classes : "line lrmargin flex subtitle",
                index : i
              });
              displayName.change(function(){
                var index = $(this).attr("index");
                optionData.accounts[index].displayName = $(this).val();
                $.ajax({
                  url: "/updateOptions",
                  error: function(code) {
                    console.log(code);
                  },
                  data: {options : JSON.stringify(optionData, 2, 2)},
                  dataType: 'json',
                  success: function() {
                    buildAccounts();
                  },
                  type : "GET",
                });
              });

              var displayName = genInput({
                parent : accountData,
                value : account.password,
                placeholder : "Password (Optional)",
                classes : "line lrmargin flex subtitle",
                index : i
              });
              displayName.change(function(){
                var index = $(this).attr("index");
                optionData.accounts[index].password = $(this).val();
                $.ajax({
                  url: "/updateOptions",
                  error: function(code) {
                    console.log(code);
                  },
                  data: {options : JSON.stringify(optionData, 2, 2)},
                  dataType: 'json',
                  success: function() {
                    buildAccounts();
                  },
                  type : "GET",
                });
              });

              var select = $("<select>")//.appendTo(accountData);
              select.attr("index", i);
              select.append("<option value=1>Game Master</option>");
              select.append("<option value=2>Assistant Master</option>");
              select.append("<option value=3>Player</option>");
              select.change(function(){
                var index = $(this).attr("index");
                optionData.accounts[index].rank = $(this).val();
                $.ajax({
                  url: "/updateOptions",
                  error: function(code) {
                    console.log(code);
                  },
                  data: {options : JSON.stringify(optionData, 2, 2)},
                  dataType: 'json',
                  success: function() {
                    buildAccounts();
                  },
                  type : "GET",
                });
              });
            }
          }
          buildAccounts();

          var createAccount = genIcon("plus", "New Account").appendTo(content);
          createAccount.addClass("create flexmiddle fit-x");
          createAccount.click(function(){
            ui_prompt({
              target : $(this),
              inputs : {
                "Account Name" : ""
              },
              click : function(ev, inputs) {
                optionData.accounts[inputs["Account Name"].val()] = {};
                $.ajax({
                  url: "/updateOptions",
                  error: function(code) {
                    console.log(code);
                  },
                  data: {options : JSON.stringify(optionData, 2, 2)},
                  dataType: 'json',
                  success: function() {
                    buildAccounts();
                  },
                  type : "GET",
                });
              }
            });
          });


          ui_popOut({
            target : $("body"),
            id : "port-options",
            title : "Client Options",
            style : {"width" : "400px", "height" : "400px"}
          }, content);
        },
        type: 'GET'
      });
    });

    var flashText = $("<a>").appendTo(buttons);
    flashText.addClass("flexmiddle bold dull spadding");
    flashText.attr("id", "start");
    flashText.css("font-family", "Arial");
    flashText.css("color", "white");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.text("Exit");
    flashText.click(function(){
      $.ajax({
        url: "/exit",
        error: function(code) {
          console.log(code);
        },
        dataType: 'json',
        success: function(resData) {

        },
        type: 'GET'
      });
    });

    var LLC = $("<div>").appendTo(frame);
    LLC.addClass("flexcolumn flexmiddle");
    LLC.css("height", "8vh");
    LLC.append("<text style='color : white;' class='subtitle'>Game Master, LLC © 2017</text>");
    //LLC.append("<a class='subtitle' style='color : white;' href='http://wiki.gmforge.io/index.php/Terms_of_Service' target='_'>Terms of Service</a>");
    /*var overlay = layout.overlay({target: $("#game"), style: {"background-color": "rgba(50,50,50, 0.8)"}});
    overlay.append("<h1 class='flexmiddle' style='color: white;'>Under Construction!</h1>");*/
    if ($("#redeemCode").attr("about") == "true") {
      $("#about").click();
      $("#redeemCode").removeAttr("about");
    }
  }
  else {
    var signinWrap = $("<div>").appendTo(buttons);
    signinWrap.addClass("flexcolumn");

    $.ajax({
      url: "/getOptions",
      error: function(code) {
        console.log(code);
        for (var i=1; i<8; i++) {
          var signin = $("<div>").appendTo(signinWrap);
          signin.addClass("button smooth white hover2 flex flexmiddle padding");
          signin.attr("index", i);
          var flashText = $("<text>").appendTo(signin);
          flashText.addClass("flexmiddle bold");
          flashText.css("font-family", "Arial");
          flashText.css("text-shadow", "0px 0px 3px black");
          flashText.text("Join as Player " + i);
          signin.click(function(){
            window.location.href = "/join?userID=player_"+$(this).attr("index");
          });
        }
      },
      dataType: 'json',
      success: function(optionData) {
        for (var i in optionData.accounts) {
          var signin = $("<div>").appendTo(signinWrap);
          signin.addClass("button smooth white hover2 flex flexmiddle padding");
          signin.attr("index", i);

          var flashText = $("<text>").appendTo(signin);
          flashText.addClass("flexmiddle bold");
          flashText.css("font-family", "Arial");
          flashText.css("text-shadow", "0px 0px 3px black");
          flashText.text("Join as " + (optionData.accounts[i].displayName || i));
          signin.click(function(){
            var index = $(this).attr("index");
            if (optionData.accounts[index].password) {
              ui_prompt({
                target : $(this),
                inputs : {"Password" : ""},
                click : function(ev, inputs){
                  window.location.href = "/join?userID="+index+"&password="+inputs["Password"].val();
                }
              });
            }
            else {
              window.location.href = "/join?userID="+index;
            }
          });
        }
      }
    });

    var flashText = $("<a>").appendTo(buttons);
    flashText.addClass("flexmiddle bold alttext spadding");
    flashText.attr("id", "start");
    flashText.css("font-family", "Arial");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.css("color", "white");
    flashText.text("Main Menu");
    flashText.click(function(){
      window.location.href = "/";

    });

    var flashText = $("<a>").appendTo(buttons);
    flashText.addClass("flexmiddle bold dull spadding");
    flashText.attr("id", "start");
    flashText.css("font-family", "Arial");
    flashText.css("text-shadow", "0px 0px 3px black");
    flashText.css("color", "white");
    flashText.text("Exit");
    flashText.click(function(){
      $.ajax({
        url: "/exit",
        error: function(code) {
          console.log(code);
        },
        dataType: 'json',
        success: function(resData) {

        },
        type: 'GET'
      });
    });
  }
}
