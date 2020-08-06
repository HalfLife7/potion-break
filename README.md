<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://github.com/HalfLife7/potion-break/blob/master/public/images/big-potion-break-logo.png?raw=true" alt="Project logo"></a>
</p>

<h3 align="center">Potion Break</h3>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  [![GitHub Last Committ](https://img.shields.io/github/last-commit/HalfLife7/potion-break)](https://github.com/HalfLife7/potion-break/commits/master)
  [![License](https://img.shields.io/github/license/HalfLife7/potion-break)](/LICENSE)

</div>

---

<p align="center"> Take a break from gaming with the help of loss aversion.
    <br> 
</p>

## 📝 Table of Contents
- [About](#about)
- [Getting Started](#getting_started)
- [Built Using](#built_using)
- [TODO](./TODO.md)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>
<p>Games can be quite addicting! Even when you have an important deadline coming up, you might not be to resist slaying the next dragon or getting new loot.</p>

<p>By committing to pay a charity 'x' amount of dollars if you fail to take a break from playing, it might give you that extra bit of motivation you need to resist playing.</p>

<p>**Note that Potion Break is still in testing and no real money is involved! Use test cards such as '4242 4242 4242 4242' for testing.</p>

<p>3 Steps to Potion Break:</p>

<ol>
  <li>Customize your Potion Break - Options include game, charity and duration</li>
  <li>Go AFK! - Spend your extra time learning a new hobby, studying for that test or playing some basketball.</li>
  <li>Sucessfully take a break? Save your hard earned cash.<br>Give in to temptation? Lose your money to the charity of your choice</li>
</ol>

## 🏁 Getting Started <a name = "getting_started"></a>
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
What things you need to install the software and how to install them.

---
## Requirements

For development, you will only need Node.js and a node package manager installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

If the installation was successful, you should be able to run the following command.
```
    $ node --version
    v12.18.2

    $ npm --version
    6.14.5
```
If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.
```
    $ npm install npm -g
```
## Install
```
    $ git clone https://github.com/HalfLife7/potion-break
    $ cd potion-break
    $ npm install
```
## Configure app

Open `potion-break/.env.example` then edit it with your settings and rename to ONLY '.env'. You will need:
```
- STEAM_API_KEY - https://steamcommunity.com/dev/apikey
- STRIPE_API_KEYS - https://stripe.com/docs/keys
```
## Running the project
```
    $ npm run start
```
## ⛏️ Built Using <a name = "built_using"></a>
### Backend
- [NodeJS](https://nodejs.org/en/) - Server Environment
- [Express](https://expressjs.com/) - Server Framework
- [Sqlite3](https://www.sqlite.org/) - Database

### Frontend
- [Bulma](https://bulma.io/) - CSS Framework
- [mustache](https://mustache.github.io/) - Templating
- [fancybox](http://fancyapps.com/fancybox/3/) - Media Lightbox
- [swiper](https://swiperjs.com/) - Media Carousel
- [Flatpickr](https://flatpickr.js.org/) - Datetime Picker

### Utilities
- [axios](https://www.npmjs.com/package/axios) - HTTP Client
- [Passport](http://www.passportjs.org/) - Authentication
- [Bluebird](http://bluebirdjs.com/) - Promise Library
- [Bottleneck](https://github.com/SGrondin/bottleneck#readme) - Rate Limiter
- [cron](https://www.npmjs.com/package/cron) - Scheduler
- [Moment](https://momentjs.com/) - Datetime Library
- [Stripe](https://stripe.com/) - Payment Processing
- [Steam](https://steamcommunity.com/dev) - Steam API

## 🎉 Acknowledgements <a name = "acknowledgement"></a>
- Big thanks to anyone whose code was used (acknowledged in code comments)
- Pocket Article on Killing Bad Habits for intial idea - https://getpocket.com/explore/item/the-behavioral-economics-diet-the-science-of-killing-a-bad-habit
- stickK for validation that the concept works - https://www.stickk.com/

