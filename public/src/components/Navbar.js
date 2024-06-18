import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom"
import '../styles/Navbar.css';
import logo from '../assets/Logo.png'
import axios from "axios";

const Navbar = () => {
	const [loading, setLoading] = useState(true);
	const [identityInfo, setIdentityInfo] = useState(null);

    useEffect(() => {
		const fetchIdentityInfo = async () => {
			try {
				const response = await axios.get('/api/users/myIdentity');
				if (response.data.status === "loggedin") {
					await axios.post('/api/userInfo', {
						email: response.data.userInfo.username,
						name: response.data.userInfo.name
					});
				}
				setIdentityInfo(response.data);
			} catch (error) {
				console.error("Error fetching identity info:", error);
			} finally {
				setLoading(false);
			}
		};
	
		fetchIdentityInfo();
	}, []);

    return (
        <nav className='navigation'>
			<div className="navcontent">
				<img src={logo} alt="When2Eat Logo" />
				<ul className='navlinks'>
					<li>
						<NavLink to='/'>
							Home
						</NavLink>
					</li>
					<li>
						<NavLink to='/wheel'>
							Wheel
						</NavLink>
					</li>
					<li>
						<NavLink to='/explore'>
							Explore
						</NavLink>
					</li>
					{!loading && identityInfo && identityInfo.status === 'loggedin' && (
						<li>
							<NavLink to={`/profile?user=${identityInfo.userInfo.username}`}>
									Profile
							</NavLink>
						</li>
					)}
				</ul>
			</div>
			<div className="authBtns">
				{loading ? (
					<p>Loading...</p>
				) : (
					identityInfo && identityInfo.status === 'loggedin' ? (
						<a href="/signout">Log out</a>
					) : (
						<a href="/signin">Sign in</a>
					)
				)}
			</div>
        </nav>
        )
}

export default Navbar;
