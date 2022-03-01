# API

The API backend, implemented with Node.js.

Connects to the database(s).

## How to connect locally to MongoDB
(Please note that this will be updated as we each learn the ins and outs of connecting to MongoDB.)

**IMPORTANT:** When committing changes, please make sure **NOT** to add your `config.env` file to the changes to be committed. Adding this file to GitHub exposes your password. If this does happen to you, to ensure security, please notify the groupchat. Although the data for this project are open, it may be best to make a new database user with a different password to ensure security. 

### Basic Connection
1. Accept the invite and create a MongoDB account, if you have not already.
2. Open the Polaris project. Under Security in the left sidebar, click on Database Access. Add yourself as a new database user with read/write access.
    - Since we likely will not be making multiple clusters, it would be best to select 'Read and write to any database' rather than 'Atlas admin' as one's role for now. 
3. Return to Database under Deployment and click on the "Connect" button. Click on "Connect your application," then select your driver (Node.js) and version (4.0 or later).
4. Copy the provided connection string and paste it next to `ATLAS_URI=` in the provided `config_template.env` to set the `ATLAS_URI` environment variable. Rename `config_template.env` as `config.env`.
5. Make the needed edits to the connection string, i.e., replace `<password>` with the password for your database user (not your MongoDB account) and replace `myFirstDatabase` with `Polaris`.
6. Open a new terminal and `cd` into the `api` folder. Run `npm test`. You should see the following output:
    ```
    Server is running on port: 5001
    Successfully connected to MongoDB.
    ```
    If you see this output, you are all set!