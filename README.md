# nodejs-socket-redistribution
Receive socket data from any source like Zerodha / BITBNS exchanges and redistribute transformed data to your clients. Spoke-and-Hub-and-Spoke model 

BITBNS is an India based crypto exchange and we will be using their socket connection to receive crypto coins ticker data, store it and process it to redistribute to our users

To read more about BITBNS
https://bitbns.com/
https://github.com/bitbns-official/

# To open socket connection
# Open chrome browser (http://localhost:3005/main.html) > Developer tools > console 
const socket = io('http://localhost:3005');

# Add few coin to follow
socket.emit('add_coin', {"coin":'BTC'});
socket.emit('add_coin', {"coin":'SHIB'});
socket.emit('add_coin', {"coin":'ETH'});
socket.emit('add_coin', {"coin":'XLM'});

# Listner to receive coin updates
socket.on('ticker', (data) => {console.log(data.coin +": "+ data.price)})

# Now wait and watch the updates 