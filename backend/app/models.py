from pydantic import BaseModel, Field
from datetime import date
from fastapi import Query
from typing import Optional

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