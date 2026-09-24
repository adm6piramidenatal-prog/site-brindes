import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, CircleAlert, Gift, Hash, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { fetchVoucherValidation } from "@/lib/vouchers";

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function ValidateVoucher() {
  const { code = "" } = useParams();
  const validationQuery = useQuery({
    queryKey: ["voucher-validation", code],
    queryFn: () => fetchVoucherValidation(code),
    enabled: Boolean(code),
    retry: false,
  });
  const voucher = validationQuery.data;

  return (
    <main className="validation-page" data-testid="validation-page">
      <header className="validation-header" data-testid="validation-header">
        <Link to="/login" className="validation-brand" data-testid="validation-brand-link">
          <img src="/brand/five-logo.webp" alt="Símbolo da FIVE" data-testid="validation-brand-logo" />
          <span><strong>FIVE</strong><small>Intermediadora de Vendas</small></span>
        </Link>
      </header>

      <section className="validation-wrap" data-testid="validation-content">
        {validationQuery.isLoading && (
          <div className="validation-card validation-loading" data-testid="validation-loading"><Gift size={26} /><span>Consultando o brinde...</span></div>
        )}

        {validationQuery.isError && (
          <div className="validation-card validation-invalid" data-testid="validation-invalid">
            <CircleAlert size={38} />
            <p className="section-kicker" data-testid="validation-invalid-kicker">Validação FIVE</p>
            <h1 data-testid="validation-invalid-title">Código não encontrado</h1>
            <p data-testid="validation-invalid-description">Confira o código impresso ou solicite a confirmação à equipe responsável.</p>
            <code data-testid="validation-invalid-code">{code}</code>
          </div>
        )}

        {voucher && (
          <article className="validation-card validation-valid" data-testid="validation-valid">
            <div className="validation-seal" data-testid="validation-seal"><CheckCircle2 size={30} /><span>Brinde autêntico</span></div>
            <p className="section-kicker" data-testid="validation-kicker">Validação FIVE</p>
            <h1 data-testid="validation-title">Código confirmado</h1>
            <p className="validation-code" data-testid="validation-code"><Hash size={16} />{voucher.code}</p>

            <div className="validation-details" data-testid="validation-details">
              <div data-testid="validation-gift"><Gift size={18} /><span>Brinde</span><strong>{voucher.stay_days ? `${voucher.stay_days} Diárias` : voucher.gift_title}</strong></div>
              <div data-testid="validation-winner"><UserRound size={18} /><span>Ganhador</span><strong>{voucher.winner_name}</strong></div>
              <div data-testid="validation-date"><CalendarDays size={18} /><span>Emissão</span><strong>{formatDate(voucher.issue_date)}</strong></div>
            </div>

            {voucher.observation && <p className="validation-observation" data-testid="validation-observation"><strong>Observação:</strong> {voucher.observation}</p>}
            <p className="validation-footnote" data-testid="validation-footnote">Este código consta no registro oficial de brindes da FIVE Intermediadora de Vendas.</p>
          </article>
        )}
      </section>
    </main>
  );
}