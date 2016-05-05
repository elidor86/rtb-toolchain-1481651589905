var mongoDb = require('./mongo');
var Classifier = require('./classifier');
var UrlParser = require('./url-parser');


var Campaigns = function (data, cb) {

    this.bidReqData = data;
    this.cb = cb;
    this.campaigns = [];

    this.getAllCampaigns();
};

Campaigns.prototype.getAllCampaigns = function () {
    var self = this;

    // mongoDb.collections.Campaigns.find({$where: "this.Num_Of_BIDs_Sent <= this.Max_Num_Of_BIDs"}).toArray(function (err, campaigns) {
    mongoDb.collections.Campaigns.find({}, {fields: {BIDs_Sent: 0, BIDs_Won: 0}}).toArray(function (err, campaigns) {
        //global.logger.debug('campaigns ', campaigns);
        //console.log('campaigns ', campaigns);
        if (err) {
            return self.cb(err, null);
        }

        self.campaigns = campaigns;
        self.selectCampaign();
    });
};


Campaigns.prototype.selectCampaign = function () {
    var self = this;
    var campaigns = self.campaigns;
    var selectedCampaign = null;

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

        //console.log("campaign ", campaign);
        //console.log("filterByKeywords ", filterByKeywords);
        //console.log("filterByUrl ", filterByUrl);
        //console.log("filterByFunction ", filterByFunction);
        //console.log("filterByGeo ", filterByGeo);
        if (filterByKeywords == true && filterByUrl == true && filterByGeo == true && filterByFunction == true) {
            //return self.cb(null, campaign);
            selectedCampaign = campaign;
            selectedCampaign.params = self.params;
            break;
        }
    }
    self.cb(null, selectedCampaign);
};

Campaigns.prototype.filterByUrl = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var reg = campaign.Filter_URLs;
    try {
        return reg.test(bidReqData.URL);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByKeywords = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var reg = campaign.Filter_KeyWords;
    try {
        return reg.test(bidReqData.Query);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByGeo = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var reg = campaign.Filter_GEO;
    try {
        return reg.test(bidReqData.GEO);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByFunction = function (campaign) {
    var self = this;
    var funcName = campaign.Filter_Function;
    if (self[funcName]) {
        return self[funcName].call(self);
    } else {
        return true;
    }
};

Campaigns.prototype.jobsPredict = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var predict = Classifier.predictFromUrl(bidReqData.URL);
    var params = UrlParser.parseReqUrl(bidReqData.URL);

    if (predict == 100) {
        self.params = params;
        return true;
    } else {
        return false;
    }

    console.log("predict ", predict);
    console.log("params ", params);
};

Campaigns.prototype.onlyIndeedWithQ = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var predict = Classifier.predictFromUrl(bidReqData.URL);
    var params = UrlParser.parseReqUrl(bidReqData.URL);

    //console.log("predict ", predict);
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