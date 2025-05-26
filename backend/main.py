from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gspread
from datetime import datetime, date
from google.oauth2.service_account import Credentials

app = FastAPI()

# CORS Stuff
origins = [
    "http://localhost:5173",
    "localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Google sheets setup
scopes = [
    "https://www.googleapis.com/auth/spreadsheets"
]
creds = Credentials.from_service_account_file("credentials.json", scopes=scopes)
client = gspread.authorize(creds)
sheet_key = "1nvwL_ijmKOlBwcpThS71_TNRlqy4XeE5p_vwYAMoiGs"
sht = client.open_by_key(sheet_key)

class Module(BaseModel):
    sn: str
    moduleType: str

class AssembledUnit(BaseModel):
    casingSerialNum: str
    finishedProductSerialNum: str
    aSerialNum: str
    bSerialNum: str

@app.get("/")
def read_root():
    return {"message": "Hello World!"}

@app.post("/module/add")
def add_module(data: Module):
    print(data)
    # Open the correct worksheet (first sheet by default)
    master_module_sheet = sht.sheet1  # Or use `worksheet = module_sheet.worksheet("Sheet1")`
    running_module_sheet = sht.worksheet("Modules (running)")

    # sn must not already be in database
    if master_module_sheet.find(data.sn, in_column=3) is not None:
        raise HTTPException(
            status_code=400,
            detail=f'Serial Number {data.sn} already exists in the database.'
        )

    # Get the current timestamp
    curr_date = str(date.today())
    curr_time = str(datetime.now().strftime("%H:%M:%S"))

    # Prepare the row of data to append
    new_row = [curr_date, curr_time, data.sn, data.moduleType]

    # Append the data to the next available row
    master_module_sheet.append_row(new_row)
    running_module_sheet.append_row(new_row)
    return data

@app.post("/apower/add")
def add_assembled_unit(data: AssembledUnit):
    print(data)
    
    running_module_sheet = sht.worksheet("Modules (running)")
    aPower_sheet = sht.worksheet("aPower")

    # Module A and Module B must exists in database
    # aPower sn and casing sn must not already be in database
    error_message = ""
    module_a_cell = running_module_sheet.find(data.aSerialNum, in_column=3)
    module_b_cell = running_module_sheet.find(data.bSerialNum, in_column=3)
    aPower_serial_cell = aPower_sheet.find(data.finishedProductSerialNum, in_column=3)
    casing_serial_cell = aPower_sheet.find(data.casingSerialNum, in_column=4)
    if module_a_cell is None:
        error_message = error_message.join(f'Module A (sn: {data.aSerialNum}) is not in the database.\n') 
    if module_b_cell is None:
        error_message = error_message.join(f'Module B (sn: {data.bSerialNum}) is not in the database.\n') 
    if aPower_serial_cell is not None:
        error_message = error_message.join(f'aPower unit (sn: {data.finishedProductSerialNum}) is already in the database.\n')
    if casing_serial_cell is not None:
        error_message = error_message.join(f'Casing unit (sn: {data.casingSerialNum}) is already in the database.\n')

    if error_message:
        raise HTTPException(
            status_code=400,
            detail=error_message
        )

    # Get the current timestamp
    curr_date = str(date.today())
    curr_time = str(datetime.now().strftime("%H:%M:%S"))

    # Append data to next available row in aPower sheet
    new_row = [curr_date, curr_time, data.finishedProductSerialNum, data.casingSerialNum, data.aSerialNum, data.bSerialNum]
    aPower_sheet.append_row(new_row)

    # Remove corresponding modules (A and B) from running sheet
    running_module_sheet.delete_rows(module_a_cell.row)
    running_module_sheet.delete_rows(module_b_cell.row)

    return data

