import os
import sys
import re
import json
import requests
import psycopg
import time
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()
CONNECTION_STRING = (
    os.getenv("CONNECTION_STRING_LOCAL")
    if os.getenv("USE_LOCAL") == "1"
    else os.getenv("CONNECTION_STRING")
)
print(CONNECTION_STRING)
manual_mode = False
filename = ""
session = requests.Session()  # stores cookies so that we can login

fandom_mapping = {}
relationship_mapping = {}
character_mapping = {}

stored_fandom_mapping = {}
stored_relationship_mapping = {}
stored_character_mapping = {}

# load mappings from json file
with open("src/scripts/tag_mappings.json", encoding="utf-8") as f:
    mappings = json.load(f)
    fandom_mapping = mappings["fandom_mapping"]
    relationship_mapping = mappings["relationship_mapping"]
    character_mapping = mappings["character_mapping"]


def login():
    print("logging in")
    username = os.getenv("AO3_USERNAME")
    password = os.getenv("AO3_PWD")

    headers = {
        "Accept": "text/html,*/*",
        "Host": "archiveofourown.org",
        "Connection": "keep-alive",
        "User-Agent": "ozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    # log in
    url = "https://archiveofourown.org/users/login"
    login_page = session.get(url=url, headers=headers)
    login_soup = BeautifulSoup(login_page.text, "lxml")
    # print(login_soup)
    authenticity_token = login_soup.find("input", {"name": "authenticity_token"})[
        "value"
    ]
    # authenticity_token = {}
    # url_token = "http://archiveofourown.org/token_dispenser.json"
    # jsonThing = session.get(url_token)
    # authenticity_token = jsonThing.json()["token"]
    data = {
        "user[login]": username,
        "user[password]": password,
        "authenticity_token": authenticity_token,  # if you don't pass this along nothing works
    }

    the_page = session.post(url=url, data=data, headers=headers)

    if ("users/" + username) not in the_page.url:
        print(the_page.url)
        the_page_soup = BeautifulSoup(the_page.text, "lxml")
        print(the_page_soup)
        print("Login error!")
    else:
        print("Logged in!")


def create_author_if_not_exists(username, link):
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute("SELECT * FROM author WHERE username = %s", (username,))
    conn.commit()
    if cur.rowcount == 0:
        print("add new author")
        cur.execute(
            "INSERT INTO author (username, ao3, podficcer_id) VALUES (%s, %s, %s) RETURNING author_id",
            (username, link, None),
        )
        conn.commit()
        data = cur.fetchone()
        cur.close()
        conn.close()
        print(data)
        return data[0]
        # also update it to work. should prob just return author id
    else:
        data = cur.fetchone()
        cur.close()
        conn.close()
        return data[0]


def create_fandom_if_not_exists(fandom_name):
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    cur.execute("SELECT * from fandom WHERE name = %s", (fandom_name,))
    if cur.rowcount == 0:
        print("add new fandom")
        category_name = input(f"Enter category name for fandom {fandom_name}: ")
        cur.execute("SELECT * from fandom_category WHERE name = %s", (category_name,))
        category_data = cur.fetchone()
        if cur.rowcount == 0:
            category_id = None
        else:
            category_id = category_data[0]
        print(f"Category id: {category_id}")
        while category_id is None:
            choice = input(
                f"{category_name} is not a valid category, r to try again and i to insert a new category with this name: "
            )
            if choice == "r":
                category_name = input(f"Enter category name for fandom {fandom_name}: ")
                cur.execute(
                    "SELECT * from fandom_category WHERE name = %s", (category_name,)
                )
                category_data = cur.fetchone()
                category_id = category_data[0]
            elif choice == "i":
                cur.execute(
                    "INSERT INTO fandom_category (name) VALUES (%s) RETURNING fandom_category_id",
                    (category_name,),
                )
                conn.commit()
                data = cur.fetchone()
                print(data)
                if cur.rowcount != 0:
                    category_id = data[0]
        cur.execute(
            "INSERT INTO fandom (category_id, name) VALUES (%s, %s) RETURNING *",
            (category_id, fandom_name),
        )
        conn.commit()
        fandom_data = cur.fetchone()
        print(f"New fandom data: {fandom_data}, category name: {category_name}")
        # end creating new fandom
    else:
        fandom_data = cur.fetchone()
    fandom_id = fandom_data[0]
    cur.close()
    conn.close()
    return fandom_id


def get_chapter_data(chapter_soup):
    # Link
    link = chapter_soup.find("h3", class_="title").find("a")["href"]
    chapter_link = f"https://archiveofourown.org{link}"
    print(f"Chapter Link: {chapter_link}")

    # Number
    chapter_number = (
        chapter_soup.find("h3", class_="title").find("a").string.split(" ")[1]
    )
    print(f"Chapter Number: {chapter_number}")

    # Title
    title_contents = chapter_soup.find("h3", class_="title").contents[2].strip()
    if len(title_contents) > 0:
        title = title_contents.split(":")[1].strip()
    else:
        title = None
    print(f"Title: {title}")

    # Wordcount
    chapter_text = (
        chapter_soup.find("div", class_="userstuff module")
        .text.replace("‘", "")
        .replace("’", "")
        .replace("-", "")
        .replace("'", "")
    )
    chapter_wordcount = len(re.findall(r"\w+", chapter_text)) - 2
    print(f"Chapter Wordcount: {chapter_wordcount}")

    return (chapter_number, title, chapter_wordcount, chapter_link)


# CURSE YOU GLOBAL VARIABLES UR NOT WORKING
def fetch_chapters(url, manual_mode, filename):
    soup = None
    if manual_mode:
        with open(f"src/scripts/data/{filename}.html") as f:
            soup = BeautifulSoup(f, "html.parser")
    else:
        if url.endswith("/"):
            full_work_url = url[:-1] + "?view_full_work=true"
        else:
            full_work_url = url + "?view_full_work=true"

        status = 429
        while 429 == status:
            req = session.get(full_work_url)
            status = req.status_code
            if 429 == status:
                print("Request answered with Status-Code 429")
                print("Trying again in 1 minute...")
                time.sleep(60)
        src = req.text
        soup = BeautifulSoup(src, "html.parser")

    print(soup)
    chapters = soup.find("div", id="chapters").find_all(
        "div", class_="chapter", recursive=False
    )
    print(f"Chapter len: {len(chapters)}")

    chapter_data = []
    counter = 0
    for chapter in chapters:
        chapter_data.append(get_chapter_data(chapter))
        counter += 1

    print(f"Fetched {counter} chapters")
    print(chapter_data)
    return chapter_data


def update_chapters_in_db(chapter_data, podfic_id):
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()
    # 0: title, 1: wordcount, 2: url
    print("Updating chapters in DB")
    print(chapter_data)
    for chapter in chapter_data:
        number, title, wordcount, url = chapter
        cur.execute(
            "SELECT chapter_id,link,chapter_number,chapter_title,wordcount FROM chapter WHERE podfic_id = %s and chapter_number = %s",
            (
                podfic_id,
                number,
            ),
        )
        if cur.rowcount == 0:
            print("Chapter doesn't exist")
            cur.execute(
                "INSERT INTO chapter (podfic_id, chapter_number, chapter_title, wordcount, link) VALUES (%s, %s, %s, %s, %s) RETURNING chapter_id",
                (podfic_id, number, title, wordcount, url),
            )
            chapter_id = cur.fetchone()[0]
            print(f"Chapter ID: {chapter_id}")
        else:
            print("Chapter exists")
            existing_chapter = cur.fetchone()
            print(existing_chapter)
            (
                chapter_id,
                chapter_link,
                chapter_number,
                chapter_title,
                chapter_wordcount,
            ) = existing_chapter
            # print(f"Chapter ID: {chapter_id}")
            # update chapter
            print(
                f"Existing chapter: {chapter_number} - {chapter_title}, {chapter_wordcount} words, at {chapter_link}"
            )
            print(f"New chapter: {number} - {title}, {wordcount} words, at {url}")
            should_update = input("Overwrite chapter? (y/N) ")
            if (
                should_update == "y"
                or should_update == "Y"
                or should_update.lower() == "yes"
            ):
                print("Updating chapter")
                cur.execute(
                    "UPDATE chapter SET chapter_number = %s, chapter_title = %s, wordcount = %s WHERE chapter_id = %s",
                    (number, title, wordcount, chapter_id),
                )
        conn.commit()
    cur.close()
    conn.close()


def main():
    print("main")
    login()
    conn = psycopg.connect(CONNECTION_STRING)
    cur = conn.cursor()

    manual_mode = False
    print(len(sys.argv))
    print(sys.argv)
    if len(sys.argv) > 1:
        if sys.argv[1] == "--manual":
            manual_mode = True
    print(f"Manual mode: {manual_mode}")

    force_override = False
    # can also force override if needed
    # 0: work_id, 1: title, 2: link, 3: author_id, 4: fandom_id, 5: wordcount, 6: chapter_count, 7: rating
    cur.execute(
        "SELECT work.work_id as id,podfic_id,title,link,author_id,fandom_id,wordcount,chapter_count,rating,category,relationship,main_character FROM work inner join podfic on podfic.work_id = work.work_id WHERE work.needs_update = true"
    )
    data = cur.fetchall()
    for record in data:
        print(record)
        (
            id,
            podfic_id,
            title,
            url,
            author_id,
            fandom_id,
            wordcount,
            chapter_count,
            rating,
            category,
            relationship,
            main_character,
        ) = record

        soup = None
        filename = ""
        if manual_mode:
            filename = input(
                f"Enter filename for {title} HTML file in data/ directory: "
            )
            print(os.listdir("."))
            with open(f"src/scripts/data/{filename}.html") as f:
                soup = BeautifulSoup(f, "html.parser")
        else:
            status = 429
            while 429 == status:
                req = session.get(url)
                status = req.status_code
                if 429 == status:
                    print("Request answered with Status-Code 429")
                    print("Trying again in 1 minute...")
                    time.sleep(60)

            src = req.text
            soup = BeautifulSoup(src, "html.parser")

            if not soup:
                filename = input(
                    f"Cannot fetch AO3 data for {title}, enter filename of HTML file in data/ directory: "
                )
                with open(f"data/{filename}.html") as f:
                    soup = BeautifulSoup(f, "html.parser")

        meta = soup.find("dl", class_="work meta group")

        # Title
        if title is None:
            title = soup.find("h2", class_="title heading").string.strip()
        print(f"Title: {title}")

        # Authors
        if author_id is None:
            authors = soup.find("h3", class_="byline heading").find_all("a")
            authors_string = " & ".join(
                [author.string.split("(")[0].strip() for author in authors]
            )
            print(f"Authors: {authors_string}")
            authors_link = ", ".join(
                [f'https://archiveofourown.org{author["href"]}' for author in authors]
            )
            print(f"Authors Link: {authors_link}")
            author_id = create_author_if_not_exists(authors_string, authors_link)
            # add author id to work?
        print(f"Author id: {author_id}")

        # Fandom
        # support multiple?
        if fandom_id is None:
            fandom_list = meta.find("dd", class_="fandom tags").find_all(class_="tag")
            fandom = fandom_list[0].string
            print(f"Fandom original name: {fandom}")
            if fandom in fandom_mapping:
                fandom = fandom_mapping[fandom]
            elif fandom in stored_fandom_mapping:
                fandom = stored_fandom_mapping[fandom]
            else:
                should_map = input(f"Map fandom {fandom}? (Y/n) ")
                if (
                    should_map != "n"
                    and should_map != "N"
                    and should_map.lower() != "no"
                ):
                    new_fandom = input("Mapped fandom: ")
                    stored_fandom_mapping[fandom] = new_fandom
                    fandom = new_fandom
            fandom_id = create_fandom_if_not_exists(fandom)
            print(f"Fandom: {fandom}")
        print(f"Fandom id: {fandom_id}")

        # Rating(s)
        if rating is None:
            rating_list = meta.find("dd", class_="rating tags").find_all(class_="tag")
            rating = ", ".join([tag.string for tag in rating_list])
            rating = rating.replace("Teen And Up Audiences", "Teen")
            rating = rating.replace("General Audiences", "Gen")
        print(f"Rating: {rating}")

        # Category
        if category is None:
            category = meta.find("dd", class_="category tags")
            if category:
                category = category.find("a").string
        print(f"Category: {category}")

        # Relationship
        if relationship is None:
            relationship = meta.find("dd", class_="relationship tags")
            if relationship:
                relationship = relationship.find("a").string
                is_relationship = input(f"Is {relationship} the relationship? (Y/n) ")
                if (
                    is_relationship == "n"
                    or is_relationship == "N"
                    or is_relationship.lower() == "no"
                ):
                    relationship = input("Input relationship: ")
                else:
                    if relationship in relationship_mapping:
                        relationship = relationship_mapping[relationship]
                    elif relationship in stored_relationship_mapping:
                        relationship = stored_relationship_mapping[relationship]
                    else:
                        should_map = input(f"Map relationship {relationship}? (Y/n) ")
                        if (
                            should_map != "n"
                            and should_map != "N"
                            and should_map.lower() != "no"
                        ):
                            new_relationship = input("Mapped relationship: ")
                            stored_relationship_mapping[relationship] = new_relationship
                            relationship = new_relationship
                        else:
                            stored_relationship_mapping[relationship] = relationship
        print(f"Relationship: {relationship}")

        # Main Character
        if main_character is None:
            main_character = meta.find("dd", class_="character tags")
            if main_character:
                main_character = (
                    meta.find("dd", class_="character tags")
                    .find("ul")
                    .find("li")
                    .find("a")
                    .string
                )
                is_main_character = input(
                    f"Is {main_character} the main character? (Y/n) "
                )
                if (
                    is_main_character == "n"
                    or is_main_character == "N"
                    or is_main_character.lower() == "no"
                ):
                    main_character = input("Input main character: ")
                else:
                    if main_character in character_mapping:
                        main_character = character_mapping[main_character]
                    elif main_character in stored_character_mapping:
                        main_character = stored_character_mapping[main_character]
                    else:
                        should_map = input(
                            f"Map main character {main_character}? (Y/n) "
                        )
                        if (
                            should_map != "n"
                            and should_map != "N"
                            and should_map.lower() != "no"
                        ):
                            new_character = input("Mapped main character: ")
                            stored_character_mapping[main_character] = new_character
                            main_character = new_character
                        else:
                            stored_character_mapping[main_character] = main_character
        print(f"Main Character: {main_character}")

        # Wordcount
        wordcount = meta.find("dd", class_="words").string
        print(f"Wordcount: {wordcount}")
        wordcount = int(wordcount.replace(",", ""))

        # Chapter Count
        chapters = meta.find("dd", class_="chapters").string
        chapter_count = int(chapters.split("/")[1])
        if chapter_count == "?":
            chapter_count = int(chapters.split("/")[0])
        print(f"Chapters: {chapters}")
        print(f"Chapter count: {chapter_count}")
        chaptered = False
        if chapter_count > 1:
            chaptered = True
        print(f"Chaptered: {chaptered}")
        print()
        # this assumes we're starting on the first chapter
        if chaptered:
            # TODO: manual mode version of this too
            should_fetch_chapters = input("Fetch chapters? (Y/n) ")
            if (
                should_fetch_chapters != "n"
                and should_fetch_chapters != "N"
                and should_fetch_chapters.lower() != "no"
            ):
                print("Fetching chapters")
                chapter_data = fetch_chapters(url, manual_mode, filename)
                # insert into db
                update_chapters_in_db(chapter_data, podfic_id)

        # update work
        print("Updating work...")
        cur.execute(
            "UPDATE work SET title = %s, author_id = %s, fandom_id = %s, wordcount = %s, chapter_count = %s, chaptered = %s, rating = %s, category = %s, relationship = %s, main_character = %s, needs_update = false WHERE work_id = %s RETURNING *",
            (
                title,
                author_id,
                fandom_id,
                wordcount,
                chapter_count,
                chaptered,
                rating,
                category,
                relationship,
                main_character,
                id,
            ),
        )
        conn.commit()
        print(cur.fetchone())
        print("Updated work.")

        print()
    # yes this is a typo not fixing it bc it's funny
    print("Finsihed updating works\n")
    # end record info
    print()
    print("Stored mappings\n")
    print("Stored character mapping:")
    print(stored_character_mapping)
    print("\nStored relationship mapping:")
    print(stored_relationship_mapping)
    print("\nStored fandom mapping:")
    print(stored_fandom_mapping)


if __name__ == "__main__":
    main()
