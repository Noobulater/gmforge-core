navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function initializeCamera(){
  if (!comms.stream) {
    function menu() {
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
        var constraints = {audio : true, video : true};
        var content = $("<div>");
        content.addClass("flexcolumn flex");

        content.append("<b>Audio Device</b>");
        var audioSelect = $("<select>").appendTo(content);
        audioSelect.addClass("fit-x");

        content.append("<b>Video Device</b>");
        var videoSelect = $("<select>").appendTo(content);
        videoSelect.addClass("fit-x");


        for (var i in devices) {
          var devData = devices[i];
          if (devData.kind == "audioinput") {
            audioSelect.append("<option value='"+devData.deviceId+"'>"+devData.label+"</option>");
          }
          if (devData.kind == "videoinput") {
            videoSelect.append("<option value='"+devData.deviceId+"'>"+devData.label+"</option>");
          }
        }
        audioSelect.append("<option value='Disabled'>Disabled</option>");
        audioSelect.change(function(){
          if ($(this).val() == "Disabled") {
            constraints.video = false;
            constraints.audio = false;
          }
          else {
            constraints.audio = {deviceId: $(this).val()};
          }
        });
        videoSelect.append("<option value='Disabled'>Disabled</option>");
        videoSelect.change(function(){
          if ($(this).val() == "Disabled") {
            constraints.video = false;
          }
          else {
            constraints.audio = constraints.audio || true;
            constraints.video = {deviceId: $(this).val()};
          }
        });

        var warning = $("<i>").appendTo(content);
        warning.addClass("flexmiddle subtitle bold")
        warning.text("Make sure your webcam is not being used in any other application");

        var confirm = $("<button>").appendTo(content);
        confirm.addClass("highlight alttext");
        confirm.text("Confirm");
        confirm.click(function(){
          navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
             comms.stream = stream;
             comms.initialize();
           })
           .catch(function(error) {
             var constraints = {audio : true};
             navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
               comms.stream = stream;
               comms.initialize();
             })
             .catch(function(error) {
               console.log("navigator.getUserMedia error: ", error);
             });
             console.log("navigator.getUserMedia error trying audio", error);
          });
          layout.coverlay("target-devices");
        });

        ui_popOut({
          target : $("body"),
          id : "target-devices",
          title : "Select Devices",
          style : {"width" : "300px"}
        }, content);
      }).catch(function(err) {
        sendAlert({text : err});
      });
    }
    navigator.mediaDevices.getUserMedia({audio : true, video : true}).then(function(){
      menu();
    }).catch(function(){
      menu();
    });
  }
  else {
    comms.initialize();
  }
}



var comms = {};
comms.peers = {};
comms.showFeed = function(player, stream, extrapop) {
  var id = player || getCookie("UserID");
  stream = stream || comms.stream;
  var content;

  var mediaContainer = $("<div>");
  mediaContainer.addClass("alttext dragcontrol");
  mediaContainer.attr("id", "media-frame-"+id);
  mediaContainer.css("position", "relative");

  var newApp = $("<div>");

  var newCards = $("<div>");

  if (stream.getVideoTracks().length) {
    content = $("<video>").appendTo(mediaContainer);
    content.attr('height', "150px");
    content.attr('width', "auto");

    mediaContainer.contextmenu(function(ev){
      var content = $(this);
      var actionList = [
        {
          name : "Small",
          click : function(){
            newApp.css("font-size", "");
            content.css("font-size", "");
            $(content.children()[0]).height("150px");
          }
        },
        {
          name : "Normal",
          click : function(){
            newApp.css("font-size", "0.8em");
            content.css("font-size", "1.2em");
            $(content.children()[0]).height($(window).height()/4);
          }
        },
        {
          name : "Large",
          click : function(){
            newApp.css("font-size", "0.6em");
            content.css("font-size", "1.6em");
            $(content.children()[0]).height($(window).height()/2);
          }
        },
        {
          name : "Toggle Cards",
          click : function(){
            if (!newCards.is(":visible")) {
              newCards.show();
            }
            else {
              newCards.hide();
            }
          }
        },
        {
          name : "Toggle Character",
          click : function(){
            if (!newApp.is(":visible")) {
              newApp.show();
            }
            else {
              newApp.hide();
            }
          }
        },
      ];

      ui_dropMenu($(this), actionList, {id : "resize-voice"});
      return false;
    });
  }
  else {
    mediaContainer.css("height", "25px");
    mediaContainer.css("width", "150px");

    content = $("<audio>").appendTo(mediaContainer);
    content.attr('height', "1px");
    content.attr('width', "1px");

    mediaContainer.contextmenu(function(ev){
      return false;
    });
  }
  content.addClass("media-src");
  content.attr("id", "media-src-"+id);
  content.attr("defaultVolume", 1);
  content.attr("UserID", id);

  content.attr("autoplay", "1");
  content.attr("src", URL.createObjectURL(stream));
  content.css("pointer-events", "none");
  content.css("transition", "filter 1s");
  content.prop("volume", $("#media-src-"+player).attr("defaultVolume"));

  var channelControls = $("<div>").appendTo(mediaContainer);
  channelControls.addClass("spadding flexaround");

  var cControls = $("<div>").appendTo(channelControls);
  cControls.attr("id", "media-channels-"+id);
  cControls.attr("UserID", id);

  if (stream.getVideoTracks().length) {
    channelControls.addClass("flexcolumn");
    cControls.addClass("flexcolumn");
    channelControls.css("position", "absolute");
    channelControls.css("top", "0");
    channelControls.css("left", "0");
  }
  else {
    channelControls.addClass("flexrow");
    cControls.addClass("flexrow flexaround");
  }

  var chanColors = [
    "rgba(0,200,0,1)",
  ];

  for (var i=1; i<=chanColors.length; i++) {
    var channel = $("<div>").appendTo(cControls);
    channel.addClass("alttext spadding subtitle foreground smooth outline");
    channel.attr("channel", i);
    channel.attr("UserID", id);
    channel.attr("title", "Channel " + i);
    channel.css("background-color", chanColors[i-1]);
    channel.css("opacity", "0.5");
    channel.text("Whisper");
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      channel.css("cursor", "pointer");
      channel.click(function(){
        var channels = {};
        $("#media-channels-"+id).children().each(function(){
          if ($(this).attr("channel")) {
            if ($(this).css("opacity") == "1") {
              channels[$(this).attr("channel")] = true;
            }
          }
        });
        if (!channels[$(this).attr("channel")]) {
          channels[$(this).attr("channel")] = true;
        }
        else {
          delete channels[$(this).attr("channel")];
        }
        runCommand("comms", {cmd : "channel", players : [$(this).attr("UserID")], channels : channels});
      });
    }
  }

  if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
    cControls.hide();
  }

  var deafen = genIcon("headphones").appendTo(channelControls);
  deafen.attr("id", "deafen-"+id);
  deafen.attr("title", "Deafen");
  deafen.attr("UserID", id);
  deafen.css("opacity", "0.5");
  deafen.click(function(){
    if (deafen.css("opacity") == "0.5") {
      if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
        comms.deafen(id, true);
      }
      else {
        runCommand("comms", {cmd : "deafen", players : [$(this).attr("UserID")]});
      }
    }
    else {
      if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
        comms.undeafen(id, true);
      }
      else {
        runCommand("comms", {cmd : "undeafen", players : [$(this).attr("UserID")]});
      }
    }
  });

  var mute = genIcon("volume-off").appendTo(channelControls);
  mute.attr("id", "mute-"+id);
  mute.attr("title", "Mute");
  mute.attr("UserID", id);
  mute.css("opacity", "0.5");
  mute.click(function(){
    if (mute.css("opacity") == "0.5") {
      if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
        comms.mute(id, true);
      }
      else {
        runCommand("comms", {cmd : "mute", players : [$(this).attr("UserID")]});
      }
    }
    else {
      if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
        comms.unmute(id, true);
      }
      else {
        runCommand("comms", {cmd : "unmute", players : [$(this).attr("UserID")]});
      }
    }
  });

  var reveal = genIcon("eye-close").appendTo(channelControls);
  reveal.attr("id", "reveal-"+id);
  reveal.attr("title", "Hide");
  reveal.attr("UserID", id);
  reveal.css("opacity", "0.5");

  if ((getCookie("UserID") == player || hasSecurity(getCookie("UserID"), "Assistant Master")) && content.is("video")) {
    reveal.click(function(){
      if (reveal.css("opacity") == "0.5") {
        runCommand("comms", {cmd : "hide", players : [$(this).attr("UserID")]});
        reveal.css("opacity", "1.0");
      }
      else {
        runCommand("comms", {cmd : "reveal", players : [$(this).attr("UserID")]});
        reveal.css("opacity", "0.5");
      }
    });
  }

  var localControls = $("<div>");
  localControls.addClass("flexrow spadding smooth");
  localControls.css("background-color", "rgba(0,0,0,0.4)");

  if (stream.getVideoTracks().length) {
    localControls.appendTo(mediaContainer);
    localControls.css("position", "absolute");
    localControls.css("top", "0");
    localControls.css("right", "0");
  }
  else {
    localControls.appendTo(channelControls);
  }

  if (id == getCookie("UserID")) {
    var localDeafen = genIcon("headphones").appendTo(localControls);
    localDeafen.addClass("lrmargin");
    localDeafen.attr("id", "local-deafen-"+id);
    localDeafen.attr("title", "Local Deafen");
    localDeafen.attr("UserID", id);
    localDeafen.css("opacity", "0.5");
    localDeafen.click(function(){
      if (localDeafen.css("opacity") == "1") {
        comms.undeafen(id, true);
      }
      else {
        comms.deafen(id, true);
      }
    });
  }

  var localMute = genIcon("volume-off").appendTo(localControls);
  localMute.addClass("lrmargin");
  localMute.attr("id", "local-mute-"+id);
  localMute.attr("title", "Local Mute");
  localMute.attr("UserID", id);
  localMute.css("opacity", "0.5");
  localMute.click(function(){
    if (localMute.css("opacity") == "1") {
      comms.unmute(id, true);
      if (getCookie("UserID") == $(this).attr("UserID")) {
        runCommand("comms", {cmd : "localUnMute"});
      }
    }
    else {
      comms.mute(id, true);
      if (getCookie("UserID") == $(this).attr("UserID")) {
        runCommand("comms", {cmd : "localMute"});
      }
    }
  });

  var target;
  $(".playerPlate").each(function(){
    if ($(this).attr("UserID") == id) {
      target = $(this);
    }
  });
  if (target) {
    if (stream.getVideoTracks().length) {
      newApp = sync.newApp("ui_playerToken").appendTo(mediaContainer);
      newApp.attr("viewOnly", true);
      newApp.attr("UserID", id);
      newApp.css("height", "50px");
      newApp.css("color", "#333");
      newApp.css("text-shadow", "none");
      newApp.css("position", "absolute");
      newApp.css("bottom", "0");
      newApp.css("left", "0");

      game.players.addApp(newApp);


      newCards = sync.newApp("ui_hand").appendTo(mediaContainer);
      newCards.addClass("flexmiddle");
      newCards.attr("UserID", id);
      newCards.css("height", "50px");
      newCards.css("color", "#333");
      newCards.css("text-shadow", "none");
      newCards.css("position", "absolute");
      newCards.css("bottom", "0");
      newCards.css("right", "0");
      newCards.css("overflow", "hidden");

      game.state.addApp(newCards);

      if (hasSecurity(player, "Game Master")) {
        content.css("filter", "brightness(0)");
        reveal.css("opacity", "1.0");
      }
      else {
        newApp.css("font-size", "0.8em");
        mediaContainer.css("font-size", "1.2em");
      }
    }
    content[0].oncanplay = function(){
      content[0].play();
    };
    content[0].onerror = function(err){
      console.log(err);
    }
    var title = game.players.data[id].displayName;
    var pop = ui_popOut({
      target : target,
      id : "web-cam-"+id,
      align : "bottom",
      title : title,
      dragThickness : "0px",
      close : function(){
        pop.fadeOut();
        return false;
      }
    }, mediaContainer);
    pop.addClass("smooth subtitle web-cam");
    util.dockReveal(pop);
  }
}

comms.setup = function(id, stream){
  // build all the peer connections
  var pc = new RTCPeerConnection({"iceServers" : [
    {url : "stun:stun1.l.google.com:19302"},
    {url : "stun:stun2.l.google.com:19302"},
    {url : "stun:stun3.l.google.com:19302"},
    {url : "stun:stun4.l.google.com:19302"},
    {url : "stun:stun.stunprotocol.org:3478"},
  ]});

  pc.onicecandidate = function(evt) {
    if (evt.candidate) {
      connection.socket.emit("p2p", {"sdp" : JSON.stringify({candidate: evt.candidate, type : evt.type, target : evt.target}), target : id});
    }
  };

  // once remote stream arrives, show it in the remote video element
  pc.onaddstream = function (evt) {
    comms.peers[id].stream = evt.stream;
    comms.showFeed(id, evt.stream);
  };

  pc.onremovestream = function(ev){

  }

  pc.onnegotiationneeded = function() {

  }

  pc.close = function(){
    $("#web-cam-"+id).remove();
    delete comms.peers[id];
  }

  if (comms.stream) {
    pc.addStream(comms.stream);
  }
  comms.peers[id] = pc;
}

comms.shutdown = function(){
  if (comms.stream.getVideoTracks() && comms.stream.getVideoTracks().length) {
    comms.stream.getVideoTracks()[0].stop();
  }
  if (comms.stream.getAudioTracks() && comms.stream.getAudioTracks().length) {
    comms.stream.getAudioTracks()[0].stop();
  }
  comms.stream = null;
  for (var i in comms.peers) {
    if (comms.peers[i].stream) {
      if (comms.peers[i].stream.getVideoTracks() && comms.peers[i].stream.getVideoTracks().length) {
        comms.peers[i].stream.getVideoTracks()[0].stop();
      }
      if (comms.peers[i].stream.getAudioTracks() && comms.peers[i].stream.getAudioTracks().length) {
        comms.peers[i].stream.getAudioTracks()[0].stop();
      }
    }
    comms.peers[i].close();
    delete comms.peers[i];
  }
  comms.ready = false;
  runCommand("comms", {cmd : "disconnect"});
  $(".web-cam").remove();
}

comms.message = function(evt) {
  if (!comms.ready) {
    return false;
  }
  if (evt.readied) {
    if (!evt.initiator) {
      if (comms.ready) {
        connection.socket.emit("p2p", {initiator : evt.from, readied : true, ready : true, target : evt.from});
      }
      else {
        connection.socket.emit("p2p", {initiator : evt.from, readied : true, ready : false, target : evt.from});
      }
    }
    else if (evt.ready && evt.readied) {
      comms.offer(evt.from);
    }
    return false;
  }
  if (!comms.peers[evt.from]) {
    if (game.players.data[evt.from]) {
      comms.setup(evt.from, true);
    }
    else {
      return false;
    }
  }
  var pc = comms.peers[evt.from];
  var signal = JSON.parse(evt.sdp);
  if (signal.sdp) {
    comms.answer(evt.from, signal);
  }
  else {
    var iceCandidate = new RTCIceCandidate(signal.candidate);
    iceCandidate.from = evt.from;
    pc.addIceCandidate(iceCandidate);
  }
}

comms.offer = function(id) {
  var pc = comms.peers[id];
  pc.createOffer(function(desc){
    pc.setLocalDescription(desc, function(){
      connection.socket.emit("p2p", {"sdp": JSON.stringify(desc), target : id});
    }, function(error){console.log(error)});
  },
  function(fail){
    console.log("Connection Failed", fail);
  });
}

comms.answer = function(id, signal) {
  var pc = comms.peers[id];
  pc.setRemoteDescription(new RTCSessionDescription(signal),
    function(){
      if (pc.remoteDescription.type == 'offer') {
        pc.createAnswer(function(desc){
          pc.setLocalDescription(desc, function() {
            connection.socket.emit("p2p", {"sdp": JSON.stringify(desc), target : id});
          }, function(error){console.log(error)});
        },
        function(fail){
          console.log("Connection Failed", fail);
          comms.setup(); // re-setup cuz this failed
        });
      }
    },
    function(fail){
      console.log("Connection Failed", fail);
    }
  );
}
comms.update = function() {
  // get local settings
  var localDeafen = $("#local-deafen-"+getCookie("UserID")).attr("deafen");

  var localChannels = {};
  $("#media-channels-"+getCookie("UserID")).children().each(function(){
    if ($(this).attr("channel")) {
      if ($(this).css("opacity") == "1") {
        localChannels[$(this).attr("channel")] = true;
      }
    }
  });

  $(".media-src").each(function(){
    if ($(this).attr("UserID") != getCookie("UserID")) {
      var player = $(this).attr("UserID");
      var channels = {};
      $("#media-channels-"+player).children().each(function(){
        if ($(this).attr("channel")) {
          if ($(this).css("opacity") == "1") {
            channels[$(this).attr("channel")] = true;
          }
        }
      });

      var localMute = $("#local-mute-"+player).attr("muted");
      var channelMatch = false;
      for (var key in localChannels) {
        if (channels[key] && localChannels[key] == channels[key]) {
          channelMatch = true;
        }
      }
      var channelList = (Object.keys(channels).length == 0 && Object.keys(localChannels).length == 0);
      if ((!channelList && !channelMatch) || $("#media-src-"+player).attr("muted") == "true" || $("#media-src-"+getCookie("UserID")).attr("deafen") == "true" || localDeafen || localMute) {
        $("#media-src-"+player).prop("volume", 0);
        if (!channelList && !channelMatch) {
          $("#media-src-"+player).css("opacity", "0");
        }
        else {
          $("#media-src-"+player).css("opacity", "1");
        }
      }
      else if (channelList || channelMatch) {
        $("#media-src-"+player).prop("volume", $("#media-src-"+player).attr("defaultVolume"));
        $("#media-src-"+player).css("opacity", "1");
      }
    }
  });
}

comms.deafen = function(player, local) {
  if (local) {
    $("#local-deafen-"+player).attr("deafen", true);
    $("#local-deafen-"+player).css("opacity", "1");
    comms.mute(player, true);
  }
  else {
    $("#media-src-"+player).attr("deafen", true);
    $("#deafen-"+player).css("opacity", "1");
    comms.mute(player);
  }

  comms.update(player);
}

comms.undeafen = function(player, local) {
  if (local) {
    $("#local-deafen-"+player).removeAttr("deafen");
    $("#local-deafen-"+player).css("opacity", "0.5");
    comms.unmute(player, true);
  }
  else {
    $("#media-src-"+player).removeAttr("deafen");
    $("#deafen-"+player).css("opacity", "0.5");
    comms.unmute(player);
  }

  comms.update(player);
}

comms.mute = function(player, local) {
  if (local) {
    $("#local-mute-"+player).attr("muted", true);
    $("#local-mute-"+player).css("opacity", "1");
    if (comms.stream) {
      comms.stream.getAudioTracks()[0].enabled = false;
    }
    runCommand("")
  }
  else {
    $("#media-src-"+player).attr("muted", true);
    $("#mute-"+player).css("opacity", "1");
    if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
      util.dockHide($("#web-cam-"+player));
    }
  }
  comms.update(player);
}

comms.localMute = function(player){
  if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
    util.dockHide($("#web-cam-"+player));
  }
}

comms.localUnMute = function(player){
  if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
    util.dockReveal($("#web-cam-"+player));
  }
}

comms.reveal = function(player){
  if ($("#media-src-"+player).length) {
    $("#media-src-"+player).css("filter", "brightness(1)");
    if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
      util.dockReveal($("#web-cam-"+player));
    }
  }
}

comms.hide = function(player){
  if ($("#media-src-"+player).length) {
    $("#media-src-"+player).css("filter", "brightness(0)");
    if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
      util.dockHide($("#web-cam-"+player));
    }
  }
}

comms.unmute = function(player, local) {
  if (local) {
    $("#local-mute-"+player).removeAttr("muted");
    $("#local-mute-"+player).css("opacity", "0.5");
    if (comms.stream) {
      comms.stream.getAudioTracks()[0].enabled = true;
    }
  }
  else {
    $("#media-src-"+player).removeAttr("muted", true);
    $("#mute-"+player).css("opacity", "0.5");
    if ($("#web-cam-"+player).length && $("#web-cam-"+player).attr("docked")) {
      util.dockReveal($("#web-cam-"+player));
    }
  }
  comms.update(player);
}

comms.channel = function(player, channels) {
  $("#media-channels-"+player).children().each(function(){
    if ($(this).attr("channel")) {
      if (channels[$(this).attr("channel")]) {
        $(this).css("opacity", "1");
      }
      else {
        $(this).css("opacity", "0.5");
      }
    }
  });

  comms.update(player);
}

comms.initialize = function(){
  comms.ready = true;
  comms.showFeed(getCookie("UserID"), comms.stream, true);
  $("#media-src-"+getCookie("UserID")).prop("volume", 0);
  for (var id in game.players.data) {
    if (getCookie("UserID") != id) {
      if (!comms.peers[id]) {
        comms.setup(id, true);
        connection.socket.emit("p2p", {readied : true, target : id});
      }
      else if (comms.stream) {
        comms.peers[id].addStream(comms.stream);
      }
    }
  }
}
