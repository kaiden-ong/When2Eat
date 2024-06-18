import React from 'react';
import '../styles/RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
    return (
        <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="restaurant-card">
            <img src={restaurant.image_url} alt={restaurant.name} className="restaurant-image" />
            <h3>{restaurant.name}</h3>
            <p>{restaurant.location.address1}, {restaurant.location.city}</p>
            <p className="rating">Rating: {restaurant.rating}</p>
            <p>Price: {restaurant.price}</p>
        </a>
    );
};

export default RestaurantCard;

