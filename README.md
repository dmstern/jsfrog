npmFrog
======

A nice npmjs.org-like web interface for jFrog Artifactory

## Installation

```bash
npm i -g npmfrog
```

Duplicate the file `.SAMPLE.npmfrogrc.json` and rename it to `.npmfrogrc.json` (you either leave it in the project directory or put it in your home directory).

## Usage

```bash
npm start
```

Browse to npmFrog instance [http://localhost:8000](http://localhost:8000).

### Development

```bash
npm run dev
```

With local environment (without internet connection):

```bash
npm run dev-local
```

To see the logs, run

```bash
npm run logs
```

Stop all running background processes:

```bash
npm stop
```
