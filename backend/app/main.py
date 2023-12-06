from contextlib import asynccontextmanager
from fastapi import FastAPI,Query
from pydantic import BaseModel, Field 
from typing import Optional, List
from app.db import database, Book, ShoppingCart, CartList

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
    bookpicture: str
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

class ShoppingCartList(BaseModel):
    shoppingCartid: int
    items: list[BookDetail]
    cartQuantity: int


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


'''@app.post("/add-to-cart/{book_id}")
async def add_to_cart(customer_id: int, book_id: int):
    cart = ShoppingCartList(ShoppingCart.objects.filter(customerid = customer_id))
    cartList = list(CartList.objects.filter(shoppingCartid = cart.shoppingCartid)))
    for item in cartList:
        ShoppingCartList.items.append(item.bookid)
        ShoppingCartList.cartQuantity += 1
    CartList(shoppingCartid = cart.shoppingCartid, bookid = book_id)
    return CartList
    '''




@app.get("/show-cart/{shoppingcard_id}", response_model=list[BookDetail])
async def show_cart(shoppingcard_id: int):
    # 查詢購物車中的所有項目
    cart_items = await CartList.objects.select_related("bookid").filter(shoppingcartid=shoppingcard_id).all()

    # 從購物車項目中提取所有相關的書籍資訊
    books = [item.bookid for item in cart_items]

    return books


'''
@app.delete("/remove-from-cart/{item_id}")
async def remove_from_cart(item_id: int):
    if item_id not in shopping_cart:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    del shopping_cart[item_id]
    return {"message": "Item removed from cart successfully"}
'''
