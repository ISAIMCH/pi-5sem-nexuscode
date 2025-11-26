-- Script de diagnóstico para verificar estructura de tabla Ingreso
-- Ejecutar esto directamente en SQL Server Management Studio

-- 1. Ver todas las columnas de la tabla Ingreso
PRINT '=== COLUMNAS DE LA TABLA INGRESO ===';
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Ingreso'
ORDER BY ORDINAL_POSITION;

-- 2. Verificar si FacturaRuta existe
PRINT '';
PRINT '=== VERIFICAR SI FACTURARUTA EXISTE ===';
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Ingreso' AND COLUMN_NAME = 'FacturaRuta')
    PRINT 'OK: Columna FacturaRuta EXISTE en tabla Ingreso'
ELSE
    PRINT 'ERROR: Columna FacturaRuta NO EXISTE en tabla Ingreso - NECESITA MIGRACION'

-- 3. Contar registros y ver últimos ingresos
PRINT '';
PRINT '=== ULTIMOS INGRESOS REGISTRADOS ===';
SELECT TOP 5 
    IngresoID, 
    ObraID, 
    Fecha, 
    Monto, 
    FacturaRef,
    ISNULL(FacturaRuta, 'NULL') as FacturaRuta
FROM Ingreso
ORDER BY IngresoID DESC;

-- 4. Ver estructura completa de la tabla
PRINT '';
PRINT '=== INFORMACION COMPLETA DE LA TABLA ===';
EXEC sp_help 'Ingreso';
