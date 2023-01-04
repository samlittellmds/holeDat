import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { AddressAutofill } from '@mapbox/search-js-react';
import { LocationContext } from '../AddPothole';
import PotholePlot from './PotholeMap';

const mapToken =
  'pk.eyJ1IjoiemFjaG1hcnVsbG8iLCJhIjoiY2xhazZ5aGxyMDQ3bzNwbzZ2Z3N0b3lpMyJ9.65G-mwqhbWFy77O_I0LkOg';

//Componenent with the location search input form. Assigns lat/lon to location context
const PotholeLocation = (prop) => {
  const [location, setLocation] = useState<string>(''); //stores address from input form
  const { coordinates, setCoordinates } = useContext(LocationContext) //set coordinates using AddPothole LocationContext
  const [pothole_id, setPothole_id] = useState<number>(0);
  const [renderMap, setRenderMap] = useState<boolean>(false);
  const isMounted = useRef(false);
  const { setSubmissionStatus } = prop; 

  //turns address into lat and lon coordinates
  const updateLatLon = () => {
    const formattedLocation = location.split(' ').join('%20'); //format location to be read by mapbox
    axios(`https://api.mapbox.com/geocoding/v5/mapbox.places/${formattedLocation}.json?language=en&limit=5&proximity=-121.90662,37.42827&country=US&access_token=${mapToken}`) //geo-code
      .then(
        ({ data }) => { //set the coordinates 
          const newCoordinates = { ...coordinates };
          newCoordinates.lat = data.features[0].center[1];
          newCoordinates.lon = data.features[0].center[0];
          setCoordinates(newCoordinates);
        })
      .catch((err) => console.error('FAILURE TO TURN ADDRESS INTO COORDINATES', err));
  };

  useEffect(() => {
    axios
      .post('/api/pothole/findPothole', { lat: coordinates.lat, lon: coordinates.lon })
      .then(({ data }) => {
        const potholeId = data.length > 0 ? data[0].pothole_id : 0;
        setPothole_id(potholeId);
      })
      .catch(err => console.error('FAILURE TO FINDPOTHOLEID', err))
    isMounted.current ? setRenderMap(true) : (isMounted.current = true);
    }, [coordinates]);

  //makes sure the map renders with the pothole id 
  // useEffect(() => {
  //   isMounted.current ? setRenderMap(true) : isMounted.current = true;
  // }, [coordinates])

  // useEffect(() => {
  //           pothole_id === 0 ? setSubmissionStatus('notInDB') : setSubmissionStatus('inDB');

  // })
  
  const handleMapRender = () => {
    if (renderMap === true) {
      return <PotholePlot coordinates={coordinates} pothole_id={pothole_id} />
    } else {
      return null;
    }
  }

  return (
    <Form.Group className='mb-3'>
      <Form.Group>
      <InputGroup id='addPotLocation'>
        <AddressAutofill accessToken={mapToken} browserAutofillEnabled={true}>
          <Form.Control
            id='mapfill'
            name='address'
            placeholder='Address'
            type='text'
            autoComplete='street-address'
            onChange={(e) => {
              setLocation(e.target.value);
            }}
          />
        </AddressAutofill>
      </InputGroup>
        <Button
          variant='flat'
          onClick={() => {updateLatLon()}}
        >
          Confirm Pothole Address
        </Button>
        {handleMapRender()}
      </Form.Group>
    </Form.Group>
  );
};

export default PotholeLocation;
