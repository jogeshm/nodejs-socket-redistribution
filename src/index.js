const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const bitbnsApi = require('bitbns');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origins: ["*"]}});

const bitbns = new bitbnsApi();
var priceData = {};

app.use(express.static(path.join(__dirname,'../public')));
app.get('/bitbns', (req, res) =>{
        res.send(priceData);  
})

// *** bitbns logic to receive data and process .. Start
const bitbns_socket = bitbns.getTickerSocket('INR');
bitbns_socket.on('connect', () => console.log('BITBNS Connected'));
bitbns_socket.on('ticker', res => {
    try {
        processData(res);
    } catch (e) {
        console.log('Error in the Stream', e)
    }
});

function processData (d){
    if (Object.keys(d) && Object.keys(d).length>2){
        Object.keys(d).forEach(k =>{
            priceData[k] = d[k].rate;
        })
    }else{
        priceData[d.coin] = d.rate;
        priceData['timestamp'] = new Date().getTime();
        try{
            // send updates to intrested users in that coin. 
            // find below logic to establish connections with our users and track their coins
            io.sockets.in(d.coin.trim().toLowerCase()).emit('ticker',{coin:d.coin, price:d.rate});
        }catch(error){
            console.log(error);
        }
        
    }
}

// *** bitbns logic to receive data and process .. End.

// *** Logic to establish socket connestions with our clients ...  Start
io.on('connection', (socket) => {
  socket.on('add_coin', (data)=>{
      //Once we receive request to follow certain coin, then respond with current price data and add that 
      // socket to a room to receive any future updates
      // in our case I am creating a room for each coin..  
      if(data.coin && priceData[data.coin]){
          socket.emit('ticker',{coin:data.coin, price:priceData[data.coin]})
          socket.join(data.coin.trim().toLowerCase());
     }else{
         console.log('Invalid data: '+ data);
     }        
  })

 socket.on("error", (err) => {
      if (err && err.message === "unauthorized event") {
        socket.emit('error', "unauthorized." );
        socket.disconnect();
      }else if(err){
        socket.emit('error', err.message );
        socket.disconnect();
      }else{
          socket.disconnect();
      }
    });

}); //io.on

// *** Logic to establish socket connestions with our clients ...  End.

server.listen(3005, () => {
    console.log('listening on *:3005');
});
