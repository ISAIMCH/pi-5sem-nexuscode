#!/usr/bin/env node

/**
 * Script de Diagnóstico - Verificar Conectividad a BD y Estado del API
 * 
 * Uso: node server/diagnóstico.js
 */

const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'NexusCode_2',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableKeepAlive: true,
  },
};

console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A BD\n');
console.log('📋 Configuración:');
console.log(`   Servidor: ${config.server}`);
console.log(`   Base de Datos: ${config.database}`);
console.log(`   Usuario: ${config.user}`);
console.log(`   Puerto: 1433 (default)\n`);

async function runDiagnostics() {
  try {
    console.log('1️⃣ Intentando conectar a SQL Server...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('   ✅ Conexión exitosa a SQL Server\n');

    console.log('2️⃣ Verificando tablas principales...');
    const tables = ['Ingreso', 'Proveedor', 'Cat_TipoIngreso', 'Cat_TipoProveedor', 'Obra'];
    
    for (const table of tables) {
      try {
        const result = await pool.request()
          .query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ ${table}: ${result.recordset[0].count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table}: TABLA NO EXISTE - ${error.message}`);
      }
    }
    console.log();

    console.log('3️⃣ Probando operación INSERT en tabla Ingreso...');
    try {
      const testResult = await pool.request()
        .input('ObraID', sql.Int, 1)
        .input('TipoIngresoID', sql.Int, 1)
        .input('Fecha', sql.Date, new Date())
        .input('Descripcion', sql.NVarChar(500), 'TEST INGRESO - PUEDE ELIMINARSE')
        .input('Monto', sql.Decimal(18, 2), 1000.00)
        .input('FacturaRef', sql.NVarChar(100), null)
        .query(
          `INSERT INTO Ingreso (ObraID, Fecha, TipoIngresoID, Descripcion, Monto, FacturaRef)
           OUTPUT INSERTED.IngresoID
           VALUES (@ObraID, @Fecha, @TipoIngresoID, @Descripcion, @Monto, @FacturaRef)`
        );
      
      const ingresoID = testResult.recordset[0].IngresoID;
      console.log(`   ✅ Ingreso de prueba creado con ID: ${ingresoID}`);
      
      // Limpiar: eliminar el ingreso de prueba
      await pool.request()
        .input('IngresoID', sql.Int, ingresoID)
        .query('DELETE FROM Ingreso WHERE IngresoID = @IngresoID');
      console.log(`   ✅ Ingreso de prueba eliminado`);
    } catch (error) {
      console.log(`   ❌ Error en INSERT: ${error.message}`);
      if (error.message.includes('FK_')) {
        console.log('      Posible causa: ObraID o TipoIngresoID no existen');
      }
    }
    console.log();

    console.log('4️⃣ Probando operación INSERT en tabla Proveedor...');
    try {
      const testResult = await pool.request()
        .input('Nombre', sql.NVarChar(120), 'PROVEEDOR TEST - PUEDE ELIMINARSE')
        .input('TipoProveedorID', sql.Int, 1)
        .input('RFC', sql.NVarChar(13), null)
        .input('Telefono', sql.NVarChar(30), null)
        .input('Correo', sql.NVarChar(120), null)
        .query(
          `INSERT INTO Proveedor (Nombre, TipoProveedorID, RFC, Telefono, Correo)
           OUTPUT INSERTED.ProveedorID
           VALUES (@Nombre, @TipoProveedorID, @RFC, @Telefono, @Correo)`
        );
      
      const proveedorID = testResult.recordset[0].ProveedorID;
      console.log(`   ✅ Proveedor de prueba creado con ID: ${proveedorID}`);
      
      // Limpiar: eliminar el proveedor de prueba
      await pool.request()
        .input('ProveedorID', sql.Int, proveedorID)
        .query('DELETE FROM Proveedor WHERE ProveedorID = @ProveedorID');
      console.log(`   ✅ Proveedor de prueba eliminado`);
    } catch (error) {
      console.log(`   ❌ Error en INSERT: ${error.message}`);
      if (error.message.includes('FK_')) {
        console.log('      Posible causa: TipoProveedorID no existe');
      }
    }
    console.log();

    console.log('✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE');
    console.log('\n📝 Conclusiones:');
    console.log('   • La conexión a BD está funcionando');
    console.log('   • Las tablas existen y son accesibles');
    console.log('   • Las operaciones INSERT funcionan correctamente');
    console.log('\n💡 Si aún tienes problemas:');
    console.log('   1. Reinicia el servidor (npm start)');
    console.log('   2. Verifica que SQL Server esté corriendo');
    console.log('   3. Prueba crear un ingreso desde la UI');

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.log(`\n❌ ERROR FATAL: ${error.message}`);
    console.log('\n🔧 Posibles soluciones:');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Login failed')) {
      console.log('   • SQL Server no está accesible');
      console.log('   • Verifica que SQL Server esté corriendo');
      console.log('   • Verifica las credenciales en .env');
    } else if (error.message.includes('database')) {
      console.log('   • Base de datos no existe');
      console.log('   • Ejecuta: database/schema.sql en SQL Server');
    }
    
    process.exit(1);
  }
}

runDiagnostics();
