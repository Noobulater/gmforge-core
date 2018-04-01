sync.render("ui_calendar", function(obj, app, scope) {
  scope = scope || {calendar : Number(app.attr("calendar") || 0), month : (Number(app.attr("month")) || null)};
  obj.data.calendars = obj.data.calendars || [
    {
      name : "Standard Calendar",
      months : [
        {name : "January", days : 31},
        {name : "February", days : 28},
        {name : "March", days : 31},
        {name : "April", days : 30},
        {name : "May", days : 31},
        {name : "June", days : 30},
        {name : "July", days : 31},
        {name : "August", days : 31},
        {name : "September", days : 30},
        {name : "October", days : 31},
        {name : "November", days : 30},
        {name : "December", days : 31},
      ],
      days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      units : 365,
      events : {"17" : [{name : "Looming Doom", ent : "67"},{name : "Looming Doom"}]},
      weather : {},
      day : 0
    },
  ];


  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");

  var calendars = $("<div>").appendTo(div);
  calendars.addClass("flexrow fit-x");
  for (var i in obj.data.calendars) {
    var baseCalendar = $("<div>").appendTo(calendars);
    baseCalendar.addClass("subtitle alttext bold smooth padding flexmiddle hover2");
    baseCalendar.attr("index", i);
    baseCalendar.text(obj.data.calendars[i].name);
    if (scope.calendar == i) {
      baseCalendar.addClass("highlight");
    }
    else {
      baseCalendar.addClass("background");
    }
    baseCalendar.click(function(ev){
      app.attr("calendar", $(this).attr("index"));
      obj.update();
    });
    baseCalendar.contextmenu(function(ev){
      var calendar = $(this).attr("index");


      var actionsList = [
        {
          name : "Rename",
          click : function(ev, ui){
            ui_prompt({
              target : ui,
              inputs : {
                "Name" : obj.data.calendars[calendar].name
              },
              click : function(ev, inputs) {
                obj.data.calendars[calendar].name = inputs["Name"].val();
                if (obj == game.state) {
                  obj.sync("updateState");
                }
                else {
                  if (obj == game.state) {
                    obj.sync("updateState");
                  }
                  else {
                    obj.update();
                  }
                }
              }
            });
          }
        },
        {
          name : "Set day offset",
          click : function(ev, ui){
            ui_prompt({
              target : ui,
              inputs : {
                "Offset" : obj.data.calendars[calendar].offset
              },
              click : function(ev, inputs) {
                obj.data.calendars[calendar].offset = Number(inputs["Offset"].val() || 0);
                if (obj == game.state) {
                  obj.sync("updateState");
                }
                else {
                  obj.update();
                }
              }
            });
          }
        },
        {
          name : "Delete",
          submenu : [
            {
              name : "Confirm",
              click : function(ev, inputs) {
                obj.data.calendars.splice(calendar, 1);
                app.removeAttr("calendar");
                if (obj == game.state) {
                  obj.sync("updateState");
                }
                else {
                  obj.update();
                }
              }
            }
          ]
        }
      ];

      ui_dropMenu($(this), actionsList, {id : "rename"});
      return false;
    });
  }

  var baseCalendar = $("<div>").appendTo(calendars);
  baseCalendar.addClass("bold lrpadding flexmiddle");
  baseCalendar.append(genIcon("plus"));
  baseCalendar.click(function(){
    obj.data.calendars.push(
      {
        name : "Standard Calendar",
        months : [
          {name : "January", days : 31},
          {name : "February", days : 28},
          {name : "March", days : 31},
          {name : "April", days : 30},
          {name : "May", days : 31},
          {name : "June", days : 30},
          {name : "July", days : 31},
          {name : "August", days : 31},
          {name : "September", days : 30},
          {name : "October", days : 31},
          {name : "November", days : 30},
          {name : "December", days : 31},
        ],
        days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        units : 365,
        events : {},
        weather : {},
        day : 1
      }
    );
    if (obj == game.state) {
      obj.sync("updateState");
    }
    else {
      obj.update();
    }
  });

  var config = $("<div>").appendTo(div);
  config.addClass("flexrow fit-x");

  var leftOption = $("<div>").appendTo(config);
  leftOption.addClass("flexrow flexmiddle");

  var lastMonth = $("<button>").appendTo(leftOption);
  lastMonth.addClass("lrpadding");
  lastMonth.append(genIcon({raw : true, icon : "chevron-left"}));
  lastMonth.click(function(){
    app.attr("month", Math.max((scope.month || 0) - 1, 0));
    obj.update();
  });

  var nextMonth = $("<button>").appendTo(leftOption);
  nextMonth.addClass("lrpadding");
  nextMonth.append(genIcon({raw : true, icon : "chevron-right"}));
  nextMonth.click(function(){
    app.attr("month", Math.min((scope.month || 0) + 1, Object.keys(obj.data.calendars[scope.calendar].months).length - 1));
    obj.update();
  });

  var genWeather = $("<button>");//.appendTo(leftOption);
  genWeather.append("Generate Weather");
  genWeather.click(function(){
    var actionsList = [
      {
        name : "This Month",

      },
      {
        name : "Whole Year",
      }
    ];

    ui_dropMenu($(this), actionsList, {id : "generate-weather"});
  });

  $("<div class='flex'></div>").appendTo(config);

  var highlight = $("<highlight>").appendTo(config);
  highlight.addClass("flexmiddle");
  highlight.click(function(){
    var month = $(this).attr("month");
    var calendar = Number(scope.calendar);
    var actionsList = [
      {
        name : "Change Month",
        click : function(ev, ui){
          ui_prompt({
            target : ui,
            id : "change-month",
            inputs : {
              "Name" : obj.data.calendars[calendar].months[month].name,
              "Days" : obj.data.calendars[calendar].months[month].days
            },
            click : function(ev, inputs) {
              obj.data.calendars[calendar].months[month].name = inputs["Name"].val();
              obj.data.calendars[calendar].months[month].days = inputs["Days"].val();
              if (obj == game.state) {
                obj.sync("updateState");
              }
              else {
                obj.update();
              }
            }
          });
        }
      },
      {
        name : "Add new Month",
        click : function(ev, ui){
          obj.data.calendars[calendar].months.push({name : "New Month", days : 30});
          app.attr("month", obj.data.calendars[calendar].months.length-1);
          if (obj == game.state) {
            obj.sync("updateState");
          }
          else {
            obj.update();
          }
        }
      },
      {
        name : "Remove Month",
        click : function(ev, ui){
          obj.data.calendars[calendar].months.splice(month, 1);
          if (obj == game.state) {
            obj.sync("updateState");
          }
          else {
            obj.update();
          }
        }
      }
    ];

    ui_dropMenu($(this), actionsList, {id : "generate-weather"});
  });

  $("<div class='flex'></div>").appendTo(config);

  var rightOption = $("<div>").appendTo(config);
  rightOption.addClass("flexrow flexmiddle");

  var yearView = $("<button>");//.appendTo(rightOption);
  yearView.append("Year");

  var monthView = $("<button>");//.appendTo(rightOption);
  monthView.append("Month");

  var weekData = $("<div>").appendTo(div);
  weekData.addClass("flexrow fit-x");
  weekData.css("width", "800px");

  var weekDays = obj.data.calendars[scope.calendar].days.length;

  for (var i=0; i<weekDays; i++) {
    var dayWrap = $("<div>").appendTo(weekData);
    dayWrap.addClass("flexrow flex spadding flexmiddle");

    var day = genInput({
      parent : dayWrap,
      classes : "lrmargin middle outline fit-x line",
      value : obj.data.calendars[scope.calendar].days[i],
      day : i
    });
    day.change(function(){
      obj.data.calendars[scope.calendar].days[$(this).attr("day")] = $(this).val();
      if (obj == game.state) {
        obj.sync("updateState");
      }
      else {
        obj.update();
      }
    });
    day.contextmenu(function(){
      var day = $(this).attr("day");
      var actionsList = [
        {
          name : "Add Day",
          click : function(){
            obj.data.calendars[scope.calendar].days[day].push("");
            if (obj == game.state) {
              obj.sync("updateState");
            }
            else {
              obj.update();
            }
          }
        },
        {
          name : "Remove Day",
          click : function(){
            obj.data.calendars[scope.calendar].days.splice(day, 1);
            if (obj == game.state) {
              obj.sync("updateState");
            }
            else {
              obj.update();
            }
          }
        }
      ];

      ui_dropMenu($(this), actionsList, {id : "add-day"});
      return false;
    });
  }

  var tableWrap = $("<div>").appendTo(div);
  tableWrap.addClass("flex");
  tableWrap.css("position", "relative");
  tableWrap.css("overflow", "auto");
  tableWrap.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  tableWrap.attr("_lastScrollLeft", app.attr("_lastScrollLeft"));
  tableWrap.scroll(function(){
    app.attr("_lastScrollTop", $(this).scrollTop());
    app.attr("_lastScrollLeft", $(this).scrollLeft());
  });

  var table = $("<div>").appendTo(tableWrap);
  table.css("width", "800px");

  var week = $("<div>").appendTo(table);
  week.addClass("flexrow fit-x");

  var daysCount = duplicate(obj.data.calendars[scope.calendar].units);
  var presentDay = duplicate(obj.data.calendars[scope.calendar].day);
  var week;

  var monthOverride;
  var offset = obj.data.calendars[scope.calendar].offset || 0;
  for (var j=0; j<obj.data.calendars[scope.calendar].months.length; j++) {
    monthOverride = j;
    var monthData = obj.data.calendars[scope.calendar].months[j];
    if ((scope.month == j) || (scope.month == null && (presentDay <= monthData.days))) {
      highlight.addClass("link");
      highlight.attr("month", j);
      highlight.text(monthData.name);
      for (var i=0; i<Math.ceil((monthData.days+offset)/weekDays)*weekDays; i++) {
        if (i % weekDays == 0) {
          week = $("<div>").appendTo(table);
          week.addClass("flexrow fit-x");
        }

        var currentDay = obj.data.calendars[scope.calendar].units-daysCount+i-offset+1;

        var day = $("<div>").appendTo(week);
        day.addClass("flexcolumn outline flex");
        day.css("position", "relative");
        day.css("min-height", "100px");
        day.attr("calendar", scope.calendar);
        day.attr("day", currentDay);
        day.css("cursor", "pointer");

        day.click(function(ev) {
          var calendar = $(this).attr("calendar");
          var day = $(this).attr("day");
          var actionsList = [
            {
              name : "Add Event",
              click : function(ev, ui){
                ui_prompt({
                  target : app,
                  id : "add-text",
                  inputs : {
                    "Text" : $("<textarea>").css("min-height", "100px").css("min-width", "100%"),
                  },
                  click : function(ev, inputs){
                    if (inputs["Text"].val() && inputs["Text"].val().trim()) {
                      obj.data.calendars[scope.calendar].events[day] = obj.data.calendars[scope.calendar].events[day] || [];
                      obj.data.calendars[scope.calendar].events[day].push({name : inputs["Text"].val()});
                    }

                    if (obj == game.state) {
                      obj.sync("updateState");
                    }
                    else {
                      obj.update();
                    }
                    layout.coverlay("add-asset");
                  }
                });
              }
            },
            {
              name : "Add Link",
              click : function(){
                var eventData = {};
                var content = sync.render("ui_assetPicker")(obj, app, {
                  category : "c",
                  hideCreate : true,
                  select : function(ev, ui, ent, options, entities){
                    obj.data.calendars[scope.calendar].events[day] = obj.data.calendars[scope.calendar].events[day] || [];
                    obj.data.calendars[scope.calendar].events[day].push({ent : ent.id()});

                    if (obj == game.state) {
                      obj.sync("updateState");
                    }
                    else {
                      obj.update();
                    }
                    layout.coverlay("add-asset");
                  }
                });
                var pop = ui_popOut({
                  target : $("body"),
                  prompt : true,
                  id : "add-asset",
                  style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
                }, content);
                pop.resizable();
              }
            }
          ];

          ui_dropMenu($(this), actionsList, {id : "drop"});

          ev.stopPropagation();
          return false;
        });

        if ((i >= offset) && (i < monthData.days + offset)) {
          var dayNumberRow = $("<div>").appendTo(day);
          dayNumberRow.addClass("flexrow fit-x inactive");
          dayNumberRow.click(function(ev) {
            ev.stopPropagation();
            return false;
          });

          var tempObj = sync.dummyObj();
          tempObj.data = {calendar : scope.calendar || 0, day : currentDay, setting : obj.data.calendars[scope.calendar].weather[currentDay] || {}};

          var setting = sync.newApp("ui_setting").appendTo(dayNumberRow);
          setting.addClass("flex spadding flexrow");
          setting.attr("supressHover", true);
          setting.attr("size", "18px");

          tempObj.addApp(setting);
          tempObj.listen["change"] = function(oObj, rObj, target){
            obj.data.calendars[oObj.data.calendar].weather[oObj.data.day] = duplicate(oObj.data.setting);
            return true;
          };

          var dayNumber = $("<div>").appendTo(dayNumberRow);
          dayNumber.addClass("lrpadding smooth hover2 flexmiddle");
          dayNumber.attr("day", currentDay);
          dayNumber.append("<text>"+(i-offset+1)+"</text>");
          if (i < presentDay-1) {
            day.addClass("inactive");
          }
          else if (i == presentDay-1) {
            dayNumber.addClass("highlight alttext");
          }
          dayNumber.click(function(){
            var day = $(this).attr("day");
            obj.data.calendars[scope.calendar].day = day;
            if (obj == game.state) {
              obj.sync("updateState");
            }
            else {
              obj.update();
            }
          });

          if (obj.data.calendars[scope.calendar].events[currentDay]) {
            for (var k=0; k<obj.data.calendars[scope.calendar].events[currentDay].length; k++) {
              var eventData = obj.data.calendars[scope.calendar].events[currentDay][k];
              if (eventData) {
                var eventBar = $("<div>").appendTo(day);
                eventBar.addClass("flexcolumn lrpadding subtitle");
                eventBar.css("cursor", "text");
                eventBar.attr("calendar", scope.calendar);
                eventBar.attr("day", currentDay);
                eventBar.attr("event", k);
                eventBar.contextmenu(function(ev){
                  var calendar = $(this).attr("calendar");
                  var day = $(this).attr("day");
                  var eventData = obj.data.calendars[scope.calendar].events[$(this).attr("day")][$(this).attr("event")];
                  var events = obj.data.calendars[scope.calendar].events[$(this).attr("day")];
                  var eventID = $(this).attr("event");
                  var actionsList = [];
                  actionsList.push({
                    name : "Add",
                    submenu : [
                      {
                        name : "Event",
                        click : function(ev, ui){
                          ui_prompt({
                            target : app,
                            id : "add-text",
                            inputs : {
                              "Text" : $("<textarea>").css("min-height", "100px").css("min-width", "100%"),
                            },
                            click : function(ev, inputs){
                              if (inputs["Text"].val() && inputs["Text"].val().trim()) {
                                obj.data.calendars[scope.calendar].events[day] = obj.data.calendars[scope.calendar].events[day] || [];
                                obj.data.calendars[scope.calendar].events[day].push({name : inputs["Text"].val()});
                              }

                              if (obj == game.state) {
                                obj.sync("updateState");
                              }
                              else {
                                obj.update();
                              }
                              layout.coverlay("add-asset");
                            }
                          });
                        }
                      },
                      {
                        name : "Link",
                        click : function(){
                          var eventData = {};
                          var content = sync.render("ui_assetPicker")(obj, app, {
                            category : "c",
                            hideCreate : true,
                            select : function(ev, ui, ent, options, entities){
                              obj.data.calendars[scope.calendar].events[day] = obj.data.calendars[scope.calendar].events[day] || [];
                              obj.data.calendars[scope.calendar].events[day].push({ent : ent.id()});
                              if (obj == game.state) {
                                obj.sync("updateState");
                              }
                              else {
                                obj.update();
                              }
                              layout.coverlay("add-asset");
                            }
                          });
                          var pop = ui_popOut({
                            target : $("body"),
                            prompt : true,
                            id : "add-asset",
                            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
                          }, content);
                          pop.resizable();
                        }
                      }
                    ]
                  });
                  actionsList.push({
                    name : "Color",
                    submenu : [
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(34,34,34,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(34,34,34,1)";
                          eventData.tc = "white";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(187,0,0,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(187,0,0,1)";
                          eventData.tc = "white";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(255,153,0,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(255,153,0,1)";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(255,240,0,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(255,240,0,1)";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(0,187,0,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(0,187,0,1)";
                          delete eventData.tc;
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(0,115,230,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(0,115,230,1)";
                          eventData.tc = "white";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(176,0,187,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(176,0,187,1)";
                          eventData.tc = "white";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(255,115,255,1)", color : "transparent"},
                        click : function() {
                          eventData.c = "rgba(255,115,255,1)";
                          eventData.tc = "white";
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                      {
                        icon : "tint",
                        style : {"background-color" : "rgba(255,255,255,1)", color : "transparent"},
                        click : function() {
                          delete eventData.c;
                          delete eventData.tc;
                          if (obj == game.state) {
                            obj.sync("updateState");
                          }
                          else {
                            obj.update();
                          }
                        }
                      },
                    ]
                  });
                  if (eventData.ent) {
                    actionsList.push({
                      name : "Change Link",
                      click : function(){
                        var content = sync.render("ui_assetPicker")(obj, app, {
                          category : "c",
                          hideCreate : true,
                          select : function(ev, ui, ent, options, entities){
                            eventData.ent = ent.id();
                            if (obj == game.state) {
                              obj.sync("updateState");
                            }
                            else {
                              obj.update();
                            }
                            layout.coverlay("add-asset");
                          }
                        });
                        var pop = ui_popOut({
                          target : $("body"),
                          prompt : true,
                          id : "add-asset",
                          style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
                        }, content);
                        pop.resizable();
                      }
                    });
                    actionsList.push({
                      name : "Detach Link",
                      click : function(){
                        delete eventData.ent;
                        if (obj == game.state) {
                          obj.sync("updateState");
                        }
                        else {
                          obj.update();
                        }
                      }
                    });
                  }
                  actionsList.push({
                    name : "Remove",
                    click : function(){
                      events.splice(eventID, 1);
                      if (obj == game.state) {
                        obj.sync("updateState");
                      }
                      else {
                        obj.update();
                      }
                    }
                  });
                  ui_dropMenu($(this), actionsList, {id : "drop"});

                  ev.stopPropagation();
                  return false;
                });
                eventBar.click(function(ev){
                  ev.stopPropagation();
                  return false;
                });

                var ent = getEnt(eventData.ent);
                if (eventData.ent) {
                  eventBar.addClass("underline flexmiddle");

                  if (ent) {
                    var link = genIcon(assetTypes[ent.data._t].i, eventData.name || sync.rawVal(ent.data.info.name)).appendTo(eventBar);
                    link.addClass("link lrpadding smooth");
                    link.attr("index", eventData.ent);
                    link.css("background-color", eventData.c);
                    link.css("color", eventData.tc);
                    link.click(function(ev){
                      var index = $(this).attr("index");
                      var ent = getEnt(index);
                      if (ent) {
                        if (down[18]) {
                          assetTypes[ent.data._t].preview(ent, $(this));
                        }
                        else {
                          assetTypes[ent.data._t].contextmenu(ent, $(this));
                        }
                      }
                      ev.stopPropagation();
                      return false;
                    });
                  }
                }
                else if (eventData.name) {
                  var p = $("<p>").appendTo(eventBar);
                  p.addClass("link lrpadding smooth");
                  p.css("background-color", eventData.c);
                  p.css("color", eventData.tc);
                  p.css("margin", "0");
                  p.text(eventData.name);
                  p.click(function(ev){
                    $($(this).parent().children()[1]).css("height", $(this).height() + 10);
                    $(this).hide();
                    $($(this).parent().children()[1]).show();
                    $($(this).parent().children()[1]).focus();
                    ev.stopPropagation();
                  });

                  var text = $("<textarea>").appendTo(eventBar);
                  text.addClass("flexrow flexwrap bold fit-x");
                  text.attr("calendar", 0);
                  text.attr("day", currentDay);
                  text.attr("event", k);
                  text.attr("maxlength", "100");
                  text.css("outline", "none");
                  text.css("background-color", eventData.c || "transparent");
                  text.css("color", eventData.tc);
                  text.css("box-shadow", "none");
                  text.css("border", "none");
                  text.css("min-height", "60px");
                  text.text(eventData.name);
                  text.click(function(ev){
                    ev.stopPropagation();
                    return false;
                  });
                  text.blur(function(){
                    $(this).parent().children().show();
                    $(this).hide();
                  });
                  text.change(function(){
                    var val = String($(this).val());
                    if (val.trim()) {
                      obj.data.calendars[scope.calendar].events[$(this).attr("day")][$(this).attr("event")].name = val.trim();
                    }
                    else {
                      obj.data.calendars[scope.calendar].events[$(this).attr("day")].splice($(this).attr("event"), 1);
                    }
                    if (obj == game.state) {
                      obj.sync("updateState");
                    }
                    else {
                      obj.update();
                    }
                  });
                  text.hide();
                }
              }
              else {
                var eventBar = $("<div>").appendTo(day);
                eventBar.addClass("flexrow flexwrap lrpadding subtitle");
                eventBar.text(obj.data.calendars[scope.calendar].events[currentDay].name);
              }
            }
          }
        }
        else {
          day.css("border-color", "transparent");
        }
      }
      break;
    }
    daysCount -= monthData.days;
    presentDay -= monthData.days;
    offset = (weekDays-Math.abs((monthData.days+offset) % weekDays)) % weekDays;
  }
  if (scope.month == null) {
    scope.month = monthOverride;
  }

  return div;
});


sync.render("ui_setting", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", supressHover : app.attr("supressHover") == "true", size : app.attr("size"), width : app.attr("width"), height : app.attr("height")};
  obj.data.setting = obj.data.setting || {};

  function changeTime(){
    if (obj != game.state) {
      return false;
    }
    var applied = false;
    $(".application[ui-name='ui_board']").each(function(){
      if (!applied && $(this).attr("displayApp") != null) {
        applied = true;
        var ent = getEnt($(this).attr("index"));
        if (ent && ent.data && ent.data._t == "b" && hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          var local = $(this).attr("local") == "true";
          var data = ent.data;
          if (obj.data.setting.time == "Night" || obj.data.setting.time == "Full Moon") {
            data.options.filter = ent.data.options.filter || {
              brightness : 65,
            };
            ent.data.options.filter.brightness = 65;
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else if (obj.data.setting.time == "Sunrise" || obj.data.setting.time == "Dawn") {
            data.options.filter = ent.data.options.filter || {
              brightness : 85,
            };
            ent.data.options.filter.brightness = 85;
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else if (obj.data.setting.time == "Sunset" || obj.data.setting.time == "Dusk") {
            data.options.filter = ent.data.options.filter || {
              brightness : 75,
            };
            ent.data.options.filter.brightness = 75;
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else {
            data.options.filter = ent.data.options.filter || {};
            delete data.options.filter.brightness;
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
        }
      }
    });
  }

  function changeWeather(){
    if (obj != game.state) {
      return false;
    }
    var applied = false;
    $(".application[ui-name='ui_board']").each(function(){
      if (!applied && $(this).attr("displayApp") != null) {
        applied = true;
        var ent = getEnt($(this).attr("index"));
        if (ent && ent.data && ent.data._t == "b" && hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
          var local = $(this).attr("local") == "true";
          var data = ent.data;
          if (obj.data.setting.weather == "Snowy") {
            data.options.weather = "snow";
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else if (obj.data.setting.weather == "Light Rain") {
            data.options.weather = "rain";
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else if (obj.data.setting.weather == "Rain") {
            data.options.weather = "rain mix";
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else if (obj.data.setting.weather == "Heavy Rain") {
            data.options.weather = "downpour";
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
          else {
            delete data.options.weather;
            if (!local) {
              ent.sync("updateAsset");
            }
            else {
              ent.update();
            }
          }
        }
      }
    });
  }

  var div = $("<div>");
  div.addClass("flexrow");
  if (!scope.supressHover) {
    div.hover(function(){
      obj.data.setting = obj.data.setting || {};

      var content = $("<div>");
      content.addClass("flexcolumn");

      var images = $("<div>").appendTo(content);
      images.addClass("flexrow flexaround");

      var img = $("<img>").appendTo(images);
      img.attr("src", util.settings.time[obj.data.setting.time]);
      img.attr("width", scope.width || "100px");
      img.attr("height", scope.height || "100px");
      if (!obj.data.setting.time) {
        img.css("opacity", "0");
      }

      var img = $("<img>").appendTo(images);
      img.attr("src", util.settings.weather[obj.data.setting.weather]);
      img.attr("width", scope.width || "100px");
      img.attr("height", scope.height || "100px");
      if (!obj.data.setting.weather) {
        img.css("opacity", "0");
      }

      var img = $("<img>").appendTo(images);
      img.attr("src", util.settings.temp[obj.data.setting.temp]);
      img.attr("width", scope.width || "100px");
      img.attr("height", scope.height || "100px");
      if (!obj.data.setting.temp) {
        img.css("opacity", "0");
      }

      var text = $("<div>").appendTo(content);
      text.addClass("flexrow flexaround");

      text.append("<b class='flex middle'>"+(obj.data.setting.time || "None")+"</b>");
      text.append("<b class='flex middle'>"+(obj.data.setting.weather || "None")+"</b>");
      text.append("<b class='flex middle'>"+(obj.data.setting.temp || "None")+"</b>");

      var pop = ui_popOut({
        target : $(this),
        id : "setting-report",
        align : app.attr("alignpop") || "top",
        title : $("<a class='subtitle' href='https://creativecommons.org/licenses/by/3.0/' target='_blank'>Icons by Yun Liu</a>").css("pointer-events", "auto"),
        noCss : true,
      }, content).addClass("white").css("pointer-events", "none");
    },
    function(){
      if ($("#setting-report").hasClass("white")) {
        layout.coverlay("setting-report");
      }
    });
  }

  var size = scope.size || "18px";
  if (!scope.size && game.state != obj) {
    size = "64px";
  }

  var time = $("<div>").appendTo(div);
  time.addClass("white smooth");
  time.attr("title", obj.data.setting.time || "Click to assign, right click to randomize");
  time.css("width", size);
  time.css("height", size);
  time.css("background-image", "url('"+util.settings.time[obj.data.setting.time]+"')");
  time.css("background-size", "cover");
  time.css("background-position", "center");

  var weather = $("<div>").appendTo(div);
  weather.addClass("white smooth lrmargin");
  weather.attr("title", obj.data.setting.weather || "Click to assign, right click to randomize");
  weather.css("width", size);
  weather.css("height", size);
  weather.css("background-image", "url('"+util.settings.weather[obj.data.setting.weather]+"')");
  weather.css("background-size", "cover");
  weather.css("background-position", "center");

  var temp = $("<div>").appendTo(div);
  temp.addClass("white smooth");
  temp.attr("title", obj.data.setting.temp || "Click to assign, right click to randomize");
  temp.css("width", size);
  temp.css("height", size);
  temp.css("background-image", "url('"+util.settings.temp[obj.data.setting.temp]+"')");
  temp.css("background-size", "cover");
  temp.css("background-position", "center");

  if (hasSecurity(getCookie("UserID"), "Assistant Master") && !scope.viewOnly) {
    time.addClass("hover2");
    time.contextmenu(function(){
      var keys = Object.keys(util.settings.time);
      keys.push(null);

      obj.data.setting = obj.data.setting || {};
      obj.data.setting.time = keys[Math.floor(Math.random()*keys.length)];

      changeTime();

      if (obj == game.state) {
        obj.sync("updateState");
      }
      else {
        obj.update();
      }
      return false;
    });
    time.click(function(){
      var actionList = [];
      for (var i in util.settings.time) {
        actionList.push(
          {
            title : i,
            icon : "tint",
            attr : {title : i, value : util.settings.time[i]},
            style : {"color" : "transparent", "background-image" : "url('"+util.settings.time[i]+"')", "background-size" : "cover", "background-position" : "center"},
            click : function(ev, ui){
              obj.data.setting = obj.data.setting || {};
              obj.data.setting.time = ui.attr("title");

              changeTime();

              if (obj == game.state) {
                obj.sync("updateState");
              }
              else {
                obj.update();
              }
            }
          },
        );
      }

      actionList.push({
        title : "None",
        icon : "tint",
        style : {"color" : "transparent"},
        click : function(ev, ui){
          obj.data.setting = obj.data.setting || {};
          delete obj.data.setting.time;

          changeTime();
          if (obj == game.state) {
            obj.sync("updateState");
          }
          else {
            obj.update();
          }
        }
      });

      ui_dropMenu($(this), actionList, {id : "setting-report", hideClose : true, align : "bottom", style : {"font-size" : "2em"}});
    });

    weather.addClass("hover2");
    weather.contextmenu(function(){
      var keys = Object.keys(util.settings.weather);
      keys.push(null);

      obj.data.setting = obj.data.setting || {};
      obj.data.setting.weather = keys[Math.floor(Math.random()*keys.length)];

      changeWeather();

      if (obj == game.state) {
        obj.sync("updateState");
      }
      else {
        obj.update();
      }
      return false;
    });
    weather.click(function(){
      var actionList = [];
      for (var i in util.settings.weather) {
        actionList.push(
          {
            title : i,
            icon : "tint",
            attr : {title : i, value : util.settings.weather[i]},
            style : {"color" : "transparent", "background-image" : "url('"+util.settings.weather[i]+"')", "background-size" : "cover", "background-position" : "center"},
            click : function(ev, ui){
              obj.data.setting = obj.data.setting || {};
              obj.data.setting.weather = ui.attr("title");

              changeWeather();

              if (obj == game.state) {
                obj.sync("updateState");
              }
              else {
                obj.update();
              }
            }
          },
        );
      }

      actionList.push({
        title : "None",
        icon : "tint",
        style : {"color" : "transparent"},
        click : function(ev, ui){
          obj.data.setting = obj.data.setting || {};
          delete obj.data.setting.weather;

          changeWeather();

          if (obj == game.state) {
            obj.sync("updateState");
          }
          else {
            obj.update();
          }
        }
      });

      ui_dropMenu($(this), actionList, {id : "setting-report", hideClose : true, align : "bottom", style : {"font-size" : "2em"}});
    });

    temp.addClass("hover2");
    temp.contextmenu(function(){
      var keys = Object.keys(util.settings.temp);
      keys.push(null);

      obj.data.setting = obj.data.setting || {};
      obj.data.setting.temp = keys[Math.floor(Math.random()*keys.length)];
      if (obj == game.state) {
        obj.sync("updateState");
      }
      else {
        obj.update();
      }
      return false;
    });
    temp.click(function(){
      var actionList = [];
      for (var i in util.settings.temp) {
        actionList.push(
          {
            title : i,
            icon : "tint",
            attr : {title : i, value : util.settings.temp[i]},
            style : {"color" : "transparent", "background-image" : "url('"+util.settings.temp[i]+"')", "background-size" : "cover", "background-position" : "center"},
            click : function(ev, ui){
              obj.data.setting = obj.data.setting || {};
              obj.data.setting.temp = ui.attr("title");
              if (obj == game.state) {
                obj.sync("updateState");
              }
              else {
                obj.update();
              }
            }
          },
        );
      }

      actionList.push({
        title : "None",
        icon : "tint",
        style : {"color" : "transparent"},
        click : function(ev, ui){
          obj.data.setting = obj.data.setting || {};
          delete obj.data.setting.temp;
          if (obj == game.state) {
            obj.sync("updateState");
          }
          else {
            obj.update();
          }
        }
      });

      ui_dropMenu($(this), actionList, {id : "setting-report", hideClose : true, align : "bottom", style : {"font-size" : "2em"}});
    });
  }

  return div;
});
