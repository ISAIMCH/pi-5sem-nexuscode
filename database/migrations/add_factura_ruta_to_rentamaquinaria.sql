-- Agregar columna FacturaRuta a RentaMaquinaria si no existe
USE NexusCode_2;
GO

-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'RentaMaquinaria' 
    AND COLUMN_NAME = 'FacturaRuta'
)
BEGIN
    -- Agregar la columna
    ALTER TABLE RentaMaquinaria
    ADD FacturaRuta NVARCHAR(MAX) NULL;
    
    PRINT '✓ Columna FacturaRuta agregada a RentaMaquinaria';
END
ELSE
BEGIN
    PRINT '✓ Columna FacturaRuta ya existe en RentaMaquinaria';
END
GO

-- Verificar que la columna existe
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'RentaMaquinaria' 
AND COLUMN_NAME = 'FacturaRuta';
GO
