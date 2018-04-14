var sync = require("../sync.js");

exports.templates = {
  version : 40,
  grid : {unitScale : 12.8, unit : "ft"},
  constants : {
    basearmor : 0,
    ac : "((@c.counters.ac>0)?(@c.counters.ac):(@c.counters.armor))+@:armor()",
    str : "M@Str",
    dex : "M@Dex",
    con : "M@Con",
    int : "M@Int",
    wis : "M@Wis",
    cha : "M@Cha",
    prof : "@proficiency",
  },
  tables : {

  },
  effects : {
    // one dimensional actions for dice
    "dmg" : {
      name : "Take Damage",
      submenu : {
        x1 : {
          name : "Normal",
          msg : "@pName : Applied @total damage",
          calc : [
            {eq : "@hp-(@total)_0", target : "counters.hp"}
          ]
        },
        x2 : {
          name : "x2",
          msg : "@pName : Applied (@total x2) damage",
          calc : [
            {eq : "@hp-(@total * 2)_0", target : "counters.hp"}
          ]
        },
        x3 : {
          name : "x3",
          msg : "@pName : Applied (@total x3) damage",
          calc : [
            {eq : "@hp-(@total * 3)_0", target : "counters.hp"}
          ]
        },
        half : {
          name : "Half",
          msg : "@pName : Applied (@total /2) damage",
          calc : [
            {eq : "@hp-@:int((@total/2)_0)", target : "counters.hp"}
          ]
        },
      }
    },
    "heal" : {
      name : "Heal",
      msg : "@pName : Applied @total healing",
      calc : [
        {eq : "@hp+(@total)_0", target : "counters.hp"}
      ]
    }
  },
  actions : {
    "c" : {
      "Stat Test" : {
        choices : {
          "Str" : {"bonus" : "#:Str"},
          "Dex" : {"bonus" : "#:Dex"},
          "Con" : {"bonus" : "#:Con"},
          "Int" : {"bonus" : "#:Int"},
          "Wis" : {"bonus" : "#:Wis"},
          "Cha" : {"bonus" : "#:Cha"},
          "AC" : {"threshold" : "#:ac"}
        },
        hot : "1",
        options : {
          "bonus" : true,
          "penalty" : true,
          "threshold" : true,
        },
        eventData : {
          msg : "Tested stat",
          data : "#roll=d20;@roll+(@bonus)-(@penalty)",
          ui : "ui_statTest"
        }
      },
      "Saving Throw" : {
        choices : {
          "Str" : {"bonus" : "M@svStr"},
          "Dex" : {"bonus" : "M@svDex"},
          "Con" : {"bonus" : "M@svCon"},
          "Int" : {"bonus" : "M@svInt"},
          "Wis" : {"bonus" : "M@svWis"},
          "Cha" : {"bonus" : "M@svCha"},
          "AC" : {"threshold" : "#:ac"}
        },
        hot : "1",
        options : {
          "bonus" : true,
          "penalty" : true,
          "threshold" : true,
        },
        eventData : {
          msg : "Saving throw",
          data : "#roll=d20;@roll+(@bonus)-(@penalty)",
          ui : "ui_statTest"
        }
      }
    },
    "i" : {
      "Ranged Attack" : {
        options : {
          "bonus" : true,
          "penalty" : true,
          "threshold" : true,
        },
        eventData : {
          msg : "Ranged attack",
          ui : "ui_statTest",
          data : "$bonus=#:Dex+#:prof;#roll=d20;@roll+(@bonus)-(@penalty)",
        }
      },
      "Melee Attack" : {
        options : {
          "bonus" : true,
          "penalty" : true,
          "threshold" : true,
        },
        eventData : {
          msg : "Melee attack",
          ui : "ui_statTest",
          data : "$bonus=#:Str+#:prof;#roll=d20;@roll+(@bonus)-(@penalty)",
        }
      },
      "Damage" : {
        options : {
          "bonus" : true,
          "penalty" : true,
        },
        eventData : {
          msg : "'@c.info.name'+' rolled damage'",
          data : "@i.weapon.damage+(@bonus)-(@penalty)",
        },
        targeting : {
          cond : "1",
          calc : [
            {target : "counters.hp", value : "@c.counters.hp-@roll"}
          ]
        }
      }
    }
  },
  generation : "dnd_5e",
  item : {
    _t : "i", tags : {},
    info : {
      name : sync.newValue("Name", null),
      weight : sync.newValue("Weight", null, 0),
      quantity : sync.newValue("Quantity", null, 0),
      img : sync.newValue("Image", null),
      notes : sync.newValue("Notes", null),
      price : sync.newValue("Price", null)
    },
    equip : {
      armor : sync.newValue("Armor", null),
    },
    weapon : {
      hit : sync.newValue("+Hit Bonus", null),
      range : sync.newValue("Range", null),
      ammo : sync.newValue("Ammunition", null),
      damage : sync.newValue("Damage", null),
      //type : sync.newValues("DMG Type", null),
      prof : sync.newValue("Proficiency", null),
    },
    spell : {
      level : sync.newValue("Level", null),
      required : sync.newValue("Materials", null),
      duration : sync.newValue("Duration", null),
      time : sync.newValue("Casting Time", null),
      comps : sync.newValue("Casting Components", null),
      //charges : sync.newValue("Casting Charges", 0),
    },
  },
  initiative : {
    query : "d20+M@Dex",
    compare : "(@i1.total>@i2.total)?(1):(@i1.total==@i2.total?(0):(-1))",
  },
  character : {
    _t : "c",
    info : {
      name : sync.newValue("Name", "Default Character"),
      img : sync.newValue("Character Art"),
      race : sync.newValue("Race", "Human"),
      class : sync.newValue("Class"),
      back : sync.newValue("Background"),
      size : sync.newValue("Size", "Medium"),
      notes : sync.newValue("Notes", null),
    },
    stats : {
      Str : sync.newValue("Strength", "4d6k3", 0),
      Dex : sync.newValue("Dexterity", "4d6k3", 0),
      Con : sync.newValue("Constitution", "4d6k3", 0),
      Int : sync.newValue("Intelligence", "4d6k3", 0),
      Wis : sync.newValue("Wisdom", "4d6k3", 0),
      Cha : sync.newValue("Charisma", "4d6k3", 0),
    },
    counters : {
      level : sync.newValue("Level", 1, 0),
      exp : sync.newValue("Experience", 0, 0),
      hp : sync.newValue("Hit Points", 10, 0, 10),
      speed : sync.newValue("Speed", "30"),
      armor : sync.newValue("Base Armor", 10),
      ac : sync.newValue("Armor", 0),
      proficiency : sync.newValue("Proficiency", 0, 0),
      inspiration : sync.newValue("Inspiration", 0, 0),
      hit : sync.newValue("Hit Dice", "1d10"),
      svStr : sync.newValue("Strength Save", 0), // blank because don't want to replicate name data
      svDex : sync.newValue("Dexterity Save", 0),
      svCon : sync.newValue("Constitution Save", 0),
      svInt : sync.newValue("Intelligence Save", 0),
      svWis : sync.newValue("Wisdom Save", 0),
      svCha : sync.newValue("Charisma Save", 0),
      svDeath : sync.newValue("Death Save", 0, 0),
      svLife : sync.newValue("Life Save", 0, 0),
      cp : sync.newValue("CP", 0, 0),
      sp : sync.newValue("SP", 0, 0),
      gp : sync.newValue("GP", 0, 0),
      "1st" : sync.newValue("1st", 0, 0),
      "2nd" : sync.newValue("2nd", 0, 0),
      "3rd" : sync.newValue("3rd", 0, 0),
      "4th" : sync.newValue("4th", 0, 0),
      "5th" : sync.newValue("5th", 0, 0),
      "6th" : sync.newValue("6th", 0, 0),
      "7th" : sync.newValue("7th", 0, 0),
      "8th" : sync.newValue("8th", 0, 0),
      "9th" : sync.newValue("9th", 0, 0),
    },
    tags : {},
    spells : {}, // equipement for spells
    skills : {
      acr : sync.newValue("Acrobatics (Dex)"),
      ani : sync.newValue("Animal Handling (Wis)"),
      arc : sync.newValue("Arcana (Int)"),
      ath : sync.newValue("Athletics (Str)"),
      dec : sync.newValue("Deception (Cha)"),
      his : sync.newValue("History (Int)"),
      ins : sync.newValue("Insight (Wis)"),
      int : sync.newValue("Intimidation (Cha)"),
      inv : sync.newValue("Investigation (Int)"),
      med : sync.newValue("Medicine (Wis)"),
      nat : sync.newValue("Nature (Int)"),
      per : sync.newValue("Perception (Wis)"),
      pfm : sync.newValue("Performance (Cha)"),
      prs : sync.newValue("Persuasion (Cha)"),
      rel : sync.newValue("Religion (Int)"),
      sle : sync.newValue("Sleight of Hand (Dex)"),
      ste : sync.newValue("Stealth (Dex)"),
      sur : sync.newValue("Survival (Wis)"),
    },
    talents : {},
    inventory : [],
    spellbook : [], //storage for spells
    specials : {}, // special rules
  },
  dice : {
    defaults : ["d20", "d12", "d10", "d8", "d6", "d4"],
    modifiers : [0,1,2,3,4,5,6,7,8,9,10],
    ui : "ui_diceResults",
    keys : {
      "a" : {name : "Advantage", img : "/content/dice/advantage.png"},
      "f" : {name : "Failure", img : "/content/dice/failure.png"},
      "s" : {name : "Success", img : "/content/dice/success.png"},
      "t" : {name : "Threat", img : "/content/dice/threat.png"},
      "tri" : {name : "Triumph", img : "/content/dice/triumph.png"},
      "des" : {name : "Despair", img : "/content/dice/despair.png"},
      "light" : {name : "Light", img : "/content/dice/lightside.png"},
      "dark" : {name : "Dark", img : "/content/dice/darkside.png"},
      "minus" : {name : "Minus", img : "/content/dice/minus.png"},
      "plus" : {name : "Plus", img : "/content/dice/plus.png"},
    },
    pool : {
      "d2" : {value : "d2"},
      "d4" : {value : "d4"},
      "d5" : {value : "d5"},
      "d6" : {value : "d6"},
      "d8" : {value : "d8"},
      "d10" : {value : "d10"},
      "d12" : {value : "d12"},
      "d20" : {value : "d20"},
      "d100" : {value : "d100"},
      "proficiency" : {
        static : true,
        value : "d12",
        display : {
          "background-color" : "rgb(255,230,0)",
          "border" : "1px solid black",
          "color" : "black"
        },
        results : {
          "1" : {a:2},
          "2" : {a:1},
          "3" : {a:2},
          "4" : {tri:1, s:1},
          "5" : {s:1},
          "6" : {s:1, a:1},
          "7" : {s:1},
          "8" : {s:1, a:1},
          "9" : {s:2},
          "10" : {s:1, a:1},
          "11" : {s:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/triumph.png"]},
          "5" : {imgs : ["/content/dice/success.png"]},
          "6" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "7" : {imgs : ["/content/dice/success.png"]},
          "8" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "9" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "10" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "11" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "12" : {imgs : []},
        }
      },
      "ability" : {
        static : true,
        value : "d8",
        display : {
          "background-color" : "rgb(80,185,75)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {s:1},
          "2" : {a:1},
          "3" : {s:1, a:1},
          "4" : {s:2},
          "5" : {a:1},
          "6" : {s:1},
          "7" : {a:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/success.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "5" : {imgs : ["/content/dice/advantage.png"]},
          "6" : {imgs : ["/content/dice/success.png"]},
          "7" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "8" : {},
        }
      },
      "boost" : {
        static : true,
        value : "d6",
        display : {
          "background-color" : "rgb(135,215,245)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {s:1, a:1},
          "2" : {a:1},
          "3" : {a:2},
          "4" : {s:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/success.png"]},
          "5" : {},
          "6" : {},
        }
      },
      "challenge" : {
        static : true,
        value : "d12",
        display : {
          "background-color" : "rgb(230,25,55)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {t:2},
          "2" : {t:1},
          "3" : {t:2},
          "4" : {t:1},
          "5" : {f:1, t:1},
          "6" : {f:1},
          "7" : {f:1, t:1},
          "8" : {f:1},
          "9" : {des:1, f:1},
          "10" : {f:2},
          "11" : {f:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "2" : {imgs : ["/content/dice/threat.png"]},
          "3" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "4" : {imgs : ["/content/dice/threat.png"]},
          "5" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "6" : {imgs : ["/content/dice/failure.png"]},
          "7" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "8" : {imgs : ["/content/dice/failure.png",]},
          "9" : {imgs : ["/content/dice/despair.png"]},
          "10" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "11" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "12" : {imgs : []},
        }
      },
      "difficulty" : {
        static : true,
        value : "d8",
        display : {
          "background-color" : "rgb(85,35,130)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {t:1},
          "2" : {f:1},
          "3" : {f:1, t:1},
          "4" : {t:1},
          "6" : {t:2},
          "7" : {f:2},
          "8" : {t:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/threat.png"]},
          "2" : {imgs : ["/content/dice/failure.png"]},
          "3" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "4" : {imgs : ["/content/dice/threat.png"]},
          "5" : {imgs : []},
          "6" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "7" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "8" : {imgs : ["/content/dice/threat.png"]},
        }
      },
      "setback" : {
        static : true,
        value : "d6",
        display : {
          "background-color" : "black",
          "border" : "1px solid black"
        },
        results : {
          "1" : {f:1},
          "2" : {f:1},
          "3" : {t:1},
          "4" : {t:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/failure.png"], f:1},
          "2" : {imgs : ["/content/dice/failure.png"], f:1},
          "3" : {imgs : ["/content/dice/threat.png"], t:1},
          "4" : {imgs : ["/content/dice/threat.png"], t:1},
          "5" : {},
          "6" : {},
        }
      },
      "force" : {
        static : true,
        value : "d12",
        display : {
          "background-color" : "white",
          "border" : "1px solid black",
          "color" : "black"
        },
        results : {
          "1" : {dark:1},
          "2" : {light:2},
          "3" : {dark:1},
          "4" : {light:2},
          "5" : {dark:1},
          "6" : {light:2},
          "7" : {dark:1},
          "8" : {light:1},
          "9" : {dark:1},
          "10" : {light:1},
          "11" : {dark:1},
          "12" : {dark:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/darkside.png"]},
          "2" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "3" : {imgs : ["/content/dice/darkside.png"]},
          "4" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "5" : {imgs : ["/content/dice/darkside.png"]},
          "6" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "7" : {imgs : ["/content/dice/darkside.png"]},
          "8" : {imgs : ["/content/dice/lightside.png",]},
          "9" : {imgs : ["/content/dice/darkside.png"]},
          "10" : {imgs : ["/content/dice/lightside.png"]},
          "11" : {imgs : ["/content/dice/darkside.png"]},
          "12" : {imgs : ["/content/dice/darkside.png","/content/dice/darkside.png"]},
        }
      },
      "fate" : {
        value : "(d3-2)",
        results : {
          "-1" : {minus:1},
          "0" : {},
          "1" : {plus:1},
        },
        translations : {
          "-1" : {imgs : ["/content/dice/minus.png"], minus:1},
          "0" : {},
          "1" : {imgs : ["/content/dice/plus.png"], plus:1},
        }
      }
    }
  },
  display : {
    ui : {
      "ui_poolResults" : {
        classes : "flexrow flexaround",
        dice : {
          width : "30px",
          height : "30px",
        },
        results : {
          style : {"width" : "50%", "background-color" : "grey"},
          display : {
            classes : "flexrow flexaround flex",
            display : [
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.s-@pool.f)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/success.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.s-@pool.f)",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.f-@pool.s)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/failure.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.f-@pool.s)",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.a-@pool.t)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/advantage.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.a-@pool.t)",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.t-@pool.a)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/threat.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.t-@pool.a)",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "@pool.tri>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/triumph.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+@pool.tri",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "@pool.des>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/despair.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+@pool.des",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.light-@pool.dark)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/lightside.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.light-@pool.dark)",
                  }
                ],
              },
              { // Star wars die
                classes : "flexmiddle",
                cond : "(@pool.dark-@pool.light)>0",
                ui : "ui_icon",
                scope : {image : "/content/dice/darkside.png"},
                display : [
                  {
                    style : {"font-weight" : "bold"},
                    value : "'x'+(@pool.dark-@pool.light)",
                  }
                ],
              }
            ]
          }
        },
        display : {
          classes : "outline lrpadding flexrow flexmiddle flexwrap flex",
        },
      },
      "ui_statTest" : {
        classes : "flexrow flexaround",
        style : {},
        dice : {
          results : [
            {
              classes : "focus outline",
              cond : "@roll==1",
              bottom : "'Crit Fail'", // change default
            },
            {
              classes : "highlight outline",
              cond : "@threshold!=0&&@threshold<=@total",
              bottom : "'Success'", // change default
            },
            {
              classes : "highlight outline",
              cond : "@roll==20",
              bottom : "'Crit Success'", // change default
            },
          ],
        },
      },
    },
    item : {
      params : {},
      summary : {
        display : [
          // each one is a row
          {
            classes : "fit-x flexbetween",
            display : [
              {target : "info.img", ui : "ui_icon",},
              {target : "info.name", classes : "flex flexcolumn flexmiddle", name : ""},
              {target : "info.quantity", classes : "flexmiddle", style : {"font-size" : "0.8em"}, name : "x", cond : "@i.info.quantity>1"},
            ]
          },
          {
            classes : "fit-x flexbetween",
            style : {"font-size" : "0.8em"},
            display : [
              {classes : "lrpadding", target : "weapon.damage", cond : "('@i.weapon.damage'!=0)&&('@i.weapon.damage'!='')", name : "Damage: "},
              {classes : "lrpadding", target : "weapon.range", cond : "('@i.weapon.range'!=0)&&('@i.weapon.range'!='')", name : "Range: "},
            ]
          },
          {
            classes : "fit-x flexrow",
            style : {"font-size" : "0.8em"},
            name : "",
            target : "info.special",
            cond : "('@i.info.special'!=0)&&('@i.info.special'!='')"
          },
        ]
      },
    },
    sheet : {
      health : "counters.hp", //path to health
      style : {"background-image" : "url('/content/sheet2.png')", "background-size" : "cover", "box-shadow" : "inset 0em 0em 0.5em 0.5em rgba(0,0,0,0.2)"},
      content : {
        classes : "lpadding flexcolumn flex",
        display : [
          {
            classes : "flexrow flex flexbetween",
            display : [
              {
                classes : "flexcolumn flex",
                display : [
                  {
                    classes : "flexcolumn",
                    style : {"position" : "relative"},
                    display : [
                      {
                        classes : "flexcolumn smooth outline white",
                        ui : "ui_image",
                        target : "info.img",
                        style : {"min-width" : "225px", "min-height" : "225px"},
                      },
                      {style : {"position" : "absolute", "right" : "0", "bottom" : "0"}, title : "Map Token", target : "info.img", ui : "ui_token", scope : {classes : "smooth outline white"}}
                    ]
                  },
                  {classes : "flexcolumn flexmiddle spadding", target : "counters.hp", ui : "ui_progressBar", scope : {bar : true, value : "counters.hp", max : "counters.hp.max"}},
                  {
                    classes : "flexcolumn flex",
                    tab : "Skills",
                    tabClass : "flex flexmiddle subtitle button spadding smooth",
                    selectClass : "flex flexmiddle highlight alttext subtitle spadding smooth outline",
                    tabKey : "skillTab",
                    style : {"white-space" : "nowrap"},
                    tabs : {
                      "Skills" : {
                        classes : "flexcolumn bold lrmargin",
                        style : {"white-space" : "normal"},
                        display : [
                          {
                            classes : "flexmiddle lrpadding lrmargin",
                            style : {
                              "font-size": "2em",
                              "font-family" : "Nodesto Caps Condensed",
                            },
                            name : "Passive Wisdom",
                            value : "'('+(10+#:Wis+M@c.skills.per+((R@c.skills.per>0)?(#:prof):(0)))+')'"
                          },
                          {
                            classes : "flexrow flex",
                            style : {"text-align" : "left"},
                            ui : "ui_skillList",
                            scope : {
                              lookup : "skills",
                              applyUI : {
                                classes : "flexrow flexwrap flex lrpadding",
                                style : {"font-family" : "Scaly Sans"},
                                display : [
                                  {classes : "smargin", title : "Proficient", target : "skills.@skillKey", ui : "ui_checkbox", scope : {saveInto : "skills.@skillKey", cond : "R@c.skills.@skillKey==1", checked : "1", unchecked : "0"}},
                                  {classes : "bold", ui : "ui_link", scope : {name : "@c.skills.@skillKey.name ", click : "ui_modifiers", lookup : "skills.@skillKey", attr : {"modsOnly" : true}}},
                                  {
                                    classes : "lrmargin hover2",
                                    cond : "R@c.skills.@skillKey==1",
                                    click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "M@c.skills.@skillKey+#:prof+M@c.stats.@statKey"}},
                                    value : "'('+@:sign(M@c.skills.@skillKey+#:prof+M@c.stats.@statKey)+')'",
                                    title : "@c.skills.@skillKey"
                                  },
                                  {
                                    classes : "lrmargin hover2",
                                    cond : "R@c.skills.@skillKey==0",
                                    click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "M@c.skills.@skillKey+M@c.stats.@statKey"}},
                                    value : "'('+@:sign(M@c.skills.@skillKey+M@c.stats.@statKey)+')'",
                                    title : "@c.skills.@skillKey"
                                  }
                                ],
                              }
                            }
                          },
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "bold", name : "New Skill"},
                            {
                              classes : "bold flexmiddle create",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "skills"}
                            }
                          ]},
                        ]
                      },
                      "Features" : {
                        classes : "flexcolumn lrmargin",
                        style : {"white-space" : "normal"},
                        display : [
                          {target : "talents",
                          style : {"overflow-y" : "auto", "overflow-x" : "visible"},
                          datalist : {
                            classes : "flexrow flexbetween",
                            display : [
                              {
                                classes : "link flex",
                                style : {"font-family" : "Nodesto Caps Condensed", "font-size" : "1.4em"},
                                title : "@%dataTarget%",
                                name : "",
                                target : "%dataTarget%",
                                value : "@c.%dataTarget%.name",
                                click : {view : "talents"},
                              },
                              {
                                classes : "flexmiddle",
                                name : "",
                                target : "%dataTarget%",
                                link : "edit",
                                click : {edit : "talents"},
                              },
                              {
                                classes : "flexmiddle destroy",
                                name : "",
                                link : "trash",
                                click : {delete : true, target : "%dataTarget%"}
                              },
                            ]
                          }},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "bold", name : "New Feature"},
                            {
                              classes : "bold flexmiddle create",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "talents"}
                            }
                          ]},
                        ]
                      },
                      "Special Rules" : {
                        classes : "flexcolumn lrmargin",
                        style : {"white-space" : "normal"},
                        display : [
                          {target : "specials",
                          style : {"overflow-y" : "auto", "overflow-x" : "visible"},
                          datalist : {
                            classes : "flexrow flexbetween",
                            display : [
                              {
                                classes : "link flex",
                                style : {"font-family" : "Nodesto Caps Condensed", "font-size" : "1.4em"},
                                title : "@%dataTarget%",
                                name : "",
                                target : "%dataTarget%",
                                value : "@c.%dataTarget%.name",
                                click : {view : "specials"},
                              },
                              {
                                classes : "flexmiddle",
                                name : "",
                                target : "%dataTarget%",
                                link : "edit",
                                click : {edit : "specials"},
                              },
                              {
                                classes : "flexmiddle destroy",
                                name : "",
                                link : "trash",
                                click : {delete : true, target : "%dataTarget%"}
                              },
                            ]
                          }},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "bold", name : "New Special Rule"},
                            {
                              classes : "bold flexmiddle create",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "specials"}
                            }
                          ]},
                        ]
                      }
                    }
                  },
               ]
              },
              {
                classes : "flexcolumn flex2 flexbetween",
                display : [
                  {
                    classes : "flexcolumn",
                    display : [
                      {
                        classes : "flexrow flexbetween fit-x",
                        style : {
                          "font-size": "2em",
                          "font-family" : "Nodesto Caps Condensed",
                        },
                        display : [
                          {
                            classes : "lrmargin flex lrpadding",
                            name : "",
                            target : "info.name",
                            edit : {
                              classes : "line",
                              style : {
                                "border" : "none",
                              },
                            }
                          },
                          {
                            classes : "flexmiddle",
                            display : [
                              {
                                classes : "lrmargin lrpadding subtitle",
                                name : "Lvl.",
                                target : "counters.level",
                                edit : {
                                  classes : "line middle",
                                  style : {
                                    "border" : "none",
                                    "width" : "30px",
                                  },
                                }
                              },
                            ]
                          }
                        ]
                      },
                      {
                        classes : "flexrow fit-x",
                        display : [
                          {
                            classes : "flexrow subtitle lrmargin flex",
                            target : "info.race",
                            edit : {classes : "line lrmargin middle"},
                          },
                          {
                            classes : "flexrow subtitle lrmargin flex2",
                            target : "info.back",
                            edit : {classes : "line lrmargin middle"},
                          },
                          {
                            classes : "flexrow subtitle lrmargin flex",
                            target : "info.class",
                            edit : {classes : "line lrmargin middle"},
                          },
                        ]
                      },
                    ]
                  },
                  {
                    style : {
                      "height" : "4px",
                      "background" : "linear-gradient(to right, rgba(170,0,0,1.0), rgba(230,44,55,1.0), rgba(230,44,55,0))",
                      "border-bottom-right-radius" : "100%",
                      "margin-top" : "2px",
                    }
                  },
                  {
                    classes : "flexcolumn",
                    display : [
                      {
                        classes : "flexrow flexbetween",
                        display : [
                          {
                            classes : "flexcolumn",
                            display : [
                              {classes : "flexrow fit-x lrmargin bold subtitle", display : [
                                {target : "counters.armor", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                                {classes : "flexrow lrmargin", display : [
                                  {value : "("},
                                  {name : "", title : "Current Armor", target : "counters.ac", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                                  {value : ")"},
                                  {classes : "flexcolumn smooth hover2", title : "With Shields", style : {"width" : "20px", "height" : "20px"}, click : {action : "Stat Test", options : {threshold : "#:ac"}},
                                    ui : "ui_image", scope : {viewOnly : true, classes : "flexmiddle alttext", image : "/content/icons/Shield1000p.png", title : "#:ac"}},
                                ]}
                              ]},
                              {classes : "flexrow fit-x lrmargin bold subtitle", display : [
                                {target : "counters.hp", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                                {value : "/"},
                                {name : "", target : "counters.hp", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                                {classes : "flexrow lrmargin", display : [
                                  {value : "("},
                                  {name : "", target : "counters.hit", edit : {classes : "line", style : {width : "40px", "text-align" : "center"}}},
                                  {value : ")"},
                                ]},
                              ]},
                              {classes : "flexrow fit-x lrmargin bold subtitle", display : [
                                {target : "counters.speed", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                                {value : "ft"},
                              ]},
                            ]
                          },
                          {
                            classes : "flexrow",
                            display : [
                              {classes : "flexcolumn subtitle lightoutline spadding smooth", display : [
                                {classes : "bold flexmiddle", name : "Death Saves"},
                                {classes : "flexcolumn flexmiddle fit-x", display : [
                                  {classes : "flexrow flexaround fit-x", display : [
                                    {title : "Life Save 1", target : "counters.svLife", ui : "ui_checkbox", scope : {saveInto : "counters.svLife", cond : "R@c.counters.svLife>=1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                    {title : "Life Save 2", target : "counters.svLife", ui : "ui_checkbox", scope : {saveInto : "counters.svLife", cond : "R@c.counters.svLife>=2", checked : "2", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                    {title : "Life Save 3", target : "counters.svLife", ui : "ui_checkbox", scope : {saveInto : "counters.svLife", cond : "R@c.counters.svLife>=3", checked : "3", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                  ]},
                                ]},
                                {classes : "flexcolumn flexmiddle fit-x", display : [
                                  {classes : "bold flexmiddle subtitle", name : "Failures"},
                                  {classes : "flexrow flexaround fit-x", display : [
                                    {title : "Death Save 1", target : "counters.svDeath", ui : "ui_checkbox", scope : {saveInto : "counters.svDeath", cond : "R@c.counters.svDeath>=1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                    {title : "Death Save 2", target : "counters.svDeath", ui : "ui_checkbox", scope : {saveInto : "counters.svDeath", cond : "R@c.counters.svDeath>=2", checked : "2", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                    {title : "Death Save 3", target : "counters.svDeath", ui : "ui_checkbox", scope : {saveInto : "counters.svDeath", cond : "R@c.counters.svDeath>=3", checked : "3", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                  ]},
                                ]},
                              ]},
                              {classes : "flexcolumn subtitle lightoutline spadding smooth", display : [
                                {classes : "flexrow flex", display : [
                                  {classes : "bold flexmiddle lrpadding", name : "Inspiration"},
                                  {classes : "flex"},
                                  {classes : "flexmiddle lrmargin round", name : "", target : "counters.inspiration", edit : {classes : "bold middle outline spadding subtitle", style : {width : "30px", height : "20px"}}},
                                ]},
                                {classes : "flexrow flex", display : [
                                  {classes : "bold flexmiddle lrpadding", name : "Proficiency"},
                                  {classes : "flex"},
                                  {classes : "flexmiddle lrmargin smooth", name : "", target : "counters.proficiency", edit : {classes : "bold middle smooth outline spadding subtitle", style : {width : "30px", height : "20px"}}},
                                ]},
                              ]},
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    style : {
                      "height" : "4px",
                      "background" : "linear-gradient(to right, rgba(170,0,0,1.0), rgba(230,44,55,1.0), rgba(230,44,55,0))",
                      "border-bottom-right-radius" : "100%",
                      "margin-top" : "2px",
                    }
                  },
                  {classes : "flexrow flexaround", target : "stats", applyUI : {
                    display : {
                      classes : "flexcolumn flexmiddle",
                      style : {
                        "font-family" : "Scaly Sans",
                      },
                      display : [
                        {
                          classes : "bold",
                          ui : "ui_link",
                          scope : {name : "@applyKey", click : "ui_modifiers", lookup : "@applyTarget", attr : {"modsOnly" : true}},
                        },
                        {
                          classes : "flexrow flexmiddle",
                          display : [
                            {name : "", target : "@applyTarget", edit : {classes : "line", style : {width : "28px", "text-align" : "center"}, raw : true}},
                            {classes : "hover2 lrmargin", value : "'('+@:sign(M@c.@applyTarget)+')'", click : {action : "Stat Test", msg : "tested @c.@applyTarget.name", options : {"bonus" : "M@c.@applyTarget"}}},
                          ]
                        }
                      ],
                    }
                  }},
                  {
                    classes : "flexcolumn flexmiddle fit-x subtitle lrpadding",
                    display : [
                      {classes : "flexmiddle bold", name : "Saves"},
                      {classes : "flexrow flexaround flexwrap flex", display : [
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svStr", ui : "ui_checkbox", scope : {saveInto : "counters.svStr", cond : "R@c.counters.svStr==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Str", click : "ui_modifiers", lookup : "counters.svStr", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svStr)+')'", click : {action : "Saving Throw", msg : "Strength Save", options : {"bonus" : "M@c.counters.svStr"}}}
                          ],
                        },
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svDex", ui : "ui_checkbox", scope : {saveInto : "counters.svDex", cond : "R@c.counters.svDex==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Dex", click : "ui_modifiers", lookup : "counters.svDex", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svDex)+')'", click : {action : "Saving Throw", msg : "Dexterity Save", options : {"bonus" : "M@c.counters.svDex"}}}
                          ],
                        },
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svCon", ui : "ui_checkbox", scope : {saveInto : "counters.svCon", cond : "R@c.counters.svCon==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Con", click : "ui_modifiers", lookup : "counters.svCon", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svCon)+')'", click : {action : "Saving Throw", msg : "Constitution Save", options : {"bonus" : "M@c.counters.svCon"}}}
                          ],
                        },
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svInt", ui : "ui_checkbox", scope : {saveInto : "counters.svInt", cond : "R@c.counters.svInt==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Int", click : "ui_modifiers", lookup : "counters.svInt", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svInt)+')'", click : {action : "Saving Throw", msg : "Intelligence Save", options : {"bonus" : "M@c.counters.svInt"}}}
                          ],
                        },
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svWis", ui : "ui_checkbox", scope : {saveInto : "counters.svWis", cond : "R@c.counters.svWis==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Wis", click : "ui_modifiers", lookup : "counters.svWis", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svWis)+')'", click : {action : "Saving Throw", msg : "Wisdom Save", options : {"bonus" : "M@c.counters.svWis"}}}
                          ],
                        },
                        {
                          classes : "flexmiddle lrpadding",
                          style : {"font-family" : "Scaly Sans"},
                          display : [
                            {title : "Proficient", target : "counters.svCha", ui : "ui_checkbox", scope : {saveInto : "counters.svCha", cond : "R@c.counters.svCha==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                            {classes : "bold", ui : "ui_link", scope : {name : "Cha", click : "ui_modifiers", lookup : "counters.svCha", attr : {"modsOnly" : true}}},
                            {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svCha)+')'", click : {action : "Saving Throw", msg : "Charisma Save", options : {"bonus" : "M@c.counters.svCha"}}}
                          ],
                        },
                      ]}
                    ]
                  },
                  {
                    style : {
                      "height" : "4px",
                      "background" : "linear-gradient(to right, rgba(170,0,0,1.0), rgba(230,44,55,1.0), rgba(230,44,55,0))",
                      "border-bottom-right-radius" : "100%",
                      "margin-top" : "2px",
                    }
                  },
                  {
                    classes : "flexcolumn flex",
                    tab : "Inventory and Spells",
                    tabClass : "flex flexmiddle subtitle button spadding smooth",
                    selectClass : "flex flexmiddle highlight alttext subtitle spadding smooth outline",
                    tabs : {
                      "Inventory and Spells" : {
                        classes : "flexcolumn flex padding",
                        display : [
                          {classes : "flexrow", style : {"font-size" : "2em"}, display : [
                            {
                              style : {"font-family" : "Nodesto Caps Condensed"},
                              classes : "bold",
                              name : "Inventory"
                            },
                            {
                              classes : "bold flexmiddle create subtitle lrmargin",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "inventory"}
                            }
                          ]},
                          {
                            classes : "spadding white outline smooth",
                            style : {"text-align" : "left", "height" : "190px", "overflow-y" : "auto"},
                            scrl : "inv",
                            ui : "ui_entryList",
                            scope : {
                              drop : "inventoryDrop",
                              connectWith : ".inventoryDrop",
                              reposition : true,
                              lookup : "inventory",
                              applyUI : {classes : "flexcolumn flex subtitle", display : [
                                {
                                  classes : "fit-x flexbetween",
                                  display : [
                                    {
                                      classes : "flexcolumn",
                                      ui : "ui_image",
                                      target : "@applyTarget.info.img",
                                      style : {"width" : "15px", "height" : "15px"},
                                      scope : {def : "/content/icons/Backpack1000p.png"},
                                    },
                                    {classes : "flex lrpadding", name : "", target : "@applyTarget.info.name", edit : {classes : "lrpadding line flex", style : {"min-width" : "70px"}, raw : "1"}},
                                    {name : "", target : "@applyTarget.info.quantity", edit : {classes : "lrmargin line middle", title : "Quantity", style : {"width" : "24px"}, raw : "1"}},
                                    {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle", cond : "(@c.@applyTarget.equip.armor!=0 || @c.@applyTarget.tags.armor)",
                                      value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                                      click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"},{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                                    },
                                    {
                                      classes : "flexmiddle lrmargin",
                                      name : "",
                                      link : "edit",
                                      target : "@applyTarget",
                                      click : {edit : "@applyTarget"}
                                    },
                                    {
                                      classes : "flexmiddle destroy",
                                      name : "",
                                      link : "trash",
                                      click : {delete : true, target : "@applyTarget"}
                                    },
                                  ]
                                },
                                {
                                  classes : "fit-x flexbetween subtitle spadding",
                                  cond : "(@:valid(@c.@applyTarget.weapon.damage)>0) || (@:valid(@c.@applyTarget.weapon.range)>0)",
                                  style : {"margin-bottom" : "4px"},
                                  display : [
                                    {classes : "lrpadding bold", target : "@applyTarget.weapon.damage", cond : "(@:valid(@c.@applyTarget.weapon.damage)>0)", name : "Damage: "},
                                    {classes : "lrpadding bold", target : "@applyTarget.weapon.range", cond : "(@:valid(@c.@applyTarget.weapon.range)>0)", name : "Range: "},
                                    //{name : "", target : "@applyTarget.info.weight", edit : {classes : "lrmargin line middle",title : "Weight", style : {"width" : "24px"}, raw : "1"}},
                                  ]
                                },
                              ]}
                            }
                          },
                          {classes : "flexrow flexbetween white smooth outline subtitle spadding", display : [
                            {classes : "bold subtitle middle", name : "Gold : "},
                            {classes : "middle bold subtitle lrmargin", target : "counters.cp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                            {classes : "middle bold subtitle lrmargin", target : "counters.sp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                            {classes : "middle bold subtitle lrmargin", target : "counters.gp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                          ]},
                          {classes : "flexrow", display : [
                            {classes : "bold subtitle lrmargin", name : "Weight (@:weight()lbs)"},
                            {classes : "spadding lrmargin flex", ui : "ui_progressBar", scope : {percentage : "@:weight()", max : "R@c.stats.Str*15", col : "rgb(@:int(@percentage*200),@:int(200-(@percentage*200)),0)"}},
                            {classes : "bold subtitle lrmargin", title : "Str*15", value : "@:int((@:weight()/(R@c.stats.Str*15))*100)+'%'"}
                          ]},
                          {classes : "flexrow", style : {"font-size" : "2em"}, display : [
                            {
                              style : {"font-family" : "Nodesto Caps Condensed"},
                              classes : "bold",
                              name : "Spellbook"
                            },
                            {
                              classes : "bold flexmiddle create subtitle lrmargin",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "spellbook"}
                            }
                          ]},
                          {
                            classes : "flexrow flex flexbetween",
                            display : [
                              {
                                classes : "flex spadding white outline smooth",
                                style : {"text-align" : "left", "height" : "190px", "overflow-y" : "auto"},
                                scrl : "spl",
                                ui : "ui_entryList",
                                scope : {
                                  drop : "spellDrop",
                                  connectWith : ".spellDrop",
                                  reposition : true,
                                  lookup : "spellbook",
                                  applyUI : {classes : "flexcolumn flex subtitle", display : [
                                    {classes : "flexrow flexmiddle", display : [
                                      {
                                        classes : "flexcolumn",
                                        ui : "ui_image",
                                        target : "@applyTarget.info.img",
                                        style : {"width" : "15px", "height" : "15px"},
                                        scope : {def : "/content/icons/Backpack1000p.png"},
                                      },
                                      {classes : "lrpadding flex", name : "", target : "@applyTarget.info.name", edit : {classes : "lrpadding line flex", style : {"min-width" : "70px"}, raw : "1"}},
                                      {
                                        classes : "flexmiddle",
                                        name : "",
                                        link : "edit",
                                        target : "@applyTarget",
                                        click : {edit : "@applyTarget"}
                                      },
                                      {
                                        classes : "flexmiddle destroy lrmargin",
                                        name : "",
                                        link : "trash",
                                        click : {delete : true, target : "@applyTarget"}
                                      },
                                    ]},
                                    {classes : "flexrow flexbetween", display : [
                                      {classes : "lrpadding subtitle", name : "", target : "@applyTarget.spell.level", edit : {classes : "lrpadding line middle", style : {"width" : "45px"}}},
                                    ]}
                                  ]}
                                }
                              },
                              {classes : "flexcolumn subtitle white smooth outline spadding flexmiddle", style : {"height" : "190px"}, display : [
                                {classes : "bold underline middle spadding", name : "Spell Slots"},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.1st", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.1st", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.2nd", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.2nd", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.3rd", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.3rd", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.4th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.4th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.5th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.5th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.6th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.6th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.7th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.7th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.8th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.8th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                                {classes : "flexrow flexaround", display : [
                                  {classes : "bold subtitle lrmargin", target : "counters.9th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                                  {name : "/"},
                                  {classes : "bold subtitle lrmargin", name : "", target : "counters.9th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                                ]},
                              ]},
                            ]
                          },
                        ]
                      },
                      "Notes" : {
                        classes : "flexcolumn flex",
                        ui : "ui_rawNotes",
                      }
                    }
                  },
                ]
              }
            ]
          },
        ]
      },
      calc : [
        // everytime an update happens this is applied
        {name : "Stat-Bonuses", target : "stats.Str.modifiers.Stat-Bonus", eq : "(R@c.stats.Str/30*15)f-5"},
        {target : "stats.Dex.modifiers.Stat-Bonus", eq : "(R@c.stats.Dex/30*15)f-5"},
        {target : "stats.Con.modifiers.Stat-Bonus", eq : "(R@c.stats.Con/30*15)f-5"},
        {target : "stats.Int.modifiers.Stat-Bonus", eq : "(R@c.stats.Int/30*15)f-5"},
        {target : "stats.Wis.modifiers.Stat-Bonus", eq : "(R@c.stats.Wis/30*15)f-5"},
        {target : "stats.Cha.modifiers.Stat-Bonus", eq : "(R@c.stats.Cha/30*15)f-5"},
        // Saving
        {name : "Saving Bonuses", target : "counters.svStr.modifiers.Stat-Bonus", eq : "#:Str"},
        {target : "counters.svDex.modifiers.Stat-Bonus", eq : "#:Dex"},
        {target : "counters.svCon.modifiers.Stat-Bonus", eq : "#:Con"},
        {target : "counters.svInt.modifiers.Stat-Bonus", eq : "#:Int"},
        {target : "counters.svWis.modifiers.Stat-Bonus", eq : "#:Wis"},
        {target : "counters.svCha.modifiers.Stat-Bonus", eq : "#:Cha"},
        // Proficiency
        {name : "Proficiency", target : "counters.svStr.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svStr>0"},
        {target : "counters.svDex.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svDex>0"},
        {target : "counters.svCon.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svCon>0"},
        {target : "counters.svInt.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svInt>0"},
        {target : "counters.svWis.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svWis>0"},
        {target : "counters.svCha.modifiers.Proficiency", eq : "#:prof", cond : "R@c.counters.svCha>0"},

        {name : "Not Proficient", target : "counters.svStr.modifiers.Proficiency", eq : "", cond : "R@c.counters.svStr==0"},
        {target : "counters.svDex.modifiers.Proficiency", eq : "", cond : "R@c.counters.svDex==0"},
        {target : "counters.svCon.modifiers.Proficiency", eq : "", cond : "R@c.counters.svCon==0"},
        {target : "counters.svInt.modifiers.Proficiency", eq : "", cond : "R@c.counters.svInt==0"},
        {target : "counters.svWis.modifiers.Proficiency", eq : "", cond : "R@c.counters.svWis==0"},
        {target : "counters.svCha.modifiers.Proficiency", eq : "", cond : "R@c.counters.svCha==0"},
      ],
      skills : {
        check : "Proficient",
        msg : "@me.name+' used skill @skill.name'",
        action : "Stat Test",
        options : {
          "bonus" : "M@skill+M@stat+((R@skill==1)?(#:prof):(0))",
        },
        display : "M@skill+M@stat+((R@skill==1)?(#:prof):(0));",
        applyUI : {
          display : {classes : "flexrow flexaround flex subtitle", display : [
            {classes : "flexrow smooth", display : [
              {classes : "flexrow flexmiddle", display : [
                {title : "Proficient 'R@c.skills.@skillKey'", target : "skills.@skillKey", ui : "ui_checkbox", scope : {saveInto : "skills.@skillKey", cond : "R@c.skills.@skillKey==1", checked : "1", unchecked : "0"}},
                {classes : "bold hover2 white outline smooth flexmiddle", style : {"width" : "30px"},
                  value : "(R@c.skills.@skillKey>0)?(@:sign(M@c.skills.@skillKey+#:prof+M@c.stats.@statKey)):(@:sign(M@c.skills.@skillKey+M@c.stats.@statKey))",
                  click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "(R@c.skills.@skillKey>0)?(M@c.skills.@skillKey+#:prof+M@c.stats.@statKey):(M@c.skills.@skillKey+M@c.stats.@statKey)"}}
                },
                {value : "@c.skills.@skillKey.name", style : {"width" : "100px", "text-align" : "left"}, title : "@skillKey", classes : "lrpadding bold subtitle"},
                {classes : "flexmiddle", ui : "ui_link", scope : {classes : "flexmiddle", icon : "'list-alt'", click : "ui_modifiers", lookup : "skills.@skillKey", attr : {"modsOnly" : true}}},
              ]},
            ]}
          ]},
        }
      },
      summary : [
        {icon : "user", name : "Summary",
          display : {display : [
            // each one is a row
            {
              classes : "fit-x flexaround outlinebottom",
              style : {"font-size" : "0.8em"},
              display : [
                {target : "counters.hp", ui : "ui_editable", scope : {increment : 1, ui : "ui_maxbox"}, classes : "flexcolumn flexmiddle"},
                {
                  classes : "flexcolumn flexmiddle",
                  ui : "ui_calc",
                  scope : {name : "Armor", displays : ["totalArmor"]}
                },
                {target : "counters.speed", classes : "flexcolumn flexmiddle"},
              ]
            },
            {
              classes : "flexrow flexaround outlinebottom",
              style : {"font-size" : "0.8em"},
              display : [
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Str'", value : "R@c.stats.Str+'('+((#:Str<0)?(''):('+'))+(#:Str)+')'", action : "Stat Test", options : {"bonus" : "#:Str"}}},
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Dex'", value : "R@c.stats.Dex+'('+((#:Dex<0)?(''):('+'))+(#:Dex)+')'", action : "Stat Test", options : {"bonus" : "#:Dex"}}},
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Con'", value : "R@c.stats.Con+'('+((#:Con<0)?(''):('+'))+(#:Con)+')'", action : "Stat Test", options : {"bonus" : "#:Con"}}},
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Int'", value : "R@c.stats.Int+'('+((#:Int<0)?(''):('+'))+(#:Int)+')'", action : "Stat Test", options : {"bonus" : "#:Int"}}},
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Wis'", value : "R@c.stats.Wis+'('+((#:Wis<0)?(''):('+'))+(#:Wis)+')'", action : "Stat Test", options : {"bonus" : "#:Wis"}}},
                {classes : "lrpadding", ui : "ui_diceable", scope : {name : "'Cha'", value : "R@c.stats.Cha+'('+((#:Cha<0)?(''):('+'))+(#:Cha)+')'", action : "Stat Test", options : {"bonus" : "#:Cha"}}},
              ]
            },
            {
              classes : "flexcolumn flexmiddle outlinebottom",
              style : {"font-size" : "0.8em"},
              name : "Saving Bonuses",
              display : [
                {classes : "flexrow flexaround", display : [
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Str'",
                    value : "'('+((M@c.counters.svStr<0)?(''):('+'))+(M@c.counters.svStr)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svStr"}}},
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Dex'",
                    value : "'('+((M@c.counters.svDex<0)?(''):('+'))+(M@c.counters.svDex)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svDex"}}},
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Con'",
                    value : "'('+((M@c.counters.svCon<0)?(''):('+'))+(M@c.counters.svCon)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svCon"}}},
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Int'",
                    value : "'('+((M@c.counters.svInt<0)?(''):('+'))+(M@c.counters.svInt)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svInt"}}},
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Wis'",
                    value : "'('+((M@c.counters.svWis<0)?(''):('+'))+(M@c.counters.svWis)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svWis"}}},
                  {classes : "lrpadding", ui : "ui_diceable", scope : {classes : "flexrow", name : "'Cha'",
                    value : "'('+((M@c.counters.svCha<0)?(''):('+'))+(M@c.counters.svCha)+')'", action : "Saving Throw", options : {"bonus" : "M@c.counters.svCha"}}},
                ]}
              ],
            },
            {apps : ["ui_characterGear"]},
          ]}
        },
        {icon : "education", name : "Skills", display : {apps : ["ui_characterSkills"], scope : {minimized : true}}},
        {icon : "screenshot", name : "Talents", display : {apps : ["ui_characterTalents"], scope : {minimized : true}}},
        {icon : "gift", name : "Special Rules", display : {apps : ["ui_characterSpecials"]}},
      ]
    },
  },
  page : {
    _t : "p",
    info : {
      name : sync.newValue("Name", "Default Page"),
      img : sync.newValue("Page Art"),
      notes : sync.newValue("Page Notes", null, null, null, {
        HR : "rgba(190,4,15,1.0)",
        style : {
          "background-image" : "url('/content/sheet2.png')",
          "background-size" : "100% auto",
          "font-family" : "Bookinsanity",
          "font-size" : "1.1em"
        },
        H1F : "Nodesto Caps Condensed",
        H2F : "Nodesto Caps Condensed",
        H2FS : 2.1,
        H1FS : 2.7
      }),
    },
  },
};

exports.commands = {};
function merge(source, object, override) {
  for (var key in object) {
    if (object[key] instanceof Object) {
      if (source[key] instanceof Object) {
        merge(source[key], object[key], override);
      }
      else {
        if (override) {
          source[key] = object[key];
        }
        else {
          if (source[key] == null) {
            source[key] = object[key];
          }
        }
      }
    }
    else {
      if (override) {
        source[key] = object[key];
      }
      else {
        if (source[key] == null) {
          source[key] = object[key];
        }
      }
    }
  }
}
function combine(source, object) {
  for (var key in object) {
    if (object[key] instanceof Object) {
      if (source[key] instanceof Object) {
        if (Array.isArray(source[key])) {
          if (!Array.isArray(object[key])) {
            for (var index in object[key]) {
              combine(source[key][index], object[key][index]);
            }
          }
          else {
            for (var index in object[key]) {
              source[key].push(object[key][index]);
            }
          }
        }
        else {
          combine(source[key], object[key]);
        }
      }
      else {
        if (source[key] == null) {
          source[key] = object[key];
        }
      }
    }
    else {
      source[key] = object[key];
    }
  }
}
