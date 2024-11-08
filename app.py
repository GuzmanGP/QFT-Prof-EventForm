import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev_key_123"
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://neondb_owner:Ot9Sm1ANvkMc@ep-rough-tree-a4b9uu7e.us-east-1.aws.neon.tech/neondb?sslmode=require"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

db.init_app(app)

with app.app_context():
    import models
    db.drop_all()  # Drop all tables
    db.create_all()  # Recreate all tables
    import routes
