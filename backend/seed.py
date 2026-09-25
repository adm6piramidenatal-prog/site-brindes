import asyncio
import uuid

from passlib.hash import pbkdf2_sha256

from lib.db import client, db, ensure_indexes

# Adicione ou remova funcionários desta lista quando quiser
USERS_TO_CREATE = [
    {
        "name": "Eduardo Araújo",
        "email": "adm6piramidenatal@gmail.com",
        "role": "admin",
        "password_plain": "SuaSenhaForte123" # <-- MUDE ESTA SENHA
    },
    {
        "name": "Nome do Funcionário",
        "email": "funcionario@email.com",
        "role": "emissor",
        "password_plain": "senha_temporaria_123" # <-- MUDE A SENHA DELE
    }
    # Para adicionar mais pessoas, basta copiar um bloco inteiro desde a { até à }, e colocar aqui
]


async def seed() -> None:
    await ensure_indexes()
    
    # Este ciclo vai criar ou atualizar todas as contas da lista acima
    for user_data in USERS_TO_CREATE:
        email = user_data["email"]
        plain_password = user_data.pop("password_plain") # Separa a senha para a criptografar
        
        existing = await db.users.find_one({"email": email})
        values = {
            **user_data,
            "password_hash": pbkdf2_sha256.hash(plain_password),
        }
        
        if existing:
            await db.users.update_one({"email": email}, {"$set": values})
            print(f"Conta atualizada: {email}")
        else:
            await db.users.insert_one({"id": str(uuid.uuid4()), **values})
            print(f"Nova conta criada: {email}")
            
    # Limpeza de segurança: apaga a conta de demonstração antiga
    await db.users.delete_one({"email": "admin@resortbrindes.com.br"})
    print("Conta de demonstração apagada por segurança.")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
