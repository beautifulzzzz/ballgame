When SSH close, the nodejs application will be killed.     
**The reason** : [http://www.plob.org/article/8045.html][#1]

> nohup command &

![][#2]

When you want kill the process,you can use `jobs` command find the process-number. And then use fg %n kill the process.

![][#3]

[#1]:http://www.plob.org/article/8045.html
[#2]:http://odff1d90v.bkt.clouddn.com/16-10-22/25354456.jpg
[#3]:http://odff1d90v.bkt.clouddn.com/16-10-22/75372286.jpg