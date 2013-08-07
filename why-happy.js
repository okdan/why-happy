// set up parse
Parse.initialize("w7g8oVKFLY93W5leYMcDXnS0jhrCa6fGkKIz1meJ", "PkAl5Tat0cIIyIuPHzSHZNRDG66iVn8wXPGuz7yf");
var HappyReason = Parse.Object.extend("HappyReason");

// set up the ractive object for template handling and data binding
var ractive = new Ractive({
  el: 'happiness',
  template: '#happiness-template',
  data : {
	  df : function(d) {
	  	return moment(d).calendar();
	  }  	
  }
});

// fetch up to 100 reasons, newest first
// TODO handle error on fetch
var fetchTimeout;
var getReasons = function(skipDelay) {
	var query = new Parse.Query(HappyReason).limit(100).descending('createdAt');
	query.find({
		success: function(results) {
			ractive.set("reasons", results);
			ractive.set('tempReason', ''); // clear the temp value
		}
	})
	if (!skipDelay) {
		if (fetchTimeout) clearTimeout(fetchTimeout);
		fetchTimeout = setTimeout(getReasons, updateDelay);
	}
}

// save a new reason
ractive.on('addHappyReason', function(evt) {
	evt.original.preventDefault();
	var happyReason = new HappyReason();
	this.set('tempReason', this.get('newReason'));
	// save it, reload on success
	// TODO handle save error
	happyReason.save({ reason : this.get('newReason') }, {
		success : getReasons
	});
	this.set('newReason', ''); // clear the field
});

// delete a reason (allow for all, for now)
ractive.on('deleteReason', function(evt) {
	evt.original.preventDefault();
	var reason = this.get(evt.keypath);
	// set it to undefined right away
	this.set(evt.keypath, undefined);
	reason.destroy({
		success : getReasons
	})
})


var updateDelay = 10000;
// load up existing reasons, poll every 10 seconds
getReasons();