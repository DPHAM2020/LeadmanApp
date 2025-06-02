from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.concurrency import run_in_threadpool
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


# WebSockets
clients = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.receive_text() # not used in our case, but prevents the connection from closing
    except:
        clients.remove(websocket)
    
async def broadcast_update(data):
    for client in clients:
        await client.send_json(data)


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
async def add_module(data: Module):
    print(data)
    def write_to_sheet():
        # Open the correct worksheet (first sheet by default)
        master_module_sheet = sht.worksheet("Modules")  # Or use `worksheet = module_sheet.worksheet("Sheet1")`
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
    
    await run_in_threadpool(write_to_sheet)
    latest_data = get_latest_module_data()
    await broadcast_update(latest_data)
    return data

@app.post("/apower/add")
async def add_assembled_unit(data: AssembledUnit):
    print(data)
    
    def update_sheets():
        running_module_sheet = sht.worksheet("Modules (running)")
        aPower_sheet = sht.worksheet("aPower")

        # Module A and Module B must exists in database
        # aPower sn and casing sn must not already be in database
        module_a_cell = running_module_sheet.find(data.aSerialNum, in_column=3)
        module_b_cell = running_module_sheet.find(data.bSerialNum, in_column=3)
        aPower_serial_cell = aPower_sheet.find(data.finishedProductSerialNum, in_column=3)
        casing_serial_cell = aPower_sheet.find(data.casingSerialNum, in_column=4)

        error_message = []
        if module_a_cell is None:
            error_message.append(f'Module A (sn: {data.aSerialNum}) is not in the database.') 
        if module_b_cell is None:
            error_message.append(f'Module B (sn: {data.bSerialNum}) is not in the database.') 
        if aPower_serial_cell is not None:
            error_message.append(f'aPower unit (sn: {data.finishedProductSerialNum}) is already in the database.')
        if casing_serial_cell is not None:
            error_message.append(f'Casing unit (sn: {data.casingSerialNum}) is already in the database.')
        if error_message:
            raise HTTPException(
                status_code=400,
                detail="\n".join(error_message)
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

    # Google sheets api is a blocking operation; must wrap it in a synchronous function
    await run_in_threadpool(update_sheets)
    return data

def get_latest_module_data():
    curr_date = str(date.today())
    curr_sheet = sht.worksheet("Modules") 
    list_of_dicts = curr_sheet.get_all_records()
    units_today = []
    for unit_row in list_of_dicts:
        if str(unit_row.get("Date")) == curr_date:
            units_today.append(unit_row)
    return units_today
