const Express = require("express");
const app = Express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ejs = require("ejs");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();
const {
  getCardapio,
  getCardapioById,
  createCardapio,
  updateCardapio,
  deleteCardapio,
  getNPedidoByNPedido,
} = require("./db/db");

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  ejs.renderFile("./views/index.ejs", {}, (err, str) => {
    if (err) {
      console.log(err);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(str);
  });
});

app.post("/cardapio", async (req, res) => {
  const {
    nome,
    telefone,
    imagem,
    hora,
    unidades,
    observacoes,
    bebida,
    valorTotal,
    nPedido,
  } = req.body;

  const numeroPedido = await getNPedidoByNPedido(nPedido);
  console.log(numeroPedido);
  if (numeroPedido) {
    res.send("Pedido já cadastrado");
  } else {
    const cardapio = {
      nome,
      telefone,
      imagem,
      hora,
      unidades,
      observacoes,
      bebida,
      valorTotal,
      nPedido: nPedido,
    };

    createCardapio(cardapio)
      .then((result) => {
        res.status(201).send(result);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

app.get("/cardapio/:id", (req, res) => {
  const { id } = req.params;

  getCardapioById(id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.put("/cardapio/:id", (req, res) => {
  const { id } = req.params;
  const { nome, telefone, imagem, hora, unidades, observacoes, bebida } =
    req.query;

  const cardapio = {
    nome,
    telefone,
    imagem,
    hora,
    unidades,
    observacoes,
    bebida,
  };

  updateCardapio(id, cardapio)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.delete("/cardapio/:id", (req, res) => {
  const { id } = req.params;

  deleteCardapio(id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/ver-pedidos", async (req, res) => {
  ejs.renderFile(
    "./views/verpedidos.ejs",
    {
      pedidos: await getCardapio(),
    },
    (err, str) => {
      if (err) {
        console.log(err);
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(str);
    }
  );
});

io.on("connection", async (socket, req) => {
  const pedidos = await getCardapio();
  socket.emit("pedidos", pedidos);

  socket.on("novo-pedido", async (pedido) => {
    const numeroPedido = await getNPedidoByNPedido(pedido.nPedido);
    if (numeroPedido) {
      socket.emit("pedido-ja-cadastrado", pedido);
    } else {
      createCardapio(pedido)
        .then((result) => {
          io.emit("novo-pedido", pedido);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

http.listen(8000, () => {
  console.log("server is running...a");
});

// fetch("/cardapio", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify(data),
// }).then((res) => {
//   if (res.status === 201) {
//     alert("Pedido enviado com sucesso!");
//     form.reset();
//   } else {
//     alert("Erro ao enviar pedido!");
//   }
// });
