# Guía de Instalación en Windows Server

> **Stack:** PostgreSQL 17 + NestJS (puerto 3000) + React/Vite (puerto 80), orquestados con Docker Compose.

---

## Índice

1. [Requisitos del servidor](#1-requisitos-del-servidor)
2. [Instalar Docker Desktop](#2-instalar-docker-desktop)
3. [Copiar el proyecto al servidor](#3-copiar-el-proyecto-al-servidor)
4. [Configurar variables de entorno](#4-configurar-variables-de-entorno)
5. [Primer arranque y construcción de imágenes](#5-primer-arranque-y-construcción-de-imágenes)
6. [Configurar inicio automático al encender el servidor](#6-configurar-inicio-automático-al-encender-el-servidor)
7. [Configurar DNS en la red privada](#7-configurar-dns-en-la-red-privada)
8. [Configurar el Firewall de Windows](#8-configurar-el-firewall-de-windows)
9. [Verificación final](#9-verificación-final)
10. [Comandos de administración diaria](#10-comandos-de-administración-diaria)
11. [Solución de problemas comunes](#11-solución-de-problemas-comunes)

---

## 1. Requisitos del servidor

| Componente | Mínimo recomendado |
|---|---|
| **OS** | Windows Server 2019 o 2022 (64-bit) |
| **RAM** | 4 GB (8 GB recomendado) |
| **CPU** | 2 núcleos |
| **Disco** | 40 GB libres en `C:\` |
| **Red** | IP fija en la red privada |
| **Características** | Hyper-V habilitado |

### 1.1 Habilitar Hyper-V (requerido para contenedores Linux)

Abrir **PowerShell como Administrador** y ejecutar:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

Reiniciar el servidor cuando lo solicite.

### 1.2 Anotar la IP fija del servidor

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -ne "WellKnown" }
```

Guardar esa IP (ej. `192.168.1.50`) — la usaremos en el paso 4 y 7.

---

## 2. Instalar Docker Desktop

1. Descargar **Docker Desktop for Windows** desde:
   ```
   https://www.docker.com/products/docker-desktop/
   ```

2. Ejecutar el instalador con la opción **"Use WSL 2 instead of Hyper-V"** marcada (si Windows Server lo soporta) o dejar Hyper-V activado.

3. Al finalizar, reiniciar el servidor.

4. Abrir Docker Desktop y en **Settings → General**:
   - ✅ **Start Docker Desktop when you log in** — marcar (respaldo para sesiones interactivas)

5. Asegurarse que el servicio de Docker esté corriendo:

   ```powershell
   Get-Service -Name "com.docker.service"
   ```

   El estado debe ser `Running`.

> **Nota:** En Windows Server sin sesión gráfica permanente, el servicio `com.docker.service` arranca automáticamente — Docker Desktop no necesita que haya un usuario logueado para que los contenedores corran.

---

## 3. Copiar el proyecto al servidor

### Opción A — Clonar con Git (recomendado)

```powershell
# Instalar Git si no está instalado
winget install --id Git.Git -e

# Clonar el repositorio
cd C:\
git clone <URL-del-repositorio> occupation-health-stack
cd C:\occupation-health-stack
```

### Opción B — Copiar manualmente

Transferir la carpeta del proyecto por red o USB a:

```
C:\occupation-health-stack\
```

La estructura debe verse así:

```
C:\occupation-health-stack\
├── docker-compose.yml
├── occupational-health\        ← backend
│   ├── Dockerfile
│   └── ...
└── occupational-health-front\  ← frontend
    ├── Dockerfile
    └── ...
```

---

## 4. Configurar variables de entorno

El `docker-compose.yml` usa la variable `SERVER_HOST` para generar las URLs del backend y frontend. **Esta variable debe apuntar al DNS o IP del servidor.**

Crear el archivo `.env` en la raíz del proyecto:

```powershell
cd C:\occupation-health-stack

# Reemplaza 'salud.empresa.local' por tu DNS o la IP fija del servidor
New-Item -Path ".env" -ItemType File -Value "SERVER_HOST=salud.empresa.local`n"
```

> Si **no** configurarás DNS todavía, usa la IP fija: `SERVER_HOST=192.168.1.50`

### Verificar el contenido

```powershell
Get-Content C:\occupation-health-stack\.env
```

Debe mostrar:
```
SERVER_HOST=salud.empresa.local
```

> ⚠️ **Importante:** Si cambias el `SERVER_HOST` después de la primera construcción, debes reconstruir las imágenes con `docker compose up --build -d` porque la URL de la API se hornea en el frontend en tiempo de build.

---

## 5. Primer arranque y construcción de imágenes

```powershell
cd C:\occupation-health-stack

# Construir imágenes e iniciar todos los servicios
docker compose up --build -d
```

Este proceso tarda **5–15 minutos** la primera vez (descarga de imágenes base, instalación de dependencias, compilación).

### Verificar que los servicios están corriendo

```powershell
docker compose ps
```

Debe mostrar los tres servicios en estado `running` (healthy para `db`):

```
NAME                          STATUS
occupation-health-stack-db-1         running (healthy)
occupation-health-stack-backend-1    running
occupation-health-stack-frontend-1   running
```

### Verificar logs si algo falla

```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 6. Configurar inicio automático al encender el servidor

Docker Compose debe arrancar automáticamente cuando el servidor enciende, **sin necesidad de que alguien inicie sesión**. La mejor forma en Windows Server es con el **Programador de Tareas** disparado en el arranque del sistema.

### 6.1 Crear el script de arranque

```powershell
New-Item -Path "C:\occupation-health-stack\start-app.ps1" -ItemType File -Value @'
# Script de arranque de Occupation Health Stack
Set-Location "C:\occupation-health-stack"

# Esperar a que Docker esté listo (máximo 60 segundos)
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    try {
        docker info | Out-Null
        if ($LASTEXITCODE -eq 0) { break }
    } catch {}
    Start-Sleep -Seconds 3
    $elapsed += 3
}

# Levantar los contenedores
docker compose up -d

# Registrar el arranque en un log
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path "C:\occupation-health-stack\startup.log" -Value "$timestamp - Contenedores iniciados"
'@
```

### 6.2 Registrar la tarea en el Programador de tareas

Ejecutar en **PowerShell como Administrador**:

```powershell
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -WindowStyle Hidden -File C:\occupation-health-stack\start-app.ps1"

$trigger = New-ScheduledTaskTrigger -AtStartup

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName "OccupationHealthStack-AutoStart" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Inicia los contenedores Docker de Occupation Health Stack al arrancar el servidor" `
    -Force
```

### 6.3 Verificar que la tarea fue creada

```powershell
Get-ScheduledTask -TaskName "OccupationHealthStack-AutoStart" | Select-Object TaskName, State
```

### 6.4 Probar manualmente la tarea (sin reiniciar)

```powershell
Start-ScheduledTask -TaskName "OccupationHealthStack-AutoStart"
Start-Sleep -Seconds 5
docker compose -f C:\occupation-health-stack\docker-compose.yml ps
```

> **¿Por qué `restart: unless-stopped` en compose.yml?**
> Los contenedores ya tienen esta política, lo que significa que Docker los reinicia automáticamente si crashean. La tarea programada solo es necesaria para el primer arranque después de un reinicio del servidor.

---

## 7. Configurar DNS en la red privada

El objetivo es que todos los equipos de la red puedan acceder a la app con un nombre como `salud.empresa.local` en lugar de una IP.

### Opción A — El servidor también es el DNS de la red (más común en empresas)

Si el servidor Windows tiene el **rol DNS** instalado:

```powershell
# Instalar el rol DNS si no está instalado
Install-WindowsFeature -Name DNS -IncludeManagementTools

# Crear una zona de búsqueda directa (si no existe)
Add-DnsServerPrimaryZone -Name "empresa.local" -ZoneFile "empresa.local.dns"

# Crear el registro A apuntando al servidor
Add-DnsServerResourceRecordA `
    -ZoneName "empresa.local" `
    -Name "salud" `
    -IPv4Address "192.168.1.50"   # ← IP fija del servidor
```

Los clientes de la red que usen este servidor como DNS resolver ya podrán usar `http://salud.empresa.local`.

### Opción B — El DNS lo maneja el router / pfSense / Mikrotik

Acceder al panel del router y agregar un registro DNS local:

```
Nombre:   salud.empresa.local   (o salud.empresa.com)
Tipo:     A
Valor:    192.168.1.50
```

El procedimiento exacto varía por fabricante. En **pfSense**: `Services → DNS Resolver → Host Overrides`.

### Opción C — Solo unos pocos equipos necesitan acceso (hosts file)

En cada PC cliente, editar `C:\Windows\System32\drivers\etc\hosts` como administrador:

```
192.168.1.50    salud.empresa.local
```

---

## 8. Configurar el Firewall de Windows

Abrir los puertos necesarios en el firewall del servidor:

```powershell
# Puerto 80 — Frontend (HTTP)
New-NetFirewallRule `
    -DisplayName "Occupation Health - Frontend HTTP" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 80 `
    -Action Allow

# Puerto 3000 — Backend API
New-NetFirewallRule `
    -DisplayName "Occupation Health - Backend API" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow
```

> **Opcional:** Si no quieres exponer el puerto 3000 directamente (la API siempre se llama desde el frontend), puedes omitir esa regla y dejar que el frontend sirva todo por el puerto 80. Sin embargo, dado que el frontend llama a la API directamente desde el navegador del cliente, el puerto 3000 **sí debe estar abierto**.

---

## 9. Verificación final

### Desde el mismo servidor

```powershell
# Frontend
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing | Select-Object StatusCode

# Backend health
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode
```

### Desde un equipo de la red

Abrir el navegador y navegar a:

```
http://salud.empresa.local
```

Debe cargar la aplicación. Si usas IP directamente:

```
http://192.168.1.50
```

### Simular reinicio del servidor (sin reiniciar físicamente)

```powershell
# Detener todos los contenedores
docker compose -f C:\occupation-health-stack\docker-compose.yml down

# Ejecutar la tarea manualmente como si hubiera arrancado el servidor
Start-ScheduledTask -TaskName "OccupationHealthStack-AutoStart"

Start-Sleep -Seconds 30
docker compose -f C:\occupation-health-stack\docker-compose.yml ps
```

---

## 10. Comandos de administración diaria

```powershell
# Ver estado de los contenedores
docker compose -f C:\occupation-health-stack\docker-compose.yml ps

# Ver logs en tiempo real
docker compose -f C:\occupation-health-stack\docker-compose.yml logs -f

# Ver logs de un servicio específico
docker compose -f C:\occupation-health-stack\docker-compose.yml logs -f backend

# Reiniciar todos los servicios
docker compose -f C:\occupation-health-stack\docker-compose.yml restart

# Detener todo
docker compose -f C:\occupation-health-stack\docker-compose.yml down

# Actualizar la app (después de un git pull)
cd C:\occupation-health-stack
git pull
docker compose up --build -d

# Ver uso de recursos
docker stats
```

---

## 11. Solución de problemas comunes

### Los contenedores no arrancan después del reinicio

```powershell
# Verificar que Docker está corriendo
Get-Service -Name "com.docker.service"

# Ver log del script de arranque
Get-Content C:\occupation-health-stack\startup.log

# Ver el historial de la tarea programada
Get-ScheduledTaskInfo -TaskName "OccupationHealthStack-AutoStart"
```

### El frontend carga pero no puede conectar con la API (CORS / URL incorrecta)

Verificar que `SERVER_HOST` en el `.env` coincide con el nombre/IP que usan los navegadores:

```powershell
Get-Content C:\occupation-health-stack\.env
```

Si lo cambias, reconstruir:

```powershell
cd C:\occupation-health-stack
docker compose up --build -d
```

### Error "port 80 already in use"

Otro proceso usa el puerto 80 (IIS, Apache, etc.):

```powershell
netstat -ano | findstr ":80"
```

Detener IIS si está activo:

```powershell
Stop-Service -Name W3SVC
Set-Service -Name W3SVC -StartupType Disabled
```

### La base de datos perdió datos después de un `docker compose down -v`

La flag `-v` **borra los volúmenes**, incluidos los datos de PostgreSQL. Usar siempre `down` sin `-v` para operaciones normales. Solo usar `-v` cuando se quiere un reseteo total.

---

## Resumen rápido de la instalación

```
1. Habilitar Hyper-V → reiniciar
2. Instalar Docker Desktop
3. Copiar proyecto a C:\occupation-health-stack\
4. Crear C:\occupation-health-stack\.env con SERVER_HOST=<ip-o-dns>
5. cd C:\occupation-health-stack && docker compose up --build -d
6. Crear tarea programada de inicio automático (paso 6)
7. Abrir puertos 80 y 3000 en el firewall (paso 8)
8. Configurar DNS en el router o servidor DNS (paso 7)
9. Probar desde un equipo de la red
```
