sync.render("ui_triggerBuilder", function(obj, app, scope){
  scope = scope || {
    board : app.attr("board"),
    layer : app.attr("layer"),
    piece : app.attr("piece"),
  };

  var board = getEnt(scope.board);
  var pieceData = board.data.layers[scope.layer].p[scope.piece];

  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn");

  var row = $("<div>").appendTo(div);
  row.addClass("flexrow flexaround");

  var collDiv = $("<div>").appendTo(row);
  collDiv.addClass("flexcolumn flex spadding");

  var effectDiv = $("<div>").appendTo(div);
  effectDiv.addClass("flexcolumn");

  var effectTgt = $("<div>").appendTo(effectDiv);
  effectTgt.addClass("flexrow flex spadding");

  effectTgt.append("<b>Event Type</b>");

  var effect = $("<select>").appendTo(effectTgt);
  effect.addClass("smooth lrmargin flex");
  //effect.append("<option value='0'>Resolve Macro</option>");
  for (var i in util.events) {
    effect.append("<option value="+i+">"+util.events[i].name+"</option>");
  }
  effect.change(function(){
    obj.data.e = $(this).val();
    if (util.events[obj.data.e]) {
      util.events[obj.data.e].load(obj, app, scope, $(this).val());
    }
    obj.update();
  });
  effect.children().each(function(){
    if ($(this).attr("value") == data.e) {
      $(this).attr("selected", true);
    }
  });
  if (util.events[data.e]) {
    util.events[data.e].interface(obj, app, scope, board, pieceData).appendTo(effectDiv);
  }

  return div;
});
