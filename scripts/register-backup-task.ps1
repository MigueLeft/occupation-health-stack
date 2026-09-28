# Registra la tarea programada "Backup-DB" que ejecuta scripts/backup-db.sh
# dentro de WSL al iniciar el equipo (con 3 min de espera) y diario a las 2:00 AM.
#
# Uso: clic derecho -> "Ejecutar con PowerShell". Pide permisos de administrador
# por su cuenta y busca el proyecto automaticamente en el home de Ubuntu.
#
# Opcional, si hay mas de un proyecto o no lo encuentra:
#   powershell -ExecutionPolicy Bypass -File .\register-backup-task.ps1 -ProjectDir "/home/usuario/app"

param(
    # Ruta completa del proyecto dentro de Ubuntu (vacio = buscar automaticamente)
    [string]$ProjectDir = "",
    [string]$Distro     = "Ubuntu",
    [string]$TaskName   = "Backup-DB",
    [string]$DailyAt    = "2:00AM"
)

# Si no es administrador, se relanza a si mismo elevado
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    $argList = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`"")
    if ($ProjectDir) { $argList += @("-ProjectDir", "`"$ProjectDir`"") }
    Start-Process powershell.exe -Verb RunAs -ArgumentList $argList
    exit
}

$wsl = "C:\Windows\System32\wsl.exe"

try {
    # Usuario por defecto de la distro (el que se creo al instalar Ubuntu)
    $linuxUser = (& $wsl -d $Distro -e whoami | Out-String).Trim()
    if (-not $linuxUser) { throw "No se pudo obtener el usuario de la distro '$Distro'. Esta instalado Ubuntu en WSL?" }

    if ($ProjectDir) {
        $scriptPath = "$($ProjectDir.TrimEnd('/'))/scripts/backup-db.sh"
    } else {
        $found = @(& $wsl -d $Distro -u $linuxUser -e find "/home/$linuxUser" -maxdepth 4 `
            -path "*/scripts/backup-db.sh" -not -path "*/node_modules/*" 2>$null |
            Where-Object { $_.Trim() })
        if ($found.Count -eq 0) {
            throw "No se encontro scripts/backup-db.sh en /home/$linuxUser. Pasa la ruta con -ProjectDir."
        }
        if ($found.Count -gt 1) {
            throw "Se encontro mas de un backup-db.sh; indica cual con -ProjectDir:`n  $($found -join "`n  ")"
        }
        $scriptPath = $found[0].Trim()
    }

    & $wsl -d $Distro -u $linuxUser -e test -x $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "El script no existe o no es ejecutable: $scriptPath (en Ubuntu: chmod +x $scriptPath)"
    }

    Write-Host "Distro:      $Distro"
    Write-Host "Usuario WSL: $linuxUser"
    Write-Host "Script:      $scriptPath"
    Write-Host ""

    # La tarea debe correr con el mismo usuario de Windows que instalo Ubuntu
    $winUser = "$env:USERDOMAIN\$env:USERNAME"
    $cred = Get-Credential -UserName $winUser -Message "Contrasena de Windows de $winUser (no el PIN)"
    if (-not $cred) { throw "Cancelado: no se ingreso la contrasena." }

    $action = New-ScheduledTaskAction -Execute $wsl `
        -Argument "-d $Distro -u $linuxUser -e $scriptPath"

    # Al iniciar el equipo, con espera para que WSL y Docker levanten
    $triggerBoot = New-ScheduledTaskTrigger -AtStartup
    $triggerBoot.Delay = "PT3M"

    $triggerDaily = New-ScheduledTaskTrigger -Daily -At $DailyAt

    # StartWhenAvailable: si el equipo estaba apagado a la hora diaria, corre al encender
    # AllowStartIfOnBatteries / DontStopIfGoingOnBatteries: por defecto Windows no corre tareas con bateria
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    $task = New-ScheduledTask -Action $action -Trigger $triggerBoot, $triggerDaily -Settings $settings

    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Tarea existente '$TaskName' reemplazada"
    }

    Register-ScheduledTask -TaskName $TaskName -InputObject $task `
        -User $cred.UserName -Password $cred.GetNetworkCredential().Password -ErrorAction Stop | Out-Null

    Write-Host ""
    Write-Host "Tarea '$TaskName' registrada." -ForegroundColor Green
    Write-Host "Probar ahora:   Start-ScheduledTask -TaskName $TaskName"
    Write-Host "Ver resultado:  Get-ScheduledTaskInfo -TaskName $TaskName"
}
catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host ""
    Read-Host "Presiona Enter para cerrar"
}
