import sqlite3
import pandas as pd

def create_user_context_db():
    # Create a connection to the database
    conn = sqlite3.connect('user_context.db')

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    # Create a table to store user information
    create_table_query = '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            birthday DATE,
            phone_number TEXT
        )
    '''
    cursor.execute(create_table_query)

def add_user_to_contextDB(email,username,password,first_name,last_name,birthday,phone_number):
    # Create a connection to the database
    conn = sqlite3.connect('user_context.db')

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    insert_query = '''
        INSERT INTO users (email, username, password, first_name, last_name, birthday, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    '''
    cursor.execute(insert_query, (email, username, password, first_name, last_name, birthday, phone_number))

    # Commit the changes and close the connection
    conn.commit()
    conn.close()

def view_all_user_context():
    # Create a connection to the database
    conn = sqlite3.connect('user_context.db')

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    insert_query = '''
        SELECT *
        FROM users
    '''
    cursor.execute(insert_query)
    # Fetch all the rows returned by the query
    rows = cursor.fetchall()

    # Print the contents of each row
    for row in rows:
        print(row)

    # Close the connection
    conn.close()




# create_user_context_db()
add_user_to_contextDB("bradlev08@gmail.com", "brad_lev", "123456", "Bradley", "Levin", "09/10/199", "4436152098")
view_all_user_context()