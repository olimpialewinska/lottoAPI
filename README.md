<p align="center">  LOTTOAPI
</p>

## General info
This API allows you to download current and archived Lotto, Lotto Plus, Mini Lotto and Eurojackpot draw results. The following endpoints are available:

* https:/lottoapi.herokuapp.com/lotto-results/5 - Lotto last 5 results
* https:/lottoapi.herokuapp.com/lottoplus-results/5 - Lotto Plus last 5 results
* https:/lottoapi.herokuapp.com/minilotto-results/5 - Mini Lotto last 5 results
* https:/lottoapi.herokuapp.com/eurojackpot-results/5 - Eurojackpot last 5 results

Depending on the needs, the API returns the number of results entered after / . For example, the query https:/lottoapi.herokuapp.com/lottoplus-results/10 will return the last 10 results. A maximum of 100 results can be obtained.

The API has four routes for managing users: /users/create creates a new user, /users/:nick gets a user by their nick (username), /users/:nick deletes a user by their nick, and /users/:nick/tickets/create creates a new ticket for a user. The /users/create and /users/:nick/tickets/create routes also include logic for checking if a user or ticket already exists, and returning an error if it does.

## Technologies

* Express.js
* JavaScript


## Setup

https://lottoapi.herokuapp.com/

