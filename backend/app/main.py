from contextlib import asynccontextmanager
from fastapi import FastAPI,Query
from pydantic import BaseModel, Field 
from app.db import database,Book

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not database.is_connected:
        await database.connect()
    yield
    if database.is_connected:
        await database.disconnect()
app = FastAPI(lifespan=lifespan)
@app.get("/")
async def read_root():
    return "testroot"

class BookSearch(BaseModel):
    sellerid: str
    isbn: str
    name: str
    bookpicture: str
    condition: str
    price: int
    shippinglocation: str
    description: str
    category: str

@app.get("/books/", response_model=list[BookSearch])
async def search_books(name: str = Query(None, min_length=3)):
    query = Book.objects.filter(name__icontains=name)
    return await query.all()