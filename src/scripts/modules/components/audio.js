var audioChannels = {};
audioChannels.channels = {};
audioChannels.play = function(index, ind){
  var trackData = game.config.data.tracks[index];
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  if (audioChannels.channels[index].s && audioChannels.channels[index].s[ind]) {
    audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
    audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    audioChannels.channels[index].s[ind].play();
  }
  else {
    audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
    audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
    audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    audioChannels.channels[index].s[ind].play();
  }
  if (trackData.pl) {
    audioChannels.channels[index].s[ind].onended = function(){
      var trackData = game.config.data.tracks[index];
      if (this.currentTime >= this.duration) {
        // play next sound
        if (trackData.s.length-1 >= Number(ind)+1 && trackData.s[Number(ind)+1]) {
          audioChannels.play(index, Number(ind)+1);
        }
      }
      game.config.update();
    }
  }
}

audioChannels.pause = function(index, ind){
  var trackData = game.config.data.tracks[index];
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  if (audioChannels.channels[index].s && audioChannels.channels[index].s[ind]) {
    audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
    audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    audioChannels.channels[index].s[ind].pause();
  }
  else {
    audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
    audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
    audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
  }
}

audioChannels.stop = function(index, ind){
  var trackData = game.config.data.tracks[index];
  if (!trackData || !trackData.s[ind]) {
    if (audioChannels.channels[index].s[ind]) {
      if (audioChannels.channels[index].s[ind].stop) {
        audioChannels.channels[index].s[ind].stop();
      }
      delete audioChannels.channels[index].s[ind];
    }
  }
  else {
    audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
    if (audioChannels.channels[index].s && audioChannels.channels[index].s[ind]) {
      audioChannels.channels[index].s[ind].pause();
      audioChannels.channels[index].s[ind].load();
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
    else {
      audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
  }
}

audioChannels.volume = function(index, ind, newVol) {
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  if (audioChannels.channels[index].s && audioChannels.channels[index].s[ind]) {
    audioChannels.channels[index].s[ind].volume = newVol;
    return true;
  }
  return false;
}

audioChannels.playing = function(index, ind) {
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  if (audioChannels.channels[index].s && audioChannels.channels[index].s[ind] && !audioChannels.channels[index].s[ind].paused) {
    return true;
  }
  return false;
}

audioChannels.paused = function(index, ind) {
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  if (audioChannels.channels[index].s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (soundData && soundData.paused && soundData.played && soundData.played.length) {
      return true;
    }
  }
  return false;
}

audioChannels.trackPlaying = function(index){
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  for (var ind in audioChannels.channels[index].s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (soundData && !soundData.paused) {
      return true;
    }
  }
  return false;
}

audioChannels.trackPaused = function(index){
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  for (var ind in audioChannels.channels[index].s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (soundData && (soundData.paused && soundData.played && soundData.played.length)) {
      return true;
    }
  }
  return false;
}

audioChannels.playTrack = function(index){
  var trackData = game.config.data.tracks[index];
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  for (var ind in trackData.s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (!soundData) {
      audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
    else if (audioChannels.channels[index].s[ind] && audioChannels.channels[index].s[ind].paused) {
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
    audioChannels.play(index, ind);
  }
}

audioChannels.pauseTrack = function(index){
  var trackData = game.config.data.tracks[index];
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  for (var ind in trackData.s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (soundData) {
      audioChannels.channels[index].s[ind].pause();
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
    else {
      audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
  }
}

audioChannels.stopTrack = function(index){
  var trackData = game.config.data.tracks[index];
  audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
  for (var ind in trackData.s) {
    var soundData = audioChannels.channels[index].s[ind];
    if (soundData) {
      audioChannels.channels[index].s[ind].pause();
      audioChannels.channels[index].s[ind].load();
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
    else {
      audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
    }
  }
}

audioChannels.prepTracks = function(tracks){
  for (var index in tracks) {
    var trackData = tracks[index];
    audioChannels.channels[index] = audioChannels.channels[index] || {s : {}};
    if (audioChannels.channels[index]) {
      for (var ind in trackData.s) {
        if (!audioChannels.channels[index].s[ind]) {
          audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
          audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
          audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
        }
        else if (decodeURI(audioChannels.channels[index].s[ind].src).match(trackData.s[ind].src) && audioChannels.channels[index].s[ind].paused){
          audioChannels.channels[index].s[ind].src = trackData.s[ind].src;
          audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
          audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
        }
      }
    }
  }
}

sync.render("ui_audioPlayer", function(obj, app, scope) {
  obj.data.tracks = obj.data.tracks || {};

  var div = $("<div>");
  div.addClass("flex flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("background alttext flexaround outline");

  var newTrack = genIcon("music", "New Track").appendTo(optionsBar);
  newTrack.css("font-size", "1.2em");
  newTrack.click(function(){
    var max = 0;
    for (var i in obj.data.tracks) {
      if (!isNaN(i) && i > max) {
        max = i;
      }
    }
    max += 1;
    obj.data.tracks[max] = {n : "New Track", s : []};
    obj.sync("updateConfig");
  });

  var newTrack = genIcon("music", "New Playlist").appendTo(optionsBar);
  newTrack.css("font-size", "1.2em");
  newTrack.click(function(){
    var max = 0;
    for (var i in obj.data.tracks) {
      if (!isNaN(i) && i > max) {
        max = i;
      }
    }
    max += 1;
    obj.data.tracks[max] = {n : "New Playlist", s : [], pl : true};
    obj.sync("updateConfig");
  });

  var charWrapper = $("<div>").appendTo(div);
  charWrapper.addClass("flex");
  charWrapper.css("overflow-y", "auto");
  charWrapper.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  charWrapper.scroll(function(){
    app.attr("_lastScrollTop", charWrapper.scrollTop());
    app.attr("_lastScrollLeft", charWrapper.scrollLeft());
  });


  function folderWrap(index) {
    var trackData = obj.data.tracks[index];
    var trackPlate = $("<div>").appendTo(charWrapper);
    trackPlate.addClass("flexrow flexmiddle spadding hover2");

    if (!trackData.pl) {
      trackPlate.addClass("alttext");
    }

    if (obj.data.tracks[index].h) {
      var remove = genIcon("plus").appendTo(trackPlate);
      remove.addClass("subtitle lrmargin");
      remove.click(function(){
        obj.data.tracks[index].h = !obj.data.tracks[index].h;
        obj.update();
      });
    }
    else {
      var remove = genIcon("minus").appendTo(trackPlate);
      remove.addClass("subtitle lrmargin");
      remove.click(function(){
        obj.data.tracks[index].h = !obj.data.tracks[index].h;
        obj.update();
      });
    }


    var remove = genIcon("trash").appendTo(trackPlate);
    remove.addClass("subtitle");
    remove.click(function(ev){
      var ind = $(this).attr("index");
      ui_prompt({
        target : $(this),
        click : function(){
          for (var ind in obj.data.tracks[index].s) {
            if (audioChannels.trackPaused(index) || audioChannels.trackPlaying(index)) {
              audioChannels.stop(index, ind);
              runCommand("music", {cmd : "stop", index : index, ind : ind});
            }
          }
          delete obj.data.tracks[index];
          obj.sync("updateConfig");
        }
      });
      ev.stopPropagation();
      ev.preventDefault();
    });

    var folderName = genInput({
      parent : trackPlate,
      classes : "middle line lrmargin subtitle",
      disabled : !(hasSecurity(getCookie("UserID"), "Assistant Master")),
      value : obj.data.tracks[index].n,
      placeholder : "Track Name",
    });
    folderName.change(function(){
      obj.data.tracks[index].n = $(this).val() || "";
      obj.sync("updateConfig");
    });

    var newSoundPlate = $("<div>").appendTo(trackPlate);
    newSoundPlate.addClass("flexmiddle subtitle flex");
    newSoundPlate.attr("index", index);


    var newSound = genIcon("volume-up", "Add").appendTo(newSoundPlate);
    newSound.click(function(ev){
      var picker = sync.render("ui_filePicker")(obj, app, {
        filter : ["audio"],
        change : function(ev, ui, val, name) {
          if (val.match("\.mp3") || val.match("\.ogg") || val.match("\.wav")) {
            var aud = new Audio(val);
            audioChannels.prepTracks(game.config.data.tracks);
            trackData.s.push({n : name, v : 0.5, src : val});
            obj.sync("updateConfig");
            layout.coverlay("sound-picker");
          }
          else {
            sendAlert({text : "Unsupported Type"});
          }
        }
      });

      var pop = ui_popOut({
        target : $(this),
        prompt : true,
        id : "sound-picker",
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, picker);
      ev.stopPropagation();
      ev.preventDefault();
    });

    var audioControls = $("<div>").appendTo(trackPlate);
    audioControls.addClass("flexmiddle");

    if (audioChannels.trackPaused(index) || audioChannels.trackPlaying(index)) {
      var stop = genIcon("stop").appendTo(audioControls);
      stop.addClass("lrmargin");
      stop.attr("title", "Stop whole track");
      stop.click(function(){
        audioChannels.stopTrack(index);
        obj.update();
        runCommand("music", {cmd : "stopTrack", index : index});
      });
    }

    if (audioChannels.trackPlaying(index)) {
      var pause = genIcon("pause").appendTo(audioControls);
      pause.addClass("lrmargin");
      if (trackData.pl) {
        pause.attr("title", "Pause playlist");
        pause.click(function(){
          var current = 0;
          if (audioChannels.channels[index]) {
            for (var ind in trackData.s) {
              if (audioChannels.channels[index].s[ind] && audioChannels.channels[index].s[ind].currentTime && audioChannels.channels[index].s[ind].currentTime < audioChannels.channels[index].s[ind].duration) {
                current = ind;
                break;
              }
            }
          }
          audioChannels.pause(index, current);
          obj.update();
          runCommand("music", {cmd : "pause", index : index, ind : current});
        });
      }
      else {
        pause.attr("title", "Pause whole track");
        pause.click(function(){
          audioChannels.pauseTrack(index);
          obj.update();
          runCommand("music", {cmd : "pauseTrack", index : index});
        });
      }
    }
    else {
      var play = genIcon("play").appendTo(audioControls);
      play.addClass("lrmargin");
      if (trackData.pl) {
        play.attr("title", "Start Playlist");
        play.click(function(){
          var current = 0;
          if (audioChannels.channels[index]) {
            for (var ind in trackData.s) {
              if (audioChannels.channels[index].s[ind] && audioChannels.channels[index].s[ind].currentTime && audioChannels.channels[index].s[ind].currentTime < audioChannels.channels[index].s[ind].duration) {
                current = ind;
                break;
              }
            }
          }
          audioChannels.play(index, current);
          obj.update();
          runCommand("music", {cmd : "play", index : index, ind : current});
        });
      }
      else {
        play.attr("title", "Play whole track");
        play.click(function(){
          audioChannels.playTrack(index);
          obj.update();
          runCommand("music", {cmd : "playTrack", index : index});
        });
      }
    }

    var play = genIcon("random").appendTo(audioControls);
    play.addClass("lrmargin");
    play.attr("title", "Play random track");
    play.click(function(){
      var ind = Math.floor(trackData.s.length*Math.random());
      audioChannels.play(index, ind);
      obj.update();
      runCommand("music", {cmd : "play", index : index, ind : ind});
    });

    var trackContents = $("<div>").appendTo(charWrapper);
    trackContents.addClass("flexcolumn spadding white outlinebottom");
    trackContents.css("padding-left", "1em");
    trackContents.css("margin-bottom", "1em");
    if (obj.data.tracks[index].h) {
      if (trackData.pl) {
        trackPlate.addClass("button");
        trackPlate.css("color", "#333");
      }
      else {
        trackPlate.addClass("foreground");
      }
      trackContents.hide();
    }
    else {
      if (trackData.pl) {
        trackPlate.addClass("button");
        trackPlate.css("color", "#333");
      }
      else {
        trackPlate.addClass("background");
      }
    }
    for (var i in trackData.s) {
      var soundData = trackData.s[i];
      var soundPlate = $("<div>").appendTo(trackContents);
      soundPlate.addClass("flexrow flexmiddle spadding smooth subtitle");

      var remove = genIcon("trash").appendTo(soundPlate);
      remove.attr("index", i);
      remove.click(function(){
        var ind = $(this).attr("index");
        ui_prompt({
          target : $(this),
          click : function(){
            if (audioChannels.trackPaused(index) || audioChannels.trackPlaying(index)) {
              audioChannels.stop(index, ind);
              runCommand("music", {cmd : "stop", index : index, ind : ind});
            }
            obj.data.tracks[index].s.splice(ind, 1);
            obj.sync("updateConfig");
          }
        });
      });

      var soundName = genInput({
        parent : soundPlate,
        classes : "middle line lrmargin subtitle",
        disabled : !(hasSecurity(getCookie("UserID"), "Assistant Master")),
        value : soundData.n,
        placeholder : "Sound Name",
        index : i,
        title : soundData.src.split("/")[soundData.src.split("/").length-1]
      });
      soundName.change(function(){
        var ind = $(this).attr("index");
        obj.data.tracks[index].s[ind].n = $(this).val() || "";
        obj.sync("updateConfig");
      });

      var audioControls = $("<div>").appendTo(soundPlate);
      audioControls.addClass("flex flexmiddle");

      genIcon({raw : true, icon : "volume-up"}).addClass("lrmargin").appendTo(audioControls);

      var volume = genInput({
        parent : audioControls,
        type : "range",
        min : 0,
        max : 1,
        step : 0.01,
        value : soundData.v,
        index : i,
        style : {"min-width" : "50px", "height" : "10px"}
      }, 1);
      volume.attr("title", "Music Volume");
      volume.val(soundData.v);
      volume.bind("input", function(){
        var ind = $(this).attr("index");
        obj.data.tracks[index].s[ind].v = Number($(this).val());
        audioChannels.volume(index, ind, Number($(this).val()));
      });
      volume.change(function(){
        var ind = $(this).attr("index");
        obj.data.tracks[index].s[ind].v = Number($(this).val());
        audioChannels.volume(index, ind, Number($(this).val()));
        if (audioChannels.playing(index, ind)) {
          runCommand("music", {cmd : "volume", index : index, ind : ind, val : obj.data.tracks[index].s[ind].v});
        }
        else {
          obj.sync("updateConfig");
        }
      });

      var repeat = genIcon("refresh").appendTo(audioControls);
      repeat.addClass("lrmargin");
      repeat.attr("title", "Repeat");
      repeat.attr("index", i);
      if (!soundData.l) {
        repeat.addClass("dull");
      }
      repeat.click(function(){
        var ind = $(this).attr("index");
        obj.data.tracks[index].s[ind].l = !obj.data.tracks[index].s[ind].l;
        obj.sync("updateConfig");
      });

      if (audioChannels.paused(index, i) || audioChannels.playing(index, i)) {
        var stop = genIcon("stop").appendTo(audioControls);
        stop.addClass("lrmargin");
        stop.attr("index", i);
        stop.attr("title", "Stop");
        stop.click(function(){
          var ind = $(this).attr("index");
          audioChannels.stop(index, ind);
          obj.update();
          runCommand("music", {cmd : "stop", index : index, ind : ind});
        });
      }
      if (audioChannels.playing(index, i)) {
        var pause = genIcon("pause").appendTo(audioControls);
        pause.addClass("lrmargin");
        pause.attr("index", i);
        pause.attr("title", "Pause");
        pause.click(function(){
          var ind = $(this).attr("index");
          audioChannels.pause(index, ind);
          obj.update();
          runCommand("music", {cmd : "pause", index : index, ind : ind});
        });
      }
      else {
        var play = genIcon("play").appendTo(audioControls);
        play.addClass("lrmargin");
        play.attr("index", i);
        play.attr("title", "Play");
        play.click(function(){
          var ind = $(this).attr("index");
          audioChannels.play(index, ind);
          obj.update();
          runCommand("music", {cmd : "play", index : index, ind : ind});
        });
      }
    }

    return soundPlate;
  }

  for (var index in obj.data.tracks) {
    folderWrap(index);
  }

  return div;
});
