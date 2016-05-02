var EventEmitter = require("events").EventEmitter,
    ee = new EventEmitter();

ee.setMaxListeners(30);

module.exports = {
    event: ee
};

