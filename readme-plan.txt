Node js app to rename files.

context: mac opperating system.
all operations are about  renaming or deleting files in the downloads folder.

step 1.


Step 1:
look in downloads folder of the os mac for a folder with 6 digits in it. these may be preceded with "_" or surrounded with ().


search all files in that folder and subfolders, and rename, rename then move, or just delete, depending on the following conditions.

note, condition is case sensitive

rename:

Contains "Screen Shot" = "0. Nomination form to OES"
Contains "nominationForm" = "1. Nomination Form"
Contains "siteAssessment" = "2. Site Assessment"
Contains "receipt" = "4. Receipt"
Contains "Coc"  = "5. CoC"
Contains "postImplementation" = "6. Post Implementation"
Contains "image2" move this file to it's parent folder,
    then rename it "7. Proof of Decommission",
contains: "Compliance Form" = "0. Compliance Form.pdf"
Contains: "Calculation Output" = "0. Calculation Output (HEERs)"

note, sometimes not all the files are present
    further processing by user to put files in to the folder may be neccesary.


Delete:
Contains nswCOC = delete
In images folder, which will be inside the folder we are working in.
contains Sign = delete
(there are meant to be 3 files with Sign in their file name, but there may be zero)

