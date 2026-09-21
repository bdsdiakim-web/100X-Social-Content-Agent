Set-Location "D:\100X Agent"
$logPath = "D:\100X Agent\media_output\_auto_tinthoisu_sang.log"
"=== Auto publish (sang 7h) started at $(Get-Date) ===" | Out-File -FilePath $logPath -Encoding utf8

# Dong bo truoc: neu lan chay truoc co cap nhat "published" chua duoc day len, commit+push no truoc
# de "git pull" ben duoi khong bi chan boi xung dot voi thay doi cuc bo chua luu.
git add database/post_inventory.json *>> $logPath
git commit -m "chore: sync published status before sang run" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

$today = Get-Date -Format "yyyyMMdd"
$postId = "post_${today}_tinthoisu_sang"

# Them 2026-09-21: TU DONG THU LAI toi da 3 lan neu chua dang duoc — bai cloud co the chua kip
# tao xong (lech gio) hoac Playwright loi tam thoi (da xay ra that hom nay). Khong con chi chay
# 1 lan roi bo mac im lang nhu truoc.
$maxAttempts = 3
$published = $false
for ($attempt = 1; $attempt -le $maxAttempts -and -not $published; $attempt++) {
    "--- Attempt $attempt/$maxAttempts at $(Get-Date) ---" | Out-File -FilePath $logPath -Append -Encoding utf8
    git pull fork main *>> $logPath
    npm run publish -- "$postId" *>> $logPath
    $status = node -e "try{const d=JSON.parse(require('fs').readFileSync('database/post_inventory.json','utf8'));const p=d.find(x=>x.post_id==='$postId');console.log(p?p.status:'not_found');}catch(e){console.log('error:'+e.message);}"
    "Status after attempt ${attempt}: $status" | Out-File -FilePath $logPath -Append -Encoding utf8
    if ($status -eq 'published') {
        $published = $true
    } elseif ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 120
    }
}
if (-not $published) {
    "!!! CANH BAO: Sau $maxAttempts lan thu, bai $postId VAN CHUA DANG DUOC. Can kiem tra thu cong ngay." | Out-File -FilePath $logPath -Append -Encoding utf8
}

# Day lai trang thai "published" vua cap nhat cuc bo len GitHub ngay,
# tranh de lai thay doi chua commit lam nghen lan chay ke tiep (trua/chieu/toi).
git add database/post_inventory.json *>> $logPath
git commit -m "chore: mark $postId as published" *>> $logPath 2>&1
git push fork main *>> $logPath 2>&1

"=== Auto publish (sang 7h) finished at $(Get-Date) ===" | Out-File -FilePath $logPath -Append -Encoding utf8
