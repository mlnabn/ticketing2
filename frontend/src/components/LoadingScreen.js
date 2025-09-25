// src/components/LoadingScreen.jsx

import React from 'react';
// Asumsi Anda memiliki ThemeContext atau state mode gelap tersedia di AuthContext
// Ganti ini sesuai lokasi state mode gelap Anda
// import { useTheme } from '../ThemeContext'; // Jika ada ThemeContext
// ATAU jika di AuthContext:
import { useAuth } from '../AuthContext'; 

export default function LoadingScreen() {
    // Anggap Theme Context belum ada, kita asumsikan status gelap dari useAuth (ini harusnya dari ThemeContext yang benar)
    // Untuk contoh ini, kita buat state dummy. Dalam aplikasi nyata, ganti baris ini.
    // const { isDarkMode } = useTheme(); 
    const { user } = useAuth(); // Asumsi user object punya properti 'theme' atau role 'admin'
    
    // LOGIC TEMA: Asumsikan admin menggunakan tema gelap, atau gunakan state tema yang benar
    // Jika Anda punya state tema di AuthContext: const { isDarkMode } = useAuth();
    // Jika tidak, Anda harus membuatnya global atau memasukkan tema sebagai prop.
    const isDarkMode = user?.theme === 'dark' || (user && user.role === 'admin'); // CONTOH LOGIC
    
    // Pilih class CSS berdasarkan tema
    const containerClass = isDarkMode ? 'loading-screen-dark' : 'loading-screen-light';
    const spinnerClass = isDarkMode ? 'loading-spinner-dark' : 'loading-spinner-light';

    return (
        <div className={containerClass}>
            <div className={spinnerClass} />
            <p className="loading-text">Memuat Aplikasi...</p>
        </div>
    );
}