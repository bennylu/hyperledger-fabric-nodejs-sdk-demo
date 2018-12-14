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

var installChaincode = (path, name, version, type) => {
    var request = {
        targets: peers,
        chaincodePath: path,
        chaincodeId: name,
        chaincodeVersion: version,
        chaincodeType: type
    };

    return client.installChaincode(request);
};

// set go path
process.env['GOPATH'] = './';

installChaincode('chaincode/chaincode_example02/go/', 'mycc', '1.4', 'golang').then(responses => {
    console.log(responses);
}).catch(err => {
    console.log(err);
});
