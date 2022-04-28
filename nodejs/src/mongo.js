//Libraries
const mongoose = require('mongoose');
const express = require('express')
const bodyParser = require('body-parser');
var rmq = require('amqplib/callback_api');


//Express Instance and port
const app = express()
const port = 3000


var rMQStart = false;
var aliveStatus = true;
var interval = new Date().getTime() / 1000;

var nodeMessage = { nodeID: nodeID, hostname: nodeHostName, lastMessage: interval, alive: alive };
var nodeList = [];
nodeList.push(nodeMessage);


//DB connect string
const connStr = 'mongodb://localmongo1:27017,localmongo2:27017,localmongo3:27017/NotFLIXDB?replicaSet=rs0';

//Node outputs live status every 5 sec
setInterval(function () {
  rmq.connect('amqp://user:bitnami@6130COMP-Assignment_haproxy_1', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var status = "node alive";
      interval = new Date().getTime() / 1000;
      var msg = `{"nodeID": ${nodeID}, "hostname": "${nodeHostName}", "alive":"${aliveStatus}"}`
      var jsonMsg = JSON.stringify(JSON.parse(msg));
      channel.assertExchange(status, 'fanout', {
        durable: false
      });
      channel.publish(status, '', Buffer.from(jsonMsg));
    });
    setTimeout(function () {
      connection.close();
    }, 500);
  });
}, 5000);

//Node subscribe to msg
rmq.connect('amqp://user:bitnami@6130COMP-Assignment_haproxy_1', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var status = 'node alive';
    channel.assertExchange(status, 'fanout', {
      durable: false
    });
    channel.assertQueue('', {
      exclusive: true
    }, function (error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages. Press CTRL+C to exit", q.queue);
      channel.bindQueue(q.queue, status, '');
      channel.consume(q.queue, function (msg) {
        if (msg.content) {
          rMQStart = true;
          var msgNode = JSON.parse(msg.content.toString());
          interval = new Date().getTime() / 1000;
          if (nodeList.some(nodes => nodes.hostname === msgNode.hostname)) {
            var matchedNode = nodeList.find(e => e.hostname === msgNode.hostname);
            matchedNode.lastMessage = interval;
            if (matchedNode.nodeID !== msgNode.nodeID) {
              matchedNode.nodeID = msgNode.nodeID;
            }
          } else {
            nodeList.push(msgNode);
          }
          console.log("List of Alive Nodes");
          console.log(nodeList);
        }
      }, {
        noAck: true
      });
    });
  });
});



//Tell Express to use body parser
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