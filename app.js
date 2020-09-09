const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cookieSession = require('cookie-session');
const userRepo = require('./repo/userRepo');
const server = express();

const navBar = `  <style>
    .div-nav {
        text-align: center;
    }

    .navig {
        font-size: large;
        padding: 25px;
        display: inline-block;
        text-align: center;
    }

    .navig a {
        text-decoration: none;
        text-align: center;
        padding: 15px;
        border: 2px black solid;
    }
</style>

<div class="div-nav">
    <nav class="navig">
        <a href="/">Home</a>
        <a href="/search">Search for User</a>
        <a href="/listUser">List All User</a>
        <a href="/registration">Registration</a>
        <a href="/login">Login</a>
        <a href="/logout">Logout</a>
    </nav>
</div>`;

server.use(bodyparser.urlencoded({
  extended: true
}));

server.use(cookieSession({
  keys: ['jaq-s22d.fgt_33QFzj6@']
}));

server.get('/', (req, res) => {
  if (req.session.id !== undefined) {
    res.send(`
  ${navBar}
  <div class="div-nav">
        <P>user id is: ${req.session.id}</p>
        <P>user Mail is: ${req.session.email}</P>
    </div>
  `);
  } else {
    res.send(`
  ${navBar}
    <div class="div-nav">
        <P>Please login</p>
    </div>
  `);
  }
});


server.get('/registration', (req, res) => {
  res.send(`
  ${navBar}
   <div class="div-nav">
        <form method="POST">
            <input name="email" placeholder="email">
            <input name="password" placeholder="password">
            <input name="passwordConfirm" placeholder="password Confirmation">
            <button>sign up</button>
        </form>
    </div>`);
});

server.post('/registration', async (req, res) => {
  const {
    email,
    password,
    passwordConfirm
  } = req.body;
  let newUser;
  const existingUser = await userRepo.getOneBy({
    email
  });
  if (existingUser) {
    res.send(`
    ${navBar}
    <div class="div-nav">
    <p>email is in use</p>
    </div>
    `);
  } else if (password !== passwordConfirm) {
    res.send(`
    ${navBar}
    <div class="div-nav">
    <p>Password mismatch</p>
    </div>`);
  } else if (!email || !password) {
    res.send(`
    ${navBar}
    <div class="div-nav">
    <p>Enter email and Password</p>
    </div>`);
  } else {
    newUser = await userRepo.create({
      email,
      password,
    });

    req.session.id = newUser.id;
    req.session.email = newUser.email;

    res.send(`
    ${navBar}
    <div class="div-nav">
    <p>Account created with ${newUser.id}</p>
    </div>`);
  };
});


server.get('/login', (req, res) => {
  if (req.session.id === undefined) {
    res.send(`
  ${navBar}
   <div class="div-nav">
        <form method="POST">
            <input name="email" placeholder="email">
            <input name="password" placeholder="password">
            <button>Sign in</button>
        </form>
    </div>`);
  } else {
    res.send(`
  ${navBar}
   <div class="div-nav">
      <p>User is already Logged in</p>
    </div>`);
  }
});
server.post('/login', async (req, res) => {

  const {
    email,
    password
  } = req.body;

  const user = await userRepo.getOneBy({
    email
  });
  const validity = await userRepo.comparePassword(user.password, password);

  if (user !== undefined && email === user.email) {
    if (validity) {
      req.session.id = user.id;
      req.session.email = user.email;
      res.send(`
    ${navBar}
    <div class="div-nav">
        <P>user logged in successfully</p>
    </div>
  `);
    } else {
      return res.send(`
    ${navBar}
    <div class="div-nav">
        <P>Wrong email or Password</p>
    </div>
  `);
    }
  } else {
    return res.send(`
    ${navBar}
    <div class="div-nav">
        <P>Wrong email or Password</p>
    </div>
  `);
  }
});


server.get('/search', (req, res) => {
  res.send(`
  ${navBar}
   <div class="div-nav">
        <form method="POST">
            <input name="email" placeholder="Email">
            <button>Search</button>
        </form>
    </div>`);
});
server.post('/search', async (req, res) => {

  const {
    email,
  } = req.body;
  if (email) {
    const user = await userRepo.getOneBy({
      email
    });
    if (user !== undefined && user.email === email) {
      res.send(`
      ${navBar}
      <div class="div-nav">
          <P>User Email: ${user.email}</p>
          <P>User Id: ${user.id}</p>
      </div>
    `);
    } else {
      return res.send(`
      ${navBar}
      <div class="div-nav">
          <P>No User found</p>
      </div>
    `);
    }

  } else {
    return res.send(`
    ${navBar}
    <div class="div-nav">
        <P>Please Search with email or Id</p>
    </div>
  `);
  }
});


server.get('/listUser', (req, res) => {
  res.send(`
  ${navBar}
   <div class="div-nav">
        <form method="POST">
            <input name="adminPassword" placeholder="Admin Password">
            <button>List All User</button>
        </form>
    </div>`);

});
server.post('/listUser', async (req, res) => {
  const {
    adminPassword,
  } = req.body;

  if (adminPassword) {
    const users = await userRepo.getAll();
    if (adminPassword === '6244') {
      let userList = `<style>.div-nav2{border:2px green solid}</style> ${navBar}`;
      for (let user of users) {
        userList += `<div class="div-nav div-nav2">
              <P>User Email: ${user.email}</p>
              <P>User Email: ${user.id}</p>
            </div>`;
      };
      res.send(userList);
    } else {
      return res.send(`
    ${navBar}
    <div class="div-nav">
        <P>Wrong Password</p>
    </div>
  `);
    }
  } else {
    return res.send(`
    ${navBar}
    <div class="div-nav">
        <P>Please enter password</p>
    </div>
  `);
  }

});


server.get('/logout', (req, res) => {
  req.session = null;
  res.send(`
    ${navBar}
    <div class="div-nav">
        <P>user logged out</p>
       
    </div>
  `);
});
server.listen(3000, () => {
  console.log('server running');
});