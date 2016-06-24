
var model = {

	pubs: [
			{
				name: 'The Bourne Valley Inn',
				location: 'St Mary Bourne',
				lat: '51.2482932',
				lng: '-1.3917507999999543',
				marker: undefined,
				infowindow: undefined,
				visible: true
			},
			{
				name: 'Wyke Down',
				location: 'Picket Piece',
				lat: '51.2267321',
				lng: '-1.4240992999999662',
				marker: undefined,
				infowindow: undefined,
				visible: true
			},
			{
				name: 'Another pub',
				location: 'Andover',
				lat: '51.2544545',
				lng: '-1.4123236726',
				marker: undefined,
				infowindow: undefined,
				visible: true
			},
			{
				name: 'Yet Another pub',
				location: 'Andover',
				lat: '51.27343487',
				lng: '-1.4434734',
				marker: undefined,
				infowindow: undefined,
				visible: true
			}
	],

	Pub: function(data) {  // data is a passed in object literal from model or ajax request
		this.name = ko.observable(data.name);
		this.location = ko.observable(data.location);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
		this.marker = ko.observable(data.marker);
		this.infowindow = ko.observable(data.infowindow);
		this.visible = ko.observable(data.visible);
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


	}
}

var ViewModel = function() {

	var self = this;  // self will always equal VM

	self.pubList = ko.observableArray([]);

	model.pubs.forEach(function(pub) {
		self.pubList.push( new model.Pub(pub) );
	});

	//create markers
	self.pubList().forEach(function(pub) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pub.lat(), pub.lng()),
			map: map
		});

		pub.marker = marker; // assign markers to pub object in pubList

		var infowindow = new google.maps.InfoWindow({
			content: pub.name() + ' - ' + pub.location()
		});

		pub.infowindow = infowindow;

		marker.addListener('click', function() {
			self.clickAction(marker, infowindow);
		});

	})

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
			//TODO: set marker visibility to visible
			} else {
			self.pubList()[i].visible(false); // if filter doesn't match name, change visible value to false
			var markerToHide = self.pubList()[i].marker;
			markerToHide.setVisible(false);

			//TODO: set marker visibility to hidden
			}

		}

	}

}




