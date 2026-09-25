import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Eye, FileCheck2, Gift, LayoutTemplate, LogOut, Printer, History, Ticket } from "lucide-react";
import { toast, Toaster } from "sonner";

import GiftFormPanel from "@/components/GiftFormPanel";
import VoucherPreview from "@/components/VoucherPreview";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/auth";
import { endSession } from "@/lib/session";
import { createVoucherCode, FALLBACK_CONFIG, fetchVoucherConfig } from "@/lib/vouchers";

async function waitForPrintAssets() {
  await document.fonts.ready;
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("#print-voucher-area img"));
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }
    if (image.decode) await image.decode().catch(() => undefined);
  }));
  if (images.some((image) => image.naturalWidth === 0)) throw new Error("Voucher background failed to load");
}

export default function Home() {
  const userQuery = useQuery({ queryKey: ["auth", "me"], queryFn: fetchCurrentUser, retry: false });
  const configQuery = useQuery({ queryKey: ["voucher-config"], queryFn: fetchVoucherConfig, retry: false });
  const config = configQuery.data ?? FALLBACK_CONFIG;
  const [selectedGiftId, setSelectedGiftId] = useState(FALLBACK_CONFIG.gift_options[0].id);
  const [winnerName, setWinnerName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [observation, setObservation] = useState("");
  const [costType, setCostType] = useState<"com-custo" | "sem-custo">("com-custo");
  const [stayDays, setStayDays] = useState<3 | 6>(3);
  const [voucherCode, setVoucherCode] = useState("");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");

  // Novo: Controlo de abas para o Administrador
  const isAdmin = userQuery.data?.role === "admin";
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");

  // Novo: Busca dos dados do Histórico
  const historyQuery = useQuery({
    queryKey: ["voucher-history"],
    queryFn: async () => {
      const res = await fetch("/api/vouchers/history");
      if (!res.ok) throw new Error("Erro ao buscar histórico");
      return res.json();
    },
    enabled: activeTab === "history" && isAdmin,
  });

  const selectedGift = config.gift_options.find((gift) => gift.id === selectedGiftId) ?? config.gift_options[0];
  const codeMutation = useMutation({ mutationFn: createVoucherCode });

  useEffect(() => {
    if (!configQuery.data) return;
    setIssueDate((current) => current || configQuery.data.today);
  }, [configQuery.data]);

  const handleGiftChange = (value: string) => {
    setSelectedGiftId(value);
    setVoucherCode("");
  };

  const isPrintReady = winnerName.trim().length >= 3 && Boolean(issueDate);
  const summary = useMemo(() => winnerName.trim() ? `Preparado para ${winnerName.trim()}` : "Preencha os dados para personalizar", [winnerName]);

  const handlePrint = async () => {
    if (!isPrintReady) {
      toast.error("Preencha o nome e a data de emissão antes de imprimir.");
      setMobileView("form");
      return;
    }
    let code = voucherCode;
    if (!code) {
      try {
        const created = await codeMutation.mutateAsync({
          gift_id: selectedGift.id,
          winner_name: winnerName,
          issue_date: issueDate,
          observation,
          stay_days: selectedGift.id === "diarias-captacao-3" ? stayDays : null,
          cost_type: selectedGift.id === "diarias-captacao-3" ? costType : null,
        });
        code = created.code;
        setVoucherCode(code);
        toast.success(`Código ${code} registrado.`);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      } catch {
        toast.error("Não foi possível gerar o código único. Tente novamente.");
        return;
      }
    }
    try {
      await waitForPrintAssets();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
    } catch {
      toast.error("O fundo do brinde ainda não carregou. Aguarde e tente imprimir novamente.");
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p" && activeTab === "generator") {
        event.preventDefault();
        void handlePrint();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  if (userQuery.isLoading) {
    return <main className="auth-loading" data-testid="auth-loading"><Gift size={24} /><span>Preparando a central de vouchers...</span></main>;
  }
  if (!userQuery.data) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell" data-testid="app-shell">
      <Toaster richColors />
      <header className="topbar no-print" data-testid="app-header">
        <div className="brand-lockup" data-testid="brand-lockup"><img src="/brand/five-logo.webp" alt="Símbolo da FIVE" data-testid="header-brand-logo" /><div><strong>FIVE</strong><small>Intermediadora de Vendas</small></div></div>
        
        <div className="user-actions" data-testid="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Seletor exclusivo para Administrador */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '5px', borderRadius: '8px' }}>
              <button type="button" onClick={() => setActiveTab("generator")} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: activeTab === "generator" ? 600 : 500, background: activeTab === "generator" ? '#fff' : 'transparent', color: activeTab === "generator" ? '#0f172a' : '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: activeTab === "generator" ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}><Ticket size={16} /> Emitir</button>
              <button type="button" onClick={() => setActiveTab("history")} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: activeTab === "history" ? 600 : 500, background: activeTab === "history" ? '#fff' : 'transparent', color: activeTab === "history" ? '#0f172a' : '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: activeTab === "history" ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}><History size={16} /> Histórico</button>
            </div>
          )}
          <div className="user-badge" data-testid="current-user"><span>{userQuery.data.name.charAt(0)}</span><div><strong>{userQuery.data.name}</strong><small>{userQuery.data.email}</small></div></div>
          <Button variant="ghost" size="icon" onClick={() => endSession()} aria-label="Sair" data-testid="logout-button"><LogOut size={17} /></Button>
        </div>
      </header>

      <main className="workspace" data-testid="voucher-workspace">
        {activeTab === "generator" ? (
          <>
            <section className="page-intro no-print" data-testid="page-intro">
              <div><p className="section-kicker" data-testid="page-kicker">Emissão oficial</p><h1 data-testid="page-title">Gerador de vouchers</h1><p data-testid="page-description">Selecione um modelo, personalize os dados e imprima em A4.</p></div>
              <div className="source-status" data-testid="source-status"><FileCheck2 size={18} /><div><strong>5 modelos originais</strong><span>Fundos gerados diretamente dos PDFs enviados</span></div></div>
            </section>

            <div className="mobile-switcher no-print" data-testid="mobile-view-switcher">
              <button type="button" className={mobileView === "form" ? "active" : ""} onClick={() => setMobileView("form")} data-testid="mobile-form-tab"><LayoutTemplate size={15} /> Preencher</button>
              <button type="button" className={mobileView === "preview" ? "active" : ""} onClick={() => setMobileView("preview")} data-testid="mobile-preview-tab"><Eye size={15} /> Prévia</button>
            </div>

            <div className="builder-grid" data-testid="voucher-builder">
              <div className={`form-column ${mobileView === "preview" ? "mobile-hidden" : ""}`} data-testid="form-column">
                <GiftFormPanel
                  gifts={config.gift_options}
                  selectedGiftId={selectedGift.id}
                  onGiftChange={handleGiftChange}
                  winnerName={winnerName}
                  onWinnerNameChange={(value) => { setWinnerName(value); setVoucherCode(""); }}
                  issueDate={issueDate}
                  onIssueDateChange={(value) => { setIssueDate(value); setVoucherCode(""); }}
                  observation={observation}
                  onObservationChange={(value) => { setObservation(value); setVoucherCode(""); }}
                  costType={costType}
                  onCostTypeChange={(value) => { setCostType(value); setVoucherCode(""); }}
                  stayDays={stayDays}
                  onStayDaysChange={(value) => { setStayDays(value); setVoucherCode(""); }}
                  onPrint={handlePrint}
                  isPrintReady={isPrintReady}
                  voucherCode={voucherCode}
                  isGeneratingCode={codeMutation.isPending}
                />
              </div>

              <section className={`preview-column ${mobileView === "form" ? "mobile-hidden" : ""}`} data-testid="preview-section">
                <div className="preview-toolbar no-print" data-testid="preview-toolbar">
                  <div><p className="section-kicker" data-testid="preview-kicker">Pré-visualização A4</p><strong data-testid="preview-summary">{summary}</strong></div>
                  <button type="button" onClick={() => void handlePrint()} className="toolbar-print" data-testid="preview-print-button"><Printer size={16} /> Imprimir</button>
                </div>
                <div className="preview-stage" data-testid="preview-stage">
                  <div className="stage-label no-print" data-testid="stage-label"><span>A4 · retrato</span><span>atualização ao vivo</span></div>
                  <VoucherPreview gift={selectedGift} winnerName={winnerName} issueDate={issueDate} observation={observation} voucherCode={voucherCode} costType={costType} stayDays={stayDays} />
                </div>
              </section>
            </div>
          </>
        ) : (
          <section className="history-view no-print" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
              <p className="section-kicker" style={{ color: '#0f172a', fontWeight: 600, fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Controle de Gestão</p>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Histórico de Emissões</h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>Consulte os últimos 100 vouchers emitidos pela equipa da FIVE.</p>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              {historyQuery.isLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Carregando dados do servidor...</div>
              ) : historyQuery.isError ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>Ocorreu um erro ao carregar o histórico. Tente atualizar a página.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textIndent: 0, borderColor: 'inherit', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Data e Hora</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Código</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Cliente</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Brinde Emitido</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Emissor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyQuery.data?.map((v: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                            {new Date(v.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', fontWeight: 600, letterSpacing: '0.02em' }}>{v.code}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>{v.winner_name}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>{v.gift_title}</span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>{v.emissor_nome}</td>
                        </tr>
                      ))}
                      {historyQuery.data?.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Nenhum brinde foi emitido até o momento. Faça o seu primeiro teste!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <footer className="site-footer no-print" data-testid="site-footer"><span>FIVE Intermediadora de Vendas</span><span>Emissão interna de brindes</span></footer>
    </div>
  );
}
