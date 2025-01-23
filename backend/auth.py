from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import verify_password, get_db
from models import TokenData, User

# Configurazione sicurezza
SECRET_KEY = "your-secret-key-here"  # In produzione, usa una chiave sicura e segreta
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 ore

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def authenticate_user(username: str, password: str) -> Optional[User]:
    """Autentica un utente e restituisce l'oggetto User se le credenziali sono corrette"""
    if verify_password(username, password):
        with get_db() as db:
            user_data = db.execute(
                "SELECT * FROM users WHERE username = ?",
                (username,)
            ).fetchone()
            if user_data:
                return User(**user_data)
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Ottiene l'utente corrente dal token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    with get_db() as db:
        user_data = db.execute(
            "SELECT * FROM users WHERE username = ?",
            (token_data.username,)
        ).fetchone()
        
        if user_data is None:
            raise credentials_exception
            
        return User(**user_data)

# Dependency per le route protette
async def get_current_user_id(current_user: User = Depends(get_current_user)) -> int:
    """Restituisce l'ID dell'utente corrente"""
    return current_user.id
