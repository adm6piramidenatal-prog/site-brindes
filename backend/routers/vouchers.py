from datetime import datetime, timedelta, timezone
import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.dates import today_iso
from models.vouchers import GiftOption, ValidityOption, VoucherCode, VoucherCodeCreate, VoucherConfig, VoucherValidation
from routers.auth import require_user

router = APIRouter(prefix="/vouchers", tags=["vouchers"])

GIFT_OPTIONS = [
    GiftOption(
        id="diarias-captacao-3",
        title="Diárias",
        category="Hospedagem",
        subtitle="Título promocional de hospedagem no Hotel Pirâmide Natal.",
        code_prefix="CAP-3D",
        theme="terracotta",
        background_path="/templates/diarias.svg",
        source_label="3 DIÁRIAS - COM CUSTO.pdf",
        default_validity_days=730,
        rules=[
            "Válido para hospedagem no Hotel Pirâmide Natal, mediante reserva e disponibilidade.",
            "Uso em baixa temporada; consulte períodos indisponíveis, feriados e eventos.",
            "Reserva com antecedência mínima de 90 dias pelos canais informados no voucher.",
        ],
    ),
    GiftOption(
        id="barraca-praia",
        title="Barraca de Praia",
        category="Consumação",
        subtitle="R$ 50,00 em consumação na Barraca do Buiu ou K1 Paula.",
        code_prefix="BAR-050",
        theme="coral",
        background_path="/templates/barraca-praia.svg",
        source_label="BARRACA DE PRAIA.pdf",
        default_validity_days=5,
        rules=[
            "Consumação de R$ 50,00 nos estabelecimentos participantes.",
            "Atendimento todos os dias, das 07h às 17h.",
            "Voucher pessoal, intransferível e válido por 5 dias corridos.",
        ],
    ),
    GiftOption(
        id="day-use-manual",
        title="Day Use",
        category="Day use",
        subtitle="Acesso de um dia às áreas de lazer do Hotel Pirâmide Natal.",
        code_prefix="DAY-USE",
        theme="ocean",
        background_path="/templates/day-use.svg",
        source_label="DAY USE.pdf",
        default_validity_days=7,
        rules=[
            "Acesso às áreas de lazer para 4 adultos e 3 crianças, em uso único.",
            "Não inclui quartos; não é permitida a entrada de alimentos ou bebidas.",
            "Apresente este voucher na recepção. Validade de 7 dias corridos.",
        ],
    ),
    GiftOption(
        id="day-use-vip",
        title="Day Use VIP",
        category="Day use VIP",
        subtitle="Day use com R$ 100,00 em consumação.",
        code_prefix="DAY-VIP",
        theme="navy",
        background_path="/templates/day-use-vip.svg",
        source_label="DAY USE VIP.pdf",
        default_validity_days=7,
        rules=[
            "Acesso para 4 adultos e 3 crianças, limitado a um único uso.",
            "Inclui R$ 100,00 em consumação; excedentes são pagos no local.",
            "Apresente este voucher na recepção. Validade de 7 dias corridos.",
        ],
    ),
    GiftOption(
        id="desconto-passeios",
        title="Desconto em Passeios",
        category="Passeios",
        subtitle="R$ 80,00 de desconto em passeios da agência parceira.",
        code_prefix="PAS-080",
        theme="lagoon",
        background_path="/templates/passeios.svg",
        source_label="DESCONTO EM PASSEIOS.pdf",
        default_validity_days=5,
        rules=[
            "Concede R$ 80,00 de desconto em qualquer passeio do roteiro parceiro.",
            "Agendamento pelo contato informado no documento original.",
            "Voucher pessoal, intransferível e válido por 5 dias corridos.",
        ],
    ),
]

VALIDITY_DAYS = (30, 60, 90, 180, 365)


def build_validity_options(today: str) -> list[ValidityOption]:
    base_date = datetime.strptime(today, "%Y-%m-%d").date()
    return [
        ValidityOption(
            label="30 dias",
            days=days,
            expires_on=(base_date + timedelta(days=days)).isoformat(),
        )
        if days != 365
        else ValidityOption(
            label="1 ano",
            days=days,
            expires_on=(base_date + timedelta(days=days)).isoformat(),
        )
        for days in VALIDITY_DAYS
    ]


@router.get("/config", response_model=VoucherConfig)
async def get_voucher_config() -> VoucherConfig:
    today = today_iso()
    return VoucherConfig(
        today=today,
        default_validity_days=90,
        gift_options=GIFT_OPTIONS,
        validity_options=build_validity_options(today),
    )


@router.post("/codes", response_model=VoucherCode, status_code=status.HTTP_201_CREATED)
async def create_voucher_code(
    payload: VoucherCodeCreate,
    user: dict = Depends(require_user),
) -> VoucherCode:
    if not any(gift.id == payload.gift_id for gift in GIFT_OPTIONS):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modelo de brinde não encontrado")

    date_part = today_iso().replace("-", "")
    for _ in range(10):
        code = f"FIVE-{date_part}-{secrets.token_hex(3).upper()}"
        voucher = VoucherCode(
            id=str(uuid.uuid4()),
            code=code,
            gift_id=payload.gift_id,
            winner_name=payload.winner_name.strip(),
            issue_date=payload.issue_date,
            observation=payload.observation.strip(),
            stay_days=payload.stay_days,
            cost_type=payload.cost_type,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        document = voucher.model_dump()
        document["created_by"] = user["id"]
        try:
            await db.voucher_codes.insert_one(document)
        except DuplicateKeyError:
            continue
        return voucher
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Não foi possível gerar um código único")


@router.get("/codes/{code}", response_model=VoucherValidation)
async def validate_voucher_code(code: str) -> VoucherValidation:
    document = await db.voucher_codes.find_one({"code": code.upper()}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Código de brinde não encontrado")
    gift = next((item for item in GIFT_OPTIONS if item.id == document["gift_id"]), None)
    return VoucherValidation(
        valid=True,
        code=document["code"],
        gift_title=gift.title if gift else "Brinde FIVE",
        winner_name=document["winner_name"],
        issue_date=document["issue_date"],
        observation=document.get("observation", ""),
        stay_days=document.get("stay_days"),
        cost_type=document.get("cost_type"),
        created_at=document["created_at"],
    )


@router.get("/history")
async def get_voucher_history(user: dict = Depends(require_user)) -> list[dict]:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acesso restrito a administradores."
        )
        
    cursor = db.voucher_codes.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    vouchers = await cursor.to_list(length=100)
    
    users_cursor = db.users.find({}, {"_id": 0, "id": 1, "name": 1})
    users = await users_cursor.to_list(length=100)
    user_map = {u["id"]: u["name"] for u in users}
    
    for v in vouchers:
        gift = next((item for item in GIFT_OPTIONS if item.id == v.get("gift_id")), None)
        v["gift_title"] = gift.title if gift else "Brinde FIVE"
        v["emissor_nome"] = user_map.get(v.get("created_by"), "Sistema/Desconhecido")
        
    return vouchers
