# hyperledger-fabric-nodejs-sdk-demo

This demonstrates how to create a channel, join peer, install chaincode and instantiate chaincode using Hyperledger Fabric NodeJS SDK.

<h1>Setup</h1>

<h3>Build a Hyperledger Fabric network</h3>

<li>1 organization (Org1MSP)</li>
<li>1 orderer (orderer.example.com)</li>
<li>2 peers (peer0.org1.example.com, peer1.org1.example.com)</li>

<h3>Copy <b>configtx.yaml</b></h3>
cp <i><b>[YOUR FABRIC NETWORK ROOT]</b></i>/configtx.yaml .

<h3>Copy the generated <b>crypto-confg</b> directory</h3>
cp -rf <i><b>[YOUR FABRIC NETWORK ROOT]</b></i>/crypto-config .

<h3>Copy admin user private key and certificate</h3>
<li>cp crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/8ea7f5242c6cefa5df5508d9c509c7ad29ced5edf7384a2d1d3cb74124e2d7c6_sk admin/private_key</li>
<li>cp crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem admin/certificate</li>

<h1>Configuration</h2>

Modify constans defined in <b>demo.js</b>

<h1>Run</h1>

node demo
