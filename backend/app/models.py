from pydantic import BaseModel, Field
from datetime import date, datetime
from fastapi import Query
from typing import Optional

class BookInfo(BaseModel):
    bookid: Optional[int] 
    sellerid: int 
    orderid: Optional[int] 
    discountcode: Optional[int] 
    isbn: str 
    shippinglocation: str 
    shippingmethod: str 
    name: str 
    condition: str 
    price: int
    description: str 
    category: str 
    state: str 
    picturepath: str
    
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
    picturepath: str
    price: int

class CheckoutList(BaseModel):
    seller_name: str
    books: list[ShoppingCartList]
    items: int
    books_total_price: int
    shipping_options: str
    shipping_fee: int
    coupon_name: list
    total_amount: int

class Token(BaseModel):
    access_token: str
    token_type: str

class Profile(BaseModel):
    userid: int
    name: str
    email: str
    phone: str
    gender: str
    birthdate: date
    profilepicture: str

# show address return model
class Address(BaseModel):
    addressid: int
    address: str
    defaultaddress: bool

# input model
class AddressCreate(BaseModel):
    address: str
    defaultaddress: bool = False 
    shippingoption: str

class AddressEdit(BaseModel):
    address: str = Query(None)
    defaultaddress: Optional[bool] = Query(False)
    shippingoption: str = Query(None)

class CheckoutList(BaseModel):
    seller_name: str
    books: list[ShoppingCartList]

class DiscountInfo(BaseModel):
    discountcode: int
    name: str
    type: str 
    description: str 
    startdate: datetime
    enddate: datetime
    discountrate: Optional[float] = None
    eventtag: Optional[str] = None
    minimumamountfordiscount: Optional[int] = None
    isable: bool

    