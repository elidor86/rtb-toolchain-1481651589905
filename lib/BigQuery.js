var gcloud = require('gcloud')({
    projectId: 'tt-main',
    keyFilename: global.appRoot + '/ssl/tt-main-4af0fbbea93d.json'
});


var bigquery = gcloud.bigquery();


var Bq = {
    dataset: bigquery.dataset('RTB'),
    tables: {},
    getTable: function (tableName) {
        return this.tables[tableName] || this.dataset.table(tableName);
    },
    getUniqeByIpBySubId: function (data, cb) {

        var q = "SELECT ch, geo, tid, COUNT(UNIQUE(ip)) AS UniqueIPs FROM [target_talent.mainjs_log] WHERE year = " + data.year + " AND (Month = " + data.month + ") AND (Day = " + data.day + ") AND ((ch = '10')OR(ch = '11')) GROUP BY ch, geo, tid ORDER BY ch DESC, geo DESC, UniqueIPs DESC"

        var self = this;
        self.query({q: q}, function (err, res) {

            if (err) {
                if (cb) {
                    cb(err, null);
                }
                console.log(err);
                return;
            }

            if (cb) {
                cb(null, res);
            }

            return;
            console.log("getUniqeByIpBySubId res ", res);

        });
    },
    getUniqeByGeo: function (data, cb) {

        var q = "SELECT day, geo, COUNT(UNIQUE(ip)) AS UniqueUsersS FROM [target_talent.mainjs_log] WHERE year = "
            +
            data.year
            +
            " AND (Month = "
            +
            data.month
            +
            ") AND (Day = "
            +
            data.day
            +
            " ) AND ( (ch = '10') OR (ch = '11') ) GROUP BY day, geo ORDER BY UniqueUsersS DESC";

        var self = this;
        self.query({q: q}, function (err, res) {

            if (err) {
                if (cb) {
                    cb(err, null);
                }
                console.log(err);
                return;
            }

            if (cb) {
                cb(null, res);
            }

            return;
            console.log("getUniqeByIpBySubId res ", res);

        });
    },
    query: function (data, cb) {

        var query = "SELECT DOMAIN(referer) AS user_domain, COUNT(*) AS activity_count FROM [target_talent.mainjs_log] GROUP BY user_domain HAVING user_domain IS NOT NULL AND user_domain != '' ORDER BY activity_count DESC LIMIT 15;";
        bigquery.query(data.q, function (err, rows) {
            if (err) {
                if (cb) {
                    cb(err, null);
                }
                return;
            }
            console.log("res ", rows);
            if (cb) {
                cb(null, rows);
            }
        });


    },
    insert: function (data, cb) {

        if (!cb) {
            cb = function (err, insertErrors, apiResponse) {
                //console.log("bq insert apiResponse ", apiResponse);
            }
        }
        //console.log("bq insert data ", data);
        var self = this;
        self.getTable(data.tableName).insert(data.params, {ignoreUnknownValues: true}, cb);
    },
    createTable: function (data) {

        var tableConfig = {
            id: data.id,

            // From the data.gov CSV dataset (http://goo.gl/kSE7z6):
            schema: data.schema
            // schema: 'UNITID,INSTNM,ADDR,CITY,STABBR,ZIP,FIPS,OBEREG,CHFNM'
        };

        this.dataset.createTable(tableConfig, function (err, table, apiResponse) {
            console.log("bq createTable apiResponse ", apiResponse);
        });
    }
};


module.exports = Bq;
