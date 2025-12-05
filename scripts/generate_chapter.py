import argparse
import os
import sys

# Add the backend directory to the Python path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.agents.book_writer import BookWriterAgent

def main():
    """
    Generates a book chapter using the BookWriterAgent and saves it to the
    Docusaurus docs directory.
    """
    parser = argparse.ArgumentParser(description="Generate a book chapter.")
    parser.add_argument(
        "topic",
        type=str,
        help="The topic of the chapter to generate."
    )
    parser.add_argument(
        "--persona",
        type=str,
        default="beginner",
        help="The target audience persona (e.g., 'beginner', 'expert')."
    )
    parser.add_argument(
        "--output-name",
        type=str,
        default="chapter1.md",
        help="The name of the output markdown file."
    )
    args = parser.parse_args()

    print(f"Generating chapter on topic: '{args.topic}' for a {args.persona} audience.")

    agent = BookWriterAgent()
    chapter_content = agent.generate_chapter(topic=args.topic, user_persona=args.persona)

    # Define the output path
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'my-book', 'docs')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, args.output_name)

    # Save the content to the file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(chapter_content)

    print(f"Successfully generated chapter and saved it to: {output_path}")

if __name__ == "__main__":
    main()
