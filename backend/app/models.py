from pydantic import BaseModel, Field
from datetime import datetime, date

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