from fastapi import FastAPI

app = FastAPI(title="NovaRescue AI")


@app.get("/")
def read_root():
    return {"message": "NovaRescue AI backend is running"}
