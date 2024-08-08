# Mice Game

> [!WARNING]  
> Building reactivity is currently broken in production, making it unplayable. Clone the repo and run `npm run dev` to play.

You can play the latest build of the game [here](https://lonevox.github.io/mice-game/)! Note that it is in early development, so there isn't much gameplay at the moment.

## Overview

*You are a mouse in a field of grain.* From here, you must expand into a mouse empire and conquer the stars.

Mouse Game is a web incremental game with maximum complexity and minimal fluff (besides the mice, they're fluffy!). The key gameplay components are:
- Resources. Everything you have is a reource, including your Mice!
- Buildings. These consume resources to build, but many buildings can produce resources in return. Some buildings may improve the effect of other buildings, or increase your resource storage, or modify mechanics, etc.
- Upgrades. The concrete accomplishments of your mouse empire. Upgrades modify any and every mechanic in the game. They are also the primary way that new mechanics are introduced.
- Combat. There aren't just mice in this world... Conquer different species to expand your empire in new lands.
- Events. Randomly, an event may occur. They can be positive, like a scientific breakthrough, or negative, like a crop failure.

The gameplay components are simple, but complexity emerges when everything interacts with each other. To help manage this complexity, there are some helpful UI features. For example, you can hover over resource storage or production values to get a breakdown of what makes up these values:

![image](https://github.com/user-attachments/assets/a8af8544-bc88-482c-ab35-6509340265b8)


## Is this game just a copy of Kittens Game?

This project is heavily inspired by [Kittens Game](https://kittensgame.com), even down to the name. It's my excuse to learn Svelte 5 and its new reactivity features, being that a Kittens-like game leads itself heavily to reactivity. The design of the mechanics in Kittens Game is amazing. You have buildings, resources, and upgrades, all of which can interact with each other in various ways. The mechanics are simple, but the design space is huge. Mice Game is made with this in mind, with a focus on making it easy to create interactions between different game systems.

It's worth noting that Mice Game does not use any code from Kittens Game, as that would be against their [license](https://bitbucket.org/bloodrizer/kitten-game/src/master/license.txt), specifically the line *"Using the game code for commercial gain or creation of derivative works is not permitted."* I consider this to disallow not only copying but *viewing* their code before making changes to Mice Game (see [contributing](https://github.com/lonevox/mice-game/blob/main/CONTRIBUTING.md)).

### How is Mice Game different from Kittens Game?

- **Different mechanics.** Mice Game has land usage, combat, and resource transport to name a few. It equally lacks mechanics that are present in Kittens Game, so you'll have a unique experience playing both games.

- **Mod-centric design.** See [Mods](#mods).

## Mods

> [!NOTE]  
> Mod support is still in development. Documentation will be available on the wiki when mod support is available.

The base game in Mice Game is itself a mod, which doesn't actually need to be loaded. If you want to make Mice Game your own, you can easily add to or change the game yourself via a mod, even if you don't know how to code.
