Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_toi.log"
"=== Auto publish (toi 19h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8
git pull fork main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_toi"
npm run publish -- "$postId" *>> $logPath
"=== Auto publish (toi 19h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
