from pydantic import BaseModel, Field


class GiftOption(BaseModel):
    id: str
    title: str
    category: str
    subtitle: str
    code_prefix: str
    theme: str
    background_path: str
    source_label: str
    rules: list[str]
    default_validity_days: int


class ValidityOption(BaseModel):
    label: str
    days: int
    expires_on: str


class VoucherConfig(BaseModel):
    today: str
    default_validity_days: int
    gift_options: list[GiftOption]
    validity_options: list[ValidityOption]


class VoucherCodeCreate(BaseModel):
    gift_id: str
    winner_name: str = Field(min_length=3, max_length=120)
    issue_date: str
    observation: str = Field(default="", max_length=240)
    stay_days: int | None = None
    cost_type: str | None = None


class VoucherCode(BaseModel):
    id: str
    code: str
    gift_id: str
    winner_name: str
    issue_date: str
    observation: str
    stay_days: int | None
    cost_type: str | None
    created_at: str


class VoucherValidation(BaseModel):
    valid: bool
    code: str
    gift_title: str
    winner_name: str
    issue_date: str
    observation: str
    stay_days: int | None
    cost_type: str | None
    created_at: str