const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const request = require("request");
const req = require("express/lib/request");
const { db } = require("./../../util/admin");
const bodyParser = require("body-parser");

const router = express.Router();

// opis api 
router.get("/", (req, res) => {
  res.send(`
        <html>
          <head>
            <title>Lotto API</title>
          </head>
          <body style="background-color: black; color: #00BFFF">
            <h1>Lotto API</h1>
            <p>To API umożliwia pobieranie aktualnych i archiwalnych wyników losowań gier Lotto, Lotto Plus, Mini Lotto oraz Eurojackpot. Dostępne są następujące endpointy:</p>
            <p> W zależności od potrzeb API zwraca liczbę wyników wpisaną po / . Przykładowo zapytanie https:/lottoapi.herokuapp.com/lottoplus-results/10 zwróci 10 ostatnich wyników. Maksymalnie można otrzymać 100 wyników.</p>
            <ul>
            <li><a style="color: #FFD700; a:link {
              color: #FFD700;
            }"
            href="/lotto-results/5"> https:/lottoapi.herokuapp.com/lotto-results/5 </a> - 5 ostatnich wyników Lotto </li> 
            <li><a style="color: #FFD700; a:link {
              color: #FFD700;
            }" href="/lottoplus-results/5"> https:/lottoapi.herokuapp.com/lottoplus-results/5 </a> - 5 ostatnich wyników Lotto Plus</li> 
            <li><a  style="color: #FFD700; a:link {
              color: #FFD700;
            }" href="/minilotto-results/5"> https:/lottoapi.herokuapp.com/minilotto-results/5 </a> - 5 ostatnich wyników Mini Lotto</li>
            <li><a style="color: #FFD700; a:link {
              color: #FFD700;
            }" href="/eurojackpot-results/5"> https:/lottoapi.herokuapp.com/eurojackpot-results/5 </a> - 5 ostatnich wyników Eurojackpot</li>
            </ul>
            <p> Ponadto API umozliwia tworzenie kont uzytkownikow i przechwywanie w nim kuponów: </p>
            <ul>
            <li><p> router.post("/users/create", ...) obsługuje żądanie utworzenia nowego użytkownika. </p></li>

            <li><p> router.delete("/users/:nick", ...) obsługuje żądanie usunięcia użytkownika. </p></li>

            <li><p> router.get("/users/:nick", ...) obsługuje żądanie wyswietlenia danych uzytkownika. </p></li>

            <li><p> router.post("/users/:nick/tickets/create", ...) obsługuje żądanie utworzenia nowego kuponu. </p></li>

            <li><p> router.delete("/users/:nick/tickets/:id", ...) obsługuje żądanie usunięcia kuponu </p></li>

            <li><p> router.get("/users/:nick/tickets", ...) obsługuje żądanie pobrania wszystkich kuponów użytkownika </p></li>

            <li><p> router.put("/users/:nick", ...) obsługuje ządzanie zmiany nazwy uzytkownika o podanym nicku. 


          </body>
        </html>
      `);
});

//dodanie uzytkownika
router.post("/users/create", (req, res) => {
  const id = req.body.id;
  const nick = req.body.nick;
  const name = req.body.name;

  const userRef = db.collection("user");

  userRef
    .where("nick", "==", nick)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        userRef
          .add({
            nick: nick,
            name: name,
          })
          .then((docRef) => {
            return res
              .status(201)
              .json({ message: `Dodano uzytkownika: ${nick} !` });
          })
          .catch((error) => {
            return res.status(500).json({ error: error });
          });
      } else {
        return res.status(400).json({ message: `Uzytkownik ${nick} juz istnieje!` });
      }
    });
});

//usuwanie uzytkownika o podanym nicku 
router.delete("/users/:nick", (req, res) => {
  const userRef = db.collection("user");
  try {
    userRef
      .where("nick", "==", req.params.nick)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return res
            .status(400)
            .json({ message: `Uzytkonwik ${req.params.nick} nie istnieje` });
        } else {
          userRef
            .where("nick", "==", req.params.nick)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                doc.ref.delete();
              });
            })
            .catch((error) => {
              return res.status(500).json({ error: error });
            });
          return res
            .status(201)
            .json({ message: `Uzytkownik ${req.params.nick} został usunięty!` });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj pponownie później!" });
  }
});

//wyswietlenie danych uzytkownika 
router.get("/users/:nick", (req, res) => {
  const userRef = db.collection("user");
  try {
    userRef
      .where("nick", "==", req.params.nick)
      .get()
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return res.status(201).json(data);
      });
  } catch (error) {
    return res
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj ponownie poźniej!" });
  }
});

//aktualizacja imienia uzytkownika o podanym nicku
router.put("/users/:nick", (req, res) => {
  const userRef = db.collection("user");
  try {
    userRef
      .where("nick", "==", req.params.nick)
      .get()
      .then(
        (snapshot) => {
          if (snapshot.empty) {
            return res
              .status(400)
              .json({ message: `Uzytkownik ${req.params.nick} nie istnieje!` });
          } else {
            userRef
              .where("nick", "==", req.params.nick)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  doc.ref.update({
                    name: req.body.name,
                  });
                });
              })
              .catch((error) => {
                return res.status(500).json({ error: error });
              });
            return res
              .status(201)
              .json({ message: `Imie uzytkownika ${req.params.nick} zostało zmienione!` });
          }
        }
      )
      .catch((error) => {
        return res.status(500).json({ error: error });
      });
  } catch (error) {
    return res  
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj ponownie poźniej!" });
  }
});


//dodanie kuponu dla uzytkownika przed dodaniem sprawdz czy istnieje juz kupon o takim samym ticketNumber
router.post("/users/:nick/tickets/create", (req, res) => {
  const userRef = db.collection("user");
  const couponRef = db.collection("tickets");
  const ticketNumber = req.body.ticketNumber;
  const userNick = req.params.nick;
  const numbers = req.body.numbers;
  try {
    couponRef
      .where("ticketNumber", "==", ticketNumber)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          couponRef
            .add({
              ticketNumber: ticketNumber,
              userNick: userNick,
              numbers: numbers
            })
            .then((docRef) => {
              return res
                .status(201)
                .json({ message: `Dodano kupon o numerze: ${ticketNumber} !` });
            })
            .catch((error) => {
              return res.status(500).json({ error: error });
            });
        } else {
          return res
            .status(400)
            .json({ message: `Kupon o numerze ${ticketNumber} juz istnieje!` });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj ponownie poźniej!" });
  }
});


//wyswietlenie kuponow uzytkownika 
router.get("/users/:nick/tickets", (req, res) => {
  const userRef = db.collection("user");
  const couponRef = db.collection("tickets");
  try {
    couponRef
      .where("userNick", "==", req.params.nick)
      .get()
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return res.status(201).json(data);
      });
  } catch (error) {
    return res
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj ponownie poźniej!" });
  }
});

//usuniecie kuponów o konkretnym id dla konkretnego uzytkownika 
router.delete("/users/:nick/tickets/:id", (req, res) => {
  const userRef = db.collection("user");
  const couponRef = db.collection("tickets");
  try {
    userRef
      .where("nick", "==", req.params.nick)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return res
            .status(400)
            .json({ message: `Uzytkonwik ${req.params.nick} nie istnieje` });
        } else {
          couponRef
            .where("userNick", "==", req.params.nick)
            .where("ticketNumber", "==", req.params.id)
            .get()
            .then((snapshot) => {
              if (snapshot.empty) {
                return res
                  .status(400)
                  .json({ message: `Kupon ${req.params.id} nie istnieje!` });
              } else {
                snapshot.forEach((doc) => {
                  couponRef
                    .doc(doc.id)
                    .delete()
                    .then(() => {
                      return res
                        .status(201)
                        .json({ message: `Usunięto kupon` });
                    })
                    .catch((error) => {
                      return res.status(500).json({ error: error });
                    });
                });
              }
            })
            .catch((error) => {
              return res.status(500).json({ error: error });
            });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .json({ general: "Coś poszło nie tak, spróbuj ponownie poźniej!" });
  }
});


/////////////////

// wyniki lotto plus
router.get("/lottoplus-results/:number?", (req, res) => {
  const number = parseInt(req.params.number, 10);
  request(
    "https://megalotto.pl/wyniki/lotto-plus/100-ostatnich-losowan",
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const a = $(".lista_ostatnich_losowan").find(".nr_in_list").text();
        const game_numbers = a.split(" ");

        const b = $(".lista_ostatnich_losowan").find(".date_in_list").text();
        var dates = [];
        for (var i = 0, charsLength = b.length; i < charsLength; i += 10) {
          dates.push(b.substring(i, i + 10));
        }

        const c = $(".lista_ostatnich_losowan")
          .find(".numbers_in_list ")
          .text();
        const numbers = c.split(" ");
        let d = 0;
        finally_numbers = [];
        for (let i = 0; i <= numbers.length - 5; i += 6) {
          finally_numbers[d] =
            numbers[i] +
            "," +
            numbers[i + 1] +
            "," +
            numbers[i + 2] +
            "," +
            numbers[i + 3] +
            "," +
            numbers[i + 4] +
            "," +
            numbers[i + 5];
          if (d > 0) {
            let z = finally_numbers[d];
            z = z.substr(0, [z.length - 1]);
            finally_numbers[d] = z;
          }
          d += 1;
        }
        const lottoplus = {
          game: [],
        };

        for (let i = 0; i < number; i++) {
          lottoplus.game.push({
            game_numbers: game_numbers[i],
            date: dates[i],
            numbers: finally_numbers[i],
          });
        }
        res.send({ lottoplus });
      } else {
        res.send({ error: "Nie udało się pobrać danych" });
      }
    }
  );
});

// wyniki lotto
router.get("/lotto-results/:number?", (req, res) => {
  const number = parseInt(req.params.number, 10);
  request(
    "https://megalotto.pl/wyniki/lotto/100-ostatnich-losowan",
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        let a = $(".lista_ostatnich_losowan").find(".nr_in_list").text();
        const game_numbers = a.split(" ");

        let b = $(".lista_ostatnich_losowan").find(".date_in_list").text();
        const dates = [];

        for (var i = 0, charsLength = b.length; i < charsLength; i += 10) {
          dates.push(b.substring(i, i + 10));
        }
        const c = $(".lista_ostatnich_losowan")
          .find(".numbers_in_list ")
          .text();
        const numbers = c.split(" ");
        let d = 0;
        const finally_numbers = [];
        for (let i = 0; i <= numbers.length - 5; i += 6) {
          finally_numbers[d] =
            numbers[i] +
            "," +
            numbers[i + 1] +
            "," +
            numbers[i + 2] +
            "," +
            numbers[i + 3] +
            "," +
            numbers[i + 4] +
            "," +
            numbers[i + 5];
          if (d > 0) {
            let z = finally_numbers[d];
            z = z.substr(0, [z.length - 1]);
            finally_numbers[d] = z;
          }
          d += 1;
        }
        const lotto = {
          game: [],
        };

        for (let i = 0; i < number; i++) {
          lotto.game.push({
            game_number: game_numbers[i],
            date: dates[i],
            numbers: finally_numbers[i],
          });
        }
        res.send({ lotto });
      } else {
        res.send({ error: "Nie udało się pobrać danych" });
      }
    }
  );
});

// wyniki eurojackpot
router.get("/eurojackpot-results/:number?", (req, res) => {
  const number = parseInt(req.params.number, 10);
  request(
    "https://megalotto.pl/wyniki/eurojackpot/100-ostatnich-losowan",
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        const a = $(".lista_ostatnich_losowan").find(".nr_in_list").text();
        const game_numbers = a.split(" ");

        const b = $(".lista_ostatnich_losowan").find(".date_in_list").text();
        var dates = [];
        for (var i = 0, charsLength = b.length; i < charsLength; i += 10) {
          dates.push(b.substring(i, i + 10));
        }

        const c = $(".lista_ostatnich_losowan")
          .find(".numbers_in_list ")
          .text();
        const numbers = c.split(" ");
        let d = 0;
        finally_numbers = [];
        for (let i = 0; i <= numbers.length - 5; i += 5) {
          finally_numbers[d] =
            numbers[i] +
            "," +
            numbers[i + 1] +
            "," +
            numbers[i + 2] +
            "," +
            numbers[i + 3] +
            "," +
            numbers[i + 4];
          if (d > 0) {
            let z = finally_numbers[d];
            z = z.substr(0, [z.length]);
            finally_numbers[d] = z;
          }
          d += 1;
        }

        const e = $(".tsn_number_in_list")
          .each(function (index) {
            $(this).prepend(" ");
            $(this).append(" ");
          })
          .text();
        const f = e.split("  ");
        let g = 0;
        finally_numbers1 = [];
        for (let i = 0; i <= f.length - 1; i += 2) {
          finally_numbers1[g] = f[i] + "," + f[i + 1];
          let z = finally_numbers1[g];
          let s = z.trim();
          z = z.replace("\n", "");
          finally_numbers1[g] = s;
          g += 1;
        }

        const eurojackpot = {
          game: [],
        };

        for (let i = 0; i < number; i++) {
          eurojackpot.game.push({
            game_number: game_numbers[i],
            date: dates[i],
            numbers: finally_numbers[i],
            additionalnumbers: finally_numbers1[i],
          });
        }
        res.send({ eurojackpot });
      } else {
        res.send({ error: "Nie udało się pobrać danych" });
      }
    }
  );
});

// wyniki mini lotto
router.get("/minilotto-results/:number?", (req, res) => {
  const number = parseInt(req.params.number, 10);
  request(
    "https://megalotto.pl/wyniki/mini-lotto/100-ostatnich-losowan",
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        const a = $(".lista_ostatnich_losowan").find(".nr_in_list").text();
        const game_numbers = a.split(" ");

        const b = $(".lista_ostatnich_losowan").find(".date_in_list").text();
        var dates = [];
        for (var i = 0, charsLength = b.length; i < charsLength; i += 10) {
          dates.push(b.substring(i, i + 10));
        }

        const c = $(".lista_ostatnich_losowan")
          .find(".numbers_in_list ")
          .text();
        const numbers = c.split(" ");
        let d = 0;
        finally_numbers = [];
        for (let i = 0; i <= numbers.length - 4; i += 5) {
          finally_numbers[d] =
            numbers[i] +
            "," +
            numbers[i + 1] +
            "," +
            numbers[i + 2] +
            "," +
            numbers[i + 3] +
            "," +
            numbers[i + 4];
          if (d > 0) {
            let z = finally_numbers[d];
            z = z.substr(0, [z.length - 1]);
            finally_numbers[d] = z;
          }
          d += 1;
        }

        const minilotto = {
          game: [],
        };

        for (let i = 0; i < number; i++) {
          minilotto.game.push({
            game_number: game_numbers[i],
            date: dates[i],
            numbers: finally_numbers[i],
          });
        }
        res.send({ minilotto });
      } else {
        res.send({ error: "Nie udało się pobrać danych" });
      }
    }
  );
});

module.exports = router;