# Summary
Making it easy to write logs to console and/or saving logs to file. The format used is as follows:

```
TIMESTAMP  LEVEL  [ TAG(s) ]  MESSAGE
```

The timestamp is in ISO format.
The available levels are: INF, WAR, ERR, DEB and FAT
Tags are to make it easier to group and for example to write to InfluxDB.

The String object has also been extended, so it is easy to change foreground and background colors of Strings when written to console. It is also possible to change style.
