from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from passlib.context import CryptContext
from datetime import datetime, timedelta, date
from jose import JWTError, jwt
from typing import Optional, List, Dict
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import init_db, get_session, Book, Picture_List, Shopping_Cart, Cart_List, Member, Seller
from app.models import BookSearch, BookDetail, ShoppingCartList, Token
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


async def get_current_user(token: str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.secret_key,
                             algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/")
async def read_root():
    return "testroot"


@app.post("/register")
async def register(member: Member, session: AsyncSession = Depends(get_session)):
    hashed_password = get_password_hash(member.password)
    member = Member(
        memberaccount=member.memberaccount,
        password=hashed_password,
        name=member.name,
        gender=member.gender,
        phone=member.phone,
        email=member.email,
        birthdate=date.fromisoformat(member.birthdate),
        verified="未認證",
        usertype="Standard"
    )
    session.add(member)
    await session.commit()
    await session.refresh(member)

    return member


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    # OAuth2PasswordRequestForm 會生成讓用戶輸入帳號和密碼的表格
    user = await session.scalars(select(Member).where(Member.memberaccount == form_data.username))
    user = user.first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 設定令牌過期時間
    access_token_expires = timedelta(
        minutes=settings.access_token_expire_minutes)
    # 創建令牌
    access_token = create_access_token(
        data={"sub": user.memberaccount}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/books/", response_model=list[BookSearch])
async def search_books_by_order(
    name: str = Query(None, min_length=3),
    sort_by: Optional[str] = Query(None, description='sorting option'),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    session: AsyncSession = Depends(get_session)
):
    query = select(Book).where(
        Book.name.contains(name), Book.state == 'on sale')

    if sort_by == 'price_ascending':
        query = query.order_by(Book.price)
    elif sort_by == 'price_descending':
        query = query.order_by(Book.price.desc())

    if min_price is not None and max_price is not None:

        query = query.where(Book.price >= min_price, Book.price <= max_price)

    books = await session.scalars(query)

    book_list = []
    for book in books:
        picture = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
        picture = picture.first()
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


@app.get("/user/books")
async def get_user_books(token: str, session: AsyncSession = Depends(get_session)):
    # 根據 user_id 獲取 Seller
    token = await get_current_user(token)
    user = await session.scalars(select(Member).where(Member.memberaccount == token))
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    seller = await session.scalars(select(Seller).where(Seller.sellerid == user.userid))
    seller = seller.first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    books = await session.scalars(select(Book).where(Book.sellerid == seller.sellerid))
    books = books.all()
    return books


@app.get("/books/{book_id}", response_model=BookDetail)
async def get_book_details(book_id: int, session: AsyncSession = Depends(get_session)):
    book = await session.scalars(select(Book).where(Book.bookid == book_id))
    book = book.first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    pictures = await session.scalars(select(Picture_List).where(Picture_List.bookid == book_id))
    pictures = pictures.all()
    return BookDetail(
        sellerid=book.sellerid,
        isbn=book.isbn,
        name=book.name,
        condition=book.condition,
        price=book.price,
        shippinglocation=book.shippinglocation,
        shippingmethod=book.shippingmethod,
        description=book.description,
        category=book.category,
        bookpictures=[p.picturepath for p in pictures]
    )


@app.get("/img/{imgfilename}")
async def get_imgs(imgfilename: str):
    return FileResponse(f"./img/{imgfilename}")


@app.get("/show-cart", response_model=Dict[int, List[ShoppingCartList]])
async def show_cart(token: str, session: AsyncSession = Depends(get_session)):
    token = await get_current_user(token)
    user = await session.scalars(select(Member).where(Member.memberaccount == token))
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart. customerid == user.userid))
    shoppingCart = shoppingCart.first()
    if not shoppingCart:
        raise HTTPException(status_code=404, detail="shoppingCart not found")

    cart_items = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == shoppingCart.shoppingcartid))
    cart_items = cart_items.all()

    categorized_books = {}
    for item in cart_items:
        book = await session.scalars(select(Book).where(Book.bookid == item.bookid))
        book = book.first()
        seller_id = book.sellerid
        if seller_id not in categorized_books:
            categorized_books[seller_id] = []

        picture = await session.scalars(select(Picture_List).where(Picture_List.bookid == item.bookid).order_by(Picture_List.pictureid))
        picture = picture.first()
        cart_details = ShoppingCartList(
            name=book.name,
            picturepath=picture.picturepath if picture else "",
            price=book.price
        )
        categorized_books[seller_id].append(cart_details)
    return categorized_books


@app.post("/add-to-cart/{book_id}")
async def add_to_cart(token: str, book_id: int, session: AsyncSession = Depends(get_session)):
    token = await get_current_user(token)
    user = await session.scalars(select(Member).where(Member.memberaccount == token))
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart.customerid == user.userid))
    shoppingCart = shoppingCart.first()

    if not shoppingCart:
        Cart = Shopping_Cart(customerid=user.userid)
        session.add(Cart)
        await session.commit()
        await session.refresh(Cart)
    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart.customerid == user.userid))
    shoppingCart = shoppingCart.first()

    item_exists = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == shoppingCart.shoppingcartid, Cart_List.bookid == book_id))
    item_exists = item_exists.first() is not None
    if item_exists:
        return {"message": "Book already exists in the cart"}

    book = await session.scalars(select(Book).where(Book.bookid == book_id))
    book = book.first()
    if book:
        new_item = Cart_List(
            shoppingcartid=shoppingCart.shoppingcartid, bookid=book.bookid)
        session.add(new_item)
        await session.commit()
        await session.refresh(new_item)
        return {"message": "Successfully added!"}
    return {"message": "Book not found"}


@app.delete("/remove-from-cart/{book_id}")
async def remove_from_cart(token: str, book_id: int, session: AsyncSession = Depends(get_session)):
    token = await get_current_user(token)
    user = await session.scalars(select(Member).where(Member.memberaccount == token))
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart. customerid == user.userid))
    shoppingCart = shoppingCart.first()
    if not shoppingCart:
        raise HTTPException(status_code=404, detail="shoppingCart not found")

    item_exists = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == Shopping_Cart. shoppingcartid, Cart_List.bookid == book_id))
    item_exists = item_exists.first()

    if not item_exists:
        return {"message": f"Book {book_id} not found in cart {Shopping_Cart. shoppingcartid}"}

    await session.delete(item_exists)
    await session.commit()

    item_still_exists = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == Shopping_Cart. shoppingcartid, Cart_List.bookid == book_id))
    item_still_exists = item_still_exists.first()
    if item_still_exists:
        return {"message": f"Failed to remove book {book_id} from cart {Shopping_Cart. shoppingcartid}"}
    else:
        return {"message": f"Successfully removed book {book_id} from cart {Shopping_Cart. shoppingcartid}"}
