var index = {
    "settings": {
        "index": {
            "number_of_shards": 10,
            "number_of_replicas": 0
        },
        "analysis": {
            "analyzer": {
                "job_analyzer": {
                    "tokenizer": "standard",
                    "filter": ["standard", "lowercase", "trim", "digit_remove", "whitespace_remove", "word_delimiter", "my_snow", "english_stop", "french_stop", "german_stop", "job_stop", "filter_shingle", "trim", "whitespace_remove2"]
                }
            },
            "filter": {
                "my_snow": {
                    "type": "stemmer",
                    "name": "minimal_english"
                },
                "german_stop": {
                    "type": "stop",
                    "stopwords": "_german_"
                },
                "english_stop": {
                    "type": "stop",
                    "stopwords": "_english_"
                },
                "french_stop": {
                    "type": "stop",
                    "stopwords": "_french_"
                },
                "job_stop": {
                    "type": "stop",
                    "stopwords": [
                        "company",
                        "mon",
                        "fri",
                        "search",
                        "other",
                        "thi",
                        "home",
                        "refresh",
                        "result",
                        "com",
                        "back",
                        "unavailable",
                        "sign",
                        "part time",
                        "full time",
                        "employee",
                        "new",
                        "training",
                        "associate",
                        "m-f",
                        "needed",
                        "partner",
                        "p.m",
                        "independent",
                        "opportunity",
                        "wanted",
                        "become",
                        "experienced",
                        "and",
                        "an",
                        "work",
                        "dedicated",
                        "pay",
                        "independent",
                        "in",
                        "job",
                        "jobs",
                        "am",
                        "m f am pm",
                        "am pm",
                        "m f",
                        "pm",
                        "earn",
                        "hiring",
                        "to",
                        "or",
                        "solo",
                        "houston",
                        "your",
                        "more",
                        "with",
                        "available",
                        "for",
                        "city",
                        "required",
                        "washington",
                        "the",
                        "top",
                        "chicago",
                        "apply",
                        "on",
                        "make",
                        "of",
                        "how",
                        "fail",
                        "you",
                        "dallas",
                        "atlanta",
                        "high",
                        "guaranteed",
                        "today",
                        "between",
                        "based",
                        "positions",
                        "career",
                        "this",
                        "as",
                        "only",
                        "philadelphia",
                        "opportunities",
                        "quick",
                        "looking",
                        "now",
                        "careers",
                        "we�ll",
                        "boston",
                        "applicants",
                        "get",
                        "days",
                        "denver",
                        "all",
                        "indianapolis",
                        "minneapolis",
                        "at",
                        "phoenix",
                        "pittsburgh",
                        "necessary",
                        "january",
                        "sacramento",
                        "every",
                        "springfield",
                        "oklahoma",
                        "be",
                        "is",
                        "seeking",
                        "cleveland",
                        "baltimore",
                        "portland",
                        "from",
                        "memphis",
                        "nashville",
                        "detroit",
                        "start",
                        "colorado",
                        "opportunites",
                        "orleans",
                        "long",
                        "end",
                        "tulsa",
                        "hire",
                        "illinois",
                        "excellent",
                        "incentive",
                        "reimbursement",
                        "skills",
                        "we",
                        "having",
                        "provided",
                        "virginia",
                        "hourly",
                        "want",
                        "florida",
                        "need",
                        "welcome",
                        "benefits",
                        "hiring",
                        "have",
                        "can",
                        "getting",
                        "easy",
                        "our",
                        "requirements",
                        "than",
                        "experienced"
                    ]
                },
                "whitespace_remove": {
                    "type": "pattern_replace",
                    "pattern": " +",
                    "replacement": " "
                },
                "whitespace_remove2": {
                    "type": "pattern_replace",
                    "pattern": " +",
                    "replacement": " "
                },
                "digit_remove": {
                    "type": "pattern_replace",
                    "pattern": "\\d",
                    "replacement": " "
                },
                "filter_shingle": {
                    "type": "shingle",
                    "max_shingle_size": 3,
                    "min_shingle_size": 2,
                    "filler_token": "",
                    "output_unigrams": "true"
                }
            }
        }
    },
    "mappings": {
        "_default_": {
            "properties": {
                "date": {
                    "type": "date"
                },
                "Channel_ID": {"type": "integer"},
                "Campaign_ID": {"type": "integer"},
                "Campaign_Name": {"type": "string", "index": "not_analyzed"},
                "BID_Value": {"type": "float"},
                "Referrer_Hostname": {"type": "string", "index": "not_analyzed"},
                "Max_Num_Of_BIDs": {"type": "integer"},
                "Bid_URL": {"type": "string", "index": "not_analyzed"},
                "Filter_GEO": {"type": "string", "index": "not_analyzed"},
                "Filter_URLs": {"type": "string", "index": "not_analyzed"},
                "Filter_KeyWords": {"type": "string", "index": "not_analyzed"},
                "Filter_Function": {"type": "string", "index": "not_analyzed"},
                "Num_Of_BIDs_Sent": {"type": "integer"},
                "Num_Of_BIDS_Won": {"type": "integer"},
                "Browser_Ver": {"type": "string", "index": "not_analyzed"},
                "Language": {"type": "string", "index": "not_analyzed"},
                "IP": {"type": "string", "index": "not_analyzed"},
                "os": {"type": "string", "index": "not_analyzed"},
                "SearchEngine": {"type": "string", "index": "not_analyzed"},
                "Source_ID": {"type": "string", "index": "not_analyzed"},
                "Operating_System": {"type": "string", "index": "not_analyzed"},
                "GEO": {"type": "string", "index": "not_analyzed"},
                "BID_ID": {"type": "string", "index": "not_analyzed"},
                "Publisher_ID": {"type": "string", "index": "not_analyzed"},
                "latlon": {"type": "geo_point"},
                "Query": {
                    "type": "string",
                    "analyzer": "job_analyzer",
                    "fields": {
                        "english": {
                            "type": "string",
                            "analyzer": "english"
                        },
                        "full": {"type": "string", "index": "not_analyzed"}
                    }
                },
                "utm_source": {
                    "type": "string",
                    "analyzer": "english",
                    "fields": {
                        "full": {"type": "string", "index": "not_analyzed"}
                    }
                },
                "utm_medium": {
                    "type": "string",
                    "analyzer": "english",
                    "fields": {
                        "full": {"type": "string", "index": "not_analyzed"}
                    }
                },
                "utm_campaign": {
                    "type": "string",
                    "analyzer": "english",
                    "fields": {
                        "full": {"type": "string", "index": "not_analyzed"}
                    }
                },
                "utm_term": {
                    "type": "string",
                    "analyzer": "english",
                    "fields": {
                        "full": {"type": "string", "index": "not_analyzed"}
                    }
                },
                "URL": {"type": "string", "index": "not_analyzed"},
                "Referrer": {"type": "string", "index": "not_analyzed"},
                "UserAgent": {"type": "string", "index": "not_analyzed"},
                "Browser": {"type": "string", "index": "not_analyzed"},
                "URL_Hostname": {"type": "string", "index": "not_analyzed"},
                "URL_Query_Q": {"type": "string", "index": "not_analyzed"},
                "URL_Protocol": {"type": "string", "index": "not_analyzed"},
                "URL_Pathname": {"type": "string", "index": "not_analyzed"},
                "BID_url": {"type": "string", "index": "not_analyzed"},
                "BID_Currency": {"type": "string", "index": "not_analyzed"},
                "Redirect_URL": {"type": "string", "index": "not_analyzed"}
            }
        }
    }
}