var Fabric_Client = require('fabric-client');
var client = new Fabric_Client();
var fs = require('fs');

// set admin identity
const private_key = fs.readFileSync('./admin/private_key', 'utf8');
const certificate = fs.readFileSync('./admin/certificate', 'utf8');
const mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

const peer0 = client.newPeer('grpcs://10.62.58.64:7051', {
    'pem': fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt', 'utf8'),
    'ssl-target-name-override': 'peer0.org1.example.com'
});

const peer1 = client.newPeer('grpcs://10.62.58.66:7051', {
    'pem': fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt', 'utf8'),
    'ssl-target-name-override': 'peer1.org1.example.com'
});

// query chaincode
var queryChaincode = (channel_name, name, fcn, args) => {
    var channel = client.newChannel(channel_name);

    var request = {
        targets : [peer0],
        chaincodeId: name,
        fcn: fcn,
        args: args
    };

    return channel.queryByChaincode(request, true);
};

queryChaincode('mychannel', 'mycc', 'query', ['a']).then(responses => {
    var response = responses[0];
    console.log(response.toString('utf8'));
}).catch(err => {
    console.log(err);
});
