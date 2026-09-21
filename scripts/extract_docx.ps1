Add-Type -AssemblyName System.IO.Compression.FileSystem
$docx = (Get-ChildItem -Path "database/legal_sources" -Filter "*254*.docx")[0].FullName
$zip = [System.IO.Compression.ZipFile]::OpenRead($docx)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$clean = $xml -replace '<w:p[ >]', "`n"
$clean = $clean -replace '<[^>]+>', ''
$clean = [System.Net.WebUtility]::HtmlDecode($clean)
$outPath = "database/legal_sources/nghi_quyet_254_2025_thao_go_dat_dai.txt"
[System.IO.File]::WriteAllText($outPath, $clean, [System.Text.Encoding]::UTF8)
Write-Host "SUCCESS: Written $(($clean.Length)) characters to $outPath"
