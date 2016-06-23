var model = {

	pubs: [
			{
				name: 'The Bourne Valley Inn',
				location: 'St Mary Bourne',
				lat: '51.2482932',
				lng: '-1.3917507999999543',
				marker: undefined,
				infowindow: undefined
			},
			{
				name: 'Wyke Down',
				location: 'Picket Piece',
				lat: '51.2267321',
				lng: '-1.4240992999999662',
				marker: undefined,
				infowindow: undefined
			},
			{
				name: 'Another pub',
				location: 'Andover',
				lat: '51.2544545',
				lng: '-1.4123236726',
				marker: undefined,
				infowindow: undefined
			},
			{
				name: 'Yet Another pub',
				location: 'Andover',
				lat: '51.27343487',
				lng: '-1.4434734',
				marker: undefined,
				infowindow: undefined
			}
	],

	Pub: function(data) {  // data is a passed in object literal from model or ajax request
		this.name = ko.observable(data.name);
		this.location = ko.observable(data.location);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
		this.marker = ko.observable(data.marker);
		this.infowindow = ko.observable(data.infowindow);
	}

}

var MapView = {

	// call map and create markers
	initMap: function() {

		var myLatLng = {lat: -25.363, lng: 131.044};

		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 51.221863, lng: -1.439873}
		});

		for (var i = 0; i < model.pubs.length; i++) {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(model.pubs[i].lat, model.pubs[i].lng),
				map: map
			});
			model.pubs[i].marker = marker; // save marker object back to model
			MapView.markerClickAction(marker, model.pubs[i].name, model.pubs[i].location, i);
		}
	},

	// create infowindow and add listener for marker click actions
	markerClickAction: function(marker, pubName, location, i) {
		var infowindow = new google.maps.InfoWindow({
			content: pubName + ' - ' + location
		});

		model.pubs[i].infowindow = infowindow; // save infowindow object back to model

		marker.addListener('click', function() {
	//		if (marker.getAnimation() !== null) {
	//			marker.setAnimation(null);
	//		} else {
			MapView.clickAction(marker, infowindow);
	//		}
		});
	},

	// open infowindow and bounce marker on click event
	clickAction: function(marker, infowindow) {
		infowindow.open(marker.get('map'), marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1400);
	}

}


var ViewModel = function() {

	var self = this;  // self will always equal VM

	this.pubList = ko.observableArray([]);

	model.pubs.forEach(function(pub) {
		self.pubList.push( new model.Pub(pub) );
	});

	this.listClick = function(object) {
//		MapView.clickAction(object.marker(), object.infowindow());
		console.log(object.marker());
		console.log(object.infowindow());
	}


}

ko.applyBindings( new ViewModel() );

