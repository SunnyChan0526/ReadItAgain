from pydantic import BaseModel, Field
from datetime import date, datetime
from fastapi import Query
from typing import Optional

class Token(BaseModel):
    success: bool
    access_token: str
    token_type: str

class Profile(BaseModel):
    userid: int
    name: str
    account: str
    email: str
    phone: str
    gender: str
    birthdate: date
    profilepicture: str

class ProfileEdit(BaseModel):
    name_input: Optional[str] = None
    email_input: Optional[str] = None
    phone_input: Optional[str] = None
    gender_input: Optional[str] = None
    birthdate_input: Optional[date] = None

# Book
class BookInfo(BaseModel):
    bookid: Optional[int] 
    sellerid: int 
    orderid: Optional[int] 
    discountcode: Optional[int] 
    isbn: str 
    shippinglocation: str 
    name: str 
    condition: str 
    price: int
    description: str 
    category: str 
    state: str 
    picturepath: str
    
class BookSearch(BaseModel):
    bookid:int
    name: str
    condition: str
    price: int
    shippinglocation: str
    picturepath: str

class BookDetail(BaseModel):
    sellerinfo: dict
    bookinfo: dict

# ShoppingCart
class ShoppingCartList(BaseModel):
    bookid: int
    name: str
    picturepath: str
    shipping: str
    price: int
    condition: str

# Address
class Address(BaseModel):
    addressid: int
    address: str
    defaultaddress: bool

class AddressCreate(BaseModel):
    address: str
    defaultaddress: bool = False 
    shippingoption: str

class AddressEdit(BaseModel):
    address: str = Query(None)
    defaultaddress: Optional[bool] = Query(False)
    shippingoption: str = Query(None)

# Checkout
class CheckoutList(BaseModel):
    seller_name: str
    books: list[ShoppingCartList]
    total_book_count: int
    books_total_price: int
    shipping_options: str
    shipping_fee: int
    coupon_name: list
    total_amount: int
    
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

class CheckoutInput(BaseModel):
    seller_id: int
    shipping_options: str
    selected_coupons: list[DiscountInfo]

class ShippingMethod(BaseModel):
    # shippingmethod: str
    address: str
    defaultaddress: bool

# Coupon
class CouponCreate(BaseModel):
    name: str 
    type: str 
    description: str 
    startdate: datetime
    enddate: datetime
    isactivated: bool = Query(False)
    discountrate: Optional[float]
    eventtag: Optional[str]
    minimumamountfordiscount: Optional[int]

class CouponEdit(BaseModel):
    name: str = Query(None)
    type: str = Query(None)
    description: str  = Query(None)
    startdate: datetime = Query(None)
    enddate: datetime = Query(None)
    isactivated: bool = Query(False)
    discountrate: Optional[float] = Query(None)
    eventtag: Optional[str] = Query(None)
    minimumamountfordiscount: Optional[int] = Query(None)

class ChangePass(BaseModel):
    origin_password: str = Query(None)
    new_password: str = Query(None)
    new_password_check: str = Query(None)

class CommentInput(BaseModel):
    order_id: int
    stars_input: int
    comment_input: str

class Cancel_Seller(BaseModel):
    is_accepted:bool
    reason:str