import PyPDF2
import nltk
import os
import pdfplumber
import pdfminer
from pdfminer.high_level import extract_text, extract_pages
from pdfminer.image import ImageWriter
import io
from PIL import Image
import re
import pandas as pd
import pytesseract
import pdf2image
import nltk
from nltk.corpus import words


# Set the path to the Tesseract OCR executable
pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'
nltk.download('words')
nltk.download('punkt')
word_dictionary = set(words.words())


def convert_pdf_to_png(type, user):
    pdf_files = get_doc_list(type, user)

    for file in pdf_files:
        file_name = file.split(".")[0]
        dir = get_dir(type, user)
        string_dir = str(dir) + "/" + str(file)
        output_dir = str(dir) + "/" + str(file_name) + "/"
        pages = pdf2image.convert_from_path(string_dir, grayscale=True)

        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Save each page as a separate PNG file
        for i, page in enumerate(pages):
            output_path = os.path.join(output_dir, f"page_{i + 1}.png")
            page.save(output_path, "PNG")


def read_pdf(type, user):
    pdf_files = get_doc_list(type, user)

    for file in pdf_files:
        file_name = file.split(".")[0]
        dir = get_dir(type, user)
        string_dir = str(dir) + "/" + str(file)
        images = pdf2image.convert_from_path(string_dir)


        extracted_text = []

        for image in images:
            # Perform OCR on each image
            text = pytesseract.image_to_string(image)
            extracted_text.append(text)

        # # Print the extracted text
        # for text in extracted_text:
        #     print(text)

        #save the text as a text file with the same name 
        dir_to_save = str(dir) + "/" + str(file_name) + ".txt"
        with open(dir_to_save, 'w') as f:
            print(" Writing file: " + file_name)
            # Write content to the file
            count = 1
            for text in extracted_text:
                f.write("\n Page " + str(count) + ":\n")
                # cleaned_text = clean_text(text)
                f.write(text)
                count += 1
            

def get_dir(type, user):
    # Get the current working directory
    current_directory = os.getcwd()

    if type == "uploads":
        # Get the path to the raw data folder`
        dir = os.path.join(current_directory, "uploads",user)
    elif type == "history_journal":
         # Get the path to the procesed data folder`
        dir = os.path.join(current_directory, "history_journal", user)
    return dir

def get_doc_list(type, user):
    # Get the path to the raw data folder`
    raw_data_directory = get_dir(type, user)
    # Get all the files in the current directory
    files = os.listdir(raw_data_directory)
    
    pdf_files = []
    for file in files:
        file_name, file_extension = os.path.splitext(file)
        if file_extension == ".pdf":
            pdf_files.append(file)
            
    # Print the names of all the files
    print("\n****** PRINTING SOURCES ********\n")
    for file in pdf_files:
        print(file + "\n")
    print("\n\n")
    return pdf_files

def is_word(word):
    return word.lower() in word_dictionary

def clean_text(original_text):
    # Tokenize the text into lines
    words = nltk.word_tokenize(original_text)

    # Filter out non-real words and empty lines
    cleaned_words = [word for word in words if is_word(word)]

    # Reconstruct the cleaned text
    cleaned_text = ' '.join(cleaned_words)
    
    return cleaned_text


    

# read_pdf("uploads", "alextko")

convert_pdf_to_png("uploads", "alextko")