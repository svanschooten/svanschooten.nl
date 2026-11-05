---
title: "A new, cross-platform, application building framework!"
description: "I built a new app. With a new framework. Without a server. For keeping lists in sync with my housemates."
type: "post"
date: 2018-10-25
---

I always want to automate things in and around my house, and, as I live together with two good friends, we have some shared commodities: things as onions, garlic, toilet paper and so on. A short while ago, I decided to make an app to have some easier way to share all the lists with my housemates.
Enter [Flutter](https://flutter.io/).

My eye landed on Flutter through a conference video on Youtube (I can't recall which one) and I was interested. One of my biggest grievances with app development was having to develop and maintain two separate application, one for Android and one for iOS. Don't forget the outdated design methodology behind their respective interface definition tools/languages. And.. No, that was not the subject.

I started learning Flutter by following their quickstart and then diving into the language design. It feels very similar to other component based frameworks such as React, or even a bit more easy or comfortable to work in. Added bonus: the patterns emerging from React (such as the [Flux](https://facebook.github.io/flux/docs/overview.html) pattern resulting in the immensely popular Redux library) can be almost certainly applied on Flutter (see the resulting [flutter_redux library](https://github.com/brianegan/flutter_redux)), which is an enormous boost in and of itself.

Almost forgot. Flutter builds natively to both Android and iOS without the requirement of having two separate interface definitions, up to 100% of the codebase can be shared (of the Flutter app, not the Android/iOS wrapper code). And Flutter is a delight to work with.

The huge amount of ways to declare stuff implicitly, explicitly, inherited, overwritten and so much more is not just syntactic sugar, it is a key aspect around which the language [Dart](https://www.dartlang.org/) (upon which Flutter is built) is designed. Methods can be passed as arguments introducing functional programming aspects, along with the OOP "feel" of it and support for streams, asynchronous methods... Damn, Flutter/Dart is awesome, but still not the only thing used for the app.

[Firebase](https://firebase.google.com/) is the Google realtime database solution (or was at least, it now contains a lot more) and their "Spark" plan is free! And it can be used in web, Android, iOS, Flutter... Name it! Using the Google flutter library for logging in I can manage the backend from their console, writing new posts and stuff. Access control is managed by an internal list which has no external write access (only from the web console) and contains the only email addresses, that the google login should match, get access.

The source code can be found [here on Github](https://github.com/svanschooten/locust).
