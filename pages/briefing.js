import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Loader2, User, Briefcase, Settings, Clock, CheckCircle, Sparkles } from 'lucide-react';

const BriefingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    empresa: '',
    comoConheceu: '',
    tipoProjeto: '',
    descricaoCurta: '',
    problemaResolver: '',
    referencias: '',
    temDominio: '',
    temIdentidadeVisual: '',
    funcionalidades: [],
    precisaPainelAdmin: '',
    precisaAutenticacao: '',
    integracoes: [],
    precisaMobile: '',
    temConteudoPronto: '',
    precisaManutencao: '',
    prazoDesejado: '',
    orcamentoEstimado: '',
    inicioDesejado: '',
    observacoes: ''
  });

  const totalSteps = 5;

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.nomeCompleto && formData.email && formData.whatsapp;
      case 2:
        return formData.tipoProjeto && formData.descricaoCurta && formData.problemaResolver;
      case 3:
        return formData.funcionalidades.length > 0;
      case 4:
        return formData.prazoDesejado && formData.orcamentoEstimado;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const dadosParaSupabase = {
        nome_completo: formData.nomeCompleto || '',
        email: formData.email || '',
        whatsapp: formData.whatsapp || '',
        tipo_projeto: formData.tipoProjeto || '',
        descricao_curta: formData.descricaoCurta || '',
        problema_resolver: formData.problemaResolver || '',
        prazo_desejado: formData.prazoDesejado || '',
        orcamento_estimado: formData.orcamentoEstimado || '',
        empresa: formData.empresa || null,
        como_conheceu: formData.comoConheceu || null,
        referencias: formData.referencias || null,
        tem_dominio: formData.temDominio || null,
        tem_identidade_visual: formData.temIdentidadeVisual || null,
        funcionalidades: formData.funcionalidades ?? [],
        integracoes: formData.integracoes ?? [],
        precisa_painel_admin: formData.precisaPainelAdmin || null,
        precisa_autenticacao: formData.precisaAutenticacao || null,
        precisa_mobile: formData.precisaMobile || null,
        tem_conteudo_pronto: formData.temConteudoPronto || null,
        precisa_manutencao: formData.precisaManutencao || null,
        inicio_desejado: formData.inicioDesejado || null,
        observacoes: formData.observacoes || null,
        status: 'novo'
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            Prefer: 'return=minimal'
          },
          body: JSON.stringify(dadosParaSupabase)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao enviar formulário');
      }

      setSubmitSuccess(true);
      
      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK) {
        try {
          await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              nome: formData.nomeCompleto,
              email: formData.email,
              whatsapp: formData.whatsapp,
              tipoProjeto: formData.tipoProjeto,
              orcamento: formData.orcamentoEstimado
            })
          });
        } catch (webhookError) {
          console.error('Erro no webhook (não crítico):', webhookError);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(`Erro ao enviar o formulário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIcons = {
    1: User,
    2: Briefcase,
    3: Settings,
    4: Clock,
    5: CheckCircle
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <User className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">Sobre você</h2>
              </div>
              <p className="text-gray-400 text-lg">Vamos começar conhecendo você melhor</p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Nome completo <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => updateFormData('nomeCompleto', e.target.value)}
                  className="premium-input"
                  placeholder="Seu nome completo"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Email <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="premium-input"
                  placeholder="seu@email.com"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                WhatsApp <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateFormData('whatsapp', e.target.value)}
                  className="premium-input"
                  placeholder="(21) 99999-9999"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Empresa <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => updateFormData('empresa', e.target.value)}
                  className="premium-input"
                  placeholder="Nome da sua empresa"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Como conheceu meu trabalho?
              </label>
              <div className="relative group">
                <select
                  value={formData.comoConheceu}
                  onChange={(e) => updateFormData('comoConheceu', e.target.value)}
                  className="premium-select"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicacao">Indicação</option>
                  <option value="google">Google</option>
                  <option value="portfolio">Portfólio</option>
                  <option value="outro">Outro</option>
                </select>
                <div className="input-glow"></div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">Sobre o projeto</h2>
              </div>
              <p className="text-gray-400 text-lg">Conte-me mais sobre o que você precisa</p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Tipo de projeto <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <select
                  value={formData.tipoProjeto}
                  onChange={(e) => updateFormData('tipoProjeto', e.target.value)}
                  className="premium-select"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="landing-page">Landing Page</option>
                  <option value="site-institucional">Site Institucional</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="sistema-web">Sistema Web</option>
                  <option value="automacao">Automação</option>
                  <option value="integracao-ia">Integração com IA</option>
                  <option value="app-mobile">App Mobile</option>
                  <option value="outro">Outro</option>
                </select>
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Descreva seu projeto em poucas palavras <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <textarea
                  value={formData.descricaoCurta}
                  onChange={(e) => updateFormData('descricaoCurta', e.target.value)}
                  rows={3}
                  className="premium-textarea"
                  placeholder="Ex: Preciso de uma landing page para captar leads do meu novo produto..."
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Qual problema você quer resolver? <span className="text-yellow-500">*</span>
              </label>
              <div className="relative group">
                <textarea
                  value={formData.problemaResolver}
                  onChange={(e) => updateFormData('problemaResolver', e.target.value)}
                  rows={3}
                  className="premium-textarea"
                  placeholder="Ex: Minha empresa não tem presença digital e estou perdendo clientes..."
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Você tem referências ou exemplos?
              </label>
              <div className="relative group">
                <textarea
                  value={formData.referencias}
                  onChange={(e) => updateFormData('referencias', e.target.value)}
                  rows={2}
                  className="premium-textarea"
                  placeholder="Cole aqui links de sites, designs ou exemplos que você gosta"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Já tem domínio e hospedagem?
                </label>
                <div className="relative group">
                  <select
                    value={formData.temDominio}
                    onChange={(e) => updateFormData('temDominio', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim, já tenho</option>
                    <option value="nao">Não, preciso contratar</option>
                    <option value="nao-sei">Não sei o que é isso</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Já tem identidade visual?
                </label>
                <div className="relative group">
                  <select
                    value={formData.temIdentidadeVisual}
                    onChange={(e) => updateFormData('temIdentidadeVisual', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim-completo">Sim, tenho completo</option>
                    <option value="sim-parcial">Sim, mas é parcial</option>
                    <option value="nao">Não, preciso criar</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <Settings className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">Escopo & Funcionalidades</h2>
              </div>
              <p className="text-gray-400 text-lg">O que seu projeto precisa ter?</p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                Principais funcionalidades <span className="text-yellow-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Formulário de contato',
                  'Chat / WhatsApp',
                  'Blog / Notícias',
                  'Galeria de imagens',
                  'Área de membros',
                  'Sistema de pagamento',
                  'Agendamento online',
                  'Integração com redes sociais',
                  'Dashboard / Relatórios',
                  'API / Integrações externas',
                  'Multi-idioma',
                  'Sistema de busca'
                ].map((func) => (
                  <label key={func} className="premium-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.funcionalidades.includes(func)}
                      onChange={() => handleCheckboxChange('funcionalidades', func)}
                      className="premium-checkbox"
                    />
                    <span className="premium-checkbox-custom">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="premium-checkbox-text">{func}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Precisa de painel admin?
                </label>
                <div className="relative group">
                  <select
                    value={formData.precisaPainelAdmin}
                    onChange={(e) => updateFormData('precisaPainelAdmin', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                    <option value="nao-sei">Não sei</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Precisa de login de usuários?
                </label>
                <div className="relative group">
                  <select
                    value={formData.precisaAutenticacao}
                    onChange={(e) => updateFormData('precisaAutenticacao', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                    <option value="nao-sei">Não sei</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                Integrações necessárias
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Gateway de pagamento (Stripe, Mercado Pago)',
                  'Email marketing (Mailchimp, SendGrid)',
                  'CRM (HubSpot, Salesforce)',
                  'Google Analytics',
                  'Facebook Pixel',
                  'Zapier / Make / n8n',
                  'APIs customizadas',
                  'Nenhuma'
                ].map((integ) => (
                  <label key={integ} className="premium-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.integracoes.includes(integ)}
                      onChange={() => handleCheckboxChange('integracoes', integ)}
                      className="premium-checkbox"
                    />
                    <span className="premium-checkbox-custom">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="premium-checkbox-text">{integ}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Versão mobile?
                </label>
                <div className="relative group">
                  <select
                    value={formData.precisaMobile}
                    onChange={(e) => updateFormData('precisaMobile', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim, app nativo</option>
                    <option value="responsivo">Site responsivo</option>
                    <option value="nao">Não</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Conteúdo pronto?
                </label>
                <div className="relative group">
                  <select
                    value={formData.temConteudoPronto}
                    onChange={(e) => updateFormData('temConteudoPronto', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim, tenho tudo</option>
                    <option value="parcial">Tenho parte</option>
                    <option value="nao">Preciso de ajuda</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Manutenção?
                </label>
                <div className="relative group">
                  <select
                    value={formData.precisaManutencao}
                    onChange={(e) => updateFormData('precisaManutencao', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim, contínua</option>
                    <option value="pontual">Pontual</option>
                    <option value="nao">Não</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">Prazos & Orçamento</h2>
              </div>
              <p className="text-gray-400 text-lg">Quando e quanto você está pensando?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Prazo desejado <span className="text-yellow-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    value={formData.prazoDesejado}
                    onChange={(e) => updateFormData('prazoDesejado', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="urgente">Urgente (até 2 semanas)</option>
                    <option value="1-mes">1 mês</option>
                    <option value="2-3-meses">2-3 meses</option>
                    <option value="flexivel">Flexível</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Orçamento estimado <span className="text-yellow-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    value={formData.orcamentoEstimado}
                    onChange={(e) => updateFormData('orcamentoEstimado', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">Selecione</option>
                    <option value="ate-2k">Até R$ 2.000</option>
                    <option value="2k-5k">R$ 2.000 - R$ 5.000</option>
                    <option value="5k-10k">R$ 5.000 - R$ 10.000</option>
                    <option value="10k-20k">R$ 10.000 - R$ 20.000</option>
                    <option value="20k+">Acima de R$ 20.000</option>
                    <option value="nao-sei">Não sei estimar</option>
                  </select>
                  <div className="input-glow"></div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Quando pretende iniciar?
              </label>
              <div className="relative group">
                <select
                  value={formData.inicioDesejado}
                  onChange={(e) => updateFormData('inicioDesejado', e.target.value)}
                  className="premium-select"
                >
                  <option value="">Selecione</option>
                  <option value="imediato">Imediatamente</option>
                  <option value="semana">Próxima semana</option>
                  <option value="mes">Próximo mês</option>
                  <option value="trimestre">Próximo trimestre</option>
                  <option value="indefinido">Ainda não sei</option>
                </select>
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Alguma observação adicional?
              </label>
              <div className="relative group">
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => updateFormData('observacoes', e.target.value)}
                  rows={4}
                  className="premium-textarea"
                  placeholder="Informações extras, dúvidas ou requisitos específicos..."
                />
                <div className="input-glow"></div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">Confirmação</h2>
              </div>
              <p className="text-gray-400 text-lg">Revise suas informações antes de enviar</p>
            </div>

            <div className="space-y-4">
              <div className="premium-summary-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h3 className="text-yellow-500 font-bold text-lg">Informações Pessoais</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-500">Nome:</span> <span className="text-white font-medium">{formData.nomeCompleto}</span></p>
                  <p className="text-gray-300"><span className="text-gray-500">Email:</span> <span className="text-white font-medium">{formData.email}</span></p>
                  <p className="text-gray-300"><span className="text-gray-500">WhatsApp:</span> <span className="text-white font-medium">{formData.whatsapp}</span></p>
                  {formData.empresa && <p className="text-gray-300"><span className="text-gray-500">Empresa:</span> <span className="text-white font-medium">{formData.empresa}</span></p>}
                </div>
              </div>

              <div className="premium-summary-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h3 className="text-yellow-500 font-bold text-lg">Sobre o Projeto</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-500">Tipo:</span> <span className="text-white font-medium">{formData.tipoProjeto}</span></p>
                  <p className="text-gray-300"><span className="text-gray-500">Descrição:</span> <span className="text-white font-medium">{formData.descricaoCurta}</span></p>
                </div>
              </div>

              <div className="premium-summary-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h3 className="text-yellow-500 font-bold text-lg">Funcionalidades</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.funcionalidades.length > 0 ? (
                    formData.funcionalidades.map((func) => (
                      <span key={func} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-500 font-medium">
                        {func}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Nenhuma selecionada</span>
                  )}
                </div>
              </div>

              <div className="premium-summary-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h3 className="text-yellow-500 font-bold text-lg">Prazos & Orçamento</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-500">Prazo:</span> <span className="text-white font-medium">{formData.prazoDesejado}</span></p>
                  <p className="text-gray-300"><span className="text-gray-500">Orçamento:</span> <span className="text-white font-medium">{formData.orcamentoEstimado}</span></p>
                </div>
              </div>
            </div>

            {submitSuccess ? (
              <div className="premium-success-card">
                <div className="premium-success-icon">
                  <Check className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Briefing enviado com sucesso!</h3>
                <p className="text-gray-300 mb-4">
                  Recebi suas informações e vou analisar seu projeto com atenção.
                </p>
                <p className="text-yellow-500 font-semibold">
                  Entrarei em contato em breve via WhatsApp!
                </p>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="premium-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enviar Briefing
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl animate-pulse-slower"></div>
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)'
      }}></div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-sm font-semibold">Briefing Premium</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Briefing de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Projeto</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Preencha as informações abaixo para que eu possa entender melhor seu projeto e preparar uma proposta adequada.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-400">Etapa {currentStep} de {totalSteps}</span>
              <span className="text-sm font-semibold text-yellow-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden backdrop-blur-sm border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-700 ease-out relative"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Steps indicators */}
            <div className="flex justify-between mt-8">
              {[
                { label: 'Sobre você', icon: User },
                { label: 'Projeto', icon: Briefcase },
                { label: 'Escopo', icon: Settings },
                { label: 'Prazos', icon: Clock },
                { label: 'Confirmar', icon: CheckCircle }
              ].map((step, index) => {
                const StepIcon = step.icon;
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <div key={step.label} className="flex flex-col items-center">
                    <div className={`premium-step-indicator ${
                      isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-3 font-medium hidden sm:block transition-colors ${
                      isCurrent ? 'text-yellow-500' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="premium-form-container mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="premium-button-secondary"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>
              )}
              <button
                onClick={nextStep}
                className="premium-button-primary"
              >
                Próximo
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Suas informações estão seguras e serão usadas apenas para análise do projeto
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefingForm;