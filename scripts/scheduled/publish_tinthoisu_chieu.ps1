Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_chieu.log"
"=== Auto publish (15h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8

git add database/post_inventory.json *>> $logPath
git commit -m "chore: sync published status before chieu run" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

git pull fork main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_chieu"
npm run publish -- "$postId" *>> $logPath

git add database/post_inventory.json *>> $logPath
git commit -m "chore: mark $postId as published" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

"=== Auto publish (15h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
