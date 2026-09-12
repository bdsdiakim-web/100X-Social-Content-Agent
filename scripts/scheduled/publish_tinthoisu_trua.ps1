Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_trua.log"
"=== Auto publish (trua 12h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8
git pull origin main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_trua"
npm run publish -- "$postId" *>> $logPath
"=== Auto publish (trua 12h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
