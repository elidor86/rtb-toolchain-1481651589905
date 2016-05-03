const Aerospike = require('aerospike');

var Client = null;

Aerospike.connect({
    hosts: '23.251.151.232:3000', policies: {
        timeout: 2000
    }
}, function (error, client) {

    Client = client;

    var key = new Aerospike.Key('test', 'demo', 'foo');
    var bins = {i: 123, b: {a: 1, b: 2}, s: 'str'};


    client.put(key, bins, function (error) {
        console.log(error)

        client.get(key, function (error, record, meta) {


            console.log(record, meta)
        })
    })
});


var AerospikeService = {};