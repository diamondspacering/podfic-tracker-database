import os
import psycopg
from dotenv import load_dotenv
import datetime
from bs4 import BeautifulSoup
from update_metadata import login
from update_metadata import fetch_general_metadata
from update_metadata import fetch_chapters

load_dotenv()
CONNECTION_STRING = (
    os.getenv("CONNECTION_STRING_LOCAL")
    if os.getenv("USE_LOCAL") == "1"
    else os.getenv("CONNECTION_STRING")
)


def create_tag_if_not_exists(tag):
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute("SELECT * FROM tag WHERE tag = %s", (tag,))
    conn.commit()
    if cur.rowcount == 0:
        print("adding new tag")
        cur.execute("INSERT INTO tag (tag) VALUES (%s) RETURNING tag_id", (tag,))
        conn.commit()
    data = cur.fetchone()
    cur.close()
    conn.close()
    return data[0]


def create_chapter_work(chapter_data, general_info, tags):
    print(chapter_data)
    chapter_number, chapter_title, wordcount, chapter_url = chapter_data
    title, author_id, rating, fandom_id, category = general_info

    print(f"{title} Chapter {chapter_number}: {chapter_title}")

    # Relationship
    relationship = None
    should_enter_relationship = input(f"Enter relationship? (Y/n) ")
    if (
        should_enter_relationship.lower() != "n"
        and should_enter_relationship.lower() != "no"
    ):
        relationship = input("Relationship: ")

    # Main character
    main_character = None
    should_enter_char = input(f"Enter main character? (Y/n) ")
    if should_enter_char.lower() != "n" and should_enter_char.lower() != "no":
        main_character = input("Main character: ")

    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO work (title, wordcount, link, author_id, fandom_id, rating, category, relationship, main_character) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING work_id",
        (
            f"{title} {chapter_title}",
            wordcount,
            chapter_url,
            author_id,
            fandom_id,
            rating,
            category,
            relationship,
            main_character,
        ),
    )
    work_id = cur.fetchone()[0]
    cur.execute(
        "INSERT INTO podfic (work_id, status, type, added_date, updated_at) VALUES (%s, %s, %s, %s, %s) RETURNING podfic_id",
        (
            work_id,
            "Planning",
            "podfic",
            datetime.datetime.now(),
            datetime.datetime.now(),
        ),
    )
    podfic_id = cur.fetchone()[0]

    # add compilation tag, any specified tags, and default podficcer
    compilation_tag_id = cur.execute(
        "SELECT tag_id from tag WHERE tag = %s", ("compilation",)
    )
    compilation_tag_id = cur.fetchone()[0]
    cur.execute(
        "INSERT INTO tag_podfic (podfic_id, tag_id) VALUES (%s, %s)",
        (podfic_id, compilation_tag_id),
    )

    for tag in tags:
        cur.execute(
            "INSERT INTO tag_podfic (podfic_id, tag_id) VALUES (%s, %s)",
            (podfic_id, tag),
        )

    cur.execute(
        "INSERT INTO podfic_podficcer (podfic_id, podficcer_id) VALUES (%s, %s)",
        (podfic_id, 1),
    )

    conn.commit()
    cur.close()
    conn.close()
    print("Added chapter.\n")


def main():
    print("Creating podfics from selected chapters of compilations")
    login()
    url = input("Input URL of compilation work to select chapters from: ")
    print(f"Url: {url}")

    general_info = fetch_general_metadata(url)

    tags_input = input("Tags to add to all works (comma-separated): ").split(",")
    tags = []
    for tag_input in tags_input:
        tag = tag_input.strip().lower()
        tag_id = create_tag_if_not_exists(tag)
        tags.append(tag_id)

    chapter_data = fetch_chapters(url, False, "")
    print(chapter_data)

    chapters_to_select = input(
        "Chapters to make individual podfics of (comma-separated): "
    ).split(",")
    print(f"Chosen chapters: {chapters_to_select}")

    for chapter_index in chapters_to_select:
        index = int(chapter_index.strip()) - 1
        print(index)
        create_chapter_work(chapter_data[index], general_info, tags)


if __name__ == "__main__":
    main()
