// Author: Ang Kah Shin

var app = require('./controller/app.js');
var port = 8081;

var server = app.listen(process.env.PORT || port, function () {
    console.log("App hosted at localhost:" + port);

});
