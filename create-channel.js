var Fabric_Client = require('fabric-client');
var client = new Fabric_Client();
var fs = require('fs');
var exec = require('child_process').exec;                                                                                           
// set admin identity
var private_key = fs.readFileSync('./admin/private_key', 'utf8');
var certificate = fs.readFileSync('./admin/certificate', 'utf8');
var mspId = 'Org1MSP';
client.setAdminSigningIdentity(private_key, certificate, mspId);

// set orderer info
var orderer = client.newOrderer('grpcs://localhost:7050', {
    'pem': fs.readFileSync('./tls/orderer.crt', 'utf8'),
    'ssl-target-name-override': 'orderer.example.com'
});

var configtxgen = '../../../bin/configtxgen';

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

createChannel('welcomexxxx').then(result => {
    console.log(result.status);
    console.log(result.info);
}).catch(err => {
    console.log(err);
});
