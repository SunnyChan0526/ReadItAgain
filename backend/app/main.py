from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from app.db import database, Book, PictureList, ShoppingCart, CartList

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
    condition: str
    price: int
    shippinglocation: str
    picturepath: str


class BookDetail(BaseModel):
    sellerid: int
    isbn: str
    name: str
    condition: str
    price: int
    shippinglocation: str
    shippingmethod: str
    description: str
    category: str
    bookpictures: list


class ShoppingCartList(BaseModel):
    name: str
    bookpicture: str
    price: int


@app.get("/books/", response_model=list[BookSearch])
async def search_books_by_order(
    name: str = Query(None, min_length=3),
    sort_by: Optional[str] = Query(None, description='sorting option'),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price")
):
    query = Book.objects.filter(name__icontains=name).filter(state='on sale')
    
    if sort_by == 'price_ascending':
        query = query.order_by('price')
    elif sort_by == 'price_descending':
        query = query.order_by('-price')

    if min_price is not None and max_price is not None:

        query = query.filter(price__gte=min_price, price__lte=max_price)

    books = await query.all()

    book_list = []
    for book in books:
        picture = await PictureList.objects.filter(bookid=book.bookid).order_by('pictureid').first()
        picture_path = picture.picturepath if picture else ""

        book_search = BookSearch(
            name=book.name,
            condition=book.condition,
            price=book.price,
            shippinglocation=book.shippinglocation,
            picturepath=picture_path
        )
        book_list.append(book_search)

    return book_list


@app.get("/books/{book_id}", response_model=BookDetail)
async def get_book_details(book_id: int):
    query = await Book.objects.filter(bookid=book_id).get()
    picture = await PictureList.objects.filter(bookid=book_id).all()
    return BookDetail(
        sellerid=query.sellerid,
        isbn=query.isbn,
        name=query.name,
        condition=query.condition,
        price=query.price,
        shippinglocation=query.shippinglocation,
        shippingmethod=query.shippingmethod,
        description=query.description,
        category=query.category,
        bookpictures=[p.picturepath for p in picture]
    )


@app.get("/img/{imgfilename}")
async def get_imgs(imgfilename: str):
    return FileResponse(f"./img/{imgfilename}")


@app.get("/show-cart/{shoppingcart_id}", response_model=Dict[int, List[ShoppingCartList]])
async def show_cart(shoppingcart_id: int):
    cart_items = await CartList.objects.select_related("bookid").filter(shoppingcartid=shoppingcart_id).all()

    categorized_books = {}
    for item in cart_items:
        seller_id = item.bookid.sellerid

        if seller_id not in categorized_books:
            categorized_books[seller_id] = []

        picture = await PictureList.objects.filter(bookid=item.bookid).order_by('pictureid').first()
        cart_details = ShoppingCartList(
            name=item.bookid.name,
            bookpicture=picture.picturepath,
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