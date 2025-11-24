const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

export const login = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Mengambil token dari localStorage.
 */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

/**
 * Menghapus token dan data user dari localStorage saat logout.
 */
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
};

export const isLoggedIn = () => !!getToken();