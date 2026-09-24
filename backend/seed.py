import asyncio
import uuid

from passlib.hash import pbkdf2_sha256

from lib.db import client, db, ensure_indexes


DEMO_USER = {
    "name": "Atendimento Resort",
    "email": "admin@resortbrindes.com.br",
    "role": "emissor",
}


async def seed() -> None:
    await ensure_indexes()
    existing = await db.users.find_one({"email": DEMO_USER["email"]})
    values = {
        **DEMO_USER,
        "password_hash": pbkdf2_sha256.hash("senha123"),
    }
    if existing:
        await db.users.update_one({"email": DEMO_USER["email"]}, {"$set": values})
    else:
        await db.users.insert_one({"id": str(uuid.uuid4()), **values})
    print("Demo user ready")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())