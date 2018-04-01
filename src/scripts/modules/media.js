var mediaPlayer = mediaPlayer || {iframe : null, width : '400', height : '200'};

function media_init() {
  if (mediaPlayer.disabled) {
    return false;
  }
  mediaPlayer.iframe = null;
  var contentCC = $("<div>");
  contentCC.bind("paste", function(e) {
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var reg = /([v][=])([\S]*)/;
      var ex = reg.exec(e.originalEvent.clipboardData.getData('text'));
      if (ex) {
        runCommand("media", {cmd : "update", data : {video : ex[2]}});
      }
    }
  });

  contentCC.on("dragover", function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      if (!$("#media-drag-overlay").length) {
        var olay = layout.overlay({
          target : contentCC,
          id : "media-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Load Video</b>");
      }
    }
  });
  contentCC.on('drop', function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    var dt = ev.originalEvent.dataTransfer;
    if (dt.getData("Text")) {
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        var reg = /([v][=])([\S]*)/;
        var ex = reg.exec(dt.getData("Text"));
        if (ex) {
          runCommand("media", {cmd : "update", data : {video : ex[2]}});
        }
      }
    }
    layout.coverlay("media-drag-overlay");
  });

  contentCC.on("dragleave", function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    layout.coverlay("media-drag-overlay");
  });

  var content = $("<div>").appendTo(contentCC);
  content.attr("id", "media");

  var frame = ui_popOut({
    id : "dragMedia",
    noCss : true,
    close : function(){
      runCommand("media", {cmd : "watching", video : ""});
    },
    style : {"position": "fixed", "min-width": "", "min-height": "", "z-index" : "2000", "background-color" : "white"}
  }, contentCC).removeClass("ui-popout").addClass("smooth");


  var seekingWrap = $("<div>").appendTo(contentCC);
  seekingWrap.addClass("flexrow flexbetween");

  var seeking = genInput({
    parent : seekingWrap,
    type: "range",
    min : 0,
    max : 0, // update this with
    style : {"padding" : "0px"}
  }).addClass("fit-x");
  // So messy, but hey it works
  seeking.hover(function(){
    mediaPlayer.manual = true;
  },
  function() {
    mediaPlayer.manual = false;
    mediaPlayer.update();
  });
  seeking.bind("input", function(){
    seekingLabel.empty();
    seekingLabel.text(String(parseInt($(this).val())/100).formatTime(1)+"/"+String(mediaPlayer.iframe.getDuration()).formatTime(1));
  });
  seeking.click(function() {
    mediaPlayer.manual = true;
    setTimeout(function(){mediaPlayer.manual = false;},10);
  });
  seeking.change(function() {
    if (mediaPlayer.iframe) {
      runCommand("media", {cmd : "update", data : {video : mediaPlayer.video, list : mediaPlayer.list, time : parseInt($(this).val())/100}});
      $(this).attr("disabled", "disabled");
    }
  });

  seekingWrap.append($("<div id='mediaControls' class='flexaround' style='font-size: 2em;'></div>"));

  var seekingLabel = $("<div>").appendTo($("#mediaControls"));
  seekingLabel.css("font-size", "12px");
  seekingLabel.addClass("flexmiddle lrmargin");
  seekingLabel.text("0:00/0:00");

  var div = $("<div>").appendTo($("#mediaControls"));
  div.addClass("flexmiddle");
  div.css("pointer-events", "auto");

  var volumeIcon = genIcon({icon : "volume-up", raw : true});
  volumeIcon.addClass("hover2 subtitle");
  volumeIcon.appendTo(div);
  volumeIcon.click(function(){
    var volumeContent = $("<div>");
    var volume = genInput({
      parent : volumeContent,
      type: "range",
      min : 0,
      value : 100,
      max : 400,
      style : {"padding": "0", "pointer-events" : "auto", "width" : "100px"},
    });

    volume.val(parseInt((getCookie("volume") || 100)));
    mediaPlayer.volume = parseInt((getCookie("volume") || 100));
    volume.change(function() {
      mediaPlayer.setVolume(Math.ceil($(this).val()/4));
      setCookie("volume", Math.ceil($(this).val()/4));
      mediaPlayer.volume = Math.ceil($(this).val()/4);
      if ($(this).val() == 0) {
        volumeIcon.changeIcon("volume-off");
        volumeIcon.addClass("subtitle");
      }
      else if ($(this).val() < 50) {
        volumeIcon.changeIcon("volume-down");
        volumeIcon.addClass("subtitle");
      }
      else {
        volumeIcon.changeIcon("volume-up");
        volumeIcon.addClass("subtitle");
      }
      $("#media-volume-label").text(" " + $(this).val() + "%");
    });

    ui_popOut({
      target : $(this),
      align : "top",
      title : "volume",
      id : "youtube-volume"
    }, volumeContent);
  });

  var value = $("<div class='flexmiddle'><b id='media-volume-label' style='font-size: 14px;'> "+(getCookie("volume") || 100)+"%</b></div>");
  value.addClass("hover2");
  value.click(function(){
    volumeIcon.click();
  });
  value.appendTo(div);

  var userCountDiv = $("<div>").appendTo(("#mediaControls"));
  userCountDiv.addClass("flexmiddle lrmargin");

  var userCount = genIcon({icon : "user", raw : true}).appendTo(userCountDiv);
  userCount.css("font-size", "12px");

  var userLabel = $("<div>").appendTo(userCountDiv);
  userLabel.attr("id", "mediausercount");
  userLabel.css("font-size", "12px");
  userLabel.addClass("flexmiddle");
  userLabel.text("x1");

  //var nextIcon = genIcon("forward").appendTo($("#mediaControls"));
  // states
  // 0 NO VIDEO
  // 1 LOADING
  // 2 READY
  // 3 PLAYING
  // 4 OUT OF SYNC
  function onYouTubeIframeAPIReady() {

  }

  function onPlayerReady(event) {
    mediaPlayer.play(); // prime the video for playing
    mediaPlayer.update();
    mediaPlayer.volume = mediaPlayer.volume || parseInt((getCookie("volume") || 100));
    mediaPlayer.setVolume(Math.ceil((mediaPlayer.volume)/4));
    mediaPlayer.update();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  mediaPlayer.think = function() {
    if (mediaPlayer.iframe.getCurrentTime() < mediaPlayer.iframe.getDuration() && mediaPlayer.iframe.getPlayerState() == YT.PlayerState.PLAYING) {
      mediaPlayer.update(true);
      setTimeout(mediaPlayer.think, 100);
    }
  }

  function onPlayerStateChange(event) {
    if (!mediaPlayer.executing) {
      if (event.data == YT.PlayerState.PLAYING) {
        // changed state to playing, better execute it
        mediaPlayer.executing = {cmd : "waiting"};
        mediaPlayer.pause(); // counter the last action
      }
      else if (event.data == YT.PlayerState.PAUSED) {
        runCommand("media", {cmd : "update", data : {video : mediaPlayer.video, list : mediaPlayer.list, time : mediaPlayer.iframe.getCurrentTime()}});
      }
    }
    else if (mediaPlayer.executing.cmd == "play") {
      if (event.data == YT.PlayerState.PLAYING) {
        mediaPlayer.think();
        delete mediaPlayer.executing;
      }
      else {
        mediaPlayer.play(); // get this shit playing
      }
    }
    else if (mediaPlayer.executing.cmd == "update") {
      if (event.data == YT.PlayerState.PLAYING) {
        mediaPlayer.pause(); // get this shit paused
      }
      else if (event.data == YT.PlayerState.PAUSED) {
        // all ready
        if (mediaPlayer.executing.time != null) {
          mediaPlayer.iframe.seekTo(mediaPlayer.executing.time || 0);
        }
        delete mediaPlayer.executing;
        //once it is all complete send ack
        runCommand("media", {cmd : "update-ack", data : {state : 2}});
      }
      else {
        mediaPlayer.play(); // get this shit playing to start buffering
      }
    }
    else if (mediaPlayer.executing.cmd == "waiting") {
      if (event.data == YT.PlayerState.PAUSED) {
        runCommand("media", {cmd : "play"});
        delete mediaPlayer.executing;
      }
      else {
        mediaPlayer.executing = {cmd : "waiting"};
        mediaPlayer.pause(); // counter the last action
      }
    }
    mediaPlayer.lastState = event.data;
  }

  mediaPlayer.update = function(update) {
    if (mediaPlayer.iframe != null) {
      seeking.attr("max", mediaPlayer.iframe.getDuration() * 100);

      if (!mediaPlayer.manual || update) {
        seeking.val(Math.floor(mediaPlayer.iframe.getCurrentTime() * 100));
      }
      seekingLabel.empty();
      seekingLabel.text(String(mediaPlayer.iframe.getCurrentTime()).formatTime(1)+"/"+String(mediaPlayer.iframe.getDuration()).formatTime(1));
    }
  }

  mediaPlayer.setVolume = function(amt) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.setVolume) {
      return mediaPlayer.iframe.setVolume(amt);
    }
  }

  mediaPlayer.play = function(time) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.playVideo) {
      return mediaPlayer.iframe.playVideo();
    }
  }

  mediaPlayer.pause = function(time) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.pauseVideo) {
      return mediaPlayer.iframe.pauseVideo();
    }
  }

  mediaPlayer.isPlaying = function(time) {
    if (mediaPlayer.iframe) {
      return mediaPlayer.getState() == 3;
    }
    return false;
  }

  mediaPlayer.getState = function() {
    if (mediaPlayer.iframe) {
      var state = mediaPlayer.iframe.getPlayerState();
      if (state == YT.PlayerState.PLAYING) {
        return 3;
      }
      else if (state == YT.PlayerState.PAUSED) {
        return 2;
      }
      return 1;
    }
    return 0;
  }
  var _watching = {};
  mediaPlayer.command = function(data) {
    if (mediaPlayer.disabled) {
      return false;
    }
    if (data.cmd == "watching") {
      // live count of who's watching what
      if (data.userID) {
        if (data.video) {
          _watching[data.userID] = data.video;
        }
        else {
          delete _watching[data.userID];
        }
      }
      var count = 0;
      for (var key in _watching) {
        if (_watching[key] == mediaPlayer.video) {
          count = count + 1;
        }
      }
      $("#mediausercount").text("x"+count);
      return;
    }
    if (data.cmd == "play") {
      // if the server is sending this command we are OK to play the video
      mediaPlayer.executing = data;
      mediaPlayer.play();
    }
    else if (data.cmd == "update") {
      if (!mediaPlayer.iframe) {
        console.log(data.data.list);
        mediaPlayer.iframe = new YT.Player('media', {
          width: mediaPlayer.width,
          height: mediaPlayer.height,
          videoId: data.data.video,
          playerVars: {controls: 0, disablekb: 1, fs: 0, showinfo: 0, iv_load_policy: 3, rel: 0, start : (data.data.time || 0)},
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        $("#dragMedia").css("left", $(window).outerWidth()/2 - $("#dragMedia").outerWidth()/2);
        $("#dragMedia").css("top", $(window).outerHeight() - $("#dragMedia").outerHeight());
      }
      else {
        if (data.data.video != mediaPlayer.video) {
          mediaPlayer.iframe.cueVideoById({videoId : data.data.video, startSeconds : (data.data.time || 0)});
        }
        else if (data.data.time != null && mediaPlayer.iframe.getCurrentTime() != (data.data.time || 0)) {
          mediaPlayer.iframe.seekTo(data.data.time || 0);
        }
        seeking.removeAttr("disabled");
        setTimeout(function() {mediaPlayer.update(true);}, 100);
      }
      mediaPlayer.video = data.data.video;
      //mediaPlayer.list = data.data.list;
      //mediaPlayer.index = data.data.index;
      mediaPlayer.executing = data;

      mediaPlayer.play();
    }
    runCommand("media", {cmd : "watching", video : mediaPlayer.video});
  }
}
