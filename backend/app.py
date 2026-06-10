from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel
import boto3
import os
import uuid

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'ccp-cloud-native-db')
table = dynamodb.Table(table_name)

class ItemModel(BaseModel):
    name: str
    description: str

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.post("/items")
def create_item(item: ItemModel):
    item_id = str(uuid.uuid4())
    table.put_item(
        Item={
            'id': item_id,
            'name': item.name,
            'description': item.description
        }
    )
    return {"id": item_id, "name": item.name, "description": item.description}

@app.get("/items/{item_id}")
def get_item(item_id: str):
    response = table.get_item(Key={'id': item_id})
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="Item not found")
    return response['Item']

@app.get("/items")
def list_items():
    response = table.scan()
    return response.get('Items', [])

@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    table.delete_item(Key={'id': item_id})
    return {"message": "Item deleted"}

handler = Mangum(app)
