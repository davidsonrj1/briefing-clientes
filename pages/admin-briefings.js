import { useEffect, useState } from 'react';

export default function AdminBriefings() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        'https://cghtkqyyrskllbbzmzos.supabase.co/rest/v1/leads?select=*&order=created_at.desc',
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        }
      );
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Leads do <span className="text-yellow-500">Briefing</span>
        </h1>

        <div className="grid gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{lead.nome_completo}</h2>
                  <p className="text-gray-400">{lead.email}</p>
                  <p className="text-gray-400">{lead.whatsapp}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  lead.status === 'novo' ? 'bg-yellow-500/20 text-yellow-500' :
                  lead.status === 'contato' ? 'bg-blue-500/20 text-blue-500' :
                  lead.status === 'fechado' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {lead.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tipo de Projeto</p>
                  <p className="text-white font-semibold">{lead.tipo_projeto}</p>
                </div>
                <div>
                  <p className="text-gray-500">Orçamento</p>
                  <p className="text-white font-semibold">{lead.orcamento_estimado}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prazo</p>
                  <p className="text-white font-semibold">{lead.prazo_desejado}</p>
                </div>
                <div>
                  <p className="text-gray-500">Data</p>
                  <p className="text-white font-semibold">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-gray-500 text-sm mb-2">Descrição</p>
                <p className="text-white">{lead.descricao_curta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}