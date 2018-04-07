(function () {
    'use strict';
    var request = require('ajax-request');

    var express = require('express');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var handlebars = require('express-handlebars');
    var fs = require("fs");
    var app = express();

    var rimraf = require('rimraf');
    var mkdirp = require('mkdirp');
    var formidable = require('formidable');

    var natUpnp = require('nat-upnp');
    var cors = require('cors');
    var async = require('async');

    var client = natUpnp.createClient();
    var privatePort = 30000;
    var publicPort = Math.ceil(5536 + privatePort);

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
    client.externalIp(function(err, ip) {externalIP = ip;});

    //view engine setup
    app.set('port', privatePort);
    app.engine('.hbs', handlebars({
      extname: '.hbs',
      layoutsDir:'views/layouts',
      partialsDir:'views/'
    }));
    app.set('view engine', '.hbs');

    app.use(express.static("." + '/public'));

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

    app.use(cookieParser());
    app.get('/delete', function(req, res){
      var ip = req.ip;
      if (req.query.path) {
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
      if (ip == "::ffff:127.0.0.1" || ip == "::1") {
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
      var authed = req.isAuthenticated();
      res.redirect(hostURL+"/file/"+req.url.split("/cloud/")[1]);
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
      if (req.query.userID && req.query.userID != "localhost") {
        res.cookie("InternalIP", addresses[0] || "", 99999999999999)
        res.cookie("ExternalIP", externalIP || "", 99999999999999);
        res.cookie("PublicPort", publicPort  || privatePort, 9999999999999);
        res.cookie("UserID", req.query.userID, 9999999999999999);
        res.render('game', {
          layout : "game",
          title : "GM Forge",
        });
      }
      else {
        var ip = req.ip;
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
          ip = "127.0.0.1";
          res.cookie("InternalIP", addresses[0] || "", 99999999999999)
          res.cookie("ExternalIP", externalIP || "", 99999999999999);
          res.cookie("PublicPort", publicPort  || privatePort, 9999999999999);
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
      if (ip == "::ffff:127.0.0.1" || ip == "::1") {
        if (fs.existsSync("./public/" + req.query.gameData)) {
          fs.readFile("./public/" + req.query.gameData, 'utf8', function (err,data) {
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

    module.exports = {app : app, server : server, publicPort : publicPort};

}());
