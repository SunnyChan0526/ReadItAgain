from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.db import database, User

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not database.is_connected:
        await database.connect()
    # create a dummy entry
    await User.objects.get_or_create(email="test@test.com")
    yield
    if database.is_connected:
        await database.disconnect()
app = FastAPI(lifespan=lifespan)
@app.get("/")
async def read_root():
    return await User.objects.all()

