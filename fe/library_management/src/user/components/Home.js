import React from 'react'
import { useHistory } from 'react-router-dom';
import { useEffect } from "react";
import { logOut } from '../../services/authenticationService'
import Header from '../layouts/Header';
import { getToken } from '../../services/localStorageService';

const Home = () => {
  const history = useHistory()

  useEffect(() =>{
    const accessToken = getToken()
     if (!accessToken) {
      history.push("/login");
      console.log('chưa login')
    } else {
      console.log('đã login')
    }
  })

  const handleLogout = () => {
    //  Xử lý logout
    logOut();
    history.push('/login')
  };
  return ( 
    <div>
      <Header handleLogout={handleLogout}></Header>
    </div>
  )
}

export default Home
