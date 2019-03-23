sync.render("modManager", function(obj, app, scope) {
    var div = $("<div>");
    div.css("overflow","auto");
    div.addClass("flexcolumn flex lpadding");

    div.append("<h4>Drag to reorder/enable/disable mods.</h4>");

    div.append("<h3>Enabled mods:</h3>");
    var enabledList = $("<ul>").appendTo(div);
    div.append("<h3>Disabled mods:</h3>");
    var disabledList = $("<ul>").appendTo(div);
    enabledList.addClass("flexcolumn mod-list");
    disabledList.addClass("flexcolumn mod-list");
    enabledList.sortable({
        connectWith:".mod-list",
    });
    disabledList.sortable({
        connectWith:".mod-list",
    });
    enabledList.css({
        "padding":"0 0 3em 0"
    });
    disabledList.css({
        "padding":"0 0 3em 0"
    });
    var spacer = $("<div>").appendTo(div);
    spacer.addClass("flex");
    var btt = $("<button>Save</button>").appendTo(div);
    btt.click(function()
    {
        var enabledMods = [];
        enabledList.children().each(function(){
            enabledMods.push($(this).attr("mod"));
        });
        console.log(enabledMods);
        var data = {};
        data.EnabledMods = enabledMods;
        $.post( "/changeMods",data, function( data ) {
            console.log(data);
        });
        alert("You need to restart the game!");
    });
    $.getJSON( "/getMods", function(data)
    {
        for(var m in data.ModData)
        {
            m = data.ModData[m];
            var item = $("<li>")
            item.css("cursor","pointer");
            item.addClass("flexcolumn ui-state-default spadding");
            item.attr("mod",m.name);
            var name = $("<div>").appendTo(item);
            name.addClass("flex bold");
            var desc = $("<div>").appendTo(item);
            desc.addClass("flex spadding");
            desc.css({
                "max-height":"2em",
                "overflow":"hidden",
            })
            name.text(m.displayName);
            var t  = m.description;
            t = t.replace(/&/g, "&amp;")
            .replace(/\r/g,"")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/[\n]*\[h1\](.*?)\[\/h1\][\n]*/g,"<h4>$1</h4>")
            .replace(/[\n]*\[h2\](.*?)\[\/h2\][\n]*/g,"<h5>$1</h5>")
            .replace(/[\n]*\[h3\](.*?)\[\/h3\][\n]*/g,"<h6>$1</h6>")
            .replace(/\[b\](.*?)\[\/b\]/g,"<b>$1</b>")
            .replace(/\[i\](.*?)\[\/i\]/g,"<i>$1</i>")
            .replace(/\n/g,"<br>")
            desc.html(t);
            if(data.Enabled.indexOf(m.name)>=0)
            {
                enabledList.append(item);
                item.attr("enabled-id",data.Enabled.indexOf(m.name));
            }
            else
            {
                disabledList.append(item);
            }
        }
        var items = $('li', enabledList);
        items.sort(function(a,b){
            return $(a).attr("enabled-id") > $(b).attr("enabled-id");
        });
        items.attr("enabled-id",null);
        enabledList.append(items);
    });
    return div;
})