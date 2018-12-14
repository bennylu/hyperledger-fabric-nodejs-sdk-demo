var Fabric_Client = require('fabric-client');
var client = new Fabric_Client();
var fs = require('fs');

// set admin identity
var private_key = fs.readFileSync('./admin/private_key', 'utf8');
var certificate = fs.readFileSync('./admin/certificate', 'utf8');
var mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

var orderer = client.newOrderer('grpcs://localhost:7050', {
    'pem': fs.readFileSync('./tls/orderer.crt', 'utf8'),
    'ssl-target-name-override': 'orderer.example.com'
});

var peer0 = client.newPeer('grpcs://localhost:7051', {
    'pem': fs.readFileSync('./tls/peer0.crt', 'utf8'),
    'ssl-target-name-override': 'peer0.org1.example.com'
});

var peer1 = client.newPeer('grpcs://10.62.58.66:17051', {
    'pem': fs.readFileSync('./tls/peer1.crt', 'utf8'),
    'ssl-target-name-override': 'peer1.org1.example.com'
});

// join peers into a channel
var joinChannel = async (channel_name) => {
    var channel = client.newChannel(channel_name);

    // retreive genesis block from the orderer
    var genesis_block = await channel.getGenesisBlock({
        orderer,
        txId: client.newTransactionID(true)
    });

    var peers = [peer0, peer1];

    var join_request = {
        block: genesis_block,
        targets: peers,
        txId: client.newTransactionID(true),
    };

    return channel.joinChannel(join_request);
};

joinChannel('welcome').then(responses => {
    console.log(responses);
}).catch(err => {
    console.log(err);
});
