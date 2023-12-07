import databases
import ormar
import sqlalchemy
from .config import settings

# 建立數據庫連接
database = databases.Database(settings.db_url)
metadata = sqlalchemy.MetaData()

class BaseMeta(ormar.ModelMeta):
    metadata = metadata
    database = database

# 創建 SQLAlchemy 的元數據實例
metadata = sqlalchemy.MetaData()
class Book(ormar.Model):
    class Meta(BaseMeta):
        tablename = "book"

    bookid: int = ormar.Integer(primary_key=True)
    sellerid: int = ormar.Integer(foreign_key="seller.SellerID")
    orderid: int = ormar.Integer(foreign_key="orders.OrderID", nullable=True)
    discountcode: str = ormar.String(max_length=20, foreign_key="discount.DiscountCode", nullable=True)
    isbn: str = ormar.String(max_length=20, unique=True)
    shippinglocation: str = ormar.String(max_length=6)
    shippingmethod: str = ormar.String(max_length=2)
    name: str = ormar.String(max_length=100)
    condition: str = ormar.String(max_length=3)
    price: int = ormar.Integer()
    description: str = ormar.String(max_length=1000)
    category: str = ormar.String(max_length=50)
    state: str = ormar.String(max_length=10)

class PictureList(ormar.Model):
    class Meta(BaseMeta):
        tablename = "picture_list"
        
    pictureid: int = ormar.Integer(primary_key=True)
    bookid: int = ormar.Integer(foreign_key="book.bookid")
    picturepath: str = ormar.String(max_length=200)
