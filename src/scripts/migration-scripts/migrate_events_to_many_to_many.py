import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
CONNECTION_STRING = os.getenv("CONNECTION_STRING")


def main():
    print(CONNECTION_STRING)
    print("Migrating podfic inline event_id to podfic_event table")

    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute("SELECT podfic_id, event_id FROM podfic")
    podfics = cur.fetchall()
    counter = 0
    for podfic in podfics:
        podfic_id, event_id = podfic
        print(podfic_id, event_id)
        if event_id:
            cur.execute(
                "SELECT * FROM podfic_event WHERE podfic_id = %s AND event_id = %s",
                (podfic_id, event_id),
            )
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO podfic_event (podfic_id, event_id) VALUES (%s, %s)",
                    (podfic_id, event_id),
                )
                conn.commit()
                counter += 1

    print(f"Updated {counter} podfics.")


main()
