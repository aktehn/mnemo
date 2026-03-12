Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot\..\src\assets\logo.png"
$destPath = "$PSScriptRoot\..\build\icon.ico"

# Load source image
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

# ICO file format: write header + directory + image data
# We'll create a multi-size ICO with 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
$sizes = @(256, 128, 64, 48, 32, 16)
$memStreams = @()

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()
    
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $ms.Position = 0
    $memStreams += $ms
}

$src.Dispose()

# Write ICO file manually
$fs = New-Object System.IO.FileStream($destPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)

$count = $sizes.Count

# ICO header
$bw.Write([UInt16]0)      # reserved
$bw.Write([UInt16]1)      # type: 1 = ICO
$bw.Write([UInt16]$count) # number of images

# Calculate offsets
$headerSize = 6 + ($count * 16)
$offset = $headerSize

$dataArrays = @()
foreach ($ms in $memStreams) {
    $dataArrays += ,$ms.ToArray()
}

# Write directory entries
for ($i = 0; $i -lt $count; $i++) {
    $size = $sizes[$i]
    $data = $dataArrays[$i]
    $w = if ($size -eq 256) { 0 } else { $size }  # 256 is stored as 0 in ICO format
    $h = if ($size -eq 256) { 0 } else { $size }
    
    $bw.Write([Byte]$w)           # width
    $bw.Write([Byte]$h)           # height
    $bw.Write([Byte]0)            # color count (0 = no palette)
    $bw.Write([Byte]0)            # reserved
    $bw.Write([UInt16]1)          # color planes
    $bw.Write([UInt16]32)         # bits per pixel
    $bw.Write([UInt32]$data.Length) # size of image data
    $bw.Write([UInt32]$offset)    # offset to image data
    $offset += $data.Length
}

# Write image data
foreach ($data in $dataArrays) {
    $bw.Write($data)
}

$bw.Flush()
$fs.Close()

foreach ($ms in $memStreams) { $ms.Dispose() }

Write-Host "✅ ICO created: $destPath ($count sizes: $($sizes -join ', ')px)"
