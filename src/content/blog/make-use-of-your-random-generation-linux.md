---
title: "Make use of your random generation linux"
description: "Here is a small snippet about how to convert the random bits from /dev/random to bytes."
type: "snippet"
date: 2015-06-11
---

To get random bits on a linux machine, all you need to do is access */dev/random*, though this might not give output (just wiggle your mouse or enter random keys). I just received my [ONErng](http://onerng.info/) that creates a steady supply of random bits. But bits are not that useful, so I found way to convert them to bytes:

    < /dev/random stdbuf -o0 strings --bytes 1 | stdbuf -o0 tr -d '\n\t'

This converts the bits to bytes and then to ascii, so you can read some. See the output here:
![Terminal window filled with random ASCII characters from the command above](/images/posts/onerng-random-output.jpg)
