var _ = require('underscore'),
    URL = require("url");


var Url = function (url, mapper) {

    ////console.log(url);
    var self = this;
    _.extend(self, URL.parse(url));
    self.mapper = mapper;
    //self.parsed = mapper(self);
};

Url.prototype.parse = function (parsedObj) {
    return this.mapper(parsedObj);
};


var UrlParser = function () {
    this.urls = [];
    this.hostsNames = [];
    this.hostsNamesObj = {};
    this.hosts = [];
};


UrlParser.prototype.hostnameNorm = function (Hostname) {

    if (!Hostname) {
        return Hostname;
    }

    var hostname = Hostname.split(".");
    if (hostname.length == 2) {
        return Hostname;
    } else if (hostname.length > 2) {
        hostname.splice(0, 1);
        return hostname.join('.');
    }

};

UrlParser.prototype.add = function (parsedUrl) {

    var hostnameNorm = this.hostnameNorm(parsedUrl.hostname);
    parsedUrl.hostnameNorm = hostnameNorm;
    ////console.log("add hostname ", hostname);

    this.urls.push(parsedUrl);
    //this.hostsNames.push(hostname);
    //this.hostsNamesObj[hostname] = true;
};


UrlParser.prototype.getParsedDataFromUrl = function (parsedUrl) {

    //var parsedUrl = decomposeUrl(url);

    var hostname = parsedUrl.hostname;

    if (!hostname) {
        return {error: '500'};
    }


    ////console.log("hostname ", hostname);
    //  //console.log("this.hostsNamesObj ", this.hostsNamesObj);


    // //console.log('hostnames', hostnames);

    for (var i = 0; i < this.urls.length; i++) {
        var testHostname = this.urls[i].hostnameNorm;
        if (hostname.search(new RegExp(testHostname, 'ig')) > -1) {

            //console.log('this.urls[i] ', this.urls[i]);
            //console.log('hostname ', hostname);
            return this.urls[i].mapper(parsedUrl);
            //return this.getParsedDataByHostname(i, parsedUrl);
        }
    }

    return {error: 500};
};

UrlParser.prototype.getParsedDataByHostname = function (index, parsedUrl) {

    // //console.log("\n\n\index\n\n\n ", index);
    //  //console.log("\n\n\parsedUrl\n\n\n ", parsedUrl);
    //  //console.log("\n\n\ngetParsedDataByHostname\n\n\n ", this.urls[index]);
    return this.urls[index].mapper(parsedUrl);
};

UrlParser.prototype.normalize = function (q) {
    return q && q.replace ? q.replace(/\&/ig, " ") : q;
};

var urlParser = new UrlParser();


var monsterObj = new Url('http://monster.com',
    function (data) {

        var res = {};

        ////console.log("data ", data);

        if (!data.query) {
            return {error: 500};
        }


        if (data.query.q) {
            res.q = data.query.q.split('-').join(',');
        }

        if (!res.q && _.isArray(data.path) && data.path.length == 2) {
            res.q = data.path[1].replace("_5", "").replace(/\-/gm, " ");
        }

        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");
        res.q = urlParser.normalize(res.q);

        ////console.log("data.query ", data.query);
        if (data.query && data.query.where) {
            data.query.where = data.query.where.toLowerCase();
            if (data.query.where.search("__2c-") > -1) {
                res.location = data.query.where.split("__2c-")[0].replace(/\-/gm, " ") + ", " + data.query.where.split("__2c-")[1];
            } else {
                res.location = data.query.where.replace(/\-/gm, " ");
            }
        }


        return res;
    }
);

var monsterDeObj = new Url('http://monster.de',
    function (data) {

        var res = {};

        ////console.log("data ", data);

        if (!data.query) {
            return {error: 500};
        }


        if (data.query.q) {
            res.q = data.query.q.split('-').join(',');
        }

        if (!res.q && _.isArray(data.path) && data.path.length == 2) {
            res.q = data.path[1].replace("_5", "").replace(/\-/gm, " ");
        }

        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");
        res.q = urlParser.normalize(res.q);

        ////console.log("data.query ", data.query);
        if (data.query && data.query.where) {
            if (data.query.where.search("__2C-") > -1) {
                res.location = data.query.where.split("__2C-")[0].replace(/\-/gm, " ");
                res.state = data.query.where.split("__2C-")[1];
            } else {
                res.location = data.query.where.replace(/\-/gm, " ");
            }
        }


        return res;
    }
);


var indeedObj = new Url('http://indeed.com/jobs',
    function (data) {

        /////console.log("indeedObj data ", data);
        //return {error: 500};


        if (!data.query || data.query.utm_source) {
            return {error: 500};
        }

        //   //console.log("indeedObj data.query ", data.query);

        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }

        if (!res.q && data.path && data.path.search("q-") > -1 && data.path.search("-jobs") > -1) {
            var tempQ = data.path;
            tempQ = tempQ.replace("/", "").replace(".html", "").split("-");
            var jobPos = tempQ.indexOf("jobs");
            var endPod = tempQ.indexOf("l") > -1 ? tempQ.indexOf("l") : jobPos;
            tempQ = tempQ.splice(1, endPod - 1);
            res.q = tempQ.join(" ");
        }

        /*
         if (!res.q) {
         return {error: 500};
         }*/

        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        ////console.log("data.query ", data.query);
        if (data.query.l) {
            res.location = data.query.l.replace(/\+/gm, " ");
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var indeedukObj = new Url('http://www.indeed.co.uk/jobs',
    function (data) {

        //   //console.log("data indeedukObj", data);
        //return {error: 500};


        if (data.pathname != '/jobs' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        ////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }

        if (!res.q) {
            return {error: 500};
        }
        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var indeedFrObj = new Url('http://www.indeed.fr',
    function (data) {

        ////console.log("data indeedFrObj", data);
        //return {error: 500};


        if (data.pathname != '/emplois' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }

        if (!res.q) {
            return {error: 500};
        }
        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var indeedDeObj = new Url('http://de.indeed.com',
    function (data) {

        ////console.log("data indeedFrObj", data);
        //return {error: 500};


        if ((data.pathname && data.pathname.toLowerCase() != '/jobs') || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }

        if (!res.q) {
            return {error: 500};
        }
        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var craigslistObj = new Url('http://craigslist.org/search/jjj',
    function (data) {

        ////console.log("data ", data);

        var pathToQ = {
            fbh: 'food OR beverage OR hospitality',
            ofc: 'admin OR office',
            bus: 'business',
            csr: 'customer service',
            edu: 'education OR teaching',
            egr: 'engineer',
            acc: 'accounting OR finance',
            lab: 'general labor',
            gov: 'government',
            hea: 'healthcare',
            hum: 'human resource',
            lgl: 'legal',
            mnu: 'manufacturing',
            mar: 'marketing OR advertising OR pr',
            rej: 'real estate',
            ret: 'retail',
            sls: 'sales'
        };

        var res = {};

        var pathArr = data.pathname.split("/");
        if (pathArr.length == 3 && pathArr[1] == 'search' && pathToQ[pathArr[2]]) {
            res.q = pathToQ[pathArr[2]];
        } else if (data.pathname == '/search/jjj' && data.query && data.query.query) {
            res.q = data.query.query.split('+').join(',');
        }


        res.location = data.host.split(".")[0];

        res.q = urlParser.normalize(res.q);
        return res;

    }
);

var careerBuilderObj = new Url('http://www.careerbuilder.com/jobseeker/jobs/jobresults.aspx',
    function (data) {

        ////console.log("data ", data);


        var res = {};

        if (data.query.s_rawwords) {
            res.q = data.query.s_rawwords.split('+').join(',');
        } else if (data.query['n_SB:sbkw']) {
            res.q = data.query['n_SB:sbkw'].split('+').join(',');
        } else if (data.query['keywords']) {
            res.q = data.query['keywords'].split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        //////console.log("data.query ", data.query);
        if (data.query.s_freeloc) {
            if (data.query.s_freeloc.search(",+") > -1) {
                res.location = data.query.s_freeloc.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.s_freeloc.split(",+")[1];
            } else {
                res.location = data.query.s_freeloc.replace(/\+/gm, " ");
            }
        } else if (data.query['SB:s_freeloc']) {
            if (data.query['SB:s_freeloc'].search(",+") > -1) {
                res.location = data.query['SB:s_freeloc'].split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query['SB:s_freeloc'].split(",+")[1];
            } else {
                res.location = data.query['SB:s_freeloc'].replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var simplyhiredObj = new Url('http://simplyhired.com',
    function (data) {

        ////console.log("data ", data);

        //return {error: 500};

        if (data.pathname != '/search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            //res.q = 'test';
            res.q = data.query.q.replace(/\+/g, ",");
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }


        //res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobdiagnosisObj = new Url('http://search.jobdiagnosis.com/',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/index.php' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.keyword) {
            res.q = data.query.keyword.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var usajobsObj = new Url('https://www.usajobs.gov/Search',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/Search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.keyword) {
            res.q = data.query.keyword.split('+').join(',');
        }

        if (data.query.Keyword) {
            res.q = data.query.Keyword.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var careercastObj = new Url('http://www.careercast.com/jobs',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname.search("/jobs/results") == -1) {
            return {error: 500};
        }


        var res = {};

        var pathnameArr = data.pathname.split("/");


        if (pathnameArr.length == 5 && pathnameArr[3] == 'keyword') {
            res.q = pathnameArr[4];
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobshqObj = new Url('http://www.jobshq.com/search',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname.search("search/keyword") == -1) {
            return {error: 500};
        }


        var res = {};

        var pathnameArr = data.pathname.split("/");


        if (pathnameArr.length >= 3 && pathnameArr[2] == 'keyword') {
            res.q = pathnameArr[3].replace("%20", " ");
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var beyondObj = new Url('http://www.beyond.com/',
    function (data) {

        ////console.log("data_______________________________________----------------------------!!!!!!!!!!!!!!!!!!!!!!!!! ");
        ////console.log("data ", data);
        ////console.log("-----------------------------data ", data.query);
        ////console.log("data ", data.query.k);

        if (data.pathname != '/jobs/search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.k) {
            res.q = data.query.k;
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobsnetObj = new Url('http://career.jobs.net/',
    function (data) {

        ////console.log("jobsnetObj data ", data);


        var res = {};

        if (data.query.k) {
            res.q = data.query.k.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var doostangObj = new Url('http://www.doostang.com/search2',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/search2' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.search_query) {
            res.q = data.query.search_query.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");


        //////console.log("data.query ", data.query);
        if (data.query.search_location) {
            if (data.query.search_location.search(",+") > -1) {
                res.location = data.query.search_location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.search_location.split(",+")[1];
            } else {
                res.location = data.query.search_location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var efinancialcareersObj = new Url('http://www.efinancialcareers.com/search',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (typeof data.query.keywords == 'string') {
            res.q = data.query.keywords.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query['locationsName[0]']) {
            if (data.query['locationsName[0]'].search(",+") > -1) {
                res.location = data.query['locationsName[0]'].split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query['locationsName[0]'].split(",+")[1];
            } else {
                res.location = data.query['locationsName[0]'].replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var internshipsObj = new Url('http://www.internships.com/search',
    function (data) {

        ////console.log("data ", data);

        var res = {};

        if (data.query.Keywords) {
            res.q = data.query.Keywords.split('+').join(',');
        }

        //////console.log("data.query ", data.query);
        if (data.query.Location) {
            if (data.query.Location.search(",+") > -1) {
                res.location = data.query.Location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.Location.split(",+")[1];
            } else {
                res.location = data.query.Location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var aboutObj = new Url('http://jobsearch.about.com/',
    function (data) {

        ////console.log("data ", data);

        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var snagajobObj = new Url('http://www.snagajob.com/job-search',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/job-search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }


        //////console.log("data.query ", data.query);
        if (data.query.w) {
            if (data.query.w.search(",+") > -1) {
                res.location = data.query.w.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.w.split(",+")[1];
            } else {
                res.location = data.query.w.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobsgaloreObj = new Url('http://www.jobsgalore.com/jobs',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/jobs' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.w) {
            res.q = data.query.w.split('+').join(',');
        } else if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }


        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var ziprecruiterObj = new Url('https://jobs.ziprecruiter.com/candidate/search',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/candidate/search' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.search) {
            res.q = data.query.search.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }


        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var linkedinObj = new Url('https://www.linkedin.com/vsearch',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/vsearch/j' || !data.query) {
            return {error: 500};
        }

        var res = {};

        if (data.query.keywords) {
            res.q = data.query.keywords.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var diceObj = new Url('http://www.dice.com/job/results',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/job/results/94101' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q.split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var glassdoorObj = new Url('http://www.glassdoor.com/Job',
    function (data) {

        ////console.log("data ", data);

        if (data.pathname != '/Job/jobs.htm' || !data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query['sc.keyword']) {
            res.q = data.query['sc.keyword'].split('+').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.l) {
            if (data.query.l.search(",+") > -1) {
                res.location = data.query.l.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.l.split(",+")[1];
            } else {
                res.location = data.query.l.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var diversityonecareersObj = new Url('http://diversityonecareers.com/jobs/',
    function (data) {

        ////console.log("diversityonecareersObj data ", data);


        var res = {};

        if (data.query && data.query.s) {
            res.q = data.query.s.split('+').join(',');
        }

        // ////console.log("diversityonecareersObj data ", data.pathname.search("/company/"));

        if (!res.q && data.pathname.search("/company/") > -1) {
            var path = data.pathname.split("/");

            if (path.length == 3) {
                res.q = path[2].replace(/_/ig, " ");
            }

        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var mashableObj = new Url('http://jobs.mashable.com/',
    function (data) {

        ////console.log("data ", data);

        if (data.path[0] != 'jobs' || data.path[1] != 'results' || data.path[2] != 'keyword') {
            return {error: 500};
        }


        var res = {};

        if (data.path[3]) {
            res.q = data.path[3].split('-').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var IEEEJobsiteObj = new Url('http://jobs.ieee.org/jobs/results/keyword/',
    function (data) {

        ////console.log("data ", data);

        if (data.path[0] != 'jobs' || data.path[1] != 'results' || data.path[2] != 'keyword') {
            return {error: 500};
        }


        var res = {};

        if (data.path[3]) {
            res.q = data.path[3].split('-').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        //////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var vagasObj = new Url('http://www.vagas.com.br/',
    function (data) {

        ////console.log("data ", data);

        if (!data.path || data.path.search("vagas-de") == -1) {
            return {error: 500};
        }


        var res = {};

        if (data.path) {
            res.q = data.path.replace("/vagas-de-", "").split('-').join(',');
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var infojobsObj = new Url('http://www.infojobs.com.br/',
    function (data) {

        //console.log("data ", data);

        if (data.pathname != '/empregos.aspx') {
            return {error: 500};
        }


        var res = {};

        if (data.query) {
            res.q = data.query.Palabra;
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var governmentjobsObj = new Url('https://www.governmentjobs.com/jobs',
    function (data) {

        //console.log("governmentjobsObj data ", data);


        var res = {};

        if (data.query && data.query.keyword && data.query.keyword.length > 0) {
            res.q = data.query.keyword;
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var cathoObj = new Url('http://www.catho.com.br/vagas/',
    function (data) {

        //console.log("data ", data);


        if (!data.pathname || !data.query || data.pathname != '/vagas/') {
            return {error: 500};
        }


        var res = {};

        res.q = data.query.q;


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.location) {
            if (data.query.location.search(",+") > -1) {
                res.location = data.query.location.split(",+")[0].replace(/\+/gm, " ");
                res.state = data.query.location.split(",+")[1];
            } else {
                res.location = data.query.location.replace(/\+/gm, " ");
            }
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var xingObj = new Url('https://www.xing.com/search',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query['q[keywords]']) {
            res.q = data.query['q[keywords]'];
        }


        ////console.log("data.query ", data.query);
        if (data.query['q[location]']) {
            res.location = data.query['q[location]'];
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var stepstoneObj = new Url('http://www.stepstone.de/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.ke) {
            res.q = data.query.ke;
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.ws) {
            res.location = data.query.ws;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);


var jobs2careersObj = new Url('http://www.jobs2careers.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }


        ////console.log("data.query ", data.query);
        if (data.query.l) {
            res.location = data.query.l;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var mynaviObj = new Url('https://job.mynavi.jp',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }


        ////console.log("data.query ", data.query);
        if (data.query.l) {
            res.location = data.query.l;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var meinestadtObj = new Url('http://jobs.meinestadt.de/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.words) {
            res.q = data.query.words;
        }

        if (data.query.l) {
            res.location = data.query.l;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var kimetaObj = new Url('http://www.kimeta.de/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobrapidoObj = new Url('http://de.jobrapido.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.w) {
            res.q = data.query.w;
        }

        if (data.query.l) {
            res.location = data.query.l;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var backinjobObj = new Url('http://www.backinjob.de/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.s) {
            res.q = data.query.s;
        }

        if (data.query.searchtext) {
            res.q = data.query.searchtext;
        }

        if (data.query.o) {
            res.location = data.query.o;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var reedObj = new Url('http://www.reed.co.uk/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.keywords) {
            res.q = data.query.keywords;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobangeboteObj = new Url('http://www.jobangebote.de/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var totaljobsObj = new Url('https://www.totaljobs.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.Keywords) {
            res.q = data.query.Keywords;
        }

        if (data.query.LTxt) {
            res.location = data.query.LTxt;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobsObj = new Url('http://www.jobs.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }

        if (data.query.where) {
            res.location = data.query.where;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobtomicObj = new Url('http://www.jobtomic.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.job) {
            res.q = data.query.job;
        }

        if (!res.q && data.query.job_category) {
            res.q = data.query.job_category;
        }


        if (data.query.location) {
            res.location = data.query.location;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var jobsradarObj = new Url('http://www.jobsradar.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.kw) {
            res.q = data.query.kw;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var cvlibraryObj = new Url('http://www.cv-library.co.uk/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q) {
            res.q = data.query.q;
        }

        if (data.query.geo) {
            res.location = data.query.geo;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var directObj = new Url('https://jobsearch.direct.gov.uk/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.tjt) {
            res.q = data.query.tjt;
        }

        if (!res.q && data.query.q) {
            res.q = data.query.q;
        }


        if (data.query.where) {
            res.location = data.query.where;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var walmartstorestObj = new Url('https://hiringcenter.walmartstores.com/',
    function (data) {

        var res = {};
        res.q = 'walmart';
        return res;
    }
);

var jobtomeObj = new Url('http://uk.jobtome.com/',
    function (data) {

        //console.log("data ", data);


        if (!data.query) {
            return {error: 500};
        }


        var res = {};

        if (data.query.q2) {
            res.q = data.query.q2;
        }


        if (data.query.z2) {
            res.location = data.query.z2;
        }


        res.q = urlParser.normalize(res.q);
        return res;
    }
);

var gruenderszeneObj = new Url('http://www.gruenderszene.de/',
    function (data) {

        //console.log("data ", data);


        if (data.pathname.search("/jobboerse/suche/") == -1) {
            return {error: 500};
        }

        var pathnameSplit = data.pathname.split("/");
        var query = pathnameSplit[pathnameSplit.length - 1];
        query = query.substring(1, query.length);
        query = decodeURI(query);

        var res = {};

        if (query) {
            res.q = query;
        }


        //res.q = res.q.replace('__2D', " ").replace('__28', "(").replace('__29', ")");

        if (!res.q) {
            return {error: 500};
        }

        ////console.log("data.query ", data.query);
        if (data.query.ws) {
            res.location = data.query.ws;
        }

        res.q = urlParser.normalize(res.q);
        return res;
    }
);


urlParser.add(directObj);
urlParser.add(jobtomicObj);
urlParser.add(jobtomeObj);
urlParser.add(backinjobObj);
urlParser.add(jobsradarObj);
urlParser.add(stepstoneObj);
urlParser.add(totaljobsObj);
urlParser.add(cvlibraryObj);
urlParser.add(indeedFrObj);
urlParser.add(jobangeboteObj);
urlParser.add(kimetaObj);
urlParser.add(jobsObj);
urlParser.add(gruenderszeneObj);
urlParser.add(jobrapidoObj);
urlParser.add(indeedukObj);
urlParser.add(xingObj);
urlParser.add(jobs2careersObj);
urlParser.add(walmartstorestObj);
urlParser.add(jobshqObj);
urlParser.add(cathoObj);
urlParser.add(infojobsObj);
urlParser.add(governmentjobsObj);
urlParser.add(vagasObj);
urlParser.add(mynaviObj);
urlParser.add(monsterObj);
urlParser.add(monsterDeObj);
urlParser.add(simplyhiredObj);
urlParser.add(indeedObj);
urlParser.add(jobsgaloreObj);
urlParser.add(careerBuilderObj);
urlParser.add(indeedDeObj);
urlParser.add(glassdoorObj);
urlParser.add(craigslistObj);
urlParser.add(diversityonecareersObj);
urlParser.add(jobdiagnosisObj);
urlParser.add(beyondObj);
urlParser.add(jobsnetObj);
urlParser.add(internshipsObj);
urlParser.add(mashableObj);
urlParser.add(aboutObj);
urlParser.add(usajobsObj);
urlParser.add(snagajobObj);
urlParser.add(IEEEJobsiteObj);
urlParser.add(meinestadtObj);
urlParser.add(reedObj);
urlParser.add(diceObj);
urlParser.add(careercastObj);
urlParser.add(ziprecruiterObj);
urlParser.add(linkedinObj);
urlParser.add(doostangObj);
urlParser.add(efinancialcareersObj);


////console.log("this.hostsNames ", urlParser.hostsNames.length);
////console.log("this.urls ", urlParser.urls);
////console.log("this.hostsNamesObj ", urlParser.hostsNamesObj.length);


var parseUrl = function (req, res) {
    var parsedurl = URL.parse(decodeURIComponent(req.url.replace("/parse?url=", "")));
    res.json(urlParser.getParsedDataFromUrl(parsedurl));
};


var parseReqUrl = function (url) {
    ////console.log("pars ", URL.parse(url,true));
    //var parsedurl = decomposeUrl(decodeURIComponent(url).replace(/\'/igm, ""));
    var parsedurl = URL.parse(url, true);
    var obj = urlParser.getParsedDataFromUrl(parsedurl) || {};
    if (!obj.q || obj.q == undefined || obj.q == 'undefined') {
        delete obj.q
    }

    if (!obj.location || obj.location == undefined || obj.location == 'undefined') {
        delete obj.location
    }

    if (obj.error) {
        delete obj.error
    }
    
    if (obj.location) {
        obj.l=obj.location;
        delete obj.location
    }

    return obj
};


var qParams = [
    'q',
    'what',
    'voll',
    'st',
    'search',
    'was',
    'job_title_name',
    'ke',
    'oq',
    'searchtext',
    'Keyword',
    'Keywords',
    'src_str',
    's[freeword]',
    'job',
    'keywords',
    'searchtext',
    'words'
];

var lParams = [
    'location',
    'Location',
    'l',
    'plz',
    'ws',
    'where'
];

var blackListUrls = ['taleo', 'usajobs', 'brassring'];

var parseUrlGeneral = function (url) {

    //  //console.log("parseUrlGeneral url ", url);
    var parsedurl = null;
    try {
        parsedurl = URL.parse(url, true);
    } catch (e) {
        //console.log("parsedurl e", e);
    }

    // //console.log("parsedurl  ", parsedurl);

    if (!parsedurl || !parsedurl.query) {
        return;
    }

    var res = {};

    for (var i = 0; i < blackListUrls.length; i++) {
        var item = blackListUrls[i];
        if (url.search(item) > -1) {
            return {};
        }
    }

    /*for (var i = 0; i < qParams.length; i++) {
     var item = qParams[i];
     if (parsedurl.query[item]) {
     res.q = parsedurl.query[item];
     break;
     }
     }*/

    /*
     for (var i = 0; i < lParams.length; i++) {
     var item = lParams[i];

     //console.log("parsedurl.query[item]   ", parsedurl.query[item]);
     if (parsedurl.query[item]) {
     res.location = parsedurl.query[item];
     break;
     }
     }*/

    if (!res.q) {
        if (parsedurl.host.search("\\.edu") > -1) {
            res.q = "student job OR part time";
        }
        else if (parsedurl.host.search("\\.ac\\.jp") > -1) {
            res.q = "学生 OR パートタイム";
        }
        else if (parsedurl.host.search("\\.uni-") > -1) {
            res.q = "Studentenjobs OR teilzeit";
        }
        else if (parsedurl.host.search("\\.univ-") > -1) {
            res.q = "étudiant à temps partiel";
        }
    }


    // //console.log("res   ", res);
    return res;
};


module.exports = {
    parseUrl: parseUrl,
    parseUrlGeneral: parseUrlGeneral,
    hostnameNorm: urlParser.hostnameNorm,
    parseReqUrl: parseReqUrl
};

