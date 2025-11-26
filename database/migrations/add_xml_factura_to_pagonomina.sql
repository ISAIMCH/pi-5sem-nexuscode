-- Migración: Agregar columnas XMLRuta y FacturaRuta a tabla PagoNomina
-- Fecha: 2025-01-21
-- Descripción: Agrega los campos XMLRuta y FacturaRuta para almacenar rutas de documentos XML y facturas PDF

USE NexusCode_2;
GO

-- Verificar si la columna XMLRuta ya existe
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PagoNomina' AND COLUMN_NAME = 'XMLRuta'
)
BEGIN
    ALTER TABLE PagoNomina
    ADD XMLRuta NVARCHAR(MAX) NULL;
    
    PRINT 'Columna XMLRuta agregada exitosamente a tabla PagoNomina';
END
ELSE
BEGIN
    PRINT 'La columna XMLRuta ya existe en la tabla PagoNomina';
END
GO

-- Verificar si la columna FacturaRuta ya existe
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PagoNomina' AND COLUMN_NAME = 'FacturaRuta'
)
BEGIN
    ALTER TABLE PagoNomina
    ADD FacturaRuta NVARCHAR(MAX) NULL;
    
    PRINT 'Columna FacturaRuta agregada exitosamente a tabla PagoNomina';
END
ELSE
BEGIN
    PRINT 'La columna FacturaRuta ya existe en la tabla PagoNomina';
END
GO
