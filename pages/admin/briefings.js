import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const SUPABASE_REST = 'https://cghtkqyyrskllbbzmzos.supabase.co/rest/v1';

const statusLabel = {
  novo: 'novo',
  contato: 'contato',
  fechado: 'fechado',
  perdido: 'perdido'
};

export default function AdminBriefings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndFetch = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      router.replace('/admin/login');
      return;
    }

    await fetchLeads(session.access_token);
  };

  const fetchLeads = async (accessToken) => {
    setLoading(true);
    try {
      const url = `${SUPABASE_REST}/leads?select=*&order=created_at.desc`;
      const res = await fetch(url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro ao buscar leads');
      }

      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar leads. Verifique login/policies.');
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();

    return leads.filter((l) => {
      const statusOk = filterStatus === 'todos' ? true : l.status === filterStatus;

      const haystack = [
        l.nome_completo,
        l.email,
        l.whatsapp,
        l.empresa,
        l.tipo_projeto,
        l.descricao_curta
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const searchOk = q ? haystack.includes(q) : true;
      return statusOk && searchOk;
    });
  }, [leads, filterStatus, search]);

  const updateStatus = async (leadId, newStatus) => {
    const token = await getToken();
    if (!token) return router.replace('/admin/login');

    try {
      const res = await fetch(`${SUPABASE_REST}/leads?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro ao atualizar status');
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar status.');
    }
  };

  const deleteLead = async (leadId) => {
    const ok = confirm('Tem certeza que deseja apagar este lead? Essa ação não pode ser desfeita.');
    if (!ok) return;

    const token = await getToken();
    if (!token) return router.replace('/admin/login');

    try {
      const res = await fetch(`${SUPABASE_REST}/leads?id=eq.${leadId}`, {
        method: 'DELETE',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: 'return=minimal'
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro ao apagar lead');
      }

      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (expandedId === leadId) setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert('Falha ao apagar lead. Verifique policy de DELETE.');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado!');
    } catch {
      alert('Não consegui copiar.');
    }
  };

  const pillClass = (status) => {
    if (status === 'novo') return 'bg-yellow-500/20 text-yellow-500';
    if (status === 'contato') return 'bg-blue-500/20 text-blue-500';
    if (status === 'fechado') return 'bg-green-500/20 text-green-500';
    return 'bg-red-500/20 text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Leads do <span className="text-yellow-500">Briefing</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {filteredLeads.length} lead(s) • {leads.length} total
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Sair
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            className="w-full md:w-[380px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white"
            placeholder="Buscar por nome, email, whatsapp, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-3">
            <select
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="novo">Novo</option>
              <option value="contato">Contato</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>

            <button
              onClick={() => checkAuthAndFetch()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-3 rounded-lg"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="grid gap-6">
          {filteredLeads.map((lead) => {
            const expanded = expandedId === lead.id;

            return (
              <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{lead.nome_completo}</h2>
                    <div className="text-gray-400 text-sm mt-1 space-y-1">
                      <div className="flex gap-2 items-center">
                        <span>{lead.email}</span>
                        {lead.email && (
                          <button
                            onClick={() => copyToClipboard(lead.email)}
                            className="text-xs text-yellow-500 hover:underline"
                          >
                            copiar
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span>{lead.whatsapp}</span>
                        {lead.whatsapp && (
                          <button
                            onClick={() => copyToClipboard(lead.whatsapp)}
                            className="text-xs text-yellow-500 hover:underline"
                          >
                            copiar
                          </button>
                        )}
                      </div>
                      {lead.empresa && <div>{lead.empresa}</div>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pillClass(lead.status)}`}>
                      {statusLabel[lead.status] || lead.status}
                    </span>

                    <select
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm"
                      value={lead.status || 'novo'}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      title="Mudar status"
                    >
                      <option value="novo">novo</option>
                      <option value="contato">contato</option>
                      <option value="fechado">fechado</option>
                      <option value="perdido">perdido</option>
                    </select>

                    <button
                      onClick={() => toggleExpand(lead.id)}
                      className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                    >
                      {expanded ? 'Fechar' : 'Ver detalhes'}
                    </button>

                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-semibold px-3 py-2 rounded-lg text-sm"
                      title="Apagar lead"
                    >
                      Apagar
                    </button>
                  </div>
                </div>

                {/* Resumo curto */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tipo de Projeto</p>
                      <p className="text-white font-semibold">{lead.tipo_projeto || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Orçamento</p>
                      <p className="text-white font-semibold">{lead.orcamento_estimado || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prazo</p>
                      <p className="text-white font-semibold">{lead.prazo_desejado || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data</p>
                      <p className="text-white font-semibold">
                        {lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-500 text-sm mb-2">Descrição</p>
                    <p className="text-white whitespace-pre-wrap">{lead.descricao_curta || '-'}</p>
                  </div>
                </div>

                {/* Detalhes completos */}
                {expanded && (
                  <div className="mt-5 bg-zinc-950 border border-zinc-900 rounded-lg p-5">
                    <h3 className="text-white font-bold mb-3">Detalhes do briefing</h3>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <Field label="Como conheceu" value={lead.como_conheceu} />
                      <Field label="Referências" value={lead.referencias} />
                      <Field label="Tem domínio" value={lead.tem_dominio} />
                      <Field label="Identidade visual" value={lead.tem_identidade_visual} />
                      <Field label="Precisa painel admin" value={lead.precisa_painel_admin} />
                      <Field label="Precisa autenticação" value={lead.precisa_autenticacao} />
                      <Field label="Precisa mobile" value={lead.precisa_mobile} />
                      <Field label="Conteúdo pronto" value={lead.tem_conteudo_pronto} />
                      <Field label="Manutenção" value={lead.precisa_manutencao} />
                      <Field label="Início desejado" value={lead.inicio_desejado} />
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-500 text-sm mb-2">Problema a resolver</p>
                      <p className="text-white whitespace-pre-wrap">{lead.problema_resolver || '-'}</p>
                    </div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-2">Funcionalidades</p>
                        <div className="flex flex-wrap gap-2">
                          {(lead.funcionalidades || []).length ? (
                            lead.funcionalidades.map((f) => (
                              <span key={f} className="px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-white text-xs">
                                {f}
                              </span>
                            ))
                          ) : (
                            <p className="text-white">-</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm mb-2">Integrações</p>
                        <div className="flex flex-wrap gap-2">
                          {(lead.integracoes || []).length ? (
                            lead.integracoes.map((i) => (
                              <span key={i} className="px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-white text-xs">
                                {i}
                              </span>
                            ))
                          ) : (
                            <p className="text-white">-</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-500 text-sm mb-2">Observações</p>
                      <p className="text-white whitespace-pre-wrap">{lead.observacoes || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="text-gray-400">Nenhum lead encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
      <p className="text-gray-500">{label}</p>
      <p className="text-white font-semibold break-words">{value || '-'}</p>
    </div>
  );
}
