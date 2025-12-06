import os

async def get_chapter_content(chapter_id: str) -> str:
    """
    Retrieves the raw Markdown content of a chapter from the filesystem.
    Assumes chapters are located in `frontend/my-book/docs/`.
    """
    # Construct the path to the Markdown file
    # Adjust this path based on your project structure if different
    chapter_file_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), # Current file's directory (backend/app/services)
        "../../../..", # Go up four levels to the project root (app -> backend -> project_root)
        "frontend", "my-book", "docs", f"{chapter_id}.md"
    )
    chapter_file_path = os.path.normpath(chapter_file_path)

    # Docusaurus chapter IDs are usually chapter01, chapter02, etc.
    # The actual filenames are chapter01.md, chapter02.md
    # We should handle different chapter_id formats if necessary, but for now
    # assume chapter_id maps directly to the filename without the .md extension.
    # We also need to consider other docs like "intro.md", "tutorial-basics/create-a-document.md"

    # Let's adjust the chapter_id logic to handle potential subdirectories and '.md' extension
    # If chapter_id is "intro", path is intro.md
    # If chapter_id is "tutorial-basics/create-a-document", path is tutorial-basics/create-a-document.md
    if not chapter_id.endswith(".md"):
        chapter_id_with_ext = f"{chapter_id}.md"
    else:
        chapter_id_with_ext = chapter_id

    chapter_file_path_corrected = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "../../../..",
        "frontend", "my-book", "docs", chapter_id_with_ext
    )
    chapter_file_path_corrected = os.path.normpath(chapter_file_path_corrected)


    if not os.path.exists(chapter_file_path_corrected):
        raise FileNotFoundError(f"Chapter content for {chapter_id} not found at {chapter_file_path_corrected}")

    with open(chapter_file_path_corrected, "r", encoding="utf-8") as f:
        content = f.read()
    return content