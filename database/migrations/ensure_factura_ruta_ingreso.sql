-- Asegurar que la columna FacturaRuta existe en la tabla Ingreso
-- Si la tabla Ingreso aún tiene solo FacturaRef, agregamos FacturaRuta
-- Si ya tiene ambas, este script no hace nada

-- Verificar si existe la columna FacturaRuta, si no, crearla
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ingreso') AND name = 'FacturaRuta')
BEGIN
    ALTER TABLE Ingreso
    ADD FacturaRuta NVARCHAR(MAX) NULL;
    
    PRINT 'Columna FacturaRuta agregada exitosamente a la tabla Ingreso.';
END
ELSE
BEGIN
    PRINT 'La columna FacturaRuta ya existía en la tabla Ingreso.';
END

-- Verificar que el índice/estructura esté correcta
EXEC sp_columns 'Ingreso';
