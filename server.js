const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./db");

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

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    function (err) {
      if (err) return res.send("User already exists");
      res.redirect("/login");
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.send("User not found");

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.send("Wrong password");

    req.session.user = user;
    res.redirect("/dashboard");
  });
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  db.get(
    "SELECT * FROM users WHERE id = ?",
    [req.session.user.id],
    (err, user) => {
      res.render("dashboard", { user });
    }
  );
});

app.post("/buy", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const amount = Number(req.body.amount);
  const price = 100 + Math.random() * 50;

  db.run(
    "UPDATE users SET balance = balance - ? WHERE id = ?",
    [amount, req.session.user.id]
  );

  db.get(
    "SELECT * FROM users WHERE id = ?",
    [req.session.user.id],
    (err, user) => {
      req.session.user = user;
      res.redirect("/dashboard");
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Nexora running on port " + PORT);
});
