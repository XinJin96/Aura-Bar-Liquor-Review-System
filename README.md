# Aura-Bar-Liquor-Review-System 
This is CS546 Project Repo

<a name="readme-top"></a>

<br />
<!-- <div align="center">
  <a href="">
    <img src="logo.png" alt="Logo" width="600" >
  </a>

  <h3 align="center">This is CS546 Project Repo</h3>

  <p align="center">
    Allowing User to Choose Favoriate Events with Integrating Eventbrite API
    <br />
  </p>
</div> -->

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#members">Members</li>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#database">Database</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#reference">Reference</a></li>
  </ol>
</details>

<!-- Members -->

## Members

<div align="left">
Zimeng Zhao <br/>Xin Jin
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ABOUT THE PROJECT -->

## About The Project

<div align="center">
<!-- <img src="https://github.com/tzuminglu/2FA-with-email/blob/main/example.jpeg" width="320"> -->
</div>
Welcome to our Aura Bar Management app, specifically crafted for those passionate about bars and liquor. Our platform responds to the growing need for detailed information about drink quality, service, pricing, and ambiance. It features a user-friendly interface, offering comprehensive reviews and ratings to assist in finding the best liquor options. Key functionalities include a versatile login interface, a vivid liquor display page, in-depth liquor details with user reviews, a personalized user profile, and a robust bar management section for administrators. Enhance your liquor discovery experience with added features like photo-inclusive reviews, online reservations, and an easy-to-use contact menu. 


<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

To develop this project, you will need the following tools:

- [![JavaScript][JavaScript-img]][JavaScript-url]
- [![Express.js][Express.js-img]][Express.js-url]
- [![node.js][node.js-img]][node.js-url]
- [![postman][postman-img]][postman-url]
- [![mongodb][mongodb-img]][mongodb-url]
- [![handlebars][handlebars-img]][handlebars-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### How to start the project:
1. Install MongoDB & node.js.
2. make sure the creation of Database name aura_bar_liquor_system and collections name of users, reviews and users

3. Make sure the following ports are not occupied: `27017`(MongoDB service), `3000`.

4. Open your terminal, enter the command below, and choose a folder in which to clone the repository.
    ```sh
    git clone https://github.com/XinJin96/Aura-Bar-Liquor-Review-System.git
    ```

5. Go to the project root directory and run below code in terminal to install NPM packages
    ```sh
      npm i
    ```
6. Run Seed.js file to load all testing data
7. Add Enviroment Variable
   ```sh
   accountSid
   ```
   with value
   ```sh
   *****
   ```
   and
   ```sh
   authToken
   ```
   with value
   ```sh
   *****
   ```
9. Run below code in terminal to start the program
    ```sh
      npm start
    ```
    Then, you can open http://localhost:3000 on browser, enjoy!

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ## Database

<div align="center">
  <a href="">
    <img src="database.png" alt="Database" width="600" >
  </a>
</div>


## Contact

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->

## Reference

- [Node.js + MongoDB: User Authentication & Authorization with JWT](https://www.bezkoder.com/node-js-mongodb-auth-jwt/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[JavaScript-img]: https://img.shields.io/badge/javascript-blue?logo=javascript
[Express.js-url]: https://expressjs.com/
[Express.js-img]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[node.js-url]: https://nodejs.org/en
[node.js-img]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[postman-url]: https://www.postman.com/
[postman-img]: https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white
[mongodb-url]: https://www.mongodb.com/zh-cn
[mongodb-img]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[handlebars-url]: https://handlebarsjs.com/
[handlebars-img]: https://img.shields.io/badge/handlebars-orange

