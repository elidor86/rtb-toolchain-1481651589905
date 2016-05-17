//var mongoDb = require('./mongo');
var Classifier = require('./classifier');
var UrlParser = require('./url-parser');
var Aerospike = require('./aerospike');
var Elasticsearch = require('./elasticsearch');
var co = require('co');

var Campaigns = function (data, cb) {

    this.bidReqData = data;
    this.cb = cb;
    this.campaigns = [];
    this.Defualt_Max_Imp_Per_Cmp = 1;
    this.getAllCampaigns();
};

Campaigns.prototype.getAllCampaigns = function () {
    var self = this;

    // mongoDb.collections.Campaigns.find({$where: "this.Num_Of_BIDs_Sent <= this.Max_Num_Of_BIDs"}).toArray(function (err, campaigns) {
    /*mongoDb.collections.Campaigns.find({}, {fields: {BIDs_Sent: 0, BIDs_Won: 0}}).toArray(function (err, campaigns) {
     //global.logger.debug('campaigns ', campaigns);
     //console.log('campaigns ', campaigns);
     if (err) {
     return self.cb(err, null);
     }

     self.campaigns = campaigns;
     self.selectCampaign();
     });*/

    Elasticsearch.getAllCmp().then(function (campaigns) {

        //console.log("campaigns ", campaigns);
        self.campaigns = campaigns;
        self.selectCampaign();
    }, function (err) {
        console.trace(err.message);
    });
};


Campaigns.prototype.selectCampaign = function () {
    var self = this;
    var selectedCampaign = null;

    co(function *() {
        var campaigns = self.campaigns;


        for (var i = 0; i < campaigns.length; i++) {
            self.params = {};
            var campaign = campaigns[i];

            if (campaign.Num_Of_BIDs_Sent >= campaign.Max_Num_Of_BIDs) {
                continue;
            }

            var filterByUrl = self.filterByUrl(campaign);
            var filterByKeywords = self.filterByKeywords(campaign);
            var filterByGeo = self.filterByGeo(campaign);
            var filterByFunction = self.filterByFunction(campaign);

            //  console.log("campaign ", campaign);
            //  console.log("filterByKeywords ", filterByKeywords);
            //  console.log("filterByUrl ", filterByUrl);
            //  console.log("filterByFunction ", filterByFunction);
            //  console.log("filterByGeo ", filterByGeo);

            if (filterByKeywords == true && filterByUrl == true && filterByGeo == true && filterByFunction == true) {
                //return self.cb(null, campaign);
                var impressionsCheck = yield self.impressionsCheck(campaign);
                if (impressionsCheck == true) {
                    selectedCampaign = campaign;
                    selectedCampaign.params = self.params;
                    break;
                }
            }
        }

        self.cb(null, selectedCampaign);

    }).catch(function (err) {

        console.trace("err", err);
        self.cb(null, null);
        return;
    });
};

Campaigns.prototype.filterByUrl = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var reg = new RegExp(campaign.Filter_URLs);
    try {
        return reg.test(bidReqData.URL);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByKeywords = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;

    var reg = new RegExp(campaign.Filter_KeyWords);
    try {
        return reg.test(bidReqData.Query);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByGeo = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;

    var reg = new RegExp(campaign.Filter_GEO);
    try {


        return reg.test(bidReqData.GEO);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByFunction = function (campaign) {
    var self = this;
    var funcName = campaign.Filter_Function;
    //console.log("campaign ", campaign);
    if (self[funcName]) {
        return self[funcName].call(self);
    } else {
        return true;
    }
};

Campaigns.prototype.impressionsCheck = function (campaign) {
    var self = this;
    return new Promise(function (fulfill, reject) {
        co(function *() {

            var userImpressionsPerCmp = yield Aerospike.getUserImpressionPerCampaign(self.bidReqData, campaign);
            var maxImpPerCmp = campaign.Max_Imp || self.Defualt_Max_Imp_Per_Cmp;

            //console.log("userImpressionsPerCmp <= maxImpPerCmp ", userImpressionsPerCmp <= maxImpPerCmp);
            if (userImpressionsPerCmp < maxImpPerCmp) {
                return fulfill(true);
            }
            fulfill(false);
        }).catch(function (err) {
            console.trace("impressionsCheck err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};

Campaigns.prototype.jobsPredict = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var predict = Classifier.predictFromUrl(bidReqData.URL);
    var params = UrlParser.parseReqUrl(bidReqData.URL);

    // console.log("predict ", predict);
    if (predict == 100) {
        self.params = params;
        return true;
    } else {
        return false;
    }

    // console.log("predict ", predict);
    //console.log("params ", params);
};

Campaigns.prototype.onlyJobWithQ = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var predict = Classifier.predictFromUrl(bidReqData.URL);
    var params = UrlParser.parseReqUrl(bidReqData.URL);

    if (bidReqData.URL && bidReqData.URL.search("\.indeed\.") > -1) {
        return false;
    }
    //console.log("predict ", predict);
    //console.log("params ", params);
    //console.log("params ", params);

    if (predict == 100 && params && params.q) {
        self.params = params;
        return true;
    } else {
        return false;
    }
};


var getCampaign = function (data, cb) {

    new Campaigns(data, cb)
};

module.exports = {
    getCampaign: getCampaign
};