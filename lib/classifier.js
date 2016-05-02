var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    Lists = require('./lists.js');


var Classifier = function () {

};


var words = [

    'job',
    'jobs',
    'apply',
    'required',
    'work',
    'experience',
    'skills',
    'application',
    'ability',
    'position',
    'opportunity',
    'employment',
    'responsible',
    'requirements',
    'location',
    'description',
    'strong',
    'applying',
    'qualifications',
    'knowledge',
    'education',
    'applications',
    'applicants',
    'responsibilities',
    'submit',
    'careers',
    'related',
    'minimum',
    'opportunities',
    'preferred',
    'equivalent',
    'applicant',
    'candidate'
];

Classifier.prototype = {


    urlStopWords: [
        'blowjob',
        'eagermoney',
        'vipjobgetunit',
        'bycontext',

    ],
    jobUrlWords: [
        'candidate',
        'jobid',
        'job_alerts',
        'job-alerts',
        'employment',
        'companies',
        'resume',
        'listing',
        'job',
        'employment',
        'position',
        'jobseeker',
        'jobresults',
        'application',
        'career',
        'apply',
        'hire',
        'job_detail',
        'applicant'
    ],
    getWordsList: function (text) {

        var arr = [];
        var self = this;

        for (var i = 1; i < Lists.jobUrlWords.length; i++) {
            var regex = new RegExp(Lists.jobUrlWords[i], "ig");
            var test = regex.test(text);
            if (test) {
                arr.push(Lists.jobUrlWords[i]);
            }
        }

        return arr;

    },

    isEdu: function (url) {


        if (!url) {
            return null;
        }

        try {

            var urlObj = URL.parse(url, true);

            // console.log("isEdu  urlObj ", urlObj);

            if (!urlObj) {
                return null;
            }

            if ((urlObj.pathname == null || urlObj.pathname == '/') && urlObj.tld == 'edu') {
                return 100;
            }

            if ((urlObj.pathname == null || urlObj.pathname == '/') && urlObj.hostname.search(".uni-") > -1) {
                return 100;
            }

            if ((urlObj.pathname == null || urlObj.pathname == '/') && urlObj.hostname.search(".ac.jp") > -1) {
                return 100;
            }
            if ((urlObj.pathname == null || urlObj.pathname == '/') && urlObj.hostname.search("\\.univ-") > -1) {
                return 100;
            }

            return null;

        } catch (e) {
            return null
        }


    },
    classifiedFromUrl: function (data, cb) {

        if (!cb) {
            cb = function () {
            };
        }

        if (!data.url) {
            cb(null, null);
            return null
        }

        var url = data.url.toLowerCase();

        // console.log("url ", url);

        var self = this;

        for (var i = 1; i < Lists.stopWords.length; i++) {
            var regex = new RegExp(Lists.stopWords[i], "ig");
            var test = regex.test(url);
            if (test) {
                //  console.log("regex ", regex);
                cb(null, 0);
                return 0;
            }
        }

        for (var i = 1; i < Lists.oneWordArr.length; i++) {
            // var regex = new RegExp(Lists.oneWordArr[i], "ig");
            //var test = regex.test(url);
            var oneWord = Lists.oneWordArr[i].toLowerCase();
            oneWord = new RegExp(oneWord, 'ig');

            if (url.search(oneWord) > -1) {
                //console.log("Lists.oneWordArr[i] ", i);
                //  console.log("Lists.oneWordArr[i] ", url.search(Lists.oneWordArr[i]));
                //  console.log("Lists.oneWordArr[i] ", Lists.oneWordArr[i]);
                cb(null, 100);
                return 100;
            }
        }

        var tmpArr = self.getWordsList(url);

        // console.log("tmpArr ", tmpArr);

        if (tmpArr.length >= 2) {
            cb(null, 100);
            return 100;
        }

        // console.log("this.isEdu(url) ", this.isEdu(url));

        if (this.isEdu(url) == 100) {
            cb(null, 100);
            return 100;
        }


        cb(null, null);

        return null;


    }


};


var classifier = new Classifier();


var predictFromUrlReq = function (req, res) {
    // console.log("predictFromUrl query", req.query);


    if (!req.query.url) {
        return res.json({error: 'no q'});
    }


    classifier.classifiedFromUrl({url: req.query.url}, function (err, response) {
        // console.log("predictFromUrl response", response);
        res.json({predict: response});
    });


};

var predictFromUrl = function (url, res) {


    if (!url) {
        return 0;
        //return res.json({error: 'no q'});
    }

    var predict = classifier.classifiedFromUrl({url: url});
    //console.log("predictFromUrl url", url);
    //console.log("predictFromUrl predict", predict);

    return predict;
};


module.exports = {
    predictFromUrlReq: predictFromUrlReq,
    predictFromUrl: predictFromUrl

};
