sync.render("ui_quickSearch", function(obj, app, scope) {
  var div = $("<div>");

  var searchWrap = $("<div>").appendTo(div);
  searchWrap.addClass("flexrow size4 white");

  var categories = {
    "c" : {n : "Actors", i : "user", ui : "ui_characterSheetv2", width : assetTypes["c"].width, height : assetTypes["c"].height},
    "i" : {n : "Elements", i : "briefcase", ui : "ui_renderItemv2", width : assetTypes["i"].width, height : assetTypes["i"].height},
  };

  var buttonWrap = $("<div>").appendTo(searchWrap);
  buttonWrap.addClass("flexrow");

  for (var i in categories) {
    var button = $("<button>").appendTo(buttonWrap);
    if (i == obj.data.filter) {
      button.addClass("highlight alttext");
      button.append(genIcon(categories[i].i));
    }
    else {
      button.append(genIcon(categories[i].i).css("color", "#333"));
    }
    button.attr("type", i);
    button.attr("title", categories[i].n);
    button.click(function(){
      obj.data.filter = $(this).attr("type");
      obj.update();
    });
  }

  var search = genInput({
    parent : searchWrap,
    classes : "fit-x line lrpadding lrmargin",
    placeholder : "Search for " + assetTypes[obj.data.filter].n,
  });
  search.bind("input", function(ev){
    buildResults($(this).val());
  });


  var searchList = $("<div>").appendTo(div);
  searchList.addClass("scroll-y");
  searchList.css("max-height", "200px");

  var cache = [];
  for (var i in game.locals["workshop"].data) {
    var entryData = game.locals["workshop"].data[i];
    if (!game.config.data.library || !game.config.data.library.packs || hasSecurity(getCookie("UserID"), "Visible", game.config.data.library.packs[i])) {
      for (var j in entryData.data.content) {
        var contentList = entryData.data.content[j];
        if (contentList._t == obj.data.filter) {
          for (var k in contentList.data) {
            var content = contentList.data[k];

            cache.push(contentList.data[k]);

            var ent = sync.render("ui_ent")({id : function(){return false},data : contentList.data[k]}, app, {height : 25}).appendTo(searchList);
            ent.addClass("white");
            ent.attr("draggable", true);
            ent.attr("index", cache.length-1);
            ent.on("dragstart", function(ev){
              var dt = ev.originalEvent.dataTransfer;
              dt.setData("OBJ", JSON.stringify(cache[$(this).attr("index")]));
            });
          }
        }
      }
    }
  }
  function buildResults(text){
    var term = (text || "").toLowerCase();
    searchList.children().each(function(){
      if ($(this).attr("index") && term) {
        var ent = cache[$(this).attr("index")];
        if (ent) {
          var name;
          if (obj.data.filter == "t" || obj.data.filter == "s") {
            name = (sync.rawVal(ent.name) || "").toLowerCase();
          }
          else {
            name = (sync.rawVal(ent.info.name) || "").toLowerCase();
          }
          var hide = false;
          for (var tag in ent.tags) {
            if (tag.match(String(term))) {
              hide = true;
              break;
            }
          }
          if (name.match(String(term))) {
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
        $(this).fadeIn();
      }
    });
  }

  return div;
});
