# ReadItAgain

## Installation and Setup

### For Docker Deployment

1. **Building the Environment:**
   To set up your Docker environment, run the following command:
```
docker-compose up --build -d
```
2. **Stopping and Removing Containers:**
To stop and remove the Docker containers, execute:
```
docker-compose down
```
3. **Executing Commands in a Running Container:**
For example, to run SQL commands in the database:
```
docker exec -it readitagain-db-1 sh # containerName: readitagain-db-1
psql -U admin readitagain-data       # connect to PostgreSQL db(readitagain-data)
# write some sql commands...
exit                                # exit db
exit                                # exit container
```
*Note: Ensure that in `backend/app/config.py`, the line `os.environ['DATABASE_URL'] = ...` remains commented when deploying with Docker.*

### For Local Development

1. **Setting Up the Local Environment:**
To set up your project for local development, follow these steps:

- Ensure you have all the necessary local dependencies installed.
- Configure your local environment settings.

2. **Database Configuration:**
For local development, uncomment the following line in `backend/app/config.py`:
```
os.environ['DATABASE_URL'] = ...
```
This will configure the application to use your local database settings.

3. **Starting the Local Server:**
Navigate to the backend directory and start the local development server with the following command:
```
cd backend
uvicorn app.main:app --host 0.0.0.0
```
If you need hot reloading, add `--reload` to the command:
```
uvicorn app.main:app --host 0.0.0.0 --reload
```
*Note: Remember to revert the `os.environ['DATABASE_URL'] = ...` line back to its original commented state when switching back to Docker deployment.*
