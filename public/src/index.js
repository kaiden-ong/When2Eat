import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Error from './components/Error'
import Home from './components/Home'
import Wheel from './components/Wheel'
import Explore from './components/Explore'
import Profile from './components/Profile'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/wheel',
        element: <Wheel />
      },
      {
        path: '/explore',
        element: <Explore />
      },
      {
        path: '/profile',
        element: <Profile />
      },
      {
        path: '*',
        element: <Error />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


