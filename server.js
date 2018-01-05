//  OpenShift sample Node application
var express = require('express'),
    app     = express();

Object.assign=require('object-assign');			

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

// endpoints
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};



// endpoints
app.get('/', function(req, res){
    res.send('hello ROOT world and webhook 4');
    /*
   // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
  */
});

console.log("Registering endpoint: /stubbed");
app.get('/stubbed', function(req, res){
    res.send('hello STUBBED 4');
});

console.log("Registering endpoint: /jsonendpoint");
app.get('/jsonendpoint', function(req, res){
   res.json({
        "mykey" : "myvalue", 
        "testy" : "something", 
        "exnum" : 123
    });
});

console.log("Registering createcollection: /create");
app.get('/create', function(req, res){
	 // try to initialize the db on every request if it's not already
	 // initialized.
	 if (!db) {
	   initDb(function(err){});
	 }
	 if (db) {
	    db.createCollection("customers", function(err, res) {
	    if (err) throw err;
	    console.log("Collection created!");
	    db.close();
	    });
	    var myobj = [
	    { _id: 1, name: 'John', address: 'Highway 71'},
	    { _id: 2, name: 'Peter', address: 'Lowstreet 4'},
	    { _id: 3, name: 'Amy', address: 'Apple st 652'},
	    { _id: 4, name: 'Hannah', address: 'Mountain 21'},
	    { _id: 5, name: 'Michael', address: 'Valley 345'},
	    { _id: 6, name: 'Sandy', address: 'Ocean blvd 2'},
	    { _id: 7, name: 'Betty', address: 'Green Grass 1'},
	    { _id: 8, name: 'Richard', address: 'Sky st 331'},
	    { _id: 9, name: 'Susan', address: 'One way 98'},
	    { _id: 10, name: 'Vicky', address: 'Yellow Garden 2'},
	    { _id: 11, name: 'Ben', address: 'Park Lane 38'},
	    { _id: 12, name: 'William', address: 'Central st 954'},
	    { _id: 13, name: 'Chuck', address: 'Main Road 989'},
	    { _id: 14, name: 'Viola', address: 'Sideway 1633'}
	  ];
	  
	  db.collection("customers").insertMany(myobj, function(err, res) {
	    if (err) throw err;
	    console.log("Number of documents inserted: " + res.insertedCount);
	    db.close();
	  });
    }
});


//Se agrega get, el cual retorna la lista completa de dato presentes en la tabla, en forma de arreglo
app.get('/data', function(req, res){

	console.log("\nReceived GET request to /data");

	// try to initialize the db on every request if it's not already
	// initialized.
	if (!db) {
	   initDb(function(err){});
	}
    
    if (db) {
 	 db.collection("customers").find({}).toArray(function(err, result) {
	  if (err) throw err;
	    console.log(result); // entrega json en consola que corre el servidor
	    //res.json(JSON.stringify(result));  // entrega string del json encerrado por paréntesis cuadrádos [<json>], por ser un arreglo
	    res.json(result); // Entrega arreglo con resultados en la consola del cliente
	    //res.jsonp(result); //en este caso hace lo mismo que el anterior, falta leer documentación
	    db.close();
	 })
    }
});

//Se agrega un post que lee datos del "body" de la petición, el cual contiene el id del usuario cuyos datos se desean conocer. Estos datos son 
//retornados en la consola del cliente.
app.post('/data', function(req, res){

  console.log("\nReceived POST request to /data");
  var body_data = req.body;  //datos de la petición
  var headers_data = req.headers; //cabecera de la petición
  //Se imprimen cuerpo y cabecera en consola del servidor
  console.log(req.body);
  console.log(req.headers); 

  // try to initialize the db on every request if it's not already
	// initialized.
	if (!db) {
	   initDb(function(err){});
    }
    
    if (db) {  
    dbase.collection("customers").findOne(body_data, function(err, result) {
    if (err) throw err;
    console.log("Trying to find document...")
    console.log(result); //Se imprime output en consola del servidor
    res.json(result);    //Se imprime output en consola del cliente
    db.close();
    });
	}
}

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


// run server
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
