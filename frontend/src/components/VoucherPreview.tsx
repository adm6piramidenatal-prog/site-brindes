import type { CSSProperties } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { GiftOption } from "@/lib/vouchers";

type FieldPosition = {
  left: string;
  top: string;
  width: string;
  fontSize: string;
  fontWeight?: number;
  color?: string;
  textAlign?: CSSProperties["textAlign"];
};

type TemplateLayout = {
  names: FieldPosition[];
  dates: FieldPosition[];
  observation: FieldPosition;
  codes: FieldPosition[];
  qr: { left: string; top: string; size: string };
};

const TEMPLATE_LAYOUTS: Record<string, TemplateLayout> = {
  "diarias-captacao-3": {
    names: [{ left: "19.54%", top: "78.56%", width: "72%", fontSize: "1.67cqw" }],
    dates: [{ left: "19.62%", top: "80.06%", width: "18%", fontSize: "1.85cqw" }],
    observation: { left: "6.05%", top: "86.35%", width: "69%", fontSize: "1.10cqw" },
    codes: [{ left: "65.99%", top: "32.02%", width: "28%", fontSize: "1.20cqw", fontWeight: 700, color: "#d51f32", textAlign: "right" }],
    qr: { left: "87.8%", top: "82.40%", size: "6.2%" },
  },
  "barraca-praia": {
    names: [
      { left: "19.44%", top: "59.85%", width: "72%", fontSize: "1.67cqw", fontWeight: 700 },
      { left: "19.54%", top: "85.00%", width: "72%", fontSize: "1.67cqw", fontWeight: 700 },
    ],
    dates: [
      { left: "19.62%", top: "61.34%", width: "18%", fontSize: "1.85cqw" },
      { left: "19.62%", top: "86.50%", width: "18%", fontSize: "1.85cqw" },
    ],
    observation: { left: "6.05%", top: "67.47%", width: "70%", fontSize: "1.10cqw" },
    codes: [
      { left: "6.05%", top: "27.18%", width: "53%", fontSize: "1.18cqw", fontWeight: 700 },
      { left: "46.14%", top: "81.46%", width: "47%", fontSize: "1.08cqw", fontWeight: 700, textAlign: "center" },
    ],
    qr: { left: "87.8%", top: "62.00%", size: "6.2%" },
  },
  "day-use-manual": {
    names: [
      { left: "19.11%", top: "60.47%", width: "72%", fontSize: "1.85cqw" },
      { left: "19.11%", top: "84.83%", width: "72%", fontSize: "1.85cqw" },
    ],
    dates: [
      { left: "19.62%", top: "62.07%", width: "18%", fontSize: "1.85cqw" },
      { left: "19.62%", top: "86.43%", width: "18%", fontSize: "1.85cqw" },
    ],
    observation: { left: "6.05%", top: "68.30%", width: "70%", fontSize: "1.10cqw" },
    codes: [
      { left: "6.05%", top: "28.65%", width: "53%", fontSize: "1.18cqw", fontWeight: 700 },
      { left: "58%", top: "79.65%", width: "35%", fontSize: "1.08cqw", fontWeight: 700, textAlign: "right" },
    ],
    qr: { left: "87.8%", top: "62.50%", size: "6.2%" },
  },
  "day-use-vip": {
    names: [
      { left: "22.56%", top: "66.35%", width: "68%", fontSize: "1.67cqw" },
      { left: "22.56%", top: "89.13%", width: "68%", fontSize: "1.67cqw" },
    ],
    dates: [
      { left: "22.21%", top: "67.85%", width: "18%", fontSize: "1.85cqw" },
      { left: "22.21%", top: "90.63%", width: "18%", fontSize: "1.85cqw" },
    ],
    observation: { left: "6.05%", top: "74.12%", width: "70%", fontSize: "1.10cqw" },
    codes: [
      { left: "6.05%", top: "28.65%", width: "53%", fontSize: "1.18cqw", fontWeight: 700 },
      { left: "58%", top: "85.10%", width: "35%", fontSize: "1.08cqw", fontWeight: 700, textAlign: "right" },
    ],
    qr: { left: "87.8%", top: "68.00%", size: "6.2%" },
  },
  "desconto-passeios": {
    names: [
      { left: "19.54%", top: "60.09%", width: "72%", fontSize: "1.85cqw" },
      { left: "19.54%", top: "83.63%", width: "72%", fontSize: "1.85cqw" },
    ],
    dates: [
      { left: "19.62%", top: "61.67%", width: "18%", fontSize: "1.85cqw" },
      { left: "19.62%", top: "85.23%", width: "18%", fontSize: "1.85cqw" },
    ],
    observation: { left: "6.05%", top: "67.94%", width: "70%", fontSize: "1.10cqw" },
    codes: [
      { left: "6.05%", top: "30.12%", width: "53%", fontSize: "1.18cqw", fontWeight: 700 },
      { left: "46.14%", top: "80.19%", width: "47%", fontSize: "1.08cqw", fontWeight: 700, textAlign: "center" },
    ],
    qr: { left: "87.8%", top: "62.50%", size: "6.2%" },
  },
};

interface VoucherPreviewProps {
  gift: GiftOption;
  winnerName: string;
  issueDate: string;
  observation: string;
  voucherCode: string;
  costType: "com-custo" | "sem-custo";
  stayDays: 3 | 6;
}

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function fieldStyle(position: FieldPosition): CSSProperties {
  return {
    left: position.left,
    top: position.top,
    width: position.width,
    fontSize: position.fontSize,
    fontWeight: position.fontWeight ?? 400,
    color: position.color,
    textAlign: position.textAlign,
  };
}

export default function VoucherPreview({ gift, winnerName, issueDate, observation, voucherCode, costType, stayDays }: VoucherPreviewProps) {
  const layout = TEMPLATE_LAYOUTS[gift.id] ?? TEMPLATE_LAYOUTS["diarias-captacao-3"];
  const isStay = gift.id === "diarias-captacao-3";
  const price = stayDays === 3 ? "R$ 600,00" : "R$ 1.200,00";
  const validationUrl = voucherCode ? `${window.location.origin}/validar/${encodeURIComponent(voucherCode)}` : "";

  return (
    <article id="print-voucher-area" className="voucher-page voucher-original" data-testid="live-preview-container">
      <img className="voucher-background" src={gift.background_path} alt={`Modelo original ${gift.title}`} data-testid="voucher-original-background" />

      {layout.names.map((position, index) => (
        <strong
          key={`name-${index}`}
          className="original-field original-name"
          style={fieldStyle(position)}
          data-testid={index === 0 ? "preview-winner-name" : "preview-winner-name-company-copy"}
        >
          {winnerName.trim() || "NOME DO GANHADOR"}
        </strong>
      ))}

      {layout.dates.map((position, index) => (
        <span
          key={`date-${index}`}
          className="original-field original-date"
          style={fieldStyle(position)}
          data-testid={index === 0 ? "preview-issue-date" : "preview-issue-date-company-copy"}
        >
          {formatDate(issueDate)}
        </span>
      ))}

      {observation.trim() && (
        <span className="original-field original-observation" style={fieldStyle(layout.observation)} data-testid="preview-observation-text">
          <b>Obs.:</b> {observation.trim()}
        </span>
      )}

      {layout.codes.map((position, index) => (
        <strong key={`code-${index}`} className="original-field original-code" style={fieldStyle(position)} data-testid={index === 0 ? "preview-voucher-code" : `preview-voucher-code-copy-${index}`}>
          {voucherCode || "GERADO AO IMPRIMIR"}
        </strong>
      ))}

      {validationUrl && (
        <div className="original-qr" style={{ left: layout.qr.left, top: layout.qr.top, width: layout.qr.size }} data-testid="preview-voucher-qr" aria-label={`QR Code para validar ${voucherCode}`}>
          <QRCodeSVG value={validationUrl} size={96} level="M" bgColor="#ffffff" fgColor="#063f5b" />
        </div>
      )}

      {isStay && (
        <>
          <strong className="original-field original-stay-title" data-testid="preview-voucher-type">TÍTULO DE RESERVA - {stayDays} DIÁRIAS</strong>
          <strong className="original-field original-stay-price" data-testid="preview-price-value">
            {costType === "com-custo" ? "CORTESIA - SEM CUSTO PARA O CLIENTE" : `VALOR PROMOCIONAL: ${price}`}
          </strong>
        </>
      )}
      {!isStay && <span className="sr-only" data-testid="preview-voucher-type">{gift.title}</span>}
    </article>
  );
}