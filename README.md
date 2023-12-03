# ReadItAgain
## Installation
Build the environment
```
docker-compose up --build -d
```
Stop and remove containers
```
docker-compose down
```
Execute commands in a running container.
An example running sql command in db
```
docker exec -it readitagain-db-1 sh # containerName: readitagain-db-1
psql -U admin readitagain-data  # connect to PostgreSQL db(readitagain-data)
# write some sql command...
exit                            # exit db
exit                            # exit container
```

