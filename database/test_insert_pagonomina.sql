-- Script de prueba: Insertar registro de prueba en PagoNomina con XMLRuta y FacturaRuta

USE NexusCode_2;
GO

-- Verificar estructura actual de la tabla PagoNomina
EXEC sp_help 'PagoNomina';
GO

-- Insertar un registro de prueba
INSERT INTO PagoNomina (
    ObraID, 
    TrabajadorID, 
    FechaPago, 
    PeriodoInicio, 
    PeriodoFin, 
    MontoPagado, 
    EstatusPago, 
    XMLRuta, 
    FacturaRuta, 
    Concepto, 
    Observaciones
)
VALUES (
    1,                                          -- ObraID
    1,                                          -- TrabajadorID
    CAST(GETDATE() AS DATE),                   -- FechaPago
    CAST(GETDATE() - 7 AS DATE),               -- PeriodoInicio
    CAST(GETDATE() AS DATE),                   -- PeriodoFin
    5000.00,                                   -- MontoPagado
    'Pendiente',                               -- EstatusPago
    '/uploads/xml/test_20250125_123456.xml',  -- XMLRuta
    '/uploads/facturas/test_20250125_123456.pdf',  -- FacturaRuta
    'Pago de prueba',                          -- Concepto
    'Registro de prueba para verificar XMLRuta y FacturaRuta'  -- Observaciones
);

-- Verificar si se insertó correctamente
SELECT TOP 5 
    NominaID,
    ObraID,
    TrabajadorID,
    FechaPago,
    MontoPagado,
    EstatusPago,
    XMLRuta,
    FacturaRuta,
    Concepto,
    FechaRegistro
FROM PagoNomina
ORDER BY NominaID DESC;
GO
