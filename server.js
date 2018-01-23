// OpenShif6t sample Node application

// MODULES: express & mongodb
var express = require('express'),
    app     = express();
    mongodb = require('mongodb');	

// MODULE: bodyparser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse application/json

// MODULE: morgan
var morgan  = require('morgan');
app.use(morgan('combined'))

// MODULE: object-assign
Object.assign=require('object-assign');			

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mariaURL = process.env.OPENSHIFT_MARIADB_DB_URL || process.env.MARIA_URL,
    mariaURLLabel = "";

//Importar sql
var mysql=require('mysql');

// FUNCTION: env_data -> Look at env through prints in console
var env_data = function () {

	//console.log("Printing process.env...\n")
	//console.log(process.env);
	console.log("\nPort =" + port);
	console.log("IP =" +  ip);
	console.log("mariaURL =" + mariaURL);
	console.log("\n\nDATABASE_SERVICE_NAME =" + process.env.DATABASE_SERVICE_NAME);
	console.log("\n\n Maria data:\n")
	console.log("mariaServiceName =" + mariaServiceName);
	console.log("mariaHost =" + mariaHost);
	console.log("mariaPort =" + mariaPort);
	console.log("mariaDatabase =" + mariaDatabase);
	console.log("mariaPassword =" + mariaPassword);
	console.log("mariaUser =" + mariaUser);
	console.log("\nmariaURLLabel =" + mariaURLLabel);
	console.log("mariaURL =" + mariaURL);
	console.log(con);
	console.log("\nPrinting openshift env data...");
	console.log(process.env.OPENSHIFT_ENV_VAR);

}

// Database info
if (mariaURL == null && process.env.DATABASE_SERVICE_NAME) {
	
  var mariaServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mariaHost = process.env[mariaServiceName + '_SERVICE_HOST'],
      mariaPort = process.env[mariaServiceName + '_SERVICE_PORT'],
      mariaDatabase = process.env[mariaServiceName + '_DATABASE'],
      mariaPassword = process.env[mariaServiceName + '_PASSWORD']
      mariaUser = process.env[mariaServiceName + '_USER'];

  if (mariaHost && mariaPort && mariaDatabase) {

    mariaURLLabel = mariaURL = 'mariadb://';
    if (mariaUser && mariaPassword) {
      mariaURL += mariaUser + ':' + mariaPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mariaURLLabel += mariaHost + ':' + mariaPort + '/' + mariaDatabase;
    mariaURL += mariaHost + ':' +  mariaPort + '/' + mariaDatabase;

  }

}

//Crear variable de conexion
var con = mysql.createConnection( {
	host : mariaHost,
	user: mariaUser,
	password: mariaPassword,
	database: mariaDatabase,
	port: mariaPort,
	//hostname: "mariadb-4-5r99w"
});

con.connect(function(err) {
  		if (err) { 
  			console.log("Error while attempting to connect to DB ");
  			console.log(err);
  			//res.send("Error while attempting to connect to DB ");	
  			//throw err;
  		}
  		else {
  			console.log("Database connection success!")
  		}
});


/*
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {

  console.log("Running initDb");	
  if (mariaURL == null) {
  ¿	console.log("mariaURL = null");
  	return;
  }

  var mariadb = require('mariadb');
  if (mariadb == null) {
  	console.log("mariadb = null");
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
*/

// Endpoints
app.get('/', function(req, res){

	client_ip = req.ip;
	client_external_ip = req.headers['x-forwarded-for'];
	console.log("Received GET request to ROOT (/)");
	console.log("Client's IP = " + client_ip);
    res.send('Hello ROOT world. Bienvenido a la versión 1.6 de la app.\n \n Su dirección IP es: '+ client_external_ip); 

});

console.log("Registering endpoint: /version");
app.get('/version', function(req, res){ 

	console.log("Received GET request to /version");
    res.send('Version: 1.6: MariaDB funcional, health check test 5');  // 1.0 =  1ra version modificada del día 09/01/2018    

});

console.log("Registering endpoint: /reqinfo");
app.get('/reqinfo', function(req, res){

	console.log("Received GET request to /reqinfo");
	console.log(req);
    res.send("Printing request info at server's console");

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

	// Mariadb code
	console.log("Attempting to connect to create db and insert data into it...");
  	var sql = "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))";
  	con.query(sql, function (op_error, result) {
    	if (op_error) { 
    		console.log("Error found while attempting to create table: customers");
    		console.log(op_error);
    		//res.send("Error found while attempting to create table: customers");
    		//throw err;
    	}
    	console.log("Table 'customers' created");
  	});
  	// Crea tabla registry
  	var sql = "CREATE TABLE registry (id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(255), date VARCHAR(255), url VARCHAR(255))";
  	con.query(sql, function (op_error, result) {
    	if (op_error) { 
    		console.log("Error found while attempting to create table: registry");
    		console.log(op_error);
    		//res.send("Error found while attempting to create table: registry");
    		//throw err;
    	}
    	console.log("Table 'registry' created");
  	});


  	var sql = "INSERT INTO customers (name, address) VALUES ?";
  	var values = [
    ['John', 'Highway 71'],
    ['Peter', 'Lowstreet 4'],
    ['Amy', 'Apple st 652'],
    ['Hannah', 'Mountain 21'],
    ['Michael', 'Valley 345'],
    ['Sandy', 'Ocean blvd 2'],
    ['Betty', 'Green Grass 1'],
    ['Richard', 'Sky st 331'],
    ['Susan', 'One way 98'],
    ['Vicky', 'Yellow Garden 2'],
    ['Ben', 'Park Lane 38'],
    ['William', 'Central st 954'],
    ['Chuck', 'Main Road 989'],
    ['Viola', 'Sideway 1633']
  	];

    con.query(sql, [values], function (op_error, result) {
	    if (op_error) {
	    	console.log("Error found while attempting to insert records into the table.")
    		console.log(op_error);
    		res.send({message:"Error found while attempting to insert records into the table.", error: op_error.message});
	    // throw err;
		} else {
	    console.log("Number of records inserted: " + result.affectedRows);
	    res.send("Message were inserted succesfully.");
		}
  	});

	
});


//Se agrega get, el cual retorna la lista completa de dato presentes en la tabla, en forma de arreglo
app.get('/data', function(req, res){

	console.log("\nReceived GET request to /data");

	// Mariadb code
	console.log("Attempting to get all data from 'customers'...");
	
  	con.query("SELECT * FROM customers", function (op_error, result, fields) {
	    if (op_error) {
	    	console.log("Error found while attempting to get all data.");
  			console.log(op_error.stack);		  			
  			res.send("Error found while attempting to get all data.");
        	//throw err;
	    } else {	    
		    console.log(result);
		    //console.log(fields);
		    //res.json(result);
		    res.status(200).json({result});
		}
		res.end();
    });

    client_external_ip = req.headers['x-forwarded-for'];
    req_url = req.headers.host;
  	console.log(client_external_ip);
  	console.log(req_url);
    
    var sql = "INSERT INTO registry (ip, date, url) VALUES ?";
    var values = [
	[client_external_ip, new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), req_url ]
    	];

	con.query(sql, [values], function (op_error, result) {
		    if (op_error) {
	    		console.log("Error found while attempting to save registry.");
  				console.log(op_error);		  			
  				//res.send("Error found while attempting to save registry");
     			//throw err;
		    }
		    console.log("Date record inserted into registry");
	});
	
	 

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


	// Mariadb code
	console.log("Attempting to connect to get a particular record from customers table...");
	
	user_name = body_data.name;
  	con.query("SELECT * FROM customers WHERE name= ?",[user_name], function (op_error, result, fields) {
	    if (op_error) {
	    	console.log("Error found while attempting to get a particular record.");
  			console.log(op_error);		  			
  			res.send("Error found while attempting to get a particular record.");
        	//throw err;
	    }	    
	    console.log(result);
	    res.json(result);
    });

    client_external_ip = req.headers['x-forwarded-for'];
    req_url = req.headers.host;
  	console.log(client_external_ip);
  	console.log(req_url);
    
    var sql = "INSERT INTO registry (ip, date, url) VALUES ?";
    var values = [
	[client_external_ip, new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), req_url ]
    	];

	con.query(sql, [values], function (op_error, result) {
		    if (op_error) {
	    		console.log("Error found while attempting to save registry.");
  				console.log(op_error);		  			
  				//res.send("Error found while attempting to save registry");
     			//throw err;
		    }
		    console.log("Date record inserted into registry");
	}); 		  	
	
    
}); 

//Se agrega get, el cual retorna la lista completa de dato presentes en la colección de registro
app.get('/registry', function(req, res){

	console.log("\nReceived GET request to /registry");

	// Mariadb code
	con.query("SELECT * FROM registry", function (op_error, result, fields) {
	    if (op_error) {
	    	console.log("Error found while attempting to get all data from registry.");
  			console.log(op_error);		  			
  			res.send("Error found while attempting to get all data from registry.");
        	//throw err;
	    } else {	    
	    console.log(result);
	    res.json(result);
	    }
	});
	
});


app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// run server
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
