# gmforge-core
The Core Scripts providing all the virtual tabletop aspects of the tool (Development Server code excluded for security purposes)

# Getting Started

## What you'll need
A copy of GM Forge

A way to concatenate Javascript files (see [grunt](https://github.com/gruntjs/grunt), [gulp](https://github.com/gulpjs/gulp))

#### Installing Prerequisites

1. You will require NodeJS and the NPM package manager.
2. Install nodejs dependencies by opening a terminal in the repository root.

```
npm install
```

3. You will need to also install gulp in order to concatenate the javascript files to form the core.js script.
```
npm install -g gulp
```

# How to start testing your code

## Build and Copy core.js file

If you edit any of the files in ```src/scripts/``` you will need to re-bundle them into a ```core.js``` script in order to test them.

### Linux:

You may need to change the output directory defined in ```gulpfile.js```. Change ```.pipe(gulp.dest('/dist'))``` to a different path: e.g. ```.pipe(gulp.dest('./some_local_path'))```

Then from the root of the repository:
```
gulp core
cp dist/core.js public/bin/
```

change ```dist/core.js``` to the path that you built ```core.js``` to

## Testing

### Testing on the development Server
If you are just building a quick little applet, you can do live testing on the development server

To start testing your code, simply go to the development server @ www.gmforge.io, log-in and access the 'mod tools'

![Alt Text](https://i.imgur.com/KXwZkLV.gif)


### Testing on your local GM Forge server

In order to get your new code running, you must first concatenate your modified 'Scripts' folder together into a single file, 'core.js'.

### Test Via Local Electron Application
To run the application as a local electron app. In the root of the repository run:

```
npm start
```

A window should appear running the application.


### TODO Write out how to concatenate your files

Once you have concatenated the files, overwrite the 'core.js' file in your /public/bin folder.

Once you have overwritten the changes, simply refresh using ctrl+R, or restart your server, and you will be able to see the newest changes.

# This Readme is a WIP (Obviously)
I am doing my best to expand it! Lend me some support https://www.patreon.com/gmforge so I can spend the proper amount of time documenting and explaining how to do things!
