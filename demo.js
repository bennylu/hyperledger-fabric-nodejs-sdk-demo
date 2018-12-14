process.env['GOPATH'] = './';

// channel info
const configtxgen = '../../../bin/configtxgen';
const channelName = 'channel-name';

// chaincode info
const chaincodePath = 'chaincode/chaincode_example02/go/';
const chaincodeName = 'mycc';
const chaincodeVersion = '1.0';
const chaincodeType = 'golang';
const chaincodeInitFunc = 'init';
const chaincodeInitArgs = ['a', '100', 'b', '200'];

var Fabric_Client = require('fabric-client');                                                                                   
var client = new Fabric_Client();
var fs = require('fs');
var exec = require('child_process').exec;                                                                                           

// set admin identity
var private_key = fs.readFileSync('./admin/private_key', 'utf8');
var certificate = fs.readFileSync('./admin/certificate', 'utf8');
var mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

const orderer = client.newOrderer('grpcs://10.62.58.64:7050', {
    'pem': fs.readFileSync('./tls/orderer.crt', 'utf8'),
    'ssl-target-name-override': 'orderer.example.com'
});

const peer0 = client.newPeer('grpcs://10.62.58.64:7051', {
    'pem': fs.readFileSync('./tls/peer0.crt', 'utf8'),
    'ssl-target-name-override': 'peer0.org1.example.com'
});

const peer1 = client.newPeer('grpcs://10.62.58.66:17051', {
    'pem': fs.readFileSync('./tls/peer1.crt', 'utf8'),
    'ssl-target-name-override': 'peer1.org1.example.com'
});

var peers = [peer0, peer1];

// generate channel definition file
var generateChannelDefinition = channelName => {
    return new Promise((resolve, reject) => {
        var output_dir = './channel-artifacts';
        var output_file = `${output_dir}/${channelName}.tx`;
        var args = `-profile OneOrgChannel -channelID ${channelName} -outputCreateChannelTx ${output_file}`;

        exec(`${configtxgen} ${args}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(fs.readFileSync(output_file));
        });
    });
};

// create a channel
var createChannel = (channelName) => {
    return generateChannelDefinition(channelName)
        .then(definition => {
            var channelConfig = client.extractChannelConfig(definition);
            var signature = client.signChannelConfig(channelConfig);

            var request = {
                orderer,
                config: channelConfig,
                signatures: [signature],
                name: channelName,
                txId: client.newTransactionID(true)
            };

            return client.createChannel(request);
        });
};

// join peers into a channel
var joinChannel = async (channel_name) => {
    var channel = client.newChannel(channel_name);

    // retreive genesis block from the orderer
    var genesis_block = await channel.getGenesisBlock({
        orderer,
        txId: client.newTransactionID(true)
    });

    var join_request = {
        block: genesis_block,
        targets: peers,
        txId: client.newTransactionID(true),
    };

    return channel.joinChannel(join_request);
};

// install chaincode
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

// instantiate chaincode
var instantiateChaincode = async (channel_name, name, version, type, fcn, args) => {
    var channel = client.getChannel(channel_name);
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

createChannel(channelName).then(result => {
    if (result.status != 'SUCCESS')
        throw new Error(result.info);
    console.log('create channel: done');
    return joinChannel(channelName);
}).then(responses => {
    console.log('join channel: done');
    return installChaincode(chaincodePath, chaincodeName, chaincodeVersion, chaincodeType);
}).then(responses => {
    console.log(responses);
    console.log('install chaincode: done');
    return instantiateChaincode(channelName, chaincodeName, chaincodeVersion, chaincodeType, chaincodeInitFunc, chaincodeInitArgs);
}).then(responses => {
    console.log(responses);
    console.log('instantiate chaincode: done');
}).catch(err => {
    console.log(err);
});
