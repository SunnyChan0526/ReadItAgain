import databases
import sqlalchemy
from .config import settings

# 建立數據庫連接
database = databases.Database(settings.db_url)

# 創建 SQLAlchemy 的元數據實例
metadata = sqlalchemy.MetaData()
