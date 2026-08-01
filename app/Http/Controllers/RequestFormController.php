<?php
namespace App\Http\Controllers;

use Inertia\Inertia;

class RequestFormController extends Controller
{
    public function index()
    {
        return Inertia::render('request-form');
    }
}
