import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Gift, History, LogOut, FileText } from "lucide-react";
import { Toaster } from "sonner";

import GiftFormPanel from "@/components/GiftFormPanel";
import VoucherPreview from "@/components/VoucherPreview";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/auth";
import { endSession } from "@/lib/session";
import { FALLBACK_CONFIG, fetchVoucherConfig, fetchVoucherHistory } from "@/lib/vouchers";

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

  const historyQuery = useQuery({
    queryKey: ["voucher-history"],
    queryFn: fetchVoucherHistory,
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Toaster richColors position="top-right" />
      
      {/* Header com o Botão de Ficha de Recepção Integrado em Destaque */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <img src="/brand/five-logo.webp" alt="FIVE" className="h-8 object-contain" />
          <span className="text-sm font-semibold text-slate-500 border-l pl-3 border-slate-300">Sistema de Vouchers</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/recepcao"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileText size={14} /> Ficha de Recepção
          </Link>
          <span className="text-sm font-medium text-slate-700 border-l pl-4 border-slate-200">Olá, {userQuery.data?.name || "Atendente"}</span>
          <Button variant="outline" size="sm" onClick={() => endSession().then(() => navigate("/login"))} className="gap-2">
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </header>

      {/* Navigation Tabs originais */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-4 no-print">
        <button
          onClick={() => setActiveTab("emitir")}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "emitir" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Gift size={16} /> Emitir Brinde
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
                onGenerate={(codeData: any) => setCustomVoucherCode(codeData.code)}
                isGenerating={false}
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
            <h2 className="text-lg font-bold text-slate-800 mb-4">Histórico de Emissões</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-3">Data</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {(historyQuery.data ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400">Nenhum voucher encontrado.</td>
                    </tr>
                  ) : (
                    (historyQuery.data ?? []).map((v: any) => (
                      <tr key={v.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-slate-600">{new Date(v.created_at).toLocaleString("pt-BR")}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{v.code}</td>
                        <td className="p-3 font-semibold text-slate-800">{v.winner_name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer no-print border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        FIVE Intermediadora de Vendas
      </footer>
    </div>
  );
}
