//Libraries
const mongoose = require('mongoose');
const express = require('express')
const bodyParser = require('body-parser');

//Express Instance and port
const app = express()
const port = 3000

//DB connect string
const connStr = 'mongodb://localmongo1:27017,localmongo2:27017,localmongo3:27017/NotFLIXDB?replicaSet=rs0';

setInterval(function() {

  console.log(`Intervals are used to fire a function for the lifetime of an application.`);

}, 3000);

//tell express to use the body parser. Note - This function was built into express but then moved to a seperate package.
app.use(bodyParser.json());

//connect to the cluster
mongoose.connect(connStr, {useNewUrlParser: true, useUnifiedTopology: true});


var DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'Connection Error:'));

var Schema = mongoose.Schema;

var NotFlixLog = new Schema({
  _id: Number,
  accountID: Number,
  userName: String,
  titleID: Number,
  userAction: String,
  dateAndTime: Date,
  pointOfInteraction: String,
  typeOfInteraction: String
});

var logsModel = mongoose.model('Logs', NotFlixLog, 'logs');

app.get('/', (req, res) => {
  logsModel.find({},'userName titleID userAction dateAndTime pointOfInteraction typeOfInteraction', (err, logs) => {
    if(err) return handleError(err);
    res.send(JSON.stringify(logs))
  }) 
})

app.post('/',  (req, res) => {
  var awesome_instance = new SomeModel(req.body);
  awesome_instance.save(function (err) {
  if (err) res.send('Error');
    res.send(JSON.stringify(req.body))
  });
})

app.put('/',  (req, res) => {
  res.send('PUT request at /')
})

app.delete('/',  (req, res) => {
  res.send('DELETE request at /')
})



app.listen(port, () => {
 console.log(`Express Application listening at port ` + port)
})