import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Printer, ArrowLeft, ClipboardList } from "lucide-react";
import { toast, Toaster } from "sonner";
import { LISTA_CONSULTORES, LISTA_FECHADORES, LISTA_CAPTADORES } from "@/lib/team";
import { FALLBACK_CONFIG } from "@/lib/vouchers";

export default function Reception() {
  const [formData, setFormData] = useState({
    sala: "SALA PRAIA",
    dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    promotor: "",
    localCaptacao: "",
    tipoCaptacao: "TOUR DIRETO",
    
    nomeTitular: "", idadeTitular: "", profTitular: "", obsTitular: "",
    nomeConjuge: "", idadeConjuge: "", profConjuge: "", obsConjuge: "",
    relacionamento: "CASADOS", tempoRelacionamento: "", filhosQtd: "",
    cidade: "", estado: "", celular: "", email: "",
    nomesFilhos: "", acompanhantes: "",
    
    carro1: "", ano1: "", carro2: "", ano2: "",
    renda: "", cartao: "Sim", casaPropria: "Sim", imovelCidade: "Não",
    
    destinos: "", viagemSonhos: "", assistiu: "Não", hotel: "",
    
    consultor: "", fechador: "", pep: "", brinde: "", obsComercial: ""
  });

  // Atualiza a hora sempre que a página é aberta
  useEffect(() => {
    setFormData(prev => ({ ...prev, dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) }));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePrint = () => {
    if (!formData.nomeTitular) {
      toast.error("Preencha pelo menos o nome do Titular antes de imprimir!");
      return;
    }
    window.print();
  };

  // Componente interno para simplificar as células da Tabela A4
  const Td = ({ label, value, colSpan = 1 }: { label: string; value: string; colSpan?: number }) => (
    <td colSpan={colSpan} style={{ border: '1px solid #0f172a', padding: '6px 8px', verticalAlign: 'top' }}>
      <span style={{ fontSize: '9px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#0f172a', textTransform: 'uppercase', minHeight: '16px', display: 'block', fontWeight: 700 }}>{value}</span>
    </td>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <tr>
      <td colSpan={6} style={{ background: '#f1f5f9', border: '1px solid #0f172a', padding: '4px', textAlign: 'center', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </td>
    </tr>
  );

  return (
    <div className="app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <Toaster richColors />
      
      {/* LADO ESQUERDO: Formulário (Oculto na impressão) */}
      <div className="no-print" style={{ width: '450px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Cabeçalho do Formulário */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fff', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <img src="/brand/five-logo.webp" alt="FIVE" style={{ height: '24px' }} />
            <Link to="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><ArrowLeft size={14} /> Voltar</Link>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Ficha de Recepção</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Preencha os dados e imprima para assinatura.</p>
        </div>

        {/* Corpo do Formulário (Rolável) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Bloco 1: Captação */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>1. Captação</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Promotor de Marketing</label>
                  <select value={formData.promotor} onChange={handleChange("promotor")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Selecione...</option>
                    {LISTA_CAPTADORES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Local (Ex: Orla)</label>
                    <input type="text" value={formData.localCaptacao} onChange={handleChange("localCaptacao")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Tipo</label>
                    <select value={formData.tipoCaptacao} onChange={handleChange("tipoCaptacao")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="TOUR DIRETO">Tour Direto</option>
                      <option value="AGENDAMENTO">Agendamento</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 2: Casal */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>2. Dados do Casal</h3>
              
              {/* Titular */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 3 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Titular</label><input type="text" value={formData.nomeTitular} onChange={handleChange("nomeTitular")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Idade</label><input type="text" value={formData.idadeTitular} onChange={handleChange("idadeTitular")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Profissão</label><input type="text" value={formData.profTitular} onChange={handleChange("profTitular")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Obs.</label><input type="text" value={formData.obsTitular} onChange={handleChange("obsTitular")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                </div>
              </div>
              
              <hr style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

              {/* Conjuge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 3 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Cônjuge</label><input type="text" value={formData.nomeConjuge} onChange={handleChange("nomeConjuge")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Idade</label><input type="text" value={formData.idadeConjuge} onChange={handleChange("idadeConjuge")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Profissão</label><input type="text" value={formData.profConjuge} onChange={handleChange("profConjuge")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Obs.</label><input type="text" value={formData.obsConjuge} onChange={handleChange("obsConjuge")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Relacionamento</label>
                  <select value={formData.relacionamento} onChange={handleChange("relacionamento")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="CASADOS">Casados</option><option value="NAMORADOS">Namorados</option><option value="NOIVOS">Noivos</option><option value="UNIÃO ESTÁVEL">União Estável</option><option value="SOLTEIROS">Solteiros</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Tempo juntos</label><input type="text" value={formData.tempoRelacionamento} onChange={handleChange("tempoRelacionamento")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Nº Filhos</label><input type="text" value={formData.filhosQtd} onChange={handleChange("filhosQtd")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>

              {/* Endereço & Contato */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Cidade</label><input type="text" value={formData.cidade} onChange={handleChange("cidade")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Estado</label><input type="text" value={formData.estado} onChange={handleChange("estado")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Celular</label><input type="text" value={formData.celular} onChange={handleChange("celular")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>E-mail</label><input type="text" value={formData.email} onChange={handleChange("email")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Nomes dos Filhos</label><input type="text" value={formData.nomesFilhos} onChange={handleChange("nomesFilhos")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Acompanhantes</label><input type="text" value={formData.acompanhantes} onChange={handleChange("acompanhantes")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
            </div>

            {/* Bloco 3: Socioeconômico */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>3. Socioeconômico</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Carro 1</label><input type="text" value={formData.carro1} onChange={handleChange("carro1")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Ano</label><input type="text" value={formData.ano1} onChange={handleChange("ano1")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Carro 2</label><input type="text" value={formData.carro2} onChange={handleChange("carro2")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Ano</label><input type="text" value={formData.ano2} onChange={handleChange("ano2")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Renda (R$)</label><input type="text" value={formData.renda} onChange={handleChange("renda")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Usa Cartão Crédito?</label>
                  <select value={formData.cartao} onChange={handleChange("cartao")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}><option>Sim</option><option>Não</option></select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Casa Própria?</label>
                  <select value={formData.casaPropria} onChange={handleChange("casaPropria")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}><option>Sim</option><option>Não</option></select>
                </div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Imóvel na cidade?</label>
                  <select value={formData.imovelCidade} onChange={handleChange("imovelCidade")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}><option>Sim</option><option>Não</option></select>
                </div>
              </div>
            </div>

            {/* Bloco 4: Pesquisa */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>4. Pesquisa de Viagens</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Últimos 3 destinos</label><input type="text" value={formData.destinos} onChange={handleChange("destinos")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Viagem dos sonhos</label><input type="text" value={formData.viagemSonhos} onChange={handleChange("viagemSonhos")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Assistiu apresentação?</label>
                  <select value={formData.assistiu} onChange={handleChange("assistiu")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}><option>Sim</option><option>Não</option></select>
                </div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Hotel hospedado</label><input type="text" value={formData.hotel} onChange={handleChange("hotel")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} /></div>
              </div>
            </div>

            {/* Bloco 5: Equipe & Brindes */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>5. Equipe Comercial</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Consultor</label>
                  <select value={formData.consultor} onChange={handleChange("consultor")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Selecione...</option>{LISTA_CONSULTORES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Fechador (T.O.)</label>
                    <select value={formData.fechador} onChange={handleChange("fechador")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="">Selecione...</option>{LISTA_FECHADORES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>PEP</label>
                    <select value={formData.pep} onChange={handleChange("pep")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="">Selecione...</option>{LISTA_CAPTADORES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Brinde Escolhido</label>
                    <select value={formData.brinde} onChange={handleChange("brinde")} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="">Nenhum</option>
                      {FALLBACK_CONFIG.gift_options.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé com botão de Imprimir */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button onClick={handlePrint} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Printer size={18} /> Imprimir Ficha (A4)
          </button>
        </div>
      </div>

      {/* LADO DIREITO: Pré-visualização A4 */}
      <div className="preview-container" style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#e2e8f0' }}>
        <div className="a4-sheet" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .no-print { display: none !important; }
              .app-shell { background: white !important; height: auto !important; overflow: visible !important; }
              .preview-container { padding: 0 !important; background: white !important; overflow: visible !important; display: block !important; }
              .a4-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
              .a4-sheet * { visibility: visible; color: #000 !important; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          `}</style>

          {/* Cabeçalho A4 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
            {/* O filtro CSS transforma o logótipo azul num tom de cinza elegante e profissional */}
            <img src="/brand/five-logo.webp" alt="FIVE" style={{ height: '45px', filter: 'grayscale(100%) contrast(1.2) brightness(0.8)' }} />
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ficha de Qualificação</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569', fontWeight: 600 }}>USO INTERNO - RECEPÇÃO</p>
            </div>
          </div>

          {/* Grelha Matemática de 6 Colunas */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '2px solid #0f172a' }}>
            <tbody>
              <tr><Td label="Sala de Vendas" value={formData.sala} colSpan={3} /><Td label="Data e Hora" value={formData.dataHora} colSpan={3} /></tr>
              <tr><Td label="Promotor de Marketing" value={formData.promotor} colSpan={6} /></tr>
              <tr><Td label="Local de Captação" value={formData.localCaptacao} colSpan={3} /><Td label="Tipo de Captação" value={formData.tipoCaptacao} colSpan={3} /></tr>
              
              <SectionHeader title="Dados Pessoais" />
              <tr><Td label="Nome (Titular)" value={formData.nomeTitular} colSpan={5} /><Td label="Idade" value={formData.idadeTitular} colSpan={1} /></tr>
              <tr><Td label="Profissão" value={formData.profTitular} colSpan={3} /><Td label="Observação" value={formData.obsTitular} colSpan={3} /></tr>
              
              <tr><Td label="Cônjuge" value={formData.nomeConjuge} colSpan={5} /><Td label="Idade" value={formData.idadeConjuge} colSpan={1} /></tr>
              <tr><Td label="Profissão" value={formData.profConjuge} colSpan={3} /><Td label="Observação" value={formData.obsConjuge} colSpan={3} /></tr>
              
              <tr><Td label="Relacionamento" value={formData.relacionamento} colSpan={2} /><Td label="Tempo Juntos" value={formData.tempoRelacionamento} colSpan={2} /><Td label="Nº Filhos" value={formData.filhosQtd} colSpan={2} /></tr>
              <tr><Td label="Cidade" value={formData.cidade} colSpan={4} /><Td label="Estado" value={formData.estado} colSpan={2} /></tr>
              <tr><Td label="Telefone Celular" value={formData.celular} colSpan={3} /><Td label="E-mail" value={formData.email} colSpan={3} /></tr>
              <tr><Td label="Nomes dos Filhos" value={formData.nomesFilhos} colSpan={3} /><Td label="Acompanhantes" value={formData.acompanhantes} colSpan={3} /></tr>
              
              <SectionHeader title="Dados Socioeconômicos" />
              <tr><Td label="Carro 1" value={formData.carro1} colSpan={2} /><Td label="Ano" value={formData.ano1} colSpan={1} /><Td label="Carro 2" value={formData.carro2} colSpan={2} /><Td label="Ano" value={formData.ano2} colSpan={1} /></tr>
              <tr><Td label="Renda Familiar" value={formData.renda ? `R$ ${formData.renda}` : ''} colSpan={3} /><Td label="Trabalha com Cartão de Crédito?" value={formData.cartao} colSpan={3} /></tr>
              <tr><Td label="Possui Casa Própria?" value={formData.casaPropria} colSpan={3} /><Td label="Possui Imóvel na Cidade?" value={formData.imovelCidade} colSpan={3} /></tr>
              
              <SectionHeader title="Pesquisa Rápida" />
              <tr><Td label="Os 3 últimos destinos de Férias" value={formData.destinos} colSpan={3} /><Td label="Viagem dos Sonhos" value={formData.viagemSonhos} colSpan={3} /></tr>
              <tr><Td label="Já assistiu alguma apresentação voltada a férias?" value={formData.assistiu} colSpan={3} /><Td label="Hotel de Hospedagem" value={formData.hotel} colSpan={3} /></tr>
              
              <SectionHeader title="Equipe Comercial e Brindes" />
              <tr><Td label="Consultor" value={formData.consultor} colSpan={2} /><Td label="Fechador" value={formData.fechador} colSpan={2} /><Td label="PEP" value={formData.pep} colSpan={2} /></tr>
              <tr><Td label="Brinde Escolhido" value={formData.brinde} colSpan={3} /><Td label="Observações Comerciais" value={formData.obsComercial} colSpan={3} /></tr>
            </tbody>
          </table>

          {/* Termo de Ciência e Assinatura */}
          <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #0f172a', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Termo de Ciência</p>
            <p style={{ margin: '0 0 40px 0', fontSize: '11px', lineHeight: '1.5', textAlign: 'justify', color: '#334155' }}>
              Declaro ter ciência de que a apresentação possui duração mínima de 30 minutos, a contar da chegada do consultor, e que a liberação da cortesia está vinculada a este tempo.
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Estando ciente assina:</span>
              <div style={{ flex: 1, borderBottom: '1px solid #0f172a' }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
