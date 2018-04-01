// Changes XML to JSON credit to https://davidwalsh.name/convert-xml-json

var _txtImportRules = {};
_txtImportRules["skills"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w0-9\s-]*)[\s]*([\(][^0-9]*[\)])*[\s]*([\(][-|+|0-9]*[\)])*[\s]*(\[(.*)\])*/i;
	var bonus = /([\+-](.*)|)/;
	var override = /{([\s\S]*)}/;
	var newSkills = {};
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			var exe = dataRegex.exec(rawSkill);
			var skill = sync.newValue(null, 1);
			if (exe) {
				var str = (exe[1] + (exe[2] || "")).trim();
				skill.name = str;
				if (sync.eval(exe[3]) != null) {
					if (sync.eval(exe[3])%10 == 0) {
						sync.modifier(skill, "rank", eval(exe[3])/10);
					}
					else {
						sync.modifier(skill, "rank", eval(exe[3]));
					}
				}

				if (exe[5]) {// custom options for the skill
					var dataArr = exe[5].split(";");
					for (var i in dataArr) {
						var data = dataArr[i].split("=");
						if (data[0].toLowerCase() == "r") {
							sync.modifier(skill, "rank", eval(data[1]));
						}
					}
				}
				if (exe[1].valid()) {
					var pushed = false;
					for (var s in output.skills) {
						if (output.skills[s].name && output.skills[s].name.toLowerCase().match(exe[1].trim().toLowerCase())) {
							skill.name = output.skills[s].name;
							if (output.skills[s].modifiers && !skill.modifiers) {
								skill.modifiers = output.skills[s].modifiers;
							}
							output.skills[s] = skill;
							pushed = true;
						}
					}
					if (!pushed) {
						newSkills.push(skill);
					}
				}
			}
			else {
				skill.name = rawSkill;
				if (!pushed) {
					newSkills.push(skill);
				}
			}
		}
	}
	for (var i in newSkills) {
		output.skills[Object.keys(output.skills).length] = (newSkills[i]);
	}
};
_txtImportRules["stats"] = function(data, output) {
	var itemRegex = /([^\n]+)[\n]/g;
	var stats = data.split(itemRegex);
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var reg = /(.+)[-|:|=|;]\s*(.+)[\n|,]/ig;
	var bonus = /([\+-](.*)|)/;
	var override = /{(.*)}/;
	var firstNumber = /([0-9]+)/ig;
	for (var i in stats) {
		var rawStat = stats[i];
		if (rawStat.valid()) {
			var splitStat = rawStat.split(",");
			for (var j in splitStat) {
				var exe = splitReg.exec(splitStat[j]);
				if (exe && (exe[1] || "").valid() && (exe[2] || "").valid()) {
					for (var stat in output.stats) {
						if (stat.toLowerCase() == exe[1].trim().toLowerCase() || output.stats[stat].name.toLowerCase() == exe[1].trim().toLowerCase()) {
							if (isNaN(exe[2])) {
								var equals = exe[2].split("=");
								var regex = /\s*[+-]\s*/;
								var additions = equals[0].trim().split(regex);
								if (additions.length) {
									sync.rawVal(output.stats[stat], parseInt(additions[0]));
									for (var k=1; k<additions.length; k++) {
										sync.modifier(output.stats[stat], k, parseInt(additions[k]));
									}
								}
								else {
									sync.rawVal(output.stats[stat], exe[1]);
								}
							}
							else {
								sync.rawVal(output.stats[stat], parseInt(exe[2]));
							}
						}
					}
					for (var count in output.counters) {
						if (count.toLowerCase() == exe[1].trim().toLowerCase() || output.counters[count].name.toLowerCase() == exe[1].trim().toLowerCase()) {
							var numb = exe[2].match(firstNumber);
							if (numb) {
								if (count == "exp") {
									var spent = 0;
									for (var d=1; d<numb.length; d++) {
										spent = spent + parseInt(numb[d]);
									}
									output.counters[count].modifiers = {"Imported" : spent+parseInt(numb[0])};
									sync.rawVal(output.counters[count], spent);
								}
								else {
									sync.rawVal(output.counters[count], parseInt(numb[0]));
									if (numb[1]) {
										output.counters[count].max = parseInt(numb[1]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

_txtImportRules["inventory"] = function(data, output) {
	var itemRegex = /([^\n]+)[\n]/g;
	var items = data.split(itemRegex);
	var dataRegex = /([\w'"-\s&]*)[\s]*([\(].*[\)])*(.)*/i;
	var firstNumber = /([0-9]+)/;
	var weaponRegex = /[\[](.*)[\]]/;
	var split = /[-=;]/;
	var newItems = [];
	var options = /{([\s\S]*)}/;
	for (var i in items) {
		var rawItem = items[i];
		if (rawItem.valid()) {
			var item = JSON.parse(JSON.stringify(game.templates.item));
			var exe = dataRegex.exec(rawItem);
			var quantity = firstNumber.exec(rawItem);
			if (quantity) {
				sync.val(item.info.quantity, quantity[1]);
			}
			else {
				sync.val(item.info.quantity, 1);
			}
			if (exe) {
				if (exe[1].replace(sync.val(item.info.quantity), "").valid()) {
					sync.val(item.info.name, exe[1].trim().replace(sync.val(item.info.quantity), ""));
					sync.val(item.info.notes, exe[2]);
					var weaponData = weaponRegex.exec(rawItem);
					if (weaponData) {
						var weaponArr = weaponData[1].split(";");
						for (var i in weaponArr) {
							var data = weaponArr[i].split(split);
							if (data && data[1]) {
								var obj = data[1];
								if (obj.match(options)) {
									obj = JSON.parse(data[1]);
								}
								if (data[0].toLowerCase() == "armor" || data[0].toLowerCase() == "a") {
									if (obj instanceof Object) {
										merge(item.equip.armor, obj, true);
									}
									else {
										sync.rawVal(item.equip.armor, parseInt(obj));
									}
								}
								else if (data[0].toLowerCase() == "u" || data[0].toLowerCase() == "img") {
									sync.rawVal(item.info.img, obj);
								}
								else if (data[0].toLowerCase() == "weight" | data[0].toLowerCase() == "w") {
									sync.rawVal(item.info.weight, parseInt(obj));
								}
								else if (data[0].toLowerCase() == "quantity" || data[0].toLowerCase() == "q") {
									sync.rawVal(item.info.quantity, parseInt(obj));
								}
								else {
									if (item.weapon[data[0].toLowerCase()]) {
										if (obj instanceof Object) {
											merge(item.weapon[data[0].toLowerCase()], obj, true);
										}
										else {
											sync.rawVal(item.weapon[data[0].toLowerCase()], obj);
										}
									}
									else {
										sync.rawVal(item.info.notes, (sync.rawVal(item.info.notes) || "") + (data[0] || "") + "=" + (obj || "") + "\n");
									}
								}
							}
						}
					}
					output.inventory.push(item);
				}
			}
			else {
				sync.val(item.info.name, rawItem);
				output.inventory.push(item);
			}
		}
	}
};
_txtImportRules["items"] = function(data, output) {
	_txtImportRules["inventory"](data, output);
};
_txtImportRules["gear"] = function(data, output) {
	_txtImportRules["inventory"](data, output);
};
_txtImportRules["equipment"] = function(data, output) {
	_txtImportRules["inventory"](data, output);
};
_txtImportRules["talents"] = function(data, output) {
	var talentRegex = /([^\n]+)[\n]/g;
	var talents = data.split(talentRegex);
	var dataRegex = /([\w*|0-9*|\s*]*)[\s]*([\(].*[\)])/i;
	for (var i in talents) {
		var rawTalent = talents[i];
		if (rawTalent.valid()) {
			var exe = dataRegex.exec(rawTalent);
			if (exe) {
				output.talents[Object.keys(output.talents).length] = sync.newValue(exe[1].trim(), null, null, null, {"rank" : exe[2]});
			}
			else {
				output.talents[Object.keys(output.talents).length] = sync.newValue(rawTalent);
			}
		}
	}
}
_txtImportRules["feats"] = function(data, output) {
	_txtImportRules["talents"](data, output);
}
_txtImportRules["traits"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w*|0-9*|\s*]*)[\s]*([\(].*[\)])/i;
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			output.tags["trait_"+rawSkill.trim()] = 1;
		}
	}
}
_txtImportRules["spellbook"] = function(data, output) {
	var itemRegex = /([^\n]+)[\n]/g;
	var items = data.split(itemRegex);
	var split = /[-|:|=|;]/;
	var firstNumber = /([0-9]+)/;
	var newItems = [];
	for (var i in items) {
		var rawItem = items[i];
		if (rawItem.valid()) {
			var item = JSON.parse(JSON.stringify(game.templates.item));
			var exe = rawItem.split(split);
			if (exe) {
				if (exe[0].replace(sync.val(item.info.quantity), "").valid()) {
					sync.val(item.info.name, exe[0].trim());
					sync.val(item.info.notes, exe[1].trim());
					output.spellbook.push(item);
				}
			}
			else {
				sync.val(item.info.name, rawItem.trim());
				output.spellbook.push(item);
			}
		}
	}
}
_txtImportRules["force"] = function(data, output) {
	_txtImportRules["spellbook"](data, output);
}
_txtImportRules["psychic"] = function(data, output) {
	_txtImportRules["spellbook"](data, output);
}
_txtImportRules["spells"] = function(data, output) {
	_txtImportRules["spellbook"](data, output);
}

_txtImportRules["spellslots"] = function(data, output) {
	var talentRegex = /([^\n]+)[\n]/g;
	var talents = data.split(talentRegex);
	var spellObj = {};
	var level = 0;
	for (var i in talents) {
		var rawTalent = talents[i];
		if (rawTalent.valid()) {
			spellObj[level] = JSON.parse(rawTalent);
			level = level + 1;
		}
	}
	output.spells = spellObj;
}

_txtImportRules["aptitudes"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w*|0-9*|\s*]*)[\s]*([\(].*[\)])/i;
	console.log(skills);
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			var splitData = rawSkill.split(",");
			for (var i in splitData) {
				output.tags["apt_"+splitData[i].trim()] = 1;
			}
		}
	}
}
_txtImportRules["apts"] = function(data, output) {
	_txtImportRules["aptitudes"](data, output);
}
_txtImportRules["notes"] = function(data, output) {
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var firstNumber = /([0-9]+)/ig;
	var itemRegex = /([^\n]+)[\n]/g;
	var bonus = /([\+-](.*)|)/;
	var override = /{([\s\S]*)}/;
	var keys = data.split(itemRegex);
	var firstNumber = /([0-9]+)/ig;
	for (var i in keys) {
		var rawData = keys[i];
		if (rawData.valid()) {
			var splitData = rawData.split(",");
			for (var j in splitData) {
				var exe = splitReg.exec(splitData[j]);
				if (exe) {
					for (var key in output.info) {
						if (key.toLowerCase() == exe[1].trim().toLowerCase() || output.info[key].name.toLowerCase() == exe[1].trim().toLowerCase()) {
							sync.rawVal(output.info[key], (exe[2] || "").trim());
						}
						else if (key == "home" && exe[1].trim().toLowerCase().match("home")) {
							sync.rawVal(output.info[key], (exe[2] || "").trim());
						}
					}

					for (var count in output.counters) {
						if (count.toLowerCase() == exe[1].trim().toLowerCase() || output.counters[count].name.toLowerCase() == exe[1].trim().toLowerCase()) {
							var numb = exe[2].match(firstNumber);
							if (numb) {
								if (count == "exp") {
									var spent = 0;
									for (var i=1; i<numb.length; i++) {
										spent = spent + parseInt(numb[i]);
									}
									output.counters[count].modifiers = {"Imported" : spent+parseInt(numb[0])};
									sync.rawVal(output.counters[count], spent);
								}
								else {
									sync.rawVal(output.counters[count], parseInt(numb[0]));
									if (numb[1]) {
										output.counters[count].max = parseInt(numb[1]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	sync.rawVal(output.info.notes, data);
}
_txtImportRules["description"] = function(data, output) {
	_txtImportRules["notes"](data, output);
}
_txtImportRules["other"] = function(data, output) {
	_txtImportRules["notes"](data, output);
}
_txtImportRules["info"] = function(data, output) {
	_txtImportRules["notes"](data, output);
}
_txtImportRules["specials"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w*|0-9*|\s*+-]*)[\s]*([\(].*[\)])/i;
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			var exe = splitReg.exec(rawSkill.trim());
			if (exe) {
				output.specials[Object.keys(output.specials).length] = sync.newValue(exe[1].trim(), exe[2].trim());
			}
			else {
				output.specials[Object.keys(output.specials).length] = sync.newValue("Special Rule", rawSkill.trim());
			}
		}
	}
}

_txtImportRules["proficiencies"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w*|0-9*|\s*]*)[\s]*([\(].*[\)])/i;
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			var splitSkill = rawSkill.split(",");
			for (var j in splitSkill) {
				var exe = splitReg.exec(splitSkill[j].trim());
				if (exe) {
					output.tags["prof_"+exe[1].trim()] = 1;
				}
				else {
					output.tags["prof_"+splitSkill[j]] = 1;
				}
			}
		}
	}
}

_txtImportRules["tags"] = function(data, output) {
	var skillRegex = /([^\n]+)[\n]/g;
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var skills = data.split(skillRegex);
	var dataRegex = /([\w*|0-9*|\s*]*)[\s]*([\(].*[\)])/i;
	for (var i in skills) {
		var rawSkill = skills[i];
		if (rawSkill.valid()) {
			var splitSkill = rawSkill.split(",");
			for (var j in splitSkill) {
				var exe = splitReg.exec(splitSkill[j].trim());
				if (exe) {
					output.tags[exe[1].trim()] = 1;
				}
				else {
					output.tags[splitSkill[j]] = 1;
				}
			}
		}
	}
}

_txtImportRules["proficient"] = function(data, output) {
	_txtImportRules["proficiencies"](data, output);
}
_txtImportRules["proficiency"] = function(data, output) {
	_txtImportRules["proficiencies"](data, output);
}

_txtImportRules["counters"] = function(data, output) {
	var splitReg = /([^:^=^;]+)[:=;](.+)/;
	var firstNumber = /([0-9]+)/ig;
	var itemRegex = /([^\n]+)[\n]/g;
	var bonus = /(.*)(\+|-)=(.*)/;
	var override = /{([\s\S]*)}/;
	var keys = data.split(itemRegex);
	var firstNumber = /([0-9]+)/ig;
	for (var i in keys) {
		var rawData = keys[i];
		if (rawData.valid()) {
			var splitData = rawData.split(",");
			for (var j in splitData) {
				var exe = splitReg.exec(splitData[j]);
				if (exe) {
					for (var count in output.counters) {
						if (count.toLowerCase() == exe[1].trim().toLowerCase() || output.counters[count].name.toLowerCase() == exe[1].trim().toLowerCase()) {
							// modifiers
							var numb = exe[2].match(firstNumber);
							if (numb) {
								if (count == "exp") {
									var spent = 0;
									for (var i=1; i<numb.length; i++) {
										spent = spent + parseInt(numb[i]);
									}
									output.counters[count].modifiers = {"Imported" : spent+parseInt(numb[0])};
									sync.rawVal(output.counters[count], spent);
								}
								else {
									sync.rawVal(output.counters[count], parseInt(numb[0]));
									if (numb[1]) {
										output.counters[count].max = parseInt(numb[1]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}


function char_import(text, out_char, system) {
	var reg = /\n[\t]*(traits|counters|talents|feats|inventory|gear|equipment|skills|stats|info|spells|spellbook|spellslots|psychic|aptitudes|apts|proficiency|other|description|notes|specials|proficiencies|proficient)\s*[-|:|=|;]\s*/ig
	var readData = ("\n"+text).split(reg);
	for (var i=1; i<readData.length; i=i+2) {
		var ref = readData[i];
		var rawData = readData[i+1];
		_txtImportRules[ref.toLowerCase()](rawData, out_char);
	}
}

function xmlToJson(xml) {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

sync.render("ui_boxes", function(obj, app, scope) {
	var boxes = $("<div>");
	boxes.addClass("flexrow flexbetween fit-xy");

	var storageBox = $("<div>").appendTo(boxes);
	storageBox.addClass("flexcolumn flexmiddle lightoutline hover2 dropContent");
	storageBox.css("width", "50%");
	storageBox.css("cursor", "pointer");
	storageBox.sortable({
		filter : ".charContent",
		connectWith : ".dropContent",
		update : function(ev, ui) {
			if ($(ui.item).attr("gID")) {
				var gp = game.entities.data[$(ui.item).attr("gID")];
				if (gp && gp.data.list) {
					for (var gKey in gp.data.list) {
						if (gp.data.list[gKey] == $(ui.item).attr("index")) {
							gp.data.list.splice(gKey, 1);
							gp.sync("updateGroup");
							break;
						}
					}
				}
			}
			runCommand("storeAsset", {id: $(ui.item).attr("index")});
			$(ui.item).remove();
			obj.update();
		}
	});
	storageBox.click(function(){
		runCommand("retreiveStorage");

		game.locals["storage"] = game.locals["storage"] || sync.obj("storage");

		var content = $("<div>");
		content.addClass("fit-x")
		content.append("<b>Storage</b>");

		var padding = $("<div>").appendTo(content);
		padding.addClass("flexmiddle");
		padding.css("padding", "4px");

		var newApp = sync.newApp("ui_quickStorage").appendTo(padding);
		newApp.attr("_maxHeight", "10vh");
		game.locals["storage"].addApp(newApp);

		var popOut = ui_popOut({
			target : $(this),
			id : "quick-storage-popout",
			align : "bottom",
			style : {"width" : storageBox.width()}
		}, content);
	});

	var icon = genIcon("", "Drag here to move into storage");
	icon.appendTo(storageBox);

	var icon = genIcon("cloud", "Click to Quick Storage");
	icon.appendTo(storageBox);

	var importBox = $("<div>").appendTo(boxes);
	importBox.addClass("flexcolumn flexmiddle lightoutline");
	importBox.css("flex", "2");

	var icon = genIcon("question-sign", "Drag Text Files to Import");
	icon.click(function(){
		var content = $("<div>");
		content.append("<b>How do I use this?</b>");
		content.append("<p>All you have to do is your pasted sheet follows the rules below! It shouldn't take more than a couple of seconds!</p>");

		function subItem(msg) {
			var listItem = $("<li>");
			listItem.addClass("subtitle");
			listItem.css("list-style-type", "square");
			listItem.css("list-style-position", "inside");
			listItem.css("text-indent", "10%");
			var text = $("<text>").appendTo(listItem);
			text.text(msg);

			return listItem;
		}

		var list = $("<ul>").appendTo(content);
		list.css("text-indent", "5%");
		list.css("height", "auto");
		list.append("<b>Basic Rules</b>");
		list.css("list-style-type", "square");
		list.css("list-style-position", "inside");

		var listItem = $("<li>").appendTo(list);
		listItem.append("Seperate Entries ',' or a new line");

		var listItem = $("<li>").appendTo(list);
		var text = $("<text>").appendTo(listItem);
		text.text("Specify Quantitity with (<number>)");

		var listItem = $("<li>").appendTo(list);
		var text = $("<text>").appendTo(listItem);
		text.text("Specify Extra options with [<options>]");

		var listItem = $("<li>").appendTo(list);
		listItem.append("Match the title/category of any field to import");
		subItem("<Category Name> : <Line Break>").appendTo(listItem);
		subItem("<Category Data/Entries>").appendTo(listItem);

		var list = $("<ul>").appendTo(content);
		list.css("height", "auto");
		list.append("<b>Categories</b>");

		var listItem = $("<li>").appendTo(list);
		listItem.append("Aptitudes");

		subItem("<Name>").appendTo(list);
		subItem("Toughness").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Equipment Gear Inventory");

		subItem("<Name> (<Amount>) [d:<damage>; r:<range>; p:<penetration>]").appendTo(list);
		subItem("Shotgun (1) [d:1d10+3;r:30m;p:2;]").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Skills");

		subItem("<Name> (<Stat>) (<Bonus>)").appendTo(list);
		subItem("Athletics (Str) (+4)").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Specials");

		subItem("<Name> : <Description>").appendTo(list);
		subItem("Stout Toughness : This character does take damage").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Talents");

		subItem("<Name> (<Rank>)").appendTo(list);
		subItem("Sound Consitution (Rank 1)").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Traits");

		subItem("<Name>").appendTo(list);
		subItem("Psyker").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Spells Force Psychic");

		subItem("<Name> : <Description>").appendTo(list);
		subItem("Magic Missile : Launch a energy attack at an enemy").appendTo(list);


		var listItem = $("<li>").appendTo(list);
		listItem.append("Descriptions Notes Other");

		subItem("<Name> : <Value>").appendTo(list);
		subItem("Race : Gnome").appendTo(list);

		var listItem = $("<li>").appendTo(list);
		listItem.append("Stats");
		subItem("<Stat Name> : <Equation>").appendTo(list);
		subItem("Dexterity : 13+4 (or Dex : +3)").appendTo(list);

		var popOut = ui_popOut({
			target : $(this),
			id : "import-popout"
		}, content);
	});

	importBox.append(icon);
	importBox.on("dragover", function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).addClass('boxinshadow');
	});
	importBox.on("dragleave", function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).removeClass('boxinshadow');
	});
	importBox.bind("drop", function(e) {
		app.unbind("drop");
		e.stopPropagation();
		e.preventDefault();

		var files = e.originalEvent.dataTransfer.files;
		for (var i=0; i<files.length; i++) {
			var reader = new FileReader();
			reader.ref = i;
			reader.onload = function(e2) {
				var override = JSON.parse(JSON.stringify(game.templates.character || {}));

				char_import(e2.target.result, override);
				if (sync.val(override.info.name) == "Default Character") {
					sync.val(override.info.name, files[this.ref].name.replace(".txt", ""));
				}
				runCommand("createCharacter", override);
			}
			reader.readAsText(files[i]);
		}
		$(this).removeClass('boxinshadow');
	});

	return boxes;
});

sync.render("ui_import", function(obj, app, scope) {
  if (!obj || !obj.data) {return $("<div>");}

  scope = scope || {viewOnly: app.attr("viewOnly") == "true"};
  var data = obj.data;
  var result = data.raw;

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

	var tabBar = genNavBar("background alttext subtitle", "flex flexcolumn", "4px");
	tabBar.addClass("flexcolumn flex");
	tabBar.generateTab("Text", "text-background", function(parent) {
		var content = $("<div>").appendTo(parent);
		content.addClass("flex flexcolumn padding");

		var title = $("<b>Paste/Drag your text file in here </b>").appendTo(content);

		var icon = genIcon("question-sign").appendTo(title);
		icon.click(function(){
			var content = $("<div>");
			content.append("<b>How do I use this?</b>");
			content.append("<p>All you have to do is your pasted sheet follows the rules below! It shouldn't take more than a couple of seconds!</p>");

			function subItem(msg) {
				var listItem = $("<li>");
				listItem.addClass("subtitle");
				listItem.css("list-style-type", "square");
				listItem.css("list-style-position", "inside");
				listItem.css("text-indent", "10%");
				var text = $("<text>").appendTo(listItem);
				text.text(msg);

				return listItem;
			}

			var list = $("<ul>").appendTo(content);
			list.css("text-indent", "5%");
			list.css("height", "auto");
			list.append("<b>Basic Rules</b>");
			list.css("list-style-type", "square");
			list.css("list-style-position", "inside");

			var listItem = $("<li>").appendTo(list);
			listItem.append("Seperate Entries ',' or a new line");

			var listItem = $("<li>").appendTo(list);
			var text = $("<text>").appendTo(listItem);
			text.text("Specify Quantitity with (<number>)");

			var listItem = $("<li>").appendTo(list);
			var text = $("<text>").appendTo(listItem);
			text.text("Specify Extra options with [<options>]");

			var listItem = $("<li>").appendTo(list);
			listItem.append("Match the title/category of any field to import");
			subItem("<Category Name> : <Line Break>").appendTo(listItem);
			subItem("<Category Data/Entries>").appendTo(listItem);

			var list = $("<ul>").appendTo(content);
			list.append("<b>Categories</b>");

			var listItem = $("<li>").appendTo(list);
			listItem.append("Aptitudes");

			subItem("<Name>").appendTo(list);
			subItem("Toughness").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Equipment Gear Inventory");

			subItem("<Name> (<Amount>) [d:<damage>; r:<range>; p:<penetration>]").appendTo(list);
			subItem("Shotgun (1) [d:1d10+3;r:30m;p:2;]").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Skills");

			subItem("<Name> (<Stat>) (<Bonus>)").appendTo(list);
			subItem("Athletics (Str) (+4)").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Specials");

			subItem("<Name> : <Description>").appendTo(list);
			subItem("Stout Toughness : This character does take damage").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Talents");

			subItem("<Name> (<Rank>)").appendTo(list);
			subItem("Sound Consitution (Rank 1)").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Traits");

			subItem("<Name>").appendTo(list);
			subItem("Psyker").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Spells Force Psychic");

			subItem("<Name> : <Description>").appendTo(list);
			subItem("Magic Missile : Launch a energy attack at an enemy").appendTo(list);


			var listItem = $("<li>").appendTo(list);
			listItem.append("Descriptions Notes Other");

			subItem("<Name> : <Value>").appendTo(list);
			subItem("Race : Gnome").appendTo(list);

			var listItem = $("<li>").appendTo(list);
			listItem.append("Stats");
			subItem("<Stat Name> : <Equation>").appendTo(list);
			subItem("Dexterity : 13+4").appendTo(list);

			var popOut = ui_popOut({
				target : $(this),
				id : "import-popout"
			}, content);
		});

		var humanReadable = $("<textarea>").appendTo(content);
		humanReadable.addClass("flex");
		humanReadable.attr("placeholder", "Plain Text, don't worry about capitalization/formating much, its pretty flexible!\n_________\n| Example |\n--------------\nStats - \n Str: 10+3, Dex-15+3,\n\nConstitution : 12, Wisdom : 9-1\nCha ; 12, wounds : 12/14 \n\nInventory :\nMolotovs(3)[d:1d4+2;r:30m;p:1], Backpack, Shotgun\n\n Bodyarmor, 32 shoes, helm \n\nNotes : \n name : Big Roger \nRace : Giant, Size : Massive");
		div.on("dragover", function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).addClass('boxinshadow');
		});

		div.on("dragleave", function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).removeClass('boxinshadow');
		});
		div.unbind("drop");
		div.bind("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();

			var files = e.originalEvent.dataTransfer.files;
			var multiple = (files.length > 1);
			for (var i=0; i<files.length; i++) {
				var reader = new FileReader();
				reader.ref = i;
				reader.onload = function(e2) {
					humanReadable.val(e2.target.result);
					if (multiple) {
						var override = JSON.parse(JSON.stringify(game.templates.character || {}));

						char_import(e2.target.result, override);
						if (sync.val(override.info.name) == "Default Character") {
							sync.val(override.info.name, files[this.ref].name.replace(".txt", ""));
						}
						runCommand("createCharacter", override);
					}
					else {
						humanReadable.change();
					}
				}
				reader.readAsText(files[i]);
			}
			$(this).removeClass('boxinshadow');
		});
		humanReadable.change(function(){
			data.override = JSON.parse(JSON.stringify(game.templates.character || {}));

			char_import($(this).val(), data.override);
		});
		humanReadable.val(scope.example);

		var button = $("<button>");//.appendTo(parent);
		button.append("here");
		button.click(function(){
			$.get('http://localhost:4000/dnd_5e.txt', function(data) {
		    var myvar = data;

		    var regex = /\n(\t*)([\w|\s]*)(\?[\w|\s]+)*[=]*({[0-9]*[\(\[<])/im;
		    // construct the regex that matches the indentation and then do it

				function parseOptions(str) {
					var result = null;

					var params = str.match(regex);
					// first seperate the body from the options
					if (params) { // check for nested choices
						var options = str.substring(params.index, str.length);
						var optionsList = options.split("\n"+params[1]+")}");
						optionsList.splice(optionsList.length-1, 1);

						for (var i in optionsList) {
							var params = optionsList[i].match(regex);
							if (params) {
								// Gather all information about what can be chosen
								var choice = {};
								choice.name = params[2];
								choice.tip = params[3];
								if (!isNaN(params[4].charAt(1))) {
									choice.number = parseInt(params[4].charAt(1));
								}
								if (params[4].charAt(1) == "(" || params[4].charAt(2) == "(") {
									choice.exclusive = true;
								}
								optionsList[i] = optionsList[i].replace(params[0], "");
								result = result || [];

								choice.choices = [];
								var choiceList = optionsList[i].split("\n"+params[1]+"	>}");
								choiceList.splice(choiceList.length-1, 1);
								for (var cIndex in choiceList) {
									choiceList[cIndex] = choiceList[cIndex] + "\n"+params[1]+"	>}";
									choice.choices.push(parseData(choiceList[cIndex]));
								}
								result.push(choice);
							}
						}
					}
					return result;
				}

				function parseData(str, abort) {
					var params = str.match(regex);
					if (params) {
						var result = {};
						result.name = params[2];
						result.tip = params[3];
						result.data = str.substring(0, params.index);
						var contents = str.substring(params.index, str.length);
						var correction = contents.match("\n"+params[1]+"[>|\\]|\\)]}");
						if (correction) {
							contents = contents.substring(0, correction.index);
							contents = contents.replace(params[0], "");

							var split = contents.match(regex);
							// seperate the options from the data
							if (split) {
								result.data = contents.substring(0, split.index);
								result.choices = parseOptions(contents.substring(split.index, contents.length));
							}
							else {
								result.data = contents;
							}
						}
					}
					return result;
				}

				//build(data, buildTree);
				console.log(parseData(data));
				//var evaluated = getOption(data);
				//humanReadable.val(getOption(getOption(getOption(data).next).choices));
				//humanReadable.change();
		  });
		});

		var button = $("<button>");//.appendTo(parent);
		button.append("translate");
		button.click(function(){
			var temps = game.templates.generation;

			var strr = "";

			function parseValuee(value, suppress) {
				var returnStr = JSON.stringify(value);
				if (value instanceof Object) {
					if (value.current && value.name && !suppress) {
						returnStr = value.name + ":" + value.current;
					} // is it a sync value
					else if (value.current != null && !suppress) {
						returnStr = value.current;
					}
					return returnStr;
				}
				return value;
			}

			function generateStr(data, depth) {
				var rStr = "";
				var indent = "";
				for (var i=0; i<depth; i++) {
					indent = indent + "\t";
				}
				var linebreak = "\n" + indent;
				for (var key in data) {
					rStr = rStr + key + "-" + linebreak;
					if (data[key]) {
						for (var subkey in data[key]) {
							if (key != "spells" && !isNaN(subkey) && data[key] instanceof Object && !Array.isArray(data[key])) {
								if (game.templates.character[key][subkey]) {
									rStr = rStr + game.templates.character[key][subkey].name;
								}
								if (key == "skills") {
									rStr = rStr + parseValuee(data[key][subkey], true) + linebreak;
								}
								else {
									rStr = rStr + parseValuee(data[key][subkey], true) + linebreak;
								}
							}
							else {
								if (key == "stats" || key == "proficient" || key == "counters" || key == "info") {
									if (subkey == "saving") {
										rStr = rStr + subkey + ":";
										for (var mkey in data[key][subkey].current) {
											rStr = rStr + mkey + "-" + parseValuee(data[key][subkey].current[mkey])+",";
										}
										rStr = rStr.substring(0, rStr.length-1) + linebreak;
									}
									else {
										rStr = rStr + subkey + ":" + parseValuee(data[key][subkey]) + linebreak;
									}
								}
								else {
									rStr = rStr + parseValuee(data[key][subkey]) + linebreak;
								}
							}
						}
					}
				}
				/*if (data.stats) {
					rStr = rStr + "\n stats:";
					for (var key in data.stats) {
						rStr = rStr + key + ":" + parseValuee(data.stats[key]) + ",";
					}
				}
				if (data.inventory) {
					rStr = rStr + "\n inventory:";
					for (var key in data.inventory) {
						rStr = rStr + data.inventory[key] + ",";
					}
				}
				if (data.talents) {
					rStr = rStr + "\n talents:";
					for (var key in data.talents) {
						rStr = rStr + key + ":" + parseValuee(data.talents[key]) + ",";
					}
				}
				if (data.skills) {
					rStr = rStr + "\n skills:";
					for (var key in data.skills) {
						rStr = rStr + key + ":" + parseValuee(data.skills[key]) + ",";
					}
				}*/
				return rStr;
			}

			function recurse(choice, depth) {
				var returnStr = "";
				var indent = "";
				for (var i=0; i<depth; i++) {
					indent = indent + "\t";
				}
				var linebreak = "\n" + indent;
				if (choice instanceof Object) {
					if (choice.data) {
						returnStr = returnStr + generateStr(choice.data, depth);
					}
					if (choice.choices) {
						returnStr = returnStr + "{(" + linebreak;
						for (var key in choice.choices) {
							if (choice.choices[key].name) {
								returnStr = returnStr + "\t" + choice.choices[key].name;
							}
							else {
								returnStr = returnStr + "\t" + key;
							}
							if (choice.choices[key].tip) {
								returnStr = returnStr + "?" + choice.choices[key].tip;
							}

							returnStr = returnStr + "={<"+ linebreak +"\t\t" +recurse(choice.choices[key], depth+2)+">}" + linebreak;
						}
						returnStr = returnStr + ")}" + linebreak;
					}
				}
				return returnStr.substring(0, returnStr.length-1);
			}
			for (var i in temps[data.key]) {
				strr = strr + recurse(temps[data.key][i], 0) + "\n";
			}
			humanReadable.val(strr);
		});
	});

	if (app.attr("xml")) {
		tabBar.generateTab("XML", "open-file", function(parent) {
			if (app.attr("xml") == "true") {
			  var raw = $("<textarea>").appendTo(parent);
			  raw.addClass("fit-x");
			  raw.css("flex", "2");
			  raw.attr("placeholder", "Paste/Drag XML file into here");
				div.on("dragover", function(e) {
			    e.preventDefault();
			    e.stopPropagation();
			    $(this).addClass('boxinshadow');
				});

				div.on("dragleave", function(e) {
			    e.preventDefault();
			    e.stopPropagation();
			    $(this).removeClass('boxinshadow');
				});
				div.unbind("drop");
				div.bind("drop", function(e) {
					e.stopPropagation();
					e.preventDefault();

					var files = e.originalEvent.dataTransfer.files;
					var multiple = (files.length > 1);
					for (var i=0; i<files.length; i++) {
						var reader = new FileReader();
						reader.ref = i;
						reader.onload = function(e2) {
							raw.val(e2.target.result);
							var res = xmlToJson($.parseXML(e2.target.result));
							if (multiple) {
								if (res.nodehandler) {
									pcgen_import(res, override);
								}
								else if (res["Character"]) {
									ogg_import(res, override);
								}
								else {
									raw.val("Sorry, we haven't build support for this tool yet! Head over to /r/gamemasterapp and request we make an importer for it!");
								}

								if (sync.val(override.info.name) == "Default Character") {
									sync.val(override.info.name, files[this.ref].name.replace(".txt", ""));
								}
								runCommand("createCharacter", override);
							}
							else {
								raw.change();
							}
						}
						reader.readAsText(files[i]);
					}
					$(this).removeClass('boxinshadow');
				});
			  raw.change(function(){
			    var res = xmlToJson($.parseXML($(this).val()));
					data.override = JSON.parse(JSON.stringify(game.templates.character || {}));
					if (res.nodehandler) {
						pcgen_import(res, data.override);
					}
					else if (res["Character"]) {
						ogg_import(res, data.override);
					}
					else {
						raw.val("Sorry, we haven't build support for this tool yet! Head over to /r/gamemasterapp and request we make an importer for it!");
					}
			  });
			}
		});
	}

	/*tabBar.generateTab("Web", "cloud-download", function(parent) {
		parent.empty();
		parent.addClass("flexcolumn");
		parent.css("height", "80%");
		parent.css("padding", "1em");

		parent.append("<b style='text-align : center;'>Got your other sheets off system?<br>Try these unofficial plugins!</b>");
		var list = $("<ul>").appendTo(parent);
		list.append("<li><a href='https://chrome.google.com/webstore/detail/roll20-character-parser-d/ifcmilildkphnhpceobdlbhhffdakocf'>Roll20 DnD - 5e Sheet Parser</a></li>");
		list.append("<li><a href='https://chrome.google.com/webstore/detail/roll20-character-parser-4/bbgjpikdfcbpadbmkclkbmmlaailacgc'>Roll20 40k - Dark Heresy Sheet Parser</a></li>");
		parent.append("<div class='flexmiddle'><p><i>Got some suggestions? Want to contribute?</i> <b><a href='https://github.com/Noobulater/ttrpg-web-parsers'>check out this github repo!</a></b></p></div>");
	});*/

	tabBar.selectTab("Text");
	tabBar.appendTo(div);

  if ($("#template-hint").length > 0) {
    layout.coverlay($("#template-hint"));
  }

  return div;
});

sync.render("ui_import_web", function(obj, app, scope) {
	if (!obj || !obj.data) {return $("<div>");}

	scope = scope || {viewOnly: app.attr("viewOnly") == "true"};
	var data = obj.data;
	var result = data.raw;

	var div = $("<div>");
	div.addClass("flexcolumn fit-xy");

	var flex = $("<div>").appendTo(div);
	flex.addClass("flexrow flexbetween");
	flex.css("flex", "1");

	var humanReadable = $("<textarea>").appendTo(flex);
	humanReadable.addClass("fit-y")
	humanReadable.css("width", "30%");
	humanReadable.attr("placeholder", "Paste in content retrieved by the web-extension");
	humanReadable.change(function(){
		data.override = JSON.parse(JSON.stringify(game.templates.character || {}));
		char_import($(this).val(), data.override);
	});

  var charContainer = $("<div>").appendTo(flex);
  charContainer.css("overflow-y", "none");
  charContainer.css("overflow-x", "none");
	charContainer.css("width", "70%");

  if ($("#template-hint").length > 0) {
    layout.coverlay($("#template-hint"));
  }

	return div;
});
