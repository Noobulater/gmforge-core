sync.render("ui_quickCalc", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var input = genInput({
    placeholder : "Enter Math",
    value : "",
    parent : div,
  });
  input.addClass("fit-x");
  input.change(function(){
    input.val("");
  });
  var results = $("<div>").appendTo(div);
  results.addClass("bold flexmiddle");
  function buildResults(term) {
    results.empty();

    results.text(sync.eval(term));
  }

  input.keyup(function(){
    buildResults($(this).val());
  });

  return div;
});
