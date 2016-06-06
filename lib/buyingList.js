var Elasticsearch = require('./elasticsearch');

var BuyingList = {};

BuyingList.names = [
    'jobseekers'
];

BuyingList.list = {};


BuyingList.populate = function () {
    var self = this;
    var populate = function (name, list) {
        self.list[name] = list;
        //console.log(self.list);
    };

    var getList = function (name) {

        Elasticsearch.getBuyingList(name).then(function (list) {
            populate(name, list);
        })
    };


    self.names.forEach(function (name) {
        getList(name)
    });

    setInterval(function () {
        self.names.forEach(function (name) {
            getList(name)
        });
    }, 1000 * 60 * 5);
};

BuyingList.populate();

module.exports = BuyingList;