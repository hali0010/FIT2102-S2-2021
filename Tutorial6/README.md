# Introduction to Haskell

**Worksheet:** https://docs.google.com/document/d/1cUGRjx9ep3MzmRgB_0H_3bHD704GmmwTwMPqQVZCPdw/edit#bookmark=id.al00gr3x504x

In this series of tutorial exercises you will familiarise yourself with the
Haskell syntax.  Excellent resources include:

 - [The Haskell language](https://haskell.org/)
 - [Learn you a Haskell](https://learnyouahaskell.com/)
 - [Hoogle](https://hoogle.haskell.org/)

## Setup

```
stack build
stack test
```

On Windows Powershell the following is very handy.

```
iex ((new-object net.webclient).DownloadString("http://bit.ly/Install-PsWatch"))

import-module pswatch

watch {src}.Path | foreach {
   cls; stack exec doctest $_.Path
}
```

Set it going in a terminal window next to your editor and it will rerun tests every time you save.