$path = "database/legal_sources/nghi_quyet_254_2025_thao_go_dat_dai.txt"
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Strip w14 and other XML artifact strings from lines
$cleaned = [System.Text.RegularExpressions.Regex]::Replace($text, '(?m)^[a-zA-Z0-9_:]+="[^"]*"\s*>', '')
$cleaned = [System.Text.RegularExpressions.Regex]::Replace($cleaned, 'HYPERLINK "[^"]*"\s*\\t\s*"[^"]*"', '')
$cleaned = [System.Text.RegularExpressions.Regex]::Replace($cleaned, '\n{3,}', "`n`n")
[System.IO.File]::WriteAllText($path, $cleaned, [System.Text.Encoding]::UTF8)
Write-Host "CLEANED_OK: $(($cleaned.Length)) chars"
