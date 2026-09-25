import asyncio
import uuid

from passlib.hash import pbkdf2_sha256

from lib.db import client, db, ensure_indexes

USERS_TO_CREATE = [
    {
        "name": "Eduardo Vicente",
        "email": "adm6piramidenatal@gmail.com",
        "role": "admin",
        "password_plain": "091427"
    },
    {
        "name": "Luismar - Gerente adm",
        "email": "financeirofive3@gmail.com",
        "role": "admin",
        "password_plain": "@cess0"
    },
    {
        "name": "Gabriella - Administrativo",
        "email": "gabriellasantosmb@gmail.com",
        "role": "emissor",
        "password_plain": "senhatemporaria123"
    },
    {
        "name": "Kadydja - Administrativo",
        "email": "adm10fiveinter@gmail.com",
        "role": "emissor",
        "password_plain": "senhatemporaria123"
    },
    {
        "name": "Adauto - Recepção",
        "email": "recepcao1piramidenatal@gmail.com",
        "role": "emissor",
        "password_plain": "recepcao123"
    },
    {
        "name": "Pedro Henrique",
        "email": "mamaprego@gmail.com",
        "role": "admin",
        "password_plain": "senha123"
    },
]

async def seed() -> None:
    await ensure_indexes()
    
    for user_data in USERS_TO_CREATE:
        email = user_data["email"]
        plain_password = user_data.pop("password_plain")
        
        existing = await db.users.find_one({"email": email})
        
        # AQUI ESTÁ A CORREÇÃO: Garante que todos têm um ID único para o login funcionar
        user_id = existing.get("id") if existing and "id" in existing else str(uuid.uuid4())
        
        values = {
            "id": user_id,
            **user_data,
            "password_hash": pbkdf2_sha256.hash(plain_password),
        }
        
        if existing:
            await db.users.update_one({"email": email}, {"$set": values})
            print(f"Conta atualizada e corrigida: {email}")
        else:
            await db.users.insert_one(values)
            print(f"Nova conta criada: {email}")
            
    # Limpeza
    await db.users.delete_one({"email": "admin@resortbrindes.com.br"})
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
