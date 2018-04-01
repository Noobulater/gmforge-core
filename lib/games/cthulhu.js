var sync = require("../sync.js");

exports.templates = {
  version : 28,
  effects : {},
  actions : {
    "c" : {
      "Test" : {
        options : {
          "bonus" : [0, 5, 10, 20, 30, 40, 50, 60],
          "penalty" : [0, 5, 10, 20, 30, 40, 50, 60],
          "threshold" : true,
        },
        eventData : {
          ui : "ui_statTest",
          msg : "'@c.info.name tested'",
          data : "#roll=d100;@roll-(@bonus)+(@penalty)",
        }
      }
    },
    "i" : {}
  },
  generation : "\n",
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
      per : sync.newValue("Percent", null),
      rng : sync.newValue("Range", null),
      shots : sync.newValue("Shots", null),
      dmg : sync.newValue("Damage", null),
      malf : sync.newValue("Malfunction", null),
      hp : sync.newValue("HP", null),
      type : sync.newValue("Type", null),
      att : sync.newValue("Attacks", null)
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
      job : sync.newValue("Occupation"),
      edu : sync.newValue("Education"),
      birth : sync.newValue("Birthplace"),
      sex : sync.newValue("Sex"),
      mental : sync.newValue("Mental Disorders"),
      age : sync.newValue("Age"),
      notes : sync.newValue("Notes", null),
    },
    stats : {
      Str : sync.newValue("Strength", "3d6", 0),
      Dex : sync.newValue("Dexterity", "3d6", 0),
      Con : sync.newValue("Constitution", "3d6", 0),
      Int : sync.newValue("Intelligence", "2d6+6", 0),
      App : sync.newValue("App", "3d6", 0),
      Pow : sync.newValue("Power", "3d6", 0),
      Siz : sync.newValue("Size", "2d6", 0),
      San : sync.newValue("Sanity", "@Pow*5", 0),
      Edu : sync.newValue("Education", "3d6+3", 0),

      Idea : sync.newValue("Idea", "4B3[1d6]", 0),
      Luck : sync.newValue("Luck", "4B3[1d6]", 0),
      Know : sync.newValue("Know", "4B3[1d6]", 0),
    },
    counters : {
      hp : sync.newValue("Hit Points", 10, 0),
      mythos : sync.newValue("99-Cthulu", 0, 0),
      dmg : sync.newValue("Damage Bonus", 0, 0),
      hp : sync.newValue("Hit Points", 10, 0),
      sp : sync.newValue("Sanity Points", 10, 0),
      mp : sync.newValue("Magic Points", 10, 0),
    },
    tags : {},
    spells : {}, // equipement for spells
    skills : {
      acc : sync.newValue("Accounting", null, null, null, {rank : 10}),
      ant : sync.newValue("Anthropology", null, null, null, {rank : 01}),
      anr : sync.newValue("Archaeology", null, null, null, {rank : 01}),
      art : sync.newValue("Art", null, null, null, {rank : 05}),
      ast : sync.newValue("Astronomy", null, null, null, {rank : 01}),
      bar : sync.newValue("Bargain", null, null, null, {rank : 05}),
      bio : sync.newValue("Biology", null, null, null, {rank : 01}),
      che : sync.newValue("Chemistry", null, null, null, {rank : 01}),
      cli : sync.newValue("Climb", null, null, null, {rank : 40}),
      con : sync.newValue("Conceal", null, null, null, {rank : 15}),
      cra : sync.newValue("Craft", null, null, null, {rank : 05}),
      cre : sync.newValue("Credit Rating", null, null, null, {rank : 15}),
      dis : sync.newValue("Disguise", null, null, null, {rank : 01}),
      dog : sync.newValue("Dodge", null, null, null, {rank : "@Dex*2"}),
      dri : sync.newValue("Drive Auto", null, null, null, {rank : 20}),
      ele : sync.newValue("Electric Repair", null, null, null, {rank : 10}),
      fas : sync.newValue("Fast Talk", null, null, null, {rank : 05}),
      fir : sync.newValue("First Aid", null, null, null, {rank : 30}),
      gen : sync.newValue("Geology", null, null, null, {rank : 01}),
      hid : sync.newValue("Hide", null, null, null, {rank : 10}),
      his : sync.newValue("History", null, null, null, {rank : 20}),
      jum : sync.newValue("Jump", null, null, null, {rank : 25}),
      law : sync.newValue("Law", null, null, null, {rank : 05}),
      lib : sync.newValue("Library Use", null, null, null, {rank : 25}),
      loc : sync.newValue("Locksmith", null, null, null, {rank : 1}),
      mar : sync.newValue("Martial Arts", null, null, null, {rank : 01}),
      mec : sync.newValue("Mechanical Repair", null, null, null, {rank : 20}),
      med : sync.newValue("Medicine", null, null, null, {rank : 05}),
      nat : sync.newValue("Natural History", null, null, null, {rank : 10}),
      nav : sync.newValue("Navigate", null, null, null, {rank : 10}),
      occ : sync.newValue("Occult", null, null, null, {rank : 05}),
      ope : sync.newValue("Operate Heavy", null, null, null, {rank : 01}),
      per : sync.newValue("Persuade", null, null, null, {rank : 15}),
      pha : sync.newValue("Pharmacy", null, null, null, {rank : 01}),
      pho : sync.newValue("Photography", null, null, null, {rank : 10}),
      phy : sync.newValue("Physics", null, null, null, {rank : 10}),
      pil : sync.newValue("Pilot", null, null, null, {rank : 01}),
      psya : sync.newValue("Psychoanalysis", null, null, null, {rank : 01}),
      psy : sync.newValue("Psychology", null, null, null, {rank : 05}),
      rid : sync.newValue("Ride", null, null, null, {rank : 05}),
      sne : sync.newValue("Sneak", null, null, null, {rank : 10}),
      spo : sync.newValue("Spot Hidden", null, null, null, {rank : 25}),
      swi : sync.newValue("Swim", null, null, null, {rank : 25}),
      thr : sync.newValue("Throw", null, null, null, {rank : 25}),
      tra : sync.newValue("Track", null, null, null, {rank : 10}),
      fhand : sync.newValue("Hand Gun", null, null, null, {rank : 20}),
      fmach : sync.newValue("Machine Gun", null, null, null, {rank : 15}),
      frifl : sync.newValue("Rifle", null, null, null, {rank : 25}),
      fshot : sync.newValue("Shotgun", null, null, null, {rank : 30}),
      fsmg : sync.newValue("SMG", null, null, null, {rank : 15}),
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
              classes : "highlight outline",
              cond : "@threshold!=0&&@threshold>=@total",
              bottom : "'Success'", // change default
            }
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
    },
    sheet : {
      health : "counters.hp", //path to health
      style : {"background-image" : "url('/content/sheet1.png')", "background-size" : "cover", "box-shadow" : "inset 0em 0em 0.5em 0.5em rgba(0,0,0,0.2)"},
      content : {
        classes : "lpadding",
        display : [
          {classes : "flexrow flex padding", display : [
            {
              classes : "flexrow flexaround fit-x",
              display : [
                {
                  classes : "flexcolumn smooth outline flex white",
                  ui : "ui_image",
                  target : "info.img",
                  style : {"min-width" : "100px", "min-height" : "100px"},
                },
                {classes : "spadding"},
                {classes : "flexcolumn flex2 padding white outline smooth", display : [
                  {classes : "flexrow fit-x spadding",name : "", style : {"font-size" : "1.2em"}, target : "info.name", edit : {classes : "lrmargin line", style : {"-webkit-text-stroke-width" : "2px", "text-align" : "center"}}},
                  {classes : "flexrow spadding subtitle", display : [
                    {value : "@c.info.job.name", classes : "flexmiddle bold", style : {"width" : "120px"}},
                    {classes : "flexrow fit-x lrmargin", name : "", target : "info.race", edit : {classes : "lrmargin line"}},
                  ]},
                  {classes : "flexrow spadding subtitle", display : [
                    {value : "@c.info.edu.name", classes : "bold flexmiddle", style : {"width" : "120px"}},
                    {classes : "flexrow fit-x lrmargin", name : "", target : "info.career", edit : {classes : "lrmargin line"}},
                  ]},
                  {classes : "flexrow spadding subtitle", display : [
                    {value : "@c.info.birth.name", classes : "bold flexmiddle", style : {"width" : "120px"}},
                    {classes : "flexrow fit-x lrmargin", name : "", target : "info.spec", edit : {classes : "lrmargin line"}},
                  ]},
                  {classes : "flexrow flexbetween subtitle", display : [
                    {classes : "flexrow flexmiddle subtitle spadding smooth", target : "info.sex", edit : {classes : "line lrmargin", mod : "Starting", style : {width : "50px", "text-align" : "center"}}},
                    {classes : "flexrow flexmiddle subtitle spadding smooth", target : "info.age", edit : {classes : "line lrmargin", raw : "1", style : {width : "50px", "text-align" : "center"}}},
                  ]},
                ]},
                {classes : "spadding"},
                {classes : "flexcolumn flex2 padding white outline smooth", display : [
                  {classes : "flexrow flexbetween fit-x flexwrap spadding", target : "stats", applyUI : {
                    classes : "flexrow", display : {
                      classes : "flexrow middle lrpadding bold", style : {"width" : "30%"}, name : "@applyKey", target : "@applyTarget", edit : {classes : "lrmargin middle line", style : {"width" : "24px", "font-weight" : "normal"}},
                    }
                  }},
                  {classes : "flexrow flexmiddle subtitle", display : [
                    {classes : "lrpadding", target : "counters.mythos", edit : {classes : "line middle", style : {"width" : "24px"}}},
                    {classes : "lrpadding", target : "counters.dmg", edit : {classes : "line middle", style : {"width" : "24px"}}},
                  ]}
                ]}
              ]
            },
          ]},
          {classes : "flexrow flexaround flex padding white outline smooth", display : [
            {classes : "lrpadding", target : "counters.hp", edit : {classes : "line middle", style : {"width" : "24px"}}},
            {classes : "lrpadding", target : "counters.sp", edit : {classes : "line middle", style : {"width" : "24px"}}},
            {classes : "lrpadding", target : "counters.mp", edit : {classes : "line middle", style : {"width" : "24px"}}},
          ]},
          {classes : "flexrow flex padding", display : [
            {classes : "flexcolumn", display : [
              {classes : "flexrow flexmiddle underline bold", style : {"font-size" : "1.4em"}, display : [
                {name : "Skills"},
                {
                  classes : "bold flexmiddle create subtitle lrmargin",
                  style : {"cursor" : "pointer"},
                  icon : "plus",
                  click : {create : "skills"}
                }
              ]},
              {
                classes : "flexcolumn flex padding white outline smooth",
                ui : "ui_skillList",
                scope : {
                  lookup : "skills",
                  applyUI : {
                    classes : "flexrow flexaround flex subtitle smooth", display : [
                      {classes : "flexrow flexmiddle", display : [
                        {title : "Trained?", target : "skills.@skillKey", ui : "ui_checkbox", scope : {saveInto : "skills.@skillKey", cond : "R@c.skills.@skillKey==1", checked : "1", unchecked : "0"}},
                        {value : "@c.skills.@skillKey.name", style : {"width" : "150px", "text-align" : "left"}, title : "@skillKey", classes : "lrpadding bold subtitle"},
                        {cond : "R@c.skills.@skillKey<1", name : "", title : "Rank Modifier", target : "skills.@skillKey", edit : {disabled : true, classes : "line middle lrmargin", mod : "rank", style : {"width" : "50px", "border-color" : "transparent"}}},
                        {cond : "R@c.skills.@skillKey>0", name : "", title : "Rank Modifier", target : "skills.@skillKey", edit : {classes : "line middle lrmargin", mod : "rank", style : {"width" : "50px"}}},
                        {classes : "flexmiddle", ui : "ui_link", scope : {classes : "flexmiddle", icon : "'list-alt'", click : "ui_modifiers", lookup : "skills.@skillKey", attr : {"modsOnly" : true}}},
                        {classes : "lrpadding bold white outline smooth hover2 flexmiddle", style : {"min-width" : "40px", "margin-left" : "4px"},
                          value : "@:int(M@c.skills.@skillKey.modifiers.rank)+'%'",
                          click : {action : "Test", options : {"threshold" : "M@c.skills.@skillKey"}}
                        },
                      ]},
                    ]
                  }
                }
              },
            ]},
            {classes : "spadding"},
            {classes : "flexcolumn flex", display : [
              {classes : "flexrow flexmiddle underline", style : {"font-size" : "1.4em"}, display : [
                {classes : "bold", name : "Inventory"},
                {
                  classes : "bold flexmiddle create subtitle lrmargin",
                  style : {"cursor" : "pointer"},
                  icon : "plus",
                  click : {create : "inventory"}
                }
              ]},
              {classes : "flexrow flexmiddle", display : [
                {classes : "bold subtitle middle lrmargin", name : "Quantity"},
                {classes : "bold subtitle flex middle lrmargin", name : "Weapon"},
                {classes : "bold subtitle middle lrmargin", name : "%", style : {"width" : "24px"}},
                {classes : "bold subtitle lrmargin", name : "dmg"},
                {classes : "bold subtitle lrmargin", name : "malf"},
                {classes : "bold subtitle", name : "shots"},
                {classes : "bold subtitle lrmargin", name : "hp"},
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
                classes : "flex spadding white outline smooth",
                style : {"text-align" : "left", 'max-height' : "200px", "overflow-y" : "auto"},
                scrl : "inv",
                ui : "ui_entryList",
                scope : {
                  drop : "inventoryDrop",
                  connectWith : ".inventoryDrop",
                  reposition : true,
                  lookup : "inventory",
                  applyUI : {classes : "flexrow flex subtitle", display : [
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
                    {classes : "bold hover2 white outline smooth flexmiddle spadding subtitle", style : {"width" : "30px"},
                      title : "Roll", cond : "(@c.@applyTarget.weapon.%!=0)",
                      value : "@:int(@c.@applyTarget.weapon.per)+'%'",
                      click : {action : "Normal Check", options : {"bonus" : "@c.@applyTarget.weapon.per"}}
                    },
                    {name : "", target : "@applyTarget.weapon.per", edit : {classes : "lrmargin line middle", title : "%", style : {"width" : "18px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.damage", edit : {classes : "lrmargin line middle",title : "Damage", style : {"width" : "24px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.malf", edit : {classes : "lrmargin line middle",title : "Malf", style : {"width" : "24px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.shots", edit : {classes : "lrmargin line middle",title : "Shots", style : {"width" : "18px"}, raw : "1"}},
                    {name : "", target : "@applyTarget.weapon.hp", edit : {classes : "lrmargin line middle",title : "HP", style : {"width" : "18px"}, raw : "1"}},
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
              {classes : "spadding"},
              {
                classes : "flexcolumn flex",
                apps : ["ui_characterNotes"],
                scope : {noPadding : "true"}
              },
            ]}
          ]},
        ]
      },
      calc : [
        // everytime an update happens this is applied
        {target : "stats.Idea", eq : "@Int*5"},
        {target : "stats.Luck", eq : "@Pow*5"},
        {target : "stats.Know", eq : "@Edu*5"},
      ],
      rules : {
        "baseArmor" : sync.newValue("Armor", "@pow"),
      },
    },
  },
  page : {
    _t : "p",
    info : {
      name : sync.newValue("Name", "Default Page"),
      img : sync.newValue("Page Art"),
      notes : sync.newValue("Page Notes", null, null, null, {"style" : {"background-image" : "url('/content/sheet2.png')", "background-size" : "100% auto"}}),
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
