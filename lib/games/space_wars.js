var sync = require("../sync.js");

exports.templates = {
  version : 30,
  grid : {unitScale : 64, unit : "m"},
  constants : {
    basearmor : "@c.stats.Br",
    br : "@c.stats.Br",
    ag : "@c.stats.Ag",
    int : "@c.stats.Int",
    cun : "@c.stats.Cun",
    will : "@c.stats.Will",
    pr : "@c.stats.Pr",
  },
  tables : {

  },
  initiative : {
    data : {a : 0, s : 0}, // ignore triumphs
    compare : "(@i1.s>@i2.s)?(1):((@i1.s==@i2.s)?((@i1.a>@i2.a)?(1):((@i1.a==@i2.a)?(0):(-1))):(-1))",
    query : "(M@c.skills.coo)|@Pr[proficiency]+((M@c.skills.coo>=@Pr)?(M@c.skills.coo-@Pr):(@Pr-M@c.skills.coo))[ability]",
    display : { // each turn step
      classes : "flexcolumn padding",
      display : [
        {
          cond : "@s>0",
          classes : "flexrow flexmiddle",
          display : [
            {
              classes : "flexcolumn",
              ui : "ui_image",
              style : {width : "20px", height : "20px"},
              scope : {image : "/content/dice/success.png", viewOnly : true},
            },
            {cond : "@s>=1", value : "x@s"}
          ],
        },
        {
          cond : "@a>0",
          classes : "flexrow flexmiddle",
          display : [
            {
              classes : "flexcolumn",
              ui : "ui_image",
              style : {width : "20px", height : "20px"},
              scope : {image : "/content/dice/advantage.png", viewOnly : true},
            },
            {cond : "@a>=1", value : "x@a"}
          ],
        },
      ],
    },
    charMarker : {
      cond : "@tri>0",
      classes : "flexrow flexmiddle",
      display : [
        {
          classes : "flexcolumn",
          ui : "ui_image",
          style : {width : "20px", height : "20px"},
          scope : {image : "/content/dice/triumph.png", viewOnly : true},
        },
        {cond : "@tri>=1", value : "x@tri"}
      ],
    },
  },
  generation : "sw_eote",
  character : {
    _t : "c",
    info : {
      name : sync.newValue("Name", "Default Character"),
      img : sync.newValue("Character Art"),
      race : sync.newValue("Species", "Human"),
      career : sync.newValue("Career"),
      spec : sync.newValue("Specializations"),
      powers : sync.newValue("Rating", 0, 0),
      notes : sync.newValue("Notes", null),
    },
    stats : {
      Br : sync.newValue("Brawn", 2, 0),
      Ag : sync.newValue("Agility", 2, 0),
      Int : sync.newValue("Intellect", 2, 0),
      Cun : sync.newValue("Cunning", 2, 0),
      Will : sync.newValue("Willpower", 2, 0),
      Pr : sync.newValue("Presence", 2, 0),
    },
    counters : {
      exp : sync.newValue("Experience", 0, 0, null, {"Starting" : 0}),
      wounds : sync.newValue("Wounds", 8, 0, 8),
      stress : sync.newValue("Stress", 10, 0, 10),
      obligation : sync.newValue("Obligation", 0, 0, 100),
      mdf : sync.newValue("Melee", 0),
      rdf : sync.newValue("Ranged", 0),
    },
    tags : {},
    skills : {
      bra : sync.newValue("Brawl (Br)"),
      gun : sync.newValue("Gunnery (Ag)"),
      mel : sync.newValue("Melee (Br)"),
      raL : sync.newValue("Range - Light (Ag)"),
      raH : sync.newValue("Range - Heavy (Ag)"),
      lig : sync.newValue("Lightsaber (Br)"),
      ast : sync.newValue("Astrogation (Int)"),
      ath : sync.newValue("Athletics (Br)"),
      chat : sync.newValue("Charm (Pr)"),
      coe : sync.newValue("Coercion (Will)"),
      com : sync.newValue("Computers (Int)"),
      coo :sync.newValue("Cool (Pr)"),
      crd : sync.newValue("Coordination (Ag)"),
      dec : sync.newValue("Deception (Cun)"),
      dis : sync.newValue("Discipline (Will)"),
      lea : sync.newValue("Leadership (Pr)"),
      mec : sync.newValue("Mechanics (Int)"),
      med : sync.newValue("Medicine (Int)"),
      neg : sync.newValue("Negotiation (Pr)"),
      per : sync.newValue("Perception (Cun)"),
      plp : sync.newValue("Piloting - Planetary (Ag)"),
      pls : sync.newValue("Piloting - Space (Ag)"),
      res : sync.newValue("Resilience (Br)"),
      sku : sync.newValue("Skulduggery (Cun)"),
      ste : sync.newValue("Stealth (Ag)"),
      str : sync.newValue("Streetwise (Cun)"),
      sur : sync.newValue("Survival (Cun)"),
      vig : sync.newValue("Vigilance (Will)"),
      cor : sync.newValue("Core Worlds (Int)"),
      edu : sync.newValue("Education (Int)"),
      lor : sync.newValue("Lore (Int)"),
      und : sync.newValue("Underworld (Int)"),
      xen : sync.newValue("Xenology (Int)"),
      out : sync.newValue("Outer Rim (Int)"),
      war : sync.newValue("Warfare (Int)"),
    },
    talents : {},
    spellbook : [], //storage for force powers
    inventory : [],
    specials : {},
  },
  item : {
    _t : "i", tags : {},
    info : {
      name : sync.newValue("Name", null),
      weight : sync.newValue("Encumbrance", null, 0),
      quantity : sync.newValue("Quantity", null, 0),
      img : sync.newValue("Image", null),
      skill : sync.newValue("Skill", null),
      special : sync.newValue("Special", null),
      notes : sync.newValue("Notes", null),
      price : sync.newValue("Price", null)
    },
    equip : {
      armor : sync.newValue("Armor", null),
      rdf : sync.newValue("Ranged", null),
      mdf : sync.newValue("Melee", null),
    },
    weapon : { // type of variable dictates what you can enter
      damage : sync.newValue("Damage", null),
      range : sync.newValue("Range", null),
      crit : sync.newValue("Crit", null),
    },
    spell : {
      level : sync.newValue("Level", null),
      required : sync.newValue("Materials", null),
      duration : sync.newValue("Duration", null),
      time : sync.newValue("Casting Time", null),
    },
  },
  dice : {
    defaults : ["proficiency", "ability", "boost", "challenge", "difficulty", "setback", "force"],
    modifiers : [],
    ui : "ui_poolResults",
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
              {
                classes : "flexcolumn flexmiddle fit-x bold",
                name : "Defense",
                display : [
                  {
                    classes : "flexrow flexaround fit-x",
                    style : {"font-size" : "0.8em"},
                    display : [
                      {classes : "flexcolumn", target : "equip.mdf", ui : "ui_armorValue", scope : {width : "40px", height : "40px"}},
                      {classes : "flexcolumn", target : "equip.rdf", ui : "ui_armorValue", scope : {width : "40px", height : "40px"}},
                    ]
                  },
                ]
              },
              {target : "equip.armor", ui : "ui_armorValue"},
              {target : "equip.armor", ui : "ui_armorBonuses"},
            ]
          },
          {
            classes : "flex flexcolumn",
            display : [
              {
                classes : "flex flexrow",
                display : [
                  {
                    classes : "flex flexcolumn",
                    target : "equip.mdf",
                    ui : "ui_modifiers",
                    scope : {text : "Modifiers", total : "", modsOnly : true}
                  },
                  {
                    classes : "flex flexcolumn",
                    target : "equip.rdf",
                    ui : "ui_modifiers",
                    scope : {text : "Modifiers", total : "", modsOnly : true}
                  }
                ]
              },
              {
                classes : "flex flexcolumn",
                target : "equip.armor",
                ui : "ui_modifiers",
                scope : {text : "Modifiers", total : "", modsOnly : true}
              }
            ]
          }
        ],
        weapon : [
          {
            classes : "flex flexcolumn flexmiddle",
            name : "Armor Data",
          }
        ]
      },
/*      summary : {
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
              {classes : "lrpadding", target : "weapon.damage", name : "D: ", cond : "('@i.weapon.damage'!=0)&&('@i.weapon.damage'!='')"},
              {classes : "lrpadding", target : "weapon.range", name : "R: ", cond : "('@i.weapon.range'!=0)&&('@i.weapon.range'!='')"},
              {classes : "lrpadding", target : "weapon.crit", name : "Crit: ", cond : "('@i.weapon.crit'!=0)&&('@i.weapon.crit'!='')"},
            ]
          },
          {
            classes : "fit-x flexrow",
            style : {"font-size" : "0.8em"},
            name : "",
            target : "info.special",
            cond : "('@i.info.special'!=0)&&('@i.info.special'!='')"
          },
          {
            classes : "fit-x flexbetween",
            style : {"font-size" : "0.8em"},
            target : "info.skill",
            ui : "ui_skillDiceLookup"
          },
        ]
      },
*/
    },
    sheet : {
      altStat : "counters.stress",
      health : "counters.wounds",
      style : {"background-image" : "url('/content/sheet1.png')", "background-size" : "cover", "box-shadow" : "inset 0em 0em 0.5em 0.5em rgba(0,0,0,0.2)"},
      content : {
        classes : "lpadding",
        display : [
          {
            classes : "flexrow flexaround",
            display : [
              {
                classes : "flexcolumn flex",
                style : {"position" : "relative"},
                display : [
                  {
                    classes : "flexcolumn flex smooth outline white",
                    ui : "ui_image",
                    target : "info.img",
                    style : {"min-width" : "100px", "min-height" : "100px"},
                  },
                  {style : {"position" : "absolute", "right" : "0", "bottom" : "0"}, title : "Map Token", target : "info.img", ui : "ui_token", scope : {classes : "smooth outline white"}}
                ]
              },
              {classes : "spadding"},
              {classes : "flexcolumn flex padding white outline smooth", display : [
                {classes : "flexrow fit-x spadding",name : "", style : {"font-size" : "1.2em"}, target : "info.name", edit : {classes : "lrmargin line", style : {"-webkit-text-stroke-width" : "2px", "text-align" : "center"}}},
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
              ]},
            ]
          },
          {classes : "flexrow flexaround padding", display : [
            {classes : "flexcolumn flexmiddle lrmargin bold outline inactive", style : {"border-radius" : "10px/50%", "min-width" : "145px"}, display : [
              {classes : "bold smooth lrpadding subtitle flexmiddle", name : "Armor"},
              {
                "classes": "flexcolumn smargin smooth",
                "style": {
                  "width": "40px",
                  "height": "40px"
                },
                "ui": "ui_image",
                "scope": {
                  "viewOnly": true,
                  "classes": "flexmiddle alttext",
                  "image": "/content/icons/Shield1000p.png",
                  "title": "@:armor()"
                }
              }
            ]},
            {classes : "flexcolumn flexmiddle lrmargin bold outline inactive", style : {"border-radius" : "10px/50%"}, display : [
              {classes : "bold smooth lrpadding flexmiddle subtitle", name : "@c.counters.wounds.name"},
              {classes : "flexrow flexmiddle lrmargin bold", style : {"font-size" : "1.6em", "border-radius" : "10px/50%"}, display : [
                {classes : "flexcolumn flexmiddle bold", name : "current", style : {"font-size" : "0.38em"}, target : "counters.wounds", edit : {classes : "smargin subtitle middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}}},
                {classes : "flexcolumn flexmiddle bold", name : "max", style : {"font-size" : "0.38em"}, target : "counters.wounds", edit : {classes : "smargin subtitle middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}, raw : "max"}},
              ]},
              {classes : "flexcolumn fit-x lrmargin lrpadding", display : [{classes : "lrmargin flex", target : "counters.wounds", ui : "ui_progressBar", scope : {value : "counters.wounds", max : "counters.wounds.max"}}]},
            ]},
            {classes : "flexcolumn flexmiddle lrmargin bold outline inactive", style : {"border-radius" : "10px/50%"}, display : [
              {classes : "bold smooth lrpadding subtitle flexmiddle", name : "@c.counters.stress.name"},
              {classes : "flexrow flexmiddle lrmargin bold", style : {"font-size" : "1.6em", "border-radius" : "10px/50%"}, display : [
                {classes : "flexcolumn flexmiddle bold", name : "current", style : {"font-size" : "0.38em"}, target : "counters.stress", edit : {classes : "smargin middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}}},
                {classes : "flexcolumn flexmiddle bold", name : "max", style : {"font-size" : "0.38em"}, target : "counters.stress", edit : {classes : "smargin middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}, raw : "max"}},
              ]},
              {classes : "flexcolumn fit-x lrmargin lrpadding", display : [{classes : "lrmargin flex", target : "counters.stress", ui : "ui_progressBar", scope : {value : "counters.stress", max : "counters.stress.max", col : "rgba(255,240,0,1)"}}]},
            ]},
            {classes : "flexcolumn flexmiddle lrmargin bold outline inactive", style : {"border-radius" : "10px/50%"}, display : [
              {classes : "bold smooth lrpadding subtitle flexmiddle", name : "Defense"},
              {classes : "flexrow flexmiddle lrmargin bold", style : {"font-size" : "1.6em", "border-radius" : "10px/50%"}, display : [
                {classes : "flexcolumn flexmiddle bold", name : "@c.counters.mdf.name", style : {"font-size" : "0.38em"}, target : "counters.mdf", edit : {classes : "smargin middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}}},
                {classes : "flexcolumn flexmiddle bold", name : "@c.counters.rdf.name", style : {"font-size" : "0.38em"}, target : "counters.rdf", edit : {classes : "smargin middle outline", style : {"font-size": "1.8em", width : "60px", "border-radius" : "10px/50%"}}},
              ]},
              {classes : "flexrow fit-x flexaround bold", display : [
                {classes : "lrmargin", name : "", value : "@c.counters.mdf + @:equip(0,mdf)"},
                {classes : "lrmargin", name : "", value : "@c.counters.rdf + @:equip(0,rdf)"}
              ]}
            ]},
          ]},
          {classes : "flexrow flex flexaround", target : "stats", applyUI : {
            display : {classes : "flexrow flexaround flex", display : [
              {classes : "spadding flexcolumn flexmiddle lrmargin bold outline inactive", style : {"border-radius" : "10px/50%"}, display : [
                {classes : "flexrow flexmiddle subtitle", display : [
                  {name : "@c.@applyTarget.name", classes : "lrpadding bold"},
                  {classes : "flexmiddle", ui : "ui_link", scope : {icon : "'list-alt'", click : "ui_modifiers", lookup : "@applyTarget", attr : {"modsOnly" : true}}},
                ]},
                {classes : "flexrow flexmiddle lrmargin bold", style : {"font-size" : "1.6em", "border-radius" : "10px/50%"}, display : [
                  {
                    name : "", target : "@applyTarget", edit : {classes : "bold white outline flexmiddle fit-x", style : {"border-radius" : "10px/50%", "width" : "70px", "height" : "40px"}, raw : "1"},
                  },
                ]},
              ]}
            ]},
          }},
          {classes : "padding"},
          {
            classes : "flexrow flexaround",
            display : [
              {
                classes : "flexcolumn flex lrmargin",
                display : [
                  {name : "General Skills", classes : "bold subtitle lrmargin lrpadding"},
                  {
                    classes : "flexcolumn lrpadding",
                    ui : "ui_skillList",
                    scope : {
                      lookup : "skills",
                      list : ["ast","ath","chat","coe","com","coo","crd","dec","dis","lea","mec","med","neg","per","plp","pls","res","sku","ste","str","sur","vig"],
                      applyUI : {
                        classes : "flexrow subtitle outlinebottom flex smooth spadding white", style : {"border-radius" : "6px"}, display : [
                          {classes : "flexrow flex lrmargin ", name : "@c.@skillTarget.name"},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Career"}},
                            {classes : "lrmargin subtitle flexmiddle", name : "Career"},
                          ]},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "lrmargin subtitle flexmiddle", name : "Rank"},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "1", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=1", title : "Rank 1"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "2", unchecked : "1", cond : "@c.@skillTarget.modifiers.rank>=2", title : "Rank 2"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "3", unchecked : "2", cond : "@c.@skillTarget.modifiers.rank>=3", title : "Rank 3"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "4", unchecked : "3", cond : "@c.@skillTarget.modifiers.rank>=4", title : "Rank 4"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "5", unchecked : "4", cond : "@c.@skillTarget.modifiers.rank>=5", title : "Rank 5"}},
                          ]},
                          {
                            cond : "('@statKey')!=''",
                            classes : "hover2 flexmiddle",
                            ui : "ui_diceVisual",
                            scope : {
                              classes : "flexrow flexmiddle flexwrap",
                              diceSize : "8px",
                              eq : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            },
                            diceable : {
                              msg : "Tested @c.@skillTarget.name",
                              data : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            }
                          },
                          {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                        ]
                      },
                    }
                  }
                ]
              },
              {
                classes : "flexcolumn flex lrmargin",
                display : [
                  {name : "Combat Skills", classes : "bold subtitle lrmargin lrpadding"},
                  {
                    classes : "flexcolumn lrpadding",
                    ui : "ui_skillList",
                    scope : {
                      lookup : "skills",
                      list : ["bra", "gun", "mel", "raL", "raH"],
                      applyUI : {
                        classes : "flexrow subtitle outlinebottom flex smooth spadding white", style : {"border-radius" : "6px"}, display : [
                          {classes : "flexrow flex lrmargin ", name : "@c.@skillTarget.name"},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Career"}},
                            {classes : "lrmargin subtitle flexmiddle", name : "Career"},
                          ]},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "lrmargin subtitle flexmiddle", name : "Rank"},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "1", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=1", title : "Rank 1"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "2", unchecked : "1", cond : "@c.@skillTarget.modifiers.rank>=2", title : "Rank 2"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "3", unchecked : "2", cond : "@c.@skillTarget.modifiers.rank>=3", title : "Rank 3"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "4", unchecked : "3", cond : "@c.@skillTarget.modifiers.rank>=4", title : "Rank 4"}},
                          ]},
                          {
                            cond : "('@statKey')!=''",
                            classes : "hover2 flexmiddle",
                            ui : "ui_diceVisual",
                            scope : {
                              classes : "flexrow flexmiddle flexwrap",
                              diceSize : "8px",
                              eq : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            },
                            diceable : {
                              msg : "Tested @c.@skillTarget.name",
                              data : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            }
                          },
                          {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                        ]
                      },
                    }
                  },
                  {classes : "padding"},
                  {name : "Knowledge Skills", classes : "bold subtitle lrmargin lrpadding"},
                  {
                    classes : "flexcolumn lrpadding",
                    ui : "ui_skillList",
                    scope : {
                      lookup : "skills",
                      list : ["cor", "edu", "lor", "und", "xen", "out", "war"],
                      applyUI : {
                        classes : "flexrow subtitle outlinebottom flex smooth spadding white", style : {"border-radius" : "6px"}, display : [
                          {classes : "flexrow flex lrmargin ", name : "@c.@skillTarget.name"},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Career"}},
                            {classes : "lrmargin subtitle flexmiddle", name : "Career"},
                          ]},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "lrmargin subtitle flexmiddle", name : "Rank"},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "1", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=1", title : "Rank 1"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "2", unchecked : "1", cond : "@c.@skillTarget.modifiers.rank>=2", title : "Rank 2"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "3", unchecked : "2", cond : "@c.@skillTarget.modifiers.rank>=3", title : "Rank 3"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "4", unchecked : "3", cond : "@c.@skillTarget.modifiers.rank>=4", title : "Rank 4"}},
                          ]},
                          {
                            cond : "('@statKey')!=''",
                            classes : "hover2 flexmiddle",
                            ui : "ui_diceVisual",
                            scope : {
                              classes : "flexrow flexmiddle flexwrap",
                              diceSize : "8px",
                              eq : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            },
                            diceable : {
                              msg : "Tested @c.@skillTarget.name",
                              data : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            }
                          },
                          {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                        ]
                      },
                    }
                  },
                  {classes : "padding"},
                  {classes : "flexrow  lrmargin lrpadding", display : [
                    {name : "Custom Skills", classes : "bold subtitle"},
                    {
                      classes : "bold flexmiddle create subtitle lrmargin",
                      style : {"cursor" : "pointer"},
                      icon : "plus",
                      click : {create : "skills"}
                    }
                  ]},
                  {
                    classes : "flexcolumn lrpadding",
                    ui : "ui_skillList",
                    scope : {
                      lookup : "skills",
                      ignore : [
                        "ast","ath","chat","coe","com","coo","crd","dec","dis","lea","mec","med","neg",
                        "per","plp","pls","res","sku","ste","str","sur","vig","bra","gun","mel","raL","raH",
                        "cor","edu","lor","und","xen","out","war"
                      ],
                      applyUI : {
                        classes : "flexrow subtitle outlinebottom flex smooth spadding white", style : {"border-radius" : "6px"}, display : [
                          {classes : "flexrow flex lrmargin ", name : "", target : "@skillTarget", edit : {classes : "line", name : true}},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Career"}},
                            {classes : "lrmargin subtitle flexmiddle", name : "Career"},
                          ]},
                          {classes : "flexrow flexmiddle", display : [
                            {classes : "lrmargin subtitle flexmiddle", name : "Rank"},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "1", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=1", title : "Rank 1"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "2", unchecked : "1", cond : "@c.@skillTarget.modifiers.rank>=2", title : "Rank 2"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "3", unchecked : "2", cond : "@c.@skillTarget.modifiers.rank>=3", title : "Rank 3"}},
                            {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "4", unchecked : "3", cond : "@c.@skillTarget.modifiers.rank>=4", title : "Rank 4"}},
                          ]},
                          {
                            cond : "('@statKey')!=''",
                            classes : "hover2 flexmiddle",
                            ui : "ui_diceVisual",
                            scope : {
                              classes : "flexrow flexmiddle flexwrap",
                              diceSize : "8px",
                              eq : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            },
                            diceable : {
                              msg : "Tested @c.@skillTarget.name",
                              data : "(M@c.@skillTarget)|@c.stats.@statKey[proficiency]+((M@c.@skillTarget>=@c.stats.@statKey)?(M@c.@skillTarget-@c.stats.@statKey):(@c.stats.@statKey-M@c.@skillTarget))[ability]"
                            }
                          },
                          {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                          {classes : "flexmiddle destroy", link : "trash", title : "Remove Skill", click : {delete : true, target : "@skillTarget"}},
                        ]
                      },
                    }
                  },
                ]
              },
            ]
          },
          {classes : "flexrow flex padding", display : [
            {classes : "flexcolumn flex padding", display : [
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
                {classes : "bold subtitle flexmiddle", name : "Quantity"},
                {classes : "bold subtitle flex flexmiddle", name : "Name"},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Dmg", style : {"width" : "40px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Rng", style : {"width" : "40px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Crit", style : {"width" : "40px"}},
                {classes : "bold subtitle flexmiddle lrmargin", name : "Enc.", style : {"width" : "40px"}},
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
                    {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle", cond : "(@c.@applyTarget.equip.armor!=0||@c.@applyTarget.info.skill!=null||@c.@applyTarget.weapon.damage!=null||@c.@applyTarget.weapon.range!=null)",
                      value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                      click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"},{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                    },
                    {name : "", target : "@applyTarget.weapon.damage", edit : {classes : "lrmargin line middle", title : "Damage", style : {"width" : "40px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.range", edit : {classes : "lrmargin line middle", title : "Range", style : {"width" : "40px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.crit", edit : {classes : "lrmargin line middle", title : "Crit", style : {"width" : "40px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.info.weight", edit : {classes : "lrmargin line middle", title : "Encumbrance", style : {"width" : "40px"}, raw : "1"}},
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
            ]},
            {classes : "flexcolumn padding", style : {"width" : "33%"}, display : [
              {apps : ["ui_characterGear"]}
            ]}
          ]},
          {classes : "flexrow padding", display : [
            {classes : "flexcolumn flex padding", display : [
              {classes : "flexrow underline bold", name : "Notes", style : {"font-size" : "1.4em"}},
              {classes : "flex flexcolumn", apps : ["ui_characterNotes"], style : {"min-height" : "400px"}, scope : {noPadding : true}}
            ]},
            {classes : "flexcolumn padding", style : {"width" : "33%"}, display : [
              {classes : "flexrow underline flexmiddle", style : {"font-size" : "1.4em"}, display : [
                {classes : "bold", name : "Talents"},
                {
                  classes : "bold subtitle flexmiddle create",
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
              {ui : "ui_tagList", scope : {filter : "crit", title : "Critical Damage"}},
            ]},
          ]},
        ]
      },
      /*tabs : [
        {name : "Notes", icon : "info-sign", display : {
          classes : "flexcolumn padding",
          display : [
            {
              classes : "flexcolumn flex",
              ui : "ui_characterNotes",
              scope : {style : {"min-height" : "400px"}}
            },
          ]
        }},
        {name : "Inventory", icon : "align-justify", display : {
            classes : "flexcolumn",
            display : [
              {classes : "flexcolumn flex lpadding", display : [
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
                  {classes : "bold subtitle flexmiddle", name : "Quantity"},
                  {classes : "bold subtitle flex flexmiddle", name : "Name"},
                  {classes : "bold subtitle flexmiddle lrmargin", name : "Dmg", style : {"width" : "40px"}},
                  {classes : "bold subtitle flexmiddle lrmargin", name : "Rng", style : {"width" : "40px"}},
                  {classes : "bold subtitle flexmiddle lrmargin", name : "Crit", style : {"width" : "40px"}},
                  {classes : "bold subtitle flexmiddle lrmargin", name : "Enc.", style : {"width" : "40px"}},
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
                  classes : "flexcolumn spadding",
                  ui : "ui_entryList",
                  scope : {
                    lookup : "inventory",
                    display : {classes : "flexrow flex subtitle", display : [
                      {
                        classes : "flexcolumn",
                        ui : "ui_image",
                        target : "@applyTarget.info.img",
                        style : {"width" : "15px", "height" : "15px"},
                        scope : {def : "/content/icons/Backpack1000p.png"},
                      },
                      {name : "", target : "@applyTarget.info.quantity", edit : {classes : "lrmargin line middle", title : "Quantity", style : {"width" : "24px"}, raw : "1"}},
                      {classes : "flex lrpadding", name : "", target : "@applyTarget.info.name", edit : {classes : "lrpadding line flex", style : {"min-width" : "70px"}, raw : "1"}},
                      {classes : "bold hover2 spadding white outline smooth flexrow flexmiddle subtitle", cond : "@c.@applyTarget.equip.armor!=0",
                        value : "(@c.@applyTarget.tags.equipped==0)?('Equip'):('Un-equip')", style : {"white-space" : "nowrap"},
                        click : {calc : [{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==0", eq : "1"},{target : "@applyTarget.tags.equipped", cond : "@c.@applyTarget.tags.equipped==1", eq : "0"}]}
                      },
                      {
                        cond : "((R@c.@applyTarget.info.skill)!=null&&(R@c.@applyTarget.info.skill)!='')",
                        classes : "hover2 flexmiddle",
                        ui : "ui_diceVisual",
                        scope : {
                          classes : "flexrow flexmiddle flexwrap",
                          diceSize : "14px",
                          eq : "2[ability]"
                        },
                        diceable : {
                          msg : "Tested @@skillTarget.name",
                          data : "2[ability]"
                        }
                      },
                      {name : "", target : "@applyTarget.weapon.dmg", edit : {classes : "lrmargin line middle", title : "Damage", style : {"width" : "40px"}, raw : "1"}},
                      {name : "", target : "@applyTarget.weapon.range", edit : {classes : "lrmargin line middle", title : "Range", style : {"width" : "40px"}, raw : "1"}},
                      {name : "", target : "@applyTarget.weapon.crit", edit : {classes : "lrmargin line middle", title : "Crit", style : {"width" : "40px"}, raw : "1"}},
                      {name : "", target : "@applyTarget.info.weight", edit : {classes : "lrmargin line middle", title : "Encumbrance", style : {"width" : "40px"}, raw : "1"}},
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
              ]},
            {apps : ["ui_characterInventory"]}
          ]},
        },
        {name : "Skills", icon : "education", display : {
            classes : "flexcolumn spadding",
            ui : "ui_skillList",
            scope : {
              lookup : "skills",
              display : {
                classes : "flexrow flex outline smooth spadding", display : [
                  {classes : "flexrow flex lrmargin ", name : "@.c.@skillTarget.name"},
                  {classes : "flexrow flexmiddle", display : [
                    {classes : "subtitle bold", ui : "ui_checkbox", scope : {saveInto : "@skillTarget.current", checked : 1, unchecked : 0, cond : "@c.@skillTarget.current==1", title : "Career"}},
                    {classes : "lrmargin subtitle flexmiddle", name : "Career"},
                  ]},
                  {classes : "flexrow flexmiddle", display : [
                    {classes : "lrmargin subtitle flexmiddle", name : "Rank"},
                    {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "1", unchecked : "0", cond : "@c.@skillTarget.modifiers.rank>=1", title : "Rank 1"}},
                    {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "2", unchecked : "1", cond : "@c.@skillTarget.modifiers.rank>=2", title : "Rank 2"}},
                    {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "3", unchecked : "2", cond : "@c.@skillTarget.modifiers.rank>=3", title : "Rank 3"}},
                    {ui : "ui_checkbox", scope : {saveInto : "@skillTarget.modifiers.rank", checked : "4", unchecked : "3", cond : "@c.@skillTarget.modifiers.rank>=4", title : "Rank 4"}},
                  ]},
                  {
                    classes : "hover2 flexmiddle",
                    ui : "ui_diceVisual",
                    scope : {
                      classes : "flexrow flexmiddle flexwrap",
                      diceSize : "14px",
                      eq : "2[ability]"
                    },
                    diceable : {
                      msg : "Tested @c.@skillTarget.name",
                      data : "2[ability]"
                    }
                  },
                  {classes : "flexmiddle lrmargin", ui : "ui_link", scope : { icon : "'list-alt'", click : "ui_modifiers", lookup : "@skillTarget", attr : {"modsOnly" : true}}},
                ]
              },
            }
          },
        },
        {name : "Talents", icon : "screenshot", display : {
            classes : "flexcolumn padding",
            apps : ["ui_characterTalents", "ui_characterSpecials"],
          },
        },
        {name : "Powers", icon : "fire", display : {
            classes : "flexcolumn",
            apps : ["ui_characterSpellSlots", "ui_characterSpells"]
          },
        },
      ],
*/      skills : {check : "Career", roll : "(M@skill)|@stat[proficiency]+((M@skill>=@stat)?(M@skill-@stat):(@stat-M@skill))[ability]", ranks : ["1", "2", "3", "4"], ui : "ui_skillDice"},
      rules : {
        "baseArmor" : sync.newValue("Armor", "@c.stats.Br"),
        "statBonus" : sync.newValue("statBonus", "@stat"),
      },
      summary : [
        {icon : "user", name : "Summary",
          display : {display : [
            // each one is a row
            {
              classes : "fit-x flexbetween outlinebottom",
              style : {"font-size" : "0.8em"},
              display : [
                {
                  classes : "flexcolumn flexmiddle",
                  display : [
                    {target : "counters.wounds", classes : "flexcolumn flexmiddle"},
                    {target : "counters.stress", classes : "flexcolumn flexmiddle"},
                  ]
                },
                {
                  classes : "flexcolumn flexmiddle flex",
                  name : "Criticals",
                  display : [{name : "", classes : "flexcolumn flexmiddle", target : "crits"}]
                },
                {
                  classes : "flexcolumn flexmiddle",
                  display : [
                    {
                      classes : "flexcolumn flexmiddle",
                      name : "Armor",
                      value : "@:armor()"
                    },
                    {
                      classes : "flexcolumn flexmiddle",
                      name : "Defense",
                      value : "(@c.counters.mdf + @:equip(0,mdf))+' : '+(@c.counters.rdf + @:equip(0,rdf))",
                    },
                  ]
                },
              ]
            },
            {
              classes : "flexrow flexaround outlinebottom",
              style : {"font-size" : "0.8em"},
              target : "stats",
              scope : {classes : "flexcolumn flexmiddle lrpadding", key : true}
            },
            {
              style : {"overflow-y": "auto", "max-height" : "30vh"},
              apps : ["ui_characterGear"]
            },
          ]}
        },
        {style : {"overflow-y": "auto", "max-height" : "30vh"}, icon : "education", name : "Skills", display : {apps : ["ui_characterSkills"], scope : {minimized : true}}},
        {style : {"overflow-y": "auto", "max-height" : "30vh"}, icon : "screenshot", name : "Talents", display : {apps : ["ui_characterTalents"], scope : {minimized : true}}},
        {style : {"overflow-y": "auto", "max-height" : "30vh"}, icon : "gift", name : "Special Rules", display : {apps : ["ui_characterSpecials"]}},
      ]
    },
    vehicle : {
      style : {},
      rules : {},
      calc : [],
      summary : [
        {icon : "plane", name : "Summary",
          display : {
            classes : "flexcolumn",
            display : [
            // each one is a row
            {
              classes : "flexaround outlinebottom",
              display : [
                {target : "info.name", edit : {placeholder : "Vehicle Name", cmd : "updateAsset"}},
                {target : "info.img", edit : {placeholder : "Image URL", cmd : "updateAsset"}},
                {classes : "flexmiddle", target : "info.img", ui : "ui_token"}
              ]
            },
            {
              classes : "flexaround outlinebottom",
              target : "stats",
              applyUI : "ui_fantasyStat",
            },
            {
              classes : "flexrow flexaround",
              display : [
                {target : "counters.wounds", ui : "ui_maxbox"},
                {target : "counters.speed", ui : "ui_maxbox"},
                {apps : ["ui_characterArmor"], scope : {width : "50px", height : "50px", armor : "ui_armorValue"}},
              ]
            },
            {
              classes : "flexrow flexaround",
              display : [
                {apps : ["ui_locations"]},
                {classes : "flex", name : "Equipment", apps : ["ui_characterGear"]},
              ],
            },
            {
              classes : "flexrow flexmiddle",
              apps : ["ui_crew"]
            },
          ]}
        },
        {icon : "align-justify", name : "Inventory", display : {apps : ["ui_inventory"], scope : {minimized : true}}},
        {icon : "gift", name : "Notes", display : {apps : ["ui_characterSpecials","ui_characterNotes"], scope : {minimized : true}}},
      ]
    }
  }
};
