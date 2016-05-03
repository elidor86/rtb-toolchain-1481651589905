const Aerospike = require('aerospike');

var Client = null;

Aerospike.connect({
    hosts: '23.251.151.232:3000', policies: {
        timeout: 2000
    }
}, function (error, client) {

    Client = client;

    var key = new Aerospike.Key('test', 'rtb1', 1);
    var bins = { s: 'strsdf'};


    client.put(key, bins, function (error) {
        console.log(error);

        client.get(key, function (error, record, meta) {


            console.log(record, meta)
        })
    })
});


var AerospikeService = {};