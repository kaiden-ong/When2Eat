import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/Wheel.css';
import axios from 'axios';
import wheelSpin from '../assets/wheel-spin.gif'
import wheelSound from '../assets/wheel-sound.mp3'

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const hostname = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : "";
const socketUrl = `${protocol}//${hostname}${port}/api/lobbies/wheelSocket`;
let ws = new WebSocket(socketUrl);

const Wheel = () => {
    const nameInputRef = useRef(null);
    const joinLobbyRef = useRef(null);
    const lobbyNameRef = useRef(null);
    const restaurantInputRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [joinedWheel, setJoinedWheel] = useState(false);
    const [showWinnerPopup, setShowWinnerPopup] = useState(false);
    const [showCloseLobby, setShowCloseLobby] = useState(false);
    const [showSpinBtn, setShowSpinBtn] = useState(true);
    const [users, setUsers] = useState([]);
    const [points, setPoints] = useState({});
    const [restaurants, setRestaurants] = useState([]);
    const [noNameError, setNoNameError] = useState('');
    const [spinError, setSpinError] = useState('');
    const [existLobbyError, setExistLobbyError] = useState('');
    const [lastLobbyName, setLastLobbyName] = useState('');
    const [joinLobbyError, setJoinLobbyError] = useState('');
    const [winner, setWinner] = useState("");
    const [currentName, setCurrentName] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [myPoints, setMyPoints] = useState(3)
    const [showSpinning, setShowSpinning] = useState(false)

    const closeLobby = useCallback(async () => {
        let response = await axios.post('/api/lobbies/close', {
            name: lastLobbyName
        });

        if (response.data.status === "success") {
            ws.send(JSON.stringify({
                action: 'lobbyClosed',
                lobbyName: lastLobbyName
            }));
            handleLobbyClosed();
        }
    }, [lastLobbyName]);

    const handleLobbyClosed = () => {
        setNotifications([])
        setUsers([])
        setJoinedLobby(false);
        setJoinedWheel(false);
        setShowWinnerPopup(false);
        setShowCloseLobby(false);
        setShowSpinBtn(false);
        setNoNameError('');
        setSpinError('');
        setExistLobbyError('');
        setLastLobbyName('');
        setJoinLobbyError('');
        setWinner("");
    };

    useEffect(() => {
        const handleWebSocketMessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'nameUpdated') {
                setRestaurants(prevRestaurants => [...prevRestaurants, data.choice]);
                setUsers(prevLobby => [...prevLobby, data.name]);
                setNotifications(prev => [...prev, data.message]);
                setPoints(p => ({...p, [data.choice]: (p[data.choice] + 1 || 1)}));
            } else if (data.action === 'nameDisconnected') {
                setRestaurants(prevRestaurants => prevRestaurants.filter(name => name !== data.choice));
                setUsers(prevLobby => prevLobby.filter(name => name !== data.name));    
                setPoints(p => {
                    const newPoints = { ...p };
                    delete newPoints[data.choice];
                    return newPoints;
                });
                setNotifications(prev => [...prev, data.message]);
                try {
                    const response = await axios.delete(`/api/lobbies/removeUser`, {
                        data: {
                            lobbyName: lastLobbyName,
                            username: data.name
                        }
                    });
                } catch (error) {
                    console.error('Error removing user from lobby:', error);
                }
            } else if (data.action === 'lobbyClosed') {
                setNotifications(prev => [...prev, data.message]);
                setShowSpinBtn(false);
            } else if (data.action === 'winnerDecided') {
                setNotifications(prev => [...prev, data.message])
                if (loggedIn) {
                    await axios.post('/api/userInfo/setPoints', {
                        name: currentName,
                        points: myPoints
                    });
                }
            } else if (data.action === "pointsUpdated") {
                const newPoints = {};
                data.weights.forEach((weight, index) => {
                    newPoints[restaurants[index]] = weight;
                });
                setPoints(newPoints);
            }
        };

        ws.onmessage = handleWebSocketMessage;

        const handleBeforeUnload = () => {
            if (showCloseLobby) {
                closeLobby();
            }
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            ws.onmessage = null;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [lastLobbyName, showCloseLobby, loggedIn, currentName, myPoints, restaurants, closeLobby]);

    const createLobby = async () => {
        if (lobbyNameRef.current.value.trim().length === 0) {
            setExistLobbyError('Must enter lobby name');
            return;
        }
        try {
            let response = await axios.post('/api/lobbies', {
                name: lobbyNameRef.current.value
            });
            if (response.data.status === "success") {
                setNotifications([])
                setLastLobbyName(lobbyNameRef.current.value.trim());
                setJoinedLobby(true);
                setShowCloseLobby(true);
                setShowSpinBtn(true);
                setCurrentName(response.data.sessionName)
                if (response.data.sessionName !== "") {
                    setLoggedIn(true)
                } else {
                    setLoggedIn(false)
                }
                ws.send(JSON.stringify({
                    action: 'joinLobby',
                    lobbyId: response.data.lobbyId
                }));
            } else {
                setExistLobbyError('Lobby name already used');
            }
        } catch (error) {
            console.error('Error creating lobby:', error);
        }        
    }

    const joinLobby = async () => {
        if (joinLobbyRef.current.value.trim().length === 0) {
            setJoinLobbyError('Must enter lobby name');
            return;
        }

        try {
            let response = await axios.get(`/api/lobbies`);
            setPoints(response.data.points)
        } catch (error) {
            console.error('Error joining lobby:', error);
        }
        
        try {
            let response = await axios.get(`/api/lobbies?lobbyName=${joinLobbyRef.current.value}`);
            if (response.data.status === "success") {
                setUsers(response.data.users);
                setRestaurants(response.data.choices);
                setShowSpinBtn(false);
                setJoinedLobby(true);
                setCurrentName(response.data.sessionName)
                if (response.data.sessionName !== "") {
                    setLoggedIn(true)
                } else {
                    setLoggedIn(false)
                }
                setLastLobbyName(joinLobbyRef.current.value.trim());
                setPoints(response.data.weights)
                ws.send(JSON.stringify({
                    action: 'joinLobby',
                    lobbyId: response.data.lobbyId
                }));
            } else if (response.data.status === "closed") {
                setJoinLobbyError('Lobby has not been opened yet or was already closed');
            } else {
                setJoinLobbyError('Lobby name does not exist');
            }
        } catch (error) {
            console.error('Error joining lobby:', error);
        }
        if (loggedIn) {
            try {
                let response = await axios.get(`/api/userInfo?name=${currentName}`);
                setMyPoints(response.data.user.points)
            } catch (error) {
                console.error('Error joining lobby:', error);
            }
        }
    };

    const addName = async (num) => {
        const restaurant = restaurantInputRef.current.value.trim();
        let name
        if (num === 1) {
            name = currentName
            if (restaurant.length < 1) {
                setNoNameError("Restaurant input must be filled out!");
                return;
            }
        } else {
            name = nameInputRef.current.value.trim();
            if (name.length < 1 || restaurant.length < 1) {
                setNoNameError("Both inputs must be filled out!");
                return;
            }
        }
        ws.send(JSON.stringify({
            action: 'updateName',
            name: name,
            restaurant: restaurant
        }));
        await axios.post('/api/lobbies/addName', {
            lobby_name: lastLobbyName,
            name: name,
            restaurant: restaurant
        });
        setJoinedWheel(true);
    };

    const spinWheel = async () => {
        let response = await axios.post('/api/lobbies/spinWheel', {
            name: lastLobbyName
        });
        setShowSpinBtn(false)
        if (response.data.status === "not enough") {
            setSpinError("Need at least 2 participants!")
        } else {
            new Audio(wheelSound).play()
            setWinner(response.data.winner);
            setShowWinnerPopup(true);
            setShowSpinning(true);
            setTimeout(() => {
                setShowSpinning(false);
            }, 4000);
        }
    };

    const closeWinnerPopup = () => {
        setShowWinnerPopup(false);
        setWinner('');
    };

    const increasePoints = async (restaurant, restaurant_index) => {
        if (myPoints === 0) {
            setSpinError('Cannot add any more points, you have 0 points!');
            return;
        }
        const currentPoints = (points[restaurant] || 0) + 1;
        setMyPoints(myPoints-1)
        setPoints({ ...points, [restaurant]: currentPoints });

        ws.send(JSON.stringify({
            action: 'addPoint',
            lobbyName: lastLobbyName,
            restaurant: restaurant_index
        }));    

        await axios.post('/api/lobbies/increase', {
            lobbyName: lastLobbyName,
            restaurant: restaurant_index
        });
    };

    const decreasePoints = async (restaurant, restaurant_index) => {
        const currentPoints = Math.max((points[restaurant] || 0) - 1, 0);
        setMyPoints(myPoints+1)
        setPoints({ ...points, [restaurant]: currentPoints });

        ws.send(JSON.stringify({
            action: 'minusPoint',
            lobbyName: lastLobbyName,
            restaurant: restaurant_index
        }));    

        await axios.post('/api/lobbies/decrease', {
            lobbyName: lastLobbyName,
            restaurant: restaurant_index
        });
    };

    useEffect(() => {
        const getPoints = async () => {
            if (loggedIn) {
                try {
                    let response = await axios.get(`/api/userInfo/points?name=${currentName}`);
                    setMyPoints(response.data.user.points)
                } catch (error) {
                    console.error('Error joining lobby:', error);
                }
            }
        }

        if (joinedLobby) {
            getPoints();
        }
    }, [joinedLobby, joinedWheel, loggedIn, currentName]);

    return (
        <div className="wheel-container">
          {showWinnerPopup && <div className="overlay" />}
          {joinedLobby && <h1>Let's Choose a Restaurant!</h1>}
          {!joinedLobby && (
            <div className="lobby-setup">
              <div className="create-lobby">
                <h2>Create a New Lobby:</h2>
                <input ref={lobbyNameRef} placeholder="Enter New Lobby Name" /><br />
                <button onClick={createLobby}>Create Lobby</button>
                <p className="wheel-error">{existLobbyError}</p>
              </div>
              <div className="join-lobby">
                <h2>Or Join Your Friend's Lobby:</h2>
                <input ref={joinLobbyRef} placeholder="Enter Friend's Lobby Name" /><br />
                <button onClick={joinLobby}>Join Lobby</button>
                <p className="wheel-error">{joinLobbyError}</p>
              </div>
            </div>
          )}
          {joinedLobby && (
            <div className="lobby">
              <div className="lobby-name-display">
                <div>Lobby Name: <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{lastLobbyName}</span></div>
                {showCloseLobby && (
                  <button onClick={closeLobby} className="close-lobby">Close Lobby</button>
                )}
              </div>
              {!joinedWheel && (
                <div className="join-wheel">
                  { loggedIn ? (
                    <div>
                      <h2>Name: {currentName}</h2>
                      <input ref={restaurantInputRef} placeholder='Choose a Restaurant' /><br />
                      <button onClick={() => addName(1)}>Join the Wheel!</button>
                      <p className="wheel-error">{noNameError}</p>
                    </div>
                    ) : (
                    <div>
                      <input ref={nameInputRef} placeholder='Your Name' /><br />
                      <input ref={restaurantInputRef} placeholder='Choose a Restaurant' /><br />
                      <button onClick={() => addName(2)}>Join the Wheel!</button>
                      <p className="wheel-error">{noNameError}</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <h2>
                    Your Points: {myPoints}
                </h2>
              </div>
              <div className="lobby-notifications-container">
                <div className="box lobby-names">
                  <h2>People in lobby:</h2>
                  {users.map((name, index) => (
                    <div key={index} className="lobby-name">
                      <div>{name}'s Restaurant : <span style={{ textDecoration: 'underline' }}>{restaurants[index] ? restaurants[index] : 'No choice selected'}</span></div>
                      <div className="points-controls">
                        <button onClick={() => increasePoints(restaurants[index], index)}>∧</button>
                        <span>{points[restaurants[index]] || 0}</span>
                        <button onClick={() => decreasePoints(restaurants[index], index)} disabled={points[restaurants[index]] === 0}>∨</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="box lobby-notifications">
                  <h2>Lobby Notifications:</h2>
                  {notifications.map((notification, index) => (
                    <div key={index} className={`lobby-notification ${
                      notification.includes("joined") ? "join" :
                      notification.includes("winner") ? "winner" :
                      "leave"}`}>
                      {notification}
                    </div>
                  ))}
                </div>
              </div>
              <br />
              {showSpinBtn && (
                <button onClick={spinWheel} className='spin-wheel'>Spin The Wheel!</button>
              )}
              <p className='wheel-error'>{spinError}</p>
            </div>
          )}
          <div className={`popup ${showWinnerPopup ? 'show' : ''}`}>
            { showSpinning ? (
                <div className='spinner-container'>
                    <img src={wheelSpin} alt="Wheel Spin" className={showSpinning ? 'spinning' : ''} />
                </div>
            ) : (
                <div>
                    <h2>The winner is {winner}</h2>
                    <button onClick={closeWinnerPopup}>Close</button>
                </div>
            )} 
          </div>
        </div>
    );
}

export default Wheel;
