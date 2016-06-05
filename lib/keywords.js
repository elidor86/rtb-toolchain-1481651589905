_ = require('underscore');
fs = require('fs');
request = require('request');
var ee = require("./events-emitter").event;


var Keywords = {};

Keywords.list = {};

Keywords.oneWordKeyword = [
    "paramedic",
    "plumber",
    "nurse",
    "küchenhilfe",
    "vertrieb",
    "verkauf",
    "hgv driver",
    "enforcement agent",
    "retail",
    "warehouse",
    "einzelhandel",
    "maschinenbediener",
    "anlagenführer",
    "java",
    "bartender",
    "sozialpädagoge",
    "arbeitsvermittler",
    "personalsachbearbeiter",
    "personalberater",
    "sozialarbeiter",
    "sozialpädagogin",
    "physician",
    "schulsachbearbeiter",
    "sachbearbeiter",
    "bürosachbearbeiter",
    "Schulverwaltungskraft",
    "hausdame",
    "hauswirtschafter",
    "systemgastronomie",
    "kaufmännischer mitarbeiter",
    "büromanagement",
    "prüfingenieur",
    "büroassistenz",
    "bürokauf",
    "kauffrau",
    "produktionshelfer",
    "büroassistenz",
    "empfangskraft",
    "küchenkraft",
    "produktionsarbeiter",
    "betreuungskräfte",
    "aushilfe",
    "zimmermädchen",
    "servicekräfte",
    "verkäufer",
    "krankenschwester",
    "helfer lager",
    "reinigungskraft",
    "regalauffüller",
    "immobilienkaufmann",
    "hausverwalter",
    "produktionsmitarbeiter",
    "außendienstmitarbeiter",
    "schweißer",
    "versandmitarbeiter",
    "mechatroniker",
    "pflegedienst",
    "technologieberater",
    "sekretariat",
    "assistenz",
    "handwerk",
    "bauwesen",
    "callcenteragent",
    "architektur",
    "materialwirtschaft",
    "fachverkäufer",
    "informationstechnik",
    "office clerk",
    "lagerhelfer",
    "werkschutzfachkräfte",
    "lagerfachkraft",
    "lagermitarbeiter",
    "sekretär",
    "transportarbeiter",
    "lebensmittelhandwerk",
    "bürofachkraft",
    "receptionist",
    "waiter",
    "accountant",
    "secretary",
    "groundskeeper",
    "payable",
    "angular",
    "javascript",
    "c++",
    "c#",
    "python",
    "ruby",
    "SEO CONSULTANT",
    "bilingual",
    "childcare",
    "php",
    "installer",
    "helpdesk",
    "welding",
    "intern",
    "telemarketer",
    "cleaning",
    "cashier",
    "trucker",
    "ccnp",
    "pediatric",
    "babysit",
    "buyer",
    "cameraman",
    "houseperson",
    "cleaner",
    "healthcare",
    "butcher",
    "Hospitality",
    "babysitter",
    "receiver",
    "archeologist",
    "restaurant",
    "paralegal",
    "neuropsychology",
    "craftsman",
    "biller",
    "forklift",
    "ccna",
    "advertiser",
    "trader",
    "fisherman",
    "plumbing",
    "washer",
    "physiologist",
    "analyst",
    "administrative",
    "internship",
    "matlab",
    "lawyer",
    "accoutant",
    "warehousing",
    "clerical",
    "manufacturing",
    "jdeveloper",
    "veterinarian",
    "welder",
    "wireman",
    "Janitor",
    "teacher",
    "Nursing",
    "lpn",
    "cna",
    "accounting",
    "construction",
    "transcriptionist",
    "zoologist",
    "maintenance",
    "acupuncturist",
    "clerk",
    "rn",
    "radiologist",
    "telemarketing",
    "therapist",
    "accompanist",
    "acupuncturist",
    "adventist",
    "aerodynamicist",
    "agriculturist",
    "agronomist",
    "allergist",
    "allergist/immunologist",
    "alterationist",
    "anatomist",
    "anesthesiologist",
    "anesthetist",
    "anthropologist",
    "aquaculturist",
    "aquarist",
    "arborist",
    "archaeologist",
    "archeologist",
    "archivist",
    "artist",
    "assist",
    "astrophysicist",
    "audiologist",
    "audiometrist",
    "aviculturist",
    "bacteriologist",
    "baptist",
    "behaviorist",
    "biochemist",
    "bioinformaticist",
    "biologist",
    "biophysicist",
    "biotechnologist",
    "botanist",
    "cardiologist",
    "caricaturist",
    "ceramist",
    "chemist",
    "chiropodist",
    "colorist",
    "conservationist",
    "cosmetologist",
    "criminalist",
    "cytogeneticist",
    "cytologist",
    "cytotechnologist",
    "dentist",
    "dermatologist",
    "dosimetrist",
    "ecologist",
    "economist",
    "electrochemist",
    "electrophysiologist",
    "embryologist",
    "endocrinologist",
    "endodontist",
    "enologist",
    "entomologist",
    "environmentalist",
    "epidemiologist",
    "ergonomist",
    "evangelist",
    "flavorist",
    "florist",
    "gastroenterologist",
    "gemologist",
    "genealogist",
    "geneticist",
    "geochemist",
    "geologist",
    "geophysicist",
    "geoscientist",
    "geropsychologist",
    "gynecologist",
    "hairstylist",
    "harpist",
    "hematologist",
    "herpetologist",
    "histologist",
    "histotechnologist",
    "horticulturalist",
    "horticulturist",
    "hospitalist",
    "hydrogeologist",
    "hydrologist",
    "hygienist",
    "hypnotherapist",
    "immunologist",
    "intensivist",
    "internist",
    "journalist",
    "kinesiologist",
    "kinesiotherapist",
    "linguist",
    "lobbyist",
    "machinist",
    "manicurist",
    "metallurgist",
    "meteorologist",
    "methodist",
    "metrologist",
    "microbiologist",
    "microscopist",
    "mixologist",
    "muralist",
    "naturalist",
    "nematologist",
    "neonatologist",
    "nephrologist",
    "neurohospitalist",
    "neurologist",
    "neuropathologist",
    "neurophysiologist",
    "neuropsychologist",
    "neuroradiologist",
    "neuroscientist",
    "nocturnist",
    "numismatist",
    "nutritionist",
    "obstetrician/gynecologist",
    "occupationaltherapist",
    "oncologist",
    "ophthalmologist",
    "optometrist",
    "organist",
    "orthodontist",
    "orthopedist",
    "orthoptist",
    "orthotist",
    "orthotist/prosthetist",
    "otolaryngologist",
    "pathologist",
    "pedodontist",
    "pedorthist",
    "perfusionist",
    "periodontist",
    "pharmacist",
    "pharmacoepidemiologist",
    "pharmacologist",
    "pharmocologist",
    "phlebotmist",
    "phlebotomist",
    "photogrammetrist",
    "photojournalist",
    "physiatrist",
    "physicaltherapist",
    "physicist",
    "physiologist",
    "physiotherapist",
    "pianist",
    "podiatrist",
    "proctologist",
    "prosthetist",
    "prosthodontist",
    "psychiatrist",
    "psychologist",
    "Chef",
    "psychometrist",
    "psychotherapist",
    "pflege",
    "köchin",
    "gabelstaplerfahrer",
    "lebensmittelkontrolleur",
    "lager",
    "koch",
    "hilfstätigkeiten",
    "publicist",
    "pulmonologist",
    "radiochemist",
    "radiologist",
    "receptionist",
    "reservationist",
    "rheumatologist",
    "scientist",
    "shampooist",
    "sociologist",
    "speechtherapist",
    "strategist",
    "stylist",
    "taxonomist",
    "technologist",
    "therapist",
    "toxicologist",
    "transcriptionist",
    "typist",
    "violinist",
    "viticulturist",
    "vocalist",
    "zoologist"
];

Keywords.load = function () {
    var self = this;
    global.TtCollections.KeywordsList.find({}).toArray(function (err, queries) {

        if (err) {
            return;
        }


        for (var i = 0; i < queries.length; i++) {
            var title = queries[i].keyword;
            title = title.toLowerCase().trim();
            var titleLength = title.split(" ").length;
            var geo = title.geo;
            if (titleLength <= 1 && geo != 'de') {
                continue;
            }
            self.list[title] = true;
        }

        for (var i = 0; i < Keywords.oneWordKeyword.length; i++) {
            var title = Keywords.oneWordKeyword[i];
            title = title.toLowerCase().trim();
            self.list[title] = true;
        }

        var tmpArr = Object.keys(self.list);
        console.log("self.list ", tmpArr.length);
        ee.emit("Keywords.load");
    });
};

Keywords.loatToEs = function () {


    var self = this;
    var txt = fs.readFileSync(global.appRoot + "/lib/keywords.txt", {encoding: 'utf8'});
    var items = txt.split("\r\n");

    var keywordsArr = [];
    items.forEach(function (raw) {

        raw = raw.toLowerCase();
        var arr = raw.split("\t");
        var q = arr[0];
        var qL = q.split(" ").length;
        //console.log("qL ", qL);
        if (qL > 1) {
            keywordsArr.push(q);
        }
    });


    console.log("qL ", keywordsArr.length);
};

Keywords.tokenize = function (obj, cb) {

    var supportedGeo = ['us', 'de'];

    var geo = obj.geo;

    if (supportedGeo.indexOf(geo) == -1) {
        geo = 'us';
    }

    var toStr = obj.toStr || false;

    var data = {
        "analyzer": "tokenizer_" + (geo || "us"),
        "text": obj.title
    };


    request.post({
        url: 'http://104.154.60.227:9200/tokenizer/_analyze',
        body: JSON.stringify(data)
    }, function (err, httpResponse, body) {

        if (!err && httpResponse && httpResponse.statusCode == 200) {


            try {
                var tokened = JSON.parse(body);
            } catch (e) {
                return cb(e);
            }

            var tokens = [];
            for (var k = 0; k < tokened.tokens.length; k++) {
                tokens.push(tokened.tokens[k].token);
            }

            if (toStr && tokened.tokens) {

                var tokendTitle = tokens.join(" ");
                return cb(null, tokendTitle);
            } else {
                return cb(null, tokens);
            }

        } else {
            return cb('err', null);
        }


        // console.log("body", tokened);
        //  console.log("\n\n\n\n");
    });
};

Keywords.getStrFromArrBetween = function (start, end, arr) {
    return arr.slice(start, end).join(' ');
};

Keywords.getKeywordsFromTextArr = function (textArr) {

    if (!textArr) {
        return [];
    }

    console.log("getKeywordsFromTextArr ", textArr);

    var self = this;
    var minGram = 1, maxGram = Math.min(4, textArr.length);

    var keywords = [];

    for (var k = 0; k < textArr.length; k++) {
        for (var j = k + 1; j <= maxGram; j++) {
            var str = self.getStrFromArrBetween(k, j, _.clone(textArr));

            if (str in Keywords.list) {
                keywords.push(str);
            }

            // console.log("keyword now checking", k);
            // console.log("keyword now checking", j);
            //console.log("keyword now checking", str);
            //  console.log("keyword now checking", textArr);
        }
    }

    //console.log("keywords ", keywords);
    return _.uniq(keywords);
};

Keywords.loadToMongo = function () {
    var self = this;
    var list = fs.readFileSync(global.appRoot + '/data/fr-keywords.txt', {encoding: 'utf8'});

    list = list.split("\n");

    // console.log("list ", list.length);


    var getToken = function (title) {
        //console.log("title ", title);
        limiter.removeTokens(1, function (err, remainingRequests) {


            self.tokenize({
                title: title,
                toStr: true,
                geo: 'us'
            }, function (err, data) {
                //console.log("tokens ", data);

                //return


                if (err || !data) {
                    return
                }


                //  console.log("tokens ", data);
                global.TtCollections.KeywordsList.insert({
                    keyword: data,
                    geo: 'fr',
                    count: 1
                });

            });
        });
    };

    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        getToken(item);
    }


};

ee.on("TTdbReady", function () {
    // Keywords.load();
    //Keywords.loadToMongo();
});

Keywords.loatToEs();
module.exports = Keywords;