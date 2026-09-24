from datetime import datetime, timedelta, timezone
import os

import jwt
from fastapi import APIRouter, Cookie, HTTPException, Response, status
from passlib.hash import pbkdf2_sha256

from lib.db import db
from models.auth import LoginRequest, LoginResponse, UserResponse


router = APIRouter(prefix="/auth", tags=["auth"])
COOKIE_NAME = "voucherfest_session"
SESSION_HOURS = 12


def _public_user(document: dict) -> UserResponse:
    return UserResponse(
        id=document["id"],
        name=document["name"],
        email=document["email"],
        role=document["role"],
    )


def _create_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=SESSION_HOURS),
    }
    return jwt.encode(payload, os.environ["AUTH_SECRET"], algorithm="HS256")


async def _user_from_token(token: str | None) -> dict:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão não encontrada")
    try:
        payload = jwt.decode(token, os.environ["AUTH_SECRET"], algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida") from exc
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user


async def require_user(voucherfest_session: str | None = Cookie(default=None)) -> dict:
    return await _user_from_token(voucherfest_session)


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, response: Response) -> LoginResponse:
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not pbkdf2_sha256.verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos")
    response.set_cookie(
        key=COOKIE_NAME,
        value=_create_token(user["id"]),
        max_age=SESSION_HOURS * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return LoginResponse(user=_public_user(user), message="Login realizado com sucesso")


@router.get("/me", response_model=UserResponse)
async def me(voucherfest_session: str | None = Cookie(default=None)) -> UserResponse:
    return _public_user(await require_user(voucherfest_session))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    response.delete_cookie(COOKIE_NAME, path="/")
    return response