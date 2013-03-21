
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var azure = require('azure')
  , nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json'});
var tableName = nconf.get("TABLE_NAME")
  , partitionKey = nconf.get("PARTITION_KEY")
  , accountName = nconf.get("STORAGE_NAME")
  , accountKey = nconf.get("STORAGE_KEY");
  
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var TaskList = require('./routes/tasklist');
var Task = require('./models/task');
var task = new Task(
    azure.createTableService(accountName, accountKey)
  , tableName
  , partitionKey);
var taskList = new TaskList(task);

app.get('/', taskList.showTasks.bind(taskList));
app.post('/addtask', taskList.addTask.bind(taskList));
app.post('/completetask', taskList.completeTask.bind(taskList));
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
