
var model = {

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
				name: 'Another pub',
				location: 'Andover',
				lat: '51.2544545',
				lng: '-1.4123236726',
				visible: true,
				venueID: '4c0012c5c30a2d7fdef5111d'
			},
			{
				name: 'Yet Another pub',
				location: 'Andover',
				lat: '51.27343487',
				lng: '-1.4434734',
				visible: true,
				venueID: '4c0012c5c30a2d7fdef5111d'
			}
	],

	Pub: function(data) {  // data is a passed in object literal from model or ajax request
		this.name = ko.observable(data.name);
		this.location = ko.observable(data.location);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
	//	this.marker = ko.observable(data.marker);
	//	this.infowindow = ko.observable(data.infowindow);
		this.visible = ko.observable(data.visible);
		this.venueID = ko.observable(data.venueID);
	}

}

var map;

var MapView = {

	// call map and create markers
	initMap: function() {

	//	var myLatLng = {lat: -25.363, lng: 131.044};

		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 51.221863, lng: -1.439873}
		});

		ko.applyBindings( new ViewModel() );

	},

	googleError: function() {
		window.alert('Apologies, but Google Maps is not responding. Please try again later.');
	}
}

var ViewModel = function() {

	var self = this;  // self will always equal VM

	self.pubList = ko.observableArray([]);

	model.pubs.forEach(function(pub) {
		self.pubList.push( new model.Pub(pub) );
	});

	this.showResetButton = ko.observable(false);

	//create markers
	self.pubList().forEach(function(pub) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pub.lat(), pub.lng()),
			map: map
		});

		pub.marker = marker; // assign markers to pub object in pubList

		var foursquareURL = 'https://api.foursquare.com/v2/venues/' + pub.venueID() + '?client_id=DMLUVT5P3HRQXMDHJ0H5ZU3IEBFPSWQRLZTJKGW2PC5XNSZK&client_secret=O5ZUDTNLXKD25KTF4MDJWNLTXZSGP1GAL5T2OBPAVHUN1LYK&v=20160625';

		$.ajax({
			url: foursquareURL,
			format: 'json',
			success: function (data) {
				var phone = data.response.venue.contact.formattedPhone;
				var likeCount = data.response.venue.likes.count;
				var foursquareCanonicalURL = data.response.venue.canonicalUrl;

				var infowindow = new google.maps.InfoWindow({
					content: pub.name() + ' - ' + pub.location() + '<br>' + 'Tel: ' + phone + '<br>' + 'Foursquare Likes: ' + likeCount + '<br>' + '<a href="' + foursquareCanonicalURL + '">View on Foursquare</a>'
					});

				pub.infowindow = infowindow;
				self.listener(marker, infowindow);
			},
			error: function() {
				var infowindow = new google.maps.InfoWindow({
					content: pub.name() + ' - ' + pub.location() + '<br>Additional information ftom Foursquare is not available at this time.'
					});

				pub.infowindow = infowindow;
				self.listener(marker, infowindow);
			}
		})
	})

	self.listener = function(marker, infowindow) {
		marker.addListener('click', function() {
		self.clickAction(marker, infowindow);
		});
	}


	self.clickAction = function(marker, infowindow) {
		infowindow.open(marker.get('map'), marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1400);
	}



	self.listClick = function(object) {
		self.clickAction(object.marker, object.infowindow);
	}

	this.filterPhrase = ko.observable('');

	// checks filter phrase against pubnames and hides names that aren't matched
	this.checkFilter = function() {

		// convert filter phrase to lower case and assign to simpler var
		var search = self.filterPhrase().toLowerCase();



		// iterate over pub names and check whether match filter phrase
		for (i = 0; i < self.pubList().length; i++) {

			var pubName = self.pubList()[i].name().toLowerCase();


			if (pubName.startsWith(search)) {
			self.pubList()[i].visible(true); // if filter matches name, change visible value to true
			var markerToShow = self.pubList()[i].marker;
			markerToShow.setVisible(true);
			} else {
			self.pubList()[i].visible(false); // if filter doesn't match name, change visible value to false
			var markerToHide = self.pubList()[i].marker;
			markerToHide.setVisible(false);
			this.showResetButton(true);


			}

		}

	}

	this.clearFilter = function() {
		for (i = 0; i < self.pubList().length; i++) {
			self.pubList()[i].visible(true);
		}
	}


}