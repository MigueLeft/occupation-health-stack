# Instalación del Sistema Web en Windows Server 2022

Sistema: React + NestJS + PostgreSQL en Docker sobre WSL2  
Acceso: Red local (LAN)  
Arranque: Automático al encender el servidor, sin inicio de sesión

---

## Requisitos previos

- Windows Server 2022 build 20348.740 o superior (verificar con `winver`)
- Virtualización habilitada en BIOS/UEFI (VT-x o AMD-V)
- El servidor debe tener IP estática en la red local

> **Nota:** WSL2 no requiere el rol completo de Hyper-V, pero sí necesita la característica
> "Plataforma de máquina virtual" que se instala automáticamente con WSL.

---

## Fase A — Preparar Windows

Todo lo de esta fase se ejecuta en **PowerShell como administrador**.

### A1. Crear usuario de servicio

WSL2 no funciona correctamente bajo la cuenta Administrador integrada.
Crear un usuario normal con privilegios de administrador:

```powershell
net user svcapp "TuPassword" /add
net localgroup Administradores svcapp /add
```

Cerrar sesión del Administrador e iniciar sesión con `svcapp`.
**Todo lo demás se hace desde esta cuenta.**

### A2. Verificar build de Windows

```powershell
winver
```

El build debe ser 20348.740 o superior. Si no, actualizar desde Windows Update antes de continuar.

### A3. Desactivar suspensión e hibernación

```powershell
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /hibernate off
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

### A4. Asignar IP estática

Asignar una IP fija a la tarjeta de red del servidor desde:
**Panel de control → Centro de redes → Cambiar configuración del adaptador → Propiedades → IPv4**

Ejemplo: `192.168.1.50` (usar la IP que corresponda a la red de la empresa).
Sin IP estática el dominio dejará de funcionar si la IP cambia.

---

## Fase B — WSL2 + Docker

### B1. Instalar WSL2

En **PowerShell como administrador**:

```powershell
wsl --install -d Ubuntu
```

Reiniciar cuando lo solicite. Tras el reinicio abrir Ubuntu y crear usuario y contraseña de Linux.

### B2. Habilitar systemd

Dentro de **Ubuntu**:

```bash
sudo nano /etc/wsl.conf
```

Agregar el siguiente contenido:

```ini
[boot]
systemd=true
```

Guardar y salir. Luego en **PowerShell**:

```powershell
wsl --shutdown
```

Volver a abrir Ubuntu.

### B3. Instalar Docker Engine

Dentro de **Ubuntu**:

```bash
sudo add-apt-repository universe
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Cerrar y volver a abrir Ubuntu. Verificar instalación:

```bash
docker run hello-world
docker compose version
```

Ambos comandos deben responder correctamente antes de continuar.

---

## Fase C — Desplegar el sistema

### C1. Copiar el proyecto

Copiar el proyecto dentro del filesystem de Linux (no en `/mnt/c`):

```bash
# Ejemplo clonando desde git
cd ~
git clone <url-del-repositorio> app
cd app
```

La estructura debe quedar así:

```
~/app/
  docker-compose.yml
  occupational-health/
  occupational-health-front/
```

### C2. Crear el archivo .env

```bash
cd ~/app
echo "SERVER_HOST=192.168.1.50" > .env
```

Usar la IP estática real del servidor, no `localhost`.

> **Importante:** `VITE_API_URL` se hornea en el build del frontend. Cada vez que
> cambies `SERVER_HOST` debes reconstruir el frontend con `--build`.

### C3. Levantar el sistema

```bash
docker compose up -d --build
docker compose ps
```

Los tres servicios (`frontend`, `backend`, `db`) deben aparecer en estado `Up`.
La base de datos debe aparecer como `healthy`.

Si algo falla, revisar los logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

---

## Fase D — Exponer a la red local

En **PowerShell como administrador**:

```powershell
$wslIp = (wsl -d Ubuntu hostname -I).Trim().Split(' ')[0]

netsh interface portproxy add v4tov4 listenport=80   listenaddress=0.0.0.0 connectport=80   connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp

netsh advfirewall firewall add rule name="Sistema Web 80"   dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="Sistema Web 3000" dir=in action=allow protocol=TCP localport=3000
```

Verificar desde otro equipo de la red:

```
http://192.168.1.50
```

El sistema debe cargar y el login debe funcionar antes de continuar con la Fase E.

> **Nota:** Las reglas de firewall son permanentes y no se borran al reiniciar.
> El portproxy sí se borra al reiniciar; de eso se encarga el script de la Fase E.

---

## Fase E — Arranque automático sin login

### E1. Crear los scripts

En **PowerShell como administrador**, crear la carpeta:

```powershell
New-Item -ItemType Directory -Path C:\scripts -Force
```

**Script 1** — `C:\scripts\wsl-start.ps1`  
Arranca WSL y lo mantiene vivo. El proceso nunca termina (eso es correcto):

```powershell
C:\Windows\System32\wsl.exe -d Ubuntu -u root -e sh -c "exec sleep infinity"
```

**Script 2** — `C:\scripts\portproxy-setup.ps1`  
Espera a que Docker y los contenedores estén listos y reconfigura el portproxy
con la IP nueva de WSL (que cambia en cada arranque):

```powershell
Start-Sleep -Seconds 40
$wslIp = (wsl -d Ubuntu hostname -I).Trim().Split(' ')[0]
netsh interface portproxy reset
netsh interface portproxy add v4tov4 listenport=80   listenaddress=0.0.0.0 connectport=80   connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp
```

**Script 3** — `C:\scripts\register-tasks.ps1`  
Registra las dos tareas programadas. Ejecutar una sola vez:

```powershell
$password = "TuPassword"
$user = "win-bies8ch9v1e\svcapp"

# Tarea 1 - WSL-Start
$action1   = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File C:\scripts\wsl-start.ps1"
$trigger1  = New-ScheduledTaskTrigger -AtStartup
$settings1 = New-ScheduledTaskSettingsSet -ExecutionTimeLimit 0
$task1     = New-ScheduledTask -Action $action1 -Trigger $trigger1 -Settings $settings1
Register-ScheduledTask -TaskName "WSL-Start" -InputObject $task1 -User $user -Password $password

# Tarea 2 - Portproxy-Setup
$action2   = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File C:\scripts\portproxy-setup.ps1"
$trigger2  = New-ScheduledTaskTrigger -AtStartup
$task2     = New-ScheduledTask -Action $action2 -Trigger $trigger2
Register-ScheduledTask -TaskName "Portproxy-Setup" -InputObject $task2 -User $user -Password $password
```

> **Importante:** Reemplazar `TuPassword` por la contraseña real de `svcapp` y
> `win-bies8ch9v1e` por el nombre real del equipo antes de ejecutar.

### E2. Probar los scripts manualmente

Antes de registrar las tareas, verificar que los scripts funcionan:

```powershell
# Limpiar estado actual
netsh interface portproxy reset
wsl --shutdown

# Lanzar WSL en ventana separada (quedará abierta, es correcto)
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File C:\scripts\wsl-start.ps1"

# Esperar 10 segundos y luego correr el portproxy
powershell -ExecutionPolicy Bypass -File C:\scripts\portproxy-setup.ps1
```

Verificar que las reglas existen:

```powershell
netsh interface portproxy show v4tov4
```

Verificar desde otro equipo que el sistema responde en `http://192.168.1.50`.

### E3. Registrar las tareas programadas

Una vez confirmado que los scripts funcionan:

```powershell
powershell -ExecutionPolicy Bypass -File C:\scripts\register-tasks.ps1
```

Verificar que quedaron registradas:

```powershell
Get-ScheduledTask -TaskName "WSL-Start"
Get-ScheduledTask -TaskName "Portproxy-Setup"
```

Ambas deben aparecer en estado `Ready`.

### E4. Prueba de fuego

```powershell
shutdown /r /t 0
```

**No iniciar sesión** cuando el servidor vuelva a arrancar.
Esperar 1 minuto completo desde que aparece la pantalla de login.
Desde otro equipo verificar `http://192.168.1.50`.

Si el sistema responde, el arranque automático funciona correctamente.

Si no responde, iniciar sesión y revisar el estado de las tareas:

```powershell
Get-ScheduledTaskInfo -TaskName "WSL-Start"
Get-ScheduledTaskInfo -TaskName "Portproxy-Setup"
```

---

## Fase F — Dominio (opcional)

Con la IP estática confirmada, crear un registro **A** en el DNS de la red:

| Nombre | Tipo | Valor |
|--------|------|-------|
| sistema.lan | A | 192.168.1.50 |

> Usar `.lan` o `.interno` como sufijo. Evitar `.local` porque está reservado
> para mDNS y puede causar conflictos de resolución en Windows.

Opciones según infraestructura:

- **Active Directory con rol DNS:** Administrador de DNS → zona correspondiente → nuevo registro A.
- **Router con DNS local:** agregar entrada estática nombre → IP en la configuración del router.
- **Prueba rápida sin DNS:** editar en cada equipo cliente `C:\Windows\System32\drivers\etc\hosts` y agregar `192.168.1.50  sistema.lan`.

Una vez que el nombre resuelva, actualizar el `.env` y reconstruir el frontend:

```bash
cd ~/app
echo "SERVER_HOST=sistema.lan" > .env
docker compose up -d --build
```

---

## Referencia rápida — Comandos de mantenimiento

### Ver estado de los contenedores

```bash
# Dentro de Ubuntu (WSL)
cd ~/app
docker compose ps
```

### Reiniciar un contenedor

```bash
docker compose restart backend
```

### Ver logs en tiempo real

```bash
docker compose logs -f backend
```

### Actualizar el sistema (nuevo build)

```bash
cd ~/app
git pull
docker compose up -d --build
```

### Limpiar portproxy manualmente

```powershell
netsh interface portproxy reset
```

### Ver reglas de portproxy activas

```powershell
netsh interface portproxy show v4tov4
```

### Ver estado de las tareas programadas

```powershell
Get-ScheduledTaskInfo -TaskName "WSL-Start"
Get-ScheduledTaskInfo -TaskName "Portproxy-Setup"
```

---

## Notas importantes

| Situación | Acción |
|-----------|--------|
| Cambias `SERVER_HOST` en el `.env` | Reconstruir frontend con `docker compose up -d --build` |
| El sistema no levanta tras reinicio | Revisar historial de tareas con `Get-ScheduledTaskInfo` |
| El portproxy no apunta bien | Correr manualmente `portproxy-setup.ps1` |
| Apagado del servidor | Siempre ordenado desde Windows, nunca el botón físico (protege PostgreSQL) |
| IP del servidor cambia | Actualizar `.env`, reconstruir frontend y actualizar registro DNS |
