import os
import re
from datetime import datetime

MARKETS = [
    "hk",
    "sdy",
    "sgp",
    "china",
    "japan",
    "taiwan",
    "cambodia"
    "macau"
]

MONTH = {
    "01":"januari",
    "02":"februari",
    "03":"maret",
    "04":"april",
    "05":"mei",
    "06":"juni",
    "07":"juli",
    "08":"agustus",
    "09":"september",
    "10":"oktober",
    "11":"november",
    "12":"desember"
}

def slug(date):
    y,m,d = date.split("-")
    return f"{int(d)}-{MONTH[m]}-{y}"

def ensure(folder):
    os.makedirs(folder, exist_ok=True)
