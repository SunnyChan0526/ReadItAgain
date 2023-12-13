import os

from pydantic import Field
from pydantic_settings import BaseSettings

# 如果需要本地開發請移除註解，如果需要deploy到docker請保持註解，在push到github時盡量記得保持註解
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://admin:devpass@localhost:8989/readitagain-data'


class Settings(BaseSettings):
    db_url: str = Field(alias='DATABASE_URL')
    secret_key: str = "bd1466ba28694ad64e1d41b271df142398c3a6103966753c6e8c8b078a687753"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


settings = Settings()
