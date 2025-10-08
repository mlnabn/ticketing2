<?php

if (!function_exists('getColorFromName')) {
    function getColorFromName($nama)
    {
        $namaLower = strtolower(trim($nama));

        $mappings = getColorMappings();

        $colorMap = array_merge(
            $mappings['customColorMap'],
            $mappings['cssColorHexMap']
        );

        return $colorMap[$namaLower] ?? 'transparent';
    }
}

if (!function_exists('getColorMappings')) {
    function getColorMappings()
    {
        return [
            'customColorMap' => [
                'merah' => '#ff0000',
                'biru' => '#0000ff',
                'hijau' => '#008000',
                'kuning' => '#ffff00',
                'hitam' => '#000000',
                'putih' => '#ffffff',
                'abu' => '#808080',
                'abu-abu' => '#808080',
                'coklat' => '#a52a2a',
                'jingga' => '#ffa500',
                'ungu' => '#800080',
                'emas' => '#ffd700',
                'silver' => '#c0c0c0',
                'stainless' => '#d3d3d3',
                'smoke' => '#708090',
                'clear' => '#fff2cc',
                'titanium' => '#747c83'
            ],
            'cssColorNames' => [
                "red",
                "blue",
                "green",
                "yellow",
                "black",
                "white",
                "gray",
                "grey",
                "brown",
                "orange",
                "purple",
                "pink",
                "silver",
                "gold",
                "cyan",
                "magenta",
                "lime",
                "maroon",
                "navy",
                "olive",
                "teal",
                "aqua",
                "violet",
                "indigo",
                "turquoise",
                "chocolate",
                "coral",
                "crimson",
                "darkblue",
                "darkgray",
                "darkgreen",
                "darkred",
                "lightblue",
                "lightgreen",
                "lightgray",
                "beige",
                "titanium"
            ],
            'cssColorHexMap' => [ // tambahan baru
                "red" => "#ff0000",
                "blue" => "#0000ff",
                "green" => "#008000",
                "yellow" => "#ffff00",
                "black" => "#000000",
                "white" => "#ffffff",
                "gray" => "#808080",
                "grey" => "#808080",
                "brown" => "#a52a2a",
                "orange" => "#ffa500",
                "purple" => "#800080",
                "pink" => "#ffc0cb",
                "silver" => "#c0c0c0",
                "gold" => "#ffd700",
                "cyan" => "#00ffff",
                "magenta" => "#ff00ff",
                "lime" => "#00ff00",
                "maroon" => "#800000",
                "navy" => "#000080",
                "olive" => "#808000",
                "teal" => "#008080",
                "aqua" => "#00ffff",
                "violet" => "#ee82ee",
                "indigo" => "#4b0082",
                "turquoise" => "#40e0d0",
                "chocolate" => "#d2691e",
                "coral" => "#ff7f50",
                "crimson" => "#dc143c",
                "darkblue" => "#00008b",
                "darkgray" => "#a9a9a9",
                "darkgreen" => "#006400",
                "darkred" => "#8b0000",
                "lightblue" => "#add8e6",
                "lightgreen" => "#90ee90",
                "lightgray" => "#d3d3d3",
                "beige" => "#f5f5dc",
                "titanium" => "#747c83"
            ]
        ];
    }
}
