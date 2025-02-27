function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 12.9716, lng: 77.5946 }, // Bangalore
      zoom: 12,
  });

  const geocoder = new google.maps.Geocoder();
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
  });

  const destinations = [
    { address: "Ather Charging Station, Forum Shantiniketan Mall, Whitefield, Bangalore" },
    { address: "Ather Charging Station, Electronics City 1st Phase, Bangalore" },
    { address: "Ather Charging Station, Rajarajeshwari Temple Road, RR Nagar, Bangalore" },
    { address: "Ather Charging Station, Kothanur, Hennur Bagalur Main Road, Bangalore" },
    { address: "Ather Charging Station, Gokul Extension, Mathikere, Bangalore" },
    { address: "PURE EV Charging Station, Arya Hamsa Apartment, JP Nagar Phase 8, Bangalore" },
    { address: "PURE EV Charging Station, Therant Tower, Sahakar Nagar, Bangalore" },
    { address: "Mahindra EV Charging Station, Eva Mall, Brigade Road, Bangalore" },
    { address: "Jayanagar Charging Station, 10th Main Rd, Jayanagar, Bangalore" },
    { address: "Mahindra EV Charging Station, Near Gurur Bus Stop, Jakkur Main Road, Bangalore" },
    { address: "Tata Power EZ Charge Station, Orion Mall, Dr. Rajkumar Road, Malleshwaram, Bangalore" },
    { address: "Tata Power EZ Charge Station, Mantri Square Mall, Sampige Road, Malleshwaram, Bangalore" },
    { address: "EESL EV Charging Station, UB City Mall, Vittal Mallya Road, Bangalore" },
    { address: "Relux Charging Station, Manyata Tech Park, Nagavara, Bangalore" },
    { address: "Zeon Charging Station, RMZ Infinity, Old Madras Road, Bangalore" },
    { address: "Tata Power Charging Station, Phoenix Marketcity Mall, Mahadevapura, Bangalore" },
    { address: "Relux Charging Station, Prestige Shantiniketan, Whitefield, Bangalore" },
    { address: "ChargeGrid Charging Station, HSR Layout Sector 7, Bangalore" },
    { address: "Relux Charging Station, RMZ Ecospace, Bellandur, Bangalore" },
    { address: "EESL Charging Station, Lalbagh Botanical Garden, Mavalli, Bangalore" },
    { address: "Zeon Charging Station, Embassy Tech Village, Devarabisanahalli, Bangalore" },
    { address: "Tata Power Charging Station, Prestige Tech Park, Kadubeesanahalli, Bangalore" },
    { address: "ChargeGrid Charging Station, Kalyan Nagar, Outer Ring Road, Bangalore" },
    { address: "EVRE Charging Station, Prestige Meridian, MG Road, Bangalore" },
    { address: "Magenta Charging Station, Doddanekundi, Outer Ring Road, Bangalore" },
    { address: "Relux Charging Station, Prestige Lakeside Habitat, Varthur, Bangalore" },
    { address: "Tata Power Charging Station, ITPL Tech Park, Whitefield, Bangalore" },
    { address: "ChargeGrid Charging Station, Hennur Main Road, Kalyan Nagar, Bangalore" },
    { address: "Zeon Charging Station, Columbia Asia Hospital, Hebbal, Bangalore" } 
];


  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
              };

              map.setCenter(userLocation);

              new google.maps.Marker({
                  position: userLocation,
                  map,
                  label: "You",
              });

              geocodeDestinations(destinations, userLocation, map, geocoder, directionsService, directionsRenderer);
          },
          () => {
              alert("Geolocation failed. Please enable location services.");
          }
      );
  } else {
      alert("Geolocation is not supported by your browser.");
  }
}

function geocodeDestinations(destinations, userLocation, map, geocoder, directionsService, directionsRenderer) {
  const geocodedDestinations = [];
  let completedRequests = 0;

  destinations.forEach((destination, index) => {
      geocoder.geocode({ address: destination.address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
              const location = results[0].geometry.location;
              geocodedDestinations.push({ label: `D${index + 1}`, location });

              new google.maps.Marker({
                  position: location,
                  map,
                  label: `D${index + 1}`,
              });

              completedRequests++;
              if (completedRequests === destinations.length) {
                  calculateShortestPath(userLocation, geocodedDestinations, map, directionsService, directionsRenderer);
              }
          }
      });
  });
}

function calculateShortestPath(userLocation, destinations, map, directionsService, directionsRenderer) {
  const distances = destinations.map((destination) => {
      const distance = haversineDistance(userLocation, destination.location);
      return { ...destination, distance };
  });

  distances.sort((a, b) => a.distance - b.distance);
  const nearestDestination = distances[0];

  // Display the shortest path
  directionsService.route(
      {
          origin: userLocation,
          destination: nearestDestination.location,
          travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);

              // Display step-by-step directions
              const steps = result.routes[0].legs[0].steps;
              const directionsList = document.getElementById("directions");
              directionsList.innerHTML = "<h3>Directions:</h3>";

              steps.forEach((step, index) => {
                  const instruction = document.createElement("li");
                  instruction.innerHTML = `${index + 1}. ${step.instructions}`;
                  directionsList.appendChild(instruction);
              });

              document.getElementById("response").innerText = JSON.stringify(
                  { nearestDestination },
                  null,
                  2
              );
          } else {
              console.error("Failed to render path:", status);
          }
      }
  );
}

function haversineDistance(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const toRad = (degree) => (degree * Math.PI) / 180;

  const dLat = toRad(coord2.lat() - coord1.lat);
  const dLng = toRad(coord2.lng() - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat());

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

window.initMap = initMap;
