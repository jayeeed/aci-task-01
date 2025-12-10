from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import timedelta
import shutil
import os
import uuid
import base64

from models import get_db, User, Image, Chat
from schemas import UserLogin, UserSignup, ChatRequest
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from chat import ask_gemini

router = APIRouter(prefix="/api", tags=["apis"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/auth/login")
async def login_for_access_token(
    request: UserLogin, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/signup")
async def signup(
    request: UserSignup,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(request.password)
    new_user = User(email=request.email, hashed_password=hashed_password, full_name=request.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@router.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
    }


@router.get("/chats")
async def get_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at).all()


@router.post("/chat")
async def chat_interaction(
    question: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_id = None
    image_b64 = None

    if file:
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        db_image = Image(filename=filename, filepath=file_path, owner_id=current_user.id)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        image_id = db_image.id
        
        with open(file_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")
        
        user_chat_entry = Chat(user_id=current_user.id, role="user", content=question, image_id=image_id)
    else:
        user_chat_entry = Chat(user_id=current_user.id, role="user", content=question)
    
    db.add(user_chat_entry)
    db.commit()
    
    response_text = ask_gemini(question, image_b64)
    
    ai_chat_entry = Chat(user_id=current_user.id, role="ai", content=response_text)
    db.add(ai_chat_entry)
    db.commit()

    return {
        "response": response_text,
        "image_id": image_id,
        "annotated_image": None 
    }
