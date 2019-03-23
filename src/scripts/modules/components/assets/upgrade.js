sync.render("ui_upgrade", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", mode : app.attr("mode")}

  var div = $("<div>");
  div.addClass("flexcolumn flex inactive");

  /*

  {
    info : {
      name : {},
      img : {},
      notes : {},
    },
    cond : "",
    bonus : [
      {
        cond : "",
        target : "",
        eq : "",
      }
    ],
    cost : [
      {
        cond : "",
        target : "",
        value : ""
      }
    ],
    reset : []
  }

  */


  var titlePlate = $("<div>").appendTo(div);
  titlePlate.addClass("flexrow");

  var image = $("<div>").appendTo(titlePlate);
  image.addClass("outline smooth hover2 margin white");
  image.css("width", "150px");
  image.css("height", "150px");

  var namePlate = $("<div>").appendTo(titlePlate);
  namePlate.addClass("flexcolumn flex");

  var title = genInput({
    parent : namePlate,
    classes : "margin",
    placeholder : "Package Title",
  });

  var packageDesc = genInput({
    parent : namePlate,
    type : "textarea",
    classes : "flex margin",
    placeholder : "Package Summary",
  });

  var buttonPlate = $("<div>").appendTo(div);
  buttonPlate.addClass("flexrow");

  var addButton = $("<div>").appendTo(buttonPlate);
  addButton.addClass("flexmiddle alttext padding subtitle hover2 smooth");
  addButton.text("Bonus Effects");
  addButton.click(function(){
    app.removeAttr("mode");
    obj.update();
  });

  var costButton = $("<div>").appendTo(buttonPlate);
  costButton.addClass("flexmiddle alttext padding subtitle hover2 smooth");
  costButton.text("Cost Effects");
  costButton.click(function(){
    app.attr("mode", "cost");
    obj.update();
  });

  var removeButton = $("<div>").appendTo(buttonPlate);
  removeButton.addClass("flexmiddle padding subtitle hover2 smooth");
  removeButton.text("Reset Effects");
  removeButton.click(function(){
    app.attr("mode", "reset");
    obj.update();
  });

  var effectsPlate = $("<div>").appendTo(div);
  effectsPlate.addClass("flex flexcolumn outline smooth white");

  if (!scope.mode) {
    addButton.addClass("highlight");
    costButton.addClass("background");
    removeButton.addClass("button").css("color", "#333");

    var boonPlate = $("<div>").appendTo(effectsPlate);
    boonPlate.addClass("flex scroll-y lrpadding");

    sync.render("ui_math")(getPlayerCharacter(getCookie("UserID")) || obj, app, {calc : []}).appendTo(boonPlate);

    var newBoonWrap = $("<div>").appendTo(effectsPlate);
    newBoonWrap.addClass("fit-x flexrow flexaround bold lrpadding subtitle create");

    var addTalent = genIcon("plus", "Add Talent").appendTo(newBoonWrap);
    addTalent.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Name" : "",
        },
        click : function(ev, inputs) {
          if (inputs["Name"].val()) {
            var lookupData = {};
            lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = sync.newValue(inputs["Name"].val());
          }
        }
      });
    });
    var addSpecial = genIcon("plus", "Add Special Rule").appendTo(newBoonWrap);
    addSpecial.click(function(){
      ui_prompt({
        target : $(this),
        inputs : {
          "Name" : "",
        },
        click : function(ev, inputs) {
          if (inputs["Name"].val()) {
            var lookupData = {};
            lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = sync.newValue(inputs["Name"].val());
          }
        }
      });
    });
  }
  if (scope.mode == "cost") {
    costButton.addClass("highlight");
    addButton.addClass("background");
    removeButton.addClass("button").css("color", "#333");

    var banePlate = $("<div>").appendTo(effectsPlate);
    banePlate.addClass("flex scroll-y lrpadding");

    sync.render("ui_math")(getPlayerCharacter(getCookie("UserID")) || obj, app, {calc : []}).appendTo(banePlate);

    var newBaneWrap = $("<div>").appendTo(effectsPlate);
    newBaneWrap.addClass("fit-x flexrow flexaround bold lrpadding subtitle destroy");

    var removeTalent = genIcon("minus", "Remove Talent").appendTo(newBaneWrap);

    var removeSpecial = genIcon("minus", "Remove Special Rule").appendTo(newBaneWrap);
  }
  else if (scope.mode == "reset") {
    removeButton.addClass("alttext highlight");
    costButton.addClass("background");
    addButton.addClass("background");

    var banePlate = $("<div>").appendTo(effectsPlate);
    banePlate.addClass("flexcolumn flex scroll-y");

    var newBaneWrap = $("<div>").appendTo(banePlate);
    newBaneWrap.addClass("flexmiddle fit-x destroy");

    var newBane = genIcon("minus", "Remove Effect").appendTo(newBaneWrap);
    newBane.click(function(){
      sync.render("ui_math")(obj, app, {calc : []}).appendTo(banePlate);
    });
  }


  return div;
});
