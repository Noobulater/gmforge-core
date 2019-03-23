(function () {
    'use strict';

    var request = require('ajax-request');
    var fs = require("fs");
    var archiver = require('archiver');
    var AdmZip = require('adm-zip');

    function getDirectories(path) {
      return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
      });
    }
    function removeDuplicates(a)
    {
        return a.filter(function(item, pos, self) { return self.indexOf(item) == pos; })
    }


    var cloudEnabled = false;
    var cloudFiles = {};
    var _MODS = [];
    function initCloud(max, cur) {
    }

    var options = {};
    try {
      options = JSON.parse(fs.readFileSync('./options.json', 'utf8'));
    }
    catch (err) {
      console.log("failed to load options");
    }

    const ngrok = require('ngrok');
    var ngrokURL;
    ngrok.kill();
    if (!options.noNgrok) {
      ngrok.connect(options.port || 30000).then(function(resultURL){
        ngrokURL = resultURL;
      });
    }


    if (cloudEnabled) {
      // load up the file cache

    }

    var express = require('express');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var handlebars = require('express-handlebars');
    var app = express();

    var compression = require('compression');

    // compress responses
    app.use(compression());

    var rimraf = require('rimraf');
    var mkdirp = require('mkdirp');
    var formidable = require('formidable');

    var natUpnp = require('nat-upnp');
    var cors = require('cors');
    var async = require('async');

    var client = natUpnp.createClient();
    var privatePort = options.port || 30000;
    var publicPort = Math.ceil(5536 + Number(privatePort));

    var externalIP;

    var os = require('os');

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    client.portMapping({
      public: publicPort,
      private: privatePort,
      ttl: 0
    }, function(err) {
      // Will be called once finished
    });

    /*client.portUnmapping({
      public: publicPort
    });*/

    client.getMappings(function(err, results) {});
    client.getMappings({local: true}, function(err, results) {});
    client.externalIp(function(err, ip) {
      if (!err) {
        externalIP = ip;
      }
      else {
        externalIP = "127.0.0.1";
      }
    });

    //view engine setup
    app.set('port', privatePort);
    app.engine('.hbs', handlebars({
      extname: '.hbs',
      layoutsDir:'views/layouts',
      partialsDir:'views/'
    }));
    app.set('view engine', '.hbs');

    app.use(cors({
      'allowedHeaders': ['sessionId', 'Content-Type'],
      'exposedHeaders': ['sessionId'],
      'origin': '*',
      'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'preflightContinue': false
    }));
    app.use(bodyParser.json({limit: '64mb'}));
    app.use(bodyParser.urlencoded({
      limit: '64mb',
      extended:true
    }));
    app.use("/core",express.static('./public'));

    app.use(cookieParser());
    app.get('/delete', function(req, res){
      var ip = req.ip;
      if (req.query.path) {
        if (isThisLocalhost(req)) {
          if (req.query.path[req.query.path.length-1] == "/" || req.query.path[req.query.path.length-1] == "\\") {
            rimraf('./public/custom' + req.query.path.substring(0, req.query.path.length-1), function() { res.redirect("/files"); });
          }
          else {
            fs.stat('./public/custom' + req.query.path, function (err, stats) {
              if (err) {
                return console.error(err);
              }
              fs.unlink('./public/custom' + req.query.path, (err) => {res.redirect("/files");});
            });
          }
        }
      }
      else {
        res.redirect("/files");
      }
    });
    app.get('/move', function(req, res){
      var ip = req.ip;
      if (req.query.path && req.query.newPath) {
        if (isThisLocalhost(req)) {
          fs.stat('./public/custom' + req.query.newPath, function (err, stats) {
            if (err) {
              fs.rename('./public/custom' + req.query.path, './public/custom' + req.query.newPath, function (err) {
                if (err) throw err;
                res.redirect("/files");
              });
              return;
            }
            else {
              if (err) throw err;
              res.send("File Already Exists");
            }
          });
        }
      }
      else {
        res.redirect("/files");
      }
    });
    app.get('/create', function(req, res){
      var ip = req.ip;
      if (req.query.path) {
        if (isThisLocalhost(req)) {
          mkdirp('./public/custom' + req.query.path, function(err) {
            res.redirect("/files");
          });
        }
      }
      else {
        res.redirect("/files");
      }
    });
    app.post('/patch', function(req, res){
      var ip = req.ip;
      var successes = {};
      if (req.body && req.body.upload && req.body.upload.length) {
        if (isThisLocalhost(req)) {
          for (var i=0; i<req.body.upload.length; i++) {
            function readWrap(file, index) {
              var buf = new Buffer(file.blob, 'base64'); // decode
              fs.writeFile('./' + file.path + file.name, buf, function(err) {
                if (err) {
                  console.log("err", err);
                }
                successes[index] = true;
                for (var j=0; j<req.body.upload.length; j++) {
                  if (successes[j] == null) {
                    return false;
                  }
                }
                res.redirect("/files");
              });
            }
            readWrap(req.body.upload[i], i);
          }
        }
      }
      else {
        res.redirect("/files");
      }
    });
    app.post('/upload', function(req, res){
      var ip = req.ip;
      var successes = {};
      if (req.body && req.body.upload && req.body.upload.length) {
        if (isThisLocalhost(req)) {
          for (var i=0; i<req.body.upload.length; i++) {
            function readWrap(file, index) {
              var buf = new Buffer(file.blob, 'base64'); // decode
              fs.writeFile('./public/custom' + file.path + file.name, buf, function(err) {
                if (err) {
                  console.log("err", err);
                }
                successes[index] = true;
                for (var j=0; j<req.body.upload.length; j++) {
                  if (successes[j] == null) {
                    return false;
                  }
                }
                res.redirect("/files");
              });
            }
            readWrap(req.body.upload[i], i);
          }
        }
      }
      else {
        res.redirect("/files");
      }
    });
    app.get('/files', function(req, res){
      var waiting = true;
      var waitTable = {};
      function read(path, success) {
        var data = {path : (path || ""), c : []};
        waitTable[path || "_root"] = true;
        fs.readdir("." + '/public/custom' + (path || ""), (err, files) => {
          for (var i in files) {
            if (files[i].match("\\.")) {
              data.c.push((path || "") + files[i]);
            }
            else {
              if (path) {
                read(path+files[i]+"\\", (list)=>{data.c.push(list);});
              }
              else {
                read("\\"+files[i]+"\\", (list)=>{data.c.push(list);});
              }
            }
          }
          waitTable[path || "_root"] = false;
          if (success) {
            success(data);
          }
        });

        return data;
      }
      var result = read();
      function sendRes(depth) {
        var waiting = false;
        for (var key in waitTable) {
          if (waitTable[key] == true) {
            waiting = true;
            break;
          }
        }
        if (!waiting || depth >= 10) {
          function recurseSort(list) {
            list.c.sort(function(a, b){
              var aname = a;
              if (a instanceof Object) {
                aname = a.path.toUpperCase();
                if (b instanceof Object) {
                  bname = b.path.toUpperCase();
                  if(aname < bname) return -1;
                  if(aname > bname) return 1;
                  return 0;
                }
                else {
                  return -1;
                }
              }
              var bname = b;
              if (b instanceof Object) {
                return 1;
              }
              aname = aname.split("\\")[aname.split("\\").length-1].toUpperCase();
              bname = bname.split("\\")[bname.split("\\").length-1].toUpperCase();
              if(aname < bname) return -1;
              if(aname > bname) return 1;
              return 0;
            });
            for (var i in list.c) {
              if (list.c[i] instanceof Object) {
                recurseSort(list.c[i]);
              }
            }
          }
          recurseSort(result);
          res.send(result);
        }
        else {
          setTimeout(function(){sendRes(depth+1);}, 1000);
        }
      }
      sendRes(0);
    });
    app.get('/', function(req, res){
      //res.redirect('/files');
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        ip = "127.0.0.1";
        res.render('index', {host : true, layout : "main"});
      }
      else {
        res.render('index', {player : true, layout : "main"});
      }
    });

    var server = app.listen(app.get('port'), function () {
      console.log('Express server listening on port ' + server.address().port);
    });


    var http = require('http');
    var session = require('express-session');

    var game = require('./lib/game');
    var users = require('./lib/users');

    // Session Support:
    var sessionStore = session({
      secret: 'octocat',
      saveUninitialized: false, // does not save uninitialized session.
      resave: false             // does not save session if not modified.
    });
    app.use(sessionStore);

    app.get('/createGame', function(req, res){
      game.createGame(userID,
        {
          name : gameName,
          password : gamePassword,
          ownerName : data.name || user.displayName,
          game : gameKey,
          gameID: id,
          url : genURL(userID.substring(userID.length-6, 6)),
          membership : data.membership,
        },
        (game)=>{
          res.send({url : '/'});
        },
        ()=>{res.send({url : '/'});}
      );
    });

    app.get('/game', function(req, res){
      res.render('index', {
        layout : "game",
        title : "GM Forge",
      });
    });

    app.get('/retrieveUser', function(req, res){
      var userID;
      res.send({displyName : "Game Host", membership : 400});
    });

    app.get('/cloud/:useToken/*', function(req, res) {
      res.redirect("https://files.gmforge.io/file/"+req.url.split("/cloud/")[1]);
    });

    app.get('/cdn/*', function(req, res) {
      res.header("Access-Control-Allow-Origin", "https://www.gmforge.io" || "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      var url = decodeURI(req.url);
      if (fs.existsSync("./public/content/" + url.replace("/cdn/", "").split("?")[0])) {
        res.sendFile(url.replace("/cdn/", "").split("?")[0], { root: "/public/content" });
      }
      else {
        res.sendFile("error.png", { root: "/public/content" });
      }
    });

    app.get('/join', function(req, res){
      var ip = req.ip;
      console.log(ngrokURL);
      if (req.query.userID && req.query.userID != "localhost") {
        if (!options.accounts || (!options.accounts[req.query.userID].password || options.accounts[req.query.userID].password == req.query.password)) {
          res.cookie("InternalIP", addresses[0] || "", 99999999999999)
          res.cookie("ExternalIP", externalIP || "", 99999999999999);
          res.cookie("PublicPort", publicPort || privatePort, 9999999999999);
          res.cookie("PublicLink", encodeURI(ngrokURL), 9999999999999);
          res.cookie("PrivatePort", publicPort, 9999999999999); // don't give them the private port regardless
          res.cookie("UserID", req.query.userID, 9999999999999999);
          res.render('game', {
            layout : "game",
            title : "GM Forge",
            local : (isThisLocalhost(req))?(true):(false)
          });
        }
        else {
          res.redirect("/");
        }
      }
      else {
        if ((isThisLocalhost(req) || (options.hostPW && req.query.password == options.hostPW)) && !req.query.select) {
          ip = "127.0.0.1";
          res.cookie("InternalIP", addresses[0] || "", 99999999999999)
          res.cookie("ExternalIP", externalIP || "", 99999999999999);
          res.cookie("PublicPort", publicPort  || privatePort, 9999999999999);
          res.cookie("PublicLink", encodeURI(ngrokURL), 9999999999999);
          res.cookie("PrivatePort", privatePort, 9999999999999);
          res.cookie("UserID", "localhost", 99999999999999);
          res.render('game', {host : true, layout : "game"});
        }
        else {
          res.render('index', {player : true, layout : "main"});
        }
      }
    });

    app.get('/loadGame', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        if (fs.existsSync("./public/worlds/" + req.query.gameData)) {
          fs.readFile("./public/worlds/" + req.query.gameData, 'utf8', function (err,data) {
            if (err) {
              return console.log(err);
            }
            game.createGame(data, req.query.gameName, req.query.gameKey, "localhost");
            res.send({text : "Successfully Loaded"});
          });
        }
        else {
          game.createGame(null, req.query.gameName, req.query.gameKey, "localhost");
          if (!req.query.gameData) {
            game.saveGame();
          }
          res.send({text : "Successfully Loaded"});
        }
      }
    });
    var users = require("./lib/users.js");
    users.initialize(server);

    app.get('/gameList', function(req, res){
      res.send({list : game.getGameTypes()});
    });

    var exitfn;
    app.get('/exit', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        exitfn();
        res.send({result : true});
      }
    });

    app.get('/getOptions', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        res.send(options);
      }
      else {
        var dupeOptions = JSON.parse(JSON.stringify(options));
        var tempOptions = {};
        tempOptions.accounts = dupeOptions.accounts;
        for (var k in tempOptions.accounts) {
          if (tempOptions.accounts[k].password) {
            tempOptions.accounts[k].password = true;
          }
        }
        res.send(tempOptions);
      }
    });
    app.get('/getWorlds', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        res.send(fs.readdirSync("./public/worlds"));
      }
    });

    app.get('/getWorkshopFiles', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        res.send(fs.readdirSync("./public/workshop"));
      }
    });

    app.get('/updateOptions', function(req, res){
      var ip = req.ip;
      if (isThisLocalhost(req)) {
        fs.writeFileSync('options.json', req.query.options, 'utf8');
        options = JSON.parse(req.query.options);
        res.send({result : true});
      }
    });

    app.get('/getCollections', function(req, res){
      var packList = [];
      fs.readdirSync("./public/collections").forEach(function(file){
        packList.push(file);
      });
      getDirectories("./public/workshop/").forEach(function(mod)
      {
        if(!fs.existsSync("./public/workshop/"+mod+"/collections")){return;}
        fs.readdirSync("./public/workshop/"+mod+"/collections").forEach(function(file){
          packList.push(file);
        });
      });
      packList = removeDuplicates(packList);
      res.send(packList);
    });

    app.get('/getFonts', function(req, res){
      var packList = [];
      fs.readdirSync("./public/fonts").forEach(function(file){
        packList.push(file);
      });
      getDirectories("./public/workshop/").forEach(function(mod)
      {
        if(!fs.existsSync("./public/workshop/"+mod+"/fonts")){return;}
        fs.readdirSync("./public/workshop/"+mod+"/fonts").forEach(function(file){
          packList.push(file);
        });
      });
      packList = removeDuplicates(packList);
      res.send(packList);
    });

    app.get('/getPacks', function(req, res){
      var packList = [];
      fs.readdirSync("./public/packs").forEach(function(file){
        packList.push(file);
      });
      getDirectories("./public/workshop/").forEach(function(mod)
      {
        if(!fs.existsSync("./public/workshop/"+mod+"/packs")){
          return;
        }
        fs.readdirSync("./public/workshop/"+mod+"/packs").forEach(function(file){
          packList.push(file);
        });
      });

      packList = removeDuplicates(packList);
      res.send(packList);
    });

    app.get('/getScripts', function(req, res){
      var packList = [];
      fs.readdirSync("./public/scripts").forEach(function(file){
        packList.push({src : file});
      });
      getDirectories("./public/workshop/").forEach(function(mod)
      {
        if(!fs.existsSync("./public/workshop/"+mod+"/scripts")){return;}
        fs.readdirSync("./public/workshop/"+mod+"/scripts").forEach(function(file){
          packList.push({src : file, mod : mod});
        });
      });

      packList = packList.filter((e, i) => {
        return packList.findIndex((x) => {return x.src == e.src;}) == i;
      });
      console.log(packList);
      res.send(packList);
    });

    app.get('/getMods', function(req, res){
      res.send(getDirectories("./public/workshop/"));
    });


    app.get('/getWhitelistedMods', function(req, res){
      if (game.getGame()) {
        res.send(game.getGame().config.library || {});
      }
      else {
        res.send({});
      }
    });

    var isThisLocalhost = function (req){
    
      var ip = req.connection.remoteAddress;
      var host = req.get('host');
      
      return ip === "127.0.0.1" || ip === "::ffff:127.0.0.1" || ip === "::1" || host.indexOf("localhost") !== -1;
  }

    app.get("/openFiles", function(req, res){
      var ip = req.ip;
      console.log(ip);
      if (isThisLocalhost(req)) {
        const {shell} = require('electron') // deconstructing assignment
        var path = require("path");

        var queryPath = "./public/custom";
        if (req.query && req.query.path) {
          queryPath = "./public" + req.query.path;
        }

        var absolutePath = path.resolve(queryPath);

        shell.openItem(absolutePath);
        console.log(absolutePath);
      }
    });


    app.get('/workshopPublish', function(req, res){

    });

    app.get('/myWorkshop', function(req, res){

    });

    app.get('/packagePack', function(req, res){
 
    });
    app.get('/workshopUpdate', function(req, res){

    });
    function mountMods()
    {
      console.log("\x1b[32mModloader: Mounting mods!")
      _MODS = getDirectories("./public/workshop/");
      for(var k in _MODS)
      {
        var k = _MODS[k];
        app.use('/'+encodeURIComponent('mod_'+k),express.static('.\\public\\workshop\\'+k));
        console.log('/'+encodeURIComponent('mod_'+k),'===>','.\\public\\workshop\\'+k);
      }
      console.log("Modloader: Mounting done.\x1b[0m")
    }
    function deleteFolderRecursive(path) {
      if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
          var curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    }
    function loadMods(callback)
    {

    }
    app.get('/workshopSync', function(req, res){

    });
    app.use(function(req, res, next) {
      if (req.url.indexOf('/core')==0||req.url.indexOf('/mod_')==0)
      {
        next();
        return;
      }
      var urlPath = decodeURIComponent(req.url);
      urlPath = /([^?]*).*/.exec(urlPath)[1]
      console.log("Request to:",urlPath);
      for(var k in _MODS)
      {
        var k = _MODS[k];
        var path = './public/workshop/'+k+urlPath
        if (fs.existsSync(path)) {
          res.redirect('/'+encodeURIComponent('mod_'+k)+urlPath);
          console.log("Redirected to "+encodeURIComponent('mod_'+k)+urlPath);
          return;
        }
      }
      res.redirect('/core'+req.url);
    });
    // synchronize workshop items

    loadMods(function(ret){
      console.log("Initial modload:",ret)
    })

    module.exports = {app : app, server : server, publicPort : publicPort, options : options, exit : function(cb){exitfn = cb;}};

}());
