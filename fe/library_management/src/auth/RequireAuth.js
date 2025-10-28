
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getToken } from '../services/localStorageService';

const RequireAuth = ({ children }) => {
  const history = useHistory();

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      history.push('/login');
    }
  }, [history]);

  return <>{children}</>;
};

export default RequireAuth;
