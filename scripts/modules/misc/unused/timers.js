sync.render("ui_timer", function(obj, app, scope){
  scope = scope || {};
  var div = $("<div>");

  $("<b class='lrpadding fit-x hover2' style='padding-right:1.5em;'>It's My Turn!</b>")

  var pop = ui_popOut({
    id : "my-turn-"+key,
    target : $("#player-image-plate-"+key),
    align : "top",
    noCss : true,
    style : {"font-size" : "1.4em", background : player.color}
  }, );
  pop.addClass("my-turn alttext outline");
  pop.click(function(){
    layout.coverlay($(this), 500);
  });

  return div;
});
