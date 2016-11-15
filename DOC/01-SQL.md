## SQL Start:
Reference：[http://dev.mysql.com/doc/refman/5.7/en/database-use.html][#4]

### Connect database:
> mysql -uroot -p

### Show database:
> mysql> show databases;

![][#1]

### Select database:
> mysql> use ballgame;

### Show tables:
> mysql> show tables;

![][#2]

### Select * from:
> mysql> select * from gameUserShotDetail;

![][#3]


## Counting rows
Reference:[http://dev.mysql.com/doc/refman/5.7/en/counting-rows.html][#5]

### use `count` count the number of ball-shot-in 
> mysql> select count(*) from gameUserShotDetail where gameid='10' AND userid='100' AND shotIn='1';

![][#6]
 
> select shotIn, COUNT(*) as NUM FROM gameUserShotDetail GROUP BY shotIn;

![][#7]

## Clear Data
> truncate gameHistory;    
> truncate gameUserShot;    
> truncate gameUserShotDetail;    
> truncate gameUserSteps;    

[#1]:http://odff1d90v.bkt.clouddn.com/16-10-22/99754250.jpg
[#2]:http://odff1d90v.bkt.clouddn.com/16-10-22/1376072.jpg
[#3]:http://odff1d90v.bkt.clouddn.com/16-10-22/51358554.jpg
[#4]:http://dev.mysql.com/doc/refman/5.7/en/database-use.html
[#5]:http://dev.mysql.com/doc/refman/5.7/en/counting-rows.html
[#6]:http://odff1d90v.bkt.clouddn.com/16-10-22/52000948.jpg
[#7]:http://odff1d90v.bkt.clouddn.com/16-10-22/54203523.jpg