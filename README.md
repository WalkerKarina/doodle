
## Doodle

Uses Google's Quick Draw dataset.

### `npx webpack`

Creates and updates distribution folder.<br />
Access from index.html in distribution folder.

### `conda activate doodle`

Conda virtual environment used.<br />


### `npm run deploy`

To publish page on Github Pages.

1. npm install gh-pages --save-dev<br />
2. Remove dist from .gitignore<br />
3. git add dist && git commit -m "add dist" <br />
4. git push <br />
5. "homepage": "http://walkerkarina.github.io/doodle" in package.json<br />
6. Inside scrips, "deploy": "gh-pages -d dist" <br />
7. npm run deploy <br />



