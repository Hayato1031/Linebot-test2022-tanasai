CREATE TABLE line_users(
  id SERIAL NOT NULL,
  userID VARCHAR NOT NULL UNIQUE,
  stage INTEGER NOT NULL,
  PRIMARY KEY(id)
);