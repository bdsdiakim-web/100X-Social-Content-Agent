Add-Type -AssemblyName System.IO.Compression.FileSystem

function Convert-DocxToText($docxFile) {
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($docxFile.FullName)
        $entry = $zip.GetEntry('word/document.xml')
        if ($entry) {
            $stream = $entry.Open()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
            $xmlText = $reader.ReadToEnd()
            $stream.Close()
            $reader.Close()
            
            $text = [System.Text.RegularExpressions.Regex]::Replace($xmlText, '(?i)<w:p[ >]', [Environment]::NewLine)
            $text = [System.Text.RegularExpressions.Regex]::Replace($text, '<[^>]+>', '')
            $decoded = [System.Net.WebUtility]::HtmlDecode($text)
            
            $outName = [System.IO.Path]::GetFileNameWithoutExtension($docxFile.Name) + '.txt'
            $outPath = Join-Path $docxFile.DirectoryName $outName
            [System.IO.File]::WriteAllText($outPath, $decoded, [System.Text.Encoding]::UTF8)
            Write-Host "Converted: $($docxFile.Name) -> $outName ($($decoded.Length) chars)"
        }
        $zip.Dispose()
    } catch {
        Write-Host "Error processing $($docxFile.FullName) : $_"
    }
}

$dir = 'D:\100X Agent\database\legal_sources'
Get-ChildItem -Path $dir -Filter "*.docx" | ForEach-Object {
    Convert-DocxToText $_
}
