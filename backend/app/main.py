from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, Depends, HTTPException, status, Security, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from passlib.context import CryptContext
from datetime import datetime, timedelta, date
from jose import JWTError, jwt
from typing import Optional, List, Dict
from sqlmodel import select
from sqlalchemy import update, insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import init_db, get_session, Book, Picture_List, Shopping_Cart, Cart_List, Member, Seller, Customer, Address_List, Orders
from app.models import BookSearch, BookDetail, ShoppingCartList, Token, Profile, Address, AddressCreate, AddressEdit
from .config import settings
import shutil
import os


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


async def get_current_user_data(token: str, session: AsyncSession = Depends(get_session)):
    token = await get_current_user(token)
    user = await session.scalars(select(Member).where(Member.memberaccount == token))
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def show_cart(token: str, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)

    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart.customerid == user.userid))
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


@app.get("/")
async def read_root():
    return "testroot"


@app.get("/img")
async def get_imgs(type: str, imgfilename: str):
    if (type == 'book'):
        return FileResponse(f"./img/book/{imgfilename}")
    elif (type == 'avatar'):
        return FileResponse(f"./img/avatar/{imgfilename}")

# Authentication and Authorization


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
        usertype="Standard",
        profilepicture="default.jpg"
    )
    session.add(member)
    await session.commit()
    await session.refresh(member)
    stmt = insert(Seller).values(sellerid=member.userid)
    await session.execute(stmt)
    await session.commit()
    stmt = insert(Customer).values(customerid=member.userid)
    await session.execute(stmt)
    await session.commit()
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

# book search


@app.get("/books", response_model=list[BookSearch])
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
    user = await get_current_user_data(token, session)

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

# shopping cart


@app.get("/show-cart/seller")
async def seller_in_cart(token: str, session: AsyncSession = Depends(get_session)):
    cart = await show_cart(token, session)
    seller_id = list(cart.keys())
    seller_name_list = []
    for i in seller_id:
        seller_name = await session.scalars(select(Member.name).where(Member.userid == i))
        seller_name_list.append(seller_name.first())
    return seller_name_list


@app.get("/show-cart/books", response_model=list[ShoppingCartList])
async def books_in_cart(seller_id: int, token: str, session: AsyncSession = Depends(get_session)):
    cart = await show_cart(token, session)
    return cart[seller_id]


@app.post("/add-to-cart/{book_id}")
async def add_to_cart(token: str, book_id: int, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)

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
    user = await get_current_user_data(token, session)

    shoppingCart = await session.scalars(select(Shopping_Cart).where(Shopping_Cart.customerid == user.userid))
    shoppingCart = shoppingCart.first()
    if not shoppingCart:
        raise HTTPException(status_code=404, detail="shoppingCart not found")

    item_exists = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == shoppingCart.shoppingcartid, Cart_List.bookid == book_id))
    item_exists = item_exists.first()

    if not item_exists:
        return {"message": f"Book {book_id} not found in cart {shoppingCart.shoppingcartid}"}

    await session.delete(item_exists)
    await session.commit()

    item_still_exists = await session.scalars(select(Cart_List).where(Cart_List.shoppingcartid == shoppingCart.shoppingcartid, Cart_List.bookid == book_id))
    item_still_exists = item_still_exists.first()
    if item_still_exists:
        return {"message": f"Failed to remove book {book_id} from cart {shoppingCart.shoppingcartid}"}
    else:
        return {"message": f"Successfully removed book {book_id} from cart {shoppingCart.shoppingcartid}"}

# my account


@app.post("/change_password")
async def change_password(
        token: str,
        origin_password: str = Query(None),
        new_password: str = Query(None),
        new_password_check: str = Query(None),
        session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    if (verify_password(origin_password, user.password)):
        if (new_password == new_password_check):
            hashed_password = get_password_hash(new_password)
            stmt = update(Member).where(Member.userid ==
                                        user.userid).values(password=hashed_password)
            await session.execute(stmt)
            await session.commit()
            return {"OK! origin password": origin_password, "new password": new_password}
        else:
            return "The new passwords entered are different"
    else:
        return "the origin password is incorrect"

# profile


@app.get("/profile/view", response_model=Profile)
async def view_profile(token: str, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    return Profile(
        userid=user.userid,
        name=user.memberaccount,
        email=user.email,
        phone=user.phone,
        gender=user.gender,
        birthdate=user.birthdate,
        profilepicture=user.profilepicture
    )


@app.patch("/profile/edit")
async def edit_profile(token: str,
                       session: AsyncSession = Depends(get_session),
                       name_input: str = Query(None),
                       email_input: str = Query(None),
                       phone_input: str = Query(None),
                       gender_input: str = Query(None),
                       birthdate_input: date = Query(None)):
    user = await get_current_user_data(token, session)
    if name_input:
        stmt = update(Member).where(Member.userid ==
                                    user.userid).values(memberaccount=name_input)
        await session.execute(stmt)
    if email_input:
        stmt = update(Member).where(Member.userid ==
                                    user.userid).values(email=email_input)
        await session.execute(stmt)
    if phone_input:
        stmt = update(Member).where(Member.userid ==
                                    user.userid).values(phone=phone_input)
        await session.execute(stmt)
    if gender_input:
        stmt = update(Member).where(Member.userid ==
                                    user.userid).values(gender=gender_input)
        await session.execute(stmt)
    if birthdate_input:
        stmt = update(Member).where(Member.userid == user.userid).values(
            birthdate=birthdate_input)
        await session.execute(stmt)

    await session.commit()
    return user


@app.post("/profile/upload_avatar")
async def upload_avatar(
    token: str,
    avatar: UploadFile,
    session: AsyncSession = Depends(get_session)
):
    user = await get_current_user_data(token, session)

    if avatar.content_type in ("image/jpg", "image/jpeg", "image/png"):
        img_type = avatar.content_type.split('/')[1]
        file_location = f"./img/avatar/{user.memberaccount}.{img_type}"
        with open(file_location, "wb") as file_object:
            shutil.copyfileobj(avatar.file, file_object)

        # 更新用戶的 ProfilePicture
        if user.profilepicture != 'default.jpg':
            old_file_location = f"./img/avatar/{user.profilepicture}"
            if os.path.exists(old_file_location):
                os.remove(old_file_location)
        user.profilepicture = f"{user.memberaccount}.{img_type}"
        await session.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="avatar should be an image")

    return {"message": "avatar upload successfully"}

# address


@app.get("/address/show", response_model=Dict[str, List[Address]])
async def show_address(token: str, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    addresses = await session.scalars(select(Address_List).where(Address_List.customerid == user.userid))
    addresses = addresses.all()
    if not addresses:
        return {}
    # shippingoption: list[address]
    categorized_addresses = {}
    for addr in addresses:
        opt = addr.shippingoption

        if opt not in categorized_addresses:
            categorized_addresses[opt] = []
        categorized_addresses[opt].append(
            Address(
                addressid=addr.addressid,
                address=addr.address,
                defaultaddress=addr.defaultaddress
            )
        )
    return categorized_addresses


@app.post("/address/create", response_model=Address_List)
async def create_address(token: str, address: AddressCreate, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)

    # 創建 Address 物件
    new_address = Address_List(customerid=user.userid, **address.dict())

    # 將新地址新增到資料庫中
    session.add(new_address)
    await session.commit()

    return new_address


@app.patch("/address/edit/{address_id}")
async def edit_address(token: str, address: AddressEdit, address_id: int, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    if address.address:
        stmt = update(Address_List).where(Address_List.customerid == user.userid,
                                          Address_List.addressid == address_id).values(address=address.address)
        await session.execute(stmt)
    if address.defaultaddress:
        stmt = update(Address_List).where(Address_List.customerid == user.userid,
                                          Address_List.addressid == address_id).values(defaultaddress=address.defaultaddress)
        await session.execute(stmt)
    if address.shippingoption:
        stmt = update(Address_List).where(Address_List.customerid == user.userid,
                                          Address_List.addressid == address_id).values(shippingoption=address.shippingoption)
        await session.execute(stmt)

    await session.commit()
    return f"edit address {address_id} OK!"


@app.delete("/address/delete/{address_id}")
async def remove_from_address(token: str, address_id: int, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    address = await session.scalars(select(Address_List).where(Address_List.customerid == user.userid, Address_List.addressid == address_id))
    address = address.first()
    if not address:
        raise HTTPException(
            status_code=404, detail=f"address {address_id} not found")

    await session.delete(address)
    await session.commit()

    address_still_exists = await session.scalars(select(Address_List).where(Address_List.customerid == user.userid, Address_List.addressid == address_id))
    address_still_exists = address_still_exists.first()
    if address_still_exists:
        return {"message": f"Failed to remove address {address_id}"}
    else:
        return {"message": f"Successfully removed address {address_id}"}

# order


# seller-page (for customer)
async def get_seller_info(seller_id: int, session: AsyncSession = Depends(get_session)):
    seller = await session.scalars(select(Seller).where(Seller.sellerid == seller_id))
    seller = seller.first()

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    member = await session.scalars(select(Member).where(Member.userid == seller.sellerid))
    member = member.first()

    seller_info = {
        "seller_name": member.memberaccount,
        "seller_avatar": member.profilepicture
    }
    return seller_info


@app.get("/seller/{seller_id}/store")
async def get_seller_store(
    seller_id: int,
    sort_by: Optional[str] = Query(None, description='Sorting option'),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    session: AsyncSession = Depends(get_session)
):
    seller_info = await get_seller_info(seller_id, session)

    query = select(Book).where(Book.sellerid ==
                               seller_id, Book.state == 'on sale')

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

        book_detail = {
            "name": book.name,
            "price": book.price,
            "shippinglocation": book.shippinglocation,
            "picturepath": picture_path
        }
        book_list.append(book_detail)

    return {"seller_info": seller_info, "books": book_list}


# orders
@app.get("/customer/orders")
async def view_order_list_customer(token: str,  session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)

    customer = await session.scalars(select(Customer).where(Customer.customerid == user.userid))
    customer = customer.first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    orders = await session.scalars(select(Orders).where(Orders.customerid == customer.customerid))
    orders = orders.all()

    orderlist = []
    for order in orders:
        book = await session.scalars(select(Book).where(Book.orderid == order.orderid))
        book = book.first()

        picture_path = ""
        if book and book.orderid is not "null":
            picture = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
            picture = picture.first()
            picture_path = picture.picturepath if picture else ""

        order_list = {
            "orderid": order.orderid,
            "sellerid": order.sellerid,
            "bookname": book.name if book else "",
            # "price": book.price if book else 0,
            "totalbookcount": order.totalbookcount,
            "totalamount": order.totalamount,
            "bookpicturepath": picture_path
        }
        orderlist.append(order_list)
    return orderlist


@app.get("/seller/orders")
async def view_order_list_seller(token: str,  session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)

    seller = await session.scalars(select(Seller).where(Seller.sellerid == user.userid))
    seller = seller.first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    orders = await session.scalars(select(Orders).where(Orders.sellerid == seller.sellerid))
    orders = orders.all()

    orderlist = []
    for order in orders:
        book = await session.scalars(select(Book).where(Book.orderid == order.orderid))
        book = book.first()

        picture_path = ""
        if book and book.orderid is not "null":
            picture = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
            picture = picture.first()
            picture_path = picture.picturepath if picture else ""

        order_list = {
            "orderid": order.orderid,
            "sellerid": order.sellerid,
            "bookname": book.name if book else "",
            # "price": book.price if book else 0,
            "totalbookcount": order.totalbookcount,
            "totalamount": order.totalamount,
            "bookpicturepath": picture_path
        }
        orderlist.append(order_list)
    return orderlist
