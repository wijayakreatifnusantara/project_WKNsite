$html = Get-Content 'index.html' -Raw
$js = Get-Content 'js\main.js' -Raw
$html = $html -replace '<script src="js/main.js"></script>', "<script>`n$js`n</script>"
Set-Content 'index.html' $html
Write-Host "Inlined successfully!"
