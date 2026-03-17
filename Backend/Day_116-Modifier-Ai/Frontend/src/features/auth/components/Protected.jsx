import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Protected = ({ children }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if(!loading && !user ){
      navigate('/login', { replace: true});
    }
  }, [loading, user, navigate])

    if (loading) {
        return <h1>Loading...</h1>
    }

    return children
}

export default Protected