Node js app to rename files.

context: mac opperating system.
all operations are about  renaming or deleting files in the downloads folder.

step 1.


Step 1:
look in downloads folder for a folder with 'Chromagen' in the folder name

search all files in that folder and either delete or rename (or ignore) if they meet certain conditions:

note, condition is case sensitive

rename:

Contains "Screen Shot" = "0. Nomination form to OES"
Contains "nominationForm" = "1. Nomination Form"
Contains "siteAssessment" = "2. Site Assessment"
Contains "receipt" = "4. Receipt"
Contains "Coc"  = "5. CoC"
Contains "postImplementation" = "6. Post Implementation"
Contains i"mage2" = "7. Proof of Decommission"
contains: "Compliance Form" = "0. Compliance Form.pdf"
Contains: "Calculation Output" = "0. Calculation Output (HEERs)"

note, sometimes not all the files are present
    further processing by user to put files in to the folder may be neccesary.


Delete:
Contains nswCOC = delete
In images folder:
contains Sign = delete
(there are meant to be 3 files with Sign in their file name, but there may be zero)
