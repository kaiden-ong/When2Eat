import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Notification from './Notification';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState('');
  const [friendUsername, setFriendUsername] = useState('');
  const [notification, setNotification] = useState(null);
  const [userHistory, setUserHistory] = useState([]); 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const username = urlParams.get('user');

    const fetchUserData = async () => {
      try {
        if (username !== null) {
          let response = await axios.get(`/api/userInfo?username=${username}`);
          if (response.data.status === "success") {
            setUser(response.data.user);
          } else {
            setUserError('Failed to fetch user data');
          }
        } else {
          setUserError('Please sign in first');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        if (error.response && error.response.status === 404) {
          setUserError('User not found');
        } else {
          setUserError('An error occurred while fetching user data');
        }
      }
    };

    const fetchUserRestaurants = async () => {
      try {
        const restaurantsResponse = await axios.get(`/api/userInfo/userHistory?username=${username}`);

        if (restaurantsResponse.data.status === 'success') {
          setUserHistory(restaurantsResponse.data.restaurants);
        } else {
          setUserError('Failed to fetch restaurants data');
        }
      } catch (error) {
        console.error('Failed to fetch user restaurants', error);
        setUserError('An error occurred while fetching restaurants data');
      }
    };

    fetchUserData();
    fetchUserRestaurants();

  }, []);

  const handleAddFriend = async () => {
    try {
      const response = await axios.post('/api/friends/add', {
        username: user.username,
        friendname: friendUsername
      });
      if (response.data.message) {
        setNotification(response.data.message);
        setUser(prevUser => ({
          ...prevUser,
          friends: [...prevUser.friends, friendUsername]
        }));
      }
      setFriendUsername('');
    } catch (error) {
      console.error('Failed to add friend', error);
      setNotification('Failed to add friend');
    }
  };

  const handleRemoveFriend = async (friendUsername) => {
    try {
      const response = await axios.post('/api/friends/remove', {
        username: user.username,
        friendname: friendUsername
      });
      if (response.data.message) {
        setNotification(response.data.message);
        setUser(prevUser => ({
          ...prevUser,
          friends: prevUser.friends.filter(f => f !== friendUsername)
        }));
      }
    } catch (error) {
      console.error('Failed to remove friend', error);
      setNotification('Failed to remove friend');
    }
  };
  return (
    <div>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      {user ? (
        <div className="profile-container">
          <div>
            <div className="profile-info">
              <h1>{user.username}</h1>
              <p>Points: {user.points}</p>
            </div>
            <div className="addFriend">
              <h1>Add a Friend!</h1>
              <input 
                type="text"
                placeholder="Enter a username/email..."
                value={friendUsername}
                onChange={(event) => setFriendUsername(event.target.value)}/>
              <button type="submit" onClick={handleAddFriend}>Add Friend</button>
            </div>
            <div className="friendsList">
              <h1>Friends List</h1>
              {user.friends.map((friend, index) => (
                <div key={index} className="friendCard">
                  <p>{friend}</p>
                  <button onClick={() => handleRemoveFriend(friend)}>Remove Friend</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1>Restaurants Visited</h1>
            <ul className="restaurants-container">
              {userHistory.map((item) => (
                <li key={item._id} className="restaurant-card">
                  <h3>Restaurant Name: {item.restaurant_name}</h3>
                  <p>Date Visited: {new Date(item.date_visited).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div><h1>{userError}</h1></div>
      )} 
    </div>
  );
};

export default Profile;
