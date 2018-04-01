function ogg_import(xml, override) {
  searchObj = {};
  searchObj["Skills"] = function(src, output) {

    var skillKeys = {
      "RANGHVY" : "raH",
      "RANGLT" : "raL",
      "SW" : "str",
      "LTSABER" : "lig",
      "PILOTSP" : "pls",
      "PILOTPL" : "plp",
    }

    src = src.CharSkill;

    for (var key in src) {
      // each skill
      var current = 0;
      var mods = {};

      if (src[key]["isCareer"] && src[key]["isCareer"]["#text"]) {
        current = 1;
      }
      if (src[key]["Rank"]) {
        for (var rIndex in src[key]["Rank"]) {
          if (rIndex != "#text") {
            if (rIndex == "PurchasedRanks") {
              mods["rank"] = (mods["ranks"] || 0) + parseInt(src[key]["Rank"][rIndex]["#text"] || 0);
            }
            else if (rIndex != "NonCareerRanks") {
              mods[rIndex] = (mods[rIndex] || 0) + parseInt(src[key]["Rank"][rIndex]["#text"] || 0);
            }
          }
        }
      }
      if (src[key]["Key"] && src[key]["Key"]["#text"] != null) {
        if (src[key]["Key"]["#text"].length > 2 && !skillKeys[src[key]["Key"]["#text"]]) {
          var matched = false;
          for (var i in output.skills) {
            if (output.skills[i].name.toLowerCase().match(src[key]["Key"]["#text"].toLowerCase())) {
              output.skills[i].current = current;
              output.skills[i].modifiers = mods;
              matched = true;
              break;
            }
          }
          if (!matched) {
            output.skills[src[key]["Key"]["#text"]] = output.skills[src[key]["Key"]["#text"]] || sync.newValue(src[key]["Key"]["#text"], current, null, null, mods);
          }
        }
        else {
          output.skills[skillKeys[src[key]["Key"]["#text"]]].current = current;
          output.skills[skillKeys[src[key]["Key"]["#text"]]].modifiers = mods;
        }
      }
      else {
        var skillVal = sync.newValue(src[key]["Key"]["#text"], current, null, null, mods);
        output.skills[src[key]["Key"]["#text"]] = (skillVal);
      }
    }
  };

  searchObj["Career"] = function(src, output) {
    var current;
    var mods = {};
    if (src["CareerKey"]) {
      current = src["CareerKey"]["#text"];
    }
    if (src["StartingSpecKey"]) {
      current = current + " - " + src["StartingSpecKey"]["#text"];
    }
    output.info.career.current = current;
  };

  searchObj["Experience"] = function(src, output) {
    var current;
    var mods = {};
    for (var key in src["ExperienceRanks"]) {
      // each additon
      if (src["ExperienceRanks"][key]) {
        mods[key] = parseInt(src["ExperienceRanks"][key]["#text"] || 0);
      }
    }
    output.counters.exp.modifiers = mods;
    for (var key in src["UsedExperience"]) {
      // each additon
      if (src["UsedExperience"][key]) {
        current = (current || 0) + parseInt(src["UsedExperience"][key]["#text"] || 0);
      }
    }
    output.counters.exp.current = current;
  };

  searchObj["Characteristics"] = function(src, output) {
    for (var key in src["CharCharacteristic"]) {
      var statData = src["CharCharacteristic"][key];
      if (statData) {
        var stat = statData["Key"]["#text"].charAt(0) + statData["Key"]["#text"].substring(1,statData["Key"]["#text"].length).toLowerCase();

        var current = 0;
        var mods = {};
        var rank = statData["Rank"];
        if (!output.stats[stat]) {
          for (var statIndex in output.stats) {
            if (output.stats[statIndex].name == statData["Name"]["#text"]) {
            stat = statIndex;
              break;
            }
          }
        }
        for (var rIndex in rank) {
          if (rank[rIndex] && rank[rIndex]["#text"]) {
            if (!current) {
              current = parseInt(rank[rIndex]["#text"]);
            }
            else {
              mods[rIndex] = parseInt(rank[rIndex]["#text"]);
            }
          }
        }
        output.stats[stat].current = current;
        output.stats[stat].modifiers = mods;
      }
    }
  };
  searchObj["Species"] = function(src, output) {
    if (src["SpeciesKey"]) {
      output.info.race.current = src["SpeciesKey"]["#text"];
    }
  };
  searchObj["Description"] = function(src, output) {
    output.info.notes.current = '<h2 style="margin: 0; font-size: 1.4em; font-weight: bold;" data-mce-style="margin: 0; font-size: 1.4em; font-weight: bold;">Description</h2><hr style="display: block; width: 100%; height: 1px; background-color: grey; margin-top: 0px; margin-bottom: 0.5em;" data-mce-style="display: block; width: 100%; height: 1px; background-color: grey; margin-top: 0px; margin-bottom: 0.5em;">';
    if (src["CharName"]) {
      output.info.name.current = src["CharName"]["#text"];
    }
    for (var index in src) {
      if (index != "CharName" && src[index] && src[index]["#text"]) {
        output.info.notes.current = (output.info.notes.current || "") + "<p><b>"+index + "&nbsp;-&nbsp;</b>" + src[index]["#text"] + "</p>";
      }
    }
  };
  searchObj["Credits"] = function(src, output) {
    if (src["#text"]) {
      var item = JSON.parse(JSON.stringify(game.templates.item));
      sync.rawVal(item.info.name, "Credits");
      sync.rawVal(item.info.quantity, parseInt(src["#text"]));
    }
  };

  searchObj["Specializations"] = function(src, output) {
    var obj = {
      "ADV" : "Adversary",
      "ANAT" : "Anatomy Lessons",
      "ALLTERDRIV" : "All-Terrain Driver",
      "ARM" : "Armor Master",
      "ARMIMP" : "Armor Master (Improved)",
      "BACT" : "Bacta Specialist",
      "BADM" : "Bad Motivator",
      "BAL" : "Balance",
      "BAR" : "Barrage",
      "BASICTRAIN" : "Basic Combat Training",
      "BLA" : "Black Market Contacts",
      "BLO" : "Blooded",
      "BOD" : "Body Guard",
      "BOUGHT" : "Bought Info",
      "BRA" : "Brace",
      "BRI" : "Brilliant Evasion",
      "BYP" : "Bypass Security",
      "CAREPLAN" : "Careful Planning",
      "CLEVERSOLN" : "Clever Solution",
      "COD" : "Codebreaker",
      "COM" : "Command",
      "COMMPRES" : "Commanding Presence",
      "CONF" : "Confidence",
      "CONT" : "Contraption",
      "CONV" : "Convincing Demeanor",
      "COORDASS" : "Coordinated Assault",
      "CREATKILL" : "Creative Killer",
      "CRIPV" : "Crippling Blow",
      "DEAD" : "Dead to Rights",
      "DEADIMP" : "Dead to Rights (Improved)",
      "DEADACC" : "Deadly Accuracy",
      "DEPSHOT" : "Debilitating Shot",
      "DEDI" : "Dedication",
      "DEFDRI" : "Defensive Driving",
      "DEFSLI" : "Defensive Slicing",
      "DEFSLIIMP" : "Defensive Slicing (Improved)",
      "DEFSTA" : "Defensive Stance",
      "DISOR" : "Disorient",
      "DODGE" : "Dodge",
      "DURA" : "Durable",
      "DYNFIRE" : "Dynamic Fire",
      "ENDUR" : "Enduring",
      "EXHPORT" : "Exhaust Port",
      "EXTRACK" : "Expert Tracker",
      "FAMSUNS" : "Familiar Suns",
      "FERSTR" : "Feral Strength",
      "FLDCOMM" : "Field Commander",
      "FLDCOMMIMP" : "Field Commander (Improved)",
      "FINETUN" : "Fine Tuning",
      "FIRECON" : "Fire Control",
      "FORAG" : "Forager",
      "FORCEWILL" : "Force of Will",
      "FORCERAT" : "Force Rating",
      "FORMONME" : "Form On Me",
      "FRENZ" : "Frenzied Attack",
      "FULLSTOP" : "Full Stop",
      "FULLTH" : "Full Throttle",
      "FULLTHIMP" : "Full Throttle (Improved)",
      "FULLTHSUP" : "Full Throttle (Supreme)",
      "GALMAP" : "Galaxy Mapper",
      "GEARHD" : "Gearhead",
      "GREASE" : "Greased Palms",
      "GRIT" : "Grit",
      "HARDHD" : "Hard Headed",
      "HARDHDIMP" : "Hard Headed (Improved)",
      "HEIGHT" : "Heightened Awareness",
      "HERO" : "Heroic Fortitude",
      "HIDD" : "Hidden Storage",
      "HOLDTOG" : "Hold Together",
      "HUNT" : "Hunter",
      "INCITE" : "Incite Rebellion",
      "INDIS" : "Indistinguishable",
      "INSIGHT" : "Insight",
      "INSPRHET" : "Inspiring Rhetoric",
      "INSPRHETIMP" : "Inspiring Rhetoric (Improved)",
      "INSPRHETSUP" : "Inspiring Rhetoric (Supreme)",
      "INTENSFOC" : "Intense Focus",
      "INTENSPRE" : "Intense Presence",
      "INTIM" : "Intimidating",
      "INVENT" : "Inventor",
      "INVIG" : "Invigorate",
      "ITSNOTTHATBAD" : "It's Not that Bad",
      "JUMP" : "Jump Up",
      "JURY" : "Jury Rigged",
      "KILL" : "Kill With Kindness",
      "KNOCK" : "Knockdown",
      "KNOWSOM" : "Know Somebody",
      "KNOWSPEC" : "Knowledge Specialization",
      "KNOWSCH" : "Known Schematic",
      "LETSRIDE" : "Let's Ride",
      "LETHALBL" : "Lethal Blows",
      "MASDOC" : "Master Doctor",
      "MASDRIV" : "Master Driver",
      "MASGREN" : "Master Grenadier",
      "MASLEAD" : "Master Leader",
      "MASMERC" : "Master Merchant",
      "MASSHAD" : "Master of Shadows",
      "MASPIL" : "Master Pilot",
      "MASSLIC" : "Master Slicer",
      "MASSTAR" : "Master Starhopper",
      "MENTFOR" : "Mental Fortress",
      "NATBRAW" : "Natural Brawler",
      "NATCHARM" : "Natural Charmer",
      "NATDOC" : "Natural Doctor",
      "NATDRIV" : "Natural Driver",
      "NATENF" : "Natural Enforcer",
      "NATHUN" : "Natural Hunter",
      "NATLEAD" : "Natural Leader",
      "NATMAR" : "Natural Marksman",
      "NATNEG" : "Natural Negotiator",
      "NATOUT" : "Natural Outdoorsman",
      "NATPIL" : "Natural Pilot",
      "NATPRO" : "Natural Programmer",
      "NATROG" : "Natural Rogue",
      "NATSCH" : "Natural Scholar",
      "NATTIN" : "Natural Tinkerer",
      "NOBFOOL" : "Nobody's Fool",
      "OUTDOOR" : "Outdoorsman",
      "OVEREM" : "Overwhelm Emotions",
      "OVERDEF" : "Overwhelm Defenses",
      "PHYSTRAIN" : "Physical Training",
      "PLAUSDEN" : "Plausible Deniability",
      "POINTBL" : "Point Blank",
      "PWRBLST" : "Powerful Blast",
      "PRECAIM" : "Precise Aim",
      "PRESPNT" : "Pressure Point",
      "QUICKDR" : "Quick Draw",
      "QUICKFIX" : "Quick Fix",
      "QUICKST" : "Quick Strike",
      "RAPREA" : "Rapid Reaction",
      "RAPREC" : "Rapid Recovery",
      "REDUNSYS" : "Redundant Systems",
      "RESEARCH" : "Researcher",
      "RESOLVE" : "Resolve",
      "RESPSCHOL" : "Respected Scholar",
      "SCATH" : "Scathing Tirade",
      "SCATHIMP" : "Scathing Tirade (Improved)",
      "SCATHSUP" : "Scathing Tirade (Supreme)",
      "SECWIND" : "Second Wind",
      "SELDETON" : "Selective Detonation",
      "SENSDANG" : "Sense Danger",
      "SENSDEMO" : "Sense Emotions",
      "SHORTCUT" : "Short Cut",
      "SIDESTEP" : "Side Step",
      "SITAWARE" : "Situational Awareness",
      "SIXSENSE" : "Sixth Sense",
      "SKILLJOCK" : "Skilled Jockey",
      "SKILLSLIC" : "Skilled Slicer",
      "SLEIGHTMIND" : "Sleight of Mind",
      "SMOOTHTALK" : "Smooth Talker",
      "SNIPSHOT" : "Sniper Shot",
      "SOFTSP" : "Soft Spot",
      "SOLREP" : "Solid Repairs",
      "SOUNDINV" : "Sound Investments",
      "SPARECL" : "Spare Clip",
      "SPKBIN" : "Speaks Binary",
      "STALK" : "Stalker",
      "STNERV" : "Steely Nerves",
      "STIMAP" : "Stim Application",
      "STIMAPIMP" : "Stim Application (Improved)",
      "STIMAPSUP" : "Stim Application (Supreme)",
      "STIMSPEC" : "Stimpack Specialization",
      "STRSMART" : "Street Smarts",
      "STRGEN" : "Stroke of Genius",
      "STRONG" : "Strong Arm",
      "STUNBL" : "Stunning Blow",
      "STUNBLIMP" : "Stunning Blow (Improved)",
      "SUPREF" : "Superior Reflexes",
      "SURG" : "Surgeon",
      "SWIFT" : "Swift",
      "TACTTRAIN" : "Tactical Combat Training",
      "TARGBL" : "Targeted Blow",
      "TECHAPT" : "Technical Aptitude",
      "TIME2GO" : "Time to Go",
      "TIME2GOIMP" : "Time to Go (Improved)",
      "TINK" : "Tinkerer",
      "TOUCH" : "Touch of Fate",
      "TOUGH" : "Toughened",
      "TRICK" : "Tricky Target",
      "TRUEAIM" : "True Aim",
      "UNCANREAC" : "Uncanny Reactions",
      "UNCANSENS" : "Uncanny Senses",
      "UNSTOP" : "Unstoppable",
      "UTIL" : "Utility Belt",
      "UTINNI" : "Utinni!",
      "VEHTRAIN" : "Vehicle Combat Training",
      "WELLROUND" : "Well Rounded",
      "WELLTRAV" : "Well Travelled",
      "WHEEL" : "Wheel and Deal",
      "WORKLIKECHARM" : "Works Like A Charm",
      "PIN" : "Pin",
      "MUSEUMWORTHY" : "Museum Worthy",
      "BRNGITDWN" : "Bring It Down",
      "HUNTERQUARRY" : "Hunter's Quarry",
      "HUNTQIMP" : "Hunter's Quarry (Improved)",
      "BURLY" : "Burly",
      "FEARSOME" : "Fearsome",
      "HEAVYHITTER" : "Heavy Hitter",
      "HEROICRES" : "Heroic Resilience",
      "IMPDET" : "Improvised Detonation",
      "IMPDETIMP" : "Improvised Detonation (Improved)",
      "LOOM" : "Loom",
      "RAINDEATH" : "Rain of Death",
      "STEADYNERVES" : "Steady Nerves",
      "TALKTALK" : "Talk the Talk",
      "WALKWALK" : "Walk the Walk",
      "IDEALIST" : "Idealist",
      "AAO" : "Against All Odds",
      "ANIMALBOND" : "Animal Bond",
      "ANIMALEMP" : "Animal Empathy",
      "ATARU" : "Ataru Technique",
      "BODIMP" : "Body Guard (Improved)",
      "CALMAURA" : "Calming Aura",
      "CALMAURAIMP" : "Calming Aura (Improved)",
      "CENTBEING" : "Center of Being",
      "CENTBEINGIMP" : "Center of Being (Improved)",
      "CIRCLESHELTER" : "Circle of Shelter",
      "COMPTECH" : "Comprehend Technology",
      "CONDITIONED" : "Conditioned",
      "CONTPLAN" : "Contingency Plan",
      "COUNTERST" : "Counterstrike",
      "DEFCIRCLE" : "Defensive Circle",
      "DEFTRAIN" : "Defensive Training",
      "DISRUPSTRIKE" : "Disruptive Strike",
      "DJEMSODEFL" : "Djem So Deflection",
      "DRAWCLOSER" : "Draw Closer",
      "DUELTRAIN" : "Duelist's Training",
      "ENHLEAD" : "Enhanced Leader",
      "FALLAVAL" : "Falling Avalanche",
      "FEINT" : "Feint",
      "FORCEASSAULT" : "Force Assault",
      "FORCEPROT" : "Force Protection",
      "FOREWARN" : "Forewarning",
      "HAWKSWOOP" : "Hawk Bat Swoop",
      "HEALTRANCE" : "Healing Trance",
      "HEALTRANCEIMP" : "Healing Trance (Improved)",
      "IMBUEITEM" : "Imbue Item",
      "INTUITEVA" : "Intuitive Evasion",
      "INTUITIMP" : "Intuitive Improvements",
      "INTUITSHOT" : "Intuitive Shot",
      "INTUITSTRIKE" : "Intuitive Strike",
      "KEENEYED" : "Keen Eyed",
      "KNOWPOW" : "Knowledge is Power",
      "KNOWHEAL" : "Knowledgeable Healing",
      "MAKFIN" : "Makashi Finish",
      "MAKFLOUR" : "Makashi Flourish",
      "MAKTECH" : "Makashi Technique",
      "MASTART" : "Master Artisan",
      "MENTBOND" : "Mental Bond",
      "MENTTOOLS" : "Mental Tools",
      "MULTOPP" : "Multiple Opponents",
      "NATBLADE" : "Natural Blademaster",
      "NATMYSTIC" : "Natural Mystic",
      "NIMTECH" : "Niman Technique",
      "NOWYOUSEE" : "Now You See Me",
      "ONEUNI" : "One With The Universe",
      "PARRY" : "Parry",
      "PARRYIMP" : "Parry (Improved)",
      "PARRYSUP" : "Parry (Supreme)",
      "PHYSICIAN" : "Physician",
      "PREEMAVOID" : "Preemptive Avoidance",
      "PREYWEAK" : "Prey on the Weak",
      "QUICKMOVE" : "Quick Movement",
      "REFLECT" : "Reflect",
      "REFLECTIMP" : "Reflect (Improved)",
      "REFLECTSUP" : "Reflect (Supreme)",
      "RESDISARM" : "Resist Disarm",
      "SABERSW" : "Saber Swarm",
      "SABERTHROW" : "Saber Throw",
      "SARSWEEP" : "Sarlacc Sweep",
      "SENSEADV" : "Sense Advantage",
      "SHAREPAIN" : "Share Pain",
      "SHIENTECH" : "Shien Technique",
      "SHROUD" : "Shroud",
      "SLIPMIND" : "Slippery Minded",
      "SORESUTECH" : "Soresu Technique",
      "STRATFORM" : "Strategic Form",
      "SUMDJEM" : "Sum Djem",
      "TERRIFY" : "Terrify",
      "TERRIFYIMP" : "Terrify (Improved)",
      "FORCEALLY" : "The Force Is My Ally",
      "UNITYASSAULT" : "Unity Assault",
      "VALFACT" : "Valuable Facts",
      "BADCOP" : "Bad Cop",
      "BIGGESTFAN" : "Biggest Fan",
      "CONGENIAL" : "Congenial",
      "COORDODGE" : "Coordination Dodge",
      "DISBEH" : "Distracting Behavior",
      "DISBEHIMP" : "Distracting Behavior (Improved)",
      "DECEPTAUNT" : "Deceptive Taunt",
      "GOODCOP" : "Good Cop",
      "NATATHL" : "Natural Athlete",
      "NATMERCH" : "Natural Merchant",
      "THROWCRED" : "Throwing Credits",
      "UNRELSKEP" : "Unrelenting Skeptic",
      "UNRELSKEPIMP" : "Unrelenting Skeptic (Improved)",
      "BEASTWRANG" : "Beast Wrangler",
      "BOLSTARMOR" : "Bolstered Armor",
      "CORSEND" : "Corellian Sendoff",
      "CORSENDIMP" : "Corellian Sendoff (Improved)",
      "CUSTCOOL" : "Customized Cooling Unit",
      "EXHANDLER" : "Expert Handler",
      "FANCPAINT" : "Fancy Paint Job",
      "FORTVAC" : "Fortified Vacuum Seal",
      "HIGHGTRAIN" : "High-G Training",
      "KOITURN" : "Koiogran Turn",
      "LARGEPROJ" : "Larger Project",
      "NOTTODAY" : "Not Today",
      "OVERAMMO" : "Overstocked Ammo",
      "REINFRAME" : "Reinforced Frame",
      "SHOWBOAT" : "Showboat",
      "SIGVEH" : "Signature Vehicle",
      "SOOTHTONE" : "Soothing Tone",
      "SPUR" : "Spur",
      "SPURIMP" : "Spur (Improved)",
      "SPURSUP" : "Spur (Supreme)",
      "TUNEDTHRUST" : "Tuned Maneuvering Thrusters",
      "CALLEM" : "Call 'Em",
      "DISARMSMILE" : "Disarming Smile",
      "DONTSHOOT" : "Don't Shoot!",
      "DOUBLEORNOTHING" : "Double or Nothing",
      "DOUBLEORNOTHINGIMP" : "Double or Nothing (Improved)",
      "DOUBLEORNOTHINGSUP" : "Double or Nothing (Supreme)",
      "FORTFAVORBOLD" : "Fortune Favors the Bold",
      "GUNSBLAZING" : "Guns Blazing",
      "JUSTKID" : "Just Kidding!",
      "QUICKDRIMP" : "Quickdraw (Improved)",
      "SECCHANCE" : "Second Chances",
      "SORRYMESS" : "Sorry About the Mess",
      "SPITFIRE" : "Spitfire",
      "UPANTE" : "Up the Ante",
      "WORKLIKECHARM" : "Works Like a Charm",
      "BADPRESS" : "Bad Press",
      "BLACKMAIL" : "Blackmail",
      "CUTQUEST" : "Cutting Question",
      "DISCREDIT" : "Discredit",
      "ENCCOMM" : "Encoded Communique",
      "ENCWORD" : "Encouraging Words",
      "INKNOW" : "In The Know",
      "INKNOWIMP" : "In The Know (Improved)",
      "INFORM" : "Informant",
      "INTERJECT" : "Interjection",
      "KNOWALL" : "Know-It-All",
      "PLAUSDENIMP" : "Plausible Deniability (Improved)",
      "POSSPIN" : "Positive Spin",
      "POSSPINIMP" : "Positive Spin (Improved)",
      "RESEARCHIMP" : "Researcher (Improved)",
      "SUPPEVI" : "Supporting Evidence",
      "THORASS" : "Thorough Assessment",
      "TWISTWORD" : "Twisted Words",
      "DRIVEBACK" : "Drive Back",
      "ARMSUP" : "Armor Master (Supreme)",
      "BALEGAZE" : "Baleful Gaze",
      "BLINDSPOT" : "Blind Spot",
      "GRAPPLE" : "Grapple",
      "NOESC" : "No Escape",
      "OVERBAL" : "Overbalance",
      "PRECSTR" : "Precision Strike",
      "PRIMEPOS" : "Prime Positions",
      "PRESSHOT" : "Prescient Shot",
      "PROPAIM" : "Prophetic Aim",
      "REINITEM" : "Reinforce Item",
      "SUPPRFIRE" : "Suppressing Fire",
      "CALMCOMM" : "Calm Commander",
      "CLEVCOMM" : "Clever Commander",
      "COMMPRESIMP" : "Commanding Presence (Improved)",
      "CONFIMP" : "Confidence (Improved)",
      "MASINST" : "Master Instructor",
      "MASSTRAT" : "Master Strategist",
      "NATINST" : "Natural Instructor",
      "READANY" : "Ready for Anything",
      "READANYIMP" : "Ready for Anything (Improved)",
      "THATHOWDONE" : "That's How It's Done",
      "WELLREAD" : "Well Read",
      "CUSTLOAD" : "Custom Loadout",
      "CYBERNETICIST" : "Cyberneticist",
      "DEFTMAKER" : "Deft Maker",
      "ENGREDUN" : "Engineered Redundancies",
      "EYEDET" : "Eye for Detail",
      "ENERGTRANS" : "Energy Transfer",
      "MACHMEND" : "Machine Mender",
      "MOREMACH" : "More Machine Than Man",
      "OVERCHARGE" : "Overcharge",
      "OVERCHARGEIMP" : "Improved Overcharge",
      "OVERCHARGESUP" : "Supreme Overcharge",
      "REROUTEPROC" : "Reroute Processors",
      "RESOURCEREFIT" : "Resourceful Refit",
      "SPKBINIMP" : "Improved Speaks Binary",
      "SPKBINSUP" : "Supreme Speaks Binary",
    }

    var charSpec = src["CharSpecialization"];
    for (var _ in charSpec["Talents"]) {
      for (var index in charSpec["Talents"][_]) {
        var charTalent = charSpec["Talents"][_][index];
        if (charTalent["Key"] && charTalent["Key"]["#text"]) {
          var selected = "";
          if (charTalent["SelectedSkills"]) {
            for (var key in charTalent["SelectedSkills"]) {
              if (charTalent["SelectedSkills"][key] && charTalent["SelectedSkills"][key]["#text"]) {
                if (skillRef[charTalent["SelectedSkills"][key]["#text"]]) {
                  selected = selected + game.templates.character.skills[skillRef[charTalent["SelectedSkills"][key]["#text"]]].name + "\n";
                }
                else {
                  selected = selected + charTalent["SelectedSkills"][key]["#text"] + "\n";
                }
              }
            }
          }
          if (charTalent["Purchased"]) {
            var insert = true;
            for (var tIndex in output.talents) {
              if (output.talents[tIndex].name == obj[charTalent["Key"]["#text"]]) {
                output.talents[tIndex] = sync.newValue(obj[charTalent["Key"]["#text"]], selected, null, null, {"rank" : "Spec Tree - " + charSpec["Name"]["#text"]});
                insert = false;
                break;
              }
            }
            if (insert) {
              output.talents[obj[charTalent["Key"]["#text"]]] = sync.newValue(obj[charTalent["Key"]["#text"]], selected, null, null, {"rank" : "Spec Tree - " + charSpec["Name"]["#text"]});
            }
          }
        }
      }
    }
  }

  searchObj["Attributes"] = function(src, output) {
    var wTotal = 0;
    for (var key in src["WoundThreshold"]) {
      if (src["WoundThreshold"][key] && src["WoundThreshold"][key]["#text"]) {
        wTotal = parseInt(wTotal) + parseInt(src["WoundThreshold"][key]["#text"]);
      }
    }
    output.counters.wounds.current = wTotal;
    output.counters.wounds.max = wTotal;

    var sTotal = 0;
    for (var key in src["StrainThreshold"]) {
      if (src["StrainThreshold"][key] && src["StrainThreshold"][key]["#text"]) {
        sTotal = parseInt(sTotal) + parseInt(src["StrainThreshold"][key]["#text"]);
      }
    }
    output.counters.stress.current = sTotal;
    output.counters.stress.max = sTotal;

    if (src["DefenseRanged"]) {
      output.counters.rdf.current = parseInt(src["DefenseRanged"]["#text"] || 0);
    }
    if (src["DefenseMelee"]) {
      output.counters.mdf.current = parseInt(["DefenseMelee"]["#text"] || 0);
    }
  }

  var weapon = {
    "BLASTHOLD" : {name : "Holdout Blaster", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "BLASTHOLDTT24" : {name : "TT24 Holdout Blaster", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "MILHOLDBLAST" : {name : "Military Holdout Blaster", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "VARHOLDBLAST" : {name : "Variable Holdout Blaster", d : 7, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "QUICKFIRE" : {name : "Model Q4 Quickfire", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "12DEFEND" : {name : "12 Defender", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "DEFSPBLAST" : {name : "Defender Sporting Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "ELG3ABLAST" : {name : "ELG-3A Blaster Pistol", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "BLASTLT" : {name : "Light Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "BLASTLTHL27" : {name : "HL-27 Light Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "POCKPIS" : {name : "Pocket Blaster Pistol", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPIS" : {name : "Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISCDEF" : {name : "CDEF Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "BLASTPISK23" : {name : "Relby-K23 Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "DUELPIS" : {name : "Dueling Pistol", d : 9, r : "wrShort", s : "Ranged - Light (Ag)", c : "2"},
    "BLASTPISXL2" : {name : "XL-2 'Flashfire' Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISH7" : {name : "H-7 'Equalizer' Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "2"},
    "BLASTPISDR45" : {name : "DR-45 'Dragoon' Cavalry Blaster", d : 8, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTCARBDR45" : {name : "DR-45 'Dragoon' Cavalry Blaster (Carbine Mode)", d : 8, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTBOONTA" : {name : "Boonta Blaster", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTATAPULSE" : {name : "Greff-Timms ATA Pulse-Wave Blaster", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISHVY" : {name : "Heavy Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISHVYGEO" : {name : "Geonosian Heavy Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "2"},
    "SECURITYS5" : {name : "Security S-5 Heavy Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "KO-2HSP" : {name : "KO-2 Heavy Stun Pistol", d : 8, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "MODEL44BLASTPIST" : {name : "Model 44 Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "MODEL80BLASTPIST" : {name : "Model 80 Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "2"},
    "IR5BLASTPIST" : {name : "IR-5 'Intimidator' Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISHVYCR2" : {name : "CR-2 Heavy Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "SITE145PISTOL" : {name : "Site-145 Replica Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "X30LANCER" : {name : "x-30 Lancer", d : 5, r : "wrLong", s : "Ranged - Light (Ag)", c : "4"},
    "BLASTPISTDL19C" : {name : "DL-19C Blaster Pistol", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "DL7HBLASTPISTHVY" : {name : "DL-7h Heavy Blaster Pistol", d : 8, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTPISHH50" : {name : "HH-50 Heavy Blaster Pistol", d : 7, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "MONCALBAT" : {name : "Mon Calamari Battle Baton", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "ENSLING" : {name : "Energy Slingshot", d : 3, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "BLASTCARB" : {name : "Blaster Carbine", d : 9, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTCARBGEO" : {name : "Geonosian Blaster Carbine", d : 9, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "2"},
    "OK98BLASTCARB" : {name : "OK-98 Blaster Carbine", d : 9, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTCARBE5" : {name : "E5 Blaster Carbine", d : 9, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BOLACARB" : {name : "Bola Carbine", d : 8, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "DLS12HBR" : {name : "DLS-12 Heavy Blaster Carbine", d : 10, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTRIF" : {name : "Blaster Rifle", d : 9, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTRIFGEO" : {name : "Geonosian Blaster Rifle", d : 9, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "BLASTRIFSKZ" : {name : "SKZ Sporting Blaster Rifle", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "4"},
    "BLASTLANCE" : {name : "Weequay Blaster Lance", d : 8, r : "wrExtreme", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTRIFDDCMR6" : {name : "DDC-MR6 Modular Rifle", d : 7, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "ACPREPEATER" : {name : "ACP Repeater Gun", d : 7, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "ACPARRAYGUN" : {name : "ACP Array Gun", d : 6, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "3"},
    "SWE2SONIC" : {name : "SWE/2 Sonic Rifle", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "6"},
    "BLASTRIFHVY" : {name : "Heavy Blaster Rifle", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "DHXBLASTRIFHVY" : {name : "DH-X Heavy Blaster Rifle", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "E11SNIPER" : {name : "E-11S Sniper Rifle", d : 10, r : "wrExtreme", s : "Ranged - Heavy (Ag)", c : "3"},
    "LBR9STUNRIFLE" : {name : "LBR-9 Stun Rifle", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "0"},
    "BLASTLTREP" : {name : "Light Repeating Blaster", d : 11, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "SE14RBLASTLTREP" : {name : "SE-14r Light Repeating Blaster", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "BLASTHVYREP" : {name : "Heavy Repeating Blaster", d : 15, r : "wrLong", s : "Gunnery (Ag)", c : "2"},
    "VXBLASTREP" : {name : "VX 'Sidewinder' Repeating Blaster", d : 12, r : "wrLong", s : "Gunnery (Ag)", c : "3"},
    "HOBBLASTREPHVY" : {name : "HOB Heavy Repeating Blaster", d : 15, r : "wrExtreme", s : "Gunnery (Ag)", c : "3"},
    "D29REPULSOR" : {name : "D-29 Repulsor Rifle", d : 8, r : "wrMedium", s : "Gunnery (Ag)", c : "4"},
    "MONCALSPBLAST" : {name : "Mon Calamari Spear Blaster (Blaster)", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "MONCALSPBLASTSP" : {name : "Mon Calamari Spear Blaster (Spear)", d : 8, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "ELECTPULSEDIS" : {name : "Electromag-Pulse Disruptor", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "BOWCAST" : {name : "Bowcaster", d : 10, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "BLASTION" : {name : "Ion Blaster", d : 10, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "DROIDDIS" : {name : "Droid Disruptor", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "DISRPIS" : {name : "Disruptor Pistol", d : 10, r : "wrShort", s : "Ranged - Light (Ag)", c : "2"},
    "DISRRIF" : {name : "Disruptor Rifle", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "SLUGPIS" : {name : "Slugthrower Pistol", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "SLUGPISASP9" : {name : "ASP-9 'Vrelt' Autopistol", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "FIVERSLUGPIST" : {name : "Model C 'Fiver' Pistol", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "SLUGKD30" : {name : "KD-30 'Dissuader' Pistol", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "STEALTH2VX" : {name : "Stealth-2VX Palm Shooter", d : 1, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "VODRANRIFLE" : {name : "Vodran Hunting Rifle", d : 7, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "4"},
    "SLUGRIF" : {name : "Slugthrower Rifle", d : 7, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "5"},
    "SLUGRIFMKV" : {name : "Mark V 'Sand Panther' Hunting Rifle", d : 7, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "5"},
    "ASSAULTSLUGCARB" : {name : "FYR Assault Carbine", d : 6, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "5"},
    "SLUGRIFSELSHARD" : {name : "Selonian Shard Shooter", d : 5, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "MODEL77" : {name : "Model 77 Air Rifle", d : 6, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "0"},
    "MODEL38" : {name : "Model 38 Sharpshooter's Rifle", d : 8, r : "wrExtreme", s : "Ranged - Heavy (Ag)", c : "3"},
    "MODEL38DET" : {name : "Model 38 Sharpshooter's Rifle (Detonator Round)", d : 8, r : "wrExtreme", s : "Ranged - Heavy (Ag)", c : "3"},
    "HAMMER" : {name : "KS-23 Hammer", d : 8, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "4"},
    "DFD1" : {name : "DF-D1 Duo-Flechette Rifle", d : 9, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "3"},
    "VERPSHATPIS" : {name : "Verpine Shatter Pistol", d : 8, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "VERPSHATRIF" : {name : "Verpine Shatter Rifle", d : 12, r : "wrExtreme", s : "Ranged - Heavy (Ag)", c : "3"},
    "VERPSHATHVYRIF" : {name : "Verpine Heavy Shatter Rifle", d : 15, r : "wrExtreme", s : "Gunnery (Ag)", c : "2"},
    "BOLA" : {name : "Bola/Net", d : 2, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "ELECTRONET" : {name : "Electronet", d : 6, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "FLAME" : {name : "Flame Projector", d : 8, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "2"},
    "MISS" : {name : "Missile Tube", d : 20, r : "wrExtreme", s : "Gunnery (Ag)", c : "2"},
    "L70ACID" : {name : "L70 Acid Projector", d : 6, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "2"},
    "NETGUN" : {name : "AO14 'Aranea' Net Gun", d : 3, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "0"},
    "STOKHLI" : {name : "Stokhli Spray Stick", d : 0, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "0"},
    "RIOTRIFLE" : {name : "R-88 Supressor Riot Rifle", d : 8, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "0"},
    "TANGLEGUN" : {name : "Tangle Gun", d : 1, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "4"},
    "FRAGGR" : {name : "Frag Grenade", d : 8, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "STUNGR" : {name : "Stun Grenade", d : 8, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "THERMDET" : {name : "Thermal Detonator", d : 20, r : "wrShort", s : "Ranged - Light (Ag)", c : "2"},
    "THERMDETMINI" : {name : "Mini Thermal Detonator", d : 12, r : "wrShort", s : "Ranged - Light (Ag)", c : "2"},
    "APGREN" : {name : "Armor Piercing Grenade", d : 13, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "N4NOISEGREN" : {name : "N-4 Noise Grenade", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "6"},
    "WIPE3GREN" : {name : "Wipe-3 Data-Purge Grenade", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "HICMERCYGREN" : {name : "HIC 'Mercy' Grenade", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "SPOREBSTUNGREN" : {name : "Spore/B Stun Grenade", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "AVMINE" : {name : "Anti-Vehicle Mine", d : 25, r : "wrEngaged", s : "Mechanics (Int)", c : "2"},
    "APMINE" : {name : "Anti-Personnel Mine", d : 12, r : "wrEngaged", s : "Mechanics (Int)", c : "3"},
    "KNOCKMINE" : {name : "Knockout Mine", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "GLOPGRND" : {name : "Glop Grenade", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "INFERGREND" : {name : "D-24 Inferno Grenade", d : 8, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "CONCGREND" : {name : "G2 Concussion Grenade", d : 10, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "IONGREND" : {name : "Lightning 22 Ion Grenade", d : 10, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "PLASGREND" : {name : "NOVA40 Plasma Grenade", d : 12, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "HVYFRGGREND" : {name : "Mk.4 Heavy Frag Grenade", d : 9, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "POISONGR" : {name : "Poison Gas Grenade", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "CONCMISSILEMK10" : {name : "Mk.10 Concussion Missile", d : 14, r : "wrExtreme", s : "Gunnery (Ag)", c : "4"},
    "FRAGMISSILEC88" : {name : "C-88 Fragmentation Missile", d : 12, r : "wrExtreme", s : "Gunnery (Ag)", c : "4"},
    "PLASMISSILESK44" : {name : "SK-44 Plasma Missile", d : 16, r : "wrMedium", s : "Gunnery (Ag)", c : "3"},
    "INCENMISSILEC908" : {name : "C-908 Incendiary Missile", d : 10, r : "wrExtreme", s : "Gunnery (Ag)", c : "3"},
    "BARADIUMCHRG" : {name : "Baradium Charge", d : 3, r : "wrLong", s : "Mechanics (Int)", c : "0"},
    "DETONITECHRG" : {name : "Detonite Charge", d : 15, r : "wrShort", s : "Mechanics (Int)", c : "0"},
    "PLASMACHRG" : {name : "Plasma Charge", d : 9, r : "wrMedium", s : "Mechanics (Int)", c : "0"},
    "PROTONGRNAD" : {name : "Proton Grenade", d : 10, r : "wrShort", s : "Mechanics (Int)", c : "0"},
    "COMPBOW" : {name : "Corellian Compound Bow", d : 5, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "5"},
    "COMPBOWEXP" : {name : "Corellian Compound Bow (Explosive Tipped)", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "COMPBOWSTUN" : {name : "Corellian Compound Bow (Stun)", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "0"},
    "STYANAX" : {name : "Styanax Lance", d : 8, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "3"},
    "CZ28FLAME" : {name : "CZ-28 Flamestrike", d : 9, r : "wrShort", s : "Gunnery (Ag)", c : "2"},
    "FC1FLECHETTE" : {name : "FC1 Flechette Launcher (Anti-Infantry)", d : 8, r : "wrMedium", s : "Gunnery (Ag)", c : "3"},
    "FC1FLECHETTEVEH" : {name : "FC1 Flechette Launcher (Anti-Vehicle)", d : 10, r : "wrMedium", s : "Gunnery (Ag)", c : "2"},
    "GRENADLAUNCHZ50" : {name : "Z50 Grenade Launcher", d : 8, r : "wrMedium", s : "Gunnery (Ag)", c : "4"},
    "MINTORPLAUNCH" : {name : "Mini-Torpedo Launcher", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "MINTORPAP" : {name : "Mini-Torpedo, Anti-Personnel", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "MINTORPARMP" : {name : "Mini-Torpedo, Armor Piercing", d : 12, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "MINTORPINK" : {name : "Mini-Torpedo, Ink", d : 0, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "0"},
    "MINTORPION" : {name : "Mini-Torpedo, Ion", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "MINTORPNET" : {name : "Mini-Torpedo, Net", d : 0, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "0"},
    "MINTORPSTUN" : {name : "Mini-Torpedo, Stun", d : 8, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "2"},
    "AURBOOM" : {name : "Aurateran Boomerang", d : 4, r : "wrMedium", s : "Ranged - Light (Ag)", c : "5"},
    "GUNGATL" : {name : "Gungan Atlatl", d : 5, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "GUNGPLAS" : {name : "Gungan Plasma Ball", d : 5, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "LONGBOW" : {name : "Long Bow", d : 5, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "5"},
    "BRASS" : {name : "Brass Knuckles", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "4"},
    "SHOCKGL" : {name : "Shock Gloves", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "5"},
    "REFCORTCAUNT" : {name : "Refined Cortosis Gauntlets", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "4"},
    "BLSTKNUK" : {name : "Blast Knuckles", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "4"},
    "VAMBLADES1" : {name : "S-1 Vamblade (Single)", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "3"},
    "VAMBLADE2S1" : {name : "S-1 Vamblade (Paired)", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "3"},
    "VIBROKNUK" : {name : "Vibroknucklers", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "2"},
    "BACKHANDSHKGLV" : {name : "Backhand Shock Gloves", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "3"},
    "NEEDLEGLOVES" : {name : "Needle Gloves", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "5"},
    "SHIELDGAUNT" : {name : "Shield Gauntlet", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "5"},
    "KNIFE" : {name : "Combat Knife", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "CUTLASSCOR" : {name : "Corellian Cutlass", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "LONGWHIP" : {name : "Longeing Whip", d : 0, r : "wrShort", s : "Melee (Br)", c : "5"},
    "PERSUADER" : {name : "Sorosuub 'Persuader' Shock Prod", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "CERBLADE" : {name : "Ceremonial Blade", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "STAFFOFF" : {name : "Staff of Office", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "ANCIENTSWORD" : {name : "Ancient Sword", d : 0, r : "wrEngaged", s : "LTSABER", c : "3"},
    "CORTSHIELD" : {name : "Cortosis Shield", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "CORTSWORD" : {name : "Cortosis Sword", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "ELECSTAFF" : {name : "Electrostaff", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "REFCORTSTAFF" : {name : "Refined Cortosis Staff", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "GAFF" : {name : "Gaffi Stick", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "FLASHSTICK" : {name : "Drall Flashstick", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "0"},
    "FORCEP" : {name : "Force Pike", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "DIIRO" : {name : "Diiro", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "CORALPIKE" : {name : "Coral Pike", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "ENERGYLANCE" : {name : "Energy Lance", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "CS12STUNMAST" : {name : "CS-12 Stun Master", d : 6, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "ENERGYBUCK" : {name : "Energy Buckler", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "PARRVIBRO" : {name : "Parrying Vibroblade", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "PARRDAGG" : {name : "Parrying Dagger", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "CRYOWHIP" : {name : "Rodian Cryogen Whip", d : 0, r : "wrShort", s : "Melee (Br)", c : "3"},
    "SITHSHIELD" : {name : "Sith Shield", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "SNAPBATON" : {name : "Snap Baton", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "BARDLANCE" : {name : "Bardottan Electrolance", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "GUNGPOLE" : {name : "Gungan Electropole", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "GUNGPOLET" : {name : "Gungan Electropole (thrown)", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "GUNGPES" : {name : "Gungan Personal Energy Shield", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "TRAINSTICK" : {name : "Training Stick", d : 0, r : "wrEngaged", s : "LTSABER", c : "5"},
    "VOSSWARSP" : {name : "Voss Warspear", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "VOSSWARSPT" : {name : "Voss Warspear (thrown)", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "WEIKGS" : {name : "Weik Greatsword", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "THERMCUTW" : {name : "Thermal Cutter", d : 4, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "SVT300" : {name : "SVT-300 Stun Cloak", d : 7, r : "wrEngaged", s : "Brawl (Br)", c : "3"},
    "LTSABER" : {name : "Lightsaber", d : 10, r : "wrEngaged", s : "LTSABER", c : "1"},
    "LTSABERBASIC" : {name : "Basic Lightsaber", d : 6, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERDBL" : {name : "Double-Bladed Lightsaber", d : 6, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERPIKE" : {name : "Lightsaber Pike", d : 6, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERSHOTO" : {name : "Shoto", d : 5, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERTRAIN" : {name : "Training Lightsaber", d : 6, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERGUASH" : {name : "Guard Shoto", d : 5, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERTEMGUAPIKE" : {name : "Temple Guard Lightsaber Pike", d : 6, r : "wrEngaged", s : "LTSABER", c : "2"},
    "LTSABERBASICHILT" : {name : "Basic Lightsaber Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERDBLHILT" : {name : "Double-Bladed Lightsaber Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERPIKEHILT" : {name : "Lightsaber Pike Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERSHOTOHILT" : {name : "Shoto Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERTEMGUAPIKEHILT" : {name : "Temple Guard Lightsaber Pike Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERGUASHHILT" : {name : "Guard Shoto Hilt", d : 0, r : "wrEngaged", s : "LTSABER", c : "0"},
    "LTSABERLODAKA" : {name : "Master Lodaka's Lightsaber", d : 10, r : "wrEngaged", s : "LTSABER", c : "1"},
    "TRUNCH" : {name : "Truncheon", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "STUNCLUB" : {name : "Stun Club", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "PULSEDRILL" : {name : "G9-GP Pulse Drill", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "PULSEDRILLGX" : {name : "G9-GX Pulse Drill", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "BEAMDRILLJ7B" : {name : "J-7b Beamdrill", d : 9, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "ENTRENCHTOOL" : {name : "Entrenching Tool (Improvised)", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "GLAIVESEL" : {name : "Selonian Glaive", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "VIBAX" : {name : "Vibro-ax", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "VIBKN" : {name : "Vibroknife", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "STVIBKN" : {name : "Stealth Vibroknife", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "VIBSW" : {name : "Vibrosword", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "SWORDCANE" : {name : "Sword Cane", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "VIBROSPR" : {name : "Huntsman Vibrospear", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "VIBROSAW" : {name : "Mk. VIII Vibrosaw", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "FUSCUT" : {name : "Fusion Cutter", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "RYYKBLADE" : {name : "Ryyk Blade", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "VIBROGRTSWRDVX" : {name : "VX 'Czerhander' Vibro-Greatsword", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "THERMAXMOD7" : {name : "Model 7 Therm-Ax", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "RIOTSHIELD" : {name : "Riot Shield", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "MOLSTILETTO" : {name : "Molecular Stiletto", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "STUNBATON" : {name : "Stun Baton", d : 2, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "THNDRBOLT" : {name : "Thunderbolt Shock Prod", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "ARGGAROK" : {name : "Arg'garok", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "VIBROGLAIVE" : {name : "Vibro-Glaive", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "MORCORTSTAFF" : {name : "Morgukai Cortosis Staff", d : 8, r : "wrEngaged", s : "Melee (Br)", c : "1"},
    "NEURWHIP" : {name : "Neuronic Whip", d : 0, r : "wrShort", s : "Melee (Br)", c : "4"},
    "TUSKPIKE" : {name : "Tuskbeast Pike", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "AUTOBLAST" : {name : "Auto-Blaster", d : 3, r : "wrClose", s : "Gunnery (Ag)", c : "5"},
    "BLASTCANLT" : {name : "Light Blaster Cannon", d : 4, r : "wrClose", s : "Gunnery (Ag)", c : "4"},
    "BLASTCANHVY" : {name : "Heavy Blaster Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "4"},
    "CML" : {name : "Concussion Missile Launcher", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "AFCML" : {name : "Alternating-Fire Concussion Missile Launcher", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "ACML" : {name : "Assault Concussion Missile Launcher", d : 7, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "CMLHK" : {name : "Hunter Killer Concussion Missile Launcher", d : 7, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "IONLT" : {name : "Light Ion Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "4"},
    "IONMED" : {name : "Medium Ion Cannon", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "4"},
    "IONHVY" : {name : "Heavy Ion Cannon", d : 7, r : "wrMedium", s : "Gunnery (Ag)", c : "4"},
    "IONLONG" : {name : "Long-Barrelled Ion Cannon", d : 9, r : "wrLong", s : "Gunnery (Ag)", c : "4"},
    "IONBATT" : {name : "Battleship Ion Cannon", d : 9, r : "wrMedium", s : "Gunnery (Ag)", c : "4"},
    "LASERLT" : {name : "Light Laser Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "LASERMED" : {name : "Medium Laser Cannon", d : 6, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "LASERHVY" : {name : "Heavy Laser Cannon", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "LASERPTDEF" : {name : "Point Defense Laser Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "LASERLONG" : {name : "Long-Nosed Laser Cannon", d : 6, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "PTL" : {name : "Proton Torpedo Launcher", d : 8, r : "wrShort", s : "Gunnery (Ag)", c : "2"},
    "LASERQUAD" : {name : "Quad Laser Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "TRACTLT" : {name : "Light Tractor Beam", d : 0, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "TRACTMED" : {name : "Medium Tractor Beam", d : 0, r : "wrShort", s : "Gunnery (Ag)", c : "0"},
    "TRACTHVY" : {name : "Heavy Tractor Beam", d : 0, r : "wrShort", s : "Gunnery (Ag)", c : "0"},
    "TURBOLT" : {name : "Light Turbolaser", d : 9, r : "wrMedium", s : "Gunnery (Ag)", c : "3"},
    "TURBOMED" : {name : "Medium Turbolaser", d : 10, r : "wrLong", s : "Gunnery (Ag)", c : "3"},
    "TURBOHVY" : {name : "Heavy Turbolaser", d : 11, r : "wrLong", s : "Gunnery (Ag)", c : "3"},
    "RIOTSHIELD" : {name : "Riot Shield", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "MOLSTILETTO" : {name : "Molecular Stiletto", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "STUNBATON" : {name : "Stun Baton", d : 2, r : "wrEngaged", s : "Melee (Br)", c : "6"},
    "THNDRBOLT" : {name : "Thunderbolt Shock Prod", d : 5, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "SUPPRESSCANNON" : {name : "Light Suppression Cannon", d : 10, r : "wrClose", s : "Gunnery (Ag)", c : "0"},
    "ELECHARPOON" : {name : "Electromagnetic Harpoon", d : 0, r : "wrClose", s : "Gunnery (Ag)", c : "0"},
    "CONGRENLAUNCH" : {name : "Concussion Grenade Launcher", d : 10, r : "wrExtreme", s : "Gunnery (Ag)", c : "4"},
    "PROTONBOMB" : {name : "Proton Bomb Release Chute", d : 7, r : "wrClose", s : "Gunnery (Ag)", c : "4"},
    "PROTONBAY" : {name : "Proton Bomb Bay", d : 7, r : "wrClose", s : "Gunnery (Ag)", c : "2"},
    "BEAMDRILHVY" : {name : "Heavy Beamdrill", d : 5, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "BEAMDRIL" : {name : "Beamdrill", d : 5, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "MINIROCKET" : {name : "Mini-Rocket Launcher", d : 3, r : "wrClose", s : "Gunnery (Ag)", c : "4"},
    "MASSDRIVMSL" : {name : "Mass Driver Missile Launchers", d : 14, r : "wrExtreme", s : "Gunnery (Ag)", c : "3"},
    "MISSILEPACK" : {name : "Missile Pack", d : 0, r : "wrExtreme", s : "Gunnery (Ag)", c : "0"},
    "MISSILEPACKMINI" : {name : "Mini-Missile Pack", d : 0, r : "wrExtreme", s : "Gunnery (Ag)", c : "0"},
    "MINIMISSILETUBE" : {name : "MM-XT Mini-Missile Tube", d : 0, r : "wrExtreme", s : "Gunnery (Ag)", c : "0"},
    "TRACTOR213" : {name : "Grappler 213 Tactical Tractor Beam", d : 0, r : "wrClose", s : "Gunnery (Ag)", c : "0"},
    "MISSCONCMINI" : {name : "Concussion Missile (Mini)", d : 4, r : "wrShort", s : "Gunnery (Ag)", c : "4"},
    "MISSJAM" : {name : "Jammer Missile", d : 0, r : "wrShort", s : "Gunnery (Ag)", c : "0"},
    "MISSDECOY" : {name : "Decoy Missile", d : 0, r : "wrShort", s : "Gunnery (Ag)", c : "0"},
    "MISSJAMMINI" : {name : "Jammer Missile (Mini)", d : 0, r : "wrClose", s : "Gunnery (Ag)", c : "0"},
    "MISSUNGROCK" : {name : "Unguided Rocket", d : 5, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "MISSUNGROCKMINI" : {name : "Unguided Rocket (Mini)", d : 3, r : "wrEngaged", s : "Gunnery (Ag)", c : "4"},
    "ROTREPBLASTCAN" : {name : "Rotary Repeating Blaster Cannon", d : 15, r : "wrExtreme", s : "Gunnery (Ag)", c : "2"},
    "LASCAN" : {name : "Laser Cannon", d : 9, r : "wrExtreme", s : "Gunnery (Ag)", c : "3"},
    "FLAKLT" : {name : "Light Flak Cannon", d : 5, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "FLAKMED" : {name : "Medium Flak Cannon", d : 5, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "FLAKHVY" : {name : "Heavy Flak Cannon", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "VL6" : {name : "VL-6 Warhead Launcher System", d : 6, r : "wrShort", s : "Gunnery (Ag)", c : "3"},
    "A95STING" : {name : "A95 Stingbeam", d : 5, r : "wrEngaged", s : "Ranged - Light (Ag)", c : "3"},
    "L7LIGHTPISTOL" : {name : "L7 Light Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "411HOLDOUT" : {name : "411 Holdout Blaster", d : 4, r : "wrMedium", s : "Ranged - Light (Ag)", c : "4"},
    "M53QUICKTRIGGER" : {name : "Model 53 'Quicktrigger' Blaster Pistol", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "M1NOVAVIPER" : {name : "Model-1 'Nova Viper' Blaster Pistol", d : 7, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "C10DRAGONEYE" : {name : "C-10 'Dragoneye Reaper' Heavy Blaster Pistol", d : 8, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "RENHEAVYBLAST" : {name : "'Renegade' Heavy Blaster Pistol", d : 8, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "HBT4HUNTING" : {name : "HBt-4 Hunting Blaster", d : 10, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "VES700PULSE" : {name : "VES-700 Pulse Rifle", d : 8, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "3"},
    "FDROIDDISABLER" : {name : "Droid Disabler", d : 12, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "FWG5FLECHETTE" : {name : "FWG-5 Flechette Pistol", d : 6, r : "wrShort", s : "Ranged - Light (Ag)", c : "3"},
    "8GAUGESCATTER" : {name : "8-Gauge Scatter Gun", d : 7, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "6"},
    "ASCIANTHROWDAG" : {name : "Ascian Throwing Dagger", d : 0, r : "wrShort", s : "Ranged - Light (Ag)", c : "2"},
    "KNOCKOUTGRENADE" : {name : "Knockout Grenade", d : 12, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "TAGCRYOPROJ" : {name : "Cryoban Projector", d : 6, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "2"},
    "SSB1STATIC" : {name : "SSB-1 Static Pistol", d : 2, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "SHOCKBOOTS" : {name : "Shock Boots", d : 0, r : "wrEngaged", s : "Brawl (Br)", c : "5"},
    "PUNCHDAGGER" : {name : "Punch Dagger", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "3"},
    "BLADEBREAKER" : {name : "Blade-Breaker", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "VIBRORAPIER" : {name : "Vibrorapier", d : 0, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "LTTRACTCOUPLE" : {name : "Light Tractor Beam Coupler", d : 0, r : "wrClose", s : "Gunnery (Ag)", c : "1"},
    "TORPLAUNCH" : {name : "Torpedo Launcher", d : 6, r : "wrMedium", s : "Gunnery (Ag)", c : "3"},
    "PROTTORPHVY" : {name : "Heavy Proton Torpedo Launcher", d : 10, r : "wrMedium", s : "Gunnery (Ag)", c : "2"},
    "CLUSTERBOMB" : {name : "Cluster Bomb Launcher", d : 6, r : "wrClose", s : "Gunnery (Ag)", c : "3"},
    "IONTHRUST" : {name : "Ion Thruster Gun", d : 5, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "4"},
    "MULTIGOO" : {name : "Multi-Goo Gun", d : 2, r : "wrShort", s : "Ranged - Light (Ag)", c : "0"},
    "REPULSORGUN" : {name : "Repulsor Gun", d : 3, r : "wrShort", s : "Ranged - Heavy (Ag)", c : "5"},
    "RIVETGUN" : {name : "Rivet Gun", d : 4, r : "wrEngaged", s : "Ranged - Light (Ag)", c : "3"},
    "HANDGRID" : {name : "Hand Grinder", d : 4, r : "wrEngaged", s : "Melee (Br)", c : "4"},
    "WELDINGROD" : {name : "Welding Rod", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "BMWEAPTEMP1" : {name : "Fist Weapon (Template)", d : 3, r : "wrEngaged", s : "Brawl (Br)", c : "4"},
    "BMWEAPTEMP2" : {name : "Blunt Weapon (Template)", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "BMWEAPTEMP3" : {name : "Shield (Template)", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "5"},
    "BMWEAPTEMP4" : {name : "Bladed Weapon (Template)", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "BMWEAPTEMP5" : {name : "Vibro-weapon (Template)", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "BMWEAPTEMP6" : {name : "Powered Melee Weapon (Template)", d : 3, r : "wrEngaged", s : "Melee (Br)", c : "2"},
    "RWEAPTEMP1" : {name : "Simple Projectile Weapon (Template)", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "RWEAPTEMP2" : {name : "Solid Projectile Pistol (Template)", d : 4, r : "wrShort", s : "Ranged - Light (Ag)", c : "5"},
    "RWEAPTEMP3" : {name : "Solid Projectile Rifle (Template)", d : 7, r : "wrMedium", s : "Ranged - Heavy (Ag)", c : "5"},
    "RWEAPTEMP4" : {name : "Energy Pistol (Template)", d : 6, r : "wrMedium", s : "Ranged - Light (Ag)", c : "3"},
    "RWEAPTEMP5" : {name : "Energy Rifle (Template)", d : 9, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "RWEAPTEMP6" : {name : "Heavy Energy Rifle (Template)", d : 10, r : "wrLong", s : "Ranged - Heavy (Ag)", c : "3"},
    "RWEAPTEMP7" : {name : "Missile Launcher (Template)", d : 0, r : "wrEngaged", s : "Gunnery (Ag)", c : "0"},
    "RWEAPTEMP8" : {name : "Missile (Template)", d : 20, r : "wrExtreme", s : "Gunnery (Ag)", c : "2"},
    "RWEAPTEMP9" : {name : "Grenade (Template)", d : 8, r : "wrShort", s : "Ranged - Light (Ag)", c : "4"},
    "RWEAPTEMP10" : {name : "Mine (Template)", d : 12, r : "wrEngaged", s : "Mechanics (Int)", c : "3"},
  };

  var armor = {
    "AEG" : {name : "Adverse Environmental Gear", s : 1},
    "AC" : {name : "Armored Clothing", s : 1},
    "ARMROBE" : {name : "Armored Robes", s : 2},
    "CONROBE" : {name : "Concealing Robes", s : 1},
    "HBA" : {name : "Heavy Battle Armor", s : 2},
    "HC" : {name : "Heavy Clothing", s : 1},
    "LAM" : {name : "Laminate", s : 2},
    "PDS" : {name : "Personal Deflector Shield", s : 0},
    "PAD" : {name : "Padded Armor", s : 2},
    "ENVIROSUIT" : {name : "Enviro-suit", s : 2},
    "CRASHSUIT" : {name : "A/KT Shockrider Crash Suit", s : 2},
    "UTILITYVEST" : {name : "A/KT Tracker Utility Vest", s : 0},
    "MOUNTARMOR" : {name : "A/KT Mountaineer Armor", s : 1},
    "CATCHVEST" : {name : "Catch Vest", s : 1},
    "NOMADCOAT" : {name : "Nomad Greatcoat", s : 1},
    "MODARMORIII" : {name : "Type III 'Berethron' Personal Modular Armor", s : 1},
    "FLIGHTTX3" : {name : "TX-3 Combat Flight Suit", s : 0},
    "BEASTHIDE" : {name : "Beast-Hide Armor", s : 1},
    "CHARGESUIT" : {name : "'Storm' Charge Suit", s : 2},
    "FLAKVEST" : {name : "Mk. III Flak Vest", s : 1},
    "PROTECTOR" : {name : "Protector 1 Combat Armor", s : 2},
    "STEELSKIN" : {name : "Mk.II 'Steelskin' Anti-Concussive Armor", s : 3},
    "POWARMOR" : {name : "PX-11 'Battlement' Powered Armor", s : 3},
    "TAILOREDJACKET" : {name : "Tailored Armored Jacket", s : 2},
    "REINFENVIRO" : {name : "Reinforced Environment Gear", s : 1},
    "RIOTARMOR" : {name : "Mk.IV Riot Armor", s : 1},
    "WINGCOMMANDER" : {name : "A/KT Wing Commander Armored Flight Suit", s : 1},
    "RIDINGTACK" : {name : "Caballerin-Series Riding Tack", s : 0},
    "CAPARIBEAST" : {name : "Capari-Series Padded Beast Armor", s : 2},
    "DESTRIBEAST" : {name : "Destri-Series Laminated Beast Armor", s : 4},
    "MEGAFAUNA" : {name : "H-Series Megafauna Carriage", s : 0},
    "HUTTSHELLARMOR" : {name : "Hutt Shell Armor", s : 2},
    "SAKSHADOW" : {name : "Sakiyan Shadowsuit", s : 1},
    "BLASTVEST" : {name : "Blast Vest", s : 1},
    "MIMETICSUIT" : {name : "Mimetic Suit", s : 1},
    "SMUGGLERSTRENCHCOAT" : {name : "Smuggler's Trenchcoat", s : 1},
    "BANAL" : {name : "Banal Apparel", s : 0},
    "CARGOCL" : {name : "Cargo Apparel", s : 0},
    "DIPROBE" : {name : "Diplomat's Robes", s : 0},
    "FLAREJACK" : {name : "Flare Jacket", s : 1},
    "HAULHARN" : {name : "Hauling Harness", s : 1},
    "HOLOCOST" : {name : "Holographic Costume", s : 0},
    "LECOUT" : {name : "Lector's Outfit", s : 1},
    "NOBREG" : {name : "Noble Regalia", s : 0},
    "PERFATT" : {name : "Performer's Attire", s : 0},
    "POWCAPARM" : {name : "Powered Capacitive Armor", s : 1},
    "RESPROBES" : {name : "Resplendent Robes", s : 1},
    "SECSKIN" : {name : "Second Skin Armor", s : 1},
    "BODYSUIT" : {name : "Polis Masson Bodysuit", s : 1},
    "LEVPOWARM" : {name : "Leviathan Power Armor", s : 2},
    "VERPFIBUARM" : {name : "Verpine Fiber Ultramesh Armor", s : 1},
    "CRESHARMOR" : {name : "Cresh 'Luck' Armor", s : 2},
    "JEDIBA" : {name : "Jedi Battle Armor", s : 2},
    "JEDITEMGUAARM" : {name : "Jedi Temple Guard Armor", s : 1},
    "JEDITRAINSUITW" : {name : "Jedi Training Suit (Weighted)", s : 2},
    "JEDITRAINSUIT" : {name : "Jedi Training Suit (Unweighted)", s : 2},
    "KAVDANNPA" : {name : "Kav-Dann Power Armor", s : 2},
    "KOROHALFVEST" : {name : "Koromondian Half-Vest", s : 1},
    "RIOTARM" : {name : "Riot Armor", s : 2},
    "ARMTEMP1" : {name : "Reinforced Clothing (Template)", s : 1},
    "ARMTEMP2" : {name : "Light Armor (Template)", s : 2},
    "ARMTEMP3" : {name : "Customizable Armor (Template)", s : 1},
    "ARMTEMP4" : {name : "Deflective Armor (Template)", s : 1},
    "ARMTEMP5" : {name : "Combat Armor (Template)", s : 2},
    "ARMTEMP6" : {name : "Segmented Armor (Template)", s : 2},
    "ARMTEMP7" : {name : "Augmentaive Armor (Template)", s : 2},
    "CLOAKCOAT" : {name : "Cloaking Coat", s : 1},
    "MECHUTILSUIT" : {name : "Mechanic's Utility Suit", s : 2},
    "N57" : {name : "N-57 Armor", s : 2},
    "P14" : {name : "P-14 Hazardous Industry Suit", s : 2},
  };

  searchObj["Weapons"] = function(src, output) {
    for (var key in src.CharWeapon) {
      // each skill
      if (src["CharWeapon"][key] && src["CharWeapon"][key]["ItemKey"] && src["CharWeapon"][key]["ItemKey"]["#text"]) {
        var item = JSON.parse(JSON.stringify(game.templates.item));
        if (weapon[src["CharWeapon"][key]["ItemKey"]["#text"]]) {
          item.info.name.current = weapon[src["CharWeapon"][key]["ItemKey"]["#text"]].name;
          item.info.skill.current = weapon[src["CharWeapon"][key]["ItemKey"]["#text"]].s;
          item.weapon.damage.current = weapon[src["CharWeapon"][key]["ItemKey"]["#text"]].d;
          item.weapon.range.current = weapon[src["CharWeapon"][key]["ItemKey"]["#text"]].r;
          item.weapon.crit.current = weapon[src["CharWeapon"][key]["ItemKey"]["#text"]].c;
          output.inventory.push(item);
        }
        else {
          item.info.name.current = src["CharWeapon"][key]["ItemKey"]["#text"];
          output.inventory.push(item);
        }
      }
    }
  }
  searchObj["Armor"] = function(src, output) {
    for (var key in src.CharArmor) {
      if (src["CharArmor"][key] && src["CharArmor"][key]["ItemKey"] && src["CharArmor"][key]["ItemKey"]["#text"]) {
        var item = JSON.parse(JSON.stringify(game.templates.item));
        if (armor[src["CharArmor"][key]["ItemKey"]["#text"]]) {
          item.info.name.current = armor[src["CharArmor"][key]["ItemKey"]["#text"]].name;
          item.equip.armor.current = armor[src["CharArmor"][key]["ItemKey"]["#text"]].s;
          output.inventory.push(item);
        }
        else {
          item.info.name.current = src["CharArmor"][key]["ItemKey"]["#text"];
          output.inventory.push(item);
        }
      }
    }
  }
  searchObj["Gear"] = function(src, output) {
    for (var key in src.CharGear) {
      if (src["CharGear"][key] && src["CharGear"][key]["ItemKey"] && src["CharGear"][key]["ItemKey"]["#text"]) {
        var item = JSON.parse(JSON.stringify(game.templates.item));
        item.info.name.current = src["CharGear"][key]["ItemKey"]["#text"];
        output.inventory.push(item);
      }
    }
  }

  // create it right here
  function recurseSearch(src, keys, output) {
    for (var key in src) {
      if (src[key] instanceof Object) {
        if (src[key] && keys[key]) {
          keys[key](src[key], output);
        }
        else {
          recurseSearch(src[key], keys, output);
        }
      }
    }
  }
  recurseSearch(xml, searchObj, override);
}
