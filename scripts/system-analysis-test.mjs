import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kgpstqohbhmquusacylj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncHN0cW9oYmhtcXV1c2FjeWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDcwMjksImV4cCI6MjA3MzM4MzAyOX0.CIa5r7MfwnutZOmDiaqU_n73rHHGqsHo9Orrc4q1p94';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Key is not defined.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function runAnalysis() {
  console.log('--- Iniciando Análise Funcional do Supabase (Estratégia de Feedback) ---');

  // 1. Buscar uma 'location' existente para usar no feedback
  console.log('\n[1/4] Buscando um local (restaurante) válido...');
  const { data: locationData, error: locationError } = await supabase
    .from('locations')
    .select('id, name')
    .limit(1);

  if (locationError || !locationData || locationData.length === 0) {
    console.error('  [FALHA] Não foi possível buscar um local válido.');
    console.error('  Erro:', locationError?.message || 'Nenhum local encontrado.');
    console.log('\n--- Análise Funcional Concluída com Falha ---');
    return;
  }

  const location = locationData[0];
  console.log(`  [SUCESSO] Usando local: "${location.name}" (ID: ${location.id})`);

  // 2. Teste de Inserção na tabela 'feedbacks'
  const testFeedback = {
    location_id: location.id,
    responses: { "question1": "Good" },
    nps_score: 9,
    channel: 'webapp',
    customer_data: { name: 'Analysis Script' }
  };

  console.log('\n[2/4] Testando inserção de dados na tabela "feedbacks"...');
  const { data: insertData, error: insertError } = await supabase
    .from('feedbacks')
    .insert([testFeedback])
    .select();

  if (insertError) {
    console.error('  [FALHA] Erro ao inserir feedback:', insertError.message);
    if (insertError.code === '42501') {
        console.error('  [DETALHE] O erro "42501" indica uma falha na política de RLS (Row Level Security).');
    }
  } else if (insertData && insertData.length > 0) {
    console.log('  [SUCESSO] Feedback inserido com sucesso.');
  } else {
    console.error('  [FALHA] A inserção não retornou dados ou erro.');
  }

  const insertedId = insertData?.[0]?.id;

  // 3. Teste de Leitura dos dados inseridos
  if (insertedId) {
    console.log(`\n[3/4] Testando leitura do feedback inserido (ID: ${insertedId})...`);
    const { data: selectData, error: selectError } = await supabase
      .from('feedbacks')
      .select('id, channel')
      .eq('id', insertedId);

    if (selectError) {
      console.error('  [FALHA] Erro ao ler feedback:', selectError.message);
    } else if (selectData && selectData.length > 0) {
      console.log('  [SUCESSO] Leitura do feedback confirmada.');
    } else {
      console.error('  [FALHA] Não foi possível encontrar o feedback que acabou de ser inserido.');
    }

    // 4. Limpeza: Deletando o dado de teste
    console.log(`\n[4/4] Realizando limpeza (deletando feedback de teste ID: ${insertedId})...`);
    const { error: deleteError } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', insertedId);

    if (deleteError) {
        console.error('  [FALHA NA LIMPEZA] Erro ao deletar o feedback de teste:', deleteError.message);
        console.error('  [DETALHE] Isso pode ser esperado se a RLS permite inserção anônima, mas não deleção.');
    } else {
        console.log('  [SUCESSO] Feedback de teste deletado.');
    }

  } else {
    console.log('\n[3/4] Leitura e [4/4] Limpeza ignorados pois a inserção falhou.');
  }

  console.log('\n--- Análise Funcional Concluída ---');
}

runAnalysis();