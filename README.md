
# Server Boiler Plate Project

This is a server-side code for setting up a Node.js server in Express.js and use MongoDB. This project contains sample APIs for common user account generation and login.

## API Documentation

Sample APIs' documentation is hosted [here](https://documenter.getpostman.com/view/25226400/2s9Yywdyon)


## Installation & Running

Clone the project on to your local machine

```bash
  git clone https://github.com/Moasfar-Javed/Server-Boiler-Plate.git
```

Go to the project directory

```bash
  cd Server-Boiler-Plate
```

Install dependencies

```bash
  npm i
```

Open your MongoDb shell

```bash
  use BoilerPlate
```
Create a database user

```bash
  db.createUser({user: "DbUser", pwd: "DbPassword", roles: ["readWrite", "dbAdmin"]})
```

Finally start the server using nodemon (already installed)

```bash
  nodemon src/index.mjs 
```

## Considerations

    1. You would need to change your database name and user to your application specific needs.
    2. You would need to uncomment the .env section in the .gitignore file to avoid exposing sensitive data.
    3. To enable the HTTPS server, you need to uncomment the lines in index.mjs when you have your SSL certificate.
    4. If you are using any SQL database it is better to include a models folder as well.
