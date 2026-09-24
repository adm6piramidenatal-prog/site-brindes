import { CalendarDays, CircleDollarSign, FileText, Gift, Hash, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GiftOption } from "@/lib/vouchers";

type CostType = "com-custo" | "sem-custo";
type StayDays = 3 | 6;

interface GiftFormPanelProps {
  gifts: GiftOption[];
  selectedGiftId: string;
  onGiftChange: (value: string) => void;
  winnerName: string;
  onWinnerNameChange: (value: string) => void;
  issueDate: string;
  onIssueDateChange: (value: string) => void;
  observation: string;
  onObservationChange: (value: string) => void;
  costType: CostType;
  onCostTypeChange: (value: CostType) => void;
  stayDays: StayDays;
  onStayDaysChange: (value: StayDays) => void;
  onPrint: () => void;
  isPrintReady: boolean;
  voucherCode: string;
  isGeneratingCode: boolean;
}

export default function GiftFormPanel(props: GiftFormPanelProps) {
  const isStay = props.selectedGiftId === "diarias-captacao-3";
  const price = props.stayDays === 3 ? "R$ 600,00" : "R$ 1.200,00";

  return (
    <section className="control-panel no-print" data-testid="voucher-form-panel">
      <div className="panel-heading" data-testid="form-panel-heading">
        <p className="section-kicker" data-testid="form-panel-kicker"><Gift size={14} /> Nova emissão</p>
        <h2 data-testid="form-panel-title">Dados do voucher</h2>
        <p data-testid="form-panel-description">Os campos atualizam a prévia ao lado em tempo real.</p>
      </div>

      <div className="form-stack">
        <div className="field-group">
          <Label htmlFor="gift-type" data-testid="gift-type-label">Modelo de brinde</Label>
          <select id="gift-type" value={props.selectedGiftId} onChange={(event) => props.onGiftChange(event.target.value)} className="voucher-select" data-testid="voucher-template-select">
            {props.gifts.map((gift) => <option key={gift.id} value={gift.id}>{gift.title}</option>)}
          </select>
          <span className="field-hint" data-testid="gift-source-hint"><FileText size={12} /> Modelo importado do documento original</span>
        </div>

        <div className="field-group">
          <Label htmlFor="winner-name" data-testid="winner-name-label">Nome completo do ganhador</Label>
          <Input id="winner-name" value={props.winnerName} onChange={(event) => props.onWinnerNameChange(event.target.value)} placeholder="Ex.: Maria Eduarda Alencar" autoComplete="name" data-testid="winner-name-input" />
        </div>

        <div className="field-group">
          <Label htmlFor="issue-date" data-testid="issue-date-label">Data de emissão</Label>
          <div className="input-with-icon"><CalendarDays size={15} /><Input id="issue-date" type="date" value={props.issueDate} onChange={(event) => props.onIssueDateChange(event.target.value)} data-testid="issue-date-input" /></div>
        </div>

        {isStay && (
          <div className="pricing-box" data-testid="daily-rate-options">
            <div className="pricing-title" data-testid="daily-rate-title"><CircleDollarSign size={17} /><div><strong>Regra das diárias</strong><span>Defina quem assume o valor promocional</span></div></div>
            <div className="segmented-control" data-testid="cost-type-selector">
              <button type="button" className={props.costType === "com-custo" ? "active" : ""} onClick={() => props.onCostTypeChange("com-custo")} data-testid="cost-type-radio-com-custo">Com custo</button>
              <button type="button" className={props.costType === "sem-custo" ? "active" : ""} onClick={() => props.onCostTypeChange("sem-custo")} data-testid="cost-type-radio-sem-custo">Sem custo</button>
            </div>
            <div className="day-options" data-testid="days-selector">
              <button type="button" className={props.stayDays === 3 ? "active" : ""} onClick={() => props.onStayDaysChange(3)} data-testid="days-quantity-3-days"><strong>3 diárias</strong><span>{props.costType === "com-custo" ? "Cortesia" : "R$ 600,00"}</span></button>
              <button type="button" className={props.stayDays === 6 ? "active" : ""} onClick={() => props.onStayDaysChange(6)} data-testid="days-quantity-6-days"><strong>6 diárias</strong><span>{props.costType === "com-custo" ? "Cortesia" : "R$ 1.200,00"}</span></button>
            </div>
            <p className="pricing-summary" data-testid="pricing-summary-badge">{props.costType === "com-custo" ? `${props.stayDays} diárias em cortesia: o cliente não paga.` : `${props.stayDays} diárias: o cliente paga ${price}.`}</p>
          </div>
        )}

        <div className="field-group">
          <Label htmlFor="observation" data-testid="observation-label">Observação <span>(opcional)</span></Label>
          <textarea id="observation" value={props.observation} onChange={(event) => props.onObservationChange(event.target.value)} placeholder="Ex.: Válido mediante agendamento prévio." className="voucher-textarea" rows={3} maxLength={140} data-testid="observation-textarea" />
        </div>

        <div className="voucher-code-status" data-testid="voucher-code-status">
          <Hash size={15} aria-hidden="true" />
          <div><span>Código único</span><strong data-testid="voucher-code-display">{props.voucherCode || "Será gerado ao imprimir"}</strong></div>
        </div>

      </div>

      <div className="panel-footer" data-testid="form-actions">
        <Button type="button" onClick={props.onPrint} disabled={props.isGeneratingCode} className="primary-action print-button" data-testid="print-voucher-button">
          <Printer size={17} /> {props.isGeneratingCode ? "Gerando código..." : "Imprimir Brinde"} {!props.isPrintReady && <span className="button-status">preencha o nome</span>}
        </Button>
        <p className="keyboard-note" data-testid="keyboard-note">Atalho rápido: <strong>Ctrl/Cmd + P</strong></p>
      </div>
    </section>
  );
}