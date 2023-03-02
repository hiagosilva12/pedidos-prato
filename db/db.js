const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");
dotenv.config();

const MONGO_CNSTRING = process.env.MONGO_CNSTRING;

const MongoClient = require("mongodb").MongoClient;

const url = MONGO_CNSTRING;

const dbName = "almoco";
const client = new MongoClient(url);
const db = client.db(dbName);
const collectionName = "cardapio";

const createCardapio = async (cardapio) => {
  const result = await db.collection(collectionName).insertOne(cardapio);
  return result;
};

const getCardapio = async () => {
  const result = await db.collection(collectionName).find().toArray();
  return result;
};

const getCardapioById = async (id) => {
  const result = await db
    .collection(collectionName)
    .findOne({ _id: ObjectId(id) });
  return result;
};

const updateCardapio = async (id, cardapio) => {
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: ObjectId(id) }, { $set: cardapio });
  return result;
};

const deleteCardapio = async (id) => {
  const result = await db
    .collection(collectionName)
    .deleteOne({ _id: ObjectId(id) });
  return result;
};

const getNPedidoByNPedido = async (nPedido) => {
  const result = await db
    .collection(collectionName)
    .findOne({ nPedido: nPedido });
  return result;
};

const connect = async () => {
  await client.connect();
  console.log("Connected to MongoDB");
};

connect();

module.exports = {
  getCardapio,
  getCardapioById,
  createCardapio,
  updateCardapio,
  deleteCardapio,
  getNPedidoByNPedido,
};
