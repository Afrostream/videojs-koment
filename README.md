[![Build Status](https://api.travis-ci.org/Afrostream/videojs-koment.svg?branch=master)](https://travis-ci.org/Afrostream/videojs-koment)

# koment Plugin for video.js

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Inclusion](#inclusion)
- [Basic Usage](#basic-usage)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Install videojs-koment via npm (preferred):

```sh
$ npm install videojs-koment
```

Or Bower:

```sh
$ bower install videojs-koment
```

## Inclusion

Include videojs-koment on your website using the tool(s) of your choice.

The simplest method of inclusion is a `<script>` tag after the video.js `<script>` tag:

```html
<script src="path/to/video.js/dist/video.js"></script>
<script src="path/to/videojs-koment/dist/videojs-koment.js"></script>
```

When installed via npm, videojs-koment supports Browserify-based workflows out of the box.

## Basic Usage

For full details on how to use the playlist plugin can be found in [the API documentation](docs/api.md).

```js
var player = videojs('video');

player.koment();

```

## License

Apache-2.0. Copyright (c) Brightcove, Inc.
