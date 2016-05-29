fs = require('fs');

var catMapper = {};

catMapper.categories = {};

catMapper.loadTxt = function () {

    var self = this;
    var txt = fs.readFileSync(global.appRoot + "/lib/catMapper.txt", {encoding: 'utf8'});
    var items = txt.split("\r\n");

    items.forEach(function (raw) {

        raw = raw.toLowerCase();
        var arr = raw.split("\t");

        var obj = {
            geo: arr[0],
            url: arr[1],
            category: arr[2],
            subCategory: arr[3]
        };


        self.categories[obj.url] = {
            category: arr[2],
            subCategory: arr[3]
        };

    });

    console.log("cat ready");

};


catMapper.getCat = function (domain) {

    var self = this;

    if (domain in self.categories) {
        return self.categories[domain]
    } else {
        return null;
    }

};

module.exports = catMapper;

catMapper.loadTxt();