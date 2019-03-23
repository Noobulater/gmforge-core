var shakeEvent;

sync.render("ui_dice", function(obj, app, scope){
  if (!game.templates || !game.templates.dice) {
    return $("<diV>");
  }
  var diceArray = game.templates.dice.pool;
  scope = scope || {};
  scope.width = scope.width || "50px";
  scope.height = scope.height || "50px";
  scope["font-size"] = scope["font-size"] || "1.2em";

  var value = obj;
  var context = value.ctx;
  var key = game.templates.dice.defaults[0];
  if (context && context["die"]) {
    key = sync.rawVal(context["die"]);
  }
  var diceData = diceArray[key] || diceArray[game.templates.dice.defaults[0]]; // for custom

  scope.translate = scope.translate || function(ui, valueObj, result) {
    if (diceData && diceData.translations) {
      ui.empty();
      ui.css("width", "100%");
      ui.css("height", "100%");

      if (result == null) {
        result = value.v;
      }
      if (result != null && !String(result).match(diceRegex)) {
        result = sync.eval(result);
        if (diceData.translations[result]) {
          for (var imgIndex in diceData.translations[result].imgs) {
            var img = diceData.translations[result].imgs[imgIndex];
            if (img) {
              var imgDiv = $("<div>").appendTo(ui);
              imgDiv.css("background-image", "url('"+img+"')");
              imgDiv.css("background-repeat", "no-repeat");
              imgDiv.css("background-position", "center");
              imgDiv.css("background-size", "contain");
              imgDiv.css("margin", "auto");
              imgDiv.css("width", Math.floor(100/diceData.translations[result].imgs.length) + "%");
              imgDiv.css("height", Math.floor(100/diceData.translations[result].imgs.length) + "%");
            }
          }
        }
      }
    }
    else {
      ui.css("width", "auto");
      ui.css("height", "auto");
      if (result == null || (result != null && String(result).match(diceRegex))) {
        ui.text(diceData.value);
      }
      else {
        ui.text(result);
      }
    }
  }

  var die = $("<div>");

  die.addClass("flexmiddle");
  die.css("border-radius", "20%");
  die.css("width", scope.width);
  die.css("height", scope.height);
  die.css("position", "relative");

  if (sync.rawVal(value.ctx.die) == "d2") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("border-radius", "50%");
    dieShape.css("background-color", "#333");
  }
  else if (sync.rawVal(value.ctx.die) == "d4") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d4.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d6") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d6.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d8") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d8.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d10") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d10.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d12") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d12.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");
  }
  else if (sync.rawVal(value.ctx.die) == "d20") {
    var dieShape = $("<div>").appendTo(die);
    dieShape.addClass("flexmiddle");
    dieShape.css("border-radius", "20%");
    dieShape.css("width", scope.width);
    dieShape.css("height", scope.height);
    dieShape.css("position", "relative");
    dieShape.css("background-image", "url('/content/dice/d20.png')");
    dieShape.css("background-size", "100% 100%");
    dieShape.css("background-repeat", "no-repeat");
    dieShape.css("background-color", "transparent");

  }
  else {
    die.addClass("dice");
  }


  for (var key in diceData.display) {
    die.css(key, diceData.display[key]);
  }

  var rollResult = $("<div>").appendTo(die);
  rollResult.css("position", "absolute");
  rollResult.css("text-align", "center");
  rollResult.css("color", "white");
  rollResult.css("font-size", scope["font-size"]);
  rollResult.css("font-weight", "bold");
  rollResult.css("word-break", "keep-all");
  rollResult.attr("key", sync.rawVal(value.ctx.die)); // dice type
  rollResult.css("pointer-events", "none");

  for (var key in scope.attr) {
    rollResult.attr(key, scope.attr[key]);
  }

  scope.translate(rollResult, value, scope.value);
  die.attr("title", value.e + "\n" + value.r);

  return die;
});
