-- Create a Table that is
-- ID username password email accountType(normally user) role(normally user)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    accountType VARCHAR(10) NOT NULL DEFAULT 'User',
    role VARCHAR(10) NOT NULL DEFAULT 'user'
);