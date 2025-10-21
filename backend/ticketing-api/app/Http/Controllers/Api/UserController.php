<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\Ticket;

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

        $perPage = $request->query('per_page', 10);
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

    public function show(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        return response()->json($user);
    }


    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'min:10', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,user',
        ]);
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->role = $validated['role'];
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();
        return response()->json($user);
    }
    
    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }

    public function activityStats(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        $totalTicketsCreated = Ticket::where('creator_id', $user->id)->count();
        $assetsBorrowed = $user->stokBarangDipinjam()->count();
        $adminStats = [];
        if ($user->role === 'admin') {
            $adminStats['total_tickets_completed'] = Ticket::where('user_id', $user->id)
                ->where('status', 'Selesai')
                ->count();
            $adminStats['total_tickets_in_progress'] = Ticket::where('user_id', $user->id)
                ->whereIn('status', ['Sedang Dikerjakan', 'Ditunda'])
                ->count();
        }
        return response()->json(array_merge([
            'total_tickets_created' => $totalTicketsCreated,
            'assets_currently_borrowed' => $assetsBorrowed,
        ], $adminStats));
    }
}
