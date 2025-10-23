<?php

return [
    'api_key' => env('DEEPSEEK_API_KEY'),
    'api_endpoint' => env('DEEPSEEK_API_ENDPOINT', 'https://api.deepseek.com/v1/chat/completions'),
    'model' => env('DEEPSEEK_MODEL', 'deepseek-chat'),
];