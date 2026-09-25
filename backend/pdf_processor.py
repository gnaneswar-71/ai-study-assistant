import fitz


def extract_text(file_path):

    document = fitz.open(file_path)

    text = ""

    for page_number, page in enumerate(document):

        page_text = page.get_text()

        print(f"Page {page_number + 1}: {len(page_text)} characters")

        text += page_text + "\n"

    document.close()

    return text