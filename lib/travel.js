var Travel = function (bidData) {

    this.bidData = bidData;
    this.isTravel = false;
    this.travelCat = null;

};


Travel.prototype.classify = function () {
    var self = this;
    var bidData = self.bidData;


    var flightRegex=/(flight|)/igm;


};