from sqlmodel import Field, SQLModel, create_engine, Relationship, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import Optional, List
from datetime import datetime, date
from .config import settings


class Member(SQLModel, table=True):
    userid: Optional[int] = Field(default=None, primary_key=True)
    memberaccount: str = Field(
        max_length=20, sa_column_kwargs={"unique": True})
    password: str = Field(max_length=100)
    name: str = Field(max_length=50)
    gender: str = Field(max_length=2)
    registrationtime: datetime = Field(default=datetime.now())
    verified: str = Field(max_length=10)
    phone: str = Field(max_length=20, sa_column_kwargs={"unique": True})
    email: str = Field(max_length=100, sa_column_kwargs={"unique": True})
    birthdate: date
    usertype: str = Field(max_length=20)
    selfintroduction: Optional[str] = Field(default=None, max_length=500)
    profilepicture: Optional[str] = Field(default=None, max_length=200)
    authority: Optional[str] = Field(
        default=None, max_length=100, sa_column_kwargs={"unique": True})

    # Relationships
    customer: Optional["Customer"] = Relationship(back_populates="member")
    seller: Optional["Seller"] = Relationship(back_populates="member")
    administrator: Optional["Administrator"] = Relationship(
        back_populates="member")


class Customer(SQLModel, table=True):
    customerid: int = Field(default=None, primary_key=True,
                            foreign_key="member.userid")
    # Relationships
    member: Member = Relationship(back_populates="customer")
    orders: List["Orders"] = Relationship(back_populates="customer")
    shopping_cart: Optional["Shopping_Cart"] = Relationship(
        back_populates="customer")
    like_list: List["Like_List"] = Relationship(back_populates="customer")
    address_list: List["Address_List"] = Relationship(
        back_populates="customer")


class Seller(SQLModel, table=True):
    sellerid: int = Field(default=None, primary_key=True,
                          foreign_key="member.userid")
    # Relationships
    member: Member = Relationship(back_populates="seller")
    orders: List["Orders"] = Relationship(back_populates="seller")
    discounts: List["Discount"] = Relationship(back_populates="seller")
    books: List["Book"] = Relationship(back_populates="seller")
    like_list: List["Like_List"] = Relationship(back_populates="seller")
    shippingmethod_list: List["ShippingMethod_List"] = Relationship(
        back_populates="seller")


class Administrator(SQLModel, table=True):
    administratorid: int = Field(
        default=None, primary_key=True, foreign_key="member.userid")
    # Relationship
    member: Member = Relationship(back_populates="administrator")


class Orders(SQLModel, table=True):
    orderid: Optional[int] = Field(default=None, primary_key=True)
    sellerid: int = Field(foreign_key="seller.sellerid")
    customerid: int = Field(foreign_key="customer.customerid")
    orderstatus: str = Field(max_length=50)
    cancellationreason: Optional[str] = Field(max_length=50)
    time: datetime
    totalamount: int
    totalbookcount: int
    comment: Optional[str] = Field(max_length=500)
    shippingmethod: Optional[str] = Field(max_length=20)
    stars: Optional[int]

    # Relationships
    seller: Seller = Relationship(back_populates="orders")
    customer: Customer = Relationship(back_populates="orders")
    applied_list: List["Applied_List"] = Relationship(back_populates="order")
    books: List["Book"] = Relationship(back_populates="order")


class Discount(SQLModel, table=True):
    discountcode: Optional[int] = Field(default=None, primary_key=True)
    sellerid: int = Field(foreign_key="seller.sellerid")
    name: str = Field(max_length=100)
    type: str = Field(max_length=50)
    description: str = Field(max_length=500)
    startdate: datetime
    enddate: datetime
    isactivated: bool
    discountrate: Optional[float]
    eventtag: Optional[str] = Field(max_length=50)
    minimumamountfordiscount: Optional[int]

    # Relationships
    seller: Seller = Relationship(back_populates="discounts")
    applied_list: List["Applied_List"] = Relationship(
        back_populates="discount")
    specialized: List["Specialized"] = Relationship(back_populates="discount")
    books: List["Book"] = Relationship(back_populates="discount")


class Book(SQLModel, table=True):
    bookid: Optional[int] = Field(default=None, primary_key=True)
    sellerid: int = Field(foreign_key="seller.sellerid")
    orderid: Optional[int] = Field(foreign_key="orders.orderid")
    discountcode: Optional[int] = Field(foreign_key="discount.discountcode")
    isbn: str = Field(max_length=20)
    shippinglocation: str = Field(max_length=6)
    name: str = Field(max_length=100)
    condition: str = Field(max_length=10)
    price: int
    description: str = Field(max_length=1000)
    category: str = Field(max_length=50)
    state: str = Field(max_length=20)

    # Relationships
    seller: Seller = Relationship(back_populates="books")
    order: Optional[Orders] = Relationship(back_populates="books")
    discount: Optional[Discount] = Relationship(back_populates="books")
    picture_list: List["Picture_List"] = Relationship(back_populates="book")
    cart_list: Optional["Cart_List"] = Relationship(back_populates="book")
    specialized: List["Specialized"] = Relationship(back_populates="book")


class Picture_List(SQLModel, table=True):
    pictureid: Optional[int] = Field(default=None, primary_key=True)
    bookid: int = Field(foreign_key="book.bookid")
    picturepath: str = Field(max_length=200)

    # Relationship
    book: Book = Relationship(back_populates="picture_list")


class Shopping_Cart(SQLModel, table=True):
    shoppingcartid: Optional[int] = Field(default=None, primary_key=True)
    customerid: int = Field(foreign_key="customer.customerid")

    # Relationship
    customer: Customer = Relationship(back_populates="shopping_cart")
    cart_list: List["Cart_List"] = Relationship(back_populates="shopping_cart")


class Like_List(SQLModel, table=True):
    sellerid: int = Field(default=None, primary_key=True,
                          foreign_key="seller.sellerid")
    customerid: int = Field(default=None, primary_key=True,
                            foreign_key="customer.customerid")

    # Relationships
    seller: Seller = Relationship(back_populates="like_list")
    customer: Customer = Relationship(back_populates="like_list")


class Applied_List(SQLModel, table=True):
    orderid: int = Field(default=None, primary_key=True,
                         foreign_key="orders.orderid")
    discountcode: int = Field(
        default=None, primary_key=True, foreign_key="discount.discountcode")

    # Relationships
    order: Orders = Relationship(back_populates="applied_list")
    discount: Discount = Relationship(back_populates="applied_list")


class Cart_List(SQLModel, table=True):
    shoppingcartid: int = Field(
        default=None, foreign_key="shopping_cart.shoppingcartid")
    bookid: int = Field(primary_key=True, foreign_key="book.bookid")

    # Relationships
    shopping_cart: Shopping_Cart = Relationship(back_populates="cart_list")
    book: Book = Relationship(back_populates="cart_list")


class Address_List(SQLModel, table=True):
    addressid: int = Field(default=None, primary_key=True)
    customerid: int = Field(default=None, foreign_key="customer.customerid")
    address: str = Field(default=None, max_length=200)
    defaultaddress: bool = Field(default=False)
    shippingoption: str = Field(default=None, max_length=50)

    # Relationships
    customer: Customer = Relationship(back_populates="address_list")


class ShippingMethod_List(SQLModel, table=True):
    ShippingMethodID: int = Field(default=None, primary_key=True)
    SellerID: int = Field(foreign_key="seller.sellerid")
    ShippingMethod: str = Field(max_length=20)

    # Relationships
    seller: Seller = Relationship(back_populates="shippingmethod_list")


class Specialized(SQLModel, table=True):
    discountcode: int = Field(
        default=None, primary_key=True, foreign_key="discount.discountcode")
    bookid: int = Field(default=None, primary_key=True,
                        foreign_key="book.bookid")

    # Relationships
    discount: Discount = Relationship(back_populates="specialized")
    book: Book = Relationship(back_populates="specialized")


engine = create_async_engine(settings.db_url, echo=True)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.reflect)


async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
