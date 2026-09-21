Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_trua.log"
"=== Auto publish (11h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8

git add database/post_inventory.json *>> $logPath
git commit -m "chore: sync published status before trua run" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

git pull fork main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_trua"
npm run publish -- "$postId" *>> $logPath

git add database/post_inventory.json *>> $logPath
git commit -m "chore: mark $postId as published" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

"=== Auto publish (11h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
