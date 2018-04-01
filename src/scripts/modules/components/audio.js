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
      audioChannels.channels[index].s[ind].play();
    }
    else if (audioChannels.channels[index].s[ind] && audioChannels.channels[index].s[ind].paused) {
      audioChannels.channels[index].s[ind].volume = trackData.s[ind].v;
      audioChannels.channels[index].s[ind].loop = trackData.s[ind].l;
      audioChannels.channels[index].s[ind].play();
    }
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
        if (!audioChannels.channels[index].s[ind] || audioChannels.channels[index].s[ind].src != trackData.s[ind].src) {
          audioChannels.channels[index].s[ind] = new Audio(trackData.s[ind].src);
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
    trackPlate.addClass("background flexrow flexmiddle alttext spadding hover2");

    var remove = genIcon("trash").appendTo(trackPlate);
    remove.addClass("subtitle");
    remove.click(function(){
      var ind = $(this).attr("index");
      ui_prompt({
        target : $(this),
        click : function(){
          delete obj.data.tracks[index];
          obj.sync("updateConfig");
        }
      });
    });

    var folderName = genInput({
      parent : trackPlate,
      classes : "middle line lrmargin subtitle",
      disabled : !(hasSecurity(getCookie("UserID"), "Assistant Master")),
      value : obj.data.tracks[index].n,
      placeholder : "Sound Name",
    });
    folderName.change(function(){
      obj.data.tracks[index].n = $(this).val() || "";
      obj.sync("updateConfig");
    });

    var newSoundPlate = $("<div>").appendTo(trackPlate);
    newSoundPlate.addClass("flexmiddle subtitle flex");

    var newSound = genIcon("volume-up", "New Sound").appendTo(newSoundPlate);
    newSound.click(function(){
      var picker = sync.render("ui_filePicker")(obj, app, {
        filter : ["audio"],
        change : function(ev, ui, val, name) {
          if (val.match("\.mp3") || val.match("\.ogg") || val.match("\.wav")) {
            var aud = new Audio(val);
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
      pause.attr("title", "Pause whole track");
      pause.click(function(){
        audioChannels.pauseTrack(index);
        obj.update();
        runCommand("music", {cmd : "pauseTrack", index : index});
      });
    }
    else {
      var play = genIcon("play").appendTo(audioControls);
      play.addClass("lrmargin");
      play.attr("title", "Play whole track");
      play.click(function(){
        audioChannels.playTrack(index);
        obj.update();
        runCommand("music", {cmd : "playTrack", index : index});
      });
    }

    var trackContents = $("<div>").appendTo(charWrapper);
    trackContents.addClass("flexcolumn spadding");
    trackContents.css("padding-left", "1em");
    trackContents.css("margin-bottom", "1em");
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

      genIcon({raw : true, icon : "headphones"}).addClass("lrmargin").appendTo(audioControls);

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

      var repeat = genIcon("repeat")//.appendTo(audioControls);
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


  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("foreground alttext flexmiddle");


  var newTrack = genIcon("music", "New Track").appendTo(optionsBar);
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

  return div;
});
