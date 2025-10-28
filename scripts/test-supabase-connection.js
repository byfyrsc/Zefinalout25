// Script para testar a conexão com o Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter as variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não encontradas.');
  console.error('Verifique se o arquivo .env contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Função para testar a conexão
async function testConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Testar autenticação anônima
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro ao verificar sessão de autenticação:', authError);
    } else {
      console.log('Conexão com autenticação estabelecida com sucesso!');
      console.log('Sessão atual:', authData.session ? 'Ativa' : 'Nenhuma');
    }
    
    // Testar acesso ao banco de dados
    console.log('\nTestando acesso ao banco de dados...');
    
    // Tentar acessar a tabela de tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);
    
    if (tenantsError) {
      console.error('Erro ao acessar tabela de tenants:', tenantsError);
      
      if (tenantsError.code === '42P01') {
        console.error('A tabela "tenants" não existe. Verifique se o esquema do banco de dados está correto.');
      } else if (tenantsError.code === 'PGRST116') {
        console.error('Erro de permissão. Verifique as políticas RLS no Supabase.');
      }
    } else {
      console.log('Acesso ao banco de dados bem-sucedido!');
      console.log(`Tenants encontrados: ${tenants.length}`);
      if (tenants.length > 0) {
        console.log('Exemplo de tenant:', tenants[0]);
      }
    }
    
    // Verificar se há problemas com CORS
    console.log('\nVerificando configuração de CORS...');
    console.log('Nota: Problemas de CORS só podem ser completamente verificados em um navegador.');
    console.log('Verifique se o domínio da sua aplicação está na lista de origens permitidas no Supabase.');
    
  } catch (error) {
    console.error('Erro inesperado ao testar conexão:', error);
  }
}

// Executar o teste
testConnection()
  .then(() => {
    console.log('\nTeste de conexão concluído.');
  })
  .catch(error => {
    console.error('Erro fatal durante o teste:', error);
  });