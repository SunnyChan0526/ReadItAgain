from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, Depends, HTTPException, status, Security, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from passlib.context import CryptContext
from datetime import datetime, timedelta, date
from jose import JWTError, jwt
from typing import Optional, List, Dict
from sqlmodel import select
from sqlalchemy import update, insert, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.db import init_db, get_session, Book, Picture_List, Shopping_Cart, Cart_List, Member, Seller, Customer, Address_List, Discount, Orders, Applied_List
from app.models import BookInfo, BookSearch, BookDetail, ShoppingCartList, Token, Profile, Address, AddressCreate, AddressEdit, DiscountInfo, CheckoutList, ShippingMethod, CouponCreate, CouponEdit
from .config import settings
from datetime import datetime
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
        cart_details = BookInfo(
            bookid=book.bookid,
            sellerid=book.sellerid,
            orderid=book.orderid,
            discountcode=book.discountcode,
            isbn=book.isbn,
            shippinglocation=book.shippinglocation,
            name=book.name,
            condition=book.condition,
            price=book.price,
            description=book.description,
            category=book.category,
            state=book.state,
            picturepath=picture.picturepath if picture else ""
        )
        categorized_books[seller_id].append(cart_details)
    return categorized_books


async def checkout(seller_id: int, shipping_options: str, selected_coupons: list[DiscountInfo], token: str, session: AsyncSession = Depends(get_session)):
    seller_name = await session.scalars(select(Member.name).where(Member.userid == seller_id))
    seller_name = seller_name.first()
    cart = await show_cart(token, session)
    books = []
    for i in cart[seller_id]:
        book = ShoppingCartList(
            name=i.name,
            picturepath=i.picturepath,
            price=i.price
        )
        books.append(book)
    books_total_price = sum(i.price for i in books)
    if shipping_options == '7-ELEVEN' or shipping_options == '全家':
        shipping_fee = 60
    elif shipping_options == '快遞':
        shipping_fee = 120
    elif shipping_options == '面交':
        shipping_fee = 0
    else:
        raise HTTPException(status_code=404, detail="unvalid shipping option")

    discount_price = 0
    for coupon in selected_coupons:
        if coupon.type == 'seasoning':
            if coupon.discountrate >= 1:
                discount_price = coupon.discountrate
            else:
                discount_price = books_total_price * (1 - coupon.discountrate)
        elif coupon.type == 'shipping fee':
            shipping_fee = 0
    return CheckoutList(seller_name=seller_name,
                        books=books,
                        total_book_count=len(books),
                        books_total_price=books_total_price,
                        shipping_options=shipping_options,
                        shipping_fee=shipping_fee,
                        coupon_name=[i.name for i in selected_coupons],
                        total_amount=books_total_price+shipping_fee-discount_price)


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
    result = []
    for i in cart[seller_id]:
        book = ShoppingCartList(
            name=i.name,
            picturepath=i.picturepath,
            price=i.price
        )
        result.append(book)
    return result


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


# , response_model=Dict[str, List[DiscountInfo]]
@app.get("/checkout/select-coupon/{seller_id}")
async def select_coupon(
    token: str,
    seller_id: int,
    # totalcost: int,
    # book_ids: list[int] = Query(None, description='bookid in shopping cart'),
    session: AsyncSession = Depends(get_session)
):
    rst = {
        "special event": list(),
        "seasoning": list(),
        "shipping fee": list()
    }
    cart = await show_cart(token, session)
    book_rows = cart[seller_id]

    # 找出所有購物車book的row、所有買家擁有的coupon、購物車中可以applied的優惠券的code
    coupon_query = await session.scalars(select(Discount).where(Discount.sellerid == seller_id))
    special_event_discountcode_list = []
    totalcost = 0
    for book in book_rows:
        totalcost += book.price
        if book.discountcode:
            special_event_discountcode_list.append(book.discountcode)
        if book.sellerid != seller_id:
            raise HTTPException(
                status_code=400, detail=f"Book with ID {book.bookid} does not belong to seller {seller_id}")

    # 將符合的優惠券append到rst
    current_time = datetime.now()
    for coupon in coupon_query:
        if (not coupon.startdate < current_time < coupon.enddate) or not coupon.isactivated:  # 過期了
            continue
        info = DiscountInfo(
            discountcode=coupon.discountcode,
            name=coupon.name,
            type=coupon.type,
            description=coupon.description,
            startdate=coupon.startdate,
            enddate=coupon.enddate,
            discountrate=coupon.discountrate,
            eventtag=coupon.eventtag,
            minimumamountfordiscount=coupon.minimumamountfordiscount,
            isable=True
        )
        if coupon.type == 'special event':
            if coupon.discountcode in special_event_discountcode_list:
                rst['special event'].append(info)
        elif coupon.type == 'seasoning':
            info.isable = True if totalcost >= coupon.minimumamountfordiscount else False
            rst['seasoning'].append(info)
        elif coupon.type == 'shipping fee':
            info.isable = True if totalcost >= coupon.minimumamountfordiscount else False
            rst['shipping fee'].append(info)
    return rst


# checkout
@app.post("/checkout/{seller_id}", response_model=CheckoutList)
async def checkout_interface(seller_id: int, shipping_options: str, selected_coupons: list[DiscountInfo], token: str, session: AsyncSession = Depends(get_session)):
    return await checkout(seller_id, shipping_options, selected_coupons, token, session)


@app.get("/checkout/{seller_id}/shipping_method", response_model=Dict[str, List[ShippingMethod]])
async def checkout_discount(seller_id: int, token: str, session: AsyncSession = Depends(get_session)):
    user = await get_current_user_data(token, session)
    sql_query = f'''
                    select ADDRESS_LIST.ShippingOption, ADDRESS_LIST.Address, ADDRESS_LIST.DefaultAddress
                    from ADDRESS_LIST
                    where ADDRESS_LIST.ShippingOption in ( select SHIPPINGMETHOD_LIST.ShippingMethod
                                                        from SHIPPINGMETHOD_LIST
                                                        where SHIPPINGMETHOD_LIST.SellerID = {seller_id}) 
                    and ADDRESS_LIST.CustomerID = {user.userid}
                '''
    result = await session.execute(text(sql_query))
    result = result.fetchall()
    return_data = {}
    for row in result:
        shipping_method = row[0]
        address = row[1]
        default_address = row[2]
        if shipping_method not in return_data:
            return_data[shipping_method] = []
        return_row = ShippingMethod(
            address=address,
            defaultaddress=default_address
        )
        return_data[shipping_method].append(return_row)
    return return_data


@app.post("/checkout-to-order/{seller_id}")
async def order_create(seller_id: int, shipping_options: str, selected_coupons: list[DiscountInfo], token: str, session: AsyncSession = Depends(get_session)):
    checkout_data = await checkout(seller_id, shipping_options, selected_coupons, token, session)
    user = await get_current_user_data(token, session)
    stmt = insert(Orders).values(sellerid=seller_id, customerid=user.userid, orderstatus='To ship',
                                 time=datetime.now(), totalamount=checkout_data.total_amount, totalbookcount=checkout_data.total_book_count
                                 )
    await session.execute(stmt)
    await session.commit()
    orders = await session.scalars(select(Orders).order_by(desc(Orders.orderid)))
    orders = orders.first()

    cart = await show_cart(token, session)
    book_rows = cart[seller_id]
    for book in book_rows:
        sql_update = f'''
                        update BOOK
                        set OrderID = {orders.orderid}
                        where BookID = {book.bookid}
                      '''
        await session.execute(text(sql_update))
        await session.commit()
    for coupon in selected_coupons:
        stmt = insert(Applied_List).values(
            orderid=orders.orderid, discountcode=coupon.discountcode)
        await session.execute(stmt)
        await session.commit()
    return orders


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
async def get_current_customer(token: str, session: AsyncSession):
    user = await get_current_user_data(token, session)
    customer = await session.scalars(select(Customer).where(Customer.customerid == user.userid))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer.first()


async def get_current_seller(token: str, session: AsyncSession):
    user = await get_current_user_data(token, session)
    seller = await session.scalars(select(Seller).where(Seller.sellerid == user.userid))
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller.first()


async def get_book_details(session: AsyncSession, order_id: int):
    books = await session.scalars(select(Book).where(Book.orderid == order_id))
    books = books.all()

    book_details = []
    for book in books:
        picture_path = ""
        if book and book.orderid is not None:
            pictures = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
            picture = pictures.first()
            picture_path = picture.picturepath if picture else ""

        book_detail = {
            "bookname": book.name if book else "",
            "bookpicturepath": picture_path,
            "price": book.price if book else 0,
        }
        book_details.append(book_detail)

    return book_details


@app.get("/customer/orders")
async def view_order_list_customer(
    token: str,
    order_status: Optional[str] = Query(None, description='order status'),
    keyword_type: Optional[str] = Query(None, description='keyword type'),
    keyword: Optional[str] = Query(None, description='keyword'),
    session: AsyncSession = Depends(get_session),
):
    customer = await get_current_customer(token, session)

    orders = await session.scalars(select(Orders).where(Orders.customerid == customer.customerid))
    orders = orders.all()

    orderlist = []
    for order in orders:
        if order_status and order_status != 'All' and order.orderstatus != order_status:
            continue

        book_details = await get_book_details(session, order.orderid)
        if keyword_type == 'Book name' and keyword:
            book_names = [book['bookname'] for book in book_details]
            if keyword not in book_names:
                continue

        order_list = {
            "orderid": order.orderid,
            "orderstatus": order.orderstatus,
            "sellerid": order.sellerid,
            "books": book_details,
            "totalbookcount": order.totalbookcount,
            "totalamount": order.totalamount,
        }
        orderlist.append(order_list)
    return orderlist


@app.get("/seller/orders")
async def view_order_list_seller(
    token: str,
    order_status: Optional[str] = Query(None, description='order status'),
    keyword_type: Optional[str] = Query(None, description='keyword type'),
    keyword: Optional[str] = Query(None, description='keyword'),
    session: AsyncSession = Depends(get_session),
):
    seller = await get_current_seller(token, session)

    orders = await session.scalars(select(Orders).where(Orders.sellerid == seller.sellerid))
    orders = orders.all()

    orderlist = []
    for order in orders:
        if order.orderstatus != 'All' and order.orderstatus != order_status:
            continue

        book_details = await get_book_details(session, order.orderid)
        if keyword_type == 'Book name' and keyword:
            book_names = [book['bookname'] for book in book_details]
            if keyword not in book_names:
                continue

        order_list = {
            "orderid": order.orderid,
            "orderstatus": order.orderstatus,
            "customerid": order.customerid,
            "books": book_details,
            "totalbookcount": order.totalbookcount,
            "totalamount": order.totalamount,
        }
        orderlist.append(order_list)
    return orderlist


async def get_order_details(session: AsyncSession, user_type: str, user_id: int, order_id: int):
    order_query = None
    if user_type == "customer":
        order_query = select(Orders).where(
            Orders.customerid == user_id, Orders.orderid == order_id)
    elif user_type == "seller":
        order_query = select(Orders).where(
            Orders.sellerid == user_id, Orders.orderid == order_id)

    order = await session.scalars(order_query)
    order = order.first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    books = await session.scalars(select(Book).where(Book.orderid == order.orderid))
    books = books.all()

    book_details = []
    for book in books:
        picture_path = ""
        if book and book.orderid is not None:
            pictures = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
            picture = pictures.first()
            picture_path = picture.picturepath if picture else ""

        book_detail = {
            "bookid": book.bookid,
            "bookname": book.name if book else "",
            "bookpicturepath": picture_path,
            "price": book.price if book else 0,
        }
        book_details.append(book_detail)

    order_detail = {
        "orderid": order.orderid,
        **({"sellerid": order.sellerid} if user_type == "customer" and order.sellerid else {}),
        **({"customerid": order.customerid} if user_type == "seller" and order.customerid else {}),
        "books": book_details,
        "totalbookcount": order.totalbookcount,
        "totalamount": order.totalamount,
        "orderstatus": order.orderstatus,
        "time": order.time
    }
    return order_detail


@app.get("/customer/orders/{order_id}")
async def get_order_details_customer(token: str,  order_id: int, session: AsyncSession = Depends(get_session)):
    customer = await get_current_customer(token, session)
    order_detail = await get_order_details(session, "customer", customer.customerid, order_id)
    return order_detail


@app.get("/seller/orders/{order_id}")
async def get_order_details_seller(token: str, order_id: int, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)
    order_detail = await get_order_details(session, "seller", seller.sellerid, order_id)
    return order_detail


@app.get("/seller/orders/{order_id}/comment")
async def view_comment_for_seller(token: str,  order_id: int, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)
    comment = await session.scalar(select(Orders.comment).where(Orders.orderid == order_id, Orders.sellerid == seller.sellerid))
    stars = await session.scalar(select(Orders.stars).where(Orders.orderid == order_id))

    if comment is None and stars is None:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"comment": comment, "stars": stars}


@app.post("/update_orders_status/{person}/{order_id}")
async def update_orders(person: str, order_id: int, token: str, session: AsyncSession = Depends(get_session)):
    if person == 'seller':
        seller = await get_current_seller(token, session)
        current_status = await session.scalars(select(Orders.orderstatus).where(Orders.orderid == order_id, Orders.sellerid == seller.sellerid))
        if current_status == 'To ship':
            next_status = 'Shipping'
        elif current_status == 'Shipping':
            next_status = 'Completed'
        elif current_status == 'Completed':
            next_status = 'Completed'
        else:
            raise HTTPException(
                status_code=400, detail="Invalid order status to proceed.")
    elif person == 'customer':
        customer = await get_current_customer(token, session)
        current_status = await session.scalars(select(Orders.orderstatus).where(Orders.orderid == order_id, Orders.customerid == customer.customerid))
        if current_status == 'Shipping':
            next_status = 'Completed'
        elif current_status == 'Completed':
            next_status = 'Completed'
        else:
            raise HTTPException(
                status_code=400, detail="Invalid order status to proceed. Customer only can update to 'Completed' status")
    else:
        raise HTTPException(
            status_code=400, detail="Invalid person role provided")

    sql_update = f'''
                    update ORDERS
                    set OrderStatus = '{next_status}'
                    where OrderID = {order_id}
                    '''
    await session.execute(text(sql_update))
    await session.commit()
    sql_query = f'''
                    select * 
                    from ORDERS
                    where OrderID = {order_id}
                '''
    order = await session.execute(text(sql_query))
    order = order.first()
    order_detail = {
        "orderid": order.orderid,
        "sellerid": order.sellerid,
        "totalbookcount": order.totalbookcount,
        "totalamount": order.totalamount,
        "orderststus": order.orderstatus,
        "time": order.time
    }
    return order_detail


async def get_order(person: str, order_id: int, token: str, session: AsyncSession = Depends(get_session)):
    if person == 'customer':
        customer = await get_current_customer(token, session)
        order = await session.scalars(select(Orders).where(Orders.orderid == order_id, Orders.customerid == customer.customerid))
    elif person == 'seller':
        seller = await get_current_seller(token, session)
        order = await session.scalars(select(Orders).where(Orders.orderid == order_id, Orders.sellerid == seller.sellerid))
    else:
        raise HTTPException(
            status_code=400, detail="Invalid person role provided")
    order = order.first()
    return order


@app.post("/cancel_orders_pr/{person}/{order_id}")
async def cancel_orders_pr(person: str, order_id: int, token: str, session: AsyncSession = Depends(get_session)):
    order = await get_order(person, order_id, token, session)
    if order:
        order.orderstatus = "Cancelling"
        await session.commit()
        return {"message": f"Pending of order {order_id} cancellation successfully"}
    else:
        raise HTTPException(status_code=404, detail="Order not found")


@app.post("/cancel_orders/{person}/{order_id}")
async def cancel_orders(person: str, order_id: int, reason: str, is_accepted: bool, token: str, session: AsyncSession = Depends(get_session)):
    order = await get_order(person, order_id, token, session)
    if order:
        if is_accepted:
            order.orderstatus = "Cancelled"
            order.cancellationreason = reason
            await session.commit()
            return {"message": f"Order {order_id} cancelled successfully."}
        else:
            return {"message": f"Order {order_id} cancellation request denied."}
    else:
        raise HTTPException(status_code=404, detail="Order not found")


@app.post("/comment/{order_id}")
async def customer_comment(
        token: str,
        order_id: int,
        stars_input: int,
        comment_input: str,
        session: AsyncSession = Depends(get_session)):
    customer = await get_current_customer(token, session)
    order = await session.scalars(
        select(Orders).where(Orders.orderid == order_id, Orders.customerid == customer.customerid))
    order = order.first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.orderstatus == "Completed":
        stmt = update(Orders).where(Orders.orderid == order.orderid).values(
            comment=comment_input, stars=stars_input)
        await session.execute(stmt)
        await session.commit()
        return {"OK! Comment has been upload!"}
    else:
        return {"The order has not finished!"}


# seller-coupon
def coupon_to_dict(coupon, coupons_dict):
    info = {
        'discountcode': coupon.discountcode,
        'name': coupon.name,
        'type': coupon.type,
        'description': coupon.description,
        'startdate': coupon.startdate,
        'enddate': coupon.enddate,
        'discountrate': coupon.discountrate,
        'eventtag': coupon.eventtag,
        'minimumamountfordiscount': coupon.minimumamountfordiscount
    }
    if coupon.type not in coupons_dict:
        coupons_dict[coupon.type] = []
    coupons_dict[coupon.type].append(info)


@app.get("/seller_page/coupon/view/{type}")
async def view_coupon(type: str, token: str, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)
    coupons = await session.scalars(select(Discount).where(Discount.sellerid == seller.sellerid))
    coupons = coupons.all()
    coupons_dict = {}
    if type == 'all':
        for coupon in coupons:
            coupon_to_dict(coupon, coupons_dict)
    elif type == 'ongoing':
        for coupon in coupons:
            if coupon.startdate <= datetime.now() <= coupon.enddate:
                coupon_to_dict(coupon, coupons_dict)
    elif type == 'upcoming':
        for coupon in coupons:
            if coupon.startdate > datetime.now():
                coupon_to_dict(coupon, coupons_dict)
    elif type == 'expired':
        for coupon in coupons:
            if coupon.enddate < datetime.now():
                coupon_to_dict(coupon, coupons_dict)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid coupon type. Supported types are 'all', 'ongoing', 'upcoming', 'expired'")
    return coupons_dict


@app.post("/seller_page/coupon/create", response_model=Discount)
async def create_coupon(coupon: CouponCreate, token: str, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)
    valid_types = ['shipping fee', 'seasoning', 'special event']
    if coupon.type not in valid_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid coupon type. Supported types are {valid_types}")
    new_coupon = Discount(sellerid=seller.sellerid, **coupon.dict())
    session.add(new_coupon)
    await session.commit()
    return new_coupon


@app.patch("/seller_page/coupon/edit/{discount_code}")
async def edit_coupon(token: str, coupon: CouponEdit, discount_code: int, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)

    discount = await session.scalars(select(Discount).where(Discount.discountcode == discount_code, Discount.sellerid == seller.sellerid))
    discount = discount.first()
    if not discount:
        raise HTTPException(
            status_code=404, detail=f"Can't find Coupon {discount_code} in your coupons")

    appied_record = await session.scalars(select(Applied_List).where(Applied_List.discountcode == discount_code))

    if not appied_record.first():  # 該discount還沒人用過
        # 創建要更新的字段和值的字典
        update_data = {}
        update_data['discountcode'] = discount_code
        update_data['sellerid'] = seller.sellerid
        if coupon.name is not None:
            update_data['name'] = coupon.name
        if coupon.type is not None:
            update_data['type'] = coupon.type
        if coupon.description is not None:
            update_data['description'] = coupon.description
        if (coupon.startdate is not None) and (coupon.enddate is not None):
            update_data['startdate'] = coupon.startdate
            update_data['enddate'] = coupon.enddate
        elif (coupon.startdate is not None) or (coupon.enddate is not None):
            raise HTTPException(
                status_code=400, detail="Must fill in both startdate and enddate!")

        if coupon.isactivated is not None:
            update_data['isactivated'] = coupon.isactivated
        if coupon.discountrate is not None:
            update_data['discountrate'] = coupon.discountrate
        if coupon.eventtag is not None:
            update_data['eventtag'] = coupon.eventtag
        if coupon.minimumamountfordiscount is not None:
            update_data['minimumamountfordiscount'] = coupon.minimumamountfordiscount

        # 確認是否有更新資料
        if update_data:
            stmt = (
                update(Discount)
                .where(Discount.discountcode == discount_code)
                .values(**update_data)
            )
            try:
                await session.execute(stmt)
                await session.commit()
                return f"Coupon {discount_code} updated successfully"
            except IntegrityError as e:
                # 在這裡處理違反約束的情況
                # 您可以根據具體的情況回滾事務或返回相應的錯誤消息
                await session.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
        else:
            raise HTTPException(
                status_code=400, detail=f"No data provided for update on Coupon {discount_code}")
    else:
        raise HTTPException(
            status_code=400, detail=f"Coupon {discount_code} had been appied already")


@app.delete("/seller_page/coupon/delete/{discount_code}")
async def delete_coupon(token: str, discount_code: int, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)

    appied_record = await session.scalars(select(Applied_List).where(Applied_List.discountcode == discount_code))

    if not appied_record.first():  # 該discount還沒人用過
        discount = await session.scalars(select(Discount).where(Discount.discountcode == discount_code, Discount.sellerid == seller.sellerid))
        discount = discount.first()

        if not discount:
            raise HTTPException(
                status_code=404, detail=f"Coupon {discount_code} not found in your coupons!")
        try:
            await session.delete(discount)
            await session.commit()
        except IntegrityError as e:
            # 在這裡處理違反約束的情況
            # 您可以根據具體的情況回滾事務或返回相應的錯誤消息
            await session.rollback()
            return f"Error: {str(e)}"

        discount = await session.scalars(select(Discount).where(Discount.discountcode == discount_code, Discount.sellerid == seller.sellerid))
        discount = discount.first()
        if discount:
            return f"Failed to remove coupon {discount_code}"
        else:
            return f"Successfully removed coupon {discount_code}"
    else:
        return f"Coupon {discount_code} had been appied already"


@app.post("/seller_page/coupon/activate/{discount_code}")
async def activate_coupon(token: str, discount_code: int, activate: bool, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)

    discount = await session.scalars(select(Discount).where(Discount.discountcode == discount_code, Discount.sellerid == seller.sellerid))
    discount = discount.first()

    if not discount:
        raise HTTPException(
            status_code=404, detail=f"Coupon {discount_code} not found in your coupons!")

    stmt = (
        update(Discount)
        .where(Discount.discountcode == discount_code)
        .values(isactivated=activate)
    )
    try:
        await session.execute(stmt)
        await session.commit()
        return f"Coupon {discount_code} is activate={activate} now!"
    except IntegrityError as e:
        # 在這裡處理違反約束的情況
        # 您可以根據具體的情況回滾事務或返回相應的錯誤消息
        await session.rollback()
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")


@app.get("/seller_page/books")
async def view_books_list_for_seller(token: str, book_id: Optional[int] = None, session: AsyncSession = Depends(get_session)):
    seller = await get_current_seller(token, session)

    if book_id is not None:
        books = await session.scalars(select(Book).where(Book.sellerid == seller.sellerid, Book.bookid == book_id))
    else:
        books = await session.scalars(select(Book).where(Book.sellerid == seller.sellerid))
        books = books.all()
    if not books:
        return {"message": "No books found for this seller."}

    status_books = {
        "To ship": [],
        "Shipping": [],
        "Completed": [],
        "Not sold": [],
        "Other": []
    }

    for book in books:
        order = await session.scalars(select(Orders).where(Orders.orderid == book.orderid))
        order = order.first()
        status = order.orderstatus if order else "Not sold"

        picture = await session.scalars(select(Picture_List).where(Picture_List.bookid == book.bookid).order_by(Picture_List.pictureid))
        picture = picture.first()
        picture_path = picture.picturepath if picture else ""

        book_details = {
            "book_id": book.bookid,
            "book_name": book.name,
            "picture_path": picture_path,
            "description": book.description,
            "price": book.price,
            "status": status,
        }
        if status in status_books:
            status_books[status].append(book_details)
        else:
            status_books["Other"].append(book_details)
    return status_books
