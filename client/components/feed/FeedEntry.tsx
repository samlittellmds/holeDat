import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


interface phImg {
  image_id: number;
  photoURL: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  pothole_id: number;
  lat: number,
  lon: number,
  badge_id: number;
  fixed: boolean;
  user_id: number;
  name: string;
  photo: string;
}
const FeedEntry = ({ imgObj }: { imgObj: phImg }) => {

  type badgeObj = {
    imgUrl: string;
    description: string;
    name: string
  }

  const [addy, setAddy] = useState('')
  const [badge, setBadge] = useState<badgeObj>()
  const [hoverBool, setHoverBool] = useState<boolean>(false)

  const getInfo = () => {
    axios.get('/api/badges/getBadge', { params: { badgeId: imgObj.badge_id } })
      .then(({ data }) => setBadge(data))
      .catch(err => console.log(err));

    axios.get('/api/location/getAddy', { params: { lat: imgObj.lat, lon: imgObj.lon } }) // on every image object get location
      .then(({ data }) => setAddy(data.split(',')[0]))
      .catch(err => console.log(err));
  }

  const onBadgeHover = (option) => {
    setHoverBool(option)
  }

  useEffect(getInfo, [])
  return (
    <div>
      <h3>{addy}</h3 >
      <Link to={`/Pothole:${imgObj.pothole_id}`}>
        <img
          style={{ borderRadius: '18px' }}
          src={imgObj.photoURL}
          alt='Image'
          width='50%'
          height='50%'
        />
      </Link>
      <img src={imgObj.photo} alt='Image' width="10%"></img>
      <img onMouseOver={() => onBadgeHover(true)} onMouseOut={() => onBadgeHover(false)} src={badge?.imgUrl} alt='Image' width="10%"></img>
      {hoverBool ? badge?.description : badge?.name}
    </div>
  );
};

export default FeedEntry;
