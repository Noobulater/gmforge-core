var sync = require("../sync.js");

exports.templates = {
  version : 35,
  grid : {unitScale : 12.8, unit : "ft"},
  constants : {
    basearmor : "@c.counters.armor+#:Dex+@size*-1",
    toucharmor : "@c.counters.armor+#:Dex+@size*-1",
    str : "M@Str",
    dex : "M@Dex",
    con : "M@Con",
    int : "M@Int",
    wis : "M@Wis",
    cha : "M@Cha",
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
            {eq : "@hp-(@total/2)_0", target : "counters.hp"}
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
          "Touch" : {"threshold" : "#:toucharmor"},
          "AC" : {"threshold" : "@:armor()"}
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
          "Reflex" : {"bonus" : "@svDex"},
          "Fort" : {"bonus" : "@svCon"},
          "Will" : {"bonus" : "@svWis"},
          "Touch" : {"threshold" : "#:toucharmor"},
          "AC" : {"threshold" : "@:armor()"}
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
          data : "#bonus=M@c.stats.Dex+@c.counters.attack+@i.weapon.hit;d20+(@bonus)-(@penalty)",
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
          data : "#bonus=M@c.stats.Str+@c.counters.attack+@i.weapon.hit;d20+(@bonus)-(@penalty)",
        }
      },
      "CMB Attack" : {
        options : {
          "bonus" : true,
          "penalty" : true,
          "threshold" : true,
        },
        eventData : {
          msg : "'@c.info.name'+' attack'",
          ui : "ui_statTest",
          data : "#bonus=@c.counters.cmb+@i.weapon.hit;d20+(@bonus)-(@penalty)",
        },
      },
      "Damage" : {
        options : {
          "bonus" : true,
          "penalty" : true,
        },
        eventData : {
          msg : "'@c.info.name'+' rolled damage'",
          ui : "ui_statTest",
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
  generation : "pathfinder",
  initiative : {
    query : "d20+M@Dex",
    compare : "(@i1.total>@i2.total)?(1):(@i1.total==@i2.total?(0):(-1))",
  },
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
      hit : sync.newValue("Hit Bonus", null),
      range : sync.newValue("Range", null),
      ammo : sync.newValue("Ammunition", null),
      damage : sync.newValue("Damage", null),
      crit : sync.newValue("Critical", null),
      type : sync.newValue("Type", null),
      prof : sync.newValue("Proficiency", null)
    },
    spell : {
      level : sync.newValue("Level", null),
      required : sync.newValue("Materials", null),
      duration : sync.newValue("Duration", null),
      time : sync.newValue("Casting Time", null),
      comps : sync.newValue("Casting Components", false),
    },
  },
  character : {
    _t : "c",
    info : {
      name : sync.newValue("Name", "Default Character"),
      img : sync.newValue("Character Art"),
      race : sync.newValue("Race", "Human"),
      class : sync.newValue("Classes"),
      back : sync.newValue("Background"),
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
      hp : sync.newValue("Hit Points", 10, 0),
      speed : sync.newValue("Speed", "30", 0),
      attack : sync.newValue("Attack Bonus", 0, 0),
      armor : sync.newValue("Base Armor", 10),
      svDex : sync.newValue("Reflex", 0),
      svCon : sync.newValue("Fortitude", 0),
      svWis : sync.newValue("Will", 0),
      cmb : sync.newValue("Bonus", 0),
      cmd : sync.newValue("Defense", 0),
      hit : sync.newValue("Hit Dice", "1d6", 0),
      size : sync.newValue("Size Bonus", 0),
      cp : sync.newValue("Copper (CP)", 0, 0),
      sp : sync.newValue("Silver (SP)", 0, 0),
      gp : sync.newValue("Gold (GP)", 0, 0),
      pp : sync.newValue("Platinum (PP)", 0, 0),
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
      app : sync.newValue("Appraise (Int)"),
      blu : sync.newValue("Bluff (Cha)"),
      cli : sync.newValue("Climb (Str)"),
      cra : sync.newValue("Craft (Int)"),
      dip : sync.newValue("Diplomacy (Cha)"),
      did : sync.newValue("Disable Device (Dex)"),
      dis : sync.newValue("Disguise (Cha)"),
      esc : sync.newValue("Escape Artist (Dex)"),
      fly : sync.newValue("Fly (Dex)"),
      han : sync.newValue("Handle Animal (Cha)"),
      hea : sync.newValue("Heal (Wis)"),
      int : sync.newValue("Intimidate (Cha)"),
      kar : sync.newValue("Knowledge - Arcana (Int)"),
      kdu : sync.newValue("Knowledge - Dungeoneering (Int)"),
      ken : sync.newValue("Knowledge - Engineering (Int)"),
      khi : sync.newValue("Knowledge - History (Int)"),
      kge : sync.newValue("Knowledge - Geography (Int)"),
      klo : sync.newValue("Knowledge - Local (Int)"),
      kna : sync.newValue("Knowledge - Nature (Int)"),
      kno : sync.newValue("Knowledge - Nobility (Int)"),
      kpl : sync.newValue("Knowledge - Planes (Int)"),
      kre : sync.newValue("Knowledge - Religion (Int)"),
      lin : sync.newValue("Linguistics (Int)"),
      per : sync.newValue("Perception (Wis)"),
      pfm : sync.newValue("Perform (Cha)"),
      pro : sync.newValue("Profession (Wis)"),
      rid : sync.newValue("Ride (Dex)"),
      sen : sync.newValue("Sense Motive (Wis)"),
      sle : sync.newValue("Sleight of Hand (Dex)"),
      spe : sync.newValue("Spellcraft (Int)"),
      ste : sync.newValue("Stealth (Dex)"),
      sur : sync.newValue("Survival (Wis)"),
      swi : sync.newValue("Swim (Str)"),
      use : sync.newValue("Use Magic Device (Cha)"),
    },
    talents : {},
    inventory : [],
    spellbook : [], //storage for spells
    specials : {}, // special rules
  },
  tables : {
    size : {
      "fine" : -8,
      "diminutive" : -4,
      "tiny" : -2,
      "small" : -1,
      "medium" : 0,
      "large" : 1,
      "huge" : 2,
      "gargantuan" : 4,
      "colossal" : 8
    }
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
              {classes : "lrpadding", target : "weapon.crit", cond : "('@i.weapon.crit'!=0)&&('@i.weapon.crit'!='')", name : "Crit: "},
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
      style : {"background-image" : "url('/content/sheet3.png')", "background-size" : "cover", "box-shadow" : "inset 0em 0em 0.5em 0.5em rgba(0,0,0,0.2)"},
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
                        style : {"min-width" : "150px", "min-height" : "150px"},
                      },
                      {style : {"position" : "absolute", "right" : "0", "bottom" : "0"}, title : "Map Token", target : "info.img", ui : "ui_token", scope : {classes : "smooth outline white"}}
                    ]
                  },
                  {classes : "flexcolumn flexmiddle spadding", target : "counters.hp", ui : "ui_progressBar", scope : {bar : true, value : "counters.hp", max : "counters.hp.max"}},
                  {
                    classes : "flexrow flexbetween",
                    display : [
                      {
                        classes : "fit-x bold subtitle lrmargin",
                        display : [
                          {classes : "flexrow flexbetween", display : [
                            {classes : "flexrow flexmiddle", display : [
                              {classes : "bold", name : "Skills"},
                              {
                                classes : "bold flexmiddle create",
                                style : {"cursor" : "pointer"},
                                icon : "plus",
                                click : {create : "skills"}
                              }
                            ]},
                            //{classes : "flexmiddle lrpadding lrmargin", name : "Passive Wis", value : "'('+(10+#:Wis+M@c.skills.per+((R@c.skills.per>0)?(#:prof):(0)))+')'"}
                          ]},
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
                                  {classes : "smargin", title : "Trained", target : "skills.@skillKey", ui : "ui_checkbox", scope : {saveInto : "skills.@skillKey", cond : "R@c.skills.@skillKey==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                  {classes : "bold", ui : "ui_link", scope : {name : "@c.skills.@skillKey.name ", click : "ui_modifiers", lookup : "skills.@skillKey", attr : {"modsOnly" : true}}},
                                  {
                                    classes : "lrmargin hover2",
                                    cond : "R@c.skills.@skillKey>0",
                                    click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "M@c.skills.@skillKey+M@c.stats.@statKey"}},
                                    value : "'('+@:sign(M@c.skills.@skillKey+M@c.stats.@statKey)+')'",
                                    title : "@skillKey"
                                  },
                                  {
                                    classes : "lrmargin hover2",
                                    cond : "R@c.skills.@skillKey==0",
                                    click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "M@c.stats.@statKey"}},
                                    value : "'('+@:sign(M@c.stats.@statKey)+')'",
                                    title : "@skillKey"
                                  }
                                ],
                              }
                            }
                          }
                        ]
                      },
                      {
                        classes : "flexcolumn subtitle flexmiddle bold lrmargin",
                        display : [
                          {classes : "bold underline middle", name : "Spell Slots"},
                          {classes : "flexcolumn smooth lightoutline spadding", display : [
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "1st"},
                              {classes : "bold subtitle lrmargin", name : "", name : "", target : "counters.1st", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.1st", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "2nd"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.2nd", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.2nd", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "3rd"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.3rd", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.3rd", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "4th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.4th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.4th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "5th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.5th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.5th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "6th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.6th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.6th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "7th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.7th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.7th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "8th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.8th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.8th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                            {classes : "flexrow flexaround", display : [
                              {classes : "bold", value : "9th"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.9th", edit : {classes : "line middle", style : {"width" : "24px"}}},
                              {name : "/"},
                              {classes : "bold subtitle lrmargin", name : "", target : "counters.9th", edit : {classes : "line middle", style : {"width" : "24px"}, raw : "max"}},
                            ]},
                          ]},
                          {classes : "flexrow ", display : [
                            {classes : "bold", name : "Features"},
                            {
                              classes : "bold flexmiddle create",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "talents"}
                            },
                          ]},
                          {
                            classes : "flex",
                            apps : ["ui_characterTalents"],
                            scope : {hideTitle : "true"}
                          },
                          {classes : "", apps : ["ui_characterSpecials"]},
                        ]
                      },
                    ]
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
                      "background" : "linear-gradient(to right, rgb(42,33,30), rgb(47,37,34), rgba(47,37,34,0))",
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
                    style : {
                      "height" : "4px",
                      "background" : "linear-gradient(to right, rgb(42,33,30), rgb(47,37,34), rgba(47,37,34,0))",
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
                              {classes : "flexrow fit-x lrmargin bold subtitle", display : [
                                {target : "counters.size", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                              ]},
                            ]
                          },
                          {
                            classes : "flexrow",
                            display : [
                              {classes : "flexcolumn flexaround subtitle lightoutline spadding smooth", display : [
                                {classes : "flexmiddle bold", display : [
                                  {classes : "flexcolumn smooth hover2", title : "Armor Class", style : {"width" : "25px", "height" : "25px"}, click : {action : "Stat Test", options : {threshold : "@:armor()"}},
                                    ui : "ui_image", scope : {viewOnly : true, classes : "flexmiddle alttext", image : "/content/icons/Shield1000p.png", title : "@:armor()"}},
                                ]},
                                {classes : "flexmiddle bold", display : [
                                  {classes : "flexcolumn smooth hover2", title : "Flat Footed", style : {"width" : "25px", "height" : "25px"}, click : {action : "Stat Test", options : {threshold : "@:armor()-M@c.stats.Dex"}},
                                    ui : "ui_image", scope : {viewOnly : true, classes : "flexmiddle alttext", image : "/content/icons/ShieldOutline1000p.png", title : "@:armor()-M@c.stats.Dex"}},
                                ]},
                                {classes : "flexmiddle bold", display : [
                                  {classes : "flexcolumn smooth hover2", title : "Touch", style : {"width" : "25px", "height" : "25px"}, click : {action : "Stat Test", options : {threshold : "#:toucharmor"}},
                                    ui : "ui_image", scope : {viewOnly : true, classes : "flexmiddle alttext", image : "/content/icons/PlateMail1000p.png", title : "#:toucharmor"}},
                                ]},
                              ]},
                              {classes : "flexcolumn subtitle lightoutline spadding smooth", display : [
                                {classes : "flexmiddle bold", name : "Saves"},
                                {
                                  classes : "flexmiddle lrpadding",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Reflex", click : "ui_modifiers", lookup : "counters.svDex", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svDex)+')'", click : {action : "Saving Throw", msg : "Reflex Save", options : {"bonus" : "M@c.counters.svDex"}}}
                                  ],
                                },
                                {
                                  classes : "flexmiddle lrpadding",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Fort", click : "ui_modifiers", lookup : "counters.svCon", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svCon)+')'", click : {action : "Saving Throw", msg : "Fortitude Save", options : {"bonus" : "M@c.counters.svCon"}}}
                                  ],
                                },
                                {
                                  classes : "flexmiddle lrpadding",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Will", click : "ui_modifiers", lookup : "counters.svWis", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(M@c.counters.svWis)+')'", click : {action : "Saving Throw", msg : "Will Save", options : {"bonus" : "M@c.counters.svWis"}}}
                                  ],
                                },
                              ]},
                              {classes : "flexcolumn subtitle lightoutline spadding smooth", display : [
                                {classes : "flexmiddle bold", name : "Combat"},
                                {
                                  classes : "flexmiddle",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Bonus", click : "ui_modifiers", lookup : "counters.cmb", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(@c.counters.cmb)+')'", click : {action : "Saving Throw", msg : "Dexterity Save", options : {"bonus" : "@c.counters.cmb"}}}
                                  ],
                                },
                                {
                                  classes : "flexmiddle",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Dodge", click : "ui_modifiers", lookup : "counters.cmd", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(@c.counters.cmd)+')'", click : {action : "Saving Throw", msg : "Constitution Save", options : {"bonus" : "@c.counters.cmd"}}}
                                  ],
                                },
                                {
                                  classes : "flexmiddle",
                                  style : {"font-family" : "Scaly Sans"},
                                  display : [
                                    {classes : "bold", ui : "ui_link", scope : {name : "Atk. Bonus", click : "ui_modifiers", lookup : "counters.attack", attr : {"modsOnly" : true}}},
                                    {classes : "lrmargin hover2", value : "'('+@:sign(@c.counters.attack)+')'", click : {action : "Saving Throw", msg : "Wisdom Save", options : {"bonus" : "@c.counters.attack"}}}
                                  ],
                                },
                              ]},
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    classes : "flexrow",
                    display : [
                      {
                        classes : "flexcolumn flex",
                        display : [
                          {classes : "flexrow underline", style : {"font-size" : "1.2em"}, display : [
                            {classes : "bold", name : "Inventory"},
                            {
                              classes : "bold flexmiddle create subtitle lrmargin",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "inventory"}
                            }
                          ]},
                          {
                            classes : "spadding white outline smooth",
                            style : {"text-align" : "left", 'height' : "190px", "overflow-y" : "auto"},
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
                                  cond : "(@c.@applyTarget.weapon.damage!=0 || @c.@applyTarget.weapon.range!=0)",
                                  style : {"margin-bottom" : "4px"},
                                  display : [
                                    {classes : "lrpadding bold", target : "@applyTarget.weapon.damage", cond : "@c.@applyTarget.weapon.damage!=0", name : "Damage: "},
                                    {classes : "lrpadding bold", target : "@applyTarget.weapon.range", cond : "@c.@applyTarget.weapon.range!=0", name : "Range: "},
                                    {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle", cond : "(@c.@applyTarget.equip.armor!=0 || @c.@applyTarget.tags.armor)",
                                      value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                                      click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"},{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                                    },
                                    //{name : "", target : "@applyTarget.info.weight", edit : {classes : "lrmargin line middle",title : "Weight", style : {"width" : "24px"}, raw : "1"}},
                                  ]
                                },
                              ]}
                            }
                          },
                        ]
                      },
                      {classes : "flexcolumn flex", display : [
                        {classes : "flexrow underline", style : {"font-size" : "1.2em"}, display : [
                          {classes : "bold", name : "Spellbook"},
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
                              style : {"text-align" : "left", 'max-height' : "190px", "overflow-y" : "auto"},
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
                          ]
                        },
                      ]},
                    ]
                  },
                  {classes : "flexrow flexbetween white smooth outline subtitle spadding", display : [
                    {classes : "flex middle bold subtitle lrmargin", target : "counters.cp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                    {classes : "flex middle bold subtitle lrmargin", target : "counters.sp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                    {classes : "flex middle bold subtitle lrmargin", target : "counters.gp", edit : {classes : "lrmargin line middle", style : {"width" : "24px"}, raw : "1"}},
                  ]},
                  {
                    classes : "flexcolumn flex lightoutline smooth",
                    display : [
                      {
                        classes : "flexcolumn flex",
                        ui : "ui_rawNotes",
                      }
                    ]
                  },
                  /*{
                    classes : "flexrow flexbetween",
                    display : [
                      {
                        classes : "flexcolumn bold subtitle lrmargin",
                        display : [
                          {classes : "flexrow flexbetween", display : [
                            {classes : "flexrow flexmiddle", display : [
                              {classes : "bold", name : "Skills"},
                              {
                                classes : "bold flexmiddle create",
                                style : {"cursor" : "pointer"},
                                icon : "plus",
                                click : {create : "skills"}
                              }
                            ]},
                            //{classes : "flexmiddle lrpadding lrmargin", name : "Passive Wis", value : "'('+(10+#:Wis+M@c.skills.per+((R@c.skills.per>0)?(#:prof):(0)))+')'"}
                          ]},
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
                                  {classes : "smargin", title : "Proficient", target : "skills.@skillKey", ui : "ui_checkbox", scope : {saveInto : "skills.@skillKey", cond : "R@c.skills.@skillKey==1", checked : "1", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                                  {classes : "bold", ui : "ui_link", scope : {name : "@c.skills.@skillKey.name ", click : "ui_modifiers", lookup : "skills.@skillKey", attr : {"modsOnly" : true}}},
                                  {
                                    classes : "lrmargin hover2",
                                    click : {action : "Stat Test", msg : "'@c.skills.@skillKey.name'", options : {"bonus" : "(R@c.skills.@skillKey>0)?(M@c.skills.@skillKey+#:prof+M@c.stats.@statKey):(M@c.skills.@skillKey+M@c.stats.@statKey)"}},
                                    value : "'('+@:sign((R@c.skills.@skillKey>0)?(@:sign(M@c.skills.@skillKey+#:prof+M@c.stats.@statKey)):(@:sign(M@c.skills.@skillKey+M@c.stats.@statKey)))+')'",
                                    title : "@skillKey"
                                  }
                                ],
                              }
                            }
                          }
                        ]
                      },
                      {
                        classes : "flexcolumn bold subtitle lrmargin",
                        display : [
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "bold", name : "Features"},
                            {
                              classes : "bold flexmiddle create",
                              style : {"cursor" : "pointer"},
                              icon : "plus",
                              click : {create : "talents"}
                            },
                            {
                              classes : "flex",
                              apps : ["ui_characterTalents"],
                              scope : {hideTitle : "true"}
                            },
                          ]},
                        ]
                      },
                      {classes : "subtitle", apps : ["ui_characterSpecials"]}
                    ]
                  },*/
                  /*{
                    classes : "flexcolumn lightoutline smooth",
                    style : {"height" : "220px"},
                    display : [
                      {
                        style : {
                          "height" : "4px",
                          "background" : "linear-gradient(to right, rgb(42,33,30), rgb(47,37,34), rgba(47,37,34,0))",
                          "border-bottom-right-radius" : "100%",
                          "margin-top" : "2px",
                        }
                      },
                      {
                        classes : "flexcolumn flex",
                        ui : "ui_rawNotes",
                      }
                    ]
                  },*/
                ]
              }
            ]
          },
        ]
      },
    }
  },
  page : {
    _t : "p",
    info : {
      name : sync.newValue("Name", "Default Page"),
      img : sync.newValue("Page Art"),
      notes : sync.newValue("Page Notes", null, null, null, {
        HR : "rgba(91,1,0,1)",
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
