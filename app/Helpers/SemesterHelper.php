<?php

namespace App\Helpers;

class SemesterHelper
{
    public static function tr(string $name): string
    {
        return str_replace(
            ['Spring', 'Fall', 'Summer', 'Winter'],
            ['Bahar',  'Güz',  'Yaz',    'Kış'],
            $name
        );
    }
}
