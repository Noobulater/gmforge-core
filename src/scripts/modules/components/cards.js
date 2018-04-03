sync.render("ui_card", function(obj, app, scope) {
  scope = scope || {};

  var div = $("<div>");
  div.addClass("flexmiddle");

  var img = "/content/cards/backface.png";
  if (obj.data.flipped || (obj.data._s && hasSecurity(getCookie("UserID"), "Visible", obj.data)) || getCookie("UserID") == app.attr("UserID")) {
    img = obj.data.src;
  }
  div.attr("src", img);
  div.css("width", "64px");
  div.css("height", "96px");
  div.css("background-image", "url('"+(img)+"')");
  div.css("background-size", "100% 100%");
  div.css("background-repeat", "no-repeat");
  div.css("background-position", "center");

  if (scope.text || obj.data.text) {
    var namePlate = $("<b>"+(scope.text || obj.data.text)+"</b>").appendTo(div);
    namePlate.addClass("alttext lrpadding subtitle smooth outline");
    namePlate.css("pointer-events", "none");
    namePlate.css("background-color", "rgba(0,0,0,0.6)");
    namePlate.css("padding-right", "2em");
  }

  return div;
});


sync.render("ui_hand", function(obj, app, scope) {
  scope = scope || {player : app.attr("UserID")};

  if (!obj) {
    game.state.addApp(app);
    return $("<div>");
  }
  obj.data.cards = obj.data.cards || {};
  obj.data.cards.players = obj.data.cards.players || {};
  var playerData = scope.cardData || obj.data.cards.players[scope.player];

  var div = $("<div>");
  div.addClass("flexrow");
  if (getCookie("UserID") == scope.player) {
    div.sortable({
      update : function(ev, ui) {
        var finalOrder = [];
        div.children().each(function(){
          finalOrder.push(obj.data.cards.players[scope.player][$(this).attr("cardID")]);
        });
        obj.data.cards.players[scope.player] = finalOrder;
        if (obj == game.state) {
          obj.sync("updateCards");
        }
        else {
          obj.update();
        }
      }
    });
  }

  for (var i in playerData) {
    var card = sync.render("ui_card")({data : playerData[i]}, app, scope).appendTo(div);
    card.attr("cardID", i);
    if (i != 0) {
      card.css("margin-left", "-48px");
    }
    if (!playerData[i].flipped) {
      card.css("margin-top", "8px");
    }
    if ((obj.data._s && hasSecurity(getCookie("UserID"), "Visible", obj.data)) || getCookie("UserID") == scope.player) {
      card.addClass("hover2");
      card.click(function(){
        var cardID = $(this).attr("cardID");
        obj.data.cards.players[scope.player][cardID].flipped = !obj.data.cards.players[scope.player][cardID].flipped;
        if (obj == game.state) {
          obj.sync("updateCards");
        }
        else {
          obj.update();
        }
      });
      card.contextmenu(function(){
        var cardID = $(this).attr("cardID");
        var src = $(this).attr("src");
        var actionsList = [
          {
            name : "Announce Card",
            click : function(){
              runCommand("reaction", src);
            }
          },
          {
            name : "Discard",
            click : function(){
              obj.data.cards.players[scope.player].splice(cardID, 1);
              if (obj == game.state) {
                obj.sync("updateCards");
              }
              else {
                obj.update();
              }
            }
          },
          {
            name : "View Card",
            click : function(ev, ui){
              assetTypes["img"].preview(ev, ui, src);
            }
          },
        ];

        ui_dropMenu($(this), actionsList, {id : "card-menu"});
        return false;
      });
    }
  }

  return div;
});


sync.render("ui_deck", function(obj, app, scope) {
  obj.data.cards = obj.data.cards || {};
  obj.data.cards.players = obj.data.cards.players || {};

  var div = $("<div>");
  div.addClass("flexrow flexmiddle");

  if (obj.data.cards) {
    for (var i in obj.data.cards.decks) {
      var cards = $("<div>").appendTo(div);
      cards.addClass("flexmiddle alttext lrpadding");
      cards.attr("index", i);
      cards.css("margin-right", "4px");
      cards.css("width", 75 * 3/5);
      cards.css("height", 75 * 4/5);
      cards.css("background-image", "url('/content/cards/backface.png')");
      cards.css("background-size", "100% 100%");
      cards.css("background-repeat", "no-repeat");
      cards.css("background-position", "center");
      cards.append("<b>"+obj.data.cards.decks[i].pool.length+"</b>");
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        cards.addClass("hover2");
        cards.click(function(){
          var cardActions = [];
          var deck = $(this).attr("index");

          var deal = [];
          function draw(deck, number, player) {
            var deckData = game.state.data.cards.decks[deck];
            game.state.data.cards.players = game.state.data.cards.players || {};
            game.state.data.cards.players[player] = game.state.data.cards.players[player] || [];

            var cards = deckData.pool.splice(0, number);
            for (var i in cards) {
              game.state.data.cards.players[player].push(cards[i]);
            }

            game.state.sync("updateState");
          }

          for (var key in game.players.data) {
            var dealCards = [
              {
                name : "1 Card",
                attr : {user : key, num : 1},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "2 Cards",
                attr : {user : key, num : 2},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "3 Cards",
                attr : {user : key, num : 3},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "4 Cards",
                attr : {user : key, num : 4},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "5 Cards",
                attr : {user : key, num : 5},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "6 Cards",
                attr : {user : key, num : 6},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              },
              {
                name : "7 Cards",
                attr : {user : key, num : 7},
                click : function(ev, ui){
                  draw(deck, parseInt(ui.attr("num")), ui.attr("user"));
                }
              }
            ];

            cardActions.push({
              name : "Deal to " + game.players.data[key].displayName,
              submenu : dealCards
            });
          }

          cardActions.push({
            name : "Discard Deck",
            submenu : [
              {
                name : "CONFIRM",
                attr : {title : "Deletes this Deck", deck : $(this).attr("index")},
                click : function(ev, ui){
                   game.state.data.cards.decks.splice(ui.attr("deck"), 1);
                   game.state.sync("updateState");
                }
              }
            ]
          });

          cardActions.push({
            name : "Restore Deck",
            attr : {title : "Reshuffles all the cards", deck : $(this).attr("index")},
            click : function(ev, ui){
              var deckData = game.state.data.cards.decks[ui.attr("deck")];
              deckData.pool = [];
              var start = duplicate(util.decks[deckData.type]);
              while (start.length) {
                deckData.pool.push(start.splice(Math.floor(Math.random() * start.length), 1)[0]);
              }
              game.state.sync("updateState");
            }
          });

          cardActions.push({
            name : "Shuffle",
            attr : {title : "Reshuffles the remaining cards", deck : $(this).attr("index")},
            click : function(ev, ui){
              var deckData = game.state.data.cards.decks[ui.attr("deck")];
              var start = duplicate(deckData.pool);
              deckData.pool = [];
              while (start.length) {
                deckData.pool.push(start.splice(Math.floor(Math.random() * start.length), 1)[0]);
              }
              game.state.sync("updateState");
            }
          });

          cardActions.push({
            name : "Peek",
            attr : {title : "Peek at the next cards", deck : $(this).attr("index")},
            click : function(ev, ui){
              var content = $("<div>");
              content.addClass("flexrow");
              var deckData = game.state.data.cards.decks[ui.attr("deck")];
              for (var i=deckData.pool.length-1; i>=0; i--) {
                var dat = {data : duplicate(deckData.pool[i])};
                dat.data.flipped = true;
                dat.data.text = (i==0)?("Top Card"):(null);

                var card = sync.render("ui_card")(dat, app, {}).appendTo(content);
                card.attr("cardID", i);
                if (i != 0) {
                  card.css("margin-right", "-48px");
                }
                if (!deckData.pool[i].flipped) {
                  card.css("margin-top", "8px");
                }
              }

              ui_popOut({
                target : ui,
                noCss : true,
                id : "peek-deck",
              }, content).addClass("highlight");
            }
          });
          ui_dropMenu($(this), cardActions, {id : "cards", align : "top"});
        });
        cards.contextmenu(function(){
          $(this).click();
          return false;
        });
      }
    }
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var cards = $("<div>").appendTo(div);
      cards.addClass("hover2 flexmiddle");
      cards.attr("title", "Playing Cards");
      cards.css("width", 75 * 2/5);
      cards.css("height", 75 * 3/5);
      cards.css("background-image", "url('/content/cards/backfacegreen.png')");
      cards.css("background-size", "contain");
      cards.css("background-repeat", "no-repeat");
      cards.css("background-position", "center");
      cards.click(function(){
        var cards = [];

        cards.push({
          name : "Show Hands",
          click : function() {
            for (var id in game.state.data.cards.players) {
              if (id != getCookie("UserID")) {
                var content = $("<div>");
                content.addClass("flexcolumn");

                var namePlate = $("<b>"+(getPlayerCharacterName(id) || getPlayerName(id))+"</b>").appendTo(content);
                namePlate.addClass("alttext lrpadding subtitle smooth outline");
                namePlate.css("pointer-events", "none");
                namePlate.css("background-color", "rgba(0,0,0,0.6)");
                namePlate.css("padding-right", "2em");

                var newApp = sync.newApp("ui_hand").appendTo(content);
                newApp.addClass("flexmiddle");
                newApp.attr("UserID", id);

                game.state.addApp(newApp);

                var pop = ui_popOut({
                  target : $("#player-icon-"+id),
                  id : "hand-"+id,
                  align : "top",
                  noCss : true,
                  style : {"min-width" : "70px"},
                }, content);
                pop.attr("UserID", id);

                if (game.players.data[id].color) {
                  pop.css("background-color", game.players.data[id].color);
                }
                else {
                  pop.addClass("background");
                }
              }
            }
          }
        });

        cards.push({
          name : "Empty Hands",
          click : function() {
            game.state.data.cards.players = {};
            game.state.sync("updateState");
          }
        });

        var createDecks = [];
        for (var key in util.decks) {
          createDecks.push({
            name : key,
            attr : {deck : key},
            click : function(ev, ui){
              game.state.data.cards = game.state.data.cards || {}
              game.state.data.cards.decks = game.state.data.cards.decks || [];

              // shuffle
              var deckData = {type : ui.attr("deck"), pool : [], players : {}};
              var start = duplicate(util.decks[ui.attr("deck")]);
              while (start.length) {
                var index = Math.floor(Math.random() * start.length);
                var val = start.splice(index, 1)[0];
                deckData.pool.push(val);
              }
              game.state.data.cards.decks.push(deckData);

              game.state.sync("updateState");
            }
          });
        }

        cards.push({
          name : "Deal Unique Card",
          click : function(ev, ui) {
            var picker = sync.render("ui_filePicker")(obj, app, {
              filter : "img",
              change : function(ev, ui, val){
                var players = [];
                players.push({
                  name : "All Players",
                  attr : {player : key},
                  click : function(ev, ui){
                    var key = ui.attr("player");
                    game.state.data.cards.players = game.state.data.cards.players || {};

                    for (var key in game.players.data) {
                      game.state.data.cards.players[key] = game.state.data.cards.players[key] || [];
                      game.state.data.cards.players[key].push({src : val});
                    }

                    game.state.sync("updateState");
                  }
                });

                for (var key in game.players.data) {
                  players.push({
                    name : getPlayerCharacterName(key) || getPlayerName(key),
                    attr : {player : key},
                    click : function(ev, ui){
                      var key = ui.attr("player");
                      obj.data.cards.players = obj.data.cards.players || {};
                      obj.data.cards.players[key] = obj.data.cards.players[key] || [];
                      obj.data.cards.players[key].push({src : val});

                      game.state.sync("updateState");
                    }
                  });
                }

                ui_dropMenu(prompt, players, {id : "drop", align : "center"});
                layout.coverlay("unique-card");
              }
            });
            var prompt = ui_popOut({
              target : $("body"),
              prompt : true,
              id : "unique-card",
              style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
            }, picker);
          }
        });


        if (createDecks.length) {
          cards.push({name : "Create Deck", submenu : createDecks});
        }

        ui_dropMenu($(this), cards, {id : "cards", align : "top"});
      });
      cards.contextmenu(function(){
        $(this).click();
        return false;
      });
    }
  }

  return div;
});
