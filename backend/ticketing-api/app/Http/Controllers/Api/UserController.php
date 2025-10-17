<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = User::query();

        if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('email', 'like', '%' . $search . '%')
              ->orWhere('role', 'like', '%' . $search . '%');
        });
    }

        if ($request->has('all')) {
            return $query->get();
        }

        $perPage = $request->query('per_page', 10); // Default 10 user per halaman
        $users = $query->orderBy('role', 'asc')->orderBy('name', 'asc')->paginate($perPage);
        return response()->json($users);
    }

    public function getAdmins()
    {
        $admins = User::where('role', 'admin')->get();
        return response()->json($admins);
    }

    public function all()
    {
        // DIUBAH: Tambahkan ->where('role', 'user') untuk hanya mengambil user biasa.
        $users = User::where('role', 'user')
                    ->orderBy('name')
                    ->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'phone'    => 'required|string|min:10|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role'     => $validated['role'], 
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
        // Otorisasi: Pastikan hanya admin yang bisa mengakses
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        // Validasi data yang masuk
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Pastikan email unik, kecuali untuk user yang sedang diedit
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'min:10', Rule::unique('users')->ignore($user->id)],
            // Password bersifat opsional: hanya divalidasi jika tidak kosong
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,user',
        ]);

        // Update data nama dan email
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->role = $validated['role'];

        // Jika field password diisi oleh admin, maka hash dan update passwordnya
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // Simpan perubahan ke database
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
