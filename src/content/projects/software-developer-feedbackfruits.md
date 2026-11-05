---
title: "Software Developer @ FeedbackFruits"
description: "My time as developer for a custom software quality and statistics platform at FeedbackFruits,  a new startup here in Delft."
type: "work"
date: 2013-10-01
period: "Oct 2013 – Jul 2014"
---

I started working at [FeedbackFruits](http://feedbackfruits.com) by coincidence, a roommate heard from a friend that they needed developers. So I came by and had a pretty good discussion, followed by the offering of a contract. I've worked there for nearly a year, started with setting up a [Jenkins](https://jenkins-ci.org/) server voor continuous testing and building. After this was done we set up a [Zabbix](http://www.zabbix.com/) server to gather statistics from the servers. With the basics done, quality assurance was next in line.

By combining multiple testing frameworks for both the [ruby on rails](http://rubyonrails.org/) backend, [coffeescript](http://coffeescript.org/) client and visual frontend, we were able to gather a lot of information about testing results and coverage. This data was then also pushed into the Zabbix server to be aggregated. After this, the actual code quality was the target. Using several quality metrics measuring methods, we accumulated massive amounts of data, varying from cyclomatic complexity to class cohesion (see [software metrics on wikipedia](https://en.wikipedia.org/wiki/Software_metric)).

When all data was being gathered, we needed a way to display it. Since we had a lot of different data, we opted to build it ourselves, creating a pluggable framework for visualising data, based on [jQuery](https://jquery.com/) and [Rickshaw](http://code.shutterstock.com/rickshaw/) (derived from [D3.js](http://d3js.org/)). And we saw it was awesome.
