import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
CONNECTION_STRING = (
    os.getenv("CONNECTION_STRING_LOCAL")
    if os.getenv("USE_LOCAL") == "1"
    else os.getenv("CONNECTION_STRING")
)


def main():
    print("Migrating podfic types to use is_multivoice flag")
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute(
        "SELECT podfic.podfic_id, type, is_multivoice, title FROM podfic inner join work on podfic.work_id = work.work_id"
    )
    podfics = cur.fetchall()
    counter = 0
    for podfic in podfics:
        (id, type, is_multivoice, title) = podfic
        if type == "multivoice" and not is_multivoice:
            cur.execute(
                "UPDATE podfic SET is_multivoice = %s WHERE podfic_id = %s", (True, id)
            )
            print(f"Updated {title} to is_multivoice = True.")
            counter += 1
        elif type != "podfic" and not is_multivoice:
            should_update = input(f"Is {title} a multivoice? (y/N) ")
            if should_update.lower() == "y" or should_update.lower() == "yes":
                cur.execute(
                    "UPDATE podfic SET is_multivoice = %s WHERE podfic_id = %s",
                    (True, id),
                )
                print(f"Updated {title} to is_multivoice = True.")
                counter += 1
    conn.commit()
    cur.close()
    conn.close()
    # end for
    print(f"Updated {counter} podfics.")


main()
