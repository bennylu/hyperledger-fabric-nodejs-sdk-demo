var Fabric_Client = require('fabric-client');
var client = new Fabric_Client();
var fs = require('fs');

// set admin identity
var private_key = fs.readFileSync('./admin/private_key', 'utf8');
var certificate = fs.readFileSync('./admin/certificate', 'utf8');
var mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

var peer0 = client.newPeer('grpcs://localhost:7051', {
    'pem': fs.readFileSync('./tls/peer0.crt', 'utf8'),
    'ssl-target-name-override': 'peer0.org1.example.com'
});

var peer1 = client.newPeer('grpcs://10.62.58.66:17051', {
    'pem': fs.readFileSync('./tls/peer1.crt', 'utf8'),
    'ssl-target-name-override': 'peer1.org1.example.com'
});

var peers = [peer0, peer1];

// instantiate chaincode
var instantiateChaincode = async (channel_name, name, version, type, fcn, args) => {
    var channel = client.newChannel(channel_name);
    var txId = client.newTransactionID(true);
    var deployId = txId.getTransactionID();

    var request = {
        txId,
        targets : peers,
        chaincodeId: name,
        chaincodeType: type,
        chaincodeVersion: version,
        'endorsement-policy': {
            identities: [{role: {name: 'member', mspId: 'Org1MSP'}}],
            policy: {'1-of': [{'signed-by': 0}]}
        },
        fcn,
        args
    };

    return channel.sendInstantiateProposal(request, 60000);
};

instantiateChaincode('welcome', 'mycc', '1.0', 'golang', 'init', ['a', '100', 'b', '200']).then(responses => {
    console.log(responses);
}).catch(err => {
    console.log(err);
});
