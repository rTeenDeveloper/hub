Contributing guidelines and workflow
====

## Getting started
* Check out repository. Use the following sequence: 
```sh
git checkout development
git fetch --all
git reset --hard origin/development
```
* Run `lerna bootstrap --hoist`
* Branch out from development
* Do your work
* Commit the result
* Submit them to the review
* Implement fixes if any, submit again
* ???
* PROFIT


## Branch naming
* For feature branches - feat/issuenumber-branch-name
* For bugfixes - bug/issuenumber
* For chores (updating dependencies, etc...) - chore/issuenumber-update-dependencies, for example

## Commit naming
* First of all - a pull request to a bugfix should consist of one commit. Nobody likes thousands of commits, which actually worsen repo view and make navigating commits a lot harder. Use `git commit --amend`, `git push --force`, and learn how to squash commits.
* Start a commit with issue#. Example: `#123: Fixes incorrect naming of variable`
* No pointless commit messages like "tada". You ain't shittin' where you eatin', once again
* First line of the commit - 80 chars
* You may also post the extended commit message. First a short line, then an empty line, then your extended commit message


## What is a solution
* Solves the bug / implements a feature correctly
* No errors in ESLint
* No failed tests
* Has unit tests
* Does not worsen test coverage

Basically, boyscout rules apply - you leave the place cleaner than you entered it


## Coding style
* Indentation - 2space
* Encoding - UTF8
* Newline - LF
* Max width - 80 chars

Everything else Prettier will handle, but if anything changes - changes will be reflected here.

## Stories
You see this button called "Projects" on top of here? It's a kanban board which contains the tasks that need to be done. Want to take a task?
Open Projects tab, find something in "To do" you'd like to do, assign the issue in that task to yourself and move on. When finished - submit a PR

We're also going to have a weekly, which basically consists of the following:
* What have you done this week
* What are you going to do next week



I guess that's it, sooo...
# Happy development!
