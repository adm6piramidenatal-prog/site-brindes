import { apiGet, apiPost } from "@/lib/api";

export interface GiftOption {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  code_prefix: string;
  theme: string;
  background_path: string;
  source_label: string;
  rules: string[];
  default_validity_days: number;
}

export interface ValidityOption {
  label: string;
  days: number;
  expires_on: string;
}

export interface VoucherConfig {
  today: string;
  default_validity_days: number;
  gift_options: GiftOption[];
  validity_options: ValidityOption[];
}

export interface VoucherCodeCreate {
  gift_id: string;
  winner_name: string;
  issue_date: string;
  observation: string;
  stay_days: number | null;
  cost_type: string | null;
}

export interface VoucherCode {
  id: string;
  code: string;
  gift_id: string;
  winner_name: string;
  issue_date: string;
  observation: string;
  stay_days: number | null;
  cost_type: string | null;
  created_at: string;
}

export interface VoucherValidation {
  valid: boolean;
  code: string;
  gift_title: string;
  winner_name: string;
  issue_date: string;
  observation: string;
  stay_days: number | null;
  cost_type: string | null;
  created_at: string;
}

export const fetchVoucherConfig = () => apiGet<VoucherConfig>("/vouchers/config");
export const createVoucherCode = (payload: VoucherCodeCreate) => apiPost<VoucherCode>("/vouchers/codes", payload);
export const fetchVoucherValidation = (code: string) => apiGet<VoucherValidation>(`/vouchers/codes/${encodeURIComponent(code)}`);

export const FALLBACK_CONFIG: VoucherConfig = {
  today: "",
  default_validity_days: 90,
  gift_options: [
    {
      id: "diarias-captacao-3",
      title: "Diárias",
      category: "Hospedagem VIP",
      subtitle: "Uma pausa especial para celebrar novas conquistas.",
      code_prefix: "CAP-3D",
      theme: "terracotta",
      background_path: "/templates/diarias.svg",
      source_label: "3 DIÁRIAS - COM CUSTO.rtf",
      default_validity_days: 730,
      rules: [
        "Válido para hospedagem no Hotel Pirâmide Natal, mediante reserva e disponibilidade.",
        "Uso em baixa temporada; consulte períodos indisponíveis, feriados e eventos.",
        "Reserva com antecedência mínima de 90 dias pelos canais informados no voucher.",
      ],
    },
  ],
  validity_options: [
    { label: "30 dias", days: 30, expires_on: "" },
    { label: "60 dias", days: 60, expires_on: "" },
    { label: "90 dias", days: 90, expires_on: "" },
    { label: "180 dias", days: 180, expires_on: "" },
    { label: "1 ano", days: 365, expires_on: "" },
  ],
};