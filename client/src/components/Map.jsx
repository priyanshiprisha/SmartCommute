import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

function LocationSearchInput({ value, onChange, placeholder }) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  });

  useEffect(() => {
    setValue(value, false);
  }, [value, setValue]);

  const handleInput = (e) => {
    setValue(e.target.value);
    onChange({ address: e.target.value });
  };

  const handleSelect = async (suggestion) => {
    setValue(suggestion.description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: suggestion.description });
      const { lat, lng } = await getLatLng(results[0]);
      onChange({
        address: suggestion.description,
        coordinates: { lat, lng }
      });
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <div className="relative">
      <input
        value={inputValue}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {status === 'OK' && (
        <ul className="absolute z-50 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <strong>{main_text}</strong> <small>{secondary_text}</small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Map({ origin, destination, isDriver, onLocationSelect }) {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!originCoords || !destinationCoords) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: originCoords,
        destination: destinationCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setError(null);

          // Calculate distance and duration
          const route = result.routes[0];
          const distance = route.legs[0].distance.text;
          const duration = route.legs[0].duration.text;

          if (onLocationSelect) {
            onLocationSelect({
              distance: parseFloat(distance.replace(/[^0-9.]/g, '')),
              duration: duration,
              originCoords,
              destinationCoords
            });
          }
        } else {
          setError('Error calculating route. Please try different locations.');
        }
      }
    );
  }, [originCoords, destinationCoords, onLocationSelect]);

  const handleOriginSelect = ({ address, coordinates }) => {
    onLocationSelect({ origin: address });
    if (coordinates) {
      setOriginCoords(coordinates);
    }
  };

  const handleDestinationSelect = ({ address, coordinates }) => {
    onLocationSelect({ destination: address });
    if (coordinates) {
      setDestinationCoords(coordinates);
    }
  };

  return (
    <div className="space-y-4">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
      >
        <div className="space-y-4 mb-4">
          <LocationSearchInput
            value={origin}
            onChange={handleOriginSelect}
            placeholder="Enter pickup location"
          />
          <LocationSearchInput
            value={destination}
            onChange={handleDestinationSelect}
            placeholder="Enter destination"
          />
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: isDriver ? '#2563eb' : '#059669',
                  strokeWeight: 5
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {directions && directions.routes[0].legs[0] && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="text-lg font-semibold">
                {directions.routes[0].legs[0].distance.text}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="text-lg font-semibold">
                {directions.routes[0].legs[0].duration.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;