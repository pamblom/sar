# SAR — Sistema de Acopio de Residuos

Aplicación web del proyecto **SAR-2026-01**: registro, pesaje, puntuación, ranking y reportes ambientales para el acopio de material reciclable en Cartagena.

Tres entradas, según el documento de requerimientos v2.0:

- **Administrador** (`/admin`): dashboard, solicitudes, usuarios, materiales, analíticas y reportes.
- **Operador de acopio** (`/operador`): registra, pesa, valida y confirma entregas (RF-01 a RF-05).
- **Recolector** (`/app`): panel, nuevo pesaje con foto/IA, historial y ranking (RF-16 a RF-20).

La base sigue el esquema de `SAR.sql` (`Usuarios`, `Materiales`, `Solicitudes_Pesaje`, `Historial_Ranking`) en SQLite local.

## Arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La base se crea en `data/sar.sqlite`.

Cuentas de demostración (contraseña `sar2026`, PIN `2468`):

| Rol | Correo | Extra |
| --- | --- | --- |
| Admin | pablo.corrales@sar.local | Código `SAR-ADM-01` |
| Operador | juan.llanes@sar.local | |
| Recolector | jean.saldana@sar.local | |

## Diseño

Interfaz **Liquid Emerald Glass** de los mockups Stitch, con formularios de operador en panel crema.
