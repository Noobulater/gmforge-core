var sync = require("../sync.js");

exports.templates = {
  version : 36,
  grid : {unitScale : 64, unit : "m"},
  constants : {
    basearmor : `{"human_head" : "#:T+@nnT+@daemonic","human_torso" : "#:T+@nnT+@daemonic","human_larm" : "#:T+@nnT+@daemonic","human_rarm" : "#:T+@nnT+@daemonic","human_lleg" : "#:T+@nnT+@daemonic","human_rleg" : "#:T+@nnT+@daemonic"}`,
    ws : "(@c.stats.WS/10)f",
    bs : "(@c.stats.BS/10)f",
    s : "(@c.stats.S/10)f",
    t : "(@c.stats.T/10)f",
    ag : "(@c.stats.Ag/10)f",
    int : "(@c.stats.Int/10)f",
    per : "(@c.stats.Per/10)f",
    fel : "(@c.stats.Fel/10)f",
    wp : "(@c.stats.WP/10)f",
    ifl : "(@c.stats.Ifl/10)f"
  },
  tables : {
    RAW : {
      "T" : "((@T/10)f+@nnT+@daemonic)", // Basic toughness
      "TB" : "((@T/10)f+@nnT", // toughness bonus (No daemonic)
      "TR" : "((@T/10)f", // Raw Toughness
    }
  },
  effects : {
    // one dimensional actions for dice
    "dmg" : {
      name : "Take Damage",
      submenu : {
        head : {
          name : "Head",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_head)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
        larm : {
          name : "Left Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_llarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
        rarm : {
          name : "Right Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_rarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
        body : {
          name : "Body",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_torso)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
        lleg : {
          name : "Left Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_lleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
        rleg : {
          name : "Right Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_rleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds"},
          ]
        },
      }
    },

    /*


    "dmg" : {
      name : "Take Damage",
      submenu : {
        head : {
          name : "Head",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_head)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_head)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_head+(@wounds-(@total-(((@:armor(human_head)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_head"}
          ]
        },
        larm : {
          name : "Left Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_llarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_llarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_llarm+(@wounds-(@total-(((@:armor(human_llarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_llarm"}
          ]
        },
        rarm : {
          name : "Right Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_rarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_rarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_rarm+(@wounds-(@total-(((@:armor(human_rarm)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_rarm"}
          ]
        },
        body : {
          name : "Body",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_torso)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_torso)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_torso+(@wounds-(@total-(((@:armor(human_torso)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_torso"}
          ]
        },
        lleg : {
          name : "Left Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_lleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_lleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_lleg+(@wounds-(@total-(((@:armor(human_head)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_lleg"}
          ]
        },
        rleg : {
          name : "Right Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(@wounds-(@total-(((@:armor(human_rleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)_0", target : "counters.wounds"},
            {cond : "(@total-(((@:armor(human_rleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0>=@wounds", eq : "@c.counters.wounds.modifiers.human_rleg+(@wounds-(@total-(((@:armor(human_rleg)-#:RAW(T))-@pen)_0+#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_rleg"}
          ]
        },
      }
      */
    /*"tdmg" : {
      name : "Take Dmg (-T Only)",
      submenu : {
        head : {
          name : "Head",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_head+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_head"}
          ]
        },
        larm : {
          name : "Left Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_larm+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_larm"}
          ]
        },
        rarm : {
          name : "Right Arm",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_rarm+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_rarm"}
          ]
        },
        body : {
          name : "Body",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_torso+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_torso"}
          ]
        },
        lleg : {
          name : "Left Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_lleg+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_lleg"}
          ]
        },
        rleg : {
          name : "Right Leg",
          msg : "@pName : Applied @total damage (pen : @pen)",
          calc : [
            {eq : "(R@wounds-(@total-#:RAW(T))_0)_0", target : "counters.wounds"},
            {cond : "(R@wounds-(@total-#:RAW(T)))_0)<=0", eq : "@c.counters.wounds.modifiers.human_rleg+(R@wounds-(@total-#:RAW(T)))_0)", target : "counters.wounds.modifiers.human_rleg"}
          ]
        },
      }
    },*/
  },
  actions : {
    "c" : {
      "Stat Test" : {
        choices : {
          "WS" : {"stat" : "@WS", "degBonus" : "(@nnWS/2)f"},
          "BS" : {"stat" : "@BS", "degBonus" : "(@nnBS/2)f"},
          "S" : {"stat" : "@S", "degBonus" : "(@nnS/2)f"},
          "T" : {"stat" : "@T", "degBonus" : "(@nnT/2)f"},
          "Ag" : {"stat" : "@Ag", "degBonus" : "(@nnAg/2)f"},
          "Int" : {"stat" : "@Int", "degBonus" : "(@nnInt/2)f"},
          "Per" : {"stat" : "@Per", "degBonus" : "(@nnPer/2)f"},
          "Fel" : {"stat" : "@Fel", "degBonus" : "(@nnFel/2)f"},
          "WP" : {"stat" : "@WP", "degBonus" : "(@nnWP/2)f"},
        },
        hot : "1",
        options : {
          "bonus" : [0, 5, 10, 20, 30, 40, 50, 60],
          "penalty" : [0, 5, 10, 20, 30, 40, 50, 60],
          "stat" : ["@WS", "@BS", "@S", "@T", "@Ag", "@Int", "@Per", "@Fel", "@WP"],
          "threshold" : true,
          "degBonus" : true,
        },
        eventData : {
          ui : "ui_statTest",
          msg : "'Stat Test'",
          data : "$stat=@WS;#threshold=@stat+(@bonus)-(@penalty);d100",
        }
      }
    },
    "i" : {
      "Ranged Attack" : {
        //quantity : "(weapon:rof)",
        options : {
          "bonus" : [0, 5, 10, 20, 30, 40, 50, 60],
          "penalty" : [0, 5, 10, 20, 30, 40, 50, 60],
          "threshold" : true,
          "degBonus" : true,
          "degrees" : true,
        },
        eventData : {
          msg : "'Ranged Attack'",
          ui : "ui_attack",
          data : "$bonus=@i.weapon.hit;#threshold=@BS+(@bonus)-(@penalty);d100",
        },
      },
      "Melee Attack" : {
        options : {
          "bonus" : [0, 5, 10, 20, 30, 40, 50, 60],
          "penalty" : [0, 5, 10, 20, 30, 40, 50, 60],
          "threshold" : true,
          "degBonus" : true,
          "degrees" : true,
        },
        eventData : {
          msg : "'Melee Attack'",
          ui : "ui_attack",
          data : "$bonus=@i.weapon.hit;#threshold=@WS+(@bonus)-(@penalty);d100",
        }
      },
      "Damage" : {
        targets : {cond : "@c._t=='c'"},
        options : {
          "bonus" : [1, 2, 3, 4, 5, 6],
          "penalty" : true,
        },
        eventData : {
          msg : "'rolled damage'",
          data : "@i.weapon.damage+(@bonus)-(@penalty)",
          var : {"pen" : "@i.weapon.pen"}
        },
        targeting : {
          cond : "1",
          calc : [
            {target : "counters.wounds", eq : "(@c.counters.wounds-(@:armor()-@total))_0", cond : "1"},
          ]
        }
      }
    }
  },
  dice : {
    defaults : ["d100", "d10", "d5"],
    modifiers : [0,5,10,20,30,40,50,60],
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
  generation : "wh40k_dh",
  initiative : {
    query : "d10+(@Ag/10)f",
    compare : "(@i1.total>@i2.total)?(1):((@i1.total==@i2.total)?(0):(-1))",
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
      rof : sync.newValue("Rate of Fire", null),
      mags : sync.newValue("Magazine", null),
      reload : sync.newValue("Reload Time", null),
      damage : sync.newValue("Damage", null),
      pen : sync.newValue("Penetration", null),
    },
    spell : {
      level : sync.newValue("Level", null),
      required : sync.newValue("Materials", null),
      duration : sync.newValue("Duration", null),
      time : sync.newValue("Casting Time", null),
    },
  },
  character : {
    _t : "c",
    info : {
      name : sync.newValue("Name", "Default Character"),
      img : sync.newValue("Character Art"),
      div : sync.newValue("Divination"),
      home : sync.newValue("Homeworld"),
      back : sync.newValue("Background"),
      adv : sync.newValue("Elite Advances"),
      role :  sync.newValue("Role"),
      notes : sync.newValue("Character Notes"),
    },
    stats : {
      WS : sync.newValue("Weapon Skill", "2d10+20", 0, 100),
      BS : sync.newValue("Ballistic Skill", "2d10+20", 0, 100),
      S : sync.newValue("Strength", "2d10+20", 0, 100),
      T : sync.newValue("Toughness", "2d10+20", 0, 100),
      Ag : sync.newValue("Agility", "2d10+20", 0, 100),
      Int : sync.newValue("Intelligence", "2d10+20", 0, 100),
      Per : sync.newValue("Perception", "2d10+20", 0, 100),
      WP : sync.newValue("Willpower", "2d10+20", 0, 100),
      Fel : sync.newValue("Fellowship", "2d10+20", 0, 100),
      Ifl : sync.newValue("Influence", "2d10+20", 0, 100),
    },
    counters : {
      fate : sync.newValue("Fate", 0, 0),
      exp : sync.newValue("Experience", 0, 0, null, {"Starting" : 1000}),
      exhaustion : sync.newValue("Exhaustion", 0, 0, 12),
      wounds : sync.newValue("Wounds", "1d5+8", 0),
      insanity : sync.newValue("Insanity", 0, 0, 100),
      corruption : sync.newValue("Corruption", 0, 0, 100),
      daemonic : sync.newValue("Daemonic Bonus"),
      nnWS :  sync.newValue("Non-natural Weapon Skill"),
      nnBS :  sync.newValue("Non-natural Ballistic Skill"),
      nnS :  sync.newValue("Non-natural Strength"),
      nnT :  sync.newValue("Non-natural Toughness"),
      nnAg : sync.newValue("Non-natural Agility"),
      nnInt : sync.newValue("Non-natural Intelligence"),
      nnPer : sync.newValue("Non-natural Perception"),
      nnWP : sync.newValue("Non-natural Willpower"),
      nnFel : sync.newValue("Non-natural Fellowship"),
    },
    skills : {
      acr : sync.newValue("Acrobatics (Ag)"),
      ath : sync.newValue("Athletics (S)"),
      awa : sync.newValue("Awareness (Per)"),
      cha : sync.newValue("Charm (Fel)"),
      com : sync.newValue("Command (Fel)"),
      cmL : sync.newValue("Common Lore (Int)"),
      dec : sync.newValue("Decieve (Fel)"),
      dod : sync.newValue("Dodge (Ag)"),
      fbL : sync.newValue("Forbidden Lore (Int)"),
      inq : sync.newValue("Inquiry (Fel)"),
      int : sync.newValue("Interrogation (WP)"),
      itm : sync.newValue("Intimidate (S)"),
      lin : sync.newValue("Linguistics (Int)"),
      log : sync.newValue("Logic (Int)"),
      med : sync.newValue("Medicae (Int)"),
      nvG : sync.newValue("Navigate - Surface (Int)"),
      nvS : sync.newValue("Navigate - Stellar (Int)"),
      nvW : sync.newValue("Navigate - Warp (Int)"),
      opA : sync.newValue("Operate - Aeronautics (Ag)"),
      opS : sync.newValue("Operate - Surface (Ag)"),
      opV : sync.newValue("Operate - Void (Ag)"),
      par : sync.newValue("Parry (WS)"),
      psy : sync.newValue("Psyniscience (Per)"),
      scL : sync.newValue("Scholastic Lore (Int)"),
      scr : sync.newValue("Scrutiny (Per)"),
      sec : sync.newValue("Security (Int)"),
      sle : sync.newValue("Sleight of Hand (Ag)"),
      ste : sync.newValue("Stealth (Ag)"),
      sur : sync.newValue("Survival (Per)"),
      tec : sync.newValue("Tech-Use (Int)"),
      tra : sync.newValue("Trade (Int)"),
    },
    talents : {},
    inventory : [],
    spellbook : [], //storage for psychic
    specials : {}, // special rules
  },
  display : {
    ui : {
      "ui_statTest" : {
        classes : "flexrow flexaround",
        style : {},
        dice : {
          top : "((@threshold-@total)/10)c", // default
          cond : "@threshold!=0",
          results : [
            {
              classes : "focus outline",
              top : "((@threshold-@total)/10)c", // change default
              cond : "@total==100",
              bottom : "'Fail'", // change default
            },
            {
              classes : "highlight outline",
              top : "((@threshold-@total)/10)c+@degBonus", // change default
              cond : "@total<=@threshold",
              bottom : "'Success'", // change default
            },
            {
              classes : "highlight outline",
              top : "((@threshold-@total)/10)c_1+@degBonus", // change default
              cond : "@total==1",
              bottom : "'Success'", // change default
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
      "ui_attack" : {
        classes : "flexrow flexaround",
        style : {},
        dice : {
          top : "-((@threshold-@total)/10)c", // default
          cond : "@threshold!=0",
          bottom : "", // default
          results : [
            {
              classes : "highlight outline",
              style : {},
              top : "((@threshold-@total)/10)c+@degBonus", // change default
              cond : "@total<=@threshold",
              bottom : "'Success'", // change default
              //display : {}, // below bottom
              results : {
                classes : "flex subtitle",
                display : [
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f<=10",
                    display : [
                      {name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1)", name : "Body", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f>=11 && (@total-(@total/10)f*10)*10+(@total/10)f<=20",
                    display : [
                      {name : "Right Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1)", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1)", name : "Arm", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f>=21 && (@total-(@total/10)f*10)*10+(@total/10)f<=30",
                    display : [
                      {name : "Left Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1)", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1)", name : "Arm", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f>=30 && (@total-(@total/10)f*10)*10+(@total/10)f<=70",
                    display : [
                      {name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1)", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1)", name : "Body", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f>=71 && (@total-(@total/10)f*10)*10+(@total/10)f<=85",
                    display : [
                      {name : "Right Leg"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Leg"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1)", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1)", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1)", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1)", name : "Leg", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                  {
                    classes : "flexcolumn flexmiddle",
                    cond : "(@total-(@total/10)f*10)*10+(@total/10)f>=86 && (@total-(@total/10)f*10)*10+(@total/10)f<=100",
                    display : [
                      {name : "Left Leg"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+1*(@degrees)_1)", name : "Leg"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+2*(@degrees)_1", name : "Body"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+3*(@degrees)_1", name : "Arm"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+4*(@degrees)_1", name : "Head"},
                      {cond : "(((@threshold-@total)/10)c+@degBonus)>=(1+5*(@degrees)_1", name : "Leg", count : "(((@threshold-@total)/10)c+@degBonus)-(1+4*(@degrees)_1)"},
                    ]
                  },
                ]
              },
            },
          ],
        },
        results : {
          classes : "flex",
          title : {
            classes : "fit-x bold subtitle",
            name : "Results"
          },
        },
        display : {
          classes : "outline lrpadding flexrow flexmiddle flexwrap flex",
        },
      }
    },
    item : {
      params : {
        equip : [
          {
            classes : "flex flexcolumn flexmiddle",
            display : [
              {
                classes : "flexrow flexmiddle fit-x bold", display : [
                  {classes : "subtitle", ui : "ui_checkbox", scope : {saveInto : "tags.noEQ", checked : 1, unchecked : 0, cond : "@:t(noEQ)"}},
                  {classes : "subtitle bold", name : "Do not display as Gear"},
                ]
              },
              {target : "equip.armor", ui : "ui_armorParted"},
              {target : "equip.armor", ui : "ui_armorBonuses"},
            ]
          },
          {
            classes : "flex flexcolumn",
            target : "equip.armor",
            ui : "ui_modifiers",
            scope : {text : "Modifiers", total : "", modsOnly : true}
          }
        ],
      },
      summary : {
        display : [
          // each one is a row
          {
            classes : "fit-x flexbetween",
            display : [
              {target : "info.img", ui : "ui_icon",},
              {target : "info.name", classes : "flex flexcolumn flexmiddle", name : ""},
              {target : "info.quantity", classes : "flexmiddle subtitle", name : "x", cond : "@i.info.quantity>1"},
            ]
          },
          {
            classes : "fit-x flexbetween subtitle",
            display : [
              {classes : "lrpadding", target : "weapon.damage", name : "D: ", cond : "('@i.weapon.damage'!=0)&&('@i.weapon.damage'!='')"},
              {classes : "lrpadding", target : "weapon.range", name : "R: ", cond : "('@i.weapon.range'!=0)&&('@i.weapon.range'!='')"},
              {classes : "lrpadding", target : "weapon.pen", name : "P: ", cond : "('@i.weapon.pen'!=0)&&('@i.weapon.pen'!='')"},
              {classes : "lrpadding", target : "weapon.rof", name : "rof: ", cond : "('@i.weapon.rof'!=0)&&('@i.weapon.rof'!='')"},
            ]
          },
          {
            classes : "fit-x flexrow subtitle",
            name : "",
            target : "info.special",
            cond : "('@i.info.special'!=0)&&('@i.info.special'!='')"
          },
        ]
      },
    },
    sheet : {
      style : {"background-image" : "url('/content/sheet1.png')", "background-size" : "cover", "box-shadow" : "inset 0em 0em 0.5em 0.5em rgba(0,0,0,0.2)"},
      altStat : "counters.exhaustion",
      health : "counters.wounds",
      content : {
        classes : "lpadding flexcolumn flex",
        display : [
          {
            classes : "flexrow flexbetween fit-x",
            style : {
              "font-size": "2em",
              "-webkit-text-stroke-width" : "2px"
            },
            display : [
              {
                classes : "lrmargin flex lrpadding",
                name : "",
                target : "info.name",
                edit : {
                  classes : "line middle",
                  style : {
                    "border" : "none",
                  },
                }
              },
            ]
          },
          {classes : "flexrow flexaround", target : "stats", datalist : {
            classes : "flexcolumn flexmiddle outline smooth",
            display : [
              {
                classes : "flexrow flexaround",
                style : {"min-width" : "60px"},
                display : [
                  {
                    classes : "inactive bold flex flexmiddle subtitle subtitle outlinebottom lrpadding",
                    display : [
                      {cond : "(@c.counters.exhaustion>(@c.%dataTarget%/10)f)?(0):(1)", classes : "flexmiddle inactive", name : "", target : "%dataTarget%", edit : {classes : "flexmiddle line middle", style : {width : "24px", "border" : "none"}, raw : true}},
                      {cond : "(@c.counters.exhaustion>(@c.%dataTarget%/10)f)?(1):(0)", title : "Exhausted",  classes : "flexmiddle inactive destroy", name : "", target : "%dataTarget%", edit : {classes : "flexmiddle line middle", style : {width : "24px", "border" : "none"}, raw : true}},
                      {value : "("},
                      {cond : "@c.counters.nn%dataKey%.name!=null", name : "", target : "counters.nn%dataKey%", edit : {classes : "flexmiddle line bold subtitle", style : {width : "16px", "text-align" : "center"}, raw : true}},
                      {value : ")"},
                    ]
                  },
                ]
              },
              {classes : "fit-x flexmiddle white bold hover2 spadding outlinebottom", value : "@c.%dataTarget%", click : {action : "Stat Test", msg : "tested @c.%dataTarget%.name", options : {"threshold" : "@c.%dataTarget%"}}},
              {
                classes : "flexrow flexmiddle",
                display : [
                  {title : "Rank 1", target : "%dataTarget%", ui : "ui_checkbox", scope : {saveInto : "%dataTarget%.modifiers.rank", cond : "@c.%dataTarget%.modifiers.rank>=5", checked : "5", unchecked : "0", style : {"width" : "10px", "height" : "10px"}}},
                  {title : "Rank 2", target : "%dataTarget%", ui : "ui_checkbox", scope : {saveInto : "%dataTarget%.modifiers.rank", cond : "@c.%dataTarget%.modifiers.rank>=10", checked : "10", unchecked : "5", style : {"width" : "10px", "height" : "10px"}}},
                  {title : "Rank 3", target : "%dataTarget%", ui : "ui_checkbox", scope : {saveInto : "%dataTarget%.modifiers.rank", cond : "@c.%dataTarget%.modifiers.rank>=15", checked : "15", unchecked : "10", style : {"width" : "10px", "height" : "10px"}}},
                  {title : "Rank 4", target : "%dataTarget%", ui : "ui_checkbox", scope : {saveInto : "%dataTarget%.modifiers.rank", cond : "@c.%dataTarget%.modifiers.rank>=20", checked : "20", unchecked : "15", style : {"width" : "10px", "height" : "10px"}}},
                  {title : "Rank 5", target : "%dataTarget%", ui : "ui_checkbox", scope : {saveInto : "%dataTarget%.modifiers.rank", cond : "@c.%dataTarget%.modifiers.rank>=25", checked : "25", unchecked : "20", style : {"width" : "10px", "height" : "10px"}}},
                ]
              },
              {
                classes : "bold fit-x",
                ui : "ui_link",
                scope : {name : "%dataKey%", click : "ui_modifiers", lookup : "%dataTarget%", attr : {"modsOnly" : true}},
              },
            ],
          }},
          {
            classes : "margin",
            style : {
              "height" : "4px",
              "background" : "linear-gradient(to right, rgba(20,20,20,0), rgba(35,35,35,1.0), rgba(50,50,50,1.0), rgba(35,35,35,1.0), rgba(20,20,20,0))",
              "border-bottom-right-radius" : "100%",
              "border-bottom-left-radius" : "100%",
            }
          },
          {
            classes : "flexrow flex flexbetween",
            display : [
              {
                classes : "flexcolumn",
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
                      {style : {"position" : "absolute", "left" : "0", "bottom" : "0"}, title : "Armor", ui : "ui_characterArmor", scope : {hideTitle : true}},
                      {style : {"position" : "absolute", "right" : "0", "bottom" : "0"}, title : "Map Token", target : "info.img", ui : "ui_token", scope : {classes : "smooth outline white"}}
                    ]
                  },
                  {classes : "flexcolumn fit-x", display : [{classes : "flex", target : "counters.wounds", ui : "ui_progressBar", scope : {value : "counters.wounds", max : "counters.wounds.max"}}]},
                  {classes : "flexrow flexbetween", display : [
                    {classes : "flexcolumn padding flex bold outline inactive", display : [
                      {classes : "flexrow bold subtitle", display : [
                        //"Nodesto Caps Condensed",
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.wounds.name", click : "ui_modifiers", lookup : "counters.wounds", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", name : "", target : "counters.wounds", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                        {classes : "lrmargin bold", value : "/"},
                        {classes : "bold", name : "", target : "counters.wounds", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                      ]},
                      {classes : "flexrow bold subtitle", display : [
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.exhaustion.name", click : "ui_modifiers", lookup : "counters.exhaustion", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", target : "counters.exhaustion", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                        {classes : "lrmargin bold", value : "/"},
                        {classes : "bold", name : "", target : "counters.exhaustion", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                      ]},
                      {classes : "flexrow bold subtitle", display : [
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.daemonic.name", click : "ui_modifiers", lookup : "counters.daemonic", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", target : "counters.daemonic", edit : {classes : "line", style : {width : "25px", "text-align" : "center"}}},
                      ]},
                    ]},
                    {classes : "flexcolumn padding flex bold outline inactive", display : [
                      {classes : "flexrow bold subtitle", display : [
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.insanity.name", click : "ui_modifiers", lookup : "counters.insanity", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", target : "counters.insanity", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                        {classes : "lrmargin bold", value : "/"},
                        {classes : "bold", name : "", target : "counters.insanity", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                      ]},
                      {classes : "flexrow bold subtitle", display : [
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.corruption.name", click : "ui_modifiers", lookup : "counters.corruption", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", target : "counters.corruption", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                        {classes : "lrmargin bold", value : "/"},
                        {classes : "bold", name : "", target : "counters.corruption", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                      ]},
                      {classes : "flexrow bold subtitle", display : [
                        {classes : "bold", ui : "ui_link", scope : {name : "@c.counters.fate.name", click : "ui_modifiers", lookup : "counters.fate", attr : {"modsOnly" : true}}},
                        {classes : "flex"},
                        {classes : "bold", name : "", target : "counters.fate", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}}},
                        {classes : "lrmargin bold", value : "/"},
                        {classes : "bold", name : "", target : "counters.fate", edit : {classes : "line", style : {width : "24px", "text-align" : "center"}, raw : "max"}},
                      ]},
                    ]},
                  ]},
                  {
                    classes : "flexcolumn",
                    display : [
                      {classes : "flexcolumn fit-x", display : [
                        {
                          classes : "flex",
                          ui : "ui_entryList",
                          scope : {
                            lookup : "info",
                            ignore : ["name", "img", "mode", "notes"],
                            applyUI : {classes : "flexrow flex subtitle", display : [
                              {value : "@c.@applyTarget.name", classes : "bold", style : {"width" : "120px"}},
                              {classes : "flexrow fit-x lrmargin", name : "", target : "@applyTarget", edit : {classes : "lrmargin line"}},
                            ]}
                          }
                        },
                        {classes : "spadding"},
                        {classes : "flexcolumn flexbetween spadding subtitle", display : [
                          {value : "'Experience Total ('+(M@c.counters.exp-R@c.counters.exp)+')'", classes : "bold"},
                          {classes : "flexrow flexbetween lrmargin", display : [
                            {classes : "flexrow spadding smooth", name : "Available", target : "counters.exp", edit : {classes : "line lrmargin", mod : "Starting", style : {width : "50px", "text-align" : "center"}}},
                            {classes : "flexrow spadding smooth", name : "Spent", target : "counters.exp", edit : {classes : "line lrmargin", raw : "1", style : {width : "50px", "text-align" : "center"}}},
                          ]}
                        ]},
                        {classes : "spadding"},
                      ]},
                    ]
                  },
                  {
                    classes : "flexrow flexbetween flex",
                    scrl : "traits",
                    style : {"overflow" : "auto"},
                    display : [
                      {classes : "subtitle", ui : "ui_tagList", scope : {filter : "apt", title : "Adept at..."}},
                      {classes : "subtitle",ui : "ui_tagList", scope : {filter : "trait", title : "Traits"}},
                      {classes : "subtitle padding", ui : "ui_characterSpecials"},
                    ]
                  }
                ]
              },
              {
                classes : "flexcolumn flex",
                tab : "Skills",
                tabs : {
                  "Bio" : {
                    classes : "flexcolumn flex",
                    ui : "ui_rawNotes",
                  },
                  "Gear" : {
                    classes : "flexcolumn flex spadding",
                    display : [
                      {classes : "flexrow subtitle lrpadding", display : [
                        {classes : "bold", name : "Inventory"},
                        {
                          classes : "bold flexmiddle create subtitle lrmargin",
                          style : {"cursor" : "pointer"},
                          icon : "plus",
                          click : {create : "inventory"}
                        }
                      ]},
                      {
                        classes : "flex",
                        scrl : "inv",
                        style : {"overflow" : "auto"},
                        ui : "ui_entryList",
                        scope : {
                          drop : "inventoryDrop",
                          connectWith : ".inventoryDrop",
                          lookup : "inventory",
                          applyUI : {classes : "flexcolumn flex white smooth spadding lightoutline subtitle", display : [
                            {
                              classes : "flexrow flexbetween",
                              display : [
                                {
                                  classes : "flexcolumn",
                                  ui : "ui_image",
                                  target : "@applyTarget.info.img",
                                  style : {"width" : "50px", "height" : "50px"},
                                  scope : {def : "/content/icons/Backpack1000p.png"},
                                },
                                {
                                  classes : "flexcolumn flex padding",
                                  display : [
                                      {
                                      classes : "flexrow flexbetween",
                                      display : [
                                        {name : "", target : "@applyTarget.info.quantity", edit : {classes : "line middle", title : "Quantity", style : {"width" : "24px"}, raw : "1"}},
                                        {classes : "flex lrpadding", name : "", target : "@applyTarget.info.name", edit : {classes : "lrmargin lrpadding line flex", style : {"min-width" : "70px"}, raw : "1"}},
                                        {name : "", target : "@applyTarget.info.weight", edit : {classes : "line middle", title : "Weight", style : {"width" : "30px"}, raw : "1"}},
                                        {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle lrmargin",
                                          value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                                          click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"}, {target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                                        },
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
                                      ]
                                    },
                                    {
                                      classes : "flexrow flexbetween subtitle bold",
                                      display : [
                                        {target : "@applyTarget.weapon.damage", edit : {classes : "lrmargin line middle", title : "Damage", style : {"width" : "50px"}, raw : "1"}},
                                        {target : "@applyTarget.weapon.rof", edit : {classes : "lrmargin line middle", title : "Rate of Fire", style : {"width" : "40px"}, raw : "1"}},
                                        {target : "@applyTarget.weapon.range", edit : {classes : "lrmargin line middle", title : "Range", style : {"width" : "30px"}, raw : "1"}},
                                        {target : "@applyTarget.weapon.pen", edit : {classes : "lrmargin line middle", title : "Pen", style : {"width" : "20px"}, raw : "1"}},
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]}
                        }
                      },
                    ]
                  },
                  "Skills" : {
                    classes : "flexcolumn flex spadding",
                    display : [
                      {classes : "flexrow lrpadding subtitle", display : [
                        {classes : "bold", name : "Skills"},
                        {
                          classes : "bold subtitle flexmiddle create lrmargin",
                          style : {"cursor" : "pointer"},
                          icon : "plus",
                          click : {create : "skills"}
                        }
                      ]},
                      {
                        classes : "flexcolumn",
                        ui : "ui_skillList",
                        scope : {
                          lookup : "skills",
                          applyUI : {
                            classes : "flexrow subtitle flex smooth white", display : [
                              {classes : "flexrow flex lrmargin ", name : "", target : "@skillTarget", edit : {classes : "line", name : true}},
                              {classes : "flexrow flexmiddle", display : [
                                {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Trained"}},
                                {classes : "lrmargin subtitle flexmiddle", name : "Trained"},
                              ]},
                              {classes : "flexrow flexmiddle lrmargin", display : [
                                {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "10", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=10", title : "Rank 1"}},
                                {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "20", unchecked : "10", cond : "@c.@skillTarget.modifiers.rank>=20", title : "Rank 2"}},
                                {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "30", unchecked : "20", cond : "@c.@skillTarget.modifiers.rank>=30", title : "Rank 3"}},
                                {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "40", unchecked : "30", cond : "@c.@skillTarget.modifiers.rank>=40", title : "Rank 4"}},
                              ]},
                              {
                                cond : "('@statKey')!=''",
                                classes : "hover2 flexmiddle background alttext outline smooth bold subtitle lrpadding lrmargin",
                                value : "@:sign((20-R@c.@skillTarget*20-M@c.@skillTarget)*-1)",
                                click : {
                                  action : "Stat Test",
                                  msg : "@c.@skillTarget.name",
                                  options : {
                                    "bonus" : "(R@c.@skillTarget==1)?(M@c.@skillTarget):(0)",
                                    "penalty" : "(R@c.@skillTarget!=1)?(20-M@c.@skillTarget):(0)",
                                    "stat" : "c.stats.@statKey",
                                    "degBonus" : "@c.counters.nn@statKey",
                                    "threshold" : "(@exhaustion>(@c.stats.@statKey/10)f)?((@c.stats.@statKey/2)c):(@c.stats.@statKey)"
                                  },
                                }
                              },
                              {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                            ]
                          },
                        }
                      },
                    ]
                  },
                  "Talents" : {
                    classes : "flexcolumn flex spadding",
                    display : [
                      {classes : "flexrow subtitle lrmargin", display : [
                        {classes : "bold", name : "Talents"},
                        {
                          classes : "bold subtitle flexmiddle create lrmargin",
                          style : {"cursor" : "pointer"},
                          icon : "plus",
                          click : {create : "talents"}
                        }
                      ]},
                      {
                        classes : "flex",
                        apps : ["ui_characterTalents"],
                        scope : {hideTitle : "true"}
                      },
                    ]
                  },
                  "Psychic" : {
                    classes : "flexcolumn flex spadding",
                    display : [
                      {classes : "flexrow subtitle lrpadding", display : [
                        {classes : "bold", name : "Powers"},
                        {
                          classes : "bold flexmiddle create subtitle lrmargin",
                          style : {"cursor" : "pointer"},
                          icon : "plus",
                          click : {create : "spellbook"}
                        }
                      ]},
                      {
                        classes : "flex",
                        ui : "ui_entryList",
                        scope : {
                          drop : "spellDrop",
                          connectWith : ".spellDrop",
                          reposition : true,
                          lookup : "spellbook",
                          applyUI : {classes : "flexcolumn flex", display : [
                            {classes : "flexrow flexmiddle white smooth", display : [
                              {
                                classes : "flexcolumn",
                                ui : "ui_image",
                                target : "@applyTarget.info.img",
                                style : {"width" : "50px", "height" : "50px"},
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
                          ]}
                        }
                      },
                    ]
                  },
                },
              },
            ]
          },
        ]
      },
/*      tabs : [
        {name : "About", icon : "user", display : {
            classes : "",
            display : [
              {classes : "flexrow flexbetween lpadding",
              display : [
                {
                  classes : "flexcolumn flex2",
                  display : [
                    {classes : "flexmiddle padding bold", value : "General Info"},
                    {classes : "flexrow spadding subtitle", display : [
                      {value : "@c.info.home.name", classes : "bold", style : {"width" : "120px"}},
                      {classes : "flexrow fit-x lrmargin", name : "", target : "info.home", edit : {classes : "lrmargin line"}},
                    ]},
                    {classes : "flexrow spadding subtitle", display : [
                      {value : "@c.info.back.name", classes : "bold", style : {"width" : "120px"}},
                      {classes : "flexrow fit-x lrmargin", name : "", target : "info.back", edit : {classes : "lrmargin line"}},
                    ]},
                    {classes : "flexrow spadding subtitle", display : [
                      {value : "@c.info.role.name", classes : "bold", style : {"width" : "120px"}},
                      {classes : "flexrow fit-x lrmargin", name : "", target : "info.role", edit : {classes : "lrmargin line"}},
                    ]},
                    {classes : "flexrow spadding subtitle", display : [
                      {value : "@c.info.div.name", classes : "bold", style : {"width" : "120px"}},
                      {classes : "flexrow fit-x lrmargin", name : "", target : "info.div", edit : {classes : "lrmargin line"}},
                    ]},
                    {classes : "flexrow spadding subtitle", display : [
                      {value : "@c.info.adv.name", classes : "bold", style : {"width" : "120px"}},
                      {classes : "flexrow fit-x lrmargin", name : "", target : "info.adv", edit : {classes : "lrmargin line"}},
                    ]},
                    {classes : "flex flexcolumn flexmiddle padding", target : "counters.daemonic", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  ]
                },
                {classes : "flexcolumn", display : [
                  {classes : "flexmiddle padding bold", value : "Non-Natural Bonuses"},
                  {classes : "flexmiddle lrpadding subtitle", name : "WS", target : "counters.nnWS", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "BS", target : "counters.nnBS", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "S", target : "counters.nnS", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "T", target : "counters.nnT", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "Ag", target : "counters.nnAg", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "Int", target : "counters.nnInt", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "Per", target : "counters.nnPer", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "WP", target : "counters.nnWP", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                  {classes : "flexmiddle lrpadding subtitle", name : "Fel", target : "counters.nnFel", edit : {classes : "line", type : "number", style : {"width" : "50px", "text-align" : "center"}}},
                ]},
                {classes : "flexcolumn flex", apps : ["ui_characterSpecials"]},
              ]},
              {
                classes : "flexcolumn flex padding",
                ui : "ui_characterNotes",
                scope : {style : {"min-height" : "400px"}}
              },
            ]
          }
        },
        {name : "Inventory", icon : "align-justify", display : {
            classes : "flexcolumn padding",
            display : [
              {apps : ["ui_characterBody"]},
              {classes : "flexrow underline", style : {"font-size" : "1.4em"}, display : [
                {classes : "bold", name : "Inventory"},
                {
                  classes : "bold flexmiddle create subtitle lrmargin",
                  style : {"cursor" : "pointer"},
                  icon : "plus",
                  click : {create : "inventory"}
                }
              ]},
              {classes : "flexrow fit-x flexbetween", display : [
                {classes : "bold subtitle flexmiddle", style : {"margin-left" : "4px"}, name : "Quantity"},
                {classes : "bold subtitle flex flexmiddle", name : "Name"},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Dmg", style : {"width" : "50px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "RoF", style : {"width" : "50px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Rng", style : {"width" : "50px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Pen", style : {"width" : "50px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Wt.", style : {"width" : "50px"}},
                {
                  classes : "flexmiddle",
                  name : "",
                  icon : "edit",
                  style : {"color" : "transparent"},
                },
                {
                  classes : "flexmiddle lrmargin",
                  name : "",
                  icon : "trash",
                  style : {"color" : "transparent"},
                },
              ]},
              {
                cond : "@c.inventory.length>0",
                classes : "flexcolumn white smooth padding outline",
                ui : "ui_entryList",
                scope : {
                  drop : "inventoryDrop",
                  connectWith : ".inventoryDrop",
                  lookup : "inventory",
                  applyUI : {classes : "flexrow flex subtitle", display : [
                    {
                      classes : "flexcolumn",
                      ui : "ui_image",
                      target : "@applyTarget.info.img",
                      style : {"width" : "20px", "height" : "20px"},
                      scope : {def : "/content/icons/Backpack1000p.png"},
                    },
                    {name : "", target : "@applyTarget.info.quantity", edit : {classes : "lrmargin line middle", title : "Quantity", style : {"width" : "24px"}, raw : "1"}},
                    {classes : "flex lrpadding", name : "", target : "@applyTarget.info.name", edit : {classes : "lrpadding line flex", style : {"min-width" : "70px"}, raw : "1"}},
                    {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle",
                      value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                      click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"}, {target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                    },
                    {name : "", target : "@applyTarget.weapon.damage", edit : {classes : "lrmargin line middle", title : "Damage", style : {"width" : "50px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.rof", edit : {classes : "lrmargin line middle", title : "Rate of Fire", style : {"width" : "50px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.range", edit : {classes : "lrmargin line middle", title : "Range", style : {"width" : "50px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.pen", edit : {classes : "lrmargin line middle", title : "Pen", style : {"width" : "50px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.info.weight", edit : {classes : "lrmargin line middle", title : "Weight", style : {"width" : "50px"}, raw : "1"}},
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
                  ]}
                }
              },
            ]
          },
        },
        {name : "Skills", icon : "education", display : {
            classes : "padding",
            display : [
              {classes : "flexrow", display : [
                {ui : "ui_tagList", scope : {filter : "apt", title : "Adept at.."}},
                {classes : "flex flexmiddle", ui : "ui_tagList", scope : {filter : "trait", title : "Special Traits", classes : "flexrow flexwrap flexaround"}}
              ]},
              {apps : ["ui_characterSkills"]}
            ]
          },
        },
        {name : "Talents", icon : "screenshot", display : {
            classes : "padding",
            display : [
              {classes : "flexrow", display : [
                {ui : "ui_tagList", scope : {filter : "apt", title : "Adept at.."}},
                {classes : "flex flexmiddle", ui : "ui_tagList", scope : {filter : "trait", title : "Special Traits", classes : "flexrow flexwrap flexaround"}}
              ]},
              {apps : ["ui_characterTalents"],}
            ]
          },
        },
        {name : "Powers", icon : "fire", display : {
            classes : "padding",
            display : [
              {ui : "ui_tagList", scope : {filter : "trait", title : "Special Traits", classes : "flexrow flexwrap flexaround"}},
              {apps : ["ui_characterSpells"]}
            ]
          },
        },
      ],
*/      skills : {
        inverted : true,
        ranks : ["10", "20", "30", "40"],
        msg : "@me.name+' used skill @skill.name'",
        action : "Stat Test",
        options : {
          "bonus" : "(R@skill==1)?(M@skill):('')",
          "penalty" : "(R@skill!=1)?(20-M@skill):('')",
          "stat" : "'c.stats.@statKey'",
          "degBonus" : "'c.counters.nn@statKey'",
          "threshold" : "(@exhaustion>(@stat/10)f)?((@stat/2)c):(@stat)"
        },
        display : "20-R@skill*20-M@skill",
      },
      summary : [
        {icon : "user", name : "Summary",
          display : {display : [
            // each one is a row
            {
              classes : "fit-x flexbetween outlinebottom subtitle",
              display : [
                {target : "counters.wounds", classes : "subtitle", ui : "ui_editable", scope : {increment : 1, ui : "ui_maxbox"}},
                {target : "counters.exhaustion", classes : "subtitle", ui : "ui_editable", scope : {increment : 1, ui : "ui_maxbox"}},
              ]
            },
            {
              classes : "flexrow flexaround outlinebottom",
              display : [
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "WS", value : "@WS", click : {name : "'tested WS'", action : "Stat Test", options : {"stat" : "@c.stats.WS", "degBonus" : "(@nnWS/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "BS", value : "@BS", click : {name : "'tested BS'", action : "Stat Test", options : {"stat" : "@c.stats.BS", "degBonus" : "(@nnBS/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "S", value : "@S", click : {name : "'tested S'", action : "Stat Test", options : {"stat" : "@c.stats.S", "degBonus" : "(@nnS/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "T", value : "@T", click : {name : "'tested T'", action : "Stat Test", options : {"stat" : "@c.stats.T", "degBonus" : "(@nnT/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "Ag", value : "@Ag", click : {name : "'tested Ag'", action : "Stat Test", options : {"stat" : "@c.stats.Ag", "degBonus" : "(@nnAg/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "Int", value : "@Int", click : {name : "'tested Int'", action : "Stat Test", options : {"stat" : "@c.stats.Int", "degBonus" : "(@nnInt/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "Per", value : "@Per", click : {name : "'tested Per'", action : "Stat Test", options : {"stat" : "@c.stats.Per", "degBonus" : "(@nnPer/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "WP", value : "@WP", click : {name : "'tested WP'", action : "Stat Test", options : {"stat" : "@c.stats.WP", "degBonus" : "(@nnWP/2)f"}}},
                {classes : "flexcolumn flexmiddle subtitle hover2", name : "Fel", value : "@Fel", click : {name : "'tested Fel'", action : "Stat Test", options : {"stat" : "@c.stats.Fel", "degBonus" : "(@nnFel/2)f"}}},
              ]
            },
            {apps : ["ui_characterBody"], scope : {minimized : true}}
          ]}
        },
        {name : "Skills", icon : "education", display : {apps : ["ui_characterSkills"], scope : {minimized : true}}},
        {name : "Talents", icon : "screenshot", display : {apps : ["ui_characterTalents"], scope : {minimized : true}}},
        {name : "Special Rules", icon : "gift", display : {apps : ["ui_characterSpecials"]}},
      ]
    },
  }
};
