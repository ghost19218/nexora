const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "nexora_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Temporary database (in-memory)
const users = [];

// HOME
app.get("/", (req, res) => {
  res.redirect("/login");
});

// REGISTER PAGE
app.get("/register", (req, res) => {
  res.send("Create register.ejs next (we will add views soon)");
});

// REGISTER ACTION
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  users.push({
    id: users.length + 1,
    email,
    password: hashed,
    balance: 10000,
    role: "user",
    portfolio: []
  });

  res.redirect("/login");
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.send("Create login.ejs next (we will add views soon)");
});

// LOGIN ACTION
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.send("User not found");

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.send("Wrong password");

  req.session.user = user;

  res.redirect("/dashboard");
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.send(`
    <h1>Welcome ${req.session.user.email}</h1>
    <p>Balance: $${req.session.user.balance}</p>

    <form method="POST" action="/buy">
      <input name="amount" placeholder="Invest amount" />
      <button>Buy Demo Stock</button>
    </form>
  `);
});

// FAKE BUY TRADE
app.post("/buy", (req, res) => {
  const user = req.session.user;
  const amount = Number(req.body.amount);

  const price = 100 + Math.random() * 50;
  const qty = amount / price;

  user.balance -= amount;

  user.portfolio.push({
    stock: "NEXORA-DEMO",
    qty,
    price
  });

  res.redirect("/dashboard");
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Nexora running on port " + PORT);
});
