import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, FileCheck2, Gift, LayoutTemplate, LogOut, Printer, History, Ticket, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";

import GiftFormPanel from "@/components/GiftFormPanel";
import VoucherPreview from "@/components/VoucherPreview";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/auth";
import { endSession } from "@/lib/session";
import { createVoucherCode, FALLBACK_CONFIG, fetchVoucherConfig, fetchVoucherHistory } from "@/lib/vouchers";

export default function Home() {
  const navigate = useNavigate();
  const userQuery = useQuery({ queryKey: ["auth", "me"], queryFn: fetchCurrentUser, retry: false });
  const configQuery = useQuery({ queryKey: ["voucher-config"], queryFn: fetchVoucherConfig, retry: false });
  const config = configQuery.data ?? FALLBACK_CONFIG;
  const [selectedGiftId, setSelectedGiftId] = useState(FALLBACK_CONFIG.gift_options[0].id);
  const [winnerName, setWinnerName] = useState("");
  const [winnerEmail, setWinnerEmail] = useState("");
  const [winnerPhone, setWinnerPhone] = useState("");
  const [consultantName, setConsultantName] = useState("");
  const [closerName, setCloserName] = useState("");
  const [emitterName, setEmitterName] = useState("");
  const [customVoucherCode, setCustomVoucherCode] = useState("");
  const [activeTab, setActiveTab] = useState<"emitir" | "historico">("emitir");
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const historyQuery = useQuery({
    queryKey: ["voucher-history"],
    queryFn: fetchVoucherHistory,
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: createVoucherCode,
    onSuccess: (data) => {
      toast.success("Voucher gerado com sucesso!");
      setCustomVoucherCode(data.code);
      historyQuery.refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao gerar voucher");
    },
  });

  const handleGenerate = () => {
    if (!winnerName.trim()) {
      toast.error("Preencha o nome do cliente.");
      return;
    }
    createMutation.mutate({
      gift_id: selectedGiftId,
      winner_name: winnerName,
      winner_email: winnerEmail || undefined,
      winner_phone: winnerPhone || undefined,
      consultant_name: consultantName || undefined,
      closer_name: closerName || undefined,
      emitter_name: emitterName || undefined,
    });
  };

  const filteredHistory = useMemo(() => {
    const list = historyQuery.data ?? [];
    return list.filter((v) => {
      const matchText = `${v.winner_name} ${v.code} ${v.consultant_name ?? ""} ${v.closer_name ?? ""}`.toLowerCase();
      const matchesSearch = matchText.includes(historySearch.toLowerCase());
      if (!matchesSearch) return false;

      if (historyDateFilter === "all") return true;
      const createdDate = new Date(v.created_at);
      const now = new Date();
      const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);

      if (historyDateFilter === "today") return diffDays <= 1;
      if (historyDateFilter === "week") return diffDays <= 7;
      if (historyDateFilter === "month") return diffDays <= 30;
      return true;
    });
  }, [historyQuery.data, historySearch, historyDateFilter]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Toaster richColors position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <img src="/brand/five-logo.webp" alt="FIVE" className="h-8 object-contain" />
          <span className="text-sm font-semibold text-slate-500 border-l pl-3 border-slate-300">Sistema de Vouchers</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">Olá, {userQuery.data?.name || "Atendente"}</span>
          <Button variant="outline" size="sm" onClick={() => endSession().then(() => navigate("/login"))} className="gap-2">
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-4 no-print">
        <button
          onClick={() => setActiveTab("emitir")}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "emitir" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Gift size={16} /> Emitir Voucher
        </button>
        <button
          onClick={() => setActiveTab("historico")}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "historico" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History size={16} /> Histórico de Vouchers
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === "emitir" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 no-print">
              <GiftFormPanel
                config={config}
                selectedGiftId={selectedGiftId}
                onSelectGift={setSelectedGiftId}
                winnerName={winnerName}
                setWinnerName={setWinnerName}
                winnerEmail={winnerEmail}
                setWinnerEmail={setWinnerEmail}
                winnerPhone={winnerPhone}
                setWinnerPhone={setWinnerPhone}
                consultantName={consultantName}
                setConsultantName={setConsultantName}
                closerName={closerName}
                setCloserName={setCloserName}
                emitterName={emitterName}
                setEmitterName={setEmitterName}
                onGenerate={handleGenerate}
                isGenerating={createMutation.isPending}
              />
            </div>
            <div className="lg:col-span-7 flex justify-center sticky top-6">
              <VoucherPreview
                config={config}
                selectedGiftId={selectedGiftId}
                winnerName={winnerName}
                consultantName={consultantName}
                closerName={closerName}
                emitterName={emitterName}
                voucherCode={customVoucherCode}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Histórico de Emissões</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, código..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm w-full sm:w-64"
                />
                <select
                  value={historyDateFilter}
                  onChange={(e: any) => setHistoryDateFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-3">Data</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Consultor</th>
                    <th className="p-3">Fechador</th>
                    <th className="p-3">Brinde</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">Nenhum voucher encontrado.</td>
                    </tr>
                  ) : (
                    filteredHistory.map((v) => (
                      <tr key={v.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-600">{new Date(v.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{v.code}</td>
                        <td className="p-3 font-semibold text-slate-800">{v.winner_name}</td>
                        <td className="p-3 text-slate-600">{v.consultant_name || "-"}</td>
                        <td className="p-3 text-slate-600">{v.closer_name || "-"}</td>
                        <td className="p-3 text-slate-600">{v.gift_title || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer no-print border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        FIVE Intermediadora de Vendas
      </footer>
    </div>
  );
}
