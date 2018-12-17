var Fabric_Client = require('fabric-client');
var client = new Fabric_Client();
var fs = require('fs');

// set admin identity
var private_key = fs.readFileSync('./admin/private_key', 'utf8');
var certificate = fs.readFileSync('./admin/certificate', 'utf8');
var mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

const orderer = client.newOrderer('grpcs://10.62.58.64:7050', {
    'pem': fs.readFileSync('./crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt', 'utf8'),
    'ssl-target-name-override': 'orderer.example.com'
});

const peer0 = client.newPeer('grpcs://10.62.58.64:7051', {
    'pem': fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt', 'utf8'),
    'ssl-target-name-override': 'peer0.org1.example.com'
});

const peer1 = client.newPeer('grpcs://10.62.58.66:7051', {
    'pem': fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt', 'utf8'),
    'ssl-target-name-override': 'peer1.org1.example.com'
});

var peers = [peer0, peer1];

// invoke chaincode
var invokeChaincode = async (channel_name, name, fcn, args) => {
    var channel = client.newChannel(channel_name);

    var txId = client.newTransactionID(true);

    var request = {
        targets: peers,
        chaincodeId: name,
        fcn: fcn,
        args: args,
        chainId: channel_name,
        txId
    };

    var results = await channel.sendTransactionProposal(request);

    var proposalResponses = results[0];
    var proposal = results[1];

    for (var i in proposalResponses) {
        if (!proposalResponses || !proposalResponses[i].response
                || proposalResponses[i].response.status !== 200) {
            console.log(proposalResponses);
            console.log(proposal);
            throw new Error('proposalResponses are bad');
        }
    }

    var orderer_request = {
        txId,
        orderer,
        proposalResponses: proposalResponses,
        proposal: proposal
    };

    return channel.sendTransaction(orderer_request);
};

invokeChaincode('mychannel', 'mycc', 'invoke', ['a', 'b', '10']).then(responses => {
    console.log(responses);
}).catch(err => {
    console.log(err);
});
