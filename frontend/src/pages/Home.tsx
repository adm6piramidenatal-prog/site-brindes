import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Eye, FileCheck2, Gift, LayoutTemplate, LogOut, Printer } from "lucide-react";
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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
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
        <div className="user-actions" data-testid="user-actions">
          <div className="user-badge" data-testid="current-user"><span>{userQuery.data.name.charAt(0)}</span><div><strong>{userQuery.data.name}</strong><small>{userQuery.data.email}</small></div></div>
          <Button variant="ghost" size="icon" onClick={() => endSession()} aria-label="Sair" data-testid="logout-button"><LogOut size={17} /></Button>
        </div>
      </header>

      <main className="workspace" data-testid="voucher-workspace">
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
      </main>
      <footer className="site-footer no-print" data-testid="site-footer"><span>FIVE Intermediadora de Vendas</span><span>Emissão interna de brindes</span></footer>
    </div>
  );
}