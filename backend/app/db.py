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

    bookid: str = ormar.String(primary_key=True, max_length=20)
    sellerid: str = ormar.String(max_length=20)
    orderid: str = ormar.String(max_length=20, nullable=True)
    discountcode: str = ormar.String(max_length=20, nullable=True)
    isbn: str = ormar.String(max_length=20, unique=True)
    shippinglocation: str = ormar.String(max_length=100)
    shippingmethod: str = ormar.String(max_length=50)
    name: str = ormar.String(max_length=100)
    bookpicture: str = ormar.String(max_length=200)
    condition: str = ormar.String(max_length=50)
    price: int = ormar.Integer()
    description: str = ormar.String(max_length=1000)
    category: str = ormar.String(max_length=50)