Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_sang.log"
"=== Auto publish (sang 7h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8

# Dong bo truoc: neu lan chay truoc co cap nhat "published" chua duoc day len, commit+push no truoc
# de "git pull" ben duoi khong bi chan boi xung dot voi thay doi cuc bo chua luu.
git add database/post_inventory.json *>> $logPath
git commit -m "chore: sync published status before sang run" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

git pull fork main *>> $logPath
$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_sang"
npm run publish -- "$postId" *>> $logPath

# Day lai trang thai "published" vua cap nhat cuc bo len GitHub ngay,
# tranh de lai thay doi chua commit lam nghen lan chay ke tiep (trua/toi).
git add database/post_inventory.json *>> $logPath
git commit -m "chore: mark $postId as published" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

"=== Auto publish (sang 7h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
