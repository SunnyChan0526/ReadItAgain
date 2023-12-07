from contextlib import asynccontextmanager
from fastapi import FastAPI,Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field 
from typing import Optional
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
    name: str
    # bookpicture: str
    condition: str
    price: int
    shippinglocation: str
    
class BookDetail(BaseModel):
    sellerid: int
    isbn: str
    name: str
    bookpicture: str
    condition: str
    price: int
    shippinglocation: str
    description: str
    category: str

@app.get("/books/", response_model=list[BookSearch])
async def search_books_by_order(
    name: str = Query(None, min_length=3),
    sort_by: Optional[str] = Query(None,  description='sorting option'),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price")
    ):
    query = Book.objects.filter(name__icontains=name)
    if(sort_by == 'price_ascending'):
        query = query.order_by('price')
    elif(sort_by == 'price_descending'):
        query = query.order_by('-price')
        
    if min_price is not None and max_price is not None:
        query = query.filter(price__gte = min_price, price__lte = max_price)
        
    return await query.all()

@app.get("/books/{book_id}", response_model=list[BookDetail])
async def search_books(book_id: int):
    query = Book.objects.filter(bookid = book_id)
    return await query.all()

@app.get("/img/{imgfilename}")
async def get_imgs(imgfilename: str):
    return FileResponse(f"./img/{imgfilename}")