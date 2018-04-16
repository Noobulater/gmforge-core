var snd_diceRoll;

$(document).ready(function() {
  if (!layout.webclient) {
    document.addEventListener('dragover', function(ev){ev.preventDefault();});
    document.addEventListener('drop', function(ev){ev.preventDefault();});
  }

  // firefox fix

  snd_diceRoll = new Audio("/sounds/dice.mp3");
  // connect to local server

  if (getCookie("UserID") && getCookie("UserID") != "Sandboxer") {
    $.ajax({
      url: window.location.origin+"/retrieveUser?id="+getCookie("UserID"),
      error: function(code) {
        console.log(code);
      },
      dataType: 'json',
      success: function(resData) {
        game.user = resData;
        if (resData.membership) {
          if (parseInt(resData.membership) >= 50) {
            $("#upgrade").removeClass("outline smooth highlight alttext");
            $("#upgrade").addClass("dull");
          }
          if (parseInt(resData.membership) >= 200) {
            $("#upgrade").remove();
          }
        }
        else {
          $("#storage-editor").hide();
        }
        if (!game.user || (!game.user.membership && !game.user.points)) {
          $("#gmp-counter").hide();
        }
        else {
          $("#gmp-counter").text((game.user.points || 0).toLocaleString());
          $("#gmp-counter-wrap").fadeIn();
        }
      },
      type: 'GET'
    });
  }

  if ($("#upgrade").length) {
    $("#upgrade").click(function(){
      openSplash(true, "Support Us");
    });
  }
  global_init();
});

$(document).keypress(function(e){
  controlsKeyPress(e);
});

$(document).keydown(function(e) {
  controlsKeyDown(e);
});

$(document).keyup(function(e) {
  controlsKeyUp(e);
});

var _promptClicked;
$(document).mousedown(function(e) {
  if ($(".prompt").length && !_promptClicked) {
    $(".prompt").remove();
  }
  else {
    _promptClicked = null;
  }
});

$(document).mousemove(function(e) {

});

function _mouseupCleanup(e){
  setTimeout(function(){
    $(".ui-dropmenu-class").each(function(){
      if ($(this).attr("_createTime") && Date.now() > (Number($(this).attr("_createTime")) || 0) + 200) {
        $(".ui-dropmenu-class").remove();
      }
    });
  }, 100);
  if ($(".prompt").length && !_promptClicked) {
    $(".prompt").remove();
  }
  else {
    _promptClicked = null;
  }
}

var lastResize = 0;
var _supressResize = false;
function _resizeDelay() {
  if (lastResize+500 < Date.now()) {
    for (var app in _syncList) {
      _syncList[app].update();
    }
  }
}

var resizeHooks = {};

$(window).resize(function() {
  $("#splash-screen").width($(window).width());
  $("#splash-screen").height($(window).height());
  $("#player-list").css("left", "");
  $("#player-list").css("right", "0");
  $("body").find(".application[ui-name='ui_board']").each(function(){
    $(this).removeAttr("divWidth");
    $(this).removeAttr("divHeight");
  });
  for (var index in resizeHooks) {
    resizeHooks[index]();
  }
  if (!_supressResize) {
    _resizeDelay();
    lastResize = Date.now();
    setTimeout(function(){
      _resizeDelay();
    }, 500);
  }
  $(".ui-popout").each(function(){
    if (!$(this).hasClass("popup") && !$(this).attr("docked")) {
      var overlay = $(this);
      var x = overlay.offset().left;
      var y = overlay.offset().top;
      if (x+overlay.outerWidth() > $(window).outerWidth()) {
        x = x - ((x+overlay.outerWidth())-$(window).outerWidth());
      }
      if (x < 0) {
        x = 0;
      }
      if (y+overlay.outerHeight() > $(window).outerHeight()) {
        y = y - ((y+overlay.outerHeight())-$(window).outerHeight());
      }
      if (y < 0) {
        y = 0;
      }
      overlay.css("left", x);
      overlay.css("top", y);
    }
  });
  $(".main-dock").each(function(){
    if (!$(this).attr("locked")) {
      $(this).css("opacity", "0");
      util.dockHide($(this));
    }
    else {
      $(this).css("opacity", "1");
      util.dockReveal($(this));
    }
  });
});

$(window).mousemove(function(ev) {
  if (boardApi.pix.dragging) {
    boardApi.pix.dragging.move(ev);
  }
});

$(window).mouseup(function(ev) {
  _mouseupCleanup(ev);
  if (boardApi.pix.dragging) {
    var dragging = boardApi.pix.dragging;
    boardApi.pix.dragging.end(ev);
    if (dragging.followup) {
      dragging.followup(ev);
    }
  }
  $(".main-dock").css("pointer-events", "");
  $(".boardMenu").css("pointer-events", "auto");
  boardApi.pix.objectClick = false;
});

window.onbeforeunload = function(e) {
  if ($(".displayApp").attr("background") == "true") {
    return "Wait! Save your map before you go!";
  }
};

var _winHasFocus = true;
window.onfocus = function(ev){
  _winHasFocus = true;
  for (var key in _down) {
    delete _down[key];
  }
};

window.onblur = function(ev){
  _winHasFocus = false;
};

var cursorInPage = false;

$(window).on('mouseout', function() {
  cursorInPage = false;
});

$(window).on('mouseover', function() {
  cursorInPage = true;
});

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
