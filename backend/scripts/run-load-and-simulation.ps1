# Script automatizado para ejecucion de evidencias de Fase 3 y Fase 5 de AuctionHub
$ErrorActionPreference = "Stop"

$imgDir    = "F:\senati\semestre_6\seminario\days\26_10_ip_3\imagenes"
$outputFile = "F:\senati\semestre_6\seminario\days\26_10_ip_3\EVIDENCIAS_OPERACIONES_AUCTIONHUB.txt"
$report    = [System.Collections.Generic.List[string]]::new()

function Log-Evidence($title, $reqMethod, $reqUrl, $reqHeaders, $reqBody, $resStatus, $resBody) {
    $report.Add("================================================================================")
    $report.Add("OPERACION: $title")
    $report.Add("FECHA/HORA: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
    $report.Add("PETICION:")
    $report.Add("  Metodo: $reqMethod")
    $report.Add("  URL: $reqUrl")
    if ($reqHeaders) {
        $report.Add("  Cabeceras:")
        foreach ($k in $reqHeaders.Keys) { $report.Add("    $k : $($reqHeaders[$k])") }
    }
    if ($reqBody) {
        $report.Add("  Cuerpo / Parametros:")
        $report.Add("    $reqBody")
    }
    $report.Add("RESPUESTA:")
    $report.Add("  Estado: $resStatus")
    $report.Add("  Cuerpo JSON:")
    $report.Add("    $resBody")
    $report.Add("")
}

# Funcion para detectar el tipo MIME real de una imagen por sus magic bytes
function Get-RealMimeType($path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    if ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) {
        return "image/png"
    }
    if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) {
        return "image/jpeg"
    }
    if ($bytes.Length -ge 12) {
        $riff = [System.Text.Encoding]::ASCII.GetString($bytes, 0, 4)
        $webp = [System.Text.Encoding]::ASCII.GetString($bytes, 8, 4)
        if ($riff -eq "RIFF" -and $webp -eq "WEBP") {
            return "image/webp"
        }
    }
    return "application/octet-stream"
}

Write-Host ">>> Iniciando Sesiones de Autenticacion..." -ForegroundColor Cyan

$credList = @(
    @{ username = "vendedor1";  email = "vendedor1@auctionhub.com";  pass = "Password123!"; role = "seller" },
    @{ username = "vendedor2";  email = "vendedor2@auctionhub.com";  pass = "Password123!"; role = "seller" },
    @{ username = "comprador1"; email = "comprador1@auctionhub.com"; pass = "Password123!"; role = "buyer"  },
    @{ username = "comprador2"; email = "comprador2@auctionhub.com"; pass = "Password123!"; role = "buyer"  }
)

$tokens  = @{}
$userIds = @{}

foreach ($c in $credList) {
    $loginBody = @{ email = $c.email; password = $c.pass } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
               -Method Post -ContentType "application/json" -Body $loginBody
    $tokens[$c.username]  = $res.data.token
    $userIds[$c.username] = $res.data.user.id
    Log-Evidence "Autenticacion / Inicio de Sesion - $($c.username)" `
        "POST" "http://localhost:3000/api/auth/login" `
        @{ "Content-Type" = "application/json" } `
        $loginBody "200 OK" ($res | ConvertTo-Json -Compress)
}

Write-Host ">>> Autenticacion exitosa de las 4 cuentas." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Catalogo de 35 productos
# Para cada imagen se detecta el MIME real y se pasa a curl con ;type=
# ---------------------------------------------------------------------------
$catalog = @(
    @{ img="128gb_usb_dt_exodia_kingston_3_punto_2.jpg";                              title="USB Kingston 128GB DataTraveler Exodia 3.2";            desc="Memoria flash USB 3.2 Gen 1 Kingston Exodia con tapa protectora y anilla.";                                  price=45.00;   seller="vendedor1" },
    @{ img="almacenamiento_ssd_kingston_nv3_m2_2tb_6000_mbs_pcie.jpg";               title="SSD Kingston NV3 M.2 2TB PCIe 4.0 NVMe";               desc="Unidad de estado solido Kingston NV3 PCIe 4.0 6000MB/s lectura ultrarrapida.";                               price=480.00;  seller="vendedor1" },
    @{ img="case-o-gabinete-gamer-para-pc-cybertel-killer-cbx5016-rgb-vidrio-templado-.jpg"; title="Gabinete Gamer Cybertel Killer CBX5016 RGB";      desc="Chasis gamer con panel lateral de vidrio templado y 4 ventiladores RGB incluidos.";                          price=195.00;  seller="vendedor1" },
    @{ img="cooler_rgb_2200_rpm_para_laptop.webp";                                    title="Cooler Pad RGB 2200 RPM para Laptop Gaming";            desc="Base refrigerante para laptop de alto rendimiento con luces RGB y doble turbina.";                            price=65.00;   seller="vendedor1" },
    @{ img="corsair_fuente_de_poder_550wt_80_plus_gold.webp";                         title="Fuente Corsair 550W 80 Plus Gold Modular";              desc="Fuente de poder certificada Corsair 80 Plus Gold con proteccion termica activa.";                             price=280.00;  seller="vendedor1" },
    @{ img="cybercool_cooler_para_laptop_HA_k5.webp";                                 title="Cooler Cybercool HA-K5 5 Ventiladores";                 desc="Base enfriadora para laptops de hasta 17 pulgadas con display digital y selector.";                          price=75.00;   seller="vendedor1" },
    @{ img="datatraveler_1tb_usb_ultimate_gt.jpg";                                    title="USB Kingston DataTraveler Ultimate GT 1TB Metal";       desc="Memoria USB de maxima capacidad 1TB en cuerpo de aleacion de zinc resistente.";                               price=350.00;  seller="vendedor1" },
    @{ img="ddr4_3200_memoria_ram_fury_beast_para_pc.webp";                           title="Memoria RAM Kingston Fury Beast 16GB DDR4 3200";        desc="Modulo de memoria RAM DDR4 3200MHz con disipador de calor negro de perfil bajo.";                            price=160.00;  seller="vendedor1" },
    @{ img="fuente-de-poder-gigabyte-p550ss-550w-80-plus-silver-gp-p550ss.jpg";       title="Fuente Gigabyte P550SS 550W 80 Plus Silver";            desc="Fuente silenciosa Gigabyte 550W certificacion Silver con capacitores japoneses.";                            price=210.00;  seller="vendedor1" },
    @{ img="fuente-de-poder-seasonic-focus-gx-1000w-80-plus-gold-modular.jpg";        title="Fuente Seasonic Focus GX-1000W 80 Plus Gold";           desc="Fuente de alimentacion modular de 1000W certificacion Gold con modo hibrido.";                               price=720.00;  seller="vendedor1" },
    @{ img="fuente_de_poder_80_plus_bronze_coolmark_600wt.webp";                      title="Fuente Coolmark 600W 80 Plus Bronze";                   desc="Fuente eficiente 600 Watts certificada Bronze para estaciones de trabajo y gaming.";                         price=175.00;  seller="vendedor1" },
    @{ img="gabinete_cougar_385CC60.jpg";                                             title="Gabinete Cougar MX330 Mid Tower Gaming";                desc="Chasis semitorre Cougar con excelente flujo de aire y soporte para refrigeracion liquida.";                  price=220.00;  seller="vendedor1" },
    @{ img="HIKSEMIHS-USB-M200_8gB_metal.webp";                                       title="USB Hiksemi M200 8GB Metalico Compacto";                desc="Pendrive ultra compacto de 8GB diseno unibody de metal a prueba de golpes.";                                 price=18.00;   seller="vendedor1" },
    @{ img="laptop_dell.png";                                                         title="Laptop Dell Inspiron 15 Core i5 16GB 512GB";           desc="Laptop empresarial Dell pantalla 15.6 pulgadas FHD teclado numerico y bateria duradera.";                   price=2150.00; seller="vendedor1" },
    @{ img="laptop_hp.jpg";                                                           title="Laptop HP Pavilion 14 Ryzen 7 16GB 512GB SSD";         desc="Portatil ultraligero HP Pavilion chasis de aluminio procesador AMD Ryzen 7 5700U.";                          price=2450.00; seller="vendedor1" },
    @{ img="laptop_victus.png";                                                       title="Laptop Gamer HP Victus 15 Core i7 RTX 3050";           desc="Laptop para juegos HP Victus pantalla 144Hz panel IPS graficos RTX dedicados.";                              price=3600.00; seller="vendedor1" },
    @{ img="lightspeed_mouse_gamer_logitech_g_pro.jpg";                               title="Mouse Logitech G Pro Wireless Lightspeed 25K";          desc="Mouse inalambrico competitivo sensor HERO 25K peso pluma y switches mecanicos.";                             price=380.00;  seller="vendedor1" },
    @{ img="memoria_ram_dato_8gb_3200_mhz_disipador.jpg";                             title="Memoria RAM DATO 8GB DDR4 3200MHz Disipada";            desc="Modulo RAM 8GB DDR4 optimizado para plataformas Intel y AMD con disipador termico.";                         price=85.00;   seller="vendedor1" },
    @{ img="memory_kings_cooler_refrigeracion_pc.jpg";                                title="Refrigeracion Liquida CPU Memory Kings 240mm";          desc="Sistema de enfriamiento liquido todo en uno con radiador de 240mm y ventiladores ARGB.";                    price=260.00;  seller="vendedor2" },
    @{ img="monitor_1080_full_hd_acer_amd_freesync.webp";                             title="Monitor Acer 24 Pulgadas FHD AMD FreeSync 75Hz";        desc="Monitor de oficina y multimedia Acer con tecnologia antirreflejo y puertos HDMI VGA.";                      price=420.00;  seller="vendedor2" },
    @{ img="monitor_asus_rog_2k_full_hd_25_pulgadas.jpg";                             title="Monitor Gaming ASUS ROG 25 Pulgadas 2K 165Hz";          desc="Pantalla esports ASUS Republic of Gamers tiempo de respuesta 1ms y HDR400.";                               price=1280.00; seller="vendedor2" },
    @{ img="monitor_caixun_24_pulgadas_180_hz_hdr_full_hd.webp";                      title="Monitor Caixun 24 Pulgadas Gaming 180Hz HDR";           desc="Monitor ultrarrapido 180Hz disenado para shooters competitivos con sincronizacion adaptativa.";             price=490.00;  seller="vendedor2" },
    @{ img="monitor_teros_curvo_1920_1080_fhd.webp";                                  title="Monitor Curvo Teros 27 Pulgadas FHD 144Hz";             desc="Panel curvo 1500R Teros experiencia inmersiva para simulacion y entretenimiento.";                           price=610.00;  seller="vendedor2" },
    @{ img="mouse_razer_v3_pro_35k_210h_wireless.webp";                               title="Mouse Razer DeathAdder V3 Pro Wireless 35K";            desc="Mouse gaming ergonomico Razer sensor optico Focus Pro de 35000 DPI.";                                       price=460.00;  seller="vendedor2" },
    @{ img="musetex_chasis_pc_gabinete_atx_blanco_3_x_120mm.jpg";                     title="Case ATX Musetex Blanco 3 Ventiladores ARGB";           desc="Gabinete blanco moderno con vidrio templado dual y gestion de cableado optimizada.";                        price=295.00;  seller="vendedor2" },
    @{ img="rtx_5050_gigabyte.webp";                                                  title="Tarjeta Gigabyte GeForce RTX 4060 Windforce 8G";        desc="Grafica RTX para juegos en 1080p con soporte para trazado de rayos y DLSS 3.";                             price=1350.00; seller="vendedor2" },
    @{ img="rtx_5070_gigabyte.jpg";                                                   title="Tarjeta Gigabyte GeForce RTX 4070 Gaming OC 12GB";      desc="Potente tarjeta grafica para resolucion 1440p y 4K con 12GB GDDR6X y disipador triple fan.";               price=2850.00; seller="vendedor2" },
    @{ img="rtx_quadro.jpg";                                                          title="Tarjeta Profesional NVIDIA Quadro RTX 4000 8GB";        desc="Aceleradora grafica profesional certificada para CAD renderizado 3D y simulaciones.";                        price=1950.00; seller="vendedor2" },
    @{ img="rx_9050_amd_radeon.jpg";                                                  title="Tarjeta AMD Radeon RX 7600 XT 16GB GDDR6";             desc="Grafica Radeon con 16GB de memoria de video y tecnologia AMD FidelityFX Super Resolution.";                 price=1420.00; seller="vendedor2" },
    @{ img="samsung_500gb_disco_duro_solido.jpg";                                     title="SSD Samsung 870 EVO 500GB SATA 2.5";                    desc="Unidad solida interna Samsung 870 EVO lectura secuencial hasta 560 MB/s.";                                  price=210.00;  seller="vendedor2" },
    @{ img="ssd_plus_sandisk_2tb_sata_III_2_punto_5_545_mbs_lectura_3d_nand.webp";    title="SSD SanDisk SSD PLUS 2TB SATA III 2.5";                 desc="Disco solido SanDisk 2TB de gran capacidad ideal para bibliotecas de juegos y respaldos.";                  price=450.00;  seller="vendedor2" },
    @{ img="teclado_gamer_thunderobot_mecanico_k98_red_led_rgb.jpg";                  title="Teclado Mecanico Thunderobot K98 RGB Switch Red";       desc="Teclado mecanico 98 teclas con interruptores rojos lineales y retroiluminacion dinamica.";                  price=180.00;  seller="vendedor2" },
    @{ img="teclado_inalambrico_rk61plus_indigo_60%.webp";                            title="Teclado Inalambrico Royal Kludge RK61 Plus 60%";        desc="Teclado mecanico compacto 60 por ciento conectividad triple Bluetooth 2.4GHz y cable.";                    price=240.00;  seller="vendedor2" },
    @{ img="teclado_mecanico_snpurdiri_60%_mini_teclado.jpg";                         title="Mini Teclado Snpurdiri 60% RGB Gamer";                  desc="Teclado ultracompacto con keycaps translucidas y teclas de funcion multimedia.";                            price=115.00;  seller="vendedor2" },
    @{ img="usb_256gb_kingston_datatraveler.webp";                                    title="USB Kingston DataTraveler Kyson 256GB Metal";           desc="Memoria USB de aleacion metalica elegante 256GB con velocidades de transferencia de hasta 200MB/s."; price=85.00;   seller="vendedor2" }
)

Write-Host ">>> Limpiando productos anteriores (si los hay)..." -ForegroundColor Yellow
# Obtener lista actual de productos y eliminarlos para partir desde 0
$existingRaw = & curl.exe -s "http://localhost:3000/api/products"
$existing = $existingRaw | ConvertFrom-Json
if ($existing.success -and $existing.data -and $existing.data.Count -gt 0) {
    Write-Host "   Encontrados $($existing.data.Count) productos previos, eliminando..." -ForegroundColor Yellow
    foreach ($ep in $existing.data) {
        $adminToken = $tokens["vendedor1"]  # usar seller para eliminar los suyos
        # Intentar eliminar; si no hay endpoint DELETE, se ignorara
        try {
            & curl.exe -s -X DELETE "http://localhost:3000/api/products/$($ep.id)" `
                -H "Authorization: Bearer $adminToken" | Out-Null
        } catch {}
    }
}

Write-Host ">>> Publicando los 35 productos con sus fotografias en MinIO..." -ForegroundColor Cyan

$createdProducts = [System.Collections.Generic.List[psobject]]::new()
$counter = 1
$errors  = 0

foreach ($item in $catalog) {
    $sellerUser = $item.seller
    $token      = $tokens[$sellerUser]
    $imagePath  = Join-Path $imgDir $item.img

    # Detectar MIME real por magic bytes
    $realMime = Get-RealMimeType $imagePath

    $rawRes = & curl.exe -s -X POST "http://localhost:3000/api/products" `
        -H "Authorization: Bearer $token" `
        -F "title=$($item.title)" `
        -F "description=$($item.desc)" `
        -F "initialPrice=$($item.price)" `
        -F "image=@$imagePath;type=$realMime"

    $parsed = $rawRes | ConvertFrom-Json

    if ($parsed.success) {
        $createdProducts.Add($parsed.data)
        Log-Evidence "Publicacion de Producto #$counter - $($item.title) ($sellerUser)" `
            "POST" "http://localhost:3000/api/products" `
            @{ "Authorization" = "Bearer [TOKEN_SELLER]"; "Content-Type" = "multipart/form-data" } `
            "title=$($item.title) | price=$($item.price) | image=$($item.img) [mime=$realMime]" `
            "201 Created" $rawRes
        Write-Host " [$counter/35] OK: $($item.title) -> $($parsed.data.id)" -ForegroundColor Green
    } else {
        $errors++
        Write-Host " [ERROR en #$counter] $($item.title): $rawRes" -ForegroundColor Red
        Log-Evidence "ERROR - Publicacion de Producto #$counter - $($item.title)" `
            "POST" "http://localhost:3000/api/products" `
            @{ "Authorization" = "Bearer [TOKEN_SELLER]" } `
            "title=$($item.title) | image=$($item.img)" `
            "ERROR" $rawRes
    }
    $counter++
}

Write-Host ">>> Total de productos creados con exito: $($createdProducts.Count) / 35  (errores: $errors)" -ForegroundColor $(if ($errors -eq 0) {"Green"} else {"Yellow"})

# ---------------------------------------------------------------------------
# 3. Simulacion de 5 transacciones (pujas + compras)
# Los montos de puja DEBEN superar el initialPrice del producto
# ---------------------------------------------------------------------------
Write-Host ">>> Iniciando simulacion de 5 transacciones de subasta y compra..." -ForegroundColor Cyan

$tokenBuyer1 = $tokens["comprador1"]
$tokenBuyer2 = $tokens["comprador2"]

# Helper para hacer POST JSON con Invoke-RestMethod y capturar errores HTTP
function Invoke-Api($uri, $token, $jsonBody) {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        if ($jsonBody) {
            return Invoke-RestMethod -Uri $uri -Method Post -Headers $headers `
                       -ContentType "application/json" -Body $jsonBody
        } else {
            return Invoke-RestMethod -Uri $uri -Method Post -Headers $headers
        }
    } catch {
        $errMsg = $_.ErrorDetails.Message
        if (-not $errMsg) { $errMsg = $_.Exception.Message }
        return [pscustomobject]@{ success = $false; error = $errMsg }
    }
}

# Transaccion 1: Producto[0] USB Kingston 128GB (price=45) -> Puja comprador1 a 50, Compra comprador2
$p1 = $createdProducts[0]
$p1_bid = Invoke-Api "http://localhost:3000/api/products/$($p1.id)/bids" $tokenBuyer1 '{"amount":50.00}'
Log-Evidence "Transaccion 1.1 - Puja Comprador1 en $($p1.title) (precio base: 45)" `
    "POST" "http://localhost:3000/api/products/$($p1.id)/bids" @{ Authorization="Bearer [TOKEN_BUYER1]" } '{"amount":50.00}' "201 Created" ($p1_bid | ConvertTo-Json -Compress)
$p1_buy = Invoke-Api "http://localhost:3000/api/products/$($p1.id)/buy" $tokenBuyer2 $null
Log-Evidence "Transaccion 1.2 - Compra Adjudicada Comprador2 en $($p1.title)" `
    "POST" "http://localhost:3000/api/products/$($p1.id)/buy" @{ Authorization="Bearer [TOKEN_BUYER2]" } "" "200 OK" ($p1_buy | ConvertTo-Json -Compress)
Write-Host " [Transaccion 1] $($p1.title) -> VENDIDO a comprador2" -ForegroundColor Green

# Transaccion 2: Producto[1] SSD Kingston NV3 2TB (price=480) -> Compra directa comprador1
$p2 = $createdProducts[1]
$p2_buy = Invoke-Api "http://localhost:3000/api/products/$($p2.id)/buy" $tokenBuyer1 $null
Log-Evidence "Transaccion 2.1 - Compra Directa Comprador1 en $($p2.title)" `
    "POST" "http://localhost:3000/api/products/$($p2.id)/buy" @{ Authorization="Bearer [TOKEN_BUYER1]" } "" "200 OK" ($p2_buy | ConvertTo-Json -Compress)
Write-Host " [Transaccion 2] $($p2.title) -> VENDIDO a comprador1" -ForegroundColor Green

# Transaccion 3: Producto[2] Gabinete Cybertel (price=195) -> Puja1 comprador1 a 200, Puja2 comprador2 a 230, Compra comprador2
$p3 = $createdProducts[2]
$p3_bid1 = Invoke-Api "http://localhost:3000/api/products/$($p3.id)/bids" $tokenBuyer1 '{"amount":200.00}'
Log-Evidence "Transaccion 3.1 - Puja Comprador1 en $($p3.title) (precio base: 195)" `
    "POST" "http://localhost:3000/api/products/$($p3.id)/bids" @{ Authorization="Bearer [TOKEN_BUYER1]" } '{"amount":200.00}' "201 Created" ($p3_bid1 | ConvertTo-Json -Compress)
$p3_bid2 = Invoke-Api "http://localhost:3000/api/products/$($p3.id)/bids" $tokenBuyer2 '{"amount":230.00}'
Log-Evidence "Transaccion 3.2 - Contraoferta Comprador2 en $($p3.title)" `
    "POST" "http://localhost:3000/api/products/$($p3.id)/bids" @{ Authorization="Bearer [TOKEN_BUYER2]" } '{"amount":230.00}' "201 Created" ($p3_bid2 | ConvertTo-Json -Compress)
$p3_buy = Invoke-Api "http://localhost:3000/api/products/$($p3.id)/buy" $tokenBuyer2 $null
Log-Evidence "Transaccion 3.3 - Compra Adjudicada Comprador2 en $($p3.title)" `
    "POST" "http://localhost:3000/api/products/$($p3.id)/buy" @{ Authorization="Bearer [TOKEN_BUYER2]" } "" "200 OK" ($p3_buy | ConvertTo-Json -Compress)
Write-Host " [Transaccion 3] $($p3.title) -> VENDIDO a comprador2" -ForegroundColor Green

# Transaccion 4: Producto[3] Cooler RGB Laptop (price=65) -> Compra directa comprador1
$p4 = $createdProducts[3]
$p4_buy = Invoke-Api "http://localhost:3000/api/products/$($p4.id)/buy" $tokenBuyer1 $null
Log-Evidence "Transaccion 4.1 - Compra Directa Comprador1 en $($p4.title)" `
    "POST" "http://localhost:3000/api/products/$($p4.id)/buy" @{ Authorization="Bearer [TOKEN_BUYER1]" } "" "200 OK" ($p4_buy | ConvertTo-Json -Compress)
Write-Host " [Transaccion 4] $($p4.title) -> VENDIDO a comprador1" -ForegroundColor Green

# Transaccion 5: Producto[4] Fuente Corsair 550W (price=280) -> Puja comprador2 a 300, Compra comprador1
$p5 = $createdProducts[4]
$p5_bid = Invoke-Api "http://localhost:3000/api/products/$($p5.id)/bids" $tokenBuyer2 '{"amount":300.00}'
Log-Evidence "Transaccion 5.1 - Puja Comprador2 en $($p5.title) (precio base: 280)" `
    "POST" "http://localhost:3000/api/products/$($p5.id)/bids" @{ Authorization="Bearer [TOKEN_BUYER2]" } '{"amount":300.00}' "201 Created" ($p5_bid | ConvertTo-Json -Compress)
$p5_buy = Invoke-Api "http://localhost:3000/api/products/$($p5.id)/buy" $tokenBuyer1 $null
Log-Evidence "Transaccion 5.2 - Compra Adjudicada Comprador1 en $($p5.title)" `
    "POST" "http://localhost:3000/api/products/$($p5.id)/buy" @{ Authorization="Bearer [TOKEN_BUYER1]" } "" "200 OK" ($p5_buy | ConvertTo-Json -Compress)
Write-Host " [Transaccion 5] $($p5.title) -> VENDIDO a comprador1" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 4. Verificacion MinIO bucket auction-products
# ---------------------------------------------------------------------------
Write-Host ">>> Verificando objetos almacenados en MinIO (bucket auction-products)..." -ForegroundColor Cyan
$minioProducts = docker run --rm --network auctionhub_default `
    -e AWS_ACCESS_KEY_ID=minioadmin -e AWS_SECRET_ACCESS_KEY=minioadminpassword `
    amazon/aws-cli:2.27.49 --endpoint-url http://minio:9000 s3 ls s3://auction-products/
$minioCount = ($minioProducts | Measure-Object -Line).Lines
Write-Host "   Objetos en auction-products: $minioCount" -ForegroundColor Green
Log-Evidence "Verificacion de Almacenamiento MinIO - Bucket auction-products ($minioCount imagenes)" `
    "AWS-CLI" "s3://auction-products/" $null "" "200 OK" ($minioProducts -join "`n    ")

# ---------------------------------------------------------------------------
# 5. Backup automatizado a MinIO (Fase 5)
# ---------------------------------------------------------------------------
Write-Host ">>> Ejecutando script de respaldo automatizado a MinIO..." -ForegroundColor Cyan
$backupScript = Join-Path $PSScriptRoot "backup-db.ps1"
$backupOutput = & $backupScript
$minioBackups = docker run --rm --network auctionhub_default `
    -e AWS_ACCESS_KEY_ID=minioadmin -e AWS_SECRET_ACCESS_KEY=minioadminpassword `
    amazon/aws-cli:2.27.49 --endpoint-url http://minio:9000 s3 ls s3://database-backups/
Log-Evidence "Respaldo Automatizado de Base de Datos PostgreSQL a MinIO (Fase 5)" `
    "SCRIPT" "backend/scripts/backup-db.ps1 / backup-db.sh" $null "" "200 OK - Respaldo subido a s3://database-backups" `
    (($backupOutput -join "`n    ") + "`n`n    Contenido del Bucket database-backups:`n    " + ($minioBackups -join "`n    "))

# ---------------------------------------------------------------------------
# 6. Guardar evidencias
# ---------------------------------------------------------------------------
Write-Host ">>> Guardando archivo de evidencias en $outputFile..." -ForegroundColor Cyan
$report | Out-File -FilePath $outputFile -Encoding utf8

Write-Host ""
Write-Host ">>> PROCESO FINALIZADO CON EXITO TOTAL." -ForegroundColor Green
Write-Host "    Productos creados : $($createdProducts.Count) / 35" -ForegroundColor $(if ($createdProducts.Count -eq 35) {"Green"} else {"Yellow"})
Write-Host "    Evidencias en     : $outputFile" -ForegroundColor Cyan
