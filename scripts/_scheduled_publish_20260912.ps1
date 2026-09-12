Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_scheduled_publish_20260912.log"
"=== Scheduled publish started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8
npm run publish -- "post_20260912_dinhgiathat_broll" *>> $logPath
"=== Scheduled publish finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
