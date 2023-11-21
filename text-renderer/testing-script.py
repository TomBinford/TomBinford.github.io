#!/usr/local/cs/bin/python3

import requests
import re
import html
import random
import sys
import subprocess
from typing import Generator, Tuple
from math import ceil


def call_renderer_api(input_text, line_length) -> str:
    url = "http://web.cs.ucla.edu/classes/fall23/cs31/Projects/5/tester.cgi"
    files = [
        ("linelen", (None, str(line_length), None)),
        ("file", ("", "", "application/octet-stream")),
        ("input", (None, input_text, None)),
    ]
    headers = {
        "User-Agent": "Project 5 testing script; tombinford.github.io/text-renderer; tombinford@ucla.edu"
    }
    response = requests.post(url, files=files, headers=headers)
    return response.text


def extract_renderer_output(response_html):
    if "the output file must be empty" in response_html:
        return ""
    match = re.search(r"<pre>\n([^<]*)<\/pre>", response_html, re.MULTILINE)
    output_escaped = match.group(1).replace("&bull;", " ")
    return html.unescape(output_escaped)


def extract_renderer_return_value(response_html):
    match = re.search(r" function returned ([0-9]+)\.", response_html)
    return int(match.group(1))


def invoke_renderer(input_text: str, line_length: int) -> Tuple[str, int]:
    """
    Returns a tuple of (formatted text, render function return value)
    """
    html = call_renderer_api(input_text, line_length)
    return extract_renderer_output(html), extract_renderer_return_value(html)


def invoke_student_program(
    input_text: str, line_length: int, program_name: str
) -> Tuple[str, int]:
    """
    Returns a tuple of (formatted text, render function return value)
    """
    input = f"{line_length}\n" + input_text
    process = subprocess.run(
        [program_name],
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        check=True,
        text=True,
        input=input,
    )
    where_split = process.stdout.rfind("\n")
    render_return_value = int(process.stdout[where_split + 1 :])
    output = process.stdout[:where_split]
    return (output, render_return_value)


def assert_same(input_text: str, line_length: int, program_name: str):
    output_1, return_1 = invoke_renderer(input_text, line_length)
    output_2, return_2 = invoke_student_program(input_text, line_length, program_name)

    if output_1 == output_2 and return_1 == return_2:
        return

    print("Results disagree! ", end="")
    if output_1 != output_2:
        print("Rendered outputs differ.")
    else:
        print(
            f"Return codes differ. Correct is {return_1}, student program returned {return_2}."
        )

    repro_file_name = f"bad_input_{random.randint(1, 5000)}.txt"
    with open(repro_file_name, "x") as f:
        f.write(input_text)

    print("To reproduce the failure, run the following in the shell:")
    print(f"(echo {line_length} | cat - {repro_file_name}) | {program_name}")

    print(f"The offending input text has been written to {repro_file_name}.")
    print(f"Failed with line length {line_length}.")
    exit(1)


def fuzz(max_tokens, max_line_length) -> Generator[Tuple[str, int], None, None]:
    while True:
        line_length = random.randint(1, max_line_length)
        max_word_length = int(ceil(line_length * 1.2))

        input_text = ""
        num_tokens = random.randint(0, max_tokens)
        tokens = 0
        letter = "a"
        while tokens < num_tokens:
            choice = random.randint(1, 4)
            match choice:
                case 1:  # Whitespace
                    input_text += random.choice(" \t\n")
                case 2:  # Word
                    input_text += letter * random.randint(1, max_word_length)
                    next_letter = "a" if letter == "z" else chr(ord(letter) + 1)
                    letter = next_letter
                case 3:  # Hyphen
                    input_text += "-"
                case 4:  # Paragraph break
                    input_text += "@P@"
            tokens += 1
        yield input_text, line_length


if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} ./tweaked-render-program")
    exit(1)

print("Press Enter to start testing. To stop testing, press Ctrl-C.")
input()
user_program_name = sys.argv[1]
runs = 0
for input_text, line_length in fuzz(10, 20):
    assert_same(input_text, line_length, user_program_name)
    runs += 1
    if runs == 1:
        print("Checked 1 input")
    elif runs % 50 == 0:
        print(f"Checked {runs} inputs")
