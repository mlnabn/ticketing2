<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::where('role', 'user')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role'     => 'user',
        ]);

        return response()->json($user, 201);
    }

    /**
     * (BARU) Menampilkan data satu pengguna.
     */
    public function show(User $user)
    {
        // Pastikan hanya admin yang bisa mengakses
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        return response()->json($user);
    }

    /**
     * (BARU) Memperbarui data pengguna.
     */
    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Pastikan email unik, kecuali untuk user ini sendiri
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            // Password bersifat opsional, hanya di-update jika diisi
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update data dasar
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Jika ada password baru, hash dan update
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * (BARU) Menghapus pengguna.
     */
    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        
        // Tambahan: Jangan biarkan admin menghapus dirinya sendiri
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
