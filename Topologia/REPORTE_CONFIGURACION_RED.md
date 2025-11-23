# REPORTE TÉCNICO: CONFIGURACIÓN DE RED IPv6 MEDIANTE DHCP STATELESS Y STATEFUL

**Institución:** ITSOEH  
**Dominio:** tics.edu.mx  
**Fecha de Elaboración:** Noviembre 2025  
**Tema:** Implementación de Redes IPv6 con Autoconfiguración y DHCP

---

## 1. INTRODUCCIÓN

Este reporte documenta la configuración de una infraestructura de red empresarial basada en protocolo IPv6, implementando dos modelos de asignación de direcciones: **DHCP Stateless (sin estado)** y **DHCP Stateful (con estado)**. La topología integra múltiples switches, routers y un backbone de conectividad redundante para garantizar alta disponibilidad y redundancia en la red.

---

## 2. OBJETIVOS DEL PROYECTO

- Diseñar e implementar una red IPv6 segura y escalable
- Aplicar segmentación mediante VLANs para organizacion de tráfico
- Implementar mecanismos de protección mediante Port Security
- Configurar redundancia de routers mediante HSRP v2
- Validar autoconfiguración de direcciones IPv6 en clientes
- Documentar procedimientos de administración y seguridad

---

## 3. DESCRIPCIÓN GENERAL DE LA ARQUITECTURA

### 3.1 Topología de Red

La infraestructura está compuesta por:

#### **Área Stateless (Zona de Autoconfiguración sin Estado)**

**Dispositivos:**
- **3 Switches de Acceso:** S1, S2, S3
- **2 Routers de Distribución:** R1, R2
- **1 Router de Borde (Core):** RA
- **Dominios IPv6:** 2001:db8:cafe::/48

**Caractéticas:**
- Autoconfiguración de direcciones IPv6 mediante RA (Router Advertisements)
- DHCP Stateless para información adicional (DNS, dominio)
- Banda de administración: VLAN 55
- Segmentación de usuarios y administrativos

#### **Área Stateful (Zona de Configuración con Estado)**

**Dispositivos:**
- **3 Switches de Acceso:** S4, S5, S6
- **2 Routers de Distribución:** R3, R4
- **1 Router de Borde (Core):** RB
- **Dominio IPv6:** 2001:db8:3c4d::/48

**Características:**
- Asignación completa de direcciones via DHCP Stateful
- Gestión centralizada de direcciones IPv6
- Pools DHCP por VLAN
- Redundancia mediante HSRP

### 3.2 Componentes de Red Integrados

```
                        ┌─────────────────┐
                        │   Router RA     │
                        │ (Core Stateless)│
                        │  2001:db8:7:7:1 │
                        └────────┬────────┘
                                 │ g0/1
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼────┐             ┌─────▼────┐
              │ Router R1 │             │ Router R2 │
              │ s0/0/1 RA │             │ s0/0/0 RA │
              └─────┬────┘             └─────┬────┘
                    │                        │
            ┌───────┼────────────────────────┴──────┐
            │                                        │
       ┌────▼────┐ ┌────────┐ ┌────────┐ ┌────────┐
       │   S1    │ │   S2   │ │   S3   │ │   S4   │
       │Stateless│ │Stateles│ │Stateles│ │Stateful│
       └────┬────┘ └────┬───┘ └────┬───┘ └────┬───┘
            │           │          │          │
       (Usuarios)  (Usuarios) (Usuarios) (Usuarios)
```

---

## 4. CONFIGURACIÓN POR AREA

### 4.1 AREA STATELESS - CONFIGURACIÓN DE ROUTERS

#### 4.1.1 Router RA - Core/Borde

**Rol:** Punto de interconexión entre las dos áreas de la red

**Interfaces Configuradas:**
- **s0/0/1:** 2001:db8:1:1::1/64 (Enlace a R1)
- **s0/0/0:** 2001:db8:2:2::1/64 (Enlace a R2)
- **g0/1:** 2001:db8:7:7::1/64 (Enlace a RB)

**Rutas Estáticas:**
- Redes 2001:db8:cafe::/48 alcanzables via R1 y R2
- Ruta por defecto (::/0) hacia el exterior via RB

**Función de Seguridad:**
```
enable secret tics
banner motd # Solo acceso autorizado RA #
service password-encryption
```

#### 4.1.2 Router R1 - Distribución Stateless (Activo)

**Prioridad HSRP:** 150 (Activo)  
**Dominio:** 2001:db8:cafe::/48

**DHCP Pools Configurados:**
```
- DHCP-STATELESS-15: VLAN AdminStaff
- DHCP-STATELESS-45: VLAN Users
- DHCP-STATELESS-55: VLAN Administrative
- DHCP-STATELESS-65: VLAN Native
```

**Direcciones de Interfaz (Subinterfaces dot1Q):**

| Interfaz | VLAN | Dirección IPv6 | Función |
|----------|------|----------------|---------|
| g0/1.15 | 15 | 2001:db8:cafe:15::1/64 | AdminStaff - Gateway Principal |
| g0/1.45 | 45 | 2001:db8:cafe:45::1/64 | Users - Gateway Principal |
| g0/1.55 | 55 | 2001:db8:cafe:55::1/64 | Admin - Gateway Principal |
| g0/1.65 | 65 | 2001:db8:cafe:65::1/64 | Nativa - Gateway Principal |

**Configuración HSRP v2:**
```
standby version 2
standby XX ipv6 autoconfig      # Usa RA automático
standby XX priority 150         # R1 es activo
standby XX preempt              # R1 recupera control si se reactiva
```

**Flag ND (Neighbor Discovery):**
```
ipv6 nd other-config-flag       # Habilita DHCP Stateless
ipv6 dhcp server DHCP-STATELESS-XX
```

#### 4.1.3 Router R2 - Distribución Stateless (Respaldo)

**Prioridad HSRP:** 90 (Respaldo)  
**Dominio:** 2001:db8:cafe::/48

**Características Diferenciales:**
- Misma configuración que R1 pero con prioridad 90
- Enlace hacia RA via s0/0/0 (redundancia)
- Actúa como respaldo automático en caso de fallo de R1

---

### 4.2 AREA STATELESS - CONFIGURACIÓN DE SWITCHES

#### 4.2.1 Descripción General de VLANs (Stateless)

| VLAN | Nombre | Propósito | Rango IPv6 |
|------|--------|----------|-----------|
| 15 | AdminStaff | Personal administrativo | 2001:db8:cafe:15::/64 |
| 45 | Users | Usuarios regulares | 2001:db8:cafe:45::/64 |
| 55 | Administrative | Gestión de dispositivos | 2001:db8:cafe:55::/64 |
| 65 | Native | VLAN nativa (tráfico no etiquetado) | 2001:db8:cafe:65::/64 |

#### 4.2.2 Switch S1

**Configuración de Seguridad:**
```
hostname S1
enable password cisco
enable secret tics
banner motd # Solo acceso autorizado S1 #
service password-encryption
```

**Port-Security Implementada:**
- Interfaces f0/7-f0/8 (VLAN 15): Máximo 2 MAC + sticky + shutdown
- Interfaces f0/9-f0/12 (VLAN 45): Máximo 2 MAC + sticky + shutdown
- Interface f0/24 (VLAN 65): Máximo 2 MAC + sticky + shutdown

**EtherChannel (Link Aggregation):**
```
Port-Channel 1 (Activo - LACP):
├─ f0/1-f0/3 (channel-group 1 mode active)
├─ Configurado como trunk
├─ VLANs permitidas: 15,45,55,65
└─ VLAN nativa: 65

Port-Channel 2 (Activo - LACP):
├─ f0/4-f0/6 (channel-group 2 mode active)
├─ Configurado como trunk
├─ VLANs permitidas: 15,45,55,65
└─ VLAN nativa: 65
```

**VLAN de Gestión:**
```
interface vlan 55
ipv6 address 2001:db8:cafe:55::11/64
```

**SSH para Gestión Remota:**
```
username admin password admin
ip domain-name itsoeh.edu
crypto key generate rsa 1024
line vty 0 15
transport input ssh
login local
```

#### 4.2.3 Switches S2 y S3

Configuración idéntica a S1 con las siguientes variaciones:

**S2:**
- VLAN de gestión: 2001:db8:cafe:55::12/64
- Interface g0/1 adicional configurada como trunk

**S3:**
- VLAN de gestión: 2001:db8:cafe:55::13/64
- Misma topología de puertos que S1

---

### 4.3 AREA STATEFUL - CONFIGURACIÓN DE ROUTERS

#### 4.3.1 Router RB - Core/Borde

**Rol:** Punto de interconexión del área Stateful hacia exterior

**Interfaces Configuradas:**
- **s0/0/1:** 2001:db8:3:3::1/64 (Enlace a R3)
- **s0/0/0:** 2001:db8:4:4::1/64 (Enlace a R4)
- **g0/1:** 2001:db8:7:7::2/64 (Enlace a RA con redundancia)

**Rutas Estáticas:**
- Redes 2001:db8:3c4d::/48 alcanzables via R3 y R4
- Ruta por defecto hacia Internet via RA

#### 4.3.2 Router R3 - Distribución Stateful (Activo)

**Prioridad HSRP:** 150 (Activo)  
**Dominio:** 2001:db8:3c4d::/48

**DHCP Pools Stateful:**
```
ipv6 dhcp pool DHCP-STATEFUL-10
  address prefix 2001:db8:3c4d:10::/64
  domain-name tics.edu.mx
exit

ipv6 dhcp pool DHCP-STATEFUL-20
  address prefix 2001:db8:3c4d:20::/64
  domain-name tics.edu.mx
exit

ipv6 dhcp pool DHCP-STATEFUL-30
  address prefix 2001:db8:3c4d:30::/64
  domain-name tics.edu.mx
exit

ipv6 dhcp pool DHCP-STATEFUL-40
  address prefix 2001:db8:3c4d:40::/64
  domain-name tics.edu.mx
exit
```

**Direcciones Gateway por VLAN:**

| Interfaz | VLAN | Dirección IPv6 | Método |
|----------|------|----------------|--------|
| g0/1.10 | 10 | 2001:db8:3c4d:10::1/64 | DHCP Stateful |
| g0/1.20 | 20 | 2001:db8:3c4d:20::1/64 | DHCP Stateful (EUI-64) |
| g0/1.30 | 30 | 2001:db8:3c4d:30::1/64 | DHCP Stateful (EUI-64) |
| g0/1.40 | 40 | 2001:db8:3c4d:40::1/64 | DHCP Stateful (EUI-64) |

**Configuración de Flags ND (Managed Config):**
```
ipv6 nd managed-config-flag     # DHCP Stateful obligatorio
ipv6 nd prefix default no-advertise  # Evita autoconfiguración
```

**HSRP v2 Stateful:**
```
standby 10 priority 150
standby 10 ipv6 autoconfig
standby 10 preempt              # Control automático del activo
```

#### 4.3.3 Router R4 - Distribución Stateful (Respaldo)

**Prioridad HSRP:** 90 (Respaldo)

**Diferencias con R3:**
- Mismas direcciones pero rol de respaldo
- HSRP priority 90
- Enlace hacia RB via s0/0/0
- Preempt habilitado para recuperación de control

---

### 4.4 AREA STATEFUL - CONFIGURACIÓN DE SWITCHES

#### 4.4.1 Descripción General de VLANs (Stateful)

| VLAN | Nombre | Propósito | Rango IPv6 |
|------|--------|----------|-----------|
| 10 | AdminStaff | Personal administrativo | 2001:db8:3c4d:10::/64 |
| 20 | Users | Usuarios regulares | 2001:db8:3c4d:20::/64 |
| 30 | Administrative | Gestión de dispositivos | 2001:db8:3c4d:30::/64 |
| 40 | Native | VLAN nativa | 2001:db8:3c4d:40::/64 |

#### 4.4.2 Switches S4, S5, S6

**Configuración General:**

Cada switch (S4, S5, S6) implementa:

**Port-Security:**
```
Puertos AdminStaff (f0/7-f0/8):
- Máximo 2 MAC
- MAC Sticky habilitado
- Violation: Shutdown

Puertos Users (f0/9-f0/12):
- Máximo 2 MAC
- MAC Sticky habilitado
- Violation: Shutdown

Puerto de gestión (f0/24):
- Máximo 2 MAC
- Security habilitado
```

**EtherChannel:**
```
Port-Channel 1 (LACP Active):
├─ f0/1-f0/3
├─ Modo: Trunk
└─ VLANs: 10,20,30,40

Port-Channel 2 (LACP Active):
├─ f0/4-f0/6
├─ Modo: Trunk
└─ VLANs: 10,20,30,40
```

**VLAN de Gestión:**

| Switch | IP de Gestión |
|--------|--------------|
| S4 | 2001:db8:3c4d:30::14/64 |
| S5 | 2001:db8:3c4d:30::15/64 |
| S6 | 2001:db8:3c4d:30::16/64 |

---

## 5. COMPARATIVA: STATELESS vs STATEFUL

### 5.1 DHCP Stateless (Área Stateless)

**Características:**
- Clientes generan su propia dirección IPv6 (autoconfiguración)
- DHCP solo proporciona información adicional (DNS, dominio)
- **Flag ND:** `other-config-flag` activado

**Ventajas:**
✓ Menor carga en servidor DHCP  
✓ Configuración automática rápida  
✓ Mayor escalabilidad  
✓ Menor tráfico administrativo

**Desventajas:**
✗ Menor control sobre asignaciones  
✗ Direcciones predecibles (basadas en MAC)  
✗ Auditoría limitada de clientes

**Caso de Uso:** Redes grandes con muchos clientes que requieren autoconfiguración rápida

### 5.2 DHCP Stateful (Área Stateful)

**Características:**
- Servidor DHCP asigna toda la dirección IPv6
- Control centralizado de direcciones
- **Flag ND:** `managed-config-flag` activado

**Ventajas:**
✓ Control centralizado total  
✓ Direcciones gestionadas  
✓ Auditoría completa de clientes  
✓ Pool de direcciones limitado  
✓ Integración con DNS dinámico

**Desventajas:**
✗ Mayor carga en servidor DHCP  
✗ Punto de fallo crítico  
✗ Mayor latencia de configuración  
✗ Requiere redundancia

**Caso de Uso:** Redes corporativas que requieren auditoría y control absoluto

---

## 6. MECANISMOS DE REDUNDANCIA Y ALTA DISPONIBILIDAD

### 6.1 HSRP v2 (Hot Standby Router Protocol Version 2)

**Implementación en Stateless:**

```
Grupo HSRP 15 (VLAN 15):
├─ R1: Priority 150 (Activo)
├─ R2: Priority 90 (Respaldo)
├─ Virtual IPv6: autoconfig (generada automáticamente)
├─ Preempt: Enabled (R1 recupera control)
└─ Versión: 2

Grupos 45, 55, 65: Misma estructura
```

**Implementación en Stateful:**

```
Grupo HSRP 10 (VLAN 10):
├─ R3: Priority 150 (Activo)
├─ R4: Priority 90 (Respaldo)
├─ Virtual IPv6: autoconfig
├─ Preempt: Enabled
└─ Versión: 2

Grupos 20, 30, 40: Misma estructura
```

**Comportamiento en Failover:**
1. Si R1 falla → R2 (priority 90) toma control en <3 segundos
2. R1 recuperándose → toma control inmediatamente (preempt)
3. Todos los clientes siguen comunicándose sin interrupción

### 6.2 EtherChannel (Link Aggregation)

**Implementación en Switches:**

```
Port-Channel 1: Agrupa f0/1-f0/3
├─ Protocolo: LACP (mode active)
├─ Velocidad efectiva: 300 Mbps (3×100 Mbps)
├─ Redundancia: Si falla 1 enlace, continúan 2
└─ Balanceo: Por dirección MAC de origen

Port-Channel 2: Agrupa f0/4-f0/6
├─ Mismo comportamiento que Port-Channel 1
└─ Distribuye tráfico hacia diferentes routers
```

---

## 7. SEGURIDAD IMPLEMENTADA

### 7.1 Autenticación y Encriptación

**En Todos los Dispositivos:**
```
enable password cisco           # Contraseña enable (texto plano)
enable secret tics              # Contraseña enable (encriptada)
service password-encryption     # Encripta contraseñas en config

banner motd # Solo acceso autorizado XX #
```

**SSH para Gestión Remota:**
```
username admin password admin       # Usuario local
ip domain-name itsoeh.edu          # Dominio requerido para RSA
crypto key generate rsa 1024       # Par de claves RSA
line vty 0 15
  transport input ssh              # Solo SSH (no Telnet)
  login local                       # Usa usuarios locales
```

### 7.2 Port Security

**Configuración Estándar:**
```
switchport port-security
switchport port-security maximum 2          # Máximo 2 dispositivos
switchport port-security mac-address sticky # Memoriza MACs
switchport port-security violation shutdown # Desactiva puerto
```

**Efecto:**
- Si MAC desconocida intenta acceder → Puerto se desactiva
- Protege contra cambios de hardware
- Prevent MAC spoofing y conexiones no autorizadas

### 7.3 Segmentación por VLAN

**Beneficios:**
- Aislamiento de tráfico entre grupos
- AdminStaff separado de Users
- VLAN de administración separada
- Implementación futura de ACLs por VLAN

---

## 8. ASIGNACIÓN DE DIRECCIONES IPv6

### 8.1 Arquitectura de Direccionamiento

**Bloque Principal:** 2001:db8:0000::/32 (Documentación)

**División por Área:**

```
Área Stateless:      2001:db8:cafe::/48
├─ VLAN 15:          2001:db8:cafe:15::/64
├─ VLAN 45:          2001:db8:cafe:45::/64
├─ VLAN 55:          2001:db8:cafe:55::/64
└─ VLAN 65:          2001:db8:cafe:65::/64

Área Stateful:       2001:db8:3c4d::/48
├─ VLAN 10:          2001:db8:3c4d:10::/64
├─ VLAN 20:          2001:db8:3c4d:20::/64
├─ VLAN 30:          2001:db8:3c4d:30::/64
└─ VLAN 40:          2001:db8:3c4d:40::/64

Interconexión:
├─ RA-R1:            2001:db8:1:1::/64
├─ RA-R2:            2001:db8:2:2::/64
├─ RB-R3:            2001:db8:3:3::/64
├─ RB-R4:            2001:db8:4:4::/64
└─ RA-RB:            2001:db8:7:7::/64
```

### 8.2 Esquema de Direccionamiento por Dispositivo

#### Stateless:

| Dispositivo | VLAN | Dirección | Función |
|---|---|---|---|
| R1 (Activo) | 15 | 2001:db8:cafe:15::1/64 | Gateway |
| R2 (Respaldo) | 15 | 2001:db8:cafe:15::2/64 | Gateway Respaldo |
| S1 Mgmt | 55 | 2001:db8:cafe:55::11/64 | Gestión Switch |
| S2 Mgmt | 55 | 2001:db8:cafe:55::12/64 | Gestión Switch |
| S3 Mgmt | 55 | 2001:db8:cafe:55::13/64 | Gestión Switch |

#### Stateful:

| Dispositivo | VLAN | Dirección | Función |
|---|---|---|---|
| R3 (Activo) | 10 | 2001:db8:3c4d:10::1/64 | Gateway |
| R4 (Respaldo) | 10 | 2001:db8:3c4d:10::2/64 | Gateway Respaldo |
| S4 Mgmt | 30 | 2001:db8:3c4d:30::14/64 | Gestión Switch |
| S5 Mgmt | 30 | 2001:db8:3c4d:30::15/64 | Gestión Switch |
| S6 Mgmt | 30 | 2001:db8:3c4d:30::16/64 | Gestión Switch |

---

## 9. FLUJO DE CONFIGURACION DE CLIENTES

### 9.1 Proceso en Área Stateless

```
1. Cliente conecta a puerto de switch en VLAN 45 (Users)
   └─ Puerto recibe tráfico sin etiqueta (Access)

2. Cliente envía Router Solicitation (RS)
   └─ Busca información de red

3. R1/R2 responden con Router Advertisement (RA)
   ├─ Prefix: 2001:db8:cafe:45::/64
   ├─ Lifetime: Válido para autoconfiguración
   ├─ other-config-flag: TRUE (DHCP Stateless disponible)
   └─ Flag M/O: Managed = False, Other = True

4. Cliente genera dirección IPv6
   ├─ Usa Prefix 2001:db8:cafe:45::/64
   ├─ Interfaz Identifier = EUI-64 (basado en MAC)
   └─ Resultado: 2001:db8:cafe:45::aaaa:bbbb:cccc (ejemplo)

5. Cliente solicita información adicional via DHCP
   ├─ Servidor: DHCP-STATELESS-45
   ├─ Información: DNS, dominio tics.edu.mx
   └─ Confirmación recibida

6. Cliente operativo con:
   ├─ Dirección IPv6: 2001:db8:cafe:45::aaaa:bbbb:cccc/64
   ├─ Gateway: 2001:db8:cafe:45::1 (HSRP Virtual)
   ├─ DNS: Proporcionado por DHCP
   └─ Dominio: tics.edu.mx
```

**Tiempo total:** ~2-5 segundos

### 9.2 Proceso en Área Stateful

```
1. Cliente conecta a puerto de switch en VLAN 20 (Users)
   └─ Puerto recibe tráfico sin etiqueta (Access)

2. Cliente envía Router Solicitation (RS)
   └─ Busca información de red

3. R3/R4 responden con Router Advertisement (RA)
   ├─ Prefix: 2001:db8:3c4d:20::/64
   ├─ Lifetime: POCO VÁLIDO (indica reconfiguración)
   ├─ Flag M: Managed = TRUE ← DHCP obligatorio
   └─ Flag O: Other = FALSE

4. Cliente solicita dirección completa via DHCPv6
   ├─ Servidor: DHCP-STATEFUL-20
   ├─ Pool: 2001:db8:3c4d:20::/64
   ├─ Servidor asigna dirección única
   ├─ Proporciona DNS y dominio
   └─ Lease: Configurable (ej: 1 día)

5. Cliente recibe asignación:
   ├─ Dirección: 2001:db8:3c4d:20::xxxx (asignada por servidor)
   ├─ Gateway: 2001:db8:3c4d:20::1 (HSRP Virtual)
   ├─ DNS: Del servidor DHCP
   ├─ Lease: Límite de tiempo
   └─ MAC registrada en servidor

6. Cliente operativo con control centralizado
   ├─ Auditoría completa disponible
   ├─ Reconfigurable por administrador
   └─ Renovación periódica con servidor
```

**Tiempo total:** ~3-8 segundos

---

## 10. ENRUTAMIENTO Y CONECTIVIDAD

### 10.1 Rutas Estáticas Configuradas

#### Router RA:
```
ipv6 route 2001:db8:cafe::/48 s0/0/1 2001:db8:1:1::2
├─ Red Stateless vía R1

ipv6 route 2001:db8:cafe::/48 s0/0/0 2001:db8:2:2::2
├─ Red Stateless vía R2 (redundancia)

ipv6 route ::/0 2001:DB8:7:7::1
└─ Ruta por defecto hacia Internet vía RB
```

#### Router RB:
```
ipv6 route 2001:db8:3c4d::/48 s0/0/1 2001:db8:3:3::2
├─ Red Stateful vía R3

ipv6 route 2001:db8:3c4d::/48 s0/0/0 2001:db8:4:4::2
├─ Red Stateful vía R4 (redundancia)

ipv6 route ::/0 2001:DB8:7:7::2
└─ Ruta por defecto hacia Internet vía RA
```

#### Routers R1, R2, R3, R4:
```
ipv6 route ::/0 vía router central (RA o RB)
└─ Todo tráfico hacia Internet
```

### 10.2 Conectividad Entre Áreas

```
Estatless ←→ Stateful

2001:db8:cafe::/48  ←RA-RB→  2001:db8:3c4d::/48
        ↓                            ↓
  (Usuarios en red 1)      (Usuarios en red 2)
```

**Acceso:**
- Usuarios Stateless pueden comunicarse con Stateful
- Routing centralizado en RA/RB
- Firewalls/ACLs podrían restringir

---

## 11. CONFIGURACIÓN DE SEGURIDAD RESUMIDA

### 11.1 Contraseñas y Credenciales

```
Tipo de Acceso              Credencial
────────────────────────────────────────
Modo Enable (sin encriptar) cisco
Modo Enable (encriptado)    tics
SSH (Usuario admin)         admin / admin
VLAN de gestión             55 (Stateless)
                            30 (Stateful)
```

### 11.2 Certificados y Encriptación

```
RSA 1024-bit generado en cada dispositivo
├─ Dominio: itsoeh.edu
├─ Usado para SSH
└─ Válido durante el ciclo de vida del dispositivo
```

### 11.3 Implementación de Best Practices

✓ SSH habilitado (no Telnet)  
✓ Contraseñas encriptadas (enable secret)  
✓ Banner de advertencia legal  
✓ Port Security en puertos de acceso  
✓ Logging deshabilitado (sin logging console)  
✓ Autenticación local  
✓ Encapsulación dot1Q en trunks

---

## 12. VALIDACIÓN Y PRUEBAS RECOMENDADAS

### 12.1 Pruebas de Conectividad

```bash
# Desde cliente en VLAN 45:
ping 2001:db8:cafe:45::1          # Gateway
ping 2001:db8:cafe:55::11         # Switch S1 Mgmt
ping 2001:db8:3c4d:20::1          # Gateway Stateful
ping 2001:db8:7:7::1              # Router RA exterior

# Verificar resolución DNS:
nslookup tics.edu.mx              # Debe resolver
```

### 12.2 Pruebas de Failover

```bash
# En Switch:
show spanning-tree vlan 15        # Ver topología

# En Router (activo):
show standby brief                # Ver estado HSRP
show standby 15 detail            # Detalles grupo 15

# Simular fallo:
shutdown interface s0/0/1         # Desactiva enlace R1
# → Observar cambio a R2
```

### 12.3 Validación de Direccionamiento

```bash
# Cliente debe generar (Stateless):
ipv6 address 2001:db8:cafe:45:xxxx:xxxx:xxxx:xxxx/64

# Cliente debe recibir (Stateful):
ipv6 address 2001:db8:3c4d:20:yyyy:yyyy:yyyy:yyyy/64
# Asignada por servidor DHCP
```

---

## 13. VENTAJAS DE LA ARQUITECTURA PROPUESTA

### 13.1 Alta Disponibilidad
- ✓ Redundancia completa en todos los niveles
- ✓ HSRP v2 para failover automático
- ✓ EtherChannel para trunks sin punto único de fallo
- ✓ Múltiples rutas hacia cada destino

### 13.2 Escalabilidad
- ✓ Arquitectura modular (Stateless + Stateful)
- ✓ Fácil agregar nuevos switches/VLANs
- ✓ DHCP Stateless reduce carga de servidores
- ✓ Dirección IPv6 suficiente para crecimiento

### 13.3 Seguridad
- ✓ Segmentación por VLAN
- ✓ Port Security en acceso
- ✓ SSH para gestión remota
- ✓ Encriptación de contraseñas
- ✓ Autenticación local

### 13.4 Administración
- ✓ Configuración centralizada de DHCP
- ✓ HSRP simplifica gestión de gateways
- ✓ SSH facilita administración remota
- ✓ VLANs reducen broadcast

---

## 14. CONCLUSIONES

Este proyecto implementa una infraestructura de red IPv6 empresarial robusta que demuestra:

1. **Conocimiento de Protocolos IPv6:** Implementación completa de autoconfiguración y DHCP
2. **Redundancia:** HSRP v2 y EtherChannel para alta disponibilidad
3. **Seguridad:** Port Security, SSH, encriptación y segmentación
4. **Escalabilidad:** Diseño modular que permite crecimiento futuro
5. **Best Practices:** Configuración siguiendo estándares industriales

La arquitectura es adecuada para un ambiente académico/corporativo pequeño a mediano que requiera:
- Autoconfiguración automática (Stateless)
- Control centralizado (Stateful)
- Redundancia completa
- Gestión remota segura

---

## 15. RECOMENDACIONES FUTURAS

1. **Implementar Routing Dinámico:** Reemplazar rutas estáticas con OSPF v3
2. **Agregar Firewall:** Filtrar tráfico entre áreas con ACLs
3. **Monitoreo:** Implementar SNMP para monitoreo centralizado
4. **Backup:** Configurar respaldos automatizados de config
5. **Syslog:** Centralizar logs en servidor syslog
6. **QoS:** Priorizar tráfico de aplicaciones críticas
7. **DHCPv6 Redundancia:** Agregar servidor DHCP secundario
8. **VPN:** Conectar sitios remotos de forma segura

---

**Documento Preparado por:** [Nombre del Estudiante]  
**Fecha:** Noviembre 2025  
**Institución:** ITSOEH  
**Asignatura:** Configuración de Redes IPv6

---

## APÉNDICE A: Comandos Clave Utilizados

```cisco
! Configuración básica
no logging console
hostname NOMBRE_DISPOSITIVO
enable password cisco
enable secret tics
banner motd # Solo acceso autorizado #
service password-encryption

! IPv6 Routing
ipv6 unicast-routing
ipv6 route DESTINO INTERFAZ NEXT-HOP

! HSRP v2
standby version 2
standby GROUP ipv6 autoconfig
standby GROUP priority PRIORIDAD
standby GROUP preempt

! DHCP
ipv6 dhcp pool NOMBRE-POOL
  address prefix PREFIJO
  domain-name DOMINIO.COM
exit

! VLAN y Trunking
vlan ID
  name NOMBRE
exit

interface INTERFAZ.ID
  encapsulation dot1Q ID
  no ip address
  ipv6 address DIRECCIÓN/PREFIJO
  ipv6 enable
exit

! EtherChannel
interface range INTERFAZ1 - INTERFAZN
  channel-group NUM mode active
  no shutdown
exit

interface port-channel NUM
  switchport mode trunk
  switchport trunk allowed vlan VLANS
  switchport trunk native vlan ID
exit

! SSH
username USUARIO password CONTRASEÑA
ip domain-name DOMINIO
crypto key generate rsa BITS
line vty 0 15
  transport input ssh
  login local
exit
```

---

## APÉNDICE B: Comandos Show para Validación y Capturas

Este apartado contiene los comandos `show` necesarios para validar la configuración y funcionamiento de la red. Se proporciona cada comando con su descripción para que puedas agregar las capturas correspondientes.

### B.1 Validación de Configuración General

#### B.1.1 Información del Dispositivo

**Comando:**
```cisco
show version
```

**Descripción:**
Muestra la versión del IOS, modelo del dispositivo, memoria disponible y tiempo de funcionamiento. Útil para verificar que el dispositivo está operativo y conocer su modelo exacto.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW VERSION]

---

#### B.1.2 Configuración en Ejecución

**Comando:**
```cisco
show running-config
```

**Descripción:**
Muestra toda la configuración actual del dispositivo en la RAM. Permite verificar que todas las configuraciones de red, VLAN, SSH y seguridad se encuentran aplicadas correctamente. (Nota: Salida muy larga, típicamente 100+ líneas)

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW RUNNING-CONFIG]

---

#### B.1.3 Configuración de Arranque

**Comando:**
```cisco
show startup-config
```

**Descripción:**
Muestra la configuración guardada en NVRAM que se cargará al reiniciar. Verifica que los cambios están persistentes.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW STARTUP-CONFIG]

---

### B.2 Validación de Interfaces IPv6

#### B.2.1 Estado de Interfaces

**Comando:**
```cisco
show ipv6 interface brief
```

**Descripción:**
Muestra un resumen de todas las interfaces, incluyendo direcciones IPv6, estado (up/down) y protocolo. Esencial para verificar que todas las interfaces tienen direcciones IPv6 asignadas correctamente.

**Información mostrada:**
- Interfaz
- Estado (administrativo y protocolo)
- Dirección IPv6

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 INTERFACE BRIEF]

---

#### B.2.2 Detalles de Interfaz Específica

**Comando:**
```cisco
show ipv6 interface g0/1.15
```

**Descripción:**
Muestra información detallada de una interfaz específica en modo router/subinterfaz. Permite verificar configuración ND flags, dirección IPv6, MTU, y estado del protocolo.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 INTERFACE G0/1.15]

---

#### B.2.3 Configuración de Interfaz Serial

**Comando:**
```cisco
show ipv6 interface s0/0/1
```

**Descripción:**
Valida las interfaces seriales de enlace WAN entre routers. Verifica conectividad en la red de interconexión.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 INTERFACE S0/0/1]

---

### B.3 Validación de VLAN

#### B.3.1 VLANs Configuradas (Switches)

**Comando:**
```cisco
show vlan brief
```

**Descripción:**
Muestra lista de todas las VLANs existentes en el switch, sus nombres y puertos asignados. Permite verificar que todas las VLANs (15, 45, 55, 65 para Stateless y 10, 20, 30, 40 para Stateful) están correctamente creadas.

**Información mostrada:**
- ID VLAN
- Nombre
- Tipo
- Puertos

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW VLAN BRIEF]

---

#### B.3.2 Interfaz VLAN de Gestión

**Comando:**
```cisco
show ipv6 interface vlan 55
```

**Descripción:**
Muestra la configuración de la interfaz VLAN 55 (gestión en Stateless). Verifica que la VLAN de administración está correctamente configurada con dirección IPv6.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 INTERFACE VLAN 55]

---

### B.4 Validación de EtherChannel

#### B.4.1 Resumen de Port-Channels

**Comando:**
```cisco
show etherchannel brief
```

**Descripción:**
Muestra estado resumido de todos los canales etéreo (Port-Channels) configurados. Verifica que los EtherChannels están activos y los puertos están agrupados correctamente.

**Información mostrada:**
- Port-Channel
- Protocolo (LACP/PAGP)
- Puertos miembros
- Estado

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW ETHERCHANNEL BRIEF]

---

#### B.4.2 Detalles de Port-Channel

**Comando:**
```cisco
show etherchannel 1 detail
```

**Descripción:**
Información detallada del Port-Channel 1. Muestra protocolo activo, estado de cada puerto miembro, balanceo de carga y timers.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW ETHERCHANNEL 1 DETAIL]

---

#### B.4.3 Puertos en EtherChannel

**Comando:**
```cisco
show etherchannel port-channel
```

**Descripción:**
Muestra información de los puertos dentro de cada Port-Channel, incluyendo si están activos o en standby.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW ETHERCHANNEL PORT-CHANNEL]

---

### B.5 Validación de HSRP (Redundancia)

#### B.5.1 Resumen de HSRP

**Comando:**
```cisco
show standby brief
```

**Descripción:**
Muestra estado resumido de todos los grupos HSRP. Verifica qué router es activo y cuál está en standby para cada grupo. Esencial para validar redundancia.

**Información mostrada:**
- Grupo HSRP
- Prioridad
- Estado (Active/Standby)
- Dirección virtual

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW STANDBY BRIEF]

---

#### B.5.2 Detalles HSRP Grupo Específico

**Comando:**
```cisco
show standby 15 detail
```

**Descripción:**
Información detallada del grupo HSRP 15 (VLAN 15). Muestra prioridad, estado, dirección virtual, timers y estadísticas de transiciones.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW STANDBY 15 DETAIL]

---

#### B.5.3 Verificar Estado Activo/Standby

**Comando:**
```cisco
show standby
```

**Descripción:**
Muestra estado completo de HSRP en todos los grupos. Permite verificar que R1 es activo (priority 150) y R2 es standby (priority 90).

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW STANDBY]

---

### B.6 Validación de DHCP IPv6

#### B.6.1 Pools DHCP Configurados

**Comando:**
```cisco
show ipv6 dhcp pool
```

**Descripción:**
Muestra todos los pools DHCP IPv6 configurados (DHCP-STATELESS-XX o DHCP-STATEFUL-XX) con su información de dominio y prefijos.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 DHCP POOL]

---

#### B.6.2 Clientes DHCP Conectados

**Comando:**
```cisco
show ipv6 dhcp binding
```

**Descripción:**
Muestra direcciones IPv6 asignadas a clientes en el servidor DHCP Stateful. Lista dirección, MAC del cliente, duración del lease y estado.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 DHCP BINDING]

---

#### B.6.3 Estadísticas DHCP

**Comando:**
```cisco
show ipv6 dhcp statistics
```

**Descripción:**
Muestra estadísticas de servidor DHCP: solicitudes recibidas, replies enviadas, declines, releases y otras métricas de funcionamiento.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 DHCP STATISTICS]

---

### B.7 Validación de Enrutamiento

#### B.7.1 Tabla de Rutas IPv6

**Comando:**
```cisco
show ipv6 route
```

**Descripción:**
Muestra tabla de enrutamiento IPv6 con todas las rutas configuradas estáticamente y rutas aprendidas. Verifica conectividad entre redes Stateless, Stateful e Internet.

**Información mostrada:**
- Destino (CIDR)
- Tipo de ruta (S = Static, C = Connected)
- Interfaz/Next-hop
- Métrica

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 ROUTE]

---

#### B.7.2 Rutas por Protocolo

**Comando:**
```cisco
show ipv6 route static
```

**Descripción:**
Filtra la tabla de rutas para mostrar solo rutas estáticas. Útil para verificar configuración de rutas estáticas entre routers.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 ROUTE STATIC]

---

#### B.7.3 Ruta a Destino Específico

**Comando:**
```cisco
show ipv6 route 2001:db8:cafe::/48
```

**Descripción:**
Muestra la ruta específica hacia la red Stateless (2001:db8:cafe::/48), incluyendo interfaz de salida y next-hop.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 ROUTE 2001:DB8:CAFE::/48]

---

### B.8 Validación de Vecindario IPv6

#### B.8.1 Tabla de Vecinos (ARP para IPv6)

**Comando:**
```cisco
show ipv6 neighbors
```

**Descripción:**
Muestra tabla de descubrimiento de vecinos IPv6 (equivalente a ARP en IPv4). Lista dispositivos alcanzables, sus direcciones MAC y estado de reachability.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 NEIGHBORS]

---

#### B.8.2 Prefijos ND Anunciados

**Comando:**
```cisco
show ipv6 prefix
```

**Descripción:**
Muestra prefijos IPv6 anunciados en ICMP ND. Verifica que los prefijos correctos se están publicando para autoconfiguración de clientes.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IPV6 PREFIX]

---

### B.9 Validación de Seguridad

#### B.9.1 Port-Security (Switches)

**Comando:**
```cisco
show port-security
```

**Descripción:**
Muestra resumen de configuración de Port-Security en el switch. Verifica que está habilitada globalmente.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW PORT-SECURITY]

---

#### B.9.2 Port-Security por Interfaz

**Comando:**
```cisco
show port-security interface f0/7
```

**Descripción:**
Muestra configuración detallada de Port-Security en puerto específico (f0/7 en VLAN AdminStaff). Verifica límite de MACs, violación y dirección pegajosa.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW PORT-SECURITY INTERFACE F0/7]

---

#### B.9.3 MACs Aprendidas por Port-Security

**Comando:**
```cisco
show mac-address-table secure
```

**Descripción:**
Muestra direcciones MAC aprendidas en modo sticky por Port-Security. Útil para auditoría de dispositivos conectados.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW MAC-ADDRESS-TABLE SECURE]

---

#### B.9.4 Tabla MAC Completa

**Comando:**
```cisco
show mac-address-table
```

**Descripción:**
Muestra tabla completa de direcciones MAC aprendidas en el switch, incluyendo puerto y VLAN.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW MAC-ADDRESS-TABLE]

---

### B.10 Validación de Conectividad

#### B.10.1 Ping IPv6 a Gateway

**Comando:**
```cisco
ping 2001:db8:cafe:15::1
```

**Descripción:**
Ping a la dirección virtual HSRP del gateway de la VLAN 15. Verifica que el router responde y hay conectividad Layer 3.

**Resultado esperado:**
- 5 replies exitosos
- 0% packet loss
- Latencia: típicamente <1ms en LAN

**Captura esperada:**
[AGREGAR CAPTURA DE PING A GATEWAY IPv6]

---

#### B.10.2 Ping a Switch de Gestión

**Comando:**
```cisco
ping 2001:db8:cafe:55::11
```

**Descripción:**
Ping a la interfaz de gestión de S1. Valida conectividad remota para administración SSH.

**Captura esperada:**
[AGREGAR CAPTURA DE PING A SWITCH DE GESTIÓN]

---

#### B.10.3 Ping Cross-Area (Stateless a Stateful)

**Comando:**
```cisco
ping 2001:db8:3c4d:30::14
```

**Descripción:**
Ping desde un router Stateless a un switch en área Stateful. Verifica routing entre las dos áreas.

**Resultado esperado:**
- Conectividad exitosa si no hay ACLs restrictivas
- Valida que RA/RB están forwardeando correctamente

**Captura esperada:**
[AGREGAR CAPTURA DE PING CROSS-AREA]

---

#### B.10.4 Trace Route IPv6

**Comando:**
```cisco
traceroute 2001:db8:3c4d:30::14
```

**Descripción:**
Muestra la ruta completa de paquetes hacia el destino, incluyendo cada router intermedio. Útil para verificar path y detectar problemas en la ruta.

**Captura esperada:**
[AGREGAR CAPTURA DE TRACEROUTE IPv6]

---

### B.11 Validación de Trunks

#### B.11.1 Configuración de Trunk

**Comando:**
```cisco
show interfaces trunk
```

**Descripción:**
Muestra todas las interfaces configuradas como trunk, VLANs permitidas, VLAN nativa y estado de encapsulación.

**Información mostrada:**
- Puerto
- Modo (on/auto/desirable)
- Encapsulación (dot1Q)
- VLANs nativas y permitidas

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW INTERFACES TRUNK]

---

#### B.11.2 Estado de Puerto Específico

**Comando:**
```cisco
show interfaces g0/1 switchport
```

**Descripción:**
Muestra modo de puerto (access/trunk), VLAN asignada, estado de Port-Security y configuración de trunk si aplica.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW INTERFACES G0/1 SWITCHPORT]

---

### B.12 Validación de SSH

#### B.12.1 Configuración SSH

**Comando:**
```cisco
show ip ssh
```

**Descripción:**
Muestra información de servidor SSH: versión, algoritmos soportados, timeout y estado operativo.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW IP SSH]

---

#### B.12.2 Usuarios Locales

**Comando:**
```cisco
show username
```

**Descripción:**
Muestra usuarios locales configurados para autenticación SSH (ej: admin).

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW USERNAME]

---

#### B.12.3 Líneas VTY

**Comando:**
```cisco
show line vty 0 4
```

**Descripción:**
Muestra configuración de líneas VTY (acceso remoto), incluyendo protocolos habilitados (SSH) y configuración de login.

**Captura esperada:**
[AGREGAR CAPTURA DE SHOW LINE VTY]

---

### B.13 Resumen de Capturas por Sección

Para una presentación completa, se recomienda obtener capturas en este orden:

#### **Sección 1: Configuración Base**
1. show version
2. show running-config (primeras líneas)
3. show ipv6 interface brief

#### **Sección 2: VLAN y Acceso**
4. show vlan brief
5. show port-security
6. show interfaces trunk

#### **Sección 3: Redundancia**
7. show standby brief
8. show etherchannel brief
9. show etherchannel 1 detail

#### **Sección 4: Enrutamiento**
10. show ipv6 route
11. show ipv6 neighbors
12. ping (verificación)
13. traceroute (path)

#### **Sección 5: DHCP (si es router)**
14. show ipv6 dhcp pool
15. show ipv6 dhcp binding (si aplica)
16. show ipv6 dhcp statistics

#### **Sección 6: Seguridad**
17. show ip ssh
18. show port-security interface f0/7
19. show mac-address-table secure

---

**Notas Importantes para Captura:**

- Use `terminal length 0` antes de `show running-config` para ver salida completa sin paginación
- Use `terminal width 150` para mejorar legibilidad
- Capture la hora del sistema con `show clock` para documentación
- Para DHCP, necesita conectar cliente para generar bindings
- Para Port-Security violations, simule conexión con MAC no autorizada
- Las capturas pueden variar según configuración real vs esperada

---

**FIN DEL REPORTE**
