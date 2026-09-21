$path = "database/legal_sources/nghi_quyet_254_2025_thao_go_dat_dai.txt"
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Strip all w14, w:, etc. before '>'
$lines = $text -split "`r?`n"
$cleanLines = @()
foreach ($line in $lines) {
    # Remove leading tag fragments like w14:paraId="..." ...>
    $l = $line -replace '^.*?>', ''
    $cleanLines += $l.Trim()
}
$cleanText = ($cleanLines -join "`n") -replace '\n{3,}', "`n`n"
[System.IO.File]::WriteAllText($path, $cleanText, [System.Text.Encoding]::UTF8)
Write-Host "CLEANED_FINAL: $(($cleanText.Length)) chars"
