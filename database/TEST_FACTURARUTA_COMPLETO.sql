-- TEST COMPLETO: Verificar que FacturaRuta funciona en tabla Ingreso

USE [nexuscode_db];  -- CAMBIAR AL NOMBRE DE TU BASE DE DATOS
GO

PRINT '===== TEST 1: Verificar columna existe =====' 
SELECT COUNT(*) as ColumnExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Ingreso' AND COLUMN_NAME = 'FacturaRuta';
-- Esperado: 1

PRINT '';
PRINT '===== TEST 2: Listar todas las columnas de tabla Ingreso =====' 
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Ingreso'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '===== TEST 3: Insertar test con FacturaRuta =====' 
-- Primero obtener una ObraID válida
DECLARE @ObraID INT;
DECLARE @TipoIngresoID INT;
SELECT TOP 1 @ObraID = ObraID FROM Obra;
SELECT TOP 1 @TipoIngresoID = TipoIngresoID FROM Cat_TipoIngreso;

PRINT 'ObraID para test: ' + CAST(@ObraID AS VARCHAR(10));
PRINT 'TipoIngresoID para test: ' + CAST(@TipoIngresoID AS VARCHAR(10));

-- Insertar con FacturaRuta
INSERT INTO Ingreso (ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRuta)
VALUES (@ObraID, CAST(GETDATE() AS DATE), @TipoIngresoID, 'TEST_INGRESO_FACTURA', 1000.00, '/uploads/facturas/TEST_PDF_123.pdf');

DECLARE @TestIngresoID INT = @@IDENTITY;
PRINT 'Ingreso TEST insertado con ID: ' + CAST(@TestIngresoID AS VARCHAR(10));

PRINT '';
PRINT '===== TEST 4: Leer el TEST Ingreso que acabamos de insertar =====' 
SELECT IngresoID, ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRuta
FROM Ingreso
WHERE IngresoID = @TestIngresoID;
-- Esperado: FacturaRuta debe mostrar '/uploads/facturas/TEST_PDF_123.pdf'

PRINT '';
PRINT '===== TEST 5: Últimos 5 ingresos con FacturaRuta (últimos primero) =====' 
SELECT TOP 5 IngresoID, Fecha, Descripcion, Monto, ISNULL(FacturaRuta, 'NULL') as FacturaRuta
FROM Ingreso
ORDER BY IngresoID DESC;

PRINT '';
PRINT '===== TEST 6: Contar ingresos con FacturaRuta no NULL =====' 
SELECT 
    COUNT(*) as TotalIngresos,
    COUNT(CASE WHEN FacturaRuta IS NOT NULL THEN 1 END) as ConFacturaRuta,
    COUNT(CASE WHEN FacturaRuta IS NULL THEN 1 END) as SinFacturaRuta
FROM Ingreso;

PRINT '';
PRINT '===== LIMPIAR: Eliminar registro TEST =====' 
DELETE FROM Ingreso WHERE IngresoID = @TestIngresoID;
PRINT 'Registro TEST eliminado.';

PRINT '';
PRINT '===== TEST COMPLETADO =====' 
