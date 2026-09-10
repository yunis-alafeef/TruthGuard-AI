import uvicorn

uvicorn.run("services.ml_service.app:app", host="127.0.0.1", port=8001, reload=False)