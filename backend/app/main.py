from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
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
    name: str
    bookpicture: str
    price: int


@app.get("/books/", response_model=list[BookSearch])
async def search_books_by_order(
    name: str = Query(None, min_length=3),
    sort_by: Optional[str] = Query(None,  description='sorting option'),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price")
):
    query = Book.objects.filter(name__icontains=name)
    if (sort_by == 'price_ascending'):
        query = query.order_by('price')
    elif (sort_by == 'price_descending'):
        query = query.order_by('-price')

    if min_price is not None and max_price is not None:
        query = query.filter(price__gte=min_price, price__lte=max_price)

    return await query.all()


@app.get("/books/{book_id}", response_model=list[BookDetail])
async def search_books(book_id: int):
    query = Book.objects.filter(bookid=book_id)
    return await query.all()


@app.get("/show-cart/{shoppingcart_id}", response_model=Dict[int, List[ShoppingCartList]])
async def show_cart(shoppingcart_id: int):
    cart_items = await CartList.objects.select_related("bookid").filter(shoppingcartid=shoppingcart_id).all()

    categorized_books = {}
    for item in cart_items:
        seller_id = item.bookid.sellerid

        if seller_id not in categorized_books:
            categorized_books[seller_id] = []

        cart_details = ShoppingCartList(
            name=item.bookid.name,
            bookpicture=item.bookid.bookpicture,
            price=item.bookid.price,
        )
        categorized_books[seller_id].append(cart_details)
    return categorized_books


@app.post("/add-to-cart/{cart_id}")
async def add_to_cart(cart_id: int, book_id: int):
    item_exists = await CartList.objects.filter(shoppingcartid=cart_id, bookid=book_id).exists()
    if item_exists:
        return {"message": "Book already exists in the cart"}

    book = await Book.objects.get_or_none(bookid=book_id)
    if book:
        await CartList.objects.create(shoppingcartid=cart_id, bookid=book_id)
        return {"message": "Successfully added!"}
    return {"message": "Book not found"}


@app.delete("/remove-from-cart/{card_id}/{book_id}")
async def remove_from_cart(cart_id: int, book_id: int):
    item_exists = await CartList.objects.filter(shoppingcartid=cart_id, bookid=book_id).exists()

    if not item_exists:
        return {"message": f"Book {book_id} not found in cart {cart_id}"}

    deleted_item = await CartList.objects.filter(shoppingcartid=cart_id, bookid=book_id).delete()
    if deleted_item == 0:
        return {"message": f"Book {book_id} not found in cart {cart_id}"}
    else:
        return {"message": f"Successfully remove book {book_id} from cart {cart_id}"}
