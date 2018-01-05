//  OpenShift sample Node application
var express = require('express'),
    app     = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
    
app.get('/', function(req, res){
    res.send('hello ROOT world and webhook');
});

console.log("Registering endpoint: /stubbed");
app.get('/stubbed', function(req, res){
    res.send('hello STUBBED 2');
});

console.log("Registering endpoint: /testing");
app.get('/testing', function(req, res){
    res.send('this is a test endpoint');
});

console.log("Registering endpoint: /jsonendpoint");
app.get('/jsonendpoint', function(req, res){
    res.json({
        "mykey" : "myvalue", 
        "testy" : "something", 
        "exnum" : 123
    });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});



app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
