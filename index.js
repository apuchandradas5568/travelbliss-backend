import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// database works
const client = new MongoClient(process.env.MONGO, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("ass09");
    const UserCollection = database.collection("User");
    const spotCollection = client.db("ass09").collection("added-spot");
    console.log("database connected");

    // routes
    app.post("/spot/addspot", async (req, res) => {
      const spot = req.body;
      const result = await spotCollection.insertOne(spot);
      res.send(result);
    });
    app.get("/spot/allspot", async (req, res) => {
      const cursor = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/spot/allspot/:user", async (req, res) => {
      const  userMail = req.params.user;
      const  query = {usermail: userMail}
      const cursor = spotCollection.find(query);
      const result = await cursor.toArray();

      console.log(cursor, result);
      res.send(result);
    });
    app.get("/spot/:id", async (req, res) => {
      const spotId = req.params.id;
      const query = { _id: new ObjectId(spotId) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });
    app.delete("/spot/:id", async (req, res) => {
      const spotId = req.params.id;
      const query = { _id: new ObjectId(spotId) };
      await spotCollection.findOneAndDelete(query);
      res.send({ message: "Spot Deleted Successfully" });
    });
    app.put("/spot/:id", async (req, res) => {
      const spotId = req.params.id;
      const spotData = req.body;
      const query = { _id: new ObjectId(spotId) };
      const option = {returnOriginal: false}
      const result = await spotCollection.findOneAndUpdate(query, {$set: spotData}, option);
      res.send({ result, message: "Spot Updated Successfully" });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
