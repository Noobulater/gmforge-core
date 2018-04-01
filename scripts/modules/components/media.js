sync.render("ui_media", function(obj, app, scope){
  if (!obj) {
    obj = game.media;
  }
  var div = $("<div>");
  div.addClass("foreground alttext flex flexcolumn");
  var data = {};
  if (obj && obj.data) {
    data = obj.data;
  }


  var reg = /(v=)([^&]*)/;
  var reg1 = /[^\/]*([^&^?\/]*)$/;
  var time = /[^?]*t=([^&^?]*)$/;
  var list = /[^?]*list=([^&^?]*)$/;
  var index = /[^?]*index=([^&^?]*)$/;
  function getData() {
    var returnData = {};
    var res = reg.exec(video.val());
    if (res) {
      returnData.video = res[2];
    }
    else {
      var res = reg1.exec(video.val());
      if (res) {
        returnData.video = res[0].split("?")[0];
      }
    }
    var timeReg = time.exec(video.val());
    if (timeReg) {
      returnData.time = timeReg[1];
    }
    /*var listReg = list.exec(video.val());
    console.log(listReg);
    if (listReg) {
      returnData.list = listReg[1];
    }
    returnData.list = "LFgquLnL59ak-4CpDgS6u0eXKtz_VgGfX";
    var indexReg = index.exec(video.val());
    console.log(indexReg);
    if (indexReg) {
      returnData.index = indexReg[1];
    }
    console.log(returnData);*/
    return returnData;
  }

  var searchDiv = $("<div>").appendTo(div);
  searchDiv.addClass("flexrow lpadding outline");
  searchDiv.css("font-size", "1.6em");

  var searchInput = genInput({
    classes : "line middle flex",
    parent : searchDiv,
    placeholder : "Search for Videos",
  });
  searchInput.bind("input", function(){
    function getRequest(searchTerm) {
      url = 'https://www.googleapis.com/youtube/v3/search';
      var params = {
        part: 'snippet',
        key: 'AIzaSyBT-c44FBm7008tgjjrXtewMRo2IZR_HUo',
        q: searchTerm,
        maxResults : 8,
      };

      $.getJSON(url, params, function (searchTerm) {
        showResults(searchTerm);
      });
    }
    if ($(this).val()) {
      getRequest($(this).val().split("&ab_channel=")[0]);
    }
    else {
      searchList.empty();
    }
  });


  /*var video = genInput({
    parent: searchDiv,
    classes : "line middle",
    placeholder: "URL",
    value: data.video,
    style: {"width": "100px"},
  });
  video.change(function(){
    if ($(this).val()) {
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        runCommand("media", {cmd : "update", data : getData()});
      }
      else {
        runCommand("reaction", $(this).val());
      }
      $(this).val("");
      $("#media-player").hide();
    }
  });*/

  var searchList = $("<div>").appendTo(div);
  searchList.addClass("flexcolumn flex white");
  function showResults(results) {
    var html = "";
    var entries = results.items;
    searchList.empty();
    $.each(entries, function (index, value) {
      var resultDiv = $("<div>").appendTo(searchList);
      resultDiv.addClass("flexrow outlinebottom hover2 white flex");
      resultDiv.attr("videoId", value.id.videoId);
      resultDiv.css("color", "#333");
      resultDiv.css("text-shadow", "none");

      var img = $("<div>").appendTo(resultDiv);
      img.addClass("flex");
      img.css("background-image", "url('"+value.snippet.thumbnails.high.url+"')");
      img.css("background-size", "contain");
      img.css("background-position", "center");
      img.css("background-repeat", "no-repeat");

      var title = $("<p>").appendTo(resultDiv);
      title.addClass("bold flex2 flexmiddle");
      title.text(value.snippet.title);

      resultDiv.click(function(){
        if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
          runCommand("media", {cmd : "update", data : {video : $(this).attr("videoId")}});
        }
        else {
          runCommand("reaction", "https://www.youtube.com/watch?v="+$(this).attr("videoId"));
        }

        $("#media-player").hide();
      });
    });
  }

  return div;
});
