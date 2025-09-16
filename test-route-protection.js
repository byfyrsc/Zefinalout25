// Teste de proteção das rotas de billing
const http = require('http');

const testRoutes = [
  '/',
  '/login', 
  '/billing',
  '/billing/success',
  '/billing/cancel',
  '/dashboard'
];

function testRoute(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          contentLength: data.length,
          hasRedirect: res.statusCode >= 300 && res.statusCode < 400,
          location: res.headers.location
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        error: err.message,
        statusCode: 'ERROR'
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        error: 'Timeout',
        statusCode: 'TIMEOUT'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔒 Testando Proteção das Rotas de Billing\n');
  console.log('=' .repeat(60));
  
  for (const route of testRoutes) {
    const result = await testRoute(route);
    
    let status = '❌';
    let description = '';
    
    if (result.error) {
      status = '⚠️';
      description = `Erro: ${result.error}`;
    } else if (result.statusCode === 200) {
      if (route === '/login') {
        status = '✅';
        description = 'Página de login acessível';
      } else if (route.startsWith('/billing')) {
        status = '⚠️';
        description = 'Rota de billing acessível (pode indicar mock ativo)';
      } else {
        status = '✅';
        description = 'Página acessível';
      }
    } else if (result.hasRedirect) {
      status = '🔄';
      description = `Redirecionamento para: ${result.location || 'desconhecido'}`;
    } else {
      status = '❓';
      description = `Status: ${result.statusCode}`;
    }
    
    console.log(`${status} ${route.padEnd(20)} | ${result.statusCode} | ${description}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Interpretação dos Resultados:');
  console.log('✅ = Acesso permitido (esperado para /login)');
  console.log('🔄 = Redirecionamento (esperado para rotas protegidas)');
  console.log('⚠️ = Acesso inesperado (pode indicar problema de segurança)');
  console.log('❌ = Erro de conexão');
}

// Aguardar o servidor inicializar
setTimeout(runTests, 3000);
