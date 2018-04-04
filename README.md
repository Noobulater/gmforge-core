# gmforge-core
The Core Scripts providing all the virtual tabletop aspects of the tool (Development Server code excluded for security purposes)

# Getting Started

## What you'll need
A copy of GM Forge

A way to concatenate Javascript files (see [grunt](https://github.com/gruntjs/grunt), [gulp](https://github.com/gulpjs/gulp))



# How to start testing your code

#### Testing on the development Server
If you are just building a quick little applet, you can do live testing on the development server

To start testing your code, simply go to the development server @ www.gmforge.io, log-in and access the 'mod tools'

![Alt Text](https://i.imgur.com/KXwZkLV.gif)


#### Testing on your local GM Forge server

1. Install [node.js](https://nodejs.org/en/download/)
2. Open Power Shell/ CMD /Git Bash in main directory of repository.
3. Run "npm -g install gulp" (this will *globally* install gulp for you so you can use it as a command)
4. Run "npm update" (this will download all modules used by this repository, it may take a while).
5. Run "gulp all" to generate core.js
6. Run "npm start" to run the application.

Once you make changes you need to repeat step 5 and refresh page afterwards.



# This Readme is a WIP (Obviously)
I am doing my best to expand it! Lend me some support https://www.patreon.com/gmforge so I can spend the proper amount of time documenting and explaining how to do things!
