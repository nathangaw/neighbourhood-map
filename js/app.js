var model = {

	pubs: [
			{
				name: 'The Bourne Valley Inn',
				location: 'St Mary Bourne',
				lat: '51.2482932',
				lng: '-1.3917507999999543'
			},
			{
				name: 'Wyke Down',
				location: 'Picket Piece',
				lat: '51.2267321',
				lng: '-1.4240992999999662'
			},
			{
				name: 'Another pub',
				location: 'Andover',
				lat: '51.2544545',
				lng: '-1.4123236726'
			}
		]
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
			MapView.markerClickAction(marker, model.pubs[i].name, model.pubs[i].location);
		}
	},

	markerClickAction: function(marker, pubName, location) {
		var infowindow = new google.maps.InfoWindow({
			content: pubName + ' - ' + location
		});

		marker.addListener('click', function() {
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
			//	infowindow.open(marker.get('map'), marker);
			//	marker.setAnimation(google.maps.Animation.BOUNCE);
			//	setTimeout(function(){ marker.setAnimation(null); }, 1400);
			MapView.clickAction(marker, infowindow);
			}
		});
	},

	clickAction: function(marker, infowindow) {
		infowindow.open(marker.get('map'), marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1400);
	}

}


var Pub = function(data) {  // data is a passed in object literal from model or ajax request
	this.name = ko.observable(data.name);
	this.locattion = ko.observable(data.location);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
}

var ViewModel = function() {

	var self = this;  // self will always equal VM

	this.pubList = ko.observableArray([]);

	model.pubs.forEach(function(pub) {
		self.pubList.push( new Pub(pub) );
	});


}

ko.applyBindings( new ViewModel() );

