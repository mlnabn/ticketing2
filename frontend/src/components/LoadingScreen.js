import React from 'react';
import { useAuth } from '../AuthContext'; 
export default function LoadingScreen() {

    const { user } = useAuth(); 
    

    const isDarkMode = user?.theme === 'dark' || (user && user.role === 'admin'); 
    const containerClass = isDarkMode ? 'loading-screen-dark' : 'loading-screen-light';
    const spinnerClass = isDarkMode ? 'loading-spinner-dark' : 'loading-spinner-light';

    return (
        <div className={containerClass}>
            <div className={spinnerClass} />
            <p className="loading-text">Memuat Aplikasi...</p>
        </div>
    );
}