/**
 * Menyimpan token dan data user ke localStorage setelah login berhasil.
 * @param {string} token - JWT token dari server.
 * @param {object} user - Objek user (id, name, email, role) dari server.
 */
export const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // Simpan objek user sebagai string JSON
};

/**
 * Mengambil token dari localStorage.
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Mengambil data user dari localStorage.
 * @returns {object|null} - Mengembalikan objek user jika ada, atau null jika tidak.
 */
export const getUser = () => {
    const user = localStorage.getItem('user');
    // Ubah kembali dari string JSON ke objek JavaScript
    return user ? JSON.parse(user) : null;
};

/**
 * Menghapus token dan data user dari localStorage saat logout.
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Hapus juga data user
    // Arahkan kembali ke halaman login untuk pengalaman pengguna yang lebih baik
    window.location.href = '/login';
};

/**
 * Memeriksa apakah user sudah login dengan melihat keberadaan token.
 * @returns {boolean}
 */
export const isLoggedIn = () => !!getToken();