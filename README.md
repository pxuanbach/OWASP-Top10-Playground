# OWASP-Top10-Playground

## Quick Start

1. Initialize infrastructure (Not required if you already have a Postgres instance on your local machine):

    ```sh
    make infras
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Initialize the database and seed demo users:

    ```bash
    make init

    #or
    npm run initdb
    npm run initdata
    ```

4. Start the app:

    ```sh
    npm start
    ```

App will be running at http://localhost:3000


## OWASP Top 10

### A01: Broken Access Control

### A02: Cryptographic Failures

### A03: Injection

### A04: Insecure Design
