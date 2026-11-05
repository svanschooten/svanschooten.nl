---
title: "Flooding based cluster identification"
description: "A clustering algorithm based on local and global flooding to see which cells are connected orthogonally"
type: "post"
date: 2018-10-22
---

As a coding exercise I had to implement a few pieces of code, and one of them was a cluster counting algorithm. But, instead of only relying on basic counting methods, I built a cluster identification system that uses queues to support a flooding algorithm. I also built a visualisation mini-application as [a subpage here](/clusterflooding/).

### The algorithm
The foundation for this algorithm is based on exploring (flooding) a local cluster and pushing the edges of this cluster on the global queue. This is done by evaluating the four orthogonal neighbours, either from the perspective of the cell coming from the global queue or the local cluster queue.
If not yet part of a cluster, the labels are compared, and if they match the current cluster label it is pushed on the local queue and on the global queue otherwise, since it is part of another cluster.

[The commented source](/clusterflooding/#source) code should show clear enough how this is built, along with the intergrated visualisation and queueing mechanics.
