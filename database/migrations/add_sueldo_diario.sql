-- Migración: Agregar columna SueldoDiario a tabla Trabajador
-- Fecha: 2025-11-24
-- Descripción: Agrega el campo SueldoDiario para almacenar el salario diario de cada trabajador

USE NexusCode_2;
GO

-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Trabajador' AND COLUMN_NAME = 'SueldoDiario'
)
BEGIN
    ALTER TABLE Trabajador
    ADD SueldoDiario DECIMAL(18,2) NULL;
    
    PRINT 'Columna SueldoDiario agregada exitosamente a tabla Trabajador';
END
ELSE
BEGIN
    PRINT 'La columna SueldoDiario ya existe en la tabla Trabajador';
END
GO
