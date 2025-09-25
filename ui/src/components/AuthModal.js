import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';

const AuthModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    return (
        <>
            {isLogin ? (
                <Login 
                    onSwitchToRegister={switchToRegister}
                    onClose={onClose}
                />
            ) : (
                <Register 
                    onSwitchToLogin={switchToLogin}
                    onClose={onClose}
                />
            )}
        </>
    );
};

export default AuthModal;
