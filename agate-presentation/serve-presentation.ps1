$port = 8081
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Presentation server started successfully."
    Write-Host "URL: http://localhost:$port/"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}

$baseDir = Get-Location

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # Clean up path to prevent traversal/relative paths
        $cleanPath = $urlPath.Replace("/", "\").TrimStart('\')
        $filePath = [System.IO.Path]::GetFullPath((Join-Path $baseDir.Path $cleanPath))
        
        # Ensure the file is inside the base directory to prevent directory traversal
        if (-not $filePath.StartsWith($baseDir.Path)) {
            $response.StatusCode = 403
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".ico" { "image/x-icon" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    } catch {
        Write-Host "Error handling request: $_"
    }
}
