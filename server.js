//  OpenShif6t sample Node application
var express = require('express'),
    app     = express();
    mongodb = require('mongodb');	

var bodyParser = require('body-parser');
// parse application/json
app.use(bodyParser.json());

//morgan
var morgan  = require('morgan');
app.use(morgan('combined'))


Object.assign=require('object-assign');			

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

// Look at env
var env_data = function () {
	//console.log("Printing process.env...\n")
	//console.log(process.env);
	console.log("\nPort =" + port);
	console.log("IP =" +  ip);
	console.log("mongoURL =" + mongoURL);
	console.log("\n\nDATABASE_SERVICE_NAME =" + process.env.DATABASE_SERVICE_NAME);
	console.log("\n\n Mongo data:\n")
	console.log("mongoServiceName =" + mongoServiceName);
	console.log("mongoHost =" + mongoHost);
	console.log("mongoPort =" + mongoPort);
	console.log("mongoDatabase =" + mongoDatabase);
	console.log("mongoPassword =" + mongoPassword);
	console.log("mongoUser =" + mongoUser);
	console.log("\nmongoURLLabel =" + mongoURLLabel);
	console.log("mongoURL =" + mongoURL);
}

// Database info
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
  console.log("Running initDb");	
  if (mongoURL == null) {
  	console.log("mongoURL = null");
  	return;
  }

  var mongodb = require('mongodb');
  if (mongodb == null) {
  	console.log("mongodb = null");
  	return;
  }

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
   	  console.log("Error al conectar con DB @ initDb")
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
	client_ip = req.ip;
	client_external_ip = req.headers['x-forwarded-for'];
	console.log("Received GET request to ROOT (/)");
	console.log("Client's IP = " + client_ip);
    res.send('Hello ROOT world. Bienvenido a la versión 1.3.\n \n Su dirección IP es: '+ client_external_ip);    

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

console.log("Registering endpoint: /version");
app.get('/version', function(req, res){
	console.log("Received GET request to /version");
    res.send('Version: 1.3: Error handling updated');
    // 1.0 =  1ra version modificada del día 09/01/2018
});

console.log("Registering endpoint: /reqinfo");
app.get('/reqinfo', function(req, res){
	console.log("Received GET request to /reqinfo");
	console.log(req);
    res.send("Printing request info at server's console");
    // 1.0 =  1ra version modificada del día 09/01/2018
});

console.log("Registering endpoint: /jsonendpoint");
app.get('/jsonendpoint', function(req, res){
   console.log("Received GET request to /jsonendpoint");
   res.json({
        "mykey" : "myvalue", 
        "testy" : "something", 
        "exnum" : 123
    });
});

console.log("Registering endpoint: /env");
app.get('/env', function(req, res){
	console.log("Received GET request to /env");
    res.send('Printing environment data in server console ...');
    env_data();
});


console.log("Registering db init: /init");
app.get('/init', function(req, res){
	console.log("Received GET request to /init");
	res.send("Initializing database...");
	// Inicializo conexión con db. Es decir, me conecto por primera vez y guardo los datos en objeto.
    initDb(function(err){});    
});


console.log("Registering createcollection: /create");
app.get('/create', function(req, res){

	console.log("\nReceived GET request to /create");

	 // try to initialize the db on every request if it's not already
	 // initialized.
	 if (!db) {
	 	console.log("DB not initialized. Calling initDb...");
	   initDb(function(err){});
	 }
	 if (db) {
	 	console.log("DB initialized. Attempting to create collection and insert data.");
	 	mongodb.connect(mongoURL, function(err, db) {
		    if (err) {
		   	  console.log("Error al conectar con DB @ /create");
		   	  res.send("Error while attempting to connect to DB @ /create.");
		   	  console.log(err);
		      callback(err);
		      return;
		    }		 	
		    db.createCollection("customers", function(op_error, result) {
		    	if (op_error) {
		    		console.log("Error found while attempting to create collection");
		    		console.log(op_error);
		    		res.send("Error found while attempting to create collection");
		    		//throw err;
		   		}
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
		  
		  	db.collection("customers").insertMany(myobj, function(op_error, result) {
		    	if (op_error) {
		    		console.log("Error found while attempting to insert documents into the collection.")
		    		console.log(op_error);
		    		res.send({message:"Error found while attempting to insert documents into the collection.", error: op_error.message});
		   			//throw err;
		   		}
		    	console.log("Number of documents inserted: " + res.insertedCount);
		    	db.close();
		  	});
		});
    }
});


//Se agrega get, el cual retorna la lista completa de dato presentes en la tabla, en forma de arreglo
app.get('/data', function(req, res){

	console.log("\nReceived GET request to /data");

	// try to initialize the db on every request if it's not already
	// initialized.
	if (!db) {
	   console.log("DB not initialized. Calling initDb...");
	   initDb(function(err){});
	}
    
    if (db) {
    	mongodb.connect(mongoURL, function(err, db) {
		    if (err) {
		   	  console.log("Error al conectar con DB @ data")
		      callback(err);
		      return;
		    }
		    client_external_ip = req.headers['x-forwarded-for'];
		    if (client_external_ip == "152.231.106.195" || client_external_ip == "191.125.170.192") {
	      	db.collection("customers").find({}).toArray(function(op_error, result) {
		  		if (op_error) {
		  			console.log("Error found while attempting to get all data.");
		  			console.log(op_error);		  			
		  			res.send("Error found while attempting to get all data.");
		  			//throw err;
		  		}

		    	console.log(result); // entrega json en consola que corre el servidor
		    	//res.json(JSON.stringify(result));  // entrega string del json encerrado por paréntesis cuadrádos [<json>], por ser un arreglo
		    	res.json(result); // Entrega arreglo con resultados en la consola del cliente
		    	//res.jsonp(result); //en este caso hace lo mismo que el anterior, falta leer documentación
		    	var col = db.collection('registry');
   				// Create a document with request IP and current time of request
    			col.insert({ip: client_external_ip, date: Date.toISOString().replace(/T/, ' ').replace(/\..+/, '') });
		    	db.close();
		 	})
	 	 	} else {
	 	 		res.send("Not authorized (wrong IP)");
	 	 	}
	 	});
    }
});

//Se agrega un post que lee datos del "body" de la petición, el cual contiene el id del usuario cuyos datos se desean conocer. Estos datos son 
//retornados en la consola del cliente.
app.post('/data', function(req, res){

  console.log("\nReceived POST request to /data");
  var body_data = req.body;  //datos de la petición
  var headers_data = req.headers; //cabecera de la petición
  //Se imprimen cuerpo y cabecera en consola del servidor
  //console.log(req);
  console.log("Body data: " + req.body);
  console.log("Header data: " + req.headers); 

  // try to initialize the db on every request if it's not alreadygi
	// initialized.
	if (!db) {
	   console.log("DB not initialized. Calling initDb...");
	   initDb(function(err){});
    }
    
    if (db) {
    	console.log("DB initialized. Attempting to get a particular set of data.");
    	mongodb.connect(mongoURL, function(err, db) {
		    if (err) {
		   	  console.log("Error al conectar con DB @ /data (POST)")
		      callback(err);
		      return;
		    }		      
		    db.collection("customers").findOne(body_data, function(op_error, result) {
		    	if (op_error) {
			 		console.log("Error found while attempting to get a particular document.");
			 		console.log(op_error);
		     		res.send("Error found while attempting to get a particular document.");
		    		//throw err;
		    	}
		    	console.log("Trying to find document...")
		    	console.log(result); //Se imprime output en consola del servidor
		    	res.json(result);    //Se imprime output en consola del cliente
		    	db.close();
		    });
		});
	}
});  // fixed

//Se agrega get, el cual retorna la lista completa de dato presentes en la colección de registro
app.get('/registry', function(req, res){

	console.log("\nReceived GET request to /registry");

	// try to initialize the db on every request if it's not already
	// initialized.
	if (!db) {
	   console.log("DB not initialized. Calling initDb...");
	   initDb(function(err){});
	}
    
    if (db) {
    	mongodb.connect(mongoURL, function(err, db) {
		    if (err) {
		   	  console.log("Error al conectar con DB @ registry")
		      callback(err);
		      return;
		    }
		    client_external_ip = req.headers['x-forwarded-for'];
		    if (client_external_ip == "152.231.106.195" || client_external_ip == "191.125.170.192") {
	      	db.collection("registry").find({}).toArray(function(op_error, result) {
		  		if (op_error) {
		  			console.log("Error found while attempting to get all data.");
		  			console.log(op_error);		  			
		  			res.send("Error found while attempting to get all data.");
		  			//throw err;
		  		}

		    	console.log(result); // entrega json en consola que corre el servidor
		    	//res.json(JSON.stringify(result));  // entrega string del json encerrado por paréntesis cuadrádos [<json>], por ser un arreglo
		    	res.json(result); // Entrega arreglo con resultados en la consola del cliente
		    	//res.jsonp(result); //en este caso hace lo mismo que el anterior, falta leer documentación
		    	db.close();
		 	})
	 	 	} else {
	 	 		res.send("Not authorized (wrong IP)");
	 	 	}
	 	});
    }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


// run server
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
