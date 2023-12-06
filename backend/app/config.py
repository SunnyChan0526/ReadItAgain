import os

from pydantic import BaseSettings, Field
#如果需要本地開發請移除註解，如果需要deploy到docker請保持註解，在push到github時盡量記得保持註解
os.environ['DATABASE_URL']='postgresql://admin:devpass@localhost:8989/readitagain-data'

class Settings(BaseSettings):
    db_url: str = Field(..., env='DATABASE_URL')

settings = Settings()