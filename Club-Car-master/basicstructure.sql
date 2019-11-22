CREATE TABLE Users (
 userName VARCHAR(20) PRIMARY KEY,
 vroomBucks INTEGER(20),
 hashedPassword CHAR(20),
 posX INTEGER(4),
 posY INTEGER(4),
 logged BOOLEAN,
 ) ENGINE=INNODB;