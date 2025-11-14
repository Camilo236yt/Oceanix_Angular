#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Obtener el subdomain del argumento de línea de comandos
const subdomain = process.argv[2];

if (!subdomain) {
  console.error('❌ Error: Debes proporcionar un subdomain');
  console.log('\nUso:');
  console.log('  npm run dev:subdomain <subdomain>');
  console.log('\nEjemplo:');
  console.log('  npm run dev:subdomain techcorp');
  process.exit(1);
}

// Crear archivo que será inyectado en index.html para configurar localStorage
const scriptContent = `
<script>
  // Configurar subdomain para desarrollo local
  localStorage.setItem('dev_subdomain', '${subdomain}');
  console.log('%c[DEV] Subdomain configurado: ${subdomain}', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
</script>
`;

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const indexBackupPath = path.join(__dirname, '..', 'src', 'index.backup.html');

// Leer index.html original
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// Hacer backup si no existe
if (!fs.existsSync(indexBackupPath)) {
  fs.writeFileSync(indexBackupPath, indexContent);
}

// Inyectar script si no está presente
if (!indexContent.includes('dev_subdomain')) {
  // Buscar la etiqueta </head> e inyectar el script antes
  indexContent = indexContent.replace('</head>', `${scriptContent}</head>`);
  fs.writeFileSync(indexPath, indexContent);
}

console.log(`\n🚀 Iniciando servidor Angular con subdomain: ${subdomain}\n`);
console.log(`📍 URL: http://localhost:4200`);
console.log(`🏢 Subdomain: ${subdomain}`);
console.log(`🔗 API: Enviará header X-Subdomain: ${subdomain}\n`);

// Iniciar el servidor de Angular
const ngServe = spawn('ng', ['serve', '--proxy-config', 'proxy.conf.json'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// Restaurar index.html al cerrar
const cleanup = () => {
  console.log('\n\n🧹 Restaurando index.html...');
  if (fs.existsSync(indexBackupPath)) {
    const backupContent = fs.readFileSync(indexBackupPath, 'utf-8');
    fs.writeFileSync(indexPath, backupContent);
  }
};

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

ngServe.on('close', (code) => {
  cleanup();
  process.exit(code);
});
