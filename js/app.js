var model = {

	// raw data
	pubs: [
			{
				name: 'The Bourne Valley Inn',
				location: 'St Mary Bourne',
				lat: '51.2482932',
				lng: '-1.3917507999999543',
				visible: true,
				venueID: '4bd8a2762ecdce7298e0d0f2'
			},
			{
				name: 'Wyke Down',
				location: 'Picket Piece',
				lat: '51.2267321',
				lng: '-1.4240992999999662',
				visible: true,
				venueID: '4c0012c5c30a2d7fdef5111d'
			},
			{
				name: 'The Angel',
				location: 'Andover',
				lat: '51.20941178309271',
				lng: '-1.4790264368057',
				visible: true,
				venueID: '4bb4b7d2613fb713a61294e6'
			},
			{
				name: 'Magic Roundabout',
				location: 'Andover',
				lat: '51.21314255704008',
				lng: '-1.4875885248184',
				visible: true,
				venueID: '4c0b9f39340720a14c578893'
			},
			{
				name: 'The Crook and Shears',
				location: 'Upper Clatford',
				lat: '51.191906137239414',
				lng: '-1.49417757987976',
				visible: true,
				venueID: '4d3095a1789a8cfa3ded30c6'
			}
	],

	// constructor function to create each pub with observable data. Some data could be left as non-observable
	// but converting all for consistency and future-proofing
	Pub: function(data) {
		this.name = ko.observable(data.name);
		this.location = ko.observable(data.location);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
		this.visible = ko.observable(data.visible);
		this.venueID = ko.observable(data.venueID);
	}

};

var map;

var MapView = {

	// initialise map
	initMap: function() {

		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 11,
			center: {lat: 51.221863, lng: -1.439873}
		});

		// keep centre of map in middle of window on resize. Courtesy of http://stackoverflow.com/questions/8792676/center-google-maps-v3-on-browser-resize-responsive
		var center;
		function calculateCenter() {
		  center = map.getCenter();
		}
		google.maps.event.addDomListener(map, 'idle', function() {
		  calculateCenter();
		});
		google.maps.event.addDomListener(window, 'resize', function() {
		  map.setCenter(center);
		});

		// implement Knockout bindings
		ko.applyBindings( new ViewModel() );

	},

	// error message if Google Maps API returns error
	googleError: function() {
		window.alert('Apologies, but Google Maps is not responding. Please try again later.');
	}
};

var ViewModel = function() {

	// self will always reference ViewModel
	var self = this;

	// create observable array for pubs to populate
	self.pubList = ko.observableArray([]);

	// run constructor function and push objects to observable array
	model.pubs.forEach(function(pub) {
		self.pubList.push( new model.Pub(pub) );
	});

	// set reset button to be hidden by default
	this.showResetButton = ko.observable(false);

	// create infowindow object for use later
	var infowindow = new google.maps.InfoWindow();

	// loop over pubList array. Initial action to create map marker
	self.pubList().forEach(function(pub) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pub.lat(), pub.lng()),
			map: map
		});

		// assign marker to pub object in pubList
		pub.marker = marker;

		// construct foursquare url
		var foursquareURL = 'https://api.foursquare.com/v2/venues/' + pub.venueID() + '?client_id=DMLUVT5P3HRQXMDHJ0H5ZU3IEBFPSWQRLZTJKGW2PC5XNSZK&client_secret=O5ZUDTNLXKD25KTF4MDJWNLTXZSGP1GAL5T2OBPAVHUN1LYK&v=20160625';

		// retrieve data from foursquare
		$.ajax({
			url: foursquareURL,
			format: 'json',

			// if API call is successful extract data from response
			success: function (data) {
				var phone = data.response.venue.contact.formattedPhone;
				var likeCount = data.response.venue.likes.count;
				var foursquareCanonicalURL = data.response.venue.canonicalUrl;

				var contentString =	pub.name() + ' - ' + pub.location() + '<br>' + 'Tel: ' + phone + '<br>' + 'Foursquare Likes: ' + likeCount + '<br>' + '<a href="' + foursquareCanonicalURL + '">View on Foursquare</a>';
				pub.contentString = contentString;
				pub.infowindow = infowindow;

				// call function to add event listener
				self.listener(marker, infowindow, contentString);
			},

			// if API call fails modify data used in infowindow
			error: function() {

				var contentString =	pub.name() + ' - ' + pub.location() + '<br>Additional information from Foursquare is not available at this time.';
				pub.contentString = contentString;
				pub.infowindow = infowindow;

				// call function to add event listener
				self.listener(marker, infowindow, contentString);
			}
		});
	});

	// adds event listener to map marker
	self.listener = function(marker, infowindow, contentString) {
		marker.addListener('click', function() {
		self.clickAction(marker, infowindow, contentString);
		});
	};

	// actions to be taken upon click
	self.clickAction = function(marker, infowindow, contentString) {
		infowindow.setContent(contentString);
		infowindow.open(marker.get('map'), marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1400);
	};


	// triggered by list click, calls clickAction function
	self.listClick = function(object) {
		self.clickAction(object.marker, object.infowindow, object.contentString);
	};

	// sets filter input text as observable
	this.filterPhrase = ko.observable('');

	// checks filter phrase against pubnames and hides names that aren't matched
	this.checkFilter = function() {

		// close all infowindows so open windows don't remain when markers are removed
		infowindow.close();

		// convert filter phrase to lower case and assign to simpler var
		var search = self.filterPhrase().toLowerCase();

		// iterate over pub names and check whether they match filter phrase
		for (var i = 0; i < self.pubList().length; i++) {

			var pubName = self.pubList()[i].name().toLowerCase();


			if (pubName.startsWith(search)) {
			self.pubList()[i].visible(true); // if filter matches name, change visible value to true
			var markerToShow = self.pubList()[i].marker;
			markerToShow.setVisible(true); // if filter matches name, change marker visibility to true
			} else {
			self.pubList()[i].visible(false); // if filter doesn't match name, change visible value to false
			var markerToHide = self.pubList()[i].marker;
			markerToHide.setVisible(false); // if filter doesn't match name, change marker visibility to false
			this.showResetButton(true); // if at least one list object has been hidden, show 'reset filter' button
			}
		}
	};

	// resets filter
	this.clearFilter = function() {
		for (var i = 0; i < self.pubList().length; i++) {

			// makes all pubs in list visible
			self.pubList()[i].visible(true);

			// makes all markers visible
			self.pubList()[i].marker.setVisible(true);

			// hides reset filter button
			this.showResetButton(false);
		}
	};
};