import express from 'express';
import axios from 'axios';

const router = express.Router();

const YELP_API_KEY = 'u_WYncFeWCBqMrDo60oOG94-AXElQzmjrw2HxTjMW_5brEMs9IiD4awCB4CfzLxaAJhGKDg06uUQ4q4F8nzPMHKVh0Z3aayl67AmdR12RUscKZcWEWCJ-eqYkJ9VZnYx';
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';

router.get('/', async (req, res) => {
    const { searchQuery, selectedCuisine, selectedPriceRange, selectedRatings, location, distance } = req.query;

    try {
        const response = await axios.get(YELP_API_URL, {
            headers: {
                Authorization: `Bearer ${YELP_API_KEY}`,
            },
            params: {
                term: searchQuery || 'restaurants',
                location: location || 'University of Washington', // Default location
                radius: (distance || 10) * 1609, // Convert miles to meters, default 10 miles
                categories: selectedCuisine.toLowerCase() || 'restaurants',
                price: selectedPriceRange || undefined,
                limit: 50,
            },
        });

        let restaurants = response.data.businesses;

        if (selectedRatings) {
            const ratings = selectedRatings.split(',').map(Number);
            restaurants = restaurants.filter(restaurant =>
                restaurant.rating >= Math.min(...ratings)
            );
        }

        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants from Yelp:', error);
        res.status(500).send('Server error');
    }
});

export default router;

