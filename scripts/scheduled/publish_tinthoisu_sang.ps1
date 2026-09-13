Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_sang.log"
"=== Auto publish (sang 7h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8
git pull fork main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_sang"
npm run publish -- "$postId" *>> $logPath
"=== Auto publish (sang 7h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
