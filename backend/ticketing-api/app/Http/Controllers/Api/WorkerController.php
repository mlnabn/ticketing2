<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Worker;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    public function index()
    {
        return Worker::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:workers|max:255']);
        $worker = Worker::create($validated);
        return response()->json($worker, 201);
    }
}