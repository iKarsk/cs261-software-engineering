# CS261 Software Engineering Group Project

![Alt text](/ProjectTracker.png?raw=true "Project Tracker Homepage")
## How to run

### Docker compose
##### Requirements
- Docker

##### Instructions
- Download the files
- cd into the directory.

```console
foo@bar:~$ docker-compose up
```

### Manually
##### Requirements
- Node, npm
- Python w/ dependencies installed
- Running postgreSQL server

##### Instructions
- Download the files
- Ensure postgreSQL server is running

##### Run the NextJS project:
```console
foo@bar:~$ cd /frontend/cs261-project-tracker
foo@bar:~$ npm install
foo@bar:~$ npx prisma db push
foo@bar:~$ npm run build
foo@bar:~$ npm run start
```

(Alternatively, for the development build, run:)
```console
...
foo@bar:~$ npm run dev
```

##### Run the Flask ML backend:
