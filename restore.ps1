$content = Get-Content 'index.html' -Raw
$index = $content.IndexOf('</script>', $content.IndexOf('window.onerror'))
if ($index -gt 0) {
    $newContent = $content.Substring(0, $index + 9) + "`r`n    <script src=`"js/main.js`"></script>`r`n</body>`r`n</html>"
    Set-Content 'index.html' $newContent
    Write-Host "Restored index.html successfully!"
} else {
    Write-Host "Could not find window.onerror marker."
}
