import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
CONNECTION_STRING = os.getenv("CONNECTION_STRING")


def main():
    print(CONNECTION_STRING)
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute("SELECT podfic_id FROM podfic")
    podfic_ids = cur.fetchall()
    for result in podfic_ids:
        id = result[0]
        print(id)
        # check that there are no podfic_podficcer records with this podfic id
        cur.execute("SELECT * FROM podfic_podficcer WHERE podfic_id = %s", (id,))
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO podfic_podficcer (podfic_id, podficcer_id) VALUES (%s, 1)",
                (id,),
            )
            conn.commit()


main()
