import React, { useState, useEffect, useCallback } from 'react';
import RestaurantCard from './RestaurantCard';
import '../styles/Explore.css';
import debounce from 'lodash.debounce';

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("University of Washington");
    const [distance, setDistance] = useState(10);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState("");
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const commonCuisines = ["Asian", "Italian", "Mexican", "American", "Indian", "Chinese", "Japanese", "Mediterranean", "Thai"];

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/explore');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setFilteredRestaurants(data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Error fetching restaurants');
        } finally {
            setLoading(false);
        }
    };

    const debouncedApplyFilters = useCallback(
        debounce(async (params) => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams(params);
                const response = await fetch(`/api/explore?${queryParams.toString()}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setFilteredRestaurants(data);
            } catch (error) {
                console.error('Error applying filters:', error);
                setError('Ran out of daily YELP API calls');
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        const params = {
            searchQuery,
            location,
            distance,
            selectedCuisine,
            selectedPriceRange: selectedPriceRange.join(','),
            selectedRatings: selectedRatings.join(','),
        };
        debouncedApplyFilters(params);
    }, [searchQuery, location, distance, selectedCuisine, selectedPriceRange, selectedRatings]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleDistanceChange = (event) => {
        setDistance(event.target.value);
    };

    const handleCuisineChange = (event) => {
        setSelectedCuisine(event.target.value);
    };

    const handlePriceRangeChange = (priceRange) => {
        setSelectedPriceRange((prev) =>
            prev.includes(priceRange)
                ? prev.filter((p) => p !== priceRange)
                : [...prev, priceRange]
        );
    };

    const handleRatingChange = (rating) => {
        setSelectedRatings((prev) =>
            prev.includes(rating)
                ? prev.filter((r) => r !== rating)
                : [...prev, rating]
        );
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setLocation("University of Washington");
        setDistance(10);
        setSelectedCuisine("");
        setSelectedPriceRange([]);
        setSelectedRatings([]);
        fetchRestaurants();
    };

    return (
        <div className="search">
            <header className="main-header">
                <h2>Search Restaurants</h2>
            </header>
            <div className="filter-search">
                <div className="search-input">
                    <h6 className="search-label">Search By Name</h6>
                    <input className="exploreinput" type="text"
                        value={searchQuery}
                        onChange={handleSearchChange} />
                </div>
                <div className="location-input">
                    <h6 className="search-label">Location</h6>
                    <input className="exploreinput" type="text"
                        value={location}
                        onChange={handleLocationChange} />
                </div>
                <div className="distance-input">
                    <h6 className="search-label">Distance (miles)</h6>
                    <select value={distance} onChange={handleDistanceChange}>
                        {[1, 5, 10, 15, 20, 25, 50].map((dist) => (
                            <option key={dist} value={dist}>{dist} miles</option>
                        ))}
                    </select>
                </div>
                <div className="filter-form">
                    <div className="cuisine-filter p-3">
                        <h6 className="filter-title">Filter by Cuisine</h6>
                        <select
                            value={selectedCuisine}
                            onChange={handleCuisineChange}
                            className="form-control"
                        >
                            <option value="">All Cuisines</option>
                            {commonCuisines.map((cuisine) => (
                                <option key={cuisine} value={cuisine}>
                                    {cuisine}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="price-range-filter p-2 mx-2 border-top">
                        <h6>Filter by Price Range</h6>
                        {["1", "2", "3", "4"].map((priceRange) => (
                            <div key={priceRange}>
                                <input
                                    type="checkbox"
                                    id={`price-range-${priceRange}`}
                                    checked={selectedPriceRange.includes(priceRange)}
                                    onChange={() => handlePriceRangeChange(priceRange)}
                                />
                                <label htmlFor={`price-range-${priceRange}`}>{'$'.repeat(priceRange)}</label>
                            </div>
                        ))}
                    </div>
                    <div className="rating-filter p-2 mx-2 border-top">
                        <h6>Filter by Rating</h6>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating}>
                                <input
                                    type="checkbox"
                                    id={`rating-${rating}`}
                                    checked={selectedRatings.includes(rating)}
                                    onChange={() => handleRatingChange(rating)}
                                />
                                <label htmlFor={`rating-${rating}`}>{rating} Stars</label>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                    Clear Filters
                </button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className="search-results-container">
                    <div className="matched-restaurants">
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))
                        ) : (
                            <div className="no-results-message">
                                <p>No results found.</p>
                                <p>Try adjusting filters or search term.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Explore;


