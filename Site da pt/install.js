const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Instalando dependências...\n');

try {
  execSync('npm install express cors', {
    cwd: path.resolve(__dirname),
    stdio: 'inherit'
  });
  
  console.log('\n✅ Instalação concluída!');
  console.log('\n📝 Para iniciar o servidor, executa:\n');
  console.log('   npm start\n');
} catch (error) {
  console.error('❌ Erro na instalação:', error.message);
  process.exit(1);
}
