import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Inicializa condicionalmente para não quebrar a UI caso as chaves ainda não estejam no .env
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export const fetchHubData = async () => {
  if (!supabase) return null;
  // Neste MVP híbrido, puxaremos o JSONB do BMC/Proposta e as configs
  const { data, error } = await supabase
    .from('hub_content')
    .select('section_key, content')
  
  if (error) {
    console.error("Supabase Error FETCH:", error)
    return null;
  }
  
  // Reconstrói o formato global baseado nos blocks Key-Value da tabela híbrida
  if (data && data.length > 0) {
    const formattedData = {};
    data.forEach(row => {
      formattedData[row.section_key] = row.content;
    });
    return formattedData;
  }
  return null;
};

export const updateHubData = async (payload) => {
  if (!supabase) {
    console.warn("Supabase não inicializado. Verifique .env")
    return { success: false }
  }

  // Fazemos um Upsert das fatias (Home, bmc, proposta, branding, etc)
  try {
    const upserts = Object.keys(payload).map(key => ({
      section_key: key,
      content: payload[key],
      last_updated_by: 'ServLink Editor',
      updated_at: new Date()
    }));

    const { error } = await supabase
      .from('hub_content')
      .upsert(upserts, { onConflict: 'section_key' })

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Falha ao gravar no Supabase", error);
    return { success: false, error };
  }
};
